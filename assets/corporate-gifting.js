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
    if (fallback) {
      fallback.hidden = false;
      if (window.initCorpCoverflow) window.initCorpCoverflow(fallback, true);
      return;
    }

    var occasionsSection = document.querySelector('[data-corp-occasions-section="true"]')?.closest('.shopify-section');
    if (!occasionsSection || document.getElementById('corp-coverflow-js-fallback')) return;

    var badges = ['@ Gift Set 1', '@ Gift Set 2', '@ Dhurandhar 2 Set', '@ Gift Set 4', '@ Gift Set 5'];
    var slides = badges.map(function (badge, i) {
      return '<button type="button" class="corp-coverflow__card" data-corp-cf-card data-index="' + i + '" aria-label="' + badge + '">' +
        '<div class="corp-coverflow__inner">' +
        '<span class="corp-coverflow__badge">' + badge + '</span>' +
        '<div class="corp-coverflow__placeholder" aria-hidden="true">Upload image</div>' +
        '</div></button>';
    }).join('');

    var wrap = document.createElement('div');
    wrap.id = 'corp-coverflow-js-fallback';
    wrap.className = 'corp-coverflow-fallback-root';
    wrap.setAttribute('data-corp-coverflow-fallback', 'true');
    wrap.innerHTML = [
      '<section class="corp-coverflow" data-corp-coverflow data-no-typewriter="true" data-spacing="168" data-start-index="2" data-autoplay="true" data-autoplay-speed="5000">',
      '<div class="corp-coverflow__container">',
      '<h2 class="corp-coverflow__heading">The Gifts that outlast the occasion</h2>',
      '<div class="corp-coverflow__stage">',
      '<div class="corp-coverflow__viewport" data-corp-cf-viewport>',
      '<button type="button" class="corp-coverflow__nav corp-coverflow__nav--prev" data-corp-cf-prev aria-label="Previous slide"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg></button>',
      '<div class="corp-coverflow__track" data-corp-cf-track>',
      slides,
      '</div>',
      '<button type="button" class="corp-coverflow__nav corp-coverflow__nav--next" data-corp-cf-next aria-label="Next slide"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg></button>',
      '</div></div></div></section>'
    ].join('');

    occasionsSection.insertAdjacentElement('afterend', wrap);
    if (window.initCorpCoverflow) window.initCorpCoverflow(wrap, true);
  }

  function revealTrustedByFallback() {
    if (!isCorporateGiftingPage()) return;
    if (document.querySelector('[data-corp-trusted-section="true"]')) return;

    var fallback = document.querySelector('[data-corp-trusted-fallback="true"]');
    if (fallback) {
      fallback.hidden = false;
      return;
    }

    var featuresSection = document.querySelector('.corp-features')?.closest('.shopify-section');
    if (!featuresSection || document.getElementById('corp-trusted-js-fallback')) return;

    var wrap = document.createElement('div');
    wrap.id = 'corp-trusted-js-fallback';
    wrap.className = 'corp-trusted-fallback-root';
    wrap.setAttribute('data-corp-trusted-fallback', 'true');
    wrap.innerHTML = [
      '<section class="corp-trusted" data-no-typewriter="true">',
      '<div class="corp-trusted__container" style="max-width:var(--site-max-width);margin:0 auto;padding:0 max(20px,var(--site-padding,24px))">',
      '<h2 class="corp-trusted__heading" style="margin:0 0 32px;text-align:center;font-family:Inter,sans-serif;font-size:52px;font-weight:300;line-height:1.1;letter-spacing:-.02em;color:#111">TRUSTED BY TEAMS WITH TASTE</h2>',
      '<div class="corp-trusted__panel" style="background:#f0f0f0;border-radius:24px;padding:48px 32px 32px">',
      '<div class="corp-trusted__grid" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:32px 24px;align-items:center;justify-items:center">',
      '<div class="corp-trusted__logo-wrap"><div style="min-height:48px;display:flex;align-items:center;justify-content:center;border:1px dashed rgba(17,17,17,.18);border-radius:8px;padding:12px;color:rgba(17,17,17,.35);font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase">Logo 1</div></div>',
      '<div class="corp-trusted__logo-wrap"><div style="min-height:48px;display:flex;align-items:center;justify-content:center;border:1px dashed rgba(17,17,17,.18);border-radius:8px;padding:12px;color:rgba(17,17,17,.35);font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase">Logo 2</div></div>',
      '<div class="corp-trusted__logo-wrap"><div style="min-height:48px;display:flex;align-items:center;justify-content:center;border:1px dashed rgba(17,17,17,.18);border-radius:8px;padding:12px;color:rgba(17,17,17,.35);font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase">Logo 3</div></div>',
      '<div class="corp-trusted__logo-wrap"><div style="min-height:48px;display:flex;align-items:center;justify-content:center;border:1px dashed rgba(17,17,17,.18);border-radius:8px;padding:12px;color:rgba(17,17,17,.35);font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase">Logo 4</div></div>',
      '<div class="corp-trusted__logo-wrap"><div style="min-height:48px;display:flex;align-items:center;justify-content:center;border:1px dashed rgba(17,17,17,.18);border-radius:8px;padding:12px;color:rgba(17,17,17,.35);font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase">Logo 5</div></div>',
      '<div class="corp-trusted__logo-wrap"><div style="min-height:48px;display:flex;align-items:center;justify-content:center;border:1px dashed rgba(17,17,17,.18);border-radius:8px;padding:12px;color:rgba(17,17,17,.35);font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase">Logo 6</div></div>',
      '<div class="corp-trusted__logo-wrap"><div style="min-height:48px;display:flex;align-items:center;justify-content:center;border:1px dashed rgba(17,17,17,.18);border-radius:8px;padding:12px;color:rgba(17,17,17,.35);font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase">Logo 7</div></div>',
      '<div class="corp-trusted__logo-wrap"><div style="min-height:48px;display:flex;align-items:center;justify-content:center;border:1px dashed rgba(17,17,17,.18);border-radius:8px;padding:12px;color:rgba(17,17,17,.35);font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase">Logo 8</div></div>',
      '<div class="corp-trusted__logo-wrap"><div style="min-height:48px;display:flex;align-items:center;justify-content:center;border:1px dashed rgba(17,17,17,.18);border-radius:8px;padding:12px;color:rgba(17,17,17,.35);font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase">Logo 9</div></div>',
      '</div>',
      '<p style="margin:32px 0 0;text-align:center;font-family:\'Darker Grotesque\',sans-serif;font-size:18px;color:#9a9a9a">and more...</p>',
      '</div></div></section>'
    ].join('');

    featuresSection.insertAdjacentElement('afterend', wrap);
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
    revealTrustedByFallback();
    initReveal();
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
