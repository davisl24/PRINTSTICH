(() => {
  'use strict';

  window.PRINTSTICH_PRODUCTS = {
    tshirt: {
      id: 'tshirt',
      nosaukums: 'T-krekls',
      krasas: {
        white: {
          label: 'Balta',
          value: '#ffffff',
          mockups: {
            front: 'assets/images/mokapi/krekls-balts-prieksa.jpg',
            back: 'assets/images/mokapi/krekls-balts-aizmugure.jpg'
          }
        },
        black: {
          label: 'Melna',
          value: '#151515',
          mockups: {
            front: 'assets/images/mokapi/krekls-melns-prieksa.jpg',
            back: 'assets/images/mokapi/krekls-melns-aizmugure.jpg'
          }
        }
      },
      izmeri: ['S', 'M', 'L', 'XL', 'XXL'],
      puses: {
        front: 'Priekšpuse',
        back: 'Aizmugure'
      },
      drukasZona: {
        front: { x: 0.333, y: 0.300, w: 0.334, h: 0.343 },
        back: { x: 0.325, y: 0.271, w: 0.350, h: 0.400 }
      },
      // Pagaidu A3 drukas laukums visiem izmēriem un abām pusēm.
      // Precīzas atšķirības pievienosim pēc PrintStich preses/platnes izmēru apstiprināšanas.
      drukasLaukumsMm: {
        front: {
          S: { w: 297, h: 420 },
          M: { w: 297, h: 420 },
          L: { w: 297, h: 420 },
          XL: { w: 297, h: 420 },
          XXL: { w: 297, h: 420 }
        },
        back: {
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
