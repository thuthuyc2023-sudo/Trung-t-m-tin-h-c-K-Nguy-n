// Chatbot widget — gọi thẳng từ trình duyệt tới API của Google Gemini hoặc Groq
// bằng API Key do chính người dùng nhập và lưu trong localStorage của họ.
// Key KHÔNG được gửi về bất kỳ máy chủ nào của Kỷ Nguyên (site này không có
// backend xử lý việc này) — toàn bộ request đi thẳng trình duyệt -> nhà cung cấp AI.
//
// Không dùng SDK/thư viện ngoài (chỉ fetch() thuần) nên không cần dynamic import,
// không ảnh hưởng tới quy ước "main.js không phải ES module" của dự án.

(function () {
  const STORAGE_KEY = 'kynguyen_chatbot_config'; // { provider, apiKey }

  const SYSTEM_PROMPT =
    'Bạn là trợ lý AI của Trung tâm Tin học Kỷ Nguyên. Hỗ trợ trả lời ngắn gọn, ' +
    'thân thiện bằng tiếng Việt về các khóa học MOS (Word/Excel/PowerPoint), Lập trình Java, ' +
    'và Ứng dụng AI. Nếu được hỏi ngoài chủ đề, vẫn trả lời hữu ích nhưng ngắn gọn.';

  const PROVIDERS = {
    gemini: {
      label: 'Google Gemini',
      model: 'gemini-2.0-flash',
      async send(apiKey, history) {
        const model = PROVIDERS.gemini.model;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const contents = history.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error((data && data.error && data.error.message) || `Lỗi Gemini (HTTP ${res.status})`);
        }
        const text = data && data.candidates && data.candidates[0] &&
          data.candidates[0].content && data.candidates[0].content.parts &&
          data.candidates[0].content.parts.map(p => p.text).join('');
        if (!text) throw new Error('Gemini không trả về nội dung (có thể do bộ lọc an toàn).');
        return text;
      }
    },
    groq: {
      label: 'Groq',
      model: 'llama-3.1-8b-instant',
      async send(apiKey, history) {
        const url = 'https://api.groq.com/openai/v1/chat/completions';
        const messages = [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history.map(m => ({ role: m.role, content: m.content }))
        ];

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey
          },
          body: JSON.stringify({ model: PROVIDERS.groq.model, messages })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error((data && data.error && data.error.message) || `Lỗi Groq (HTTP ${res.status})`);
        }
        const text = data && data.choices && data.choices[0] &&
          data.choices[0].message && data.choices[0].message.content;
        if (!text) throw new Error('Groq không trả về nội dung.');
        return text;
      }
    }
  };

  function loadConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.provider && parsed.apiKey && PROVIDERS[parsed.provider]) return parsed;
      return null;
    } catch (e) {
      return null;
    }
  }

  function saveConfig(provider, apiKey) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ provider, apiKey }));
    } catch (e) {
      // localStorage có thể bị chặn (chế độ ẩn danh nghiêm ngặt...) — bỏ qua, coi như chưa lưu được
    }
  }

  function clearConfig() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('chatbot');
    if (!root) return;

    const toggleBtn = document.getElementById('chatbotToggle');
    const closeBtn = document.getElementById('chatbotCloseBtn');
    const settingsBtn = document.getElementById('chatbotSettingsBtn');

    const settingsView = document.getElementById('chatbotSettingsView');
    const chatView = document.getElementById('chatbotChatView');

    const providerSelect = document.getElementById('chatbotProvider');
    const apiKeyInput = document.getElementById('chatbotApiKey');
    const saveBtn = document.getElementById('chatbotSaveKey');
    const settingsError = document.getElementById('chatbotSettingsError');

    const messagesEl = document.getElementById('chatbotMessages');
    const inputEl = document.getElementById('chatbotInput');
    const sendBtn = document.getElementById('chatbotSend');
    const providerLabel = document.getElementById('chatbotProviderLabel');
    const clearKeyBtn = document.getElementById('chatbotClearKey');

    let history = []; // { role: 'user'|'assistant', content }
    let sending = false;

    const showSettings = () => {
      settingsView.hidden = false;
      chatView.hidden = true;
    };
    const showChat = () => {
      settingsView.hidden = true;
      chatView.hidden = false;
    };

    const renderInitialView = () => {
      const cfg = loadConfig();
      if (cfg) {
        providerLabel.textContent = 'Đang dùng: ' + PROVIDERS[cfg.provider].label;
        showChat();
      } else {
        showSettings();
      }
    };

    toggleBtn.addEventListener('click', () => {
      const isOpen = root.classList.toggle('is-open');
      if (isOpen) {
        renderInitialView();
        setTimeout(() => {
          const cfg = loadConfig();
          (cfg ? inputEl : apiKeyInput).focus();
        }, 50);
      }
    });
    closeBtn.addEventListener('click', () => root.classList.remove('is-open'));
    settingsBtn.addEventListener('click', showSettings);

    saveBtn.addEventListener('click', () => {
      const provider = providerSelect.value;
      const key = apiKeyInput.value.trim();
      if (!key) {
        settingsError.textContent = 'Vui lòng nhập API Key.';
        apiKeyInput.focus();
        return;
      }
      settingsError.textContent = '';
      saveConfig(provider, key);
      apiKeyInput.value = '';
      providerLabel.textContent = 'Đang dùng: ' + PROVIDERS[provider].label;
      showChat();
      inputEl.focus();
    });

    clearKeyBtn.addEventListener('click', () => {
      clearConfig();
      history = [];
      messagesEl.innerHTML = '';
      showSettings();
      apiKeyInput.focus();
    });

    const appendMessage = (role, text) => {
      const div = document.createElement('div');
      div.className = 'chatbot__msg chatbot__msg--' + role;
      div.textContent = text;
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return div;
    };

    const autoGrow = () => {
      inputEl.style.height = 'auto';
      inputEl.style.height = Math.min(inputEl.scrollHeight, 90) + 'px';
    };
    inputEl.addEventListener('input', autoGrow);

    const handleSend = async () => {
      if (sending) return;
      const text = inputEl.value.trim();
      if (!text) return;

      const cfg = loadConfig();
      if (!cfg) {
        showSettings();
        settingsError.textContent = 'Chưa có API Key — vui lòng nhập trước khi chat.';
        return;
      }

      inputEl.value = '';
      autoGrow();
      appendMessage('user', text);
      history.push({ role: 'user', content: text });

      sending = true;
      sendBtn.disabled = true;
      const typingEl = appendMessage('typing', 'Đang trả lời...');

      try {
        const reply = await PROVIDERS[cfg.provider].send(cfg.apiKey, history);
        typingEl.remove();
        appendMessage('assistant', reply);
        history.push({ role: 'assistant', content: reply });
      } catch (err) {
        typingEl.remove();
        appendMessage('error', (err && err.message) || 'Có lỗi xảy ra khi gọi API. Kiểm tra lại API Key hoặc hạn mức sử dụng.');
      } finally {
        sending = false;
        sendBtn.disabled = false;
        inputEl.focus();
      }
    };

    sendBtn.addEventListener('click', handleSend);
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });

    renderInitialView();
  });
})();
