(() => {
  function getProgressIndex() {
    const progress = document.getElementById('progress');
    if (!progress) return 0;
    const match = String(progress.textContent || '').match(/(\d+)\s*\//);
    if (!match) return 0;
    return Math.max(0, parseInt(match[1], 10) - 1);
  }

  function updateBackButtonState(button) {
    const currentIndex = getProgressIndex();
    button.disabled = currentIndex <= 0;
    button.setAttribute('aria-disabled', currentIndex <= 0 ? 'true' : 'false');
    button.title = current