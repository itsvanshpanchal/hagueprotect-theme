(function () {
  'use strict';

  function animateCount(el) {
    const target = parseInt(el.dataset.corpCount, 10);
    if (isNaN(target)) return;

    const suffix = el.querySelector('span');
    const suffixHTML = suffix ? suffix.outerHTML : '';
    const duration = 1800;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
      el.innerHTML = current + suffixHTML;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  function initReveal() {
    const counters = document.querySelectorAll('[data-corp-count]');
    const steps = document.querySelectorAll('[data-corp-step]');
    const bentoItems = document.querySelectorAll('[data-corp-bento]');
    const cards = document.querySelectorAll('[data-corp-card]');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el = entry.target;

          if (el.hasAttribute('data-corp-count') && !el.dataset.counted) {
            el.dataset.counted = 'true';
            animateCount(el);
          }

          if (el.hasAttribute('data-corp-step') || el.hasAttribute('data-corp-bento') || el.hasAttribute('data-corp-card')) {
            el.classList.add('is-visible');
          }

          observer.unobserve(el);
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -40px 0px' }
    );

    counters.forEach((el) => observer.observe(el));
    steps.forEach((el) => observer.observe(el));
    bentoItems.forEach((el) => observer.observe(el));
    cards.forEach((el) => observer.observe(el));
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initReveal();
      smoothScrollCTA();
    });
  } else {
    initReveal();
    smoothScrollCTA();
  }
})();
