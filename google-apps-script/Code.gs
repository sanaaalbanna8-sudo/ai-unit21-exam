/**
 * امتحان الوحدة 21 — حفظ النتائج والأخطاء
 * الجدول:
 * https://docs.google.com/spreadsheets/d/1gBsWwriMMq8yBeblF7UyilgzqK-eaJWqMSqYVw-wGnk/edit
 *
 * 1) افتحي الجدول → Extensions → Apps Script
 * 2) امسحي الكود الافتراضي والصقي هذا الملف كاملًا
 * 3) احفظي (Ctrl+S)
 * 4) Deploy → New deployment → نوع: Web app
 *    Execute as: Me
 *    Who has access: Anyone
 * 5) انسخي رابط /exec والصقيه في js/exam.js داخل SHEETS_ENDPOINT
 *
 * الصفحات التي تُنشأ داخل نفس الجدول:
 *   النتائج      = درجة كل طالب
 *   الأخطاء      = كل سؤال غلط أو بلا إجابة
 *   كل الإجابات  = كل سؤال مع إجابة الطالب والإجابة الصح
 */

var SHEET_ID = "1gBsWwriMMq8yBeblF7UyilgzqK-eaJWqMSqYVw-wGnk";

function doGet() {
  return jsonOut_({ ok: true, message: "unit 21 exam sheets ready" });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    var data = readPayload_(e);
    var ss = openBook_();
    var summary = ensureSheet_(ss, "النتائج", summaryHeaders_());
    var errors = ensureSheet_(ss, "الأخطاء", errorHeaders_());
    var all = ensureSheet_(ss, "كل الإجابات", answerHeaders_());

    summary.appendRow([
      data.timestamp || new Date().toISOString(),
      data.name || "",
      Number(data.score) || 0,
      Number(data.total) || 0,
      Number(data.percent) || 0,
      data.concepts || "",
      data.sectors || "",
      data.impact || "",
      data.factors || "",
      Number(data.mistakeCount) || 0,
      Number(data.skipped) || 0
    ]);

    var answers = asList_(data.answers);
    var mistakes = asList_(data.mistakes);
    if (!mistakes.length && answers.length) {
      mistakes = answers.filter(function (row) { return row.result !== "صح"; });
    }

    mistakes.forEach(function (m) {
      errors.appendRow(errorRow_(data, m));
    });
    answers.forEach(function (row) {
      all.appendRow(answerRow_(data, row));
    });

    return jsonOut_({ ok: true, mistakes: mistakes.length, answers: answers.length });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (ignore) {}
  }
}

function setupSheets() {
  var ss = openBook_();
  ensureSheet_(ss, "النتائج", summaryHeaders_());
  ensureSheet_(ss, "الأخطاء", errorHeaders_());
  ensureSheet_(ss, "كل الإجابات", answerHeaders_());
}

function openBook_() {
  var active = null;
  try { active = SpreadsheetApp.getActiveSpreadsheet(); } catch (err) {}
  if (active) return active;
  return SpreadsheetApp.openById(SHEET_ID);
}

function summaryHeaders_() {
  return [
    "التاريخ",
    "اسم الطالب",
    "الدرجة",
    "من",
    "النسبة %",
    "المفاهيم",
    "القطاعات",
    "الفوائد والمخاطر",
    "عوامل التنفيذ",
    "عدد الأخطاء",
    "بدون إجابة"
  ];
}

function errorHeaders_() {
  return [
    "التاريخ",
    "اسم الطالب",
    "رقم السؤال",
    "المعيار",
    "المحور",
    "الوسم",
    "السؤال",
    "إجابة الطالب",
    "الإجابة الصحيحة",
    "النتيجة",
    "السبب"
  ];
}

function answerHeaders_() {
  return errorHeaders_();
}

function errorRow_(data, m) {
  return [
    data.timestamp || new Date().toISOString(),
    data.name || "",
    m.id || "",
    m.grade || "",
    m.section || "",
    m.tag || "",
    m.ask || "",
    m.picked || "",
    m.correct || "",
    m.result || "غلط",
    m.why || ""
  ];
}

function answerRow_(data, row) {
  return errorRow_(data, row);
}

function ensureSheet_(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() < 1) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function asList_(value) {
  if (!value) return [];
  if (typeof value === "string") {
    try { value = JSON.parse(value); } catch (err) { return []; }
  }
  return Object.prototype.toString.call(value) === "[object Array]" ? value : [];
}

function readPayload_(e) {
  e = e || {};
  var raw = (e.postData && e.postData.contents) ? String(e.postData.contents) : "";
  var parsed = tryParse_(raw);
  if (parsed) return parsed;
  if (e.parameter && e.parameter.payload) {
    parsed = tryParse_(String(e.parameter.payload));
    if (parsed) return parsed;
  }
  if (e.parameter && (e.parameter.name || e.parameter.score)) return e.parameter;
  throw new Error("empty body");
}

function tryParse_(text) {
  if (!text) return null;
  try {
    var obj = JSON.parse(text);
    if (obj && typeof obj === "object") return obj;
  } catch (err) {}
  return null;
}

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
