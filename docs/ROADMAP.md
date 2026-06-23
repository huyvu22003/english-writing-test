# 🗺️ Roadmap — English Writing Test (lưu ngày 2026-06-23)

> Ý tưởng đã chốt để làm dần. Việc đang ưu tiên trước: **chỉnh thời gian làm bài theo từng topic** (theo ảnh người dùng gửi).

## 🔴 P0 — Toàn vẹn dữ liệu
1. **Nộp bài "mù" (no-cors) → mất bài thầm lặng.** `sendToBackend()` (~dòng 795) dùng `fetch mode:"no-cors"`; `doSubmit()` luôn báo thành công + `clearSession()` kể cả khi lỗi. → chuyển submit sang JSONP có xác nhận server, retry, chỉ xóa nháp sau khi server xác nhận, backup payload trong localStorage.
2. **Đồng hồ bị "tạm dừng" khi đóng tab.** `startTimer()` đếm `secondsLeft` chỉ khi trang mở, khôi phục theo `data.secondsLeft`. → tính theo wall-clock: `remaining = limit*60 − (now − startedAt)`.
3. **Máy dùng chung lộ bài người trước.** `tryRestore()` tự khôi phục bất kỳ session, không kiểm tra danh tính. → hỏi xác nhận / chỉ khôi phục khi email trùng.

## 🟠 P1 — Chống gian lận
4. Chặn **drag & drop** văn bản vào textarea (hiện chỉ chặn copy/cut/paste + Ctrl+V).
5. Phát hiện **dán ngầm** qua tăng đột biến số ký tự trong 1 sự kiện input → ghi log nghi vấn.

## 🟡 P2 — Nhất quán & vận hành
6. Thiếu `.github/workflows/deploy.yml` (được nhắc trong BAN-GIAO.md & deployment.md nhưng không tồn tại). → tạo workflow hoặc sửa docs.
7. Tách config (`ENDPOINT`, `TEACHER_PASSWORD`) khỏi `index.html` (config.js + gitignore).

## 🟢 P3 — Tính năng mới
8. Chấm điểm AI (band score + nhận xét) — API key phải ở backend, không để client.
9. Trang quản trị giáo viên (xem/lọc bài nộp trong app).
10. Mã PIN/mã lớp chống làm trước giờ thi.
11. Hỗ trợ mobile / xử lý khi fullscreen bị từ chối.
