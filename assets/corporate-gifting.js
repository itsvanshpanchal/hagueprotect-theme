(function () {
  'use strict';

  function parseTarget(raw) {
    const match = String(raw || '').trim().match(/(\d+)/);
    return match ? parseInt(match[1], 10) : NaN;
  }

  function animateLegacyHeroCounters(root) {
    const scope = root && root.querySelector ? root : document;
    const counters = scope.querySelectorAll('.corp-hero [data-corp-count]');

    counters.forEach(function (el) {
      if (el.dataset.counted === 'true') return;

      const target = parseTarget(el.getAttribute('data-corp-count') || el.textContent);
      if (isNaN(target)) return;

      const suffix = el.querySelector('span');
      const suffixHTML = suffix ? suffix.outerHTML : '';
      el.dataset.counted = 'true';

      const showTarget = function () {
        el.innerHTML = String(target) + suffixHTML;
      };

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        showTarget();
        return;
      }

      if (target <= 1) {
        showTarget();
        return;
      }

      const duration = 1800;
      const start = performance.now();
      el.innerHTML = '1' + suffixHTML;

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.max(1, Math.round(1 + (target - 1) * eased));
        el.innerHTML = String(current) + suffixHTML;
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          showTarget();
        }
      }

      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              requestAnimationFrame(tick);
              io.unobserve(entry.target);
            }
          });
        });
        io.observe(el);
      } else {
        requestAnimationFrame(tick);
      }
    });
  }

  function isInViewport(el) {
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
  }

  function revealElement(el) {
    el.classList.add('is-visible');
  }

  function initReveal() {
    const targets = document.querySelectorAll('[data-corp-step], [data-corp-bento], [data-corp-card]');
    if (!targets.length) return;

    targets.forEach((el) => {
      if (el.classList.contains('is-visible')) return;

      if (isInViewport(el)) {
        revealElement(el);
        return;
      }

      if (!('IntersectionObserver' in window)) {
        revealElement(el);
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            revealElement(entry.target);
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -10px 0px' }
      );

      observer.observe(el);
    });
  }

  function isCorporateGiftingPage() {
    return document.body.classList.contains('template-search-corporate-gifting') ||
      document.body.classList.contains('template-page-corporate');
  }

  function revealCoverflowFallback() {
    if (!isCorporateGiftingPage()) return;
    if (document.querySelector('[data-corp-coverflow-section="true"]')) return;

    var fallback = document.querySelector('[data-corp-coverflow-fallback="true"]');
    if (fallback) fallback.hidden = false;
  }

  function removeTrustedByFallbackDuplicates() {
    if (!document.querySelector('[data-corp-trusted-section="true"]')) return;
    document.querySelectorAll('.corp-trusted-fallback-root').forEach(function (el) {
      el.remove();
    });
  }

  function updateCorpFormContacts() {
    if (!isCorporateGiftingPage()) return;

    var email = 'info@hagueprotect.com';
    var phone = '8882683366';
    var whatsapp = '918882683366';

    document.querySelectorAll('[data-corp-contact-email]').forEach(function (el) {
      el.setAttribute('href', 'mailto:' + email);
    });
    document.querySelectorAll('[data-corp-contact-email-text]').forEach(function (el) {
      el.textContent = email;
    });
    document.querySelectorAll('[data-corp-contact-phone]').forEach(function (el) {
      el.setAttribute('href', 'https://wa.me/' + whatsapp);
    });
    document.querySelectorAll('[data-corp-contact-phone-text]').forEach(function (el) {
      el.textContent = phone;
    });

    var formSection = document.querySelector('.corp-form');
    if (!formSection) return;

    formSection.querySelectorAll('.corp-form__contact[href^="mailto:"]').forEach(function (el) {
      el.setAttribute('href', 'mailto:' + email);
      var value = el.querySelector('.corp-form__contact-value');
      if (value) value.textContent = email;
    });
    formSection.querySelectorAll('.corp-form__contact[href*="wa.me"]').forEach(function (el) {
      el.setAttribute('href', 'https://wa.me/' + whatsapp);
      var value = el.querySelector('.corp-form__contact-value');
      if (value) value.textContent = phone;
    });
  }

  function smoothScrollCTA() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href="#corp-inquiry"], a[href="#corp-hero"]');
      if (!link) return;
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  function boot(root) {
    animateLegacyHeroCounters(root);
    revealCoverflowFallback();
    removeTrustedByFallbackDuplicates();
    initReveal();
    updateCorpFormContacts();
    smoothScrollCTA();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      boot();
    });
  } else {
    boot();
  }

  document.addEventListener('shopify:section:load', function (event) {
    boot(event.target);
  });
})();
