(function () {
  'use strict';

  var EXCLUDE_ANCESTORS =
    '.cart-drawer, #cart-drawer, .header, header, footer, .rail-card, .prod-card-dtc, .theme-login-overlay, .theme-dashboard-overlay, .faq-custom, .corp-hero, .corp-process, .corp-features, .corp-packages, .corp-form, .corp-marquee, .biz-hero, .biz-solutions, .biz-advantages, .biz-process, .biz-form, .biz-marquee, .comm-section, .comm-headline, [data-no-typewriter]';

  function shouldType(element) {
    if (!element || element.dataset.typewriterDone || element.dataset.typewriterActive) {
      return false;
    }
    if (element.hasAttribute('data-no-typewriter')) {
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
      '</span>';

    if (charIndex >= d.mainText.length) {
      html +=
        '<span class="' +
        escapeHtml(d.accentClass) +
        '"' +
        (d.accentStyle ? ' style="' + escapeHtml(d.accentStyle) + '"' : '') +
        '>' +
        escapeHtml(d.accentText.substring(0, accentLen)) +
        '</span>';
    }

    d.el.innerHTML = html;
    d.el.appendChild(cursor);
  }

  function typeStructuredHeading(element, lineEls) {
    element.dataset.typewriterActive = 'true';

    var data = Array.prototype.map.call(lineEls, parsePairOrLine);

    var full = data
      .map(function (d) { return d.text; })
      .join(' ');
    var speed = full.length > 90 ? 32 : full.length > 50 ? 42 : 55;
    var linePause = 180;

    var originalMinHeight = element.style.minHeight;
    element.style.minHeight = element.offsetHeight + 'px';
    data.forEach(function (d) { d.el.textContent = ''; });

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
        element.style.minHeight = originalMinHeight;
        element.dataset.typewriterDone = 'true';
        delete element.dataset.typewriterActive;
      }
    }

    tick();
  }

  function typeHeading(element) {
    if (!shouldType(element)) return;

    /* Prefer accent pairs (main + script sibling), then top-level line spans. */
    var pairEls = Array.prototype.filter.call(
      element.querySelectorAll('.hp-heading-pair'),
      function (el) {
        return el.parentElement === element;
      }
    );
    if (pairEls.length) {
      typeStructuredHeading(element, pairEls);
      return;
    }

    var lineEls = Array.prototype.filter.call(
      element.querySelectorAll('.hp-heading-line, .hero-heading-line'),
      function (el) {
        return el.parentElement === element;
      }
    );
    if (lineEls.length) {
      typeStructuredHeading(element, lineEls);
      return;
    }

    element.dataset.typewriterActive = 'true';

    var originalHTML = element.innerHTML;
    var fullText = element.innerHTML
      .replace(/<br\s*[\/]?>/gi, '[[BR]]')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*\[\[BR\]\]\s*/g, '\n')
      .trim();
    var speed = fullText.length > 90 ? 32 : fullText.length > 50 ? 42 : 55;

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
      }
    }

    tick();
  }

  function initTypewriter(root) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    var headings = collectHeadings(root);

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
      { threshold: 0.35, rootMargin: '0px 0px -8% 0px' }
    );

    headings.forEach(function (heading) {
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
    initTypewriter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }

  document.addEventListener('shopify:section:load', function (event) {
    if (event.detail && event.detail.sectionId) {
      var section = document.getElementById('shopify-section-' + event.detail.sectionId);
      if (section) {
        initTypewriter(section);
      }
    }
  });
})();
