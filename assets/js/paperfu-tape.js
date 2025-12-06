/**
 * paperfu-tape.js
 * Automatically adds tape decorations to all .card elements
 * AND adds stacked layer backgrounds to active tabs
 * Runs on page load
 */

(function() {
  'use strict';

  function addTapeToCards() {
    // Find all cards in the document
    const cards = document.querySelectorAll('.card');
    
    cards.forEach((card, index) => {
      // Check if tape wrapper already exists
      if (!card.querySelector('.card-tape')) {
        // Create tape wrapper element
        const tapeWrapper = document.createElement('div');
        tapeWrapper.className = 'card-tape';
        
        // Add data attribute for tape variant (1-6)
        const variant = (index % 6) + 1;
        tapeWrapper.setAttribute('data-tape-variant', variant);
        
        // Insert as first child of card
        card.insertBefore(tapeWrapper, card.firstChild);
      }
    });
    
    console.log(`✨ Paper-Fu: Added randomized tape to ${cards.length} cards`);
  }

  function addStackedLayersToActiveTabs() {
    // Find all active tabs
    const activeTabs = document.querySelectorAll('.tab.is-active');
    
    activeTabs.forEach((tab) => {
      // Check if layers already exist
      if (!tab.querySelector('.tab-layer')) {
        // Create layer wrappers (2 additional layers)
        const layer1 = document.createElement('div');
        layer1.className = 'tab-layer tab-layer-1';
        
        const layer2 = document.createElement('div');
        layer2.className = 'tab-layer tab-layer-2';
        
        // Append layers (they'll be styled with CSS)
        tab.appendChild(layer1);
        tab.appendChild(layer2);
      }
    });
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      addTapeToCards();
      addStackedLayersToActiveTabs();
    });
  } else {
    addTapeToCards();
    addStackedLayersToActiveTabs();
  }

  // Also re-run when tabs change (observe for class changes)
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        const target = mutation.target;
        if (target.classList.contains('is-active') && target.classList.contains('tab')) {
          addStackedLayersToActiveTabs();
        }
      }
    });
  });

  // Observe the programs section for tab changes
  setTimeout(() => {
    const programsSection = document.querySelector('#programs');
    if (programsSection) {
      observer.observe(programsSection, {
        attributes: true,
        attributeFilter: ['class'],
        subtree: true
      });
    }
  }, 100);

})();
