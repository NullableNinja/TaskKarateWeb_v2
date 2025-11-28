// =========================================================
// Student Hub — Instructor Editor Panel + Edit Routing
// Depends on globals from dashboard-core.js
// =========================================================

// ---------------------------------------------------------
// [1] EDITOR SHELL
// ---------------------------------------------------------
function buildEditorShell() {
  editorBackdrop = document.createElement("div");
  editorBackdrop.id = "instructorEditorBackdrop";
  editorBackdrop.className = "instructor-editor-backdrop";

  editorPanel = document.createElement("aside");
  editorPanel.className = "instructor-editor-panel";
  editorPanel.setAttribute("role", "dialog");
  editorPanel.setAttribute("aria-modal", "true");
  editorPanel.setAttribute("aria-labelledby", "instructorEditorTitle");

  const header = document.createElement("header");
  header.className = "instructor-editor-header";

  editorTitleEl = document.createElement("h2");
  editorTitleEl.id = "instructorEditorTitle";
  editorTitleEl.textContent = "Edit";

  editorCloseBtn = document.createElement("button");
  editorCloseBtn.type = "button";
  editorCloseBtn.className = "editor-close-btn";
  editorCloseBtn.innerHTML = "&times;";

  header.appendChild(editorTitleEl);
  header.appendChild(editorCloseBtn);

  editorBodyEl = document.createElement("div");
  editorBodyEl.id = "instructorEditorBody";
  editorBodyEl.className = "instructor-editor-body";

  editorPanel.appendChild(header);
  editorPanel.appendChild(editorBodyEl);
  editorBackdrop.appendChild(editorPanel);
  document.body.appendChild(editorBackdrop);

  editorCloseBtn.addEventListener("click", closeEditor);

  editorBackdrop.addEventListener("click", (evt) => {
    if (evt.target === editorBackdrop) closeEditor();
  });

  document.addEventListener("keydown", (evt) => {
    if (evt.key === "Escape") closeEditor();
  });
}

function openEditor(options) {
  if (!editorBackdrop || !editorPanel || !editorTitleEl || !editorBodyEl) return;

  const title = options && options.title ? options.title : "Edit";
  const html = options && options.contentHtml ? options.contentHtml : "";

  editorTitleEl.textContent = title;
  editorBodyEl.innerHTML = html;

  editorBackdrop.classList.add("is-open");
  dashboardRoot.classList.add("editor-open");
}

function closeEditor() {
  if (!editorBackdrop || !editorBodyEl) return;
  editorBackdrop.classList.remove("is-open");
  dashboardRoot.classList.remove("editor-open");
  editorBodyEl.innerHTML = "";
}

// ---------------------------------------------------------
// [2] INSTRUCTOR BUTTON WIRING + ROUTER
// ---------------------------------------------------------
function wireInstructorEditButtons() {
  const buttons = document.querySelectorAll(".instructor-edit-btn");
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const panelId = btn.dataset.panel || "";
      handleInstructorEdit(panelId);
    });
  });
}

function handleInstructorEdit(panelId) {
  const s = state.activeStudent;
  if (!s) return;

  switch (panelId) {
    // STATUS TAB
    case "status-about":
      openStatusAboutEditor();
      break;
    case "status-progress":
      openStatusProgressEditor();
      break;
    case "status-trainingstats":
      openStatusTrainingStatsEditor();
      break;
    case "status-gear":
      openPlaceholderEditor("Configure Gear", "Gear editor coming soon.");
      break;

    // TRAINING TAB
    case "training-assignments":
      openAssignmentsEditor();
      break;
    case "training-practice":
      openPlaceholderEditor(
        "Edit Practice Deck",
        "Practice deck editor coming soon."
      );
      break;

    // MESSAGES TAB
    case "messages-buddies":
      openPlaceholderEditor(
        "Manage Buddies",
        "Buddy assignment tools coming soon."
      );
      break;
    case "messages-thread":
      openMessageReviewEditor();
      break;

    // ACHIEVEMENTS TAB
    case "achievements-badges":
      openPlaceholderEditor("Edit Badges", "Badge management editor coming soon.");
      break;
    case "achievements-goldstars":
      openPlaceholderEditor("Edit Gold Stars", "Gold Star editor coming soon.");
      break;

    // NEWS TAB
    case "news-dojo":
      openPlaceholderEditor("Edit News", "News post editor coming soon.");
      break;

    default:
      openPlaceholderEditor("Edit", "Editor not yet implemented for this panel.");
      break;
  }
}

// Generic placeholder
function openPlaceholderEditor(title, message) {
  openEditor({
    title: title || "Edit",
    contentHtml: `
      <p class="muted">
        ${message || "Editor coming soon."}
      </p>
      <div class="editor-actions">
        <button type="button" class="btn btn--primary" id="placeholderCloseBtn">
          Close
        </button>
      </div>
    `,
  });

  const btn = document.getElementById("placeholderCloseBtn");
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      closeEditor();
    });
  }
}

// ---------------------------------------------------------
// [3] STATUS TAB EDITORS
// ---------------------------------------------------------
function openStatusAboutEditor() {
  const s = state.activeStudent;
  if (!s) return;

  openEditor({
    title: "Edit Profile",
    contentHtml: `
      <form id="statusAboutForm" class="editor-form" autocomplete="off">
        <div class="form-row">
          <label class="form-label" for="editName">Full Name</label>
          <input id="editName" type="text" class="form-input" value="${
            s.name || ""
          }" />
        </div>

        <div class="form-row">
          <label class="form-label" for="editRank">Primary Rank</label>
          <input id="editRank" type="text" class="form-input" value="${
            s.rank || ""
          }" />
        </div>

        <div class="form-row">
          <label class="form-label" for="editIS3Rank">IS3 Rank</label>
          <input id="editIS3Rank" type="text" class="form-input" value="${
            s.is3Rank || ""
          }" />
        </div>

        <div class="form-row">
          <label class="form-label" for="editUniformSize">Uniform Size</label>
          <input id="editUniformSize" type="text" class="form-input" value="${
            s.uniformSize || ""
          }" />
        </div>

        <div class="form-row">
          <label class="form-label" for="editBeltSize">Belt Size</label>
          <input id="editBeltSize" type="text" class="form-input" value="${
            s.beltSize || ""
          }" />
        </div>

        <div class="form-row">
          <label class="form-label" for="editYearsTraining">Years Training</label>
          <input
            id="editYearsTraining"
            type="number"
            min="0"
            step="0.1"
            class="form-input"
            value="${s.yearsTraining || 0}"
          />
        </div>

        <p class="muted text-xs">
          <strong>Note:</strong> Changes here update the current session view only.
          Saving to the real student list will be part of a future admin tool.
        </p>

        <div class="editor-actions">
          <button type="button" class="btn btn--ghost" id="statusAboutCancel">
            Cancel
          </button>
          <button type="submit" class="btn btn--primary">Save Changes</button>
        </div>
      </form>
    `,
  });

  const form = document.getElementById("statusAboutForm");
  const cancelBtn = document.getElementById("statusAboutCancel");

  if (cancelBtn) {
    cancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closeEditor();
    });
  }

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nameInput = document.getElementById("editName");
    const rankInput = document.getElementById("editRank");
    const is3Input = document.getElementById("editIS3Rank");
    const uniformInput = document.getElementById("editUniformSize");
    const beltInput = document.getElementById("editBeltSize");
    const yearsInput = document.getElementById("editYearsTraining");

    s.name = nameInput ? nameInput.value.trim() : s.name;
    s.rank = rankInput ? rankInput.value.trim() : s.rank;
    s.is3Rank = is3Input ? is3Input.value.trim() : s.is3Rank;
    s.uniformSize = uniformInput ? uniformInput.value.trim() : s.uniformSize;
    s.beltSize = beltInput ? beltInput.value.trim() : s.beltSize;

    if (yearsInput) {
      const yrs = parseFloat(yearsInput.value);
      s.yearsTraining = isNaN(yrs) ? s.yearsTraining : yrs;
    }

    renderHeader(s);
    renderStatus();
    renderCapsuleStats();

    closeEditor();
  });
}

function openStatusProgressEditor() {
  const s = state.activeStudent;
  if (!s) return;

  const isDegree = s.rankType === "degree";

  openEditor({
    title: "Adjust Rank Progress",
    contentHtml: `
      <form id="statusProgressForm" class="editor-form" autocomplete="off">
        ${
          isDegree
            ? `
          <div class="form-row">
            <label class="form-label" for="editYearsRequired">Years Required for Degree</label>
            <input
              id="editYearsRequired"
              type="number"
              min="0"
              step="0.1"
              class="form-input"
              value="${s.yearsRequired || 1}"
            />
          </div>
          <div class="form-row">
            <label class="form-label" for="editYearsAtRank">Years at Current Rank</label>
            <input
              id="editYearsAtRank"
              type="number"
              min="0"
              step="0.1"
              class="form-input"
              value="${s.yearsAtRank || 0}"
            />
          </div>
        `
            : `
          <div class="form-row">
            <label class="form-label" for="editClassesPerStripe">Classes per Stripe</label>
            <input
              id="editClassesPerStripe"
              type="number"
              min="1"
              step="1"
              class="form-input"
              value="${s.classesPerStripe || 1}"
            />
          </div>
          <div class="form-row">
            <label class="form-label" for="editClassesSinceStripe">Classes Since Last Stripe</label>
            <input
              id="editClassesSinceStripe"
              type="number"
              min="0"
              step="1"
              class="form-input"
              value="${s.classesSinceStripe || 0}"
            />
          </div>
        `
        }

        <p class="muted text-xs">
          Use this editor to keep their stripe / degree progress in sync with your paper records.
        </p>

        <div class="editor-actions">
          <button type="button" class="btn btn--ghost" id="statusProgressCancel">
            Cancel
          </button>
          <button type="submit" class="btn btn--primary">Save Progress</button>
        </div>
      </form>
    `,
  });

  const form = document.getElementById("statusProgressForm");
  const cancelBtn = document.getElementById("statusProgressCancel");

  if (cancelBtn) {
    cancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closeEditor();
    });
  }

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (isDegree) {
      const yrsReqInput = document.getElementById("editYearsRequired");
      const yrsAtInput = document.getElementById("editYearsAtRank");

      if (yrsReqInput) {
        const val = parseFloat(yrsReqInput.value);
        s.yearsRequired = isNaN(val) || val <= 0 ? s.yearsRequired : val;
      }
      if (yrsAtInput) {
        const val = parseFloat(yrsAtInput.value);
        s.yearsAtRank = isNaN(val) || val < 0 ? s.yearsAtRank : val;
      }
    } else {
      const perInput = document.getElementById("editClassesPerStripe");
      const doneInput = document.getElementById("editClassesSinceStripe");

      if (perInput) {
        const val = parseInt(perInput.value, 10);
        s.classesPerStripe = isNaN(val) || val <= 0 ? s.classesPerStripe : val;
      }
      if (doneInput) {
        const val = parseInt(doneInput.value, 10);
        s.classesSinceStripe =
          isNaN(val) || val < 0 ? s.classesSinceStripe : val;
      }
    }

    renderHeader(s);
    renderStatus();
    renderCapsuleStats();

    closeEditor();
  });
}

function openStatusTrainingStatsEditor() {
  const s = state.activeStudent;
  if (!s) return;

  openEditor({
    title: "Edit Training Stats",
    contentHtml: `
      <form id="statusTrainingStatsForm" class="editor-form" autocomplete="off">
        <div class="form-row">
          <label class="form-label" for="editTotalClasses">Total Classes</label>
          <input
            id="editTotalClasses"
            type="number"
            min="0"
            step="1"
            class="form-input"
            value="${s.totalClasses || 0}"
          />
        </div>

        <div class="form-row">
          <label class="form-label" for="editMonthClasses">Classes This Month</label>
          <input
            id="editMonthClasses"
            type="number"
            min="0"
            step="1"
            class="form-input"
            value="${s.monthClasses || 0}"
          />
        </div>

        <div class="form-row">
          <label class="form-label" for="editStreakDays">Training Streak (days)</label>
          <input
            id="editStreakDays"
            type="number"
            min="0"
            step="1"
            class="form-input"
            value="${s.streakDays || 0}"
          />
        </div>

        <div class="form-row">
          <label class="form-label" for="editBeltsCount">Belts Earned (count)</label>
          <input
            id="editBeltsCount"
            type="number"
            min="0"
            step="1"
            class="form-input"
            value="${
              Array.isArray(s.belts) ? s.belts.length : s.belts || 0
            }"
          />
        </div>

        <p class="muted text-xs">
          This is a quick override tool for streak / class counts.
        </p>

        <div class="editor-actions">
          <button
            type="button"
            class="btn btn--ghost"
            id="statusTrainingStatsCancel"
          >
            Cancel
          </button>
          <button type="submit" class="btn btn--primary">Save Stats</button>
        </div>
      </form>
    `,
  });

  const form = document.getElementById("statusTrainingStatsForm");
  const cancelBtn = document.getElementById("statusTrainingStatsCancel");

  if (cancelBtn) {
    cancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closeEditor();
    });
  }

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const totalInput = document.getElementById("editTotalClasses");
    const monthInput = document.getElementById("editMonthClasses");
    const streakInput = document.getElementById("editStreakDays");
    const beltsInput = document.getElementById("editBeltsCount");

    if (totalInput) {
      const val = parseInt(totalInput.value, 10);
      s.totalClasses = isNaN(val) || val < 0 ? s.totalClasses : val;
    }
    if (monthInput) {
      const val = parseInt(monthInput.value, 10);
      s.monthClasses = isNaN(val) || val < 0 ? s.monthClasses : val;
    }
    if (streakInput) {
      const val = parseInt(streakInput.value, 10);
      s.streakDays = isNaN(val) || val < 0 ? s.streakDays : val;
    }
    if (beltsInput) {
      const val = parseInt(beltsInput.value, 10);
      if (!isNaN(val) && val >= 0) {
        if (Array.isArray(s.belts)) {
          if (s.belts.length > val) {
            s.belts = s.belts.slice(0, val);
          } else {
            while (s.belts.length < val) {
              s.belts.push("Belt");
            }
          }
        } else {
          s.belts = val;
        }
      }
    }

    renderStatus();
    renderCapsuleStats();

    closeEditor();
  });
}

// ---------------------------------------------------------
// [4] TRAINING TAB EDITOR
// ---------------------------------------------------------
function openAssignmentsEditor() {
  const s = state.activeStudent;
  if (!s) return;

  const assignments = Array.isArray(s.assignments) ? s.assignments : [];

  const assignmentsListHtml = assignments.length
    ? assignments
        .map(
          (a, i) => `
        <div class="assignment-item" data-index="${i}">
          <div class="assignment-header">
            <strong>${a.title || "Untitled Assignment"}</strong>
            <button type="button" class="btn-remove-assignment" data-index="${i}">
              Remove
            </button>
          </div>
          <div class="assignment-details">
            <p><small>Focus: ${a.focus || "General practice"}</small></p>
            <p><small>Due: ${a.due || "No due date"}</small></p>
            ${
              a.notes
                ? `<p><small>Notes: ${a.notes}</small></p>`
                : ""
            }
          </div>
        </div>
      `
        )
        .join("")
    : '<p class="muted">No assignments assigned yet.</p>';

  openEditor({
    title: "Manage Assignments",
    contentHtml: `
      <form id="assignmentsForm" class="editor-form" autocomplete="off">
        <div class="assignments-list">
          <h4>Current Assignments</h4>
          ${assignmentsListHtml}
        </div>

        <div class="new-assignment">
          <h4>Add New Assignment</h4>
          <div class="form-row">
            <label class="form-label" for="newAssignmentTitle">Title</label>
            <input
              id="newAssignmentTitle"
              type="text"
              class="form-input"
              placeholder="Assignment title..."
              required
            />
          </div>

          <div class="form-row">
            <label class="form-label" for="newAssignmentFocus">Focus</label>
            <input
              id="newAssignmentFocus"
              type="text"
              class="form-input"
              placeholder="Practice focus area..."
            />
          </div>

          <div class="form-row">
            <label class="form-label" for="newAssignmentNotes">Notes</label>
            <textarea
              id="newAssignmentNotes"
              class="form-input"
              rows="3"
              placeholder="Additional notes or instructions..."
            ></textarea>
          </div>

          <div class="form-row">
            <label class="form-label" for="newAssignmentDue">Due</label>
            <input
              id="newAssignmentDue"
              type="text"
              class="form-input"
              placeholder="e.g., Next Class, This Week"
            />
          </div>
        </div>

        <div class="editor-actions">
          <button type="button" class="btn btn--ghost" id="assignmentsCancel">
            Cancel
          </button>
          <button type="submit" class="btn btn--primary">Save Changes</button>
        </div>
      </form>
    `,
  });

  const form = document.getElementById("assignmentsForm");
  const cancelBtn = document.getElementById("assignmentsCancel");

  if (cancelBtn) {
    cancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closeEditor();
    });
  }

  if (!form) return;

  const removeButtons = form.querySelectorAll(".btn-remove-assignment");
  removeButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const index = parseInt(btn.dataset.index, 10);
      if (!isNaN(index)) {
        assignments.splice(index, 1);
        s.assignments = assignments;
        openAssignmentsEditor(); // refresh
      }
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const titleInput = document.getElementById("newAssignmentTitle");
    const focusInput = document.getElementById("newAssignmentFocus");
    const notesInput = document.getElementById("newAssignmentNotes");
    const dueInput = document.getElementById("newAssignmentDue");

    if (titleInput && titleInput.value.trim()) {
      const newAssignment = {
        title: titleInput.value.trim(),
        focus: focusInput ? focusInput.value.trim() : "",
        notes: notesInput ? notesInput.value.trim() : "",
        due: dueInput ? dueInput.value.trim() : "",
      };

      if (!Array.isArray(s.assignments)) s.assignments = [];
      s.assignments.push(newAssignment);
    }

    s.assignments = assignments;
    renderTraining();
    closeEditor();
  });
}

// ---------------------------------------------------------
// [5] MESSAGES REVIEW EDITOR
// ---------------------------------------------------------
function openMessageReviewEditor() {
  const s = state.activeStudent;
  if (!s) return;

  const messages = Array.isArray(s.messages) ? s.messages : [];

  const messagesListHtml = messages.length
    ? messages
        .map(
          (m) => `
      <div class="message-review-item">
        <div class="message-meta">
          <strong>From: ${
            getStudentNameById(m.fromId) || m.fromId || "Unknown"
          }</strong>
          <span>To: ${
            getStudentNameById(m.toId) || m.toId || "Unknown"
          }</span>
          <span>${formatMessageTime(m.timestamp)}</span>
        </div>
        <div class="message-text">"${m.text}"</div>
        <div class="message-status">Read: ${m.read ? "Yes" : "No"}</div>
      </div>
    `
        )
        .join("")
    : '<p class="muted">No messages for this student.</p>';

  openEditor({
    title: "Review Messages",
    contentHtml: `
      <div class="message-review">
        <h4>Message History for ${s.name}</h4>
        <div class="messages-list">
          ${messagesListHtml}
        </div>

        <div class="editor-actions">
          <button type="button" class="btn btn--primary" id="messageReviewClose">
            Close
          </button>
        </div>
      </div>
    `,
  });

  const closeBtn = document.getElementById("messageReviewClose");
  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closeEditor();
    });
  }
}
