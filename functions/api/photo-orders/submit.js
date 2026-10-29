/**
 * PrintStich photo orders — guarded Cloudflare Pages Function.
 *
 * STAGING ONLY: the existing photo editor remains a demo.
 * This endpoint supports orders submitted with an external album URL.
 * Direct photo uploads / R2 references are deliberately NOT accepted yet.
 *
 * Required Cloudflare Pages secrets/settings before activation:
 *   PHOTO_ORDERS_ENABLED=true
 *   RESEND_API_KEY
 *   PHOTO_ORDER_FROM          (verified sending address on printstich.lv)
 *   PHOTO_ORDER_TO            (Maija's verified destination)
 *   TURNSTILE_SECRET_KEY
 *
 * The public Turnstile widget and the R2 upload workflow must be connected
 * before enabling the production photo-order UI.
 */

const BANDS = [9, 39, 69, 99, 149, 199];
const PRICES = {
  "10x15": [0.90, 0.55, 0.46, 0.40, 0.35, 0.32],
  "12x15": [1.00, 0.66, 0.56, 0.50, 0.45, 0.42],
  "15x20": [1.50, 1.06, 0.88, 0.85, 0.83, 0.80]
};
const SIZES = {"10x15": "10 × 15 cm", "12x15": "12 × 15 cm", "15x20": "15 × 20 cm", "other": "Nestandarta"};
const PAPERS = {gloss: "Glancēts", matte: "Matēts"};
const FITS = {contain: "Visa bilde ar baltām malām, ja nepieciešams", cover: "Aizpildīt papīru, iespējama apgriešana"};
const money = value => new Intl.NumberFormat("lv-LV", {style: "currency", currency: "EUR"}).format(value);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {"content-type": "application/json; charset=utf-8", "cache-control": "no-store"}
  });
}

function clean(value, max) {
  return typeof value === "string" ? value.trim().slice(0, max + 1) : "";
}

function validateAlbumUrl(raw) {
  if (!raw || raw.length > 2000) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.username || url.password || !url.hostname.includes(".")) return null;
    if (url.hostname === "localhost" || url.hostname.endsWith(".localhost")) return null;
    return url.href;
  } catch {
    return null;
  }
}

function validateItems(items) {
  if (!Array.isArray(items) || items.length < 1 || items.length > 200) return null;
  const result = [];
  let totalPrints = 0;
  for (const entry of items) {
    if (!entry || !Object.hasOwn(SIZES, entry.size) || !Object.hasOwn(PAPERS, entry.paper)
        || !Object.hasOwn(FITS, entry.mode) || !Number.isInteger(entry.qty)
        || entry.qty < 1 || entry.qty > 999) return null;
    totalPrints += entry.qty;
    if (totalPrints > 50000) return null;
    result.push({size: entry.size, paper: entry.paper, mode: entry.mode, qty: entry.qty});
  }
  return result;
}

function estimate(items) {
  const grouped = new Map();
  items.forEach(entry => grouped.set(entry.size, (grouped.get(entry.size) || 0) + entry.qty));
  let total = 0, uncertain = false;
  for (const [size, qty] of grouped) {
    const band = BANDS.findIndex(max => qty <= max);
    if (band === -1 || !PRICES[size]) uncertain = true;
    else total += PRICES[size][band] * qty;
  }
  return {
    quantity: items.reduce((sum, entry) => sum + entry.qty, 0),
    estimate: uncertain ? null : money(Math.round(total * 100) / 100),
    hasMixedSizes: grouped.size > 1
  };
}

async function verifyTurnstile(token, request, secret) {
  if (!secret || !token || token.length > 2048) return false;
  const remoteip = request.headers.get("CF-Connecting-IP") || undefined;
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {"content-type": "application/json"},
      body: JSON.stringify({secret, response: token, remoteip})
    });
    if (!response.ok) return false;
    const result = await response.json();
    const expectedHost = new URL(request.url).hostname;
    // Fail closed if the token belongs to a different site.
    return result.success === true && result.hostname === expectedHost;
  } catch {
    return false;
  }
}

export async function onRequestPost({request, env}) {
  // Even after migration, this must remain disabled until end-to-end testing.
  if (env.PHOTO_ORDERS_ENABLED !== "true") {
    return json({error: "Foto pasūtījumu nosūtīšana vēl nav aktivizēta."}, 503);
  }
  if (!env.RESEND_API_KEY || !env.PHOTO_ORDER_TO || !env.PHOTO_ORDER_FROM || !env.TURNSTILE_SECRET_KEY) {
    return json({error: "Pasūtījumu sistēma nav gatava. Sazinies ar PrintStich."}, 503);
  }
  if (!(request.headers.get("content-type") || "").startsWith("application/json")) {
    return json({error: "Nepareizs pieprasījuma formāts."}, 415);
  }
  if (Number(request.headers.get("content-length") || "0") > 16000) {
    return json({error: "Pieprasījums ir pārāk liels."}, 413);
  }

  let form;
  try {
    const raw = await request.text();
    if (raw.length > 16000) return json({error: "Pieprasījums ir pārāk liels."}, 413);
    form = JSON.parse(raw);
  } catch {
    return json({error: "Neizdevās nolasīt pasūtījumu."}, 400);
  }
  if (!form || typeof form !== "object") return json({error: "Nepareizs pasūtījums."}, 400);
  const name = clean(form.name, 100);
  const contact = clean(form.contact, 160);
  const comment = clean(form.comment || "", 1200);
  const link = validateAlbumUrl(clean(form.filesLink, 2000));
  const items = validateItems(form.items);

  // This version intentionally requires an external album link.
  // Never email "success" when local-only browser images were not uploaded.
  if (!name || name.length > 100 || !contact || contact.length > 160 || !link || !items || comment.length > 1200) {
    return json({error: "Pārbaudi kontaktus, fotogrāfiju saiti un drukas iestatījumus."}, 400);
  }
  if (!/^[+0-9()\s-]{7,22}$/.test(contact) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) {
    return json({error: "Norādi derīgu tālruņa numuru vai e-pastu."}, 400);
  }
  if (!(await verifyTurnstile(clean(form.turnstileToken, 2048), request, env.TURNSTILE_SECRET_KEY))) {
    return json({error: "Drošības pārbaude neizdevās. Mēģini vēlreiz."}, 403);
  }

  const summary = estimate(items);
  const orderId = crypto.randomUUID();
  const rows = items.map((item, i) => [
    String(i + 1) + ". " + SIZES[item.size] + ", " + item.qty + " gab.",
    "Papīrs: " + PAPERS[item.paper],
    "Kadrējums: " + FITS[item.mode]
  ].join(" — ")).join("\n");
  const estimateText = summary.estimate || "Pēc individuālas saskaņošanas";
  const discountNote = summary.hasMixedSizes
    ? "Dažādu izmēru pasūtījums: iespējamo papildu 5% atlaidi PrintStich lemj individuāli; tā nav automātiski piemērota."
    : "Gala cenu apstiprina PrintStich.";
  const body = [
    "Jauns PrintStich foto drukas pieprasījums",
    "Pasūtījuma ID: " + orderId,
    "Klients: " + name,
    "Kontakts: " + contact,
    "Attēlu lejupielādes saite: " + link,
    "Izdrukas kopā: " + summary.quantity,
    "Provizoriskā cena: " + estimateText,
    discountNote,
    "Drukas pozīcijas:",
    rows,
    "Komentārs: " + (comment || "Nav"),
    "",
    "Pirms izgatavošanas pārbaudi failus, kadrējumu un apstiprini cenu."
  ].join("\n");

  try {
    const payload = {
      from: env.PHOTO_ORDER_FROM,
      to: [env.PHOTO_ORDER_TO],
      subject: "PrintStich foto pieprasījums • " + orderId.slice(0, 8),
      text: body
    };
    const resend = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "authorization": "Bearer " + env.RESEND_API_KEY,
        "content-type": "application/json",
        "idempotency-key": "photo-order/" + orderId
      },
      body: JSON.stringify(payload)
    });
    if (!resend.ok) {
      console.error("Photo order delivery failed, status", resend.status);
      return json({error: "Pieprasījumu neizdevās nosūtīt. Mēģini vēlreiz."}, 502);
    }
    return json({success: true, orderId});
  } catch {
    return json({error: "Pakalpojums īslaicīgi nav pieejams. Mēģini vēlreiz."}, 502);
  }
}
