<script>
  import { activeStudent } from "$lib/stores/students.js";
  import TrainingSessionModal from '$lib/components/TrainingSessionModal.svelte';

  let schedule = [];
  let history = [];

  $: if ($activeStudent) {
    schedule = Array.isArray($activeStudent.schedule) ? $activeStudent.schedule : [];
    history = Array.isArray($activeStudent.classHistory) ? $activeStudent.classHistory : [];
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function formatTime(timeStr) {
    if (!timeStr) return '';
    return timeStr;
  }

  function getDayName(dayNum) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNum] || '';
  }

  let showSession = false;
  let sessionItem = null;

  function openSession(item) {
    sessionItem = item;
    showSession = true;
  }
  function closeSession() {
    showSession = false;
    sessionItem = null;
  }
</script>

<section class="training-root">
  <header class="training-header">
    <h2>Training</h2>
    <p class="training-subtitle">Your class schedule and training history</p>
  </header>

  <div class="training-content">
    <div class="training-funstrip">
      <div class="fun-chip"><div class="fun-label">Forms Mastered</div><div class="fun-value">{($activeStudent?.funStats?.formsMastered) ?? 0}</div></div>
      <div class="fun-chip"><div class="fun-label">Classes This Month</div><div class="fun-value">{($activeStudent?.attendanceDates || []).filter(d => { const dt = new Date(d); const now=new Date(); return !isNaN(dt) && dt.getMonth()===now.getMonth() && dt.getFullYear()===now.getFullYear(); }).length}</div></div>
      <div class="fun-chip"><div class="fun-label">Practice Days</div><div class="fun-value">{($activeStudent?.funStats?.practiceDays) ?? 0}</div></div>
    </div>

    <!-- Session Launcher -->
    <div class="training-section">
      <h3 class="section-title">Session Launcher</h3>
      {#if Array.isArray($activeStudent?.practiceItems) && $activeStudent.practiceItems.length}
        <div class="launcher-grid">
          {#each $activeStudent.practiceItems.slice(0,6) as item}
            <article class="launcher-card">
              <div class="launcher-title">{item.name || 'Practice Item'}</div>
              <div class="launcher-heatbar">
                {#each Array.from({ length: (item.steps || 8) }) as _, i}
                  <div class={`heat-seg ${i < (item.progress || 0) ? 'is-filled' : ''}`} style={`--h:${Math.round(0 + 120 * (i/Math.max(1,(item.steps||8)-1)))}`}></div>
                {/each}
              </div>
              <button type="button" class="start-btn" on:click={() => openSession(item)}>Start</button>
            </article>
          {/each}
        </div>
      {:else}
        <p class="empty-msg">No practice items set yet. Ask your instructor for recommendations.</p>
      {/if}
    </div>
    <!-- Schedule Section -->
    <div class="training-section">
      <h3 class="section-title">Your Classes This Week</h3>
      {#if schedule.length}
        <div class="schedule-list">
          {#each schedule as cls (cls.id || cls.dayOfWeek)}
            <article class="schedule-item">
              <div class="schedule-day">
                <div class="day-name">{getDayName(cls.dayOfWeek)}</div>
                {#if cls.date}
                  <div class="day-date">{formatDate(cls.date)}</div>
                {/if}
              </div>
              <div class="schedule-info">
                <h4 class="class-name">{cls.name || 'Class'}</h4>
                <p class="class-meta">
                  {#if cls.instructor}
                    <span>Instructor: {cls.instructor}</span>
                  {/if}
                  {#if cls.location}
                    <span>• {cls.location}</span>
                  {/if}
                </p>
              </div>
              <div class="schedule-time">
                <span class="time-badge">{formatTime(cls.time)}</span>
              </div>
            </article>
          {/each}
        </div>
      {:else}
        <p class="empty-msg">No classes scheduled this week</p>
      {/if}
    </div>

    <!-- History Section -->
    <div class="training-section">
      <h3 class="section-title">Recent Classes</h3>
      {#if history.length}
        <div class="history-list">
          {#each history.slice(0, 10) as cls (cls.date + cls.name)}
            <article class="history-item">
              <div class="history-date">{formatDate(cls.date)}</div>
              <div class="history-info">
                <h4 class="history-name">{cls.name || 'Class'}</h4>
                <p class="history-meta">
                  {#if cls.instructor}
                    <span>{cls.instructor}</span>
                  {/if}
                  {#if cls.notes}
                    <span class="notes">• {cls.notes}</span>
                  {/if}
                </p>
              </div>
            </article>
          {/each}
        </div>
      {:else}
        <p class="empty-msg">No class history yet</p>
      {/if}
    </div>
  </div>
</section>

<TrainingSessionModal open={showSession} item={sessionItem} onClose={closeSession} />

<style>
  .training-root {
    padding: 20px;
    color: var(--text-main, #e5e7eb);
  }

  .training-header {
    margin-bottom: 24px;
  }

  .training-header h2 {
    margin: 0 0 8px 0;
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--text-main, #e5e7eb);
  }

  .training-subtitle {
    margin: 0;
    font-size: 0.95rem;
    color: var(--text-muted, #9ca3af);
  }

  .training-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 24px;
  }
  .training-funstrip { grid-column: 1 / -1; display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap:10px }
  .fun-chip { display:flex; flex-direction:column; align-items:center; gap:6px; padding:10px; border-radius:12px; background: rgba(255,255,255,0.03); border:1px solid rgba(148,163,184,0.15) }
  .fun-label { font-size:0.75rem; color: var(--text-muted,#9ca3af); text-transform: uppercase; letter-spacing:0.06em }
  .fun-value { font-weight:800; color: var(--text-main,#e5e7eb) }

  .training-section {
    background: var(--panel-bg, rgba(15, 23, 42, 0.86));
    border-radius: 14px;
    padding: 18px;
    border: 1px solid rgba(148, 163, 184, 0.15);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .launcher-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:12px }
  .launcher-card { padding:12px; border-radius:12px; background: rgba(255,255,255,0.02); border:1px solid rgba(148,163,184,0.1) }
  .launcher-title { font-weight:700; color: var(--text-main,#e5e7eb); margin-bottom:8px }
  .launcher-heatbar { display:grid; grid-template-columns: repeat(8, minmax(0,1fr)); gap:4px; margin-bottom:10px }
  .heat-seg { height:10px; border-radius:6px; background: rgba(148,163,184,0.2) }
  .heat-seg.is-filled { background: hsl(var(--h,120), 70%, 45%); box-shadow: 0 4px 10px rgba(0,0,0,0.25) }
  .start-btn { padding:8px 12px; border-radius:8px; border:1px solid rgba(148,163,184,0.25); background: rgba(255,255,255,0.06); color:#e5e7eb; cursor:pointer }
  .start-btn:hover { background: rgba(255,255,255,0.1) }

  .section-title {
    margin: 0 0 14px 0;
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-main, #e5e7eb);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .schedule-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .schedule-item {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 12px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(148, 163, 184, 0.1);
    transition: all 0.2s ease;
  }

  .schedule-item:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(56, 189, 248, 0.3);
  }

  .schedule-day {
    text-align: center;
    padding: 0 10px;
    border-right: 1px solid rgba(148, 163, 184, 0.1);
  }

  .day-name {
    font-weight: 700;
    font-size: 0.9rem;
    color: var(--text-main, #e5e7eb);
  }

  .day-date {
    font-size: 0.75rem;
    color: var(--text-muted, #9ca3af);
    margin-top: 2px;
  }

  .schedule-info {
    flex: 1;
  }

  .class-name {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-main, #e5e7eb);
  }

  .class-meta {
    margin: 4px 0 0 0;
    font-size: 0.8rem;
    color: var(--text-muted, #9ca3af);
  }

  .schedule-time {
    margin-left: auto;
  }

  .time-badge {
    padding: 6px 10px;
    border-radius: 6px;
    background: rgba(56, 189, 248, 0.1);
    color: #38bdf8;
    font-weight: 600;
    font-size: 0.8rem;
  }

  .history-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .history-item {
    display: flex;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(148, 163, 184, 0.08);
    transition: all 0.2s ease;
  }

  .history-item:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .history-date {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-muted, #9ca3af);
    min-width: 80px;
  }

  .history-info {
    flex: 1;
  }

  .history-name {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-main, #e5e7eb);
  }

  .history-meta {
    margin: 2px 0 0 0;
    font-size: 0.75rem;
    color: var(--text-muted, #9ca3af);
  }

  .notes {
    display: block;
    margin-top: 2px;
  }

  .empty-msg {
    text-align: center;
    color: var(--text-muted, #9ca3af);
    padding: 20px 0;
    margin: 0;
  }
</style>
