/**
 * trial-coupon.js — Initialize and control trial coupon popup
 */

(function() {
  'use strict';

  // Check if coupon was already dismissed
  const STORAGE_KEY = 'tk_trial_coupon_dismissed';
  
  const wasDismissed = () => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch (e) {
      return false;
    }
  };

  const setDismissed = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch (e) {
      // Silently fail if localStorage unavailable
    }
  };

  // Create coupon HTML structure
  const createCoupon = () => {
    const couponHTML = `
      <div class="trial-coupon" id="trialCoupon">
        <div class="coupon-tape"></div>
        <div class="coupon-card">
          <div class="coupon-perforation"></div>
          <div class="coupon-header">
            <button class="coupon-close" aria-label="Close coupon">&times;</button>
            <h3>Special Offer!</h3>
            <p class="coupon-subtitle">New students only</p>
          </div>
          <div class="coupon-body">
            <div class="coupon-offer">2 WEEKS FREE</div>
            <p class="coupon-details">
              Try Task Karate risk-free! Experience our classes with no commitment.
            </p>
            <div class="coupon-code">
              <p class="coupon-code-label">Use Code:</p>
              <p class="coupon-code-text">TRIAL2024</p>
            </div>
            <button class="coupon-cta" data-contact-modal>Claim Your Trial</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', couponHTML);
  };

  // Show coupon
  const showCoupon = () => {
    const coupon = document.getElementById('trialCoupon');
    if (coupon) {
      // Delay slightly for smooth entrance
      setTimeout(() => {
        coupon.classList.add('visible');
      }, 500);
    }
  };

  // Hide coupon
  const hideCoupon = () => {
    const coupon = document.getElementById('trialCoupon');
    if (coupon) {
      coupon.classList.remove('visible');
      setDismissed();
    }
  };

  // Initialize coupon
  const initCoupon = () => {
    // Don't show if already dismissed
    if (wasDismissed()) {
      return;
    }

    createCoupon();
    
    // Close button handler
    const closeBtn = document.querySelector('.coupon-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', hideCoupon);
    }
    
    // Show coupon after page loads and user has had time to see content
    setTimeout(showCoupon, 3000); // Show after 3 seconds
    
    // Auto-hide after 15 seconds if not interacted with
    setTimeout(() => {
      const coupon = document.getElementById('trialCoupon');
      if (coupon && coupon.classList.contains('visible')) {
        hideCoupon();
      }
    }, 18000); // 3s delay + 15s visible = 18s total
  };

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCoupon);
  } else {
    initCoupon();
  }

  // Expose functions globally for manual triggering
  window.TaskKarate = window.TaskKarate || {};
  window.TaskKarate.showTrialCoupon = showCoupon;
  window.TaskKarate.hideTrialCoupon = hideCoupon;
})();
