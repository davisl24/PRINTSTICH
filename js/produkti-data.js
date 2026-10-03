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

  const catalogColorMeta = {
    '03': { nosaukums: 'Pelēka melange', hex: '#D2D0CD', grupa: 'Neitrālās' },
    '08': { nosaukums: 'Smilšu', hex: '#C7B28D', grupa: 'Neitrālās' },
    '09': { nosaukums: 'Haki', hex: '#77735B', grupa: 'Zaļās' },
    '11': { nosaukums: 'Oranža', hex: '#E87522', grupa: 'Siltās' },
    '13': { nosaukums: 'Koraļļu', hex: '#D95D53', grupa: 'Siltās' },
    '14': { nosaukums: 'Debeszila', hex: '#54A7D8', grupa: 'Zilās' },
    '15': { nosaukums: 'Gaiši zila', hex: '#8CC9E8', grupa: 'Zilās' },
    '19': { nosaukums: 'Smaragda', hex: '#16805F', grupa: 'Zaļās' },
    '21': { nosaukums: 'Bēša', hex: '#E8D8C0', grupa: 'Neitrālās' },
    '23': { nosaukums: 'Marlboro sarkana', hex: '#B9342D', grupa: 'Siltās' },
    '27': { nosaukums: 'Violeta', hex: '#685183', grupa: 'Rozā / violetās' },
    '28': { nosaukums: 'Tumši haki', hex: '#5C5A44', grupa: 'Zaļās' },
    '29': { nosaukums: 'Armijas brūna', hex: '#645A48', grupa: 'Neitrālās' },
    '30': { nosaukums: 'Rozā', hex: '#D989A3', grupa: 'Rozā / violetās' },
    '38': { nosaukums: 'Šokolādes', hex: '#62483D', grupa: 'Neitrālās' },
    '39': { nosaukums: 'Zāles zaļa', hex: '#4E9A42', grupa: 'Zaļās' },
    '40': { nosaukums: 'Violeta', hex: '#775A95', grupa: 'Rozā / violetās' },
    '51': { nosaukums: 'Ledus pelēka', hex: '#C9D0D2', grupa: 'Neitrālās' },
    '59': { nosaukums: 'Tirkīza', hex: '#2CA7A2', grupa: 'Zilās' },
    '60': { nosaukums: 'Denim', hex: '#476780', grupa: 'Zilās' },
    '62': { nosaukums: 'Laima zaļa', hex: '#9DCB3B', grupa: 'Zaļās' },
    '64': { nosaukums: 'Violeta', hex: '#7A4E9C', grupa: 'Rozā / violetās' },
    '69': { nosaukums: 'Armijas zaļa', hex: '#304837', grupa: 'Zaļās' },
    '70': { nosaukums: 'Snorkel zila', hex: '#275D89', grupa: 'Zilās' },
    '86': { nosaukums: 'Bordo', hex: '#610B2F', grupa: 'Siltās' },
    '90': { nosaukums: 'Neona dzeltena', hex: '#EAF20D', grupa: 'Siltās' },
    '92': { nosaukums: 'Ābolu zaļa', hex: '#74B63E', grupa: 'Zaļās' },
    '93': { nosaukums: 'Petrol zila', hex: '#176678', grupa: 'Zilās' },
    '94': { nosaukums: 'Ebony pelēka', hex: '#4A4A48', grupa: 'Neitrālās' },
    '95': { nosaukums: 'Piparmētru', hex: '#86CFB5', grupa: 'Zaļās' },
    '96': { nosaukums: 'Citronu', hex: '#E4E934', grupa: 'Siltās' },
    'A1': { nosaukums: 'Gaiši rozā', hex: '#E7A7B6', grupa: 'Rozā / violetās' },
    'A2': { nosaukums: 'Mandarīnu oranža', hex: '#EF8735', grupa: 'Siltās' },
    'A7': { nosaukums: 'Frost', hex: '#D8E6E3', grupa: 'Neitrālās' },
    'C9': { nosaukums: 'Salvijas zaļa', hex: '#A9B99F', grupa: 'Zaļās' },
    'D1': { nosaukums: 'Orhideju', hex: '#B681B9', grupa: 'Rozā / violetās' }
  };

  const catalogColorsFor = codes => codes.map(code => {
    const meta = catalogColorMeta[code] || {};
    return {
      id: code,
      nosaukums: `${meta.nosaukums || 'MALFINI tonis'} · ${code}`,
      malfini: code,
      hex: meta.hex || '#D7DBD8',
      grupa: meta.grupa || 'Citas',
      catalogOnly: true
    };
  });

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
      apraksts: 'Blīvs unisex T-krekls no Single Jersey auduma ar klasisku taisnu piegriezumu.',
      materials: '100% kokvilna',
      gramaza: '200 g/m²',
      kopsana: '40 °C',
      avots: 'https://shop.malfini.com/lv/en/product/heavy-new-137',
      svg: 'assets/krekls.svg',
      sleeveSvgs: {
        sleeveLeft: 'assets/piedurkne-laba.svg',
        sleeveRight: 'assets/piedurkne-laba.svg'
      },
      krasas: colorsFor(['00', '01', '02', '04', '05', '06', '07', '12', '16', '36', '44', '67', '87']),
      papilduKrasas: catalogColorsFor(['94', '03', '51', '08', '38', '27', '86', '23', '13', '11', 'A2', 'A1', '40', '15', '14', '70', '60', '93', '59', '19', '95', 'A7', '39', '62', '69', '09', '29', '28', '96', '90']),
      materialOverrides: {
        '12': '85% kokvilna, 15% viskoze'
      },
      careOverrides: {
        '12': '30 °C'
      },
      izmeri: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
      izmeruKopsavilkums: 'XS–5XL',
      sizeGuide: {
        kind: 'tshirt',
        diagramSvg: 'assets/size-guides/heavy-new-137.svg',
        columns: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
        rows: {
          A: [68, 70, 72, 74, 76, 78, 81, 84, 87],
          C: [43, 47, 51, 55, 59, 64, 70, 76, 82],
          H: [18.5, 19.5, 20.5, 21.5, 22.5, 23.5, 24.5, 25.5, 26.5]
        },
        labels: { A: 'Garums', C: 'Platums krūšu daļā', H: 'Piedurknes garums' },
        note: 'Visi izmēri norādīti cm. Pieļaujamā tolerance ±5%.'
      },
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
      apraksts: 'Bērnu T-krekls no Single Jersey auduma ar sānu šuvēm un elastīgu kakla apdari.',
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
      papilduKrasas: catalogColorsFor(['03', '21', '86', '11', 'A2', 'A1', '30', '64', 'D1', '15', '14', '70', '60', '19', '95', 'A7', 'C9', '92', '62', '69', '09', '28', '96']),
      materialOverrides: {
        '12': '85% kokvilna, 15% viskoze'
      },
      careOverrides: {
        '12': '30 °C'
      },
      izmeri: ['110 cm / 4 g.', '122 cm / 6 g.', '134 cm / 8 g.', '146 cm / 10 g.', '158 cm / 12 g.'],
      izmeruKopsavilkums: '110–158 cm / 4–12 g.',
      sizeGuide: {
        kind: 'tshirt',
        diagramSvg: 'assets/size-guides/basic-138.svg',
        columns: ['4 g. / 110 cm', '6 g. / 122 cm', '8 g. / 134 cm', '10 g. / 146 cm', '12 g. / 158 cm'],
        rows: {
          A: [43, 46, 52, 58, 64],
          C: [34, 37, 40, 43, 46],
          H: [11, 13, 15, 16, 17]
        },
        labels: { A: 'Garums', C: 'Platums krūšu daļā', H: 'Piedurknes garums' },
        note: 'Visi izmēri norādīti cm. Pieļaujamā tolerance ±5%.'
      },
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
      apraksts: 'Vīriešu hūdijs ar taisnu piegriezumu, ķengura kabatu un mīkstu iekšpusi.',
      materials: '65% kokvilna, 35% poliesters',
      gramaza: '320 g/m²',
      kopsana: '40 °C',
      avots: 'https://shop.malfini.com/lv/en/product/cape-413',
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
      papilduKrasas: catalogColorsFor(['03', '51', '21', '86', '60', 'C9', '69', '28']),
      materialOverrides: {
        '12': '85% kokvilna, 15% viskoze'
      },
      izmeri: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
      izmeruKopsavilkums: 'S–5XL',
      sizeGuide: {
        kind: 'hoodie',
        diagramSvg: 'assets/size-guides/cape-413.svg',
        columns: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
        rows: {
          A: [70, 72, 74, 76, 78, 80, 82, 84],
          C: [52, 56, 60, 64, 68.5, 74.5, 80.5, 86.5],
          H: [66, 67, 68, 69, 70, 71.5, 73, 74.5]
        },
        labels: { A: 'Garums', C: 'Platums krūšu daļā', H: 'Piedurknes garums' },
        note: 'Visi izmēri norādīti cm. Pieļaujamā tolerance ±5%.'
      },
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
      apraksts: 'Unisex džemperis ar taisnu piegriezumu, pazeminātu plecu līniju un mīkstu iekšpusi.',
      materials: '60% kokvilna, 40% poliesters',
      gramaza: '280 g/m²',
      kopsana: '40 °C',
      avots: 'https://shop.malfini.com/lv/en/product/crew-426',
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
      papilduKrasas: catalogColorsFor(['15']),
      materialOverrides: {
        '12': '75% kokvilna, 25% poliesters'
      },
      izmeri: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
      izmeruKopsavilkums: 'S–5XL',
      sizeGuide: {
        kind: 'sweatshirt',
        diagramSvg: 'assets/size-guides/crew-426.svg',
        columns: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
        rows: {
          A: [70, 72, 74, 77, 80, 83, 86, 89],
          C: [55, 59, 63, 67, 72, 78, 84, 90],
          H: [62, 63.5, 65, 66.5, 68, 69.5, 71, 72.5]
        },
        labels: { A: 'Garums', C: 'Platums krūšu daļā', H: 'Piedurknes garums' },
        note: 'Visi izmēri norādīti cm. Pieļaujamā tolerance ±5%.'
      },
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
