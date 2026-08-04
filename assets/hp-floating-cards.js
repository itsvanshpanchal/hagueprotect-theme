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

  function isStoryPin(pin) {
    return !!(
      pin.querySelector('[class*="ai-story-sticky-track"]') ||
      pin.querySelector('[class*="ai-story-banner-"]')
    );
  }

  function isHeroPin(pin) {
    return !!pin.querySelector('.hero-fullscreen');
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
    sec.classList.remove('hp-float-card', 'hp-float-strip', 'hp-float-card--mobile', 'hp-float-story', 'hp-float-hero');
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

  /* Mobile hero: paint once at full screen, then scroll away (not sticky).
     Sticky stacking was covering/hiding the hero right after first paint. */
  function asHeroOnce(item, z, bg) {
    var sec = item.sec;
    var pin = item.pin;
    var fill = '100dvh';

    item.isCard = true;
    sec.classList.add('hp-float-card', 'hp-float-card--mobile', 'hp-float-hero');
    sec.style.setProperty('--hp-z', String(z));
    sec.style.setProperty('position', 'relative', 'important');
    sec.style.setProperty('top', 'auto', 'important');
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
    sec.style.setProperty('box-shadow', 'none', 'important');
    sec.style.setProperty('background-color', bg || '#111111', 'important');

    pin.style.setProperty('position', 'relative', 'important');
    pin.style.setProperty('width', '100%', 'important');
    pin.style.setProperty('height', fill, 'important');
    pin.style.setProperty('min-height', '100svh', 'important');
    pin.style.setProperty('opacity', '1', 'important');
    pin.style.setProperty('visibility', 'visible', 'important');
    pin.style.setProperty('overflow', 'hidden', 'important');
    pin.style.setProperty('background-color', bg || '#111111', 'important');

    prepareHeroFullscreen(pin);
  }

  /* Mobile story: same one-shot full-bleed paint — sticky left a black inset panel */
  function asStoryOnce(item, z, bg) {
    var sec = item.sec;
    var pin = item.pin;
    var fill = '100dvh';

    item.isCard = true;
    sec.classList.add('hp-float-card', 'hp-float-card--mobile', 'hp-float-story');
    sec.style.setProperty('--hp-z', String(z));
    sec.style.setProperty('position', 'relative', 'important');
    sec.style.setProperty('top', 'auto', 'important');
    sec.style.setProperty('z-index', String(z), 'important');
    sec.style.setProperty('height', fill, 'important');
    sec.style.setProperty('min-height', '100svh', 'important');
    sec.style.setProperty('width', '100%', 'important');
    sec.style.setProperty('max-width', '100vw', 'important');
    sec.style.setProperty('left', '0', 'important');
    sec.style.setProperty('right', '0', 'important');
    sec.style.setProperty('margin', '0', 'important');
    sec.style.setProperty('padding', '0', 'important');
    sec.style.setProperty('transform', 'none', 'important');
    sec.style.setProperty('opacity', '1', 'important');
    sec.style.setProperty('visibility', 'visible', 'important');
    sec.style.setProperty('box-shadow', 'none', 'important');
    sec.style.setProperty('overflow', 'hidden', 'important');
    sec.style.setProperty('background-color', bg || '#111111', 'important');

    pin.style.setProperty('position', 'relative', 'important');
    pin.style.setProperty('width', '100%', 'important');
    pin.style.setProperty('max-width', '100%', 'important');
    pin.style.setProperty('height', fill, 'important');
    pin.style.setProperty('min-height', '100svh', 'important');
    pin.style.setProperty('opacity', '1', 'important');
    pin.style.setProperty('visibility', 'visible', 'important');
    pin.style.setProperty('overflow', 'hidden', 'important');
    pin.style.setProperty('margin', '0', 'important');
    pin.style.setProperty('padding', '0', 'important');
    pin.style.setProperty('background-color', bg || '#111111', 'important');

    prepareStoryFullscreen(pin, true);
  }

  function asCard(item, z, contentH, bg, mobile, isStory) {
    var sec = item.sec;
    var pin = item.pin;
    var vh = viewportH();
    /* Story + near-viewport sections use CSS dvh on mobile; tall grids keep natural height */
    var useDvh = mobile && (isStory || contentH <= vh * 1.12);
    var pinH = useDvh ? null : Math.max(contentH, vh);
    var fill = viewportFill(true);

    item.isCard = true;
    sec.classList.add('hp-float-card');
    if (mobile) sec.classList.add('hp-float-card--mobile');
    if (isStory) sec.classList.add('hp-float-story');
    sec.style.setProperty('--hp-z', String(z));
    /*
      Mobile: use relative (not sticky). Many sticky full-screen cards cause
      severe scroll lag on phones. Desktop keeps the sticky cover stack.
    */
    if (mobile) {
      sec.style.setProperty('position', 'relative', 'important');
      sec.style.setProperty('top', 'auto', 'important');
    } else {
      sec.style.setProperty('position', 'sticky', 'important');
      sec.style.setProperty('top', '0px', 'important');
    }
    sec.style.setProperty('z-index', String(z), 'important');
    if (useDvh) {
      sec.style.setProperty('height', fill, 'important');
      sec.style.setProperty('min-height', '100svh', 'important');
    } else if (mobile) {
      /* Keep natural height on mobile — don't force every card to 100vh */
      sec.style.setProperty('height', 'auto', 'important');
      sec.style.setProperty('min-height', '0', 'important');
    } else {
      sec.style.setProperty('height', pinH + 'px', 'important');
      sec.style.setProperty('min-height', vh + 'px', 'important');
    }
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
    if (useDvh) {
      pin.style.setProperty('height', fill, 'important');
      pin.style.setProperty('min-height', '100svh', 'important');
    } else if (mobile) {
      pin.style.setProperty('height', 'auto', 'important');
      pin.style.setProperty('min-height', '0', 'important');
    } else {
      pin.style.setProperty('height', pinH + 'px', 'important');
      pin.style.setProperty('min-height', vh + 'px', 'important');
    }
    pin.style.setProperty('opacity', '1', 'important');
    pin.style.setProperty(
      'overflow',
      mobile ? 'visible' : isStory || useDvh || contentH <= vh + 8 ? 'hidden' : 'auto',
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
      var hero = isHeroPin(pin);

      resetSectionStyles(sec, pin);

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

      /* Mobile hero: one full-screen paint, then hide by scrolling away */
      if (hero && mobile) {
        cardIndex += 1;
        asHeroOnce(item, cardIndex, bg);
        return;
      }

      /* Mobile story: full-bleed image panel (not sticky black inset) */
      if (story && mobile) {
        cardIndex += 1;
        asStoryOnce(item, cardIndex, bg);
        return;
      }

      /* Thin marquees / split CTA stay normal height — never full-screen cards */
      if (!story && !hero && (isKnownStrip(pin) || isSplitCtaPin(pin) || contentH < vh * 0.35)) {
        asStrip(item, 10 + index);
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
  /* Avoid an early second layout that flashes/hides the mobile hero */
  if (!isMobile()) {
    setTimeout(layout, 600);
  }
})();
