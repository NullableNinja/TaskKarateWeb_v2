// =========================================================
// Task Karate – Student Hub
// Core Runtime + State + Shared Helpers
// (No legacy tabs, no instructor toggle)
// =========================================================

"use strict";

// ---------------------------------------------------------
// [1] GLOBAL STATE + RUNTIME REFS
// ---------------------------------------------------------
const SESSION_KEY = "tkStudentSession";

const state = {
  students: [],
  news: [],
  activeStudent: null,
  activeBuddyId: null,
  activeThreadId: null
};

let dashboardRoot = null;
let instructorBanner = null;
let instructorMode = false;

// Editor refs (dashboard-editor.js)
let editorBackdrop = null;
let editorPanel = null;
let editorTitleEl = null;
let editorBodyEl = null;
let editorCloseBtn = null;

// News modal refs
let newsModalBackdrop = null;
let newsModal = null;
let newsModalContent = null;

// Achievement modal refs
let achievementModalBackdrop = null;
let achievementModal = null;
let achievementModalContent = null;

// ---------------------------------------------------------
// [1B] STATUS QUICKBAR DEFINITIONS
// ---------------------------------------------------------
const STATUS_ITEM_DEFS = {
  totalClasses: {
    label: "Total Classes",
    icon: "⭐",
    getter: (s) => s.totalClasses ?? 0
  },
  monthClasses: {
    label: "This Month",
    icon: "📅",
    getter: (s) => s.monthClasses ?? 0
  },
  streakDays: {
    label: "Streak",
    icon: "🔥",
    getter: (s) => `${s.streakDays ?? 0} days`
  },
  beltsEarned: {
    label: "Belts Earned",
    icon: "🥋",
    getter: (s) =>
      Array.isArray(s.belts)
        ? s.belts.length
        : (s.belts ?? 0)
  },
  is3Rank: {
    label: "IS3 Rank",
    icon: "🎖️",
    getter: (s) => s.is3Rank ?? "—"
  },
  favoriteMove: {
    label: "Favorite Move",
    icon: "🌀",
    getter: (s) => s.favoriteMove ?? "—"
  },
  favoriteKata: {
    label: "Favorite Kata",
    icon: "📜",
    getter: (s) => s.favoriteKata ?? "—"
  },
  highFives: {
    label: "High Fives",
    icon: "🙌",
    getter: (s) => s.highFives ?? 0
  },
  friends: {
    label: "Dojo Friends",
    icon: "👥",
    getter: (s) =>
      Array.isArray(s.friends)
        ? s.friends.length
        : 0
  },
  energy: {
    label: "Energy Level",
    icon: "⚡",
    getter: (s) => s.energyLevel ?? "—"
  }
};

function normalizeQuickbarConfig(student) {
  if (!Array.isArray(student.statusQuickbarConfig)) {
    student.statusQuickbarConfig = [
      "totalClasses",
      "monthClasses",
      "streakDays",
      "beltsEarned",
      "is3Rank"
    ];
  }
}

// ---------------------------------------------------------
// [2] ENTRYPOINT
// ---------------------------------------------------------
document.addEventListener("DOMContentLoaded", initDashboardCore);

async function initDashboardCore() {
  dashboardRoot = document.querySelector(".dashboard-root");
  if (!dashboardRoot) {
    console.warn("Dashboard root not found.");
    return;
  }

  // Build overlay shells
  buildEditorShell();
  buildNewsModalShell();
  buildAchievementModalShell();

  // Session
  const session = loadSession();
  if (!session) {
    window.location.href = "student-login.html";
    return;
  }

  // Floating instructor banner
  instructorBanner = createInstructorBanner();

  // Load students.json
  try {
    const response = await fetch("./assets/data/students.json");
    if (!response.ok) throw new Error("Unable to load students.json");
    const data = await response.json();

    state.students = data.students || [];
    state.news = data.news || [];

    state.activeStudent =
      state.students.find((s) => s.id === session.id) ||
      state.students[0] ||
      null;

    if (!state.activeStudent) {
      console.error("No student record found");
      return;
    }

    // Normalize QuickBar for active student
    normalizeQuickbarConfig(state.activeStudent);

    // Birthday FX
    checkAndTriggerBirthday(state.activeStudent);

    // Header + capsule
    renderHeader(state.activeStudent);
    renderCapsuleStats();

    // Floating tab bar only
    setupFloatingTabs();
    showTab("status");

    // Logout + instructor proxy
    setupLogout();
    setupInstructorMode(state.activeStudent, session);

  } catch (err) {
    console.error("Error loading student data:", err);
  }
}

// ---------------------------------------------------------
// [3] BIRTHDAY CELEBRATION
// ---------------------------------------------------------
function checkAndTriggerBirthday(student) {
  if (!student || !student.birthday) return;

  const today = new Date();
  const birthday = new Date(student.birthday);

  const isBirthdayToday =
    today.getMonth() === birthday.getMonth() &&
    today.getDate() === birthday.getDate();

  if (!isBirthdayToday) return;

  const key = `tkBirthdayCelebrated_${student.id}`;
  if (sessionStorage.getItem(key)) return;

  triggerConfetti();
  sessionStorage.setItem(key, "true");
}

function triggerConfetti() {
  const fxRoot = document.getElementById("fx-root");
  if (!fxRoot) return;

  const colors = ["#facc15", "#38bdf8", "#22c55e", "#ef4444", "#a855f7", "#f97316"];

  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      piece.style.left = Math.random() * 100 + "%";
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = Math.random() * 0.5 + "s";
      piece.style.animationDuration = Math.random() * 2 + 2 + "s";

      fxRoot.appendChild(piece);
      setTimeout(() => piece.remove(), 4000);
    }, i * 30);
  }
}

// ---------------------------------------------------------
// [4] NEWS MODAL
// ---------------------------------------------------------
function buildNewsModalShell() {
  newsModalBackdrop = document.createElement("div");
  newsModalBackdrop.className = "news-modal-backdrop";

  newsModal = document.createElement("article");
  newsModal.className = "news-modal";

  newsModalContent = document.createElement("div");
  newsModalContent.className = "news-modal-content";

  newsModal.appendChild(newsModalContent);
  newsModalBackdrop.appendChild(newsModal);
  document.body.appendChild(newsModalBackdrop);

  newsModalBackdrop.addEventListener("click", (evt) => {
    if (evt.target === newsModalBackdrop) closeNewsModal();
  });

  document.addEventListener("keydown", (evt) => {
    if (evt.key === "Escape" && newsModalBackdrop.classList.contains("is-open")) {
      closeNewsModal();
    }
  });
}

function openNewsModal(article) {
  if (!newsModal || !newsModalContent) return;

  newsModalContent.innerHTML = `
    <header class="news-modal-header">
      <h2 class="news-modal-title">${article.title || "News Article"}</h2>
      <button class="news-modal-close" aria-label="Close">&times;</button>
    </header>
    <div class="news-modal-content">
      <div class="news-modal-tag">${article.tag || "General"}</div>
      <p class="news-modal-date">${article.date || "Recent"}</p>
      <div class="news-modal-text">
        ${article.fullText || article.summary || "No content available."}
      </div>
    </div>
    <div class="news-modal-meta">
      <span>Category: ${article.tag || "General"}</span>
      <span>Published: ${article.date || "Recent"}</span>
    </div>
  `;

  const closeBtn = newsModal.querySelector(".news-modal-close");
  if (closeBtn) closeBtn.addEventListener("click", closeNewsModal);

  newsModalBackdrop.classList.add("is-open");
  dashboardRoot.classList.add("news-modal-open");
}

function closeNewsModal() {
  if (!newsModalBackdrop || !dashboardRoot) return;
  newsModalBackdrop.classList.remove("is-open");
  dashboardRoot.classList.remove("news-modal-open");
}

// ---------------------------------------------------------
// [5] ACHIEVEMENT MODAL
// ---------------------------------------------------------
function buildAchievementModalShell() {
  achievementModalBackdrop = document.createElement("div");
  achievementModalBackdrop.className = "news-modal-backdrop";

  achievementModal = document.createElement("article");
  achievementModal.className = "news-modal achievement-modal";

  achievementModalContent = document.createElement("div");
  achievementModalContent.className = "news-modal-content";

  achievementModal.appendChild(achievementModalContent);
  achievementModalBackdrop.appendChild(achievementModal);
  document.body.appendChild(achievementModalBackdrop);

  achievementModalBackdrop.addEventListener("click", (evt) => {
    if (evt.target === achievementModalBackdrop) closeAchievementModal();
  });

  document.addEventListener("keydown", (evt) => {
    if (evt.key === "Escape" && achievementModalBackdrop.classList.contains("is-open")) {
      closeAchievementModal();
    }
  });
}

function openAchievementModal(item, type) {
  if (!achievementModal || !achievementModalContent) return;

  if (type === "badge") {
    achievementModalContent.innerHTML = `
      <header class="news-modal-header">
        <h2 class="news-modal-title">${item.name || "Achievement Badge"}</h2>
        <button class="news-modal-close" aria-label="Close">&times;</button>
      </header>

      <div class="news-modal-content">
        <div class="achievement-icon-display">
          ${getBadgeSvg(item.level || "Bronze", item.category || "General")}
        </div>

        <div class="achievement-details">
          <div class="achievement-level">${item.level || "Bronze"} Badge</div>
          <div class="achievement-category">${item.category || "General"}</div>
          <div class="achievement-description">
            ${item.description || "A special achievement unlocked at Task Karate."}
          </div>
        </div>
      </div>

      <div class="news-modal-meta">
        <span>Category: ${item.category || "General"}</span>
        <span>Level: ${item.level || "Bronze"}</span>
      </div>
    `;
  } else if (type === "goldstar") {
    achievementModalContent.innerHTML = `
      <header class="news-modal-header">
        <h2 class="news-modal-title">${item.event || "Gold Star Achievement"}</h2>
        <button class="news-modal-close" aria-label="Close">&times;</button>
      </header>

      <div class="news-modal-content">
        <div class="goldstar-icon-display">
          ${getGoldStarSvg()}
        </div>

        <div class="achievement-details">
          <div class="goldstar-event">${item.event || "Special Event"}</div>
          <div class="goldstar-category">${item.category || "Event"}</div>
          <div class="goldstar-date">${item.date || "Recent"}</div>
          <div class="goldstar-location">${item.location || "TASK Karate"}</div>
          <div class="goldstar-note">
            ${item.note || "Outstanding performance and dedication!"}
          </div>
        </div>
      </div>

      <div class="news-modal-meta">
        <span>Event: ${item.category || "General"}</span>
        <span>Date: ${item.date || "Recent"}</span>
      </div>
    `;
  }

  const closeBtn = achievementModal.querySelector(".news-modal-close");
  if (closeBtn) closeBtn.addEventListener("click", closeAchievementModal);

  achievementModalBackdrop.classList.add("is-open");
  dashboardRoot.classList.add("achievement-modal-open");
}

function closeAchievementModal() {
  if (!achievementModalBackdrop || !dashboardRoot) return;
  achievementModalBackdrop.classList.remove("is-open");
  dashboardRoot.classList.remove("achievement-modal-open");
}

// ---------------------------------------------------------
// [6] SESSION + LOGOUT
// ---------------------------------------------------------
function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn("Unable to parse session storage:", e);
    return null;
  }
}

function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = "student-login.html";
  });
}

// ---------------------------------------------------------
// [7] INSTRUCTOR PROXY MODE
// ---------------------------------------------------------
function createInstructorBanner() {
  const banner = document.createElement("div");
  banner.className = "instructor-banner";
  banner.textContent = "🥊 Coach Mode";
  document.body.appendChild(banner);
  return banner;
}

function setupInstructorMode(student, session) {
  const active = !!(
    session &&
    (session.isInstructor || session.isInstructorProxy)
  );

  instructorMode = active;
  setInstructorMode(active);
}

function setInstructorMode(active) {
  if (!dashboardRoot) return;

  dashboardRoot.classList.toggle("instructor-mode-active", active);

  if (instructorBanner) {
    instructorBanner.classList.toggle("is-active", active);
  }

  document.dispatchEvent(
    new CustomEvent("tk-instructor-mode", { detail: { active } })
  );
}

// ---------------------------------------------------------
// [8] UTILS
// ---------------------------------------------------------
function pickAvatarColor(student) {
  if (student && student.avatarColor) return student.avatarColor;

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

function getInitialsFromName(name) {
  if (!name || typeof name !== "string") return "TK";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return ((parts[0][0] || "") + (parts[parts.length - 1][0] || "")).toUpperCase();
}

function formatMessageTime(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function getStudentNameById(studentId) {
  if (!studentId) return null;
  const student = state.students.find((s) => s.id === studentId);
  return student ? student.name : null;
}

function calculateUnreadCount(student, buddyId) {
  if (!student || !buddyId) return 0;
  const messages = Array.isArray(student.messages) ? student.messages : [];
  return messages.filter(
    (msg) =>
      msg.fromId === buddyId &&
      msg.toId === student.id &&
      msg.read === false
  ).length;
}

function markMessagesAsRead(student, buddyId) {
  if (!student || !buddyId) return;
  const messages = Array.isArray(student.messages) ? student.messages : [];
  messages.forEach((msg) => {
    if (msg.fromId === buddyId && msg.toId === student.id) {
      msg.read = true;
    }
  });
}

// legacy localStorage message-store helpers (kept for future use)
function getMessageStoreKey(student) {
  const id = student && (student.id || student.name || "student");
  return `tkMessages_${id}`;
}
function loadMessageStore(student) {
  const key = getMessageStoreKey(student);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { threads: {} };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { threads: {} };
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

// ---------------------------------------------------------
// [9] HEADER + CAPSULE (NOW QUICKBAR DRIVEN)
// ---------------------------------------------------------
function renderHeader(student) {
  if (!student) return;

  const initialsEl = document.getElementById("heroInitials");
  const nameEl = document.getElementById("heroName");
  const rankEl = document.getElementById("heroRank");
  const roleEl = document.getElementById("heroRole");

  if (initialsEl) {
    const initials = getInitialsFromName(student.name);
    initialsEl.textContent = initials;
    const avatarColor = pickAvatarColor(student);
    initialsEl.style.setProperty("--avatar-color", avatarColor);
  }

  if (nameEl) nameEl.textContent = student.name || "Student";
  if (rankEl) rankEl.textContent = student.rank || "Rank";

  if (roleEl) {
    roleEl.textContent = "";
    roleEl.classList.remove(
      "hero-role--senior",
      "hero-role--assistant",
      "hero-role--junior"
    );

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

  const container = document.getElementById("capsuleStats");
  if (!container) return;

  normalizeQuickbarConfig(s);

  container.innerHTML = s.statusQuickbarConfig
    .map((key) => {
      const def = STATUS_ITEM_DEFS[key];
      if (!def) return "";
      return `
        <div class="capsule-item">
          <div class="capsule-icon">${def.icon}</div>
          <div class="capsule-label">${def.label}</div>
          <div class="capsule-value">${def.getter(s)}</div>
        </div>
      `;
    })
    .join("");
}

// ---------------------------------------------------------
// [10] FLOATING TABS ONLY
// ---------------------------------------------------------
function setupFloatingTabs() {
  const floatTabs = document.querySelectorAll(".floating-tab-btn");
  if (!floatTabs.length) return;

  floatTabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabName = btn.dataset.tab;

      floatTabs.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      showTab(tabName);
    });
  });
}

function showTab(name) {
  switch (name) {
    case "training":
      if (typeof renderTraining === "function") renderTraining();
      break;

    case "messages":
      if (typeof renderMessages === "function") renderMessages();
      break;

    case "achievements":
      if (typeof renderAchievements === "function") renderAchievements();
      break;

    case "news":
      if (typeof renderNews === "function") renderNews();
      break;

    case "status":
    default:
      if (typeof renderStatus === "function") renderStatus();
      renderCapsuleStats();
      break;
  }
}

// ---------------------------------------------------------
// [11] BADGE/STAR SVG HELPERS
// ---------------------------------------------------------
function getBadgeSvg(level, category) {
  const colors = {
    Bronze: ["#cd7f32", "#8b5a2b"],
    Silver: ["#c0c0c0", "#808080"],
    Gold: ["#ffd700", "#daa520"],
    Platinum: ["#e5e4e2", "#b0b0b0"]
  };

  const [primaryColor, secondaryColor] = colors[level] || colors.Bronze;

  const icons = {
    Attendance: '<path d="M12 2l2 4h4l-3.5 2.5L15 14l-3-2.5-3 2.5 2.5-5.5L8 6h4z"/>',
    Forms: '<path d="M9 3h6l1 2h3v16H5V5h3l1-2zm0 6h6v2H9V9zm0 4h6v2H9v-2z"/>',
    Effort: '<path d="M12 2l3 5 5 .7-3.6 3.5.9 5.1L12 14.8 6.7 16.3l.9-5.1L4 7.7 9 7l3-5z"/>',
    Community:
      '<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>',
    Role:
      '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>',
    General:
      '<path d="M12 2l3 5 5 .7-3.6 3.5.9 5.1L12 14.8 6.7 16.3l.9-5.1L4 7.7 9 7l3-5z"/>'
  };

  const icon = icons[category] || icons.General;

  return `
    <svg width="60" height="60" viewBox="0 0 24 24" fill="${primaryColor}">
      <circle cx="12" cy="12" r="10" fill="${secondaryColor}" opacity="0.3"></circle>
      <circle cx="12" cy="12" r="9" fill="${primaryColor}" opacity="0.6"></circle>
      ${icon}
    </svg>
  `;
}

function getGoldStarSvg() {
  return `
    <svg width="40" height="40" viewBox="0 0 24 24" fill="#facc15">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            stroke="#f59e0b" stroke-width="1" fill="url(#goldGradient)"></path>
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fde047"></stop>
          <stop offset="50%" stop-color="#facc15"></stop>
          <stop offset="100%" stop-color="#f59e0b"></stop>
        </linearGradient>
      </defs>
    </svg>
  `;
}

// ---------------------------------------------------------
// [12] PROGRESS HELPERS
// ---------------------------------------------------------
function calculateProgressPercent(s) {
  if (!s) return 0;

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
  if (!s) return "";

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
