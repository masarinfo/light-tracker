# وحدة إدارة المستخدمين (Users Management Module)
## جزء من المعيار الموحّد (Standard Architecture)

> **الفرق عن نظام تتبع التداول:** لاحظوا إن هذا مختلف عن جدول `users` البسيط اللي بنيناه بنظام تتبع التداول (مستخدم واحد فقط للحماية). هذي وحدة المعيار **متعددة الأدوار** فعلياً — عملاء، مسوقين، وفريق إداري — لأن المعيار يخدم أنظمة SaaS كاملة بعملاء حقيقيين، بعكس أداة شخصية بمستخدم واحد.

---

## 1. الأدوار الأربعة (User Roles)

| الدور | الوصف | يملك حساب دخول؟ |
|---|---|---|
| `CUSTOMER` | عميل مشترك بأي نظام مستهلك | نعم |
| `AFFILIATE` | مسوّق بالعمولة | نعم |
| `STAFF` | موظف إداري بصلاحيات محددة (دعم، مالية، تسويق...) | نعم |
| `SUPER_ADMIN` | تحكم كامل بلا قيود | نعم |

> **قاعدة مهمة:** الأدوار **ليست حصرية بالضرورة** — نفس الشخص ممكن يكون `CUSTOMER` و`AFFILIATE` بنفس الوقت (عميل يسوّق للمنتج). لكن `STAFF`/`SUPER_ADMIN` **يُفصلان دائماً عن باقي الأدوار على حساب منفصل تماماً** (راجع القوانين الصارمة).

---

## 2. مخطط قاعدة البيانات

```sql
-- 1. المستخدمون (الجدول الموحّد لكل الأدوار)
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,          -- Bcrypt أو Argon2 حصراً
    primary_role VARCHAR(15) CHECK(primary_role IN ('CUSTOMER', 'AFFILIATE', 'STAFF', 'SUPER_ADMIN')),
    is_also_affiliate BOOLEAN DEFAULT FALSE,        -- يسمح لعميل بالتسويق أيضاً دون تغيير primary_role
    status VARCHAR(15) DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'SUSPENDED', 'BANNED')),
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),                 -- مشفّر
    email_verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. صلاحيات الموظفين (Granular Permissions)
CREATE TABLE staff_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    permission_code VARCHAR(50) NOT NULL,
    -- أمثلة: 'TREASURY_APPROVE_WITHDRAWAL', 'REFUND_APPROVE', 'MANAGE_COUPONS',
    --        'MANAGE_SUBSCRIPTION_PLANS', 'MANAGE_USERS', 'VIEW_FINANCIAL_REPORTS'
    granted_by_user_id INTEGER REFERENCES users(id),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, permission_code)
);

-- 3. ملف المسوّق (يمتد من users، لا يكرر بياناته)
CREATE TABLE affiliate_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id),
    referral_code VARCHAR(20) UNIQUE NOT NULL,       -- يُستخدم برابط الإحالة: yourapp.com/?ref=CODE
    default_payout_network_id INTEGER,                -- شبكة الاستلام المفضلة (من networks بوحدة الدفع)
    default_payout_address VARCHAR(255),
    status VARCHAR(15) DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'SUSPENDED')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. سجل تدقيق أفعال إدارية حساسة (Immutable Audit Log)
CREATE TABLE admin_audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_user_id INTEGER REFERENCES users(id),
    action_type VARCHAR(50) NOT NULL,                 -- 'WITHDRAWAL_APPROVED', 'REFUND_APPROVED', 'USER_SUSPENDED'...
    target_entity_type VARCHAR(30),                    -- 'withdrawal', 'refund', 'user'...
    target_entity_id INTEGER,
    metadata JSON,                                       -- تفاصيل إضافية (المبلغ، السبب...)
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    -- لا UPDATE ولا DELETE مسموح على هذا الجدول إطلاقاً (Append-Only)
);
```

---

## 3. القوانين الصارمة (Strict Rules)

### 3.1 قوانين فصل الأدوار (منع تضارب المصالح)
1. **حساب `STAFF`/`SUPER_ADMIN` لا يجوز أبداً أن يحمل بنفس الوقت `primary_role = CUSTOMER` أو `is_also_affiliate = TRUE`.** موظف الإدارة يستخدم حساباً منفصلاً تماماً عن أي حساب شخصي له كعميل أو مسوّق — لتفادي تضارب مصالح مباشر (موظف يوافق على استرجاع أو عمولة لنفسه).
2. **أي `staff_permissions` تمنح صلاحية `TREASURY_APPROVE_WITHDRAWAL` أو `REFUND_APPROVE` تتطلب `two_factor_enabled = TRUE` إلزامياً** قبل تفعيل الصلاحية — لا استثناءات، بحكم حساسية هذي الصلاحيات المالية.

### 3.2 قوانين التدقيق (Audit)
3. **كل فعل يمس المال أو حالة حساب (موافقة سحب، موافقة استرجاع، تعليق مستخدم، منح/سحب صلاحية) يُسجَّل إلزامياً بـ `admin_audit_log`** — الجدول **Append-Only بالكامل**: لا تعديل ولا حذف مسموح على أي سجل بعد إنشائه، حتى من `SUPER_ADMIN` نفسه.
4. **`admin_audit_log` مرجع إلزامي عند أي تحقيق أو نزاع** — كل الوثائق السابقة (الخزينة، الاسترجاع، العمولات) اللي تتطلب `approved_by_user_id` **يجب أن يقابلها سجل موازٍ هنا تلقائياً**، لا يُترك الاعتماد على الحقل الفردي وحده بكل جدول.

### 3.3 قوانين المسوّقين
5. **`referral_code` يُولَّد تلقائياً وفريداً عند تحويل أي مستخدم لـ`is_also_affiliate = TRUE` أو تسجيل `AFFILIATE` جديد** — صيغة قابلة للتخصيص لاحقاً من قِبل المستخدم نفسه (طالما تبقى فريدة)، لتسهيل التسويق الشخصي (مثال: `?ref=ahmed2026`).
6. **تعليق حساب مسوّق (`affiliate_profiles.status = SUSPENDED`) يوقف احتساب عمولات جديدة فوراً**، لكن **لا يُلغي عمولات `CLEARED` سابقة غير مصروفة بعد** — تبقى مستحقة إلا لو التعليق بسبب احتيال مؤكد (حالة استثنائية تُدار يدوياً).

### 3.4 قوانين أمان الحساب
7. **إعادة تعيين كلمة المرور تتطلب رابطاً محدود الصلاحية زمنياً (مثال: 15 دقيقة) ولمرة استخدام واحدة فقط** — لا روابط دائمة أو قابلة لإعادة الاستخدام.
8. **تسجيل دخول فاشل متكرر (5 محاولات خلال 15 دقيقة، كما حُدد بالوثيقة الأصلية) يوقف الحساب مؤقتاً**، بصرف النظر عن الدور — هذا يشمل حسابات `STAFF` أيضاً، بلا استثناء حتى لحساب `SUPER_ADMIN`.

### 3.5 قانون الفصل المعماري
9. **هذي الوحدة لا تدير أي بيانات خاصة بمنتج معيّن** (مثال: لا تخزّن بيانات صفقات نظام التداول) — فقط الهوية، الدور، الصلاحيات، وحالة الحساب. أي نظام مستهلك يربط بياناته الخاصة بـ `user_id` من هنا كـ Foreign Key خارجي، دون تكرار منطق المصادقة بنفسه.

---

## 4. عقد الـ API

```
POST   /api/auth/register                 → تسجيل عميل جديد
POST   /api/auth/login
POST   /api/auth/2fa/verify
POST   /api/auth/password-reset/request
POST   /api/auth/password-reset/confirm

GET    /api/users/:id
PATCH  /api/users/:id/status               → تعليق/تفعيل (صلاحية STAFF فقط، يُسجَّل بـ audit_log تلقائياً)

POST   /api/affiliates/become-affiliate    → تحويل مستخدم حالي لمسوّق (يُنشئ referral_code)
GET    /api/affiliates/:code/resolve       → تحويل كود الإحالة لـ affiliate_user_id (تُستخدم عند تسجيل عميل جديد)

GET    /api/admin/audit-log?actor=&action_type=&date_range=   → استعراض السجل (صلاحية محددة فقط)
```

---

## 5. ملخص القرارات المعمارية

1. أربعة أدوار، لكن `CUSTOMER`/`AFFILIATE` قابلين للدمج بنفس الحساب — `STAFF`/`SUPER_ADMIN` معزولان تماماً كحساب منفصل دائماً.
2. صلاحيات الموظفين حبيبية (Granular) عبر `staff_permissions`، وليست دوراً واحداً بصلاحيات ثابتة — قابلة للتخصيص حسب حجم الفريق.
3. أي صلاحية مالية حساسة تفرض تفعيل 2FA إلزامياً كشرط مسبق.
4. سجل تدقيق شامل Append-Only يوازي كل حقل `approved_by_user_id` بالوحدات السابقة — مصدر حقيقة موحّد لأي نزاع أو تحقيق مستقبلي.
5. الوحدة "عمياء" عن بيانات أي منتج مستهلك — فقط هوية وصلاحيات، بنفس فلسفة الفصل المعماري المتكررة عبر كل الوحدات.

---

بهذا اكتملت 5 من 6 وحدات. المتبقي أخيراً: **صفحات الهبوط (Landing Pages)** — الوحدة الوحيدة غير المرتبطة مباشرة بمنطق الأموال أو الهوية.
