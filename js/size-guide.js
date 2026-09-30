(() => {
  'use strict';

  const products = window.PRINTSTICH_PRODUCTS || {};
  const $ = (selector, root = document) => root.querySelector(selector);

  const dialog = $('[data-size-guide-dialog]');
  const openButton = $('[data-size-guide-open]');
  const closeButton = $('[data-size-guide-close]');
  const title = $('[data-size-guide-title]');
  const audience = $('[data-size-guide-audience]');
  const diagram = $('[data-size-guide-diagram]');
  const headRow = $('[data-size-guide-head-row]');
  const body = $('[data-size-guide-body]');
  const note = $('[data-size-guide-note]');

  if (!dialog || !openButton) return;

  function activeProduct() {
    const activeButton = $('[data-product][aria-pressed="true"]') || $('[data-product].is-active') || $('[data-product]');
    const id = activeButton?.dataset.product || 'tshirt';
    return products[id] || products.tshirt || null;
  }

  function sizeGuideSvg(kind = 'tshirt') {
    const longSleeve = kind === 'hoodie' || kind === 'sweatshirt';
    const hoodie = kind === 'hoodie';
    const sleeveEndY = longSleeve ? 226 : 128;
    const sleeveEndX = longSleeve ? 48 : 42;
    const rightSleeveEndX = 312;

    return `
      <svg viewBox="0 0 360 290" role="img" aria-label="A, C un H mērījumu shēma">
        <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          ${hoodie ? '<path d="M145 60 Q180 18 215 60 L205 83 Q180 62 155 83 Z"/>' : '<path d="M145 58 Q180 83 215 58"/>'}
          <path d="M108 76 L145 58 ${hoodie ? 'M215 58' : ''} L252 76 L${rightSleeveEndX} ${sleeveEndY} L274 ${sleeveEndY + (longSleeve ? 12 : 14)} L252 112 L252 245 L108 245 L108 112 L86 ${sleeveEndY + (longSleeve ? 12 : 14)} L${sleeveEndX} ${sleeveEndY} L108 76"/>
          ${longSleeve ? '<path d="M74 211 L92 229 M268 229 L286 211"/>' : ''}
          ${hoodie ? '<path d="M142 173 L155 148 L205 148 L218 173 M153 173 L207 173"/>' : ''}
          <path d="M108 112 L252 112"/>
        </g>
        <g fill="none" stroke="currentColor" stroke-width="1.5" opacity=".72">
          <path d="M84 60 L84 245"/>
          <path d="M78 60 L90 60 M78 245 L90 245"/>
          <path d="M108 104 L252 104"/>
          <path d="M108 98 L108 110 M252 98 L252 110"/>
          <path d="${longSleeve ? 'M252 76 L304 218' : 'M252 76 L309 125'}"/>
          <path d="${longSleeve ? 'M247 79 L257 73 M299 221 L309 215' : 'M248 81 L256 71 M304 130 L314 120'}"/>
        </g>
        <g fill="currentColor" font-family="Manrope, Arial, sans-serif" font-weight="800" font-size="22">
          <text x="52" y="160">A</text>
          <text x="174" y="98">C</text>
          <text x="${longSleeve ? 292 : 296}" y="${longSleeve ? 155 : 92}">H</text>
        </g>
      </svg>`;
  }

  function renderGuide() {
    const product = activeProduct();
    const guide = product?.sizeGuide;
    if (!product || !guide) return false;

    if (title) title.textContent = product.modelis || product.nosaukums || 'Izmēru tabula';
    if (audience) audience.textContent = [product.nosaukums, product.auditorija].filter(Boolean).join(' · ');
    if (diagram) diagram.innerHTML = sizeGuideSvg(guide.kind);

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
  dialog.addEventListener('click', event => {
    if (event.target === dialog) closeGuide();
  });
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    closeGuide();
  });
})();