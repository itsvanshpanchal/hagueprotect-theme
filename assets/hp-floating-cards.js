/*
  Homepage floating section animation (gap-safe).

  Desktop: tall sections stick at natural height; short strips stay in flow.
  Mobile: cinematic full-viewport cover panels (100dvh) so each section
  fills the screen before the next slides over — no half-screen stacking,
  no white gaps, lighter paint for less lag.
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
    /* Prefer visualViewport / svh-stable height; avoid URL-bar thrash mid-scroll */
    var vv = window.visualViewport;
    if (vv && vv.height > 0 && isMobile()) {
      /* Use the larger of layout vs visual so panels stay full-screen when chrome hides */
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

  function isHeroPin(pin) {
    return !!pin.querySelector('.hero-fullscreen');
  }

  function seedFillMedia(pin, vh) {
    /* Absolute-positioned hero/story media report ~0 height — seed before measure */
    var hero = pin.querySelector('.hero-fullscreen');
    if (hero) {
      hero.style.setProperty('height', vh + 'px', 'important');
      hero.style.setProperty('min-height', vh + 'px', 'important');
      hero.style.setProperty('max-height', 'none', 'important');
      hero.style.setProperty('aspect-ratio', 'auto', 'important');
    }
  }

  function paintHero(pin, vh) {
    var hero = pin.querySelector('.hero-fullscreen');
    if (!hero) return;
    hero.style.setProperty('position', 'relative', 'important');
    hero.style.setProperty('height', vh + 'px', 'important');
    hero.style.setProperty('min-height', vh + 'px', 'important');
    hero.style.setProperty('max-height', 'none', 'important');
    hero.style.setProperty('aspect-ratio', 'auto', 'important');
    hero.style.setProperty('width', '100%', 'important');
    hero.style.setProperty('overflow', 'hidden', 'important');
    hero.style.setProperty('opacity', '1', 'important');
    hero.style.setProperty('visibility', 'visible', 'important');

    var bg = hero.querySelector('.hero-fullscreen__bg');
    if (bg) {
      bg.style.setProperty('position', 'absolute', 'important');
      bg.style.setProperty('inset', '0', 'important');
      bg.style.setProperty('width', '100%', 'important');
      bg.style.setProperty('height', '100%', 'important');
      bg.style.setProperty('z-index', '1', 'important');
      bg.style.setProperty('opacity', '1', 'important');
      bg.style.setProperty('visibility', 'visible', 'important');
    }

    var imgs = hero.querySelectorAll('.hero-fullscreen__bg-img, .hero-fullscreen__bg picture, .hero-fullscreen__bg img');
    for (var i = 0; i < imgs.length; i++) {
      imgs[i].style.setProperty('position', 'absolute', 'important');
      imgs[i].style.setProperty('inset', '0', 'important');
      imgs[i].style.setProperty('width', '100%', 'important');
      imgs[i].style.setProperty('height', '100%', 'important');
      imgs[i].style.setProperty('object-fit', 'cover', 'important');
      imgs[i].style.setProperty('opacity', '1', 'important');
      imgs[i].style.setProperty('visibility', 'visible', 'important');
      imgs[i].style.setProperty('display', 'block', 'important');
    }

    var content = hero.querySelector('.hero-fullscreen__content');
    if (content) {
      content.style.setProperty('z-index', '3', 'important');
      content.style.setProperty('opacity', '1', 'important');
      content.style.setProperty('visibility', 'visible', 'important');
    }
  }

  function isKnownStrip(pin) {
    if (isHeroPin(pin)) return false;
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
      pins[j].style.setProperty('height', isMobile() ? '100%' : 'auto', 'important');
      pins[j].style.setProperty('min-height', isMobile() ? '100%' : '0', 'important');
      pins[j].style.setProperty('z-index', 'auto', 'important');
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

  function asCard(item, z, contentH, bg, mobile) {
    var sec = item.sec;
    var pin = item.pin;
    var vh = viewportH();
    /* Mobile: always fill the screen. Desktop: natural content height. */
    var pinH = mobile ? Math.max(contentH, vh) : Math.max(contentH, 1);

    item.isCard = true;
    sec.classList.add('hp-float-card');
    if (mobile) sec.classList.add('hp-float-card--mobile');
    sec.style.setProperty('--hp-z', String(z));
    sec.style.setProperty('position', 'sticky', 'important');
    sec.style.setProperty('top', '0px', 'important');
    sec.style.setProperty('z-index', String(z), 'important');
    sec.style.setProperty('height', pinH + 'px', 'important');
    sec.style.setProperty('min-height', mobile ? vh + 'px' : '0', 'important');
    sec.style.setProperty('margin-top', '0px', 'important');
    sec.style.setProperty('margin-bottom', '0px', 'important');
    sec.style.setProperty('transform', 'none', 'important');
    sec.style.setProperty('opacity', '1', 'important');
    sec.style.setProperty('visibility', 'visible', 'important');
    sec.style.setProperty('box-shadow', mobile ? 'none' : '0 -12px 32px rgba(0,0,0,0.14)', 'important');
    if (bg) sec.style.setProperty('background-color', bg, 'important');

    pin.style.setProperty('position', 'relative', 'important');
    pin.style.setProperty('width', '100%', 'important');
    pin.style.setProperty('opacity', '1', 'important');
    if (mobile) {
      pin.style.setProperty('height', pinH + 'px', 'important');
      pin.style.setProperty('min-height', vh + 'px', 'important');
      /* Clip to panel so next cover is clean; scroll inside if content is taller */
      pin.style.setProperty('overflow', contentH > vh + 8 ? 'auto' : 'hidden', 'important');
      pin.style.setProperty('-webkit-overflow-scrolling', 'touch');
    } else {
      pin.style.setProperty('height', 'auto', 'important');
      pin.style.setProperty('min-height', '0', 'important');
      pin.style.setProperty('overflow', 'visible', 'important');
    }
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
      var hero = isHeroPin(pin);

      resetSectionStyles(sec, pin);
      flattenStoryCurtains(pin);

      if (pin.querySelector('[class*="ai-story-sticky-track"]')) {
        sec.style.setProperty('height', 'auto', 'important');
        sec.style.setProperty('min-height', '0', 'important');
        sec.style.setProperty('pointer-events', 'auto', 'important');
      }

      /* Seed absolute-fill sections so measure isn't ~0 */
      if (mobile || hero) seedFillMedia(pin, vh);

      var contentH = Math.max(pin.scrollHeight, pin.offsetHeight, vh * (hero ? 1 : 0), 1);
      if (hero) contentH = Math.max(contentH, vh);
      var bg = detectBg(pin);
      if (hero && !bg) bg = '#111111';
      item.bg = bg;

      /* Thin marquees / app blocks stay normal flow — never the hero */
      if (!hero && (isKnownStrip(pin) || contentH < vh * 0.28)) {
        asStrip(item, 10 + index);
        return;
      }

      if (mobile || hero) {
        /*
          Mobile (and hero on all breakpoints in the stack): full-screen cover card.
        */
        cardIndex += 1;
        asCard(item, cardIndex, contentH, bg || '#ffffff', mobile || hero);
        if (hero) paintHero(pin, vh);
        return;
      }

      /* Desktop: only near-full panels stick; last never sticks over footer */
      if (isLast || contentH < vh * 0.88) {
        asStrip(item, 10 + index);
        return;
      }

      cardIndex += 1;
      asCard(item, cardIndex, contentH, bg, false);
    });

    lastLayoutW = window.innerWidth || 0;
    layingOut = false;
  }

  /* Resize: only re-layout on real width / orientation changes (not URL-bar height flicker) */
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
  /* One post-image pass — avoid repeated layout storms that cause mobile lag */
  setTimeout(layout, 600);
})();
