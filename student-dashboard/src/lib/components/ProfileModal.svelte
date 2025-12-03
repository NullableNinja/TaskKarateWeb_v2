<script>
  import Modal from '$lib/components/Modal.svelte';

  export let open = false;
  export let student = null; // full student object
  export let onClose = () => {};

  function getInitials(name) {
    if (!name) return '';
    const cleaned = name.replace(/^(Mr\.?|Ms\.?|Mrs\.?|Miss|Dr\.?|Master)\s+/i, '').trim();
    return cleaned.split(/\s+/).map(n => n[0] || '').join('').slice(0,2).toUpperCase();
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
</script>

{#if open && student}
  <Modal title="Profile" onClose={onClose}>
    <div class="profile-modal">
      <div class="profile-header">
        <div class="profile-avatar" style={`--avatar-bg: ${getBeltColorFromRank(student.rank || '')}`}>{getInitials(student.displayName || student.name)}</div>
        <div class="profile-info">
          <div class="profile-name">{student.displayName || student.name}</div>
          <div class="profile-rank">{student.rank}</div>
          {#if Array.isArray(student.roles) && student.roles.length}
            <div class="profile-roles">{#each student.roles as role}<span class="role-badge">{role}</span>{/each}</div>
          {/if}
        </div>
      </div>

      <div class="profile-stats">
        <div class="stat"><span class="label">Total Classes</span><span class="value">{student.totalClasses ?? 0}</span></div>
        <div class="stat"><span class="label">Member Since</span><span class="value">{student.joinDate || '—'}</span></div>
        <div class="stat"><span class="label">Buddies</span><span class="value">{Array.isArray(student.buddies) ? student.buddies.length : 0}</span></div>
      </div>

      {#if Array.isArray(student.badges) && student.badges.length}
        <div class="profile-badges">
          <div class="section-title">Recent Badges</div>
          <div class="badge-row">
            {#each student.badges.slice(0,4) as b}
              <div class="badge-pill">{b.name}</div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </Modal>
{/if}

<style>
  .profile-modal { display:flex; flex-direction:column; gap:1rem }
  .profile-header { display:flex; align-items:center; gap:0.75rem }
  .profile-avatar { width:52px; height:52px; border-radius:999px; display:flex; align-items:center; justify-content:center; background: var(--avatar-bg,#64748b); color:#e5e7eb; font-weight:700; letter-spacing:0.04em }
  .profile-info { display:flex; flex-direction:column }
  .profile-name { font-weight:700; color:#e5e7eb }
  .profile-rank { font-size:0.85rem; color: var(--text-muted,#9ca3af) }
  .profile-roles { display:flex; gap:0.4rem; flex-wrap:wrap; margin-top:0.25rem }
  .role-badge { font-size:0.7rem; padding:0.2rem 0.5rem; border-radius:999px; background: rgba(56,189,248,0.15); color:#e5e7eb; border:1px solid rgba(56,189,248,0.35) }
  .profile-stats { display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap:8px }
  .stat { display:flex; flex-direction:column; align-items:center; gap:4px; padding:10px; border-radius:12px; background: rgba(255,255,255,0.03); border:1px solid rgba(148,163,184,0.15) }
  .label { font-size:0.7rem; color: var(--text-muted,#9ca3af); text-transform: uppercase; letter-spacing:0.06em }
  .value { font-weight:800; color: var(--text-main,#e5e7eb) }
  .profile-badges { margin-top:8px }
  .section-title { font-size:0.8rem; color: var(--text-muted,#9ca3af); margin-bottom:6px }
  .badge-row { display:flex; gap:6px; flex-wrap:wrap }
  .badge-pill { padding:6px 10px; border-radius:999px; background: rgba(255,255,255,0.06); border:1px solid rgba(148,163,184,0.25); color:#e5e7eb; font-size:0.75rem }
</style>