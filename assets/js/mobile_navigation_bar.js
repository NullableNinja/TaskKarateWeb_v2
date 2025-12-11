// Mobile Navigation Menu Toggle
function initMobileNav() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (!hamburger || !navLinks) {
    console.log('Mobile nav elements not found yet');
    return;
  }

  // Remove existing listeners if any
  const newHamburger = hamburger.cloneNode(true);
  hamburger.parentNode.replaceChild(newHamburger, hamburger);

  newHamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    newHamburger.classList.toggle('active');
    if (navLinks) navLinks.classList.toggle('nav-links-open');
  });

  // Close on outside click
  document.addEventListener('click', function (e) {
    const navbar = document.querySelector('.navbar');
    if (!navbar || !navLinks) return;

    if (!navbar.contains(e.target) && navLinks.classList.contains('nav-links-open')) {
      const ham = document.querySelector('.hamburger');
      if (ham) ham.classList.remove('active');
      navLinks.classList.remove('nav-links-open');
    }
  });

  // Close menu when clicking a nav link
  if (navLinks) {
    navLinks.addEventListener('click', function(e) {
      if (e.target.classList.contains('nav-link')) {
        const ham = document.querySelector('.hamburger');
        if (ham) ham.classList.remove('active');
        navLinks.classList.remove('nav-links-open');
      }
    });
  }

  console.log('Mobile navigation initialized');
}

// Initialize immediately if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Try after a short delay to let partials load
    setTimeout(initMobileNav, 100);
  });
} else {
  setTimeout(initMobileNav, 100);
}

// Also expose globally so partials.js can call it
window.initMobileNav = initMobileNav;
