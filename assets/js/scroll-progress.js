// Belt-Color Scroll Indicator
function updateScrollProgress() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const pct = Math.min(scrollTop / scrollHeight, 1);

  const bar = document.getElementById('scrollProgress');
  if (!bar) return;

  bar.style.width = (pct * 100) + '%';

  let belt;
  if (pct < 0.125) belt = '#fef9c3';
  else if (pct < 0.25) belt = '#facc15';
  else if (pct < 0.375) belt = '#fb923c';
  else if (pct < 0.5) belt = '#22c55e';
  else if (pct < 0.625) belt = '#a855f7';
  else if (pct < 0.75) belt = '#3b82f6';
  else if (pct < 0.875) belt = '#ef4444';
  else if (pct < 0.95) belt = '#92400e';
  else belt = '#111827';

  bar.style.background = belt;
}

window.addEventListener('scroll', updateScrollProgress);
window.addEventListener('resize', updateScrollProgress);
document.addEventListener('DOMContentLoaded', updateScrollProgress);
