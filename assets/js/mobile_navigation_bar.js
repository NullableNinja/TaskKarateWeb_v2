// Mobile Navigation Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    if (navLinks) navLinks.classList.toggle('active');
  });
}

// Close on outside click
document.addEventListener('click', function (e) {
  const navbar = document.querySelector('.navbar');
  if (!navbar || !navLinks) return;

  if (!navbar.contains(e.target) && navLinks.classList.contains('active')) {
    hamburger && hamburger.classList.remove('active');
    navLinks.classList.remove('active');
  }
});
