# 📝 HƯỚNG DẪN NHẬP ĐỀ TRẮC NGHIỆM (Reading / Listening)

> Dành cho **giáo viên**. Không cần biết code. Mỗi đề = **1 tab** trong Google Sheet.
> File mẫu điền sẵn: [`samples/RL-Reading-01.csv`](../samples/RL-Reading-01.csv) và [`samples/RL-Listening-01.csv`](../samples/RL-Listening-01.csv).
> Phương án tổng thể: [`READING-LISTENING-PLAN.md`](READING-LISTENING-PLAN.md).

---

## ⭐ Cách DỄ NHẤT: dùng "Trình tạo đề"
Mở **[`tools/tao-de.html`](../tools/tao-de.html)** (mở bằng trình duyệt) → điền thông tin + dán câu hỏi ở dạng đơn giản → bấm **Tạo nội dung** → **Copy dán vào ô A1** của tab `RL-…` (hoặc tải CSV). Khỏi phải tự căn cột theo schema bên dưới.

> Phần dưới đây mô tả schema gốc (để hiểu/đối chiếu); nếu dùng trình tạo đề thì không cần nhớ.

## 0. Quy tắc chung (đọc trước)

- **1 đề = 1 tab.** Đặt tên tab bắt đầu bằng `RL-` để app hiểu đây là bài trắc nghiệm:
  - Reading: `RL-Reading-01`, `RL-Reading-02`…
  - Listening: `RL-Listening-01`, `RL-Listening-02`…
- App **tự gom** các tab `RL-…` vào nhóm Reading/Listening cho học sinh chọn.
- **Đáp án (cột F) chỉ nằm trong Sheet** — học sinh KHÔNG bao giờ thấy đáp án trước khi nộp (app chấm ở máy chủ).
- Một tab gồm 3 khối theo thứ tự: **META** → (Reading mới có) **PASSAGE** → **QUESTIONS**.

### Cách nhanh nhất: nhân bản từ file mẫu
1. Mở file mẫu CSV (trong thư mục `samples/`) → mở bằng Google Sheets.
2. Copy toàn bộ sang một tab mới trong bảng tính đề của bạn, đổi tên tab thành `RL-Reading-02`…
3. Sửa nội dung đoạn văn, câu hỏi, đáp án theo đề của bạn.

---

## 1. Khối META (vài dòng đầu, cột A = tên, cột B = giá trị)

| Cột A | Cột B | Ghi chú |
|---|---|---|
| `META` | *(để trống)* | dòng đánh dấu bắt đầu |
| `loai` | `reading` hoặc `listening` | bắt buộc |
| `thoiGianPhut` | `60` | Reading: 60. **Listening để TRỐNG** (kết thúc khi hết audio) |
| `audioURL` | link Google Drive | **chỉ Listening** (xem mục 5) |
| `raByAudio` | `true` | chỉ Listening — hết audio là kết thúc bài |

---

## 2. Khối PASSAGE (chỉ Reading)

- Mở đầu bằng một dòng `@PASSAGE 1` (cột A), **dòng ngay dưới** là **toàn bộ đoạn văn** dán vào **một ô** (cột A).
- Nhiều đoạn → lặp lại `@PASSAGE 2`, `@PASSAGE 3`.
- Có ảnh/bảng/sơ đồ kèm đoạn → thêm dòng `@IMAGE <link ảnh>` (xem mục 6).

> Listening **không có** khối PASSAGE (học sinh nghe audio).

---

## 3. Khối QUESTIONS

- Mở đầu bằng dòng `@QUESTIONS` (cột A).
- **Dòng tiếp theo là tiêu đề cột** (giữ nguyên):

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Part | Mã | Loại | Câu hỏi | Phương án | Đáp án | Điểm | Ảnh |

- Mỗi câu là **một dòng**. Giải thích từng cột:

| Cột | Ý nghĩa | Ví dụ |
|---|---|---|
| **Part** | Passage 1–3 (Reading) / Part 1–4 (Listening) | `1` |
| **Mã** | Q1…Q40 | `Q5` |
| **Loại** | `single` / `multi` / `tfng` / `fill` / `match` / `complete` | `single` |
| **Câu hỏi** | Nội dung câu hỏi | `When did tea reach Britain?` |
| **Phương án** | Các lựa chọn, ngăn nhau bằng dấu `\|` | `A. ... \| B. ... \| C. ...` |
| **Đáp án** | Đáp án đúng (xem mục 4 theo từng loại) | `B` |
| **Điểm** | Điểm câu (mặc định `1`) | `1` |
| **Ảnh** | Link ảnh riêng cho câu (nếu có) | *(thường để trống)* |

---

## 4. Cách ghi từng loại câu (QUAN TRỌNG)

> ✅ = có ở **Phase 1** (dùng được ngay) · 🕒 = **Phase 2** (đang phát triển). Hiện soạn đề nên ưu tiên loại ✅.

### ✅ `single` — Trắc nghiệm chọn 1 (A/B/C/D)
- **Phương án**: liệt kê, ngăn bằng `|`. Số phương án tùy ý (3 hay 4 đều được).
- **Đáp án**: chữ cái đúng, vd `B`.
```
1 | Q1 | single | When did tea become fashionable in Britain? | A. 2737 BCE | B. The 1660s | C. The 18th century | D. The 20th century | B | 1 |
```

### ✅ `multi` — Chọn nhiều (2–3 đáp án)
- **Đáp án**: các chữ cái đúng, **ngăn bằng dấu phẩy**, vd `A,C`.
- ⚠️ Trong Google Sheets gõ bình thường `A,C`; nếu xuất CSV nhớ để trong ô (hệ thống tự bọc).
```
1 | Q4 | multi | Which TWO countries are the largest producers? | A. China | B. Japan | C. India | D. Kenya | A,C | 1 |
```

### ✅ `tfng` — True / False / Not Given
- **Phương án**: để trống (app tự hiện 3 nút).
- **Đáp án**: `TRUE` / `FALSE` / `NG` (cũng chấp nhận `T`/`F`/`NG`, hay Yes/No/NG).
```
1 | Q2 | tfng | Tea was first discovered in India. | | FALSE | 1 |
```

### ✅ `fill` — Điền từ / trả lời ngắn (gõ chữ)
- **Phương án**: để trống.
- **Đáp án**: từ đúng. Nhiều cách viết được chấp nhận → **ngăn bằng dấu `/`**.
- App chấm **không phân biệt hoa/thường và khoảng trắng thừa**.
```
1 | Q5 | fill | Tea is consumed second only to ____. | | water | 1 |
2 | Q1 | fill | The room is on the ____ floor. | | second / 2nd | 1 |
```

### 🕒 `match` — Nối (Phase 2)
- **Đáp án** dạng `1-B,2-D,3-A`. (Hướng dẫn chi tiết bổ sung khi mở Phase 2.)

### 🕒 `complete` — Hoàn thành câu/bảng/sơ đồ (Phase 2)
- Sẽ hỗ trợ điền nhiều ô; quy ước cụ thể bổ sung khi mở Phase 2.

---

## 5. Audio cho Listening (Google Drive)

1. Upload file **MP3** lên Google Drive (giữ **≤ ~30MB**, giọng nói 128kbps mono là đủ).
2. Bấm **Chia sẻ** → đặt **"Bất kỳ ai có đường liên kết"**.
3. Trong link `https://drive.google.com/file/d/FILE_ID/view`, lấy phần **`FILE_ID`**.
4. Vào META `audioURL`, dán: `https://drive.google.com/uc?export=download&id=FILE_ID`.

> Audio sẽ **phát 1 lần, không tua được**. Học sinh cần **tai nghe** (vì nhiều máy phát cùng lúc).

---

## 6. Ảnh / bảng / sơ đồ cho Reading

- Upload ảnh lên Drive (hoặc nơi cho link công khai) → lấy link ảnh trực tiếp.
- Gắn cho cả đoạn: dòng `@IMAGE <link>` ngay dưới `@PASSAGE`.
- Gắn cho 1 câu: điền link vào **cột H (Ảnh)** của câu đó.

---

## 7. Lỗi thường gặp (tránh)

- ❌ Tên tab không bắt đầu bằng `RL-` → app không nhận là bài trắc nghiệm.
- ❌ Quên dòng `@QUESTIONS` hoặc dòng tiêu đề cột.
- ❌ Dùng dấu `|` trong nội dung phương án (trùng ký tự ngăn cách). Nếu cần, viết chữ khác.
- ❌ `multi` mà ghi đáp án dính nhau `AC` → phải là `A,C`.
- ❌ Listening điền `thoiGianPhut` (sẽ ghi đè việc "hết audio là kết thúc"). Để trống.
- ❌ Link Drive để dạng `/view` thay vì `uc?export=download&id=...`.

---

## 8. Checklist trước khi giao đề
- [ ] Tab tên đúng `RL-Reading-XX` / `RL-Listening-XX`.
- [ ] META đủ `loai` (+ `audioURL` nếu Listening).
- [ ] Reading có `@PASSAGE`; Listening có `audioURL` chạy được.
- [ ] `@QUESTIONS` + dòng tiêu đề + đủ 40 câu (mỗi phần).
- [ ] Mỗi câu đúng định dạng loại (mục 4); đã điền cột Đáp án.
- [ ] (Listening) đã test mở link audio trên trình duyệt thấy phát được.
