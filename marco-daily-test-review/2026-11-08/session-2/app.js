(function () {
  'use strict';
  function selectView() {
    const params = new URLSearchParams(location.search);
    const view = /^#(?:practice|q-)/.test(location.hash) ? 'practice' : location.hash === '#analysis' || params.get('view') === 'analysis' ? 'analysis' : 'practice';
    for (const name of ['practice', 'analysis']) document.getElementById(name).hidden = name !== view;
    for (const link of document.querySelectorAll('[data-view]')) {
      if (link.dataset.view === view) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    const target = document.getElementById(location.hash.slice(1));
    if (target) requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-view]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const url = new URL(link.href);
    if (new URLSearchParams(location.search).has('demo')) url.searchParams.set('demo', '1');
    history.pushState(null, '', url);
    selectView();
  });
  window.addEventListener('hashchange', selectView);
  window.addEventListener('popstate', selectView);
  selectView();
})();
