-- Chạy file này trong Supabase SQL Editor để thêm cột ảnh đại diện
-- cho bảng testimonials (nếu đã chạy content_tables.sql trước đó).
-- Cột để trống (NULL) với mọi đánh giá hiện có — khi đó web tự hiển
-- thị avatar chữ cái đầu tên (không cần ảnh thật), an toàn và không
-- rủi ro mạo danh người không liên quan tới đánh giá đó.

alter table testimonials
  add column if not exists avatar_url text;
