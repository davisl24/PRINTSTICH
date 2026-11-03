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
    price: $('#lb-price'), unit: $('#lb-unit'), form: $('#lb-order-form'),
    submit: $('#lb-submit'), name: $('#lb-name'), contact: $('#lb-contact'), comment: $('#lb-comment'),
    error: $('#lb-error'), status: $('#lb-status'), turnstile: $('#lb-turnstile'), demo: $('#lb-demo-note')
  };
  if (!el.gallery || !el.form || !el.number) return;
  const state = {product:'tshirt', variant:'number', number:'6', quantity:1, sent:false};
  const eur = value => new Intl.NumberFormat('lv-LV',{style:'currency',currency:'EUR'}).format(value);
  const safe = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  let captchaId = null;
  const shippingEnabled = document.body.dataset.lbOrdersLive === 'true' && !!document.body.dataset.lbTurnstileSitekey;
  const chosen = () => models[state.product];
  function refreshSize() {
    const wanted=el.size.value;
    const sizes=productInfo[state.product]?.izmeri || ['S','M','L','XL','2XL'];
    el.size.innerHTML='<option value="">Izvēlies izmēru</option>'+sizes.map(size=>`<option value="${safe(size)}">${safe(size)}</option>`).join('');
    if(sizes.includes(wanted)) el.size.value=wanted;
  }
  function numberSvg() {
    const {width,height,x,y,font}=chosen().sleeve;
    const text=state.number||'—';
    const size=font*(text.length===2?.78:1);
    return `<svg class="lb-number-overlay" viewBox="0 0 ${width} ${height}" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <text class="lb-num-back" x="${x}" y="${y}" font-size="${size}" data-lb-overlay>${safe(text)}</text>
      <text class="lb-num-face" x="${x}" y="${y}" font-size="${size}" data-lb-overlay>${safe(text)}</text>
    </svg>`;
  }
  const views=[['front','Priekšpuse'],['back','Aizmugure'],['sleeve','Piedurkne']];
  function renderGallery() {
    const model=chosen();
    el.gallery.classList.toggle('is-logo-only',state.variant==='logo');
    el.gallery.innerHTML=views.map(([view,label])=>{
      const hide=state.variant==='logo'&&view!=='front';
      return `<figure class="lb-view lb-view-${view}"${hide?' hidden':''}>
        <div class="lb-view-art"><div class="lb-image-wrap"><img src="${model.images[view]}" alt="${safe(model.name)}: ${label.toLowerCase()} ar Limbaži Basketball dizainu" loading="${view==='sleeve'?'eager':'lazy'}" width="${view==='sleeve'?model.sleeve.width:600}">
        ${view==='sleeve'?numberSvg():''}</div></div><figcaption>${label}</figcaption></figure>`;
    }).join('');
    if(state.variant==='number' && matchMedia('(max-width:690px)').matches){
      const sleeve=$('.lb-view-sleeve',el.gallery);
      if(sleeve) el.gallery.scrollLeft=sleeve.offsetLeft-el.gallery.offsetLeft;
    }
  }
  function updateNumberVisual() {
    const text=state.number||'—';
    $$('[data-lb-overlay]',el.gallery).forEach(node=>{node.textContent=text;node.setAttribute('font-size',String(chosen().sleeve.font*(text.length===2?.78:1)));});
  }
  function renderPrice() {
    el.unit.textContent=eur(chosen().price)+' / gab.';
    el.price.textContent=eur(chosen().price*state.quantity);
  }
  function render() {
    el.options.forEach(node=>node.setAttribute('aria-pressed',String(node.dataset.lbProduct===state.product)));
    el.previewTitle.textContent=chosen().name+' — priekšskatījums';
    el.numberGroup.hidden=state.variant!=='number';
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
    renderGallery();
  }));
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
  if(shippingEnabled){
    const script=document.createElement('script');
    script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async=true;
    script.onload=()=>{
      if(!window.turnstile)return;
      try {captchaId=window.turnstile.render(el.turnstile,{sitekey:document.body.dataset.lbTurnstileSitekey,theme:'auto'});
        if(el.submit)el.submit.disabled=false;
        if(el.demo)el.demo.hidden=true;
      } catch {showError('Drošības pārbaudi neizdevās ielādēt.');}
    };
    script.onerror=()=>showError('Drošības pārbaudi neizdevās ielādēt.');
    document.head.appendChild(script);
  }
  el.form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!shippingEnabled || captchaId===null || el.submit.disabled)return;
    if(el.error)el.error.hidden=true;
    const name=el.name.value.trim(), contact=el.contact.value.trim();
    const validContact=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)||/^[+0-9()\s-]{7,22}$/.test(contact);
    if(!name || name.length>100 || !validContact || !el.size.value){showError('Norādi vārdu, kontaktus un izmēru.');return;}
    if(state.variant==='number'&&!/^\d{1,2}$/.test(state.number)){showError('Ievadi spēlētāja numuru (1–2 cipari).');return;}
    const token=window.turnstile?.getResponse(captchaId);
    if(!token){showError('Pabeidz drošības pārbaudi.');return;}
    const payload={name,contact,comment:el.comment.value.trim(),size:el.size.value,product:state.product,
      variant:state.variant,number:state.variant==='number'?state.number:null,quantity:state.quantity,turnstileToken:token};
    el.submit.disabled=true;el.submit.textContent='Nosūta…';
    try {
      const resp=await fetch('/api/collection-orders/submit',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
      const body=await resp.json();if(!resp.ok||!body.success)throw Error(body.error||'Neizdevās nosūtīt pasūtījumu.');
      el.submit.textContent='Pieteikums nosūtīts';
      if(el.status){el.status.textContent='Pieteikums ir nosūtīts PrintStich. Ar tevi sazināsies par izgatavošanu.';el.status.hidden=false;}
      window.turnstile?.reset(captchaId);
    }catch(cause){showError(cause.message||'Nosūtīšana neizdevās.');el.submit.textContent='Pieteikt pasūtījumu';el.submit.disabled=false;window.turnstile?.reset(captchaId);}
  });
  render();
})();
