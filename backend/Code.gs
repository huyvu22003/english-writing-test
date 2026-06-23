/**
 * ============================================================================
 *  BACKEND — Google Apps Script (NGUỒN CHUẨN của repo)
 * ============================================================================
 *  Đây là bản code ĐANG CHẠY trên Google Apps Script (gắn với Google Sheet
 *  "app test-writing"). File này là NGUỒN CHUẨN duy nhất cho backend.
 *
 *  ⚠️ QUY TRÌNH BẮT BUỘC (để repo không lệch với thực tế — xem docs/CONTRIBUTING.md):
 *    1. Sửa backend -> sửa Ở ĐÂY trước, commit vào repo.
 *    2. Mở Google Sheet -> Tiện ích mở rộng -> Apps Script -> dán đè toàn bộ file này.
 *    3. Triển khai -> Quản lý bản triển khai -> ✏️ -> Phiên bản: Mới -> Triển khai.
 *    (URL endpoint giữ nguyên; KHÔNG cần đổi CONFIG.ENDPOINT trong src/index.html)
 *
 *  Cập nhật lần cuối: 2026-06-23 — thêm trắc nghiệm Reading/Listening (action=quiz, action=grade).
 *
 *  ⚠️ GHI CHÚ KỸ THUẬT: hàm getPrompt() dưới đây dùng biến `RANDOM_PROMPT`.
 *     Biến này KHÔNG khai báo trong file này — nếu phần Viết báo lỗi
 *     "RANDOM_PROMPT is not defined", hãy thay bằng logic dùng `PROMPT_MODE`
 *     (hoặc thêm `const RANDOM_PROMPT = (PROMPT_MODE === "random");` ngay dưới PROMPT_MODE).
 * ============================================================================
 */

// ===== CẤU HÌNH =====
const TEACHER_EMAIL = "ieltsmstramy@gmail.com"; // email nhận bài
const RESULTS_SHEET = "BaiNop";               // tab chứa bài nộp
const IGNORE_SHEETS = ["BaiNop", "BaiNop-RL", "Config"];   // tab KHÔNG phải chủ đề
// "sequential" = xoay vòng (tránh trùng, khuyến nghị) | "random" = ngẫu nhiên | "first" = cả lớp 1 đề
const PROMPT_MODE = "sequential";

// ---- Trả danh sách chủ đề / đề bài / kiểm tra email (JSONP) ----
function doGet(e) {
  const cb = e.parameter.callback || "callback";
  const action = e.parameter.action;
  let out;

  if (action === "topics") {
    out = { topics: getTopicNames() };
  } else if (action === "prompt") {
    out = { prompt: getPrompt(e.parameter.topic) };
  } else if (action === "check") {
    out = { submitted: isEmailSubmitted(e.parameter.email) };
  } else if (action === "quiz") {
    out = getQuiz(e.parameter.topic);
  } else if (action === "grade") {
    out = gradeQuiz(e.parameter);
  } else {
    out = { error: "unknown action" };
  }

  const js = cb + "(" + JSON.stringify(out) + ");";
  return ContentService.createTextOutput(js)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function getTopicNames() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheets()
    .map(function (s) { return s.getName(); })
    .filter(function (n) { return IGNORE_SHEETS.indexOf(n) === -1; });
}

function getPrompt(topic) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(topic);
  if (!sheet) return "(Không tìm thấy chủ đề: " + topic + ")";
  const last = sheet.getLastRow();
  if (last < 2) return "(Chủ đề chưa có đề bài)";
  const values = sheet.getRange(2, 1, last - 1, 1).getValues()
    .map(function (r) { return String(r[0]).trim(); })
    .filter(function (v) { return v; });
  if (!values.length) return "(Chủ đề chưa có đề bài)";
  return RANDOM_PROMPT
    ? values[Math.floor(Math.random() * values.length)]
    : values[0];
}

function isEmailSubmitted(email) {
  if (!email) return false;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(RESULTS_SHEET);
  if (!sheet) return false;
  const last = sheet.getLastRow();
  if (last < 2) return false;
  const target = String(email).trim().toLowerCase();
  const emails = sheet.getRange(2, 3, last - 1, 1).getValues();
  return emails.some(function (r) {
    return String(r[0]).trim().toLowerCase() === target;
  });
}

// ---- Nhận bài nộp (phần VIẾT) ----
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(RESULTS_SHEET);
    if (!sheet) {
      sheet = ss.insertSheet(RESULTS_SHEET);
      sheet.appendRow(["Thời điểm nộp","Họ tên","Email","Chủ đề","Số từ","Số vi phạm","Đề bài","Bài viết","Nhật ký"]);
    }

    sheet.appendRow([
      data.submittedAt || new Date().toLocaleString(),
      data.name || "",
      data.email || "",
      data.topic || "",
      data.wordCount || 0,
      data.violations || 0,
      data.prompt || "",
      data.essay || "",
      data.log || "",
    ]);

    const warn = (data.violations > 0)
      ? "\n⚠️ CẢNH BÁO: học sinh có " + data.violations + " lần rời màn hình!\n"
      : "\n✅ Không phát hiện vi phạm.\n";

    const body =
      "Bài viết mới từ: " + data.name + " (" + data.email + ")\n" +
      "Chủ đề: " + data.topic + "\n" +
      "Số từ: " + data.wordCount + " | Nộp lúc: " + data.submittedAt + "\n" +
      warn +
      "\n----- ĐỀ BÀI -----\n" + data.prompt + "\n" +
      "\n----- BÀI VIẾT -----\n" + data.essay + "\n" +
      "\n----- NHẬT KÝ -----\n" + data.log + "\n";

    MailApp.sendEmail({
      to: TEACHER_EMAIL,
      subject: "[" + data.topic + "] " + data.name + " — " + data.violations + " vi phạm",
      body: body,
      replyTo: data.email,
    });

    return ContentService.createTextOutput("OK");
  } catch (err) {
    return ContentService.createTextOutput("ERROR: " + err.message);
  }
}

// ---- Chạy 1 lần để tạo 10 tab chủ đề + tab BaiNop ----
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const SAMPLE = {
    "topic-1": ["Write about the most memorable trip you have ever had (120-180 words)."],
    "topic-2": ["Describe a hobby you enjoy and explain why it is important to you (120-180 words)."],
    "topic-3": ["Write about a person who has influenced your life (120-180 words)."],
    "topic-4": ["Describe your favourite place in your hometown and why you like it (120-180 words)."],
    "topic-5": ["Do you think technology makes our lives better or worse? Give your opinion (120-180 words)."],
    "topic-6": ["Write about your plans and dreams for the future (120-180 words)."],
    "topic-7": ["Describe a book or film that you really enjoyed (120-180 words)."],
    "topic-8": ["What does a healthy lifestyle mean to you? (120-180 words)."],
    "topic-9": ["Write about an important event in your life and what you learned from it (120-180 words)."],
    "topic-10": ["Should students wear school uniforms? Give your opinion (120-180 words)."],
  };

  Object.keys(SAMPLE).forEach(function (name) {
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    sh.clear();
    sh.getRange(1, 1).setValue("Đề bài").setFontWeight("bold");
    SAMPLE[name].forEach(function (p, i) { sh.getRange(i + 2, 1).setValue(p); });
    sh.setColumnWidth(1, 600);
  });

  let res = ss.getSheetByName("BaiNop");
  if (!res) res = ss.insertSheet("BaiNop");
  if (res.getLastRow() === 0) {
    res.appendRow(["Thời điểm nộp","Họ tên","Email","Chủ đề","Số từ","Số vi phạm","Đề bài","Bài viết","Nhật ký"]);
    res.getRange(1, 1, 1, 9).setFontWeight("bold");
  }

  ["Trang tính1", "Sheet1"].forEach(function (n) {
    const s = ss.getSheetByName(n);
    if (s && s.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(s);
  });

    Logger.log("Đã tạo xong 10 chủ đề + tab BaiNop!");
}

// ===== TRẮC NGHIỆM READING/LISTENING =====
const RL_RESULT_SHEET = "BaiNop-RL";   // tab lưu kết quả trắc nghiệm

// Bảng quy đổi raw(/40) -> band IELTS Academic (xếp giảm dần [điểm tối thiểu, band])
const BAND_TABLE = {
  reading:   [[39,9],[37,8.5],[35,8],[33,7.5],[30,7],[27,6.5],[23,6],[19,5.5],[15,5],[13,4.5],[10,4],[8,3.5],[6,3],[4,2.5],[3,2]],
  listening: [[39,9],[37,8.5],[35,8],[32,7.5],[30,7],[26,6.5],[23,6],[18,5.5],[16,5],[13,4.5],[11,4],[8,3.5],[6,3],[4,2.5],[3,2]],
};

// Đọc 1 tab đề trắc nghiệm -> object (CÓ kèm đáp án, chỉ dùng nội bộ server)
function readQuizSheet(topic) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(topic);
  if (!sh) return null;
  const values = sh.getDataRange().getValues();
  const quiz = { loai: "reading", thoiGianPhut: "", audioURL: "", raByAudio: false, passages: [], questions: [] };
  let mode = "meta", curPassage = null, headerSeen = false;
  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    const a = String(row[0] || "").trim();
    if (/^META$/i.test(a)) { mode = "meta"; continue; }
    if (/^@PASSAGE/i.test(a)) { mode = "passage"; const num = (a.match(/(\d+)/) || [])[1] || ""; curPassage = { num: num, text: "", image: "" }; quiz.passages.push(curPassage); continue; }
    if (/^@IMAGE/i.test(a)) { const url = a.replace(/^@IMAGE/i, "").trim(); if (curPassage) curPassage.image = url; continue; }
    if (/^@QUESTIONS/i.test(a)) { mode = "questions"; headerSeen = false; continue; }

    if (mode === "meta") {
      const key = a.toLowerCase(), val = String(row[1] || "").trim();
      if (key === "loai") quiz.loai = val.toLowerCase();
      else if (key === "thoigianphut") quiz.thoiGianPhut = val;
      else if (key === "audiourl") quiz.audioURL = val;
      else if (key === "rabyaudio") quiz.raByAudio = /^true$/i.test(val);
    } else if (mode === "passage") {
      if (curPassage && a) curPassage.text += (curPassage.text ? "\n" : "") + String(row[0] || "");
    } else if (mode === "questions") {
      if (!headerSeen) { headerSeen = true; continue; }   // bỏ dòng tiêu đề cột
      if (!a) continue;
      const opts = String(row[4] || "").split("|").map(function (s) { return s.trim(); }).filter(Boolean);
      quiz.questions.push({
        part: String(row[0] || "").trim(), id: String(row[1] || "").trim(),
        type: String(row[2] || "").trim().toLowerCase(), q: String(row[3] || "").trim(),
        options: opts, answer: String(row[5] || "").trim(),
        diem: Number(row[6] || 1) || 1, image: String(row[7] || "").trim(),
      });
    }
  }
  return quiz;
}

// action=quiz : trả đề KHÔNG kèm đáp án
function getQuiz(topic) {
  const quiz = readQuizSheet(topic);
  if (!quiz) return { error: "not-found" };
  return {
    loai: quiz.loai, thoiGianPhut: quiz.thoiGianPhut, audioURL: quiz.audioURL,
    raByAudio: quiz.raByAudio, passages: quiz.passages,
    questions: quiz.questions.map(function (q) {
      return { part: q.part, id: q.id, type: q.type, q: q.q, options: q.options, image: q.image };
    }),
  };
}

function bandFromRaw(loai, raw) {
  const tbl = BAND_TABLE[loai] || BAND_TABLE.reading;
  for (let i = 0; i < tbl.length; i++) { if (raw >= tbl[i][0]) return tbl[i][1]; }
  return 0;
}
function normTFNG(v) {
  const s = String(v || "").toUpperCase().replace(/\s+/g, "");
  if (["T","TRUE","YES","Y"].indexOf(s) >= 0) return "T";
  if (["F","FALSE","NO","N"].indexOf(s) >= 0) return "F";
  if (["NG","NOTGIVEN"].indexOf(s) >= 0) return "NG";
  return "";
}
function isCorrect(type, your, right) {
  if (right == null || right === "") return false;
  if (type === "multi") {
    const a = (Array.isArray(your) ? your : String(your || "").split(",")).map(function (x) { return String(x).trim().toUpperCase(); }).filter(Boolean).sort();
    const b = String(right).split(",").map(function (x) { return x.trim().toUpperCase(); }).filter(Boolean).sort();
    return a.length > 0 && a.length === b.length && a.every(function (v, i) { return v === b[i]; });
  }
  if (type === "tfng") { const n = normTFNG(your); return n !== "" && n === normTFNG(right); }
  if (type === "fill" || type === "complete") {
    const norm = function (s) { return String(s || "").toLowerCase().replace(/\s+/g, " ").trim(); };
    return String(right).split("/").map(norm).filter(Boolean).indexOf(norm(your)) >= 0;
  }
  return String(your || "").toUpperCase().replace(/\s+/g, "") === String(right).toUpperCase().replace(/\s+/g, "");
}

// action=grade : chấm + lưu BaiNop-RL + email GV & HS + trả kết quả
function gradeQuiz(p) {
  const quiz = readQuizSheet(p.topic);
  if (!quiz) return { error: "not-found" };
  let answers = {};
  try { answers = JSON.parse(p.answers || "{}"); } catch (e) {}

  let raw = 0; const details = [];
  quiz.questions.forEach(function (q) {
    const ok = isCorrect(q.type, answers[q.id], q.answer);
    if (ok) raw++;
    details.push({ id: q.id, your: (Array.isArray(answers[q.id]) ? answers[q.id].join(",") : (answers[q.id] || "")), right: q.answer, correct: ok });
  });
  const total = quiz.questions.length;
  const band = bandFromRaw(quiz.loai, raw);

  // Lưu kết quả
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(RL_RESULT_SHEET);
  if (!sh) { sh = ss.insertSheet(RL_RESULT_SHEET); sh.appendRow(["Thời điểm nộp","Họ tên","Email","Đề","Loại","Điểm thô","Tổng","Band","Số vi phạm","Chi tiết","Nhật ký"]); }
  sh.appendRow([
    p.submittedAt || new Date().toLocaleString(), p.name || "", p.email || "", p.topic || "", quiz.loai,
    raw, total, band, p.violations || 0,
    details.map(function (d) { return d.id + ":" + (d.correct ? "Đ" : "S"); }).join(" "),
    p.log || "",
  ]);

  // Email cho giáo viên + học sinh
  const body = "Kết quả " + quiz.loai + " — " + p.name + " (" + p.email + ")\n"
    + "Đề: " + p.topic + "\nĐiểm: " + raw + "/" + total + "   |   Band: " + band
    + "\nSố vi phạm: " + (p.violations || 0) + "\n";
  try { MailApp.sendEmail({ to: TEACHER_EMAIL, subject: "[RL] " + p.topic + " — " + p.name + " " + raw + "/" + total + " (band " + band + ")", body: body, replyTo: p.email }); } catch (e) {}
  if (p.email) { try { MailApp.sendEmail({ to: p.email, subject: "Kết quả bài " + p.topic, body: body }); } catch (e) {} }

  return { raw: raw, total: total, band: band, details: details };
}
