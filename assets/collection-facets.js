class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.debounceTimer = null;
    this.onDelegatedInput = this.onDelegatedInput.bind(this);
    this.onDelegatedSubmit = this.onDelegatedSubmit.bind(this);
  }

  connectedCallback() {
    this.sectionId = this.dataset.sectionId;
    document.addEventListener('input', this.onDelegatedInput);
    document.addEventListener('submit', this.onDelegatedSubmit);
  }

  disconnectedCallback() {
    document.removeEventListener('input', this.onDelegatedInput);
    document.removeEventListener('submit', this.onDelegatedSubmit);
  }

  getForm() {
    return document.getElementById(`FacetFiltersForm-${this.sectionId}`);
  }

  onDelegatedSubmit(event) {
    const form = event.target.closest(`#FacetFiltersForm-${this.sectionId}`);
    if (!form) return;
    event.preventDefault();
    this.renderPage();
  }

  onDelegatedInput(event) {
    const form = event.target.closest(`#FacetFiltersForm-${this.sectionId}`);
    if (!form) return;

    clearTimeout(this.debounceTimer);
    const delay = event.target.type === 'number' ? 600 : 300;
    this.debounceTimer = setTimeout(() => this.renderPage(), delay);
  }

  createSearchParams() {
    const form = this.getForm();
    if (!form) return '';
    const formData = new FormData(form);
    return new URLSearchParams(formData).toString();
  }

  renderPage() {
    const params = this.createSearchParams();
    const sortSelect = document.querySelector(`[data-col-sort-select][data-section-id="${this.sectionId}"]`);
    const sortValue = sortSelect ? sortSelect.value : '';
    const combined = [params, sortValue ? `sort_by=${sortValue}` : ''].filter(Boolean).join('&');

    const url = `${window.location.pathname}?section_id=${this.sectionId}${combined ? `&${combined}` : ''}`;

    this.setLoading(true);

    fetch(url)
      .then((response) => response.text())
      .then((html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const newGrid = doc.getElementById(`CollectionGrid-${this.sectionId}`);
        const currentGrid = document.getElementById(`CollectionGrid-${this.sectionId}`);

        if (newGrid && currentGrid) {
          currentGrid.innerHTML = newGrid.innerHTML;
        }

        const newFilters = doc.getElementById(`ColFilters-${this.sectionId}`);
        const currentFilters = document.getElementById(`ColFilters-${this.sectionId}`);
        if (newFilters && currentFilters) {
          currentFilters.innerHTML = newFilters.innerHTML;
        }

        const newToolbar = doc.querySelector(`[data-col-toolbar="${this.sectionId}"]`);
        const currentToolbar = document.querySelector(`[data-col-toolbar="${this.sectionId}"]`);
        if (newToolbar && currentToolbar) {
          currentToolbar.innerHTML = newToolbar.innerHTML;
        }

        const browserUrl = `${window.location.pathname}${combined ? `?${combined}` : ''}`;
        window.history.replaceState({}, '', browserUrl);
      })
      .catch(() => {})
      .finally(() => this.setLoading(false));
  }

  setLoading(isLoading) {
    const grid = document.getElementById(`CollectionGrid-${this.sectionId}`);
    if (grid) {
      grid.classList.toggle('is-loading', isLoading);
    }
  }
}

if (!customElements.get('facet-filters-form')) {
  customElements.define('facet-filters-form', FacetFiltersForm);
}

function initCollectionFilters() {
  if (window.__colFiltersInit) return;
  window.__colFiltersInit = true;

  document.addEventListener('click', (event) => {
    const openBtn = event.target.closest('[data-col-filters-open]');
    const closeBtn = event.target.closest('[data-col-filters-close]');
    const overlay = event.target.closest('[data-col-filters-overlay]');

    if (openBtn) {
      document.body.classList.add('col-filters-open');
      const overlayEl = document.querySelector('[data-col-filters-overlay]');
      if (overlayEl) overlayEl.hidden = false;
      return;
    }

    if (closeBtn || overlay) {
      document.body.classList.remove('col-filters-open');
      const overlayEl = document.querySelector('[data-col-filters-overlay]');
      if (overlayEl) overlayEl.hidden = true;
    }
  });

  document.addEventListener('change', (event) => {
    const sortSelect = event.target.closest('[data-col-sort-select]');
    if (!sortSelect) return;

    const sectionId = sortSelect.dataset.sectionId;
    const facetForm = document.querySelector(`facet-filters-form[data-section-id="${sectionId}"]`);
    if (facetForm) {
      facetForm.renderPage();
    } else {
      const value = sortSelect.value;
      const url = new URL(window.location.href);
      if (value) {
        url.searchParams.set('sort_by', value);
      } else {
        url.searchParams.delete('sort_by');
      }
      window.location.href = url.toString();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCollectionFilters);
} else {
  initCollectionFilters();
}
