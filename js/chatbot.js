// Chatbot widget — trả lời câu hỏi thường gặp (FAQ) theo từ khóa.
// Không dùng AI thật, không cần API key, không gọi mạng ngoài — vì vậy
// không tốn chi phí và khách truy cập không cần biết gì về kỹ thuật.
// Toàn bộ dữ liệu câu hỏi/trả lời nằm ngay trong file này (mảng FAQ bên dưới).

(function () {
  const FAQ = [
    {
      id: 'mos',
      label: 'Khóa học MOS',
      keywords: ['mos', 'word', 'excel', 'powerpoint', 'van phong', 'tin hoc van phong'],
      answer: 'Khóa MOS đào tạo Word, Excel, PowerPoint từ cơ bản đến nâng cao, luyện thi chứng chỉ quốc tế MOS.\n\n💰 Học phí: 1.000.000đ (Word + Excel) hoặc 1.500.000đ (trọn bộ Word + Excel + PowerPoint)\n🗓 Lịch học: 6 buổi · Thứ 7 & CN · 13:30–16:30',
      link: { href: 'mos-ai.html', text: 'Xem chi tiết khóa MOS →' }
    },
    {
      id: 'java',
      label: 'Khóa học Java',
      keywords: ['java', 'lap trinh', 'lap trinh vien', 'code', 'oop'],
      answer: 'Khóa Lập trình Java học nền tảng lập trình, OOP, cấu trúc dữ liệu và thực hành theo dự án thật, kéo dài 12 tuần. Học viên có portfolio cá nhân khi tốt nghiệp.\n\nĐăng ký tư vấn để biết lịch khai giảng gần nhất và học phí chi tiết nhé!',
      link: { href: 'index.html#courses', text: 'Xem khóa Java →' }
    },
    {
      id: 'ai',
      label: 'Khóa học AI',
      keywords: ['ai', 'chatgpt', 'claude', 'llm', 'tri tue nhan tao', 'ung dung ai'],
      answer: 'Khóa "Ứng Dụng AI Đột Phá" giúp bạn làm chủ Claude AI, ChatGPT để tăng năng suất công việc, học tập.\n\n💰 Học phí: 4.000.000đ\n🗓 Lịch học: 6 buổi · Thứ 7 & CN · 13:30–16:30',
      link: { href: 'course-ai.html', text: 'Xem chi tiết khóa AI →' }
    },
    {
      id: 'tuition',
      label: 'Học phí',
      keywords: ['hoc phi', 'gia', 'bao nhieu tien', 'chi phi', 'tien hoc'],
      answer: 'Học phí hiện tại:\n• MOS: 1.000.000đ (Word+Excel) hoặc 1.500.000đ (trọn bộ)\n• Ứng dụng AI: 4.000.000đ\n• Lập trình Java: liên hệ để được tư vấn gói phù hợp\n\nBạn muốn hỏi chi tiết khóa nào không?'
    },
    {
      id: 'schedule',
      label: 'Lịch học',
      keywords: ['lich hoc', 'thoi gian hoc', 'gio hoc', 'khai giang', 'hoc luc nao'],
      answer: 'Các khóa MOS và Ứng dụng AI học 6 buổi, mỗi buổi 3 tiếng, vào Thứ 7 & Chủ Nhật, từ 13:30–16:30. Khóa Java học 12 tuần, lịch chi tiết sẽ được tư vấn khi bạn đăng ký.'
    },
    {
      id: 'register',
      label: 'Cách đăng ký',
      keywords: ['dang ky', 'ghi danh', 'lam sao de hoc', 'how to register'],
      answer: 'Bạn chỉ cần bấm nút "Đăng ký tư vấn" bên dưới, điền Họ tên – SĐT – Email, đội ngũ Kỷ Nguyên sẽ liên hệ tư vấn lộ trình phù hợp cho bạn trong thời gian sớm nhất!',
      action: 'open-register'
    },
    {
      id: 'contact',
      label: 'Liên hệ / Địa chỉ',
      keywords: ['dia chi', 'lien he', 'so dien thoai', 'email', 'o dau', 'hotline'],
      answer: '📍 123 Đường Nguyễn Trãi, Q.1, TP.HCM\n📞 (028) 1234 5678\n📧 info@kynguyen.edu.vn'
    },
    {
      id: 'certificate',
      label: 'Chứng chỉ',
      keywords: ['chung chi', 'bang cap', 'certiport'],
      answer: 'Các khóa học tại Kỷ Nguyên đều có đầu ra chứng chỉ được công nhận (chứng chỉ MOS Certiport quốc tế cho khóa MOS). Chứng chỉ có giá trị khi ứng tuyển việc làm hoặc xét tuyển học tập.'
    }
  ];

  const GREETINGS = ['chao', 'hi', 'hello', 'xin chao', 'alo'];

  const MENU_IDS = ['mos', 'java', 'ai', 'tuition', 'schedule', 'register', 'contact'];

  function normalize(str) {
    return (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .trim();
  }

  function findFaq(text) {
    const norm = normalize(text);
    if (!norm) return null;
    let best = null;
    let bestScore = 0;
    FAQ.forEach(item => {
      let score = 0;
      item.keywords.forEach(k => {
        if (norm.indexOf(normalize(k)) !== -1) score += normalize(k).length;
      });
      if (score > bestScore) { bestScore = score; best = item; }
    });
    return bestScore > 0 ? best : null;
  }

  function isGreeting(text) {
    const norm = normalize(text);
    return GREETINGS.some(g => norm.indexOf(normalize(g)) !== -1);
  }

  function isThanks(text) {
    const norm = normalize(text);
    return norm.indexOf('cam on') !== -1 || norm.indexOf('thank') !== -1;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('chatbot');
    if (!root) return;

    const toggleBtn = document.getElementById('chatbotToggle');
    const closeBtn = document.getElementById('chatbotCloseBtn');
    const messagesEl = document.getElementById('chatbotMessages');
    const inputEl = document.getElementById('chatbotInput');
    const sendBtn = document.getElementById('chatbotSend');

    let greeted = false;

    const scrollToBottom = () => { messagesEl.scrollTop = messagesEl.scrollHeight; };

    const appendBotText = (text) => {
      const div = document.createElement('div');
      div.className = 'chatbot__msg chatbot__msg--assistant';
      div.textContent = text;
      messagesEl.appendChild(div);
      scrollToBottom();
    };

    const appendUserText = (text) => {
      const div = document.createElement('div');
      div.className = 'chatbot__msg chatbot__msg--user';
      div.textContent = text;
      messagesEl.appendChild(div);
      scrollToBottom();
    };

    const appendLink = (link) => {
      const a = document.createElement('a');
      a.href = link.href;
      a.className = 'chatbot__link';
      a.textContent = link.text;
      messagesEl.appendChild(a);
      scrollToBottom();
    };

    const openRegisterModal = () => {
      const trigger = document.querySelector('.js-open-register');
      if (trigger) trigger.click();
    };

    const appendChips = (ids) => {
      const row = document.createElement('div');
      row.className = 'chatbot__chip-row';
      ids.forEach(id => {
        const item = FAQ.find(f => f.id === id);
        if (!item) return;
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'chatbot__chip';
        chip.textContent = item.label;
        chip.addEventListener('click', () => handleUserQuery(item.label, item));
        row.appendChild(chip);
      });
      messagesEl.appendChild(row);
      scrollToBottom();
    };

    const answerWith = (item) => {
      appendBotText(item.answer);
      if (item.link) appendLink(item.link);
      if (item.action === 'open-register') {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn--primary btn--sm chatbot__inline-cta';
        btn.textContent = 'Đăng ký tư vấn ngay';
        btn.addEventListener('click', openRegisterModal);
        messagesEl.appendChild(btn);
        scrollToBottom();
      }
    };

    const handleUserQuery = (rawText, matchedItem) => {
      if (rawText) appendUserText(rawText);

      const item = matchedItem || findFaq(rawText);
      if (item) {
        answerWith(item);
        return;
      }
      if (isGreeting(rawText)) {
        appendBotText('Chào bạn! 👋 Mình là trợ lý của Kỷ Nguyên. Bạn muốn hỏi về điều gì?');
        appendChips(MENU_IDS);
        return;
      }
      if (isThanks(rawText)) {
        appendBotText('Không có gì! Mình luôn sẵn sàng hỗ trợ bạn 😊');
        return;
      }

      appendBotText('Mình chưa có câu trả lời chính xác cho câu hỏi này 🙏 Bạn thử chọn 1 trong các câu hỏi gợi ý bên dưới, hoặc đăng ký để được tư vấn trực tiếp nhé!');
      appendChips(MENU_IDS);
    };

    const greet = () => {
      if (greeted) return;
      greeted = true;
      appendBotText('Xin chào! 👋 Mình là trợ lý ảo của Trung tâm Tin học Kỷ Nguyên. Bạn muốn hỏi về điều gì?');
      appendChips(MENU_IDS);
    };

    toggleBtn.addEventListener('click', () => {
      const isOpen = root.classList.toggle('is-open');
      if (isOpen) {
        greet();
        setTimeout(() => inputEl.focus(), 50);
      }
    });
    closeBtn.addEventListener('click', () => root.classList.remove('is-open'));

    const autoGrow = () => {
      inputEl.style.height = 'auto';
      inputEl.style.height = Math.min(inputEl.scrollHeight, 90) + 'px';
    };
    inputEl.addEventListener('input', autoGrow);

    const handleSend = () => {
      const text = inputEl.value.trim();
      if (!text) return;
      inputEl.value = '';
      autoGrow();
      handleUserQuery(text, null);
    };

    sendBtn.addEventListener('click', handleSend);
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });
  });
})();
