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
      renderUpcomingClasses();
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
    const container = document.getElementById('classes-list');
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

    container.innerHTML = upcomingClasses.map(cls => createClassCard(cls, now)).join('');

    // Add click handlers
    container.querySelectorAll('.class-card:not(.checked-in)').forEach(card => {
      const classData = JSON.parse(card.dataset.class);
      card.addEventListener('click', () => openCheckinModal(classData));
    });
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
