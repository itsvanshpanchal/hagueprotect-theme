(function () {
  'use strict';

  function initHowToGuide(section) {
    const chapters = section.querySelectorAll('[data-htu-chapter]');
    const navLinks = section.querySelectorAll('[data-htu-nav]');
    const reveals = section.querySelectorAll('[data-htu-reveal]');
    const rail = section.querySelector('[data-htu-rail]');

    /* Scroll-spy: highlight material nav */
    if (chapters.length && navLinks.length) {
      const spy = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const id = entry.target.id;
            navLinks.forEach((link) => {
              link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
            });
          });
        },
        { rootMargin: '-40% 0px -45% 0px', threshold: 0 }
      );
      chapters.forEach((ch) => spy.observe(ch));
    }

    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href.charAt(0) !== '#') return;
        const target = section.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    /* Horizontal rail drag scroll on desktop */
    if (rail) {
      let isDown = false;
      let startX;
      let scrollLeft;

      rail.addEventListener('mousedown', (e) => {
        isDown = true;
        rail.classList.add('is-dragging');
        startX = e.pageX - rail.offsetLeft;
        scrollLeft = rail.scrollLeft;
      });
      rail.addEventListener('mouseleave', () => {
        isDown = false;
        rail.classList.remove('is-dragging');
      });
      rail.addEventListener('mouseup', () => {
        isDown = false;
        rail.classList.remove('is-dragging');
      });
      rail.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - rail.offsetLeft;
        rail.scrollLeft = scrollLeft - (x - startX) * 1.5;
      });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach((el) => observer.observe(el));
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
