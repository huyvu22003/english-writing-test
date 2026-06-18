# Triển khai (Deployment) — chạy độc lập, không phụ thuộc máy dev

App là **static site 1 file** (`src/index.html`), không cần build, không backend riêng (backend là Google Apps Script đã tách rời). Vì vậy deploy rất nhẹ. Dưới đây là 2 phương án; **Cloudflare Pages** đơn giản nhất, **GitHub Pages** tiện nếu đã quen Git.

> ⚠️ Trước khi deploy: mở `src/index.html`, đảm bảo khối `CONFIG` đã điền đúng `ENDPOINT` (URL Apps Script đã deploy) và đã đổi `TEACHER_PASSWORD`.

---

## Phương án A — Cloudflare Pages (khuyến nghị, không cần Git cũng được)

### A1. Kéo-thả (nhanh nhất)
1. Vào https://dash.cloudflare.com → **Workers & Pages → Create → Pages → Upload assets**.
2. Đặt tên project, kéo-thả **nội dung thư mục `src`** (file `index.html`) vào.
3. Deploy → nhận link dạng `https://ten-project.pages.dev`. Gửi link này cho học sinh.

### A2. Kết nối Git (tự cập nhật khi sửa code)
1. Push repo lên GitHub (xem phần Git bên dưới).
2. Cloudflare Pages → **Connect to Git** → chọn repo.
3. Build settings:
   - **Framework preset**: None
   - **Build command**: *(để trống)*
   - **Build output directory**: `src`
4. Save & Deploy. Mỗi lần `git push` là tự deploy lại.

---

## Phương án B — GitHub Pages (qua GitHub Actions)

Đã có sẵn workflow `.github/workflows/deploy.yml` trong project — nó publish thư mục `src`.

1. Push repo lên GitHub.
2. Repo → **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Workflow tự chạy khi push lên nhánh `main`. Link dạng `https://<user>.github.io/<repo>/`.

> GitHub Pages mặc định chỉ serve được root hoặc `/docs`; ở đây ta dùng Actions để publish riêng thư mục `src` nên cấu trúc project giữ nguyên gọn gàng.

---

## Khởi tạo Git & push lên GitHub
```bash
cd "D:/1.CLAUDE AI/projects/test-viet-tieng-anh"
git init
git add .
git commit -m "App test viết tiếng Anh — bản đầu"
git branch -M main
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

---

## ⚠️ Lưu ý bảo mật khi deploy public
- **`TEACHER_PASSWORD` nằm trong mã nguồn client** → ai "View Source" trang web đều thấy. Nó chỉ là tiện ích mở khóa khẩn cấp, **không phải bảo mật thật**. Đừng dùng mật khẩu trùng với mật khẩu quan trọng khác.
- **`ENDPOINT` (URL Apps Script) là công khai** — điều này bình thường và an toàn (chỉ nhận POST bài nộp và trả đề bài). Không đặt thông tin nhạy cảm trong code Apps Script.
- Email giáo viên (`TEACHER_EMAIL`) **chỉ nằm trong Apps Script** (phía Google), **không** lộ ra trang web → đây là lý do ta tách backend.
- Muốn chống học sinh tự mở link làm trước giờ thi: cân nhắc thêm **mã PIN/mã lớp** (hỏi Claude bổ sung sau).

---

## Tóm tắt luồng sau khi deploy
```
Học sinh ──(link pages.dev / github.io)──> Web app (Cloudflare/GitHub)
                                              │  lấy đề (JSONP)
                                              ▼
                                   Google Apps Script ──> Gmail + Sheet "BaiNop"
```
Không có thành phần nào phụ thuộc vào máy dev. Máy dev chỉ dùng để sửa code rồi push/upload lại.
