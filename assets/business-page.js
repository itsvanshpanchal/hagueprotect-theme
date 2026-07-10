(function () {
  'use strict';

  function parseCounterValue(raw) {
    const match = String(raw || '').trim().match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : NaN;
  }

  function getSuffix(el) {
    const text = el.textContent.trim();
    const numMatch = text.match(/^(\d+)(.*)$/);
    return numMatch ? numMatch[2] : '';
  }

  function animateCounter(el) {
    if (!el || el.dataset.bizCounterReady === 'true') return;

    const raw = el.getAttribute('data-biz-counter-value') || el.textContent;
    const target = parseCounterValue(raw);
    if (isNaN(target)) return;

    const suffix = getSuffix(el);
    el.dataset.bizCounterReady = 'true';

    const showTarget = function () {
      el.textContent = String(target) + suffix;
    };

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      showTarget();
      return;
    }

    if (target <= 1) {
      showTarget();
      return;
    }

    const duration = 1800;
    const start = performance.now();
    el.textContent = '1' + suffix;

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.max(1, Math.round(1 + (target - 1) * eased));
      el.textContent = String(current) + suffix;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        showTarget();
      }
    }

    requestAnimationFrame(tick);
  }

  function initCounters(root) {
    const scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('[data-biz-counter]').forEach(animateCounter);
  }

  function initReveal() {
    const targets = document.querySelectorAll('[data-biz-reveal]');
    if (!targets.length) return;

    targets.forEach(function (el) {
      if (el.classList.contains('is-visible')) return;

      if (!('IntersectionObserver' in window)) {
        el.classList.add('is-visible');
        return;
      }

      const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );

      observer.observe(el);
    });
  }

  function smoothScroll() {
    document.addEventListener('click', function (e) {
      const link = e.target.closest('a[href^="#biz-"]');
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
    initCounters(root);
    initReveal();
    smoothScroll();
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
