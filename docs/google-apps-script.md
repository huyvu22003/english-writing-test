# Backend — Google Apps Script (đa chủ đề + Gmail + Google Sheet)

Backend miễn phí này:
- Cung cấp **danh sách chủ đề** và **đề bài** cho web app (qua JSONP — tránh lỗi CORS).
- Nhận bài làm, **lưu vào sheet `BaiNop`** và **gửi email** về cho giáo viên.

## Mô hình Google Sheet

Trong **một** bảng tính, bạn tạo:

### a) Mỗi chủ đề = 1 tab (sheet). Tên tab = tên chủ đề.
Ví dụ các tab: `Travel`, `Family`, `Technology`, `School Life`...

Trong mỗi tab:
- **Dòng 1** là tiêu đề (header), ví dụ ô A1 ghi `Đề bài`. (Dòng 1 sẽ bị bỏ qua khi lấy đề.)
- **Từ dòng 2 trở xuống, cột A**: mỗi dòng là một đề. Bỏ **nhiều đề** thì app sẽ chọn **ngẫu nhiên** 1 đề cho mỗi học sinh; bỏ **1 đề** thì mọi học sinh nhận đề giống nhau.

Ví dụ tab `Travel`:

| A (Đề bài) |
|---|
| Write about the most memorable trip you have ever had (120-180 words). |
| Describe a place you would love to visit and explain why (120-180 words). |
| Write about a trip that did not go as planned (120-180 words). |

### b) 1 tab tên `BaiNop` để chứa bài nộp.
Dòng 1 tạo header đúng thứ tự (script cũng tự tạo nếu thiếu):

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| Thời điểm nộp | Họ tên | Email | Chủ đề | Số từ | Số vi phạm | Đề bài | Bài viết | Nhật ký |

> ⚠️ Tab tên `BaiNop` (và tab tùy chọn `Config`) **không** được coi là chủ đề. Mọi tab còn lại đều hiện ra cho học sinh chọn.

## Script (dán vào Apps Script)

Menu **Tiện ích mở rộng → Apps Script**, xóa code mẫu, dán đoạn dưới, sửa `TEACHER_EMAIL`:

```javascript
// ===== CẤU HÌNH =====
const TEACHER_EMAIL = "ieltsmstramy@gmail.com"; // email nhận bài
const RESULTS_SHEET = "BaiNop";               // tab chứa bài nộp
const IGNORE_SHEETS = ["BaiNop", "Config"];   // tab KHÔNG phải chủ đề
// Cách phát đề trong 1 chủ đề:
//  "sequential" = xoay vòng (đề 1,2,3...) -> 2 HS liên tiếp KHÔNG trùng đề (khuyến nghị)
//  "random"     = bốc ngẫu nhiên (có thể trùng)
//  "first"      = luôn lấy đề dòng đầu (cả lớp cùng 1 đề)
const PROMPT_MODE = "sequential";

// ---- Trả danh sách chủ đề + đề bài cho web app (JSONP) ----
function doGet(e) {
  const cb = e.parameter.callback || "callback";
  const action = e.parameter.action;
  let out;

  if (action === "topics") {
    out = { topics: getTopicNames() };
  } else if (action === "prompt") {
    out = { prompt: getPrompt(e.parameter.topic, e.parameter.who) };
  } else if (action === "check") {
    out = { submitted: isEmailSubmitted(e.parameter.email) };
  } else {
    out = { error: "unknown action" };
  }

  const js = cb + "(" + JSON.stringify(out) + ");";
  return ContentService.createTextOutput(js)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function getTopicNames() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheets()
    .map(s => s.getName())
    .filter(n => IGNORE_SHEETS.indexOf(n) === -1);
}

function getPrompt(topic, who) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(topic);
  if (!sheet) return "(Không tìm thấy chủ đề: " + topic + ")";
  const last = sheet.getLastRow();
  if (last < 2) return "(Chủ đề chưa có đề bài)";
  const values = sheet.getRange(2, 1, last - 1, 1).getValues()
    .map(function (r) { return String(r[0]).trim(); }).filter(function (v) { return v; });
  if (!values.length) return "(Chủ đề chưa có đề bài)";

  const lock = LockService.getScriptLock();
  var hasLock = false;
  try { lock.waitLock(5000); hasLock = true; } catch (e) {}
  try {
    var idx;
    if (PROMPT_MODE === "first") {
      idx = 0;
    } else if (PROMPT_MODE === "random") {
      idx = Math.floor(Math.random() * values.length);
    } else { // "sequential": phát đề xoay vòng
      const props = PropertiesService.getScriptProperties();
      const key = "counter_" + topic;
      const n = parseInt(props.getProperty(key) || "0", 10);
      idx = n % values.length;
      props.setProperty(key, String(n + 1));
    }

    // Đánh dấu "đề đã dùng": ghi tên HS vào cột B của dòng đề tương ứng
    if (who) {
      if (!String(sheet.getRange(1, 2).getValue()).trim()) {
        sheet.getRange(1, 2).setValue("Học sinh đã dùng").setFontWeight("bold");
      }
      const cell = sheet.getRange(idx + 2, 2);
      const cur = String(cell.getValue() || "").trim();
      cell.setValue(cur ? cur + ", " + who : who);
    }

    return values[idx];
  } finally {
    if (hasLock) lock.releaseLock();
  }
}

// (Tùy chọn) Reset bộ đếm phát đề trước mỗi buổi thi để bắt đầu lại từ đề 1.
// Chạy hàm này 1 lần trong Apps Script khi muốn làm mới thứ tự phát đề.
function resetPromptCounters() {
  PropertiesService.getScriptProperties().deleteAllProperties();
  Logger.log("Đã reset bộ đếm phát đề. Buổi thi mới sẽ phát lại từ đề 1.");
}

// ---- Kiểm tra 1 email đã nộp bài chưa (cột C của sheet BaiNop) ----
function isEmailSubmitted(email) {
  if (!email) return false;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(RESULTS_SHEET);
  if (!sheet) return false;
  const last = sheet.getLastRow();
  if (last < 2) return false;
  const target = String(email).trim().toLowerCase();
  const emails = sheet.getRange(2, 3, last - 1, 1).getValues(); // cột C = Email
  return emails.some(function (r) {
    return String(r[0]).trim().toLowerCase() === target;
  });
}

// ---- Nhận bài nộp ----
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
      ? `\n⚠️ CẢNH BÁO: học sinh có ${data.violations} lần rời màn hình!\n`
      : "\n✅ Không phát hiện vi phạm.\n";

    const body =
      `Bài viết mới từ: ${data.name} (${data.email})\n` +
      `Chủ đề: ${data.topic}\n` +
      `Số từ: ${data.wordCount} | Nộp lúc: ${data.submittedAt}\n` +
      warn +
      `\n----- ĐỀ BÀI -----\n${data.prompt}\n` +
      `\n----- BÀI VIẾT -----\n${data.essay}\n` +
      `\n----- NHẬT KÝ -----\n${data.log}\n`;

    MailApp.sendEmail({
      to: TEACHER_EMAIL,
      subject: `[${data.topic}] ${data.name} — ${data.violations} vi phạm`,
      body: body,
      replyTo: data.email,
    });

    return ContentService.createTextOutput("OK");
  } catch (err) {
    return ContentService.createTextOutput("ERROR: " + err.message);
  }
}
```

## ⚡ Tự tạo 10 tab chủ đề (chạy 1 lần — khỏi tạo tay)

Dán thêm hàm dưới vào cùng file Apps Script. Sau đó ở thanh công cụ chọn hàm **`setupSheets`** rồi bấm **▷ Chạy** một lần. Nó sẽ tạo `topic-1`…`topic-10` (mỗi tab vài đề mẫu) + tab `BaiNop`.

```javascript
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Đề mẫu cho 10 chủ đề (bạn sửa lại trong Sheet sau khi tạo)
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

  // Tạo từng tab chủ đề
  Object.keys(SAMPLE).forEach(function (name) {
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    sh.clear();
    sh.getRange(1, 1).setValue("Đề bài").setFontWeight("bold");
    SAMPLE[name].forEach(function (p, i) {
      sh.getRange(i + 2, 1).setValue(p);
    });
    sh.setColumnWidth(1, 600);
  });

  // Tạo tab BaiNop
  let res = ss.getSheetByName("BaiNop");
  if (!res) res = ss.insertSheet("BaiNop");
  if (res.getLastRow() === 0) {
    res.appendRow(["Thời điểm nộp","Họ tên","Email","Chủ đề","Số từ","Số vi phạm","Đề bài","Bài viết","Nhật ký"]);
    res.getRange(1, 1, 1, 9).setFontWeight("bold");
  }

  // Xóa tab "Trang tính1"/"Sheet1" mặc định nếu còn trống
  ["Trang tính1", "Sheet1"].forEach(function (n) {
    const s = ss.getSheetByName(n);
    if (s && s.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(s);
  });

  Logger.log("Đã tạo xong 10 chủ đề + tab BaiNop!"); // KHÔNG dùng getUi().alert (treo khi chạy từ editor)
}
```

> Lần đầu chạy `setupSheets`, Google sẽ hỏi cấp quyền → chọn tài khoản → **Nâng cao → Đi tới... → Cho phép**.

## Triển khai (Deploy)
1. **Triển khai → Bản triển khai mới** → loại **Ứng dụng web**.
2. **Thực thi với tư cách**: *Tôi*; **Ai có quyền truy cập**: **Bất kỳ ai**.
3. **Triển khai** → cấp quyền → copy **URL** dạng `https://script.google.com/macros/s/..../exec`.
4. Dán URL vào `CONFIG.ENDPOINT` trong `src/index.html`.

> Mỗi lần sửa script: **Triển khai → Quản lý bản triển khai → ✏️ → Phiên bản: Mới → Triển khai** (nếu không, URL vẫn chạy code cũ).

## Giáo viên giao đề hằng ngày
Chỉ cần **mở Google Sheet, vào đúng tab chủ đề, gõ/sửa đề ở cột A**. Không cần đụng code, không cần deploy lại. Muốn thêm chủ đề mới → **tạo thêm tab**, đặt tên là tên chủ đề.

## Kiểm tra nhanh
- Dán URL kèm `?action=topics&callback=test` vào trình duyệt → phải thấy `test({"topics":[...]});`.
- Mở web app → ô chọn chủ đề phải đổ đúng danh sách các tab.
