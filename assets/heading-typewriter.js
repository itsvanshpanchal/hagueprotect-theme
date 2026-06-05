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

    var originalHTML = element.innerHTML;
    var fullText = element.textContent.trim();
    var speed = fullText.length > 90 ? 32 : fullText.length > 50 ? 42 : 55;

    element.textContent = '';
    element.setAttribute('aria-label', fullText);

    var cursor = document.createElement('span');
    cursor.className = 'hp-typewriter-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    element.appendChild(cursor);

    var index = 0;

    function tick() {
      if (index <= fullText.length) {
        element.textContent = fullText.substring(0, index);
        element.appendChild(cursor);
        index += 1;
        window.setTimeout(tick, speed);
      } else {
        element.innerHTML = originalHTML;
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
