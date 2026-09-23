(() => {
  function icon(parts) {
    return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${parts}</svg>`;
  }

  function banner(bg, blob, title, caption, glyph) {
    return `<div class="art-row" style="background:${bg}">
      <div class="art-glyph" style="background:${blob}">${icon(glyph)}</div>
      <div>
        <strong>${title}</strong>
        <span>${caption}</span>
      </div>
    </div>`;
  }

  const glyphs = {
    assistant: `<rect x="18" y="16" width="56" height="44" rx="16" fill="#12324a"/><circle cx="36" cy="36" r="5" fill="#5dffc2"/><circle cx="56" cy="36" r="5" fill="#5dffc2"/><rect x="34" y="50" width="24" height="4" rx="2" fill="#fff"/><rect x="40" y="6" width="12" height="12" rx="4" fill="#14b8a6"/>`,
    compare: `<rect x="8" y="18" width="34" height="52" rx="8" fill="#12324a"/><rect x="50" y="18" width="34" height="52" rx="8" fill="#0f766e"/><rect x="14" y="28" width="22" height="4" rx="2" fill="#fff"/><rect x="56" y="28" width="22" height="4" rx="2" fill="#d1fae5"/>`,
    brain: `<circle cx="46" cy="42" r="26" fill="#12324a"/><circle cx="34" cy="36" r="6" fill="#5eead4"/><circle cx="54" cy="32" r="5" fill="#fbbf24"/><circle cx="52" cy="50" r="5" fill="#fb7185"/><path d="M28 42 H64 M40 24 V60 M34 36 L54 50" stroke="#fff" stroke-width="2"/>`,
    chess: `<path d="M46 14 l10 16 h-8 l8 10 h-22 l8-10 h-8 z" fill="#12324a"/><rect x="28" y="62" width="36" height="8" rx="3" fill="#0f766e"/>`,
    chat: `<rect x="8" y="16" width="52" height="34" rx="12" fill="#12324a"/><rect x="28" y="40" width="48" height="30" rx="12" fill="#0f766e"/><circle cx="24" cy="32" r="3" fill="#fff"/><circle cx="34" cy="32" r="3" fill="#fff"/><circle cx="44" cy="32" r="3" fill="#fff"/>`,
    layers: `<rect x="16" y="14" width="60" height="16" rx="6" fill="#12324a"/><rect x="16" y="36" width="60" height="16" rx="6" fill="#0f766e"/><rect x="16" y="58" width="60" height="16" rx="6" fill="#c9842a"/>`,
    eye: `<ellipse cx="46" cy="44" rx="30" ry="16" fill="#12324a"/><circle cx="46" cy="44" r="9" fill="#5eead4"/><circle cx="46" cy="44" r="4" fill="#12324a"/>`,
    ambulance: `<rect x="10" y="36" width="72" height="28" rx="8" fill="#12324a"/><rect x="58" y="28" width="18" height="14" rx="3" fill="#0f766e"/><rect x="30" y="44" width="16" height="4" fill="#fff"/><rect x="36" y="38" width="4" height="16" fill="#fff"/><circle cx="26" cy="68" r="6" fill="#16324f"/><circle cx="62" cy="68" r="6" fill="#16324f"/>`,
    weather: `<circle cx="34" cy="36" r="14" fill="#fbbf24"/><ellipse cx="54" cy="48" rx="24" ry="14" fill="#fff"/><ellipse cx="38" cy="50" rx="16" ry="12" fill="#e0f2fe"/>`,
    card: `<rect x="12" y="24" width="68" height="44" rx="8" fill="#12324a"/><rect x="12" y="34" width="68" height="10" fill="#0f766e"/><rect x="22" y="52" width="24" height="6" rx="2" fill="#fbbf24"/>`,
    shop: `<path d="M18 36 h56 l-6 32 h-44 z" fill="#0f766e"/><path d="M24 36c0-12 10-20 22-20s22 8 22 20" fill="none" stroke="#12324a" stroke-width="4"/>`,
    route: `<circle cx="24" cy="58" r="8" fill="#0f766e"/><circle cx="70" cy="28" r="8" fill="#c9842a"/><path d="M24 58 C40 58 48 28 70 28" fill="none" stroke="#12324a" stroke-width="4"/>`,
    hospital: `<rect x="28" y="16" width="36" height="60" rx="8" fill="#fff" stroke="#0f766e" stroke-width="4"/><rect x="42" y="28" width="8" height="28" fill="#d64545"/><rect x="32" y="38" width="28" height="8" fill="#d64545"/>`,
    school: `<path d="M10 48 L46 28 L82 48 L46 68 Z" fill="#12324a"/><rect x="28" y="52" width="36" height="22" fill="#0f766e"/>`,
    robot: `<rect x="22" y="22" width="48" height="40" rx="10" fill="#12324a"/><rect x="8" y="34" width="14" height="10" rx="4" fill="#0f766e"/><rect x="70" y="34" width="14" height="10" rx="4" fill="#0f766e"/><circle cx="38" cy="40" r="4" fill="#5eead4"/><circle cx="54" cy="40" r="4" fill="#5eead4"/>`,
    scales: `<rect x="44" y="18" width="4" height="48" fill="#12324a"/><rect x="22" y="62" width="48" height="6" rx="2" fill="#0f766e"/><path d="M18 28 H74" stroke="#12324a" stroke-width="4"/><path d="M22 28 L14 48 H34 Z" fill="#fbbf24"/><path d="M70 28 L62 48 H82 Z" fill="#5eead4"/>`,
    pipeline: `<circle cx="14" cy="44" r="8" fill="#12324a"/><circle cx="34" cy="44" r="8" fill="#0f766e"/><circle cx="54" cy="44" r="8" fill="#c9842a"/><circle cx="74" cy="44" r="8" fill="#d64545"/><path d="M22 44 H26 M42 44 H46 M62 44 H66" stroke="#16324f" stroke-width="3"/>`,
    people: `<circle cx="24" cy="28" r="8" fill="#12324a"/><circle cx="46" cy="24" r="9" fill="#0f766e"/><circle cx="68" cy="28" r="8" fill="#c9842a"/><rect x="12" y="40" width="24" height="26" rx="8" fill="#12324a"/><rect x="34" y="38" width="24" height="28" rx="8" fill="#0f766e"/><rect x="56" y="40" width="24" height="26" rx="8" fill="#c9842a"/>`,
    xai: `<circle cx="40" cy="40" r="18" fill="none" stroke="#12324a" stroke-width="6"/><path d="M54 54 L74 74" stroke="#0f766e" stroke-width="6" stroke-linecap="round"/><rect x="30" y="32" width="20" height="4" fill="#12324a"/>`,
    report: `<rect x="24" y="12" width="44" height="64" rx="6" fill="#fff" stroke="#12324a" stroke-width="4"/><rect x="32" y="26" width="28" height="4" fill="#0f766e"/><rect x="32" y="36" width="28" height="4" fill="#d6dee8"/><rect x="32" y="46" width="20" height="4" fill="#d6dee8"/>`,
    media: `<rect x="14" y="22" width="64" height="44" rx="10" fill="#12324a"/><path d="M42 34 L62 44 L42 54 Z" fill="#5eead4"/>`,
    factory: `<rect x="12" y="40" width="68" height="28" fill="#12324a"/><rect x="22" y="22" width="12" height="20" fill="#0f766e"/><rect x="40" y="16" width="12" height="26" fill="#c9842a"/><circle cx="30" cy="54" r="4" fill="#fbbf24"/>`,
    lock: `<rect x="24" y="40" width="44" height="32" rx="6" fill="#12324a"/><path d="M34 40 V30 a12 12 0 0 1 24 0 V40" fill="none" stroke="#0f766e" stroke-width="4"/><circle cx="46" cy="54" r="4" fill="#fbbf24"/>`,
    warning: `<path d="M46 12 L82 74 H10 Z" fill="#fbbf24"/><rect x="42" y="32" width="8" height="22" rx="2" fill="#12324a"/><circle cx="46" cy="62" r="4" fill="#12324a"/>`
  };

  const banners = {
    assistant: ["#e7f6f3", "#d1fae5", "مساعد في البيت", "سؤال واحد، مهمة واحدة", glyphs.assistant],
    compare: ["#eef2ff", "#e0e7ff", "تقليدي مقابل ذكي", "قواعد جاهزة أم تعلم من البيانات؟", glyphs.compare],
    brain: ["#f3e8ff", "#ede9fe", "ليش نستخدمه؟", "ابتكار، سرعة، وخدمة أحسن", glyphs.brain],
    chess: ["#f8efe4", "#fde68a", "ديب بلو", "أفضل حركة الآن، بلا ذاكرة", glyphs.chess],
    chat: ["#e7f6f3", "#ccfbf1", "شات بوت", "يتذكر السؤال السابق فقط", glyphs.chat],
    layers: ["#f8efe4", "#ffedd5", "من الأكبر للأصغر", "AI ثم ML ثم Deep learning", glyphs.layers],
    eye: ["#e0f2fe", "#dbeafe", "يشوف الصورة", "وجه، نبات، أو لوحة سيارة", glyphs.eye],
    ambulance: ["#fdecec", "#fecaca", "اتصال الإسعاف", "قواعد أطباء، مش وعي بشري", glyphs.ambulance],
    weather: ["#e0f2fe", "#dbeafe", "التنبؤ", "من أنماط الأمس لحدث بكرة", glyphs.weather],
    card: ["#fdecec", "#fecaca", "عملية غريبة", "عمّان ولندن في نفس الدقيقة", glyphs.card],
    shop: ["#e7f6f3", "#d1fae5", "متجر", "توصية، مخزون، وشات بوت", glyphs.shop],
    route: ["#f8efe4", "#ffedd5", "أقصر طريق", "طرود، زحمة، ووقود", glyphs.route],
    hospital: ["#fdecec", "#fecaca", "مستشفى", "تشخيص، فرز، ومراقبة", glyphs.hospital],
    school: ["#eef2ff", "#e0e7ff", "تعليم", "كل طالب بمسار مختلف", glyphs.school],
    robot: ["#e7f6f3", "#ccfbf1", "بدل الخطر", "الروبوت يدخل حيث الإنسان لا يدخل", glyphs.robot],
    scales: ["#f8efe4", "#fde68a", "ميزان الأثر", "فائدة من جهة، وخطر من جهة", glyphs.scales],
    pipeline: ["#e7f6f3", "#d1fae5", "مسار من خمس خطوات", "من هدف واضح إلى نشر مراقب", glyphs.pipeline],
    people: ["#eef2ff", "#e0e7ff", "هل المؤسسة جاهزة؟", "تجارة، ناس، وتقنية", glyphs.people],
    xai: ["#f3e8ff", "#ede9fe", "ليش هالقرار؟", "الشفافية قبل الثقة", glyphs.xai],
    report: ["#f8efe4", "#ffedd5", "مقارنة أثر", "فائدة من جهة وخطر من جهة", glyphs.report],
    media: ["#fdecec", "#fecaca", "اقتراح المشاهدة", "ذوقك يصير بيانات", glyphs.media],
    factory: ["#e7f6f3", "#d1fae5", "خط الإنتاج", "تكرار ثابت بلا تعب", glyphs.factory],
    lock: ["#e0f2fe", "#dbeafe", "بيانات الناس", "خصوصية قبل التدريب", glyphs.lock],
    warning: ["#fff7ed", "#ffedd5", "توقف هنا", "مش كل مشكلة تحتاج ذكاء اصطناعي", glyphs.warning]
  };

  window.ART = {
    banner(key) {
      const row = banners[key] || banners.assistant;
      return banner(row[0], row[1], row[2], row[3], row[4]);
    },
    icon(key) {
      return icon(glyphs[key] || glyphs.assistant);
    }
  };
})();
