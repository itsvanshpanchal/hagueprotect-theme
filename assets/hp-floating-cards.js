/*
  Smooth floating card stack for homepage.
  Reparents Materials → DNA into one sticky sibling group so each
  section pins and the next card covers it — native scroll, no gaps.
*/
(function () {
  'use strict';

  if (!document.body.classList.contains('template-index')) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  /* Keep Theme Editor layout stable; effect runs on the live storefront */
  if (window.Shopify && Shopify.designMode) return;

  var main = document.getElementById('MainContent');
  if (!main) return;

  function isShopifySection(el) {
    return el && el.classList && el.classList.contains('shopify-section');
  }

  function isStackStart(sec) {
    if (/materials-showcase/i.test(sec.id || '')) return true;
    if (sec.querySelector('[class*="materials-showcase"], [class*="mat-showcase"], .materials-stage')) return true;
    return false;
  }

  function isTooThin(sec) {
    return sec.offsetHeight > 0 && sec.offsetHeight < 48;
  }

  function assertStickyCard(sec, index) {
    sec.classList.add('hp-float-card');
    sec.style.setProperty('--hp-z', String(index + 1));
    sec.style.setProperty('position', 'sticky', 'important');
    sec.style.setProperty('top', '0px', 'important');
    sec.style.setProperty('z-index', String(index + 1), 'important');
    sec.style.setProperty('margin-top', '0px', 'important');
    sec.style.setProperty('transform', 'none', 'important');
  }

  var sections = Array.prototype.filter.call(main.children, isShopifySection);
  var startIdx = -1;
  for (var i = 0; i < sections.length; i++) {
    if (isStackStart(sections[i])) {
      startIdx = i;
      break;
    }
  }
  if (startIdx < 0) return;

  var targets = sections.slice(startIdx).filter(function (sec) {
    return !isTooThin(sec);
  });
  if (targets.length < 2) return;

  var stack = document.createElement('div');
  stack.className = 'hp-card-stack';
  stack.setAttribute('data-hp-card-stack', '');
  main.insertBefore(stack, targets[0]);

  targets.forEach(function (sec, index) {
    stack.appendChild(sec);
    assertStickyCard(sec, index);
  });

  document.body.classList.add('hp-floating-cards-active');
  window.dispatchEvent(new CustomEvent('hp-floating-cards:ready'));

  /* Re-assert sticky after story curtain scripts settle */
  window.requestAnimationFrame(function () {
    targets.forEach(function (sec, index) {
      assertStickyCard(sec, index);
    });
    window.dispatchEvent(new CustomEvent('hp-floating-cards:ready'));
  });
})();
