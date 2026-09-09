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

    /* Ensure grid step titles and text are present below images */
    const stepData = [
      { title: 'Apply', text: 'Place dirty shoes on the Shoozas cleaning mat. Shake well and pump the foam cleaner directly onto soiled areas. Always test on a small area first.' },
      { title: 'Scrub', text: 'Scrub the shoes in circular motions with the all-purpose brush. Start with the upper and work your way down to the soles.' },
      { title: 'Dry',   text: 'Wipe away excess foam with the microfiber towel and let the shoes air dry indoors. Rinse the brush and cleaning mat with water before storing.' }
    ];
    section.querySelectorAll('.htu-v2__grid').forEach(function(grid) {
      var cards = grid.querySelectorAll('.htu-v2__grid-card');
      cards.forEach(function(card, i) {
        if (i >= stepData.length) return;
        if (!card.querySelector('.htu-v2__grid-title')) {
          var h3 = document.createElement('h3');
          h3.className = 'htu-v2__grid-title';
          h3.setAttribute('data-no-typewriter', 'true');
          h3.textContent = stepData[i].title;
          card.appendChild(h3);
        }
        if (!card.querySelector('.htu-v2__grid-text')) {
          var p = document.createElement('p');
          p.className = 'htu-v2__grid-text';
          p.textContent = stepData[i].text;
          card.appendChild(p);
        }
      });
    });
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
