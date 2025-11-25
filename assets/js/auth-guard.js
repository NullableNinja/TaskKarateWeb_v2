// ================================
// auth-guard.js
// Simple front-end gate using localStorage session
// ================================

(function () {
  const SESSION_STORAGE_KEY = "tkStudentSession";

  // Pages that don't require an active session
  const PUBLIC_PAGES = ["student-login.html", "/index.html", "/"];

  const href = window.location.href;
  const isPublic = PUBLIC_PAGES.some((page) => href.includes(page));

  if (isPublic) {
    return;
  }

  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      window.location.href = "student-login.html";
      return;
    }

    const session = JSON.parse(raw);
    if (!session || !session.id) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      window.location.href = "student-login.html";
      return;
    }
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    window.location.href = "student-login.html";
  }
})();
