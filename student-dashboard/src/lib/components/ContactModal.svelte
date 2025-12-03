<script>
  import Modal from '$lib/components/Modal.svelte';
  import { students, activeStudent, acceptFriendRequest } from '$lib/stores/students.js';

  export let open = false;
  export let contact = null; // { id, name, rank, roles }
  export let onClose = () => {};
  export let onViewProfile = null;

  $: allStudents = $students || [];

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

  function isBuddy() {
    const me = $activeStudent;
    if (!me || !Array.isArray(me.buddies)) return false;
    return me.buddies.some(b => (b.name === (contact?.name || '')));
  }

  function addBuddy() {
    const me = $activeStudent;
    if (!me || !contact?.id) return;
    // Accept friend request bidirectionally (direct add)
    acceptFriendRequest(me.id, contact.id, true, allStudents);
    students.set([...allStudents]);
    activeStudent.set({ ...me });
  }
</script>

{#if open && contact}
  <Modal title="Contact" onClose={onClose}>
    <div class="contact-modal">
      <div class="contact-header">
        <div class="contact-avatar" style={`--avatar-bg: ${getBeltColorFromRank(contact.rank || '')}`}>
          {getInitials(contact.name)}
        </div>
        <div class="contact-info">
          <div class="contact-name">{contact.name}</div>
          <div class="contact-rank">{contact.rank}</div>
          {#if Array.isArray(contact.roles) && contact.roles.length}
            <div class="contact-roles">
              {#each contact.roles as role}
                <span class="role-badge">{role}</span>
              {/each}
            </div>
          {/if}
          <div class="portal-chip">Student Portal</div>
        </div>
      </div>

      <div class="contact-actions">
        {#if !isBuddy()}
          <button class="btn btn--primary" on:click={addBuddy}>Add Buddy</button>
        {/if}
        <button class="btn">Message</button>
        <button class="btn" on:click={() => onViewProfile && onViewProfile(contact)}>View Profile</button>
      </div>
    </div>
  </Modal>
{/if}

<style>
  .contact-modal { display: flex; flex-direction: column; gap: 1rem; max-width: 520px }
  .contact-header { display: flex; align-items: center; gap: 0.9rem; }
  .contact-avatar {
    width: 56px; height: 56px; border-radius: 16px; display:flex; align-items:center; justify-content:center;
    color: #e5e7eb; font-weight: 800; letter-spacing: 0.06em; background-color: var(--avatar-bg, #64748b);
    box-shadow: 0 10px 24px rgba(15,23,42,0.9), inset 0 1px 0 rgba(255,255,255,0.08);
  }
  .contact-info { display:flex; flex-direction:column; gap: 4px }
  .contact-name { font-weight: 800; color: #e5e7eb; letter-spacing: 0.02em }
  .contact-rank { font-size: 0.85rem; color: var(--text-muted, #9ca3af); }
  .contact-roles { display:flex; gap: 0.4rem; margin-top: 0.25rem; flex-wrap: wrap; }
  .role-badge { font-size: 0.7rem; padding: 0.2rem 0.6rem; border-radius: 999px; background: rgba(56,189,248,0.15); color:#e5e7eb; border:1px solid rgba(56,189,248,0.35); font-weight:700 }
  .portal-chip { align-self:flex-start; margin-top: 4px; display:inline-block; padding: 6px 10px; border-radius: 8px; background: rgba(56,189,248,0.15); color:#38bdf8; font-weight:800; letter-spacing: 0.06em; text-transform: uppercase; border:1px solid rgba(56,189,248,0.35) }
  .contact-actions { display:flex; gap: 0.5rem; }
  .btn { padding: 0.5rem 0.8rem; border-radius: 0.6rem; background: rgba(255,255,255,0.06); color:#e5e7eb; border:1px solid rgba(148,163,184,0.25); cursor:pointer; }
  .btn:hover { background: rgba(255,255,255,0.1); }
  .btn--primary { background: linear-gradient(135deg, #38bdf8, #0ea5e9); border-color: transparent; color: white; }
</style>