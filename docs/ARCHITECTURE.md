# 🏛️ KIẾN TRÚC & CƠ CHẾ HOẠT ĐỘNG — English Writing Test

> Tài liệu dành cho **dev mới**: đọc xong là nắm được *vì sao app ra đời*, *nó hoạt động thế nào*, và *code nằm ở đâu*. Đọc kèm `CHANGELOG.md` (lịch sử thay đổi) và `docs/CONTRIBUTING.md` (quy tắc ghi log).

Cập nhật lần cuối: 2026-06-23

---

## 1. Ý tưởng ban đầu & bối cảnh

Giáo viên IELTS (**thương hiệu "IELTS Ms. TRÀ MY"**) cần cho học sinh **thi viết tiếng Anh online** mà **hạn chế gian lận** (tra Google, dán bài, hỏi người khác qua chuyển cửa sổ). Yêu cầu cốt lõi:

- Học sinh làm bài trong **chế độ toàn màn hình bị khóa**.
- **Mọi lần rời màn hình đều bị ghi log** kèm giờ giấc và gửi cho giáo viên.
- Giáo viên **ra đề bằng Google Sheet** (không cần đụng code), bài nộp **tự về Gmail + Sheet**.
- Triển khai **rẻ, không cần server backend riêng**.

**Triết lý quan trọng (đã thống nhất):** web app chạy trong trình duyệt **không thể chặn tuyệt đối** (không chặn được Ctrl+Alt+Del). Vì vậy mục tiêu là **răn đe + phát hiện**, không phải ngăn chặn 100%. Mọi vi phạm đều bị ghi lại và báo về giáo viên.

---

## 2. Kiến trúc tổng thể

```
Học sinh ──HTTPS──> [Web tĩnh: src/index.html]  (Cloudflare/GitHub Pages hoặc nginx)
                          │
                          │  (1) lấy chủ đề + đề bài     → JSONP  (GET)
                          │  (2) kiểm tra email đã nộp   → JSONP  (GET, action=check)
                          │  (3) nộp bài                 → POST no-cors (text/plain)
                          ▼
                  Google Apps Script  (đã deploy, chạy trên hạ tầng Google)
                          │
                          ▼
                Gmail (gửi mail giáo viên) + Google Sheet (tab "BaiNop")
```

**Hai thành phần, tách rời hoàn toàn:**

| Thành phần | Là gì | Ở đâu | Vai trò |
|---|---|---|---|
| **Frontend** | 1 file `src/index.html` (HTML+CSS+JS, **không build, không framework**) + `src/logo.png` | repo này, serve tĩnh qua HTTPS | Toàn bộ UI + cơ chế khóa/chống gian lận/đồng hồ |
| **Backend** | Google Apps Script (code tham khảo trong `docs/google-apps-script.md`) | hạ tầng Google | Trả đề từ Sheet, nhận bài, lưu Sheet, gửi mail |

> ⚠️ **HTTPS bắt buộc**: Fullscreen API chỉ chạy trong secure context (HTTPS hoặc localhost). Chạy `http://` trên tên miền thật → khóa toàn màn hình KHÔNG hoạt động.

**Vì sao tách backend?** Để (a) khỏi dựng/duy trì server, (b) giấu `TEACHER_EMAIL` phía Google (không lộ ra web), (c) giáo viên tự ra đề bằng Sheet.

**Vì sao JSONP cho GET?** Apps Script không trả CORS header phù hợp cho `fetch` cross-origin đọc kết quả → dùng JSONP (chèn thẻ `<script>`) để đọc dữ liệu. POST nộp bài dùng `no-cors` (không cần đọc body trả về — *xem hạn chế ở mục 6*).

---

## 3. Cấu trúc thư mục

```
english-writing-test/
├── src/
│   ├── index.html          ← TOÀN BỘ ỨNG DỤNG (3 màn hình + JS)
│   └── logo.png            ← logo thương hiệu (serve kèm)
├── docs/
│   ├── ARCHITECTURE.md     ← file này
│   ├── CONTRIBUTING.md     ← quy tắc commit + ghi changelog
│   ├── ROADMAP.md          ← việc cần làm tiếp (P0..P3)
│   ├── google-apps-script.md  ← mã backend + hướng dẫn deploy backend
│   └── deployment.md       ← deploy frontend (Cloudflare/GitHub Pages/nginx)
├── CHANGELOG.md            ← LỊCH SỬ THAY ĐỔI theo thời gian
├── README.md              ← mô tả tính năng + cấu hình nhanh
├── BAN-GIAO.md            ← tài liệu bàn giao gốc
└── .env.example
```

---

## 4. Ba màn hình (state machine)

App là **SPA 1 trang** với 3 `<section class="screen">`, chỉ 1 cái `active` tại một thời điểm (hàm `show(name)`):

1. **`loginScreen`** — nhập Họ tên + Email, chọn Chủ đề.
2. **`writeScreen`** — topbar (tên, số từ, đồng hồ) + đề bài + ô viết + nút Nộp.
3. **`doneScreen`** — xác nhận đã nộp.

Cùng 4 overlay phủ toàn màn: `confirmOverlay` (xác nhận trước khi bắt đầu), `warnOverlay` (cảnh báo vi phạm), `teacherOverlay` (giáo viên mở khóa), và phần nền trang trí `bg-decor`.

---

## 5. Luồng hoạt động chi tiết (kèm vị trí code)

> Tham chiếu theo hàm trong `src/index.html`.

### 5.1. Mở app
- `if (!tryRestore()) loadTopics();` — ưu tiên **khôi phục phiên dang dở**; nếu không có thì tải danh sách chủ đề.
- `loadTopics()` — gọi JSONP `action=topics` → đổ dropdown. Nếu chưa cấu hình `ENDPOINT` → dùng `CONFIG.FALLBACK_TOPICS` (chế độ thử offline).

### 5.2. Bắt đầu làm bài (2 bước — *có lý do kỹ thuật*)
- **Bước 1 — nút "Bắt đầu" (`startBtn`)**: validate tên/email/chủ đề → kiểm tra email đã nộp chưa (`isEmailBlocked`) → **tải sẵn đề** (`fetchPrompt`, async) → hiện `confirmOverlay`.
- **Bước 2 — nút "Xác nhận & Bắt đầu" (`confirmStart`)**: **KHÔNG await** (đề đã tải sẵn ở bước 1) → đặt `startedAt`, tính `timeLimitMin` + `minWords` theo topic → `enterLockdown()` (gọi `requestFullscreen` **ngay trong cú click**) → `startTimer()`.

  > 🔑 **Vì sao tách 2 bước:** `requestFullscreen()` chỉ chạy nếu được gọi **đồng bộ trong user-gesture**. Nếu `await` (tải đề) trước khi gọi, trình duyệt sẽ chặn fullscreen. Nên mọi việc async dồn vào Bước 1.

### 5.3. Chế độ khóa & phát hiện vi phạm
- `enterLockdown()` → `document.documentElement.requestFullscreen()`.
- **Phát hiện rời màn** qua 3 sự kiện: `fullscreenchange` (thoát fullscreen), `window blur` (Alt+Tab/đổi app), `visibilitychange` (đổi tab). Tất cả gọi `registerViolation(reason)`.
- `registerViolation`:
  - **Chống đếm trùng**: 2 sự kiện sinh đôi (blur + visibilitychange) trong **800ms** chỉ tính **1** vi phạm.
  - **`suppressViolations`/`guardDialog`**: khi app tự mở `alert/confirm` (gây blur), KHÔNG tính là vi phạm.
  - Tăng `state.violations`, `logEvent`, hiện `warnOverlay`, `saveSession`.
- **Chặn thao tác** (`keydown` + listener `contextmenu/copy/cut/paste`): chuột phải, copy/cut/paste, F11/F12, Ctrl+C/V/X/P/S/U, Ctrl+Shift+I/J/C. *(Lưu ý: kéo-thả text chưa chặn — xem ROADMAP P1.)*
- **`beforeunload`**: cảnh báo khi định đóng/reload lúc đang làm bài.
- **Giáo viên mở khóa**: `Ctrl+Shift+U` → nhập `TEACHER_PASSWORD` → thoát khóa không nộp.

### 5.4. Đồng hồ — tính theo GIỜ THỰC (quan trọng)
- `startTimer()` đặt `state.deadline = startedAt + hạn mức`. Mỗi giây `tickTimer()` tính `secondsLeft = (deadline − now)`.
- **Vì tính theo giờ thực**: đóng tab/reload **vẫn trôi giờ** (không "bấm pause" được). Mở lại khi **đã quá hạn** → **tự động nộp ngay** (`doSubmit(true)`), không vào lại khóa.
- Hết giờ (`secondsLeft <= 0`) → `doSubmit(true)` (tự nộp, **bỏ qua** yêu cầu số từ tối thiểu).
- `TIME_LIMIT_MIN = 0` cho topic nào đó → hiển thị `∞` (không giới hạn).

### 5.5. Quy định theo từng topic (thời gian + số từ)
- `topicRule(topic)` giải luật theo thứ tự ưu tiên: **`TOPIC_RULES`** (luật riêng) → **`NUMBERED_TOPIC`** (topic dạng `topic-1`, `topic-2`...) → **mặc định** (`TIME_LIMIT_MIN`/`MIN_WORDS`).
- `effectiveTimeLimit()` / `effectiveMinWords()` trả số phút / số từ áp dụng.
- **Khớp tên linh hoạt** (`normTopic`): không phân biệt hoa/thường, dấu cách thừa, dấu `/` → `"Reading/Listening"` = `"Reading Listening"`.

### 5.6. Tự lưu nháp & khôi phục
- `saveSession()` lưu vào `localStorage` (key `ewt_session`): tên/email/topic/đề/bài viết/startedAt/vi phạm/log. Gọi định kỳ (mỗi giây qua `tickTimer`) và sau mỗi sự kiện.
- `tryRestore()` chạy lúc mở app: nếu có phiên dang dở → khôi phục, **reload bị tính 1 vi phạm** (chống dùng reload để "làm mới"). Tính lại giờ theo thực tế; nếu đã hết giờ → tự nộp.
- `clearSession()` xóa nháp sau khi nộp thành công.

### 5.7. Nộp bài
- `doSubmit(auto)`:
  - Nếu **không** phải auto và chưa đủ `state.minWords` → báo ngay tại chỗ (không dùng `alert` để tránh blur giả).
  - Đóng gói payload → `sendToBackend()` (POST `no-cors`).
  - Đặt `submitted=true`, dừng đồng hồ, `markEmailUsed`, `clearSession`, thoát fullscreen, hiện `doneScreen`.

### 5.8. Chống nộp 2 lần cùng email
- `ONE_SUBMISSION_PER_EMAIL` (mặc định hiện `false`). Khi bật: kiểm tra **2 lớp** — server (`action=check` đối chiếu sheet `BaiNop`) + `localStorage` (nhanh/offline).

---

## 6. Hạn chế đã biết (đọc kỹ trước khi sửa)

| Hạn chế | Bản chất | Hướng xử lý |
|---|---|---|
| Không chặn Ctrl+Alt+Del | Cơ chế hệ điều hành | Dùng kèm **Safe Exam Browser** nếu cần khóa cứng |
| **Nộp bài "mù" (no-cors)** | Không đọc được kết quả POST → lỗi mạng vẫn báo "thành công" và xóa nháp → **có thể mất bài** | ROADMAP **P0 #1** |
| Máy dùng chung lộ bài người trước | `tryRestore` khôi phục bất kỳ phiên, không kiểm tra danh tính | ROADMAP **P0 #3** |
| Kéo-thả text không bị chặn | Chỉ chặn copy/paste/Ctrl+V | ROADMAP **P1 #4** |
| `TEACHER_PASSWORD` ở client | Ai View Source đều thấy | Chỉ là nút tiện lợi, đừng dùng mật khẩu quan trọng |

---

## 7. Cấu hình (khối `CONFIG` đầu thẻ `<script>`)

| Biến | Ý nghĩa |
|---|---|
| `ENDPOINT` | URL Web App của Apps Script |
| `TEACHER_PASSWORD` | Mật khẩu mở khóa khẩn cấp (client-side) |
| `MIN_WORDS` | Số từ tối thiểu MẶC ĐỊNH (0 = tắt) |
| `TIME_LIMIT_MIN` | Thời gian MẶC ĐỊNH (phút, 0 = ∞) |
| `TOPIC_RULES` | Luật riêng theo topic: `{ time, minWords }` |
| `NUMBERED_TOPIC` | Luật cho "topic có số" (topic-1, topic-2...) |
| `ONE_SUBMISSION_PER_EMAIL` | Mỗi email chỉ nộp 1 lần |
| `FALLBACK_TOPICS` | Đề dùng khi chưa cấu hình ENDPOINT (thử offline) |

Chi tiết deploy: `docs/deployment.md` (frontend) và `docs/google-apps-script.md` (backend).
