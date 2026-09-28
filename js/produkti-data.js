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
      apraksts: 'Biezāka auduma unisex T-krekls ar taisnu, cauruļveida piegriezumu, pastiprinātu plecu lenti un silikona apdari. Piemērots personalizētai apdrukai un izšuvumam.',
      materials: 'Single Jersey, 100% kokvilna. Atsevišķām krāsām sastāvs var atšķirties.',
      gramaza: '200 g/m²',
      kopšana: 'Mazgāt līdz 40 °C',
      avots: 'https://shop.malfini.com/cz/en/product/heavy-new-137?color=15',
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
      apraksts: 'Silts hūdijs ar taisnu piegriezumu, oderētu savelkamu kapuci un ķengura kabatu. Iekšpuse ir mīksti uzkārsta, bet aproces un apakšmala veidotas no elastīga rievota adījuma.',
      materials: '65% kokvilna, 35% poliesters',
      gramaza: '320 g/m²',
      kopšana: 'Mazgāt līdz 40 °C',
      avots: 'https://shop.malfini.com/cz/en/product/cape-413?color=44',
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
        prieksa: { x: 0.350, y: 0.330, w: 0.300, h: 0.250 },
        aizmugure: { x: 0.345, y: 0.335, w: 0.310, h: 0.270 },
        sleeveLeft: commonZones.sleeveLeft,
        sleeveRight: commonZones.sleeveRight
      },
      drukasLaukumsMm: commonPrintAreas,
      maxDrukaMm: { w: 297, h: 420 }
    },

    sweatshirt: {
      id: 'sweatshirt',
      modelis: 'Crew 426',
      nosaukums: 'Džemperis',
      kategorija: 'Džemperis',
      auditorija: 'Unisex',
      razotajs: 'MALFINI',
      apraksts: 'Unisex džemperis bez kapuces ar taisnu piegriezumu un mīksti uzkārstu iekšpusi. Neitrāls izmēra marķējums un konstrukcija ir piemērota personalizācijai un zīmola apdrukai.',
      materials: '60% kokvilna, 40% poliesters. Atsevišķām krāsām sastāvs var atšķirties.',
      gramaza: '280 g/m²',
      kopšana: 'Mazgāt līdz 40 °C',
      avots: 'https://shop.malfini.com/cz/en/product/crew-426?color=21',
      krasas: [],
      izmeri: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
      status: 'Sagatavots pieslēgšanai konfiguratoram'
    }
  };
})();
