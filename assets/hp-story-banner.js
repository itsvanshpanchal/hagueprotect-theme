/* Story banner: one-shot mobile sync — avoid rewrite thrash while scrolling. */
(function () {
  function applyAccent(heading, size) {
    if (!heading || heading.dataset.hpAccentApplied === String(size)) return;
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
    heading.dataset.hpAccentApplied = String(size);
  }

  function lockedMobileVh() {
    var locked = getComputedStyle(document.documentElement).getPropertyValue('--hp-mobile-vh').trim();
    var vh = locked ? parseInt(locked, 10) : 0;
    if (!vh || vh < 320) {
      vh = Math.round(window.innerHeight || document.documentElement.clientHeight || 800);
    }
    return vh;
  }

  function isLiteStory(wrap) {
    return !!wrap.closest('.ai-story-sticky-track--flow, .hp-float-bottom-strip, .hp-story-banner-lite');
  }

  function syncWrap(wrap, force) {
    if (!wrap) return;
    if (!force && wrap.dataset.hpStorySynced === '1' && window.matchMedia('(max-width: 749px)').matches) {
      return;
    }

    if (isLiteStory(wrap)) {
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
      wrap.dataset.hpStorySynced = '1';
      return;
    }

    var mobile = window.matchMedia('(max-width: 989px)').matches;
    var url = mobile ? wrap.getAttribute('data-mobile-bg') : wrap.getAttribute('data-desktop-bg');
    if (!url) {
      url = wrap.getAttribute('data-desktop-bg') || wrap.getAttribute('data-mobile-bg');
    }

    var storyDesktop = window.matchMedia('(min-width: 750px)').matches;
    var storyFocal = storyDesktop ? '62% center' : 'center center';

    if (url && wrap.dataset.hpStoryBg !== url) {
      wrap.style.backgroundImage = 'url("' + String(url).replace(/"/g, '') + '")';
      wrap.style.backgroundSize = 'cover';
      wrap.style.backgroundPosition = storyFocal;
      wrap.style.backgroundRepeat = 'no-repeat';
      wrap.dataset.hpStoryBg = url;
    } else if (!mobile) {
      wrap.style.backgroundPosition = storyFocal;
    }

    if (mobile) {
      var vh = lockedMobileVh();
      wrap.style.setProperty('min-height', vh + 'px', 'important');
      wrap.style.setProperty('height', vh + 'px', 'important');
      wrap.style.setProperty('max-height', vh + 'px', 'important');
      wrap.style.width = '100%';
      wrap.dataset.hpStoryHeightLocked = '1';
    } else {
      wrap.style.removeProperty('min-height');
      wrap.style.removeProperty('height');
      wrap.style.removeProperty('max-height');
      delete wrap.dataset.hpStoryHeightLocked;
    }

    var cover = wrap.querySelector('[data-hp-story-cover], .ai-story-banner-cover');
    if (cover && cover.dataset.hpCoverReady !== '1') {
      cover.style.display = 'block';
      cover.style.visibility = 'visible';
      cover.style.opacity = '1';
      cover.style.position = 'absolute';
      cover.style.inset = '0';
      cover.style.width = '100%';
      cover.style.height = '100%';
      cover.style.objectFit = 'cover';
      cover.style.objectPosition = storyFocal;
      if (storyDesktop) {
        cover.style.transform = 'scale(1.12)';
        cover.style.transformOrigin = storyFocal;
      } else {
        cover.style.transform = '';
        cover.style.transformOrigin = '';
      }
      cover.dataset.hpCoverReady = '1';
    } else if (cover && storyDesktop) {
      cover.style.objectPosition = storyFocal;
      cover.style.transform = 'scale(1.12)';
      cover.style.transformOrigin = storyFocal;
    }

    var content = wrap.querySelector('[data-hp-story-content]');
    if (content && content.dataset.hpContentReady !== '1') {
      if (mobile) {
        var gutter = 28;
        try {
          var g = getComputedStyle(document.body).getPropertyValue('--homepage-section-gutter').trim();
          if (g) gutter = parseFloat(g) || 28;
        } catch (e) {}
        var topM = parseFloat(content.getAttribute('data-top-m') || '28');
        var leftM = parseFloat(content.getAttribute('data-left-m') || '28');
        content.style.setProperty('left', Math.max(gutter, leftM) + 'px', 'important');
        content.style.setProperty('top', Math.min(Math.max(gutter, topM), 32) + 'px', 'important');
        content.style.setProperty('max-width', 'min(90%, ' + (content.getAttribute('data-max-m') || '280') + 'px)', 'important');
        content.style.setProperty('padding', '0', 'important');
      } else {
        var gutter = 48;
        try {
          var g = getComputedStyle(document.body).getPropertyValue('--homepage-section-gutter').trim();
          if (g) gutter = parseFloat(g) || 48;
        } catch (e) {}
        content.style.setProperty('left', '0', 'important');
        content.style.setProperty('right', '0', 'important');
        content.style.setProperty('padding-left', gutter + 'px', 'important');
        content.style.setProperty('padding-right', gutter + 'px', 'important');
        content.style.setProperty('padding-top', '0', 'important');
        content.style.setProperty('padding-bottom', '0', 'important');
        content.style.left = '';
        content.style.top = (content.getAttribute('data-top-d') || '56') + 'px';
        content.style.maxWidth = (content.getAttribute('data-max-d') || '650') + 'px';
        content.style.padding = '';
      }
      content.style.visibility = 'visible';
      content.style.opacity = '1';
      content.dataset.hpContentReady = '1';
    }

    var hideWraps = wrap.querySelectorAll('.ai-story-banner-button-wrapper--hide-mobile');
    for (var hi = 0; hi < hideWraps.length; hi++) {
      hideWraps[hi].style.setProperty('display', 'none', 'important');
      hideWraps[hi].setAttribute('hidden', '');
      hideWraps[hi].setAttribute('aria-hidden', 'true');
    }

    var heading = wrap.querySelector('.ai-story-banner-heading');
    if (heading) {
      var size = mobile
        ? heading.getAttribute('data-accent-size-m') || '40'
        : heading.getAttribute('data-accent-size') || '62';
      applyAccent(heading, size);
    }

    wrap.dataset.hpStorySynced = '1';
  }

  function syncAll(force) {
    var wraps = document.querySelectorAll('[data-hp-story-wrap]');
    for (var i = 0; i < wraps.length; i++) syncWrap(wraps[i], !!force);
  }

  function resetSyncFlags() {
    var wraps = document.querySelectorAll('[data-hp-story-wrap]');
    for (var i = 0; i < wraps.length; i++) {
      delete wraps[i].dataset.hpStorySynced;
      delete wraps[i].dataset.hpStoryHeightLocked;
      delete wraps[i].dataset.hpStoryBg;
      var cover = wraps[i].querySelector('[data-hp-story-cover], .ai-story-banner-cover');
      if (cover) delete cover.dataset.hpCoverReady;
      var content = wraps[i].querySelector('[data-hp-story-content]');
      if (content) delete content.dataset.hpContentReady;
      var heading = wraps[i].querySelector('.ai-story-banner-heading');
      if (heading) delete heading.dataset.hpAccentApplied;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { syncAll(true); });
  } else {
    syncAll(true);
  }

  /* Ignore mobile address-bar resize noise — only re-sync on real width changes */
  var lastW = window.innerWidth || 0;
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var w = window.innerWidth || 0;
      if (Math.abs(w - lastW) < 40 && window.matchMedia('(max-width: 749px)').matches) {
        return;
      }
      lastW = w;
      resetSyncFlags();
      syncAll(true);
    }, 200);
  }, { passive: true });

  window.addEventListener('orientationchange', function () {
    resetSyncFlags();
    setTimeout(function () { syncAll(true); }, 280);
  }, { passive: true });

  window.addEventListener('hp-floating-cards:ready', function () {
    /* Soft re-sync once after float stack mounts — then stay put */
    resetSyncFlags();
    syncAll(true);
  });
  document.addEventListener('shopify:section:load', function () {
    resetSyncFlags();
    syncAll(true);
  });
})();
