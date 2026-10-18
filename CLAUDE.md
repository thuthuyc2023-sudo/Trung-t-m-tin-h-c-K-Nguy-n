# CLAUDE.md

Tài liệu định hướng cho dự án website **Trung tâm Tin học** — nơi Claude Code tham chiếu mỗi khi làm việc trong repo này.

## 1. Tổng quan dự án

Website giới thiệu và tuyển sinh cho một trung tâm đào tạo tin học, dạy các môn:

- **MOS** (Microsoft Office Specialist — Word, Excel, PowerPoint...)
- **Lập trình Java** (từ cơ bản đến OOP, dự án thực hành)
- **Sử dụng AI** (ứng dụng AI trong học tập/công việc: ChatGPT, Copilot, công cụ AI phổ biến)

Mục tiêu: một trang web **đơn giản, hiện đại, chuyên nghiệp**, tạo được niềm tin với học viên tiềm năng và thúc đẩy đăng ký khóa học.

## 2. Tech stack

- **HTML/CSS/JS thuần** — không dùng framework, không cần bước build.
- Có thể dùng JS thuần (vanilla) cho tương tác nhẹ (menu mobile, accordion FAQ, slider, smooth scroll, form validate).
- Font chữ qua Google Fonts (`<link>` trực tiếp trong `<head>`).
- Icon: dùng SVG inline hoặc một icon set nhẹ (ví dụ Lucide/Feather dạng SVG) — tránh phụ thuộc nặng.
- Không cần backend thật; form liên hệ/đăng ký có thể để dạng tĩnh (mailto, hoặc giả lập submit) trừ khi có yêu cầu khác.
- Deploy mục tiêu: hosting tĩnh (Netlify/Vercel/GitHub Pages) — vì vậy giữ cấu trúc file đơn giản, đường dẫn tương đối.

### Cấu trúc thư mục đề xuất

```
/
├── index.html
├── courses.html          # (hoặc gộp vào index.html dạng section, xem mục 4)
├── about.html
├── contact.html
├── css/
│   └── style.css
├── js/
│   └── main.js
├── assets/
│   ├── images/
│   └── icons/
└── CLAUDE.md
```

Nếu dự án chỉ cần 1 trang (one-page site) thì gộp hết các section vào `index.html` với anchor link (`#courses`, `#about`, `#contact`) — ưu tiên cách này cho bản MVP vì đơn giản và đúng tinh thần landing page trong ảnh mẫu.

## 3. Phong cách thiết kế (dựa trên ảnh mẫu `HÌNH MẪU WEBSITE.png`)

Ảnh mẫu là trang chủ của **Framer.com** — phong cách SaaS landing page hiện đại, tối giản, nền tối. Khi dựng giao diện, bám theo các đặc điểm sau:

### Màu sắc
- **Nền chính**: đen/xám rất đậm (`#000000` – `#0A0A0A`), tạo chiều sâu bằng các lớp xám đậm hơn một chút (`#111111`, `#161616`) cho card/section.
- **Màu nhấn (accent)**: xanh dương điện (electric blue, khoảng `#2F6BFF` – `#3B82F6`), dùng cho nút CTA, glow/gradient phía sau ảnh minh họa, số liệu nổi bật, icon trạng thái.
- **Chữ**: trắng (`#FFFFFF`) cho tiêu đề, xám nhạt (`#A0A0A0` – `#B5B5B5`) cho mô tả/phụ đề.
- **Border/divider**: xám rất mờ (`rgba(255,255,255,0.08–0.12)`) để phân tách card mà không gắt.
- Hiệu ứng **glow/gradient mờ** màu xanh phía sau các khối ảnh/UI mockup để tạo điểm nhấn thị giác (giống ảnh mẫu).

### Typography
- Font sans-serif hiện đại, gọn (ví dụ: Inter, Geist, hoặc Manrope qua Google Fonts).
- Tiêu đề hero: rất lớn, đậm (bold/semibold), line-height chặt, có thể 2 dòng.
- Phân cấp rõ: H1 (hero) > H2 (section title) > H3 (card title) > body text nhỏ, xám.

### Bố cục & component
- **Header/Nav**: cố định trên cùng, nền trong suốt/mờ (backdrop-blur), logo trái, menu giữa, nút CTA (Login/Đăng ký) phải. Gọn, không chiếm nhiều chiều cao.
- **Hero section**: tiêu đề lớn + mô tả ngắn + 1–2 nút CTA (nút chính màu xanh bo tròn, nút phụ viền/trong suốt), bên dưới là ảnh minh họa lớn (screenshot sản phẩm/lớp học) đặt trong khung bo góc với glow phía sau.
- **Logo cloud**: dải logo đối tác/đơn vị liên kết, mờ xám, căn hàng ngang.
- **Feature/Course cards**: layout dạng lưới (grid 2–3 cột), mỗi card có icon, tiêu đề ngắn, mô tả 1–2 dòng, nền card tối hơn nền chính, bo góc lớn (16–20px), border mờ.
- **Stats section**: số liệu lớn, đậm, màu xanh hoặc trắng (ví dụ: "99.9% học viên hài lòng", "500+ học viên đã đào tạo") kèm label nhỏ bên dưới.
- **Bảng/khối minh họa dữ liệu** (nếu có): dùng cho phần "lộ trình học" hoặc "kết quả đầu ra", mô phỏng dashboard nhẹ giống ảnh mẫu (không bắt buộc, chỉ khi hợp ngữ cảnh).
- **CTA section cuối trang**: khối nổi bật, nền hơi khác biệt, kêu gọi hành động mạnh ("Đăng ký tư vấn miễn phí").
- **Footer**: nhiều cột (Khóa học, Về chúng tôi, Liên hệ, Mạng xã hội), nền đen, chữ xám, dòng copyright cuối cùng.
- Bo góc lớn, khoảng trắng (spacing) rộng rãi, chuyển động/hover nhẹ nhàng (transition 150–250ms), không dùng hiệu ứng màu mè gây rối mắt.

### Responsive
- Thiết kế mobile-first hoặc ít nhất đảm bảo breakpoint rõ ràng (mobile < 640px, tablet < 1024px, desktop ≥ 1024px).
- Nav chuyển thành menu hamburger trên mobile.
- Grid cards chuyển về 1 cột trên mobile.

## 4. Cấu trúc nội dung trang chủ (gợi ý thứ tự section)

1. **Header/Nav** — Logo trung tâm, menu (Khóa học, Giới thiệu, Giảng viên, Liên hệ), nút "Đăng ký ngay".
2. **Hero** — Thông điệp chính (ví dụ: "Học Tin học – Lập trình – AI cùng chuyên gia"), mô tả ngắn, CTA chính ("Đăng ký tư vấn") + CTA phụ ("Xem khóa học"), hình ảnh minh họa lớp học/giao diện AI.
3. **Đối tác/chứng chỉ** (nếu có) — logo đơn vị cấp chứng chỉ (Microsoft, Oracle...) dạng dải mờ.
4. **Khóa học nổi bật** — 3 card chính: MOS, Lập trình Java, Sử dụng AI. Mỗi card: icon, tên khóa, mô tả ngắn, thời lượng, nút "Tìm hiểu thêm".
5. **Vì sao chọn trung tâm** — lưới feature (giảng viên kinh nghiệm, lộ trình thực hành, hỗ trợ việc làm, học phí hợp lý...).
6. **Số liệu ấn tượng** — số học viên, tỷ lệ đậu chứng chỉ, số năm hoạt động, số đối tác tuyển dụng.
7. **Lộ trình học / Chương trình đào tạo** — timeline hoặc bảng tóm tắt từng khóa.
8. **Đánh giá học viên** (testimonial) — vài câu trích dẫn + tên/ảnh học viên.
9. **CTA đăng ký cuối trang** — nổi bật, kêu gọi hành động.
10. **Footer** — thông tin liên hệ, địa chỉ, mạng xã hội, bản đồ (nếu cần), các liên kết nhanh.

## 4b. Backend — Supabase

Form "Đăng ký tư vấn" (modal mở từ các nút CTA) lưu dữ liệu vào **Supabase** (bảng `registrations`):

- Schema + Row Level Security: [supabase/schema.sql](supabase/schema.sql) — chạy 1 lần trong Supabase SQL Editor.
- Thông tin kết nối: [js/supabase-config.js](js/supabase-config.js) (`SUPABASE_URL`, `SUPABASE_ANON_KEY` — lấy tại Project Settings → API). anon key công khai được ở client vì đã khóa quyền bằng RLS (chỉ cho `insert`, không cho `select/update/delete`).
- **Quan trọng:** `js/main.js` KHÔNG dùng `<script type="module">` và không dùng `import` tĩnh ở đầu file — cố tình, vì ES module bị trình duyệt chặn tải khi mở trang bằng `file://` (double-click file HTML), sẽ làm hỏng toàn bộ JS của trang. Supabase client được nạp bằng **dynamic `import()`** (gọi hàm, không phải khai báo module) ngay trong submit handler — cách này tải được module từ CDN kể cả khi trang đang mở qua `file://`. Khi sửa `main.js`, giữ nguyên quy ước này; không chuyển sang `type="module"`.
- Nếu `SUPABASE_URL`/`SUPABASE_ANON_KEY` chưa được điền (còn giá trị `YOUR_SUPABASE_...`), form sẽ hiện thông báo lỗi thân thiện thay vì báo "thành công" giả.

## 4c. Chatbot widget (FAQ trả lời sẵn, không dùng AI thật)

Góc dưới-phải mỗi trang có widget chat nổi ([js/chatbot.js](js/chatbot.js), CSS trong `style.css` mục "Chatbot widget").

**Lịch sử quyết định:** bản đầu tiên cho người dùng tự nhập API Key (Gemini/Groq) để chat với AI thật. Sau đó đổi sang FAQ trả lời sẵn theo từ khóa vì đối tượng khách truy cập (phụ huynh, học viên phổ thông) không rành khái niệm "API Key" — yêu cầu họ tự đi xin key là rào cản quá lớn. Nếu sau này có backend thật, có thể cân nhắc lại phương án AI thật (nên giấu key ở server, không để lộ ở client).

**Cách hoạt động hiện tại:**
- Toàn bộ câu hỏi/trả lời nằm trong mảng `FAQ` ở đầu [js/chatbot.js](js/chatbot.js) — mỗi mục có `keywords` (không dấu, để so khớp) và `answer`. Thêm câu hỏi mới = thêm 1 object vào mảng này, không cần sửa logic.
- So khớp bằng cách bỏ dấu tiếng Việt + so từ khóa xuất hiện trong câu hỏi (hàm `normalize`/`findFaq`), không gọi mạng, không cần key, không tốn phí.
- Khi mở widget, bot chào + hiện các nút gợi ý nhanh (chip) cho câu hỏi phổ biến — ưu tiên bấm hơn gõ, phù hợp người không rành kỹ thuật.
- Câu hỏi không khớp từ khóa nào → trả lời fallback + gợi ý lại các chip, kèm hướng dẫn bấm "Đăng ký tư vấn" nếu cần hỗ trợ trực tiếp.
- Mục có `action: 'open-register'` sẽ chèn thêm nút "Đăng ký tư vấn ngay" bên dưới câu trả lời, bấm vào sẽ tự kích hoạt nút `.js-open-register` có sẵn trên trang (mở đúng modal đăng ký ở mục 4b) — không viết lại logic mở modal.
- Không dùng SDK/thư viện ngoài, không `fetch()` ra ngoài — vì vậy không vi phạm quy ước "main.js không phải ES module" ở mục 4b (không liên quan tới chatbot.js nhưng cùng nguyên tắc chung của dự án: không cần module).
- **Lưu ý CSS:** nếu sau này thêm lại view dạng ẩn/hiện bằng thuộc tính HTML `hidden`, nhớ kiểm tra: nếu class CSS của view đó có đặt `display: flex/grid/block`, nó sẽ ĐÈ lên `hidden` (specificity cao hơn UA stylesheet) khiến view hiện ra dù có `hidden` — phải thêm rule `.ten-class[hidden] { display: none; }` để sửa. Đây là lỗi thực tế đã gặp ở bản API-key trước đó.

## 5. Nguyên tắc làm việc

- Giữ code HTML/CSS/JS gọn, không thêm thư viện/dependency nếu không cần thiết.
- Ưu tiên CSS thuần (custom properties cho màu sắc trong `:root`) thay vì framework CSS nặng, để dễ kiểm soát và đúng tinh thần "đơn giản, hiện đại".
- Đặt biến màu trong `:root` (ví dụ `--bg`, `--bg-elevated`, `--accent`, `--text`, `--text-muted`, `--border`) để dễ chỉnh theme toàn site.
- Nội dung chữ trên trang dùng tiếng Việt (vì đối tượng là học viên Việt Nam), trừ khi người dùng yêu cầu khác.
- Không tự thêm trang/section ngoài phạm vi (ví dụ trang thanh toán, hệ thống quản lý học viên) trừ khi được yêu cầu — đây là trang giới thiệu/tuyển sinh, không phải hệ thống quản lý.
- Khi tạo ảnh/icon minh họa, dùng placeholder hợp lý (SVG đơn giản, ảnh demo) nếu chưa có asset thật, và ghi chú rõ để người dùng thay thế sau.
