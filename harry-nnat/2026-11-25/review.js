(() => {
  const key = 'harry-nnat-zozeck-review-2026-11-25';
  const checks = [...document.querySelectorAll('.mock-cues input')];
  const status = document.querySelector('#mock-progress');
  function showProgress() {
    const count = checks.filter(check => check.checked).length;
    status.textContent = `${count} of ${checks.length} reviewed on this device`;
  }
  try {
    const saved = new Set(JSON.parse(localStorage.getItem(key) || '[]'));
    checks.forEach(check => { check.checked = saved.has(check.id); });
  } catch {}
  showProgress();
  checks.forEach(check => {
    check.addEventListener('change', () => {
      showProgress();
      try {
        const reviewed = checks.filter(item => item.checked).map(item => item.id);
        localStorage.setItem(key, JSON.stringify(reviewed));
      } catch {
        status.textContent += ' · could not save for next time';
      }
    });
  });
})();
