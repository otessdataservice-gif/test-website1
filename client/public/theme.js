/**
 * Applies the saved theme before first paint, so a dark mode user never sees a
 * white flash. Kept as a file rather than an inline script because the API
 * serves this page with helmet's default CSP, which blocks inline scripts.
 */
(function applySavedTheme() {
  try {
    var saved = localStorage.getItem('taskflow-theme');
    var prefersDark =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {
    /* storage blocked, fall back to light */
  }
})();
