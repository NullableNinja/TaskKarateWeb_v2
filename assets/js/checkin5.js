/**
 * Check-in System - Time-aware class check-in with student tiles
 */

(function() {
  'use strict';

  // State management
  let scheduleData = null;
  let studentsData = null;
  let checkinsData = [];
  let selectedStudent = null;
  let selectedClass = null;
  let selectedRole = null; // 'student' or 'helper'
  let allStudents = [];
  let filteredStudents = [];
  let currentView = 'tile'; // 'tile' or 'calendar'
  let currentCalendarDate = new Date(); // For calendar picker
  let selectedDate = new Date(); // Selected date in calendar

  const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const AVATAR_COLORS = ['#93c5fd', '#a5f3fc', '#fda4af', '#fcd34d', '#bbf7d0', '#c7d2fe'];
  
  // Belt rank hierarchy (higher number = higher rank)
  const BELT_RANKS = {
    'White Belt': 1,
    'Gold Belt': 2,
    'Orange Belt': 3,
    'Green Belt': 4,
    'Purple Belt': 5,
    'Blue Belt': 6,
    'Red Belt': 7,
    'Brown Belt': 8,
    'Black Belt': 9,
    '1st Degree Black Belt': 10,
    '2nd Degree Black Belt': 11,
    '3rd Degree Black Belt': 12,
    '4th Degree Black Belt': 13,
    '5th Degree Black Belt': 14
  };

  // Minimum ranks for classes (based on class names)
  const CLASS_RANK_REQUIREMENTS = {
    'White • Gold': 1,
    'Orange': 3,
    'Green • Purple': 4,
    'Blue • Red': 6,
    'Brown': 8,
    'Black': 9,
    'White • Gold • Orange': 1,
    'Green Belt & Up': 4
  };

  /**
   * Get belt rank value for comparison
   */
  function getBeltRankValue(rankString) {
    // Handle belts with stripes
    const baseRank = rankString.split(' w/')[0].trim();
    return BELT_RANKS[baseRank] || 0;
  }

  /**
   * Check if student can help with a class
   */
  function canHelp(studentRank, className) {
    const studentValue = getBeltRankValue(studentRank);
    const classRequirement = CLASS_RANK_REQUIREMENTS[className] || 0;
    
    // Must be at least 2 belt ranks higher to help
    // Brown belts (8) and above can help with most classes
    return studentValue >= 8 || (studentValue >= classRequirement + 2 && studentValue >= 6);
  }

  /**
   * Check if student qualifies for a class as a student
   */
  function qualifiesForClass(studentRank, className, category) {
    const studentValue = getBeltRankValue(studentRank);
    const classRequirement = CLASS_RANK_REQUIREMENTS[className] || 0;
    
    // Special handling for "all ranks" classes
    if (category === 'sparring' || category === 'weapons' || 
        category === 'special' || category === 'eskrima') {
      return true; // Most special classes are open to all
    }
    
    // For regular classes, check if within range
    return studentValue >= classRequirement && studentValue <= classRequirement + 2;
  }

  /**
   * Initialize the check-in system
   */
  async function init() {
    try {
      // Load data
      await Promise.all([
        loadScheduleData(),
        loadStudentsData(),
        loadCheckinsData()
      ]);

      // Setup UI
      updateDateTime();
      setupEventListeners();
      setupViewToggle();
      renderUpcomingClasses();
      renderRegisteredClasses();
      renderRecentCheckins();

      // Update date/time every minute
      setInterval(() => {
        updateDateTime();
        renderUpcomingClasses();
      }, 60000);

    } catch (error) {
      console.error('Error initializing check-in system:', error);
      showError('Failed to load check-in system. Please refresh the page.');
    }
  }

  /**
   * Load schedule data from JSON
   */
  async function loadScheduleData() {
    const response = await fetch('assets/data/schedules.json');
    if (!response.ok) throw new Error('Failed to load schedules');
    scheduleData = await response.json();
  }

  /**
   * Load students data from JSON
   */
  async function loadStudentsData() {
    const response = await fetch('assets/data/students.json');
    if (!response.ok) throw new Error('Failed to load students');
    const data = await response.json();
    studentsData = data;
    allStudents = data.students || [];
    filteredStudents = [...allStudents];
  }

  /**
   * Load check-ins from localStorage
   */
  function loadCheckinsData() {
    const stored = localStorage.getItem('taskkarate_checkins');
    if (stored) {
      checkinsData = JSON.parse(stored);
      // Clean up old check-ins (older than 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      checkinsData = checkinsData.filter(c => new Date(c.timestamp) > sevenDaysAgo);
      saveCheckinsData();
    }
  }

  /**
   * Save check-ins to localStorage
   */
  function saveCheckinsData() {
    localStorage.setItem('taskkarate_checkins', JSON.stringify(checkinsData));
  }

  /**
   * Update current date and time display
   */
  function updateDateTime() {
    const now = new Date();
    const dateTimeEl = document.getElementById('current-date-time');
    if (dateTimeEl) {
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      };
      dateTimeEl.textContent = now.toLocaleDateString('en-US', options);
    }
  }

  /**
   * Setup event listeners
   */
  function setupEventListeners() {
    // Modal close handlers
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', closeCheckinModal);
    });

    // Click outside modal to close
    document.getElementById('checkinModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'checkinModal') {
        closeCheckinModal();
      }
    });

    // Student search
    const searchInput = document.getElementById('student-search-input');
    searchInput?.addEventListener('input', handleStudentSearch);

    // PIN input
    const pinInput = document.getElementById('pin-input');
    pinInput?.addEventListener('input', handlePinInput);
    pinInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && pinInput.value.length === 4) {
        handleCheckin();
      }
    });

    // Check-in submit
    document.getElementById('checkin-submit-btn')?.addEventListener('click', handleCheckin);
    
    // Role selection
    document.getElementById('role-student')?.addEventListener('click', () => selectRole('student'));
    document.getElementById('role-helper')?.addEventListener('click', () => selectRole('helper'));
    
    // Calendar navigation
    document.getElementById('prev-month')?.addEventListener('click', () => changeMonth(-1));
    document.getElementById('next-month')?.addEventListener('click', () => changeMonth(1));
  }

  /**
   * Setup view toggle (tile vs calendar)
   */
  function setupViewToggle() {
    const toggleBtns = document.querySelectorAll('.view-toggle-btn');
    
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        
        // Update active button
        toggleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update view
        currentView = view;
        
        // Toggle views
        document.getElementById('tile-view').classList.toggle('active', view === 'tile');
        document.getElementById('calendar-view').classList.toggle('active', view === 'calendar');
        
        // Render appropriate view
        if (view === 'tile') {
          renderTileView();
        } else {
          renderCalendarView();
        }
      });
    });
  }

  /**
   * Get today's day name
   */
  function getTodayName() {
    return DAYS_OF_WEEK[new Date().getDay()];
  }

  /**
   * Render upcoming classes (current and future for today)
   */
  function renderUpcomingClasses() {
    if (currentView === 'tile') {
      renderTileView();
    } else {
      renderCalendarView();
    }
  }

  /**
   * Render tile view
   */
  function renderTileView() {
    const container = document.getElementById('tile-view');
    if (!container || !scheduleData) return;

    const now = new Date();
    const currentDay = getTodayName();
    const classes = getClassesForDay(currentDay);
    
    // Filter to only show upcoming classes (within 2 hours before start time)
    const upcomingClasses = classes.filter(cls => {
      const classTime = parseTimeToDate(cls.time);
      const twoHoursBefore = new Date(classTime.getTime() - (2 * 60 * 60 * 1000));
      return classTime > now || (now >= twoHoursBefore && now <= classTime);
    });

    if (upcomingClasses.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <circle cx="12" cy="16" r="1" fill="currentColor"/>
          </svg>
          <h3>No Upcoming Classes</h3>
          <p class="muted">There are no more classes scheduled for today. Great work!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = upcomingClasses.map(cls => createClassTile(cls, now)).join('');

    // Add click handlers for tiles
    container.querySelectorAll('.class-tile').forEach(tile => {
      const classData = JSON.parse(tile.dataset.class);
      
      // Don't allow checking in if already checked in
      if (classData.checkedIn) return;
      
      // Button click
      const actionBtn = tile.querySelector('.class-tile-action');
      if (actionBtn) {
        actionBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openCheckinModal(classData);
        });
      }
      
      // Tile click (anywhere except button)
      tile.addEventListener('click', (e) => {
        if (!e.target.closest('.class-tile-action')) {
          openCheckinModal(classData);
        }
      });
    });
  }

  /**
   * Render calendar view with date picker
   */
  function renderCalendarView() {
    renderCalendarPicker();
    renderSelectedDateClasses();
  }

  /**
   * Render the calendar picker
   */
  function renderCalendarPicker() {
    const monthYear = document.getElementById('calendar-month-year');
    const daysContainer = document.getElementById('calendar-days');
    
    if (!monthYear || !daysContainer) return;

    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    monthYear.textContent = currentCalendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let html = '';
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      html += `<div class="calendar-day-cell other-month"><span class="calendar-day-number">${day}</span></div>`;
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      
      const isToday = date.getTime() === today.getTime();
      const isSelected = date.getTime() === selectedDate.getTime();
      const dayName = DAYS_OF_WEEK[date.getDay()];
      const hasClasses = getClassesForDay(dayName).length > 0;
      
      const classes = ['calendar-day-cell'];
      if (isToday) classes.push('today');
      if (isSelected) classes.push('selected');
      if (hasClasses) classes.push('has-classes');
      
      html += `<div class="${classes.join(' ')}" data-date="${date.toISOString()}"><span class="calendar-day-number">${day}</span></div>`;
    }
    
    // Next month days to fill grid
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
    const remainingCells = totalCells - (firstDay + daysInMonth);
    for (let day = 1; day <= remainingCells; day++) {
      html += `<div class="calendar-day-cell other-month"><span class="calendar-day-number">${day}</span></div>`;
    }
    
    daysContainer.innerHTML = html;
    
    // Add click handlers
    daysContainer.querySelectorAll('.calendar-day-cell:not(.other-month)').forEach(cell => {
      cell.addEventListener('click', () => {
        const dateStr = cell.dataset.date;
        if (dateStr) {
          selectedDate = new Date(dateStr);
          renderCalendarPicker();
          renderSelectedDateClasses();
        }
      });
    });
  }

  /**
   * Render classes for selected date
   */
  function renderSelectedDateClasses() {
    const container = document.getElementById('calendar-date-classes');
    const titleEl = document.getElementById('selected-date-title');
    
    if (!container || !titleEl) return;

    const dayName = DAYS_OF_WEEK[selectedDate.getDay()];
    const dateStr = selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    
    titleEl.textContent = dateStr;
    
    const classes = getClassesForDay(dayName);
    const now = new Date();
    
    if (classes.length === 0) {
      container.innerHTML = '<p class="muted">No classes scheduled for this day.</p>';
      return;
    }
    
    container.innerHTML = classes.map(cls => createClassTile(cls, now)).join('');
    
    // Add click handlers
    container.querySelectorAll('.class-tile').forEach(tile => {
      const classData = JSON.parse(tile.dataset.class);
      
      if (classData.checkedIn) return;
      
      const actionBtn = tile.querySelector('.class-tile-action');
      if (actionBtn) {
        actionBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openCheckinModal(classData);
        });
      }
      
      tile.addEventListener('click', (e) => {
        if (!e.target.closest('.class-tile-action')) {
          openCheckinModal(classData);
        }
      });
    });
  }

  /**
   * Change calendar month
   */
  function changeMonth(delta) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + delta);
    renderCalendarPicker();
  }

  /**
   * Get classes for a specific day
   */
  function getClassesForDay(day) {
    if (!scheduleData) return [];

    const classes = [];
    const sections = ['kids', 'teensAdults', 'sparring', 'weapons', 'special', 'eskrima'];

    sections.forEach(sectionKey => {
      const section = scheduleData[sectionKey];
      if (!section || !section.groups) return;

      section.groups.forEach(group => {
        if (group.schedule && group.schedule[day]) {
          group.schedule[day].forEach(timeSlot => {
            const userId = JSON.parse(localStorage.getItem('taskkarate_user') || '{}').id;
            const classId = `${sectionKey}-${group.name}-${day}-${timeSlot.time}`;
            const isCheckedIn = checkinsData.some(c => 
              c.classId === classId &&
              c.studentId === userId &&
              isToday(new Date(c.timestamp))
            );

            classes.push({
              id: classId,
              program: section.title,
              group: group.name,
              time: timeSlot.time,
              duration: timeSlot.isHour ? '60 min' : '45 min',
              category: sectionKey,
              day: day,
              belts: group.belts,
              checkedIn: isCheckedIn
            });
          });
        }
      });
    });

    // Sort by time
    classes.sort((a, b) => {
      const timeA = convertTo24Hour(a.time);
      const timeB = convertTo24Hour(b.time);
      return timeA.localeCompare(timeB);
    });

    return classes;
  }

  /**
   * Parse time string to today's Date object
   */
  function parseTimeToDate(timeStr) {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  /**
   * Get time status for a class
   */
  function getTimeStatus(classTime, now) {
    const timeDiff = classTime - now;
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));
    
    if (minutesDiff < 0 && minutesDiff > -60) {
      return { status: 'in-progress', label: 'In Progress' };
    } else if (minutesDiff >= 0 && minutesDiff <= 30) {
      return { status: 'starting-soon', label: 'Starting Soon' };
    } else if (minutesDiff > 30 && minutesDiff <= 120) {
      return { status: 'upcoming', label: `In ${minutesDiff} min` };
    }
    return { status: 'upcoming', label: 'Upcoming' };
  }

  /**
   * Create class card HTML
   */
  function createClassCard(cls, now) {
    const todayCheckins = checkinsData.filter(c => 
      c.classId === cls.id && 
      isToday(new Date(c.timestamp))
    );
    
    const studentCount = todayCheckins.filter(c => c.role === 'student').length;
    const helperCount = todayCheckins.filter(c => c.role === 'helper').length;
    const totalCount = todayCheckins.length;

    const classTime = parseTimeToDate(cls.time);
    const timeStatus = getTimeStatus(classTime, now);

    const categoryMap = {
      'kids': 'kids',
      'teensAdults': 'teens-adults',
      'sparring': 'sparring',
      'weapons': 'weapons',
      'special': 'special',
      'eskrima': 'eskrima'
    };

    const statusClass = timeStatus.status === 'in-progress' ? 'status-active' : 
                       timeStatus.status === 'starting-soon' ? 'status-soon' : '';

    // Build check-in display text
    let checkinText = '';
    if (totalCount === 0) {
      checkinText = 'No check-ins yet';
    } else if (helperCount === 0) {
      checkinText = `${studentCount} student${studentCount !== 1 ? 's' : ''}`;
    } else if (studentCount === 0) {
      checkinText = `${helperCount} helper${helperCount !== 1 ? 's' : ''}`;
    } else {
      checkinText = `${studentCount} student${studentCount !== 1 ? 's' : ''}, ${helperCount} helper${helperCount !== 1 ? 's' : ''}`;
    }

    return `
      <div class="class-card ${cls.checkedIn ? 'checked-in' : ''} ${statusClass}" data-class='${JSON.stringify(cls)}'>
        <div class="class-card-header">
          <div class="class-info-main">
            <h3>${cls.group}</h3>
            <span class="class-badge ${categoryMap[cls.category]}">${cls.program}</span>
          </div>
          <div class="class-time">
            ${cls.time}
            ${timeStatus.status !== 'upcoming' ? `<span class="time-indicator">${timeStatus.label}</span>` : ''}
          </div>
        </div>
        <div class="class-card-body">
          <div class="class-detail">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
              <path d="M12 7V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>${cls.duration}</span>
          </div>
          <div class="class-detail">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="2"/>
              <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span>${checkinText}</span>
          </div>
        </div>
        <div class="class-card-footer">
          ${cls.checkedIn ? `
            <div class="checked-in-badge">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              You're Checked In
            </div>
          ` : `
            <button class="checkin-btn">Check In Now</button>
          `}
        </div>
      </div>
    `;
  }

  /**
   * Create class tile HTML (compact tile version)
   */
  function createClassTile(cls, now) {
    const todayCheckins = checkinsData.filter(c => 
      c.classId === cls.id && 
      isToday(new Date(c.timestamp))
    );
    
    const studentCount = todayCheckins.filter(c => c.role === 'student').length;
    const helperCount = todayCheckins.filter(c => c.role === 'helper').length;

    const classTime = parseTimeToDate(cls.time);
    const timeStatus = getTimeStatus(classTime, now);

    const categoryMap = {
      'kids': 'kids',
      'teensAdults': 'teens-adults',
      'sparring': 'sparring',
      'weapons': 'weapons',
      'special': 'special',
      'eskrima': 'eskrima'
    };

    const statusClass = timeStatus.status === 'in-progress' ? 'status-active' : 
                       timeStatus.status === 'starting-soon' ? 'status-soon' : '';

    const statusLabel = timeStatus.status === 'in-progress' ? 'In Progress' :
                       timeStatus.status === 'starting-soon' ? 'Starting Soon' : 'Upcoming';

    return `
      <div class="class-tile ${cls.checkedIn ? 'checked-in' : ''} ${statusClass}" data-class='${JSON.stringify(cls)}'>
        <div class="class-tile-header">
          <div class="class-tile-time">${cls.time}</div>
          <span class="class-tile-badge ${categoryMap[cls.category]}">${cls.program}</span>
        </div>
        <div class="class-tile-body">
          <div class="class-tile-name">${cls.group}</div>
          <div class="class-tile-meta">
            <span class="class-tile-meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
                <path d="M12 7V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              ${cls.duration}
            </span>
            ${studentCount > 0 ? `<span class="class-tile-meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
              </svg>
              ${studentCount}
            </span>` : ''}
            ${helperCount > 0 ? `<span class="class-tile-meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="2"/>
              </svg>
              ${helperCount}
            </span>` : ''}
          </div>
        </div>
        ${!cls.checkedIn ? `
          <div class="class-tile-footer">
            <div class="class-tile-status">
              <span class="status-dot"></span>
              ${statusLabel}
            </div>
            <button class="class-tile-action" data-class-cta>
              Check In
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Get initials from name
   */
  function getInitials(fullname) {
    if (!fullname) return '';
    return fullname
      .trim()
      .split(/\s+/)
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  /**
   * Get avatar color
   */
  function getAvatarColor(index) {
    return AVATAR_COLORS[index % AVATAR_COLORS.length];
  }

  /**
   * Open check-in modal
   */
  function openCheckinModal(classData) {
    selectedClass = classData;
    selectedStudent = null;
    selectedRole = null;
    filteredStudents = [...allStudents];

    const modal = document.getElementById('checkinModal');
    const title = document.getElementById('checkinModalTitle');
    const classInfo = document.getElementById('checkinClassInfo');
    const searchInput = document.getElementById('student-search-input');
    const roleSelection = document.getElementById('role-selection');
    const pinEntry = document.getElementById('pin-entry');
    const success = document.getElementById('checkin-success');

    if (modal && title && classInfo) {
      title.textContent = `Check In for ${classData.group}`;
      classInfo.innerHTML = `
        <h3>${classData.time}</h3>
        <p>${classData.program} • ${classData.duration}</p>
      `;

      // Reset form
      searchInput.value = '';
      roleSelection.style.display = 'none';
      pinEntry.style.display = 'none';
      success.style.display = 'none';
      document.querySelector('.student-search').style.display = 'block';
      document.getElementById('student-list').style.display = 'grid';
      renderStudentTiles();

      modal.classList.add('show');
      modal.setAttribute('aria-hidden', 'false');
      searchInput.focus();
    }
  }

  /**
   * Close check-in modal
   */
  function closeCheckinModal() {
    const modal = document.getElementById('checkinModal');
    if (modal) {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
      selectedClass = null;
      selectedStudent = null;
      selectedRole = null;
      filteredStudents = [...allStudents];
    }
  }

  /**
   * Handle student search
   */
  function handleStudentSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    
    if (query.length === 0) {
      filteredStudents = [...allStudents];
    } else {
      filteredStudents = allStudents.filter(student => 
        student.name.toLowerCase().includes(query)
      );
    }
    
    renderStudentTiles();
  }

  /**
   * Render student tiles
   */
  function renderStudentTiles() {
    const container = document.getElementById('student-list');
    if (!container) return;

    // Sort by last name
    const sorted = [...filteredStudents].sort((a, b) => {
      const lastA = a.name.split(' ').pop();
      const lastB = b.name.split(' ').pop();
      return lastA.localeCompare(lastB);
    });

    if (sorted.length === 0) {
      container.innerHTML = '<p class="text-center muted" style="grid-column: 1/-1;">No students found</p>';
      return;
    }

    container.innerHTML = sorted.slice(0, 24).map((student, index) => {
      const initials = getInitials(student.name);
      const color = getAvatarColor(index);
      
      return `
        <div class="student-tile" data-student-id="${student.id}">
          <div class="student-tile-avatar" style="background-color: ${color}">
            ${initials}
          </div>
          <div class="student-tile-name">${student.name}</div>
          <div class="student-tile-belt">${student.rank}</div>
        </div>
      `;
    }).join('');

    // Add click handlers
    container.querySelectorAll('.student-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        const studentId = tile.dataset.studentId;
        const student = allStudents.find(s => s.id === studentId);
        if (student) {
          selectStudent(student, tile);
        }
      });
    });
  }

  /**
   * Select a student
   */
  function selectStudent(student, tileElement) {
    selectedStudent = student;
    selectedRole = null;
    
    // Remove previous selection
    document.querySelectorAll('.student-tile').forEach(t => t.classList.remove('selected'));
    tileElement.classList.add('selected');

    const canBeHelper = canHelp(student.rank, selectedClass.group);
    const canBeStudent = qualifiesForClass(student.rank, selectedClass.group, selectedClass.category);
    
    // If student can ONLY help (too advanced for class)
    if (canBeHelper && !canBeStudent) {
      selectedRole = 'helper';
      showPinEntry(student);
      return;
    }
    
    // If student can ONLY join as student (not qualified to help)
    if (canBeStudent && !canBeHelper) {
      selectedRole = 'student';
      showPinEntry(student);
      return;
    }
    
    // If student can do BOTH, show role selection
    if (canBeHelper && canBeStudent) {
      showRoleSelection(student);
      return;
    }
    
    // Shouldn't reach here, but default to student
    selectedRole = 'student';
    showPinEntry(student);
  }

  /**
   * Show role selection UI
   */
  function showRoleSelection(student) {
    const roleSelection = document.getElementById('role-selection');
    const selectedInfo = document.getElementById('selected-student-info-role');
    
    const initials = getInitials(student.name);
    const color = getAvatarColor(allStudents.indexOf(student));
    
    selectedInfo.innerHTML = `
      <div class="selected-student-avatar" style="background-color: ${color}">
        ${initials}
      </div>
      <div class="selected-student-details">
        <h4>${student.name}</h4>
        <p>${student.rank}</p>
      </div>
    `;
    
    roleSelection.style.display = 'block';
    
    // Scroll to role selection
    roleSelection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Select a role (student or helper)
   */
  function selectRole(role) {
    selectedRole = role;
    
    // Update button states
    document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelector(`[data-role="${role}"]`)?.classList.add('selected');
    
    // Show PIN entry after short delay
    setTimeout(() => {
      showPinEntry(selectedStudent);
    }, 300);
  }

  /**
   * Show PIN entry screen
   */
  function showPinEntry(student) {
    const pinEntry = document.getElementById('pin-entry');
    const pinInput = document.getElementById('pin-input');
    
    const initials = getInitials(student.name);
    const color = getAvatarColor(allStudents.indexOf(student));
    
    const roleText = selectedRole === 'helper' ? '👋 Joining as Helper' : '🥋 Joining as Student';
    const roleClass = selectedRole === 'helper' ? 'role-helper-badge' : 'role-student-badge';
    
    pinEntry.innerHTML = `
      <div class="selected-student-info mb-4">
        <div class="selected-student-avatar" style="background-color: ${color}">
          ${initials}
        </div>
        <div class="selected-student-details">
          <h4>${student.name}</h4>
          <p>${student.rank}</p>
          <span class="${roleClass}">${roleText}</span>
        </div>
      </div>
      <label for="pin-input" class="form-label">Enter Your 4-Digit PIN</label>
      <input 
        type="password" 
        id="pin-input" 
        class="form-input pin-input" 
        placeholder="••••"
        maxlength="4"
        pattern="[0-9]*"
        inputmode="numeric"
      />
      <p class="text-sm muted mt-2">Don't know your PIN? Ask the front desk.</p>
      <button class="btn mt-4 w-full" id="checkin-submit-btn">Check In</button>
    `;
    
    pinEntry.style.display = 'block';
    
    // Re-attach event listeners
    const newPinInput = document.getElementById('pin-input');
    const newSubmitBtn = document.getElementById('checkin-submit-btn');
    
    newPinInput?.addEventListener('input', handlePinInput);
    newPinInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && newPinInput.value.length === 4) {
        handleCheckin();
      }
    });
    newSubmitBtn?.addEventListener('click', handleCheckin);
    
    newPinInput?.focus();
    
    // Scroll to PIN entry
    pinEntry.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Handle PIN input
   */
  function handlePinInput(e) {
    // Only allow numbers
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
  }

  /**
   * Handle check-in submission
   */
  function handleCheckin() {
    if (!selectedStudent || !selectedClass) return;

    const pin = document.getElementById('pin-input').value;
    if (pin !== selectedStudent.pin) {
      alert('Incorrect PIN. Please try again.');
      document.getElementById('pin-input').value = '';
      return;
    }

    // Create check-in record
    const checkin = {
      id: Date.now().toString(),
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      studentRank: selectedStudent.rank,
      classId: selectedClass.id,
      className: selectedClass.group,
      classProgram: selectedClass.program,
      classTime: selectedClass.time,
      role: selectedRole, // 'student' or 'helper'
      timestamp: new Date().toISOString()
    };

    checkinsData.push(checkin);
    saveCheckinsData();

    // Show success
    showCheckinSuccess(selectedStudent, checkin);

    // Refresh UI after delay
    setTimeout(() => {
      closeCheckinModal();
      renderUpcomingClasses();
      renderRegisteredClasses();
      renderRecentCheckins();
    }, 2500);
  }

  /**
   * Show check-in success
   */
  function showCheckinSuccess(student, checkin) {
    const pinEntry = document.getElementById('pin-entry');
    const roleSelection = document.getElementById('role-selection');
    const studentListDiv = document.getElementById('student-list');
    const searchDiv = document.querySelector('.student-search');
    const success = document.getElementById('checkin-success');
    const studentName = document.getElementById('success-student-name');
    const successMessage = document.getElementById('success-message');
    const stats = document.getElementById('student-stats');

    const todayCheckins = checkinsData.filter(c => 
      c.studentId === student.id && 
      isToday(new Date(c.timestamp))
    );

    const roleEmoji = checkin.role === 'helper' ? '👋' : '🥋';
    const roleText = checkin.role === 'helper' ? 'as a Helper' : 'as a Student';
    
    studentName.textContent = `Great job, ${student.name.split(' ')[0]}!`;
    successMessage.textContent = `You're checked in for ${selectedClass.group} ${roleText} ${roleEmoji}`;

    stats.innerHTML = `
      <div class="stat-item">
        <span class="stat-value">${student.totalClasses || 0}</span>
        <span class="stat-label">Total Classes</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">${todayCheckins.length}</span>
        <span class="stat-label">Today</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">${student.rank.split(' ')[0]}</span>
        <span class="stat-label">Belt</span>
      </div>
    `;

    pinEntry.style.display = 'none';
    roleSelection.style.display = 'none';
    studentListDiv.style.display = 'none';
    searchDiv.style.display = 'none';
    success.style.display = 'block';
  }

  /**
   * Render recent check-ins
   */
  function renderRecentCheckins() {
    const container = document.getElementById('recent-checkins');
    if (!container) return;

    const todayCheckins = checkinsData.filter(c => isToday(new Date(c.timestamp)));

    if (todayCheckins.length === 0) {
      container.innerHTML = '<p class="text-center muted">No check-ins yet today.</p>';
      return;
    }

    // Sort by most recent
    todayCheckins.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    container.innerHTML = todayCheckins.slice(0, 12).map(checkin => {
      const initials = getInitials(checkin.studentName);
      const time = new Date(checkin.timestamp).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      });
      
      const roleEmoji = checkin.role === 'helper' ? '👋' : '🥋';
      const roleClass = checkin.role === 'helper' ? 'role-helper-badge' : 'role-student-badge';
      const roleName = checkin.role === 'helper' ? 'Helper' : 'Student';

      return `
        <div class="checkin-item">
          <div class="checkin-avatar">${initials}</div>
          <div class="checkin-item-details">
            <div class="checkin-item-name">${checkin.studentName}</div>
            <div class="checkin-item-meta">
              <span class="checkin-item-belt">${checkin.studentRank}</span>
              <span class="${roleClass}">${roleEmoji} ${roleName}</span>
            </div>
          </div>
          <div class="checkin-item-time">${time}</div>
        </div>
      `;
    }).join('');
  }

  /**
   * Check if date is today
   */
  function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  /**
   * Render registered classes
   */
  function renderRegisteredClasses() {
    const container = document.getElementById('registered-classes');
    if (!container) return;

    // Get user's registrations (check-ins that are in the future or today)
    const userId = JSON.parse(localStorage.getItem('taskkarate_user') || '{}').id;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const registrations = checkinsData.filter(c => {
      const checkinDate = new Date(c.timestamp);
      checkinDate.setHours(0, 0, 0, 0);
      return c.studentId === userId && checkinDate >= now;
    });

    if (registrations.length === 0) {
      container.innerHTML = '<p class="text-center muted">You haven\'t registered for any classes yet.</p>';
      return;
    }

    // Sort by date/time
    registrations.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    container.innerHTML = registrations.map(reg => {
      const date = new Date(reg.timestamp);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const categoryMap = {
        'kids': 'kids',
        'teensAdults': 'teens-adults',
        'sparring': 'sparring',
        'weapons': 'weapons',
        'special': 'special',
        'eskrima': 'eskrima'
      };
      
      const category = reg.classProgram ? categoryMap[reg.classProgram.toLowerCase().replace(/ /g, '')] || 'kids' : 'kids';
      
      return `
        <div class="registered-class-card">
          <div class="registered-class-header">
            <div class="registered-class-date">${dateStr}</div>
            <span class="registered-class-badge class-tile-badge ${category}">${reg.classProgram || 'Class'}</span>
          </div>
          <div class="registered-class-body">
            <div class="registered-class-name">${reg.className}</div>
            <div class="registered-class-time">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
                <path d="M12 7V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              ${reg.classTime} • ${reg.classDay || 'TBD'}
            </div>
          </div>
          <div class="registered-class-footer">
            <button class="cancel-registration-btn" data-checkin-id="${reg.id}">
              Cancel Registration
            </button>
            <div class="registered-class-role ${reg.role === 'helper' ? 'helper' : ''}">
              ${reg.role === 'helper' ? '👋 Helper' : '🥋 Student'}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Add cancel handlers
    container.querySelectorAll('.cancel-registration-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const checkinId = btn.dataset.checkinId;
        cancelRegistration(checkinId);
      });
    });
  }

  /**
   * Cancel a registration
   */
  function cancelRegistration(checkinId) {
    if (!confirm('Are you sure you want to cancel this registration?')) {
      return;
    }

    // Remove from checkinsData
    checkinsData = checkinsData.filter(c => c.id !== checkinId);
    saveCheckinsData();

    // Refresh displays
    renderRegisteredClasses();
    renderUpcomingClasses();
    renderRecentCheckins();
  }

  /**
   * Convert 12-hour time to 24-hour for sorting
   */
  function convertTo24Hour(time) {
    const [timePart, period] = time.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  /**
   * Show error message
   */
  function showError(message) {
    const container = document.getElementById('classes-list');
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <h3>Error</h3>
          <p class="muted">${message}</p>
        </div>
      `;
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
