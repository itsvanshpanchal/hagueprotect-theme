(function () {
  'use strict';

  function initHowToGuide(section) {
    const chapters = section.querySelectorAll('[data-htu-chapter]');
    const navLinks = section.querySelectorAll('[data-htu-nav]');
    const reveals = section.querySelectorAll('[data-htu-reveal]');
    const rail = section.querySelector('[data-htu-rail]');

    /* Tab switching logic for materials */
    function switchTab(targetId) {
      // Update nav links to show active state
      navLinks.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === targetId);
      });
      // Show only the target chapter and hide others
      chapters.forEach((ch) => {
        if ('#' + ch.id === targetId) {
          ch.style.display = 'block';
          // Ensure animation triggers
          setTimeout(() => ch.classList.add('is-in'), 50);
        } else {
          ch.style.display = 'none';
          ch.classList.remove('is-in');
        }
      });
    }

    // Initialize first tab as active
    if (chapters.length > 0) {
      switchTab('#' + chapters[0].id);
    }

    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href.charAt(0) !== '#') return;
        const target = section.querySelector(href);
        if (target) {
          e.preventDefault();
          switchTab(href);
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
    /* Force CSS update via JS to bypass Shopify .liquid caching delays */
    if (!document.getElementById('htu-v2-forced-styles')) {
      const style = document.createElement('style');
      style.id = 'htu-v2-forced-styles';
      style.textContent = `
        .htu-v2__grid-header {
          width: 100% !important;
          max-width: var(--site-max-width, 1200px) !important;
          margin: 0 auto 48px auto !important;
          padding: 0 24px !important;
          text-align: left !important;
        }
        .htu-v2__grid {
          width: 100% !important;
          max-width: var(--site-max-width, 1200px) !important;
          margin: 0 auto !important;
          padding: 0 24px clamp(56px, 7vw, 80px) !important;
        }
        .htu-v2__rules, .htu-v2__cta {
          display: none !important;
        }
        .htu-v2__nav-title, p.htu-v2__nav-title {
          font-family: 'Inter', sans-serif !important;
          font-size: 52px !important;
          font-weight: 300 !important;
          text-transform: none !important;
          letter-spacing: -0.02em !important;
          line-height: 1.1 !important;
        }
      `;
      document.head.appendChild(style);
    }
    document.querySelectorAll('[data-htu-guide]').forEach(initHowToGuide);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
