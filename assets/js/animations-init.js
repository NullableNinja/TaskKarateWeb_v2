/**
 * animations-init.js — Initialize viewport scroll animations
 * Adds animated class to elements with data-animate when they enter viewport
 */

(function() {
  'use strict';

  // Options for IntersectionObserver
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -100px 0px', // Trigger 100px before element enters viewport
    threshold: 0.1
  };

  // Callback when elements intersect
  const handleIntersection = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target); // Only animate once
      }
    });
  };

  // Initialize observer
  const observer = new IntersectionObserver(handleIntersection, observerOptions);

  // Observe all elements with data-animate attribute
  const initAnimations = () => {
    const animatedElements = document.querySelectorAll('[data-animate]');
    animatedElements.forEach(el => observer.observe(el));
  };

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimations);
  } else {
    initAnimations();
  }
})();
