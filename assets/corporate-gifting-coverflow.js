(function () {
  'use strict';

  function initCoverflow(root) {
    if (!root || root.dataset.corpCfReady === 'true') return;

    var viewport = root.querySelector('[data-corp-cf-viewport]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-corp-cf-card]'));
    var prevBtn = root.querySelector('[data-corp-cf-prev]');
    var nextBtn = root.querySelector('[data-corp-cf-next]');
    if (!cards.length) return;

    root.dataset.corpCfReady = 'true';

    var index = 0;
    var transitionTimer = null;
    var autoplayTimer = null;
    var touchStartX = 0;
    var touchStartY = 0;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var autoplay = root.dataset.autoplay !== 'false' && !reducedMotion;
    var autoplayMs = parseInt(root.dataset.autoplaySpeed || '5000', 10);

    function isMobile() {
      return window.innerWidth <= 767;
    }

    function spacing() {
      if (!isMobile()) {
        return parseFloat(root.dataset.spacing || '200');
      }
      return Math.max(0, window.innerWidth * 0.08);
    }

    function layoutConfig() {
      if (!isMobile()) {
        return {
          rotateStep: 38,
          zDepth: 120,
          minScale: 0.72,
          maxVisible: 2,
          swipeThreshold: 40,
          duration: 750
        };
      }
      return {
        rotateStep: 0,
        zDepth: 0,
        minScale: 1,
        maxVisible: 0,
        swipeThreshold: 28,
        duration: 420
      };
    }

    function wrapOffset(offset, total) {
      if (offset > total / 2) return offset - total;
      if (offset < -total / 2) return offset + total;
      return offset;
    }

    function setTransitioning(active) {
      if (transitionTimer) window.clearTimeout(transitionTimer);
      if (active) {
        var cfg = layoutConfig();
        transitionTimer = window.setTimeout(function () {}, reducedMotion ? 0 : cfg.duration);
      }
    }

    function layout() {
      var space = spacing();
      var total = cards.length;
      var cfg = layoutConfig();
      var mobile = isMobile();

      cards.forEach(function (card, i) {
        var offset = wrapOffset(i - index, total);
        var abs = Math.abs(offset);
        var isActive = offset === 0;

        if (mobile) {
          if (!isActive) {
            card.style.transform = 'translate3d(-50%, -50%, 0) scale(0.94)';
            card.style.opacity = '0';
            card.style.visibility = 'hidden';
            card.style.pointerEvents = 'none';
            card.classList.remove('is-active');
            card.setAttribute('aria-hidden', 'true');
            card.tabIndex = -1;
            return;
          }

          card.classList.add('is-active');
          card.style.visibility = 'visible';
          card.style.opacity = '1';
          card.style.zIndex = '100';
          card.style.pointerEvents = 'auto';
          card.style.transform = 'translate3d(-50%, -50%, 0) scale(1)';
          card.setAttribute('aria-hidden', 'false');
          card.tabIndex = 0;
          return;
        }

        if (abs > cfg.maxVisible + 1) {
          card.style.transform = 'translate3d(-50%, -50%, 0) scale(0.8)';
          card.style.opacity = '0';
          card.style.pointerEvents = 'none';
          card.classList.remove('is-active');
          card.setAttribute('aria-hidden', 'true');
          card.tabIndex = -1;
          return;
        }

        var rotateY = offset * -cfg.rotateStep;
        var translateX = offset * space;
        var translateZ = -abs * cfg.zDepth;
        var scale = isActive ? 1 : Math.max(cfg.minScale, 1 - abs * 0.14);
        var opacity = abs > 2 ? 0 : (isActive ? 1 : Math.max(0.35, 1 - abs * 0.22));

        card.style.transform = 'translate3d(calc(-50% + ' + translateX + 'px), -50%, ' + translateZ + 'px) rotateY(' + rotateY + 'deg) scale(' + scale + ')';
        card.style.opacity = opacity;
        card.style.visibility = 'visible';
        card.style.zIndex = String(100 - abs);
        card.style.pointerEvents = abs > 2 ? 'none' : 'auto';
        card.classList.toggle('is-active', isActive);
        card.setAttribute('aria-hidden', abs > 1 ? 'true' : 'false');
        card.tabIndex = isActive ? 0 : -1;
      });
    }

    function goTo(nextIndex) {
      if (!cards.length) return;
      var next = (nextIndex + cards.length) % cards.length;
      if (next === index) return;
      index = next;
      setTransitioning(true);
      layout();
      restartAutoplay();
    }

    function step(dir) {
      goTo(index + dir);
    }

    function restartAutoplay() {
      if (!autoplay || cards.length < 2) return;
      if (autoplayTimer) window.clearInterval(autoplayTimer);
      autoplayTimer = window.setInterval(function () { step(1); }, autoplayMs);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        window.clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    cards.forEach(function (card, i) {
      card.addEventListener('click', function () {
        if (i === index) {
          var url = card.getAttribute('data-url');
          if (url) window.location.href = url;
        } else {
          goTo(i);
        }
      });
    });

    if (prevBtn) prevBtn.addEventListener('click', function () { step(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { step(1); });

    root.addEventListener('mouseenter', stopAutoplay);
    root.addEventListener('mouseleave', restartAutoplay);
    root.addEventListener('focusin', stopAutoplay);
    root.addEventListener('focusout', restartAutoplay);

    if (viewport) {
      viewport.addEventListener('touchstart', function (e) {
        if (!e.touches || !e.touches.length) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        stopAutoplay();
      }, { passive: true });

      viewport.addEventListener('touchend', function (e) {
        if (!e.changedTouches || !e.changedTouches.length) return;
        var dx = e.changedTouches[0].clientX - touchStartX;
        var dy = e.changedTouches[0].clientY - touchStartY;
        var cfg = layoutConfig();
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > cfg.swipeThreshold) {
          step(dx > 0 ? -1 : 1);
        }
        restartAutoplay();
      }, { passive: true });
    }

    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    });

    var resizeTimer;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(layout, 120);
    });

    layout();
    restartAutoplay();
  }

  function boot(scope) {
    var context = scope && scope.querySelectorAll ? scope : document;
    context.querySelectorAll('[data-corp-coverflow]').forEach(initCoverflow);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { boot(); });
  } else {
    boot();
  }

  document.addEventListener('shopify:section:load', function (event) {
    boot(event.target);
  });

  window.initCorpCoverflow = boot;
})();
