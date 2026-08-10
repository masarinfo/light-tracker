# وحدة الاشتراكات (Subscriptions Module)
## جزء من المعيار الموحّد (Standard Architecture)

> **العلاقة بالوحدات السابقة:** هذي الوحدة هي "المستهلك" الأول والمباشر لكل ما بنيناه — تُنشئ فواتير عبر وحدة الدفع، تُشغّل عمولات المسوقين عند كل دفعة ناجحة، وتُنشئ طلبات استرجاع عبر الوحدة المخصصة عند الإلغاء. **لا تحتوي أي منطق دفع أو خزينة خاص بها.**

---

## 1. القيد الجوهري: لا يوجد "تجديد تلقائي حقيقي" بالكريبتو

كما تأسس بأول نقاش لنا: محافظ البلوكشين لا تسمح بتفويض خصم مسبق (بخلاف البطاقات). لذلك التجديد هنا **فوترة استباقية (Proactive Billing)**: النظام يولّد فاتورة جديدة قبل انتهاء الدورة بأيام، والعميل يدفعها يدوياً بنقرة — التلقائية هنا بمعنى "توليد الفاتورة وتذكير العميل"، وليس "سحب الفلوس تلقائياً".

---

## 2. دورة حياة الاشتراك (Subscription Lifecycle)

```
PENDING_FIRST_PAYMENT
      │ (invoice.status = PAID)
      ▼
    ACTIVE ──────────────────────────────┐
      │                                    │ (العميل يطلب إلغاء)
      │ current_period_end - 3 أيام         ▼
      │ (توليد فاتورة تجديد تلقائياً)      PENDING_REFUND (إن كان مؤهلاً لاسترجاع)
      │                                    │
      ├── العميل دفع قبل الانتهاء ──► يبقى ACTIVE (تمديد الدورة)
      │                                    │
      └── current_period_end بدون دفع      ▼
              │                        CANCELLED (نهائي)
              ▼
        GRACE_PERIOD (مهلة سماح، مثال 3 أيام)
              │
              ├── دفع خلال المهلة ──► يعود ACTIVE
              │
              └── انتهت المهلة بدون دفع
                        ▼
                    EXPIRED (نهائي، بدون استرجاع لأنه أصلاً لم يُدفع تجديد)
```

---

## 3. مخطط قاعدة البيانات

```sql
-- 1. خطط الاشتراك
CREATE TABLE subscription_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL,
    price_usd FLOAT NOT NULL,              -- أعلى فئة لن تتجاوز $50 حسب المتفق عليه
    billing_cycle_days INTEGER NOT NULL DEFAULT 30,
    features JSON,                          -- مصفوفة مزايا الخطة (يُستهلكها النظام المستهلك لتفعيل/تعطيل مزايا)
    grace_period_days INTEGER NOT NULL DEFAULT 3,
    renewal_reminder_days_before INTEGER NOT NULL DEFAULT 3,
    is_active BOOLEAN DEFAULT TRUE
);

-- 2. الاشتراكات
CREATE TABLE subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    plan_id INTEGER REFERENCES subscription_plans(id),
    status VARCHAR(25) DEFAULT 'PENDING_FIRST_PAYMENT' CHECK(status IN
        ('PENDING_FIRST_PAYMENT', 'ACTIVE', 'GRACE_PERIOD', 'PENDING_REFUND', 'EXPIRED', 'CANCELLED')),
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    grace_period_ends_at TIMESTAMP,
    referred_by_affiliate_id INTEGER,        -- يُجمَّد وقت إنشاء الاشتراك، لا يتغيّر لاحقاً
    cancelled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. سجل دورات الفوترة (كل دورة = فاتورة واحدة مرتبطة)
CREATE TABLE subscription_billing_cycles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subscription_id INTEGER REFERENCES subscriptions(id),
    invoice_id INTEGER REFERENCES invoices(id),   -- الفاتورة المرتبطة (من وحدة الدفع)
    cycle_number INTEGER NOT NULL,                 -- 1 = أول دفعة، 2 = أول تجديد، إلخ
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    price_usd_charged FLOAT NOT NULL,               -- يُجمَّد وقت توليد الفاتورة (Grandfather Pricing)
    status VARCHAR(20) DEFAULT 'AWAITING_PAYMENT' CHECK(status IN
        ('AWAITING_PAYMENT', 'PAID', 'MISSED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. القوانين الصارمة (Strict Rules)

### 4.1 قوانين التسعير
1. **سعر الخطة يُجمَّد لكل دورة فوترة وقت توليد الفاتورة (`price_usd_charged`)** — لو الإدارة غيّرت سعر الخطة لاحقاً، العملاء الحاليين يستمرون بالسعر القديم حتى دورتهم القادمة فقط، وليس بأثر رجعي على فواتير سابقة أو مستقبلية محسوبة مسبقاً.

### 4.2 قوانين التجديد والفوترة الاستباقية
2. **توليد فاتورة التجديد يحدث تلقائياً قبل `current_period_end` بعدد أيام = `renewal_reminder_days_before`** — Background Job يومي يفحص كل الاشتراكات `ACTIVE` القريبة من الانتهاء وينشئ `subscription_billing_cycles` + `invoice` جديدة تلقائياً، مع إشعار للعميل.
3. **دفع فاتورة التجديد قبل `current_period_end` يمدد الدورة فوراً دون انتظار** — `current_period_start/end` تُحدَّث بمجرد `invoice.status = PAID`، بغض النظر متى بالضبط دفع العميل ضمن نافذة التذكير.
4. **عدم الدفع عند `current_period_end` بالضبط يحوّل الحالة لـ `GRACE_PERIOD` تلقائياً**، وليس مباشرة لـ `EXPIRED` — يُعطى العميل مهلة `grace_period_days` قبل فقدان الوصول نهائياً.
5. **الوصول للخدمة خلال `GRACE_PERIOD` قرار يُترك للنظام المستهلك** (بعض الأنظمة تسمح بوصول كامل خلال المهلة، أخرى تقيّده) — المعيار فقط يوفّر الحالة والتاريخ، والنظام المستهلك يقرر السلوك الفعلي بواجهته.

### 4.3 قوانين الإلغاء والاسترجاع
6. **طلب الإلغاء من العميل لا يُنفَّذ فوراً كـ `CANCELLED`** — يتحول أولاً لـ `PENDING_REFUND` إن كان ضمن سياسة الاسترجاع (المعرَّفة بالوثيقة المخصصة)، وينشئ طلب استرجاع تلقائياً. **الحالة النهائية `CANCELLED` لا تتحقق إلا بعد اكتمال الاسترجاع فعلياً** (أو مباشرة لو العميل خارج نافذة الاسترجاع أصلاً، بدون مرور بحالة `PENDING_REFUND`).
7. **اشتراك بحالة `EXPIRED` (انتهت مهلة السماح بدون دفع) لا يدخل مسار الاسترجاع إطلاقاً** — لأنه أصلاً لا توجد دفعة جديدة لاسترجاعها؛ الدورة الأخيرة المدفوعة استُهلكت بالكامل.

### 4.4 قوانين ربط العمولات (Affiliate Linkage)
8. **`referred_by_affiliate_id` يُسجَّل مرة واحدة فقط وقت إنشاء أول اشتراك للعميل، ولا يتغيّر أبداً بعدها** — حتى لو العميل ألغى واشترك مجدداً لاحقاً عبر رابط مختلف، يُفتح نقاش تجاري منفصل (يُدار كإعداد سياسة: "أول مسوّق يفوز" أو "آخر مسوّق يفوز") — **الافتراضي بالمعيار: أول مسوّق يفوز (First-Touch)**.
9. **كل دورة فوترة ناجحة (`subscription_billing_cycles.status = PAID`) تُطلق حدثاً واحداً بالضبط لخلق سجل عمولة** (`INITIAL` للدورة الأولى، `RECURRING` لما بعدها) بوحدة العمولات — **يُشترط تحقق Idempotency**: لا يُنشأ سجل عمولة مكرر لنفس `invoice_id` حتى لو استُدعي الحدث أكثر من مرة (فشل شبكة، إعادة محاولة Webhook داخلي).

### 4.5 قانون الفصل المعماري
10. **هذي الوحدة لا تدير أي محتوى خاص بالمزايا الفعلية للخطة** (عدد الصفقات المسموحة، الميزات المفتوحة، إلخ) — حقل `features JSON` يُمرَّر فقط للنظام المستهلك (مثال: نظام تتبع التداول) ليفسّره حسب منطقه الخاص. المعيار يدير "هل الاشتراك فعّال أو لا" فقط، وليس "ماذا يحق للمستخدم يفعل بالتحديد".

---

## 5. عقد الـ API

```
GET    /api/subscription-plans                      → قائمة الخطط المتاحة (عامة، لصفحة الأسعار)
POST   /api/subscriptions                             → اشتراك جديد {customer_id, plan_id, referred_by_affiliate_id?} → ينشئ invoice
GET    /api/subscriptions/:id
POST   /api/subscriptions/:id/cancel                   → طلب إلغاء (يُشغّل مسار الاسترجاع تلقائياً حسب الأهلية)
GET    /api/subscriptions/:id/billing-history           → سجل كل دورات الفوترة والفواتير المرتبطة

-- Webhook داخلي (يُستهلك من وحدة الدفع)
invoice.paid (reference_type='SUBSCRIPTION') → يُفعّل/يمدد الاشتراك + يُطلق حدث عمولة المسوّق
```

---

## 6. ملخص القرارات المعمارية

1. لا تجديد تلقائي حقيقي — فوترة استباقية + تذكير، دفع يدوي بنقرة من العميل.
2. سعر كل دورة يُجمَّد وقت التوليد (Grandfather Pricing) — تغيير السعر لا يمس دورات محسوبة مسبقاً.
3. مهلة سماح (`GRACE_PERIOD`) قبل الإلغاء القسري، تفصل بين "تأخر بالدفع" و"إلغاء فعلي".
4. الإلغاء يمر عبر وحدة الاسترجاع دائماً (لا تنفيذ مباشر لحالة `CANCELLED` عند الأهلية للاسترجاع).
5. ربط المسوّق بالعميل ثابت مدى الحياة بقاعدة First-Touch، يُطلق عمولة تلقائياً بكل دورة فوترة ناجحة مع ضمان عدم التكرار.
6. الوحدة "عمياء" عن تفاصيل مزايا كل نظام مستهلك — فقط تدير حالة الاشتراك نفسها.

---

بهذا اكتملت الوحدات الثلاث الأساسية للمعيار: **الدفع ← الاشتراكات (تستهلك الدفع) ← الاسترجاع والعمولات (تُطلقهم الاشتراكات)**. المتبقي: **إدارة المستخدمين** و**صفحات الهبوط** — أخف الوحدات تقنياً وأقلها ارتباطاً بمنطق الأموال الحساس.
