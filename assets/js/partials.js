// ==========================================================
// Task Karate – Global Partials Loader (STATIC ROOT VERSION)
// COMPLETE — No prefix detection, no rewriting
// ==========================================================
(function () {
  "use strict";

  // Inject a partial into an element by ID
  async function injectPartial(targetId, url) {
    const hostEl = document.getElementById(targetId);
    if (!hostEl) return;

    try {
      const res = await fetch(url, { cache: "no-cache" });
      if (!res.ok) throw new Error(res.status + " " + res.statusText);

      hostEl.innerHTML = await res.text();

      // Initialize navbar JS
      if (typeof window.tkInitNavbar === "function") {
        window.tkInitNavbar();
      }
    } catch (err) {
      console.error("Failed to load partial:", url, err);
    }
  }

  function initPartials() {
    // ALWAYS load navbar from root
    injectPartial("site-header", "/partials/navigation-bar.html");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPartials);
  } else {
    initPartials();
  }
})();
