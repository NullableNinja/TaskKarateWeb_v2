<script>
  import { onMount } from 'svelte';
  import { activeStudent, students, sendMessage as storeSendMessage, getStudentById } from "$lib/stores/students.js";
  import ContactModal from '$lib/components/ContactModal.svelte';
  import ProfileModal from '$lib/components/ProfileModal.svelte';

  let activeBuddyId = null;
  let activeBuddyName = null;
  let messageText = "";
  let buddies = [];
  let allMessages = [];
  let filteredMessages = [];
  let allStudents = [];
  let messagePartners = []; // All people with message threads
  let partnerQuery = "";
  let filterMode = 'all'; // all | buddies | unread
  let showContactModal = false;
  let contactForModal = null;
  let showProfileModal = false;
  let profileStudent = null;
  let contextMenuFor = null; // buddy id for context actions
  let isTyping = false; // simple typing indicator simulation
  let newChatBuddyQuery = "";
  // Optional visibility controls persisted on active student
  $: ($activeStudent && (!$activeStudent.hiddenChats || !Array.isArray($activeStudent.hiddenChats))) && ($activeStudent.hiddenChats = []);
  $: ($activeStudent && (!$activeStudent.pinnedChats || !Array.isArray($activeStudent.pinnedChats))) && ($activeStudent.pinnedChats = []);

  $: allStudents = $students || [];

  // Normalize IDs to string for reliable comparisons across data sources
  function normalizeId(v) {
    try { return (v === null || v === undefined) ? v : v.toString(); } catch(_) { return v; }
  }

  function getBuddyIdByName(nameOrId) {
    if (!nameOrId) return nameOrId;
    // If the value already matches an ID from the roster, return it directly
    const byId = allStudents.find(s => normalizeId(s.id) === normalizeId(nameOrId));
    if (byId) return normalizeId(byId.id);
    // Else resolve by matching either name or displayName
    const buddy = allStudents.find(s => s.name === nameOrId || s.displayName === nameOrId);
    return buddy ? normalizeId(buddy.id) : normalizeId(nameOrId);
  }

  function getStudentNameById(id) {
    const student = allStudents.find(s => s.id === id);
    return student ? (student.displayName || student.name) : id;
  }

  $: if ($activeStudent && allStudents.length > 0) {
    buddies = Array.isArray($activeStudent.buddies) ? $activeStudent.buddies : [];
    allMessages = Array.isArray($activeStudent.messages) ? $activeStudent.messages : [];
    
    // Build list of all message partners (buddies + anyone we've messaged)
    // INSTRUCTORS and ASST INSTRUCTORS can message anyone
    const myRoles = Array.isArray($activeStudent.roles) ? $activeStudent.roles : [];
    const canMessageAll = myRoles.includes('instructor') || myRoles.includes('assistant');
    
    const buddyNames = new Set(buddies.map(b => (b.displayName || b.name))); // support displayName
    const buddyIds = new Set(buddies.map(b => b.id).filter(Boolean)); // support id-based buddies
    const messagePartnerIds = new Set();
    
    allMessages.forEach(m => {
      const otherId = normalizeId(m.fromId) === normalizeId($activeStudent.id) ? normalizeId(m.toId) : normalizeId(m.fromId);
      messagePartnerIds.add(otherId);
    });
    
    // Convert IDs to buddy objects
    const messageBuddies = Array.from(messagePartnerIds)
      .map(id => {
        const student = getStudentById(allStudents, id);
        if (!student) return null;
        const name = student.displayName || student.name;
        // Skip if already in buddies list (by name or id)
        if (buddyNames.has(name) || buddyIds.has(normalizeId(student.id))) return null;
        return {
          name,
          rank: student.rank,
          streak: 0,
          status: "Message thread"
        };
      })
      .filter(Boolean);
    
    // If instructor/assistant, include all students as potential partners
    if (canMessageAll) {
      const allPotential = allStudents
        .filter(s => s.id !== $activeStudent.id)
        .map(s => {
          const name = s.displayName || s.name;
          if (buddyNames.has(name) || buddyIds.has(normalizeId(s.id)) || messagePartnerIds.has(normalizeId(s.id))) return null;
          return {
            name,
            rank: s.rank,
            streak: 0,
            status: "Available"
          };
        })
        .filter(Boolean);
      messagePartners = [...buddies, ...messageBuddies, ...allPotential];
    } else {
      // Combine buddies and message partners
      messagePartners = [...buddies, ...messageBuddies];
    }
    
    // Apply hidden filter first, then mode filters, then text filter
    const hiddenIds = new Set(($activeStudent.hiddenChats || []).map(id => id));
    let basePartners = [...messagePartners].filter(p => !hiddenIds.has(getBuddyIdByName(p.name)));
    if (filterMode === 'buddies') {
      const buddyNamesOnly = new Set(buddies.map(b => (b.displayName || b.name)));
      basePartners = basePartners.filter(p => buddyNamesOnly.has(p.name));
    } else if (filterMode === 'unread') {
      const unreadSet = new Set((allMessages || []).filter(m => normalizeId(m.toId) === normalizeId($activeStudent.id) && m.read === false).map(m => normalizeId(m.fromId)));
      basePartners = basePartners.filter(p => unreadSet.has(normalizeId(getBuddyIdByName(p.name))));
    }
    // Sort pinned to top
    const pinnedIds = new Set(($activeStudent.pinnedChats || []).map(id => id));
    basePartners.sort((a,b) => (pinnedIds.has(getBuddyIdByName(b.name)) ? 1 : 0) - (pinnedIds.has(getBuddyIdByName(a.name)) ? 1 : 0));

    const filteredPartners = partnerQuery.trim() === ""
      ? basePartners
      : basePartners.filter(p => (p.name || "").toLowerCase().includes(partnerQuery.toLowerCase()));

    messagePartners = filteredPartners;

    if (!activeBuddyId && messagePartners.length > 0) {
      activeBuddyName = messagePartners[0].name;
      activeBuddyId = getBuddyIdByName(activeBuddyName);
    }
    
    if (activeBuddyId) {
      filteredMessages = allMessages.filter(m => 
        (normalizeId(m.fromId) === normalizeId($activeStudent.id) && normalizeId(m.toId) === normalizeId(activeBuddyId)) ||
        (normalizeId(m.toId) === normalizeId($activeStudent.id) && normalizeId(m.fromId) === normalizeId(activeBuddyId))
      );
    }
  }
  // Chat visibility and pinning controls (top-level scope)
  function toggleHideCurrentChat() {
    if (!$activeStudent || !activeBuddyId) return;
    const me = $activeStudent;
    const set = new Set(me.hiddenChats || []);
    if (set.has(activeBuddyId)) set.delete(activeBuddyId); else set.add(activeBuddyId);
    me.hiddenChats = Array.from(set);
    activeStudent.set({ ...me });
    students.set([ ...allStudents ]);
    if (typeof window !== 'undefined') { localStorage.setItem('studentsData', JSON.stringify(allStudents)); }
  }

  function togglePinCurrentChat() {
    if (!$activeStudent || !activeBuddyId) return;
    const me = $activeStudent;
    const set = new Set(me.pinnedChats || []);
    if (set.has(activeBuddyId)) set.delete(activeBuddyId); else set.add(activeBuddyId);
    me.pinnedChats = Array.from(set);
    activeStudent.set({ ...me });
    students.set([ ...allStudents ]);
    if (typeof window !== 'undefined') { localStorage.setItem('studentsData', JSON.stringify(allStudents)); }
  }
  function toggleContextMenu(buddy) {
    const id = getBuddyIdByName(buddy.name);
    contextMenuFor = contextMenuFor === id ? null : id;
  }

  function pinBuddy(buddy) {
    activeBuddyId = getBuddyIdByName(buddy.name);
    togglePinCurrentChat();
  }

  function hideBuddy(buddy) {
    activeBuddyId = getBuddyIdByName(buddy.name);
    toggleHideCurrentChat();
  }

  function markBuddyUnread(buddy) {
    activeBuddyId = getBuddyIdByName(buddy.name);
    markThreadUnread();
  }

  function simulateTyping() {
    isTyping = true;
    setTimeout(() => { isTyping = false; }, 1500);
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

  function getInitials(name) {
    if (!name) return '';
    const cleaned = name.replace(/^(Mr\.?|Ms\.?|Mrs\.?|Miss|Dr\.?|Master)\s+/i, '').trim();
    return cleaned.split(/\s+/).map(n => n[0] || '').join('').slice(0,2).toUpperCase();
  }

  function selectBuddy(buddy) {
    activeBuddyName = buddy.name;
    activeBuddyId = getBuddyIdByName(buddy.name);
    messageText = '';
  }

  function openContactModal() {
    if (!activeBuddyId) return;
    const student = getStudentById(allStudents, activeBuddyId);
    if (!student) return;
    contactForModal = {
      id: student.id,
      name: student.displayName || student.name,
      rank: student.rank,
      roles: student.roles || []
    };
    showContactModal = true;
  }

  function closeContactModal() {
    showContactModal = false;
    contactForModal = null;
  }

  function onViewProfile(contact) {
    const student = getStudentById(allStudents, contact.id);
    if (!student) return;
    profileStudent = student;
    showProfileModal = true;
  }

  function closeProfileModal() {
    showProfileModal = false;
    profileStudent = null;
  }

  function sendMessage() {
    if (!messageText.trim() || !activeBuddyId || !$activeStudent) return;
    
    // Use the store helper to update both sender and recipient
    const newMsg = storeSendMessage($activeStudent.id, activeBuddyId, messageText, allStudents);
    
    if (newMsg) {
      // Update local view
      allMessages = Array.isArray($activeStudent.messages) ? [...$activeStudent.messages] : [];
      // Ensure the just-sent message is visible even if store propagation lags
      const exists = allMessages.some(m => m.timestamp === newMsg.timestamp && m.text === newMsg.text);
      if (!exists) {
        allMessages = [...allMessages, newMsg];
        $activeStudent.messages = allMessages;
      }
      messageText = '';
      
      // Trigger reactivity by updating the store
      students.set([...allStudents]);
      activeStudent.set({...$activeStudent});

      // Recompute thread messages immediately for UX
      filteredMessages = allMessages.filter(m => 
        (normalizeId(m.fromId) === normalizeId($activeStudent.id) && normalizeId(m.toId) === normalizeId(activeBuddyId)) ||
        (normalizeId(m.toId) === normalizeId($activeStudent.id) && normalizeId(m.fromId) === normalizeId(activeBuddyId))
      );
      
      // Persist to localStorage temporarily (backend would save permanently)
      if (typeof window !== 'undefined') {
        localStorage.setItem('studentsData', JSON.stringify(allStudents));
      }
    }
  }

  // Mark current thread as unread (sets the latest incoming message to unread)
  function markThreadUnread() {
    if (!$activeStudent || !activeBuddyId) return;
    const me = $activeStudent;
    const lastIncomingIdx = (me.messages || []).slice().reverse().findIndex(m => normalizeId(m.fromId) === normalizeId(activeBuddyId) && normalizeId(m.toId) === normalizeId(me.id));
    if (lastIncomingIdx === -1) return;
    const idx = me.messages.length - 1 - lastIncomingIdx;
    me.messages[idx] = { ...me.messages[idx], read: false };
    activeStudent.set({ ...me });
    students.set([ ...allStudents ]);
    if (typeof window !== 'undefined') {
      localStorage.setItem('studentsData', JSON.stringify(allStudents));
    }
  }

  // Create a new chat by selecting a buddy from the roster
  function createNewChat() {
    const q = newChatBuddyQuery.trim();
    if (!q) return;
    const match = allStudents.find(s => (s.displayName || s.name).toLowerCase().includes(q.toLowerCase()));
    if (!match || match.id === $activeStudent?.id) return;
    activeBuddyId = match.id;
    activeBuddyName = match.displayName || match.name;
    // seed with an empty conversation state (no messages required)
    messageText = '';
  }

  // Delete the current chat thread for both participants
  function deleteCurrentChat() {
    if (!$activeStudent || !activeBuddyId) return;
    const me = $activeStudent;
    const other = getStudentById(allStudents, activeBuddyId);
    if (!other) return;
    const filterForPair = (msgs, aId, bId) => (Array.isArray(msgs) ? msgs.filter(m => !((m.fromId === aId && m.toId === bId) || (m.fromId === bId && m.toId === aId))) : []);
    me.messages = filterForPair(me.messages, me.id, other.id);
    other.messages = filterForPair(other.messages, me.id, other.id);
    students.set([...allStudents]);
    activeStudent.set({ ...me });
    // reset local view
    allMessages = [...me.messages];
    filteredMessages = [];
    activeBuddyId = null;
    activeBuddyName = null;
    // persist
    if (typeof window !== 'undefined') {
      localStorage.setItem('studentsData', JSON.stringify(allStudents));
    }
  }

  function getLastMessage(buddy) {
    const buddyId = getBuddyIdByName(buddy.name);
    const msgs = allMessages.filter(m => 
      (m.fromId === $activeStudent.id && m.toId === buddyId) ||
      (m.toId === $activeStudent.id && m.fromId === buddyId)
    );
    if (msgs.length === 0) return 'No messages yet';
    const last = msgs[msgs.length - 1];
    return last.text.length > 30 ? last.text.substring(0, 30) + '...' : last.text;
  }

  function getFormattedTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  let messageContainer;
  function scrollToBottom() {
    if (messageContainer) {
      setTimeout(() => {
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }, 0);
    }
  }

  $: if (filteredMessages) {
    scrollToBottom();
  }
</script>

<section class="messages-root">
  <div class="messages-panel">
    <!-- Fun strip -->
    <div class="messages-funstrip">
      <div class="fun-chip">
        <div class="fun-label">Unread</div>
        <div class="fun-value">{Array.isArray(allMessages) ? allMessages.filter(m => m.toId === $activeStudent?.id && m.read === false).length : 0}</div>
      </div>
      <div class="fun-chip">
        <div class="fun-label">Buddies</div>
        <div class="fun-value">{Array.isArray(buddies) ? buddies.length : 0}</div>
      </div>
      <div class="fun-chip">
        <div class="fun-label">Threads</div>
        <div class="fun-value">{Array.isArray(allMessages) ? new Set(allMessages.map(m => m.fromId === $activeStudent?.id ? m.toId : m.fromId)).size : 0}</div>
      </div>
    </div>
    <!-- Buddy List -->
    <div class="buddy-list">
      <h3 class="buddy-list-title">Messages</h3>
        <div class="buddy-filters">
        <button type="button" class="filter-chip {filterMode==='all' ? 'is-active' : ''}" on:click={() => filterMode='all'}>All</button>
        <button type="button" class="filter-chip {filterMode==='buddies' ? 'is-active' : ''}" on:click={() => filterMode='buddies'}>Buddies</button>
        <button type="button" class="filter-chip {filterMode==='unread' ? 'is-active' : ''}" on:click={() => filterMode='unread'}>Unread</button>
        </div>
        <div class="buddy-actions-row">
          <button type="button" class="mark-all-link" on:click={() => {
            if (!$activeStudent) return;
            const updated = ($activeStudent.messages || []).map(m => {
              if (m.toId === $activeStudent.id) return { ...m, read: true };
              return m;
            });
            $activeStudent.messages = updated;
            activeStudent.set({ ...$activeStudent });
            students.set([ ...allStudents ]);
            if (typeof window !== 'undefined') {
              localStorage.setItem('studentsData', JSON.stringify(allStudents));
            }
          }}>Mark all read</button>
          <div class="new-chat">
            <input type="text" class="new-chat-input" placeholder="Start new chat…" bind:value={newChatBuddyQuery} />
            <button type="button" class="new-chat-btn" on:click={createNewChat}>New Chat</button>
          </div>
        </div>
      <div class="buddy-search">
        <input type="text" class="buddy-search-input" placeholder="Search contacts…" bind:value={partnerQuery} />
      </div>
        <div class="buddy-list-scroll">
          {#if ($activeStudent?.pinnedChats||[]).length > 0}
            <div class="list-section">Pinned</div>
          {/if}
        {#each messagePartners as buddy (buddy.name)}
          <div 
            class="buddy-row {activeBuddyId === getBuddyIdByName(buddy.name) ? 'is-active' : ''}"
            role="button" tabindex="0"
            on:click={() => selectBuddy(buddy)}
            on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') selectBuddy(buddy); }}
          >
            <div class="buddy-avatar" style={`--avatar-bg: ${getBeltColorFromRank(buddy.rank || '')}`}>
              {getInitials(buddy.name)}
            </div>
            <div class="buddy-main">
              <div class="buddy-name">{buddy.name}</div>
              <div class="buddy-meta">
                {buddy.rank || ''}{buddy.streak ? ` · Streak: ${buddy.streak}` : ''}
              </div>
              <div class="buddy-preview">{getLastMessage(buddy.name)}</div>
            </div>
            {#if (allMessages || []).filter(m => normalizeId(m.fromId) === normalizeId(getBuddyIdByName(buddy.name)) && normalizeId(m.toId) === normalizeId($activeStudent?.id) && m.read === false).length > 0}
              <div class="buddy-unread">{(allMessages || []).filter(m => normalizeId(m.fromId) === normalizeId(getBuddyIdByName(buddy.name)) && normalizeId(m.toId) === normalizeId($activeStudent?.id) && m.read === false).length}</div>
            {/if}
              <button type="button" class="buddy-menu" on:click={(e) => { e.stopPropagation(); toggleContextMenu(buddy); }}>
                ⋮
              </button>
            </div>
            {#if contextMenuFor === getBuddyIdByName(buddy.name)}
              <div class="buddy-context">
                <button class="ctx-btn" on:click={() => pinBuddy(buddy)}>Pin/Unpin</button>
                <button class="ctx-btn" on:click={() => hideBuddy(buddy)}>Hide/Unhide</button>
                <button class="ctx-btn" on:click={() => markBuddyUnread(buddy)}>Mark Unread</button>
              </div>
            {/if}
        {/each}
      </div>
    </div>

    <!-- Message Thread -->
    <div class="message-thread">
      {#if activeBuddyId}
        <div class="thread-header">
          <div class="thread-title-row">
            <div class="presence-dot" class:is-unread={(allMessages||[]).some(m => m.fromId === activeBuddyId && m.toId === $activeStudent?.id && m.read === false)}></div>
            <h2 class="thread-title">{activeBuddyName}</h2>
          </div>
            <div class="thread-actions">
              <button type="button" class="contact-btn" on:click={openContactModal}>Contact</button>
              <button type="button" class="contact-btn" on:click={() => togglePinCurrentChat()}>{($activeStudent?.pinnedChats||[]).includes(activeBuddyId) ? 'Unpin' : 'Pin'}</button>
              <button type="button" class="contact-btn" on:click={() => toggleHideCurrentChat()}>{($activeStudent?.hiddenChats||[]).includes(activeBuddyId) ? 'Unhide' : 'Hide'}</button>
              <button type="button" class="contact-btn" on:click={markThreadUnread}>Mark Unread</button>
              <button type="button" class="contact-btn danger" on:click={deleteCurrentChat}>Delete Chat</button>
            </div>
        </div>
        
        <div class="message-scroll" bind:this={messageContainer}>
          {#if isTyping}
            <div class="typing-indicator"><span></span><span></span><span></span></div>
          {/if}
          {#each filteredMessages as msg (msg.timestamp)}
            <div class="message-bubble {msg.fromId === $activeStudent?.id ? 'is-sent' : 'is-received'}">
              <div class="bubble-content">{msg.text}</div>
              <div class="bubble-time" title={new Date(msg.timestamp).toLocaleString()}>{getFormattedTime(msg.timestamp)}</div>
            </div>
          {/each}
        </div>

        <div class="message-input-box">
          <input 
            type="text" 
            placeholder="Type a message..." 
            bind:value={messageText}
            on:keydown={(e) => { if (e.key === 'Enter') { sendMessage(); } else { simulateTyping(); } }}
            class="message-input"
          />
          <button type="button" class="send-btn" on:click={sendMessage}>Send</button>
        </div>
      {:else}
        <div class="empty-state">
          <p>Select a buddy to start chatting</p>
        </div>
      {/if}
    </div>
  </div>
</section>

<ContactModal open={showContactModal} contact={contactForModal} onClose={closeContactModal} onViewProfile={onViewProfile} />
<ProfileModal open={showProfileModal} student={profileStudent} onClose={closeProfileModal} />

<style>
  .messages-root {
    padding: 20px;
    color: var(--text-main, #e5e7eb);
  }

  .messages-panel {
    display: grid;
    grid-template-columns: minmax(0, 260px) minmax(0, 1fr);
    grid-template-rows: auto 1fr;
    gap: 1.5rem;
    align-items: stretch;
    height: calc(100vh - 280px);
    min-height: 500px;
  }

  .messages-funstrip { display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 10px; grid-column: 1 / -1; grid-row: 1; }
  .fun-chip { display:flex; flex-direction:column; align-items:center; gap:6px; padding:10px; border-radius:12px; background: rgba(255,255,255,0.03); border:1px solid rgba(148,163,184,0.15); }
  .fun-label { font-size:0.75rem; color: var(--text-muted,#9ca3af); text-transform: uppercase; letter-spacing:0.06em }
  .fun-value { font-weight:800; color: var(--text-main,#e5e7eb) }

  @media (max-width: 900px) {
    .messages-panel {
      grid-template-columns: 1fr;
      height: auto;
    }
  }

  /* Buddy List */
  .buddy-list {
    background: var(--panel-bg, rgba(15, 23, 42, 0.86));
    border-radius: 14px;
    padding: 16px;
    box-shadow: var(--panel-shadow, 0 8px 16px rgba(0, 0, 0, 0.3));
    display: flex;
    flex-direction: column;
    gap: 12px;
    border: 1px solid rgba(148, 163, 184, 0.15);
    grid-row: 2;
  }

  .buddy-search { display: flex; }
  .buddy-search-input {
    width: 100%;
    padding: 8px 10px;
    border-radius: 10px;
    border: 1px solid rgba(148, 163, 184, 0.2);
    background: rgba(2,6,23,0.6);
    color: var(--text-main, #e5e7eb);
    font-size: 0.9rem;
  }
  .buddy-search-input::placeholder { color: #64748b; }

  .buddy-list-title {
    margin: 0 0 8px 0;
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-main, #e5e7eb);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .buddy-list-scroll {
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;
    padding-right: 4px;
    max-height: calc(100vh - 420px);
  }

  .buddy-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid rgba(148, 163, 184, 0.1);
    background: rgba(255, 255, 255, 0.02);
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: left;
    color: inherit;
  }

  .buddy-row:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(148, 163, 184, 0.3);
    transform: translateY(-1px);
  }
  .buddy-menu { margin-left:auto; padding:4px 6px; border-radius:6px; border:1px solid rgba(148,163,184,0.15); background: rgba(255,255,255,0.04); color:#e5e7eb; cursor:pointer }
  .buddy-menu:hover { background: rgba(255,255,255,0.08) }
  .buddy-context { margin-top:-6px; margin-bottom:6px; display:flex; gap:6px; justify-content:flex-end }
  .ctx-btn { padding:6px 10px; border-radius:8px; border:1px solid rgba(148,163,184,0.25); background: rgba(255,255,255,0.06); color:#e5e7eb; cursor:pointer }
  .list-section { font-size:0.75rem; color: var(--text-muted,#9ca3af); text-transform: uppercase; letter-spacing:0.08em; margin: 0 0 6px 0 }

  .buddy-row.is-active {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(56, 189, 248, 0.15));
    border-color: rgba(56, 189, 248, 0.5);
  }

  .buddy-avatar {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.9rem;
    color: white;
    background-color: var(--avatar-bg, #64748b);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    position: relative;
    overflow: hidden;
  }
  .buddy-avatar::after { content:""; position:absolute; bottom:4px; right:4px; width:8px; height:8px; border-radius:999px; background: #10b981; box-shadow: 0 0 6px rgba(16,185,129,0.6) }

  .buddy-main {
    flex: 1;
    min-width: 0;
  }

  .buddy-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-main, #e5e7eb);
    margin: 0;
  }

  .buddy-meta {
    font-size: 0.75rem;
    color: var(--text-muted, #9ca3af);
    margin: 2px 0 0 0;
  }

  .buddy-preview {
    font-size: 0.78rem;
    color: var(--text-muted, #9ca3af);
    margin: 2px 0 0 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Message Thread */
  .message-thread {
    background: var(--panel-bg, rgba(15, 23, 42, 0.86));
    border-radius: 14px;
    padding: 16px;
    box-shadow: var(--panel-shadow, 0 8px 16px rgba(0, 0, 0, 0.3));
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(148, 163, 184, 0.15);
    grid-row: 2;
  }

  /* Filters placeholder */
  .buddy-filters { display:flex; gap:6px; margin-bottom:6px }
  .filter-chip { padding:6px 10px; border-radius:999px; border:1px solid rgba(148,163,184,0.25); background: rgba(255,255,255,0.06); color:#e5e7eb; cursor:pointer }
  .filter-chip.is-active { border-color: rgba(56,189,248,0.4); background: rgba(56,189,248,0.12) }
  .mark-all-link { margin-left:auto; background:none; border:none; color:#93c5fd; font-weight:600; cursor:pointer; padding:0 4px; }
  .mark-all-link:hover { color:#bfdbfe; text-decoration: underline; }
  .buddy-actions-row { display:flex; justify-content:flex-end; margin-bottom:6px }

  .thread-header {
    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    padding-bottom: 12px;
    margin-bottom: 12px;
    display:flex; align-items:center; justify-content:space-between; gap:0.5rem;
  }
  .thread-actions { display:flex; gap:8px }

  .thread-title {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-main, #e5e7eb);
  }
  .thread-title-row { display:flex; align-items:center; gap:8px }
  .presence-dot { width:10px; height:10px; border-radius:999px; background: rgba(148,163,184,0.4) }
  .presence-dot.is-unread { background: #ef4444; box-shadow: 0 0 8px rgba(239,68,68,0.6) }

  .contact-btn { padding: 8px 12px; border-radius: 8px; border:1px solid rgba(148,163,184,0.25); background: rgba(255,255,255,0.06); color:#e5e7eb; cursor:pointer; }
  .contact-btn:hover { background: rgba(255,255,255,0.1); }
  .contact-btn.danger { border-color: rgba(239,68,68,0.5); color:#fecaca }
  .contact-btn.danger:hover { background: rgba(239,68,68,0.15) }
  .new-chat { display:flex; gap:6px; align-items:center; margin-left:auto }
  .new-chat-input { flex:1; min-width: 140px; padding:6px 8px; border-radius:8px; border:1px solid rgba(148,163,184,0.2); background: rgba(2,6,23,0.6); color: var(--text-main,#e5e7eb) }
  .new-chat-input::placeholder { color:#64748b }
  .new-chat-btn { padding:6px 10px; border-radius:8px; border:1px solid rgba(148,163,184,0.25); background: rgba(255,255,255,0.06); color:#e5e7eb; cursor:pointer }
  .new-chat-btn:hover { background: rgba(255,255,255,0.1) }

  .message-scroll {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-right: 8px;
    margin-bottom: 12px;
  }

  .message-bubble {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-width: 70%;
    padding: 10px 14px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(148, 163, 184, 0.1);
  }
  .typing-indicator { display:flex; gap:4px; padding:8px 10px; border-radius:10px; width:max-content; background: rgba(255,255,255,0.04); border:1px solid rgba(148,163,184,0.1); margin: 0 0 6px 0 }
  .typing-indicator span { width:6px; height:6px; border-radius:999px; background:#93c5fd; animation: bounce 1s infinite ease-in-out }
  .typing-indicator span:nth-child(2) { animation-delay: 0.2s }
  .typing-indicator span:nth-child(3) { animation-delay: 0.4s }
  @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); opacity:0.6 } 40% { transform: translateY(-6px); opacity:1 } }

  .message-bubble.is-sent {
    align-self: flex-end;
    background: rgba(56, 189, 248, 0.15);
    border-color: rgba(56, 189, 248, 0.3);
  }

  .bubble-content {
    color: var(--text-main, #e5e7eb);
    word-wrap: break-word;
  }

  .bubble-time {
    font-size: 0.7rem;
    color: var(--text-muted, #9ca3af);
  }

  .message-input-box {
    display: flex;
    gap: 8px;
  }

  .message-input {
    flex: 1;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid rgba(148, 163, 184, 0.2);
    background: rgba(255, 255, 255, 0.03);
    color: var(--text-main, #e5e7eb);
    font-size: 0.9rem;
  }

  .message-input::placeholder {
    color: var(--text-muted, #9ca3af);
  }

  .message-input:focus {
    outline: none;
    border-color: rgba(56, 189, 248, 0.5);
    background: rgba(255, 255, 255, 0.05);
  }

  .send-btn {
    padding: 10px 16px;
    border-radius: 8px;
    border: none;
    background: linear-gradient(135deg, #38bdf8, #0ea5e9);
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .send-btn:hover {
    box-shadow: 0 4px 12px rgba(56, 189, 248, 0.3);
    transform: translateY(-2px);
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-muted, #9ca3af);
    font-size: 1rem;
  }
</style>
