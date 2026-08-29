(function() {
  'use strict';

  function initVideoLazyLoad() {
    var lazyVideos = [].slice.call(document.querySelectorAll("video.lazy-video"));

    // Remove lazy loading optimization and load all videos immediately
    lazyVideos.forEach(function(video) {
      for (var source in video.children) {
        var videoSource = video.children[source];
        if (typeof videoSource.tagName === "string" && videoSource.tagName === "SOURCE") {
          if (videoSource.dataset.src) {
            videoSource.src = videoSource.dataset.src;
          }
        }
      }
      video.load();
      video.classList.remove("lazy-video");
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVideoLazyLoad);
  } else {
    initVideoLazyLoad();
  }

  // Handle Shopify section updates in theme editor
  document.addEventListener('shopify:section:load', function() {
    initVideoLazyLoad();
  });
})();
