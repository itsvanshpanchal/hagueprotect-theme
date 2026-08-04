/*
  Homepage floating section animation — full-viewport sticky cover.

  Full-screen cards only for visual panels (hero, story, materials, video).
  Short / text sections stay natural-height strips — no forced 100vh black voids.
  Empty story banners (no heading/text) are stripped so they cannot become black panels.
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
    var vv = window.visualViewport;
    if (vv && vv.height > 0 && isMobile()) {
      return Math.round(Math.max(window.innerHeight || 0, vv.height));
    }
    return window.innerHeight || document.documentElement.clientHeight || 800;
  }

  function isShopifySection(el) {
    return el && el.classList && el.classList.contains('shopify-section');
  }

  function isTooThin(sec) {
    return sec.offsetHeight > 0 && sec.offsetHeight < 32;
  }

  function isKnownStrip(pin) {
    return !!(pin.querySelector(STRIP_SEL) && pin.children.length <= 3);
  }

  function isStoryPin(pin) {
    return !!(
      pin.querySelector('[class*="ai-story-sticky-track"]') ||
      pin.querySelector('[class*="ai-story-banner-"]')
    );
  }

  /* Empty image-only story blocks become solid black 100vh panels — skip full-screen */
  function isEmptyStory(pin) {
    if (!isStoryPin(pin)) return false;
    var heading = pin.querySelector('[class*="ai-story-banner-heading"]');
    var sub = pin.querySelector('[class*="ai-story-banner-subheading"]');
    var text = pin.querySelector('[class*="ai-story-banner-text"]');
    var hasCopy =
      (heading && heading.textContent.replace(/\s+/g, '').length > 0) ||
      (sub && sub.textContent.replace(/\s+/g, '').length > 0) ||
      (text && text.textContent.replace(/\s+/g, '').length > 0);
    return !hasCopy;
  }

  function isVisualFullscreen(pin) {
    if (pin.querySelector('.hero-fullscreen')) return true;
    if (isStoryPin(pin) && !isEmptyStory(pin)) return true;
    if (pin.querySelector('.mat-section')) return true;
    if (pin.querySelector('.bs-coverflow')) return true;
    if (pin.querySelector('[class*="horizontal-product"], .hps-, [data-hps]')) return true;
    if (pin.querySelector('video')) return true;
    return false;
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

  function clearStoryOverrides(pin) {
    var nodes = pin.querySelectorAll(
      '[class*="ai-story-sticky-track"], [class*="ai-story-sticky-pin"], [class*="ai-story-banner-"], img'
    );
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].style.cssText = '';
    }
    var kids = pin.children;
    for (var k = 0; k < kids.length; k++) {
      kids[k].style.cssText = '';
    }
  }

  function resetSectionStyles(sec, pin) {
    sec.classList.remove('hp-float-card', 'hp-float-strip', 'hp-float-card--mobile', 'hp-float-story', 'hp-float-hidden');
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
      'box-shadow',
      'display'
    ].forEach(function (prop) {
      sec.style.removeProperty(prop);
    });
    pin.style.cssText = '';
    clearHeroOverrides(pin);
    clearStoryOverrides(pin);
  }

  /* Hide empty image-only story banners (were solid black full-screen panels) */
  function hideEmptyStory(item) {
    var sec = item.sec;
    var pin = item.pin;
    item.isCard = false;
    sec.classList.add('hp-float-hidden');
    sec.style.setProperty('display', 'none', 'important');
    sec.style.setProperty('height', '0', 'important');
    sec.style.setProperty('min-height', '0', 'important');
    sec.style.setProperty('margin', '0', 'important');
    sec.style.setProperty('padding', '0', 'important');
    sec.style.setProperty('overflow', 'hidden', 'important');
    sec.style.setProperty('visibility', 'hidden', 'important');
    pin.style.setProperty('display', 'none', 'important');
    pin.style.setProperty('height', '0', 'important');
  }

  function prepareStoryFullscreen(pin, mobile) {
    var vh = viewportH();
    var fill = vh + 'px';

    var chain = pin.querySelectorAll(
      '[class*="ai-story-sticky-track"], [class*="ai-story-sticky-pin"], [class*="ai-story-banner-wrapper"], [class*="ai-story-sticky-pin"] > [class*="ai-story-banner-"]'
    );
    for (var i = 0; i < chain.length; i++) {
      chain[i].style.setProperty('position', 'relative', 'important');
      chain[i].style.setProperty('display', 'block', 'important');
      chain[i].style.setProperty('width', '100%', 'important');
      chain[i].style.setProperty('max-width', 'none', 'important');
      chain[i].style.setProperty('height', fill, 'important');
      chain[i].style.setProperty('min-height', fill, 'important');
      chain[i].style.setProperty('max-height', fill, 'important');
      chain[i].style.setProperty('overflow', 'hidden', 'important');
      chain[i].style.setProperty('box-sizing', 'border-box', 'important');
      chain[i].style.setProperty('margin', '0', 'important');
      chain[i].style.setProperty('padding', '0', 'important');
    }

    var intermediates = pin.children;
    for (var n = 0; n < intermediates.length; n++) {
      intermediates[n].style.setProperty('display', 'block', 'important');
      intermediates[n].style.setProperty('width', '100%', 'important');
      intermediates[n].style.setProperty('height', fill, 'important');
      intermediates[n].style.setProperty('min-height', fill, 'important');
      intermediates[n].style.setProperty('max-height', fill, 'important');
      intermediates[n].style.setProperty('max-width', 'none', 'important');
      intermediates[n].style.setProperty('overflow', 'hidden', 'important');
      intermediates[n].style.setProperty('margin', '0', 'important');
    }

    var pins = pin.querySelectorAll('[class*="ai-story-sticky-pin"]');
    for (var j = 0; j < pins.length; j++) {
      pins[j].style.setProperty('top', 'auto', 'important');
      pins[j].style.setProperty('z-index', 'auto', 'important');
      /* Match image — avoid visible black plate under/around banner */
      pins[j].style.setProperty('background', 'transparent', 'important');
    }

    var wraps = pin.querySelectorAll('[class*="ai-story-banner-wrapper"]');
    for (var k = 0; k < wraps.length; k++) {
      wraps[k].style.setProperty('background-color', 'transparent', 'important');
    }

    var desk = pin.querySelectorAll('[class*="ai-story-banner-image-"]');
    var mobileImgs = pin.querySelectorAll('[class*="ai-story-banner-mobile-image"]');

    function fillImage(el) {
      el.style.setProperty('display', 'block', 'important');
      el.style.setProperty('visibility', 'visible', 'important');
      el.style.setProperty('position', 'absolute', 'important');
      el.style.setProperty('inset', '0', 'important');
      el.style.setProperty('top', '0', 'important');
      el.style.setProperty('left', '0', 'important');
      el.style.setProperty('right', '0', 'important');
      el.style.setProperty('bottom', '0', 'important');
      el.style.setProperty('width', '100%', 'important');
      el.style.setProperty('height', '100%', 'important');
      el.style.setProperty('min-width', '100%', 'important');
      el.style.setProperty('min-height', '100%', 'important');
      el.style.setProperty('max-width', 'none', 'important');
      el.style.setProperty('max-height', 'none', 'important');
      el.style.setProperty('object-fit', 'cover', 'important');
      el.style.setProperty('object-position', 'center center', 'important');
    }

    function hideImage(el) {
      el.style.setProperty('display', 'none', 'important');
      el.style.setProperty('visibility', 'hidden', 'important');
      el.style.setProperty('height', '0', 'important');
      el.style.setProperty('width', '0', 'important');
      el.style.setProperty('min-height', '0', 'important');
      el.style.setProperty('min-width', '0', 'important');
      el.style.setProperty('position', 'absolute', 'important');
      el.style.setProperty('pointer-events', 'none', 'important');
    }

    if (mobile) {
      for (var d = 0; d < desk.length; d++) hideImage(desk[d]);
      for (var m = 0; m < mobileImgs.length; m++) fillImage(mobileImgs[m]);
    } else {
      for (var mi = 0; mi < mobileImgs.length; mi++) hideImage(mobileImgs[mi]);
      for (var di = 0; di < desk.length; di++) fillImage(desk[di]);
    }

    var content = pin.querySelectorAll('[class*="ai-story-banner-content"]');
    for (var c = 0; c < content.length; c++) {
      content[c].style.setProperty('position', 'absolute', 'important');
      content[c].style.setProperty('z-index', '3', 'important');
      content[c].style.setProperty('overflow', 'visible', 'important');
      if (!mobile) {
        content[c].style.setProperty('top', '56px', 'important');
      }
    }
  }

  function prepareMaterialsFullscreen(pin) {
    var vh = viewportH();
    var fill = vh + 'px';
    var mat = pin.querySelector('.mat-section');
    if (!mat) return;
    mat.style.setProperty('min-height', fill, 'important');
    mat.style.setProperty('height', fill, 'important');
    mat.style.setProperty('max-height', fill, 'important');
    mat.style.setProperty('overflow', 'hidden', 'important');
    var media = mat.querySelectorAll('img, picture, video, .mat-media, .mat-bg, [class*="mat-"] img');
    for (var i = 0; i < media.length; i++) {
      var el = media[i];
      if (el.tagName === 'IMG' || el.tagName === 'VIDEO') {
        el.style.setProperty('object-fit', 'cover', 'important');
        el.style.setProperty('width', '100%', 'important');
        el.style.setProperty('height', '100%', 'important');
      }
    }
  }

  function asStrip(item, z, bg) {
    var sec = item.sec;
    var pin = item.pin;
    item.isCard = false;
    sec.classList.add('hp-float-strip');
    sec.style.setProperty('position', 'relative', 'important');
    sec.style.setProperty('top', 'auto', 'important');
    sec.style.setProperty('z-index', String(z), 'important');
    sec.style.setProperty('height', 'auto', 'important');
    sec.style.setProperty('min-height', '0', 'important');
    sec.style.setProperty('max-height', 'none', 'important');
    sec.style.setProperty('margin-top', '0px', 'important');
    sec.style.setProperty('margin-bottom', '0px', 'important');
    sec.style.setProperty('transform', 'none', 'important');
    sec.style.setProperty('opacity', '1', 'important');
    sec.style.setProperty('visibility', 'visible', 'important');
    sec.style.setProperty('box-shadow', 'none', 'important');
    sec.style.setProperty('overflow', 'visible', 'important');
    /* Opaque strip so sticky dark cards never flash black gaps underneath */
    sec.style.setProperty('background-color', bg || '#ffffff', 'important');
    pin.style.setProperty('position', 'relative', 'important');
    pin.style.setProperty('height', 'auto', 'important');
    pin.style.setProperty('min-height', '0', 'important');
    pin.style.setProperty('opacity', '1', 'important');
    pin.style.setProperty('overflow', 'visible', 'important');
    if (bg) pin.style.setProperty('background-color', bg, 'important');
  }

  function asCard(item, z, contentH, bg, mobile, isStory) {
    var sec = item.sec;
    var pin = item.pin;
    var vh = viewportH();
    var pinH = Math.max(Math.min(contentH, vh * 1.05), vh);

    item.isCard = true;
    sec.classList.add('hp-float-card');
    if (mobile) sec.classList.add('hp-float-card--mobile');
    if (isStory) sec.classList.add('hp-float-story');
    sec.style.setProperty('--hp-z', String(z));
    sec.style.setProperty('position', 'sticky', 'important');
    sec.style.setProperty('top', '0px', 'important');
    sec.style.setProperty('z-index', String(z), 'important');
    sec.style.setProperty('height', pinH + 'px', 'important');
    sec.style.setProperty('min-height', vh + 'px', 'important');
    sec.style.setProperty('max-height', pinH + 'px', 'important');
    sec.style.setProperty('margin-top', '0px', 'important');
    sec.style.setProperty('margin-bottom', '0px', 'important');
    sec.style.setProperty('transform', 'none', 'important');
    sec.style.setProperty('opacity', '1', 'important');
    sec.style.setProperty('visibility', 'visible', 'important');
    sec.style.setProperty(
      'box-shadow',
      mobile ? 'none' : '0 -12px 32px rgba(0,0,0,0.14)',
      'important'
    );
    sec.style.setProperty('overflow', 'hidden', 'important');
    if (bg) sec.style.setProperty('background-color', bg, 'important');

    pin.style.setProperty('position', 'relative', 'important');
    pin.style.setProperty('width', '100%', 'important');
    pin.style.setProperty('height', pinH + 'px', 'important');
    pin.style.setProperty('min-height', vh + 'px', 'important');
    pin.style.setProperty('max-height', pinH + 'px', 'important');
    pin.style.setProperty('opacity', '1', 'important');
    pin.style.setProperty('overflow', 'hidden', 'important');
    if (mobile) pin.style.setProperty('-webkit-overflow-scrolling', 'touch');
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
      var story = isStoryPin(pin);
      var emptyStory = story && isEmptyStory(pin);
      var isLast = index === items.length - 1;

      resetSectionStyles(sec, pin);

      if (emptyStory) {
        hideEmptyStory(item);
        return;
      }

      if (story) {
        prepareStoryFullscreen(pin, mobile);
      } else if (pin.querySelector('.mat-section')) {
        prepareMaterialsFullscreen(pin);
      }

      var visual = isVisualFullscreen(pin);
      var contentH = visual ? vh : Math.max(pin.scrollHeight, pin.offsetHeight, 1);
      var bg = detectBg(pin);
      if (!bg) bg = story ? '#111111' : '#ffffff';
      /* Never paint pure black voids under non-image content */
      if (!story && (bg === 'rgb(0, 0, 0)' || bg === '#000000' || bg === '#000')) {
        bg = detectBg(pin) || '#111111';
      }
      item.bg = bg;

      if (isKnownStrip(pin) || (!visual && contentH < vh * 0.55) || (!visual && isLast)) {
        asStrip(item, 10 + index, bg === '#111111' && !visual ? '#ffffff' : bg);
        return;
      }

      if (!visual && contentH < vh * 0.88) {
        asStrip(item, 10 + index, bg);
        return;
      }

      cardIndex += 1;
      asCard(item, cardIndex, contentH, bg, mobile, story);
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
