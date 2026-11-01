# PrintStich — atlikušais līdz 100% nodošanai

Atjaunots: 2026-10-29
Projekts: `davisl24/PRINTSTICH`
Publiskā testa adrese: https://printstich.vercel.app/
Plānotā gala adrese: `printstich.lv`

## 2026-11-02 — nodošanas tikšanās ar Maiju

**Šobrīd nav uzsākta pilnīga nodošana:** Vercel demo ir gatavs, foto augšupielāde R2 nav integrēta, foto pasūtījumu nosūtīšana ir atspējota; kontaktu un apģērbu formas vēl izmanto FormSubmit uz izstrādātāja Gmail. Tikšanās mērķis ir iegūt piekļuves un apstiprinājumus, nevis apgalvot, ka viss ir palaists.

### Pirms tikšanās — izstrādātājs

- [ ] Pārbaudīt Vercel demo uz telefona un datora; īpaši foto sadaļas 320–390 px platumā, navigāciju un cenas.
- [ ] Saglabāt pilnu GitHub projekta rezerves kopiju; pārbaudīt, ka tajā nav API atslēgu vai privātu lietotāju datu.
- [ ] Sagatavot domēna, Cloudflare, GitHub un Resend kontu izveides darbību secību.
- [ ] Sagatavot klientam izskaidrojumu: kam pieder domēns/kods; kā nonāk pieteikumi; kas maina saturu; kā notiek tehniskā uzturēšana.
- [ ] Pierakstīt piedāvāto izstrādes gala cenu, apmaksas nosacījumus un uzturēšanas pakalpojuma robežas — **nesaukt par jau apstiprinātu**.
- [ ] Sagatavot iespējamo jautājumu sarakstu, bet neuzsākt jaunu dizaina/pakalpojumu pārplānošanu.

### Tikšanās laikā — kopā ar Maiju

- [ ] Apstiprināt precīzu uzņēmuma juridisko nosaukumu, rekvizītus, kontaktus un pasūtījumu saņēmēja e-pastu.
- [ ] Vienoties par izstrādes samaksu, nodošanu, turpmāko uzturēšanu un atsevišķi apmaksājamiem darbiem.
- [ ] Vienoties, vai satura izmaiņas veiks izstrādātājs, vai klientei vēlāk vajadzēs CMS; šo izvēli nepadarīt par nosacījumu palaišanai.
- [ ] Noskaidrot foto pasūtījumu pieņemšanas procesu: apmaksas/priekšapmaksas kārtība; pabeigtā pasūtījuma statuss; drukas failu glabāšanas termiņš un dzēšanas kārtība.
- [ ] Apstiprināt fotodrukas atlaides noteikumu: jaukto izmēru 5% atlaide iespējama, bet nav automātiska; cenas par izmēriem atsevišķi.
- [ ] Vienoties par klienta domēna un ārējo pakalpojumu izmaksu apmaksu.
- [ ] Pārbaudīt `printstich.lv` pieejamību un, ja pieejams, klientei reģistrēt to NIC.lv uz uzņēmuma vārda.
- [ ] Klientei izveidot/pārbaudīt Cloudflare, Resend un GitHub kontus ar viņas kontrolētu e-pastu un 2FA.
- [ ] Piešķirt izstrādātājam vajadzīgās atļaujas ar oficiāliem ielūgumiem, nevis koplietot paroles.
- [ ] Pārrunāt nodošanas secību un to, ka Vercel demo saglabājas līdz pilnīgi pārbaudītai Cloudflare publicēšanai.

### Pēc tikšanās — pirms pilnas palaišanas

- [ ] Nodot vai organizēt repozitorija pārvietošanu klienta GitHub, pārbaudīt Cloudflare Git pieslēgumu.
- [ ] Pabeigt R2 augšupielādi, privātu failu saņemšanu un glabāšanas termiņa pārvaldību.
- [ ] Pabeigt Resend kontaktu, apģērbu un foto pieteikumu nosūtīšanu; veikt īstu testu uz Maijas e-pastu.
- [ ] Tikai pēc sekmīgiem testiem aktivizēt foto pasūtīšanu un noņemt visus demo apzīmējumus.
- [ ] Pieslēgt gala domēnu, mainīt SEO/sitemap/robots/canonical un sakārtot `/index.html` pāradresāciju uz `/`.
- [ ] Reālā domēnā pārbaudīt mobilo/datora versiju, pasūtījumus, pielikumus, privātumu un drošu atkopšanu.
- [ ] Nodot klientam piekļuves, ZIP rezerves kopiju (bez noslēpumiem), īsu instrukciju un rakstisku uzturēšanas vienošanos.

**STOP nosacījums:** mājaslapu nedrīkst saukt par pilnībā nodotu, ja Maija vēl nesaņem īstus pasūtījumus vai nevar saņemt nepieciešamos drukas failus.

---

## Fiksētie dizaina lēmumi (LOCKED)

- [x] Apģērbu konfiguratora esošais vizuālais virziens ir apstiprināts.
- [x] Foto pasūtījumu konfiguratora esošais vizuālais virziens ir apstiprināts.
- [x] Sākumlapas foto pasūtījuma vizuālais bloks ir apstiprināts.
- [x] No sākumlapas foto bloka noņemts `02 / 03`.
- [x] No sākumlapas foto bloka noņemta līnija zem «Fotogrāfiju druka».
- [x] Izmēru cenu grupas aprēķina atsevišķi.
- [x] Jauktu izmēru pasūtījumam Maija var piešķirt 5% atlaidi visai summai, bet tā **nav** automātiska.
- [x] Fotogrāfiju kadrējuma izvēle: iespējamas baltās malas, lai saglabātu visu attēlu, vai laukuma aizpildīšana ar iespējamu apgriešanu.
- [ ] Pārbaudīt apstiprinātā dizaina darbību un izvietojumu **īstā telefonā un datorā**; labot tikai konkrētas kļūdas, neatvērt dizaina pārplānošanu.

## P0 — tehniska pasūtījumu pieņemšana

- [ ] Izveidot klienta Cloudflare kontu un Pages projektu no klientam piederoša GitHub repozitorija.
- [ ] Privātā Cloudflare R2 krātuve: izvēlēties glabāšanas limitus, augšupielādes protokolu, failu validāciju un apjoma monitoringu.
- [ ] Veidot īslaicīgi autorizētu, drošu attēlu augšupielādi R2; atbalstīt vairākas bildes, lielus failus, augšupielādes progresu, kļūdas un atkārtotu mēģinājumu.
- [ ] Saglabāt oriģinālos failus bez neplānotas kompresijas; priekšskatījumi drīkst būt atvasināti.
- [ ] Nodrošināt, ka pasūtījuma apstiprinājumā ir tikai **sekmīgi augšupielādēti** faili un pareizi katras bildes drukas iestatījumi.
- [ ] Nodrošināt drošu Maijas piekļuvi konkrētā pasūtījuma failiem bez publiska R2 bucket un bez nenoteikta termiņa publiskām saitēm.
- [ ] Ieviest failu dzēšanas noteikumus, ņemot vērā pasūtījuma pabeigšanu un saskaņoto glabāšanas termiņu; nepazaudēt failus pirms izdrukas.
- [ ] Failiem.lv/citu saišu rezerves plūsmā pārbaudīt, vai saite ir pieejama un skaidri informēt Maiju.
- [ ] Resend: klienta konts, verificēts domēns, servera API atslēga Cloudflare secrets, pareizs saņēmējs un atbildes adrese.
- [ ] Pabeigt un notestēt Resend integrāciju **visām** PrintStich formām: kontaktu forma, apģērbu konfigurators, foto pasūtījumi.
- [ ] Esošo FormSubmit pārslēgt tikai pēc sekmīga testa ar Maijas saņēmēja adresi.
- [ ] Formu servera validācija, botu aizsardzība, kļūdu apstrāde un dubultas nosūtīšanas novēršana.
- [ ] Foto pasūtījuma klienta kontaktu ievade, privātuma piekrišana un pieteikuma pabeigšana ar īstu apstiprinājumu tikai pēc servera veiksmīgas atbildes.
- [ ] Cenas saskaņot ar Maijas cenrādi; 5% atlaidi negarantēt; nestandarta izmērus un 200+ izdrukas nodot individuālai cenu apstiprināšanai.
- [ ] Pārbaudīt dažādu izmēru pasūtījumu kopējās summas, daudzuma sliekšņus, kopijas, papīra tipu, kadrējumu un kļūdainus ievades datus.

## P0 — konti, domēns un īpašumtiesības

- [ ] Vienoties par nodošanas brīdi, izstrādes samaksu un uzturēšanas robežām.
- [ ] Tikšanās laikā kopā ar Maiju pārbaudīt pieejamību un reģistrēt `printstich.lv` uz PrintStich uzņēmuma vārda.
- [ ] Sagatavot klientam piederošus GitHub, Cloudflare un Resend kontus; divfaktoru autentifikāciju kontrolē klients.
- [ ] Saglabāt klientam piekļuvi GitHub kodam, bet tev — pilnvarotu rediģēšanas piekļuvi.
- [ ] Cloudflare Pages GitHub integrācija, `main` produkcijas zars un atsevišķs priekšskatījums.
- [ ] Domēns + DNS + HTTPS + `www` pāradresācija; pirms DNS maiņas pārbaudīt esošos e-pasta ierakstus.
- [ ] Aizstāt vecās Vercel adreses canonical, OpenGraph, sitemap un formu pāradresācijās; pēc jaunā domēna aktivizēšanas sakārtot vecās adreses indeksēšanu.

## P1 — gala QA, drošība un nodošana

- [ ] Pilns pasūtījuma tests mobilajā un datora pārlūkā: 1 foto, jaukti izmēri, vairākas kopijas, 20 foto, 200+ foto.
- [ ] Testēt attēlu kvalitāti, baltās malas un apgriešanas priekšskatījumu; drukai tiek saglabāti oriģināli.
- [ ] Testēt neatbalstītus formātus, pārāk lielus failus, pārtrauktu internetu un atkārtotu mēģinājumu.
- [ ] Testēt kontaktu formu un apģērbu konfiguratoru ar īstiem pielikumiem; Maija apliecina saņemšanu.
- [ ] Pārskatīt privātuma politiku (foto failu glabāšana, saņēmēji, dzēšana), sīkdatnes un uzņēmuma datus.
- [ ] Pārbaudīt mobilo UX, klaviatūras navigāciju, formu kļūdu ziņas, attēlu alt tekstus un galvenās CTA.
- [ ] Sagatavot koda ZIP rezerves kopiju **bez API atslēgām**, kontu piekļuves un īsu instrukciju klientam.
- [ ] Pierakstīt atbalsta kārtību: kur klients piesaka labojumus, kas ir iekļauts uzturēšanā, kas ir jauns izstrādes darbs.
- [ ] Pēc publicēšanas testēt PrintStich lapu un pasūtījumu reālā domēnā; tikai tad pāriet no testa uz nodošanas statusu.

## P0 — demo marķējumu izņemšana TIKAI pirms reālās palaišanas

**Lēmums apstiprināts 2026-10-29: vizuālais foto konfigurators ir apstiprināts. Šos marķējumus vēl nedzēst, jo pasūtījumi nedarbojas.**

- [ ] `foto-druka.html`: pārrakstīt lapas `<title>`, izņemot vārdu «demo».
- [ ] `foto-druka.html`: izņemt «Izmēģinājuma versija» un «Attēli paliek tavā ierīcē. Pasūtījumi vēl netiek nosūtīti.» bloku **tikai pēc** tam, kad faktiskā augšupielāde darbojas.
- [ ] `foto-druka.html`: noņemt/atjaunināt paskaidrojumu par Failiem.lv saiti demo režīmā.
- [ ] `foto-druka.html`: aktivizēt kontaktu laukus un pogu «Nosūtīt foto pasūtījumu»; izņemt «Demo priekšskatījums» tekstu **tikai pēc** sekmīga end-to-end testa.
- [ ] `foto-druka.html`: izvērtēt «PRIEKŠSKATĪJUMS» kopsavilkumā — tas drīkst palikt tikai kā patiess cenas/priekšskatījuma apzīmējums, nevis nefunkcionālas demonstrācijas marķējums.
- [ ] `pakalpojumi.html`: nomainīt «Izmēģināt foto pasūtīšanu» uz reālu pasūtījuma CTA.
- [ ] `konfigurators.html`: noņemt saites tekstā «demo» un padarīt to par reālu foto pasūtījuma ieejas punktu.
- [ ] Pārbaudīt pārējo lapu tekstus, SEO un pogas, lai publiskajā vietnē nebūtu maldinoša testa/demo statusa.
- [ ] Noņemt `noindex` foto pasūtīšanas lapai, atjaunot sitemap un canonical uz `printstich.lv` **tikai gatavā produkcijas versijā**.

**Pabeigšanas kritērijs:** Maija savā e-pastā saņem drošu, pārbaudītu pasūtījumu, var piekļūt visiem drukai nepieciešamajiem failiem, visas publiskās pogas darbojas, un nekur nav demo marķējumu vai nepatiesu apgalvojumu par pieņemtu pasūtījumu.
