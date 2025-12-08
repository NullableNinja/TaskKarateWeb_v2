/* ============================================================
   belt-modal.js — Handle belt testing sheet modal display
   ============================================================ */

(function() {
  'use strict';

  // Belt data mapping
  const beltData = {
    'white': { name: 'White Belt', file: 'White-Belt-Testing-Sheet.html' },
    'gold': { name: 'Gold Belt', file: 'Gold-Belt-Testing-Sheet.html' },
    'orange': { name: 'Orange Belt', file: 'Orange-Belt-Testing-Sheet.html' },
    'green': { name: 'Green Belt', file: 'Green-Belt-Testing-Sheet.html' },
    'purple': { name: 'Purple Belt', file: 'Purple-Belt-Testing-Sheet.html' },
    'blue': { name: 'Blue Belt', file: 'Blue-Belt-Testing-Sheet.html' },
    'red': { name: 'Red Belt', file: 'Red-Belt-Testing-Sheet.html' },
    'brown': { name: 'Brown Belt', file: 'Brown-Belt-Testing-Sheet.html' },
    'black': { name: 'Black Belt', file: 'Black-Belt-Testing-Sheet.html' }
  };

  // Create modal HTML on page load
  function createModal() {
    const modalHTML = `
      <div class="belt-modal-overlay" id="beltModal">
        <div class="belt-modal">
          <div class="belt-modal__header">
            <h2 class="belt-modal__title" id="beltModalTitle">Testing Sheet</h2>
            <button class="belt-modal__close" id="beltModalClose" aria-label="Close modal">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="belt-modal__body">
            <div class="belt-modal__loading" id="beltModalLoading">Loading testing sheet...</div>
            <iframe class="belt-modal__iframe" id="beltModalIframe" style="display:none;"></iframe>
          </div>
          <div class="belt-modal__footer">
            <button class="btn btn-secondary" id="beltModalPrint">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              Print
            </button>
            <button class="btn" id="beltModalDownload">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download PDF
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  // Open modal with specific belt
  function openBeltModal(beltType) {
    const belt = beltData[beltType];
    if (!belt) return;

    const modal = document.getElementById('beltModal');
    const title = document.getElementById('beltModalTitle');
    const iframe = document.getElementById('beltModalIframe');
    const loading = document.getElementById('beltModalLoading');

    // Set belt type for theming
    modal.setAttribute('data-belt', beltType);
    
    // Update title
    title.textContent = belt.name + ' Testing Requirements';
    
    // Show loading, hide iframe
    loading.style.display = 'block';
    iframe.style.display = 'none';
    
    // Set iframe source
    iframe.src = belt.file;
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Hide loading when iframe loads
    iframe.onload = function() {
      loading.style.display = 'none';
      iframe.style.display = 'block';
    };
  }

  // Close modal
  function closeBeltModal() {
    const modal = document.getElementById('beltModal');
    const iframe = document.getElementById('beltModalIframe');
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Clear iframe after animation
    setTimeout(() => {
      iframe.src = '';
    }, 300);
  }

  // Print the iframe content
  function printBeltSheet() {
    const iframe = document.getElementById('beltModalIframe');
    if (iframe.contentWindow) {
      iframe.contentWindow.print();
    }
  }

  // Download as PDF
  function downloadBeltPDF() {
    const iframe = document.getElementById('beltModalIframe');
    const modal = document.getElementById('beltModal');
    const beltType = modal.getAttribute('data-belt');
    const belt = beltData[beltType];
    
    if (!iframe.contentDocument) return;
    
    // Get the content from iframe
    const content = iframe.contentDocument.body;
    
    // Configure PDF options
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: belt.name.replace(' ', '-') + '-Testing-Sheet.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false
      },
      jsPDF: { 
        unit: 'in', 
        format: 'letter', 
        orientation: 'portrait' 
      }
    };
    
    // Generate and download PDF
    html2pdf().set(opt).from(content).save();
  }

  // Initialize on DOM ready
  function init() {
    // Create modal
    createModal();

    // Close button
    document.getElementById('beltModalClose').addEventListener('click', closeBeltModal);

    // Close on overlay click
    document.getElementById('beltModal').addEventListener('click', function(e) {
      if (e.target === this) {
        closeBeltModal();
      }
    });

    // Print button
    document.getElementById('beltModalPrint').addEventListener('click', printBeltSheet);

    // Download PDF button
    document.getElementById('beltModalDownload').addEventListener('click', function(e) {
      e.preventDefault();
      downloadBeltPDF();
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeBeltModal();
      }
    });

    // Attach click handlers to belt buttons
    document.querySelectorAll('.belt-btn').forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const beltType = this.classList[2].replace('belt-', ''); // Extract belt type from class
        openBeltModal(beltType);
      });
    });
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
