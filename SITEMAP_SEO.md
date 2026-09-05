# PrintStich — Sitemap & SEO

## Apstiprinātais virziens

- Vizuālais virziens: **B — Moderns / Premium**
- Hero/layout virziens: **B1 — Editorial Split**
- Primārais CTA: **Saņemt piedāvājumu**
- Cenu politika: individuāla, cena pēc pieprasījuma
- Galvenais vizuālais saturs: reāli PrintStich darbi, nevis stock attēli

---

# 1. Sitemap

Sākuma versijā vietni veidojam kā kompaktu, pārdošanai orientētu vienas lapas struktūru ar skaidriem enkuriem.

## `/index.html`

Sekcijas:
1. Header / navigācija
2. Hero — Editorial Split
3. Darbi / portfolio preview
4. Kā mēs palīdzam
5. Process — no idejas līdz gatavam rezultātam
6. Uzticības bloks / atsauksme
7. CTA — Saņemt piedāvājumu
8. Kontakti
9. Footer

### Enkuri
- `#darbi`
- `#process`
- `#kontakti`
- `#piedavajums`

Atsevišķas pakalpojumu lapas sākumā neveidojam, jo konkrēts pakalpojumu katalogs vēl nav pilnībā apstiprināts.

---

# 2. Homepage SEO

## URL

`/`

## Title

`PrintStich | Digitālā druka un dizains Limbažos`

Mērķis: skaidri nosaukt zīmolu, galveno pakalpojuma kategoriju un lokāciju.

## Meta description

`Digitālās drukas un dizaina risinājumi Limbažos. Palīdzam no idejas un dizaina līdz kvalitatīvam gala rezultātam. Saņem individuālu piedāvājumu.`

## H1

`No idejas līdz kvalitatīvam drukas rezultātam.`

Alternatīva, ja vēlāk vajag tiešāku lokālo SEO:

`Digitālā druka un dizaina risinājumi Limbažos.`

Pašlaik rekomendēts pirmais variants, jo tas ir stiprāks zīmola pozicionējumam.

## Hero supporting copy

Īss teksts, kas paskaidro, ka PrintStich palīdz ne tikai ar izgatavošanu, bet arī ar dizainu un piemērotākā risinājuma izvēli.

Konkrētu produktu nosaukumus neievietojam, kamēr tie nav apstiprināti.

## Primary CTA

`Saņemt piedāvājumu`

Darbība: aizved uz `#piedavajums` vai atver pieprasījuma formu.

## Secondary CTA

`Apskatīt darbus`

Darbība: scroll uz `#darbi`.

---

# 3. Section intent

## Hero

Mērķis: 5–8 sekunžu laikā paskaidrot:
- kas ir PrintStich;
- ka viņi palīdz no idejas līdz gatavam rezultātam;
- kur sākt pasūtījumu.

B1 struktūra desktop:
- kreisā puse — eyebrow / H1 / īss teksts / CTA;
- labā puse — viens spēcīgs reāla PrintStich darba attēls;
- daudz whitespace, bez liekiem dekoratīviem elementiem.

Mobile:
- teksts vispirms;
- attēls zem CTA;
- CTA redzams bez liekas scroll slodzes.

## Darbi

Mērķis: pierādīt kvalitāti vizuāli.

Saturs:
- reālas PrintStich bildes;
- nav izdomātu projektu nosaukumu;
- sākumā pietiek ar 4–8 kvalitatīviem darbiem.

Ja darbu kategorijas nav apstiprinātas, kategoriju filtrus neveidojam.

## Kā mēs palīdzam

Mērķis: parādīt galveno vērtību bez neapstiprināta pakalpojumu kataloga.

Drošie vēstījumi:
- palīdzība ar dizainu;
- palīdzība ar risinājuma izvēli;
- digitālā druka;
- individuāla pieeja pasūtījumam.

## Process

Rekomendētais 3 soļu modelis:
1. Pastāsti savu ideju
2. Saskaņojam risinājumu
3. Saņem gatavu rezultātu

Neapgalvojam konkrētus izgatavošanas termiņus.

## Uzticība

Izmantojam publiski pieejamo klienta atsauksmi tikai tādā apjomā, kādu ir droši un nepieciešami citēt vai pārfrāzēt.

Galvenais vēstījums: kvalitāte + palīdzība ar dizainu un risinājumu.

## CTA / piedāvājums

Galvenais teksts:

`Pastāsti, ko vēlies izveidot — sagatavosim individuālu piedāvājumu.`

CTA:

`Saņemt piedāvājumu`

Nav cenu kalkulatora un nav fiksētu cenu tabulas.

## Kontakti

Apstiprinātie dati:
- PrintStich
- Cēsu iela 20, Limbaži, LV-4001
- +371 27 333 112
- Instagram
- Facebook

E-pastu neizdomājam. Ja tas nav zināms, kontaktformu var izmantot kā galveno digitālo kontaktkanālu.

---

# 4. Open Graph

## `og:title`

`PrintStich — digitālā druka un dizains Limbažos`

## `og:description`

`No idejas un dizaina līdz kvalitatīvam drukas rezultātam. Saņem individuālu piedāvājumu.`

## `og:type`

`website`

## `og:image`

`TRŪKST`

Pirms publicēšanas jāizvēlas viens horizontāls, augstas kvalitātes reāla PrintStich darba attēls.

Rekomendētais izmērs: 1200 × 630 px.

---

# 5. Static HTML vs dynamic content

SEO kritiskais saturs paliek tieši HTML:
- `<title>`;
- meta description;
- H1;
- galvenie H2;
- galvenais uzņēmuma apraksts;
- kontakti;
- CTA teksts.

Nedrīkst paļauties uz JavaScript, lai renderētu svarīgāko SEO tekstu.

## `js/content.js`

Dinamiskām UI virknēm un nākotnes LV/EN atbalstam izmantojam:

```js
const CONTENT = {
  lv: {
    ctaPrimary: 'Saņemt piedāvājumu',
    ctaSecondary: 'Apskatīt darbus'
  }
};

let LANG = 'lv';
```

Sākumā vietne ir latviski. Angļu valodu neimplementējam, kamēr nav reālas biznesa vajadzības.

---

# 6. Portfolio data

Atsevišķs `data/portfolio.js` vai JSON fails tiek veidots tikai tad, kad ir saņemti:
- reālo darbu attēli;
- droši darbu nosaukumi/apraksti;
- vajadzības gadījumā kategorijas.

Kamēr šī informācija nav pieejama, portfolio nedrīkst piepildīt ar izdomātiem projektiem.

---

# 7. Blog

Sākuma versijā blogs netiek veidots.

Iemesls: pašreizējais galvenais biznesa uzdevums ir pieprasījumu iegūšana, portfolio un uzticības radīšana, nevis satura ražošana.

Blogu var pievienot vēlāk, ja parādās SEO stratēģija un regulārs saturs.

---

# 8. Formas prasības

Pieprasījuma formai vēlāk jāprasa tikai informācija, kas palīdz sagatavot piedāvājumu.

Rekomendētais minimums:
- Vārds
- Tālrunis vai e-pasts
- Ko vēlies izveidot?
- Aptuvenais daudzums, ja zināms
- Ziņa / papildu informācija

Nevajag garu 10–15 lauku formu.

Pirms SMTP implementācijas jābūt zināmam reālam saņēmēja e-pastam. To neizdomājam.

---

# 9. Tehniskie SEO pamati

Implementācijā jāiekļauj:
- semantic HTML5;
- viena H1 struktūra;
- loģiska H2/H3 hierarhija;
- attēlu `alt` teksti pēc reālā darba satura;
- `loading="lazy"` zem-fold attēliem;
- width/height vai aspect-ratio attēliem, lai mazinātu CLS;
- canonical URL pēc reālā domēna saņemšanas;
- favicon/logo pēc reālo failu saņemšanas;
- robots.txt un sitemap.xml pirms produkcijas publicēšanas.

Domēns pašlaik nav zināms, tāpēc canonical un sitemap absolūtās adreses vēl netiek izdomātas.

---

# 10. Kas vēl trūkst pirms pilnas publicēšanas

- logo fails / brand assets;
- apstiprinātas zīmola krāsas, ja tādas jau eksistē;
- reālie portfolio attēli;
- pilns apstiprināto pakalpojumu saraksts;
- e-pasts formas pieteikumu saņemšanai;
- reālais domēns;
- OG attēls;
- informācija par piegādi/saņemšanu, ja to vēlamies publiski komunicēt.

Šīs lietas neaptur pirmās frontend versijas izveidi, bet tās nedrīkst aizvietot ar izdomātu saturu.
