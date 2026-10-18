# CLAUDE.md

Tài liệu định hướng cho dự án website **Trung tâm Tin học Kỷ Nguyên**. Nội dung chi tiết đã tách thành 2 file riêng theo đúng chuẩn PRD/DESIGN — đọc 2 file đó trước khi sửa code:

- **[PRD.md](PRD.md)** — website làm gì, cho ai, cấu trúc trang, backend Supabase, quy ước kỹ thuật bắt buộc (dynamic import, không dùng ES module), phạm vi dự án.
- **[DESIGN.md](DESIGN.md)** — giao diện trông như thế nào: bảng màu, typography, bố cục component, breakpoint responsive, và các bài học CSS thực tế đã rút ra (lỗi `hidden`+`display`, lỗi canh giữa kế thừa từ `.container`...).

## Quy ước quan trọng nhất (đọc trước khi code)

1. **Không dùng `<script type="module">`** cho bất kỳ file JS nào trong dự án (`main.js`, `chatbot.js`, `admin.js`, `dynamic-content.js`) — ES module bị chặn khi mở trang bằng `file://`. Dùng dynamic `import()` trong hàm/handler thay vì `import` tĩnh ở đầu file. Chi tiết: PRD.md mục 4.3.
2. Trước khi toggle ẩn/hiện bằng `hidden`, kiểm tra class CSS của phần tử đó có `display` tường minh không — nếu có, phải thêm `[hidden] { display: none; }` đè lên. Chi tiết: DESIGN.md mục 6.
3. [course-ai.html](course-ai.html), [mos-ai.html](mos-ai.html), [java.html](java.html) phải giữ **cùng cấu trúc** (banner → course-layout → trust-strip → CTA → footer/modal/chatbot) — sửa 1 trang thì rà cả 3.
4. Thương hiệu **Kỷ Nguyên là hư cấu** — không gắn ảnh người thật vào nội dung đánh giá đang là dữ liệu mẫu/demo (xem PRD.md mục 7).
5. Nội dung chữ dùng tiếng Việt; không tự thêm trang/chức năng ngoài phạm vi site giới thiệu + quản trị lead cơ bản.

## Cấu trúc file .md trong dự án

| File | Vai trò |
|---|---|
| `CLAUDE.md` | File chỉ mục này — Claude Code tự đọc đầu tiên khi mở dự án |
| `PRD.md` | Yêu cầu sản phẩm & kiến trúc kỹ thuật (functional) |
| `DESIGN.md` | Thiết kế giao diện (visual) |
