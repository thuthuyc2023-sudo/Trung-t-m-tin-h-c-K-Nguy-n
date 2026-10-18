// Tải và hiển thị nội dung động từ Supabase: đánh giá học viên (testimonials)
// và lịch khai giảng (class_schedules). Đọc công khai (anon), không cần
// đăng nhập — khác với admin.js (cần đăng nhập để sửa/xoá dữ liệu này).
//
// Cùng quy ước dynamic import() như main.js/chatbot.js/admin.js — xem
// CLAUDE.md mục 4b.

(function () {
  let supabasePromise = null;
  function getSupabaseClient() {
    const url = window.SUPABASE_URL;
    const key = window.SUPABASE_ANON_KEY;
    if (!url || !url.startsWith('http')) return Promise.resolve(null);
    if (!supabasePromise) {
      supabasePromise = import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm')
        .then(({ createClient }) => createClient(url, key));
    }
    return supabasePromise;
  }

  const esc = (s) => (s == null ? '' : String(s)).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  const fmtDateVN = (isoDate) => {
    const d = new Date(isoDate + 'T00:00:00');
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  async function renderTestimonials(container, course) {
    const client = await getSupabaseClient();
    if (!client) return;

    let query = client.from('testimonials').select('*').order('created_at', { ascending: false });
    if (course) query = query.eq('course', course);

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = data.map(t => (
      '<blockquote class="testimonial">' +
        '<p>&ldquo;' + esc(t.content) + '&rdquo;</p>' +
        '<footer><span class="testimonial__name">' + esc(t.student_name) + '</span>' +
        '<span class="testimonial__role">' + esc(t.student_role || '') + '</span></footer>' +
      '</blockquote>'
    )).join('');
  }

  async function renderSchedule(container, course) {
    const client = await getSupabaseClient();
    if (!client) return;

    const today = new Date().toISOString().slice(0, 10);
    let query = client.from('class_schedules').select('*')
      .eq('is_active', true)
      .gte('start_date', today)
      .order('start_date', { ascending: true })
      .limit(1);
    if (course) query = query.eq('course', course);

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      container.hidden = true;
      return;
    }

    const row = data[0];
    const remaining = Math.max(row.total_slots - row.filled_slots, 0);
    const slotsText = remaining > 0
      ? 'còn <strong>' + remaining + '</strong> chỗ'
      : '<strong style="color:#ff8080">đã đầy</strong>';

    container.innerHTML =
      '<span class="schedule-widget__icon">🗓</span>' +
      '<span>Khai giảng gần nhất <strong>' + fmtDateVN(row.start_date) + '</strong> — ' + slotsText + '</span>';
    container.hidden = false;
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-testimonials]').forEach(el => {
      renderTestimonials(el, el.dataset.testimonials || null);
    });
    document.querySelectorAll('[data-schedule]').forEach(el => {
      renderSchedule(el, el.dataset.schedule || null);
    });
  });
})();
