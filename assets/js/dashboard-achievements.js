// =========================================================
// Student Hub — ACHIEVEMENTS TAB
// =========================================================

function renderAchievements() {
  const container = document.getElementById("hubContent");
  const s = state.activeStudent;
  if (!container || !s) return;

  const badges = Array.isArray(s.badges) ? s.badges : [];
  const stars = Array.isArray(s.goldStars) ? s.goldStars : [];

  const badgeHtml = badges.length
    ? badges
        .map((b, index) => {
          const level = b.level || "Bronze";
          const levelClass = `badge-level--${level.toLowerCase()}`;
          const badgeIcon = getBadgeSvg(b.level || "Bronze", b.category || "General");
          return `
        <div class="badge-card ${levelClass} achievement-clickable" data-badge-index="${index}">
          <div class="badge-icon">${badgeIcon}</div>
          <div class="badge-title">${b.name}</div>
          <div class="badge-category">${b.category}</div>
          <div class="badge-progress">${level} Badge</div>
        </div>
      `;
        })
        .join("")
    : '<p class="muted">No badges earned yet. Keep training!</p>';

  const starHtml = stars.length
    ? stars
        .map(
          (g, index) => `
      <div class="goldstar-card achievement-clickable" data-star-index="${index}">
        <div class="goldstar-icon">${getGoldStarSvg()}</div>
        <div class="goldstar-title">${g.event}</div>
        <div class="goldstar-meta">${g.category}</div>
        <div class="goldstar-meta">${g.date}</div>
        <div class="goldstar-meta">${g.location || "TASK Karate"}</div>
      </div>
    `
        )
        .join("")
    : '<p class="muted">No gold stars yet. Participate in events to earn them!</p>';

  container.innerHTML = `
    <section class="panel">
      <h2 class="panel-title">Achievement Badges</h2>
      <p class="panel-subtitle">Milestone achievements you've unlocked at Task Karate.</p>

      <div class="instructor-only">
        <button type="button" class="instructor-edit-btn" data-panel="achievements-badges">
          Edit Badges
        </button>
      </div>

      <div class="badges-grid">${badgeHtml}</div>
    </section>

    <section class="panel">
      <h2 class="panel-title">Gold Star Wall</h2>
      <p class="panel-subtitle">Events, tournaments, and standout moments.</p>

      <div class="instructor-only">
        <button type="button" class="instructor-edit-btn" data-panel="achievements-goldstars">
          Edit Gold Stars
        </button>
      </div>

      <div class="goldstar-grid">${starHtml}</div>
    </section>
  `;

  wireInstructorEditButtons();

  const badgeCards = container.querySelectorAll(".badge-card.achievement-clickable");
  badgeCards.forEach((card) => {
    card.addEventListener("click", () => {
      const index = parseInt(card.dataset.badgeIndex, 10);
      if (!isNaN(index) && badges[index]) {
        openAchievementModal(badges[index], "badge");
      }
    });
  });

  const starCards = container.querySelectorAll(".goldstar-card.achievement-clickable");
  starCards.forEach((card) => {
    card.addEventListener("click", () => {
      const index = parseInt(card.dataset.starIndex, 10);
      if (!isNaN(index) && stars[index]) {
        openAchievementModal(stars[index], "goldstar");
      }
    });
  });
}
