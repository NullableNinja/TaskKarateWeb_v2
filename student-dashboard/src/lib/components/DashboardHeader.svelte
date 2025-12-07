<script>
  import { activeStudent } from "$lib/stores/students.js";

  $: student = $activeStudent;

  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  
  let profileExpanded = false;

  function logout() {
    activeStudent.set(null);
    localStorage.removeItem("tkStudentSession");
    goto(`${base}/login`);
  }
  
  function toggleProfile() {
    profileExpanded = !profileExpanded;
  }

  function beltColor(rank) {
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

  function beltTextColor(rank) {
    if (!rank || typeof rank !== 'string') return '#ffffff';
    const r = rank.toLowerCase();
    // Dark text for light belts
    if (r.includes('white') || r.includes('yellow') || r.includes('orange')) return '#0f172a';
    // Light text for dark belts
    return '#ffffff';
  }

  function getInitials(name) {
    if (!name) return '';
    // Remove titles like Mr., Ms., Mrs., Dr., etc.
    const cleaned = name.replace(/^(Mr\.?|Ms\.?|Mrs\.?|Dr\.?|Miss|Master)\s+/i, '').trim();
    return cleaned.split(' ').map(n => n[0] || '').join('').toUpperCase();
  }

  // Prefer true name for initials (so Ms. Yehle => AY)
  $: initials = getInitials(student?.name || student?.displayName || '');
  $: is3Level = student?.is3Level ?? 0;
  $: roles = Array.isArray(student?.roles) ? student.roles : [];
  $: isInstructor = roles.includes('instructor');
  $: isAssistant = roles.includes('assistant');
  $: isHelper = roles.includes('helper');
  function is3Color(level) {
    if (!level) return '#56679a';
    if (level >= 12) return '#5f2a88';
    if (level >= 9) return '#3e3370';
    if (level >= 6) return '#3b4f7a';
    if (level >= 3) return '#56679a';
    return '#56679a';
  }
</script>

<!-- Floating profile card + logout -->
<div class="floating-controls" aria-label="Logout control">
  <button class="logout-btn" type="button" on:click={logout}>
    <span class="logout-icon">
      <svg class="logout-icon-svg" viewBox="0 0 24 24">
        <line x1="12" y1="4" x2="12" y2="11" />
        <path d="M8.5 6.75a6 6 0 1 0 7 0" />
      </svg>
    </span>
    Logout
  </button>
</div>

{#if student}
  <button 
    class="profile-card {profileExpanded ? 'expanded' : 'collapsed'}" 
    style={`--belt:${beltColor(student.rank)}; --is3:${is3Color(is3Level)};`}
    on:click={toggleProfile}
    on:mouseenter={() => profileExpanded = true}
    on:mouseleave={() => profileExpanded = false}
  >
    <div class="avatar-large">{initials}</div>
    
    {#if profileExpanded}
      <div class="profile-details">
        <div class="profile-info">
          <div class="profile-name">{student.displayName || student.name}</div>
          <div class="profile-meta-row">
            <span class="pill belt-pill" style={`background:${beltColor(student.rank)}; color:${beltTextColor(student.rank)}`}>{student.rank}</span>
            <span class="pill is3-pill" style={`background:${is3Color(is3Level)}`}>IS3 L{is3Level}</span>
          </div>
          {#if isInstructor || isAssistant || isHelper}
            <div class="role-row">
              {#if isInstructor}<span class="pill role-pill instructor-pill">Instructor</span>{/if}
              {#if isAssistant}<span class="pill role-pill assistant-pill">Asst Instructor</span>{/if}
              {#if isHelper}<span class="pill role-pill helper-pill">Helper</span>{/if}
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </button>
{/if}

<style>
  .floating-controls {
    position: fixed;
    top: 104px; /* align slightly below nav to avoid eclipse */
    right: 24px;
    z-index: 10;
    background: rgba(15, 23, 42, 0.7);
    backdrop-filter: blur(12px);
    border-radius: 16px;
    padding: 10px 14px;
    border: 1px solid rgba(148, 163, 184, 0.2);
  }

  .logout-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 14px;
    border-radius: 16px;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    border: 1px solid rgba(239, 68, 68, 0.55);
    color: white;
    font-size: 0.7rem;
    font-weight: 700;
    cursor: pointer;
    transform: scale(0.9);
    transition: all 0.15s ease;
    box-shadow:
      0 3px 9px rgba(239, 68, 68, 0.35),
      inset 0 0 6px rgba(0, 0, 0, 0.35);
  }

  .logout-btn:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow:
      0 6px 18px rgba(239, 68, 68, 0.65),
      inset 0 0 8px rgba(0, 0, 0, 0.45);
  }

  .logout-icon {
    width: 22px;
    height: 22px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background: rgba(15, 23, 42, 0.9);
    box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.6);
  }

  .logout-icon-svg {
    width: 14px;
    height: 14px;
    stroke: #fca5a5;
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
  }

  .profile-card {
    position: fixed !important;
    top: 104px; /* match tab bar baseline exactly */
    left: 24px; /* align to left, matching static layout */
    z-index: 16;
    background: linear-gradient(180deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.95) 100%);
    backdrop-filter: blur(16px);
    border-radius: 14px;
    padding: 12px;
    border: 1px solid rgba(148, 163, 184, 0.35);
    box-shadow: 
      0 16px 40px rgba(0, 0, 0, 0.7),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    position: relative;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }

  /* Ensure fixed positioning behaves like tab bar across transforms */
  :global(body) { will-change: auto; }
  
  .profile-card.collapsed {
    width: 72px;
    height: 72px;
    padding: 8px;
  }
  
  .profile-card.expanded {
    width: auto;
    min-width: 280px;
    padding: 18px 22px;
  }
  
  .profile-card::before {
    content: "";
    position: absolute;
    top: 8px;
    left: 8px;
    right: -8px;
    bottom: -8px;
    background: rgba(8, 15, 30, 0.9);
    border-radius: 14px;
    z-index: -1;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
    border: 1px solid rgba(71, 85, 105, 0.4);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .profile-card::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #38bdf8, transparent);
    opacity: 0;
    transition: opacity 0.35s ease;
    border-radius: 16px 16px 0 0;
  }
  
  .profile-card:hover::after {
    opacity: 0.8;
  }
  
  .profile-card:hover {
    border-color: rgba(56, 189, 248, 0.5);
  }
  
  .profile-card:hover::before {
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.9);
  }
  
  .avatar-large { 
    width: 56px; 
    height: 56px; 
    border-radius: 12px; 
    background: linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(59, 130, 246, 0.15)); 
    color: #38bdf8; 
    display:flex; 
    align-items:center; 
    justify-content:center; 
    font-weight:900; 
    font-size: 1.3rem;
    border: 2px solid rgba(56, 189, 248, 0.3);
    box-shadow: 0 4px 12px rgba(56, 189, 248, 0.2);
    flex-shrink: 0;
  }
  
  .profile-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
    opacity: 0;
    transform: translateX(-10px);
    animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
  
  @keyframes slideIn {
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .profile-info { 
    display:flex; 
    flex-direction:column; 
    gap: 8px; 
    flex: 1;
  }
  
  .profile-name { 
    font-family: var(--font-title, 'Bebas Neue', sans-serif); 
    font-size: 1.25rem; 
    letter-spacing: 0.02em; 
    line-height:1.2;
    color: #e5e7eb;
  }
  
  .profile-meta-row { 
    display:flex; 
    gap:6px; 
    flex-wrap:wrap; 
  }
  
  .role-row {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 2px;
  }
  .pill { display:inline-flex; align-items:center; padding: 3px 8px; border-radius: 6px; font-weight: 800; font-size: 0.65rem; color: #0f172a; border: 1px solid rgba(255,255,255,0.15); }
  .role-pill { background: linear-gradient(135deg, #fbbf24, #f59e0b); border-color: rgba(251, 191, 36, 0.5); }
  .instructor-pill { background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: #faf5ff; }
  .assistant-pill { background: linear-gradient(135deg, #3b82f6, #2563eb); color: #eff6ff; }
  .helper-pill { background: linear-gradient(135deg, #10b981, #059669); color: #ecfdf5; }
</style>
