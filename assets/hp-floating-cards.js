/*
  Homepage floating section animation (restored, gap-safe).

  Why the last version removed motion:
  - Full sticky + opacity on EVERY section forced short strips (marquee, etc.)
    into empty white/black full-screen panels.

  This version:
  - Tall cinematic sections = sticky cover stack (next slides up over previous)
  - Short strips stay in normal flow (no forced 100vh blank color)
  - Never fade section/pin backgrounds (no see-through voids)
  - Headings stay fully visible (no caption opacity hide)
*/
(function () {
  'use strict';

  if (!document.body.classList.contains('template-index')) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.Shopify && Shopify.designMode) return;

  var main = document.getElementById('MainContent');
  if (!main) return;

  var SHORT_VH = 0.52; /* below this = interstitial, not a sticky card */
  var CAPTION_SEL = [
    'h1',
    'h2',
    '.hero-fullscreen__heading',
    '.hero-fullscreen__subheading',
    '.hero-fullscreen__eyebrow',
    '.mat-headline',
    '.mat-subhead',
    '.bs-coverflow__heading',
    '.bs-coverflow__eyebrow',
    '.fb__title',
    '.fb__subtitle',
    '.fc-heading',
    '.fc-subtitle',
    '.hp-fam-sec__heading',
    '.story-banner__heading',
    '.story-banner__paragraph',
    '.story-banner__subheading',
    '.comm-intro h2',
    '.comm-desc',
    '.trending-social__heading',
    '.hp-dna__heading',
    '.split-cta__heading',
    '.split-cta__text',
    '[class*="ai-story-banner-heading-"]',
    '[class*="ai-story-banner-subheading-"]',
    '[class*="ai-story-banner-paragraph-"]'
  ].join(',');

  function isShopifySection(el) {
    return el && el.classList && el.classList.contains('shopify-section');
  }

  function isTooThin(sec) {
    return sec.offsetHeight > 0 && sec.offsetHeight < 32;
  }

  function ensurePin(sec) {
    var pin = sec.querySelector(':scope > .hp-float-pin');
    if (pin) return pin;
    pin = document.createElement('div');
    pin.className = 'hp-float-pin';
    while (sec.firstChild) pin.appendChild(sec.firstChild);
    sec.appendChild(pin);
    return pin;
  }

  function detectBg(pin) {
    var selectors = [
      '.mat-section',
      '.hp-fam-sec',
      '.corp-marquee',
      '.fc-section',
      '.comm-section',
      '.split-cta',
      '[class*="split-cta"]',
      '.story-banner',
      '.story-banner-wrapper',
      '.hero-fullscreen',
      '.bs-coverflow',
      '.trending-social-section',
      '.trending-social',
      '.hp-dna',
      '[class*="ai-story-banner"]',
      'section'
    ];
    for (var i = 0; i < selectors.length; i++) {
      var el = pin.querySelector(selectors[i]);
      if (!el) continue;
      var c = window.getComputedStyle(el).backgroundColor;
      if (c && c !== 'transparent' && c !== 'rgba(0, 0, 0, 0)') return c;
    }
    var own = window.getComputedStyle(pin).backgroundColor;
    if (own && own !== 'transparent' && own !== 'rgba(0, 0, 0, 0)') return own;
    var page = window.getComputedStyle(document.body).backgroundColor;
    if (page && page !== 'transparent' && page !== 'rgba(0, 0, 0, 0)') return page;
    return '#ffffff';
  }

  function markCaptions(pin) {
    var nodes = pin.querySelectorAll(CAPTION_SEL);
    for (var i = 0; i < nodes.length; i++) {
      /* Always visible — do not start at opacity 0 (that hid headings sitewide) */
      nodes[i].classList.add('hp-float-caption');
      nodes[i].classList.add('is-in');
    }
  }

  var sections = Array.prototype.filter.call(main.children, isShopifySection).filter(function (sec) {
    return !isTooThin(sec);
  });
  if (sections.length < 2) return;

  var stack = document.createElement('div');
  stack.className = 'hp-float-stack';
  stack.setAttribute('data-hp-float-stack', '');
  main.insertBefore(stack, sections[0]);

  var items = [];
  var cardIndex = 0;

  sections.forEach(function (sec) {
    stack.appendChild(sec);
    var pin = ensurePin(sec);
    markCaptions(pin);
    items.push({ sec: sec, pin: pin, seen: false, isCard: false });
  });

  document.body.classList.add('hp-float-active');
  document.body.classList.add('hp-floating-cards-active');
  window.dispatchEvent(new CustomEvent('hp-floating-cards:ready'));

  function layout() {
    var vh = window.innerHeight || document.documentElement.clientHeight || 800;
    cardIndex = 0;

    items.forEach(function (item) {
      var sec = item.sec;
      var pin = item.pin;

      sec.classList.remove('hp-float-card', 'hp-float-strip');
      sec.style.removeProperty('height');
      sec.style.removeProperty('min-height');
      sec.style.removeProperty('position');
      sec.style.removeProperty('top');
      sec.style.removeProperty('z-index');
      sec.style.removeProperty('visibility');
      sec.style.removeProperty('opacity');
      pin.style.cssText = '';

      var contentH = Math.max(pin.scrollHeight, pin.offsetHeight, 1);
      var bg = detectBg(pin);
      item.bg = bg;

      /* Short interstitial — normal flow, never a blank full-screen color card */
      if (contentH < vh * SHORT_VH) {
        item.isCard = false;
        sec.classList.add('hp-float-strip');
        sec.style.setProperty('position', 'relative', 'important');
        sec.style.setProperty('z-index', String(20 + cardIndex), 'important');
        sec.style.setProperty('height', 'auto', 'important');
        sec.style.setProperty('min-height', '0', 'important');
        if (bg) sec.style.setProperty('background-color', bg, 'important');
        pin.style.setProperty('position', 'relative', 'important');
        pin.style.setProperty('opacity', '1', 'important');
        return;
      }

      /* Tall cinematic section — sticky cover card */
      item.isCard = true;
      cardIndex += 1;
      var pinH = Math.max(contentH, vh);

      sec.classList.add('hp-float-card');
      sec.style.setProperty('--hp-z', String(cardIndex));
      sec.style.setProperty('position', 'sticky', 'important');
      sec.style.setProperty('top', '0px', 'important');
      sec.style.setProperty('z-index', String(cardIndex), 'important');
      sec.style.setProperty('height', pinH + 'px', 'important');
      sec.style.setProperty('min-height', vh + 'px', 'important');
      sec.style.setProperty('margin-top', '0px', 'important');
      sec.style.setProperty('margin-bottom', '0px', 'important');
      sec.style.setProperty('transform', 'none', 'important');
      sec.style.setProperty('opacity', '1', 'important');
      sec.style.setProperty('visibility', 'visible', 'important');
      if (bg) sec.style.setProperty('background-color', bg, 'important');

      pin.style.setProperty('position', 'relative', 'important');
      pin.style.setProperty('height', pinH + 'px', 'important');
      pin.style.setProperty('min-height', vh + 'px', 'important');
      pin.style.setProperty('width', '100%', 'important');
      pin.style.setProperty('opacity', '1', 'important');
      if (bg) pin.style.setProperty('background-color', bg, 'important');
      /* Prefer visible so headings aren't clipped; scroll only when content is taller than the pin */
      pin.style.overflow = contentH > vh + 20 ? 'auto' : 'visible';
    });

    updateCaptions();
  }

  function setCaptions(item, on) {
    var caps = item.pin.querySelectorAll('.hp-float-caption');
    for (var i = 0; i < caps.length; i++) {
      /* Keep headings/fonts always readable; only add entrance class when active */
      caps[i].classList.add('is-in');
      caps[i].classList.remove('hp-float-caption--pending');
      if (on) item.seen = true;
    }
  }

  function updateCaptions() {
    var vh = window.innerHeight || 800;

    /* Reveal every section that intersects the viewport (not only the "best" one) */
    items.forEach(function (item) {
      var r = item.pin.getBoundingClientRect();
      var inView = r.bottom > 0 && r.top < vh;
      if (inView || item.seen) setCaptions(item, true);
      else setCaptions(item, false);
    });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      ticking = false;
      updateCaptions();
    });
  }

  var resizeTimer = null;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layout, 140);
  }

  layout();
  /* Ensure every heading is visible immediately */
  items.forEach(function (item) {
    setCaptions(item, true);
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('load', function () {
    layout();
    items.forEach(function (item) {
      setCaptions(item, true);
    });
    window.dispatchEvent(new CustomEvent('hp-floating-cards:ready'));
  });
  setTimeout(function () {
    layout();
    items.forEach(function (item) {
      setCaptions(item, true);
    });
  }, 400);
  setTimeout(function () {
    layout();
    items.forEach(function (item) {
      setCaptions(item, true);
    });
  }, 1200);
})();
