
(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const el = {
    files: $('#fp-files'), picker: $('#fp-pick'), drop: $('#fp-drop'),
    fileStatus: $('#fp-file-status'), clear: $('#fp-clear'), link: $('#fp-link'),
    size: $('#fp-default-size'), paper: $('#fp-default-paper'), qty: $('#fp-default-qty'), fit: $('#fp-default-fit'),
    apply: $('#fp-apply'), list: $('#fp-photos'), empty: $('#fp-empty'), more: $('#fp-more'),
    summaryFiles: $('#fp-summary-files'), summaryPrints: $('#fp-summary-prints'),
    summaryLines: $('#fp-summary-lines'), summaryTotal: $('#fp-summary-total'), summaryNote: $('#fp-summary-note')
  };
  if (!el.files || !el.list) return;

  const tariffs = {
    '10x15': [0.90,0.55,0.46,0.40,0.35,0.32],
    '12x15': [1.00,0.66,0.56,0.50,0.45,0.42],
    '15x20': [1.50,1.06,0.88,0.85,0.83,0.80]
  };
  const bands = [9,39,69,99,149,199];
  const sizeLabels = {'10x15':'10 × 15 cm','12x15':'12 × 15 cm','15x20':'15 × 20 cm','other':'Cits izmērs'};
  const formatEUR = v => new Intl.NumberFormat('lv-LV',{style:'currency',currency:'EUR'}).format(v);
  const safe = s => String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const state = { items: [], shown: 10, nextId: 1 };
  const defaults = () => ({
    size: el.size.value, paper: el.paper.value, mode: el.fit.value,
    qty: Math.min(999, Math.max(1, Number.parseInt(el.qty.value,10) || 1))
  });
  const selectOptions = (values, selected) => Object.entries(values).map(([key,label]) => '<option value="'+key+'"'+(key===selected?' selected':'')+'>'+label+'</option>').join('');

  function addFiles(fileList) {
    const incoming = [...fileList];
    let accepted = 0;
    for (const file of incoming) {
      if (!['image/jpeg','image/png','image/webp'].includes(file.type)) continue;
      state.items.push({id: state.nextId++, name:file.name, bytes:file.size, url:URL.createObjectURL(file), positions:[defaults()]});
      accepted++;
    }
    if (accepted) {
      state.shown = Math.max(state.shown,Math.min(20,state.items.length));
      el.empty.hidden=true;
    }
    render();
    if (accepted !== incoming.length) el.fileStatus.textContent += ' · Daži neatbalstīti faili netika pievienoti';
  }

  function removeFile(id) {
    const ix = state.items.findIndex(item => item.id === id);
    if (ix<0) return;
    URL.revokeObjectURL(state.items[ix].url);
    state.items.splice(ix,1);
    render();
  }

  function rowMarkup(item,p,index) {
    const papers = {'gloss':'Glancēts','matte':'Matēts'};
    const modes = {'contain':'Visa bilde','cover':'Aizpildīt'};
    return '<div class="fp-photo-row" data-pos="'+index+'">' +
      '<label>Izmērs<select data-field="size">'+selectOptions(sizeLabels,p.size)+'</select></label>'+
      '<label>Papīrs<select data-field="paper">'+selectOptions(papers,p.paper)+'</select></label>'+
      '<label>Kopijas<input data-field="qty" type="number" min="1" max="999" value="'+p.qty+'" inputmode="numeric"></label>'+
      '<label>Kadrējums<select data-field="mode">'+selectOptions(modes,p.mode)+'</select></label>'+
      '<button class="fp-row-remove" data-action="remove-position" type="button" aria-label="Noņemt drukas variantu" title="Noņemt variantu"'+(item.positions.length===1?' disabled':'')+'>×</button>'+
      '</div>';
  }

  function photoMarkup(item) {
    const first = item.positions[0];
    return '<article class="fp-photo" data-id="'+item.id+'">'+
      '<div class="fp-photo-top">'+
        '<div class="fp-thumb" style="aspect-ratio:3 / 2"><img src="'+item.url+'" alt="'+safe(item.name)+'" loading="lazy" style="object-fit:'+(first.mode==='cover'?'cover':'contain')+'"></div>'+
        '<div class="fp-photo-info"><strong class="fp-photo-name" title="'+safe(item.name)+'">'+safe(item.name)+'</strong>'+
        '<span class="fp-photo-meta">'+(item.bytes/1024/1024).toFixed(2).replace('.',',')+' MB · '+item.positions.length+' drukas variants'+(item.positions.length>1?'i':'')+'</span>'+
        '<div class="fp-photo-actions"><button type="button" data-action="add-position">+ Vēl viens izmērs</button><button type="button" data-action="remove-file">Noņemt</button></div></div></div>'+
        '<div class="fp-photo-rows">'+item.positions.map((p,i)=>rowMarkup(item,p,i)).join('')+'</div>'+
        (item.positions.some(p=>p.mode==='cover')?'<p class="fp-photo-warning">Aizpildot papīru, attēla malas var tikt apgrieztas.</p>':'')+
      '</article>';
  }

  function render() {
    el.list.innerHTML = state.items.slice(0,state.shown).map(photoMarkup).join('');
    el.empty.hidden = state.items.length > 0;
    el.clear.hidden = state.items.length === 0;
    el.fileStatus.textContent = state.items.length
      ? state.items.length+' fotogrāfija'+(state.items.length===1?'':'s')+' pievienota'+(state.items.length===1?'':'s')+' · tikai priekšskatījumam'
      : 'Nav pievienota neviena fotogrāfija';
    el.more.hidden = state.items.length <= state.shown;
    if (!el.more.hidden) el.more.textContent = 'Rādīt vēl ('+(state.items.length-state.shown)+')';
    for (const img of el.list.querySelectorAll('.fp-thumb img')) {
      img.addEventListener('load',()=>{
        const box=img.parentElement;
        if (img.naturalHeight>img.naturalWidth) box.style.aspectRatio='2 / 3';
      },{once:true});
    }
    summary();
  }

  function summary() {
    const quantity = state.items.reduce((sum,item)=>sum+item.positions.reduce((a,p)=>a+p.qty,0),0);
    const grouped = new Map();
    state.items.forEach(item=>item.positions.forEach(p=>grouped.set(p.size,(grouped.get(p.size)||0)+p.qty)));
    const linkPresent = el.link.value.trim().length > 0;
    let sum=0,unknown=false;
    const lines = [...grouped.entries()].map(([size,qty])=>{
      const prices=tariffs[size];
      const band=bands.findIndex(max=>qty<=max);
      const price=prices && band>=0 ? prices[band]*qty : null;
      if (price===null){unknown=true;}
      else sum+=price;
      return '<div class="fp-summary-line"><span>'+safe(sizeLabels[size]||size)+' · '+qty+' gab.</span><strong>'+(price===null?'Pēc pieprasījuma':formatEUR(price))+'</strong></div>';
    });
    if (linkPresent) {unknown=true;lines.push('<div class="fp-summary-line"><span>Ārēja albuma saite</span><strong>Pēc pieprasījuma</strong></div>');}
    el.summaryFiles.textContent=String(state.items.length)+(linkPresent?' + saite':'');
    el.summaryPrints.textContent=String(quantity)+(linkPresent?' + jāprecizē':'');
    el.summaryLines.innerHTML=lines.length?lines.join(''):'<p>Izvēlies fotogrāfijas, lai redzētu aprēķinu.</p>';
    el.summaryTotal.textContent=!lines.length?'—':unknown?'Jāprecizē':formatEUR(sum);
    el.summaryNote.textContent=unknown
      ? 'Pasūtījumā ir nestandarta izmērs, 200+ izdrukas vai ārēja saite. Precīzo cenu noteiks PrintStich.'
      : 'Provizoriski pēc publicētā cenrāža, skaitot katra izmēra kopijas atsevišķi. Atlaides un gala cenu vēl jāsaskaņo ar PrintStich.';
  }

  el.picker.addEventListener('click',e=>{e.stopPropagation();el.files.click()});
  el.drop.addEventListener('click',()=>el.files.click());
  el.drop.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.files.click()}});
  el.files.addEventListener('change',()=>{addFiles(el.files.files);el.files.value=''});
  el.drop.addEventListener('dragover',e=>{e.preventDefault();el.drop.classList.add('is-dragging')});
  el.drop.addEventListener('dragleave',()=>el.drop.classList.remove('is-dragging'));
  el.drop.addEventListener('drop',e=>{e.preventDefault();el.drop.classList.remove('is-dragging');addFiles(e.dataTransfer.files)});
  el.clear.addEventListener('click',()=>{state.items.forEach(item=>URL.revokeObjectURL(item.url));state.items=[];state.shown=10;render()});
  el.apply.addEventListener('click',()=>{const cfg=defaults();state.items.forEach(item=>item.positions.forEach(p=>Object.assign(p,cfg)));render();el.apply.textContent='Piemērots visām bildēm';setTimeout(()=>{el.apply.textContent='Piemērot visām bildēm'},1400)});
  el.more.addEventListener('click',()=>{state.shown+=20;render()});
  el.link.addEventListener('input',summary);

  el.list.addEventListener('click',event=>{
    const button=event.target.closest('button[data-action]');
    if (!button) return;
    const card=button.closest('[data-id]');
    const item=state.items.find(i=>i.id===Number(card.dataset.id));
    if(!item)return;
    if(button.dataset.action==='remove-file'){removeFile(item.id);return;}
    if(button.dataset.action==='add-position'){
      const used=new Set(item.positions.map(p=>p.size));
      const extra=['10x15','12x15','15x20','other'].find(s=>!used.has(s)) || defaults().size;
      item.positions.push({...defaults(),size:extra});render();return;
    }
    if(button.dataset.action==='remove-position'){
      const ix=Number(button.closest('[data-pos]').dataset.pos);
      if(item.positions.length>1){item.positions.splice(ix,1);render();}
    }
  });
  el.list.addEventListener('change',event=>{
    const input=event.target.closest('[data-field]');
    if(!input)return;
    const item=state.items.find(i=>i.id===Number(input.closest('[data-id]').dataset.id));
    const pos=item?.positions[Number(input.closest('[data-pos]').dataset.pos)];
    if(!pos)return;
    const field=input.dataset.field;
    pos[field]=field==='qty'?Math.min(999,Math.max(1,Number.parseInt(input.value,10)||1)):input.value;
    render();
  });
  window.addEventListener('pagehide',()=>state.items.forEach(item=>URL.revokeObjectURL(item.url)));
  render();
})();
