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
        front: { x: 0.32, y: 0.26, w: 0.36, h: 0.40 },
        back: { x: 0.30, y: 0.20, w: 0.40, h: 0.48 }
      }
    }
  };
})();
