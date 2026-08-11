/* Story banner: desktop/mobile bg sync + accent typography (no Liquid). */
(function () {
  function applyAccent(heading, size) {
    if (!heading) return;
    var accents = heading.querySelectorAll('.hp-heading-accent');
    var stack = heading.getAttribute('data-accent-stack') || '';
    var color = heading.getAttribute('data-accent-color') || '#c9a227';
    var weight = heading.getAttribute('data-accent-weight') || '400';
    var style = heading.getAttribute('data-accent-style') || 'normal';
    for (var i = 0; i < accents.length; i++) {
      var isStack = !!accents[i].closest('.hp-heading-pair--stack');
      accents[i].style.setProperty('display', isStack ? 'block' : 'inline', 'important');
      accents[i].style.setProperty('font-family', stack, 'important');
      accents[i].style.setProperty('font-weight', weight, 'important');
      accents[i].style.setProperty('font-style', style, 'important');
      accents[i].style.setProperty('color', color, 'important');
      accents[i].style.setProperty('-webkit-text-fill-color', color, 'important');
      accents[i].style.setProperty('font-size', size + 'px', 'important');
    }
  }

  function isFloatStackStory(wrap) {
    return !!(
      document.body.classList.contains('hp-float-mobile') &&
      wrap.closest('.hp-float-stack .hp-float-story')
    );
  }

  function syncWrap(wrap) {
    if (wrap.closest('.ai-story-sticky-track--flow, .hp-float-bottom-strip, .hp-story-banner-lite')) {
      wrap.style.setProperty('background-image', 'none', 'important');
      wrap.style.setProperty('min-height', '0', 'important');
      wrap.style.setProperty('height', 'auto', 'important');
      wrap.style.setProperty('max-height', '85vh', 'important');
      wrap.style.setProperty('aspect-ratio', '9 / 16', 'important');
      var liteCover = wrap.querySelector('[data-hp-story-cover], .ai-story-banner-cover');
      if (liteCover) {
        liteCover.style.setProperty('position', 'relative', 'important');
        liteCover.style.setProperty('display', 'block', 'important');
        liteCover.style.setProperty('width', '100%', 'important');
        liteCover.style.setProperty('height', 'auto', 'important');
        liteCover.style.setProperty('max-height', '85vh', 'important');
        liteCover.style.setProperty('aspect-ratio', '9 / 16', 'important');
        liteCover.style.setProperty('object-fit', 'cover', 'important');
      }
      return;
    }

    var mobile = window.matchMedia('(max-width: 989px)').matches;
    var floatStory = mobile && isFloatStackStory(wrap);
    var url = mobile ? wrap.getAttribute('data-mobile-bg') : wrap.getAttribute('data-desktop-bg');
    if (!url) {
      url = wrap.getAttribute('data-desktop-bg') || wrap.getAttribute('data-mobile-bg');
    }
    if (!floatStory && url) {
      wrap.style.backgroundImage = 'url("' + String(url).replace(/"/g, '') + '")';
      wrap.style.backgroundSize = 'cover';
      wrap.style.backgroundPosition = 'center center';
      wrap.style.backgroundRepeat = 'no-repeat';
    } else if (floatStory) {
      wrap.style.setProperty('background-image', 'none', 'important');
    }

    if (mobile && !floatStory) {
      var bottomStrip = wrap.closest('.hp-float-bottom-strip');
      /* Prefer locked CSS var — window.innerHeight changes while scrolling (address bar) */
      var locked = getComputedStyle(document.documentElement).getPropertyValue('--hp-mobile-vh').trim();
      var vh = locked
        ? parseInt(locked, 10)
        : Math.round(window.innerHeight || document.documentElement.clientHeight || 800);
      if (!vh || vh < 320) {
        vh = Math.round(window.innerHeight || document.documentElement.clientHeight || 800);
      }
      if (bottomStrip) {
        wrap.style.minHeight = Math.round(vh * 0.72) + 'px';
        wrap.style.height = 'auto';
      } else if (!wrap.dataset.hpStoryHeightLocked) {
        wrap.style.minHeight = vh + 'px';
        wrap.style.height = vh + 'px';
        wrap.dataset.hpStoryHeightLocked = '1';
      }
      wrap.style.width = '100%';
    } else if (floatStory) {
      wrap.style.removeProperty('min-height');
      wrap.style.removeProperty('height');
    }

    var cover = wrap.querySelector('[data-hp-story-cover], .ai-story-banner-cover');
    if (cover) {
      cover.style.display = 'block';
      cover.style.visibility = 'visible';
      cover.style.opacity = '1';
      cover.style.position = 'absolute';
      cover.style.inset = '0';
      cover.style.width = '100%';
      cover.style.height = '100%';
      cover.style.objectFit = 'cover';
    }

    var content = wrap.querySelector('[data-hp-story-content]');
    if (content && !floatStory) {
      if (mobile) {
        var gutter = 28;
        try {
          var g = getComputedStyle(document.body).getPropertyValue('--homepage-section-gutter').trim();
          if (g) gutter = parseFloat(g) || 28;
        } catch (e) {}
        var topM = parseFloat(content.getAttribute('data-top-m') || '28');
        var leftM = parseFloat(content.getAttribute('data-left-m') || '28');
        /* Keep Tell Your Story text near the top — match other section gutters */
        content.style.setProperty('left', Math.max(gutter, leftM) + 'px', 'important');
        content.style.setProperty('top', Math.min(Math.max(gutter, topM), 32) + 'px', 'important');
        content.style.setProperty('max-width', 'min(90%, ' + (content.getAttribute('data-max-m') || '280') + 'px)', 'important');
        content.style.setProperty('padding', '0', 'important');
      } else {
        content.style.left = (content.getAttribute('data-left-d') || '20') + 'px';
        content.style.top = (content.getAttribute('data-top-d') || '56') + 'px';
        content.style.maxWidth = (content.getAttribute('data-max-d') || '650') + 'px';
        content.style.padding = '';
      }
      content.style.visibility = 'visible';
      content.style.opacity = '1';
    }

    var hideWraps = wrap.querySelectorAll('.ai-story-banner-button-wrapper--hide-mobile');
    for (var hi = 0; hi < hideWraps.length; hi++) {
      hideWraps[hi].style.setProperty('display', 'none', 'important');
      hideWraps[hi].setAttribute('hidden', '');
      hideWraps[hi].setAttribute('aria-hidden', 'true');
    }

    var heading = wrap.querySelector('.ai-story-banner-heading');
    if (heading && !floatStory) {
      var size = mobile
        ? heading.getAttribute('data-accent-size-m') || '40'
        : heading.getAttribute('data-accent-size') || '62';
      applyAccent(heading, size);
    }
  }

  function syncAll() {
    var wraps = document.querySelectorAll('[data-hp-story-wrap]');
    for (var i = 0; i < wraps.length; i++) syncWrap(wraps[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncAll);
  } else {
    syncAll();
  }
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(syncAll, 150);
  }, { passive: true });
  window.addEventListener('orientationchange', function () {
    var wraps = document.querySelectorAll('[data-hp-story-wrap]');
    for (var i = 0; i < wraps.length; i++) {
      delete wraps[i].dataset.hpStoryHeightLocked;
    }
    setTimeout(syncAll, 280);
  }, { passive: true });
  window.addEventListener('hp-floating-cards:ready', syncAll);
  document.addEventListener('shopify:section:load', syncAll);
})();
