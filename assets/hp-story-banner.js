/* Story banner: desktop/mobile image swap + accent typography (no Liquid). */
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

  function syncWrap(wrap) {
    var mobile = window.matchMedia('(max-width: 749px)').matches;
    var url = mobile ? wrap.getAttribute('data-mobile-bg') : wrap.getAttribute('data-desktop-bg');
    if (url) {
      wrap.style.backgroundImage = 'url("' + String(url).replace(/"/g, '') + '")';
    }

    if (mobile) {
      wrap.style.minHeight = '100dvh';
      wrap.style.height = '100dvh';
    }

    var desk = wrap.querySelector('[data-hp-story-desk]');
    var mob = wrap.querySelector('[data-hp-story-mob]');
    if (desk) desk.style.display = mobile ? 'none' : 'block';
    if (mob) mob.style.display = mobile ? 'block' : 'none';

    var content = wrap.querySelector('[data-hp-story-content]');
    if (content) {
      if (mobile) {
        content.style.left = (content.getAttribute('data-left-m') || '16') + 'px';
        content.style.top = (content.getAttribute('data-top-m') || '24') + 'px';
        content.style.maxWidth = 'min(90%, ' + (content.getAttribute('data-max-m') || '280') + 'px)';
        content.style.padding = (content.getAttribute('data-pad-m') || '16') + 'px';
      } else {
        content.style.left = (content.getAttribute('data-left-d') || '20') + 'px';
        content.style.top = (content.getAttribute('data-top-d') || '56') + 'px';
        content.style.maxWidth = (content.getAttribute('data-max-d') || '650') + 'px';
        content.style.padding = '';
      }
    }

    var heading = wrap.querySelector('.ai-story-banner-heading');
    if (heading) {
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
  window.addEventListener('resize', syncAll, { passive: true });
  document.addEventListener('shopify:section:load', syncAll);
})();
