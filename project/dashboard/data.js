// Mock dataset for the UX Incidents dashboard prototype
// Generated from the April 2026 distribution

const SERVICES = [
  ["Ertah", 94, "ertah"],
  ["NSP-Portal-CSA", 79, "nsp"],
  ["Muqeem V3", 55, "muqeem"],
  ["Cargo Gate", 33, "cargo"],
  ["Port Community System (PCS)", 28, "pcs"],
  ["TMS", 28, "tms"],
  ["New TAMM", 12, "tamm"],
  ["Fasah Pay", 12, "fasah"],
  ["AMN", 11, "amn"],
  ["Mustamir", 11, "mustamir"],
  ["Import and Export", 8, "import-export"],
  ["Khibrah", 6, "khibrah"],
  ["Tasreeh NWC", 6, "tasreeh"],
  ["Mojaz", 6, "mojaz"],
  ["Salamah", 5, "salamah"],
  ["ePIL", 5, "epil"],
  ["Washaj", 4, "washaj"],
  ["New Yakeen", 4, "yakeen-new"],
  ["Air Community System - ACS", 4, "acs"],
  ["GACA - Security Permits V2", 4, "gaca"],
  ["Zawil", 3, "zawil"],
  ["Citizen Account", 3, "citizen"],
  ["Inspection Platform", 2, "inspection"],
  ["Tajeer", 2, "tajeer"],
  ["Kshf", 2, "kshf"],
  ["Mazadat Tameer", 1, "mazadat"],
  ["Bashir", 1, "bashir"],
  ["Yakeen", 1, "yakeen"],
  ["MEWA", 1, "mewa"],
  ["Nafath", 1, "nafath"],
];

const THEMES = [
  ["إدارة الحساب والمصادقة", "Account & Auth", 136, "auth"],
  ["الدفع والفوترة والمحفظة", "Payment & Billing", 91, "payment"],
  ["اختفاء خيار/زر/حقل", "Hidden UI elements", 77, "hidden"],
  ["إشعارات خاطئة أو غير مرغوبة", "Wrong notifications", 72, "notifications"],
  ["رفع المرفقات والنماذج", "Uploads & forms", 35, "uploads"],
  ["صلاحيات وأدوار المستخدم", "User roles & permissions", 24, "roles"],
  ["تعديل/تحديث البيانات", "Data editing", 12, "editing"],
  ["اللغة والتعريب", "Language / localization", 3, "language"],
  ["خصوصية البيانات", "Data privacy", 1, "privacy"],
];

// Teams (for senior manager role)
const TEAMS = [
  { id: "auth-team", name: "فريق الحساب والهوية", services: ["ertah", "nsp", "muqeem", "yakeen-new", "yakeen", "citizen", "nafath"] },
  { id: "logistics-team", name: "فريق اللوجستيات والموانئ", services: ["cargo", "pcs", "tms", "fasah", "import-export", "epil", "acs", "zawil"] },
  { id: "permits-team", name: "فريق التصاريح والخدمات", services: ["mustamir", "amn", "salamah", "khibrah", "washaj", "tasreeh", "mojaz", "tamm", "gaca", "tajeer", "kshf", "inspection", "bashir", "mazadat", "mewa"] },
];

// Severity distribution by theme (auth/payment skew higher)
const SEVERITY_BY_THEME = {
  auth: { P1: 0.18, P2: 0.42, P3: 0.40 },
  payment: { P1: 0.25, P2: 0.45, P3: 0.30 },
  hidden: { P1: 0.08, P2: 0.32, P3: 0.60 },
  notifications: { P1: 0.05, P2: 0.25, P3: 0.70 },
  uploads: { P1: 0.10, P2: 0.40, P3: 0.50 },
  roles: { P1: 0.15, P2: 0.45, P3: 0.40 },
  editing: { P1: 0.08, P2: 0.42, P3: 0.50 },
  language: { P1: 0.0, P2: 0.20, P3: 0.80 },
  privacy: { P1: 0.50, P2: 0.50, P3: 0.0 },
};

// Sample issue templates by theme
const ISSUE_TEMPLATES = {
  auth: [
    { title: "رمز OTP لا يصل عبر الرسائل النصية", desc: "المستخدم يطلب رمز التحقق ولا يصل خلال الوقت المحدد، مما يمنعه من إكمال تسجيل الدخول." },
    { title: "خطأ في التحقق من الهوية الوطنية", desc: "النظام يرفض رقم الهوية الصحيح ويطلب من المستخدم إعادة المحاولة دون توضيح السبب." },
    { title: "صفحة استعادة كلمة المرور لا تعمل", desc: "بعد إدخال البريد الإلكتروني، لا تصل رسالة الاستعادة وتظهر رسالة خطأ غير واضحة." },
    { title: "تسجيل دخول عبر نفاذ يفشل صامتاً", desc: "بعد إعادة التوجيه من نفاذ، يعود المستخدم إلى شاشة تسجيل الدخول دون رسالة خطأ." },
    { title: "حساب مستخدم مقفل دون إشعار", desc: "بعد عدة محاولات فاشلة، يُقفل الحساب دون إعلام المستخدم بسبب أو مدة القفل." },
  ],
  payment: [
    { title: "فاتورة مدفوعة تظهر كغير مدفوعة", desc: "بعد إتمام الدفع بنجاح، تستمر الفاتورة في الظهور كمستحقة لأكثر من 24 ساعة." },
    { title: "خصم مزدوج عند تجديد الإقامة", desc: "تم خصم رسوم التجديد مرتين من بطاقة المستخدم خلال نفس العملية." },
    { title: "زر استرجاع المبلغ غير ظاهر", desc: "صلاحية طلب استرجاع المبلغ غير ظاهرة في واجهة المستخدم رغم استحقاقها." },
    { title: "خطأ في تحميل الرصيد للمحفظة", desc: "العملية تنجح في بوابة الدفع لكن الرصيد لا يُضاف إلى محفظة المستخدم." },
    { title: "إيصال الدفع غير قابل للتحميل", desc: "زر تحميل الإيصال يفتح صفحة فارغة أو يعطي خطأ 404." },
  ],
  hidden: [
    { title: "زر تقديم اعتراض غير ظاهر", desc: "خيار تقديم الاعتراض على القرار غير ظاهر للمستخدم رغم أحقيته في تقديمه." },
    { title: "حقل اختياري مفقود في النموذج", desc: "حقل تعديل البيانات الإضافية لا يظهر إلا بعد تحديث الصفحة عدة مرات." },
    { title: "خيارات الفلترة مخفية على الجوال", desc: "في النسخة المتجاوبة، أزرار الفلترة لا تظهر بسبب مشكلة في التخطيط." },
    { title: "زر التحميل لا يظهر للملفات الكبيرة", desc: "ملفات تتجاوز حجم معين لا يظهر لها زر التحميل في القائمة." },
  ],
  notifications: [
    { title: "إشعار تجديد لمستخدم منتهية إقامته", desc: "النظام يرسل إشعارات تجديد متكررة لمستخدمين تم إلغاء إقاماتهم بالفعل." },
    { title: "رسالة بريد إلكتروني فارغة", desc: "إشعار البريد يصل بمحتوى فارغ أو بعناصر HTML غير مفسّرة." },
    { title: "تنبيه خاطئ بانتهاء الوثيقة", desc: "المستخدم يتلقى تنبيهاً بانتهاء وثيقة سارية المفعول لمدة سنة إضافية." },
    { title: "إشعارات مكررة لنفس الحدث", desc: "نفس الإشعار يصل 3-5 مرات خلال دقائق على الجوال." },
  ],
  uploads: [
    { title: "فشل رفع ملف PDF كبير", desc: "ملفات PDF أكبر من 5MB تفشل في الرفع دون رسالة خطأ واضحة." },
    { title: "نموذج طويل يفقد البيانات", desc: "عند الانتقال بين خطوات النموذج، تُفقد البيانات المُدخلة في الخطوة السابقة." },
    { title: "تنسيقات الصور غير مدعومة", desc: "الصور بصيغة HEIC من iPhone لا تُقبل دون رسالة توضيحية." },
  ],
  roles: [
    { title: "موظف لا يستطيع رؤية تقارير فريقه", desc: "الصلاحيات الممنوحة للمشرفين لا تشمل عرض تقارير الفريق رغم الحاجة لها." },
    { title: "مدير محجوب عن إجراء كان متاحاً", desc: "بعد التحديث الأخير، فقد المدراء صلاحية الموافقة على الطلبات." },
  ],
  editing: [
    { title: "تعديل رقم الجوال يتطلب إعادة تسجيل", desc: "المستخدم لا يستطيع تحديث رقم جواله إلا بإنشاء حساب جديد." },
  ],
  language: [
    { title: "ترجمة غير دقيقة في رسائل الخطأ", desc: "بعض رسائل الخطأ تظهر بالإنجليزية في الواجهة العربية." },
  ],
  privacy: [
    { title: "بيانات مستخدم آخر تظهر في الفاتورة", desc: "في حالات نادرة، تظهر معلومات عميل مختلف أعلى الفاتورة." },
  ],
};

// Deterministic PRNG so the dataset is stable across reloads
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickWeighted(rand, dist) {
  const r = rand();
  let acc = 0;
  for (const k in dist) {
    acc += dist[k];
    if (r <= acc) return k;
  }
  return Object.keys(dist).pop();
}

// Build the 432 incidents
function buildIncidents() {
  const rand = mulberry32(42);
  const incidents = [];
  let id = 1;

  // Per-service theme proportions (rough, modeled on the deck)
  const serviceThemeMix = {
    ertah: ["auth", "auth", "auth", "auth", "payment", "payment", "hidden", "notifications", "notifications", "uploads"],
    nsp: ["auth", "auth", "auth", "hidden", "hidden", "hidden", "payment", "notifications", "uploads", "roles"],
    muqeem: ["auth", "auth", "payment", "payment", "hidden", "notifications", "notifications", "uploads", "editing", "auth"],
    cargo: ["payment", "payment", "payment", "payment", "auth", "hidden", "uploads", "notifications", "roles", "payment"],
    pcs: ["auth", "payment", "hidden", "hidden", "notifications", "uploads", "roles", "auth", "payment", "hidden"],
    tms: ["payment", "auth", "hidden", "notifications", "uploads", "roles", "payment", "auth", "hidden", "notifications"],
    fasah: ["payment", "payment", "payment", "payment", "auth", "notifications", "hidden", "payment", "uploads", "payment"],
  };
  const defaultMix = ["auth", "payment", "hidden", "notifications", "uploads", "roles", "editing"];

  // Status distribution: ~62% resolved, ~22% in-progress, ~16% open
  const statusDist = { resolved: 0.62, "in-progress": 0.22, open: 0.16 };

  for (const [serviceName, count, serviceId] of SERVICES) {
    const mix = serviceThemeMix[serviceId] || defaultMix;
    for (let i = 0; i < count; i++) {
      const themeId = mix[Math.floor(rand() * mix.length)];
      const sev = pickWeighted(rand, SEVERITY_BY_THEME[themeId]);
      const status = pickWeighted(rand, statusDist);
      const templates = ISSUE_TEMPLATES[themeId] || ISSUE_TEMPLATES.hidden;
      const t = templates[Math.floor(rand() * templates.length)];

      // Date in April 2026
      const day = 1 + Math.floor(rand() * 30);
      const hour = Math.floor(rand() * 24);
      const min = Math.floor(rand() * 60);
      const created = new Date(2026, 3, day, hour, min);

      // First response time: 0-72h
      const frHours = Math.max(0.2, rand() * 60);
      const firstResponseAt = new Date(created.getTime() + frHours * 3600 * 1000);

      // Resolution time depending on severity
      let resolutionHours = null;
      let resolvedAt = null;
      if (status === "resolved") {
        const base = sev === "P1" ? 2 + rand() * 8 : sev === "P2" ? 8 + rand() * 30 : 24 + rand() * 120;
        resolutionHours = base;
        resolvedAt = new Date(created.getTime() + base * 3600 * 1000);
      }

      // SLA — tuned to a realistic distribution (~80% on-track, ~10% at-risk, ~10% breached)
      const slaFirstResponseHrs = 24;
      const slaResolutionHrs = sev === "P1" ? 4 : sev === "P2" ? 24 : 120;

      // Recompute first-response and resolution times so most are within SLA
      // ~85% within FR SLA
      const frWithinSla = rand() < 0.85;
      const frHoursReal = frWithinSla ? rand() * slaFirstResponseHrs * 0.8 : slaFirstResponseHrs + rand() * 24;
      const firstResponseAtReal = new Date(created.getTime() + frHoursReal * 3600 * 1000);

      // ~88% of resolved within resolution SLA
      let resolutionHrsReal = null;
      let resolvedAtReal = null;
      if (status === "resolved") {
        const resWithinSla = rand() < 0.88;
        resolutionHrsReal = resWithinSla
          ? slaResolutionHrs * (0.2 + rand() * 0.7)
          : slaResolutionHrs * (1.05 + rand() * 0.6);
        resolvedAtReal = new Date(created.getTime() + resolutionHrsReal * 3600 * 1000);
      }

      const breachedFR = frHoursReal > slaFirstResponseHrs;
      const breachedRes = status === "resolved" ? resolutionHrsReal > slaResolutionHrs : false;

      let slaStatus;
      if (status === "resolved") {
        slaStatus = breachedFR || breachedRes ? "breached" : "on-track";
      } else {
        // For open / in-progress: assign a realistic mix independent of age
        const r = rand();
        if (r < 0.12) slaStatus = "breached";
        else if (r < 0.25) slaStatus = "at-risk";
        else slaStatus = "on-track";
      }

      // Reporter — use placeholder names
      const reporters = ["محمد العتيبي", "سارة القحطاني", "عبدالله الغامدي", "نورا الزهراني", "فيصل الدوسري", "ريم الشمري", "خالد الحربي", "هند العنزي", "ياسر السبيعي", "لينا المطيري"];
      const assignees = ["فريق التصميم — A", "فريق التصميم — B", "فريق المنتج", "فريق الواجهة", "غير معيّن"];

      incidents.push({
        id: `UX-${String(id).padStart(4, "0")}`,
        serviceId,
        service: serviceName,
        themeId,
        themeAr: THEMES.find((t) => t[3] === themeId)?.[0] || "غير مصنّف",
        severity: sev,
        status,
        title: t.title,
        description: t.desc,
        reporter: reporters[Math.floor(rand() * reporters.length)],
        assignee: assignees[Math.floor(rand() * assignees.length)],
        usersAffected: Math.floor(rand() * (sev === "P1" ? 8000 : sev === "P2" ? 1500 : 200)) + (sev === "P1" ? 500 : 50),
        createdAt: created.toISOString(),
        firstResponseAt: firstResponseAtReal.toISOString(),
        resolvedAt: resolvedAtReal ? resolvedAtReal.toISOString() : null,
        firstResponseHrs: +frHoursReal.toFixed(1),
        resolutionHrs: resolutionHrsReal ? +resolutionHrsReal.toFixed(1) : null,
        slaStatus,
        slaFirstResponseHrs,
        slaResolutionHrs,
      });
      id++;
    }
  }
  // Sort newest first
  incidents.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return incidents;
}

// Monthly trends: last 6 months ending April 2026
const MONTHLY_TRENDS = [
  { month: "نوفمبر 2025", key: "2025-11", total: 287, auth: 79, payment: 52, hidden: 48, notifications: 41, uploads: 22, other: 45 },
  { month: "ديسمبر 2025", key: "2025-12", total: 312, auth: 92, payment: 61, hidden: 53, notifications: 44, uploads: 27, other: 35 },
  { month: "يناير 2026", key: "2026-01", total: 358, auth: 108, payment: 74, hidden: 60, notifications: 52, uploads: 28, other: 36 },
  { month: "فبراير 2026", key: "2026-02", total: 391, auth: 121, payment: 81, hidden: 68, notifications: 58, uploads: 31, other: 32 },
  { month: "مارس 2026", key: "2026-03", total: 408, auth: 128, payment: 86, hidden: 71, notifications: 64, uploads: 33, other: 26 },
  { month: "أبريل 2026", key: "2026-04", total: 432, auth: 136, payment: 91, hidden: 77, notifications: 72, uploads: 35, other: 21 },
];

window.DASHBOARD_DATA = {
  SERVICES,
  THEMES,
  TEAMS,
  MONTHLY_TRENDS,
  incidents: buildIncidents(),
  meta: {
    total: 432,
    month: "أبريل 2026",
    lastSync: "2026-05-01 08:14",
    source: "Google Sheets · UX Incidents Tracker",
  },
};
