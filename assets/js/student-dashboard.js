// =========================================================
// Task Karate – Student Hub
// Xbox × Punch-Out!! Style Dashboard (no modules)
// Includes Instructor Mode + Slide-In Editor Panel
// =========================================================

(function () {
  "use strict";

  // -------------------------------------------------------
  // [1] CONSTANTS + RUNTIME STATE
  // -------------------------------------------------------
  const SESSION_KEY = "tkStudentSession";

  const state = {
    students: [],
    news: [],
    activeStudent: null,
    activeThreadKey: null // buddy name for the active message thread
  };

  // Root-level DOM references
  let dashboardRoot = null;
  let instructorToggleWrapper = null;
  let instructorToggle = null;
  let instructorBanner = null;
  let instructorMode = false;

  // Slide-in editor references
  let editorBackdrop = null;
  let editorPanel = null;
  let editorTitleEl = null;
  let editorBodyEl = null;
  let editorCloseBtn = null;

  // -------------------------------------------------------
  // [2] ENTRYPOINT
  // -------------------------------------------------------
  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    // Root element (safety check)
    dashboardRoot = document.querySelector(".dashboard-root");
    if (!dashboardRoot) {
      console.warn("Dashboard root not found. Aborting student-dashboard.js init.");
      return;
    }

    // Build the global slide-in editor shell
    buildEditorShell();

    // Resolve session from localStorage
    const session = loadSession();
    if (!session) {
      window.location.href = "student-login.html";
      return;
    }

    // Cache instructor toggle DOM refs
    instructorToggleWrapper = document.getElementById("instructorToggleWrapper");
    instructorToggle = document.getElementById("instructorToggle");

    // Create a floating Instructor Mode banner
    instructorBanner = createInstructorBanner();

    // Load data from students.json
    try {
      const response = await fetch("./assets/data/students.json");
      if (!response.ok) {
        throw new Error("Unable to load students.json");
      }
      const data = await response.json();

      state.students = data.students || [];
      state.news = data.news || [];

      // Resolve active student from session.id → student.id
      state.activeStudent =
        state.students.find((s) => s.id === session.id) ||
        state.students[0] ||
        null;

      if (!state.activeStudent) {
        console.error("No student record found for dashboard.");
        return;
      }

      // Header + stat capsule
      renderHeader(state.activeStudent);
      renderCapsuleStats();

      // Tabs
      setupTabs();
      showTab("status");

      // Logout button
      setupLogout();

      // Instructor Mode (only for assistants/instructors)
      setupInstructorMode(state.activeStudent);

    } catch (err) {
      console.error("Error loading student data:", err);
    }
  }

  // -------------------------------------------------------
  // [3] SESSION HELPERS
  // -------------------------------------------------------
  function loadSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn("Unable to parse session storage:", e);
      return null;
    }
  }

  // -------------------------------------------------------
  // [4] LOGOUT
  // -------------------------------------------------------
  function setupLogout() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem(SESSION_KEY);
      window.location.href = "student-login.html";
    });
  }

  // -------------------------------------------------------
  // [5] INSTRUCTOR MODE (TOGGLE + BANNER)
  // -------------------------------------------------------

  /**
   * Create the floating "Instructor Mode" pill in the top-right.
   * Styled by .instructor-banner in student-dashboard.css.
   */
  function createInstructorBanner() {
    const banner = document.createElement("div");
    banner.className = "instructor-banner";
    banner.textContent = "Instructor Mode";
    document.body.appendChild(banner);
    return banner;
  }

  /**
   * Setup the instructor toggle based on roles.
   * Only assistants / instructors should see the toggle.
   */
  function setupInstructorMode(student) {
    if (!student) return;

    const roles = Array.isArray(student.roles) ? student.roles : [];

    const isStaff =
      roles.includes("assistant") ||
      roles.includes("instructor") ||
      roles.includes("senior-assistant") ||
      roles.includes("junior-instructor");

    if (!instructorToggleWrapper || !instructorToggle) return;

    if (!isStaff) {
      // Keep toggle hidden for standard students
      instructorToggleWrapper.classList.add("hidden");
      return;
    }

    // Make toggle visible for staff
    instructorToggleWrapper.classList.remove("hidden");

    // Basic click handler
    instructorToggle.addEventListener("click", () => {
      instructorMode = !instructorMode;
      setInstructorMode(instructorMode);
    });

    // (Optional future) persist instructor mode per session:
    // const saved = localStorage.getItem("tkInstructorMode");
    // if (saved === "true") {
    //   instructorMode = true;
    //   setInstructorMode(true);
    // }
  }

  /**
   * Flip instructor mode visual state.
   * - Toggles .instructor-mode-active on .dashboard-root
   * - Toggles .active on the switch
   * - Toggles .is-active on the floating banner
   * - Dispatches a custom event in case future panels need it
   */
  function setInstructorMode(active) {
    if (!dashboardRoot || !instructorToggle) return;

    if (active) {
      dashboardRoot.classList.add("instructor-mode-active");
      instructorToggle.classList.add("active");
    } else {
      dashboardRoot.classList.remove("instructor-mode-active");
      instructorToggle.classList.remove("active");
    }

    if (instructorBanner) {
      instructorBanner.classList.toggle("is-active", active);
    }

    // Broadcast for future enhancements (panels can listen if needed)
    document.dispatchEvent(
      new CustomEvent("tk-instructor-mode", {
        detail: { active }
      })
    );

    // Optional: persist later
    // localStorage.setItem("tkInstructorMode", active ? "true" : "false");
  }

  // -------------------------------------------------------
  // [6] SLIDE-IN EDITOR PANEL (RIGHT SIDE)
  // -------------------------------------------------------

  /**
   * Build a single, reusable slide-in editor shell.
   * This is used for all instructor-only edit actions.
   */
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

    // Close handlers
    editorCloseBtn.addEventListener("click", closeEditor);

    editorBackdrop.addEventListener("click", (evt) => {
      // Only close when clicking on the dimmed backdrop, not inside the panel
      if (evt.target === editorBackdrop) {
        closeEditor();
      }
    });

    // ESC key to close
    document.addEventListener("keydown", (evt) => {
      if (evt.key === "Escape") {
        closeEditor();
      }
    });
  }

  /**
   * Open the slide-in editor with a given title + HTML body.
   * editorContentHtml should be a full chunk of form/layout markup.
   */
  function openEditor(options) {
    if (!editorBackdrop || !editorPanel || !editorTitleEl || !editorBodyEl) {
      return;
    }

    const title = options && options.title ? options.title : "Edit";
    const html = options && options.contentHtml ? options.contentHtml : "";

    editorTitleEl.textContent = title;
    editorBodyEl.innerHTML = html;

    editorBackdrop.classList.add("is-open");
    dashboardRoot.classList.add("editor-open"); // optional styling hook
  }

  /**
   * Close the editor and clear content.
   */
  function closeEditor() {
    if (!editorBackdrop || !editorBodyEl) return;
    editorBackdrop.classList.remove("is-open");
    dashboardRoot.classList.remove("editor-open");
    editorBodyEl.innerHTML = "";
  }

  /**
   * Wire up all .instructor-edit-btn elements currently in the DOM.
   * This must be called after each tab render.
   */
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

  /**
   * Route instructor edit actions by data-panel ID.
   * Each case can open a different editor form.
   */
  function handleInstructorEdit(panelId) {
    const s = state.activeStudent;
    if (!s) return;

    switch (panelId) {
      // STATUS TAB EDITORS
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

      // TRAINING TAB EDITORS
      case "training-assignments":
        openPlaceholderEditor("Edit Assignments", "Assignments editor coming soon.");
        break;
      case "training-practice":
        openPlaceholderEditor("Edit Practice Deck", "Practice deck editor coming soon.");
        break;

      // MESSAGES TAB EDITORS
      case "messages-buddies":
        openPlaceholderEditor("Manage Buddies", "Buddy assignment tools coming soon.");
        break;
      case "messages-thread":
        openPlaceholderEditor("Review Messages", "Message moderation tools coming soon.");
        break;

      // ACHIEVEMENTS TAB EDITORS
      case "achievements-badges":
        openPlaceholderEditor("Edit Badges", "Badge management editor coming soon.");
        break;
      case "achievements-goldstars":
        openPlaceholderEditor("Edit Gold Stars", "Gold Star editor coming soon.");
        break;

      // NEWS TAB EDITORS
      case "news-dojo":
        openPlaceholderEditor("Edit News", "News post editor coming soon.");
        break;

      default:
        openPlaceholderEditor("Edit", "Editor not yet implemented for this panel.");
        break;
    }
  }

  /**
   * Simple placeholder editor content while we build out other tools.
   */
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
      `
    });

    const btn = document.getElementById("placeholderCloseBtn");
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        closeEditor();
      });
    }
  }

  /**
   * Full implementation for "Edit Profile" (Status → About).
   * This updates the in-memory student and re-renders header + status tab.
   */
  function openStatusAboutEditor() {
    const s = state.activeStudent;
    if (!s) return;

    openEditor({
      title: "Edit Profile",
      contentHtml: `
        <form id="statusAboutForm" class="editor-form" autocomplete="off">
          <div class="form-row">
            <label class="form-label" for="editName">Full Name</label>
            <input
              id="editName"
              type="text"
              class="form-input"
              value="${s.name || ""}"
            />
          </div>

          <div class="form-row">
            <label class="form-label" for="editRank">Primary Rank</label>
            <input
              id="editRank"
              type="text"
              class="form-input"
              value="${s.rank || ""}"
            />
          </div>

          <div class="form-row">
            <label class="form-label" for="editIS3Rank">IS3 Rank</label>
            <input
              id="editIS3Rank"
              type="text"
              class="form-input"
              value="${s.is3Rank || ""}"
            />
          </div>

          <div class="form-row">
            <label class="form-label" for="editUniformSize">Uniform Size</label>
            <input
              id="editUniformSize"
              type="text"
              class="form-input"
              value="${s.uniformSize || ""}"
            />
          </div>

          <div class="form-row">
            <label class="form-label" for="editBeltSize">Belt Size</label>
            <input
              id="editBeltSize"
              type="text"
              class="form-input"
              value="${s.beltSize || ""}"
            />
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
            <button
              type="button"
              class="btn btn--ghost"
              id="statusAboutCancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn--primary"
            >
              Save Changes
            </button>
          </div>
        </form>
      `
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

      // Update in-memory student fields
      s.name = nameInput ? nameInput.value.trim() : s.name;
      s.rank = rankInput ? rankInput.value.trim() : s.rank;
      s.is3Rank = is3Input ? is3Input.value.trim() : s.is3Rank;
      s.uniformSize = uniformInput ? uniformInput.value.trim() : s.uniformSize;
      s.beltSize = beltInput ? beltInput.value.trim() : s.beltSize;

      if (yearsInput) {
        const yrs = parseFloat(yearsInput.value);
        s.yearsTraining = isNaN(yrs) ? s.yearsTraining : yrs;
      }

      // Re-render header + status tab + capsule
      renderHeader(s);
      renderStatus();
      renderCapsuleStats();

      closeEditor();
    });
  }

  /**
   * Stub editors for progress and training stats:
   * These are simple forms we can flesh out later.
   */
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
            <button
              type="button"
              class="btn btn--ghost"
              id="statusProgressCancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn--primary"
            >
              Save Progress
            </button>
          </div>
        </form>
      `
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
          s.classesSinceStripe = isNaN(val) || val < 0 ? s.classesSinceStripe : val;
        }
      }

      // Re-render header + status
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
                Array.isArray(s.belts) ? s.belts.length : (s.belts || 0)
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
            <button
              type="submit"
              class="btn btn--primary"
            >
              Save Stats
            </button>
          </div>
        </form>
      `
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
          // If s.belts is an array, we can pad or slice to match the count.
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

  // -------------------------------------------------------
  // [7] UTILS
  // -------------------------------------------------------
  function pickAvatarColor(student) {
    if (student && student.avatarColor) {
      return student.avatarColor;
    }

    const palette = [
      "#facc15",
      "#38bdf8",
      "#22c55e",
      "#f97316",
      "#a855f7",
      "#e11d48"
    ];

    const key = (student && (student.id || student.name)) || "tk";
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    }

    return palette[hash % palette.length];
  }

  function getBeltColorFromRank(rank) {
    if (!rank || typeof rank !== "string") return "#64748b";
    const r = rank.toLowerCase();

    if (r.includes("white")) return "#e5e7eb";
    if (r.includes("yellow")) return "#facc15";
    if (r.includes("orange")) return "#fb923c";
    if (r.includes("green")) return "#22c55e";
    if (r.includes("blue")) return "#3b82f6";
    if (r.includes("purple")) return "#a855f7";
    if (r.includes("red")) return "#ef4444";
    if (r.includes("brown")) return "#92400e";
    if (r.includes("black") || r.includes("degree")) return "#020617";

    return "#64748b";
  }

  function getInitialsFromName(name) {
    if (!name || typeof name !== "string") return "TK";
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return ((parts[0][0] || "") + (parts[parts.length - 1][0] || "")).toUpperCase();
  }

  function formatMessageTime(isoString) {
    if (!isoString) return "";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  function getMessageStoreKey(student) {
    const id = student && (student.id || student.name || "student");
    return `tkMessages_${id}`;
  }

  function loadMessageStore(student) {
    const key = getMessageStoreKey(student);
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        return { threads: {} };
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        return { threads: {} };
      }
      if (!parsed.threads || typeof parsed.threads !== "object") {
        parsed.threads = {};
      }
      return parsed;
    } catch (e) {
      console.warn("Unable to parse message store:", e);
      return { threads: {} };
    }
  }

  function saveMessageStore(student, store) {
    const key = getMessageStoreKey(student);
    try {
      localStorage.setItem(key, JSON.stringify(store));
    } catch (e) {
      console.warn("Unable to save message store:", e);
    }
  }

  // -------------------------------------------------------
  // [8] HEADER + CAPSULE
  // -------------------------------------------------------
  function renderHeader(student) {
    const initialsEl = document.getElementById("heroInitials");
    const nameEl = document.getElementById("heroName");
    const rankEl = document.getElementById("heroRank");
    const labelEl = document.getElementById("promoLabel");
    const detailEl = document.getElementById("promoDetail");
    const fillEl = document.getElementById("promoFill");
    const xpEl = document.getElementById("xpFill");
    const xpLabelEl = document.getElementById("xpLabel");
    const roleEl = document.getElementById("heroRole");

    if (!student) return;

    // Avatar initials
    if (initialsEl) {
      const initials = getInitialsFromName(student.name);
      initialsEl.textContent = initials;

      const avatarColor = pickAvatarColor(student);
      initialsEl.style.setProperty("--avatar-color", avatarColor);
    }

    // Name + rank
    if (nameEl) nameEl.textContent = student.name || "Student";
    if (rankEl) rankEl.textContent = student.rank || "Rank";

    // XP
    const xp = student.xp || 0;
    const xpNext = student.xpToNext || 100;
    const pctXP = Math.max(0, Math.min(1, xpNext === 0 ? 0 : xp / xpNext));

    if (xpEl) xpEl.style.width = (pctXP * 100).toFixed(0) + "%";
    if (xpLabelEl) xpLabelEl.textContent = `XP: ${xp}/${xpNext}`;

    // Stripe vs degree progress label + summary
    let pct = 0;
    let summary = "";

    if (student.rankType === "degree") {
      const per = student.yearsRequired || 1;
      const done = student.yearsAtRank || 0;
      pct = Math.max(0, Math.min(1, per === 0 ? 0 : done / per));
      const remainingYears = Math.max(0, per - done).toFixed(1);
      summary =
        remainingYears <= 0
          ? "Eligible to review for next degree!"
          : `${remainingYears} years until next degree review`;
      if (labelEl) labelEl.textContent = "Degree Progress";
    } else {
      const per = student.classesPerStripe || 1;
      const done = student.classesSinceStripe || 0;
      pct = Math.max(0, Math.min(1, per === 0 ? 0 : done / per));
      const remaining = Math.max(0, per - done);
      summary =
        remaining === 0
          ? "Ready to review for next stripe!"
          : `${remaining} class${remaining === 1 ? "" : "es"} until next stripe`;
      if (labelEl) labelEl.textContent = "Stripe Progress";
    }

    if (fillEl) fillEl.style.width = (pct * 100).toFixed(0) + "%";
    if (detailEl) detailEl.textContent = summary;

    // Role badge
    if (roleEl) {
      roleEl.textContent = "";
      roleEl.classList.remove("hero-role--senior", "hero-role--assistant", "hero-role--junior");

      const roles = Array.isArray(student.roles) ? student.roles : [];

      if (roles.includes("senior-assistant")) {
        roleEl.textContent = "Senior Assistant Instructor";
        roleEl.classList.add("hero-role--senior");
      } else if (roles.includes("assistant")) {
        roleEl.textContent = "Assistant Instructor";
        roleEl.classList.add("hero-role--assistant");
      } else if (roles.includes("junior-instructor")) {
        roleEl.textContent = "Junior Instructor";
        roleEl.classList.add("hero-role--junior");
      }
    }
  }

  function renderCapsuleStats() {
    const s = state.activeStudent;
    if (!s) return;

    const total = s.totalClasses || 0;
    const month = s.monthClasses || 0;
    const streak = s.streakDays || 0;
    const belts = Array.isArray(s.belts) ? s.belts.length : (s.belts || 0);
    const is3 = s.is3Rank || "—";

    const totalEl = document.getElementById("capsuleTotalClasses");
    const monthEl = document.getElementById("capsuleMonthClasses");
    const streakEl = document.getElementById("capsuleStreak");
    const beltsEl = document.getElementById("capsuleBelts");
    const is3El = document.getElementById("capsuleIS3");

    if (totalEl) totalEl.textContent = total;
    if (monthEl) monthEl.textContent = month;
    if (streakEl) streakEl.textContent = `${streak} days`;
    if (beltsEl) beltsEl.textContent = belts;
    if (is3El) is3El.textContent = is3;
  }

  // -------------------------------------------------------
  // [9] TABS
  // -------------------------------------------------------
  function setupTabs() {
    const tabs = document.querySelectorAll(".hub-tab");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("is-active"));
        tab.classList.add("is-active");
        showTab(tab.dataset.tab);
      });
    });
  }

  function showTab(name) {
    switch (name) {
      case "training":
        renderTraining();
        break;
      case "messages":
        renderMessages();
        break;
      case "achievements":
        renderAchievements();
        break;
      case "news":
        renderNews();
        break;
      case "status":
      default:
        renderStatus();
        renderCapsuleStats();
        break;
    }
  }

  // -------------------------------------------------------
  // [10] STATUS TAB (WITH INSTRUCTOR-ONLY EDIT CHIPS)
  // -------------------------------------------------------
  function renderStatus() {
    const container = document.getElementById("hubContent");
    const s = state.activeStudent;
    if (!container || !s) return;

    const progressPercent = calculateProgressPercent(s);
    const progressText = getProgressText(s);

    container.innerHTML = `
      <!-- =========================================================
           STATUS TAB — CHARACTER PANEL
           ========================================================= -->

      <!-- ABOUT PANEL -->
      <section class="panel panel--about">
        <h2 class="panel-title">About You</h2>
        <p class="panel-subtitle">Your martial arts identity at Task Karate.</p>

        <!-- Instructor-only control: edit basic profile -->
        <div class="instructor-only">
          <button
            type="button"
            class="instructor-edit-btn"
            data-panel="status-about"
          >
            Edit Profile
          </button>
        </div>

        <div class="about-grid">
          <div>
            <div class="label">Full Name</div>
            <div class="value">${s.name || "—"}</div>
          </div>
          <div>
            <div class="label">Primary Rank</div>
            <div class="value">${s.rank || "—"}</div>
          </div>
          <div>
            <div class="label">IS3 Rank</div>
            <div class="value">${s.is3Rank || "—"}</div>
          </div>
          <div>
            <div class="label">Uniform Size</div>
            <div class="value">${s.uniformSize || "—"}</div>
          </div>
          <div>
            <div class="label">Belt Size</div>
            <div class="value">${s.beltSize || "—"}</div>
          </div>
          <div>
            <div class="label">Years Training</div>
            <div class="value">${s.yearsTraining || 0}</div>
          </div>
        </div>
      </section>

      <!-- PROGRESS PANEL -->
      <section class="panel panel--progress">
        <h2 class="panel-title">Rank Progress</h2>
        <p class="panel-subtitle">Your journey toward your next stripe or degree.</p>

        <!-- Instructor-only: adjust rank progress -->
        <div class="instructor-only">
          <button
            type="button"
            class="instructor-edit-btn"
            data-panel="status-progress"
          >
            Adjust Progress
          </button>
        </div>

        <div class="progress-block">
          <div class="progress-label">
            ${s.rankType === "degree" ? "Degree Progress" : "Stripe Progress"}
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progressPercent}%;"></div>
          </div>
          <div class="progress-text">${progressText}</div>
        </div>
      </section>

      <!-- TRAINING STATS PANEL -->
      <section class="panel panel--trainingstats">
        <h2 class="panel-title">Training Stats</h2>
        <p class="panel-subtitle">Your training history across all systems.</p>

        <!-- Instructor-only: edit training stats -->
        <div class="instructor-only">
          <button
            type="button"
            class="instructor-edit-btn"
            data-panel="status-trainingstats"
          >
            Edit Training Stats
          </button>
        </div>

        <div class="trainingstats-grid">
          <div class="statbox">
            <p class="statbox-label">Total Classes</p>
            <p class="statbox-value">${s.totalClasses || 0}</p>
          </div>

          <div class="statbox">
            <p class="statbox-label">Classes This Month</p>
            <p class="statbox-value">${s.monthClasses || 0}</p>
          </div>

          <div class="statbox">
            <p class="statbox-label">Training Streak</p>
            <p class="statbox-value">${s.streakDays || 0} days</p>
          </div>

          <div class="statbox">
            <p class="statbox-label">Belts Earned</p>
            <p class="statbox-value">
              ${Array.isArray(s.belts) ? s.belts.length : (s.belts || 0)}
            </p>
          </div>
        </div>
      </section>

      <!-- GEAR PLACEHOLDER -->
      <section class="panel panel--gear">
        <h2 class="panel-title">Gear &amp; Equipment</h2>
        <p class="panel-subtitle">Pads, weapons, upgrades &amp; inventory tracking (coming soon).</p>

        <!-- Instructor-only: future gear editor -->
        <div class="instructor-only">
          <button
            type="button"
            class="instructor-edit-btn"
            data-panel="status-gear"
          >
            Configure Gear
          </button>
        </div>

        <div class="gear-empty">
          <p class="muted">Your gear will appear here once instructors enable it.</p>
        </div>
      </section>
    `;

    // After rebuilding the DOM, re-wire instructor buttons
    wireInstructorEditButtons();
  }

  // -------------------------------------------------------
  // [11] TRAINING TAB
  // -------------------------------------------------------
  function renderTraining() {
    const container = document.getElementById("hubContent");
    const s = state.activeStudent;
    if (!container || !s) return;

    const assignments = Array.isArray(s.assignments) ? s.assignments : [];
    const practice = Array.isArray(s.practice) ? s.practice : [];

    const assignmentsHtml = assignments.length
      ? assignments
          .map(
            (a) => `
          <article class="training-card">
            <h3>${a.title}</h3>
            <p class="muted">${a.focus || ""}</p>
            ${a.notes ? `<p class="notes">${a.notes}</p>` : ""}
            ${a.due ? `<p class="tag">Due: ${a.due}</p>` : ""}
          </article>
        `
          )
          .join("")
      : `<p class="muted">No homework right now. Use this week to sharpen basics.</p>`;

    const practiceHtml = practice.length
      ? practice
          .map(
            (p) => `
          <article class="training-card">
            <h3>${p.title}</h3>
            <p>${p.description || ""}</p>
            ${p.focus ? `<p class="muted">Focus: ${p.focus}</p>` : ""}
          </article>
        `
          )
          .join("")
      : `<p class="muted">Ask an instructor for a practice card to see it here.</p>`;

    container.innerHTML = `
      <!-- =========================================================
           TRAINING TAB
           ========================================================= -->

      <!-- ASSIGNMENTS -->
      <section class="panel">
        <h2 class="panel-title">Assignments</h2>
        <p class="panel-subtitle">Homework, at-home drills, and focus goals from your instructors.</p>

        <!-- Instructor-only: manage assignments for this student -->
        <div class="instructor-only">
          <button
            type="button"
            class="instructor-edit-btn"
            data-panel="training-assignments"
          >
            Edit Assignments
          </button>
        </div>

        <div class="training-grid">
          ${assignmentsHtml}
        </div>
      </section>

      <!-- PRACTICE DECK -->
      <section class="panel">
        <h2 class="panel-title">Practice Deck</h2>
        <p class="panel-subtitle">Quick practice cards you can use between classes.</p>

        <!-- Instructor-only: configure practice deck -->
        <div class="instructor-only">
          <button
            type="button"
            class="instructor-edit-btn"
            data-panel="training-practice"
          >
            Edit Practice Deck
          </button>
        </div>

        <div class="training-grid">
          ${practiceHtml}
        </div>
      </section>
    `;

    wireInstructorEditButtons();
  }

  // -------------------------------------------------------
  // [12] MESSAGES TAB — THREADED INBOX STYLE
  // -------------------------------------------------------
  function renderMessages() {
    const container = document.getElementById("hubContent");
    const s = state.activeStudent;
    if (!container || !s) return;

    const buddies = Array.isArray(s.buddies) ? s.buddies : [];

    // If we have buddies and no active thread yet, default to the first buddy.
    if (!state.activeThreadKey && buddies.length > 0) {
      state.activeThreadKey = buddies[0].name;
    }

    const store = loadMessageStore(s);
    const threads = store.threads || {};

    const buddyListHtml = buddies.length
      ? buddies
          .map((b) => {
            const key = b.name;
            const beltColor = getBeltColorFromRank(b.rank || "");
            const initials = getInitialsFromName(b.name);
            const thread = threads[key] || [];
            const last = thread.length ? thread[thread.length - 1] : null;
            const preview = last ? last.text : "No messages yet";

            const isActive = state.activeThreadKey === key;

            return `
              <button
                type="button"
                class="buddy-row ${isActive ? "is-active" : ""}"
                data-buddy-key="${key.replace(/"/g, "&quot;")}"
              >
                <div
                  class="buddy-avatar"
                  style="--avatar-bg: ${beltColor};"
                >
                  ${initials}
                </div>
                <div class="buddy-main">
                  <div class="buddy-name">${b.name}</div>
                  <div class="buddy-meta">
                    ${b.rank || ""}${b.streak ? " · Streak: " + b.streak : ""}
                  </div>
                  <div class="buddy-preview">
                    ${preview}
                  </div>
                </div>
              </button>
            `;
          })
          .join("")
      : `<p class="muted text-sm">No buddies assigned yet. Pair up in class to unlock messaging.</p>`;

    const activeKey = state.activeThreadKey;
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
      const threadMessages = threads[activeKey] || [];
      const beltColor = getBeltColorFromRank(buddy ? buddy.rank || "" : "");
      const initials = getInitialsFromName(activeKey);

      const messagesHtml = threadMessages.length
        ? threadMessages
            .map((m) => {
              const isMe = m.from === "self";
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
            <div
              class="buddy-avatar"
              style="--avatar-bg: ${beltColor};"
            >
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
            <input
              type="text"
              id="msgInput"
              class="form-input"
              placeholder="Type a quick note…"
            />
            <button type="submit" class="btn btn--primary">Send</button>
          </form>
        </div>
      `;
    }

    container.innerHTML = `
      <!-- =========================================================
           MESSAGES TAB — THREADED INBOX
           ========================================================= -->

      <section class="panel messages-panel">
        <!-- LEFT: BUDDY LIST -->
        <aside class="buddy-list">
          <h3 class="panel-title">Training Buddies</h3>

          <!-- Instructor-only: assign buddies -->
          <div class="instructor-only">
            <button
              type="button"
              class="instructor-edit-btn"
              data-panel="messages-buddies"
            >
              Manage Buddies
            </button>
          </div>

          <div class="buddy-list-scroll">
            ${buddyListHtml}
          </div>
        </aside>

        <!-- RIGHT: MESSAGE THREAD -->
        <div class="thread-area">
          <div class="thread-area-header">
            <div class="thread-area-title-row">
              <h3 class="panel-title">Messages</h3>

              <!-- Instructor-only: view / moderate messages -->
              <div class="instructor-only">
                <button
                  type="button"
                  class="instructor-edit-btn"
                  data-panel="messages-thread"
                >
                  Review Messages
                </button>
              </div>
            </div>
          </div>

          ${threadViewHtml}
        </div>
      </section>
    `;

    // Wire instructor edit chips
    wireInstructorEditButtons();

    // Wire buddy row selection
    const buddyRows = container.querySelectorAll(".buddy-row");
    buddyRows.forEach((row) => {
      const key = row.dataset.buddyKey;
      if (!key) return;

      row.addEventListener("click", () => {
        state.activeThreadKey = key;
        renderMessages();
      });
    });

    // Wire message form submit
    const form = document.getElementById("msgForm");
    const input = document.getElementById("msgInput");
    const threadBody = document.getElementById("chatThread");

    if (form && input && activeKey) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        const storeAfter = loadMessageStore(s);
        const threadsAfter = storeAfter.threads || {};
        const nowIso = new Date().toISOString();

        if (!threadsAfter[activeKey]) {
          threadsAfter[activeKey] = [];
        }

        threadsAfter[activeKey].push({
          from: "self",
          text,
          timestamp: nowIso
        });

        storeAfter.threads = threadsAfter;
        saveMessageStore(s, storeAfter);

        input.value = "";

        // Re-render messages tab to refresh preview + thread
        renderMessages();

        // After re-render, scroll to bottom of thread
        const newThreadBody = document.getElementById("chatThread");
        if (newThreadBody) {
          newThreadBody.scrollTop = newThreadBody.scrollHeight;
        }
      });

      // On initial render, scroll to bottom if there are messages
      if (threadBody) {
        threadBody.scrollTop = threadBody.scrollHeight;
      }
    }
  }

  // -------------------------------------------------------
  // [13] ACHIEVEMENTS TAB
  // -------------------------------------------------------
  function renderAchievements() {
    const container = document.getElementById("hubContent");
    const s = state.activeStudent;

    if (!container || !s) return;

    const badges = Array.isArray(s.badges) ? s.badges : [];
    const stars = Array.isArray(s.goldStars) ? s.goldStars : [];

    const badgeHtml = badges.length
      ? badges
          .map(
            (b) => `
        <div class="badge-card">
          <div class="badge-title">${b.name}</div>
          <div class="badge-category">${b.category}</div>
        </div>
      `
          )
          .join("")
      : `<p class="muted">No badges earned yet. Keep training!</p>`;

    const starHtml = stars.length
      ? stars
          .map(
            (g) => `
        <div class="goldstar-card">
          <strong>${g.event}</strong>
          <div class="goldstar-meta">${g.category}</div>
          <div class="goldstar-meta">${g.date}</div>
        </div>
      `
          )
          .join("")
      : `<p class="muted">No gold stars yet. Participate in events to earn them!</p>`;

    container.innerHTML = `
      <!-- =========================================================
           ACHIEVEMENTS TAB
           ========================================================= -->

      <section class="panel">
        <h2 class="panel-title">Badges</h2>
        <p class="panel-subtitle">Special achievements you’ve unlocked at Task Karate.</p>

        <!-- Instructor-only: manage badges -->
        <div class="instructor-only">
          <button
            type="button"
            class="instructor-edit-btn"
            data-panel="achievements-badges"
          >
            Edit Badges
          </button>
        </div>

        <div class="badges-grid">${badgeHtml}</div>
      </section>

      <section class="panel">
        <h2 class="panel-title">Gold Star Wall</h2>
        <p class="panel-subtitle">Events, tournaments, and standout moments.</p>

        <!-- Instructor-only: manage gold star events -->
        <div class="instructor-only">
          <button
            type="button"
            class="instructor-edit-btn"
            data-panel="achievements-goldstars"
          >
            Edit Gold Stars
          </button>
        </div>

        <div class="goldstar-grid">${starHtml}</div>
      </section>
    `;

    wireInstructorEditButtons();
  }

  // -------------------------------------------------------
  // [14] NEWS TAB
  // -------------------------------------------------------
  function renderNews() {
    const container = document.getElementById("hubContent");
    if (!container) return;

    const news = state.news || [];

    const html = news.length
      ? news
          .map(
            (n) => `
        <article class="news-card">
          <h3 class="news-title">${n.title}</h3>
          <p class="muted">${n.summary}</p>
          <p class="news-date">${n.date}</p>
        </article>
      `
          )
          .join("")
      : `<p class="muted">No dojo news available.</p>`;

    container.innerHTML = `
      <!-- =========================================================
           NEWS TAB
           ========================================================= -->

      <section class="panel">
        <h2 class="panel-title">Dojo News</h2>
        <p class="panel-subtitle">Announcements, schedule updates, and special events.</p>

        <!-- Instructor-only: manage news posts -->
        <div class="instructor-only">
          <button
            type="button"
            class="instructor-edit-btn"
            data-panel="news-dojo"
          >
            Edit News
          </button>
        </div>

        <div class="news-grid">${html}</div>
      </section>
    `;

    wireInstructorEditButtons();
  }

  // -------------------------------------------------------
  // [15] PROGRESS HELPERS
  // -------------------------------------------------------
  function calculateProgressPercent(s) {
    if (s.rankType === "degree") {
      const per = s.yearsRequired || 1;
      const done = s.yearsAtRank || 0;
      if (per === 0) return 0;
      return Math.min(100, Math.max(0, (done / per) * 100));
    } else {
      const per = s.classesPerStripe || 1;
      const done = s.classesSinceStripe || 0;
      if (per === 0) return 0;
      return Math.min(100, Math.max(0, (done / per) * 100));
    }
  }

  function getProgressText(s) {
    if (s.rankType === "degree") {
      const per = s.yearsRequired || 1;
      const done = s.yearsAtRank || 0;
      const remaining = (per - done).toFixed(1);
      return remaining <= 0
        ? "Eligible for next degree review"
        : `${remaining} years until next degree`;
    } else {
      const per = s.classesPerStripe || 1;
      const done = s.classesSinceStripe || 0;
      const remaining = per - done;
      return remaining <= 0
        ? "Ready for next stripe!"
        : `${remaining} classes until next stripe`;
    }
  }
})();
