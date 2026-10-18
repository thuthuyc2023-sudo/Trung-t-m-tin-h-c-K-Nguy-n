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
    });
  });
})();
