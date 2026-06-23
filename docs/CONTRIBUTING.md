# 🧭 QUY TẮC ĐÓNG GÓP & GHI LOG THAY ĐỔI

> Mục tiêu: **bất kỳ dev nào (kể cả AI) đọc lịch sử cũng hiểu được *cái gì đổi, vì sao, và ảnh hưởng ra sao*.** Mọi thay đổi code đều phải để lại dấu vết rõ ràng ở 3 nơi: **commit**, **CHANGELOG.md**, và (khi cần) **tài liệu**.

---

## 0. Nguyên tắc vàng

1. **Mỗi thay đổi đáng kể → 1 dòng trong `CHANGELOG.md`.** Không có ngoại lệ cho tính năng/sửa lỗi/đổi hành vi.
2. **Ghi *VÌ SAO*, không chỉ *CÁI GÌ*.** Code đã nói "cái gì"; commit/changelog phải nói "vì sao" và "đánh đổi gì".
3. **1 PR = 1 mục đích.** Đừng trộn nhiều việc không liên quan vào một PR.
4. **Không phá hạn chế đã biết mà không ghi chú.** Nếu chạm tới mục trong `docs/ARCHITECTURE.md` §6 hoặc `ROADMAP.md`, cập nhật luôn các file đó.

---

## 1. Quy trình làm một thay đổi

```
1. Tạo nhánh:    claude/<mô-tả-ngắn>   hoặc   feat/<...>  ·  fix/<...>  ·  docs/<...>
2. Sửa code trong src/index.html (1 file). Giữ phong cách hiện có (xem §4).
3. Tự kiểm thử (xem §5).
4. Cập nhật CHANGELOG.md (mục [Chưa phát hành]) + tài liệu liên quan.
5. Commit theo §2. Mở PR theo §3. Chờ duyệt & merge (squash).
6. Sau merge: chuyển mục changelog từ [Chưa phát hành] sang ngày phát hành (nếu phát hành).
```

---

## 2. Quy tắc commit message

**Định dạng:**
```
<loại>: <tóm tắt ngắn, thể mệnh lệnh, tiếng Việt có dấu>   (≤ ~72 ký tự)

- Chi tiết 1: VÌ SAO thay đổi / vấn đề đang giải quyết
- Chi tiết 2: cách giải quyết / đánh đổi
- Tham chiếu: ROADMAP P0 #x (nếu có)
```

**`<loại>` dùng một trong:** `feat` (tính năng), `fix` (sửa lỗi), `docs` (tài liệu), `refactor` (đổi cấu trúc, không đổi hành vi), `style` (định dạng), `chore` (lặt vặt/cấu hình).

**Ví dụ tốt:**
```
fix: đồng hồ tính theo giờ thực để chống "đóng tab = pause"

- Vấn đề (ROADMAP P0 #2): setInterval dừng khi đóng tab, mở lại resume
  số giây cũ -> học sinh lách giờ thi.
- Cách sửa: tính remaining theo startedAt + hạn mức; quá hạn -> tự nộp.
```

**Tránh:** `update`, `fix bug`, `sửa tí`, `wip` — không cho biết gì.

---

## 3. Quy tắc mô tả Pull Request

PR body tối thiểu có:
- **Vấn đề / mục tiêu** (có link ROADMAP nếu là mục trong đó).
- **Cách sửa** (tóm tắt kỹ thuật).
- **Ảnh hưởng hành vi** — nên có bảng "Trước / Sau" nếu đổi hành vi người dùng.
- **Đã kiểm thử gì** (xem §5).
- Ghi rõ nếu **có/không đụng backend** (Apps Script).

---

## 4. Quy tắc viết code (giữ nhất quán với codebase)

- **Một file `src/index.html`** — không thêm framework, không build step. Giữ nguyên triết lý "static site".
- **Tiếng Việt có dấu** cho comment & chuỗi hiển thị.
- Comment giải thích **VÌ SAO** ở chỗ có "bẫy" (vd: vì sao tách 2 bước bắt đầu để fullscreen chạy được).
- Cấu hình thay đổi được theo lớp học → để trong khối `CONFIG`, đừng rải số "ma thuật" trong code.
- Đặt logic dùng lại thành hàm nhỏ (vd `effectiveTimeLimit`, `topicRule`) thay vì lặp.

---

## 5. Kiểm thử tối thiểu trước khi mở PR

1. **Cú pháp JS**: trích phần `<script>` rồi `node --check`/`vm.Script` (không lỗi parse).
2. **Khói (smoke) trên trình duyệt** qua HTTPS/localhost: đăng nhập → chọn topic → xác nhận → vào fullscreen → đồng hồ chạy → Alt+Tab thấy cảnh báo + đếm vi phạm → đủ từ → nộp.
3. **Theo từng thay đổi**: nếu động vào thời gian/số từ → thử **nhiều topic**; nếu động vào đồng hồ → thử **đóng tab/reload**; nếu động vào nộp bài → kiểm tra Sheet `BaiNop` + email.

> Lưu ý: Fullscreen API cần **HTTPS hoặc localhost**. Backend `script.google.com` có thể bị chặn ở một số môi trường CI — khi đó test logic bằng `FALLBACK_TOPICS` (chế độ offline).

---

## 6. Khi nào phải cập nhật tài liệu kèm theo

| Bạn thay đổi... | Cập nhật thêm |
|---|---|
| Bất kỳ tính năng/sửa lỗi đáng kể | `CHANGELOG.md` |
| Cơ chế hoạt động / luồng / cấu hình | `docs/ARCHITECTURE.md` |
| Hoàn thành một mục roadmap | `docs/ROADMAP.md` (đánh dấu ✅) |
| Cách deploy / biến CONFIG | `README.md`, `docs/deployment.md` |
| Hợp đồng API với backend | `docs/google-apps-script.md` |

---

## 7. Tóm tắt 1 dòng cho người vội

> **Sửa code → ghi 1 mục CHANGELOG (nói VÌ SAO) → commit `loại: tóm tắt` → PR có bảng Trước/Sau → squash merge.**
