/**
 * contact-modal.js — Initialize and control contact modal
 */

(function() {
  'use strict';

  // Create modal HTML structure
  const createModal = () => {
    const modalHTML = `
      <div class="modal-overlay" id="contactModal">
        <div class="contact-modal">
          <div class="modal-header">
            <h2>Contact Us</h2>
            <button class="modal-close" aria-label="Close modal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="contact-section">
              <h3>Phone</h3>
              <p><a href="tel:+15551234567">(555) 123-4567</a></p>
            </div>
            
            <div class="contact-section">
              <h3>Email</h3>
              <p><a href="mailto:info@taskkarate.com">info@taskkarate.com</a></p>
            </div>
            
            <div class="contact-section">
              <h3>Location</h3>
              <p>123 Main Street<br>
              Your City, ST 12345</p>
            </div>
            
            <div class="contact-section">
              <h3>Hours</h3>
              <p>Monday - Friday: 3:00 PM - 9:00 PM<br>
              Saturday: 9:00 AM - 2:00 PM<br>
              Sunday: Closed</p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  };

  // Open modal
  const openModal = () => {
    const modal = document.getElementById('contactModal');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  // Close modal
  const closeModal = () => {
    const modal = document.getElementById('contactModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  // Initialize modal
  const initModal = () => {
    createModal();
    
    // Close button handler
    const closeBtn = document.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }
    
    // Overlay click handler (close when clicking outside modal)
    const overlay = document.getElementById('contactModal');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          closeModal();
        }
      });
    }
    
    // ESC key handler
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    });
    
    // Add click handlers to all contact buttons/links
    document.querySelectorAll('[data-contact-modal]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    });
  };

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModal);
  } else {
    initModal();
  }

  // Expose functions globally for manual triggering
  window.TaskKarate = window.TaskKarate || {};
  window.TaskKarate.openContactModal = openModal;
  window.TaskKarate.closeContactModal = closeModal;
})();
