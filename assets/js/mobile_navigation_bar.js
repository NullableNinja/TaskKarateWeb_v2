// Mobile Navigation Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    if (navLinks) navLinks.classList.toggle('nav-links-open');
  });
}

// Close on outside click
document.addEventListener('click', function (e) {
  const navbar = document.querySelector('.navbar');
  if (!navbar || !navLinks) return;

  if (!navbar.contains(e.target) && navLinks.classList.contains('nav-links-open')) {
    hamburger && hamburger.classList.remove('active');
    navLinks.classList.remove('nav-links-open');
  }
});

// Close menu when clicking a nav link
if (navLinks) {
  navLinks.addEventListener('click', function(e) {
    if (e.target.classList.contains('nav-link')) {
      hamburger && hamburger.classList.remove('active');
      navLinks.classList.remove('nav-links-open');
    }
  });
}
