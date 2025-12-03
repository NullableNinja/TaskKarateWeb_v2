<script>
  import { activeStudent } from "$lib/stores/students.js";
  import Modal from "./Modal.svelte";
  import GoldStarIcon from "$lib/assets/gold-star.svg";
  import BronzeBadge from "$lib/assets/badge-bronze.svg";
  import SilverBadge from "$lib/assets/badge-silver.svg";
  import GoldBadge from "$lib/assets/badge-gold.svg";
  import DiamondBadge from "$lib/assets/badge-diamond.svg";

  let badges = [];
  let goldStars = [];
  let filterLevel = 'all';
  let activeSection = 'badges'; // 'badges' or 'goldStars'
  
  // Modal state
  let showModal = false;
  let selectedItem = null;
  let modalType = 'badge'; // 'badge' or 'goldStar'

  $: if ($activeStudent) {
    badges = Array.isArray($activeStudent.badges) ? $activeStudent.badges : [];
    goldStars = Array.isArray($activeStudent.goldStars) ? $activeStudent.goldStars : [];
  }

  $: filteredBadges = filterLevel === 'all' 
    ? badges 
    : badges.filter(b => (b.level || '').toLowerCase() === filterLevel.toLowerCase());

  function getLevelColor(level) {
    if (!level) return '#64748b';
    const l = level.toLowerCase();
    if (l === 'bronze') return '#b87d3b';
    if (l === 'silver') return '#c0c0c0';
    if (l === 'gold') return '#ffd700';
    if (l === 'diamond') return '#b9f3fc';
    return '#a8a29e';
  }
  
  function getBadgeIcon(level) {
    if (!level) return null;
    const l = level.toLowerCase();
    if (l === 'bronze') return BronzeBadge;
    if (l === 'silver') return SilverBadge;
    if (l === 'gold') return GoldBadge;
    if (l === 'diamond') return DiamondBadge;
    return null;
  }
  
  function openBadgeModal(badge) {
    selectedItem = badge;
    modalType = 'badge';
    showModal = true;
  }
  
  function openGoldStarModal(star) {
    selectedItem = star;
    modalType = 'goldStar';
    showModal = true;
  }
  
  function closeModal() {
    showModal = false;
    selectedItem = null;
  }
</script>

<section class="achievements-root">
  <header class="achievements-header">
    <h2>Achievements</h2>
    <p class="achievements-subtitle">Badges, gold stars, and milestones</p>
    <div class="achievements-funstrip">
      <div class="fun-chip"><div class="fun-label">Badges</div><div class="fun-value">{badges.length}</div></div>
      <div class="fun-chip"><div class="fun-label">Gold Stars</div><div class="fun-value">{goldStars.length}</div></div>
      <div class="fun-chip"><div class="fun-label">Recent</div><div class="fun-value">{[...badges, ...goldStars].slice(-5).length}</div></div>
    </div>
  </header>

  <div class="section-tabs">
    <button 
      class={`section-tab ${activeSection === 'badges' ? 'is-active' : ''}`}
      on:click={() => activeSection = 'badges'}
    >
      Badges ({badges.length})
    </button>
    <button 
      class={`section-tab ${activeSection === 'goldStars' ? 'is-active' : ''}`}
      on:click={() => activeSection = 'goldStars'}
    >
      <img src={GoldStarIcon} alt="" class="tab-icon" /> Gold Stars ({goldStars.length})
    </button>
  </div>

  {#if activeSection === 'badges'}
    <div class="achievements-filters">
      <button 
        class="filter-btn {filterLevel === 'all' ? 'is-active' : ''}"
        on:click={() => filterLevel = 'all'}
      >
        All ({badges.length})
      </button>
      {#each ['Bronze', 'Silver', 'Gold', 'Diamond'] as level}
        {@const count = badges.filter(b => (b.level || '').toLowerCase() === level.toLowerCase()).length}
        <button 
          class="filter-btn {filterLevel === level ? 'is-active' : ''}"
          on:click={() => filterLevel = level}
        >
          {level} ({count})
        </button>
      {/each}
    </div>

  {#if filteredBadges.length}
    <div class="badges-grid">
      {#each filteredBadges as badge (badge.name)}
        <div class="badge-item" on:click={() => openBadgeModal(badge)} on:keydown={(e) => e.key === 'Enter' && openBadgeModal(badge)} role="button" tabindex="0">
          {#if getBadgeIcon(badge.level)}
            <div class="badge-medal-svg">
              <img src={getBadgeIcon(badge.level)} alt={`${badge.level} badge`} class="badge-icon" />
            </div>
          {:else}
            <div class="badge-medal" style={`background: ${getLevelColor(badge.level)}`}>
              {(badge.level || '?').charAt(0).toUpperCase()}
            </div>
          {/if}
          <div class="badge-content">
            <h3 class="badge-name">{badge.name}</h3>
            {#if badge.description}
              <p class="badge-description">{badge.description}</p>
            {/if}
            {#if badge.earnedDate}
              <p class="badge-date">Earned {new Date(badge.earnedDate).toLocaleDateString()}</p>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="empty-state">
      <p>No {filterLevel === 'all' ? 'achievements' : filterLevel + ' badges'} yet. Keep training!</p>
    </div>
  {/if}
  {:else if activeSection === 'goldStars'}
    {#if goldStars.length}
      <div class="stars-grid">
        {#each goldStars as star}
          <div class="star-item" on:click={() => openGoldStarModal(star)} on:keydown={(e) => e.key === 'Enter' && openGoldStarModal(star)} role="button" tabindex="0">
            <div class="star-icon"><img src={GoldStarIcon} alt="Gold Star" class="star-svg" /></div>
            <div class="star-content">
              <h3 class="star-name">{star.event}</h3>
              {#if star.description}<p class="star-description">{star.description}</p>{/if}
              {#if star.earnedDate}<p class="star-date">Earned {new Date(star.earnedDate).toLocaleDateString()}</p>{/if}
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="empty-state">
        <p>No Gold Stars yet! Participate in studio events to earn them.</p>
      </div>
    {/if}
  {/if}
</section>

<!-- Achievement Detail Modal -->
<Modal open={showModal} title={modalType === 'badge' ? 'Badge Details' : 'Gold Star Details'} onClose={closeModal}>
  {#if selectedItem}
    {#if modalType === 'badge'}
      <div class="modal-achievement">
        {#if getBadgeIcon(selectedItem.level)}
          <div class="modal-badge-icon-svg">
            <img src={getBadgeIcon(selectedItem.level)} alt={`${selectedItem.level} badge`} class="modal-badge-svg" />
          </div>
        {:else}
          <div class="modal-badge-icon" style={`background: ${getLevelColor(selectedItem.level)}`}>
            {(selectedItem.level || '?').charAt(0).toUpperCase()}
          </div>
        {/if}
        <h3 class="modal-achievement-title">{selectedItem.name}</h3>
        <div class="modal-achievement-level" style={`color: ${getLevelColor(selectedItem.level)}`}>
          {selectedItem.level || 'Unknown'} Level
        </div>
        {#if selectedItem.description}
          <p class="modal-achievement-description">{selectedItem.description}</p>
        {/if}
        {#if selectedItem.earnedDate}
          <div class="modal-achievement-meta">
            <strong>Earned:</strong> {new Date(selectedItem.earnedDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        {/if}
        {#if selectedItem.criteria}
          <div class="modal-achievement-criteria">
            <strong>Criteria:</strong>
            <p>{selectedItem.criteria}</p>
          </div>
        {/if}
      </div>
    {:else if modalType === 'goldStar'}
      <div class="modal-achievement">
        <div class="modal-star-icon"><img src={GoldStarIcon} alt="Gold Star" class="modal-star-svg" /></div>
        <h3 class="modal-achievement-title">{selectedItem.event}</h3>
        {#if selectedItem.description}
          <p class="modal-achievement-description">{selectedItem.description}</p>
        {/if}
        {#if selectedItem.earnedDate}
          <div class="modal-achievement-meta">
            <strong>Earned:</strong> {new Date(selectedItem.earnedDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        {/if}
        {#if selectedItem.location}
          <div class="modal-achievement-meta">
            <strong>Location:</strong> {selectedItem.location}
          </div>
        {/if}
        {#if selectedItem.notes}
          <div class="modal-achievement-notes">
            <strong>Notes:</strong>
            <p>{selectedItem.notes}</p>
          </div>
        {/if}
      </div>
    {/if}
  {/if}
</Modal>

<style>
  .achievements-root {
    padding: 20px;
    color: var(--text-main, #e5e7eb);
  }
  .achievements-funstrip { display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap:10px; margin-top:10px }
  .fun-chip { display:flex; flex-direction:column; align-items:center; gap:6px; padding:10px; border-radius:12px; background: rgba(255,255,255,0.03); border:1px solid rgba(148,163,184,0.15) }
  .fun-label { font-size:0.75rem; color: var(--text-muted,#9ca3af); text-transform: uppercase; letter-spacing:0.06em }
  .fun-value { font-weight:800; color: var(--text-main,#e5e7eb) }

  .achievements-header {
    margin-bottom: 24px;
  }

  .achievements-header h2 {
    margin: 0 0 8px 0;
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--text-main, #e5e7eb);
  }

  .achievements-subtitle {
    margin: 0;
    font-size: 0.95rem;
    color: var(--text-muted, #9ca3af);
  }

  .achievements-filters {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 24px;
  }

  .section-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }

  .section-tab {
    padding: 10px 18px;
    border-radius: 10px;
    border: 1px solid rgba(148, 163, 184, 0.2);
    background: rgba(255, 255, 255, 0.02);
    color: var(--text-main, #e5e7eb);
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .tab-icon {
    width: 20px;
    height: 20px;
  }

  .section-tab:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(148, 163, 184, 0.4);
  }

  .section-tab.is-active {
    background: rgba(56, 189, 248, 0.15);
    border-color: rgba(56, 189, 248, 0.5);
    color: #38bdf8;
  }

  .filter-btn {
    padding: 8px 14px;
    border-radius: 8px;
    border: 1px solid rgba(148, 163, 184, 0.2);
    background: rgba(255, 255, 255, 0.02);
    color: var(--text-main, #e5e7eb);
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .filter-btn:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(148, 163, 184, 0.4);
  }

  .filter-btn.is-active {
    background: rgba(56, 189, 248, 0.15);
    border-color: rgba(56, 189, 248, 0.5);
    color: #38bdf8;
  }

  .badges-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  .badge-item {
    display: flex;
    gap: 14px;
    padding: 16px;
    border-radius: 12px;
    background: var(--panel-bg, rgba(15, 23, 42, 0.86));
    border: 1px solid rgba(148, 163, 184, 0.15);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .badge-item:hover {
    border-color: rgba(56, 189, 248, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  }

  .badge-medal {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.6rem;
    color: white;
    flex-shrink: 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .badge-medal-svg {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .badge-icon {
    width: 60px;
    height: 60px;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  }

  .badge-content {
    flex: 1;
  }

  .badge-name {
    margin: 0 0 6px 0;
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-main, #e5e7eb);
  }

  .badge-description {
    margin: 0 0 6px 0;
    font-size: 0.85rem;
    color: var(--text-muted, #9ca3af);
    line-height: 1.4;
  }

  .badge-date {
    margin: 0;
    font-size: 0.75rem;
    color: rgba(148, 163, 184, 0.8);
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    color: var(--text-muted, #9ca3af);
    font-size: 1.05rem;
    text-align: center;
  }

  .stars-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 14px;
  }

  .star-item {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 14px;
    border-radius: 12px;
    background: var(--panel-bg, rgba(15, 23, 42, 0.86));
    border: 1px solid rgba(255, 215, 0, 0.2);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .star-item:hover {
    border-color: rgba(255, 215, 0, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255, 215, 0, 0.15);
  }

  .star-icon {
    font-size: 2.5rem;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .star-svg {
    width: 48px;
    height: 48px;
    filter: drop-shadow(0 2px 8px rgba(255, 215, 0, 0.5));
  }

  .star-content {
    flex: 1;
  }

  .star-name {
    margin: 0 0 4px 0;
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-main, #e5e7eb);
  }

  .star-description {
    margin: 0 0 4px 0;
    font-size: 0.8rem;
    color: var(--text-muted, #9ca3af);
  }

  .star-date {
    margin: 0;
    font-size: 0.7rem;
    color: rgba(148, 163, 184, 0.8);
  }

  /* Modal styles */
  .modal-achievement {
    text-align: center;
  }

  .modal-badge-icon {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 3rem;
    color: white;
    margin: 0 auto 20px;
    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  .modal-badge-icon-svg {
    width: 140px;
    height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
  }

  .modal-badge-svg {
    width: 140px;
    height: 140px;
    filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.4));
  }

  .modal-star-icon {
    font-size: 5rem;
    margin: 0 auto 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-star-svg {
    width: 120px;
    height: 120px;
    filter: drop-shadow(0 4px 16px rgba(255, 215, 0, 0.6));
  }

  .modal-achievement-title {
    font-family: var(--font-title, 'Bebas Neue', sans-serif);
    font-size: 1.8rem;
    margin: 0 0 12px 0;
    letter-spacing: 0.02em;
  }

  .modal-achievement-level {
    font-weight: 700;
    font-size: 1.1rem;
    margin-bottom: 16px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .modal-achievement-description {
    font-size: 1rem;
    line-height: 1.6;
    color: var(--text-muted, #9ca3af);
    margin: 16px 0;
  }

  .modal-achievement-meta {
    text-align: left;
    padding: 12px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    margin: 12px 0;
    font-size: 0.95rem;
  }

  .modal-achievement-meta strong {
    color: #38bdf8;
    display: block;
    margin-bottom: 4px;
  }

  .modal-achievement-criteria,
  .modal-achievement-notes {
    text-align: left;
    padding: 12px;
    background: rgba(56, 189, 248, 0.05);
    border-left: 3px solid #38bdf8;
    border-radius: 4px;
    margin: 12px 0;
    font-size: 0.95rem;
  }

  .modal-achievement-criteria strong,
  .modal-achievement-notes strong {
    color: #38bdf8;
    display: block;
    margin-bottom: 8px;
  }

  .modal-achievement-criteria p,
  .modal-achievement-notes p {
    margin: 0;
    color: var(--text-muted, #9ca3af);
    line-height: 1.5;
  }
</style>

