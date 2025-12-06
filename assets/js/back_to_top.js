// Back To Top Button
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show/hide back to top button based on scroll
function updateBackToTopVisibility() {
  const backToTop = document.querySelector('.back-to-top');
  if (!backToTop) return;

  if (window.pageYOffset > 300) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
}

window.addEventListener('scroll', updateBackToTopVisibility);
window.addEventListener('load', updateBackToTopVisibility);
