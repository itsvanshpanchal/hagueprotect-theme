(function () {
  'use strict';

  var EXCLUDE_ANCESTORS =
    '.cart-drawer, #cart-drawer, .header, header, footer, .rail-card, .prod-card-dtc, .theme-login-overlay, .theme-dashboard-overlay, .faq-custom, .corp-hero, .corp-process, .corp-features, .corp-packages, .corp-form, .corp-marquee, .biz-hero, .biz-solutions, .biz-advantages, .biz-process, .biz-form, .biz-marquee, .comm-section, .comm-headline, .bs-coverflow-card, .bs-coverflow-card__title, [data-no-typewriter]';

  var MOBILE_MQ = window.matchMedia('(max-width: 749px)');

  function isMobileOnlyTypewriter(element) {
    return !!(element && element.hasAttribute('data-typewriter-mobile-only'));
  }

  function reserveTypewriterHeight(element) {
    if (!element || !isMobileOnlyTypewriter(element) || !MOBILE_MQ.matches) return;
    if (element.dataset.typewriterHeightReserved === '1') return;

    function apply() {
      if (element.dataset.typewriterHeightReserved === '1') return;
      if (prepareMobileTypewriterShell(element)) {
        element.dataset.typewriterHeightReserved = '1';
      }
    }

    if (document.fonts && document.fonts.status === 'loaded') {
      apply();
    } else {
      runWhenFontsReady(apply, 600);
    }
  }

  function hasMarkupMobileShell(element) {
    return !!(element && element.querySelector(':scope .hp-typewriter-mobile-shell .hp-typewriter-live'));
  }

  function prepareMobileTypewriterShell(element) {
    if (!element || !isMobileOnlyTypewriter(element) || !MOBILE_MQ.matches) return false;
    if (element.dataset.typewriterShell === '1') return true;
    if (!hasMarkupMobileShell(element)) return false;

    element.dataset.typewriterShell = '1';
    return true;
  }

  function teardownMobileTypewriterShell(element) {
    if (!element || element.dataset.typewriterShell !== '1') return;
    delete element.dataset.typewriterShell;
  }

  function getMobileTypewriterLiveRoot(element) {
    if (!element || !isMobileOnlyTypewriter(element) || !MOBILE_MQ.matches) return null;
    return element.querySelector(':scope .hp-typewriter-live');
  }

  function getStructuredTypewriterElements(element) {
    var liveRoot = getMobileTypewriterLiveRoot(element);
    var searchRoot = liveRoot || element;
    var parentCheck = liveRoot
      ? function (el) { return el.parentElement === liveRoot; }
      : function (el) { return el.parentElement === element; };

    var pairEls = Array.prototype.filter.call(
      searchRoot.querySelectorAll('.hp-heading-pair'),
      parentCheck
    );
    var lineEls = Array.prototype.filter.call(
      searchRoot.querySelectorAll('.hp-heading-line, .hero-heading-line'),
      parentCheck
    );

    if (pairEls.length && lineEls.length) {
      return Array.prototype.filter.call(searchRoot.children, function (el) {
        return (
          el.classList.contains('hp-heading-line') ||
          el.classList.contains('hp-heading-pair') ||
          el.classList.contains('hero-heading-line')
        );
      });
    }

    if (pairEls.length) return pairEls;
    if (lineEls.length) return lineEls;
    return [];
  }

  function runWhenFontsReady(fn, fallbackMs) {
    var done = false;
    function go() {
      if (done) return;
      done = true;
      fn();
    }
    if (fallbackMs) {
      window.setTimeout(go, fallbackMs);
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(go).catch(go);
    } else {
      go();
    }
  }

  function resetMobileOnlyTypewriter(heading) {
    if (!heading || !isMobileOnlyTypewriter(heading) || !MOBILE_MQ.matches) return;
    if (heading.dataset.typewriterActive === 'true') return;

    var live = heading.querySelector(':scope .hp-typewriter-live');
    var sizer = heading.querySelector(':scope .hp-typewriter-sizer');
    if (live && sizer) {
      live.innerHTML = sizer.innerHTML;
    }

    teardownMobileTypewriterShell(heading);
    delete heading.dataset.typewriterDone;
    delete heading.dataset.typewriterHeightReserved;
    heading.style.minHeight = '';
    heading.style.height = '';
    heading.style.position = '';
    heading.classList.remove('is-typewriting');
  }

  function observeMobileOnlyHeading(heading, observer) {
    if (!heading || !isMobileOnlyTypewriter(heading) || !MOBILE_MQ.matches) return false;
    if (heading.dataset.typewriterObserved === '1') return true;
    observer.observe(heading);
    heading.dataset.typewriterObserved = '1';
    return true;
  }

  function lockTypewriterHeight(element) {
    var h = element.offsetHeight;
    if (h > 0) {
      element.style.minHeight = h + 'px';
    }
  }

  function mobileTypewriterObserverOptions() {
    return { threshold: 0.2, rootMargin: '0px' };
  }

  function isScienceLongevityPage() {
    return (
      document.body.classList.contains('template-page-science-longevity') ||
      document.body.classList.contains('template-search-science-longevity')
    );
  }

  function shouldType(element) {
    if (!element || element.dataset.typewriterDone || element.dataset.typewriterActive) {
      return false;
    }
    if (element.hasAttribute('data-no-typewriter')) {
      return false;
    }
    if (isScienceLongevityPage() && element.closest('.hp-sci')) {
      return false;
    }
    var mobileOnly = isMobileOnlyTypewriter(element);
    if (MOBILE_MQ.matches) {
      /* Mobile: only headings marked mobile-only (e.g. Bestselling Sneaker Care) */
      if (!mobileOnly) {
        return false;
      }
    } else if (mobileOnly) {
      return false;
    }
    if (element.closest(EXCLUDE_ANCESTORS)) {
      return false;
    }
    var text = (element.textContent || '').trim();
    return text.length > 0;
  }

  function collectHeadings(root) {
    var scope = root || document;
    return Array.prototype.slice.call(
      scope.querySelectorAll('main h1, main h2, main h3')
    ).filter(shouldType);
  }

  /* Headings built from styled line spans (e.g. section-heading-text renders
     .hp-heading-line, hero renders .hero-heading-line). Type INTO those spans
     so per-line styling — casing, colored/second line, line breaks — survives.
     .hp-heading-pair keeps main + accent as siblings; accent types in script font. */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function parsePairOrLine(el) {
    /* New markup: .hp-heading-pair > .hp-heading-line + .hp-heading-accent */
    if (el.classList && el.classList.contains('hp-heading-pair')) {
      var mainEl = el.querySelector(':scope > .hp-heading-line');
      var accentEl = el.querySelector(':scope > .hp-heading-accent');
      if (mainEl && accentEl) {
        var mainText = (mainEl.textContent || '').replace(/\s+/g, ' ');
        mainText = mainText.replace(/^\s+/, '').replace(/\s+$/, ' ');
        if (mainText && !/\s$/.test(mainText)) mainText += ' ';
        var accentText = (accentEl.textContent || '').replace(/\s+/g, ' ').trim();
        return {
          el: el,
          mainText: mainText,
          accentText: accentText,
          accentClass: accentEl.className || 'hp-heading-accent',
          accentStyle: accentEl.getAttribute('style') || '',
          text: (mainText + accentText).replace(/\s+/g, ' ').trim(),
          html: el.innerHTML,
          hasAccent: true
        };
      }
    }

    /* Legacy: accent nested inside .hp-heading-line */
    var accent = el.querySelector('.hp-heading-accent');
    if (!accent) {
      return {
        el: el,
        text: (el.textContent || '').replace(/\s+/g, ' ').trim(),
        html: el.innerHTML,
        hasAccent: false
      };
    }

    var clone = el.cloneNode(true);
    var accentClone = clone.querySelector('.hp-heading-accent');
    if (accentClone) accentClone.parentNode.removeChild(accentClone);
    var nestedMain = (clone.textContent || '').replace(/\s+/g, ' ');
    nestedMain = nestedMain.replace(/^\s+/, '').replace(/\s+$/, ' ');
    if (nestedMain && !/\s$/.test(nestedMain)) nestedMain += ' ';

    return {
      el: el,
      mainText: nestedMain,
      accentText: (accent.textContent || '').replace(/\s+/g, ' ').trim(),
      accentClass: accent.className || 'hp-heading-accent',
      accentStyle: accent.getAttribute('style') || '',
      text: (nestedMain + (accent.textContent || '')).replace(/\s+/g, ' ').trim(),
      html: el.innerHTML,
      hasAccent: true
    };
  }

  function lineCharCount(d) {
    return d.hasAccent ? d.mainText.length + d.accentText.length : d.text.length;
  }

  function renderLineProgress(d, charIndex, cursor) {
    if (!d.hasAccent) {
      d.el.textContent = d.text.substring(0, charIndex);
      d.el.appendChild(cursor);
      return;
    }

    var mainLen = Math.min(charIndex, d.mainText.length);
    var accentLen = Math.max(0, charIndex - d.mainText.length);
    var html =
      '<span class="hp-heading-line hp-heading-line--1">' +
      escapeHtml(d.mainText.substring(0, mainLen)) +
      '</span>' +
      '<span class="' +
      escapeHtml(d.accentClass) +
      '"' +
      (d.accentStyle ? ' style="' + escapeHtml(d.accentStyle) + '"' : '') +
      '>' +
      escapeHtml(d.accentText.substring(0, accentLen)) +
      '</span>';

    d.el.innerHTML = html;
    d.el.appendChild(cursor);
  }

  function typeStructuredHeading(element, lineEls) {
    var mobileShell = isMobileOnlyTypewriter(element) && MOBILE_MQ.matches;
    if (mobileShell) {
      prepareMobileTypewriterShell(element);
    }

    element.dataset.typewriterActive = 'true';
    element.classList.add('is-typewriting');

    var data = Array.prototype.map.call(lineEls, parsePairOrLine);
    var mobileOnly = isMobileOnlyTypewriter(element);

    var full = data
      .map(function (d) { return d.text; })
      .join(' ');

    var speed = full.length > 90 ? 32 : full.length > 50 ? 42 : 55;
    if (MOBILE_MQ.matches) {
      speed = full.length > 90 ? 26 : full.length > 50 ? 34 : 44;
    }
    var linePause = 180;

    var originalMinHeight = element.style.minHeight;

    var cursor = document.createElement('span');
    cursor.className = 'hp-typewriter-cursor';
    cursor.setAttribute('aria-hidden', 'true');

    element.setAttribute('aria-label', full);

    var li = 0;
    var ci = 0;

    function finishLine(d) {
      d.el.innerHTML = d.html;
    }

    function tick() {
      var d = data[li];
      var total = lineCharCount(d);
      renderLineProgress(d, ci, cursor);

      if (ci < total) {
        ci += 1;
        window.setTimeout(tick, speed);
      } else if (li < data.length - 1) {
        finishLine(d);
        li += 1;
        ci = 0;
        window.setTimeout(tick, linePause);
      } else {
        if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
        finishLine(d);
        if (mobileOnly && MOBILE_MQ.matches && element.dataset.typewriterShell === '1') {
          /* Height stays locked by the hidden sizer shell */
        } else if (mobileOnly && MOBILE_MQ.matches) {
          lockTypewriterHeight(element);
        } else {
          element.style.minHeight = originalMinHeight;
        }
        element.dataset.typewriterDone = 'true';
        delete element.dataset.typewriterActive;
        element.classList.remove('is-typewriting');
      }
    }

    function beginTyping() {
      if (!(mobileOnly && MOBILE_MQ.matches && element.dataset.typewriterShell === '1')) {
        lockTypewriterHeight(element);
      }
      data.forEach(function (d) { d.el.textContent = ''; });
      tick();
    }

    runWhenFontsReady(beginTyping, 600);
  }

  function typeHeading(element) {
    if (!shouldType(element)) return;
    if (isMobileOnlyTypewriter(element)) {
      element.dataset.typewriterPlayedVisible = '1';
    }

    var structuredEls = getStructuredTypewriterElements(element);
    if (structuredEls.length) {
      typeStructuredHeading(element, structuredEls);
      return;
    }

    element.dataset.typewriterActive = 'true';
    element.classList.add('is-typewriting');

    var originalHTML = element.innerHTML;
    var fullText = element.innerHTML
      .replace(/<br\s*[\/]?>/gi, '[[BR]]')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*\[\[BR\]\]\s*/g, '\n')
      .trim();

    var speed = fullText.length > 90 ? 32 : fullText.length > 50 ? 42 : 55;
    if (MOBILE_MQ.matches) {
      speed = fullText.length > 90 ? 26 : fullText.length > 50 ? 34 : 44;
    }

    var originalPosition = window.getComputedStyle(element).position;
    if (originalPosition === 'static') {
      element.style.position = 'relative';
    }

    element.innerHTML = '<span style="visibility: hidden;" aria-hidden="true">' + originalHTML + '</span><span class="hp-typewriter-text" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></span>';
    var textContainer = element.querySelector('.hp-typewriter-text');
    
    element.setAttribute('aria-label', fullText.replace(/\n/g, ' '));

    var index = 0;

    function tick() {
      if (index <= fullText.length) {
        var currentText = fullText.substring(0, index);
        textContainer.innerHTML = currentText.replace(/\n/g, '<br>') + '<span class="hp-typewriter-cursor" aria-hidden="true"></span>';
        index += 1;
        window.setTimeout(tick, speed);
      } else {
        element.innerHTML = originalHTML;
        element.style.position = '';
        element.dataset.typewriterDone = 'true';
        delete element.dataset.typewriterActive;
        element.classList.remove('is-typewriting');
      }
    }

    tick();
  }

  function initTypewriter(root) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    var scope = root || document;
    var headings = collectHeadings(scope);
    headings.forEach(reserveTypewriterHeight);

    if (!('IntersectionObserver' in window)) {
      headings.forEach(typeHeading);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            typeHeading(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      MOBILE_MQ.matches ? mobileTypewriterObserverOptions() : { threshold: 0.35, rootMargin: '0px 0px -8% 0px' }
    );

    headings.forEach(function (heading) {
      if (observeMobileOnlyHeading(heading, observer)) {
        return;
      }

      var rect = heading.getBoundingClientRect();
      var inView = rect.top < window.innerHeight * 0.85 && rect.bottom > 0;

      if (inView) {
        window.setTimeout(function () {
          typeHeading(heading);
        }, 120);
      } else {
        observer.observe(heading);
      }
    });
  }

  function onReady() {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.classList.add('hp-typewriter-capable');
    }

    function start() {
      initTypewriter();
    }

    runWhenFontsReady(start, 600);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }

  window.addEventListener('hp-floating-cards:ready', function () {
    if (!MOBILE_MQ.matches) return;
    var mobileHeadings = document.querySelectorAll(
      'main h1[data-typewriter-mobile-only], main h2[data-typewriter-mobile-only], main h3[data-typewriter-mobile-only]'
    );
    mobileHeadings.forEach(function (heading) {
      delete heading.dataset.typewriterObserved;
      if (heading.dataset.typewriterDone === 'true' && heading.dataset.typewriterPlayedVisible !== '1') {
        resetMobileOnlyTypewriter(heading);
      }
    });
    initTypewriter(document);
  });

  document.addEventListener('shopify:section:load', function (event) {
    if (event.detail && event.detail.sectionId) {
      var section = document.getElementById('shopify-section-' + event.detail.sectionId);
      if (section) {
        initTypewriter(section);
      }
    }
  });
})();
