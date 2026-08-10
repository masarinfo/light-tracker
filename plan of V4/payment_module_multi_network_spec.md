# وحدة الدفع بالعملات الرقمية — دعم شبكات متعددة (Multi-Network Crypto Payment Module)
## جزء من المعيار الموحّد (Standard Architecture)

> **السياق:** بديل كامل عن أي بوابة دفع مركزية (بسبب استبعاد اليمن من أغلب المعالجات). النظام يراقب عناوين محافظ مباشرة على البلوكشين عبر APIs عامة مجانية، بدون أي وسيط يفحص الجنسية أو يطلب أوراق.

---

## 1. المبدأ المعماري: Network Adapter Pattern

كل شبكة بلوكشين = Adapter مستقل يطبّق نفس الواجهة (Interface) الموحّدة. النظام المركزي (Payment Orchestrator) لا يعرف تفاصيل أي شبكة بعينها — فقط يتعامل مع عقد موحّد.

```
┌─────────────────────────────────────────┐
│         Payment Orchestrator              │
│   (إنشاء فاتورة، مطابقة، تأكيد، تحديث حالة) │
└───────────────┬─────────────────────────┘
                 │ يستخدم واجهة موحّدة
    ┌────────────┼────────────┬─────────────┐
    ▼            ▼             ▼             ▼
┌────────┐  ┌─────────┐  ┌─────────┐  ┌──────────┐
│TRC20    │  │ERC20    │  │BEP20    │  │BTC-Native│
│Adapter  │  │Adapter  │  │Adapter  │  │Adapter   │
│(TronGrid│  │(Etherscan│ │(BscScan)│  │(Blockstream│
│ API)    │  │ API)    │  │ API)    │  │  API)    │
└────────┘  └─────────┘  └─────────┘  └──────────┘
```

**عقد الـ Adapter الموحّد (كل شبكة تلتزم به إلزامياً):**

```
interface NetworkAdapter {
  generateAddress(invoiceId): { address, derivationPath }
  getAddressTransactions(address, sinceBlock?): Transaction[]
  getCurrentBlockHeight(): number
  getRequiredConfirmations(): number
  getNetworkFeeEstimate(): number
  validateAddress(address): boolean
}
```

---

## 2. الشبكات المدعومة بالإصدار الأول (Phase 1)

| كود الشبكة | العملات المقبولة (USDT + عملة الشبكة الأساسية) | مزوّد الـ API (مجاني) | متوسط زمن التأكيد | عدد التأكيدات المطلوبة | رسوم الشبكة النموذجية |
|---|---|---|---|---|---|
| `TRC20` | USDT, TRX | TronGrid API | ~3 ثوانٍ/بلوك | 19 تأكيد (~1 دقيقة) | أقل من $1 |
| `ERC20` | USDT, ETH | Etherscan API | ~12 ثانية/بلوك | 12 تأكيد (~2.5 دقيقة) | متغيرة، أعلى الشبكات |
| `BEP20` | USDT, BNB | BscScan API | ~3 ثوانٍ/بلوك | 15 تأكيد (~45 ثانية) | أقل من $0.5 |
| `BTC` | Bitcoin فقط | Blockstream.info API (بدون مفتاح) | ~10 دقائق/بلوك | 2 تأكيد (مبالغ صغيرة) / 6 (مبالغ كبيرة) | متغيرة حسب الازدحام |
| `SOLANA` [جديد] | USDT (SPL Token), SOL | RPC عام (`api.mainnet-beta.solana.com`) أو Helius/Solscan (Free tier) | ~0.4 ثانية/بلوك | يُستخدم `commitment level = finalized` بدل عدّاد تأكيدات تقليدي | ~$0.0004 (شبه معدومة) |
| `TON` [جديد] | USDT (Jetton), TON | TONCenter API أو tonapi.io (Free tier) | ~5 ثوانٍ/بلوك | 1-2 (شبكة سريعة جداً بآلية Finality مختلفة) | أقل من $0.05 |

> **قاعدة صارمة:** عدد التأكيدات المطلوب لكل شبكة **يُخزَّن كإعداد قابل للتعديل بجدول `networks`**، وليس Hardcoded بالكود، لأن هذي الأرقام تتغيّر حسب مستوى المخاطرة المقبول.

### 2.1 خصوصيات تقنية لـ Solana وTON (تختلف جذرياً عن نموذج TRON/EVM)

**Solana:**
- عنوان المحفظة العادي **لا يستقبل USDT مباشرة** — يحتاج حساب فرعي مخصص لكل توكن يُسمى **Associated Token Account (ATA)**، يُشتق حتمياً من (عنوان المحفظة + عقد USDT). الـ Adapter يجب أن يشتق ويراقب هذا الـ ATA وليس عنوان المحفظة الأصلي عند التعامل مع USDT، بينما SOL (العملة الأساسية) تُراقب على عنوان المحفظة مباشرة.
- لا يوجد "عدد تأكيدات" تقليدي كباقي السلاسل — تُستخدم مستويات (`processed` → `confirmed` → `finalized`). **القاعدة المعتمدة: نعتبر الدفعة نهائية فقط عند `finalized`** (الأبطأ لكن الأكثر أماناً، يتجنب أي Rollback نادر).

**TON:**
- صيغة العنوان لها نوعان: Bounceable (يبدأ بـ `EQ`) وNon-bounceable (يبدأ بـ `UQ`) — **يجب اعتماد الصيغة Bounceable حصراً** لعناوين الاستقبال لتفادي فقدان الأموال في حال إرسال العميل لعقد غير مهيّأ لاستقبالها.
- ميزة فريدة: <cite index="37-1">شبكة TON تدعم إرفاق تعليق نصي (Comment/Memo) مع كل تحويل</cite> — هذا يفتح خياراً معمارياً بديلاً: بدل توليد عنوان جديد لكل فاتورة، يمكن استخدام **عنوان TON ثابت واحد + Memo فريد لكل فاتورة** (شبيه بآلية الإيداع بالمنصات الكبرى). **القرار المعتمد بالمعيار: هذا الخيار اختياري وثانوي فقط** — الافتراضي يبقى عنوان فريد لكل فاتورة (نفس منطق TRON/EVM) لأن الاعتماد على المستخدم لإدخال Memo يدوياً يحمل مخاطرة نسيان أو خطأ إدخال قد تُفقد معه إمكانية المطابقة التلقائية.

---

## 3. مخطط قاعدة البيانات

```sql
-- 1. جدول الشبكات المدعومة (Configuration Table)
CREATE TABLE networks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(20) UNIQUE NOT NULL,          -- 'TRC20', 'ERC20', 'BEP20', 'BTC'
    display_name VARCHAR(50) NOT NULL,          -- 'Tron (USDT)', 'Ethereum (USDT)'
    is_active BOOLEAN DEFAULT TRUE,
    required_confirmations INTEGER NOT NULL,
    explorer_api_base_url VARCHAR(255) NOT NULL,
    explorer_api_key VARCHAR(255),              -- بعض الـ APIs تحتاج مفتاح مجاني (Etherscan/BscScan)
    avg_block_time_seconds INTEGER NOT NULL,
    polling_interval_seconds INTEGER NOT NULL DEFAULT 30
);

-- 2. جدول العملات المقبولة على كل شبكة
CREATE TABLE network_assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    network_id INTEGER REFERENCES networks(id),
    asset_symbol VARCHAR(10) NOT NULL,          -- 'USDT', 'USDC', 'BTC', 'ETH'
    contract_address VARCHAR(255),               -- عنوان العقد (فارغ للعملة الأصلية مثل BTC/ETH/BNB)
    decimals INTEGER NOT NULL DEFAULT 6,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(network_id, asset_symbol)
);

-- 3. جدول العناوين المولّدة (عنوان فريد لكل فاتورة/شبكة)
CREATE TABLE wallet_addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    network_id INTEGER REFERENCES networks(id),
    address VARCHAR(255) NOT NULL,
    derivation_path VARCHAR(100),                -- لتتبع أي حساب HD Wallet ولّد هذا العنوان
    invoice_id INTEGER REFERENCES invoices(id),
    is_used BOOLEAN DEFAULT FALSE,               -- لدعم إعادة استخدام عناوين غير مستغلة إن لزم
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(network_id, address)
);

-- 4. جدول الفواتير (مستقل عن الاشتراكات — يُستخدم لأي غرض دفع)
CREATE TABLE invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference_type VARCHAR(30) NOT NULL,         -- 'SUBSCRIPTION', 'AFFILIATE_PAYOUT', ...
    reference_id INTEGER NOT NULL,               -- id السجل المرتبط (subscription_id مثلاً)
    amount_usd FLOAT NOT NULL,                   -- المبلغ الثابت بالدولار (مصدر الحقيقة دائماً)
    selected_network_id INTEGER REFERENCES networks(id),
    selected_asset_symbol VARCHAR(10),
    locked_exchange_rate FLOAT,                   -- سعر الصرف المثبّت وقت اختيار العميل للشبكة
    expected_crypto_amount FLOAT,                  -- amount_usd / locked_exchange_rate
    rate_locked_at TIMESTAMP,
    rate_expires_at TIMESTAMP,                     -- عادة +15 دقيقة من rate_locked_at
    status VARCHAR(20) DEFAULT 'PENDING' CHECK(status IN
        ('PENDING', 'AWAITING_PAYMENT', 'DETECTED', 'CONFIRMING', 'PAID', 'UNDERPAID', 'EXPIRED', 'FAILED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. جدول المعاملات الفعلية المرصودة على البلوكشين
CREATE TABLE blockchain_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER REFERENCES invoices(id),
    network_id INTEGER REFERENCES networks(id),
    tx_hash VARCHAR(255) NOT NULL,
    from_address VARCHAR(255),
    to_address VARCHAR(255) NOT NULL,
    amount_received FLOAT NOT NULL,
    confirmations_count INTEGER DEFAULT 0,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    UNIQUE(network_id, tx_hash)
);
```

---

## 4. تسلسل عمل الدفع (Payment Flow) — خطوة بخطوة

```
1. النظام ينشئ Invoice بمبلغ ثابت بالدولار (amount_usd) — الحالة: PENDING

2. العميل يختار الشبكة (TRC20 / ERC20 / BEP20 / BTC) من صفحة الدفع
   ↓
3. النظام:
   - يستدعي Adapter الشبكة المختارة → generateAddress(invoiceId)
   - يجلب سعر الصرف اللحظي (USDT≈$1 ثابتة، BTC/ETH/BNB من CoinGecko)
   - يقفل السعر لمدة 15 دقيقة (rate_expires_at)
   - يحسب expected_crypto_amount = amount_usd / locked_exchange_rate
   - الحالة تتحول → AWAITING_PAYMENT

4. العميل يرسل المبلغ للعنوان المعروض (يدوياً من محفظته)

5. Background Worker (يعمل كل polling_interval_seconds لكل شبكة):
   - يستدعي Adapter.getAddressTransactions(address) لكل عنوان بحالة AWAITING_PAYMENT
   - عند رصد معاملة واردة → يسجلها بـ blockchain_transactions، الحالة تتحول → DETECTED

6. مراقبة التأكيدات:
   - كل دورة polling، يُحدَّث confirmations_count
   - عند الوصول لـ required_confirmations الخاصة بالشبكة → الحالة تتحول → CONFIRMING ثم PAID

7. عند PAID:
   - يُستدعى webhook/event داخلي: invoice.paid
   - يُحدَّث السجل المرتبط (تفعيل اشتراك، تأكيد صرف عمولة مسوّق...)
```

---

## 5. القوانين الصارمة (Strict Rules) — إلزامية لتقليل الأخطاء

### 5.1 قوانين مطابقة المبلغ
1. **هامش سماح إلزامي للفرق السعري:** بسبب تقلب سعر الصرف بين لحظة عرض السعر ولحظة الدفع الفعلي، أي مبلغ مستلم ضمن `expected_crypto_amount ± 1%` يُعتبر **مطابقاً بالكامل** (لا يُصنَّف Underpaid).
2. **الدفع الناقص (Underpaid):** لو المبلغ المستلم أقل من `expected_crypto_amount × 0.99` → الحالة `UNDERPAID`، والنظام يعرض للعميل الفرق المتبقي بالضبط ويطلب دفعة تكميلية لنفس العنوان (لا يُنشئ فاتورة جديدة).
3. **الدفع الزائد (Overpaid):** أي مبلغ أعلى من `expected_crypto_amount × 1.01` → يُقبل الدفع تلقائياً (`PAID`)، والفرق الزائد **يُسجَّل كرصيد دائن (Credit Balance)** لحساب العميل، لا يُرد تلقائياً (لأن رد الكريبتو يحتاج تدخل يدوي وعنوان محفظة العميل).

### 5.2 قوانين انتهاء الصلاحية
4. **صلاحية السعر المقفل 15 دقيقة فقط.** لو لم تصل أي معاملة خلال هذي المدة، الفاتورة تبقى `AWAITING_PAYMENT` لكن `rate_expires_at` منتهي — أي دفعة تصل بعدها **تُعاد تسعيرها بالسعر اللحظي الجديد وقت الرصد**، وليس السعر القديم.
5. **صلاحية الفاتورة الكاملة: ساعة واحدة من الإنشاء.** لو لم تصل أي معاملة إطلاقاً خلال ساعة → الحالة `EXPIRED`، والعنوان يُعاد تدويره (`is_used = false`) بعد التأكد بفحص أخير أنه فعلاً فارغ.

### 5.3 قوانين توليد العناوين
6. **عنوان فريد إلزامي لكل فاتورة على كل شبكة EVM/TRON** (TRC20, ERC20, BEP20) — **ممنوع مشاركة نفس العنوان بين فاتورتين مختلفتين في نفس الوقت**، لأن هذي الشبكات لا تدعم Memo/Tag لتمييز الدفعات (بخلاف XRP/BNB Beacon Chain). التوليد عبر HD Wallet واحد بمسار اشتقاق فريد (`derivation_path`) لكل فاتورة.
7. **شبكة BTC استثناء اختياري:** لو الحجم بسيط بالبداية، يمكن استخدام عنوان BTC واحد ثابت + مطابقة يدوية بالمبلغ + الوقت التقريبي (بدل توليد HD لكل فاتورة)، لتقليل التعقيد بالمرحلة الأولى فقط.
8. **شبكة Solana — قاعدة إلزامية:** عند اختيار العميل دفع USDT عبر Solana، النظام يشتق عنوان محفظة فريد للفاتورة **ثم يحسب الـ ATA المرتبط بها لعقد USDT تلقائياً** قبل عرض عنوان الاستقبال للعميل — لا يُعرض عنوان المحفظة الخام لاستقبال USDT مطلقاً، فقط الـ ATA. لدفع SOL (العملة الأساسية) يُستخدم عنوان المحفظة مباشرة.
9. **شبكة TON — قاعدة إلزامية:** كل عنوان يُولَّد ويُعرض للعميل يجب أن يكون **بصيغة Bounceable (`EQ...`) حصراً**، بلا استثناء.

### 5.4 قوانين الـ Background Worker
8. **Polling منفصل لكل شبكة بجدول زمني مستقل** يطابق `polling_interval_seconds` الخاص بها — شبكة TRC20 (بلوكات كل 3 ثوانٍ) لا تُفحص بنفس معدل BTC (بلوكات كل 10 دقائق)، تفادياً لاستهلاك حصة الـ API المجانية بلا داعٍ.
9. **حد أقصى لطلبات الـ API لكل شبكة (Rate Limiting الذاتي):** كل Adapter يلتزم بحد الطلبات المجاني للمزوّد (مثال: TronGrid ~حد معيّن بالثانية) عبر Queue داخلي، وليس طلب مباشر لكل عنوان بنفس اللحظة.
10. **عند فشل استدعاء API لأي شبكة (انقطاع مؤقت)، لا تتغير حالة أي فاتورة.** يُسجَّل الفشل بـ log فقط، وتُعاد المحاولة بالدورة التالية — **ممنوع افتراض "عدم وصول دفعة" = فشل**.

### 5.5 قانون فصل المسؤوليات (الأهم)
11. **حساب Realized/Unrealized PnL بنظام تتبع التداول (الوثيقة الأولى) لا علاقة له إطلاقاً بوحدة الدفع هذه.** هذي وحدة مستقلة تماماً ضمن المعيار العام (SuperAdmin)، ولا تُدمج جداولها أبداً مع جداول `trades`/`coin_portfolios` الخاصة بنظام التداول — أي نظام مستقبلي (زي نظام التداول) **يستهلك** هذي الوحدة عبر استدعاء `POST /api/invoices` فقط، ولا يُعيد بناء منطقها.

---

## 6. عقد الـ API الموحّد لهذي الوحدة

```
POST   /api/invoices                          → إنشاء فاتورة جديدة {reference_type, reference_id, amount_usd}
POST   /api/invoices/:id/select-network        → اختيار الشبكة {network_id, asset_symbol} → يرجع العنوان + المبلغ المتوقع + وقت الانتهاء
GET    /api/invoices/:id/status                 → حالة الفاتورة اللحظية (للـ Polling من الفرونت)
GET    /api/networks                            → قائمة الشبكات المفعّلة (لعرضها بصفحة الدفع)
```

---

## 8. برومبت تنفيذي مفصّل لبناء هذي الوحدة (Backend Implementation Prompt)

### الدور والسياق
أنت مهندس Backend مكلّف ببناء وحدة استقبال الدفع بالكريبتو متعددة الشبكات، كجزء من معيار SuperAdmin. اقرأ الوثيقة كاملة قبل البدء — كل رقم بالجداول أعلاه (عدد التأكيدات، فترات الـ Polling) قيم افتراضية تُقرأ من جدول `networks`، لا تُثبّت بالكود (Hardcode) تحت أي ظرف.

### قوانين تنفيذ صارمة (كل قاعدة + مثال)

1. **كل Adapter شبكة ملف مستقل يطبّق نفس الواجهة المجردة (Interface)، بدون أي منطق مشترك مسرّب بينها.**
   *مثال:* لو أضفتوا حقل `getNetworkFeeEstimate()` لـ Adapter الخاص بـ TRC20، لازم كل Adapter ثاني (ERC20, Solana...) يطبّقه بنفس التوقيع حتى لو رجع قيمة تقديرية بسيطة — الـ Orchestrator يستدعيه بدون ما يعرف أي شبكة يتعامل معها.

2. **لا يُكتب أي منطق "مطابقة مبلغ" داخل أي Adapter — المطابقة حصراً بطبقة الـ Orchestrator.**
   *مثال:* Adapter TronGrid يرجع فقط `[{tx_hash, amount, from, to, block_height}]` خام. الـ Orchestrator هو من يقارنها بـ `expected_crypto_amount ± 1%`. لو حطيتوا شرط المطابقة جوا Adapter TRC20، أول ما تضيفون Solana بتكررون نفس المنطق بملف ثاني — بالضبط الخطأ اللي التصميم يمنعه.

3. **Idempotency إلزامي على كل معالجة معاملة واردة.**
   *مثال:* لو الـ Worker قرأ نفس `tx_hash` مرتين (بسبب إعادة تشغيل بعد Crash)، ثاني قراءة يجب أن تُكتشف عبر `UNIQUE(network_id, tx_hash)` بجدول `blockchain_transactions` وتُتجاهل بهدوء (لا Exception توقف الـ Worker) — لا تُعالَج الفاتورة مرتين ولا تتحول لـ `PAID` مرتين.

4. **كل استدعاء API خارجي (TronGrid, Etherscan...) يمر بـ Retry مع Exponential Backoff، وليس محاولة واحدة.**
   *مثال:* فشل استدعاء TronGrid بسبب Timeout → أعد المحاولة بعد 2 ثانية، ثم 4، ثم 8 (حد أقصى 3 محاولات) → لو فشلت الكل، سجّل بـ log وانتظر دورة Polling القادمة، **لا توقف الـ Worker بالكامل** ولا تُسقط فحص باقي العناوين بنفس الدورة.

5. **صيغة الاستجابة لكل Adapter موحّدة بغض النظر عن API المزوّد الأصلي.**
   *مثال:* Etherscan يرجع `timeStamp` (نصي Unix)، وTronGrid يرجع `block_timestamp` (رقمي مللي ثانية) — الـ Adapter مسؤول عن التطبيع (Normalization) لصيغة موحّدة `{detected_at: ISO8601}` قبل ما ترجع للـ Orchestrator.

6. **اختبار كل Adapter بمعاملة تجريبية حقيقية على Testnet قبل الدمج بالـ Orchestrator.**
   *مثال:* قبل ربط Adapter الخاص بـ Solana، أرسلوا معاملة USDT تجريبية فعلية على Solana Devnet وتأكدوا إن `getAddressTransactions()` يرجعها صح، شاملة التعامل الصحيح مع الـ ATA (Associated Token Account) لا عنوان المحفظة الخام.

### ترتيب البناء المقترح
1. جداول `networks`, `network_assets` + بيانات ابتدائية (Seed) لكل الشبكات الستة
2. Adapter واحد فقط للبداية (TRC20 — الأبسط والأرخص) + اختباره كاملاً
3. الـ Orchestrator المركزي (إنشاء فاتورة → اختيار شبكة → توليد عنوان → مطابقة → تأكيد)
4. باقي الـ Adapters (ERC20, BEP20, BTC, Solana, TON) كل واحد بعد اختبار سابقه
5. Worker الـ Polling المجدول لكل شبكة بفاصلها الزمني الخاص

### معايير القبول (Definition of Done)
- [ ] كل Adapter يمرر نفس مجموعة اختبارات الوحدة (Unit Tests) على واجهة موحّدة
- [ ] محاكاة دفعة ناقصة (Underpaid) ودفعة زائدة (Overpaid) تُعالَج حسب القاعدة المحددة بدون تدخل يدوي
- [ ] إعادة تشغيل الـ Worker أثناء معالجة معاملة لا تنتج ازدواجية بأي سجل
- [ ] فشل مؤقت لأي API خارجي لا يوقف باقي الشبكات عن العمل

