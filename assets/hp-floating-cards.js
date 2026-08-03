/*
  Homepage section crossfade (reference: pinned panels + opacity blend only).
  Replaces sticky card-cover stack. No rotation, scale-stack, or 3D.
  Captions fade in with translateY(20→0) when their section is active.
*/
(function () {
  'use strict';

  if (!document.body.classList.contains('template-index')) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.Shopify && Shopify.designMode) return;

  var main = document.getElementById('MainContent');
  if (!main) return;

  var FADE_VH = 0.9; /* scroll distance for opacity crossfade (in vh) */
  var HOLD_MIN_VH = 1; /* pin at least one viewport when content is shorter */
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
    }
  }

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
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

    items.push({ sec: sec, pin: pin, index: index });
  });

  document.body.classList.add('hp-crossfade-active');
  /* Keep legacy flag so Tell Your Story curtain flattens */
  document.body.classList.add('hp-floating-cards-active');
  window.dispatchEvent(new CustomEvent('hp-floating-cards:ready'));

  function layout() {
    var vh = window.innerHeight || document.documentElement.clientHeight || 800;
    var fadeRun = Math.round(vh * FADE_VH);

    items.forEach(function (item, index) {
      var pin = item.pin;
      var sec = item.sec;
      var isLast = index === items.length - 1;

      /* Measure natural content height without runway */
      sec.style.height = 'auto';
      pin.style.height = 'auto';
      pin.style.minHeight = '0';
      pin.style.opacity = '1';

      var contentH = Math.max(pin.scrollHeight, pin.offsetHeight, 1);
      var pinH = Math.max(contentH, Math.round(vh * HOLD_MIN_VH));

      item.pinH = pinH;
      item.fadeRun = isLast ? 0 : fadeRun;

      sec.style.setProperty('position', 'sticky', 'important');
      sec.style.setProperty('top', '0px', 'important');
      sec.style.setProperty('z-index', String(index + 1), 'important');
      sec.style.setProperty('height', pinH + item.fadeRun + 'px', 'important');
      sec.style.setProperty('margin-top', '0px', 'important');
      sec.style.setProperty('transform', 'none', 'important');

      pin.style.setProperty('position', 'sticky', 'important');
      pin.style.setProperty('top', '0px', 'important');
      pin.style.setProperty('height', pinH + 'px', 'important');
      pin.style.setProperty('min-height', pinH + 'px', 'important');
      pin.style.setProperty('width', '100%', 'important');
      pin.style.overflow = contentH > vh + 8 ? 'auto' : 'hidden';
    });

    update();
  }

  function setCaptions(pin, on) {
    var caps = pin.querySelectorAll('.hp-xfade-caption');
    for (var i = 0; i < caps.length; i++) {
      if (on) caps[i].classList.add('is-in');
      else caps[i].classList.remove('is-in');
    }
  }

  function update() {
    var vh = window.innerHeight || 800;
    var n = items.length;
    var opacities = [];
    var i;
    for (i = 0; i < n; i++) opacities[i] = 0;

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
        opacities[i] = 0;
        continue;
      }
      /* Crossfade only — incoming rises, outgoing fades */
      var t = clamp(1 - nextTop / vh, 0, 1);
      t = t * t * (3 - 2 * t);
      opacities[i] = 1 - t;
      opacities[i + 1] = t;
      break;
    }

    var activeIdx = 0;
    var best = -1;
    for (i = 0; i < n; i++) {
      items[i].pin.style.opacity = String(opacities[i]);
      if (opacities[i] > best) {
        best = opacities[i];
        activeIdx = i;
      }
    }

    for (i = 0; i < n; i++) {
      setCaptions(items[i].pin, i === activeIdx && opacities[i] > 0.45);
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
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('load', function () {
    layout();
    window.dispatchEvent(new CustomEvent('hp-floating-cards:ready'));
  });

  /* Images / fonts can change heights after first paint */
  setTimeout(layout, 400);
  setTimeout(layout, 1200);
})();
