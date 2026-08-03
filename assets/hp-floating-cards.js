/*
  Homepage section scroll stack — gap-proof.
  Video issues fixed:
  - Never fade the pin/background (that caused white/black voids).
  - Every sticky panel fills at least 100vh with its own opaque color.
  - Only inner content crossfades; background is always solid.
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
    if (pin) {
      if (!pin.querySelector(':scope > .hp-xfade-content')) {
        var wrap = document.createElement('div');
        wrap.className = 'hp-xfade-content';
        while (pin.firstChild) wrap.appendChild(pin.firstChild);
        pin.appendChild(wrap);
      }
      return pin;
    }
    pin = document.createElement('div');
    pin.className = 'hp-xfade-pin';
    var content = document.createElement('div');
    content.className = 'hp-xfade-content';
    while (sec.firstChild) content.appendChild(sec.firstChild);
    pin.appendChild(content);
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
      '.community-testimonials',
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
    /* Prefer dark over white so accidental holes match the cinematic stack */
    return '#111111';
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
    items.push({
      sec: sec,
      pin: pin,
      content: pin.querySelector(':scope > .hp-xfade-content'),
      index: index,
      seen: false
    });
  });

  document.body.classList.add('hp-crossfade-active');
  document.body.classList.add('hp-floating-cards-active');
  window.dispatchEvent(new CustomEvent('hp-floating-cards:ready'));

  function layout() {
    var vh = window.innerHeight || document.documentElement.clientHeight || 800;

    items.forEach(function (item, index) {
      var pin = item.pin;
      var sec = item.sec;
      var content = item.content;

      sec.style.height = 'auto';
      pin.style.height = 'auto';
      pin.style.minHeight = '0';
      pin.style.opacity = '1';
      if (content) {
        content.style.height = 'auto';
        content.style.opacity = '1';
      }

      var contentH = Math.max(
        content ? content.scrollHeight : 0,
        pin.scrollHeight,
        pin.offsetHeight,
        1
      );
      /*
        Fill the viewport with this section's opaque color.
        Stops black/white bars when content is shorter than the screen.
      */
      var pinH = Math.max(contentH, vh);
      var bg = detectPinBg(pin);
      item.bg = bg;

      sec.style.setProperty('position', 'sticky', 'important');
      sec.style.setProperty('top', '0px', 'important');
      sec.style.setProperty('z-index', String(index + 1), 'important');
      sec.style.setProperty('height', pinH + 'px', 'important');
      sec.style.setProperty('min-height', vh + 'px', 'important');
      sec.style.setProperty('margin-top', '0px', 'important');
      sec.style.setProperty('margin-bottom', '0px', 'important');
      sec.style.setProperty('transform', 'none', 'important');
      sec.style.setProperty('background-color', bg, 'important');
      sec.style.setProperty('opacity', '1', 'important');

      pin.style.setProperty('position', 'relative', 'important');
      pin.style.setProperty('top', 'auto', 'important');
      pin.style.setProperty('height', pinH + 'px', 'important');
      pin.style.setProperty('min-height', vh + 'px', 'important');
      pin.style.setProperty('width', '100%', 'important');
      pin.style.setProperty('background-color', bg, 'important');
      pin.style.setProperty('opacity', '1', 'important');
      pin.style.overflow = 'hidden';

      if (content) {
        content.style.setProperty('min-height', Math.min(contentH, pinH) + 'px', 'important');
        content.style.setProperty('width', '100%', 'important');
        content.style.setProperty('opacity', '1', 'important');
      }
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
        caps[i].classList.add('is-in');
        caps[i].classList.remove('hp-xfade-pending');
      }
    }
  }

  function update() {
    var vh = window.innerHeight || 800;
    var n = items.length;
    var contentOp = [];
    var i;

    for (i = 0; i < n; i++) contentOp[i] = 0;

    /*
      Backgrounds never fade (always opaque via CSS/inline).
      Only content opacity blends — and outgoing content stays at 1
      until fully covered so nothing punches a hole through to stack bg.
    */
    for (i = 0; i < n; i++) {
      var next = items[i + 1];

      if (!next) {
        contentOp[i] = 1;
        break;
      }

      var nextTop = next.pin.getBoundingClientRect().top;

      if (nextTop >= vh) {
        contentOp[i] = 1;
        break;
      }

      if (nextTop <= 0) {
        continue;
      }

      var t = clamp(1 - nextTop / vh, 0, 1);
      t = t * t * (3 - 2 * t);
      contentOp[i] = 1;
      contentOp[i + 1] = t;
      break;
    }

    var activeIdx = 0;
    var best = -1;

    for (i = 0; i < n; i++) {
      /* Pin/section ALWAYS opaque — never create a see-through gap */
      items[i].pin.style.opacity = '1';
      items[i].sec.style.opacity = '1';

      if (items[i].content) {
        items[i].content.style.opacity = String(contentOp[i]);
      }

      /*
        Hide fully-covered panels from hit-testing only after next has covered them.
        Keep visibility so background still paints if needed; use visibility when covered.
      */
      var next = items[i + 1];
      var covered = next && next.pin.getBoundingClientRect().top <= 0;
      items[i].sec.style.visibility = covered ? 'hidden' : 'visible';

      if (contentOp[i] > best) {
        best = contentOp[i];
        activeIdx = i;
      }
    }

    if (best < 0.05) {
      for (i = n - 1; i >= 0; i--) {
        var r = items[i].pin.getBoundingClientRect();
        if (r.top < vh && r.bottom > 0) {
          if (items[i].content) items[i].content.style.opacity = '1';
          items[i].sec.style.visibility = 'visible';
          activeIdx = i;
          best = 1;
          break;
        }
      }
    }

    for (i = 0; i < n; i++) {
      var op = items[i].content ? parseFloat(items[i].content.style.opacity || '0') : 1;
      setCaptions(items[i], i === activeIdx && op > 0.35);
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
