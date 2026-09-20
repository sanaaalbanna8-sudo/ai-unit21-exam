/**
 * امتحان الوحدة 21 — استخدامات وتطبيقات الذكاء الاصطناعي
 *
 * 1) أنشئي جدول Google Sheets جديد (أو استخدمي جدول نتائجك).
 * 2) Extensions → Apps Script
 * 3) الصقي هذا الملف مكان Code.gs
 * 4) ضعي SHEET_ID من رابط الجدول:
 *    https://docs.google.com/spreadsheets/d/SHEET_ID/edit
 * 5) احفظي → Deploy → New deployment → Web app
 *    Execute as: Me
 *    Who has access: Anyone
 * 6) انسخي رابط /exec والصقيه في js/config.js → sheetsUrl
 */

var SHEET_ID = "14emiqybyM1w5wGNDxLkOGFyV6H_NEaann4x_rHkJdVc";

function doGet() {
  return ContentService.createTextOutput("OK");
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    var data = readPayload_(e);
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var kind = String(data.kind || "");
    if (kind === "ai-unit21") {
      writeExam_(ss, data, "امتحان AI الوحدة 21");
    } else {
      throw new Error("unknown kind: " + kind);
    }
    return jsonOut_({ ok: true, kind: kind });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}

function writeExam_(ss, data, prefix) {
  var sum = ensure_(ss, prefix + " - ملخص", [
    "الاسم", "الشعبة", "وقت البدء", "وقت التسليم",
    "المدة", "طريقة التسليم",
    "صحيحة", "خاطئة", "لم يجب",
    "الدرجات", "الدرجة الكاملة", "النسبة %",
    "درجة التصنيف", "كامل التصنيف",
    "درجة الفهم", "كامل الفهم",
    "الحكم", "موضوعات ضعيفة"
  ]);
  var det = ensure_(ss, prefix + " - تفاصيل", [
    "الاسم", "الشعبة", "وقت التسليم",
    "رقم", "النوع", "الموضوع", "السؤال",
    "اجابة الطالب", "الصحيح", "النتيجة", "درجة", "كامل", "تفسير"
  ]);
  var err = ensure_(ss, prefix + " - الاخطاء", [
    "الاسم", "الشعبة", "وقت التسليم",
    "رقم", "النوع", "الموضوع", "السؤال",
    "اجابة الطالب", "الصحيح", "النتيجة", "تفسير"
  ]);
  var cls = ensure_(ss, prefix + " - التصنيف", [
    "الاسم", "الشعبة", "وقت التسليم",
    "البند", "اختيار الطالب", "الصحيح", "النتيجة", "درجة"
  ]);

  sum.appendRow([
    data.name || "",
    data.klass || "",
    data.startedAt || "",
    data.finishedAt || data.when || "",
    data.durationText || data.durationClock || "",
    data.submitType || "",
    data.correct || 0,
    data.wrong || 0,
    data.skipped || 0,
    data.points || 0,
    data.maxPoints || 0,
    data.percent || 0,
    data.pointsPart1 || 0,
    data.maxPart1 || 0,
    data.pointsPart2 || 0,
    data.maxPart2 || 0,
    data.band || "",
    data.weakTopics || ""
  ]);

  var details = data.details || [];
  for (var i = 0; i < details.length; i++) {
    var r = details[i];
    var result = r.result || "";
    det.appendRow([
      data.name || "",
      data.klass || "",
      data.finishedAt || data.when || "",
      r.num || (i + 1),
      r.typeAr || r.type || "",
      r.topic || "",
      r.prompt || "",
      r.chosen || "",
      r.correctText || "",
      result,
      r.earned != null ? r.earned : 0,
      r.points || 0,
      r.explain || ""
    ]);
    if (result === "خطأ" || result === "لم يجب") {
      err.appendRow([
        data.name || "",
        data.klass || "",
        data.finishedAt || data.when || "",
        r.num || (i + 1),
        r.typeAr || r.type || "",
        r.topic || "",
        r.prompt || "",
        r.chosen || "",
        r.correctText || "",
        result,
        r.explain || ""
      ]);
    }
  }

  var classify = data.classifyDetails || [];
  for (var j = 0; j < classify.length; j++) {
    var c = classify[j];
    var title = String(c.prompt || "").replace("صنّف: ", "");
    cls.appendRow([
      data.name || "",
      data.klass || "",
      data.finishedAt || data.when || "",
      title,
      c.chosen || "",
      c.correctText || "",
      c.result || "",
      c.earned != null ? c.earned : 0
    ]);
  }
}

function ensure_(ss, name, headers) {
  var sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() < 1) {
    sh.appendRow(headers);
    sh.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    sh.setFrozenRows(1);
  }
  return sh;
}

function firstText_(v) {
  if (v == null) return "";
  if (Object.prototype.toString.call(v) === "[object Array]") {
    v = v.length ? v[0] : "";
  }
  return String(v);
}

function tryParseJson_(text) {
  if (!text) return null;
  try {
    var obj = JSON.parse(text);
    if (obj && typeof obj === "object") return obj;
  } catch (err) {}
  return null;
}

function readPayload_(e) {
  e = e || {};
  var p = e.parameter || {};
  var ps = e.parameters || {};
  var raw = (e.postData && e.postData.contents) ? String(e.postData.contents) : "";
  var list = [p.payload, p.data, ps.payload, ps.data, raw];
  for (var i = 0; i < list.length; i++) {
    var text = firstText_(list[i]);
    if (!text) continue;
    var obj = tryParseJson_(text);
    if (obj) return obj;
    if (text.indexOf("payload=") >= 0 || text.indexOf("data=") >= 0) {
      var parts = text.split("&");
      for (var k = 0; k < parts.length; k++) {
        var eq = parts[k].indexOf("=");
        if (eq < 0) continue;
        var key = parts[k].substring(0, eq);
        var val = parts[k].substring(eq + 1);
        try { key = decodeURIComponent(key.replace(/\+/g, " ")); } catch (e1) {}
        if (key !== "payload" && key !== "data") continue;
        try { val = decodeURIComponent(val.replace(/\+/g, " ")); } catch (e2) {}
        obj = tryParseJson_(val);
        if (obj) return obj;
      }
    }
  }
  throw new Error("empty body");
}

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
