-- Chạy file này trong Supabase SQL Editor để tạo 2 bảng nội dung động:
-- testimonials (đánh giá học viên) và class_schedules (lịch khai giảng).
-- Khác với bảng registrations (dữ liệu riêng tư học viên), 2 bảng này
-- là NỘI DUNG CÔNG KHAI hiển thị trên web nên cho phép khách (public)
-- đọc được — chỉ admin (authenticated) mới thêm/sửa/xoá được.

-- ===== TESTIMONIALS (đánh giá học viên) =====
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  student_name text not null,
  student_role text,
  content text not null,
  course text not null check (course in ('mos','java','ai')),
  avatar_url text -- để trống = web tự hiển thị avatar chữ cái đầu tên, xem supabase/add_avatar_column.sql
);

alter table testimonials enable row level security;

create policy "Public can view testimonials"
  on testimonials for select to public using (true);

create policy "Authenticated can insert testimonials"
  on testimonials for insert to authenticated with check (true);

create policy "Authenticated can delete testimonials"
  on testimonials for delete to authenticated using (true);

-- Seed dữ liệu đánh giá đang có sẵn trên web (để trang không bị trống)
insert into testimonials (student_name, student_role, content, course) values
  ('Nguyễn Thị Lan', 'Nhân viên văn phòng', 'Mình đi từ không biết gì về Excel đến đậu chứng chỉ MOS chỉ sau 2 tháng. Giảng viên hỗ trợ rất tận tình.', 'mos'),
  ('Nguyễn Văn Đạt', 'Nhân viên kế toán', 'Trước đây dùng Excel rất chậm, giờ mình làm báo cáo nhanh gấp đôi nhờ các hàm được học ở Kỷ Nguyên.', 'mos'),
  ('Trần Minh Khoa', 'Sinh viên CNTT', 'Khóa Java ở Kỷ Nguyên tập trung thực hành dự án thật, nhờ vậy mình tự tin hơn hẳn khi phỏng vấn xin việc.', 'java'),
  ('Lê Thị Minh Thư', 'Sinh viên năm 3', 'Giảng viên giảng dễ hiểu, bài tập thực hành sát với phỏng vấn thực tế, mình tự tin hơn hẳn khi đi xin thực tập.', 'java'),
  ('Phạm Hồng Nhung', 'Chủ doanh nghiệp nhỏ', 'Khóa Ứng dụng AI giúp mình tiết kiệm rất nhiều thời gian soạn thảo và xử lý công việc hàng ngày.', 'ai'),
  ('Đỗ Quang Vinh', 'Trưởng phòng Marketing', 'Chỉ sau vài buổi học, cả team mình đã biết cách dùng AI để lên ý tưởng nội dung nhanh hơn rất nhiều.', 'ai');

-- ===== CLASS_SCHEDULES (lịch khai giảng) =====
create table if not exists class_schedules (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  course text not null check (course in ('mos','java','ai')),
  start_date date not null,
  total_slots int not null default 20,
  filled_slots int not null default 0,
  is_active boolean not null default true
);

alter table class_schedules enable row level security;

create policy "Public can view active schedules"
  on class_schedules for select to public using (is_active = true);

create policy "Authenticated can view all schedules"
  on class_schedules for select to authenticated using (true);

create policy "Authenticated can insert schedules"
  on class_schedules for insert to authenticated with check (true);

create policy "Authenticated can update schedules"
  on class_schedules for update to authenticated using (true);

create policy "Authenticated can delete schedules"
  on class_schedules for delete to authenticated using (true);

-- Seed lịch khai giảng tạm — đổi lại ngày/số chỗ thật qua trang quản trị
insert into class_schedules (course, start_date, total_slots, filled_slots) values
  ('mos', '2026-11-07', 30, 22),
  ('java', '2026-11-14', 25, 18),
  ('ai', '2026-11-21', 20, 14);
