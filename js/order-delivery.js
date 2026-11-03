/* PrintStich customer order delivery. Public site key only; API keys stay in Cloudflare. */
(() => {
  'use strict';
  let configTask;
  let scriptTask;
  const config = () => configTask ||= fetch('/api/order-config',{cache:'no-store'})
    .then(r=>{if(!r.ok)throw Error('Konfigurāciju neizdevās ielādēt.');return r.json()});
  const loadTurnstile = () => scriptTask ||= new Promise((resolve,reject)=>{
    if(window.turnstile)return resolve(window.turnstile);
    const s=document.createElement('script');
    s.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async=true;
    s.onload=()=>window.turnstile?resolve(window.turnstile):reject(Error('Drošības pārbaude nav pieejama.'));
    s.onerror=()=>reject(Error('Neizdevās ielādēt drošības pārbaudi.'));
    document.head.appendChild(s);
  });
  function setup(form,button) {
    if(!form||!button)throw Error('Nav atrasta pasūtījuma forma.');
    const originalText=button.textContent;
    const container=document.createElement('div');
    container.className='order-turnstile-widget';
    const note=document.createElement('p');
    note.className='order-delivery-note';
    note.setAttribute('role','status');
    note.textContent='Tiešsaistes nosūtīšana tiek pieslēgta. Pagaidām raksti uz printstich@inbox.lv vai zvani +371 27 333 112.';
    button.insertAdjacentElement('beforebegin',container);
    button.insertAdjacentElement('afterend',note);
    button.disabled=true;
    let widget=null,active=false,busy=false;
    const controller={
      get active(){return active},
      async send(kind) {
        if(!active||widget===null||busy)throw Error('Tiešsaistes nosūtīšana vēl nav pieejama.');
        const token=window.turnstile?.getResponse(widget);
        if(!token)throw Error('Lūdzu, pabeidz drošības pārbaudi.');
        const data=new FormData(form);
        data.set('kind',kind);
        data.set('turnstileToken',token);
        busy=true;button.disabled=true;button.textContent='Nosūta…';
        try {
          const resp=await fetch('/api/orders/submit',{method:'POST',body:data});
          let result;
          try{result=await resp.json()}catch{throw Error('Serveris neatbildēja pareizi.')}
          if(!resp.ok||!result.success)throw Error(result.error||'Nosūtīšana neizdevās.');
          button.textContent='Pieprasījums nosūtīts';
          note.textContent='Pieprasījums nosūtīts PrintStich. Paldies!';
          window.turnstile?.reset(widget);
          return result;
        }catch(e){
          window.turnstile?.reset(widget);
          button.disabled=false;
          button.textContent=originalText;
          throw e;
        }finally{busy=false}
      }
    };
    config().then(async cfg=>{
      if(!cfg.enabled||!cfg.sitekey) return;
      const captcha=await loadTurnstile();
      widget=captcha.render(container,{sitekey:cfg.sitekey,theme:'auto'});
      active=true;
      note.textContent='';
      note.hidden=true;
      button.disabled=false;
    }).catch(()=>{note.textContent='Tiešsaistes nosūtīšana pašlaik nav pieejama. Raksti uz printstich@inbox.lv vai zvani +371 27 333 112.'});
    return controller;
  }
  window.PrintStichDelivery={setup,config,loadTurnstile};
})();