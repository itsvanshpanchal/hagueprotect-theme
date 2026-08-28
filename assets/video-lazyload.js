(function() {
  'use strict';

  function initVideoLazyLoad() {
    var lazyVideos = [].slice.call(document.querySelectorAll("video.lazy-video"));

    if ("IntersectionObserver" in window) {
      var lazyVideoObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(function(video) {
          if (video.isIntersecting) {
            for (var source in video.target.children) {
              var videoSource = video.target.children[source];
              if (typeof videoSource.tagName === "string" && videoSource.tagName === "SOURCE") {
                if (videoSource.dataset.src) {
                  videoSource.src = videoSource.dataset.src;
                }
              }
            }

            video.target.load();
            video.target.classList.remove("lazy-video");
            lazyVideoObserver.unobserve(video.target);
          }
        });
      }, {
        rootMargin: '1000px 0px', // start loading 1000px before it comes into view
        threshold: 0
      });

      lazyVideos.forEach(function(lazyVideo) {
        lazyVideoObserver.observe(lazyVideo);
      });
    } else {
      // Fallback for older browsers
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
