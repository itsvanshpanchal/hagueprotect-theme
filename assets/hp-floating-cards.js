/*
  Homepage section crossfade — no blank gaps.
  Outgoing stays fully visible until covered; incoming fades in on top (opacity only).
  Captions rise/fade once when a section first becomes active.
*/
(function () {
  'use strict';

  if (!document.body.classList.contains('template-index')) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.Shopify && Shopify.designMode) return;

  var main = document.getElementById('MainContent');
  if (!main) return;

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
    '.corp-marquee',
    '[class*="ai-story-banner-heading-"]',
    '[class*="ai-story-banner-subheading-"]',
    '[class*="ai-story-banner-paragraph-"]'
  ].join(',');

  function isShopifySection(el) {
    return el && el.classList && el.classList.contains('shopify-section');
  }

  function isTooThin(sec) {
    return sec.offsetHeight > 0 && sec.offsetHeight < 40;
  }

  function ensurePin(sec) {
    var pin = sec.querySelector(':scope > .hp-xfade-pin');
    if (pin) return pin;
    pin = document.createElement('div');
    pin.className = 'hp-xfade-pin';
    while (sec.firstChild) pin.appendChild(sec.firstChild);
    sec.appendChild(pin);
    return pin;
  }

  function markCaptions(pin) {
    var nodes = pin.querySelectorAll(CAPTION_SEL);
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].classList.add('hp-xfade-caption');
      nodes[i].classList.add('hp-xfade-pending');
    }
  }

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function detectPinBg(pin) {
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
    return '#0a0a0a';
  }

  var sections = Array.prototype.filter.call(main.children, isShopifySection).filter(function (sec) {
    return !isTooThin(sec);
  });
  if (sections.length < 2) return;

  var stack = document.createElement('div');
  stack.className = 'hp-xfade-stack';
  stack.setAttribute('data-hp-xfade-stack', '');
  main.insertBefore(stack, sections[0]);

  var items = [];

  sections.forEach(function (sec, index) {
    stack.appendChild(sec);
    sec.classList.add('hp-xfade-section');
    sec.style.setProperty('--hp-z', String(index + 1));

    var pin = ensurePin(sec);
    markCaptions(pin);
    items.push({ sec: sec, pin: pin, index: index, seen: false });
  });

  document.body.classList.add('hp-crossfade-active');
  document.body.classList.add('hp-floating-cards-active');
  window.dispatchEvent(new CustomEvent('hp-floating-cards:ready'));

  function layout() {
    var vh = window.innerHeight || document.documentElement.clientHeight || 800;

    items.forEach(function (item, index) {
      var pin = item.pin;
      var sec = item.sec;

      sec.style.height = 'auto';
      pin.style.height = 'auto';
      pin.style.minHeight = '0';
      pin.style.opacity = '1';

      var contentH = Math.max(pin.scrollHeight, pin.offsetHeight, 1);
      var pinH = contentH;
      var bg = detectPinBg(pin);
      item.bg = bg;

      /*
        No fade runway. Sticky natural-height sections stack;
        next scrolls over previous — opacity only fades the INCOMING pin in.
      */
      sec.style.setProperty('position', 'sticky', 'important');
      sec.style.setProperty('top', '0px', 'important');
      sec.style.setProperty('z-index', String(index + 1), 'important');
      sec.style.setProperty('height', pinH + 'px', 'important');
      sec.style.setProperty('margin-top', '0px', 'important');
      sec.style.setProperty('margin-bottom', '0px', 'important');
      sec.style.setProperty('transform', 'none', 'important');
      sec.style.setProperty('background-color', bg, 'important');

      pin.style.setProperty('position', 'relative', 'important');
      pin.style.setProperty('top', 'auto', 'important');
      pin.style.setProperty('height', pinH + 'px', 'important');
      pin.style.setProperty('min-height', pinH + 'px', 'important');
      pin.style.setProperty('width', '100%', 'important');
      pin.style.setProperty('background-color', bg, 'important');
      pin.style.overflow = contentH > vh + 8 ? 'auto' : 'visible';
    });

    update();
  }

  function setCaptions(item, on) {
    var caps = item.pin.querySelectorAll('.hp-xfade-caption');
    for (var i = 0; i < caps.length; i++) {
      if (on) {
        caps[i].classList.add('is-in');
        caps[i].classList.remove('hp-xfade-pending');
        item.seen = true;
      } else if (!item.seen) {
        caps[i].classList.remove('is-in');
        caps[i].classList.add('hp-xfade-pending');
      } else {
        /* Already revealed — stay visible so scrolling back never blanks text */
        caps[i].classList.add('is-in');
        caps[i].classList.remove('hp-xfade-pending');
      }
    }
  }

  function update() {
    var vh = window.innerHeight || 800;
    var n = items.length;
    var opacities = [];
    var i;

    for (i = 0; i < n; i++) opacities[i] = 0;

    /*
      Gap-proof blend:
      - Find the first section that is not yet fully covered.
      - Keep it at opacity 1 (never a transparent hole).
      - If the next section is rising through the viewport, fade it in on top.
    */
    for (i = 0; i < n; i++) {
      var next = items[i + 1];

      if (!next) {
        opacities[i] = 1;
        break;
      }

      var nextTop = next.pin.getBoundingClientRect().top;

      if (nextTop >= vh) {
        opacities[i] = 1;
        break;
      }

      if (nextTop <= 0) {
        /* Fully covered — keep searching for the active top section */
        continue;
      }

      var t = clamp(1 - nextTop / vh, 0, 1);
      t = t * t * (3 - 2 * t);
      opacities[i] = 1;
      opacities[i + 1] = t;
      break;
    }

    var activeIdx = 0;
    var best = -1;
    for (i = 0; i < n; i++) {
      items[i].pin.style.opacity = String(opacities[i]);
      items[i].pin.style.pointerEvents = opacities[i] > 0.05 ? 'auto' : 'none';
      if (opacities[i] > best) {
        best = opacities[i];
        activeIdx = i;
      }
    }

    if (best < 0.05) {
      for (i = n - 1; i >= 0; i--) {
        var r = items[i].pin.getBoundingClientRect();
        if (r.top < vh && r.bottom > 0) {
          items[i].pin.style.opacity = '1';
          opacities[i] = 1;
          activeIdx = i;
          best = 1;
          break;
        }
      }
    }

    for (i = 0; i < n; i++) {
      setCaptions(items[i], i === activeIdx && opacities[i] > 0.35);
    }
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      ticking = false;
      update();
    });
  }

  var resizeTimer = null;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layout, 120);
  }

  layout();
  /* First section captions in immediately */
  if (items[0]) setCaptions(items[0], true);

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('load', function () {
    layout();
    window.dispatchEvent(new CustomEvent('hp-floating-cards:ready'));
  });

  setTimeout(layout, 400);
  setTimeout(layout, 1200);
})();
