// Thông tin kết nối Supabase cho website Kỷ Nguyên.
// Lấy 2 giá trị này tại: Supabase Dashboard → Project Settings → API
//   - Project URL          → điền vào SUPABASE_URL
//   - Project API keys → anon public → điền vào SUPABASE_ANON_KEY
//
// anon key được thiết kế để công khai ở phía trình duyệt — không phải khóa bí mật.
// Toàn bộ quyền truy cập dữ liệu được kiểm soát bằng Row Level Security (xem supabase/schema.sql).
//
// File này KHÔNG dùng export/import ES module (cố tình), để trang vẫn chạy được
// khi mở trực tiếp bằng file:// (không qua server) — trình duyệt chặn module script
// tải từ file:// nhưng không chặn script thường.

window.SUPABASE_URL = 'https://iiyojeqiyctdnfowszqk.supabase.co';
window.SUPABASE_ANON_KEY = 'sb_publishable_38ioAvXIv5DgZIipyF8AsQ_BjZnbB1N';
