(function () {
  'use strict';

  var EXCLUDE_ANCESTORS =
    '.cart-drawer, #cart-drawer, .header, header, footer, .rail-card, .prod-card-dtc, .theme-login-overlay, .theme-dashboard-overlay, [data-no-typewriter]';

  function shouldType(element) {
    if (!element || element.dataset.typewriterDone || element.dataset.typewriterActive) {
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

  function typeHeading(element) {
    if (!shouldType(element)) return;

    element.dataset.typewriterActive = 'true';
    element.classList.add('hp-typewriter--typing');

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
        element.classList.remove('hp-typewriter--typing');
        element.classList.add('hp-typewriter--done');
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
