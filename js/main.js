document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');

  // Shrink / add background emphasis on scroll
  const onScroll = () => {
    if (window.scrollY > 10) nav.classList.add('nav--scrolled');
    else nav.classList.remove('nav--scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu toggle
  burger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('nav__links--open');
    burger.classList.toggle('nav__burger--open', isOpen);
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('nav__links--open');
      burger.classList.remove('nav__burger--open');
    });
  });

  // Reveal-on-scroll for sections
  const revealEls = document.querySelectorAll('.card, .feature, .testimonial, .roadmap__step, .stat');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => {
    el.classList.add('reveal');
    io.observe(el);
  });

  // ===== Register / consultation modal =====
  const overlay = document.getElementById('registerModal');
  if (overlay) {
    const form = document.getElementById('registerForm');
    const formView = document.getElementById('modalFormView');
    const successView = document.getElementById('modalSuccessView');
    const closeBtn = document.getElementById('modalClose');
    const successCloseBtn = document.getElementById('modalSuccessClose');
    const openTriggers = document.querySelectorAll('.js-open-register');

    const fields = {
      name: { input: document.getElementById('regName'), error: document.getElementById('errName') },
      phone: { input: document.getElementById('regPhone'), error: document.getElementById('errPhone') },
      email: { input: document.getElementById('regEmail'), error: document.getElementById('errEmail') }
    };

    const setError = (field, message) => {
      field.input.classList.toggle('has-error', !!message);
      field.error.textContent = message || '';
    };

    const validatePhone = (value) => /^(0\d{9}|\+84\d{9})$/.test(value.replace(/[\s.-]/g, ''));
    const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

    const resetModal = () => {
      form.reset();
      Object.values(fields).forEach(f => setError(f, ''));
      formView.hidden = false;
      successView.hidden = true;
    };

    const openModal = () => {
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      setTimeout(() => fields.name.input && fields.name.input.focus(), 50);
    };

    const closeModal = () => {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      setTimeout(resetModal, 250);
    };

    openTriggers.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    });

    closeBtn.addEventListener('click', closeModal);
    successCloseBtn.addEventListener('click', closeModal);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameVal = fields.name.input.value.trim();
      const phoneVal = fields.phone.input.value.trim();
      const emailVal = fields.email.input.value.trim();
      let firstInvalid = null;

      setError(fields.name, nameVal ? '' : 'Vui lòng nhập họ và tên');
      if (!nameVal) firstInvalid = firstInvalid || fields.name.input;

      if (!phoneVal) {
        setError(fields.phone, 'Vui lòng nhập số điện thoại');
        firstInvalid = firstInvalid || fields.phone.input;
      } else if (!validatePhone(phoneVal)) {
        setError(fields.phone, 'Số điện thoại không hợp lệ');
        firstInvalid = firstInvalid || fields.phone.input;
      } else {
        setError(fields.phone, '');
      }

      if (!emailVal) {
        setError(fields.email, 'Vui lòng nhập email');
        firstInvalid = firstInvalid || fields.email.input;
      } else if (!validateEmail(emailVal)) {
        setError(fields.email, 'Email không hợp lệ');
        firstInvalid = firstInvalid || fields.email.input;
      } else {
        setError(fields.email, '');
      }

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      formView.hidden = true;
      successView.hidden = false;
    });
  }
});
