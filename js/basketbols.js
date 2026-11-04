(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const productInfo = window.PRINTSTICH_PRODUCTS || {};
  const models = {
    tshirt: {
      id:'tshirt', name:'T-krekls', price:18,
      images:{front:'assets/collection/tshirt-front.webp',back:'assets/collection/tshirt-back.webp',sleeve:'assets/collection/tshirt-sleeve.webp'},
      sleeve:{width:359,height:756,x:137,y:210,font:67}
    },
    hoodie: {
      id:'hoodie', name:'Hūdijs', price:35,
      images:{front:'assets/collection/hoodie-front.webp',back:'assets/collection/hoodie-back.webp',sleeve:'assets/collection/hoodie-sleeve.webp'},
      sleeve:{width:360,height:684,x:154,y:258,font:60}
    },
    sweatshirt: {
      id:'sweatshirt', name:'Džemperis', price:30,
      images:{front:'assets/collection/sweatshirt-front.webp',back:'assets/collection/sweatshirt-back.webp',sleeve:'assets/collection/sweatshirt-sleeve.webp'},
      sleeve:{width:284,height:811,x:143.5,y:294,font:68}
    }
  };
  const el = {
    options: $$('[data-lb-product]'), gallery: $('#lb-gallery'), previewTitle: $('#lb-preview-title'),
    radio: $$('[name="lb-variant"]'), numberGroup: $('#lb-number-group'), number: $('#lb-number'),
    size: $('#lb-size'), quantity: $('#lb-quantity'), less: $('#lb-less'), more: $('#lb-more'),
    price: $('#lb-price'), unit: $('#lb-unit'), year: $('#lb-year'), yearGroup: $('#lb-year-group'), form: $('#lb-order-form'),
    submit: $('#lb-submit'), name: $('#lb-name'), contact: $('#lb-contact'), comment: $('#lb-comment'),
    error: $('#lb-error'), status: $('#lb-status'), turnstile: $('#lb-turnstile'), demo: $('#lb-demo-note')
  };
  if (!el.gallery || !el.form || !el.number || !el.year) return;
  const state = {product:'tshirt', variant:'number', number:'6', year:'2013', quantity:1, sent:false};
  const eur = value => new Intl.NumberFormat('lv-LV',{style:'currency',currency:'EUR'}).format(value);
  const safe = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  let captchaId = null;
  let shippingEnabled = false;
  const chosen = () => models[state.product];
  function refreshSize() {
    const wanted=el.size.value;
    const sizes=productInfo[state.product]?.izmeri || ['S','M','L','XL','2XL'];
    el.size.innerHTML='<option value="">Izvēlies izmēru</option>'+sizes.map(size=>`<option value="${safe(size)}">${safe(size)}</option>`).join('');
    if(sizes.includes(wanted)) el.size.value=wanted;
  }
  // Authentic jersey digit outlines from the client-supplied Kirsty Bold design.
  // No font file is shipped: only the ten numeral contours used in this preview.
  const JERSEY_NUMERALS = Object.freeze({"0":{"w":36.14,"d":"M0 47.54 4.37 56H31.69L36.14 47.54V8.46L31.69 0H4.37L0 8.53ZM13.84 44.46V11.76L14.7 9.97H21.3L22.23 11.76V44.46L21.44 46.1H14.63Z"},"1":{"w":24.52,"d":"M24.52 56 20.08 46.89V0H8.03L6.17 5.52L0 8.03V17.71H6.24V46.97L1.72 56Z"},"2":{"w":34.49,"d":"M18.5 43.38 34.49 18.5V8.53L30.19 0H1.51V14.56L10.47 9.97H22.01L22.73 11.47V12.62L0 46.82V56H34.49V41.44L25.45 46.1H15.27Z"},"3":{"w":32.19,"d":"M9.11 46.03 0 41.44V56H27.89L32.19 47.47V35.42L29.47 30.26L25.17 28.04L29.83 25.53L32.19 20.51V8.46L27.89 0H0.14V14.56L9.18 9.97H17.42L18.36 11.76V21.37L17.5 23.02H8.6V32.91H17.57L18.36 34.56V44.38L17.57 46.03Z"},"4":{"w":40.8,"d":"M40.08 56 35.56 46.97V40.66H40.8V30.69H35.56V9.11L40.15 0H24.24L0 31.05L4.59 40.66H21.65V46.97L17.21 56ZM11.76 30.69 21.65 17.64V30.69Z"},"5":{"w":34.56,"d":"M9.11 46.1 0 41.44V56H30.19L34.56 47.47V31.48L30.19 23.02H13.91L13.12 21.44V12.83L11.54 9.97H23.95L33.06 14.56V0H0V26.17L4.3 32.91H20.65L21.44 34.56V44.24L20.51 46.1Z"},"6":{"w":38.43,"d":"M0 47.54 4.37 56H34.13L38.43 47.54V31.55L34.13 23.02H13.84V11.76L14.7 9.97H26.03L34.99 14.56V0H4.37L0 8.53ZM23.52 32.91 24.59 35.28V44.46L23.88 46.1H14.63L13.84 44.46V32.91Z"},"7":{"w":33.77,"d":"M22.94 56 20.01 47.25 33.77 8.68 29.4 0H0.57V14.56L9.54 9.97H21.65L18.07 14.48L6.45 47.04L0 56Z"},"8":{"w":36.71,"d":"M0 47.54 4.3 56H32.41L36.71 47.54V35.42L33.99 30.26L29.69 28.04L34.35 25.53L36.71 20.51V8.46L32.41 0H4.3L0 8.46V20.51L2.37 25.53L7.03 28.04L2.72 30.26L0 35.42ZM13.84 44.46V34.56L14.63 32.91H22.08L22.87 34.56V44.46L22.08 46.1H14.63ZM13.84 21.37V11.76L14.77 9.97H21.94L22.87 11.76V21.37L22.01 23.02H14.7Z"},"9":{"w":38.36,"d":"M3.3 41.44V56H34.06L38.36 47.47V8.46L34.06 0H4.23L0 8.46V23.66L4.23 32.19H24.59V44.24L23.45 46.1H12.4ZM13.77 19.93V11.54L14.48 9.97H23.66L24.59 11.54V22.3H14.84Z"}});


  // Overlay alignment is in each original garment mockup's pixel coordinates.
  // The uploaded art stays intact: the preview hides only its fixed 2013 and
  // draws the selected year using the same Kirsty Bold numeral shapes.
  const yearAreas = {
    tshirt: {
      front: {w:600,h:709,x:314,y:289,limitW:27,limitH:12,cover:[299,283,29,12]},
      back: {w:600,h:714,x:314,y:175,limitW:145,limitH:59,cover:[236,141,154,68],sampleY:215}
    },
    hoodie: {
      front: {w:590,h:684,x:306,y:323,limitW:25,limitH:12,cover:[293,317,27,12]},
      back: {w:540,h:684,x:300,y:211,limitW:139,limitH:57,cover:[229,179,143,64],sampleY:173}
    },
    sweatshirt: {
      front: {w:600,h:726,x:313,y:295,limitW:27,limitH:12,cover:[298,289,31,13]},
      back: {w:600,h:754,x:308,y:187,limitW:146,limitH:60,cover:[231,151,153,69],sampleY:210}
    }
  };
  function jerseyDigits(value, className) {
    let offset = 0;
    const gap = 3;
    const paths = [...value].map(digit => {
      const glyph = JERSEY_NUMERALS[digit];
      if (!glyph) return '';
      const part = '<g transform="translate(' + offset + ' 0)">' +
        '<path class="' + className + '-outer" d="' + glyph.d + '"/>' +
        '<path class="' + className + '-inner" d="' + glyph.d + '"/>' +
        '</g>';
      offset += glyph.w + gap;
      return part;
    }).join('');
    return {paths, width: Math.max(0, offset - gap)};
  }
  function yearSvg(view) {
    const area = yearAreas[state.product]?.[view];
    if (!area) return '';
    const [bx,by,bw,bh] = area.cover;
    const digits = jerseyDigits(state.year, 'lb-year');
    const scale = Math.min(area.limitH / 56, area.limitW / Math.max(1, digits.width));
    const visible = digits.paths ?
      '<g transform="translate(' + area.x + ' ' + area.y + ') scale(' + scale + ') translate(' +
      (-digits.width/2) + ' -28)">' + digits.paths + '</g>' : '';
    let eraser = '';
    if (view === 'front') {
      // The year is printed on the shield's solid gold interior.
      eraser = '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh +
        '" fill="#ffc20a"/>';
    } else {
      // Replace the embedded 2013 with an unprinted part of the same shirt texture.
      // This avoids a flat black rectangle and leaves the surrounding design intact.
      const id = 'lb-year-soft-' + state.product;
      eraser = '<defs><filter id="' + id + '" x="-20%" y="-20%" width="140%" height="140%">' +
        '<feGaussianBlur stdDeviation="1.2"/></filter><mask id="' + id + '-mask" maskUnits="userSpaceOnUse">' +
        '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh +
        '" fill="white" filter="url(#' + id + ')"/></mask></defs>' +
        '<image href="' + chosen().images.back + '" width="' + area.w + '" height="' + area.h +
        '" x="0" y="' + (-area.sampleY) + '" preserveAspectRatio="none" mask="url(#' + id + '-mask)"/>';
    }
    return '<svg class="lb-year-overlay lb-year-' + view + '" viewBox="0 0 ' + area.w + ' ' +
      area.h + '" aria-hidden="true" preserveAspectRatio="xMidYMid meet">' +
      eraser + '<g data-lb-year>' + visible + '</g></svg>';
  }
  function updateYearVisual() {
    for (const view of ['front','back']) {
      const svg = $('.lb-view-' + view + ' .lb-year-overlay', el.gallery);
      if (!svg) continue;
      const fresh = yearSvg(view);
      // Only this SVG is replaced; product and size selections remain unchanged.
      svg.outerHTML = fresh;
    }
  }

  function numberArt() {
    const value = state.number;
    if (!/^\d{1,2}$/.test(value)) return '';
    const {x, y, font} = chosen().sleeve;
    const scale = font / 60 * (value.length === 2 ? 0.78 : 1);
    const gap = 4;
    const fullWidth = [...value].reduce((sum, digit) => sum + JERSEY_NUMERALS[digit].w, 0)
      + gap * (value.length - 1);
    let offset = 0;
    const paths = [...value].map(digit => {
      const glyph = JERSEY_NUMERALS[digit];
      const result = '<g transform="translate(' + offset + ' 0)">' +
        '<path class="lb-num-outer" d="' + glyph.d + '"/>' +
        '<path class="lb-num-inner" d="' + glyph.d + '"/>' +
        '</g>';
      offset += glyph.w + gap;
      return result;
    }).join('');
    return '<g data-lb-overlay transform="translate(' + x + ' ' + y + ') scale(' + scale + ') translate(' +
      (-fullWidth / 2) + ' -28)">' + paths + '</g>';
  }

  function numberSvg() {
    const {width, height} = chosen().sleeve;
    return '<svg class="lb-number-overlay" viewBox="0 0 ' + width + ' ' + height +
      '" aria-hidden="true" preserveAspectRatio="xMidYMid meet">' + numberArt() + '</svg>';
  }
  const views=[['front','Priekšpuse'],['back','Aizmugure'],['sleeve','Piedurkne']];
  function renderGallery() {
    const model=chosen();
    el.gallery.classList.toggle('is-logo-only',state.variant==='logo');
    el.gallery.innerHTML=views.map(([view,label])=>{
      const hide=state.variant==='logo'&&view!=='front';
      return `<figure class="lb-view lb-view-${view}"${hide?' hidden':''}>
        <div class="lb-view-art"><div class="lb-image-wrap"><img src="${model.images[view]}" alt="${safe(model.name)}: ${label.toLowerCase()} ar Limbaži Basketball dizainu" loading="${view==='sleeve'?'eager':'lazy'}" width="${view==='sleeve'?model.sleeve.width:600}">
        ${view==='sleeve'?numberSvg():''}${state.variant==='number'&&(view==='front'||view==='back')?yearSvg(view):''}</div></div><figcaption>${label}</figcaption></figure>`;
    }).join('');
    if(state.variant==='number' && matchMedia('(max-width:690px)').matches){
      const sleeve=$('.lb-view-sleeve',el.gallery);
      if(sleeve) el.gallery.scrollLeft=sleeve.offsetLeft-el.gallery.offsetLeft;
    }
  }
  function updateNumberVisual() {
    const svg = $('.lb-number-overlay', el.gallery);
    if (svg) svg.innerHTML = numberArt();
  }
  function renderPrice() {
    el.unit.textContent=eur(chosen().price)+' / gab.';
    el.price.textContent=eur(chosen().price*state.quantity);
  }
  function render() {
    el.options.forEach(node=>node.setAttribute('aria-pressed',String(node.dataset.lbProduct===state.product)));
    el.previewTitle.textContent=chosen().name+' — priekšskatījums';
    el.numberGroup.hidden=state.variant!=='number';
    if(el.yearGroup) el.yearGroup.hidden=state.variant!=='number';
    refreshSize();renderGallery();renderPrice();
  }
  el.options.forEach(button=>button.addEventListener('click',()=>{
    if(!models[button.dataset.lbProduct])return;
    state.product=button.dataset.lbProduct;
    state.sent=false;
    if(el.status)el.status.hidden=true;
    render();
  }));
  el.radio.forEach(radio=>radio.addEventListener('change',()=>{
    if(!radio.checked) return;
    state.variant=radio.value;
    state.sent=false;
    el.numberGroup.hidden=state.variant!=='number';
    if(el.yearGroup) el.yearGroup.hidden=state.variant!=='number';
    renderGallery();
  }));
  el.year.addEventListener('input', () => {
    const digits = el.year.value.replace(/\D/g, '').slice(0, 4);
    if (el.year.value !== digits) el.year.value = digits;
    state.year = digits;
    updateYearVisual();
  });
  el.number.addEventListener('input',()=>{
    const digits=el.number.value.replace(/\D/g,'').slice(0,2);
    if(el.number.value!==digits)el.number.value=digits;
    state.number=digits;
    updateNumberVisual();
  });
  function setQuantity(value) {
    state.quantity=Math.max(1,Math.min(99,Math.trunc(Number(value)||1)));
    el.quantity.value=state.quantity;
    renderPrice();
  }
  el.less?.addEventListener('click',()=>setQuantity(state.quantity-1));
  el.more?.addEventListener('click',()=>setQuantity(state.quantity+1));
  el.quantity?.addEventListener('change',()=>setQuantity(el.quantity.value));
  function showError(message) { if(el.error){el.error.textContent=message;el.error.hidden=false;} if(el.status)el.status.hidden=true; }
  window.PrintStichDelivery.config().then(async cfg => {
    if (!cfg.enabled || !cfg.sitekey) return;
    const captcha=await window.PrintStichDelivery.loadTurnstile();
    captchaId=captcha.render(el.turnstile,{sitekey:cfg.sitekey,theme:'auto'});
    shippingEnabled=true;
    if(el.submit)el.submit.disabled=false;
    if(el.demo)el.demo.hidden=true;
  }).catch(()=>showError('Drošības pārbaudi neizdevās ielādēt.'));
  el.form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!shippingEnabled || captchaId===null || el.submit.disabled)return;
    if(el.error)el.error.hidden=true;
    const name=el.name.value.trim(), contact=el.contact.value.trim();
    const validContact=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)||/^[+0-9()\s-]{7,22}$/.test(contact);
    if(!name || name.length>100 || !validContact || !el.size.value){showError('Norādi vārdu, kontaktus un izmēru.');return;}
    if(state.variant==='number'&&!/^\d{1,2}$/.test(state.number)){showError('Ievadi spēlētāja numuru (1–2 cipari).');return;}
    if(state.variant==='number'&&!/^\d{4}$/.test(state.year)){showError('Ievadi gadu ar četriem cipariem.');return;}
    const token=window.turnstile?.getResponse(captchaId);
    if(!token){showError('Pabeidz drošības pārbaudi.');return;}
    const payload={kind:'collection',name,contact,comment:el.comment.value.trim(),size:el.size.value,product:state.product,
      variant:state.variant,number:state.variant==='number'?state.number:null,year:state.variant==='number'?state.year:null,quantity:state.quantity,turnstileToken:token};
    el.submit.disabled=true;el.submit.textContent='Nosūta…';
    try {
      const resp=await fetch('/api/orders/submit',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
      const body=await resp.json();if(!resp.ok||!body.success)throw Error(body.error||'Neizdevās nosūtīt pasūtījumu.');
      el.submit.textContent='Pieteikums nosūtīts';
      if(el.status){el.status.textContent='Pieteikums ir nosūtīts PrintStich. Ar tevi sazināsies par izgatavošanu.';el.status.hidden=false;}
      window.turnstile?.reset(captchaId);
    }catch(cause){showError(cause.message||'Nosūtīšana neizdevās.');el.submit.textContent='Pieteikt pasūtījumu';el.submit.disabled=false;window.turnstile?.reset(captchaId);}
  });
  render();
})();
