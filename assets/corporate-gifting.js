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

  function injectOccasionsSection() {
    if (!isCorporateGiftingPage()) return;
    if (document.querySelector('[data-corp-occasions="true"]')) return;

    const processWrap = document.querySelector('.corp-process')?.closest('.shopify-section');
    if (!processWrap) return;

    const id = 'corp-occasions-js-fallback';
    const html = [
      '<style>',
      '#' + id + '.corp-occasions{position:relative;z-index:2;display:block!important;visibility:visible!important;opacity:1!important}',
      '#' + id + ' .corp-occasions__title-line1{font-family:Inter,sans-serif!important;font-size:clamp(34px,4.8vw,56px);font-weight:700!important;line-height:1.05;letter-spacing:-.03em;color:#111!important}',
      '#' + id + ' .corp-occasions__title-line2{font-family:Inter,sans-serif!important;font-size:clamp(24px,3.2vw,40px);font-weight:300!important;line-height:1.1;letter-spacing:-.02em;color:#111!important}',
      '#' + id + ' .corp-occasions__grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:clamp(16px,2.2vw,28px)}',
      '#' + id + ' .corp-occasions__card{display:flex;flex-direction:column;align-items:center;text-align:center;color:inherit}',
      '#' + id + ' .corp-occasions__media{width:100%;aspect-ratio:4/5;border-radius:20px;overflow:hidden;background:linear-gradient(145deg,#f3f3f3,#e8e8e8);box-shadow:0 10px 30px rgba(0,0,0,.06)}',
      '#' + id + ' .corp-occasions__placeholder{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:rgba(17,17,17,.28);font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}',
      '#' + id + ' .corp-occasions__label{margin:18px 0 0;font-family:Inter,sans-serif!important;font-size:clamp(18px,2vw,22px);font-weight:700!important;color:#111!important;line-height:1.2}',
      '#' + id + ' .corp-occasions__caption{margin:8px 0 0;font-size:clamp(15px,1.8vw,18px);line-height:1.35;color:#2563eb!important}',
      '@media(max-width:1024px){#' + id + ' .corp-occasions__grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:24px 20px}}',
      '@media(max-width:560px){#' + id + ' .corp-occasions__grid{grid-template-columns:1fr;max-width:360px;margin:0 auto}#' + id + ' .corp-occasions__header{text-align:center;margin-left:auto;margin-right:auto}}',
      '</style>',
      '<section class="corp-occasions" id="' + id + '" data-no-typewriter="true" data-corp-occasions="true">',
      '<div class="corp-occasions__container" style="max-width:var(--site-max-width);margin:0 auto;padding:clamp(72px,9vw,110px) max(20px,var(--site-padding,24px));background:#fff">',
      '<header class="corp-occasions__header" style="max-width:720px;margin:0 0 clamp(40px,5vw,56px)">',
      '<h2 class="corp-occasions__title" style="margin:0;display:flex;flex-direction:column;gap:4px">',
      '<span class="corp-occasions__title-line1">Gifts people keep.</span>',
      '<span class="corp-occasions__title-line2">Not re-gift.</span>',
      '</h2></header>',
      '<div class="corp-occasions__grid">',
      '<div class="corp-occasions__card"><div class="corp-occasions__media"><div class="corp-occasions__placeholder">Corporate</div></div><p class="corp-occasions__label">Corporate</p></div>',
      '<div class="corp-occasions__card"><div class="corp-occasions__media"><div class="corp-occasions__placeholder">Weddings</div></div><p class="corp-occasions__label">Weddings</p></div>',
      '<div class="corp-occasions__card"><div class="corp-occasions__media"><div class="corp-occasions__placeholder">Celebrations</div></div><p class="corp-occasions__label">Celebrations</p><p class="corp-occasions__caption">(Birthday, Housewarming, Anniversary)</p></div>',
      '<div class="corp-occasions__card"><div class="corp-occasions__media"><div class="corp-occasions__placeholder">Collaborations</div></div><p class="corp-occasions__label">Collaborations</p></div>',
      '</div></div></section>'
    ].join('');

    processWrap.insertAdjacentHTML('afterbegin', html);
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
    injectOccasionsSection();
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
