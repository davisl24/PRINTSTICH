/**
 * PrintStich photo orders — Cloudflare Pages Function.
 * Production remains DISABLED by default. Enable only after domain, Resend,
 * Turnstile and actual attachment delivery have passed end-to-end tests.
 *
 * Supported: up to 20 MB original JPG/PNG/WebP files as email attachments,
 * or a private external HTTPS album link for large batches.
 * Never stores customer photos and never needs R2.
 *
 * Cloudflare environment:
 * PHOTO_ORDERS_ENABLED=true (only after testing)
 * RESEND_API_KEY, PHOTO_ORDER_FROM, PHOTO_ORDER_TO, TURNSTILE_SECRET_KEY
 */
const LIMIT_BYTES = 20_000_000;
const MAX_FILES = 25;
const MAX_BODY_BYTES = 22_000_000;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const BANDS = [9, 39, 69, 99, 149, 199];
const PRICES = {
  "10x15": [0.90, 0.55, 0.46, 0.40, 0.35, 0.32],
  "12x15": [1.00, 0.66, 0.56, 0.50, 0.45, 0.42],
  "15x20": [1.50, 1.06, 0.88, 0.85, 0.83, 0.80]
};
const SIZES = {"10x15": "10 × 15 cm", "12x15": "12 × 15 cm", "15x20": "15 × 20 cm", other: "Nestandarta"};
const PAPERS = {gloss: "Glancēts", matte: "Matēts"};
const FITS = {contain: "Visa bilde ar baltām malām, ja nepieciešams", cover: "Aizpildīt papīru, iespējama apgriešana"};
const money = n => new Intl.NumberFormat("lv-LV", {style:"currency", currency:"EUR"}).format(n);
const reply = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: {"content-type":"application/json; charset=utf-8", "cache-control":"no-store"}
});
const safeText = (value, limit) => typeof value === "string"
  ? value.trim().replace(/[\r\n\t]+/g, " ").slice(0, limit + 1) : "";
const isEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isPhone = value => /^[+0-9()\s-]{7,22}$/.test(value);
const isFile = value => value && typeof value.arrayBuffer === "function" && typeof value.size === "number";

function albumLink(raw) {
  if (!raw || raw.length > 2000) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.username || url.password
      || !url.hostname.includes(".") || url.hostname === "localhost"
      || url.hostname.endsWith(".localhost")) return null;
    return url.href;
  } catch { return null; }
}
function validItems(input, fileCount) {
  if (!Array.isArray(input) || !input.length || input.length > 150) return null;
  let total = 0;
  const validated = [];
  for (const item of input) {
    if (!item || !Object.hasOwn(SIZES, item.size) || !Object.hasOwn(PAPERS, item.paper)
      || !Object.hasOwn(FITS, item.mode) || !Number.isInteger(item.qty)
      || item.qty < 1 || item.qty > 10000) return null;
    if (fileCount && (!Number.isInteger(item.fileIndex) || item.fileIndex < 0 || item.fileIndex >= fileCount)) return null;
    total += item.qty;
    if (total > 50000) return null;
    validated.push({size:item.size, paper:item.paper, mode:item.mode, qty:item.qty,
      fileIndex:fileCount ? item.fileIndex : null});
  }
  return validated;
}
function calc(items) {
  const group = new Map();
  items.forEach(p => group.set(p.size, (group.get(p.size) || 0) + p.qty));
  let sum = 0, uncertain = false;
  for (const [size, qty] of group) {
    const price = PRICES[size];
    const band = BANDS.findIndex(max => qty <= max);
    if (!price || band < 0) uncertain = true;
    else sum += Math.round(price[band] * qty * 100);
  }
  return {count: items.reduce((a, p) => a + p.qty, 0),
    estimate: uncertain ? null : money(sum / 100), mixed: group.size > 1};
}
async function turnstile(token, request, secret) {
  if (!secret || !token || token.length > 2048) return false;
  try {
    const body = new URLSearchParams({secret, response: token});
    const ip = request.headers.get("CF-Connecting-IP");
    if (ip) body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {method:"POST", body});
    if (!res.ok) return false;
    const result = await res.json();
    return result.success === true && result.hostname === new URL(request.url).hostname;
  } catch { return false; }
}
function encodeBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const parts = [];
  // Multiple-of-three chunk size avoids padding in the middle.
  for (let i = 0; i < bytes.length; i += 32766) {
    parts.push(btoa(String.fromCharCode(...bytes.subarray(i, i + 32766))));
  }
  return parts.join("");
}

export async function onRequestPost({request, env}) {
  if (env.PHOTO_ORDERS_ENABLED !== "true") {
    return reply({error:"Fotogrāfiju pasūtīšana vēl ir demo režīmā."}, 503);
  }
  if (!env.RESEND_API_KEY || !env.PHOTO_ORDER_FROM || !env.PHOTO_ORDER_TO || !env.TURNSTILE_SECRET_KEY) {
    return reply({error:"Pasūtīšana vēl nav konfigurēta."}, 503);
  }
  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_BODY_BYTES) return reply({error:"Pievienoto failu apjoms pārsniedz 20 MB. Izmanto Failiem.lv saiti."}, 413);
  const type = (request.headers.get("content-type") || "").toLowerCase();
  let name, contact, comment, link, items, token, files = [];

  try {
    if (type.startsWith("multipart/form-data")) {
      const form = await request.formData();
      files = form.getAll("files").filter(isFile);
      name = safeText(form.get("name"), 100);
      contact = safeText(form.get("contact"), 160);
      comment = safeText(form.get("comment") || "", 1200);
      link = albumLink(safeText(form.get("filesLink") || "", 2000));
      token = safeText(form.get("turnstileToken"), 2048);
      items = validItems(JSON.parse(form.get("items") || "null"), files.length);
    } else if (type.startsWith("application/json")) {
      const raw = await request.text();
      if (raw.length > 16000) return reply({error:"Pieprasījums ir pārāk liels."}, 413);
      const form = JSON.parse(raw);
      name = safeText(form.name, 100);
      contact = safeText(form.contact, 160);
      comment = safeText(form.comment || "", 1200);
      link = albumLink(safeText(form.filesLink || "", 2000));
      token = safeText(form.turnstileToken, 2048);
      items = validItems(form.items, 0);
    } else {
      return reply({error:"Nepareizs pieprasījuma formāts."}, 415);
    }
  } catch { return reply({error:"Neizdevās nolasīt pasūtījuma datus."}, 400); }

  if (!name || name.length > 100 || !contact || contact.length > 160
    || (!isEmail(contact) && !isPhone(contact)) || comment.length > 1200
    || !items || files.length > MAX_FILES || (files.length > 0 && link)
    || (files.length === 0 && !link)) {
    return reply({error:"Pārbaudi kontaktus, albumu un drukas iestatījumus."}, 400);
  }
  if (files.length > 0) {
    if (files.some(f => !ALLOWED_TYPES.has(f.type) || f.size < 1)
      || files.reduce((sum, f) => sum + f.size, 0) > LIMIT_BYTES) {
      return reply({error:"Vienā pasūtījumā drīkst pievienot līdz 20 MB JPG, PNG vai WebP failu. Lielākiem apjomiem izmanto Failiem.lv saiti."}, 413);
    }
    const used = new Set(items.map(p => p.fileIndex));
    if (used.size !== files.length || files.some((_, i) => !used.has(i))) {
      return reply({error:"Trūkst drukas iestatījumu dažiem failiem."}, 400);
    }
  }

  if (!(await turnstile(token, request, env.TURNSTILE_SECRET_KEY))) {
    return reply({error:"Drošības pārbaude neizdevās. Mēģini vēlreiz."}, 403);
  }

  const totals = calc(items);
  const id = crypto.randomUUID();
  const lines = items.map((p, i) => {
    const title = files.length ? safeText(files[p.fileIndex].name, 160) : "Albuma fotogrāfijas";
    return [`${i + 1}. ${title} — ${SIZES[p.size]}, ${p.qty} gab.`,
      `Papīrs: ${PAPERS[p.paper]}`, `Kadrējums: ${FITS[p.mode]}`].join(" | ");
  });
  const body = [
    "Jauns PrintStich fotogrāfiju pasūtījuma pieprasījums",
    "ID: " + id,
    "Vārds: " + name,
    "Kontakts: " + contact,
    files.length ? "Oriģinālie foto faili pievienoti pielikumos." : "Albuma saite: " + link,
    "Izdrukas kopā: " + totals.count,
    "Provizoriskā cena: " + (link ? "Precizējama pēc albuma pārbaudes" : totals.estimate || "Pēc individuālas saskaņošanas"),
    totals.mixed ? "Iespējamo 5% atlaidi jauktiem izmēriem PrintStich izvērtē individuāli." : "Gala cenu apstiprina PrintStich.",
    "Drukas iestatījumi:",
    ...lines,
    "Komentārs: " + (comment || "Nav"),
    "",
    "Pārbaudi failu kvalitāti un saskaņo galīgo cenu ar klientu."
  ].join("\n");
  try {
    const attachments = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const filename = safeText(f.name.replace(/[/\\]/g, "_"), 150) || `foto-${i + 1}.jpg`;
      attachments.push({filename: `${i + 1}-${filename}`, content: encodeBase64(await f.arrayBuffer())});
    }
    const payload = {
      from: env.PHOTO_ORDER_FROM,
      to: [env.PHOTO_ORDER_TO],
      subject: "PrintStich foto pieprasījums • " + id.slice(0, 8),
      text: body,
      ...(isEmail(contact) ? {reply_to: contact} : {}),
      ...(attachments.length ? {attachments} : {})
    };
    const resend = await fetch("https://api.resend.com/emails", {
      method:"POST",
      headers: {"authorization":"Bearer " + env.RESEND_API_KEY,
        "content-type":"application/json", "idempotency-key":"photo-order/" + id},
      body: JSON.stringify(payload)
    });
    if (!resend.ok) {
      console.error("Photo email failed: HTTP " + resend.status);
      return reply({error:"Pasūtījumu neizdevās nosūtīt. Mēģini vēlreiz vai sazinies ar PrintStich."}, 502);
    }
    return reply({success:true, orderId:id});
  } catch (err) {
    console.error("Photo order processing failed", String(err).slice(0, 120));
    return reply({error:"Pasūtījumu neizdevās nosūtīt. Lūdzu, sazinies ar PrintStich."}, 502);
  }
}
