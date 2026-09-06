(() => {
  'use strict';

  window.PRINTSTICH_PRODUCTS = {
    tshirt: {
      id: 'tshirt',
      nosaukums: 'T-krekls',
      svg: 'assets/krekls.svg',
      sleeveSvgs: {
        sleeveLeft: 'assets/piedurkne-kreisa.svg',
        sleeveRight: 'assets/piedurkne-laba.svg'
      },
      krasas: [
        { id: 'balts', nosaukums: 'Balta', hex: '#FFFFFF' },
        { id: 'melns', nosaukums: 'Melna', hex: '#1A1A1A' },
        { id: 'zils', nosaukums: 'Tumši zila', hex: '#1B2A4A' }
      ],
      izmeri: ['S', 'M', 'L', 'XL', 'XXL'],
      puses: {
        prieksa: 'Priekšpuse',
        aizmugure: 'Aizmugure',
        sleeveLeft: 'Kreisā piedurkne',
        sleeveRight: 'Labā piedurkne'
      },
      drukasZona: {
        prieksa: { x: 0.350, y: 0.343, w: 0.300, h: 0.343 },
        aizmugure: { x: 0.333, y: 0.307, w: 0.333, h: 0.407 },
        sleeveLeft: { x: 0.280, y: 0.285, w: 0.440, h: 0.440 },
        sleeveRight: { x: 0.280, y: 0.285, w: 0.440, h: 0.440 }
      },
      drukasLaukumsMm: {
        prieksa: {
          S: { w: 297, h: 420 }, M: { w: 297, h: 420 }, L: { w: 297, h: 420 },
          XL: { w: 297, h: 420 }, XXL: { w: 297, h: 420 }
        },
        aizmugure: {
          S: { w: 297, h: 420 }, M: { w: 297, h: 420 }, L: { w: 297, h: 420 },
          XL: { w: 297, h: 420 }, XXL: { w: 297, h: 420 }
        },
        sleeveLeft: {
          S: { w: 100, h: 100 }, M: { w: 100, h: 100 }, L: { w: 100, h: 100 },
          XL: { w: 100, h: 100 }, XXL: { w: 100, h: 100 }
        },
        sleeveRight: {
          S: { w: 100, h: 100 }, M: { w: 100, h: 100 }, L: { w: 100, h: 100 },
          XL: { w: 100, h: 100 }, XXL: { w: 100, h: 100 }
        }
      },
      maxDrukaMm: { w: 297, h: 420 }
    }
  };
})();
