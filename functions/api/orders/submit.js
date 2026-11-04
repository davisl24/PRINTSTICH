/**
 * PrintStich contact, garment customizer and basketball collection submissions.
 * Production is FAIL-CLOSED until ORDERS_ENABLED=true and verified secrets exist.
 * No images are stored; files are emailed to the company's existing inbox.
 */
const json = (data, status=200) => new Response(JSON.stringify(data), {
  status, headers: {'content-type':'application/json; charset=utf-8', 'cache-control':'no-store',
    'x-content-type-options':'nosniff'}
});
const plain = (v,max=200) => typeof v === 'string'
  ? v.trim().replace(/[\r\n\t]+/g,' ').slice(0,max+1) : '';
const mail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const phone = v => /^[+0-9()\s-]{7,22}$/.test(v);
const contactOK = v => v.length<=160 && (mail(v)||phone(v));
const validFile = v => v && typeof v.arrayBuffer==='function' && Number.isFinite(v.size);
const fileTypes = new Set(['image/jpeg','image/png','image/webp','image/svg+xml','application/pdf']);
const safeName = name => plain(String(name||'file').replace(/[/\\]/g,'_'),120).replace(/[^a-zA-Z0-9.\- _āčēģīķļņšūžĀČĒĢĪĶĻŅŠŪŽ]/g,'_') || 'fails';
const safeLine = v => plain(v,260);
function encode64(buffer) {
  const bytes = new Uint8Array(buffer), chunks = [];
  // Entire input is already size-restricted. Multiple-of-3 avoids base64 padding mid-string.
  for(let i=0; i<bytes.length; i+=32766)
    chunks.push(btoa(String.fromCharCode(...bytes.subarray(i,i+32766))));
  return chunks.join('');
}
async function captcha(token, request, secret) {
  if(!secret || !token || token.length>2048) return false;
  try {
    const params = new URLSearchParams({secret,response:token});
    const ip = request.headers.get('CF-Connecting-IP');
    if(ip) params.set('remoteip',ip);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {method:'POST',body:params});
    if(!res.ok) return false;
    const v=await res.json();
    return v.success===true && v.hostname===new URL(request.url).hostname;
  } catch {return false}
}
const knownTopics = new Set(['Apģērba apdruka','Dizaina izveide','Uzņēmumam / komandai','Cits']);
function buildContact(form) {
  const name=plain(form.get('vards'),100), contact=plain(form.get('kontakts'),160);
  const topic=plain(form.get('temats'),80), other=plain(form.get('cits_temats'),120);
  const message=plain(form.get('zina'),3000);
  if(!name || name.length>100 || !contactOK(contact)||!knownTopics.has(topic)
      || (topic==='Cits'&&!other) || message.length<10 || message.length>3000)
    throw Error('Pārbaudi vārdu, kontaktus, tēmu un ziņojumu.');
  const attachments=form.getAll('pielikums').filter(f=>validFile(f) && f.size>0);
  if(attachments.length>12) throw Error('Drīkst pievienot ne vairāk kā 12 failus.');
  return {kind:'contact',contact,attachments,
    subject:'PrintStich — jauns kontaktu pieprasījums',
    body:['JAUNS PIEPRASĪJUMS','Vārds: '+name,'Kontakts: '+contact,'Tēma: '+topic,
    ...(topic==='Cits'?['Tēmas precizējums: '+other]:[]),
    'Ziņojums: '+message].join('\n')};
}
function buildGarment(form) {
  const name=plain(form.get('vards'),100),contact=plain(form.get('kontakts'),160);
  const product=plain(form.get('produkts'),120),color=plain(form.get('krasa'),100);
  const sizes=plain(form.get('izmeri_un_daudzums'),500);
  const qty=Number(form.get('daudzums_kopa'));
  const comment=plain(form.get('komentars')||'',1200);
  if(!name||name.length>100||!contactOK(contact)||!product||!color||!sizes||
    !Number.isSafeInteger(qty)||qty<1||qty>1000||comment.length>1200)
    throw Error('Pārbaudi apģērba izvēli un kontaktinformāciju.');
  const attachments=[];
  for(const [key,value] of form.entries()) {
    if(/^attachment\d*$/.test(key)&&validFile(value)&&value.size>0) attachments.push(value);
  }
  if(!attachments.length) throw Error('Nav pievienota pasūtījuma darba lapa vai dizaina faili.');
  const detailFields=[
    ['prieksa','Priekšpuse'],['aizmugure','Aizmugure'],
    ['kreisa_piedurkne','Kreisā piedurkne'],['laba_piedurkne','Labā piedurkne']
  ];
  const details=detailFields.flatMap(([prefix,label])=>[
    label+': '+safeLine(form.get(prefix+'_fails')||'—'),
    'Novietojums: '+safeLine(form.get(prefix+'_novietojums')||'—'),
    'Izmērs: '+safeLine(form.get(prefix+'_drukas_izmers_mm')||'—')
  ]);
  return {kind:'garment',contact,attachments,
    subject:'PrintStich — jauns apģērba dizaina pieprasījums',
    body:['APĢĒRBA DIZAINA PIEPRASĪJUMS','Vārds: '+name,'Kontakts: '+contact,
      'Produkts: '+product,'Krāsa: '+color,'Izmēri: '+sizes,'Daudzums: '+qty,
      ...details,'Komentārs: '+(comment||'Nav'),
      'Oriģinālie dizaina faili un priekšskatījuma darba lapa: pielikumos.'].join('\n')};
}
function buildCollection(data) {
  if(!data||typeof data!=='object') throw Error('Nepareizi pasūtījuma dati.');
  const name=plain(data.name,100),contact=plain(data.contact,160);
  const comment=plain(data.comment||'',1200);
  const variants=new Set(['number','logo']);
  const prices={tshirt:18,hoodie:35,sweatshirt:30};
  const names={tshirt:'T-krekls',hoodie:'Hūdijs',sweatshirt:'Džemperis'};
  const product=plain(data.product,32),variant=plain(data.variant,20);
  const size=plain(data.size,10),number=plain(data.number||'',2),year=plain(data.year,4);
  const quantity=Number(data.quantity);
  const sizes=new Set(['XS','S','M','L','XL','2XL','3XL','4XL','5XL','6XL','7XL','8XL','9XL','10XL','11XL','12XL','134','146','158']);
  if(!name||name.length>100||!contactOK(contact)||comment.length>1200
    ||!Object.hasOwn(prices,product)||!variants.has(variant)||!sizes.has(size)
    ||!/^\d{4}$/.test(year)||(variant==='number'&&!/^\d{1,2}$/.test(number))
    ||!Number.isSafeInteger(quantity)||quantity<1||quantity>99)
    throw Error('Pārbaudi produktu, izmēru, numuru un kontaktus.');
  return {kind:'collection',contact,attachments:[],
    subject:'PrintStich — Limbaži Basketball pasūtījums',
    body:['LIMBAŽI BASKETBALL PASŪTĪJUMS','Vārds: '+name,'Kontakts: '+contact,
      'Produkts: '+names[product], 'Apdruka: '+(variant==='number'?'Pilnais dizains ar numuru':'Tikai logo priekšpusē'),
      'Numurs: '+(variant==='number'?number:'Nav'), 'Gads: '+year,
      'Izmērs: '+size,'Daudzums: '+quantity,
      'Cena par gabalu: '+prices[product]+' EUR',
      'Summa: '+(prices[product]*quantity)+' EUR',
      'Komentārs: '+(comment||'Nav'),'Gala apdruku apstiprināt ar klientu.'].join('\n')};
}
export async function onRequestPost({request,env}) {
  if(env.ORDERS_ENABLED!=='true') return json({error:'Pasūtījumu nosūtīšana vēl nav aktivizēta.'},503);
  if(!env.RESEND_API_KEY||!env.ORDER_FROM||!env.ORDER_TO||!env.TURNSTILE_SECRET_KEY)
    return json({error:'Pasūtījumu nosūtīšana vēl nav konfigurēta.'},503);
  const reqOrigin=request.headers.get('Origin');
  if(reqOrigin && reqOrigin!==new URL(request.url).origin)
    return json({error:'Nepareiza pieprasījuma izcelsme.'},403);
  const length=Number(request.headers.get('content-length')||0);
  if(length>13_000_000)return json({error:'Pielikumu apjoms pārsniedz 10 MB.'},413);
  const type=(request.headers.get('content-type')||'').toLowerCase();
  let order,token='';
  try {
    if(type.startsWith('multipart/form-data')) {
      const data=await request.formData();
      const kind=plain(data.get('kind'),20);
      token=plain(data.get('turnstileToken'),2048);
      if(kind==='contact')order=buildContact(data);
      else if(kind==='garment')order=buildGarment(data);
      else return json({error:'Nepareizs pasūtījuma veids.'},400);
    } else if(type.startsWith('application/json')) {
      const body=await request.text();
      if(body.length>12000)return json({error:'Pārāk liels pieprasījums.'},413);
      const data=JSON.parse(body);
      token=plain(data.turnstileToken,2048);
      if(data.kind!=='collection')return json({error:'Nepareizs pasūtījuma veids.'},400);
      order=buildCollection(data);
    } else return json({error:'Nepareizs pieprasījuma formāts.'},415);
  } catch(e){return json({error:e?.message||'Nepareizi pasūtījuma dati.'},400)}
  if(order.attachments.length>12)return json({error:'Pārāk daudz pielikumu.'},413);
  if(order.attachments.some(f=>!fileTypes.has(f.type)||f.size<1||f.size>10_000_000)
     ||order.attachments.reduce((n,f)=>n+f.size,0)>10_000_000)
    return json({error:'Pielikumi pārsniedz 10 MB vai ir neatbalstītā formātā.'},413);
  if(!(await captcha(token,request,env.TURNSTILE_SECRET_KEY)))
    return json({error:'Drošības pārbaude neizdevās. Lūdzu, mēģini vēlreiz.'},403);
  try {
    const attachments=[];
    for(let i=0;i<order.attachments.length;i++){
      const file=order.attachments[i];
      attachments.push({filename:String(i+1)+'-'+safeName(file.name),
        content:encode64(await file.arrayBuffer())});
    }
    const id=crypto.randomUUID();
    const body={from:env.ORDER_FROM,to:[env.ORDER_TO],
      subject:order.subject+' • '+id.slice(0,8),text:order.body,
      ...(mail(order.contact)?{reply_to:order.contact}:{}),
      ...(attachments.length?{attachments}:{})};
    const response=await fetch('https://api.resend.com/emails',{
      method:'POST',
      headers:{authorization:'Bearer '+env.RESEND_API_KEY,
        'content-type':'application/json','idempotency-key':'order/'+id},
      body:JSON.stringify(body)
    });
    if(!response.ok){console.error('PrintStich order email HTTP '+response.status);return json({error:'Neizdevās nosūtīt. Sazinies ar PrintStich pa tālruni vai e-pastu.'},502)}
    return json({success:true,orderId:id});
  } catch(e){console.error('PrintStich order exception',String(e).slice(0,90));return json({error:'Neizdevās nosūtīt. Lūdzu, sazinies ar PrintStich.'},502)}
}
