(() => {
  'use strict';

  const CONSENT_KEY = 'printstich-consent-v1';
  const THEME_KEY = 'printstich-theme';
  const readConsent = () => {
    try {
      const value = JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null');
      return value && value.version === 1 && typeof value.preferences === 'boolean' ? value : null;
    } catch (_) { return null; }
  };

  const existing = readConsent();
  const root = document.createElement('div');
  root.className = 'cookie-consent';
  root.innerHTML = [
    '<section class="cookie-banner" aria-label="Sīkdatņu izvēle" hidden>',
    '  <div class="cookie-banner-copy">',
    '    <h2>Sīkdatņu iestatījumi</h2>',
    '    <p>Izmantojam tehniski nepieciešamu glabāšanu. Ar tavu atļauju varam arī atcerēties izvēlēto lapas izskatu. Reklāmas un analītikas sīkdatnes neizmantojam. <a href="sikdatnu-politika.html">Uzzini vairāk</a>.</p>',
    '  </div>',
    '  <div class="cookie-actions">',
    '    <button type="button" class="cookie-btn cookie-btn-outline" data-cookie-reject>Tikai nepieciešamās</button>',
    '    <button type="button" class="cookie-btn cookie-btn-primary" data-cookie-accept>Atļaut preferences</button>',
    '    <button type="button" class="cookie-btn cookie-btn-text" data-cookie-settings>Iestatījumi</button>',
    '  </div>',
    '</section>',
    '<dialog class="cookie-dialog" aria-labelledby="cookie-dialog-title">',
    '  <form method="dialog" class="cookie-dialog-inner">',
    '    <div class="cookie-dialog-top"><h2 id="cookie-dialog-title">Privātuma iestatījumi</h2><button type="button" class="cookie-close" data-cookie-close aria-label="Aizvērt">×</button></div>',
    '    <p>Izvēlies, ko drīkstam saglabāt šajā pārlūkā. Izvēli varēsi mainīt jebkurā laikā.</p>',
    '    <div class="cookie-option"><div><strong>Nepieciešamā glabāšana</strong><small>Saglabā tavu sīkdatņu izvēli. To nevar izslēgt.</small></div><span class="cookie-required">Vienmēr aktīva</span></div>',
    '    <label class="cookie-option"><span><strong>Izskata preferences</strong><small>Atceras gaišā vai tumšā režīma izvēli arī nākamajā apmeklējumā.</small></span><input type="checkbox" data-cookie-preferences></label>',
    '    <div class="cookie-dialog-actions"><button type="button" class="cookie-btn cookie-btn-outline" data-cookie-save>Saglabāt izvēli</button><button type="button" class="cookie-btn cookie-btn-primary" data-cookie-allow>Atļaut preferences</button></div>',
    '  </form>',
    '</dialog>'
  ].join('\n');
  document.body.appendChild(root);

  const banner = root.querySelector('.cookie-banner');
  const dialog = root.querySelector('.cookie-dialog');
  const preference = root.querySelector('[data-cookie-preferences]');

  const save = (allowPreferences) => {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({ version: 1, preferences: allowPreferences }));
      if (allowPreferences) {
        localStorage.setItem(THEME_KEY, document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
      } else {
        localStorage.removeItem(THEME_KEY);
      }
    } catch (_) { /* Private mode may block storage. */ }
    banner.hidden = true;
    if (dialog.open) dialog.close();
  };

  const openSettings = () => {
    const choice = readConsent();
    preference.checked = choice ? choice.preferences : false;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  };

  root.querySelector('[data-cookie-reject]').addEventListener('click', () => save(false));
  root.querySelector('[data-cookie-accept]').addEventListener('click', () => save(true));
  root.querySelector('[data-cookie-settings]').addEventListener('click', openSettings);
  root.querySelector('[data-cookie-close]').addEventListener('click', () => dialog.close());
  root.querySelector('[data-cookie-save]').addEventListener('click', () => save(preference.checked));
  root.querySelector('[data-cookie-allow]').addEventListener('click', () => save(true));
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  const footer = document.querySelector('.footer-legal-links') || document.querySelector('.site-footer .container:last-child') || document.querySelector('.site-footer');
  if (footer) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'cookie-footer-link';
    button.textContent = 'Sīkdatņu iestatījumi';
    button.addEventListener('click', openSettings);
    footer.appendChild(button);
  }

  if (!existing) {
    try { localStorage.removeItem(THEME_KEY); } catch (_) {}
    banner.hidden = false;
  }
})();