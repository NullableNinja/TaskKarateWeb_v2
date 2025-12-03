<script>
  import Messages from "./Messages.svelte";
  import Friends from "./Friends.svelte";
  
  let activeView = 'messages'; // 'messages' or 'friends'
</script>

<div class="social-root">
  <div class="social-toggle">
    <button 
      class={`toggle-btn ${activeView === 'messages' ? 'is-active' : ''}`}
      on:click={() => activeView = 'messages'}
    >
      💬 Messages
    </button>
    <button 
      class={`toggle-btn ${activeView === 'friends' ? 'is-active' : ''}`}
      on:click={() => activeView = 'friends'}
    >
      👥 Buddies
    </button>
  </div>
  
  {#if activeView === 'messages'}
    <section class="panel">
      <Messages />
    </section>
  {:else}
    <section class="panel">
      <Friends />
    </section>
  {/if}
</div>

<style>
  .social-root { display: flex; flex-direction: column; gap: 16px; }
  .social-toggle { display:flex; gap:10px; }
  .toggle-btn { flex:1; padding: 12px 20px; border-radius: 10px; border: 1px solid rgba(148, 163, 184, 0.25); background: rgba(255, 255, 255, 0.02); color: var(--text-main, #e5e7eb); font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: all 0.2s ease; }
  .toggle-btn:hover { background: rgba(255, 255, 255, 0.05); border-color: rgba(148, 163, 184, 0.4); }
  .toggle-btn.is-active { background: rgba(56, 189, 248, 0.15); border-color: rgba(56, 189, 248, 0.5); color: #38bdf8; }
  .panel { background: transparent; border: none; padding: 0; box-shadow: none; }
</style>
