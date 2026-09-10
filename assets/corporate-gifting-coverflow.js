(function () {
  'use strict';

  var instances = [];

  function isRenderable(root) {
    if (!root) return false;
    var node = root;
    while (node && node !== document.documentElement) {
      if (node.hidden) return false;
      var style = window.getComputedStyle(node);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      node = node.parentElement;
    }
    return true;
  }

  function initCoverflow(root, force) {
    if (!root) return;

    if (root.dataset.corpCfReady === 'true') {
      var existing = instances.find(function (item) { return item.root === root; });
      if (existing && existing.layout) existing.layout();
      return;
    }

    var viewport = root.querySelector('[data-corp-cf-viewport]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-corp-cf-card]'));
    var prevBtn = root.querySelector('[data-corp-cf-prev]');
    var nextBtn = root.querySelector('[data-corp-cf-next]');
    if (!cards.length) return;

    var startIndex = parseInt(root.dataset.startIndex || '', 10);
    if (isNaN(startIndex)) startIndex = Math.floor(cards.length / 2);

    var index = Math.max(0, Math.min(startIndex, cards.length - 1));
    var autoplayTimer = null;
    var touchStartX = 0;
    var touchStartY = 0;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var autoplay = root.dataset.autoplay === 'true' && !reducedMotion;
    var autoplayMs = parseInt(root.dataset.autoplaySpeed || '5000', 10);

    function isMobile() {
      return window.innerWidth <= 767;
    }

    function cardWidth() {
      var first = cards[0];
      if (!first) return 204;
      return first.getBoundingClientRect().width || parseFloat(getComputedStyle(root).getPropertyValue('--corp-cf-card-w')) || 204;
    }

    function spacing() {
      if (isMobile()) return 0;
      var custom = parseFloat(root.dataset.spacing || '');
      if (!isNaN(custom) && custom > 0) return custom;
      return Math.round(cardWidth() * 0.63);
    }

    function scaleForOffset(abs) {
      if (abs === 0) return 1;
      if (abs === 1) return 0.86;
      if (abs === 2) return 0.72;
      return 0.62;
    }

    function opacityForOffset(abs) {
      if (abs === 0) return 1;
      if (abs === 1) return 0.92;
      if (abs === 2) return 0.78;
      return 0;
    }

    function layoutConfig() {
      if (!isMobile()) {
        return {
          rotateStep: 54,
          zDepth: 180,
          maxVisible: 2,
          swipeThreshold: 40
        };
      }
      return {
        rotateStep: 0,
        zDepth: 0,
        maxVisible: 0,
        swipeThreshold: 28
      };
    }

    function wrapOffset(offset, total) {
      if (offset > total / 2) return offset - total;
      if (offset < -total / 2) return offset + total;
      return offset;
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
            card.style.transform = 'translate3d(-50%, -50%, 0) scale(0.96)';
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

        if (abs > cfg.maxVisible) {
          card.style.transform = 'translate3d(-50%, -50%, 0) scale(0.6)';
          card.style.opacity = '0';
          card.style.visibility = 'hidden';
          card.style.pointerEvents = 'none';
          card.classList.remove('is-active');
          card.setAttribute('aria-hidden', 'true');
          card.tabIndex = -1;
          return;
        }

        var rotateY = offset * -cfg.rotateStep;
        var translateX = offset * space;
        var translateZ = -abs * cfg.zDepth;
        var scale = scaleForOffset(abs);
        var opacity = opacityForOffset(abs);

        card.style.transform = 'translate3d(calc(-50% + ' + translateX + 'px), -50%, ' + translateZ + 'px) rotateY(' + rotateY + 'deg) scale(' + scale + ')';
        card.style.opacity = String(opacity);
        card.style.visibility = 'visible';
        card.style.zIndex = String(120 - abs);
        card.style.pointerEvents = 'auto';
        card.classList.toggle('is-active', isActive);
        card.setAttribute('aria-hidden', abs > 1 ? 'true' : 'false');
        card.tabIndex = isActive ? 0 : -1;
      });
    }

    function goTo(nextIndex) {
      var next = (nextIndex + cards.length) % cards.length;
      if (next === index) return;
      index = next;
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

    if (prevBtn) prevBtn.addEventListener('click', function (e) { e.preventDefault(); step(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function (e) { e.preventDefault(); step(1); });

    root.addEventListener('mouseenter', stopAutoplay);
    root.addEventListener('mouseleave', restartAutoplay);

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
      resizeTimer = window.setTimeout(layout, 100);
    });

    instances.push({ root: root, layout: layout, restart: restartAutoplay });
    root.dataset.corpCfReady = 'true';

    function bootWhenVisible(attempts) {
      if (isRenderable(root) || force) {
        layout();
        restartAutoplay();
        window.requestAnimationFrame(layout);
        window.setTimeout(layout, 100);
        window.setTimeout(layout, 300);
        return;
      }
      if (attempts > 60) {
        layout();
        return;
      }
      window.setTimeout(function () { bootWhenVisible(attempts + 1); }, 50);
    }

    bootWhenVisible(0);
  }

  function boot(scope, force) {
    var context = scope && scope.querySelectorAll ? scope : document;
    context.querySelectorAll('[data-corp-coverflow]').forEach(function (root) {
      initCoverflow(root, force);
    });
  }

  window.initCorpCoverflow = boot;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { boot(); });
  } else {
    boot();
  }

  window.addEventListener('load', function () {
    boot(document, true);
  });

  document.addEventListener('shopify:section:load', function (event) {
    boot(event.target, true);
  });
})();
