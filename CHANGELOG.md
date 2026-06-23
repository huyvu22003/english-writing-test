# 📜 CHANGELOG — English Writing Test

Mọi thay đổi đáng kể của dự án được ghi tại đây, **mới nhất ở trên cùng**.

- Định dạng tham khảo [Keep a Changelog](https://keepachangelog.com/vi/1.1.0/), ngày theo `YYYY-MM-DD`.
- Quy tắc ghi mục này: xem [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md).
- Phân loại: **Thêm** (tính năng mới) · **Đổi** (thay đổi hành vi) · **Sửa** (vá lỗi) · **Bỏ** (gỡ bỏ) · **Bảo mật** · **Tài liệu**.

---

## [Chưa phát hành]
> Việc đang/định làm — xem [`docs/ROADMAP.md`](docs/ROADMAP.md).

### Thêm — Trình tạo đề trắc nghiệm (`tools/tao-de.html`)
- Trang web giúp giáo viên **soạn đề không cần căn từng ô Sheet**: điền loại/thời gian/audio, dán đoạn văn, gõ câu hỏi ở **dạng đơn giản** (A) B) C) + dấu `*` cho đáp án đúng; `= TRUE/FALSE/NG`; `= từ / từ` cho điền từ; `[P2]` đổi part).
- Bấm **Tạo nội dung** → xem trước + cảnh báo câu thiếu đáp án → **Copy dán thẳng ô A1** hoặc **Tải CSV** để import thành tab `RL-…`. Nhận đủ 4 dạng Phase 1.

### Thêm — Backend vào repo (chống lệch nguồn)
- Thêm **`backend/Code.gs`** — bản Apps Script **đang chạy thật** (nguồn chuẩn). Trước đây backend chỉ sống trong Google nên repo bị lệch (vd `getPrompt`/`RANDOM_PROMPT` khác bản tài liệu). Từ nay: sửa backend ở `backend/Code.gs` → commit → dán lên Apps Script → deploy.
- `docs/google-apps-script.md`: thêm chú dẫn trỏ về `backend/Code.gs` là nguồn chuẩn.

### Thêm — Chế độ trắc nghiệm Reading/Listening (Phase 1)
- **Frontend** (`src/index.html`): nhận diện topic `RL-…` → vào **chế độ quiz** riêng (tái dùng khóa fullscreen + log vi phạm + đồng hồ giờ thực + lưu/khôi phục).
  - Dạng câu **Phase 1**: chọn 1 (single), chọn nhiều (multi), True/False/NG, điền từ (fill).
  - Màn làm bài: passage (Reading) / audio (Listening) + thanh **điều hướng câu + tiến độ x/40 + đánh dấu xem lại**.
  - **Audio Listening**: nghe **1 lần**, **chặn tua**; hết audio → cho `AUDIO_REVIEW_MIN` phút (mặc định 2) rồi tự nộp.
  - **Chấm + quy đổi band**: online chấm ở backend; offline có **đề DEMO + chấm thử tại máy** (`FALLBACK_QUIZ`). Màn kết quả: điểm thô + band + bảng từng câu đúng/sai.
- **Backend** (`docs/google-apps-script.md`): thêm code `action=quiz` (trả đề **không kèm đáp án**) + `action=grade` (chấm ở server, lưu `BaiNop-RL`, email GV & HS). ⚠️ **Cần deploy lại** ở tài khoản Google.

### Tài liệu
- Thêm `docs/ARCHITECTURE.md` (kiến trúc + cơ chế hoạt động chi tiết cho dev mới).
- Thêm `CHANGELOG.md` (lịch sử thay đổi) và `docs/CONTRIBUTING.md` (quy tắc commit + ghi changelog).
- Thêm `docs/READING-LISTENING-PLAN.md` (phương án đã chốt cho chế độ trắc nghiệm Reading/Listening: phân phase MVP, checklist, schema Sheet, bảng band IELTS Academic).
- Thêm `docs/reading-listening-sample.md` (hướng dẫn nhập đề trắc nghiệm cho giáo viên) + file mẫu `samples/RL-Reading-01.csv`, `samples/RL-Listening-01.csv` — hoàn thành B1–B4 (Phase 1).

---

## 2026-06-23 — Đồng hồ tính theo giờ thực  ·  PR #2 `6613461`
### Sửa
- **Vá lỗ hổng "đóng tab = bấm pause" (ROADMAP P0 #2).** Đồng hồ cũ đếm lùi nội bộ bằng `setInterval`, dừng khi đóng tab; mở lại khôi phục số giây đã lưu → học sinh lách được giờ thi.
### Đổi
- Thời gian còn lại nay suy ra từ **giờ thực**: `deadline = startedAt + hạn mức`. Đóng tab/reload **vẫn trôi giờ**.
- Mở lại khi **đã quá hạn** → **tự động nộp ngay**, không vào lại chế độ khóa.
- Gộp logic nhịp đồng hồ vào `tickTimer()` (dùng chung cho lúc chạy và lúc khởi động).

## 2026-06-23 — Thời gian + số từ tối thiểu riêng theo từng topic  ·  PR #1 `859ebe2`
### Thêm
- **Số từ tối thiểu RIÊNG theo từng topic** (trước đây chỉ có 1 giá trị chung): qua `effectiveMinWords()`.
- Bảng luật hợp nhất `TOPIC_RULES` (`{ time, minWords }`) + `NUMBERED_TOPIC` cho "topic có số".
- Quy định áp dụng: Writing Task 1 = 30p/150 từ · Reading Listening = 60p · Luyện đề task 2 = 40p/250 từ · Luyện đề task 1 = 20p/150 từ · topic-1…topic-10 = 60p.
### Đổi
- Khớp tên topic **linh hoạt** (không phân biệt hoa/thường, dấu cách thừa, dấu `/`) → `"Reading/Listening"` = `"Reading Listening"`.
- `MIN_WORDS` mặc định: `120` → `0` (chỉ topic được liệt kê mới có giới hạn từ).
### Tài liệu
- Cập nhật README (khối CONFIG); thêm `docs/ROADMAP.md`.

---

## 2026-06-23 — Tinh chỉnh thời gian & quy tắc nộp (trước khi AI tiếp quản)
### Đổi
- `71fd1c2` Thời gian làm bài theo chủ đề: mặc định 40p, riêng Reading/Listening 60p (qua `TIME_LIMIT_OVERRIDES` — *sau này được thay bằng `TOPIC_RULES`*).
- `e687541` Cho phép 1 email làm bài nhiều lần (tắt `ONE_SUBMISSION_PER_EMAIL`).
- `3bfefdc` Đổi thời gian làm bài mặc định 30 → 60 phút.

## 2026-06-19 — Đánh dấu đề đã dùng
### Thêm
- `bb67ff4` Gửi kèm tên học sinh khi lấy đề để backend ghi "đề đã dùng" vào cột B của tab chủ đề.

## 2026-06-18 — Bàn giao & chuẩn bị deploy
### Sửa
- `efff706` Sửa lỗi không vào được fullscreen khi bấm "Xác nhận & Bắt đầu" (tách phần async ra Bước 1 để `requestFullscreen` chạy trong user-gesture).
### Đổi
- `25db82f` Chuẩn bị deploy Cloudflare Pages.
### Thêm (phiên bản đầu tiên — `95fd4b4`)
- Web app thi viết tiếng Anh "IELTS Ms. TRÀ MY": 3 màn hình (đăng nhập/làm bài/hoàn thành).
- Đa chủ đề từ Google Sheet (mỗi tab = 1 chủ đề), tải đề qua JSONP.
- Ép toàn màn hình + phát hiện & ghi log vi phạm (Alt+Tab, đổi tab, thoát fullscreen).
- Chặn chuột phải/copy/paste/cut/F12/F11/devtools.
- Đếm từ + số từ tối thiểu, đồng hồ đếm ngược (hết giờ tự nộp).
- Tự lưu nháp & khôi phục khi reload (reload tính 1 vi phạm).
- Popup xác nhận trước khi bắt đầu; mật khẩu giáo viên mở khóa (Ctrl+Shift+U).
- Giới hạn 1 lần nộp/email (server + localStorage).
- Nộp bài về Gmail + Google Sheet qua Google Apps Script.
