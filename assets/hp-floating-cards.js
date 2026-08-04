/*
  Homepage floating section animation — full-viewport sticky cover.

  All screen sizes (monitor → phone): substantial sections stick at least
  100dvh so each fills the screen while the next slides over.
  Story banner is included as a full-screen card (no 200vh sticky runway).
  Thin marquees stay normal flow. One image only per breakpoint.
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
    sec.classList.remove('hp-float-card', 'hp-float-strip', 'hp-float-card--mobile', 'hp-float-story');
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

  /* Flatten story sticky runway; size for full-screen cover inside float card */
  function prepareStoryFullscreen(pin, mobile) {
    var vh = viewportH();
    var fill = vh + 'px';

    var chain = pin.querySelectorAll(
      '[class*="ai-story-sticky-track"], [class*="ai-story-sticky-pin"], [class*="ai-story-banner-wrapper"], [class*="ai-story-sticky-pin"] > [class*="ai-story-banner-"]'
    );
    for (var i = 0; i < chain.length; i++) {
      chain[i].style.setProperty('position', 'relative', 'important');
      chain[i].style.setProperty('display', 'block', 'important');
      chain[i].style.setProperty('visibility', 'visible', 'important');
      chain[i].style.setProperty('opacity', '1', 'important');
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
      intermediates[n].style.setProperty('visibility', 'visible', 'important');
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
      pins[j].style.setProperty('background-color', '#111111', 'important');
    }

    /*
      Use the real <img> src as a CSS background on the wrapper.
      Absolute imgs often collapse to 0px inside sticky overflow:hidden parents
      and leave a solid black panel — background-size:cover always paints.
    */
    var desk = pin.querySelectorAll('img[class*="ai-story-banner-image-"]');
    var mobileImgs = pin.querySelectorAll('img[class*="ai-story-banner-mobile-image"]');
    var activeImg = null;

    if (mobile) {
      activeImg = mobileImgs[0] || desk[0] || null;
      for (var d = 0; d < desk.length; d++) {
        desk[d].style.setProperty('display', 'none', 'important');
      }
    } else {
      activeImg = desk[0] || mobileImgs[0] || null;
      for (var mi = 0; mi < mobileImgs.length; mi++) {
        mobileImgs[mi].style.setProperty('display', 'none', 'important');
      }
    }

    var src = '';
    if (activeImg) {
      src = activeImg.currentSrc || activeImg.src || activeImg.getAttribute('src') || '';
      activeImg.removeAttribute('loading');
      activeImg.setAttribute('loading', 'eager');
      activeImg.setAttribute('fetchpriority', 'high');
      /* Keep img as a visible in-flow cover fallback (not absolute → no 0-height collapse) */
      activeImg.style.setProperty('display', 'block', 'important');
      activeImg.style.setProperty('visibility', 'visible', 'important');
      activeImg.style.setProperty('opacity', '1', 'important');
      activeImg.style.setProperty('position', 'absolute', 'important');
      activeImg.style.setProperty('inset', '0', 'important');
      activeImg.style.setProperty('width', '100%', 'important');
      activeImg.style.setProperty('height', '100%', 'important');
      activeImg.style.setProperty('min-width', '100%', 'important');
      activeImg.style.setProperty('min-height', fill, 'important');
      activeImg.style.setProperty('object-fit', 'cover', 'important');
      activeImg.style.setProperty('object-position', 'center center', 'important');
      activeImg.style.setProperty('z-index', '1', 'important');
      /* Force network load if browser deferred it */
      if (!activeImg.complete && src) {
        var warm = new Image();
        warm.src = src;
      }
    }

    var wraps = pin.querySelectorAll('[class*="ai-story-banner-wrapper"]');
    for (var k = 0; k < wraps.length; k++) {
      wraps[k].style.setProperty('background-color', '#111111', 'important');
      wraps[k].style.setProperty('background-size', 'cover', 'important');
      wraps[k].style.setProperty('background-position', 'center center', 'important');
      wraps[k].style.setProperty('background-repeat', 'no-repeat', 'important');
      if (src) {
        wraps[k].style.setProperty('background-image', 'url("' + src.replace(/"/g, '\\"') + '")', 'important');
      }
    }

    /* Also paint the pin so even if wrapper fails, section is not empty black */
    for (var p = 0; p < pins.length; p++) {
      pins[p].style.setProperty('background-size', 'cover', 'important');
      pins[p].style.setProperty('background-position', 'center center', 'important');
      pins[p].style.setProperty('background-repeat', 'no-repeat', 'important');
      if (src) {
        pins[p].style.setProperty('background-image', 'url("' + src.replace(/"/g, '\\"') + '")', 'important');
      }
    }

    var content = pin.querySelectorAll('[class*="ai-story-banner-content"]');
    for (var c = 0; c < content.length; c++) {
      content[c].style.setProperty('position', 'absolute', 'important');
      content[c].style.setProperty('z-index', '3', 'important');
      content[c].style.setProperty('overflow', 'visible', 'important');
      content[c].style.setProperty('visibility', 'visible', 'important');
      content[c].style.setProperty('opacity', '1', 'important');
      if (!mobile) {
        content[c].style.setProperty('top', '56px', 'important');
      }
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

  function asCard(item, z, contentH, bg, mobile, isStory) {
    var sec = item.sec;
    var pin = item.pin;
    var vh = viewportH();
    /* Full-screen panel on every breakpoint — section fills the monitor/phone */
    var pinH = Math.max(contentH, vh);

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
    if (bg) sec.style.setProperty('background-color', bg, 'important');

    pin.style.setProperty('position', 'relative', 'important');
    pin.style.setProperty('width', '100%', 'important');
    pin.style.setProperty('height', pinH + 'px', 'important');
    pin.style.setProperty('min-height', vh + 'px', 'important');
    pin.style.setProperty('opacity', '1', 'important');
    pin.style.setProperty(
      'overflow',
      isStory || contentH <= vh + 8 ? 'hidden' : 'auto',
      'important'
    );
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

      resetSectionStyles(sec, pin);

      if (story) {
        prepareStoryFullscreen(pin, mobile);
        /* Re-paint when images finish loading (src may be empty until then) */
        if (!item._storyImgBound) {
          item._storyImgBound = true;
          var imgs = pin.querySelectorAll(
            'img[class*="ai-story-banner-image-"], img[class*="ai-story-banner-mobile-image"]'
          );
          for (var ii = 0; ii < imgs.length; ii++) {
            imgs[ii].addEventListener(
              'load',
              function () {
                prepareStoryFullscreen(pin, isMobile());
              },
              { once: true }
            );
          }
        }
      }

      var contentH = story
        ? vh
        : Math.max(pin.scrollHeight, pin.offsetHeight, 1);
      var bg = detectBg(pin) || (story ? '#111111' : '#ffffff');
      item.bg = bg;

      /* Thin marquees / app blocks stay normal flow */
      if (!story && (isKnownStrip(pin) || contentH < vh * 0.22)) {
        asStrip(item, 10 + index);
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
