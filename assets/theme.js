// Theme Scripts for HAGUEPROTECT - Premium Shopify Design

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Header Toggle Menu
  const toggleBtn = document.querySelector('.header__mobile-toggle');
  const menuNav = document.querySelector('.header__navigation');

  if (toggleBtn && menuNav) {
    toggleBtn.addEventListener('click', () => {
      requestAnimationFrame(() => {
        const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
        toggleBtn.setAttribute('aria-expanded', !isExpanded);
        menuNav.classList.toggle('is-open');
      });
    });
  }

  // Smooth appearance transitions
  const fadeElements = document.querySelectorAll('.animate-fade-in');
  
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => initFadeObserver(fadeElements));
  } else {
    setTimeout(() => initFadeObserver(fadeElements), 50);
  }

  function initFadeObserver(elements) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => {
            entry.target.classList.add('fade-in-visible');
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    elements.forEach(elem => {
      observer.observe(elem);
    });
  }
});
