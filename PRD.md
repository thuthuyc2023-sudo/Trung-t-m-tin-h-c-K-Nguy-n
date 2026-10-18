# PRD.md — Product Requirements Document

Tài liệu mô tả **website làm gì, cho ai, và kiến trúc kỹ thuật** của dự án "Trung tâm Tin học Kỷ Nguyên". Phần giao diện/thị giác xem [DESIGN.md](DESIGN.md).

## 1. Tổng quan dự án

Website giới thiệu và tuyển sinh cho một trung tâm đào tạo tin học (thương hiệu hư cấu: **Kỷ Nguyên**), dạy 3 khóa học:

- **MOS** (Microsoft Office Specialist — Word, Excel, PowerPoint)
- **Lập trình Java** (nền tảng, OOP, dự án thực hành)
- **Ứng dụng AI** (Claude AI, ChatGPT, ứng dụng vào công việc/học tập)

**Mục tiêu:** website đơn giản, hiện đại, chuyên nghiệp, tạo niềm tin với học viên tiềm năng và thúc đẩy đăng ký khóa học.

**Đối tượng người dùng:** học sinh/sinh viên, người đi làm muốn chuyển ngành hoặc nâng cao kỹ năng, chủ doanh nghiệp nhỏ — phần lớn không rành kỹ thuật (ảnh hưởng trực tiếp tới quyết định chatbot FAQ thay vì AI thật, xem mục 5).

## 2. Tech stack

- **HTML/CSS/JS thuần** — không framework, không bước build, mở trực tiếp được bằng `file://`.
- **Supabase** (Postgres + Auth + REST API tự sinh) làm backend/database — không tự viết server.
- Font: Google Fonts (Inter) qua `<link>`.
- Icon: SVG inline.
- Deploy: Cloudflare (Workers/Pages), repo Git đồng bộ GitHub Public.

## 3. Cấu trúc trang & chức năng

| Trang | File | Vai trò |
|---|---|---|
| Trang chủ | `index.html` | Hero, khóa học nổi bật, lý do chọn, số liệu, lộ trình, đánh giá (động), CTA, footer + bản đồ |
| Về chúng tôi | `about.html` | Câu chuyện thương hiệu, sứ mệnh/giá trị cốt lõi, đội ngũ giảng viên, số liệu thành tựu |
| Chi tiết khóa AI | `course-ai.html` | Banner (ảnh thật), nội dung khóa, giá, lịch khai giảng (động), đánh giá (động), FAQ |
| Chi tiết khóa MOS | `mos-ai.html` | Như trên, có 2 gói giá (Word+Excel / trọn bộ) |
| Chi tiết khóa Java | `java.html` | Như trên, 1 mức giá, lộ trình 4 giai đoạn/12 tuần |
| Quản trị | `admin.html` | Đăng nhập (Supabase Auth) → xem/thêm/sửa/xoá dữ liệu 3 bảng |

**Tất cả các trang liên kết với nhau** qua nav (Khóa học / Về chúng tôi / Lộ trình / Học viên nói gì / Liên hệ) và footer (cột Khóa học, Về Kỷ Nguyên, Liên hệ) — nav/footer giống hệt nhau trên mọi trang, chỉ khác điểm đang active.

## 4. Backend — Supabase

### 4.1 Bảng `registrations` (riêng tư)
Form "Đăng ký tư vấn" (modal, mở từ mọi nút CTA `.js-open-register`) ghi vào bảng này.

- Schema + RLS: [supabase/schema.sql](supabase/schema.sql)
- Quyền: **public** chỉ được `insert`; **authenticated** (admin) mới `select`/`delete` — cấp qua [supabase/admin_policies.sql](supabase/admin_policies.sql)
- Kết nối: [js/supabase-config.js](js/supabase-config.js) (`SUPABASE_URL`, `SUPABASE_ANON_KEY`)

### 4.2 Bảng `testimonials` & `class_schedules` (công khai)
Nội dung động — khác bảng trên, **public đọc được trực tiếp** (để hiển thị lên trang), chỉ thêm/sửa/xoá mới cần đăng nhập.

- Schema + seed dữ liệu mẫu: [supabase/content_tables.sql](supabase/content_tables.sql)
- Thêm cột avatar: [supabase/add_avatar_column.sql](supabase/add_avatar_column.sql)
- Render ra trang: [js/dynamic-content.js](js/dynamic-content.js) — tìm phần tử `[data-testimonials]` / `[data-schedule]` và tự tải dữ liệu tương ứng.
- **testimonials**: cột `course` (`mos`/`java`/`ai`), `avatar_url` để trống thì tự vẽ avatar chữ cái đầu tên (an toàn, không mạo danh — xem mục 7).
- **class_schedules**: mỗi dòng là 1 lớp sắp khai giảng, hiển thị dạng "Khai giảng gần nhất — còn X chỗ" ở sidebar trang khóa học; `is_active` để đóng/mở lớp mà không mất lịch sử.

### 4.3 Quy ước kỹ thuật bắt buộc
`js/main.js`, `js/chatbot.js`, `js/admin.js`, `js/dynamic-content.js` **đều KHÔNG dùng `<script type="module">`** — vì ES module bị trình duyệt chặn tải khi mở trang bằng `file://` (double-click), sẽ làm hỏng toàn bộ JS của trang. Supabase client được nạp bằng **dynamic `import()`** (gọi hàm trong handler, không khai báo module ở đầu file) — cách này tải được module từ CDN (`esm.sh`/`jsdelivr`) kể cả khi trang mở qua `file://`. Khi sửa các file JS này, giữ nguyên quy ước — không chuyển sang `type="module"`.

## 5. Chatbot — FAQ trả lời sẵn (không dùng AI thật)

**Quyết định sản phẩm:** bản đầu tiên cho người dùng tự nhập API Key (Gemini/Groq) để chat với AI thật (mô hình BYOK). Sau đó đổi hướng vì đối tượng khách (phụ huynh, học viên phổ thông) không rành khái niệm "API Key" — yêu cầu họ tự đi xin key là rào cản quá lớn, phản tác dụng với mục tiêu "dễ tiếp cận".

**Hiện tại:** `js/chatbot.js` — mảng `FAQ` chứa keyword + câu trả lời dựng sẵn, so khớp bằng cách bỏ dấu tiếng Việt. Không gọi mạng, không cần key, không tốn phí. Có nút gợi ý nhanh (chip) và fallback dẫn tới "Đăng ký tư vấn" khi không khớp câu hỏi nào.

## 6. Trang quản trị (admin.html)

- Đăng nhập qua **Supabase Auth** (tài khoản tạo thủ công trong Supabase Dashboard, không có form tự đăng ký — tránh người lạ tạo tài khoản admin).
- 3 tab: **Đăng ký tư vấn** (xem + xoá), **Đánh giá học viên** (xem + thêm + xoá), **Lịch khai giảng** (xem + thêm + xoá + đóng/mở lớp — là chức năng **update**).
- → Đáp ứng đủ 3 thao tác **insert / update / delete** trên database qua giao diện thật (không chỉ qua Supabase Dashboard).
- `admin.html` có `<meta name="robots" content="noindex, nofollow">`, không link từ nav/footer công khai — bảo mật thật nằm ở RLS + yêu cầu đăng nhập, không phải việc ẩn URL.

## 7. Logo thương hiệu

Thương hiệu **Kỷ Nguyên là hư cấu** (không phải cơ sở có thật) — theo đúng yêu cầu "thương hiệu hư cấu phải tạo logo trước rồi mới dùng", logo được thiết kế qua một bước riêng:

- 5 phương án được phác thảo và render để chọn: (A) chữ lồng "KN" dạng vuông, (B) biểu tượng mũ tốt nghiệp, (C) dấu ngoặc code `</>`, (D) chữ "K" cách điệu kết hợp node tròn (ẩn dụ kết nối/công nghệ), (E) chữ "KN" dạng tròn.
- Đã chọn **phương án D** — biểu tượng chữ "K" cách điệu + node tròn, gradient xanh dương (`#3b6bff → #7a9bff`) khớp với màu accent của site.
- File gốc: [assets/images/logo.svg](assets/images/logo.svg) (bản đầy đủ: icon + wordmark "Kỷ Nguyên") và [assets/images/favicon.svg](assets/images/favicon.svg) (bản icon-only cho favicon).
- Dùng **nhất quán** ở mọi nơi: `.nav__logo-mark` (header + footer) trên cả 6 trang (`index.html`, `about.html`, `course-ai.html`, `mos-ai.html`, `java.html`, `admin.html`) và favicon trình duyệt — cùng 1 đoạn SVG, không có biến thể khác.

## 8. Nguyên tắc & ràng buộc

- Không tự thêm trang/section ngoài phạm vi (ví dụ trang thanh toán, hệ thống LMS quản lý điểm danh) trừ khi được yêu cầu — đây là site giới thiệu/tuyển sinh + quản trị lead cơ bản, không phải hệ thống quản lý học viên toàn diện.
- **Không gắn ảnh thật của người thật vào nội dung đánh giá đang là dữ liệu mẫu/demo** — nguyên tắc tránh mạo danh, xem chi tiết ở `CLAUDE.md` mục nội dung động.
- Một số nội dung còn là **dữ liệu mẫu cần thay trước khi dùng thật**: địa chỉ/SĐT/email ở footer, học phí khóa Java, link mạng xã hội (`href="#"`), 3 lịch khai giảng demo.
