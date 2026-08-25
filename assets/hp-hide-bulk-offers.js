/*
  Hide volume / bulk-discount app widgets on product pages.
  These banners are injected by a Shopify app (not theme Liquid),
  so we remove any section that matches the known offer copy.
*/
(function () {
  'use strict';
  if (!document.body || !/\btemplate-product\b/.test(document.body.className)) return;

  var PATTERNS = [
    /Buy in bulk and get a discount/i,
    /Special Offer:\s*Buy\s+\d+\s+and Save/i
  ];

  function matches(text) {
    if (!text) return false;
    var t = String(text).replace(/\s+/g, ' ').trim();
    for (var i = 0; i < PATTERNS.length; i++) {
      if (PATTERNS[i].test(t)) return true;
    }
    return false;
  }

  function hideNode(el) {
    if (!el || el.__hpBulkHidden) return;
    el.__hpBulkHidden = true;
    el.style.setProperty('display', 'none', 'important');
    el.setAttribute('hidden', '');
    el.setAttribute('aria-hidden', 'true');
  }

  function sweep() {
    // Many apps don't use shopify-app-block classes, so we search all divs.
    var els = document.querySelectorAll('div');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var text = el.textContent || '';
      // Only hide small compact widget wrappers to avoid hiding the main product page
      if (text.length > 300) continue;
      
      if (matches(text)) {
        hideNode(el);
      }
    }
  }

  function initObserver() {
    var observer = new MutationObserver(function(mutations) {
      var shouldSweep = false;
      for (var i = 0; i < mutations.length; i++) {
        if (mutations[i].addedNodes.length > 0) {
          shouldSweep = true;
          break;
        }
      }
      if (shouldSweep) sweep();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      sweep();
      initObserver();
    });
  } else {
    sweep();
    initObserver();
  }
  
  /* Fallback timeouts for apps that inject extremely late */
  setTimeout(sweep, 600);
  setTimeout(sweep, 1800);
  setTimeout(sweep, 3500);
})();
