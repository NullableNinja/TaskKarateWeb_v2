<script>
  import { onMount, onDestroy } from 'svelte';
  import { activeStudent, activeStudentKpis } from '$lib/stores/students.js';
  import IconSet from './IconSet.svelte';
  import Feed from './Feed.svelte';
  import TipOfTheDay from './TipOfTheDay.svelte';

  let student = null;
  $: student = $activeStudent;

  const STATUS_HUD_ITEM_DEFS = {
    trainingGoals: { id: 'trainingGoals', label: 'Training Goals', iconClass: 'icon-chart', value: (s) => s.funStats?.trainingGoals ?? 0 },
    highFives: { id: 'highFives', label: 'Fist Bumps Given', iconClass: 'icon-celebration', value: (s) => s.funStats?.highFives ?? 0 },
    dojoFriends: { id: 'dojoFriends', label: 'Dojo Buddies', iconClass: 'icon-users', value: (s) => (Array.isArray(s.buddies) ? s.buddies.length : 0) },
    formsMastered: { id: 'formsMastered', label: 'Forms Concored', iconClass: 'icon-trophy', value: (s) => s.funStats?.formsMastered ?? 0 },
    classesThisMonth: { id: 'classesThisMonth', label: 'Classes This Month', iconClass: 'icon-calendar', value: (s) => {
      const now = new Date();
      const m = now.getMonth();
      const y = now.getFullYear();
      const dates = Array.isArray(s.attendanceDates) ? s.attendanceDates : [];
      return dates.filter(d => { const dt = new Date(d); return !isNaN(dt) && dt.getMonth() === m && dt.getFullYear() === y; }).length;
    }},
    lastClass: { id: 'lastClass', label: 'Last Class', iconClass: 'icon-chart', value: (s) => {
      if (!s.lastClassDate) return 'Unknown';
      const last = new Date(s.lastClassDate);
      if (isNaN(last)) return 'Unknown';
      const days = Math.floor((Date.now() - last.getTime()) / 86400000);
      return days === 0 ? 'Today' : `${days}d`;
    }},
    totalClasses: { id: 'totalClasses', label: 'Total Classes', iconClass: 'icon-calendar', value: (s) => s.totalClasses ?? 0 }
  };

  // Map HUD item IDs to IconSet icon names
  const ICON_ID_MAP = {
    trainingGoals: 'target',
    highFives: 'heart',
    dojoFriends: 'people',
    formsMastered: 'trophy',
    classesThisMonth: 'calendar',
    lastClass: 'chart',
    totalClasses: 'calendar'
  };

  function getHudItem(tileId, student) {
    const def = STATUS_HUD_ITEM_DEFS[tileId];
    if (!def || !student) return null;
    const rawValue = typeof def.value === 'function' ? def.value(student) : def.value;
    const displayValue = rawValue === undefined || rawValue === null ? '—' : rawValue;
    return { ...def, value: displayValue };
  }

  function calculateProgressPercent(s) {
    if (!s) return 0;
    // Check if Black Belt (degree system)
    const isBlackBelt = (s.rank || '').toLowerCase().includes('black') || (s.rank || '').toLowerCase().includes('degree');
    if (s.rankType === 'degree' || isBlackBelt) {
      // Degrees: 1 year per degree by default
      const per = s.yearsRequired || 1;
      const done = s.yearsAtRank || 0;
      if (per === 0) return 0;
      return Math.min(100, Math.max(0, (done / per) * 100));
    } else {
      // Stripes: 8 classes per stripe until brown (then 12)
      let per = s.classesPerStripe;
      if (!per || per <= 0) {
        const isBrown = (s.rank || '').toLowerCase().includes('brown');
        per = isBrown ? 12 : 8;
      }
      // Derive classes since current stripe using attendance after beltSince
      let done = s.classesSinceStripe || 0;
      try {
        if (s.beltSince && Array.isArray(s.attendanceDates)) {
          const since = new Date(s.beltSince);
          if (!isNaN(since.getTime())) {
            const count = s.attendanceDates.filter(d => {
              const dt = new Date(d);
              return !isNaN(dt.getTime()) && dt >= since;
            }).length;
            done = count % per;
          }
        }
      } catch (_) {}
      if (per === 0) return 0;
      return Math.min(100, Math.max(0, (done / per) * 100));
    }
  }

  function getProgressText(s) {
    if (!s) return '';
    // Check if Black Belt (degree system)
    const isBlackBelt = (s.rank || '').toLowerCase().includes('black') || (s.rank || '').toLowerCase().includes('degree');
    if (s.rankType === 'degree' || isBlackBelt) {
      // Degrees: 1 year per degree by default
      const per = s.yearsRequired || 1;
      const done = s.yearsAtRank || 0;
      const remaining = (per - done).toFixed(1);
      return remaining <= 0 ? 'Eligible for next degree review' : `${remaining} years until next degree`;
    } else {
      // Stripes: 8 classes per stripe until brown (then 12)
      let per = s.classesPerStripe;
      if (!per || per <= 0) {
        const isBrown = (s.rank || '').toLowerCase().includes('brown');
        per = isBrown ? 12 : 8;
      }
      // Derive classes since current stripe using attendance after beltSince
      let done = s.classesSinceStripe || 0;
      try {
        if (s.beltSince && Array.isArray(s.attendanceDates)) {
          const since = new Date(s.beltSince);
          if (!isNaN(since.getTime())) {
            const count = s.attendanceDates.filter(d => {
              const dt = new Date(d);
              return !isNaN(dt.getTime()) && dt >= since;
            }).length;
            done = count % per;
          }
        }
      } catch (_) {}
      const remaining = per - done;
      return remaining <= 0 ? 'Ready for next stripe!' : `${remaining} classes until next stripe`;
    }
  }

  function getBeltColorFromRank(rank) {
    if (!rank || typeof rank !== 'string') return '#64748b';
    const r = rank.toLowerCase();
    if (r.includes('white')) return '#e5e7eb';
    if (r.includes('yellow')) return '#facc15';
    if (r.includes('orange')) return '#fb923c';
    if (r.includes('green')) return '#22c55e';
    if (r.includes('blue')) return '#3b82f6';
    if (r.includes('purple')) return '#a855f7';
    if (r.includes('red')) return '#ef4444';
    if (r.includes('brown')) return '#92400e';
    if (r.includes('black') || r.includes('degree')) return '#020617';
    return '#64748b';
  }

  function getIs3Color(level) {
    if (!level) return '#56679a';
    if (level >= 12) return '#5f2a88';
    if (level >= 9) return '#3e3370';
    if (level >= 6) return '#3b4f7a';
    if (level >= 4) return '#56679a';
    return '#56679a';
  }

  function getIs3Medallion(level) {
    if (!level) return null;
    if (level >= 12) return 'diamond';
    if (level >= 9) return 'gold';
    if (level >= 6) return 'silver';
    if (level >= 3) return 'bronze';
    return null;
  }

  function getMedallionSvg(type) {
    switch (type) {
      case 'bronze': return `<svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\"><circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"#cd7f32\" stroke=\"#8b4e1e\" stroke-width=\"2\"/></svg>`;
      case 'silver': return `<svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\"><circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"#c0c0c0\" stroke=\"#7a7a7a\" stroke-width=\"2\"/></svg>`;
      case 'gold': return `<svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\"><circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"#ffd700\" stroke=\"#b08b00\" stroke-width=\"2\"/></svg>`;
      case 'diamond': return `<svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\"><path d=\"M12 2 L20 9 L12 22 L4 9 Z\" fill=\"#ffffff\"/></svg>`;
      default: return '';
    }
  }

  $: progressPercent = calculateProgressPercent(student);
  $: progressText = getProgressText(student);
  $: classesPerStripe = (() => {
    if (!student) return 0;
    if (student.classesPerStripe && student.classesPerStripe > 0) return student.classesPerStripe;
    const isBrown = (student.rank || '').toLowerCase().includes('brown');
    return isBrown ? 12 : 8;
  })();
  $: classesSinceStripe = (() => {
    if (!student) return 0;
    let done = student.classesSinceStripe || 0;
    try {
      if (student.beltSince && Array.isArray(student.attendanceDates)) {
        const since = new Date(student.beltSince);
        if (!isNaN(since.getTime())) {
          const count = student.attendanceDates.filter(d => {
            const dt = new Date(d);
            return !isNaN(dt.getTime()) && dt >= since;
          }).length;
          done = count % classesPerStripe;
        }
      }
    } catch (_) {}
    return done;
  })();
  $: initials = (student?.displayName || student?.name || '').split(' ').map(n => n[0] || '').join('').toUpperCase();
  $: isInstructor = student?.roles?.includes('instructor');
  $: isAssistant = student?.roles?.includes('assistant');
  $: userRoleText = isInstructor ? 'Instructor' : isAssistant ? 'Assistant Instructor' : 'Student';
  $: is3Level = student?.is3Level ?? 0;
  $: is3Medal = getIs3Medallion(is3Level);
  $: is3MedalSvg = is3Medal ? getMedallionSvg(is3Medal) : '';
  $: is3Color = getIs3Color(is3Level);
  $: beltColor = getBeltColorFromRank(student?.rank);
  $: badges = Array.isArray(student?.badges) ? student.badges : [];

  // subscribe to derived KPIs store so other components can reuse logic
  let kpis = {};
  const _kpisUnsub = activeStudentKpis.subscribe(v => { kpis = v || {}; });
  onDestroy(() => { try { _kpisUnsub(); } catch (e) {} });

  // Derived KPIs (computed from student record)
  $: unreadMessages = Array.isArray(student?.messages) ? student.messages.filter(m => m.toId === student.id && !m.read).length : 0;
  $: badgesCount = badges.length;
  $: badgesByLevel = badges.reduce((acc, b) => { const lvl = b.level || 'Unknown'; acc[lvl] = (acc[lvl] || 0) + 1; return acc; }, {});
  $: assignmentsDue = Array.isArray(student?.assignments) ? student.assignments.filter(a => a.due).length : 0;
  $: practiceCount = Array.isArray(student?.practice) ? student.practice.length : 0;
  $: daysSinceLastClass = (() => {
    if (!student?.lastClassDate) return null;
    const last = new Date(student.lastClassDate);
    if (isNaN(last.getTime())) return null;
    return Math.floor((Date.now() - last.getTime()) / 86400000);
  })();

  function formatDaysSince(d) {
    if (d === null) return 'Unknown';
    if (d === 0) return 'Today';
    return `${d}d`;
  }

  let showBirthday = false;
  let confettiTriggered = false;
  
  function isTodayBirthday(dateString) {
    if (!dateString) {
      console.log('Birthday check: no dateString provided');
      return false;
    }
    try {
      const today = new Date();
      
      // Parse birthday as local date (not UTC) to avoid timezone issues
      // Format: YYYY-MM-DD
      const parts = dateString.split('-');
      if (parts.length !== 3) {
        console.error('Invalid date format:', dateString);
        return false;
      }
      
      const birthdayMonth = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const birthdayDay = parseInt(parts[2], 10);
      
      console.log('Birthday check:', {
        dateString,
        today: today.toISOString(),
        todayMonth: today.getMonth(),
        todayDate: today.getDate(),
        birthdayMonth: birthdayMonth,
        birthdayDay: birthdayDay
      });
      
      // Compare month and day only (ignore year)
      const isMatch = today.getMonth() === birthdayMonth && 
             today.getDate() === birthdayDay;
      
      console.log('Birthday match result:', isMatch);
      return isMatch;
    } catch (e) {
      console.error('Birthday parse error:', e);
      return false;
    }
  }

  function triggerConfetti() {
    console.log('triggerConfetti called');
    if (typeof window === 'undefined') {
      console.log('Window undefined, skipping confetti');
      return;
    }
    const root = document.getElementById('fx-root');
    if (!root) {
      console.warn('fx-root not found for confetti');
      return;
    }
    
    console.log('Creating confetti animation...');
    
    // Clear any existing confetti
    root.innerHTML = '';
    
    // Paper-Fu confetti colors
    const colors = ['#facc15', '#38bdf8', '#22c55e', '#ef4444', '#a855f7', '#fb923c'];
    
    // Create 60 confetti pieces for a fuller effect
    for (let i = 0; i < 60; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      confetti.style.position = 'absolute';
      confetti.style.borderRadius = '50%';
      confetti.style.pointerEvents = 'none';
      
      // Random position across the top
      const startX = Math.random() * 100;
      confetti.style.left = startX + '%';
      confetti.style.top = '-20px';
      
      // Random size
      const size = 8 + Math.random() * 8;
      confetti.style.width = size + 'px';
      confetti.style.height = size + 'px';
      
      // Random color
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      
      // Random rotation and animation delay
      const delay = Math.random() * 500;
      const duration = 2000 + Math.random() * 2000;
      const endX = startX + (Math.random() - 0.5) * 40;
      const rotation = Math.random() * 720 - 360;
      
      confetti.style.animation = `confettiFall ${duration}ms ease-out ${delay}ms forwards`;
      confetti.style.setProperty('--end-x', endX + '%');
      confetti.style.setProperty('--rotation', rotation + 'deg');
      
      root.appendChild(confetti);
      
      // Remove after animation
      setTimeout(() => confetti.remove(), duration + delay + 100);
    }
    
    console.log('Confetti created: 60 pieces');
  }

  $: if (student && !confettiTriggered) {
    console.log('Checking birthday for student:', student.name, student.birthday);
    if (isTodayBirthday(student.birthday)) {
      showBirthday = true;
      confettiTriggered = true;
      // Delay confetti slightly for better effect
      setTimeout(() => triggerConfetti(), 300);
    } else {
      showBirthday = false;
    }
  }

  // Attendance heatmap data (last 30 days)
  $: attendanceDatesSet = new Set((kpis.attendanceDates || student?.attendanceDates || []).map(d => (d || '').toString().slice(0,10)));
  $: attendanceLast30 = (() => {
    const out = [];
    const days = 30;
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0,10);
      out.push({ date: key, short: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), weekday: d.getDay(), present: attendanceDatesSet.has(key) });
    }
    return out;
  })();

  onMount(() => {});
</script>

<section class="status-root">
  {#if showBirthday}
    <div class="birthday-callout">🎉 Happy Birthday, {student?.name?.split(' ')[0] || 'there'}!</div>
  {/if}

  <header class="status-header">
    <span class="eyebrow">Student Portal</span>
    <h2>Status Dashboard</h2>
  </header>

  <!-- Tip of the Day -->
  <TipOfTheDay />

  <!-- KPI row: quick actionable metrics -->
  <div class="kpi-row">
    {#if !((student?.rank || '').toLowerCase().includes('black') || (student?.rank || '').toLowerCase().includes('degree'))}
      <div class="kpi-item kpi-progress">
        <div class="kpi-label">Next Stripe</div>
        <div class="kpi-value">{Math.round(progressPercent)}%</div>
        <div class="kpi-sub">{progressText}</div>
      </div>
    {/if}

    <div class="kpi-item">
      <div class="kpi-label">Classes This Month</div>
      <div class="kpi-value">{(() => {
        const now = new Date();
        const m = now.getMonth();
        const y = now.getFullYear();
        const dates = Array.isArray(student?.attendanceDates) ? student.attendanceDates : [];
        return dates.filter(d => { const dt = new Date(d); return !isNaN(dt) && dt.getMonth() === m && dt.getFullYear() === y; }).length;
      })()}</div>
    </div>

    <div class="kpi-item">
      <div class="kpi-label">Total Classes</div>
      <div class="kpi-value">{student?.totalClasses ?? 0}</div>
    </div>

    <div class="kpi-item">
      <div class="kpi-label">Unread Messages</div>
      <div class="kpi-value">{kpis.unreadMessages ?? unreadMessages}</div>
    </div>

    <div class="kpi-item">
      <div class="kpi-label">Badges Earned</div>
      <div class="kpi-value">{kpis.badgesCount ?? badgesCount}</div>
      <div class="kpi-sub">{(kpis.badgesByLevel?.Bronze||badgesByLevel.Bronze||0)}B • {(kpis.badgesByLevel?.Silver||badgesByLevel.Silver||0)}S • {(kpis.badgesByLevel?.Gold||badgesByLevel.Gold||0)}G</div>
    </div>

    <div class="kpi-item">
      <div class="kpi-label">Days Since Last Class</div>
      <div class="kpi-value">{formatDaysSince(kpis.daysSinceLastClass ?? daysSinceLastClass)}</div>
    </div>
  </div>

  <!-- Main dashboard panels: single responsive grid to avoid gaps -->
  <div class="status-panels">
    <section class="panel quick-actions-panel">
      <h3 class="panel-title">Quick Actions</h3>
      <div class="actions-grid compact">
        <button class="qa-btn" type="button" on:click={() => (window && window.scrollTo(0,0))}>View Profile</button>
        <button class="qa-btn" type="button" on:click={() => import('$lib/stores/ui.js').then(m=>m.activeTab.set('messages'))}>Open Social</button>
        <button class="qa-btn" type="button" on:click={() => import('$lib/stores/ui.js').then(m=>m.activeTab.set('training'))}>Start Training</button>
      </div>
    </section>

    {#if !((student?.rank || '').toLowerCase().includes('black') || (student?.rank || '').toLowerCase().includes('degree'))}
    <section class="panel status-progress-panel">
      <h3 class="panel-title">Stripe Progress</h3>
      <div class="heatbar" aria-label="Stripe progress heatbar">
        {#each Array.from({ length: classesPerStripe }) as _, i}
          {@const filled = i < classesSinceStripe}
          {@const ratio = classesPerStripe > 1 ? i / (classesPerStripe - 1) : 1}
          {@const hue = Math.round(0 + 120 * ratio)}
          <div class={`heat-seg ${filled ? 'is-filled' : ''}`} style={`--h:${hue};`} title={`Class ${i+1} of ${classesPerStripe}`}></div>
        {/each}
      </div>
      <p class="status-progress-text">{progressText}</p>
      <div class="status-progress-meta">
        <div><span class="meta-label">Classes since stripe</span><span class="meta-value">{classesSinceStripe}</span></div>
        <div><span class="meta-label">Per stripe</span><span class="meta-value">{classesPerStripe}</span></div>
      </div>
    </section>
    {/if}

    <section class="panel goals-panel">
      <h3 class="panel-title">Goals</h3>
      <div class="status-quick-grid">
        <article class="status-strip"><span class="status-strip-label">Training Goals</span><span class="status-strip-value">{student?.funStats?.trainingGoals ?? 0}</span></article>
        <article class="status-strip"><span class="status-strip-label">Practice Items</span><span class="status-strip-value">{kpis.practiceCount ?? 0}</span></article>
        <article class="status-strip status-strip--highlight"><span class="status-strip-label">Assignments Due</span><span class="status-strip-value">{kpis.assignmentsDue ?? 0}</span></article>
      </div>
    </section>

    <section class="panel records-panel">
      <h3 class="panel-title">Personal Records</h3>
      <div class="status-quick-grid">
        <article class="status-strip"><span class="status-strip-label">Current Rank</span><span class="status-strip-value">{student?.rank || '—'}</span></article>
        <article class="status-strip"><span class="status-strip-label">Total Classes</span><span class="status-strip-value">{student?.totalClasses ?? 0}</span></article>
        <article class="status-strip"><span class="status-strip-label">Member Since</span><span class="status-strip-value">{student?.joinDate || '—'}</span></article>
      </div>
    </section>
  </div>

  <!-- Bottom panels -->
  <div class="status-bottom-panels">
    <section class="panel status-hud-panel">
      <h3 class="panel-title">Upcoming Events</h3>
      <div class="events-grid">
        {#if Array.isArray(student?.goldStars) && student.goldStars.length > 0}
          {#each student.goldStars.slice(0,3) as ev}
            <div class="event-card">
              <div class="event-title">{ev.event}</div>
              <div class="event-meta">{ev.date} • {ev.location}</div>
              {#if ev.note}<div class="event-summary">{ev.note}</div>{/if}
            </div>
          {/each}
        {:else}
          <p class="muted">No upcoming events listed.</p>
        {/if}
      </div>
    </section>

    <section class="panel achievements-panel">
      <h3 class="panel-title">Achievements</h3>
      {#if badges.length}
        <div class="status-achievements-row">{#each badges.slice(0,6) as badge}
          <article class="badge-card">
            <div class="badge-medal">{(badge.level||'?').charAt(0)}</div>
            <div class="badge-body">
              <div class="badge-name">{badge.name}</div>
              {#if badge.description}<p class="badge-description">{badge.description}</p>{/if}
            </div>
          </article>
        {/each}</div>
      {:else}
        <p class="muted">No achievements yet… but your next class could unlock one!</p>
      {/if}
    </section>

    <section class="panel attendance-panel">
      <h3 class="panel-title">Attendance (Last 30 days)</h3>
      <div class="attendance-heatmap">
        {#each attendanceLast30 as day}
          <div class={`heatday ${day.present ? 'present' : ''}`} title={`${day.date} • ${day.present ? 'Present' : 'Absent'}`}></div>
        {/each}
      </div>
      <div class="attendance-legend"><span class="legend-dot present"></span> Present • <span class="legend-dot"></span> Absent</div>
    </section>
  </div>
  
  <!-- Activity Feed (friends progress) embedded on Status page -->
  <Feed />
</section>

<style>
  /* Root container */
  .status-root {
    padding: 20px;
    color: var(--text-main, #e5e7eb);
  }

  /* Header section */
  .status-header {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 10px;
  }

  .eyebrow {
    display: inline-block;
    background: rgba(56, 189, 248, 0.15);
    color: #38bdf8;
    font-weight: 700;
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: 6px;
    border: 1px solid rgba(56, 189, 248, 0.3);
    align-self: flex-start;
  }

  .status-header h2 {
    margin: 0;
    font-family: var(--font-title, 'Bebas Neue', sans-serif);
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--text-main, #e5e7eb);
  }

  /* Quick Actions */
  .quick-actions-panel { margin-bottom: 0; }
  .actions-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
  .actions-grid.compact { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .qa-btn {
    display: inline-block;
    text-align: center;
    padding: 8px 10px;
    border-radius: 10px;
    background: rgba(56, 189, 248, 0.12);
    color: #38bdf8;
    font-weight: 700;
    border: 1px solid rgba(56, 189, 248, 0.3);
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
  }
  .qa-btn:hover { transform: translateY(-2px); filter: brightness(1.05); }

  /* Single grid layout for top/mid panels */
  .status-panels {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    grid-auto-flow: dense;
    align-items: start;
    gap: 18px;
    margin-bottom: 20px;
  }

  .status-sub {
    color: var(--text-muted, #9ca3af);
    font-size: 0.9rem;
  }

  /* Fun facts strip (quick stats at top) */
  .funstrip-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
    margin-bottom: 24px;
  }

  .funstrip-chip {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    padding: 12px 14px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 14px;
    border: 1px solid rgba(148, 163, 184, 0.15);
    text-align: center;
    transition: all 0.2s ease;
  }

  .funstrip-chip:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(56, 189, 248, 0.3);
    transform: translateY(-2px);
  }

  /* KPI row */
  .kpi-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 12px;
    margin: 12px 0 20px 0;
  }

  .kpi-item {
    padding: 16px 18px;
    border-radius: 14px;
    background: rgba(15, 23, 42, 0.9);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(148, 163, 184, 0.3);
    display: flex;
    flex-direction: column;
    gap: 6px;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    text-align: left;
  }

  .kpi-item::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #3b82f6, #38bdf8, #22c55e);
    opacity: 0;
    transition: opacity 0.25s ease;
  }

  .kpi-item:hover {
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.6) 100%);
    border-color: rgba(56, 189, 248, 0.4);
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(56, 189, 248, 0.15);
  }

  .kpi-item:hover::before {
    opacity: 0.6;
  }

  .kpi-label {
    font-size: 0.72rem;
    color: var(--text-muted, #9ca3af);
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  .kpi-value {
    font-size: 1.4rem;
    font-weight: 800;
    color: var(--text-main, #e5e7eb);
    margin-top: 6px;
  }

  .kpi-sub {
    margin-top: 6px;
    font-size: 0.78rem;
    color: var(--text-muted, #9ca3af);
  }

  .kpi-progress .kpi-value { color: #38bdf8 }

  .funstrip-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-main, #e5e7eb);
  }

  .funstrip-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .funstrip-label {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--text-muted, #9ca3af);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .funstrip-value {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-main, #e5e7eb);
  }

  /* Removed old two-column status-panels definition */

  /* Left column for stacked panels */
  .dashboard-col {
    display: grid;
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .panel {
    padding: 20px;
    border-radius: 16px;
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(148, 163, 184, 0.3);
    box-shadow: 
      0 8px 20px rgba(0, 0, 0, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
    position: relative;
    z-index: 1;
    transition: all 0.25s ease;
  }

  .panel::before {
    content: "";
    position: absolute;
    top: 10px;
    left: 10px;
    right: -10px;
    bottom: -10px;
    background: rgba(8, 15, 30, 0.92);
    border-radius: 16px;
    z-index: -1;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.7);
    border: 1px solid rgba(71, 85, 105, 0.35);
  }

  .panel:hover {
    border-color: rgba(56, 189, 248, 0.4);
    transform: translateY(-4px);
    box-shadow: 
      0 14px 32px rgba(0, 0, 0, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.12);
  }

  /* Profile card */
  .profile-top {
    display: flex;
    gap: 14px;
    align-items: center;
    margin-bottom: 14px;
  }

  .profile-avatar {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--tk-blue, #38bdf8), #0ea5e9);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.4rem;
    color: #0f172a;
    flex-shrink: 0;
  }

  .profile-info {
    flex: 1;
    min-width: 0;
  }

  .profile-name {
    margin: 0 0 4px 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-main, #e5e7eb);
  }

  .profile-role {
    margin: 0;
    font-size: 0.85rem;
    color: var(--text-muted, #9ca3af);
  }

  .rank-pill-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .rank-value-pill {
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 600;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }

  /* Panel titles (h3) */
  .panel-title {
    margin: 0 0 12px 0;
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-main, #e5e7eb);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .status-quick-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .status-strip {
    padding: 12px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(148, 163, 184, 0.1);
    text-align: center;
    transition: all 0.2s ease;
  }

  .status-strip:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(56, 189, 248, 0.2);
  }

  .status-strip--highlight {
    background: rgba(56, 189, 248, 0.08);
    border-color: rgba(56, 189, 248, 0.3);
  }

  .status-strip-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-muted, #9ca3af);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 6px;
  }

  .status-strip-value {
    display: block;
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--text-main, #e5e7eb);
  }

  /* Rank progress panel → compact heatbar */
  .heatbar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(10px, 1fr));
    gap: 6px;
    padding: 8px;
    background: rgba(2,6,23,0.6);
    border: 1px solid rgba(148,163,184,0.25);
    border-radius: 10px;
  }

  .heat-seg {
    height: 12px;
    border-radius: 4px;
    background: rgba(148,163,184,0.18);
    border: 1px solid rgba(148,163,184,0.18);
  }

  .heat-seg.is-filled {
    background: hsl(var(--h, 120), 85%, 48%);
    border-color: hsla(var(--h, 120), 85%, 48%, 0.6);
  }

  .status-progress-text {
    margin: 0 0 12px 0;
    font-size: 0.95rem;
    color: var(--text-main, #e5e7eb);
    font-weight: 500;
  }

  .status-progress-meta {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    padding-top: 12px;
    border-top: 1px solid rgba(148, 163, 184, 0.1);
  }

  .status-progress-meta > div {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .meta-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-muted, #9ca3af);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .meta-value {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-main, #e5e7eb);
  }

  /* Bottom panels */
  .status-bottom-panels {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 18px;
  }

  /* Events grid */
  .events-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 12px;
  }

  .hud-chip {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(148, 163, 184, 0.1);
    text-align: center;
    transition: all 0.2s ease;
  }

  .hud-chip:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(56, 189, 248, 0.2);
    transform: translateY(-2px);
  }

  .hud-chip-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-main, #e5e7eb);
  }

  .hud-chip-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
  }

  .hud-chip-label {
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--text-muted, #9ca3af);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    line-height: 1.2;
  }

  .hud-chip-value {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-main, #e5e7eb);
  }

  /* Event cards */
  .event-card {
    padding: 12px;
    border-radius: 12px;
    background: rgba(15, 23, 42, 0.9);
    border: 1px solid rgba(148, 163, 184, 0.25);
  }
  .event-title { font-weight: 800; }
  .event-meta { font-size: 0.8rem; color: var(--text-muted, #9ca3af); }
  .event-summary { font-size: 0.9rem; }

  /* Achievements section */
  .status-achievements-row {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }

  .badge-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 16px;
    border-radius: 14px;
    background: rgba(15, 23, 42, 0.9);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(148, 163, 184, 0.3);
    text-align: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }
  
  .badge-card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at top, rgba(251, 191, 36, 0.1) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .badge-card:hover {
    background: rgba(15, 23, 42, 0.95);
    border-color: rgba(251, 191, 36, 0.4);
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 12px 28px rgba(251, 191, 36, 0.2);
  }
  
  .badge-card:hover::before {
    opacity: 1;
  }

  .badge-medal {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f97316, #fbbf24);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.4rem;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    border: 2px solid rgba(251, 191, 36, 0.3);
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
    transition: transform 0.3s ease;
  }
  
  .badge-card:hover .badge-medal {
    transform: rotateY(180deg) scale(1.08);
    filter: drop-shadow(0 6px 12px rgba(251,191,36,0.35));
  }

  .badge-body {
    flex: 1;
  }

  .badge-name {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--text-main, #e5e7eb);
    margin-bottom: 4px;
  }

  .badge-description {
    margin: 0;
    font-size: 0.7rem;
    color: var(--text-muted, #9ca3af);
    line-height: 1.3;
    opacity: 0;
    max-height: 0;
    transition: opacity 0.2s ease, max-height 0.2s ease;
  }

  .badge-card:hover .badge-description {
    opacity: 1;
    max-height: 80px;
  }

  /* Attendance heatmap */
  .attendance-heatmap {
    display: grid;
    grid-template-columns: repeat(15, 1fr);
    gap: 6px;
    margin-top: 8px;
  }

  .heatday {
    width: 18px;
    height: 18px;
    border-radius: 4px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(148,163,184,0.06);
  }

  .heatday.present {
    background: linear-gradient(135deg, rgba(56,189,248,0.16), rgba(34,197,94,0.12));
    border-color: rgba(56,189,248,0.25);
  }

  .attendance-legend {
    margin-top: 8px;
    font-size: 0.8rem;
    color: var(--text-muted, #9ca3af);
  }

  .legend-dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 2px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(148,163,184,0.06);
    vertical-align: middle;
    margin: 0 6px 0 6px;
  }

  .legend-dot.present { background: linear-gradient(135deg,#38bdf8,#22c55e); border-color: rgba(56,189,248,0.25); }

  /* Utility */
  .muted {
    color: var(--text-muted, #9ca3af);
    font-style: italic;
    padding: 20px;
    text-align: center;
  }
</style>
