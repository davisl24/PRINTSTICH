(() => {
  'use strict';

  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');
  const form = document.querySelector('[data-inquiry-form]');
  const formStatus = document.querySelector('[data-form-status]');
  const scrollTopButton = document.querySelector('.scroll-top');
  const portfolioGrid = document.querySelector('[data-portfolio-grid]');
  const portfolioFilters = [...document.querySelectorAll('.portfolio-filter')];
  const galleryMoreButton = document.querySelector('.gallery-more');
  const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  let activePortfolioCategory = 'Visi';
  let showAllPortfolioItems = false;

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

  const revealElements = (elements) => {
    if (!elements.length) return;

    if (reduceMotionQuery.matches || !('IntersectionObserver' in window)) {
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

  const initRevealAnimations = () => {
    const elements = [
      ...document.querySelectorAll('.section-heading, .service-row, .process-grid li, .quote-shell, .inquiry-copy, .inquiry-form')
    ];

    revealElements(elements);
  };

  const getPortfolioItems = (category) => (
    category === 'Visi'
      ? window.PORTFOLIO_ITEMS
      : window.PORTFOLIO_ITEMS.filter((item) => item.kategorija === category)
  );

  const updateGalleryMoreButton = (items) => {
    if (!galleryMoreButton) return;

    const canToggle = activePortfolioCategory === 'Visi' && items.length > 6;
    galleryMoreButton.hidden = !canToggle;

    if (canToggle) {
      galleryMoreButton.textContent = showAllPortfolioItems
        ? 'Rādīt mazāk'
        : 'Rādīt visus darbus';
      galleryMoreButton.setAttribute('aria-expanded', String(showAllPortfolioItems));
    }
  };

  const renderPortfolio = (category = activePortfolioCategory) => {
    if (!portfolioGrid || !Array.isArray(window.PORTFOLIO_ITEMS)) return;

    const items = getPortfolioItems(category);
    const visibleItems = category === 'Visi' && !showAllPortfolioItems
      ? items.slice(0, 6)
      : items;

    portfolioGrid.innerHTML = '';

    const fragment = document.createDocumentFragment();

    visibleItems.forEach((item, index) => {
      const article = document.createElement('article');
      article.className = 'portfolio-card';

      const image = document.createElement('img');
      image.className = 'portfolio-image';
      image.src = `assets/images/darbi/${item.fails}`;
      image.alt = item.alt;
      image.width = 1200;
      image.height = 1200;
      image.decoding = 'async';

      if (index >= 6) {
        image.loading = 'lazy';
      }

      article.appendChild(image);
      fragment.appendChild(article);
    });

    portfolioGrid.appendChild(fragment);
    updateGalleryMoreButton(items);
    revealElements([...portfolioGrid.querySelectorAll('.portfolio-card')]);
  };

  const initPortfolioFilters = () => {
    if (!portfolioGrid || !portfolioFilters.length || !Array.isArray(window.PORTFOLIO_ITEMS)) return;

    renderPortfolio();

    portfolioFilters.forEach((button) => {
      button.addEventListener('click', () => {
        activePortfolioCategory = button.dataset.category || 'Visi';
        showAllPortfolioItems = false;

        portfolioFilters.forEach((filterButton) => {
          const isActive = filterButton === button;
          filterButton.classList.toggle('is-active', isActive);
          filterButton.setAttribute('aria-pressed', String(isActive));
        });

        renderPortfolio();
      });
    });

    if (galleryMoreButton) {
      galleryMoreButton.addEventListener('click', () => {
        if (activePortfolioCategory !== 'Visi') return;
        showAllPortfolioItems = !showAllPortfolioItems;
        renderPortfolio();
      });
    }
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

  const initCustomizerPrintAreaSync = () => {
    const preview = document.querySelector('[data-preview]');
    const printArea = document.querySelector('[data-print-area]');
    const sideButtons = [...document.querySelectorAll('[data-side]')];
    const product = window.PRINTSTICH_PRODUCTS?.tshirt;
    if (!preview || !printArea || !product) return;

    const sideMap = {
      front: 'prieksa',
      back: 'aizmugure',
      sleeveLeft: 'sleeveLeft',
      sleeveRight: 'sleeveRight'
    };

    let syncing = false;
    let frame = 0;

    const getActiveSide = () => (
      sideButtons.find((button) => button.getAttribute('aria-pressed') === 'true')?.dataset.side || 'front'
    );

    const getRenderedSvgBounds = () => {
      const svg = preview.querySelector('[data-shirt-svg-host] svg');
      if (!svg) return null;

      const svgBox = svg.getBoundingClientRect();
      const wrapBox = preview.getBoundingClientRect();
      if (!svgBox.width || !svgBox.height || !wrapBox.width || !wrapBox.height) return null;

      const viewBox = svg.viewBox?.baseVal;
      let width = svgBox.width;
      let height = svgBox.height;
      let left = svgBox.left - wrapBox.left;
      let top = svgBox.top - wrapBox.top;

      if (viewBox?.width && viewBox?.height) {
        const scale = Math.min(svgBox.width / viewBox.width, svgBox.height / viewBox.height);
        width = viewBox.width * scale;
        height = viewBox.height * scale;
        left += (svgBox.width - width) / 2;
        top += (svgBox.height - height) / 2;
      }

      return { left, top, width, height };
    };

    const sync = () => {
      frame = 0;
      const bounds = getRenderedSvgBounds();
      const sideKey = sideMap[getActiveSide()];
      const zone = product.drukasZona?.[sideKey];
      if (!bounds || !zone) return;

      const next = {
        left: `${bounds.left + zone.x * bounds.width}px`,
        top: `${bounds.top + zone.y * bounds.height}px`,
        width: `${zone.w * bounds.width}px`,
        height: `${zone.h * bounds.height}px`
      };

      if (
        printArea.style.left === next.left &&
        printArea.style.top === next.top &&
        printArea.style.width === next.width &&
        printArea.style.height === next.height
      ) return;

      syncing = true;
      Object.assign(printArea.style, next);
      syncing = false;
    };

    const scheduleSync = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(sync);
    };

    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(scheduleSync);
      resizeObserver.observe(preview);
    }

    const previewObserver = new MutationObserver(scheduleSync);
    previewObserver.observe(preview, { childList: true, subtree: true });

    const areaObserver = new MutationObserver(() => {
      if (!syncing) scheduleSync();
    });
    areaObserver.observe(printArea, { attributes: true, attributeFilter: ['style'] });

    sideButtons.forEach((button) => button.addEventListener('click', scheduleSync));
    scheduleSync();
  };

  setHeaderState();
  initMenu();
  initPortfolioFilters();
  initRevealAnimations();
  initDividers();
  initScrollTop();
  initForm();
  initCustomizerPrintAreaSync();

  window.addEventListener('scroll', () => {
    setHeaderState();
    setScrollTopState();
  }, { passive: true });
})();
