(() => {
  'use strict';

  window.PRINTSTICH_PRODUCTS = {
    tshirt: {
      id: 'tshirt',
      nosaukums: 'T-krekls',
      svg: 'assets/krekls.svg',
      krasas: [
        { id: 'balts', nosaukums: 'Balta', hex: '#FFFFFF' },
        { id: 'melns', nosaukums: 'Melna', hex: '#1A1A1A' },
        { id: 'zils', nosaukums: 'Tumši zila', hex: '#1B2A4A' }
      ],
      izmeri: ['S', 'M', 'L', 'XL', 'XXL'],
      puses: {
        prieksa: 'Priekšpuse',
        aizmugure: 'Aizmugure'
      },
      drukasZona: {
        prieksa: { x: 0.350, y: 0.343, w: 0.300, h: 0.343 },
        aizmugure: { x: 0.333, y: 0.307, w: 0.333, h: 0.407 }
      },
      // Pagaidu A3 drukas laukums visiem izmēriem un abām pusēm.
      // Precīzas atšķirības pievienosim pēc PrintStich preses/platnes izmēru apstiprināšanas.
      drukasLaukumsMm: {
        prieksa: {
          S: { w: 297, h: 420 },
          M: { w: 297, h: 420 },
          L: { w: 297, h: 420 },
          XL: { w: 297, h: 420 },
          XXL: { w: 297, h: 420 }
        },
        aizmugure: {
          S: { w: 297, h: 420 },
          M: { w: 297, h: 420 },
          L: { w: 297, h: 420 },
          XL: { w: 297, h: 420 },
          XXL: { w: 297, h: 420 }
        }
      },
      maxDrukaMm: { w: 297, h: 420 }
    }
  };
})();
