// Programs Section Tabs
(function () {
  const root = document.getElementById('programs');
  if (!root) return;

  const tabs = root.querySelectorAll('.tab');
  const panels = root.querySelectorAll('.tab-panel');

  function show(id) {
    tabs.forEach(t => {
      const active = t.getAttribute('aria-controls') === id;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', active);
    });
    panels.forEach(p => p.classList.toggle('hidden', p.id !== id));
  }

  tabs.forEach(t => t.addEventListener('click', () => show(t.getAttribute('aria-controls'))));
  show('tab-kids');
}());
