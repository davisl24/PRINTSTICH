(() => {
  'use strict';

  const product = window.PRINTSTICH_PRODUCTS?.tshirt;
  if (!product) return;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const MB = 1024 * 1024;
  const MAX_CLIENT_FILE_SIZE = 8 * MB;
  const MAX_MOCKUP_FILE_SIZE = 1 * MB;
  const MIN_VALID_MOCKUP_SIZE = 5000;

  const els = {
    panels: $$('[data-step-panel]'), indicators: $$('[data-step-indicator]'),
    prev: $('[data-prev-step]'), next: $('[data-next-step]'), navigation: $('[data-step-navigation]'),
    preview: $('[data-preview]'), previewCard: $('[data-preview-card]'), shirt: $('[data-shirt-image]'),
    placeholder: $('[data-mockup-placeholder]'), printArea: $('[data-print-area]'), legacyDesign: $('[data-design-image]'),
    colorButtons: $$('[data-color]'), sizeButtons: $$('[data-size]'), sideButtons: $$('[data-side]'),
    uploadZone: $('[data-upload-zone]'), designInput: $('[data-design-input]'), mockupInput: $('#mockupFile'), fileName: $('[data-file-name]'),
    scale: $('[data-scale-input]'), center: $('[data-center-design]'), remove: $('[data-remove-design]'),
    form: $('[data-customizer-form]'), attachmentSlot: $('[data-attachment-slot]'), success: $('[data-success-message]'),
    finalPreview: $('[data-final-preview]'), whatsapp: $('[data-whatsapp-link]')
  };

  if (!els.preview || !els.printArea || !els.scale) return;

  if (els.shirt) {
    els.shirt.hidden = true;
    els.shirt.removeAttribute('src');
    els.shirt.alt = '';
  }

  const normalizeColor = value => ({ white: 'balts', black: 'melns', blue: 'zils' }[value] || value || 'balts');
  const normalizeSide = value => ({ front: 'prieksa', back: 'aizmugure' }[value] || value || 'prieksa');
  const colorById = id => product.krasas.find(color => color.id === normalizeColor(id)) || product.krasas[0];
  const sideLabel = side => product.puses[normalizeSide(side)] || normalizeSide(side);
  const createSideState = () => ({ file: null, url: '', image: null, naturalWidth: 0, naturalHeight: 0, positionX: .5, positionY: .5, scale: .5, preset: 'center', vectorFallback: false });

  const state = {
    step: 1, color: 'balts', size: '', side: 'prieksa', svgLoaded: false, svgRoot: null, submitting: false,
    sides: { prieksa: createSideState(), aizmugure: createSideState() }
  };

  const error = (name, message = '') => { const node = $(`[data-error="${name}"]`); if (node) node.textContent = message; };
  const currentSide = () => state.sides[state.side];
  const physicalArea = () => state.size ? product.drukasLaukumsMm?.[state.side]?.[state.size] : null;

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
      button.className = 'color-swatch'; button.type = 'button'; button.dataset.color = color.id;
      button.setAttribute('aria-pressed', 'false');
      button.innerHTML = `<span class="swatch" aria-hidden="true" style="background:${color.hex}"></span>${color.nosaukums}`;
      group.appendChild(button);
    });
    els.colorButtons = $$('[data-color]');
  }

  function ensureSideButtons() { els.sideButtons.forEach(button => { button.dataset.side = normalizeSide(button.dataset.side); }); }

  function ensureExtraUi() {
    const scaleControl = els.scale.closest('.scale-control') || els.scale.parentElement;
    if (scaleControl && !$('[data-print-size]')) {
      const info = document.createElement('div');
      info.className = 'print-size-info';
      info.innerHTML = '<p data-print-size>Drukas izmērs: —</p><p class="customizer-error print-limit-warning" data-print-limit-warning aria-live="polite"></p><p class="customizer-error dpi-warning" data-dpi-warning aria-live="polite"></p>';
      scaleControl.insertAdjacentElement('afterend', info);
    }
    if (scaleControl && !$('[data-position-presets]')) {
      const presets = document.createElement('div');
      presets.className = 'position-presets'; presets.dataset.positionPresets = '';
      presets.setAttribute('aria-label', 'Ātrā dizaina novietošana');
      presets.innerHTML = [['center','Centrā'],['left-chest','Krūšu kreisajā pusē'],['top','Augšā'],['lower','Zemāk']]
        .map(([id,label]) => `<button type="button" data-position-preset="${id}" aria-pressed="false">${label}</button>`).join('');
      scaleControl.insertAdjacentElement('beforebegin', presets);
    }
    if (els.previewCard && !$('[data-mobile-drag-hint]')) {
      const hint = document.createElement('p');
      hint.className = 'customizer-preview-hint customizer-mobile-drag-hint'; hint.dataset.mobileDragHint = '';
      hint.textContent = 'Velc dizainu ar pirkstu, lai to pārvietotu'; hint.hidden = true; els.previewCard.appendChild(hint);
    }
    if (els.form && !$('#debugMockup')) {
      const button = document.createElement('button');
      button.type = 'button';
      button.id = 'debugMockup';
      button.className = 'button button-ghost';
      button.textContent = 'Debug mockup';
      els.form.insertAdjacentElement('beforebegin', button);
    }
  }

  ensureColorButtons(); ensureSideButtons(); ensureExtraUi();
  els.printSize = $('[data-print-size]'); els.printLimitWarning = $('[data-print-limit-warning]'); els.dpiWarning = $('[data-dpi-warning]');
  els.presetButtons = $$('[data-position-preset]'); els.mobileDragHint = $('[data-mobile-drag-hint]'); els.debugMockup = $('#debugMockup');

  function ensureDesignCanvas() {
    let canvas = $('[data-design-canvas]', els.printArea);
    if (canvas) return canvas;
    canvas = document.createElement('canvas'); canvas.className = 'customizer-design-canvas'; canvas.dataset.designCanvas = '';
    canvas.setAttribute('aria-label', 'Augšupielādētā dizaina priekšskatījums');
    Object.assign(canvas.style, { position:'absolute', inset:'0', width:'100%', height:'100%', display:'block', touchAction:'none', cursor:'grab' });
    if (els.legacyDesign) els.legacyDesign.hidden = true;
    els.printArea.appendChild(canvas); return canvas;
  }
  els.designCanvas = ensureDesignCanvas();

  function setPressed(buttons, activeButton) { buttons.forEach(button => { const active = button === activeButton; button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', String(active)); }); }
  function updatePrintArea() { const zone = product.drukasZona[state.side]; if (!zone) return; Object.assign(els.printArea.style, { left:`${zone.x*100}%`, top:`${zone.y*100}%`, width:`${zone.w*100}%`, height:`${zone.h*100}%` }); }
  function updatePlaceholder() { if (els.placeholder) els.placeholder.hidden = state.svgLoaded; }

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
    const front = state.svgRoot.querySelector('#shirt-front'); const back = state.svgRoot.querySelector('#shirt-back');
    if (front) front.style.display = state.side === 'prieksa' ? 'block' : 'none';
    if (back) back.style.display = state.side === 'aizmugure' ? 'block' : 'none';
  }

  async function loadShirtSvg() {
    try {
      const response = await fetch(product.svg, { cache:'no-cache' });
      if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
      const markup = await response.text();
      let host = $('[data-shirt-svg-host]');
      if (!host) {
        host = document.createElement('div'); host.className = 'customizer-shirt-svg'; host.dataset.shirtSvgHost = '';
        Object.assign(host.style, { position:'absolute', inset:'0', width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none' });
        els.preview.insertBefore(host, els.printArea);
      }
      host.innerHTML = markup;
      const svg = $('svg', host); if (!svg) throw new Error('assets/krekls.svg nesatur <svg> elementu.');
      svg.setAttribute('width','100%'); svg.setAttribute('height','100%'); svg.setAttribute('preserveAspectRatio','xMidYMid meet');
      Object.assign(svg.style,{width:'100%',height:'100%',display:'block'});
      state.svgRoot = svg; state.svgLoaded = true;
      updateSvgColor(); updateSvgSide(); updatePlaceholder(); updatePrintArea(); requestAnimationFrame(renderDesign);
    } catch (svgError) {
      state.svgLoaded = false; state.svgRoot = null; updatePlaceholder();
      console.error('PrintStich konfigurators: krekla SVG neizdevās ielādēt no assets/krekls.svg.', svgError);
    }
  }

  function getDesignRect(zoneWidth, zoneHeight, side = currentSide()) {
    if (!side.naturalWidth || !side.naturalHeight) return null;
    const aspect = side.naturalWidth / side.naturalHeight;
    let width = zoneWidth * side.scale;
    let height = width / aspect;
    if (height > zoneHeight * side.scale) { height = zoneHeight * side.scale; width = height * aspect; }
    return { width, height, x: side.positionX * zoneWidth - width / 2, y: side.positionY * zoneHeight - height / 2 };
  }

  function designDimensions(side=currentSide()) { const area=els.printArea.getBoundingClientRect(); if(!area.width||!area.height)return null; const rect=getDesignRect(area.width,area.height,side); if(!rect)return null; return {area,width:rect.width,height:rect.height}; }
  function printMetrics(side=currentSide()) { const d=designDimensions(side),mmArea=physicalArea(); if(!d||!mmArea)return null; const widthMm=d.width/d.area.width*mmArea.w,heightMm=d.height/d.area.height*mmArea.h,dpi=widthMm>0&&side.naturalWidth?side.naturalWidth/widthMm*25.4:0; return {widthMm,heightMm,dpi,widthRounded:Math.round(widthMm),heightRounded:Math.round(heightMm),dpiRounded:Math.round(dpi)}; }
  function maxAllowedScale(side=currentSide()) { const mmArea=physicalArea(); if(!mmArea||!side.naturalWidth||!side.naturalHeight)return 1; const area=els.printArea.getBoundingClientRect(); if(!area.width||!area.height)return 1; const aspect=side.naturalWidth/side.naturalHeight,max=product.maxDrukaMm; for(let candidate=1;candidate>=.05;candidate-=.005){let width=area.width*candidate,height=width/aspect;if(height>area.height*candidate){height=area.height*candidate;width=height*aspect;}if(width/area.width*mmArea.w<=max.w&&height/area.height*mmArea.h<=max.h)return candidate;}return .05; }
  function enforcePrintLimit(showMessage=false){const side=currentSide();if(!side.url||!state.size||side.vectorFallback)return false;const allowed=maxAllowedScale(side);if(side.scale<=allowed+.0001)return false;side.scale=allowed;if(showMessage&&els.printLimitWarning)els.printLimitWarning.textContent=`Šis izmērs pārsniedz maksimālo drukas laukumu (${product.maxDrukaMm.w} × ${product.maxDrukaMm.h} mm). Dizains automātiski samazināts.`;return true;}
  function updateMeasurementUi(){const metrics=printMetrics();if(!metrics){if(els.printSize)els.printSize.textContent='Drukas izmērs: —';if(els.dpiWarning)els.dpiWarning.textContent='';return;}if(els.printSize)els.printSize.textContent=`Drukas izmērs: ${metrics.widthRounded} × ${metrics.heightRounded} mm`;if(els.dpiWarning)els.dpiWarning.textContent=metrics.dpi&&metrics.dpi<150?`Faila izšķirtspēja šim izmēram ir zema (aptuveni ${metrics.dpiRounded} DPI). Druka var izskatīties izplūdusi. Ieteicams vismaz 150 DPI.`:'';}
  function constrainPosition(side=currentSide()){const d=designDimensions(side);if(!d)return;const halfX=d.width/(2*d.area.width),halfY=d.height/(2*d.area.height);side.positionX=clamp(side.positionX,halfX,1-halfX);side.positionY=clamp(side.positionY,halfY,1-halfY);}
  function updatePresetState(){els.presetButtons.forEach(button=>{const active=currentSide().preset===button.dataset.positionPreset;button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active));});}

  function drawVectorFallback(ctx, width, height) {
    ctx.save(); ctx.strokeStyle = '#8d9692'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 5]); ctx.strokeRect(1, 1, width - 2, height - 2);
    ctx.setLineDash([]); ctx.fillStyle = '#53615d'; ctx.font = '600 14px Manrope, Arial, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('vektora fails pielikumā', width / 2, height / 2); ctx.restore();
  }

  function drawDesignCanvas(){const canvas=els.designCanvas,side=currentSide(),rect=els.printArea.getBoundingClientRect();if(!canvas||!rect.width||!rect.height)return;const dpr=Math.min(window.devicePixelRatio||1,2),pixelWidth=Math.max(1,Math.round(rect.width*dpr)),pixelHeight=Math.max(1,Math.round(rect.height*dpr));if(canvas.width!==pixelWidth)canvas.width=pixelWidth;if(canvas.height!==pixelHeight)canvas.height=pixelHeight;const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,rect.width,rect.height);if(side.vectorFallback){drawVectorFallback(ctx,rect.width,rect.height);return;}if(!side.image)return;const designRect=getDesignRect(rect.width,rect.height,side);if(!designRect)return;ctx.drawImage(side.image,designRect.x,designRect.y,designRect.width,designRect.height);}
  function renderDesign(){updatePrintArea();const side=currentSide();if(!side.url){drawDesignCanvas();updateMeasurementUi();updatePresetState();return;}if(!side.vectorFallback)constrainPosition(side);els.scale.value=String(Math.round(side.scale*100));els.scale.max=String(Math.floor(maxAllowedScale(side)*100));drawDesignCanvas();updateMeasurementUi();updatePresetState();}
  function updatePreview(){updateSvgColor();updateSvgSide();updatePrintArea();requestAnimationFrame(renderDesign);}
  function stepComplete(step){if(step===1)return Boolean(state.size);if(step===2||step===3)return Boolean(currentSide().file);return true;}
  function updateNavigation(){if(els.prev)els.prev.disabled=state.step===1;if(els.next){els.next.hidden=state.step===4;els.next.style.display=state.step===4?'none':'';els.next.disabled=!stepComplete(state.step);}}
  function showStep(step){state.step=clamp(step,1,4);els.panels.forEach(panel=>{const active=Number(panel.dataset.stepPanel)===state.step;panel.hidden=!active;panel.classList.toggle('is-active',active);});els.indicators.forEach(indicator=>{const active=Number(indicator.dataset.stepIndicator)===state.step;indicator.classList.toggle('is-active',active);if(active)indicator.setAttribute('aria-current','step');else indicator.removeAttribute('aria-current');});els.printArea.style.borderColor=state.step===4?'transparent':'';updateNavigation();if(state.step===4)updateSummary();}

  function bindColorButtons(){els.colorButtons.forEach(button=>button.addEventListener('click',()=>{state.color=normalizeColor(button.dataset.color);setPressed(els.colorButtons,button);updatePreview();}));} bindColorButtons();
  els.sizeButtons.forEach(button=>button.addEventListener('click',()=>{state.size=button.dataset.size;error('size');setPressed(els.sizeButtons,button);enforcePrintLimit(true);renderDesign();updateNavigation();}));
  els.sideButtons.forEach(button=>button.addEventListener('click',()=>{state.side=normalizeSide(button.dataset.side);setPressed(els.sideButtons,button);error('file');updatePreview();requestAnimationFrame(()=>{enforcePrintLimit(true);renderDesign();});updateNavigation();}));

  function validateFile(file){const allowed=['image/png','image/jpeg','image/webp','image/svg+xml','application/pdf'];if(!file)return'Izvēlies dizaina failu.';if(!allowed.includes(file.type))return'Atļauts PNG, JPG/JPEG, WebP, SVG vai PDF fails.';if(file.size>MAX_CLIENT_FILE_SIZE)return'Fails ir par lielu. Maksimālais klienta faila izmērs ir 8 MB.';return'';}
  function scrollToPreviewAfterUpload(){const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;requestAnimationFrame(()=>els.preview.scrollIntoView({behavior:reducedMotion?'auto':'smooth',block:'start'}));}
  function finishFileLoad(side,file){if(els.fileName)els.fileName.textContent=`${sideLabel(state.side)}: ${file.name}`;enforcePrintLimit();showStep(3);renderDesign();updateNavigation();scrollToPreviewAfterUpload();}
  function loadFile(file){const message=validateFile(file);if(message){error('file',message);return;}error('file');const side=currentSide();if(side.url)URL.revokeObjectURL(side.url);side.file=file;side.url=URL.createObjectURL(file);side.image=null;side.vectorFallback=false;side.naturalWidth=0;side.naturalHeight=0;side.positionX=.5;side.positionY=.5;side.scale=.5;side.preset='center';const image=new Image();image.onload=()=>{side.image=image;side.naturalWidth=image.naturalWidth;side.naturalHeight=image.naturalHeight;finishFileLoad(side,file);};image.onerror=()=>{if(file.type==='application/pdf'||file.type==='image/svg+xml'){side.vectorFallback=true;side.naturalWidth=1;side.naturalHeight=1;finishFileLoad(side,file);return;}side.file=null;side.image=null;URL.revokeObjectURL(side.url);side.url='';error('file','Attēlu neizdevās nolasīt. Izvēlies citu failu.');renderDesign();updateNavigation();};image.src=side.url;}
  if(els.designInput)els.designInput.addEventListener('change',()=>loadFile(els.designInput.files?.[0]));
  if(els.uploadZone){['dragenter','dragover'].forEach(name=>els.uploadZone.addEventListener(name,event=>{event.preventDefault();els.uploadZone.classList.add('is-dragging');}));['dragleave','drop'].forEach(name=>els.uploadZone.addEventListener(name,event=>{event.preventDefault();els.uploadZone.classList.remove('is-dragging');}));els.uploadZone.addEventListener('drop',event=>loadFile(event.dataTransfer?.files?.[0]));}
  els.scale.addEventListener('input',()=>{const side=currentSide();side.scale=Number(els.scale.value)/100;side.preset='';const exceeded=enforcePrintLimit();if(els.printLimitWarning)els.printLimitWarning.textContent=exceeded?`Šis izmērs pārsniedz maksimālo drukas laukumu (${product.maxDrukaMm.w} × ${product.maxDrukaMm.h} mm). Samazini dizainu.`:'';renderDesign();});

  function applyPreset(preset){const side=currentSide();if(!side.url)return;side.preset=preset;if(preset==='center'){side.positionX=.5;side.positionY=.5;}if(preset==='top'){side.positionX=.5;side.positionY=.27;}if(preset==='lower'){side.positionX=.5;side.positionY=.73;}if(preset==='left-chest'){const mmArea=physicalArea();side.scale=mmArea?clamp(90/mmArea.w,.05,1):.32;side.positionX=.28;side.positionY=.28;}enforcePrintLimit();constrainPosition(side);renderDesign();}
  if(els.center)els.center.addEventListener('click',()=>applyPreset('center'));els.presetButtons.forEach(button=>button.addEventListener('click',()=>applyPreset(button.dataset.positionPreset)));
  if(els.remove)els.remove.addEventListener('click',()=>{const side=currentSide();if(side.url)URL.revokeObjectURL(side.url);Object.assign(side,createSideState());if(els.designInput)els.designInput.value='';if(els.fileName)els.fileName.textContent='';error('file');updateMeasurementUi();renderDesign();updateNavigation();if(state.step===3)showStep(2);});

  let drag=null;
  els.designCanvas.addEventListener('pointerdown',event=>{if(!currentSide().url||state.step!==3||currentSide().vectorFallback)return;event.preventDefault();els.designCanvas.setPointerCapture(event.pointerId);els.designCanvas.style.cursor='grabbing';drag={pointerId:event.pointerId};currentSide().preset='';updatePresetState();});
  els.designCanvas.addEventListener('pointermove',event=>{if(!drag||drag.pointerId!==event.pointerId)return;const area=els.printArea.getBoundingClientRect(),side=currentSide();side.positionX=(event.clientX-area.left)/area.width;side.positionY=(event.clientY-area.top)/area.height;constrainPosition(side);renderDesign();});
  const endDrag=event=>{if(drag?.pointerId===event.pointerId){drag=null;els.designCanvas.style.cursor='grab';}};els.designCanvas.addEventListener('pointerup',endDrag);els.designCanvas.addEventListener('pointercancel',endDrag);
  if(els.prev)els.prev.addEventListener('click',()=>showStep(state.step-1));if(els.next)els.next.addEventListener('click',()=>{if(!stepComplete(state.step)){if(state.step===1)error('size','Izvēlies krekla izmēru.');if(state.step===2)error('file','Pievieno savu dizainu.');return;}showStep(state.step+1);});

  function inlineComputedSvgStyles(sourceSvg, cloneSvg) {
    const sourceNodes = [sourceSvg, ...sourceSvg.querySelectorAll('*')];
    const cloneNodes = [cloneSvg, ...cloneSvg.querySelectorAll('*')];
    sourceNodes.forEach((sourceNode, index) => {
      const cloneNode = cloneNodes[index];
      if (!cloneNode) return;
      const computed = getComputedStyle(sourceNode);
      ['fill','stroke','stroke-width','opacity'].forEach(property => {
        const value = computed.getPropertyValue(property);
        if (value) cloneNode.setAttribute(property, value.trim());
      });
    });
  }

  function prepareSerializedSvg() {
    if (!state.svgRoot) throw new Error('Krekla SVG nav ielādēts.');
    updateSvgColor(); updateSvgSide();
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
    if (!existingViewBox) clone.setAttribute('viewBox', `0 0 ${width} ${height}`);
    else clone.setAttribute('viewBox', existingViewBox);
    inlineComputedSvgStyles(state.svgRoot, clone);

    const viewBoxParts = clone.getAttribute('viewBox').trim().split(/[ ,]+/).map(Number);
    const viewBox = viewBoxParts.length === 4 && viewBoxParts.every(Number.isFinite)
      ? { x: viewBoxParts[0], y: viewBoxParts[1], width: viewBoxParts[2], height: viewBoxParts[3] }
      : { x: 0, y: 0, width, height };

    return { svgString: new XMLSerializer().serializeToString(clone), viewBox };
  }

  async function svgToImage() {
    const { svgString, viewBox } = prepareSerializedSvg();
    const image = new Image();
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
    await image.decode();
    if (!image.naturalWidth || !image.naturalHeight) throw new Error('Serializētais SVG ielādējās ar 0×0 izmēru.');
    return { image, viewBox };
  }

  function drawMockupContent(ctx,canvas,side,shirtImage){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(shirtImage,0,0,canvas.width,canvas.height);
    const zone=product.drukasZona[state.side]; if(!zone)return;
    const zoneX=zone.x*canvas.width,zoneY=zone.y*canvas.height,zoneW=zone.w*canvas.width,zoneH=zone.h*canvas.height;
    if(side.vectorFallback||!side.image){ctx.save();ctx.translate(zoneX,zoneY);drawVectorFallback(ctx,zoneW,zoneH);ctx.restore();return;}
    const designRect=getDesignRect(zoneW,zoneH,side);if(!designRect)return;
    ctx.drawImage(side.image,zoneX+designRect.x,zoneY+designRect.y,designRect.width,designRect.height);
  }

  async function drawFinalPreview(){const canvas=els.finalPreview;if(!canvas)return;const ctx=canvas.getContext('2d'),side=currentSide();try{const {image,viewBox}=await svgToImage();canvas.width=900;canvas.height=Math.round(900*(viewBox.height/viewBox.width));drawMockupContent(ctx,canvas,side,image);canvas.toDataURL('image/png');}catch(previewError){console.error('PrintStich konfigurators: priekšskatījumu neizdevās izveidot no SVG.',previewError);ctx.fillStyle='#f7f7f5';ctx.fillRect(0,0,canvas.width||900,canvas.height||1050);}}

  function positionLabel(side=currentSide()){const labels={center:'Centrā','left-chest':'Krūšu kreisajā pusē',top:'Augšā',lower:'Zemāk'};return labels[side.preset]||`X ${Math.round(side.positionX*100)}%, Y ${Math.round(side.positionY*100)}%`;}
  function syncFormData(){const side=currentSide(),metrics=printMetrics(),color=colorById(state.color);const set=(selector,value)=>{const input=$(selector);if(input)input.value=value;};set('[data-form-color]',color.nosaukums);set('[data-form-size]',state.size);set('[data-form-side]',sideLabel(state.side));set('[data-form-design-position]',positionLabel(side));set('[data-form-print-mm]',metrics?`${metrics.widthRounded} × ${metrics.heightRounded} mm`:'Nav aprēķināms');set('[data-form-position-x]',`${Math.round(side.positionX*100)}%`);set('[data-form-position-y]',`${Math.round(side.positionY*100)}%`);set('[data-form-original-filename]',side.file?.name||'');set('[data-form-resolution]',side.vectorFallback?'Vektora/PDF fails':metrics?`${side.naturalWidth} × ${side.naturalHeight} px, ${metrics.dpiRounded} DPI`:'' );set('[data-form-scale]',`${Math.round(side.scale*100)}%`);}

  function syncOriginalAttachment(){const side=currentSide();if(!side.file||!els.designInput||!els.attachmentSlot)return false;if(typeof DataTransfer==='undefined'){error('form','Šis pārlūks nevar sagatavot pielikumus. Lūdzu, izmanto jaunāko Chrome, Safari vai Firefox.');return false;}const transfer=new DataTransfer();transfer.items.add(side.file);els.designInput.files=transfer.files;els.attachmentSlot.appendChild(els.designInput);return true;}
  function canvasToBlob(canvas){return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('PNG mockapu neizdevās izveidot.')),'image/png'));}

  function validateMockupBlob(blob, cause = null) {
    if (blob && blob.size >= MIN_VALID_MOCKUP_SIZE) return blob;
    const validationError = new Error('Neizdevās sagatavot attēlu, mēģini vēlreiz');
    console.error('PrintStich konfigurators: mockapa validācija neizdevās.', cause || new Error(`PNG izmērs: ${blob?.size || 0} baiti`));
    throw validationError;
  }

  async function createMockupBlob(){
    const side=currentSide();
    let svgData;
    try { svgData=await svgToImage(); }
    catch (cause) { console.error('PrintStich konfigurators: SVG renderēšana mockapam neizdevās.', cause); throw new Error('Neizdevās sagatavot attēlu, mēģini vēlreiz'); }
    let width=1000;
    while(width>=600){
      const canvas=document.createElement('canvas');
      canvas.width=width;canvas.height=Math.round(width*(svgData.viewBox.height/svgData.viewBox.width));
      drawMockupContent(canvas.getContext('2d'),canvas,side,svgData.image);
      const blob=validateMockupBlob(await canvasToBlob(canvas));
      if(blob.size<=MAX_MOCKUP_FILE_SIZE||width===600)return blob;
      width=Math.max(600,Math.round(width*.85));
    }
    throw new Error('Mockapa PNG pārsniedz 1 MB.');
  }

  async function attachMockupFile(){if(!els.mockupInput)throw new Error('Mockup file input nav atrasts.');if(typeof DataTransfer==='undefined')throw new Error('DataTransfer nav pieejams.');const blob=validateMockupBlob(await createMockupBlob());if(blob.size>MAX_MOCKUP_FILE_SIZE)throw new Error('Mockapa PNG pārsniedz 1 MB.');const color=colorById(state.color),file=new File([blob],`mockup-${color.id}-${state.side}.png`,{type:'image/png'}),transfer=new DataTransfer();transfer.items.add(file);els.mockupInput.files=transfer.files;return file;}

  if (els.debugMockup) els.debugMockup.addEventListener('click', async () => {
    error('form');
    try {
      const blob = validateMockupBlob(await createMockupBlob());
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (debugError) {
      console.error('PrintStich konfigurators: debug mockupu neizdevās izveidot.', debugError);
      error('form', 'Neizdevās sagatavot attēlu, mēģini vēlreiz');
    }
  });

  function updateWhatsApp(){if(!els.whatsapp)return;const side=currentSide(),metrics=printMetrics(),color=colorById(state.color),text=['Sveiki! Vēlos PrintStich piedāvājumu savam krekla dizainam.',`Krekls: ${color.nosaukums}`,`Izmērs: ${state.size}`,`Apdruka: ${sideLabel(state.side)}`,metrics?`Drukas izmērs: ${metrics.widthRounded} × ${metrics.heightRounded} mm`:'',`Pozīcija: x ${Math.round(side.positionX*100)}%, y ${Math.round(side.positionY*100)}%`,metrics?`Fails: ${side.naturalWidth} × ${side.naturalHeight} px, ~${metrics.dpiRounded} DPI`:''].filter(Boolean).join('\n');els.whatsapp.href=`https://wa.me/37127333112?text=${encodeURIComponent(text)}`;}
  function updateSummary(){const color=colorById(state.color),summaryColor=$('[data-summary-color]'),summarySize=$('[data-summary-size]'),summarySide=$('[data-summary-side]');if(summaryColor)summaryColor.textContent=color.nosaukums;if(summarySize)summarySize.textContent=state.size||'—';if(summarySide)summarySide.textContent=sideLabel(state.side);syncFormData();updateWhatsApp();drawFinalPreview();}

  if(els.form)els.form.addEventListener('submit',async event=>{
    if(state.submitting)return;
    event.preventDefault();error('form');
    const side=currentSide(),name=$('[data-customer-name]')?.value.trim()||'',contact=$('[data-customer-contact]')?.value.trim()||'';
    if(!state.size){error('form','Izvēlies krekla izmēru.');return;}
    if(!side.file){error('form','Pievieno dizaina failu.');return;}
    if(side.file.size>MAX_CLIENT_FILE_SIZE){error('form','Fails ir par lielu. Maksimālais klienta faila izmērs ir 8 MB.');return;}
    if(!name){error('form','Ievadi savu vārdu.');return;}
    if(!contact){error('form','Ievadi telefonu vai e-pastu.');return;}
    syncFormData();
    if(!syncOriginalAttachment())return;
    const submitButton=$('.customizer-submit',els.form);if(submitButton){submitButton.disabled=true;submitButton.textContent='Sagatavo nosūtīšanai...';}
    try{
      const mockupFile=await attachMockupFile();
      if(mockupFile.size<MIN_VALID_MOCKUP_SIZE)throw new Error('Neizdevās sagatavot attēlu, mēģini vēlreiz');
      if(side.file.size+mockupFile.size>10*MB)throw new Error('Pielikumu kopējais izmērs pārsniedz FormSubmit 10 MB limitu.');
      state.submitting=true;
      els.form.submit();
    }catch(submitError){console.error('PrintStich konfigurators: submit sagatavošana neizdevās.',submitError);error('form',submitError.message==='Neizdevās sagatavot attēlu, mēģini vēlreiz'?submitError.message:(submitError.message||'Neizdevās sagatavot mockapu nosūtīšanai. Mēģini vēlreiz.'));if(submitButton){submitButton.disabled=false;submitButton.textContent='Nosūtīt savu dizainu';}}
  });

  function showThankYouIfNeeded(){if(window.location.hash!=='#paldies')return;els.panels.forEach(panel=>{panel.hidden=true;});if(els.navigation)els.navigation.hidden=true;if(els.success)els.success.hidden=false;els.printArea.style.borderColor='transparent';}
  function updateMobileLayout(){const mobile=window.matchMedia('(max-width: 767px)').matches;if(els.mobileDragHint)els.mobileDragHint.hidden=!mobile;if(mobile){els.preview.style.height='45vh';els.preview.style.maxHeight='45vh';}else{els.preview.style.height='';els.preview.style.maxHeight='';}requestAnimationFrame(renderDesign);}

  window.addEventListener('resize',updateMobileLayout);updateMobileLayout();updatePreview();showStep(1);showThankYouIfNeeded();loadShirtSvg();
})();