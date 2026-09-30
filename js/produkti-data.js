(() => {
  'use strict';

  const bodyPrintArea = {
    XS: { w: 297, h: 420 },
    S: { w: 297, h: 420 },
    M: { w: 297, h: 420 },
    L: { w: 297, h: 420 },
    XL: { w: 297, h: 420 },
    XXL: { w: 297, h: 420 },
    '2XL': { w: 297, h: 420 },
    '3XL': { w: 297, h: 420 },
    '4XL': { w: 297, h: 420 },
    '5XL': { w: 297, h: 420 }
  };

  const sleevePrintArea = {
    XS: { w: 100, h: 100 },
    S: { w: 100, h: 100 },
    M: { w: 100, h: 100 },
    L: { w: 100, h: 100 },
    XL: { w: 100, h: 100 },
    XXL: { w: 100, h: 100 },
    '2XL': { w: 100, h: 100 },
    '3XL': { w: 100, h: 100 },
    '4XL': { w: 100, h: 100 },
    '5XL': { w: 100, h: 100 }
  };


  // Printify reference sizes supplied by the client for the hoodie.
  // Pixel templates are 300 DPI, so the mm values below are derived directly
  // from those exact template dimensions.
  const hoodiePrintAreaPx = {
    prieksa: { w: 4016, h: 3307 },
    aizmugure: { w: 4500, h: 5100 },
    sleeveLeft: { w: 1181, h: 4134 },
    sleeveRight: { w: 1181, h: 4134 }
  };

  const hoodiePrintAreaMm = {
    prieksa: { w: 340.0, h: 280.0 },
    aizmugure: { w: 381.0, h: 431.8 },
    sleeveLeft: { w: 100.0, h: 350.0 },
    sleeveRight: { w: 100.0, h: 350.0 }
  };

  const hoodiePrintAreaBySize = Object.fromEntries(
    Object.entries(hoodiePrintAreaMm).map(([side, area]) => [
      side,
      Object.fromEntries(
        ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'].map(size => [size, { ...area }])
      )
    ])
  );


  // Printify reference sizes supplied for the crewneck sweatshirt.
  // Front and back: 4500 × 5100 px @ 300 DPI.
  // Sleeves: 1181 × 4134 px @ 300 DPI.
  const sweatshirtPrintAreaPx = {
    prieksa: { w: 4500, h: 5100 },
    aizmugure: { w: 4500, h: 5100 },
    sleeveLeft: { w: 1181, h: 4134 },
    sleeveRight: { w: 1181, h: 4134 }
  };

  const sweatshirtPrintAreaMm = {
    prieksa: { w: 381.0, h: 431.8 },
    aizmugure: { w: 381.0, h: 431.8 },
    sleeveLeft: { w: 100.0, h: 350.0 },
    sleeveRight: { w: 100.0, h: 350.0 }
  };

  const sweatshirtPrintAreaBySize = Object.fromEntries(
    Object.entries(sweatshirtPrintAreaMm).map(([side, area]) => [
      side,
      Object.fromEntries(
        ['S', 'M', 'L', 'XL', '2XL', '3XL'].map(size => [size, { ...area }])
      )
    ])
  );

  const commonGarmentColors = {
    '00': { id: '00', nosaukums: 'Balta · 00', hex: '#FFFFFF', malfini: '00' },
    '01': { id: '01', nosaukums: 'Melna · 01', hex: '#0A0A0C', malfini: '01' },
    '02': { id: '02', nosaukums: 'Tumši zila · 02', hex: '#1B2D3C', malfini: '02' },
    '04': { id: '04', nosaukums: 'Dzeltena · 04', hex: '#F5C519', malfini: '04' },
    '05': { id: '05', nosaukums: 'Karaliski zila · 05', hex: '#1B4992', malfini: '05' },
    '06': { id: '06', nosaukums: 'Pudeļu zaļa · 06', hex: '#23512F', malfini: '06' },
    '07': { id: '07', nosaukums: 'Sarkana · 07', hex: '#B31F24', malfini: '07' },
    '12': { id: '12', nosaukums: 'Tumši pelēka melange · 12', hex: '#8B8F90', malfini: '12' },
    '16': { id: '16', nosaukums: 'Zaļa · 16', hex: '#018C52', malfini: '16' },
    '21': { id: '21', nosaukums: 'Bēša · 21', hex: '#E8D8C0', malfini: '21' },
    '36': { id: '36', nosaukums: 'Tērauda pelēka · 36', hex: '#4F4D4E', malfini: '36' },
    '44': { id: '44', nosaukums: 'Tirkīza zila · 44', hex: '#01A2C8', malfini: '44' },
    '67': { id: '67', nosaukums: 'Tumši haki · 67', hex: '#555C55', malfini: '67' },
    '69': { id: '69', nosaukums: 'Armijas zaļa · 69', hex: '#304837', malfini: '69' },
    '86': { id: '86', nosaukums: 'Bordo · 86', hex: '#610B2F', malfini: '86' },
    '87': { id: '87', nosaukums: 'Pusnakts zila · 87', hex: '#1C365B', malfini: '87' }
  };

  const colorsFor = codes => codes.map(code => ({ ...commonGarmentColors[code] }));

  const commonSides = {
    prieksa: 'Priekšpuse',
    aizmugure: 'Aizmugure',
    sleeveLeft: 'Kreisā piedurkne',
    sleeveRight: 'Labā piedurkne'
  };

  const commonZones = {
    prieksa: { x: 0.350, y: 0.343, w: 0.300, h: 0.343 },
    aizmugure: { x: 0.333, y: 0.307, w: 0.333, h: 0.407 },
    sleeveLeft: { x: 0.358, y: 0.471, w: 0.283, h: 0.243 },
    sleeveRight: { x: 0.358, y: 0.471, w: 0.283, h: 0.243 }
  };

  const commonPrintAreas = {
    prieksa: bodyPrintArea,
    aizmugure: bodyPrintArea,
    sleeveLeft: sleevePrintArea,
    sleeveRight: sleevePrintArea
  };

  window.PRINTSTICH_PRODUCTS = {
    tshirt: {
      id: 'tshirt',
      modelis: 'Heavy New 137',
      nosaukums: 'T-krekls',
      kategorija: 'T-krekls',
      auditorija: 'Unisex',
      razotajs: 'MALFINI',
      apraksts: 'Unisex T-krekls no Single Jersey auduma ar cauruļveida piegriezumu, šauru 1:1 rievotu kakla apdari ar elastānu, plecu lenti un silikona apdari.',
      materials: '100% kokvilna',
      gramaza: '200 g/m²',
      kopsana: '40 °C',
      avots: 'https://shop.malfini.com/cz/en/product/heavy-new-137?color=51',
      svg: 'assets/krekls.svg',
      sleeveSvgs: {
        sleeveLeft: 'assets/piedurkne-laba.svg',
        sleeveRight: 'assets/piedurkne-laba.svg'
      },
      krasas: colorsFor(['00', '01', '02', '04', '05', '06', '07', '12', '16', '36', '44', '67', '87']),
      materialOverrides: {
        '12': '85% kokvilna, 15% viskoze'
      },
      careOverrides: {
        '12': '30 °C'
      },
      izmeri: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
      izmeruKopsavilkums: 'XS–5XL',
      puses: commonSides,
      drukasZona: commonZones,
      drukasLaukumsMm: commonPrintAreas,
      maxDrukaMm: { w: 297, h: 420 }
    },


    kids: {
      id: 'kids',
      modelis: 'Basic 138',
      nosaukums: 'Bērnu T-krekls',
      kategorija: 'Bērnu T-krekls',
      auditorija: 'Bērniem',
      razotajs: 'MALFINI',
      apraksts: 'Bērnu T-krekls no Single Jersey auduma ar sānu šuvēm, šauru 1:1 rievotu kakla apdari ar elastānu, nostiprinātām plecu šuvēm un silikona apdari.',
      materials: '100% kokvilna',
      gramaza: '160 g/m²',
      kopsana: '40 °C',
      avots: 'https://shop.malfini.com/lv/en/product/basic-138',
      svg: 'assets/krekls.svg',
      sleeveSvgs: {
        sleeveLeft: 'assets/piedurkne-laba.svg',
        sleeveRight: 'assets/piedurkne-laba.svg'
      },
      krasas: colorsFor(['00', '01', '02', '04', '05', '06', '07', '12', '16', '36', '44', '67', '87']),
      materialOverrides: {
        '12': '85% kokvilna, 15% viskoze'
      },
      careOverrides: {
        '12': '30 °C'
      },
      izmeri: ['110 cm / 4 g.', '122 cm / 6 g.', '134 cm / 8 g.', '146 cm / 10 g.', '158 cm / 12 g.'],
      izmeruKopsavilkums: '110–158 cm / 4–12 g.',
      puses: commonSides,
      drukasZona: commonZones,
      // Fiziskie drukas mm bērnu modelim vēl nav klienta apstiprināti.
      // SVG redaktors strādā, bet mm aprēķinu neizdomājam līdz saņemam precīzu drukas laukumu.
      drukasLaukumsMm: {
        prieksa: {},
        aizmugure: {},
        sleeveLeft: {},
        sleeveRight: {}
      },
      maxDrukaMm: { w: 297, h: 420 }
    },

    hoodie: {
      id: 'hoodie',
      modelis: 'Cape 413',
      nosaukums: 'Hūdijs',
      kategorija: 'Hūdijs',
      auditorija: 'Vīriešu',
      razotajs: 'MALFINI',
      apraksts: 'Vīriešu hūdijs ar taisnu piegriezumu un sānu šuvēm, oderētu savelkamu kapuci, ķengura kabatu un mīksti uzkārstu iekšpusi. Apakšmala un aproces ir no 2:2 rievota adījuma ar elastānu.',
      materials: '65% kokvilna, 35% poliesters',
      gramaza: '320 g/m²',
      kopsana: '40 °C',
      avots: 'https://shop.malfini.com/cz/en/product/cape-413?color=00',
      svg: 'assets/hudijs-prieksa.svg',
      viewSvgs: {
        front: 'assets/hudijs-prieksa.svg',
        back: 'assets/hudijs-aizmugure.svg',
        sleeveLeft: 'assets/hudijs-piedurkne.svg',
        sleeveRight: 'assets/hudijs-piedurkne.svg'
      },
      sleeveSvgs: {
        sleeveLeft: 'assets/hudijs-piedurkne.svg',
        sleeveRight: 'assets/hudijs-piedurkne.svg'
      },
      krasas: colorsFor(['00', '01', '02', '04', '05', '06', '07', '12', '16', '36', '44', '67', '87']),
      materialOverrides: {
        '12': '85% kokvilna, 15% viskoze'
      },
      izmeri: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
      izmeruKopsavilkums: 'S–5XL',
      puses: commonSides,
      drukasZona: {
        // Hoodie-specific placement matched to the approved references:
        // front = wider chest area, back = taller center area,
        // sleeves = narrow vertical print area.
        prieksa: { x: 0.350, y: 0.355, w: 0.300, h: 0.200 },
        aizmugure: { x: 0.330, y: 0.325, w: 0.340, h: 0.386 },
        sleeveLeft: { x: 0.4275, y: 0.245, w: 0.145, h: 0.508 },
        sleeveRight: { x: 0.4275, y: 0.245, w: 0.145, h: 0.508 }
      },
      drukasLaukumsPx: hoodiePrintAreaPx,
      drukasLaukumsMm: hoodiePrintAreaBySize,
      maxDrukaMm: {
        prieksa: hoodiePrintAreaMm.prieksa,
        aizmugure: hoodiePrintAreaMm.aizmugure,
        sleeveLeft: hoodiePrintAreaMm.sleeveLeft,
        sleeveRight: hoodiePrintAreaMm.sleeveRight
      }
    },

    sweatshirt: {
      id: 'sweatshirt',
      modelis: 'Crew 426',
      nosaukums: 'Džemperis',
      kategorija: 'Džemperis',
      auditorija: 'Unisex',
      razotajs: 'MALFINI',
      apraksts: 'Unisex džemperis bez kapuces ar taisnu piegriezumu un sānu šuvēm, pazeminātu plecu līniju un mīksti uzkārstu iekšpusi. Bez zīmola etiķetes, ar neitrālu izmēra marķējumu kakla daļā.',
      materials: '60% kokvilna, 40% poliesters',
      gramaza: '280 g/m²',
      kopsana: '40 °C',
      avots: 'https://shop.malfini.com/cz/en/product/crew-426?color=21',
      svg: 'assets/dzemperis-prieksa.svg',
      viewSvgs: {
        front: 'assets/dzemperis-prieksa.svg',
        back: 'assets/dzemperis-aizmugure.svg',
        sleeveLeft: 'assets/dzemperis-piedurkne.svg',
        sleeveRight: 'assets/dzemperis-piedurkne.svg'
      },
      sleeveSvgs: {
        sleeveLeft: 'assets/dzemperis-piedurkne.svg',
        sleeveRight: 'assets/dzemperis-piedurkne.svg'
      },
      krasas: colorsFor(['00', '01', '02', '04', '05', '06', '07', '12', '16', '21', '69', '86', '87']),
      materialOverrides: {
        '12': '75% kokvilna, 25% poliesters'
      },
      izmeri: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
      izmeruKopsavilkums: 'S–3XL',
      puses: commonSides,
      drukasZona: {
        // Matched to the Printify Gildan 18000 references supplied by the client.
        // Body print areas preserve the exact 4500:5100 template aspect ratio.
        // Sleeve print areas preserve the exact 1181:4134 template aspect ratio.
        prieksa: { x: 0.340, y: 0.315, w: 0.320, h: 0.3627 },
        aizmugure: { x: 0.340, y: 0.300, w: 0.320, h: 0.3627 },
        sleeveLeft: { x: 0.4275, y: 0.245, w: 0.145, h: 0.5075 },
        sleeveRight: { x: 0.4275, y: 0.245, w: 0.145, h: 0.5075 }
      },
      drukasLaukumsPx: sweatshirtPrintAreaPx,
      drukasLaukumsMm: sweatshirtPrintAreaBySize,
      maxDrukaMm: {
        prieksa: sweatshirtPrintAreaMm.prieksa,
        aizmugure: sweatshirtPrintAreaMm.aizmugure,
        sleeveLeft: sweatshirtPrintAreaMm.sleeveLeft,
        sleeveRight: sweatshirtPrintAreaMm.sleeveRight
      }
    }
  };
})();
