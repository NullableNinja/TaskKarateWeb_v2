// =========================================================
// Student Hub — NEWS TAB
// =========================================================

function renderNews() {
  const container = document.getElementById("hubContent");
  if (!container) return;

  const news = state.news || [];

  const html = news.length
    ? news
        .map((n) => {
          return `
      <article class="news-card" data-news='${JSON.stringify(n).replace(/'/g, "&apos;")}'>
        <div class="news-tag">${n.tag || "General"}</div>
        <h3 class="news-title">${n.title}</h3>
        <p class="news-date">${n.date}</p>
        <p class="news-summary">${n.summary}</p>
        <div class="news-read-more">Click to read more →</div>
      </article>
    `;
        })
        .join("")
    : '<p class="muted">No dojo news available.</p>';

  container.innerHTML = `
    <section class="panel">
      <h2 class="panel-title">Dojo News</h2>
      <p class="panel-subtitle">Announcements, schedule updates, and special events.</p>

      <div class="instructor-only">
        <button type="button" class="instructor-edit-btn" data-panel="news-dojo">
          Edit News
        </button>
      </div>

      <div class="news-grid">${html}</div>
    </section>
  `;

  wireInstructorEditButtons();

  const newsCards = container.querySelectorAll(".news-card");
  newsCards.forEach((card) => {
    card.addEventListener("click", () => {
      try {
        const newsData = JSON.parse(card.dataset.news);
        openNewsModal(newsData);
      } catch (e) {
        console.warn("Error parsing news data:", e);
      }
    });
  });
}
