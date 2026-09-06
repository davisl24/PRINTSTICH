(() => {
  'use strict';

  const product = window.PRINTSTICH_PRODUCTS?.tshirt;
  if (!product) return;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const els = {
    panels: $$('[data-step-panel]'), indicators: $$('[data-step-indicator]'), prev: $('[data-prev-step]'), next: $('[data-next-step]'), navigation: $('[data-step-navigation]'), preview: $('[data-preview]'), shirt: $('[data-shirt-image]'), placeholder: $('[data-mockup-placeholder]'), printArea: $('[data-print-area]'), design: $('[data-design-image]'), colorButtons: $$('[data-color]'), sizeButtons: $$('[data-size]'), sideButtons: $$('[data-side]'), uploadZone: $('[data-upload-zone]'), designInput: $('[data-design-input]'), fileName: $('[data-file-name]'), scale: $('[data-scale-input]'), center: $('[data-center-design]'), remove: $('[data-remove-design]'), form: $('[data-customizer-form]'), attachmentSlot: $('[data-attachment-slot]'), success: $('[data-success-message]'), finalPreview: $('[data-final-preview]'), whatsapp: $('[data-whatsapp-link]')
  };
  if (!els.preview || !els.printArea || !els.design) return;

  const createSideState = () => ({ file: null, url: '', naturalWidth: 0, naturalHeight: 0, positionX: .5, positionY: .5, scale: .5, preset: 'center' });
  const state = { step: 1, color: 'white', size: '', side: 'front', sides: { front: createSideState(), back: createSideState() } };
  const error = (name, message = '') => { const node = $(`[data-error="${name}"]`); if (node) node.textContent = message; };
  const colorLabel = () => product.krasas[state.color]?.label || state.color;
  const sideLabel = () => product.puses[state.side] || state.side;
  const currentSide = () => state.sides[state.side];
  const physicalArea = () => state.size ? product.drukasLaukumsMm?.[state.side]?.[state.size] : null;

  function ensureExtraUi() {
    const scaleControl = els.scale?.closest('.scale-control') || els.scale?.parentElement;
    if (scaleControl && !$('[data-print-size]')) {
      const info = document.createElement('div'); info.className = 'print-size-info';
      info.innerHTML = '<p data-print-size>Drukas izmērs: —</p><p class="customizer-error print-limit-warning" data-print-limit-warning aria-live="polite"></p><p class="customizer-error dpi-warning" data-dpi-warning aria-live="polite"></p>';
      scaleControl.insertAdjacentElement('afterend', info);
    }
    if (scaleControl && !$('[data-position-presets]')) {
      const presets = document.createElement('div'); presets.className = 'position-presets'; presets.dataset.positionPresets = ''; presets.setAttribute('aria-label', 'Ātrā dizaina novietošana');
      presets.innerHTML = [['center','Centrā'],['left-chest','Krūšu kreisajā pusē'],['top','Augšā'],['lower','Zemāk']].map(([id,label]) => `<button type="button" data-position-preset="${id}" aria-pressed="false">${label}</button>`).join('');
      scaleControl.insertAdjacentElement('beforebegin', presets);
    }
    if (els.form) [['drukas_izmers_mm','data-form-print-mm'],['dizaina_pozicija','data-form-design-position'],['faila_izsirtspeja','data-form-resolution']].forEach(([name,attr]) => {
      if ($(`[${attr}]`, els.form)) return; const input = document.createElement('input'); input.type = 'hidden'; input.name = name; input.setAttribute(attr, ''); els.form.appendChild(input);
    });
  }
  ensureExtraUi();
  els.printSize = $('[data-print-size]'); els.printLimitWarning = $('[data-print-limit-warning]'); els.dpiWarning = $('[data-dpi-warning]'); els.presetButtons = $$('[data-position-preset]');

  function setPressed(buttons, activeButton) { buttons.forEach(button => { const active = button === activeButton; button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', String(active)); }); }
  function updatePrintArea() { const zone = product.drukasZona[state.side]; if (!zone) return; Object.assign(els.printArea.style, { left:`${zone.x*100}%`, top:`${zone.y*100}%`, width:`${zone.w*100}%`, height:`${zone.h*100}%` }); }
  function updateMockup() { const source = product.krasas[state.color]?.mockups?.[state.side]; if (!source) return; els.placeholder.hidden = true; els.shirt.hidden = false; els.shirt.src = source; els.shirt.alt = `${colorLabel()} T-krekla ${sideLabel().toLowerCase()}s priekšskatījums`; }
  els.shirt.addEventListener('load', () => { els.shirt.hidden = false; els.placeholder.hidden = true; });
  els.shirt.addEventListener('error', () => { els.shirt.hidden = true; els.placeholder.hidden = false; });

  function designDimensions(side = currentSide()) {
    const area = els.printArea.getBoundingClientRect(); if (!area.width || !area.height || !side.naturalWidth || !side.naturalHeight) return null;
    const aspect = side.naturalWidth / side.naturalHeight; const maxWidth = area.width * side.scale; const maxHeight = area.height * side.scale; let width = maxWidth; let height = width / aspect;
    if (height > maxHeight) { height = maxHeight; width = height * aspect; } return { area, width, height };
  }
  function printMetrics(side = currentSide()) {
    const d = designDimensions(side); const mmArea = physicalArea(); if (!d || !mmArea) return null;
    const widthMm = d.width / d.area.width * mmArea.w; const heightMm = d.height / d.area.height * mmArea.h; const dpi = widthMm > 0 ? side.naturalWidth / widthMm * 25.4 : 0;
    return { widthMm, heightMm, dpi, widthRounded:Math.round(widthMm), heightRounded:Math.round(heightMm), dpiRounded:Math.round(dpi) };
  }
  function maxAllowedScale(side = currentSide()) {
    const mmArea = physicalArea(); if (!mmArea || !side.naturalWidth || !side.naturalHeight) return 1;
    const area = els.printArea.getBoundingClientRect(); if (!area.width || !area.height) return 1; const aspect = side.naturalWidth / side.naturalHeight; const max = product.maxDrukaMm;
    for (let candidate = 1; candidate >= .05; candidate -= .005) { let w = area.width*candidate; let h = w/aspect; if (h > area.height*candidate) { h=area.height*candidate; w=h*aspect; } if (w/area.width*mmArea.w <= max.w && h/area.height*mmArea.h <= max.h) return candidate; } return .05;
  }
  function enforcePrintLimit(showMessage=false) { const side=currentSide(); if (!side.url || !state.size) return false; const allowed=maxAllowedScale(side); if (side.scale<=allowed+.0001) return false; side.scale=allowed; if(showMessage&&els.printLimitWarning) els.printLimitWarning.textContent=`Šis izmērs pārsniedz maksimālo drukas laukumu (${product.maxDrukaMm.w} × ${product.maxDrukaMm.h} mm). Dizains automātiski samazināts.`; return true; }
  function updateMeasurementUi() { const m=printMetrics(); if(!m){ if(els.printSize) els.printSize.textContent='Drukas izmērs: —'; if(els.dpiWarning) els.dpiWarning.textContent=''; return; } if(els.printSize) els.printSize.textContent=`Drukas izmērs: ${m.widthRounded} × ${m.heightRounded} mm`; if(els.dpiWarning) els.dpiWarning.textContent=m.dpi<150?`Faila izšķirtspēja šim izmēram ir zema (aptuveni ${m.dpiRounded} DPI). Druka var izskatīties izplūdusi. Ieteicams vismaz 150 DPI.`:''; }
  function constrainPosition(side=currentSide()){ const d=designDimensions(side); if(!d)return; const hx=d.width/(2*d.area.width), hy=d.height/(2*d.area.height); side.positionX=clamp(side.positionX,hx,1-hx); side.positionY=clamp(side.positionY,hy,1-hy); }
  function updatePresetState(){ els.presetButtons.forEach(button=>{const active=currentSide().preset===button.dataset.positionPreset;button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active));}); }
  function renderDesign(){ const side=currentSide(); if(!side.url){els.design.hidden=true;updateMeasurementUi();updatePresetState();return;} constrainPosition(side);const d=designDimensions(side);if(!d)return;els.design.hidden=false;els.design.src=side.url;els.design.style.width=`${d.width}px`;els.design.style.height=`${d.height}px`;els.design.style.left=`${side.positionX*100}%`;els.design.style.top=`${side.positionY*100}%`;els.design.style.transform='translate(-50%, -50%)';els.scale.value=String(Math.round(side.scale*100));els.scale.max=String(Math.floor(maxAllowedScale(side)*100));updateMeasurementUi();updatePresetState(); }
  function updatePreview(){updateMockup();updatePrintArea();requestAnimationFrame(renderDesign);}
  function stepComplete(step){if(step===1)return Boolean(state.size);if(step===2||step===3)return Boolean(currentSide().file);return true;}
  function updateNavigation(){els.prev.disabled=state.step===1;els.next.hidden=state.step===4;els.next.disabled=!stepComplete(state.step);}
  function showStep(step){state.step=clamp(step,1,4);els.panels.forEach(panel=>{const active=Number(panel.dataset.stepPanel)===state.step;panel.hidden=!active;panel.classList.toggle('is-active',active);});els.indicators.forEach(indicator=>{const active=Number(indicator.dataset.stepIndicator)===state.step;indicator.classList.toggle('is-active',active);if(active)indicator.setAttribute('aria-current','step');else indicator.removeAttribute('aria-current');});els.printArea.style.borderColor=state.step===4?'transparent':'';updateNavigation();if(state.step===4)updateSummary();}

  els.colorButtons.forEach(button=>button.addEventListener('click',()=>{state.color=button.dataset.color;setPressed(els.colorButtons,button);updatePreview();}));
  els.sizeButtons.forEach(button=>button.addEventListener('click',()=>{state.size=button.dataset.size;error('size');setPressed(els.sizeButtons,button);enforcePrintLimit(true);renderDesign();updateNavigation();}));
  els.sideButtons.forEach(button=>button.addEventListener('click',()=>{state.side=button.dataset.side;setPressed(els.sideButtons,button);error('file');updatePreview();requestAnimationFrame(()=>{enforcePrintLimit(true);renderDesign();});updateNavigation();}));

  function validateFile(file){const allowed=['image/png','image/jpeg','image/webp'];if(!file)return'Izvēlies dizaina failu.';if(!allowed.includes(file.type))return'Atļauts PNG, JPG/JPEG vai WebP fails.';if(file.size>10*1024*1024)return'Fails ir par lielu. Maksimālais izmērs ir 10 MB.';return'';}
  function loadFile(file){const message=validateFile(file);if(message){error('file',message);return;}error('file');const side=currentSide();if(side.url)URL.revokeObjectURL(side.url);side.file=file;side.url=URL.createObjectURL(file);side.positionX=.5;side.positionY=.5;side.scale=.5;side.preset='center';const image=new Image();image.onload=()=>{side.naturalWidth=image.naturalWidth;side.naturalHeight=image.naturalHeight;els.fileName.textContent=`${sideLabel()}: ${file.name}`;enforcePrintLimit();renderDesign();updateNavigation();};image.onerror=()=>{side.file=null;URL.revokeObjectURL(side.url);side.url='';error('file','Attēlu neizdevās nolasīt. Izvēlies citu failu.');updateNavigation();};image.src=side.url;}
  els.designInput.addEventListener('change',()=>loadFile(els.designInput.files?.[0]));
  ['dragenter','dragover'].forEach(name=>els.uploadZone.addEventListener(name,event=>{event.preventDefault();els.uploadZone.classList.add('is-dragging');}));
  ['dragleave','drop'].forEach(name=>els.uploadZone.addEventListener(name,event=>{event.preventDefault();els.uploadZone.classList.remove('is-dragging');}));
  els.uploadZone.addEventListener('drop',event=>loadFile(event.dataTransfer?.files?.[0]));
  els.scale.addEventListener('input',()=>{const side=currentSide();side.scale=Number(els.scale.value)/100;side.preset='';const exceeded=enforcePrintLimit();if(els.printLimitWarning)els.printLimitWarning.textContent=exceeded?`Šis izmērs pārsniedz maksimālo drukas laukumu (${product.maxDrukaMm.w} × ${product.maxDrukaMm.h} mm). Samazini dizainu.`:'';renderDesign();});

  function applyPreset(preset){const side=currentSide();if(!side.url)return;side.preset=preset;if(preset==='center'){side.positionX=.5;side.positionY=.5;}if(preset==='top'){side.positionX=.5;side.positionY=.27;}if(preset==='lower'){side.positionX=.5;side.positionY=.73;}if(preset==='left-chest'){const mmArea=physicalArea();side.scale=mmArea?clamp(90/mmArea.w,.05,1):.32;side.positionX=.28;side.positionY=.28;}enforcePrintLimit();constrainPosition(side);renderDesign();}
  els.center.addEventListener('click',()=>applyPreset('center'));
  els.presetButtons.forEach(button=>button.addEventListener('click',()=>applyPreset(button.dataset.positionPreset)));
  els.remove.addEventListener('click',()=>{const side=currentSide();if(side.url)URL.revokeObjectURL(side.url);Object.assign(side,createSideState());els.designInput.value='';els.fileName.textContent='';els.design.hidden=true;error('file');updateMeasurementUi();updateNavigation();if(state.step===3)showStep(2);});

  let drag=null;els.design.addEventListener('pointerdown',event=>{if(!currentSide().url||state.step!==3)return;event.preventDefault();els.design.setPointerCapture(event.pointerId);drag={pointerId:event.pointerId};currentSide().preset='';updatePresetState();});els.design.addEventListener('pointermove',event=>{if(!drag||drag.pointerId!==event.pointerId)return;const area=els.printArea.getBoundingClientRect(),side=currentSide();side.positionX=(event.clientX-area.left)/area.width;side.positionY=(event.clientY-area.top)/area.height;constrainPosition(side);renderDesign();});const endDrag=event=>{if(drag?.pointerId===event.pointerId)drag=null;};els.design.addEventListener('pointerup',endDrag);els.design.addEventListener('pointercancel',endDrag);
  els.prev.addEventListener('click',()=>showStep(state.step-1));els.next.addEventListener('click',()=>{if(!stepComplete(state.step)){if(state.step===1)error('size','Izvēlies krekla izmēru.');if(state.step===2)error('file','Pievieno savu dizainu.');return;}showStep(state.step+1);});

  function loadImage(source){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=source;});}
  async function drawFinalPreview(){const canvas=els.finalPreview;if(!canvas)return;const ctx=canvas.getContext('2d'),mockupSource=product.krasas[state.color]?.mockups?.[state.side],side=currentSide();canvas.width=900;canvas.height=1050;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#efefec';ctx.fillRect(0,0,canvas.width,canvas.height);try{const shirt=await loadImage(mockupSource);ctx.drawImage(shirt,0,0,canvas.width,canvas.height);if(!side.url)return;const design=await loadImage(side.url),zone=product.drukasZona[state.side],zoneX=zone.x*canvas.width,zoneY=zone.y*canvas.height,zoneW=zone.w*canvas.width,zoneH=zone.h*canvas.height,aspect=design.naturalWidth/design.naturalHeight;let width=zoneW*side.scale,height=width/aspect;if(height>zoneH*side.scale){height=zoneH*side.scale;width=height*aspect;}ctx.drawImage(design,zoneX+side.positionX*zoneW-width/2,zoneY+side.positionY*zoneH-height/2,width,height);}catch{ctx.fillStyle='#5d6763';ctx.font='600 24px Manrope, sans-serif';ctx.textAlign='center';ctx.fillText('Priekšskatījumu neizdevās izveidot.',canvas.width/2,canvas.height/2);}}
  function syncFormData(){const side=currentSide(),m=printMetrics();$('[data-form-color]').value=colorLabel();$('[data-form-size]').value=state.size;$('[data-form-side]').value=sideLabel();$('[data-form-position-x]').value=side.positionX.toFixed(4);$('[data-form-position-y]').value=side.positionY.toFixed(4);$('[data-form-scale]').value=side.scale.toFixed(4);const mm=$('[data-form-print-mm]'),pos=$('[data-form-design-position]'),res=$('[data-form-resolution]');if(mm)mm.value=m?`${m.widthRounded} x ${m.heightRounded} mm`:'';if(pos)pos.value=`x: ${Math.round(side.positionX*100)}%, y: ${Math.round(side.positionY*100)}%`;if(res)res.value=m?`${side.naturalWidth} x ${side.naturalHeight} px, ${m.dpiRounded} DPI`:'';}
  function syncAttachment(){const side=currentSide();if(!side.file)return;const transfer=new DataTransfer();transfer.items.add(side.file);els.designInput.files=transfer.files;els.attachmentSlot.appendChild(els.designInput);}
  function updateWhatsApp(){const side=currentSide(),m=printMetrics();const text=['Sveiki! Vēlos PrintStich piedāvājumu savam krekla dizainam.',`Krekls: ${colorLabel()}`,`Izmērs: ${state.size}`,`Apdruka: ${sideLabel()}`,m?`Drukas izmērs: ${m.widthRounded} × ${m.heightRounded} mm`:'',`Pozīcija: x ${Math.round(side.positionX*100)}%, y ${Math.round(side.positionY*100)}%`,m?`Fails: ${side.naturalWidth} × ${side.naturalHeight} px, ~${m.dpiRounded} DPI`:''].filter(Boolean).join('\n');els.whatsapp.href=`https://wa.me/37127333112?text=${encodeURIComponent(text)}`;}
  function updateSummary(){$('[data-summary-color]').textContent=colorLabel();$('[data-summary-size]').textContent=state.size||'—';$('[data-summary-side]').textContent=sideLabel();syncFormData();updateWhatsApp();drawFinalPreview();}
  els.form.addEventListener('submit',event=>{error('form');const name=$('[data-customer-name]').value.trim(),contact=$('[data-customer-contact]').value.trim();if(!state.size){event.preventDefault();error('form','Izvēlies krekla izmēru.');return;}if(!currentSide().file){event.preventDefault();error('form','Pievieno dizaina failu.');return;}if(!name){event.preventDefault();error('form','Ievadi savu vārdu.');return;}if(!contact){event.preventDefault();error('form','Ievadi telefonu vai e-pastu.');return;}syncFormData();syncAttachment();});
  function showThankYouIfNeeded(){if(window.location.hash!=='#paldies')return;els.panels.forEach(panel=>{panel.hidden=true;});els.navigation.hidden=true;els.success.hidden=false;els.printArea.style.borderColor='transparent';}
  window.addEventListener('resize',()=>requestAnimationFrame(renderDesign));updatePreview();showStep(1);showThankYouIfNeeded();
})();
