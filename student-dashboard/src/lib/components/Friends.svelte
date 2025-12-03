<script>
  import { students, activeStudent, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend } from "$lib/stores/students.js";
  import { onMount } from "svelte";

  let all = [];
  let me = null;
  let searchQuery = '';
  
  $: all = $students || [];
  $: me = $activeStudent || null;

  $: myFriends = me ? (me.friends || []) : [];
  $: incoming = me ? (me.friendRequestsIncoming || []) : [];
  $: outgoing = me ? (me.friendRequestsOutgoing || []) : [];
  
  // Check if user is instructor or assistant - they can directly add buddies
  $: myRoles = me && Array.isArray(me.roles) ? me.roles : [];
  $: canDirectAdd = myRoles.includes('instructor') || myRoles.includes('assistant');

  $: others = all.filter(s => s.id !== me?.id);
  $: friendObjs = all.filter(s => myFriends.includes(s.id));
  $: incomingObjs = all.filter(s => incoming.includes(s.id));
  $: outgoingObjs = all.filter(s => outgoing.includes(s.id));
  
  // Filtered search results
  $: searchResults = searchQuery.trim() === '' ? [] : others.filter(s => {
    const name = (s.displayName || s.name || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query);
  });

  function request(id) { 
    if (me) {
      if (canDirectAdd) {
        // Instructors/assistants can directly add as friends (skip request)
        acceptFriendRequest(me.id, id, true); // Pass true to force add even without pending request
      } else {
        sendFriendRequest(me.id, id);
      }
    }
  }
  function accept(id) { if (me) acceptFriendRequest(me.id, id); }
  function reject(id) { if (me) rejectFriendRequest(me.id, id); }
  function remove(id) { if (me) removeFriend(me.id, id); }
</script>

<div class="panel">
  <h2 class="panel-title">Buddies</h2>
  {#if !me}
    <p class="muted">Select a student to manage buddies.</p>
  {:else}
    <div class="grid">
      <section>
        <h3>My Buddies</h3>
        {#if friendObjs.length === 0}
          <p class="muted">No buddies yet. Send a request below.</p>
        {:else}
          <ul class="list">
            {#each friendObjs as s}
              <li>
                <div class="item">
                  <div class="avatar">{(s.displayName || s.name).split(' ').map(n => n[0]).join('').toUpperCase()}</div>
                  <div class="info">
                    <div class="name">{s.displayName || s.name}</div>
                    <div class="rank">{s.rank}</div>
                  </div>
                  <div class="actions">
                    <button class="btn btn-danger" on:click={() => remove(s.id)}>Remove</button>
                  </div>
                </div>
              </li>
            {/each}
          </ul>
        {/if}
      </section>

      <section>
        <h3>Incoming Requests</h3>
        {#if incomingObjs.length === 0}
          <p class="muted">No incoming requests.</p>
        {:else}
          <ul class="list">
            {#each incomingObjs as s}
              <li>
                <div class="item">
                  <div class="avatar">{(s.displayName || s.name).split(' ').map(n => n[0]).join('').toUpperCase()}</div>
                  <div class="info">
                    <div class="name">{s.displayName || s.name}</div>
                    <div class="rank">{s.rank}</div>
                  </div>
                  <div class="actions">
                    <button class="btn" on:click={() => accept(s.id)}>Accept</button>
                    <button class="btn btn-muted" on:click={() => reject(s.id)}>Reject</button>
                  </div>
                </div>
              </li>
            {/each}
          </ul>
        {/if}
      </section>

      <section>
        <h3>Outgoing Requests</h3>
        {#if outgoingObjs.length === 0}
          <p class="muted">No outgoing requests.</p>
        {:else}
          <ul class="list">
            {#each outgoingObjs as s}
              <li>
                <div class="item">
                  <div class="avatar">{(s.displayName || s.name).split(' ').map(n => n[0]).join('').toUpperCase()}</div>
                  <div class="info">
                    <div class="name">{s.displayName || s.name}</div>
                    <div class="rank">{s.rank}</div>
                  </div>
                  <div class="actions">
                    <span class="muted">Pending</span>
                  </div>
                </div>
              </li>
            {/each}
          </ul>
        {/if}
      </section>

      <section class="add-buddies-section">
        <h3>Add Buddies</h3>
        <div class="search-container">
          <input 
            type="text" 
            class="search-input" 
            placeholder="Search by name..." 
            bind:value={searchQuery}
          />
        </div>
        {#if searchQuery.trim() !== ''}
          {#if searchResults.length === 0}
            <p class="muted">No students found matching "{searchQuery}"</p>
          {:else}
            {#if canDirectAdd}
              <p class="helper-text">💡 As an instructor, you can add anyone directly as a buddy</p>
            {/if}
            <ul class="list">
              {#each searchResults as s}
                <li>
                  <div class="item">
                    <div class="avatar">{(s.displayName || s.name).split(' ').map(n => n[0]).join('').toUpperCase()}</div>
                    <div class="info">
                      <div class="name">{s.displayName || s.name}</div>
                      <div class="rank">{s.rank}</div>
                    </div>
                    <div class="actions">
                      {#if myFriends.includes(s.id)}
                        <span class="muted">Buddy</span>
                      {:else if outgoing.includes(s.id)}
                        <span class="muted">Requested</span>
                      {:else if incoming.includes(s.id)}
                        <button class="btn" on:click={() => accept(s.id)}>Accept</button>
                      {:else}
                        <button class="btn" on:click={() => request(s.id)}>Add</button>
                      {/if}
                    </div>
                  </div>
                </li>
              {/each}
            </ul>
          {/if}
        {:else}
          <p class="muted">Type a name to search for buddies</p>
        {/if}
      </section>
    </div>
  {/if}
</div>

<style>
  .panel { background: rgba(15, 23, 42, 0.86); border: 1px solid rgba(148,163,184,0.35); border-radius: 16px; padding: 16px; box-shadow: 0 14px 32px rgba(0,0,0,0.55); }
  .panel-title { margin: 0 0 12px; font-size: 1.1rem; font-weight: 700; }
  .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
  .add-buddies-section { grid-column: 1 / -1; }
  .search-container { margin-bottom: 12px; }
  .search-input {
    width: 100%;
    padding: 10px 14px;
    background: rgba(2,6,23,0.6);
    border: 1px solid rgba(148,163,184,0.25);
    border-radius: 10px;
    color: #e5e7eb;
    font-size: 0.95rem;
    transition: border-color 0.2s ease, background 0.2s ease;
  }
  .search-input:focus {
    outline: none;
    border-color: rgba(56, 189, 248, 0.5);
    background: rgba(2,6,23,0.8);
  }
  .search-input::placeholder {
    color: #64748b;
  }
  .helper-text {
    font-size: 0.85rem;
    color: #38bdf8;
    background: rgba(56, 189, 248, 0.1);
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid rgba(56, 189, 248, 0.2);
    margin-bottom: 12px;
  }
  section h3 { margin: 4px 0 8px; font-size: 0.95rem; }
  .list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
  .item { display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 12px; background: rgba(2,6,23,0.6); border: 1px solid rgba(148,163,184,0.25); }
  .avatar { width: 36px; height: 36px; border-radius: 10px; background: rgba(56, 189, 248, 0.2); color: #38bdf8; display:flex; align-items:center; justify-content:center; font-weight:800; }
  .info { flex: 1; }
  .name { font-weight: 700; }
  .rank { font-size: 0.85rem; color: #9ca3af; }
  .actions { display:flex; gap:8px; align-items:center; }
  .btn { background: #2563a3; color: #0f172a; border: none; padding: 6px 10px; border-radius: 8px; font-weight: 700; cursor: pointer; }
  .btn:hover { filter: brightness(1.1); }
  .btn-danger { background: #8b3a3a; color: #fef2f2; }
  .btn-muted { background: #334155; color: #e5e7eb; }
  .muted { color: #9ca3af; }
  .helper-text {
    font-size: 0.85rem;
    color: #38bdf8;
    background: rgba(56, 189, 248, 0.1);
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid rgba(56, 189, 248, 0.2);
    margin-bottom: 12px;
  }
  @media (max-width: 800px) { .grid { grid-template-columns: 1fr; } }
</style>
