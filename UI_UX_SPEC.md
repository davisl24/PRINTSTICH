# PrintStich — UI/UX Specification

> Status: **B — Moderns / premium** virziens apstiprināts.
>
> Šis dokuments ir vienīgais vizuālās sistēmas avots turpmākajai implementācijai.

---

## 1. Dizaina mērķis

PrintStich mājaslapai jāizskatās pēc modernas dizaina/drukas studijas, nevis tradicionālas tipogrāfijas kataloga.

Galvenā sajūta:
- kvalitatīvs;
- radošs;
- tīrs;
- profesionāls;
- cilvēcīgs;
- premium, bet ne elitārs.

Galvenais pārdošanas princips:

> **Vispirms parādi darba kvalitāti, tad paskaidro procesu, tad ved uz “Saņemt piedāvājumu”.**

Stock attēli netiek izmantoti. Galvenais vizuālais saturs ir reāli PrintStich darbi.

---

## 2. Lapas struktūra

### 2.1 Header

Desktop:
- kreisajā pusē PrintStich logo;
- centrā vai labajā pusē enkuri: `Darbi`, `Pakalpojumi`, `Kā tas notiek`, `Kontakti`;
- primārā CTA poga: `Saņemt piedāvājumu`.

Mobile:
- logo;
- hamburger menu;
- CTA redzams izvēlnē.

Header sākumā var būt caurspīdīgs virs hero un pēc scroll pāriet uz viegli necaurspīdīgu fonu ar blur.

---

### 2.2 Hero

Mērķis: 3–5 sekundēs saprast, ka PrintStich palīdz no idejas nonākt līdz kvalitatīvam gatavam drukas risinājumam.

Saturs:
- mazs eyebrow teksts, piemēram, `Digitālā druka un dizains · Limbaži`;
- viens spēcīgs H1;
- īss 1–2 teikumu paskaidrojums;
- primārā CTA: `Saņemt piedāvājumu`;
- sekundārā CTA: `Apskatīt darbus`;
- dominējošs reāla PrintStich darba attēls vai rūpīgi atlasīta darbu kompozīcija.

Hero nedrīkst būt pārbāzts ar kartēm, ikonām vai gariem aprakstiem.

---

### 2.3 Darbi / portfolio preview

Šī ir viena no svarīgākajām konversijas sekcijām.

Mērķis:
- uzreiz pierādīt kvalitāti;
- palīdzēt klientam ieraudzīt potenciālo rezultātu;
- radīt uzticību bez gariem tekstiem.

Desktop:
- 2–3 kolonnu editorial grid;
- dažādi attēlu izmēri atļauti;
- attēls ir dominējošais elements.

Mobile:
- viena kolonna;
- lielas kartes ar minimālu tekstu.

Portfolio kartes saturs:
- attēls;
- īss nosaukums/kategorija tikai tad, ja ir zināms;
- nekādas izdomātas produktu specifikācijas.

Hover:
- attēls ļoti viegli scale `1.02`;
- tumšs overlay tikai tad, ja vajadzīgs tekstam;
- animācija 250–350ms.

---

### 2.4 Pakalpojumu virzieni

Mērķis nav veidot milzīgu pakalpojumu katalogu.

Kamēr nav pilnībā apstiprināts produktu saraksts, sekcija tiek veidota kā 3–4 plašas kategorijas bez specifisku tehnoloģiju vai produktu izdomāšanas.

Katras kartes struktūra:
- nosaukums;
- viena īsa rindkopa;
- saite/CTA `Jautāt par iespēju` vai `Saņemt piedāvājumu`.

Dizains:
- minimālas border kartes;
- daudz whitespace;
- bez liekām ikonām, ja tās neko neizskaidro.

---

### 2.5 “No idejas līdz gatavam darbam”

3 soļu process:

1. **Pastāsti, ko vēlies**
2. **Saskaņojam dizainu un risinājumu**
3. **Saņem gatavu rezultātu**

Šī sekcija samazina neskaidrību klientam, kurš pats nezina drukas tehniskās nianses.

Vizuāli:
- horizontāls process desktop;
- vertikāls process mobile;
- vienkārša numerācija `01 / 02 / 03`;
- bez sarežģītas ilustrāciju sistēmas.

---

### 2.6 Uzticības bloks / atsauksmes

Sākotnēji neizdomājam vairāk atsauksmju nekā publiski pieejams.

Var izmantot esošo Google atsauksmi kā vienu lielu editorial quote bloku.

Sekundāri var rādīt:
- `5.0 Google` tikai tad, ja dati tiek pārbaudīti pirms publicēšanas;
- lokāciju `Limbaži`;
- saites uz Instagram/Facebook.

---

### 2.7 CTA sekcija

Spēcīgs noslēdzošais bloks pirms footer.

Virsraksta doma:

> Ir ideja? Izrunāsim, kā to realizēt.

Primārā poga:

> **Saņemt piedāvājumu**

Papildu teksts:
- cena tiek sagatavota individuāli;
- nav jāpublicē fiksēts cenrādis.

---

### 2.8 Kontakti / footer

Jāparāda:
- PrintStich;
- Cēsu iela 20, Limbaži;
- +371 27 333 112;
- Instagram;
- Facebook;
- CTA `Saņemt piedāvājumu`.

Footer vizuāli vienkāršs un kompakts.

---

## 3. Krāsu sistēma

Precīza brand krāsa jāpielāgo faktiskajam PrintStich logo un sociālo tīklu vizuālajam materiālam. Kamēr tā nav droši noteikta, izmanto neitrālu premium bāzi.

```css
--color-bg: #F7F6F2;
--color-surface: #FFFFFF;
--color-text: #171717;
--color-text-muted: #66635E;
--color-border: #DEDCD5;
--color-accent: TBD;
--color-accent-hover: TBD;
```

Noteikumi:
- fons nav auksti balts visā lapā;
- accent krāsu lieto taupīgi;
- melnais teksts nav `#000`, lai rezultāts būtu mīkstāks;
- ne vairāk par vienu galveno accent krāsu.

---

## 4. Tipogrāfija

Virziens: moderna grotesk sans-serif tipogrāfija ar ļoti labu salasāmību.

Prioritāte hostinga vienkāršībai:
- `Inter`, `Manrope` vai līdzvērtīgs Google Font;
- ja nevēlamies ārēju fontu pieprasījumu, izmantot modernu system stack.

Rekomendācija: **Manrope** virsrakstiem un body, izmantojot svarus 400 / 500 / 600 / 700.

```css
--font-heading: 'Manrope', Arial, sans-serif;
--font-body: 'Manrope', Arial, sans-serif;
```

Fluid scale:

```css
H1: clamp(2.8rem, 7vw, 6.2rem)
H2: clamp(2rem, 4.5vw, 4rem)
H3: clamp(1.3rem, 2vw, 1.8rem)
Body-lg: clamp(1.05rem, 1.4vw, 1.25rem)
Body: 1rem
Small: 0.875rem
```

Virsraksti:
- īsi;
- liels line-height kontrasts;
- izvairīties no 3+ rindu H1 desktop versijā.

---

## 5. Spacing sistēma

```css
--space-xs: 0.5rem;
--space-sm: 1rem;
--space-md: 1.5rem;
--space-lg: 2.5rem;
--space-xl: 4rem;
--space-2xl: 6rem;
--space-3xl: 9rem;
```

Sekciju vertikālais spacing:
- mobile: 72–96px;
- tablet: 96–120px;
- desktop: 120–160px.

Mērķis: daudz whitespace, bet ne tukšuma sajūta.

---

## 6. Grid un konteineri

Standarta saturs:

```css
max-width: 1200px;
margin-inline: auto;
padding-inline: clamp(20px, 4vw, 48px);
```

Hero / portfolio vizuālajiem blokiem atļauts līdz `1440px`.

Desktop grid:
- 12 columns konceptuāli;
- praktiski izmantot CSS Grid ar 2–3 kolonnām atkarībā no sekcijas.

Breakpointi:
- Mobile: `<768px`
- Tablet: `768px–1024px`
- Desktop: `>1024px`

---

## 7. Pogas

### Primary

- tumšs vai brand accent fons;
- kontrastējošs teksts;
- `border-radius: 999px` vai 12–16px atkarībā no gala logo stila;
- augstums vismaz 48px;
- horizontāls padding 22–28px.

Hover:
- neliela fona/tone maiņa;
- translateY max `-1px`;
- nekāda agresīva bounce animācija.

### Secondary

- transparent;
- 1px border;
- tāds pats augstums kā primary.

Galvenā CTA terminoloģija visā vietnē:

> **Saņemt piedāvājumu**

Nelietot vienlaikus `Pasūtīt`, `Pirkt`, `Rezervēt`, ja vien process nav mainīts.

---

## 8. Formas UX

Sākotnējā pieprasījuma forma nedrīkst būt gara.

Ieteicamie lauki:
- Vārds;
- Telefons vai e-pasts;
- Ko vēlies izgatavot?;
- Aptuvenais daudzums / papildu informācija;
- fails/pielikums — tikai tad, ja tehniski implementējam korekti.

CTA:

> **Nosūtīt pieprasījumu**

Pēc formas nosūtīšanas:
- skaidrs success state;
- nekāda automātiski izdomāta atbildes laika solījuma.

---

## 9. Attēlu noteikumi

Tikai reāli PrintStich darbi vai paša uzņēmuma materiāli.

Aizliegts:
- stock tipogrāfijas bildes;
- AI ģenerēti “drukas produkti”, kas rada nepatiesu priekšstatu par PrintStich portfolio;
- attēli ar nezināmu izcelsmi.

Apstrāde:
- dabiska;
- pareizs white balance;
- vienota ekspozīcija;
- neizmainīt pašu produktu krāsas tā, ka tas vairs neatbilst realitātei.

Aspect ratios:
- hero: 4:5, 3:4 vai 16:10 atkarībā no izvēlētā layout;
- portfolio: miksēt 4:5, 1:1 un 3:2 editorial režģī;
- mobile prioritizēt 4:5.

---

## 10. Animācijas

Motion ir funkcionāls, ne dekoratīvs.

Atļauts:
- fade + translateY sekciju ieejai;
- 20–30px max kustība;
- 450–700ms duration;
- stagger tikai nelielām elementu grupām;
- portfolio hover scale `1.02`;
- header blur pēc scroll.

Aizliegts:
- scroll hijacking;
- pārāk lēnas animācijas;
- elementi, kas kustas bez lietotāja darbības un novērš uzmanību;
- parallax, ja tas neko nepaskaidro;
- splash/loading intro.

Ievērot `prefers-reduced-motion`.

---

## 11. Responsive principi

Mobile nav desktop lapas samazināta kopija.

Mobile prioritātes:
1. H1 un galvenā vērtība;
2. viens spēcīgs hero attēls;
3. CTA;
4. portfolio;
5. process;
6. pakalpojumi;
7. uzticība;
8. kontakti.

Mobile:
- CTA pogas var kļūt full-width;
- kartes viena kolonna;
- izvairīties no maziem 3-column grid;
- minimum touch target 44px.

---

## 12. Pieejamība

- WCAG AA kontrasts tekstiem un pogām;
- visible keyboard focus;
- alt teksts reālajiem portfolio attēliem;
- semantiski `header`, `main`, `section`, `footer`;
- viena loģiska H1 struktūra;
- formas lauki ar `label`;
- pogām aprakstošs teksts.

---

## 13. Vizuālās struktūras varianti pirms implementācijas

B virziena ietvaros ir trīs iespējami hero/portfolio layouti.

### B1 — Editorial Split — **rekomendētais**

Hero:
- kreisajā pusē teksts;
- labajā pusē viens spēcīgs vertikāls darba attēls;
- zem hero uzreiz asymmetrical portfolio grid.

**Plusi:** skaidrs, premium, viegli uztverams, labs mobilais variants.

**Mīnuss:** vajadzīgs vismaz viens ļoti labs galvenais attēls.

### B2 — Full-bleed Visual

Hero:
- gandrīz pilnekrāna darba foto;
- teksts virs attēla vai apakšējā blokā;
- ļoti minimāla navigācija.

**Plusi:** maksimāli vizuāls un iespaidīgs.

**Mīnuss:** vājš vai nekvalitatīvs hero foto uzreiz sabojā visu lapu; tekstu salasāmība sarežģītāka.

### B3 — Modular Studio

Hero:
- teksts + 2–3 darbu mozaīka;
- nākamajās sekcijās modulāras kartes.

**Plusi:** uzreiz var parādīt vairāk darba veidu.

**Mīnuss:** vieglāk pārbāzt lapu un pazaudēt premium sajūtu.

---

## Rekomendācija pirms implementācijas

**B1 — Editorial Split.**

Tas vislabāk līdzsvaro konversiju, vizuālo kvalitāti un praktisku implementāciju. Ja PrintStich dod ļoti spēcīgu horizontālu vai pilnekrāna foto, var pāriet uz B2, nemainot pārējo dizaina sistēmu.

---

## 14. Implementācijas robeža

HTML/CSS/JS implementācija sākas tikai pēc tam, kad ir apstiprināts viens no šiem variantiem:

- `B1 — Editorial Split`
- `B2 — Full-bleed Visual`
- `B3 — Modular Studio`

Pēc izvēles nākamais posms ir `SITEMAP_SEO.md`, un tikai pēc tā — failu manifests un koda izstrāde.
