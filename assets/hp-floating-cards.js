/*
  Homepage scroll polish — SAFE mode (no sticky stack, no section opacity).
  Previous sticky/crossfade stack forced short sections to 100vh solid colors
  and faded content to 0, which read as blank white/black screens between sections.

  This file now only:
  - Reveals captions with opacity + translateY when a section enters view
  - Does NOT reparent sections, force heights, or change section opacity/visibility
*/
(function () {
  'use strict';

  if (!document.body.classList.contains('template-index')) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.Shopify && Shopify.designMode) return;

  var main = document.getElementById('MainContent');
  if (!main) return;

  var CAPTION_SEL = [
    'h1',
    'h2',
    '.hero-fullscreen__heading',
    '.hero-fullscreen__subheading',
    '.hero-fullscreen__eyebrow',
    '.mat-headline',
    '.mat-subhead',
    '.bs-coverflow__heading',
    '.bs-coverflow__eyebrow',
    '.fb__title',
    '.fb__subtitle',
    '.fc-heading',
    '.fc-subtitle',
    '.hp-fam-sec__heading',
    '.story-banner__heading',
    '.story-banner__paragraph',
    '.story-banner__subheading',
    '.comm-intro h2',
    '.comm-desc',
    '.trending-social__heading',
    '.hp-dna__heading',
    '.split-cta__heading',
    '.split-cta__text',
    '[class*="ai-story-banner-heading-"]',
    '[class*="ai-story-banner-subheading-"]',
    '[class*="ai-story-banner-paragraph-"]'
  ].join(',');

  document.body.classList.add('hp-scroll-polish');
  /* Do NOT enable hp-crossfade-active / sticky stack */

  var sections = Array.prototype.filter.call(main.children, function (el) {
    return el && el.classList && el.classList.contains('shopify-section');
  });

  sections.forEach(function (sec, index) {
    var captions = sec.querySelectorAll(CAPTION_SEL);
    if (!captions.length) return;

    for (var i = 0; i < captions.length; i++) {
      captions[i].classList.add('hp-xfade-caption');
      if (index === 0) {
        captions[i].classList.add('is-in');
      } else {
        captions[i].classList.add('hp-xfade-pending');
      }
    }

    if (index === 0) return;

    if (!('IntersectionObserver' in window)) {
      for (var j = 0; j < captions.length; j++) {
        captions[j].classList.add('is-in');
        captions[j].classList.remove('hp-xfade-pending');
      }
      return;
    }

    var revealed = false;
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || revealed) return;
          revealed = true;
          var nodes = sec.querySelectorAll('.hp-xfade-caption');
          for (var k = 0; k < nodes.length; k++) {
            nodes[k].classList.add('is-in');
            nodes[k].classList.remove('hp-xfade-pending');
          }
          obs.disconnect();
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
    );
    obs.observe(sec);
  });
})();
