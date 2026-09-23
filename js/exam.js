(() => {
  const SHEETS_ENDPOINT = "https://script.google.com/macros/s/AKfycby-_IPkSyPK10Pcg8H9vwFYb3MxjcHjezmxF2K10bSgxp21PFGVELmDzWL3MqNAVVyM/exec";

  const intro = document.getElementById("intro");
  const quiz = document.getElementById("quiz");
  const result = document.getElementById("result");
  const nameInput = document.getElementById("student-name");
  const nameField = document.getElementById("name-field");
  const nameHint = document.getElementById("name-hint");
  const qCount = document.getElementById("q-count");
  const examBar = document.getElementById("exam-bar");
  const qTag = document.getElementById("q-tag");
  const qTitle = document.getElementById("q-title");
  const qScene = document.getElementById("q-scene");
  const qArt = document.getElementById("q-art");
  const qChoices = document.getElementById("q-choices");
  const qFeedback = document.getElementById("q-feedback");
  const qPrev = document.getElementById("q-prev");
  const qNext = document.getElementById("q-next");
  const steps = document.getElementById("steps");
  const saveStatus = document.getElementById("save-status");

  let deck = [];
  let i = 0;
  let studentName = "";

  const sections = Object.keys(window.SECTION_LABELS);

  function labelOf(choice) {
    return typeof choice === "string" ? choice : choice.text;
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let n = a.length - 1; n > 0; n--) {
      const j = Math.floor(Math.random() * (n + 1));
      [a[n], a[j]] = [a[j], a[n]];
    }
    return a;
  }

  function mapQ(q) {
    if (q.type === "tf") return { ...q, pick: null };
    const indexed = q.choices.map((choice, idx) => ({ choice, idx }));
    const shuffled = shuffle(indexed);
    return {
      ...q,
      choices: shuffled.map((c) => c.choice),
      answer: shuffled.findIndex((c) => c.idx === q.answer),
      pick: null
    };
  }

  function show(el) {
    [intro, quiz, result].forEach((n) => { n.hidden = true; });
    el.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderSteps(current) {
    steps.innerHTML = "";
    sections.forEach((key) => {
      const span = document.createElement("span");
      span.textContent = window.SECTION_LABELS[key];
      if (key === current) span.className = "on";
      steps.appendChild(span);
    });
  }

  function renderQuiz() {
    const q = deck[i];
    const locked = q.pick !== null;
    const ok = locked && q.pick === q.answer;
    qCount.textContent = `${i + 1} / ${deck.length}`;
    examBar.style.width = `${((i + 1) / deck.length) * 100}%`;
    renderSteps(q.section);
    qTag.textContent = q.tag;
    qTitle.textContent = q.ask;
    qScene.textContent = q.scene;
    qArt.innerHTML = window.ART.banner(q.art);
    qChoices.className = "choices" + (q.type === "tf" ? " tf" : "") + (q.type === "cards" ? " cards" : "");
    qChoices.innerHTML = "";

    q.choices.forEach((choice, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      let cls = "choice";
      let badge = "";
      if (locked) {
        if (idx === q.answer) {
          cls += " is-correct";
          badge = "الصح";
        }
        if (idx === q.pick && idx !== q.answer) {
          cls += " is-wrong";
          badge = "غلط";
        }
      }
      btn.className = cls;
      btn.disabled = locked;
      if (q.type === "cards") {
        const fig = document.createElement("figure");
        fig.innerHTML = window.ART.icon(choice.art);
        btn.appendChild(fig);
      }
      const text = document.createElement("span");
      text.textContent = labelOf(choice);
      btn.appendChild(text);
      if (badge) {
        const mark = document.createElement("span");
        mark.className = "badge";
        mark.textContent = badge;
        btn.appendChild(mark);
      }
      btn.addEventListener("click", () => {
        if (q.pick !== null) return;
        q.pick = idx;
        renderQuiz();
        qFeedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
      qChoices.appendChild(btn);
    });

    if (locked) {
      const correct = labelOf(q.choices[q.answer]);
      const skipped = q.pick < 0;
      const yours = skipped ? "بدون إجابة" : labelOf(q.choices[q.pick]);
      qFeedback.hidden = false;
      qFeedback.className = "feedback " + (ok ? "ok" : "bad");
      qFeedback.innerHTML = ok
        ? `<strong>صح.</strong> ${q.why}`
        : skipped
          ? `<strong>غلط.</strong> ما اخترت إجابة، فانحسبت غلط.<div class="right-line">الصح: ${correct}</div><p>${q.why}</p>`
          : `<strong>غلط.</strong> اختيارك: ${yours}<div class="right-line">الصح: ${correct}</div><p>${q.why}</p>`;
    } else {
      qFeedback.hidden = true;
      qFeedback.innerHTML = "";
    }

    qPrev.disabled = i === 0;
    qNext.textContent = i === deck.length - 1 ? "إنهاء ومراجعة الأخطاء" : "التالي";
  }

  function statsBy(all, keyName) {
    const map = {};
    all.forEach((q) => {
      const key = q[keyName];
      if (!map[key]) map[key] = { ok: 0, total: 0 };
      map[key].total += 1;
      if (q.pick === q.answer) map[key].ok += 1;
    });
    return map;
  }

  function reviewItem(q, n) {
    const ok = q.pick === q.answer;
    const item = document.createElement("article");
    item.className = "item " + (ok ? "ok" : "bad");
    const yours = q.pick === null || q.pick < 0 ? "بدون إجابة" : labelOf(q.choices[q.pick]);
    const correct = labelOf(q.choices[q.answer]);
    item.innerHTML = `
      <h3>${n}. ${q.tag}</h3>
      <p>${q.ask}</p>
      <p>إجابتك: <b class="${ok ? "good" : "badw"}">${yours}</b></p>
      <p>الصح: <b class="good">${correct}</b></p>
      <p>${q.why}</p>
    `;
    return item;
  }

  function fillReview(all) {
    const mistakes = document.getElementById("mistake-list");
    const full = document.getElementById("review-list");
    mistakes.innerHTML = "";
    full.innerHTML = "";
    const wrong = all.filter((q) => q.pick !== q.answer);
    if (!wrong.length) {
      const item = document.createElement("article");
      item.className = "item ok";
      item.innerHTML = "<h3>ما في أخطاء</h3><p>المفاهيم والأمثلة والقطاعات واضحة.</p>";
      mistakes.appendChild(item);
    } else {
      wrong.forEach((q) => mistakes.appendChild(reviewItem(q, q.id)));
    }
    all.forEach((q, n) => full.appendChild(reviewItem(q, n + 1)));
  }

  function requireName() {
    const name = nameInput.value.trim();
    if (name.length < 2) {
      nameField.classList.add("is-invalid");
      nameHint.textContent = "اكتب الاسم الثلاثي قبل البدء";
      nameInput.focus();
      return null;
    }
    nameField.classList.remove("is-invalid");
    nameHint.textContent = "الاسم إجباري حتى تنحفظ الأخطاء لاحقًا في الجدول";
    return name;
  }

  function setSaveStatus(kind, text) {
    saveStatus.hidden = false;
    saveStatus.className = "save " + kind;
    saveStatus.textContent = text;
  }

  function frac(map, key) {
    const s = map[key] || { ok: 0, total: 0 };
    return `${s.ok}/${s.total}`;
  }

  function submitToSheet(payload) {
    if (!SHEETS_ENDPOINT) {
      setSaveStatus("wait", "الدرجة وتفاصيل الأخطاء ظاهرة هنا. حفظ الجدول يتفعل بعد ربط Apps Script.");
      return;
    }
    setSaveStatus("wait", "جاري حفظ الدرجة وتفاصيل الأخطاء…");
    fetch(SHEETS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    })
      .then(() => setSaveStatus("ok", "تم حفظ الدرجة وتفاصيل الأخطاء في الجدول."))
      .catch(() => setSaveStatus("bad", "تعذّر الحفظ. الدرجة ظاهرة هنا، وتحققي من رابط الجدول والاتصال."));
  }

  function finishAll() {
    const score = deck.filter((q) => q.pick === q.answer).length;
    const total = deck.length;
    const pct = Math.round((score / total) * 100);
    const name = studentName || nameInput.value.trim();
    document.getElementById("final-score").textContent = `${score}/${total}`;
    document.getElementById("score-ring").style.setProperty("--p", `${pct}%`);

    let title = "راجع النقاط الضعيفة";
    let msg = "ركّز على المحاور اللي نزلت فيها: الأنواع، القطاعات، أو الفوائد والمخاطر.";
    if (pct >= 90) {
      title = "فهمك واضح";
      msg = "ميّزت المفاهيم والأمثلة والفوائد والمخاطر.";
    } else if (pct >= 75) {
      title = "أساس جيد مع فجوات صغيرة";
      msg = "راجع الأسئلة الغلط في القائمة تحت.";
    } else if (pct >= 50) {
      title = "ثبّت المصطلح والأمثلة";
      msg = "راجع الأنواع، وأمثلة القطاعات، والفرق بين الفائدة والخطر.";
    }
    document.getElementById("result-title").textContent = title;
    const resultMsg = document.getElementById("result-msg");
    const who = name ? `${name}: ` : "";
    resultMsg.replaceChildren();
    resultMsg.append(document.createTextNode(`${who}${msg} النتيجة `));
    const pctNode = document.createElement("bdi");
    pctNode.textContent = `${pct}٪`;
    resultMsg.append(pctNode, document.createTextNode("."));

    const bySection = statsBy(deck, "section");
    const box = document.getElementById("breakdown");
    box.innerHTML = "";
    Object.keys(window.SECTION_LABELS).forEach((key) => {
      const s = bySection[key];
      if (!s) return;
      const card = document.createElement("article");
      card.className = "stat";
      const ready = s.ok / s.total >= 0.75 ? "جاهز" : "يحتاج مراجعة";
      card.innerHTML = `<h3>${window.SECTION_LABELS[key]}</h3><p>${s.ok}/${s.total}</p><small>${ready}</small>`;
      box.appendChild(card);
    });

    fillReview(deck);
    show(result);

    const answers = deck.map((q) => {
      const skipped = q.pick === null || q.pick < 0;
      const ok = q.pick === q.answer;
      return {
        id: q.id,
        section: window.SECTION_LABELS[q.section],
        grade: q.grade,
        tag: q.tag,
        ask: q.ask,
        picked: skipped ? "بدون إجابة" : labelOf(q.choices[q.pick]),
        correct: labelOf(q.choices[q.answer]),
        result: ok ? "صح" : "غلط",
        why: q.why
      };
    });
    const mistakes = answers.filter((row) => row.result !== "صح");

    submitToSheet({
      timestamp: new Date().toLocaleString("ar-JO", { hour12: false }),
      name,
      score,
      total,
      percent: pct,
      concepts: frac(bySection, "concepts"),
      sectors: frac(bySection, "sectors"),
      impact: frac(bySection, "impact"),
      factors: frac(bySection, "factors"),
      mistakeCount: mistakes.length,
      skipped: answers.filter((row) => row.picked === "بدون إجابة").length,
      mistakes,
      answers
    });
  }

  function startExam() {
    const name = requireName();
    if (!name) return;
    studentName = name;
    deck = window.QUESTION_BANK.map(mapQ);
    i = 0;
    saveStatus.hidden = true;
    show(quiz);
    renderQuiz();
  }

  const meta = document.getElementById("intro-meta");
  const counts = statsBy(window.QUESTION_BANK.map((q) => ({ ...q, pick: null, answer: -1 })), "section");
  sections.forEach((key) => {
    const li = document.createElement("li");
    li.textContent = `${window.SECTION_LABELS[key]}: ${counts[key].total} سؤال`;
    meta.appendChild(li);
  });
  const totalLi = document.createElement("li");
  totalLi.textContent = `${window.QUESTION_BANK.length} سؤالًا · الغلط والصح يظهران فور الضغط`;
  meta.appendChild(totalLi);

  document.getElementById("start-exam").addEventListener("click", startExam);
  nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") startExam();
  });
  nameInput.addEventListener("input", () => {
    if (nameInput.value.trim().length >= 2) nameField.classList.remove("is-invalid");
  });
  qPrev.addEventListener("click", () => {
    if (i > 0) {
      i -= 1;
      renderQuiz();
    }
  });
  qNext.addEventListener("click", () => {
    if (deck[i].pick === null) {
      deck[i].pick = -1;
      renderQuiz();
      qFeedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }
    if (i < deck.length - 1) {
      i += 1;
      renderQuiz();
      return;
    }
    finishAll();
  });
  document.getElementById("retry-btn").addEventListener("click", () => show(intro));
})();
