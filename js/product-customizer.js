(() => {
  'use strict';

  const product = window.PRINTSTICH_PRODUCTS?.tshirt;
  if (!product) return;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const els = {
    panels: $$('[data-step-panel]'),
    indicators: $$('[data-step-indicator]'),
    prev: $('[data-prev-step]'),
    next: $('[data-next-step]'),
    navigation: $('[data-step-navigation]'),
    preview: $('[data-preview]'),
    shirt: $('[data-shirt-image]'),
    placeholder: $('[data-mockup-placeholder]'),
    printArea: $('[data-print-area]'),
    design: $('[data-design-image]'),
    colorButtons: $$('[data-color]'),
    sizeButtons: $$('[data-size]'),
    sideButtons: $$('[data-side]'),
    uploadZone: $('[data-upload-zone]'),
    designInput: $('[data-design-input]'),
    fileName: $('[data-file-name]'),
    scale: $('[data-scale-input]'),
    center: $('[data-center-design]'),
    remove: $('[data-remove-design]'),
    form: $('[data-customizer-form]'),
    attachmentSlot: $('[data-attachment-slot]'),
    success: $('[data-success-message]'),
    finalPreview: $('[data-final-preview]'),
    whatsapp: $('[data-whatsapp-link]')
  };

  if (!els.preview || !els.printArea || !els.design) return;

  const createSideState = () => ({
    file: null,
    url: '',
    naturalWidth: 0,
    naturalHeight: 0,
    positionX: 0.5,
    positionY: 0.5,
    scale: 0.5
  });

  const state = {
    step: 1,
    color: 'white',
    size: '',
    side: 'front',
    sides: {
      front: createSideState(),
      back: createSideState()
    }
  };

  const error = (name, message = '') => {
    const node = $(`[data-error="${name}"]`);
    if (node) node.textContent = message;
  };

  const colorLabel = () => product.krasas[state.color]?.label || state.color;
  const sideLabel = () => product.puses[state.side] || state.side;
  const currentSide = () => state.sides[state.side];

  function setPressed(buttons, activeButton) {
    buttons.forEach((button) => {
      const active = button === activeButton;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function updatePrintArea() {
    const zone = product.drukasZona[state.side];
    if (!zone) return;
    Object.assign(els.printArea.style, {
      left: `${zone.x * 100}%`,
      top: `${zone.y * 100}%`,
      width: `${zone.w * 100}%`,
      height: `${zone.h * 100}%`
    });
  }

  function updateMockup() {
    const source = product.krasas[state.color]?.mockups?.[state.side];
    if (!source) return;
    els.placeholder.hidden = true;
    els.shirt.hidden = false;
    els.shirt.src = source;
    els.shirt.alt = `${colorLabel()} T-krekla ${sideLabel().toLowerCase()}s priekšskatījums`;
  }

  els.shirt.addEventListener('load', () => {
    els.shirt.hidden = false;
    els.placeholder.hidden = true;
  });

  els.shirt.addEventListener('error', () => {
    els.shirt.hidden = true;
    els.placeholder.hidden = false;
  });

  function designDimensions(side = currentSide()) {
    const area = els.printArea.getBoundingClientRect();
    if (!area.width || !area.height || !side.naturalWidth || !side.naturalHeight) return null;

    const aspect = side.naturalWidth / side.naturalHeight;
    const maxWidth = area.width * side.scale;
    const maxHeight = area.height * side.scale;
    let width = maxWidth;
    let height = width / aspect;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspect;
    }

    return { area, width, height };
  }

  function constrainPosition(side = currentSide()) {
    const dimensions = designDimensions(side);
    if (!dimensions) return;
    const { area, width, height } = dimensions;
    const halfX = width / (2 * area.width);
    const halfY = height / (2 * area.height);
    side.positionX = clamp(side.positionX, halfX, 1 - halfX);
    side.positionY = clamp(side.positionY, halfY, 1 - halfY);
  }

  function renderDesign() {
    const side = currentSide();
    if (!side.url) {
      els.design.hidden = true;
      return;
    }

    constrainPosition(side);
    const dimensions = designDimensions(side);
    if (!dimensions) return;

    els.design.hidden = false;
    els.design.src = side.url;
    els.design.style.width = `${dimensions.width}px`;
    els.design.style.height = `${dimensions.height}px`;
    els.design.style.left = `${side.positionX * 100}%`;
    els.design.style.top = `${side.positionY * 100}%`;
    els.design.style.transform = 'translate(-50%, -50%)';
    els.scale.value = String(Math.round(side.scale * 100));
  }

  function updatePreview() {
    updateMockup();
    updatePrintArea();
    requestAnimationFrame(renderDesign);
  }

  function stepComplete(step) {
    if (step === 1) return Boolean(state.size);
    if (step === 2) return Boolean(currentSide().file);
    if (step === 3) return Boolean(currentSide().file);
    return true;
  }

  function updateNavigation() {
    els.prev.disabled = state.step === 1;
    els.next.hidden = state.step === 4;
    els.next.disabled = !stepComplete(state.step);
  }

  function showStep(step) {
    state.step = clamp(step, 1, 4);
    els.panels.forEach((panel) => {
      const active = Number(panel.dataset.stepPanel) === state.step;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });
    els.indicators.forEach((indicator) => {
      const active = Number(indicator.dataset.stepIndicator) === state.step;
      indicator.classList.toggle('is-active', active);
      if (active) indicator.setAttribute('aria-current', 'step');
      else indicator.removeAttribute('aria-current');
    });
    els.printArea.style.borderColor = state.step === 4 ? 'transparent' : '';
    updateNavigation();
    if (state.step === 4) updateSummary();
  }

  els.colorButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.color = button.dataset.color;
      setPressed(els.colorButtons, button);
      updatePreview();
    });
  });

  els.sizeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.size = button.dataset.size;
      error('size');
      setPressed(els.sizeButtons, button);
      updateNavigation();
    });
  });

  els.sideButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.side = button.dataset.side;
      setPressed(els.sideButtons, button);
      error('file');
      updatePreview();
      updateNavigation();
    });
  });

  function validateFile(file) {
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    if (!file) return 'Izvēlies dizaina failu.';
    if (!allowed.includes(file.type)) return 'Atļauts PNG, JPG/JPEG vai WebP fails.';
    if (file.size > 10 * 1024 * 1024) return 'Fails ir par lielu. Maksimālais izmērs ir 10 MB.';
    return '';
  }

  function loadFile(file) {
    const message = validateFile(file);
    if (message) {
      error('file', message);
      return;
    }

    error('file');
    const side = currentSide();
    if (side.url) URL.revokeObjectURL(side.url);
    side.file = file;
    side.url = URL.createObjectURL(file);
    side.positionX = 0.5;
    side.positionY = 0.5;
    side.scale = 0.5;

    const image = new Image();
    image.onload = () => {
      side.naturalWidth = image.naturalWidth;
      side.naturalHeight = image.naturalHeight;
      els.fileName.textContent = `${sideLabel()}: ${file.name}`;
      renderDesign();
      updateNavigation();
    };
    image.onerror = () => {
      side.file = null;
      URL.revokeObjectURL(side.url);
      side.url = '';
      error('file', 'Attēlu neizdevās nolasīt. Izvēlies citu failu.');
      updateNavigation();
    };
    image.src = side.url;
  }

  els.designInput.addEventListener('change', () => loadFile(els.designInput.files?.[0]));

  ['dragenter', 'dragover'].forEach((eventName) => {
    els.uploadZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      els.uploadZone.classList.add('is-dragging');
    });
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    els.uploadZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      els.uploadZone.classList.remove('is-dragging');
    });
  });

  els.uploadZone.addEventListener('drop', (event) => loadFile(event.dataTransfer?.files?.[0]));

  els.scale.addEventListener('input', () => {
    currentSide().scale = Number(els.scale.value) / 100;
    renderDesign();
  });

  els.center.addEventListener('click', () => {
    const side = currentSide();
    side.positionX = 0.5;
    side.positionY = 0.5;
    renderDesign();
  });

  els.remove.addEventListener('click', () => {
    const side = currentSide();
    if (side.url) URL.revokeObjectURL(side.url);
    Object.assign(side, createSideState());
    els.designInput.value = '';
    els.fileName.textContent = '';
    els.design.hidden = true;
    error('file');
    updateNavigation();
    if (state.step === 3) showStep(2);
  });

  let drag = null;

  els.design.addEventListener('pointerdown', (event) => {
    if (!currentSide().url || state.step !== 3) return;
    event.preventDefault();
    els.design.setPointerCapture(event.pointerId);
    drag = { pointerId: event.pointerId };
  });

  els.design.addEventListener('pointermove', (event) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const area = els.printArea.getBoundingClientRect();
    const side = currentSide();
    side.positionX = (event.clientX - area.left) / area.width;
    side.positionY = (event.clientY - area.top) / area.height;
    constrainPosition(side);
    renderDesign();
  });

  const endDrag = (event) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    drag = null;
  };
  els.design.addEventListener('pointerup', endDrag);
  els.design.addEventListener('pointercancel', endDrag);

  els.prev.addEventListener('click', () => showStep(state.step - 1));
  els.next.addEventListener('click', () => {
    if (!stepComplete(state.step)) {
      if (state.step === 1) error('size', 'Izvēlies krekla izmēru.');
      if (state.step === 2) error('file', 'Pievieno savu dizainu.');
      return;
    }
    showStep(state.step + 1);
  });

  function loadImage(source) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = source;
    });
  }

  async function drawFinalPreview() {
    const canvas = els.finalPreview;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const mockupSource = product.krasas[state.color]?.mockups?.[state.side];
    const side = currentSide();
    canvas.width = 900;
    canvas.height = 900;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#efefec';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    try {
      const shirt = await loadImage(mockupSource);
      ctx.drawImage(shirt, 0, 0, canvas.width, canvas.height);
      if (!side.url) return;
      const design = await loadImage(side.url);
      const zone = product.drukasZona[state.side];
      const zoneX = zone.x * canvas.width;
      const zoneY = zone.y * canvas.height;
      const zoneW = zone.w * canvas.width;
      const zoneH = zone.h * canvas.height;
      const aspect = design.naturalWidth / design.naturalHeight;
      let width = zoneW * side.scale;
      let height = width / aspect;
      if (height > zoneH * side.scale) {
        height = zoneH * side.scale;
        width = height * aspect;
      }
      const x = zoneX + side.positionX * zoneW - width / 2;
      const y = zoneY + side.positionY * zoneH - height / 2;
      ctx.drawImage(design, x, y, width, height);
    } catch {
      ctx.fillStyle = '#5d6763';
      ctx.font = '600 24px Manrope, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Priekšskatījums būs redzams, kad būs pievienots mokaps.', canvas.width / 2, canvas.height / 2);
    }
  }

  function syncFormData() {
    const side = currentSide();
    $('[data-form-color]').value = colorLabel();
    $('[data-form-size]').value = state.size;
    $('[data-form-side]').value = sideLabel();
    $('[data-form-position-x]').value = side.positionX.toFixed(4);
    $('[data-form-position-y]').value = side.positionY.toFixed(4);
    $('[data-form-scale]').value = side.scale.toFixed(4);
  }

  function syncAttachment() {
    const side = currentSide();
    if (!side.file) return;
    const transfer = new DataTransfer();
    transfer.items.add(side.file);
    els.designInput.files = transfer.files;
    els.attachmentSlot.appendChild(els.designInput);
  }

  function updateWhatsApp() {
    const side = currentSide();
    const text = [
      'Sveiki! Vēlos PrintStich piedāvājumu savam krekla dizainam.',
      `Krekls: ${colorLabel()}`,
      `Izmērs: ${state.size}`,
      `Apdruka: ${sideLabel()}`,
      `Pozīcija: X ${side.positionX.toFixed(2)}, Y ${side.positionY.toFixed(2)}`,
      `Dizaina izmērs: ${Math.round(side.scale * 100)}%`
    ].join('\n');
    els.whatsapp.href = `https://wa.me/37127333112?text=${encodeURIComponent(text)}`;
  }

  function updateSummary() {
    $('[data-summary-color]').textContent = colorLabel();
    $('[data-summary-size]').textContent = state.size || '—';
    $('[data-summary-side]').textContent = sideLabel();
    syncFormData();
    updateWhatsApp();
    drawFinalPreview();
  }

  els.form.addEventListener('submit', (event) => {
    error('form');
    const name = $('[data-customer-name]').value.trim();
    const contact = $('[data-customer-contact]').value.trim();

    if (!state.size) {
      event.preventDefault();
      error('form', 'Izvēlies krekla izmēru.');
      return;
    }
    if (!currentSide().file) {
      event.preventDefault();
      error('form', 'Pievieno dizaina failu.');
      return;
    }
    if (!name) {
      event.preventDefault();
      error('form', 'Ievadi savu vārdu.');
      return;
    }
    if (!contact) {
      event.preventDefault();
      error('form', 'Ievadi telefonu vai e-pastu.');
      return;
    }

    syncFormData();
    syncAttachment();
  });

  function showThankYouIfNeeded() {
    if (window.location.hash !== '#paldies') return;
    els.panels.forEach((panel) => { panel.hidden = true; });
    els.navigation.hidden = true;
    els.success.hidden = false;
    els.printArea.style.borderColor = 'transparent';
  }

  window.addEventListener('resize', () => requestAnimationFrame(renderDesign));

  updatePreview();
  showStep(1);
  showThankYouIfNeeded();
})();
