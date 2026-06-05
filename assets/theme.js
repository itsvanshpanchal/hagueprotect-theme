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
});
