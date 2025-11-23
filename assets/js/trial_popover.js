// Trial Popover Close Button
(function () {
  const pop = document.getElementById('trialPop');
  if (!pop) return;
  const closeBtn = pop.querySelector('[data-close]');
  if (closeBtn) closeBtn.addEventListener('click', () => pop.setAttribute('hidden', ''));
}());
