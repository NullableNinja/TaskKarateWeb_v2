/* ===========================
   PAPER-FU NOTIFICATION SYSTEM
   Toast and Popup notification management
   =========================== */

class NotificationSystem {
  constructor() {
    this.toasts = new Map();
    this.popups = new Map();
    this.toastContainer = null;
    this.init();
  }

  init() {
    this.createToastContainer();
    this.setupGlobalStyles();
  }

  createToastContainer() {
    if (!this.toastContainer) {
      this.toastContainer = document.createElement('div');
      this.toastContainer.className = 'toast-container top-right';
      document.body.appendChild(this.toastContainer);
    }
  }

  setupGlobalStyles() {
    // Add any global styles if needed
  }

  // Toast notification methods
  showToast(options = {}) {
    const {
      id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type = 'info',
      title = '',
      message = '',
      duration = 5000,
      persistent = false,
      position = 'top-right',
      animation = 'slide-in-right',
      showProgress = false
    } = options;

    // Remove existing toast with same ID
    if (this.toasts.has(id)) {
      this.hideToast(id);
    }

    const toast = this.createToastElement(id, type, title, message, duration, persistent, showProgress);
    this.setupToastContainer(position);
    this.toastContainer.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
      if (showProgress && duration > 0) {
        this.startProgressAnimation(toast, duration);
      }
    });

    // Auto-hide if not persistent
    if (!persistent && duration > 0) {
      setTimeout(() => {
        this.hideToast(id);
      }, duration);
    }

    this.toasts.set(id, { element: toast, options });

    return id;
  }

  createToastElement(id, type, title, message, duration, persistent, showProgress) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} ${showProgress ? 'with-progress' : ''}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    const iconMap = {
      success: '✓',
      error: '✕',
      warning: '!',
      info: 'i'
    };

    const progressHTML = showProgress && duration > 0 ? 
      `<div class="toast-progress" style="transition: width ${duration}ms linear;"></div>` : '';

    toast.innerHTML = `
      <div class="toast-icon">${iconMap[type] || 'i'}</div>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${this.escapeHtml(title)}</div>` : ''}
        <div class="toast-message">${this.escapeHtml(message)}</div>
      </div>
      <button class="toast-close" aria-label="Close notification">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2.343 2.343a1 1 0 011.414 0L8 6.586l4.243-4.243a1 1 0 111.414 1.414L9.414 8l4.243 4.243a1 1 0 01-1.414 1.414L8 9.414l-4.243 4.243a1 1 0 01-1.414-1.414L6.586 8 2.343 3.757a1 1 0 010-1.414z"/>
        </svg>
      </button>
      ${progressHTML}
    `;

    // Event listeners
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this.hideToast(id));

    return toast;
  }

  setupToastContainer(position) {
    this.toastContainer.className = `toast-container ${position}`;
  }

  startProgressAnimation(toastElement, duration) {
    const progressBar = toastElement.querySelector('.toast-progress');
    if (progressBar) {
      progressBar.style.width = '100%';
      requestAnimationFrame(() => {
        progressBar.style.width = '0%';
      });
    }
  }

  hideToast(id) {
    const toastData = this.toasts.get(id);
    if (toastData) {
      const { element } = toastData;
      element.classList.add('hiding');
      
      setTimeout(() => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
        this.toasts.delete(id);
      }, 300);
    }
  }

  // Popup notification methods
  showPopup(options = {}) {
    const {
      id = `popup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type = 'info',
      title = '',
      content = '',
      buttons = [],
      closeOnOverlay = true,
      closeOnEscape = true
    } = options;

    // Remove existing popup with same ID
    if (this.popups.has(id)) {
      this.hidePopup(id);
    }

    const popup = this.createPopupElement(id, type, title, content, buttons);
    const overlay = this.createOverlayElement(popup, closeOnOverlay, closeOnEscape, id);

    document.body.appendChild(overlay);

    // Trigger animation
    requestAnimationFrame(() => {
      overlay.classList.add('show');
    });

    this.popups.set(id, { element: overlay, popup, options });

    return id;
  }

  createPopupElement(id, type, title, content, buttons) {
    const popup = document.createElement('div');
    popup.className = `popup popup-${type}`;
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-modal', 'true');
    popup.setAttribute('aria-labelledby', `${id}-title`);

    const buttonsHTML = buttons.map(btn => {
      const btnClass = btn.type === 'primary' ? 'btn' : `btn btn-${btn.type || 'secondary'}`;
      return `<button class="${btnClass}" data-action="${btn.action || 'close'}">${this.escapeHtml(btn.text)}</button>`;
    }).join('');

    popup.innerHTML = `
      <div class="popup-header">
        <h3 class="popup-title" id="${id}-title">${this.escapeHtml(title)}</h3>
        <button class="popup-close" aria-label="Close popup">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <path d="M2.343 2.343a1 1 0 011.414 0L9 6.586l5.243-4.243a1 1 0 111.414 1.414L10.414 9l4.243 5.243a1 1 0 01-1.414 1.414L9 10.414l-5.243 4.243a1 1 0 01-1.414-1.414L7.586 9 3.343 4.757a1 1 0 010-1.414z"/>
          </svg>
        </button>
      </div>
      <div class="popup-body">
        ${content ? `<div class="popup-content">${this.escapeHtml(content)}</div>` : ''}
      </div>
      ${buttons.length > 0 ? `
        <div class="popup-footer">
          ${buttonsHTML}
        </div>
      ` : ''}
    `;

    // Event listeners
    const closeBtn = popup.querySelector('.popup-close');
    closeBtn.addEventListener('click', () => this.hidePopup(id));

    const footerButtons = popup.querySelectorAll('.popup-footer button');
    footerButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.getAttribute('data-action');
        this.handlePopupAction(id, action);
      });
    });

    return popup;
  }

  createOverlayElement(popup, closeOnOverlay, closeOnEscape, id) {
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    
    if (closeOnOverlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.hidePopup(id);
        }
      });
    }

    if (closeOnEscape) {
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          this.hidePopup(id);
          document.removeEventListener('keydown', handleEscape);
        }
      };
      document.addEventListener('keydown', handleEscape);
    }

    overlay.appendChild(popup);
    return overlay;
  }

  handlePopupAction(id, action) {
    const popupData = this.popups.get(id);
    if (popupData && popupData.options.onAction) {
      popupData.options.onAction(action);
    }
    
    if (action === 'close') {
      this.hidePopup(id);
    }
  }

  hidePopup(id) {
    const popupData = this.popups.get(id);
    if (popupData) {
      const { element } = popupData;
      element.classList.remove('show');
      
      setTimeout(() => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
        this.popups.delete(id);
      }, 300);
    }
  }

  // Utility methods
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Convenience methods
  success(message, title = 'Success', options = {}) {
    return this.showToast({ ...options, type: 'success', title, message });
  }

  error(message, title = 'Error', options = {}) {
    return this.showToast({ ...options, type: 'error', title, message, duration: 8000 });
  }

  warning(message, title = 'Warning', options = {}) {
    return this.showToast({ ...options, type: 'warning', title, message });
  }

  info(message, title = 'Info', options = {}) {
    return this.showToast({ ...options, type: 'info', title, message });
  }

  confirm(content, title = 'Confirm', options = {}) {
    return this.showPopup({
      ...options,
      type: 'warning',
      title,
      content,
      buttons: [
        { text: 'Cancel', action: 'cancel', type: 'secondary' },
        { text: 'Confirm', action: 'confirm', type: 'primary' }
      ]
    });
  }

  alert(content, title = 'Alert', options = {}) {
    return this.showPopup({
      ...options,
      type: 'info',
      title,
      content,
      buttons: [
        { text: 'OK', action: 'close', type: 'primary' }
      ]
    });
  }

  // Clear all notifications
  clearAllToasts() {
    this.toasts.forEach((_, id) => this.hideToast(id));
  }

  clearAllPopups() {
    this.popups.forEach((_, id) => this.hidePopup(id));
  }

  clearAll() {
    this.clearAllToasts();
    this.clearAllPopups();
  }
}

// Global instance
window.notifications = new NotificationSystem();

// Global convenience functions
window.showToast = (options) => window.notifications.showToast(options);
window.showPopup = (options) => window.notifications.showPopup(options);
window.notify = {
  success: (message, title, options) => window.notifications.success(message, title, options),
  error: (message, title, options) => window.notifications.error(message, title, options),
  warning: (message, title, options) => window.notifications.warning(message, title, options),
  info: (message, title, options) => window.notifications.info(message, title, options),
  confirm: (content, title, options) => window.notifications.confirm(content, title, options),
  alert: (content, title, options) => window.notifications.alert(content, title, options)
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🔔 Paper-Fu Notification System initialized');
  });
} else {
  console.log('🔔 Paper-Fu Notification System initialized');
}