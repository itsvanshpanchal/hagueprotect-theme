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
    var sections = document.querySelectorAll('.shopify-section, .shopify-block, [class*="shopify-app-block"]');
    for (var i = 0; i < sections.length; i++) {
      var sec = sections[i];
      /* Only hide compact offer blocks — avoid wiping the whole product page */
      var text = sec.textContent || '';
      if (text.length > 800) continue;
      if (matches(text)) hideNode(sec);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sweep);
  } else {
    sweep();
  }
  /* Apps often inject late */
  setTimeout(sweep, 600);
  setTimeout(sweep, 1800);
  setTimeout(sweep, 3500);
})();
