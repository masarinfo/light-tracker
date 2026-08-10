# وحدة أكواد الخصم والكوبونات (Coupons & Discount Codes)
## ملحق لوحدة الاشتراكات — جزء من المعيار الموحّد

> **العلاقة بالوحدات السابقة:** تتدخل هذي الوحدة في نقطة واحدة محددة بدقة: **لحظة توليد فاتورة دورة اشتراك جديدة** (المعرَّفة بوحدة الاشتراكات). تُخفِّض `price_usd_charged` قبل إنشاء `invoice`، ولا تلمس أي منطق دفع أو خزينة مباشرة.

---

## 1. مخطط قاعدة البيانات

```sql
-- 1. أكواد الخصم
CREATE TABLE coupon_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(30) UNIQUE NOT NULL,               -- مثال: 'WELCOME20', 'RAMADAN2026'
    discount_type VARCHAR(15) CHECK(discount_type IN ('PERCENTAGE', 'FIXED_AMOUNT')),
    discount_value FLOAT NOT NULL,                    -- 20 (%) أو 5 ($) حسب النوع
    applies_to_plan_ids JSON,                          -- NULL = كل الخطط، أو مصفوفة IDs محددة
    applies_to_cycles VARCHAR(15) DEFAULT 'FIRST_ONLY' CHECK(applies_to_cycles IN
        ('FIRST_ONLY', 'ALL_CYCLES', 'N_CYCLES')),
    applies_to_cycles_count INTEGER,                    -- يُستخدم فقط لو applies_to_cycles = 'N_CYCLES'
    max_redemptions_total INTEGER,                       -- NULL = غير محدود
    max_redemptions_per_customer INTEGER DEFAULT 1,
    created_by_affiliate_id INTEGER,                     -- اختياري: كوبون مخصص لمسوّق معيّن (بديل لرابط الإحالة)
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. سجل استخدام الكوبونات
CREATE TABLE coupon_redemptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    coupon_id INTEGER REFERENCES coupon_codes(id),
    subscription_id INTEGER REFERENCES subscriptions(id),
    billing_cycle_id INTEGER REFERENCES subscription_billing_cycles(id),
    customer_id INTEGER NOT NULL,
    original_price_usd FLOAT NOT NULL,
    discount_amount_usd FLOAT NOT NULL,
    final_price_usd FLOAT NOT NULL,
    redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 2. القوانين الصارمة (Strict Rules)

### 2.1 قوانين الحساب والتطبيق
1. **الكوبون يُطبَّق فقط لحظة توليد `subscription_billing_cycles` جديدة، قبل إنشاء الفاتورة** — `price_usd_charged = plan.price_usd - discount_amount`، ولا يمكن تطبيق كوبون على فاتورة موجودة أصلاً أو مدفوعة.
2. **الخصم لا يجعل السعر أقل من صفر أبداً** — `FIXED_AMOUNT` أعلى من سعر الخطة يُقتطع فقط بحدود سعر الخطة (`final_price_usd = MAX(0, plan.price_usd - discount)`).
3. **كوبون واحد فقط لكل فاتورة (No Stacking)** — لا يجوز دمج أكثر من كود خصم بنفس عملية الدفع، لتفادي تعقيد لا داعي له بحجم مبالغ صغيرة أصلاً.
4. **نطاق تكرار الخصم يُحدَّد صراحة بالكوبون نفسه** (`applies_to_cycles`): خصم على أول دورة فقط (الأشيع لحملات الترويج)، أو كل الدورات (نادر، يستخدم لعروض شراكة خاصة)، أو عدد محدد من الدورات (مثال: أول 3 أشهر).

### 2.2 قوانين الحدود ومنع إساءة الاستخدام
5. **فحص `max_redemptions_total` و`max_redemptions_per_customer` يجب أن يكون Atomic** (قفل على مستوى قاعدة البيانات أو Transaction) — لتفادي حالة سباق (Race Condition) لو استخدم عدة عملاء نفس الكوبون بنفس اللحظة ويتجاوزون الحد المسموح.
6. **الكوبون منتهي الصلاحية (`valid_until` تجاوزه الوقت) أو غير مفعّل (`is_active = false`) يُرفض عند التحقق فوراً**، حتى لو كان معروضاً بواجهة كانت مفتوحة قبل الانتهاء.

### 2.3 القانون الحرج: العلاقة مع عمولة المسوّق
7. **عمولة المسوّق تُحسب دائماً على `final_price_usd` (المبلغ الفعلي المدفوع بعد الخصم)، وليس `original_price_usd`.** هذا إلزامي لمنع تلاعب: لو مسوّق أعطى كوبون خصم 100% (ترويجي)، ما يصير له عمولة على مبلغ لم يُدفع أصلاً — `commission_amount_usd = final_price_usd × commission_pct`، دائماً.
8. **لو الكوبون نفسه مرتبط بمسوّق (`created_by_affiliate_id`) وتم استخدامه من عميل بدون رابط إحالة مسبق**، هذا الكوبون **يُعتبر مصدر إحالة بديل** — يُسجَّل تلقائياً `referred_by_affiliate_id = coupon.created_by_affiliate_id` على الاشتراك، بنفس قاعدة الأولوية "أول مسوّق يفوز" (First-Touch) المعرَّفة بوحدة الاشتراكات.

---

## 3. مثال حسابي كامل

> خطة بسعر $30/شهر، كوبون `SAVE20` خصم 20% (نطاقه: أول دورة فقط)، مرتبط بمسوّق نسبة عمولته 15% (نوع: INITIAL).

```
original_price_usd = $30
discount_amount_usd = 30 × 20% = $6
final_price_usd = $30 - $6 = $24   → هذا ما يُدفع فعلياً عبر وحدة الدفع

commission_amount_usd = 24 × 15% = $3.60   (وليس 30 × 15% = $4.50)
```

---

## 4. عقد الـ API

```
POST   /api/coupons/validate            → التحقق من صلاحية كود قبل الدفع {code, plan_id, customer_id} → يرجع الخصم المتوقع
POST   /api/subscriptions                → إنشاء اشتراك {..., coupon_code?} → يُطبَّق الخصم تلقائياً إن كان صالحاً قبل توليد الفاتورة
GET    /api/coupons/:code/usage-stats    → إحصائيات استخدام كوبون معيّن (للإدارة أو المسوّق صاحب الكوبون)
```

---

## 5. ملخص القرارات المعمارية

1. الكوبون يتدخل فقط لحظة توليد دورة الفوترة — لا يمس فواتير قائمة أو مدفوعة.
2. عمولة المسوّق تُحسب دائماً على المبلغ الفعلي بعد الخصم، لا السعر الأصلي — قاعدة حاسمة لمنع تلاعب مالي.
3. كوبون واحد فقط لكل فاتورة، بدون تكديس.
4. الكوبون المرتبط بمسوّق يعمل كقناة إحالة بديلة عن رابط الإحالة التقليدي، بنفس قاعدة First-Touch.
5. فحص الحدود (عدد مرات الاستخدام) يجب أن يكون ذرّياً (Atomic) لمنع تجاوز الحد بسباقات التزامن.

---

بهذا اكتملت منظومة الاشتراكات والتسعير بالكامل. المتبقي بالمعيار: **إدارة المستخدمين** و**صفحات الهبوط**.
