/*
  Homepage floating card stack — matches cinematic sticky panels:
  each section pins, the next slides up and covers it like a card.
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

  function paintOpaque(el, fallback) {
    if (!el) return;
    var bg = window.getComputedStyle(el).backgroundColor;
    if (isTransparent(bg)) {
      el.style.setProperty('background-color', fallback, 'important');
    }
  }

  function shouldSkip(sec) {
    if (!sec || !sec.classList.contains('shopify-section')) return true;
    // Already has its own sticky curtain / floating panel system
    if (sec.querySelector('[data-hp-story-sticky-track]')) return true;
    if (sec.querySelector('[data-fp-stack]')) return true;
    if (sec.classList.contains('section-floating-panels')) return true;
    // Empty / essentially no content
    if (!sec.firstElementChild) return true;
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
    sec.style.removeProperty('box-shadow');

    var pin = sec.querySelector(':scope > .hp-float-pin');
    if (pin) {
      pin.style.removeProperty('position');
      pin.style.removeProperty('top');
      pin.style.removeProperty('left');
      pin.style.removeProperty('width');
      pin.style.removeProperty('height');
      pin.style.removeProperty('min-height');
      pin.style.removeProperty('z-index');
      pin.style.removeProperty('overflow');
      pin.style.removeProperty('box-shadow');
      pin.style.removeProperty('background-color');
      pin.style.removeProperty('pointer-events');
      // Unwrap pin
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
    // On small phones use full vh pin still (needed for no white gap)
    var pinH = vh;
    // Slightly shorter runway on mobile so scroll feels snappier
    var runway = window.matchMedia('(max-width: ' + MOBILE_MAX + 'px)').matches
      ? Math.round(vh * 0.85)
      : vh;

    // Reset first
    sections.forEach(clearSection);

    main.style.setProperty('position', 'relative');
    main.style.setProperty('isolation', 'isolate');
    main.style.setProperty('overflow-x', 'clip');
    main.style.setProperty('overflow-y', 'visible');

    var active = sections.filter(function (sec) { return !shouldSkip(sec); });
    if (active.length < 2) return;

    active.forEach(function (sec, i) {
      var isLast = i === active.length - 1;
      var pin = ensurePin(sec);
      var contentH = Math.max(pin.scrollHeight, pinH);

      sec.classList.add('hp-float-card');
      sec.style.setProperty('position', 'relative', 'important');
      sec.style.setProperty('z-index', String(i + 1), 'important');
      sec.style.setProperty('isolation', 'isolate', 'important');
      sec.style.setProperty('overflow', 'visible', 'important');
      sec.style.setProperty('margin-bottom', '0px', 'important');
      // Do NOT force margin-top:0 here — previous card sets -runway on this section

      // Opaque card surface so the cover never flashes white
      var fallbackBg = '#ffffff';
      var sample = pin.querySelector('section, .mat-section, .hp-fam-sec, .corp-marquee, .split-cta, .footer-wrapper, .story-banner-wrapper, [class*="bg"]');
      if (sample) {
        var c = window.getComputedStyle(sample).backgroundColor;
        if (!isTransparent(c)) fallbackBg = c;
      }
      // Dark sections commonly used on homepage
      if (sec.querySelector('.mat-section, .hp-fam-sec, .corp-marquee, [data-hp-story-sticky-track]')) {
        fallbackBg = '#111111';
      }
      paintOpaque(pin, fallbackBg);
      paintOpaque(sec, fallbackBg);

      if (isLast) {
        sec.style.setProperty('height', 'auto', 'important');
        pin.style.setProperty('position', 'relative', 'important');
        pin.style.removeProperty('top');
        pin.style.setProperty('width', '100%');
        pin.style.setProperty('min-height', '0');
        pin.style.setProperty('box-shadow', 'none');
        return;
      }

      // Track = content + runway; pin sticks for the runway while next card covers
      sec.style.setProperty('height', contentH + runway + 'px', 'important');
      sec.style.setProperty('pointer-events', 'none', 'important');

      pin.style.setProperty('position', 'sticky', 'important');
      pin.style.setProperty('top', '0px', 'important');
      pin.style.setProperty('left', '0px', 'important');
      pin.style.setProperty('width', '100%', 'important');
      pin.style.setProperty('min-height', Math.min(contentH, pinH) + 'px', 'important');
      pin.style.setProperty('z-index', '1', 'important');
      pin.style.setProperty('overflow', 'hidden', 'important');
      pin.style.setProperty('pointer-events', 'auto', 'important');
      pin.style.setProperty(
        'box-shadow',
        '0 -28px 80px rgba(0,0,0,0.28), 0 -2px 0 rgba(0,0,0,0.06)',
        'important'
      );

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
  function schedule() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layout, 80);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', layout);
  } else {
    layout();
  }
  window.addEventListener('load', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  // Theme editor / late images
  setTimeout(layout, 400);
  setTimeout(layout, 1200);
})();
