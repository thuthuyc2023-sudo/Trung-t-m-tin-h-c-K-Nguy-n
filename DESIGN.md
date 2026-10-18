# DESIGN.md — Thiết kế giao diện

Tài liệu mô tả **website trông như thế nào** — phong cách, màu sắc, bố cục, quy ước CSS. Phần chức năng/kiến trúc kỹ thuật xem [PRD.md](PRD.md).

## 1. Phong cách tổng thể

Tham chiếu: trang chủ **Framer.com** (`HÌNH MẪU WEBSITE.png`) — phong cách SaaS landing page hiện đại, tối giản, nền tối, nhiều khoảng trắng, glow xanh dương làm điểm nhấn.

## 2. Bảng màu (CSS custom properties trong `:root`)

| Token | Giá trị | Dùng cho |
|---|---|---|
| `--bg` | `#050505` | Nền chính |
| `--bg-elevated` | `#0d0d0e` | Nền section xen kẽ, banner |
| `--bg-card` | `#111113` | Card, testimonial, FAQ item |
| `--accent` / `--accent-light` | `#3b6bff` / `#6e8fff` | CTA, glow, số liệu nổi bật, link |
| `--accent-dim` | `rgba(59,107,255,.14)` | Nền icon, chip, schedule-widget |
| `--text` / `--text-muted` / `--text-faint` | trắng / xám nhạt / xám mờ | Phân cấp chữ |
| `--border` / `--border-strong` | `rgba(255,255,255,.08)` / `.14` | Viền card, divider |

Nút CTA chính (`.btn--primary`) dùng **nền trắng, chữ đen** (không phải xanh) — xanh chỉ dùng cho glow/accent/link, đúng tinh thần ảnh mẫu Framer.

## 3. Typography

- Font: **Inter** (Google Fonts), sans-serif.
- Hero/banner title: `clamp(32px–58px)`, weight 800, line-height chặt (~1.12).
- Phân cấp: H1 (hero/banner) > H2 (section title, 24–38px) > H3 (card title) > body (14–17px, `--text-muted`).

## 4. Bố cục & component dùng chung

- **Nav**: cố định trên cùng (`position:fixed`), nền `rgba(5,5,5,.7)` + `backdrop-filter:blur`, đổi nền đậm hơn khi cuộn (`.nav--scrolled`). Mobile: hamburger → dropdown.
- **Hero/Banner**: tiêu đề lớn + mô tả + 1–2 nút CTA, có glow radial-gradient xanh phía sau. Banner trang khóa học thêm breadcrumb + eyebrow + meta-pill (học phí/lịch học).
- **Card** (`.card`, `.feature`, `.testimonial`, `.faq-item`): nền `--bg-card`, bo góc lớn (16–20px), viền mờ, hover nhẹ (translateY + đổi viền).
- **Stats**: số lớn đậm (`.stat__num`), label nhỏ xám bên dưới, ngăn cách bằng border-left.
- **CTA cuối trang**: khối nổi bật riêng, có glow, nền `--bg-elevated`.
- **Footer**: 4 cột (brand+social, Khóa học, Về Kỷ Nguyên, Liên hệ) + khối bản đồ Google Maps + dòng copyright.
- **Trang chi tiết khóa học** (`course-banner` + `course-layout`): xem khuôn mẫu chi tiết ở `PRD.md` mục 3 — banner có ảnh/SVG minh họa bên phải, nội dung trái + sidebar phải (price-card, schedule-widget, social-widget).

## 5. Responsive

Breakpoint chính: `960px` (tablet — ẩn nav desktop, bật hamburger) và `640px` (mobile — grid về 1 cột). Một số phần tử trang trí (ảnh minh họa banner) ẩn hẳn dưới `960px` thay vì cố co nhỏ, để tránh rủi ro chồng chữ (xem mục 6).

## 6. Bài học CSS thực tế (tránh lặp lại lỗi đã gặp)

1. **`hidden` attribute bị `display:flex/grid/block` đè lên.** Nếu toggle ẩn/hiện 1 view bằng thuộc tính HTML `hidden` mà class CSS của nó có khai báo `display` tường minh, `display` đó thắng `hidden` (specificity cao hơn UA stylesheet) → 2 view hiện chồng nhau. Luôn thêm `.ten-class[hidden] { display: none; }`. Đã gặp ở chatbot (bản API-key) và `admin-login`.
2. **`margin: 0 auto` kế thừa gây canh giữa ngoài ý muốn.** `.course-banner__inner` dùng chung thẻ với `.container` (có `margin:0 auto` để canh giữa khối 1180px). Vì `course-banner__inner` tự giới hạn hẹp hơn (660px), margin kế thừa canh GIỮA cột chữ đó trong banner thay vì ghim lề trái — khiến cột chữ trôi theo viewport và có thể chồng lên ảnh minh họa bên phải ở một số độ rộng. Phát hiện bằng cách đo trực tiếp `getBoundingClientRect()` qua console, không đoán qua ảnh chụp. Sửa: thêm `margin: 0` tường minh để ghim lại.
3. **Ảnh minh họa banner nên neo theo `top` cố định, không dùng `top:50%` canh giữa theo chiều cao section** — vì chiều cao banner thay đổi theo số dòng chữ bị xuống dòng (title/subtitle/meta-pill), canh giữa sẽ khiến ảnh trôi dọc và có thể đè lên chữ ở màn hình chữ xuống dòng nhiều.
4. **`clamp()` cho kích thước ảnh theo viewport** thay vì đổi `width` cứng ở từng breakpoint — mượt hơn và ít điểm gãy hơn.

## 7. Quy ước chung

- Màu luôn khai báo qua biến `:root`, không hardcode hex lặp lại trong rule.
- Không dùng framework CSS nặng (Tailwind/Bootstrap) — CSS thuần để dễ kiểm soát, đúng tinh thần "đơn giản, hiện đại" của dự án.
- Icon dùng SVG inline, không tải icon font ngoài.
- Khi tạo ảnh/icon minh họa mà chưa có asset thật, dùng placeholder hợp lý (SVG tự vẽ, ảnh demo) và ghi chú rõ trong `PRD.md` để thay sau.
