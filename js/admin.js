// Trang quản trị — xem/xoá danh sách đăng ký tư vấn.
// Dùng Supabase Auth để đăng nhập; sau khi đăng nhập, client tự động gửi
// kèm JWT của người dùng trong mỗi request, nên các policy "to authenticated"
// trong supabase/admin_policies.sql mới cho phép đọc/xoá dữ liệu.
//
// Giống main.js: KHÔNG dùng <script type="module">, nạp supabase-js bằng
// dynamic import() để trang vẫn mở được qua file:// (xem CLAUDE.md mục 4b).

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

  document.addEventListener('DOMContentLoaded', () => {
    const loginView = document.getElementById('adminLoginView');
    const dashView = document.getElementById('adminDashView');
    const loginForm = document.getElementById('adminLoginForm');
    const loginError = document.getElementById('adminLoginError');
    const loginBtn = document.getElementById('adminLoginBtn');
    const logoutBtn = document.getElementById('adminLogoutBtn');
    const tableBody = document.getElementById('adminTableBody');
    const emptyState = document.getElementById('adminEmptyState');
    const loadError = document.getElementById('adminLoadError');
    const refreshBtn = document.getElementById('adminRefreshBtn');
    const rowCount = document.getElementById('adminRowCount');

    const fmtDate = (iso) => {
      try {
        return new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
      } catch (e) { return iso; }
    };

    const esc = (s) => (s == null ? '' : String(s)).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));

    async function loadRegistrations(client) {
      loadError.hidden = true;
      tableBody.innerHTML = '<tr><td colspan="6" class="admin-table__loading">Đang tải...</td></tr>';

      const { data, error } = await client
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        tableBody.innerHTML = '';
        loadError.hidden = false;
        loadError.textContent = 'Không tải được dữ liệu: ' + error.message;
        return;
      }

      rowCount.textContent = data.length + ' đăng ký';
      tableBody.innerHTML = '';
      emptyState.hidden = data.length !== 0;

      data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML =
          '<td>' + esc(row.full_name) + '</td>' +
          '<td>' + esc(row.phone) + '</td>' +
          '<td>' + esc(row.email) + '</td>' +
          '<td class="admin-table__msg">' + esc(row.message || '—') + '</td>' +
          '<td>' + esc(row.source_page || '—') + '</td>' +
          '<td>' + esc(fmtDate(row.created_at)) + '</td>' +
          '<td><button type="button" class="admin-delete-btn" data-id="' + esc(row.id) + '">Xoá</button></td>';
        tableBody.appendChild(tr);
      });

      tableBody.querySelectorAll('.admin-delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Xoá đăng ký này? Hành động không thể hoàn tác.')) return;
          btn.disabled = true;
          btn.textContent = 'Đang xoá...';
          const { error } = await client.from('registrations').delete().eq('id', btn.dataset.id);
          if (error) {
            alert('Không xoá được: ' + error.message);
            btn.disabled = false;
            btn.textContent = 'Xoá';
            return;
          }
          loadRegistrations(client);
        });
      });
    }

    function showDashboard(client, email) {
      loginView.hidden = true;
      dashView.hidden = false;
      document.getElementById('adminUserEmail').textContent = email || '';
      loadRegistrations(client);
    }

    function showLogin() {
      loginView.hidden = false;
      dashView.hidden = true;
    }

    getSupabaseClient().then(async (client) => {
      if (!client) {
        loginError.textContent = 'Chưa cấu hình Supabase (xem js/supabase-config.js).';
        loginBtn.disabled = true;
        return;
      }

      const { data: { session } } = await client.auth.getSession();
      if (session) {
        showDashboard(client, session.user.email);
      } else {
        showLogin();
      }

      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.textContent = '';
        loginBtn.disabled = true;
        loginBtn.textContent = 'Đang đăng nhập...';

        const email = document.getElementById('adminEmail').value.trim();
        const password = document.getElementById('adminPassword').value;

        const { data, error } = await client.auth.signInWithPassword({ email, password });

        loginBtn.disabled = false;
        loginBtn.textContent = 'Đăng nhập';

        if (error) {
          loginError.textContent = 'Email hoặc mật khẩu không đúng.';
          return;
        }
        showDashboard(client, data.user.email);
      });

      logoutBtn.addEventListener('click', async () => {
        await client.auth.signOut();
        showLogin();
      });

      refreshBtn.addEventListener('click', () => loadRegistrations(client));

      initTabs();
      initTestimonials(client);
      initSchedules(client);
    });
  });

  // ===== Tabs =====
  function initTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        document.querySelectorAll('.admin-panel').forEach(p => { p.hidden = true; });
        document.getElementById(tab.dataset.tab).hidden = false;
      });
    });
  }

  const COURSE_LABEL = { mos: 'MOS', java: 'Lập trình Java', ai: 'Ứng dụng AI' };
  const escHtml = (s) => (s == null ? '' : String(s)).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  // ===== Testimonials =====
  function initTestimonials(client) {
    const toggleBtn = document.getElementById('testimonialAddToggle');
    const form = document.getElementById('testimonialForm');
    const errorEl = document.getElementById('testimonialError');
    const saveBtn = document.getElementById('testimonialSaveBtn');
    const tbody = document.getElementById('testimonialTableBody');

    toggleBtn.addEventListener('click', () => { form.hidden = !form.hidden; });

    async function load() {
      tbody.innerHTML = '<tr><td colspan="5" class="admin-table__loading">Đang tải...</td></tr>';
      const { data, error } = await client.from('testimonials').select('*').order('created_at', { ascending: false });
      if (error) {
        tbody.innerHTML = '<tr><td colspan="5" class="admin-error">Lỗi: ' + escHtml(error.message) + '</td></tr>';
        return;
      }
      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="admin-empty">Chưa có đánh giá nào.</td></tr>';
        return;
      }
      tbody.innerHTML = '';
      data.forEach(row => {
        const tr = document.createElement('tr');
        const avatarCell = row.avatar_url
          ? '<img src="' + escHtml(row.avatar_url) + '" alt="" style="width:28px;height:28px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:8px;">'
          : '';
        tr.innerHTML =
          '<td>' + avatarCell + escHtml(row.student_name) + '</td>' +
          '<td>' + escHtml(row.student_role || '—') + '</td>' +
          '<td>' + (COURSE_LABEL[row.course] || row.course) + '</td>' +
          '<td class="admin-table__msg">' + escHtml(row.content) + '</td>' +
          '<td><button type="button" class="admin-delete-btn" data-id="' + escHtml(row.id) + '">Xoá</button></td>';
        tbody.appendChild(tr);
      });
      tbody.querySelectorAll('.admin-delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Xoá đánh giá này?')) return;
          await client.from('testimonials').delete().eq('id', btn.dataset.id);
          load();
        });
      });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorEl.textContent = '';
      const name = document.getElementById('tName').value.trim();
      const role = document.getElementById('tRole').value.trim();
      const course = document.getElementById('tCourse').value;
      const content = document.getElementById('tContent').value.trim();
      const avatarUrl = document.getElementById('tAvatar').value.trim();
      if (!name || !content) {
        errorEl.textContent = 'Vui lòng nhập tên và nội dung đánh giá.';
        return;
      }
      saveBtn.disabled = true;
      saveBtn.textContent = 'Đang lưu...';
      const { error } = await client.from('testimonials').insert({
        student_name: name, student_role: role || null, course, content,
        avatar_url: avatarUrl || null
      });
      saveBtn.disabled = false;
      saveBtn.textContent = 'Lưu đánh giá';
      if (error) {
        errorEl.textContent = 'Không lưu được: ' + error.message;
        return;
      }
      form.reset();
      form.hidden = true;
      load();
    });

    load();
  }

  // ===== Class schedules =====
  function initSchedules(client) {
    const toggleBtn = document.getElementById('scheduleAddToggle');
    const form = document.getElementById('scheduleForm');
    const errorEl = document.getElementById('scheduleError');
    const saveBtn = document.getElementById('scheduleSaveBtn');
    const tbody = document.getElementById('scheduleTableBody');

    toggleBtn.addEventListener('click', () => { form.hidden = !form.hidden; });

    async function load() {
      tbody.innerHTML = '<tr><td colspan="7" class="admin-table__loading">Đang tải...</td></tr>';
      const { data, error } = await client.from('class_schedules').select('*').order('start_date', { ascending: true });
      if (error) {
        tbody.innerHTML = '<tr><td colspan="7" class="admin-error">Lỗi: ' + escHtml(error.message) + '</td></tr>';
        return;
      }
      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="admin-empty">Chưa có lịch khai giảng nào.</td></tr>';
        return;
      }
      tbody.innerHTML = '';
      data.forEach(row => {
        const remaining = Math.max(row.total_slots - row.filled_slots, 0);
        const tr = document.createElement('tr');
        tr.innerHTML =
          '<td>' + (COURSE_LABEL[row.course] || row.course) + '</td>' +
          '<td>' + new Date(row.start_date + 'T00:00:00').toLocaleDateString('vi-VN') + '</td>' +
          '<td>' + row.total_slots + '</td>' +
          '<td>' + row.filled_slots + '</td>' +
          '<td>' + remaining + '</td>' +
          '<td><button type="button" class="admin-status-btn ' + (row.is_active ? 'admin-status-btn--active' : 'admin-status-btn--inactive') + '" data-id="' + escHtml(row.id) + '" data-active="' + row.is_active + '">' + (row.is_active ? 'Đang mở' : 'Đã đóng') + '</button></td>' +
          '<td><button type="button" class="admin-delete-btn" data-id="' + escHtml(row.id) + '">Xoá</button></td>';
        tbody.appendChild(tr);
      });
      tbody.querySelectorAll('.admin-status-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const isActive = btn.dataset.active === 'true';
          await client.from('class_schedules').update({ is_active: !isActive }).eq('id', btn.dataset.id);
          load();
        });
      });
      tbody.querySelectorAll('.admin-delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Xoá lịch khai giảng này?')) return;
          await client.from('class_schedules').delete().eq('id', btn.dataset.id);
          load();
        });
      });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorEl.textContent = '';
      const course = document.getElementById('sCourse').value;
      const startDate = document.getElementById('sDate').value;
      const total = parseInt(document.getElementById('sTotal').value, 10) || 0;
      const filled = parseInt(document.getElementById('sFilled').value, 10) || 0;
      if (!startDate) {
        errorEl.textContent = 'Vui lòng chọn ngày khai giảng.';
        return;
      }
      saveBtn.disabled = true;
      saveBtn.textContent = 'Đang lưu...';
      const { error } = await client.from('class_schedules').insert({
        course, start_date: startDate, total_slots: total, filled_slots: filled
      });
      saveBtn.disabled = false;
      saveBtn.textContent = 'Lưu lịch khai giảng';
      if (error) {
        errorEl.textContent = 'Không lưu được: ' + error.message;
        return;
      }
      form.reset();
      form.hidden = true;
      load();
    });

    load();
  }
})();
