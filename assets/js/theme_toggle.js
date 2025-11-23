// Theme Toggle Logic
function toggleTheme() {
  const html = document.documentElement;
  const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeToggleState();
}

function updateThemeToggleState() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const toggle = document.querySelector('.theme-toggle input[type="checkbox"]');
  if (toggle) toggle.checked = isDark;

  document.body.classList.toggle('theme-dark', isDark);
  document.body.classList.toggle('theme-light', !isDark);
}

// Initialize from storage
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeToggleState();
