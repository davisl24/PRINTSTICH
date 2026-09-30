(() => {
  'use strict';

  const products = window.PRINTSTICH_PRODUCTS || {};
  const PRODUCT_ORDER = ['tshirt', 'kids', 'hoodie', 'sweatshirt'];
  const $ = (selector, root = document) => root.querySelector(selector);

  const dialog = $('[data-size-guide-dialog]');
  const openButton = $('[data-size-guide-open]');
  const closeButton = $('[data-size-guide-close]');
  const switcher = $('[data-size-guide-products]');
  const title = $('[data-size-guide-title]');
  const audience = $('[data-size-guide-audience]');
  const diagram = $('[data-size-guide-diagram]');
  const headRow = $('[data-size-guide-head-row]');
  const body = $('[data-size-guide-body]');
  const note = $('[data-size-guide-note]');

  if (!dialog || !openButton) return;

  let guideProductId = 'tshirt';

  function activeConfiguratorProductId() {
    const activeButton = $('[data-product][aria-pressed="true"]') || $('[data-product].is-active') || $('[data-product]');
    return activeButton?.dataset.product || 'tshirt';
  }

  function guideProduct() {
    return products[guideProductId] || products.tshirt || null;
  }

  function renderSwitcher() {
    if (!switcher) return;
    switcher.innerHTML = PRODUCT_ORDER
      .filter(id => products[id]?.sizeGuide)
      .map(id => {
        const product = products[id];
        const active = id === guideProductId;
        return `<button type="button" data-size-guide-product="${id}" class="${active ? 'is-active' : ''}" aria-pressed="${active}">
          <span>${product.nosaukums}</span>
          <small>${product.modelis}</small>
        </button>`;
      }).join('');
  }

  function renderDiagram(product) {
    const guide = product?.sizeGuide;
    if (!diagram || !guide) return;
    if (guide.diagramSvg) {
      diagram.innerHTML = `<img src="${guide.diagramSvg}" alt="${product.modelis} izmēru mērījumu shēma" loading="eager">`;
    } else {
      diagram.innerHTML = '';
    }
  }

  function renderGuide() {
    const product = guideProduct();
    const guide = product?.sizeGuide;
    if (!product || !guide) return false;

    renderSwitcher();

    if (title) title.textContent = product.modelis || product.nosaukums || 'Izmēru tabula';
    if (audience) audience.textContent = [product.nosaukums, product.auditorija].filter(Boolean).join(' · ');
    renderDiagram(product);

    ['A', 'C', 'H'].forEach(key => {
      const label = $('[data-size-guide-label="' + key + '"]', dialog);
      if (label) label.textContent = guide.labels?.[key] || key;
    });

    if (headRow) {
      headRow.innerHTML = '<tr><th>Mērījums</th>' +
        guide.columns.map(column => '<th>' + column + '</th>').join('') +
        '</tr>';
    }

    if (body) {
      body.innerHTML = ['A', 'C', 'H'].map(key => {
        const values = guide.rows?.[key] || [];
        return '<tr><th scope="row">' + key + '</th>' +
          values.map(value => '<td>' + String(value).replace('.', ',') + '</td>').join('') +
          '</tr>';
      }).join('');
    }

    if (note) note.textContent = guide.note || 'Visi izmēri norādīti cm.';
    return true;
  }

  function openGuide() {
    const activeId = activeConfiguratorProductId();
    if (products[activeId]?.sizeGuide) guideProductId = activeId;
    if (!renderGuide()) return;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  function closeGuide() {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }

  openButton.addEventListener('click', openGuide);
  closeButton?.addEventListener('click', closeGuide);

  switcher?.addEventListener('click', event => {
    const button = event.target.closest('[data-size-guide-product]');
    if (!button) return;
    const id = button.dataset.sizeGuideProduct;
    if (!products[id]?.sizeGuide) return;
    guideProductId = id;
    renderGuide();
  });

  dialog.addEventListener('click', event => {
    if (event.target === dialog) closeGuide();
  });

  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    closeGuide();
  });
})();