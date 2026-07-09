(function () {
  'use strict';

  function initHowToGuide(section) {
    const tabs = section.querySelectorAll('[data-htu-tab]');
    const panels = section.querySelectorAll('[data-htu-panel]');
    const indicator = section.querySelector('[data-htu-indicator]');
    const steps = section.querySelectorAll('[data-htu-step]');
    const revealItems = section.querySelectorAll('[data-htu-reveal]');

    function setActiveTab(tab) {
      const key = tab.dataset.htuTab;
      tabs.forEach((t) => t.classList.toggle('is-active', t === tab));
      panels.forEach((p) => p.classList.toggle('is-active', p.dataset.htuPanel === key));

      if (indicator) {
        indicator.style.width = tab.offsetWidth + 'px';
        indicator.style.transform = 'translateX(' + tab.offsetLeft + 'px)';
      }
    }

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => setActiveTab(tab));
    });

    if (tabs.length && indicator) {
      const active = section.querySelector('[data-htu-tab].is-active') || tabs[0];
      requestAnimationFrame(() => setActiveTab(active));
      window.addEventListener('resize', () => {
        const current = section.querySelector('[data-htu-tab].is-active') || tabs[0];
        if (current) setActiveTab(current);
      });
    }

    steps.forEach((step, i) => {
      step.style.transitionDelay = i * 0.12 + 's';
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -30px 0px' }
    );

    revealItems.forEach((el) => observer.observe(el));
    steps.forEach((el) => observer.observe(el));
  }

  function boot() {
    document.querySelectorAll('[data-htu-guide]').forEach(initHowToGuide);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
