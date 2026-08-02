/*
  Homepage floating card stack — cinematic sticky panels.
  Fixes: no empty runway gaps, pin always fills the viewport, smoother cover.
*/
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!document.body.classList.contains('template-index')) return;

  var main = document.getElementById('MainContent');
  if (!main) return;

  var MOBILE_MAX = 749;

  function isTransparent(color) {
    return !color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)';
  }

  function paintOpaque(el, color) {
    if (!el || !color) return;
    el.style.setProperty('background-color', color, 'important');
  }

  function detectBg(pin, sec) {
    var fallback = '#0a0a0a';
    var selectors = [
      '.mat-section',
      '.hp-fam-sec',
      '.corp-marquee',
      '.split-cta',
      '[class*="split-cta"]',
      '.story-banner-wrapper',
      '.bs-coverflow',
      '.trending-social-section',
      '.comm-section',
      '.hp-dna',
      '.fc-section',
      'section'
    ];
    for (var i = 0; i < selectors.length; i++) {
      var el = pin.querySelector(selectors[i]);
      if (!el) continue;
      var c = window.getComputedStyle(el).backgroundColor;
      if (!isTransparent(c)) return c;
    }
    // Known dark homepage bands
    if (sec.querySelector('.mat-section, .hp-fam-sec, .corp-marquee, .hero-fullscreen')) {
      return '#0a0a0a';
    }
    // Split CTA cream
    if (sec.querySelector('[class*="split-cta"]')) {
      return '#FDFCF7';
    }
    var mainBg = window.getComputedStyle(pin).backgroundColor;
    if (!isTransparent(mainBg)) return mainBg;
    return fallback;
  }

  function shouldSkip(sec) {
    if (!sec || !sec.classList.contains('shopify-section')) return true;
    if (sec.querySelector('[data-hp-story-sticky-track]')) return true;
    if (sec.querySelector('[data-fp-stack]')) return true;
    if (sec.classList.contains('section-floating-panels')) return true;
    if (!sec.firstElementChild) return true;

    // Short strips (marquees, thin banners) create empty color gaps — skip them
    var h = sec.offsetHeight || sec.scrollHeight || 0;
    var vh = window.innerHeight || 800;
    if (h > 0 && h < vh * 0.42) return true;
    if (sec.querySelector('.corp-marquee') && !sec.querySelector('.hp-fam-sec, .mat-section')) return true;

    return false;
  }

  function clearSection(sec) {
    sec.classList.remove('hp-float-card');
    sec.style.removeProperty('height');
    sec.style.removeProperty('min-height');
    sec.style.removeProperty('margin-top');
    sec.style.removeProperty('margin-bottom');
    sec.style.removeProperty('z-index');
    sec.style.removeProperty('position');
    sec.style.removeProperty('isolation');
    sec.style.removeProperty('overflow');
    sec.style.removeProperty('pointer-events');
    sec.style.removeProperty('background');
    sec.style.removeProperty('background-color');
    sec.style.removeProperty('box-shadow');

    var pin = sec.querySelector(':scope > .hp-float-pin');
    if (pin) {
      var child = pin.firstElementChild;
      if (child) {
        child.style.removeProperty('flex');
        child.style.removeProperty('min-height');
      }
      pin.style.cssText = '';
      while (pin.firstChild) sec.insertBefore(pin.firstChild, pin);
      pin.remove();
    }
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

  function layout() {
    var sections = Array.prototype.slice.call(main.querySelectorAll(':scope > .shopify-section'));
    var vh = window.innerHeight || document.documentElement.clientHeight || 800;
    var isMobile = window.matchMedia('(max-width: ' + MOBILE_MAX + 'px)').matches;
    // Shorter runway = snappier, smoother cover + less empty track exposure
    var runway = Math.round(vh * (isMobile ? 0.42 : 0.5));

    sections.forEach(clearSection);

    main.style.setProperty('position', 'relative');
    main.style.setProperty('isolation', 'isolate');
    main.style.setProperty('overflow-x', 'clip');
    main.style.setProperty('overflow-y', 'visible');
    main.style.setProperty('background-color', '#0a0a0a');

    var active = sections.filter(function (sec) { return !shouldSkip(sec); });
    if (active.length < 2) return;

    active.forEach(function (sec, i) {
      var isLast = i === active.length - 1;
      var pin = ensurePin(sec);

      // Measure natural content, then force pin to at least full viewport (kills side/under gaps)
      pin.style.minHeight = '0';
      pin.style.height = 'auto';
      var contentH = Math.max(pin.scrollHeight, 1);
      var pinMin = Math.max(contentH, vh);
      var bg = detectBg(pin, sec);

      sec.classList.add('hp-float-card');
      sec.style.setProperty('position', 'relative', 'important');
      sec.style.setProperty('z-index', String(i + 1), 'important');
      sec.style.setProperty('isolation', 'isolate', 'important');
      sec.style.setProperty('overflow', 'visible', 'important');
      sec.style.setProperty('margin-bottom', '0px', 'important');
      paintOpaque(sec, bg);

      if (isLast) {
        // No runway on last card — footer sits flush (no cream/dark gap above footer)
        sec.style.setProperty('height', 'auto', 'important');
        sec.style.setProperty('min-height', '0', 'important');
        pin.style.setProperty('position', 'relative', 'important');
        pin.style.removeProperty('top');
        pin.style.setProperty('width', '100%', 'important');
        pin.style.setProperty('height', 'auto', 'important');
        pin.style.setProperty('min-height', '0', 'important');
        pin.style.setProperty('box-shadow', 'none', 'important');
        pin.style.setProperty('overflow', 'visible', 'important');
        paintOpaque(pin, bg);
        return;
      }

      // Full-viewport opaque card + short runway; next card covers runway exactly
      sec.style.setProperty('height', pinMin + runway + 'px', 'important');
      sec.style.setProperty('pointer-events', 'none', 'important');
      paintOpaque(sec, bg);

      pin.style.setProperty('position', 'sticky', 'important');
      pin.style.setProperty('top', '0px', 'important');
      pin.style.setProperty('left', '0px', 'important');
      pin.style.setProperty('width', '100%', 'important');
      pin.style.setProperty('height', pinMin + 'px', 'important');
      pin.style.setProperty('min-height', pinMin + 'px', 'important');
      pin.style.setProperty('z-index', '1', 'important');
      pin.style.setProperty('overflow', contentH > vh ? 'auto' : 'hidden', 'important');
      pin.style.setProperty('pointer-events', 'auto', 'important');
      pin.style.setProperty(
        'box-shadow',
        '0 -24px 64px rgba(0,0,0,0.22)',
        'important'
      );
      pin.style.setProperty('transition', 'box-shadow 0.35s ease', 'important');
      paintOpaque(pin, bg);

      // Fill short content inside a tall pin so the card never looks half-empty
      if (contentH < vh) {
        pin.style.setProperty('display', 'flex', 'important');
        pin.style.setProperty('flex-direction', 'column', 'important');
        var child = pin.firstElementChild;
        if (child) {
          child.style.setProperty('flex', '1 1 auto', 'important');
          child.style.setProperty('min-height', '100%', 'important');
        }
      }

      var next = active[i + 1];
      if (next) {
        next.style.setProperty('margin-top', -runway + 'px', 'important');
        next.style.setProperty('position', 'relative', 'important');
        next.style.setProperty('z-index', String(i + 2), 'important');
        next.style.setProperty('isolation', 'isolate', 'important');
      }
    });
  }

  var resizeTimer = null;
  var layoutQueued = false;

  function schedule() {
    if (layoutQueued) return;
    layoutQueued = true;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      layoutQueued = false;
      layout();
    }, 120);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', layout);
  } else {
    layout();
  }
  window.addEventListener('load', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  setTimeout(schedule, 500);
})();
