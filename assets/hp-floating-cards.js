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
    '.corp-marquee, .corporate-gifting-marquee, [class*="marquee"], .announcement, .apps, [class*="split-cta"], .section-split-cta';

  function isMobile() {
    return MQ_MOBILE.matches;
  }

  function viewportH() {
    var vv = window.visualViewport;
    if (vv && vv.height > 0 && isMobile()) {
      /* Prefer the larger value so sticky cards never leave a gap under the fold */
      return Math.round(Math.max(window.innerHeight || 0, vv.height));
    }
    return window.innerHeight || document.documentElement.clientHeight || 800;
  }

  function viewportFill(mobile) {
    if (mobile) return '100dvh';
    return viewportH() + 'px';
  }

  function isShopifySection(el) {
    return el && el.classList && el.classList.contains('shopify-section');
  }

  function isTooThin(sec) {
    return sec.offsetHeight > 0 && sec.offsetHeight < 32;
  }

  function isKnownStrip(pin) {
    return !!(pin.querySelector(STRIP_SEL));
  }

  function isSplitCtaPin(pin) {
    return !!(
      pin.querySelector('[class*="split-cta"]') ||
      (pin.parentElement && pin.parentElement.classList.contains('section-split-cta'))
    );
  }

  function isSplitCtaSection(sec) {
    return !!(
      sec &&
      (sec.classList.contains('section-split-cta') ||
        sec.querySelector('[class*="split-cta"]'))
    );
  }

  function isDnaPin(pin) {
    return !!(
      pin.querySelector('[data-hp-dna-section]') ||
      pin.querySelector('[class*="hp-dna-"]') ||
      (pin.parentElement && pin.parentElement.classList.contains('section-hague-protect-dna'))
    );
  }

  function isDnaSection(sec) {
    return !!(sec && sec.classList.contains('section-hague-protect-dna'));
  }

  function isStoryPin(pin) {
    return !!(
      pin.querySelector('[class*="ai-story-sticky-track"]') ||
      pin.querySelector('[class*="ai-story-banner-"]')
    );
  }

  function isHeroPin(pin) {
    return !!pin.querySelector('.hero-fullscreen');
  }

  function isCommunityPin(pin) {
    return !!(pin && pin.querySelector('.comm-section, .comm-swiper, .comm-slider-container'));
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
      'background',
      'background-image',
      'background-size',
      'background-position',
      'background-repeat',
      'background-color'
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

  /* Keep mobile hero painted — sticky stacks were covering/collapsing it after first paint */
  function prepareHeroFullscreen(pin) {
    var fill = '100dvh';
    var hero = pin.querySelector('.hero-fullscreen');
    if (!hero) return;

    pin.style.setProperty('height', fill, 'important');
    pin.style.setProperty('min-height', '100svh', 'important');
    pin.style.setProperty('overflow', 'hidden', 'important');
    pin.style.setProperty('opacity', '1', 'important');
    pin.style.setProperty('visibility', 'visible', 'important');
    pin.style.setProperty('background-color', '#111111', 'important');
    pin.style.setProperty('background-size', 'cover', 'important');
    pin.style.setProperty('background-position', 'center 22%', 'important');
    pin.style.setProperty('background-repeat', 'no-repeat', 'important');

    hero.style.setProperty('display', 'block', 'important');
    hero.style.setProperty('position', 'relative', 'important');
    hero.style.setProperty('width', '100%', 'important');
    hero.style.setProperty('height', fill, 'important');
    hero.style.setProperty('min-height', '100svh', 'important');
    hero.style.setProperty('max-height', 'none', 'important');
    hero.style.setProperty('aspect-ratio', 'auto', 'important');
    hero.style.setProperty('margin', '0', 'important');
    hero.style.setProperty('padding', '0', 'important');
    hero.style.setProperty('overflow', 'hidden', 'important');
    hero.style.setProperty('opacity', '1', 'important');
    hero.style.setProperty('visibility', 'visible', 'important');
    hero.style.setProperty('background-color', '#111111', 'important');
    hero.style.setProperty('background-size', 'cover', 'important');
    hero.style.setProperty('background-position', 'center 22%', 'important');
    hero.style.setProperty('background-repeat', 'no-repeat', 'important');

    var bg = pin.querySelector('.hero-fullscreen__bg');
    if (bg) {
      bg.style.setProperty('position', 'absolute', 'important');
      bg.style.setProperty('inset', '0', 'important');
      bg.style.setProperty('width', '100%', 'important');
      bg.style.setProperty('height', '100%', 'important');
      bg.style.setProperty('opacity', '1', 'important');
      bg.style.setProperty('visibility', 'visible', 'important');
      bg.style.setProperty('z-index', '1', 'important');
    }

    var picture = pin.querySelector('.hero-fullscreen__bg picture');
    if (picture) {
      picture.style.setProperty('position', 'absolute', 'important');
      picture.style.setProperty('inset', '0', 'important');
      picture.style.setProperty('width', '100%', 'important');
      picture.style.setProperty('height', '100%', 'important');
      picture.style.setProperty('display', 'block', 'important');
      picture.style.setProperty('opacity', '1', 'important');
      picture.style.setProperty('visibility', 'visible', 'important');
    }

    var img = pin.querySelector('.hero-fullscreen__bg-img, .hero-fullscreen__bg img');
    var src = '';
    if (img) {
      src = img.currentSrc || img.src || img.getAttribute('src') || '';
      img.removeAttribute('loading');
      img.setAttribute('loading', 'eager');
      img.setAttribute('fetchpriority', 'high');
      img.style.setProperty('position', 'absolute', 'important');
      img.style.setProperty('inset', '0', 'important');
      img.style.setProperty('width', '100%', 'important');
      img.style.setProperty('height', '100%', 'important');
      img.style.setProperty('min-width', '100%', 'important');
      img.style.setProperty('min-height', '100%', 'important');
      img.style.setProperty('object-fit', 'cover', 'important');
      img.style.setProperty('object-position', 'center 22%', 'important');
      img.style.setProperty('display', 'block', 'important');
      img.style.setProperty('opacity', '1', 'important');
      img.style.setProperty('visibility', 'visible', 'important');
      img.style.setProperty('z-index', '1', 'important');
      if (!img.complete && src) {
        var warm = new Image();
        warm.src = src;
      }
    }

    if (src) {
      var url = 'url("' + String(src).replace(/"/g, '') + '")';
      hero.style.setProperty('background-image', url, 'important');
      pin.style.setProperty('background-image', url, 'important');
    }

    var content = pin.querySelector('.hero-fullscreen__content');
    if (content) {
      content.style.setProperty('position', 'absolute', 'important');
      content.style.setProperty('z-index', '3', 'important');
      content.style.setProperty('opacity', '1', 'important');
      content.style.setProperty('visibility', 'visible', 'important');
    }
  }

  function resetSectionStyles(sec, pin) {
    var hero = isHeroPin(pin);
    var story = isStoryPin(pin);
    sec.classList.remove(
      'hp-float-card',
      'hp-float-strip',
      'hp-float-card--mobile',
      'hp-float-story',
      'hp-float-hero',
      'hp-float-dna'
    );
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

    /*
      On mobile, wiping pin/hero/story inline styles causes a one-frame collapse
      ("loads once then hides" / black panel). Keep painted media while float classes reset.
    */
    if ((hero || story) && isMobile()) {
      [
        'position',
        'top',
        'z-index',
        'box-shadow',
        'transform',
        'margin-top',
        'margin-bottom'
      ].forEach(function (prop) {
        pin.style.removeProperty(prop);
      });
      return;
    }

    pin.style.cssText = '';
    clearHeroOverrides(pin);
  }

  /* Flatten story sticky runway; size for full-screen cover inside float card */
  function prepareStoryFullscreen(pin, mobile) {
    var fill = viewportFill(mobile);

    var chain = pin.querySelectorAll(
      '[class*="ai-story-sticky-track"], [class*="ai-story-sticky-pin"], [class*="ai-story-banner-wrapper"], [class*="ai-story-sticky-pin"] > [class*="ai-story-banner-"], .ai-story-banner'
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
      chain[i].style.setProperty('max-height', 'none', 'important');
      chain[i].style.setProperty('overflow', 'hidden', 'important');
      chain[i].style.setProperty('box-sizing', 'border-box', 'important');
      chain[i].style.setProperty('margin', '0', 'important');
      chain[i].style.setProperty('padding', '0', 'important');
      chain[i].style.setProperty('left', '0', 'important');
      chain[i].style.setProperty('right', '0', 'important');
    }

    var intermediates = pin.children;
    for (var n = 0; n < intermediates.length; n++) {
      intermediates[n].style.setProperty('display', 'block', 'important');
      intermediates[n].style.setProperty('visibility', 'visible', 'important');
      intermediates[n].style.setProperty('width', '100%', 'important');
      intermediates[n].style.setProperty('height', fill, 'important');
      intermediates[n].style.setProperty('min-height', fill, 'important');
      intermediates[n].style.setProperty('max-height', 'none', 'important');
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

    var wraps = pin.querySelectorAll('[data-hp-story-wrap], [class*="ai-story-banner-wrapper"]');
    var cover = pin.querySelector('[data-hp-story-cover], .ai-story-banner-cover');
    var src = '';

    if (wraps[0]) {
      src = mobile
        ? wraps[0].getAttribute('data-mobile-bg') || wraps[0].getAttribute('data-desktop-bg') || ''
        : wraps[0].getAttribute('data-desktop-bg') || wraps[0].getAttribute('data-mobile-bg') || '';
    }

    if (cover) {
      if (!src) {
        src = cover.currentSrc || cover.src || cover.getAttribute('src') || '';
      }
      cover.removeAttribute('loading');
      cover.setAttribute('loading', 'eager');
      cover.setAttribute('fetchpriority', 'high');
      cover.style.setProperty('display', 'block', 'important');
      cover.style.setProperty('visibility', 'visible', 'important');
      cover.style.setProperty('opacity', '1', 'important');
      cover.style.setProperty('position', 'absolute', 'important');
      cover.style.setProperty('inset', '0', 'important');
      cover.style.setProperty('width', '100%', 'important');
      cover.style.setProperty('height', '100%', 'important');
      cover.style.setProperty('min-width', '100%', 'important');
      cover.style.setProperty('min-height', '100%', 'important');
      cover.style.setProperty('object-fit', 'cover', 'important');
      cover.style.setProperty('object-position', 'center center', 'important');
      cover.style.setProperty('z-index', '1', 'important');
      if (!cover.complete && src) {
        var warm = new Image();
        warm.src = src;
      }
    }

    var pictures = pin.querySelectorAll('.ai-story-banner-picture, picture.ai-story-banner-picture');
    for (var pi = 0; pi < pictures.length; pi++) {
      pictures[pi].style.setProperty('position', 'absolute', 'important');
      pictures[pi].style.setProperty('inset', '0', 'important');
      pictures[pi].style.setProperty('width', '100%', 'important');
      pictures[pi].style.setProperty('height', '100%', 'important');
      pictures[pi].style.setProperty('display', 'block', 'important');
      pictures[pi].style.setProperty('z-index', '1', 'important');
      pictures[pi].style.setProperty('margin', '0', 'important');
      pictures[pi].style.setProperty('padding', '0', 'important');
    }

    for (var k = 0; k < wraps.length; k++) {
      wraps[k].style.setProperty('background-color', '#111111', 'important');
      wraps[k].style.setProperty('background-size', 'cover', 'important');
      wraps[k].style.setProperty('background-position', 'center center', 'important');
      wraps[k].style.setProperty('background-repeat', 'no-repeat', 'important');
      if (src) {
        wraps[k].style.setProperty('background-image', 'url("' + src.replace(/"/g, '\\"') + '")', 'important');
      }
    }

    for (var p = 0; p < pins.length; p++) {
      pins[p].style.setProperty('background-size', 'cover', 'important');
      pins[p].style.setProperty('background-position', 'center center', 'important');
      pins[p].style.setProperty('background-repeat', 'no-repeat', 'important');
      if (src) {
        pins[p].style.setProperty('background-image', 'url("' + src.replace(/"/g, '\\"') + '")', 'important');
      }
    }

    /* Also paint the float pin itself so no black void if inner wrappers lag */
    if (src) {
      pin.style.setProperty('background-image', 'url("' + src.replace(/"/g, '\\"') + '")', 'important');
      pin.style.setProperty('background-size', 'cover', 'important');
      pin.style.setProperty('background-position', 'center center', 'important');
      pin.style.setProperty('background-repeat', 'no-repeat', 'important');
      pin.style.setProperty('background-color', '#111111', 'important');
    }

    var content = pin.querySelectorAll('[class*="ai-story-banner-content"]');
    for (var c = 0; c < content.length; c++) {
      content[c].style.setProperty('position', 'absolute', 'important');
      content[c].style.setProperty('z-index', '3', 'important');
      content[c].style.setProperty('overflow', 'visible', 'important');
      content[c].style.setProperty('visibility', 'visible', 'important');
      content[c].style.setProperty('opacity', '1', 'important');
      content[c].style.setProperty('display', 'flex', 'important');
      content[c].style.setProperty('flex-direction', 'column', 'important');
      if (mobile) {
        content[c].style.setProperty('top', (content[c].getAttribute('data-top-m') || '24') + 'px', 'important');
        content[c].style.setProperty('left', (content[c].getAttribute('data-left-m') || '16') + 'px', 'important');
        content[c].style.setProperty(
          'max-width',
          'min(90%, ' + (content[c].getAttribute('data-max-m') || '280') + 'px)',
          'important'
        );
        content[c].style.setProperty('padding', (content[c].getAttribute('data-pad-m') || '16') + 'px', 'important');
      } else {
        content[c].style.setProperty('top', '56px', 'important');
      }
    }

    var textNodes = pin.querySelectorAll(
      '[class*="ai-story-banner-subheading"], [class*="ai-story-banner-heading"], [class*="ai-story-banner-text"]'
    );
    for (var t = 0; t < textNodes.length; t++) {
      textNodes[t].style.setProperty('visibility', 'visible', 'important');
      textNodes[t].style.setProperty('opacity', '1', 'important');
      textNodes[t].style.setProperty('display', 'block', 'important');
    }

    /* Hide Learn More (and any hide-mobile story buttons) — must use inline !important
       so it wins over other float visibility rules. */
    var hideWraps = pin.querySelectorAll('.ai-story-banner-button-wrapper--hide-mobile');
    for (var h = 0; h < hideWraps.length; h++) {
      hideWraps[h].style.setProperty('display', 'none', 'important');
      hideWraps[h].style.setProperty('visibility', 'hidden', 'important');
      hideWraps[h].style.setProperty('opacity', '0', 'important');
      hideWraps[h].style.setProperty('pointer-events', 'none', 'important');
      hideWraps[h].setAttribute('hidden', '');
      hideWraps[h].setAttribute('aria-hidden', 'true');
    }

    var btns = pin.querySelectorAll('a[class*="ai-story-banner-button"]');
    for (var b = 0; b < btns.length; b++) {
      if (btns[b].closest && btns[b].closest('.ai-story-banner-button-wrapper--hide-mobile')) {
        btns[b].style.setProperty('display', 'none', 'important');
        continue;
      }
      btns[b].style.setProperty('display', 'inline-block', 'important');
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
    sec.style.setProperty('max-height', 'none', 'important');
    sec.style.setProperty('margin-top', '0px', 'important');
    sec.style.setProperty('margin-bottom', '0px', 'important');
    sec.style.setProperty('transform', 'none', 'important');
    sec.style.setProperty('opacity', '1', 'important');
    sec.style.setProperty('visibility', 'visible', 'important');
    sec.style.setProperty('display', 'block', 'important');
    sec.style.setProperty('box-shadow', 'none', 'important');
    sec.style.setProperty('overflow', 'visible', 'important');
    pin.style.setProperty('position', 'relative', 'important');
    pin.style.setProperty('height', 'auto', 'important');
    pin.style.setProperty('min-height', '0', 'important');
    pin.style.setProperty('max-height', 'none', 'important');
    pin.style.setProperty('opacity', '1', 'important');
    pin.style.setProperty('visibility', 'visible', 'important');
    pin.style.setProperty('overflow', 'visible', 'important');
    pin.style.setProperty('display', 'block', 'important');
  }

  /* Mobile hero: sticky full-screen card so the next section floats over it */
  function asHeroOnce(item, z, bg) {
    var sec = item.sec;
    var pin = item.pin;
    var fill = '100dvh';

    item.isCard = true;
    sec.classList.add('hp-float-card', 'hp-float-card--mobile', 'hp-float-hero');
    sec.style.setProperty('--hp-z', String(z));
    sec.style.setProperty('position', 'sticky', 'important');
    sec.style.setProperty('top', '0px', 'important');
    sec.style.setProperty('z-index', String(z), 'important');
    sec.style.setProperty('height', fill, 'important');
    sec.style.setProperty('min-height', '100svh', 'important');
    sec.style.setProperty('width', '100%', 'important');
    sec.style.setProperty('max-width', '100vw', 'important');
    sec.style.setProperty('margin-top', '0px', 'important');
    sec.style.setProperty('margin-bottom', '0px', 'important');
    sec.style.setProperty('margin-left', '0px', 'important');
    sec.style.setProperty('margin-right', '0px', 'important');
    sec.style.setProperty('padding', '0px', 'important');
    sec.style.setProperty('transform', 'none', 'important');
    sec.style.setProperty('opacity', '1', 'important');
    sec.style.setProperty('visibility', 'visible', 'important');
    sec.style.setProperty('box-shadow', '0 -8px 24px rgba(0,0,0,0.12)', 'important');
    sec.style.setProperty('background-color', bg || '#111111', 'important');
    sec.style.setProperty('overflow', 'hidden', 'important');
    sec.style.setProperty('max-height', fill, 'important');

    pin.style.setProperty('position', 'relative', 'important');
    pin.style.setProperty('width', '100%', 'important');
    pin.style.setProperty('height', fill, 'important');
    pin.style.setProperty('min-height', '100svh', 'important');
    pin.style.setProperty('max-height', fill, 'important');
    pin.style.setProperty('opacity', '1', 'important');
    pin.style.setProperty('visibility', 'visible', 'important');
    pin.style.setProperty('overflow', 'hidden', 'important');
    pin.style.setProperty('touch-action', 'pan-y', 'important');
    pin.style.setProperty('background-color', bg || '#111111', 'important');

    prepareHeroFullscreen(pin);
  }

  /* Mobile story: sticky full-bleed card — next section covers it */
  function asStoryOnce(item, z, bg) {
    var sec = item.sec;
    var pin = item.pin;
    var fill = '100dvh';

    item.isCard = true;
    sec.classList.add('hp-float-card', 'hp-float-card--mobile', 'hp-float-story');
    sec.style.setProperty('--hp-z', String(z));
    sec.style.setProperty('position', 'sticky', 'important');
    sec.style.setProperty('top', '0px', 'important');
    sec.style.setProperty('z-index', String(z), 'important');
    sec.style.setProperty('height', fill, 'important');
    sec.style.setProperty('min-height', '100svh', 'important');
    sec.style.setProperty('max-height', fill, 'important');
    sec.style.setProperty('width', '100%', 'important');
    sec.style.setProperty('max-width', '100vw', 'important');
    sec.style.setProperty('left', '0', 'important');
    sec.style.setProperty('right', '0', 'important');
    sec.style.setProperty('margin', '0', 'important');
    sec.style.setProperty('padding', '0', 'important');
    sec.style.setProperty('transform', 'none', 'important');
    sec.style.setProperty('opacity', '1', 'important');
    sec.style.setProperty('visibility', 'visible', 'important');
    sec.style.setProperty('box-shadow', '0 -8px 24px rgba(0,0,0,0.12)', 'important');
    sec.style.setProperty('overflow', 'hidden', 'important');
    sec.style.setProperty('background-color', bg || '#111111', 'important');

    pin.style.setProperty('position', 'relative', 'important');
    pin.style.setProperty('width', '100%', 'important');
    pin.style.setProperty('max-width', '100%', 'important');
    pin.style.setProperty('height', fill, 'important');
    pin.style.setProperty('min-height', '100svh', 'important');
    pin.style.setProperty('max-height', fill, 'important');
    pin.style.setProperty('opacity', '1', 'important');
    pin.style.setProperty('visibility', 'visible', 'important');
    pin.style.setProperty('overflow', 'hidden', 'important');
    pin.style.setProperty('touch-action', 'pan-y', 'important');
    pin.style.setProperty('margin', '0', 'important');
    pin.style.setProperty('padding', '0', 'important');
    pin.style.setProperty('background-color', bg || '#111111', 'important');

    prepareStoryFullscreen(pin, true);
  }

  /* Mobile DNA: sticky cover; size to content so footer isn't preceded by a tall black void */
  function asDnaMobileCard(item, z, bg) {
    var sec = item.sec;
    var pin = item.pin;
    var vh = viewportH();
    var paint = bg || '#121111';
    var contentH = Math.max(pin.scrollHeight, pin.offsetHeight, 1);
    /* Keep sticky cover feel, but don't force a full empty viewport when content is short */
    var fillPx = Math.max(contentH + 36, Math.round(vh * 0.78));
    if (fillPx > vh) fillPx = vh;
    var fill = fillPx + 'px';

    item.isCard = true;
    sec.classList.add('hp-float-card', 'hp-float-card--mobile', 'hp-float-dna');
    sec.style.setProperty('--hp-z', String(z));
    sec.style.setProperty('position', 'sticky', 'important');
    sec.style.setProperty('top', '0px', 'important');
    sec.style.setProperty('z-index', String(z), 'important');
    sec.style.setProperty('height', fill, 'important');
    sec.style.setProperty('min-height', fill, 'important');
    sec.style.setProperty('max-height', fill, 'important');
    sec.style.setProperty('margin-top', '0px', 'important');
    sec.style.setProperty('margin-bottom', '0px', 'important');
    sec.style.setProperty('transform', 'none', 'important');
    sec.style.setProperty('opacity', '1', 'important');
    sec.style.setProperty('visibility', 'visible', 'important');
    sec.style.setProperty('box-shadow', '0 -8px 24px rgba(0,0,0,0.12)', 'important');
    /* Clip lifestyle bleed; carousel still scrolls inside pin */
    sec.style.setProperty('overflow', 'hidden', 'important');
    sec.style.setProperty('background-color', paint, 'important');
    sec.style.setProperty('isolation', 'isolate', 'important');

    pin.style.setProperty('position', 'relative', 'important');
    pin.style.setProperty('width', '100%', 'important');
    pin.style.setProperty('height', fill, 'important');
    pin.style.setProperty('min-height', fill, 'important');
    pin.style.setProperty('max-height', fill, 'important');
    pin.style.setProperty('opacity', '1', 'important');
    pin.style.setProperty('visibility', 'visible', 'important');
    pin.style.setProperty('overflow-x', 'auto', 'important');
    pin.style.setProperty('overflow-y', 'hidden', 'important');
    pin.style.setProperty('touch-action', 'pan-y', 'important');
    pin.style.setProperty('background-color', paint, 'important');
  }

  function asCard(item, z, contentH, bg, mobile, isStory) {
    var sec = item.sec;
    var pin = item.pin;
    var vh = viewportH();
    /*
      Mobile: always one viewport tall. Tall measured heights created multi-screen
      sticky runways that looked frozen (Materials) and trapped touch in overflow:auto.
      Desktop keeps measured height for tall grids.
    */
    var useDvh = mobile || isStory || contentH <= vh * 1.12;
    var pinH = useDvh ? null : Math.max(contentH, vh);
    var fill = viewportFill(true);

    item.isCard = true;
    sec.classList.add('hp-float-card');
    if (mobile) sec.classList.add('hp-float-card--mobile');
    if (isStory) sec.classList.add('hp-float-story');
    sec.style.setProperty('--hp-z', String(z));
    /* Sticky on all breakpoints — next card floats over the pinned one */
    sec.style.setProperty('position', 'sticky', 'important');
    sec.style.setProperty('top', '0px', 'important');
    sec.style.setProperty('z-index', String(z), 'important');
    if (mobile || useDvh) {
      sec.style.setProperty('height', fill, 'important');
      sec.style.setProperty('min-height', '100svh', 'important');
      sec.style.setProperty('max-height', fill, 'important');
    } else {
      sec.style.setProperty('height', pinH + 'px', 'important');
      sec.style.setProperty('min-height', vh + 'px', 'important');
      sec.style.removeProperty('max-height');
    }
    sec.style.setProperty('margin-top', '0px', 'important');
    sec.style.setProperty('margin-bottom', '0px', 'important');
    sec.style.setProperty('transform', 'none', 'important');
    sec.style.setProperty('opacity', '1', 'important');
    sec.style.setProperty('visibility', 'visible', 'important');
    sec.style.setProperty(
      'box-shadow',
      mobile ? '0 -8px 24px rgba(0,0,0,0.12)' : '0 -12px 32px rgba(0,0,0,0.14)',
      'important'
    );
    if (bg) sec.style.setProperty('background-color', bg, 'important');

    pin.style.setProperty('position', 'relative', 'important');
    pin.style.setProperty('width', '100%', 'important');
    if (mobile || useDvh) {
      pin.style.setProperty('height', fill, 'important');
      pin.style.setProperty('min-height', '100svh', 'important');
      pin.style.setProperty('max-height', fill, 'important');
    } else {
      pin.style.setProperty('height', pinH + 'px', 'important');
      pin.style.setProperty('min-height', vh + 'px', 'important');
      pin.style.removeProperty('max-height');
    }
    pin.style.setProperty('opacity', '1', 'important');
    /* Never overflow:auto on mobile — it steals page scroll and freezes the UI */
    pin.style.setProperty('overflow', 'hidden', 'important');
    pin.style.setProperty('touch-action', 'pan-y', 'important');
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
      var hero = isHeroPin(pin);

      resetSectionStyles(sec, pin);

      /* Split CTA: full-viewport sticky card on mobile (matches sections above) */
      if (isSplitCtaSection(sec) || isSplitCtaPin(pin)) {
        cardIndex += 1;
        var ctaBg = '#fdfcf7';
        if (mobile) {
          sec.classList.add('hp-float-split-cta');
          asCard(item, cardIndex, vh, ctaBg, mobile, false);
          pin.style.setProperty('overflow', 'hidden', 'important');
        } else {
          asStrip(item, cardIndex);
          pin.style.setProperty('overflow', 'visible', 'important');
        }
        sec.style.setProperty('background-color', ctaBg, 'important');
        pin.style.setProperty('background-color', ctaBg, 'important');
        return;
      }

      if (hero) {
        prepareHeroFullscreen(pin);
        if (!item._heroImgBound) {
          item._heroImgBound = true;
          var himgs = pin.querySelectorAll('.hero-fullscreen__bg-img, .hero-fullscreen__bg img');
          for (var hi = 0; hi < himgs.length; hi++) {
            himgs[hi].addEventListener(
              'load',
              function () {
                prepareHeroFullscreen(pin);
              },
              { once: false }
            );
          }
        }
      }

      if (story) {
        prepareStoryFullscreen(pin, mobile);
        if (!item._storyImgBound) {
          item._storyImgBound = true;
          var imgs = pin.querySelectorAll(
            '[data-hp-story-cover], img[class*="ai-story-banner-image"], img[class*="ai-story-banner-mobile-image"]'
          );
          for (var ii = 0; ii < imgs.length; ii++) {
            imgs[ii].addEventListener(
              'load',
              function () {
                prepareStoryFullscreen(pin, isMobile());
              },
              { once: false }
            );
          }
        }
      }

      var contentH = story || hero
        ? vh
        : Math.max(pin.scrollHeight, pin.offsetHeight, 1);
      var bg = detectBg(pin) || (story || hero ? '#111111' : '#ffffff');
      item.bg = bg;

      /* Mobile hero: sticky full-screen — next card floats over */
      if (hero && mobile) {
        cardIndex += 1;
        asHeroOnce(item, cardIndex, bg);
        return;
      }

      /* Mobile story: sticky full-bleed — next card floats over */
      if (story && mobile) {
        cardIndex += 1;
        asStoryOnce(item, cardIndex, bg);
        return;
      }

      /* Mobile DNA: full-viewport sticky card — same scroll rhythm as upper sections */
      if ((isDnaPin(pin) || isDnaSection(sec)) && mobile) {
        cardIndex += 1;
        asCard(item, cardIndex, vh, bg || '#121111', mobile, false);
        sec.classList.add('hp-float-dna');
        sec.style.setProperty('background-color', '#121111', 'important');
        pin.style.setProperty('background-color', '#121111', 'important');
        pin.style.setProperty('overflow', 'hidden', 'important');
        return;
      }

      /* Thin marquees stay normal height — never full-screen cards */
      if (!story && !hero && (isKnownStrip(pin) || contentH < vh * 0.35)) {
        asStrip(item, 10 + index);
        if (pin.querySelector('.corp-marquee--outline-style, .corp-marquee')) {
          item.bg = '#ffffff';
          sec.style.setProperty('background-color', '#ffffff', 'important');
          pin.style.setProperty('background-color', '#ffffff', 'important');
        }
        return;
      }

      /* Desktop/laptop — natural height strip so review tiles are never clipped */
      if (!mobile && isCommunityPin(pin)) {
        cardIndex += 1;
        asStrip(item, cardIndex);
        sec.style.setProperty('background-color', bg, 'important');
        pin.style.setProperty('background-color', bg, 'important');
        pin.style.setProperty('overflow', 'visible', 'important');
        return;
      }

      cardIndex += 1;
      asCard(item, cardIndex, contentH, bg, mobile, story);
      if (hero) prepareHeroFullscreen(pin);
      if (story) prepareStoryFullscreen(pin, mobile);
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
    /* Soft re-layout after images — hero paint is preserved on mobile */
    layout();
    window.dispatchEvent(new CustomEvent('hp-floating-cards:ready'));
  });
  window.addEventListener('hp-community-swiper:ready', function () {
    if (!isMobile()) setTimeout(layout, 40);
  });
  /* Avoid an early second layout that flashes/hides the mobile hero */
  if (!isMobile()) {
    setTimeout(layout, 600);
  }

  /*
    Mobile only: one clear swipe → exactly ONE next/prev float section.
    Sticky cover animation stays untouched. Uses layout offsetTop (not sticky
    getBoundingClientRect) so we never skip middle cards.
  */
  (function initMobileFastScroll() {
    if (!isMobile()) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var cfg = window.hpMobileFloatConfig || {};
    if (cfg.enabled === false) return;

    document.documentElement.classList.add('hp-float-snap');
    document.body.classList.add('hp-float-snap');

    var touchY = 0;
    var touchX = 0;
    var touchT = 0;
    var touchTarget = null;
    var startIdx = 0;
    var settledIdx = 0;
    var armed = false;
    var verticalIntent = false;
    var scrollLock = false;
    var animating = false;
    var coolUntil = 0;
    var settleTimer = null;
    var lastScrollT = 0;
    var SWIPE_PX = cfg.swipePx || 52;
    var SWIPE_V = cfg.swipeVelocity || 0.38;
    var COOL_MS = cfg.coolMs || 1100;
    var IDLE_MS = cfg.idleMs || 300;
    var LOCK_NATIVE = cfg.lockNativeScroll !== false;

    function snapList() {
      return items
        .map(function (item) {
          return item.sec;
        })
        .filter(function (sec) {
          if (!sec || !sec.isConnected) return false;
          /* Only full-viewport cards — thin marquees/apps stay native scroll */
          return (
            sec.classList.contains('hp-float-card') ||
            sec.classList.contains('hp-float-hero') ||
            sec.classList.contains('hp-float-story')
          );
        });
    }

    function inFooterZone() {
      var list = snapList();
      if (!list.length) return false;
      var yNow = window.pageYOffset || 0;
      var lastTop = sectionDocTop(list[list.length - 1]);
      var vh = window.innerHeight || 800;
      return yNow > lastTop + Math.round(vh * 0.5);
    }

    /* Document Y from layout flow — correct even while position:sticky */
    function sectionDocTop(sec) {
      var top = 0;
      var node = sec;
      while (node) {
        top += node.offsetTop || 0;
        node = node.offsetParent;
      }
      return Math.max(0, Math.round(top));
    }

    /* Which float card currently covers the viewport mid-line (topmost in stack) */
    function currentIndex() {
      var list = snapList();
      if (!list.length) return 0;
      var mid = (window.innerHeight || 800) * 0.42;
      var best = -1;
      for (var i = 0; i < list.length; i++) {
        var r = list[i].getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) {
          best = i;
        }
      }
      if (best >= 0) return best;
      /* Nothing covers the midline (footer / thin strip region):
         fall back to document position so upward paging from the
         footer starts at the LAST section, not the first */
      var line = (window.pageYOffset || 0) + mid;
      best = 0;
      for (var j = 0; j < list.length; j++) {
        if (sectionDocTop(list[j]) <= line) best = j;
      }
      return best;
    }

    /* Never jump more than one section away from the last settled card */
    function clampTargetIndex(fromIdx, candidateIdx, listLen) {
      if (!listLen) return 0;
      var c = Math.max(0, Math.min(listLen - 1, candidateIdx));
      if (c > fromIdx + 1) return fromIdx + 1;
      if (c < fromIdx - 1) return fromIdx - 1;
      return c;
    }

    function markSettled(index) {
      var list = snapList();
      if (!list.length) return;
      settledIdx = Math.max(0, Math.min(list.length - 1, index));
    }

    function isCarouselTouch(target) {
      if (!target || !target.closest) return false;
      return !!target.closest(
        [
          '[data-bs-coverflow]',
          '[data-coverflow-viewport]',
          '[data-coverflow-card]',
          '.bs-coverflow',
          '.hp-fam-sec__mobile-slider',
          '.trending-social',
          '.trending-social-section',
          '[class*="hp-dna__grid"]',
          '.comm-slider',
          '.comm-carousel',
          '.comm-swiper',
          '.comm-slider-container',
          '.comm-slide',
          '.comm-card',
          '.hp-float-contact'
        ].join(',')
      );
    }

    function goTo(index) {
      var list = snapList();
      if (!list.length) return false;
      index = clampTargetIndex(settledIdx, index, list.length);
      if (index < 0 || index > list.length - 1) return false;
      var top = sectionDocTop(list[index]);
      markSettled(index);
      animating = true;
      coolUntil = Date.now() + COOL_MS;
      window.scrollTo({ top: top, left: 0, behavior: 'smooth' });
      clearTimeout(settleTimer);
      var settleCheck = function () {
        if (armed) {
          animating = false;
          return;
        }
        if (Date.now() - lastScrollT < 140) {
          settleTimer = setTimeout(settleCheck, 180);
          return;
        }
        var drift = Math.abs((window.pageYOffset || 0) - top);
        if (drift > 8 && drift < (window.innerHeight || 800) * 0.5) {
          coolUntil = Date.now() + COOL_MS - 200;
          window.scrollTo({ top: top, left: 0, behavior: 'smooth' });
        } else {
          markSettled(index);
        }
        animating = false;
      };
      settleTimer = setTimeout(settleCheck, 680);
      return true;
    }

    var idleTimer = null;
    window.addEventListener(
      'scroll',
      function () {
        if (!isMobile()) return;
        lastScrollT = Date.now();

        clearTimeout(idleTimer);
        idleTimer = setTimeout(function () {
          if (armed || animating) return;
          if (Date.now() < coolUntil) return;
          if (inFooterZone()) return;
          var list = snapList();
          if (!list.length) return;
          var yNow = window.pageYOffset || 0;
          if (yNow > sectionDocTop(list[list.length - 1]) + 40) {
            markSettled(list.length - 1);
            return;
          }
          var seen = currentIndex();
          var target = clampTargetIndex(settledIdx, seen, list.length);
          var targetTop = sectionDocTop(list[target]);
          var drift = Math.abs(targetTop - yNow);
          if (drift > 32) {
            goTo(target);
          } else {
            markSettled(target);
          }
        }, IDLE_MS);
      },
      { passive: true }
    );

    markSettled(currentIndex());

    window.addEventListener('hp-floating-cards:ready', function () {
      if (!isMobile()) return;
      markSettled(currentIndex());
    });

    if (LOCK_NATIVE) {
      document.addEventListener(
        'touchmove',
        function (e) {
          if (!isMobile() || !scrollLock || !armed) return;
          if (!e.touches || !e.touches.length) return;
          if (isCarouselTouch(e.target) || isCarouselTouch(touchTarget)) return;
          if (inFooterZone()) return;
          var moveDy = touchY - e.touches[0].clientY;
          var moveDx = touchX - e.touches[0].clientX;
          /* Last section: allow native scroll down into footer */
          if (settledIdx >= snapList().length - 1 && moveDy > 8) return;
          if (Math.abs(moveDx) > Math.abs(moveDy) + 6) return;
          if (Math.abs(moveDy) > Math.abs(moveDx) + 6) {
            verticalIntent = true;
            e.preventDefault();
          }
        },
        { passive: false }
      );
    }

    document.addEventListener(
      'touchstart',
      function (e) {
        if (!isMobile() || !e.touches || !e.touches.length) return;
        clearTimeout(settleTimer);
        verticalIntent = false;
        scrollLock = LOCK_NATIVE;
        if (Date.now() < coolUntil) {
          armed = false;
          scrollLock = false;
          return;
        }
        if (isCarouselTouch(e.target)) {
          armed = false;
          scrollLock = false;
          return;
        }
        if (e.target && e.target.closest && e.target.closest('footer, .footer-wrapper')) {
          armed = false;
          scrollLock = false;
          return;
        }
        touchY = e.touches[0].clientY;
        touchX = e.touches[0].clientX;
        touchT = Date.now();
        touchTarget = e.target;
        startIdx = settledIdx;
        armed = true;
      },
      { passive: true }
    );

    document.addEventListener(
      'touchcancel',
      function () {
        armed = false;
        scrollLock = false;
        verticalIntent = false;
      },
      { passive: true }
    );

    document.addEventListener(
      'touchend',
      function (e) {
        scrollLock = false;
        if (!armed || !isMobile()) return;
        armed = false;
        if (Date.now() < coolUntil) return;
        if (!e.changedTouches || !e.changedTouches.length) return;
        if (isCarouselTouch(touchTarget) || isCarouselTouch(e.target)) return;

        var y = e.changedTouches[0].clientY;
        var x = e.changedTouches[0].clientX;
        var dy = touchY - y;
        var dx = touchX - x;
        var dt = Math.max(16, Date.now() - touchT);
        var v = dy / dt;
        if (Math.abs(dx) > Math.abs(dy)) return;
        if (!verticalIntent && Math.abs(dy) < SWIPE_PX && Math.abs(v) < SWIPE_V) return;
        if (Math.abs(dy) < 24) return;

        var list = snapList();
        /* Swipe down on last section → native scroll to footer */
        if (dy > 0 && startIdx >= list.length - 1) {
          verticalIntent = false;
          return;
        }
        if (inFooterZone()) {
          verticalIntent = false;
          return;
        }

        var yNow = window.pageYOffset || document.documentElement.scrollTop || 0;
        window.scrollTo(0, yNow);

        var nextIdx = dy > 0 ? startIdx + 1 : startIdx - 1;
        requestAnimationFrame(function () {
          goTo(nextIdx);
        });
        verticalIntent = false;
      },
      { passive: true }
    );
  })();
})();
