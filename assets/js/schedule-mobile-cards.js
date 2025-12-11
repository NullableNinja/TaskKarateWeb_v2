/**
 * Schedule Mobile Cards - Transforms schedule tables into card-based layout on mobile
 * Runs after schedule-loader.js populates the tables
 */

(function() {
  'use strict';

  const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const DAY_ABBREVIATIONS = {
    'Monday': 'Mon',
    'Tuesday': 'Tue',
    'Wednesday': 'Wed',
    'Thursday': 'Thu',
    'Friday': 'Fri',
    'Saturday': 'Sat'
  };

  /**
   * Initialize mobile card generation
   * Should be called after tables are populated
   */
  function initMobileCards() {
    // Wait for DOM to be ready and tables to be populated
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', generateAllCards);
    } else {
      // DOM already loaded, wait a bit for schedule-loader.js to finish
      setTimeout(generateAllCards, 100);
    }

    // Re-generate cards on resize if crossing mobile breakpoint
    let lastWidth = window.innerWidth;
    window.addEventListener('resize', () => {
      const currentWidth = window.innerWidth;
      if ((lastWidth <= 768 && currentWidth > 768) || 
          (lastWidth > 768 && currentWidth <= 768)) {
        generateAllCards();
      }
      lastWidth = currentWidth;
    });
  }

  /**
   * Generate mobile cards for all schedule tables
   */
  function generateAllCards() {
    const tables = document.querySelectorAll('.schedule-table');
    
    tables.forEach(table => {
      const container = table.closest('.table-responsive');
      if (!container) return;

      // Check if cards already exist
      let cardsContainer = container.querySelector('.schedule-cards-mobile');
      
      if (!cardsContainer) {
        cardsContainer = document.createElement('div');
        cardsContainer.className = 'schedule-cards-mobile';
        container.insertBefore(cardsContainer, table);
      } else {
        // Clear existing cards
        cardsContainer.innerHTML = '';
      }

      // Generate cards from table rows
      const tbody = table.querySelector('tbody');
      if (!tbody) return;

      const rows = tbody.querySelectorAll('tr');
      rows.forEach(row => {
        const card = createCardFromRow(row);
        if (card) {
          cardsContainer.appendChild(card);
        }
      });
    });
  }

  /**
   * Create a schedule card from a table row
   */
  function createCardFromRow(row) {
    const cells = row.querySelectorAll('td');
    if (cells.length < 2) return null;

    const card = document.createElement('div');
    card.className = 'schedule-card';

    // Create card header (belts + group name)
    const header = document.createElement('div');
    header.className = 'schedule-card-header';

    // Belt dots container
    const beltsContainer = document.createElement('div');
    beltsContainer.className = 'schedule-card-belts';
    const beltCell = cells[0];
    const beltDots = beltCell.querySelectorAll('.belt-dot');
    beltDots.forEach(dot => {
      beltsContainer.appendChild(dot.cloneNode(true));
    });
    header.appendChild(beltsContainer);

    // Group name
    const groupName = document.createElement('div');
    groupName.className = 'schedule-card-group';
    groupName.textContent = cells[1].textContent.trim();
    header.appendChild(groupName);

    card.appendChild(header);

    // Check for special note (colspan cell)
    const colspanCell = row.querySelector('td[colspan]');
    if (colspanCell) {
      const note = document.createElement('div');
      note.className = 'schedule-card-note';
      note.style.cssText = 'color: var(--text-secondary); font-size: 0.85rem; padding: 0.5rem 0;';
      note.textContent = colspanCell.textContent.trim();
      card.appendChild(note);
      return card;
    }

    // Create card body (days grid)
    const body = document.createElement('div');
    body.className = 'schedule-card-body';

    // Process each day (cells 2-7 are Mon-Sat)
    DAYS_OF_WEEK.forEach((day, index) => {
      const cellIndex = index + 2;
      if (cellIndex >= cells.length) return;

      const dayCell = cells[cellIndex];
      const dayContainer = document.createElement('div');
      dayContainer.className = 'schedule-card-day';

      // Day label
      const dayLabel = document.createElement('div');
      dayLabel.className = 'schedule-card-day-label';
      dayLabel.textContent = DAY_ABBREVIATIONS[day];
      dayContainer.appendChild(dayLabel);

      // Times container
      const timesContainer = document.createElement('div');
      timesContainer.className = 'schedule-card-times';

      // Check if cell has time pills
      const timePills = dayCell.querySelectorAll('.time-pill');
      
      if (timePills.length > 0) {
        timePills.forEach(pill => {
          const time = document.createElement('div');
          time.className = 'schedule-card-time';
          
          // Preserve hour marker styling
          if (pill.classList.contains('time-pill--hour')) {
            time.classList.add('schedule-card-time--hour');
          }
          
          time.textContent = pill.textContent.trim();
          timesContainer.appendChild(time);
        });
      } else if (dayCell.textContent.trim() === '—' || dayCell.textContent.trim() === '') {
        // Empty day
        const empty = document.createElement('div');
        empty.className = 'schedule-card-empty';
        empty.textContent = '—';
        timesContainer.appendChild(empty);
      }

      dayContainer.appendChild(timesContainer);
      body.appendChild(dayContainer);
    });

    card.appendChild(body);
    return card;
  }

  /**
   * Capitalize first letter
   */
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Initialize on load
  initMobileCards();

  // Expose globally in case we need to manually trigger
  window.generateScheduleCards = generateAllCards;

})();
