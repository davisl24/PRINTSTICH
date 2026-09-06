(() => {
  'use strict';

  const product = window.PRINTSTICH_PRODUCTS?.tshirt;
  if (!product) return;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const MB = 1024 * 1024;
  const FORM_LIMIT = 10 * MB;
  const MAX_CLIENT_FILE_SIZE = 8 * MB;
  const MAX_MOCKUP_FILE_SIZE = 1 * MB;
  const MIN_VALID_MOCKUP_SIZE = 5000;
  const SIDE_KEYS = ['front', 'back'];
  const SIDE_TO_PRODUCT = { front: 'prieksa', back: 'aizmugure' };
  const SIDE_LABELS = { front: 'Priekša', back: 'Aizmugure' };
  const MOCKUP_NAMES = { front: 'mockup-prieksa.png', back: 'mockup-aizmugure.png' };

  const els = {
    panels: $$('[data-step-panel]'),
    indicators: $$('[data-step-indicator]'),
    prev: $('[data-prev-step]'),
    next: $('[data-next-step]'),
    navigation: $('[data-step-navigation]'),
    preview: $('[data-preview]'),
    previewCard: $('[data-preview-card]'),
    previewColumn: $('.customizer-preview-column'),
    shirt: $('[data-shirt-image]'),
    placeholder: $('[data-mockup-placeholder]'),
    printArea: $('[data-print-area]'),
    legacyDesign: $('[data-design-image]'),
    colorButtons: $$('[data-color]'),
    sizeButtons: $$('[data-size]'),
    sideButtons: $$('[data-side]'),
    sideStatuses: $$('[data-side-status]'),
    uploadZone: $('[data-upload-zone]'),
    designInput: $('[data-design-input]'),
    fileName: $('[data-file-name]'),
    fileActions: $('[data-file-actions]'),
    replace: $('[data-replace-design]'),
    remove: $('[data-remove-design]'),
    activeSideLabel: $('[data-active-side-label]'),
    uploadActionLabel: $('[data-upload-action-label]'),
    scale: $('[data-scale-input]'),
    presetButtons: $$('[data-position-preset]'),
    form: $('[data-customizer-form]'),
    originalAttachments: $('[data-original-attachments]'),
    mockupInputs: {
      front: $('[data-mockup-file="front"]'),
      back: $('[data-mockup-file="back"]')
    },
    success: $('[data-success-message]'),
    summaryCanvases: {
      front: $('[data-final-preview="front"]'),
      back: $('[data-final-preview="back"]')
    },
    summaryCards: {
      front: $('[data-summary-side-card="front"]'),
      back: $('[data-summary-side-card="back"]')
    },
    whatsapp: $('[data-whatsapp-link]'),
    debugMockup: $('#debugMockup')
  };

  if (!els.preview || !els.printArea || !els.scale) return;

  if (els.shirt) {
    els.shirt.hidden = true;
    els.shirt.removeAttribute('src');
    els.shirt.alt = '';
  }

  const normalizeColor = value => ({ white: 'balts', black: 'melns', blue: 'zils' }[value] || value || 'balts');
  const colorById = id => product.krasas.find(color => color.id === normalizeColor(id)) || product.krasas[0];
  const productSide = sideKey => SIDE_TO_PRODUCT[sideKey] || 'prieksa';

  const createSideState = () => ({
    file: null,
    url: '',
    image: null,
    naturalWidth: 0,
    naturalHeight: 0,
    x: 0.5,
    y: 0.5,
    scale: 1,
    preset: 'center',
    vectorFallback: false
  });

  const state = {
    step: 1,
    color: 'balts',
    size: '',
    activeSide: 'front',
    svgLoaded: false,
    svgRoot: null,
    submitting: false,
    sides: {
      front: createSideState(),
      back: createSideState()
    }
  };

  const currentSide = () => state.sides[state.activeSide];
  const error = (name, message = '') => {
    const node = $(`[data-error="${name}"]`);
    if (node) node.textContent = message;
  };

  function ensureColorButtons() {
    const group = $('[data-color-options]');
    if (!group) return;

    product.krasas.forEach(color => {
      const existing = $$('[data-color]', group).find(button => normalizeColor(button.dataset.color) === color.id);
      if (existing) {
        existing.dataset.color = color.id;
        const swatch = $('.swatch', existing);
        if (swatch) swatch.style.backgroundColor = color.hex;
        const textNode = [...existing.childNodes].find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
        if (textNode) textNode.textContent = color.nosaukums;
        return;
      }

      const button = document.createElement('button');
      button.className = 'color-swatch';
      button.type = 'button';
      button.dataset.color = color.id;
      button.setAttribute('aria-pressed', 'false');
      button.innerHTML = `<span class="swatch" aria-hidden="true" style="background:${color.hex}"></span>${color.nosaukums}`;
      group.appendChild(button);
    });

    els.colorButtons = $$('[data-color]');
  }

  function ensureMeasurementUi() {
    const scaleControl = els.scale.closest('.scale-control') || els.scale.parentElement;
    if (!scaleControl || $('[data-print-size]')) return;

    const info = document.createElement('div');
    info.className = 'print-size-info';
    info.innerHTML = '<p data-print-size>Drukas izmērs: —</p><p class="customizer-error print-limit-warning" data-print-limit-warning aria-live="polite"></p><p class="customizer-error dpi-warning" data-dpi-warning aria-live="polite"></p>';
    scaleControl.insertAdjacentElement('afterend', info);
  }

  function ensureMobileHint() {
    if (!els.previewCard || $('[data-mobile-drag-hint]')) return;
    const hint = document.createElement('p');
    hint.className = 'customizer-preview-hint customizer-mobile-drag-hint';
    hint.dataset.mobileDragHint = '';
    hint.textContent = 'Velc dizainu ar pirkstu, lai to pārvietotu';
    hint.hidden = true;
    els.previewCard.appendChild(hint);
  }

  ensureColorButtons();
  ensureMeasurementUi();
  ensureMobileHint();

  els.printSize = $('[data-print-size]');
  els.printLimitWarning = $('[data-print-limit-warning]');
  els.dpiWarning = $('[data-dpi-warning]');
  els.mobileDragHint = $('[data-mobile-drag-hint]');

  function ensureDesignCanvas() {
    let canvas = $('[data-design-canvas]', els.printArea);
    if (canvas) return canvas;

    canvas = document.createElement('canvas');
    canvas.className = 'customizer-design-canvas';
    canvas.dataset.designCanvas = '';
    canvas.setAttribute('aria-label', 'Augšupielādētā dizaina priekšskatījums');
    Object.assign(canvas.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      display: 'block',
      touchAction: 'none',
      cursor: 'grab'
    });

    if (els.legacyDesign) els.legacyDesign.hidden = true;
    els.printArea.appendChild(canvas);
    return canvas;
  }

  els.designCanvas = ensureDesignCanvas();

  function setPressed(buttons, activeButton) {
    buttons.forEach(button => {
      const active = button === activeButton;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function getZone(sideKey = state.activeSide) {
    return product.drukasZona[productSide(sideKey)];
  }

  function getPhysicalArea(sideKey = state.activeSide) {
    if (!state.size) return null;
    return product.drukasLaukumsMm?.[productSide(sideKey)]?.[state.size] || null;
  }

  function getDesignRect(zoneWidth, zoneHeight, side = currentSide()) {
    if (!side.naturalWidth || !side.naturalHeight) return null;

    const aspect = side.naturalWidth / side.naturalHeight;
    let width = zoneWidth * side.scale;
    let height = width / aspect;

    if (height > zoneHeight * side.scale) {
      height = zoneHeight * side.scale;
      width = height * aspect;
    }

    return {
      width,
      height,
      x: side.x * zoneWidth - width / 2,
      y: side.y * zoneHeight - height / 2
    };
  }

  function getVirtualZoneSize(sideKey) {
    const zone = getZone(sideKey);
    return { width: zone.w * 600, height: zone.h * 700 };
  }

  function constrainPosition(sideKey = state.activeSide) {
    const side = state.sides[sideKey];
    if (!side.file || side.vectorFallback) return;
    const virtual = getVirtualZoneSize(sideKey);
    const rect = getDesignRect(virtual.width, virtual.height, side);
    if (!rect) return;

    const halfX = rect.width / (2 * virtual.width);
    const halfY = rect.height / (2 * virtual.height);
    side.x = clamp(side.x, halfX, 1 - halfX);
    side.y = clamp(side.y, halfY, 1 - halfY);
  }

  function printMetrics(sideKey = state.activeSide) {
    const side = state.sides[sideKey];
    const mmArea = getPhysicalArea(sideKey);
    if (!side.file || !mmArea || side.vectorFallback || !side.naturalWidth || !side.naturalHeight) return null;

    const virtual = getVirtualZoneSize(sideKey);
    const rect = getDesignRect(virtual.width, virtual.height, side);
    if (!rect) return null;

    const widthMm = (rect.width / virtual.width) * mmArea.w;
    const heightMm = (rect.height / virtual.height) * mmArea.h;
    const dpi = widthMm > 0 ? (side.naturalWidth / widthMm) * 25.4 : 0;

    return {
      widthMm,
      heightMm,
      dpi,
      widthRounded: Math.round(widthMm),
      heightRounded: Math.round(heightMm),
      dpiRounded: Math.round(dpi)
    };
  }

  function maxAllowedScale(sideKey = state.activeSide) {
    const side = state.sides[sideKey];
    const mmArea = getPhysicalArea(sideKey);
    if (!side.file || !mmArea || side.vectorFallback || !side.naturalWidth || !side.naturalHeight) return 1;

    const virtual = getVirtualZoneSize(sideKey);
    const max = product.maxDrukaMm;

    for (let candidate = 1; candidate >= 0.05; candidate -= 0.005) {
      const testSide = { ...side, scale: candidate };
      const rect = getDesignRect(virtual.width, virtual.height, testSide);
      if (!rect) return 1;
      const widthMm = (rect.width / virtual.width) * mmArea.w;
      const heightMm = (rect.height / virtual.height) * mmArea.h;
      if (widthMm <= max.w && heightMm <= max.h) return candidate;
    }

    return 0.05;
  }

  function enforcePrintLimit(sideKey = state.activeSide, showMessage = false) {
    const side = state.sides[sideKey];
    if (!side.file || !state.size || side.vectorFallback) return false;

    const allowed = maxAllowedScale(sideKey);
    if (side.scale <= allowed + 0.0001) return false;

    side.scale = allowed;
    if (showMessage && sideKey === state.activeSide && els.printLimitWarning) {
      els.printLimitWarning.textContent = `Šis izmērs pārsniedz maksimālo drukas laukumu (${product.maxDrukaMm.w} × ${product.maxDrukaMm.h} mm). Dizains automātiski samazināts.`;
    }
    return true;
  }

  function updatePrintArea() {
    const zone = getZone();
    if (!zone) return;
    Object.assign(els.printArea.style, {
      left: `${zone.x * 100}%`,
      top: `${zone.y * 100}%`,
      width: `${zone.w * 100}%`,
      height: `${zone.h * 100}%`
    });
  }

  function updatePlaceholder() {
    if (els.placeholder) els.placeholder.hidden = state.svgLoaded;
  }

  function updateSvgColor() {
    if (!state.svgRoot) return;
    const color = colorById(state.color);
    state.svgRoot.querySelectorAll('.shirt-body').forEach(node => node.setAttribute('fill', color.hex));
    const dark = color.id === 'melns' || color.id === 'zils';

    state.svgRoot.querySelectorAll('[stroke]').forEach(node => {
      if (!node.dataset.originalStroke) node.dataset.originalStroke = node.getAttribute('stroke') || '';
      if (dark) node.setAttribute('stroke', '#D9DEE8');
      else if (color.id === 'balts') node.setAttribute('stroke', '#c9c6bf');
      else if (node.dataset.originalStroke) node.setAttribute('stroke', node.dataset.originalStroke);
    });
  }

  function updateSvgSide() {
    if (!state.svgRoot) return;
    const front = state.svgRoot.querySelector('#shirt-front');
    const back = state.svgRoot.querySelector('#shirt-back');
    if (front) front.style.display = state.activeSide === 'front' ? 'block' : 'none';
    if (back) back.style.display = state.activeSide === 'back' ? 'block' : 'none';
  }

  async function loadShirtSvg() {
    try {
      const response = await fetch(product.svg, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
      const markup = await response.text();

      let host = $('[data-shirt-svg-host]');
      if (!host) {
        host = document.createElement('div');
        host.className = 'customizer-shirt-svg';
        host.dataset.shirtSvgHost = '';
        Object.assign(host.style, {
          position: 'absolute',
          inset: '0',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        });
        els.preview.insertBefore(host, els.printArea);
      }

      host.innerHTML = markup;
      const svg = $('svg', host);
      if (!svg) throw new Error('assets/krekls.svg nesatur <svg> elementu.');

      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      Object.assign(svg.style, { width: '100%', height: '100%', display: 'block' });

      state.svgRoot = svg;
      state.svgLoaded = true;
      updateSvgColor();
      updateSvgSide();
      updatePlaceholder();
      updatePrintArea();
      requestAnimationFrame(renderDesign);
    } catch (svgError) {
      state.svgLoaded = false;
      state.svgRoot = null;
      updatePlaceholder();
      console.error('PrintStich konfigurators: krekla SVG neizdevās ielādēt no assets/krekls.svg.', svgError);
    }
  }

  function drawVectorFallback(ctx, width, height) {
    ctx.save();
    ctx.strokeStyle = '#8d9692';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 5]);
    ctx.strokeRect(1, 1, width - 2, height - 2);
    ctx.setLineDash([]);
    ctx.fillStyle = '#53615d';
    ctx.font = '600 14px Manrope, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('vektora fails pielikumā', width / 2, height / 2);
    ctx.restore();
  }

  function drawDesignCanvas() {
    const canvas = els.designCanvas;
    const side = currentSide();
    const rect = els.printArea.getBoundingClientRect();
    if (!canvas || !rect.width || !rect.height) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pixelWidth = Math.max(1, Math.round(rect.width * dpr));
    const pixelHeight = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
    if (canvas.height !== pixelHeight) canvas.height = pixelHeight;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    if (!side.file) return;
    if (side.vectorFallback) {
      drawVectorFallback(ctx, rect.width, rect.height);
      return;
    }
    if (!side.image) return;

    const designRect = getDesignRect(rect.width, rect.height, side);
    if (!designRect) return;
    ctx.drawImage(side.image, designRect.x, designRect.y, designRect.width, designRect.height);
  }

  function updateMeasurementUi() {
    const side = currentSide();
    const metrics = printMetrics();

    if (!side.file || side.vectorFallback || !metrics) {
      if (els.printSize) els.printSize.textContent = side.file && side.vectorFallback ? 'Drukas izmērs: vektora fails' : 'Drukas izmērs: —';
      if (els.dpiWarning) els.dpiWarning.textContent = '';
      return;
    }

    if (els.printSize) els.printSize.textContent = `Drukas izmērs: ${metrics.widthRounded} × ${metrics.heightRounded} mm`;
    if (els.dpiWarning) {
      els.dpiWarning.textContent = metrics.dpi < 150
        ? `Faila izšķirtspēja šim izmēram ir zema (aptuveni ${metrics.dpiRounded} DPI). Druka var izskatīties izplūdusi. Ieteicams vismaz 150 DPI.`
        : '';
    }
  }

  function updatePresetState() {
    els.presetButtons.forEach(button => {
      const active = currentSide().preset === button.dataset.positionPreset;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function updateSideUi() {
    els.sideButtons.forEach(button => {
      const key = button.dataset.side;
      const active = key === state.activeSide;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    els.sideStatuses.forEach(status => {
      const side = state.sides[status.dataset.sideStatus];
      if (!side) return;
      status.textContent = side.file ? 'gatavs' : 'tukša';
      status.hidden = Boolean(side.file);
    });

    const side = currentSide();
    if (els.activeSideLabel) els.activeSideLabel.textContent = SIDE_LABELS[state.activeSide];
    if (els.fileName) els.fileName.textContent = side.file ? side.file.name : '';
    if (els.fileActions) els.fileActions.hidden = !side.file;
    if (els.uploadZone) els.uploadZone.hidden = Boolean(side.file);
    if (els.uploadActionLabel) els.uploadActionLabel.textContent = side.file ? 'Nomainīt failu' : 'Pievienot dizainu';

    els.scale.value = String(Math.round(side.scale * 100));
    els.scale.max = String(Math.max(20, Math.floor(maxAllowedScale() * 100)));
    updatePresetState();
    updateMeasurementUi();
  }

  function renderDesign() {
    updatePrintArea();
    const side = currentSide();

    if (side.file && !side.vectorFallback) {
      enforcePrintLimit(state.activeSide, false);
      constrainPosition(state.activeSide);
    }

    updateSideUi();
    drawDesignCanvas();
  }

  function updatePreview() {
    updateSvgColor();
    updateSvgSide();
    updatePrintArea();
    requestAnimationFrame(renderDesign);
  }

  function anySideHasDesign() {
    return SIDE_KEYS.some(key => Boolean(state.sides[key].file));
  }

  function stepComplete(step) {
    if (step === 1) return Boolean(state.size);
    if (step === 2) return anySideHasDesign();
    return true;
  }

  function updateNavigation() {
    if (els.prev) els.prev.disabled = state.step === 1;
    if (els.next) {
      els.next.hidden = state.step === 3;
      els.next.style.display = state.step === 3 ? 'none' : '';
      els.next.disabled = !stepComplete(state.step);
    }
  }

  function showStep(step) {
    state.step = clamp(step, 1, 3);

    els.panels.forEach(panel => {
      const active = Number(panel.dataset.stepPanel) === state.step;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });

    els.indicators.forEach(indicator => {
      const active = Number(indicator.dataset.stepIndicator) === state.step;
      indicator.classList.toggle('is-active', active);
      if (active) indicator.setAttribute('aria-current', 'step');
      else indicator.removeAttribute('aria-current');
    });

    const showEditorPreview = state.step !== 3;
    if (els.previewColumn) els.previewColumn.hidden = !showEditorPreview;
    if (els.designCanvas) els.designCanvas.style.pointerEvents = state.step === 2 ? 'auto' : 'none';
    els.printArea.style.borderColor = state.step === 2 ? '' : 'transparent';

    updateNavigation();
    updateSideUi();
    if (state.step === 3) updateSummary();
  }

  els.colorButtons.forEach(button => button.addEventListener('click', () => {
    state.color = normalizeColor(button.dataset.color);
    setPressed(els.colorButtons, button);
    updatePreview();
  }));

  els.sizeButtons.forEach(button => button.addEventListener('click', () => {
    state.size = button.dataset.size;
    error('size');
    setPressed(els.sizeButtons, button);
    SIDE_KEYS.forEach(key => enforcePrintLimit(key, false));
    renderDesign();
    updateNavigation();
  }));

  els.sideButtons.forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.side;
    if (!SIDE_KEYS.includes(key)) return;
    state.activeSide = key;
    error('file');
    updatePreview();
    updateNavigation();
  }));

  function validateFile(file) {
    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'application/pdf'];
    if (!file) return 'Izvēlies dizaina failu.';
    if (!allowed.includes(file.type)) return 'Atļauts PNG, JPG/JPEG, WebP, SVG vai PDF fails.';
    if (file.size > MAX_CLIENT_FILE_SIZE) return 'Fails ir par lielu. Maksimālais klienta faila izmērs ir 8 MB.';
    return '';
  }

  function scrollToPreviewAfterUpload() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    requestAnimationFrame(() => els.preview.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' }));
  }

  function finishFileLoad(sideKey, file) {
    enforcePrintLimit(sideKey, false);
    constrainPosition(sideKey);
    updateSideUi();
    renderDesign();
    updateNavigation();
    scrollToPreviewAfterUpload();
  }

  function loadFile(file) {
    const message = validateFile(file);
    if (message) {
      error('file', message);
      return;
    }

    error('file');
    const sideKey = state.activeSide;
    const side = state.sides[sideKey];
    if (side.url) URL.revokeObjectURL(side.url);

    side.file = file;
    side.url = URL.createObjectURL(file);
    side.image = null;
    side.naturalWidth = 0;
    side.naturalHeight = 0;
    side.x = 0.5;
    side.y = 0.5;
    side.scale = 1;
    side.preset = 'center';
    side.vectorFallback = false;

    const image = new Image();
    image.onload = () => {
      side.image = image;
      side.naturalWidth = image.naturalWidth;
      side.naturalHeight = image.naturalHeight;
      finishFileLoad(sideKey, file);
    };
    image.onerror = () => {
      if (file.type === 'application/pdf' || file.type === 'image/svg+xml') {
        side.vectorFallback = true;
        side.naturalWidth = 1;
        side.naturalHeight = 1;
        finishFileLoad(sideKey, file);
        return;
      }
      side.file = null;
      side.image = null;
      URL.revokeObjectURL(side.url);
      side.url = '';
      error('file', 'Attēlu neizdevās nolasīt. Izvēlies citu failu.');
      updateSideUi();
      renderDesign();
      updateNavigation();
    };
    image.src = side.url;
  }

  if (els.designInput) els.designInput.addEventListener('change', () => {
    const file = els.designInput.files?.[0];
    if (file) loadFile(file);
    els.designInput.value = '';
  });

  if (els.uploadZone) {
    ['dragenter', 'dragover'].forEach(name => els.uploadZone.addEventListener(name, event => {
      event.preventDefault();
      els.uploadZone.classList.add('is-dragging');
    }));
    ['dragleave', 'drop'].forEach(name => els.uploadZone.addEventListener(name, event => {
      event.preventDefault();
      els.uploadZone.classList.remove('is-dragging');
    }));
    els.uploadZone.addEventListener('drop', event => {
      const file = event.dataTransfer?.files?.[0];
      if (file) loadFile(file);
    });
  }

  if (els.replace && els.designInput) {
    els.replace.addEventListener('click', () => els.designInput.click());
  }

  if (els.remove) {
    els.remove.addEventListener('click', () => {
      const side = currentSide();
      if (side.url) URL.revokeObjectURL(side.url);
      state.sides[state.activeSide] = createSideState();
      error('file');
      updateSideUi();
      renderDesign();
      updateNavigation();
    });
  }

  els.scale.addEventListener('input', () => {
    const side = currentSide();
    side.scale = Number(els.scale.value) / 100;
    side.preset = '';
    const exceeded = enforcePrintLimit(state.activeSide, false);
    if (els.printLimitWarning) {
      els.printLimitWarning.textContent = exceeded
        ? `Šis izmērs pārsniedz maksimālo drukas laukumu (${product.maxDrukaMm.w} × ${product.maxDrukaMm.h} mm). Samazini dizainu.`
        : '';
    }
    constrainPosition(state.activeSide);
    renderDesign();
  });

  function applyPreset(preset) {
    const side = currentSide();
    if (!side.file) return;

    side.preset = preset;
    if (preset === 'center') {
      side.x = 0.5;
      side.y = 0.5;
    } else if (preset === 'top') {
      side.x = 0.5;
      side.y = 0.27;
    } else if (preset === 'lower') {
      side.x = 0.5;
      side.y = 0.73;
    } else if (preset === 'left-chest') {
      const mmArea = getPhysicalArea();
      side.scale = mmArea ? clamp(90 / mmArea.w, 0.05, 1) : 0.32;
      side.x = 0.28;
      side.y = 0.28;
    }

    enforcePrintLimit(state.activeSide, false);
    constrainPosition(state.activeSide);
    renderDesign();
  }

  els.presetButtons.forEach(button => button.addEventListener('click', () => applyPreset(button.dataset.positionPreset)));

  let drag = null;
  els.designCanvas.addEventListener('pointerdown', event => {
    const side = currentSide();
    if (!side.file || state.step !== 2 || side.vectorFallback) return;
    event.preventDefault();
    els.designCanvas.setPointerCapture(event.pointerId);
    els.designCanvas.style.cursor = 'grabbing';
    drag = { pointerId: event.pointerId };
    side.preset = '';
    updatePresetState();
  });

  els.designCanvas.addEventListener('pointermove', event => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const area = els.printArea.getBoundingClientRect();
    const side = currentSide();
    side.x = (event.clientX - area.left) / area.width;
    side.y = (event.clientY - area.top) / area.height;
    constrainPosition(state.activeSide);
    renderDesign();
  });

  const endDrag = event => {
    if (drag?.pointerId !== event.pointerId) return;
    drag = null;
    els.designCanvas.style.cursor = 'grab';
  };
  els.designCanvas.addEventListener('pointerup', endDrag);
  els.designCanvas.addEventListener('pointercancel', endDrag);

  if (els.prev) els.prev.addEventListener('click', () => showStep(state.step - 1));
  if (els.next) els.next.addEventListener('click', () => {
    if (!stepComplete(state.step)) {
      if (state.step === 1) error('size', 'Izvēlies krekla izmēru.');
      if (state.step === 2) error('file', 'Pievieno dizainu vismaz vienai krekla pusei.');
      return;
    }
    showStep(state.step + 1);
  });

  function inlineComputedSvgStyles(sourceSvg, cloneSvg) {
    const sourceNodes = [sourceSvg, ...sourceSvg.querySelectorAll('*')];
    const cloneNodes = [cloneSvg, ...cloneSvg.querySelectorAll('*')];

    sourceNodes.forEach((sourceNode, index) => {
      const cloneNode = cloneNodes[index];
      if (!cloneNode) return;
      const computed = getComputedStyle(sourceNode);
      ['fill', 'stroke', 'stroke-width', 'opacity'].forEach(property => {
        const value = computed.getPropertyValue(property);
        if (value) cloneNode.setAttribute(property, value.trim());
      });
    });
  }

  function prepareSerializedSvg(sideKey) {
    if (!state.svgRoot) throw new Error('Krekla SVG nav ielādēts.');

    updateSvgColor();
    const sourceRect = state.svgRoot.getBoundingClientRect();
    const clone = state.svgRoot.cloneNode(true);
    const existingViewBox = state.svgRoot.getAttribute('viewBox');
    const fallbackWidth = sourceRect.width || state.svgRoot.viewBox?.baseVal?.width || 600;
    const fallbackHeight = sourceRect.height || state.svgRoot.viewBox?.baseVal?.height || 700;
    const width = Math.max(1, Math.round(fallbackWidth));
    const height = Math.max(1, Math.round(fallbackHeight));

    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', String(width));
    clone.setAttribute('height', String(height));
    clone.setAttribute('viewBox', existingViewBox || `0 0 ${width} ${height}`);

    inlineComputedSvgStyles(state.svgRoot, clone);

    const front = clone.querySelector('#shirt-front');
    const back = clone.querySelector('#shirt-back');
    if (front) front.style.display = sideKey === 'front' ? 'block' : 'none';
    if (back) back.style.display = sideKey === 'back' ? 'block' : 'none';

    const viewBoxParts = clone.getAttribute('viewBox').trim().split(/[ ,]+/).map(Number);
    const viewBox = viewBoxParts.length === 4 && viewBoxParts.every(Number.isFinite)
      ? { x: viewBoxParts[0], y: viewBoxParts[1], width: viewBoxParts[2], height: viewBoxParts[3] }
      : { x: 0, y: 0, width, height };

    return {
      svgString: new XMLSerializer().serializeToString(clone),
      viewBox
    };
  }

  async function svgToImage(sideKey) {
    const { svgString, viewBox } = prepareSerializedSvg(sideKey);
    const image = new Image();
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
    await image.decode();
    if (!image.naturalWidth || !image.naturalHeight) throw new Error('Serializētais SVG ielādējās ar 0×0 izmēru.');
    return { image, viewBox };
  }

  function drawMockupContent(ctx, canvas, sideKey, shirtImage) {
    const side = state.sides[sideKey];
    const zone = getZone(sideKey);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(shirtImage, 0, 0, canvas.width, canvas.height);

    if (!side.file || !zone) return;

    const zoneX = zone.x * canvas.width;
    const zoneY = zone.y * canvas.height;
    const zoneW = zone.w * canvas.width;
    const zoneH = zone.h * canvas.height;

    if (side.vectorFallback || !side.image) {
      ctx.save();
      ctx.translate(zoneX, zoneY);
      drawVectorFallback(ctx, zoneW, zoneH);
      ctx.restore();
      return;
    }

    const designRect = getDesignRect(zoneW, zoneH, side);
    if (!designRect) return;
    ctx.drawImage(side.image, zoneX + designRect.x, zoneY + designRect.y, designRect.width, designRect.height);
  }

  function canvasToBlob(canvas) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('PNG mockapu neizdevās izveidot.')), 'image/png');
    });
  }

  function validateMockupBlob(blob, cause = null) {
    if (blob && blob.size >= MIN_VALID_MOCKUP_SIZE) return blob;
    const validationError = new Error('Neizdevās sagatavot attēlu, mēģini vēlreiz');
    console.error('PrintStich konfigurators: mockapa validācija neizdevās.', cause || new Error(`PNG izmērs: ${blob?.size || 0} baiti`));
    throw validationError;
  }

  async function createMockupBlob(sideKey, maxBytes = MAX_MOCKUP_FILE_SIZE, startWidth = 1000) {
    let svgData;
    try {
      svgData = await svgToImage(sideKey);
    } catch (cause) {
      console.error(`PrintStich konfigurators: ${SIDE_LABELS[sideKey]} SVG renderēšana mockapam neizdevās.`, cause);
      throw new Error('Neizdevās sagatavot attēlu, mēģini vēlreiz');
    }

    let width = startWidth;
    while (width >= 400) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = Math.round(width * (svgData.viewBox.height / svgData.viewBox.width));
      drawMockupContent(canvas.getContext('2d'), canvas, sideKey, svgData.image);
      const blob = validateMockupBlob(await canvasToBlob(canvas));
      if (blob.size <= maxBytes || width === 400) return blob;
      width = Math.max(400, Math.round(width * 0.82));
    }

    throw new Error('Mockapa PNG neizdevās samazināt līdz atļautajam izmēram.');
  }

  async function drawSummaryMockup(sideKey) {
    const canvas = els.summaryCanvases[sideKey];
    if (!canvas) return;

    try {
      const svgData = await svgToImage(sideKey);
      canvas.width = 420;
      canvas.height = Math.round(420 * (svgData.viewBox.height / svgData.viewBox.width));
      drawMockupContent(canvas.getContext('2d'), canvas, sideKey, svgData.image);
    } catch (previewError) {
      console.error(`PrintStich konfigurators: ${SIDE_LABELS[sideKey]} kopsavilkuma preview neizdevās izveidot.`, previewError);
      const ctx = canvas.getContext('2d');
      canvas.width = 420;
      canvas.height = 490;
      ctx.fillStyle = '#f7f7f5';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  function positionLabel(side) {
    const labels = { center: 'Centrā', 'left-chest': 'Krūšu kreisajā pusē', top: 'Augšā', lower: 'Zemāk' };
    return labels[side.preset] || `X ${Math.round(side.x * 100)}%, Y ${Math.round(side.y * 100)}%`;
  }

  function syncFormData() {
    const color = colorById(state.color);
    const colorInput = $('[data-form-color]');
    const sizeInput = $('[data-form-size]');
    if (colorInput) colorInput.value = color.nosaukums;
    if (sizeInput) sizeInput.value = state.size;

    SIDE_KEYS.forEach(sideKey => {
      const side = state.sides[sideKey];
      const metrics = printMetrics(sideKey);
      const positionInput = $(`[data-form-position="${sideKey}"]`);
      const printInput = $(`[data-form-print-mm="${sideKey}"]`);
      const filenameInput = $(`[data-form-original-filename="${sideKey}"]`);

      if (positionInput) positionInput.value = side.file ? `${positionLabel(side)} — X ${Math.round(side.x * 100)}%, Y ${Math.round(side.y * 100)}%, mērogs ${Math.round(side.scale * 100)}%` : 'Nav dizaina';
      if (printInput) printInput.value = !side.file ? 'Nav dizaina' : side.vectorFallback ? 'Vektora/PDF fails' : metrics ? `${metrics.widthRounded} × ${metrics.heightRounded} mm` : 'Nav aprēķināms';
      if (filenameInput) filenameInput.value = side.file?.name || 'Nav faila';
    });
  }

  function clearGeneratedOriginalInputs() {
    if (!els.originalAttachments) return;
    els.originalAttachments.innerHTML = '';
  }

  function syncOriginalAttachments() {
    if (!els.originalAttachments) return false;
    if (typeof DataTransfer === 'undefined') {
      error('form', 'Šis pārlūks nevar sagatavot pielikumus. Lūdzu, izmanto jaunāko Chrome, Safari vai Firefox.');
      return false;
    }

    clearGeneratedOriginalInputs();

    SIDE_KEYS.forEach(sideKey => {
      const side = state.sides[sideKey];
      if (!side.file) return;
      const input = document.createElement('input');
      input.type = 'file';
      input.name = 'attachment';
      input.className = 'visually-hidden';
      input.tabIndex = -1;
      input.setAttribute('aria-hidden', 'true');
      input.dataset.originalAttachment = sideKey;
      const transfer = new DataTransfer();
      transfer.items.add(side.file);
      input.files = transfer.files;
      els.originalAttachments.appendChild(input);
    });

    return true;
  }

  function setMockupInput(sideKey, blob) {
    const input = els.mockupInputs[sideKey];
    if (!input) throw new Error(`${SIDE_LABELS[sideKey]} mockup file input nav atrasts.`);
    if (typeof DataTransfer === 'undefined') throw new Error('DataTransfer nav pieejams.');

    const file = new File([blob], MOCKUP_NAMES[sideKey], { type: 'image/png' });
    const transfer = new DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
    return file;
  }

  async function prepareEmailAttachments() {
    const designedSides = SIDE_KEYS.filter(key => state.sides[key].file);
    const originalsTotal = designedSides.reduce((sum, key) => sum + state.sides[key].file.size, 0);

    if (originalsTotal >= FORM_LIMIT - designedSides.length * MIN_VALID_MOCKUP_SIZE) {
      throw new Error('Oriģinālo failu kopējais izmērs ir pārāk liels FormSubmit 10 MB limitam. Samazini failu izmērus un mēģini vēlreiz.');
    }

    let remainingBudget = FORM_LIMIT - originalsTotal;
    const mockupFiles = [];

    for (let index = 0; index < designedSides.length; index += 1) {
      const sideKey = designedSides[index];
      const mockupsLeft = designedSides.length - index;
      const perMockupBudget = Math.min(MAX_MOCKUP_FILE_SIZE, Math.floor(remainingBudget / mockupsLeft));
      if (perMockupBudget < MIN_VALID_MOCKUP_SIZE) {
        throw new Error('Nepietiek vietas mockapu pielikumiem 10 MB FormSubmit limitā.');
      }

      const blob = await createMockupBlob(sideKey, perMockupBudget, 1000);
      if (blob.size > perMockupBudget) {
        throw new Error('Mockapa izmēru neizdevās samazināt līdz FormSubmit limitam.');
      }
      const file = setMockupInput(sideKey, blob);
      mockupFiles.push(file);
      remainingBudget -= file.size;
    }

    SIDE_KEYS.filter(key => !state.sides[key].file).forEach(key => {
      const input = els.mockupInputs[key];
      if (input) input.value = '';
    });

    if (!syncOriginalAttachments()) throw new Error('Oriģinālos failus neizdevās sagatavot nosūtīšanai.');

    const finalTotal = originalsTotal + mockupFiles.reduce((sum, file) => sum + file.size, 0);
    if (finalTotal > FORM_LIMIT) throw new Error('Pielikumu kopējais izmērs pārsniedz FormSubmit 10 MB limitu.');
    return mockupFiles;
  }

  function updateWhatsApp() {
    if (!els.whatsapp) return;
    const color = colorById(state.color);
    const lines = [
      'Sveiki! Vēlos PrintStich piedāvājumu savam krekla dizainam.',
      `Krekls: ${color.nosaukums}`,
      `Izmērs: ${state.size}`
    ];

    SIDE_KEYS.forEach(sideKey => {
      const side = state.sides[sideKey];
      if (!side.file) return;
      const metrics = printMetrics(sideKey);
      lines.push(`${SIDE_LABELS[sideKey]}: ${side.file.name}`);
      lines.push(`Pozīcija: ${positionLabel(side)}, X ${Math.round(side.x * 100)}%, Y ${Math.round(side.y * 100)}%`);
      if (metrics) lines.push(`Drukas izmērs: ${metrics.widthRounded} × ${metrics.heightRounded} mm`);
    });

    els.whatsapp.href = `https://wa.me/37127333112?text=${encodeURIComponent(lines.join('\n'))}`;
  }

  async function updateSummary() {
    const color = colorById(state.color);
    const summaryColor = $('[data-summary-color]');
    const summarySize = $('[data-summary-size]');
    if (summaryColor) summaryColor.textContent = color.nosaukums;
    if (summarySize) summarySize.textContent = state.size || '—';

    syncFormData();
    updateWhatsApp();
    await Promise.all(SIDE_KEYS.map(drawSummaryMockup));
  }

  if (els.debugMockup) {
    els.debugMockup.addEventListener('click', async () => {
      error('form');
      try {
        const sideKey = state.activeSide;
        const blob = validateMockupBlob(await createMockupBlob(sideKey));
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener');
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      } catch (debugError) {
        console.error('PrintStich konfigurators: debug mockupu neizdevās izveidot.', debugError);
        error('form', 'Neizdevās sagatavot attēlu, mēģini vēlreiz');
      }
    });
  }

  if (els.form) {
    els.form.addEventListener('submit', async event => {
      if (state.submitting) return;
      event.preventDefault();
      error('form');

      const name = $('[data-customer-name]')?.value.trim() || '';
      const contact = $('[data-customer-contact]')?.value.trim() || '';

      if (!state.size) {
        error('form', 'Izvēlies krekla izmēru.');
        return;
      }
      if (!anySideHasDesign()) {
        error('form', 'Pievieno dizainu vismaz vienai krekla pusei.');
        return;
      }
      if (SIDE_KEYS.some(key => state.sides[key].file?.size > MAX_CLIENT_FILE_SIZE)) {
        error('form', 'Kāds no failiem ir par lielu. Maksimālais viena klienta faila izmērs ir 8 MB.');
        return;
      }
      if (!name) {
        error('form', 'Ievadi savu vārdu.');
        return;
      }
      if (!contact) {
        error('form', 'Ievadi telefonu vai e-pastu.');
        return;
      }

      syncFormData();
      const submitButton = $('.customizer-submit', els.form);
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sagatavo nosūtīšanai...';
      }

      try {
        await prepareEmailAttachments();
        state.submitting = true;
        els.form.submit();
      } catch (submitError) {
        console.error('PrintStich konfigurators: submit sagatavošana neizdevās.', submitError);
        error('form', submitError.message || 'Neizdevās sagatavot attēlu, mēģini vēlreiz');
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'Nosūtīt savu dizainu';
        }
      }
    });
  }

  function showThankYouIfNeeded() {
    if (window.location.hash !== '#paldies') return;
    els.panels.forEach(panel => { panel.hidden = true; });
    if (els.navigation) els.navigation.hidden = true;
    if (els.previewColumn) els.previewColumn.hidden = true;
    if (els.success) els.success.hidden = false;
  }

  function updateMobileLayout() {
    const mobile = window.matchMedia('(max-width: 767px)').matches;
    if (els.mobileDragHint) els.mobileDragHint.hidden = !(mobile && state.step === 2);
    if (mobile && state.step !== 3) {
      els.preview.style.height = '45vh';
      els.preview.style.maxHeight = '45vh';
    } else {
      els.preview.style.height = '';
      els.preview.style.maxHeight = '';
    }
    requestAnimationFrame(renderDesign);
  }

  window.addEventListener('resize', updateMobileLayout);
  updateMobileLayout();
  updatePreview();
  showStep(1);
  showThankYouIfNeeded();
  loadShirtSvg();
})();