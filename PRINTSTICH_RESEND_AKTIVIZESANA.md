# PRINTSTICH — Resend un pasūtījumu aktivizēšana

**Statuss 03.11.2026:** mājaslapa darbojas Cloudflare Pages; četras pasūtījumu formas ir sagatavotas kodā, bet piegāde ir izslēgta. Nekādas API atslēgas nedrīkst likt GitHub, HTML vai sūtīt čatā.

## Pie Maijas datora — 04.11.2026.

1. **Resend konts:** https://resend.com — reģistrēties ar Maijas uzņēmuma e-pastu. Verificēt e-pastu. Ja konts jau ir, izmantot esošo.
2. **Domēns:** Resend → **Domains → Add Domain → `printstich.lv`** → sūtīšanai paredzētais domēns; ja pieejams, EU (Ireland). Resend parādīs konkrētus **DKIM / SPF** (un citus nepieciešamos) DNS ierakstus. **Kopēt tieši norādītās vērtības**, nevis minēt. Cloudflare → **printstich.lv → DNS → Records → Add record**. Nepārrakstīt citus esošos DNS/MX bez pārbaudes. Resend → **Verify** → gaidīt **Verified**.
3. **Resend API atslēga:** Resend → **API Keys → Create API Key** → nosaukums `PrintStich Pages` → **Sending access** un ierobežot uz `printstich.lv`, ja piedāvā. Nokopēt vienreiz; **nekad neatklāt publiski un nesaglabāt GitHub**.
4. **Cloudflare Turnstile:** Cloudflare → **Turnstile → Add widget**, nosaukums `PrintStich formas`, atļautie hostnames: `printstich.lv` un `www.printstich.lv` (testiem var pievienot `printstich.pages.dev`). Iegūt **Site key** (publisku) un **Secret key** (privātu). Drošības pārbaudi nekad neveic tikai pārlūkā — servera API jau verificē tokenu.
5. **Cloudflare Pages mainīgie:** Cloudflare → Maijas konts → **Workers & Pages → printstich → Settings → Variables and Secrets → Add**. Izvēlēties **Production**:
   - `RESEND_API_KEY` → **Encrypt/Secret** → Resend API atslēga
   - `TURNSTILE_SECRET_KEY` → **Encrypt/Secret** → Turnstile privātā atslēga
   - `TURNSTILE_SITE_KEY` → **Text** → Turnstile publiskā atslēga
   - `ORDER_FROM` → **Text** → `PrintStich <pasutijumi@printstich.lv>`
   - `ORDER_TO` → **Text** → `printstich@inbox.lv`
   - `ORDERS_ENABLED` → **Text** → `false` (sākumā)
   - `PHOTO_ORDERS_ENABLED` → **Text** → `false` (sākumā)

   **Svarīgi:** pēc mainīgo izmaiņām vajadzīgs **jauns Pages deployment** (piem., Workers & Pages → printstich → Deployments → Retry deployment), lai funkcijas tos nolasītu. **Nemainīt Free plānu uz maksas.**

6. **Tikai testēšanai:** kad DNS ir Verified, API atslēga un Turnstile ir iestatīti, mainīt `ORDERS_ENABLED` uz `true`, **redeploy**, atvērt `https://printstich.lv/api/order-config` (jārāda `enabled:true`, publisks sitekey; nedrīkst rādīt API vai secret atslēgas). Atvērt kontaktu, apģērbu un Basketball lapas, pārbaudīt Turnstile un nosūtīt testa pasūtījumus. Maijai savā **Inbox.lv** jāsaredz ziņas ar pareiziem datiem un apģērbu pielikumiem; pārbaudīt Resend → Emails un Inbox.lv Spam. Ja neiet, nekavējoties atgriezt `ORDERS_ENABLED=false` un redeploy.
7. **Foto pasūtījumi atsevišķi:** pēc 1–2 mazu JPG pielikumu un Failiem.lv albuma testa (piem., 600 foto) var ieslēgt `PHOTO_ORDERS_ENABLED=true` un redeploy. **Obligāti atsevišķi pārbaudīt 5 MB, 10 MB un 20 MB failu nosūtīšanu Cloudflare Free limitos.** Ja lielie pielikumi neiet, atstāt foto sūtīšanu izslēgtu un labot, pirms aktivizē klientiem.

## Pēc piegādes testiem (Dāvja kodā)

- Pārbaudīt formu darbību mobilajā.
- Noņemt atlikušos demo uzrakstus (fotogrāfijas / Basketball), un abas darbspējīgās lapas atļaut indeksēt (noņemt `noindex`, pievienot sitemap).
- Pārbaudīt /index.html → / un www → bez www, Google Search Console un Google Business Profile saites.
- Ar Maiju saskaņot darba laikus un personas datu / foto failu glabāšanas kārtību.

## Sistēmas struktūra

- Vieta: `https://printstich.lv` → Cloudflare Pages, GitHub `davisl24/PRINTSTICH`.
- Pasūtījumi: `/api/orders/submit` (kontakti, apģērbi, Basketball); `/api/photo-orders/submit` (fotogrāfijas).
- Publiskā konfigurācija: `/api/order-config` rāda tikai ieslēgšanas statusu un **publisko** Turnstile sitekey.
- Resend sūta **no** `pasutijumi@printstich.lv` **uz** `printstich@inbox.lv`. `pasutijumi@` nav pastkastīte. Ja klients norāda e-pastu, ziņai tiek iestatīts Reply-To.
- Nekādu R2 vai datubāzi V1 neveidojam. Lieliem foto pasūtījumiem izmantojam privātu Failiem.lv albuma lejupielādes saiti.
