// ==========================================================
// Task Karate – Navigation Bar Runtime (STATIC SAFE VERSION)
// COMPLETE — No rewriting / No prefix logic / No omissions
// ==========================================================
(function () {
  "use strict";

  // --------------------------------------------------------
  // Dropdown behavior
  // --------------------------------------------------------
  function setupDropdowns() {
    document.querySelectorAll(".dropdown").forEach((dd) => {
      const trigger = dd.querySelector(".nav-link");
      if (!trigger) return;

      trigger.addEventListener("click", (evt) => {
        if (window.innerWidth <= 900) {
          evt.preventDefault();
          dd.classList.toggle("dropdown-open");
        }
      });
    });
  }

  // --------------------------------------------------------
  // Hamburger menu
  // --------------------------------------------------------
  function setupHamburger() {
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");
    if (!hamburger || !navLinks) return;

    hamburger.addEventListener("click", () => {
      const active = hamburger.classList.toggle("active");
      navLinks.classList.toggle("nav-links-open", active);
      hamburger.setAttribute("aria-expanded", active);
    });
  }

  // --------------------------------------------------------
  // Scroll shadow
  // --------------------------------------------------------
  function setupScrollEffect() {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    window.addEventListener("scroll", () => {
      navbar.classList.toggle("scrolled", window.scrollY > 40);
    });
  }

  // --------------------------------------------------------
  // Active link highlight
  // --------------------------------------------------------
  function setupActiveLink() {
    let current = window.location.pathname.split("/").pop();
    if (!current) current = "index.html";

    document.querySelectorAll(".nav-link").forEach((link) => {
      if ((link.href || "").endsWith(current)) {
        link.classList.add("active");
      }
    });
  }

  // --------------------------------------------------------
  // Scroll progress bar
  // --------------------------------------------------------
  function setupProgress() {
    const bar = document.getElementById("navbarProgress");
    if (!bar) return;

    window.addEventListener("scroll", () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const ratio = docHeight > 0 ? scrollTop / docHeight : 0;

      bar.style.transform = "scaleX(" + ratio + ")";
    });
  }

  // --------------------------------------------------------
  // Init
  // --------------------------------------------------------
  function initNavbar() {
    setupDropdowns();
    setupHamburger();
    setupScrollEffect();
    setupActiveLink();
    setupProgress();
  }

  window.tkInitNavbar = initNavbar;
})();
