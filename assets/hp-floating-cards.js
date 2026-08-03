/*
  Homepage floating section animation (gap-safe).

  Tall, nearly full-viewport sections stick and get covered by the next one.
  Short strips stay in normal flow.
  Never pad sections to 100vh with solid color (that created black/white voids).
  Headings stay fully visible.
*/
(function () {
  'use strict';

  if (!document.body.classList.contains('template-index')) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.Shopify && Shopify.designMode) return;

  var main = document.getElementById('MainContent');
  if (!main) return;

  /* Only cinematic full-bleed panels become sticky cards */
  var CARD_VH = 0.88;

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
      '[class*="hp-dna-"]',
      '[class*="ai-story-banner"]',
      '[class*="ai-story-sticky-pin"]',
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
    return '';
  }

  function resetSectionStyles(sec, pin) {
    sec.classList.remove('hp-float-card', 'hp-float-strip');
    [
      'height',
      'min-height',
      'max-height',
      'position',
      'top',
      'z-index',
      'visibility',
      'opacity',
      'margin-top',
      'margin-bottom',
      'background-color',
      'background',
      'transform',
      'overflow'
    ].forEach(function (prop) {
      sec.style.removeProperty(prop);
    });
    pin.style.cssText = '';
  }

  function asStrip(item, z) {
    var sec = item.sec;
    var pin = item.pin;
    item.isCard = false;
    sec.classList.add('hp-float-strip');
    sec.style.setProperty('position', 'relative', 'important');
    sec.style.setProperty('top', 'auto', 'important');
    sec.style.setProperty('z-index', String(z), 'important');
    sec.style.setProperty('height', 'auto', 'important');
    sec.style.setProperty('min-height', '0', 'important');
    sec.style.setProperty('margin-top', '0px', 'important');
    sec.style.setProperty('transform', 'none', 'important');
    sec.style.setProperty('opacity', '1', 'important');
    sec.style.setProperty('visibility', 'visible', 'important');
    pin.style.setProperty('position', 'relative', 'important');
    pin.style.setProperty('height', 'auto', 'important');
    pin.style.setProperty('min-height', '0', 'important');
    pin.style.setProperty('opacity', '1', 'important');
    pin.style.setProperty('overflow', 'visible', 'important');
  }

  function asCard(item, z, contentH, bg) {
    var sec = item.sec;
    var pin = item.pin;
    /* Height follows content only — never pad to 100vh (black empty panels) */
    var pinH = Math.max(contentH, 1);

    item.isCard = true;
    sec.classList.add('hp-float-card');
    sec.style.setProperty('--hp-z', String(z));
    sec.style.setProperty('position', 'sticky', 'important');
    sec.style.setProperty('top', '0px', 'important');
    sec.style.setProperty('z-index', String(z), 'important');
    sec.style.setProperty('height', pinH + 'px', 'important');
    sec.style.setProperty('min-height', '0', 'important');
    sec.style.setProperty('margin-top', '0px', 'important');
    sec.style.setProperty('margin-bottom', '0px', 'important');
    sec.style.setProperty('transform', 'none', 'important');
    sec.style.setProperty('opacity', '1', 'important');
    sec.style.setProperty('visibility', 'visible', 'important');
    if (bg) sec.style.setProperty('background-color', bg, 'important');

    pin.style.setProperty('position', 'relative', 'important');
    pin.style.setProperty('height', 'auto', 'important');
    pin.style.setProperty('min-height', '0', 'important');
    pin.style.setProperty('width', '100%', 'important');
    pin.style.setProperty('opacity', '1', 'important');
    pin.style.setProperty('overflow', 'visible', 'important');
    if (bg) pin.style.setProperty('background-color', bg, 'important');
  }

  function flattenStoryCurtains(pin) {
    var tracks = pin.querySelectorAll('[class*="ai-story-sticky-track"]');
    for (var i = 0; i < tracks.length; i++) {
      tracks[i].style.setProperty('height', 'auto', 'important');
      tracks[i].style.setProperty('min-height', '0', 'important');
    }
    var pins = pin.querySelectorAll('[class*="ai-story-sticky-pin"]');
    for (var j = 0; j < pins.length; j++) {
      pins[j].style.setProperty('position', 'relative', 'important');
      pins[j].style.setProperty('top', 'auto', 'important');
      pins[j].style.setProperty('height', 'auto', 'important');
      pins[j].style.setProperty('min-height', '0', 'important');
      pins[j].style.setProperty('z-index', 'auto', 'important');
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

  sections.forEach(function (sec) {
    stack.appendChild(sec);
    var pin = ensurePin(sec);
    items.push({ sec: sec, pin: pin, isCard: false });
  });

  document.body.classList.add('hp-float-active');
  document.body.classList.add('hp-floating-cards-active');
  window.dispatchEvent(new CustomEvent('hp-floating-cards:ready'));

  function layout() {
    var vh = window.innerHeight || document.documentElement.clientHeight || 800;
    var cardIndex = 0;

    items.forEach(function (item, index) {
      var sec = item.sec;
      var pin = item.pin;
      var isLast = index === items.length - 1;

      resetSectionStyles(sec, pin);
      flattenStoryCurtains(pin);

      /* Kill leftover 200vh story-curtain runway from block CSS */
      if (pin.querySelector('[class*="ai-story-sticky-track"]')) {
        sec.style.setProperty('height', 'auto', 'important');
        sec.style.setProperty('min-height', '0', 'important');
        sec.style.setProperty('pointer-events', 'auto', 'important');
      }

      /* Measure natural content height after clearing forced sizes */
      var contentH = Math.max(pin.scrollHeight, pin.offsetHeight, 1);
      var bg = detectBg(pin);
      item.bg = bg;

      /*
        Last section must never stick — sticky black panels above the footer
        were leaving a full-screen void with only the footer peeking in.
      */
      if (isLast || contentH < vh * CARD_VH) {
        asStrip(item, 10 + index);
        return;
      }

      cardIndex += 1;
      asCard(item, cardIndex, contentH, bg);
    });
  }

  var resizeTimer = null;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layout, 140);
  }

  layout();
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('load', function () {
    layout();
    window.dispatchEvent(new CustomEvent('hp-floating-cards:ready'));
  });
  setTimeout(layout, 400);
  setTimeout(layout, 1200);
})();
