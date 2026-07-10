(function () {
  'use strict';

  function initReveal() {
    const steps = document.querySelectorAll('[data-corp-step]');
    const bentoItems = document.querySelectorAll('[data-corp-bento]');
    const cards = document.querySelectorAll('[data-corp-card]');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el = entry.target;

          if (el.hasAttribute('data-corp-step') || el.hasAttribute('data-corp-bento') || el.hasAttribute('data-corp-card')) {
            el.classList.add('is-visible');
          }

          observer.unobserve(el);
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -40px 0px' }
    );

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
