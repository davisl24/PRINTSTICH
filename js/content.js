const CONTENT = {
  lv: {
    brand: {
      name: 'PrintStich',
      location: 'Limbaži'
    },
    navigation: {
      works: 'Darbi',
      services: 'Pakalpojumi',
      process: 'Kā tas notiek',
      contacts: 'Kontakti'
    },
    hero: {
      eyebrow: 'Druka un dizains · Limbaži',
      title: 'No idejas līdz kvalitatīvam drukas rezultātam.',
      lead: 'Palīdzam ar dizainu, maketēšanu un apdruku — gan uzņēmumiem, gan privātpersonām.',
      primaryCta: 'Saņemt piedāvājumu',
      secondaryCta: 'Apskatīt darbus'
    },
    works: {
      eyebrow: 'Mūsu darbi',
      title: 'Idejas, kas kļūst taustāmas.',
      intro: 'Dažādi pasūtījumi, viena pieeja — atrast piemērotu risinājumu un kvalitatīvi to realizēt.'
    },
    services: {
      eyebrow: 'Pakalpojumi',
      title: 'Viss, lai ideju sagatavotu drukai.',
      items: [
        {
          title: 'Logo un dizaina izstrāde',
          description: 'Palīdzība vizuālā risinājuma izveidē no idejas līdz gatavam dizainam.'
        },
        {
          title: 'Drukas materiāli',
          description: 'Vizītkartes, plakāti un citi drukas materiāli uzņēmumiem un privātpersonām.'
        },
        {
          title: 'Apģērbu apdruka',
          description: 'Personalizēts apģērbs gan vienam eksemplāram, gan lielākam pasūtījumam.'
        },
        {
          title: 'Maketēšana',
          description: 'Esošās idejas un materiālu sagatavošana skaidram, profesionālam gala rezultātam.'
        }
      ]
    },
    process: {
      eyebrow: 'Kā tas notiek',
      title: 'Vienkārši no pirmās ziņas līdz gatavam darbam.',
      items: [
        {
          title: 'Pastāsti, ko vēlies',
          description: 'Nosūti ideju, piemēru vai apraksti vajadzīgo rezultātu.'
        },
        {
          title: 'Saskaņojam risinājumu',
          description: 'Palīdzam ar dizainu un atrodam konkrētajam pasūtījumam piemērotu variantu.'
        },
        {
          title: 'Saņem gatavu rezultātu',
          description: 'Pēc saskaņošanas ideja pārtop gatavā drukas darbā.'
        }
      ]
    },
    review: {
      quote: 'Ļoti kvalitatīvi un skaisti izgatavo! Palīdzēja gan ar dizainu, gan risinājumiem!',
      source: 'Google klienta atsauksme'
    },
    inquiry: {
      eyebrow: 'Saņemt piedāvājumu',
      title: 'Ir ideja? Izrunāsim, kā to realizēt.',
      description: 'Katrs pasūtījums var būt atšķirīgs, tāpēc cenu sagatavojam individuāli. Apraksti savu ideju un sazināsimies par piemērotāko risinājumu.',
      submit: 'Nosūtīt pieprasījumu'
    },
    contact: {
      phone: '+371 27 333 112',
      phoneHref: 'tel:+37127333112',
      email: 'printstich@inbox.lv',
      emailHref: 'mailto:printstich@inbox.lv',
      address: 'Cēsu iela 20, Limbaži, LV-4001',
      instagram: 'https://www.instagram.com/printstich/',
      facebook: 'https://www.facebook.com/profile.php?id=61590085437483'
    }
  }
};

let LANG = 'lv';

function getContent(path) {
  const keys = path.split('.');
  let value = CONTENT[LANG];

  for (const key of keys) {
    if (value == null || !Object.prototype.hasOwnProperty.call(value, key)) {
      return undefined;
    }
    value = value[key];
  }

  return value;
}

window.CONTENT = CONTENT;
window.LANG = LANG;
window.getContent = getContent;
