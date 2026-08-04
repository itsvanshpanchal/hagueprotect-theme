/*
  Homepage floating section animation (gap-safe).

  Desktop: tall sections stick at natural height; short strips stay in flow.
  Mobile: NO forced 100vh panels (that left huge empty white/black voids).
          Normal document flow + story curtain flattened. Hero uses theme sizing.
*/
(function () {
  'use strict';

  if (!document.body.classList.contains('template-index')) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.Shopify && Shopify.designMode) return;

  var main = document.getElementById('MainContent');
  if (!main) return;

  var MQ_MOBILE = window.matchMedia('(max-width: 749px)');
  var STRIP_SEL =
    '.corp-marquee, .corporate-gifting-marquee, [class*="marquee"], .announcement, .apps';

  function isMobile() {
    return MQ_MOBILE.matches;
  }

  function viewportH() {
    return window.innerHeight || document.documentElement.clientHeight || 800;
  }

  function isShopifySection(el) {
    return el && el.classList && el.classList.contains('shopify-section');
  }

  function isTooThin(sec) {
    return sec.offsetHeight > 0 && sec.offsetHeight < 32;
  }

  function isHeroPin(pin) {
    return !!pin.querySelector('.hero-fullscreen');
  }

  function isKnownStrip(pin) {
    return !!(pin.querySelector(STRIP_SEL) && pin.children.length <= 3);
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

  function clearHeroOverrides(pin) {
    var hero = pin.querySelector('.hero-fullscreen');
    if (!hero) return;
    [
      'height',
      'min-height',
      'max-height',
      'aspect-ratio',
      'position',
      'width',
      'overflow',
      'opacity',
      'visibility',
      'background'
    ].forEach(function (prop) {
      hero.style.removeProperty(prop);
    });
    var nodes = pin.querySelectorAll(
      '.hero-fullscreen__bg, .hero-fullscreen__bg picture, .hero-fullscreen__bg-img, .hero-fullscreen__bg img, .hero-fullscreen__content'
    );
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].style.cssText = '';
    }
  }

  function resetSectionStyles(sec, pin) {
    sec.classList.remove('hp-float-card', 'hp-float-strip', 'hp-float-card--mobile');
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
      'overflow',
      'box-shadow'
    ].forEach(function (prop) {
      sec.style.removeProperty(prop);
    });
    pin.style.cssText = '';
    clearHeroOverrides(pin);
  }

  function flattenStoryCurtains(pin) {
    /* Mobile only — desktop uses full-bleed cover via story block JS/CSS */
    if (!isMobile()) return;

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
      pins[j].style.setProperty('background', 'transparent', 'important');
      pins[j].style.setProperty('overflow', 'visible', 'important');
    }
    var banners = pin.querySelectorAll('[class*="ai-story-banner-wrapper"]');
    for (var k = 0; k < banners.length; k++) {
      banners[k].style.setProperty('height', 'auto', 'important');
      banners[k].style.setProperty('min-height', '0', 'important');
    }
    var imgs = pin.querySelectorAll('[class*="ai-story-banner-mobile-image"]');
    for (var m = 0; m < imgs.length; m++) {
      imgs[m].style.setProperty('height', 'auto', 'important');
      imgs[m].style.setProperty('max-height', 'none', 'important');
      imgs[m].style.setProperty('width', '100%', 'important');
      imgs[m].style.setProperty('object-fit', 'cover', 'important');
      imgs[m].style.setProperty('display', 'block', 'important');
      imgs[m].style.setProperty('position', 'relative', 'important');
    }
    var desk = pin.querySelectorAll('[class*="ai-story-banner-image-"]');
    for (var d = 0; d < desk.length; d++) {
      desk[d].style.setProperty('display', 'none', 'important');
      desk[d].style.setProperty('visibility', 'hidden', 'important');
      desk[d].style.setProperty('height', '0', 'important');
      desk[d].style.setProperty('position', 'absolute', 'important');
    }
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
    sec.style.setProperty('box-shadow', 'none', 'important');
    pin.style.setProperty('position', 'relative', 'important');
    pin.style.setProperty('height', 'auto', 'important');
    pin.style.setProperty('min-height', '0', 'important');
    pin.style.setProperty('opacity', '1', 'important');
    pin.style.setProperty('overflow', 'visible', 'important');
  }

  function asCard(item, z, contentH, bg) {
    var sec = item.sec;
    var pin = item.pin;
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
    sec.style.setProperty('box-shadow', '0 -12px 32px rgba(0,0,0,0.14)', 'important');
    if (bg) sec.style.setProperty('background-color', bg, 'important');

    pin.style.setProperty('position', 'relative', 'important');
    pin.style.setProperty('width', '100%', 'important');
    pin.style.setProperty('height', 'auto', 'important');
    pin.style.setProperty('min-height', '0', 'important');
    pin.style.setProperty('opacity', '1', 'important');
    pin.style.setProperty('overflow', 'visible', 'important');
    if (bg) pin.style.setProperty('background-color', bg, 'important');
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
    items.push({ sec: sec, pin: ensurePin(sec), isCard: false });
  });

  document.body.classList.add('hp-float-active');
  document.body.classList.add('hp-floating-cards-active');
  if (isMobile()) document.body.classList.add('hp-float-mobile');
  window.dispatchEvent(new CustomEvent('hp-floating-cards:ready'));

  var lastLayoutW = 0;
  var layingOut = false;

  function layout() {
    if (layingOut) return;
    layingOut = true;

    var mobile = isMobile();
    var vh = viewportH();
    var cardIndex = 0;
    document.body.classList.toggle('hp-float-mobile', mobile);

    items.forEach(function (item, index) {
      var sec = item.sec;
      var pin = item.pin;
      var isLast = index === items.length - 1;

      resetSectionStyles(sec, pin);
      flattenStoryCurtains(pin);

      if (pin.querySelector('[class*="ai-story-sticky-track"]') || pin.querySelector('[class*="ai-story-banner-"]')) {
        sec.style.setProperty('height', 'auto', 'important');
        sec.style.setProperty('min-height', '0', 'important');
        sec.style.setProperty('pointer-events', 'auto', 'important');
        sec.style.setProperty('background', 'transparent', 'important');
        /* Never sticky-pin story banners — sticky runway made scroll feel stuck */
        asStrip(item, 10 + index);
        return;
      }

      /*
        Mobile: natural-height flow only.
        Forced 100dvh cards left huge empty white/black voids under short content
        (split CTA, DNA, story banners, etc.).
      */
      if (mobile) {
        asStrip(item, 10 + index);
        return;
      }

      var contentH = Math.max(pin.scrollHeight, pin.offsetHeight, 1);
      var bg = detectBg(pin);
      item.bg = bg;

      if (isKnownStrip(pin) || contentH < vh * 0.28 || isLast || contentH < vh * 0.88) {
        asStrip(item, 10 + index);
        return;
      }

      cardIndex += 1;
      asCard(item, cardIndex, contentH, bg);
    });

    lastLayoutW = window.innerWidth || 0;
    layingOut = false;
  }

  var resizeTimer = null;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var w = window.innerWidth || 0;
      if (Math.abs(w - lastLayoutW) < 40 && document.body.classList.contains('hp-float-mobile') === isMobile()) {
        return;
      }
      layout();
    }, 180);
  }

  layout();
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('orientationchange', function () {
    setTimeout(layout, 250);
  }, { passive: true });
  window.addEventListener('load', function () {
    layout();
    window.dispatchEvent(new CustomEvent('hp-floating-cards:ready'));
  });
  setTimeout(layout, 600);
})();
