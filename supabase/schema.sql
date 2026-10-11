-- Chạy toàn bộ file này trong Supabase Dashboard → SQL Editor → New query → Run

create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  phone text not null,
  email text not null,
  message text,
  source_page text
);

-- Bật Row Level Security (bắt buộc vì anon key sẽ được nhúng ở phía trình duyệt)
alter table registrations enable row level security;

-- Chỉ cho phép INSERT từ phía client (anon/publishable key) — không cho đọc/sửa/xoá.
-- Dùng "to public" (thay vì "to anon") vì hệ thống publishable/secret key mới của
-- Supabase không map request về đúng role Postgres "anon" theo cách cũ — policy
-- "to anon" sẽ bị RLS chặn (lỗi 42501) dù key hợp lệ. "to public" bao gồm cả anon
-- lẫn authenticated, nhưng vẫn chỉ cho phép hành động INSERT nên không ảnh hưởng bảo mật.
create policy "Public can insert registrations"
  on registrations
  for insert
  to public
  with check (true);

-- Không tạo policy SELECT/UPDATE/DELETE cho public/anon
-- => chỉ bạn (qua Table Editor trong Supabase Dashboard, đăng nhập bằng tài khoản chủ project)
--    mới xem/sửa/xoá được danh sách đăng ký.
