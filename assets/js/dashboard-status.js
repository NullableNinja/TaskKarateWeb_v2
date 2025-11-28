// =========================================================
// Student Hub — STATUS TAB (Quick Strip + Panels)
// Depends on dashboard-core.js + dashboard-editor.js
// =========================================================

"use strict";

// ---------------------------------------------------------
// [1] HUD CHIP DEFINITIONS
// ---------------------------------------------------------
//
// These define all the possible tiles that can appear in the
// Training HUD grid. A student record can optionally include
//   statusHudConfig: [ "favoriteTechnique", ... ]
// to choose which ones appear and in what order.
//
// If statusHudConfig is missing, we fall back to a default
// list defined in getStatusHudItems().
// ---------------------------------------------------------

const STATUS_HUD_ITEM_DEFS = {
  // Fun stats from s.funStats
  favoriteTechnique: {
    id: "favoriteTechnique",
    label: "Favorite Technique",
    iconClass: "icon-target",
    value: (s) => s.funStats?.favoriteTechnique || "Not picked yet"
  },
  trainingGoals: {
    id: "trainingGoals",
    label: "Training Goals",
    iconClass: "icon-chart",
    value: (s) => s.funStats?.trainingGoals ?? 0
  },
  perfectDays: {
    id: "perfectDays",
    label: "Perfect Days",
    iconClass: "icon-star",
    value: (s) => s.funStats?.perfectDays ?? 0
  },
  highFives: {
    id: "highFives",
    label: "High Fives Given",
    iconClass: "icon-celebration",
    value: (s) => s.funStats?.highFives ?? 0
  },
  dojoFriends: {
    id: "dojoFriends",
    label: "Dojo Friends",
    iconClass: "icon-users",
    value: (s) => s.funStats?.dojoFriends ?? 0
  },
  formsMastered: {
    id: "formsMastered",
    label: "Forms Mastered",
    iconClass: "icon-trophy",
    value: (s) => s.funStats?.formsMastered ?? 0
  },
  perfectAttendance: {
    id: "perfectAttendance",
    label: "Perfect Attendance",
    iconClass: "icon-check",
    value: (s) => {
      const v = s.funStats?.perfectAttendance;
      if (v === true) return "Yes";
      if (v === false) return "Not yet";
      return "—";
    }
  },
  energyLevel: {
    id: "energyLevel",
    label: "Energy Level",
    iconClass: "icon-fire",
    value: (s) => s.funStats?.energyLevel || "—"
  },
  motivationScore: {
    id: "motivationScore",
    label: "Motivation Score",
    iconClass: "icon-muscle",
    value: (s) => {
      const v = s.funStats?.motivationScore;
      return typeof v === "number" ? `${v}%` : "—";
    }
  },

  // Core training stats (outside funStats)
  totalClasses: {
    id: "totalClasses",
    label: "Total Classes",
    iconClass: "icon-calendar",
    value: (s) => s.totalClasses ?? 0
  },
  goldStars: {
    id: "goldStars",
    label: "Gold Stars",
    iconClass: "icon-star",
    value: (s) => (Array.isArray(s.goldStars) ? s.goldStars.length : 0)
  },
  badgeCount: {
    id: "badgeCount",
    label: "Badges Earned",
    iconClass: "icon-badge",
    value: (s) => (Array.isArray(s.badges) ? s.badges.length : 0)
  }
};

// Build the list of HUD items for a specific student.
function getStatusHudItems(s) {
  if (!s) return [];

  const config =
    Array.isArray(s.statusHudConfig) && s.statusHudConfig.length
      ? s.statusHudConfig
      : [
          // Default layout (can be overridden per student later)
          "favoriteTechnique",
          "totalClasses",
          "trainingGoals",
          "perfectDays",
          "highFives",
          "dojoFriends",
          "formsMastered",
          "energyLevel",
          "motivationScore"
        ];

  const items = [];

  config.forEach((key) => {
    const def = STATUS_HUD_ITEM_DEFS[key];
    if (!def) return;

    const rawValue =
      typeof def.value === "function" ? def.value(s) : def.value;
    const displayValue =
      rawValue === undefined || rawValue === null ? "—" : rawValue;

    items.push({
      id: def.id,
      label: def.label,
      iconClass: def.iconClass,
      value: displayValue
    });
  });

  return items;
}

// Render the HUD chip grid HTML.
function renderHudGrid(hudItems) {
  if (!hudItems || !hudItems.length) {
    return `
      <p class="status-hud-empty muted">
        No stats to show yet. Your next class will start filling this area!
      </p>
    `;
  }

  return `
    <div class="status-hud-grid">
      ${hudItems
        .map(
          (item) => `
        <article class="hud-chip">
          <div class="hud-chip-icon-wrapper">
            <span class="icon ${item.iconClass || ""} icon-lg icon-white" aria-hidden="true"></span>
          </div>
          <div class="hud-chip-text">
            <div class="hud-chip-label">${item.label}</div>
            <div class="hud-chip-value">${item.value}</div>
          </div>
        </article>
      `
        )
        .join("")}
    </div>
  `;
}

// ---------------------------------------------------------
// [2] ACHIEVEMENTS STRIP
// ---------------------------------------------------------

function renderAchievementsSection(s) {
  const badges = Array.isArray(s?.badges) ? s.badges : [];
  if (!badges.length) {
    return `
      <p class="muted status-achievements-empty">
        No achievements yet… but your next class could unlock one!
      </p>
    `;
  }

  const topBadges = badges.slice(0, 6);

  return `
    <div class="status-achievements-row">
      ${topBadges
        .map((badge) => {
          const level = (badge.level || "Bronze").toLowerCase();
          const short = (badge.level || "?").charAt(0);
          return `
            <article class="badge-card level-${level}">
              <div class="badge-medal" aria-hidden="true">${short}</div>
              <div class="badge-body">
                <div class="badge-name">${badge.name}</div>
                <div class="badge-meta">
                  <span class="badge-level">${badge.level || ""}</span>
                  ${
                    badge.category
                      ? `<span class="badge-dot">•</span><span class="badge-category">${badge.category}</span>`
                      : ""
                  }
                </div>
                ${
                  badge.description
                    ? `<p class="badge-description">${badge.description}</p>`
                    : ""
                }
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

// ---------------------------------------------------------
// [3] MAIN RENDER FUNCTION
// ---------------------------------------------------------

function renderStatus() {
  const container = document.getElementById("hubContent");
  const s = state.activeStudent;
  if (!container || !s) return;

  const progressPercent = calculateProgressPercent(s);
  const progressText = getProgressText(s);
  const hudItems = getStatusHudItems(s);
  const achievementsHtml = renderAchievementsSection(s);

  // Birthday call-out (confetti handled in dashboard-core.js)
  let birthdayCallout = "";
  if (s.birthday) {
    const today = new Date();
    const birthday = new Date(s.birthday);
    const isBirthdayToday =
      today.getMonth() === birthday.getMonth() &&
      today.getDate() === birthday.getDate();

    if (isBirthdayToday) {
      const firstName = s.name ? s.name.split(" ")[0] : "there";
      birthdayCallout = `
        <div class="birthday-callout">
          🎉 Happy Birthday, ${firstName}! Thanks for spending part of your special day with us at the dojo.
        </div>
      `;
    }
  }

  const totalClasses = s.totalClasses ?? 0;
  const perfectDays = s.funStats?.perfectDays ?? 0;
  const motivationScore =
    typeof s.funStats?.motivationScore === "number"
      ? `${s.funStats.motivationScore}%`
      : "—";
  const trainingGoals = s.funStats?.trainingGoals ?? 0;

  const classesSinceStripe = s.classesSinceStripe ?? 0;
  const classesPerStripe = s.classesPerStripe ?? 0;
  const nextStripeLabel = s.nextStripeLabel || "To be announced";

  container.innerHTML = `
    ${birthdayCallout}

    <div class="status-layout">

      <!-- ===================================================
           QUICK TRAINING OVERVIEW STRIP
           Sits directly under the profile nav tabs
           =================================================== -->
      <section class="panel status-quick-panel">
        <header class="panel-header-inline">
          <div>
            <h2 class="panel-title">Training Overview</h2>
            <p class="panel-subtitle">
              Snapshot of your classes, goals, and motivation.
            </p>
          </div>
        </header>

        <div class="status-quick-stats">
          <div class="status-quick-grid">
            <article class="status-strip">
              <div class="status-strip-label">Total Classes</div>
              <div class="status-strip-value">${totalClasses}</div>
              <div class="status-strip-meta">
                <span>All-time</span>
              </div>
            </article>

            <article class="status-strip">
              <div class="status-strip-label">Perfect Days</div>
              <div class="status-strip-value">${perfectDays}</div>
              <div class="status-strip-meta">
                <span>Days that hit every goal</span>
              </div>
            </article>

            <article class="status-strip status-strip--highlight">
              <div class="status-strip-label">Motivation</div>
              <div class="status-strip-value">${motivationScore}</div>
              <div class="status-strip-meta">
                <span>How fired up you feel</span>
              </div>
            </article>

            <article class="status-strip">
              <div class="status-strip-label">Training Goals</div>
              <div class="status-strip-value">${trainingGoals}</div>
              <div class="status-strip-meta">
                <span>Goals you're working on</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- ===================================================
           MIDDLE GRID — RANK PROGRESS + TRAINING HUD
           =================================================== -->
      <div class="status-mid-grid">

        <!-- RANK PROGRESS PANEL -->
        <section class="panel status-progress-panel">
          <header class="panel-header-inline">
            <div>
              <h2 class="panel-title">Rank Progress</h2>
              <p class="panel-subtitle">
                Your journey toward your next stripe or belt.
              </p>
            </div>
            <div class="status-progress-percent">
              ${Math.round(progressPercent)}%
            </div>
          </header>

          <div class="status-progress-bar" aria-hidden="true">
            <div
              class="status-progress-fill"
              style="width: ${Math.max(0, Math.min(100, progressPercent))}%;">
            </div>
          </div>

          <p class="status-progress-text">${progressText}</p>

          <div class="status-progress-meta">
            <div>
              <span class="meta-label">Classes since last stripe</span>
              <span class="meta-value">${classesSinceStripe}</span>
            </div>
            <div>
              <span class="meta-label">Classes needed per stripe</span>
              <span class="meta-value">${classesPerStripe}</span>
            </div>
            <div>
              <span class="meta-label">Next stripe</span>
              <span class="meta-value">${nextStripeLabel}</span>
            </div>
          </div>

          <div class="instructor-only">
            <button
              type="button"
              class="instructor-edit-btn"
              data-panel="status-progress">
              Edit Rank Details
            </button>
          </div>
        </section>

        <!-- TRAINING HUD PANEL -->
        <section class="panel status-hud-panel">
          <header class="panel-header-inline">
            <div>
              <h2 class="panel-title">Training HUD</h2>
              <p class="panel-subtitle">
                Favorite moves, goals, and fun training stats.
              </p>
            </div>
          </header>

          ${renderHudGrid(hudItems)}

          <div class="instructor-only">
            <button
              type="button"
              class="instructor-edit-btn"
              data-panel="status-trainingstats">
              Customize HUD Tiles
            </button>
          </div>
        </section>
      </div>

      <!-- ===================================================
           ACHIEVEMENTS STRIP
           =================================================== -->
      <section class="panel status-achievements-panel">
        <header class="panel-header-inline">
          <div>
            <h2 class="panel-title">Achievements</h2>
            <p class="panel-subtitle">
              Highlight moments from your training journey.
            </p>
          </div>
        </header>

        ${achievementsHtml}
      </section>

      <!-- ===================================================
           GEAR (FUTURE FEATURE)
           Keeps data-panel="status-gear" hook
           so dashboard-editor.js stays compatible.
           =================================================== -->
      <section class="panel status-gear-panel">
        <header class="panel-header-inline">
          <div>
            <h2 class="panel-title">Gear & Equipment</h2>
            <p class="panel-subtitle">
              Pads, weapons & upgrades tracking (coming soon).
            </p>
          </div>
        </header>

        <div class="gear-empty">
          <p class="muted">
            This feature will unlock in a future update once instructors enable it.
          </p>
        </div>

        <div class="instructor-only">
          <button
            type="button"
            class="instructor-edit-btn"
            data-panel="status-gear">
            Configure Gear
          </button>
        </div>
      </section>
    </div>
  `;

  if (typeof wireInstructorEditButtons === "function") {
    wireInstructorEditButtons();
  }

  // If it's actually their birthday today, trigger the confetti FX
  if (birthdayCallout) {
    checkAndTriggerBirthday(s);
  }
}
