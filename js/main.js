(() => {
  'use strict';

  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');
  const form = document.querySelector('[data-inquiry-form]');
  const formStatus = document.querySelector('[data-form-status]');
  const scrollTopButton = document.querySelector('.scroll-top');
  const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 16);
  };

  const setScrollTopState = () => {
    if (!scrollTopButton) return;
    scrollTopButton.classList.toggle('is-visible', window.scrollY > 400);
  };

  const closeMenu = () => {
    if (!menuToggle || !nav) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  };

  const toggleMenu = () => {
    if (!menuToggle || !nav) return;
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    nav.classList.toggle('is-open', !isOpen);
    document.body.classList.toggle('menu-open', !isOpen);
  };

  const initMenu = () => {
    if (!menuToggle || !nav) return;

    menuToggle.addEventListener('click', toggleMenu);

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768) closeMenu();
    });
  };

  const initRevealAnimations = () => {
    const reduceMotion = reduceMotionQuery.matches;
    const elements = [
      ...document.querySelectorAll('.section-heading, .work-card, .service-row, .process-grid li, .quote-shell, .inquiry-copy, .inquiry-form')
    ];

    if (!elements.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    elements.forEach((element) => element.classList.add('reveal'));

    const observer = new IntersectionObserver(
      (entries, instance) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          instance.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    elements.forEach((element) => observer.observe(element));
  };

  const initDividers = () => {
    const dividers = [...document.querySelectorAll('.divider')];
    if (!dividers.length) return;

    if (reduceMotionQuery.matches || !('IntersectionObserver' in window)) {
      dividers.forEach((divider) => divider.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, instance) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          instance.unobserve(entry.target);
        });
      },
      { threshold: 0.2 }
    );

    dividers.forEach((divider) => observer.observe(divider));
  };

  const initScrollTop = () => {
    if (!scrollTopButton) return;

    setScrollTopState();

    scrollTopButton.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: reduceMotionQuery.matches ? 'auto' : 'smooth'
      });
    });
  };

  const validateContact = (value) => {
    const normalized = value.trim();
    if (!normalized) return false;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[+\d\s()\-]{7,}$/;

    return emailPattern.test(normalized) || phonePattern.test(normalized);
  };

  const initForm = () => {
    if (!form || !formStatus) return;

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const nameInput = form.querySelector('#name');
      const contactInput = form.querySelector('#contact');
      const messageInput = form.querySelector('#message');

      const name = nameInput?.value.trim() ?? '';
      const contact = contactInput?.value.trim() ?? '';
      const message = messageInput?.value.trim() ?? '';

      formStatus.classList.remove('is-error', 'is-success');

      if (!name || !message || !validateContact(contact)) {
        formStatus.textContent = 'Lūdzu, aizpildi vārdu, derīgu telefonu vai e-pastu un apraksti savu ideju.';
        formStatus.classList.add('is-error');
        return;
      }

      formStatus.textContent = 'Paldies! Forma ir aizpildīta korekti. Nosūtīšana uz PrintStich e-pastu tiks pieslēgta nākamajā posmā.';
      formStatus.classList.add('is-success');
    });
  };

  setHeaderState();
  initMenu();
  initRevealAnimations();
  initDividers();
  initScrollTop();
  initForm();

  window.addEventListener('scroll', () => {
    setHeaderState();
    setScrollTopState();
  }, { passive: true });
})();
