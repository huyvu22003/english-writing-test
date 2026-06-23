# 🎧📖 PHƯƠNG ÁN: Chế độ trắc nghiệm Reading / Listening

> Trạng thái: **ĐÃ CHỐT phương án (2026-06-23)** — làm theo **2 phase, MVP trước**.
> Nguồn yêu cầu: phiếu "Phiếu yêu cầu tính năng — Reading/Listening" (NTTM, lớp 12p, 23/06/2026).
> Đọc kèm `ARCHITECTURE.md` (cơ chế app) và `CONTRIBUTING.md` (quy tắc ghi log).

---

## 1. Quyết định đã chốt

| Vấn đề | Quyết định |
|---|---|
| Cấu trúc | Reading & Listening là **2 topic riêng** trên app; mỗi phần **40 câu** |
| Thời gian | Reading **60 phút**; Listening **kết thúc khi hết audio (~30 phút)** |
| Đề | Học sinh **có thể cùng đề, cùng thứ tự câu** (không bắt mỗi em một đề) |
| Xáo trộn | **Chỉ xáo thứ tự đáp án A/B/C/D**, giữ nguyên thứ tự câu |
| Audio | **Mỗi máy tự phát**, **nghe 1 lần**, **chặn tua** (HS cần tai nghe — trường lo) |
| Nơi lưu MP3 | **Google Drive** (GV tự upload/đổi; giữ file ≤ ~30MB, 128kbps mono). Dự phòng: host cùng web |
| Chấm điểm | **Ở backend** (Apps Script) — client KHÔNG giữ đáp án trước khi nộp |
| Quy đổi band | **Bảng chuẩn IELTS Academic** (mục 5), đặt trong Sheet/CONFIG để chỉnh |
| Kết quả | Điểm thô (x/40) + **band** + **bảng từng câu đúng/sai** |
| Lưu/Gửi | Tab riêng `BaiNop-RL`; email **GV + HS**; có **bảng tổng hợp điểm cả lớp** |
| Làm lại | **Không giới hạn** số lần/email |
| **E2 (hết audio)** | **Mặc định: hết audio → cho 2 phút rà soát rồi tự nộp** (chỉnh được; đặt 0 = nộp ngay) |

---

## 2. Phân phase (MVP trước)

### 🟢 Phase 1 — MVP (chạy được Reading + Listening cơ bản)
Mục tiêu: thi thật được với các dạng câu phổ biến nhất.
- Khung chế độ quiz (C1–C4), tái dùng khóa màn/đồng hồ/log đã có.
- Dạng câu: **D1 chọn 1, D2 chọn nhiều, D3 TFNG, D4 điền từ/đáp án ngắn**.
- Audio Listening: **E1 nghe 1 lần + chặn tua, E2, E3**.
- Chấm backend + band + kết quả từng câu: **A1, A2, A3, A4, G1**.
- Schema + file mẫu + hướng dẫn nhập đề: **B1, B2, B3, B4**.
- Hỗ trợ deploy lại Apps Script: **H3**; tài liệu **H1**; test **H2**.

### 🟡 Phase 2 — Bổ sung
- Dạng câu khó: **D5 nối (matching), D6 hoàn thành câu/bảng/sơ đồ**.
- **F1 xáo thứ tự đáp án A/B/C/D** (+ ánh xạ lại khi chấm).
- **A5 bảng tổng hợp điểm cả lớp**, **A6** hoàn thiện bảng band trong Sheet.
- Hỗ trợ **ảnh/bảng/sơ đồ** Reading nâng cao.

> ⚠️ **Phụ thuộc bắt buộc**: backend Apps Script **phải được deploy lại** ở tài khoản Google của chủ sở hữu thì mới chấm/lưu thật được. Claude viết code, chủ sở hữu dán + deploy (xem `google-apps-script.md`).

---

## 3. Checklist đầy đủ
Độ lớn: **S** vài giờ · **M** ~½–1 ngày · **L** nhiều ngày. (P1 = Phase 1, P2 = Phase 2)

### A. Backend Apps Script — ⚠️ phải deploy lại phía Google
- [ ] A1 `[M]` `P1` Trả đề trắc nghiệm **KHÔNG kèm đáp án**.
- [ ] A2 `[M]` `P1` **Chấm ở server**: đối chiếu đáp án Sheet → điểm + band + từng câu.
- [ ] A3 `[S]` `P1` Ghi kết quả vào tab `BaiNop-RL`.
- [ ] A4 `[S]` `P1` Gửi email kết quả cho **GV + HS**.
- [ ] A5 `[M]` `P2` Bảng tổng hợp điểm cả lớp tự cập nhật.
- [ ] A6 `[S]` `P1/P2` Bảng quy đổi raw→band (đưa vào script, hoàn thiện ở P2).

### B. Dữ liệu & nhập đề
- [x] B1 `[M]` `P1` Chốt schema tab đề (mục 4). ✅
- [x] B2 `[M]` `P1` File Sheet mẫu + đề ví dụ → `samples/RL-Reading-01.csv`, `samples/RL-Listening-01.csv`. ✅
- [x] B3 `[M]` `P1` Hướng dẫn nhập đề từng dạng → `docs/reading-listening-sample.md`. ✅
- [x] B4 `[S]` `P1` Quy ước chèn ảnh Reading (link ảnh) — trong hướng dẫn mục 6. ✅

### C. Frontend — khung quiz
- [ ] C1 `[M]` `P1` Nhận diện topic R/L → vào chế độ trắc nghiệm.
- [ ] C2 `[M]` `P1` Tải đề (JSONP) + render passage/đề.
- [ ] C3 `[M]` `P1` Điều hướng câu + tiến độ x/40 + đánh dấu xem lại + rà trước khi nộp.
- [ ] C4 `[M]` `P1` Lưu nháp/khôi phục đáp án.

### D. Dạng câu hỏi
- [ ] D1 `[S]` `P1` Chọn 1 (A/B/C/D), số phương án thay đổi theo câu.
- [ ] D2 `[S]` `P1` Chọn nhiều (2–3).
- [ ] D3 `[S]` `P1` True/False/Not Given.
- [ ] D4 `[M]` `P1` Điền từ/đáp án ngắn (chuẩn hóa + nhiều đáp án đúng).
- [ ] D5 `[M]` `P2` Nối (matching).
- [ ] D6 `[L]` `P2` Hoàn thành câu/bảng/sơ đồ/ghi chú.

### E. Audio
- [ ] E1 `[M]` `P1` Phát ẩn seek, nghe 1 lần, chặn tua.
- [ ] E2 `[S]` `P1` Hết audio → 2 phút rà → tự nộp (cấu hình được).
- [ ] E3 `[S]` `P1` Lấy audio từ Google Drive (link tải trực tiếp).

### F. Chống gian lận bổ sung
- [ ] F1 `[M]` `P2` Xáo thứ tự đáp án + ánh xạ lại khi chấm.
- [ ] F2 `[S]` `P1` Tái dùng khóa fullscreen + log cho quiz.

### G. Kết quả
- [ ] G1 `[M]` `P1` Màn kết quả: điểm + band + bảng từng câu đúng/sai.

### H. Tài liệu, kiểm thử, triển khai
- [ ] H1 `[S]` `P1` Cập nhật ARCHITECTURE/CHANGELOG/README.
- [ ] H2 `[M]` `P1` Test offline (FALLBACK) + test thật sau deploy.
- [ ] H3 `[S]` `P1` Hướng dẫn GV deploy lại Apps Script.

---

## 4. Schema Google Sheet cho đề trắc nghiệm (bản chốt nháp)

Mỗi đề = **1 tab**, tên dạng `RL-Reading-01`, `RL-Listening-01`… App nhận diện qua tiền tố `RL-`.

**Khối META (các dòng đầu, cột A = khóa, cột B = giá trị):**
```
loai           reading | listening
thoiGianPhut   60            (Listening có thể để trống -> theo audio)
audioURL       https://drive.google.com/...   (chỉ Listening)
raByAudio      true          (Listening: hết audio là kết thúc)
```

**Khối PASSAGE (Reading, sau META):** đánh dấu bằng dòng `@PASSAGE <số>` rồi nội dung đoạn; ảnh chèn bằng dòng `@IMAGE <url>`.

**Khối CÂU HỎI (sau dòng `@QUESTIONS`):** mỗi câu 1 dòng, các cột:

| Cột | Tên | Ý nghĩa |
|---|---|---|
| A | Part | 1–3 (Reading) / 1–4 (Listening) |
| B | Mã | Q1…Q40 |
| C | Loại | `single` / `multi` / `tfng` / `fill` / `match` / `complete` |
| D | Câu hỏi | Nội dung câu |
| E | Phương án | Ngăn bằng `\|` (vd `A. ... \| B. ... \| C. ...`); để trống với `fill` |
| F | Đáp án đúng | `single`: `B` · `multi`: `A,C` · `tfng`: `T/F/NG` · `fill`: `word1 / word2` (các đáp án chấp nhận) · `match`: `1-B,2-D` |
| G | Điểm | mặc định 1 |
| H | Ảnh | URL ảnh riêng cho câu (nếu có) |

> ⚠️ Cột F (đáp án) **chỉ ở Sheet/backend**, không bao giờ gửi ra client trước khi nộp.

File mẫu + hướng dẫn chi tiết: sẽ tạo ở **B2/B3** (`docs/reading-listening-sample.md`).

---

## 5. Bảng quy đổi band chuẩn IELTS Academic (raw/40 → band)

> Chỉ mang tính chuẩn tham khảo, GV chỉnh trong Sheet nếu cần.

**Reading (Academic):**
| Raw | Band | Raw | Band |
|---|---|---|---|
| 39–40 | 9.0 | 23–26 | 6.0 |
| 37–38 | 8.5 | 19–22 | 5.5 |
| 35–36 | 8.0 | 15–18 | 5.0 |
| 33–34 | 7.5 | 13–14 | 4.5 |
| 30–32 | 7.0 | 10–12 | 4.0 |
| 27–29 | 6.5 | 8–9 | 3.5 |

**Listening:**
| Raw | Band | Raw | Band |
|---|---|---|---|
| 39–40 | 9.0 | 23–25 | 6.0 |
| 37–38 | 8.5 | 18–22 | 5.5 |
| 35–36 | 8.0 | 16–17 | 5.0 |
| 32–34 | 7.5 | 13–15 | 4.5 |
| 30–31 | 7.0 | 11–12 | 4.0 |
| 26–29 | 6.5 | 8–10 | 3.5 |

---

## 6. Audio Google Drive — cách lấy link phát trực tiếp
1. Upload MP3 lên Drive → chia sẻ **"Bất kỳ ai có đường liên kết"**.
2. Lấy `FILE_ID` trong link `.../d/FILE_ID/view`.
3. Dán vào Sheet (META `audioURL`) dạng: `https://drive.google.com/uc?export=download&id=FILE_ID`.
4. App phát bằng `<audio>` ẩn nút tua; chặn `seeking`; phát 1 lần.

---

## 7. Bước tiếp theo
Phase 1 bắt đầu từ **schema + file mẫu (B1–B3)** để GV nhập 15 đề song song, rồi tới **frontend quiz (C, D1–D4, E)** và **backend (A1–A4)**. Mỗi mốc xong → cập nhật CHANGELOG + mở PR.
