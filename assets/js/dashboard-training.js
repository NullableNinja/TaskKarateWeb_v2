// =========================================================
// Student Hub — TRAINING TAB
// =========================================================

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
    : '<p class="muted">No homework right now. Use this week to sharpen basics.</p>';

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
    : '<p class="muted">Ask an instructor for a practice card to see it here.</p>';

  container.innerHTML = `
    <section class="panel">
      <h2 class="panel-title">Assignments</h2>
      <p class="panel-subtitle">Homework, at-home drills, and focus goals from your instructors.</p>

      <div class="instructor-only">
        <button type="button" class="instructor-edit-btn" data-panel="training-assignments">
          Edit Assignments
        </button>
      </div>

      <div class="training-grid">
        ${assignmentsHtml}
      </div>
    </section>

    <section class="panel">
      <h2 class="panel-title">Practice Deck</h2>
      <p class="panel-subtitle">Quick practice cards you can use between classes.</p>

      <div class="instructor-only">
        <button type="button" class="instructor-edit-btn" data-panel="training-practice">
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
