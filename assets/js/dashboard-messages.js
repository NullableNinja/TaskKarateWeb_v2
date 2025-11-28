// =========================================================
// Student Hub — MESSAGES TAB (threaded inbox)
// =========================================================

function renderMessages() {
  const container = document.getElementById("hubContent");
  const s = state.activeStudent;
  if (!container || !s) return;

  const buddies = Array.isArray(s.buddies) ? s.buddies : [];

  if (!state.activeBuddyId && buddies.length > 0) {
    state.activeBuddyId = buddies[0].name;
  }

  const buddyListHtml = buddies.length
    ? buddies
        .map((b) => {
          const key = b.name;
          const beltColor = getBeltColorFromRank(b.rank || "");
          const initials = getInitialsFromName(b.name);
          const unreadCount = calculateUnreadCount(s, key);

          const messages = Array.isArray(s.messages) ? s.messages : [];
          const buddyMessages = messages.filter(
            (m) =>
              (m.fromId === s.id && m.toId === key) ||
              (m.toId === s.id && m.fromId === key)
          );
          const last = buddyMessages.length
            ? buddyMessages[buddyMessages.length - 1]
            : null;
          const preview = last ? last.text : "No messages yet";
          const isActive = state.activeBuddyId === key;

          return `
            <button type="button"
              class="buddy-row ${isActive ? "is-active" : ""}"
              data-buddy-key="${key.replace(/"/g, "&quot;")}">
              <div class="buddy-avatar" style="--avatar-bg: ${beltColor};">
                ${initials}
              </div>
              <div class="buddy-main">
                <div class="buddy-name">${b.name}</div>
                <div class="buddy-meta">
                  ${b.rank || ""}${b.streak ? " · Streak: " + b.streak : ""}
                </div>
                <div class="buddy-preview">${preview}</div>
              </div>
              ${
                unreadCount > 0
                  ? `<div class="buddy-unread">${unreadCount}</div>`
                  : ""
              }
            </button>
          `;
        })
        .join("")
    : '<p class="muted text-sm">No buddies assigned yet. Pair up in class to unlock messaging.</p>';

  const activeKey = state.activeBuddyId;
  let threadViewHtml = "";

  if (!activeKey || !buddies.length) {
    threadViewHtml = `
      <div class="thread-shell">
        <div class="thread-empty">
          Select a training buddy on the left to start a message thread.
        </div>
      </div>
    `;
  } else {
    const buddy = buddies.find((b) => b.name === activeKey);
    const beltColor = getBeltColorFromRank(buddy ? buddy.rank || "" : "");
    const initials = getInitialsFromName(activeKey);

    const messages = Array.isArray(s.messages) ? s.messages : [];
    const threadMessages = messages.filter(
      (m) =>
        (m.fromId === s.id && m.toId === activeKey) ||
        (m.toId === s.id && m.fromId === activeKey)
    );

    markMessagesAsRead(s, activeKey);

    const messagesHtml = threadMessages.length
      ? threadMessages
          .map((m) => {
            const isMe = m.fromId === s.id;
            const fromLabel = isMe ? "You" : activeKey;
            const timeLabel = formatMessageTime(m.timestamp);

            return `
              <div class="chat-message ${isMe ? "chat-message--me" : ""}">
                <div class="chat-from">${fromLabel}</div>
                <div class="chat-text">${m.text}</div>
                <div class="chat-time">${timeLabel}</div>
              </div>
            `;
          })
          .join("")
      : `
        <div class="thread-empty">
          No messages yet. Send a quick note to say hi!
        </div>
      `;

    threadViewHtml = `
      <div class="thread-shell">
        <header class="thread-header">
          <div class="buddy-avatar" style="--avatar-bg: ${beltColor};">
            ${initials}
          </div>
          <div>
            <div class="thread-title">${activeKey}</div>
            <div class="thread-subtitle">
              ${buddy && buddy.status ? buddy.status : "Training buddy"}
            </div>
          </div>
        </header>

        <div id="chatThread" class="thread-body">
          ${messagesHtml}
        </div>

        <form id="msgForm" class="thread-input" autocomplete="off">
          <input type="text" id="msgInput" class="form-input" placeholder="Type a quick note…" />
          <button type="submit" class="btn btn--primary">Send</button>
        </form>
      </div>
    `;
  }

  container.innerHTML = `
    <section class="panel messages-panel">
      <aside class="buddy-list">
        <h3 class="panel-title">Training Buddies</h3>

        <div class="instructor-only">
          <button type="button" class="instructor-edit-btn" data-panel="messages-buddies">
            Manage Buddies
          </button>
        </div>

        <div class="buddy-list-scroll">
          ${buddyListHtml}
        </div>
      </aside>

      <div class="thread-area">
        <div class="thread-area-header">
          <div class="thread-area-title-row">
            <h3 class="panel-title">Messages</h3>

            <div class="instructor-only">
              <button type="button" class="instructor-edit-btn" data-panel="messages-thread">
                Review Messages
              </button>
            </div>
          </div>
        </div>

        ${threadViewHtml}
      </div>
    </section>
  `;

  wireInstructorEditButtons();

  const buddyRows = container.querySelectorAll(".buddy-row");
  buddyRows.forEach((row) => {
    const key = row.dataset.buddyKey;
    if (!key) return;
    row.addEventListener("click", () => {
      state.activeBuddyId = key;
      renderMessages();
    });
  });

  const form = document.getElementById("msgForm");
  const input = document.getElementById("msgInput");
  const threadBody = document.getElementById("chatThread");

  if (form && input && activeKey) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;

      const nowIso = new Date().toISOString();
      const newMessage = {
        fromId: s.id,
        toId: activeKey,
        text,
        timestamp: nowIso,
        read: false
      };

      if (!Array.isArray(s.messages)) s.messages = [];
      s.messages.push(newMessage);

      const recipient = state.students.find((st) => st.id === activeKey);
      if (recipient) {
        if (!Array.isArray(recipient.messages)) recipient.messages = [];
        recipient.messages.push({ ...newMessage, read: false });
      }

      input.value = "";
      renderMessages();

      const newThreadBody = document.getElementById("chatThread");
      if (newThreadBody) {
        newThreadBody.scrollTop = newThreadBody.scrollHeight;
      }
    });

    if (threadBody) {
      threadBody.scrollTop = threadBody.scrollHeight;
    }
  }
}
