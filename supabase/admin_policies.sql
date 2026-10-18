-- Chạy file này trong Supabase SQL Editor SAU KHI đã tạo tài khoản admin
-- (Authentication → Users → Add user). File này cấp quyền cho người dùng
-- ĐÃ ĐĂNG NHẬP (authenticated) được xem và xoá danh sách đăng ký tư vấn —
-- khách vãng lai (anon) vẫn chỉ được ghi thêm (insert), không đọc được gì,
-- đúng như đã thiết lập ở schema.sql.

create policy "Authenticated users can view registrations"
  on registrations
  for select
  to authenticated
  using (true);

create policy "Authenticated users can delete registrations"
  on registrations
  for delete
  to authenticated
  using (true);
