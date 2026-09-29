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
      materials: '100% kokvilna. Dažām krāsām sastāvs atšķiras (03, 12 un 90).',
      gramaza: '200 g/m²',
      kopsana: 'Mazgāt līdz 40 °C',
      avots: 'https://shop.malfini.com/cz/en/product/heavy-new-137?color=51',
      svg: 'assets/krekls.svg',
      sleeveSvgs: {
        sleeveLeft: 'assets/piedurkne-kreisa.svg',
        sleeveRight: 'assets/piedurkne-laba.svg'
      },
      krasas: [
        { id: 'balts', nosaukums: 'Balta', hex: '#FFFFFF', malfini: '00' },
        { id: 'melns', nosaukums: 'Melna', hex: '#1A1A1A', malfini: '01' },
        { id: 'zils', nosaukums: 'Tumši zila', hex: '#1B2A4A', malfini: '02' }
      ],
      izmeri: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
      piezimeParIzmeriem: 'Konkrētu izmēru pieejamība ir atkarīga no izvēlētās krāsas.',
      puses: commonSides,
      drukasZona: commonZones,
      drukasLaukumsMm: commonPrintAreas,
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
      kopsana: 'Mazgāt līdz 40 °C',
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
      krasas: [
        { id: 'balts', nosaukums: 'Balta', hex: '#FFFFFF' },
        { id: 'melns', nosaukums: 'Melna', hex: '#1A1A1A' },
        { id: 'zils', nosaukums: 'Tumši zila', hex: '#1B2A4A' }
      ],
      izmeri: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
      piezimeParIzmeriem: '4XL un 5XL pieejamība ir atkarīga no izvēlētās krāsas.',
      puses: commonSides,
      drukasZona: {
        // Hoodie-specific placement matched to the approved references:
        // front = wider chest area, back = taller center area,
        // sleeves = narrow vertical print area.
        prieksa: { x: 0.350, y: 0.355, w: 0.300, h: 0.200 },
        aizmugure: { x: 0.325, y: 0.285, w: 0.350, h: 0.400 },
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
      materials: '60% kokvilna, 40% poliesters. Krāsai 12: 75% kokvilna, 25% poliesters.',
      gramaza: '280 g/m²',
      kopsana: 'Mazgāt līdz 40 °C',
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
      krasas: [
        { id: 'balts', nosaukums: 'Balta', hex: '#FFFFFF' },
        { id: 'melns', nosaukums: 'Melna', hex: '#1A1A1A' },
        { id: 'zils', nosaukums: 'Tumši zila', hex: '#1B2A4A' }
      ],
      izmeri: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
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
