# English Writing Test — Phần mềm thi viết tiếng Anh có khóa màn hình

> Web app cho phép giáo viên ra đề viết tiếng Anh, học sinh làm bài trong chế độ **toàn màn hình bị khóa**, mọi hành vi rời màn hình đều bị **ghi log**, và bài làm tự gửi về **Gmail + Google Sheet** của giáo viên khi nộp.
>
> Ngày tạo: 2026-06-17

## ✨ Tính năng
- **Đa chủ đề từ Google Sheet**: mỗi tab = 1 chủ đề, học sinh chọn chủ đề → app tự tải đề tương ứng (chọn ngẫu nhiên nếu chủ đề có nhiều đề). Giáo viên chỉ cần gõ đề vào Sheet, không đụng code.
- Bài nộp **đính kèm nguyên văn đề bài** để giáo viên đối chiếu.
- Học sinh nhập **họ tên + email** trước khi vào bài.
- **Popup xác nhận trước khi bắt đầu:** hiển thị lại thông tin để kiểm tra + nhắc rõ "đã bắt đầu là không dừng được, mọi thao tác thu nhỏ/chuyển cửa sổ đều bị tính vi phạm và bài có thể không hợp lệ". Có nút **Xác nhận** và **Hủy**.
- **Ép toàn màn hình** (Fullscreen API); thoát ra là cảnh báo đỏ + ép vào lại + đếm vi phạm.
- **Phát hiện & ghi log gian lận**: Alt+Tab, chuyển tab, thoát fullscreen — kèm timestamp.
- **Chặn**: chuột phải, copy/paste/cut (chống dán bài), F12/F11, các phím tắt devtools.
- **Mật khẩu giáo viên** (`Ctrl+Shift+U`) để mở khóa khẩn cấp không cần nộp.
- **Đếm từ**, **giới hạn số từ tối thiểu**, **đồng hồ đếm ngược** (hết giờ tự nộp).
- **Tự lưu nháp (chống mất bài):** reload hay lỡ đóng tab → khôi phục lại bài viết, số vi phạm và đồng hồ. Reload khi đang làm bài bị ghi là 1 vi phạm (không dùng reload để "làm mới").
- **Nền trang trí hiện đại** (thuần CSS, không cần ảnh): quầng sáng cam–đỏ + lưới chấm tech + vòng tròn mảnh, lấp vùng trống 2 bên. Muốn tắt: xóa khối `<div class="bg-decor">` trong HTML.
- **Giới hạn 1 lần nộp/email** (`ONE_SUBMISSION_PER_EMAIL`): email đã nộp sẽ bị chặn làm lại. Kiểm tra 2 lớp — server (đối chiếu sheet `BaiNop`, không bypass được bằng đổi máy) + localStorage (nhanh, offline).
- Submit → gửi bài + toàn bộ nhật ký về **Gmail + Google Sheet** (qua Google Apps Script).

## ⚠️ Giới hạn quan trọng (đọc kỹ)
Đây là web app chạy trong trình duyệt nên **KHÔNG thể chặn tuyệt đối**:
- **Không chặn được Ctrl+Alt+Del** (cơ chế bảo mật của Windows — không app nào chặn được).
- Học sinh **vẫn có thể** Alt+Tab/thoát ra, nhưng **mọi lần đều bị ghi log** và gửi cho giáo viên.

➡️ Triết lý: **răn đe + phát hiện** thay vì ngăn chặn tuyệt đối. Học sinh biết mọi cú thoát đều bị ghi lại kèm giờ giấc.

> Cần khóa cứng hơn (thi điểm cao)? Cân nhắc **Safe Exam Browser** (miễn phí) — cấu hình kiosk cấp hệ thống, dùng kèm web app này được.

## 📁 Cấu trúc
```
test-viet-tieng-anh/
├── src/index.html              ← Toàn bộ web app (1 file, không cần build)
├── docs/google-apps-script.md  ← Hướng dẫn dựng backend Gmail + Sheet
├── scripts/                    ← (trống) helper sau này
├── outputs/                    ← kết quả xuất ra
├── .env.example
└── README.md
```

## 🚀 Cài đặt & sử dụng

### 1. Dựng backend + nhập đề
Làm theo `docs/google-apps-script.md`: tạo các tab chủ đề (gõ đề ở cột A), tab `BaiNop`, dán script, deploy → lấy **URL Apps Script**.

### 1b. Thêm logo thương hiệu (BẮT BUỘC để hiện logo)
App dùng tông màu thương hiệu **IELTS Ms. TRÀ MY** (nền tím, điểm nhấn cam–đỏ). Logo được nhúng dưới dạng ảnh, **không vẽ lại trong code**:
1. Lưu file logo vào: **`src/logo.png`** (đúng tên, đúng thư mục `src`).
2. Mở lại app → logo hiện ở màn đăng nhập, góc trái khi làm bài, và màn hoàn thành.

> 💡 **Mẹo cho logo đẹp nhất:** logo bạn gửi là ảnh **vuông nền tím**. Nếu nền tím của ảnh và nền app hơi lệch màu sẽ thấy viền vuông mờ. Hai cách khắc phục:
> - **Tốt nhất:** dùng file logo **nền trong suốt (PNG transparent)** — chỉ có hoa + chữ, không có ô vuông tím → đặt lên nền nào cũng khớp.
> - Hoặc chỉnh biến `--bg` trong `src/index.html` cho khớp đúng màu tím của logo.
>
> Nếu chưa có `logo.png`, app vẫn chạy bình thường (chỉ ẩn chỗ logo).

### 2. Cấu hình app
Mở `src/index.html`, sửa khối `CONFIG` ở đầu thẻ `<script>`:
```javascript
const CONFIG = {
  ENDPOINT: "https://script.google.com/macros/s/..../exec", // URL backend
  TEACHER_PASSWORD: "doimatkhau123",  // ĐỔI mật khẩu này
  MIN_WORDS: 0,          // số từ tối thiểu MẶC ĐỊNH (0 = tắt)
  TIME_LIMIT_MIN: 40,    // thời gian MẶC ĐỊNH (phút), 0 = không giới hạn

  // Quy định RIÊNG theo từng topic (time = phút, minWords = số từ tối thiểu).
  // Khớp tên KHÔNG phân biệt hoa/thường, dấu cách thừa và dấu "/".
  TOPIC_RULES: {
    "Writing Task 1":    { time: 30, minWords: 150 },
    "Reading Listening": { time: 60, minWords: 0   },
    "Luyện đề task 2":   { time: 40, minWords: 250 },
    "Luyện đề task 1":   { time: 20, minWords: 150 },
  },
  // "Topic có số" (topic-1, topic-2...) khi không có luật riêng:
  NUMBERED_TOPIC: { time: 60, minWords: 0 },
};
```

> 📌 **Số phút & số từ theo topic** lấy theo thứ tự ưu tiên: `TOPIC_RULES` → luật "topic có số" → giá trị mặc định (`TIME_LIMIT_MIN` / `MIN_WORDS`).

### 3. Chạy thử (local)
Chỉ cần **mở `src/index.html` bằng trình duyệt** (double-click). Hoặc chạy server tĩnh:
```bash
cd src && python -m http.server 8000   # rồi mở http://localhost:8000
```

### 4. Phát hành cho học sinh (chọn 1)
- **Netlify Drop**: kéo thả thư mục `src` vào https://app.netlify.com/drop → có link ngay.
- **GitHub Pages / Cloudflare Pages**: push `src` lên repo, bật Pages.
- Gửi **link** đó cho học sinh. Không cần cài đặt gì.

## 🔑 Phím tắt
- `Ctrl + Shift + U` — mở hộp nhập mật khẩu giáo viên để thoát khóa.

## 🧪 Kiểm thử nhanh
1. Mở app → nhập tên/email → Bắt đầu (cho phép fullscreen).
2. Thử Alt+Tab → phải hiện overlay cảnh báo, số vi phạm +1.
3. Gõ bài đủ số từ → Submit → kiểm tra Gmail + Google Sheet có dữ liệu.
