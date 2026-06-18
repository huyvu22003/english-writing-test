# 📦 TÀI LIỆU BÀN GIAO & HƯỚNG DẪN TRIỂN KHAI

**Dự án:** English Writing Test — Phần mềm thi viết tiếng Anh có khóa màn hình (thương hiệu **IELTS Ms. TRÀ MY**)
**Ngày bàn giao:** 2026-06-18
**Người sở hữu:** Huy — email nhận bài: `ieltsmstramy@gmail.com`

> Tài liệu này dành cho **kỹ thuật viên / AI triển khai** lên server có tên miền riêng. Đọc hết phần 1–4 trước khi deploy.

---

## 1. TỔNG QUAN

App cho học sinh làm **bài thi viết tiếng Anh** trên trình duyệt, có cơ chế **khóa toàn màn hình + chống gian lận**. Bài nộp tự gửi về **Gmail + Google Sheet** của giáo viên.

**Đặc điểm kiến trúc quan trọng:**
- **Frontend = web tĩnh 1 file** (`src/index.html`) — KHÔNG cần build, KHÔNG cần Node.js/PHP/database trên server. Chỉ cần phục vụ file tĩnh.
- **Backend = Google Apps Script** (đã deploy sẵn, chạy trên hạ tầng Google) — nhận bài, lưu Google Sheet, gửi email. **Không cần dựng lại.**
- Server của bạn **chỉ làm 1 việc: serve thư mục `src/` qua HTTPS.**

```
Học sinh ──HTTPS──> [Server của bạn: serve src/index.html]
                          │ (JSONP/POST)
                          ▼
                  Google Apps Script (đã deploy)
                          │
                          ▼
                Gmail + Google Sheet "BaiNop"
```

---

## 2. CẤU TRÚC DỰ ÁN

```
test-viet-tieng-anh/
├── src/
│   ├── index.html          ← TOÀN BỘ ỨNG DỤNG (HTML/CSS/JS trong 1 file)
│   └── logo.png            ← logo thương hiệu (BẮT BUỘC serve kèm)
├── docs/
│   ├── google-apps-script.md  ← mã backend + hướng dẫn (tham khảo, đã deploy rồi)
│   └── deployment.md          ← hướng dẫn deploy (GitHub Pages / Cloudflare)
├── .github/workflows/deploy.yml  ← workflow auto-deploy GitHub Pages (tùy chọn)
├── .gitignore
├── .env.example            ← ghi chú biến cấu hình (giá trị thật nằm trong index.html)
├── README.md               ← mô tả tính năng đầy đủ
└── BAN-GIAO.md             ← file này
```

**➡️ Thư mục gốc website = `src/`.** Chỉ cần 2 file `index.html` + `logo.png` là chạy được.

---

## 3. TRẠNG THÁI HIỆN TẠI (đã hoàn thành & test)

- ✅ Backend Google Apps Script **đã deploy** (quyền truy cập: *Bất kỳ ai*).
- ✅ `CONFIG.ENDPOINT` trong `index.html` đã trỏ tới backend thật.
- ✅ Đã test thật: tải đề từ Sheet, nộp bài → về Gmail + tab `BaiNop` OK.
- ✅ Google Sheet đã có 10 chủ đề `topic-1`…`topic-10` + tab `BaiNop`.

**Tính năng đã có:** ép fullscreen, ghi log mọi lần rời màn hình, chặn copy/paste/chuột phải/phím tắt, đếm từ + số từ tối thiểu, đồng hồ đếm ngược, tự lưu nháp (khôi phục khi reload), giới hạn 1 lần nộp/email, popup xác nhận trước khi bắt đầu, nền trang trí theo thương hiệu.

---

## 4. CẤU HÌNH — CHỈNH TRƯỚC KHI GO-LIVE ⚠️

Tất cả nằm trong khối `const CONFIG = {…}` ở đầu thẻ `<script>` trong `src/index.html`:

| Biến | Giá trị hiện tại | Ghi chú |
|---|---|---|
| `ENDPOINT` | (đã trỏ Apps Script) | **Không đổi** trừ khi deploy backend mới |
| `TEACHER_PASSWORD` | (đã đặt mật khẩu riêng) | Mật khẩu GV mở khóa khẩn cấp (Ctrl+Shift+U). Đã đổi khỏi mặc định; chủ sở hữu có thể đổi tiếp trong `index.html` |
| `MIN_WORDS` | `120` | Số từ tối thiểu để nộp (0 = tắt) |
| `TIME_LIMIT_MIN` | `30` | Thời gian làm bài (phút), 0 = không giới hạn |
| `ONE_SUBMISSION_PER_EMAIL` | `true` | Mỗi email chỉ nộp 1 lần |

> Lưu ý: `TEACHER_PASSWORD` nằm ở phía client, ai xem mã nguồn trang đều thấy → chỉ là nút mở khóa tiện lợi, đừng trùng mật khẩu quan trọng. (Đã đổi khỏi mặc định.)

---

## 5. HƯỚNG DẪN TRIỂN KHAI LÊN SERVER (phần chính cho người deploy)

### ⚠️ YÊU CẦU BẮT BUỘC: HTTPS
App dùng **Fullscreen API**, chỉ hoạt động trong **secure context (HTTPS)** hoặc `localhost`. Nếu chạy qua `http://` trên tên miền thật, **chế độ khóa toàn màn hình sẽ KHÔNG hoạt động**. → **Phải cấu hình HTTPS (SSL).**

### 5A. Triển khai trên server riêng (nginx) — khuyến nghị nếu có VPS + tên miền

**Bước 1 — Đưa mã nguồn lên server**
```bash
# Trên server, clone từ GitHub (xem phần 6 để tạo repo)
git clone https://github.com/<user>/test-viet-tieng-anh.git /var/www/test-viet-tieng-anh
```

**Bước 2 — Cấu hình nginx** (file `/etc/nginx/sites-available/test-writing`):
```nginx
# Chuyển HTTP -> HTTPS
server {
    listen 80;
    server_name test.tenmien-cua-ban.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name test.tenmien-cua-ban.com;

    # SSL (sẽ do certbot điền tự động ở bước 3)
    ssl_certificate     /etc/letsencrypt/live/test.tenmien-cua-ban.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/test.tenmien-cua-ban.com/privkey.pem;

    # GỐC WEBSITE = thư mục src/ của dự án
    root /var/www/test-viet-tieng-anh/src;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/test-writing /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

**Bước 3 — Cấp SSL miễn phí (Let's Encrypt)**
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d test.tenmien-cua-ban.com
```
> Trỏ bản ghi DNS `A` của `test.tenmien-cua-ban.com` về IP server **trước khi** chạy certbot.

**Bước 4 — Kiểm tra:** mở `https://test.tenmien-cua-ban.com` → thấy màn đăng nhập có logo + 10 chủ đề.

### 5B. Triển khai trên Apache (thay cho nginx)
```apache
<VirtualHost *:443>
    ServerName test.tenmien-cua-ban.com
    DocumentRoot /var/www/test-viet-tieng-anh/src
    SSLEngine on
    SSLCertificateFile    /etc/letsencrypt/live/test.tenmien-cua-ban.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/test.tenmien-cua-ban.com/privkey.pem
    <Directory /var/www/test-viet-tieng-anh/src>
        Require all granted
    </Directory>
</VirtualHost>
```

### 5C. Phương án không cần server riêng (nếu chỉ có tên miền)
- **Cloudflare Pages** hoặc **GitHub Pages**: kết nối repo GitHub, đặt **build output directory = `src`** (không build command), rồi trỏ Custom Domain về tên miền của bạn. HTTPS tự động. Chi tiết trong `docs/deployment.md`.

> **Tóm tắt cho người deploy:** đây là static site. Mọi web server tĩnh đều chạy được. Chỉ cần: (1) gốc = thư mục `src/`, (2) bật HTTPS, (3) đảm bảo `logo.png` được serve cùng `index.html`. KHÔNG cài runtime, KHÔNG mở port backend.

---

## 6. ĐƯA LÊN GITHUB (để Claude/AI kết nối & code trực tiếp về sau)

Repo Git đã được khởi tạo sẵn (đã commit lần đầu). Việc còn lại là tạo repo trên GitHub và push:

```bash
cd test-viet-tieng-anh

# 1) Tạo repo rỗng trên github.com (vd tên: test-viet-tieng-anh), KHÔNG thêm README

# 2) Gắn remote và push
git remote add origin https://github.com/<user>/test-viet-tieng-anh.git
git branch -M main
git push -u origin main
```

> Hoặc dùng GitHub CLI: `gh repo create test-viet-tieng-anh --private --source=. --remote=origin --push`

**Để tiếp tục code bằng Claude Code:** sau khi có repo trên GitHub, chỉ cần `git clone` về máy rồi mở thư mục bằng Claude Code — toàn bộ lịch sử + tài liệu đi kèm. Repo GitHub là **nguồn chuẩn duy nhất**; mọi thay đổi đẩy lên đây, server chỉ cần `git pull` để cập nhật.

**Quy trình cập nhật nội dung/giao diện sau này:**
```
Sửa code (Claude Code) → git push  →  trên server: git pull && systemctl reload nginx
```
(Nếu dùng Cloudflare/GitHub Pages kết nối Git thì push xong tự deploy, khỏi thao tác server.)

---

## 7. VẬN HÀNH HẰNG NGÀY (cho giáo viên)

- **Ra đề:** mở Google Sheet → vào tab chủ đề (`topic-1`…) → gõ đề ở **cột A, từ dòng 2** (mỗi dòng 1 đề; nhiều đề → app chọn ngẫu nhiên cho từng học sinh). Thêm chủ đề mới = thêm **tab mới**, đặt tên là tên chủ đề. **Không cần đụng code, không cần deploy lại.**
- **Nhận bài:** mỗi bài nộp → 1 email về `ieltsmstramy@gmail.com` + 1 dòng trong tab `BaiNop` (kèm tên, email, chủ đề, đề bài, bài viết, **số lần vi phạm**, nhật ký giờ giấc).
- **Phát hiện gian lận:** cột "Số vi phạm" > 0 nghĩa là học sinh đã rời màn hình; xem cột "Nhật ký" để biết chi tiết giờ giấc.

---

## 8. BẢO MẬT & GIỚI HẠN (đọc kỹ)

- 🔴 **Đổi `TEACHER_PASSWORD`** trước khi go-live (xem mục 4).
- `ENDPOINT` (URL Apps Script) là **công khai** — bình thường, an toàn. Đừng để thông tin nhạy cảm trong code Apps Script.
- `TEACHER_EMAIL` chỉ nằm trong Apps Script (phía Google) → **không lộ** ra web.
- **Giới hạn cố hữu của web app (KHÔNG phải lỗi):**
  - **Không chặn được Ctrl+Alt+Del** (cơ chế hệ điều hành — không web app nào chặn được).
  - Học sinh vẫn có thể Alt+Tab/thoát, nhưng **mọi lần đều bị ghi log** gửi cho giáo viên. Triết lý: **răn đe + phát hiện**, không phải ngăn chặn tuyệt đối.
  - Cần khóa cứng cấp hệ thống (thi điểm cao) → cân nhắc dùng kèm **Safe Exam Browser**.

---

## 9. CHECKLIST NGHIỆM THU SAU DEPLOY

- [ ] Mở `https://<tên-miền>` → màn đăng nhập hiện **logo** + dropdown đủ **10 chủ đề**.
- [ ] Chứng chỉ **HTTPS hợp lệ** (ổ khóa xanh).
- [ ] Nhập tên/email/chủ đề → popup xác nhận hiện ra.
- [ ] Xác nhận → vào **fullscreen**, đồng hồ đếm ngược chạy.
- [ ] Thử **Alt+Tab** → hiện cảnh báo đỏ + đếm vi phạm.
- [ ] Gõ đủ từ → **Nộp** → có email về Gmail + 1 dòng trong tab `BaiNop`.
- [x] Đã **đổi `TEACHER_PASSWORD`** khỏi mặc định.

---

## 10. THÔNG TIN KỸ THUẬT NHANH (cho AI deploy)

| Mục | Giá trị |
|---|---|
| Loại ứng dụng | Static site (1 file HTML + 1 ảnh) |
| Runtime cần trên server | **Không** (chỉ serve file tĩnh) |
| Thư mục gốc web | `src/` |
| File vào | `src/index.html` |
| Yêu cầu bắt buộc | **HTTPS** (cho Fullscreen API) |
| Backend | Google Apps Script (đã deploy, ngoài server) |
| Build step | Không có |
| Cổng/port mở thêm | Không |
| Phụ thuộc ngoài | Chỉ gọi `script.google.com` (qua trình duyệt học sinh) |
