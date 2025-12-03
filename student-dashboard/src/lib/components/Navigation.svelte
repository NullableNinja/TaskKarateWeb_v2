<script>
  let hamburgerOpen = false;
  let dropdownOpen = false;

  function toggleHamburger() {
    hamburgerOpen = !hamburgerOpen;
  }

  function toggleDropdown() {
    dropdownOpen = !dropdownOpen;
  }

  // Close dropdown on click outside
  function handleClickOutside(e) {
    if (!e.target.closest('.dropdown')) {
      dropdownOpen = false;
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<!-- Floating Logo -->
<div class="tk-logo-floating">
  <a href="../">
    <img
      class="tk-logo-img"
      src="/images/logo/Logo.png"
      alt="Task Karate Logo"
    />
  </a>
</div>

<nav class="navbar">
  <!-- Brand (hidden by CSS) -->
  <div class="nav-brand">
    <a class="nav-link-brand" href="/">
      <img
        class="nav-logo-img logo"
        src="/images/logo/Logo.png"
        alt="Task Karate Logo"
      />
    </a>
  </div>

  <!-- Hamburger (mobile) -->
  <button
    class="hamburger {hamburgerOpen ? 'active' : ''}"
    aria-label="Toggle navigation"
    aria-expanded={hamburgerOpen}
    on:click={toggleHamburger}
  >
    <span></span>
    <span></span>
    <span></span>
  </button>

  <!-- Main Navigation -->
  <ul class="nav-links {hamburgerOpen ? 'nav-links-open' : ''}">
    <!-- HOME -->
    <li>
      <a class="nav-link" href="../">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M12 3L2 11h3v10h6v-6h2v6h6V11h3L12 3z" />
        </svg>
        <span>HOME</span>
      </a>
    </li>

    <!-- SCHEDULE -->
    <li>
      <a class="nav-link" href="../schedule.html">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M7 2v2H5c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-2V2h-2v2H9V2H7zm12 7H5v10h14V9z" />
        </svg>
        <span>SCHEDULE</span>
      </a>
    </li>

    <!-- STUDENTS w/ Submenu -->
    <li class="dropdown {dropdownOpen ? 'dropdown-open' : ''}">
      <a class="nav-link" href="../students.html" on:click={toggleDropdown}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M8 10a3 3 0 110-6 3 3 0 010 6zm8 0a3 3 0 110-6 3 3 0 010 6zM4 20v-1c0-2.21 1.79-4 4-4h0c2.21 0 4 1.79 4 4v1H4zm8 0v-1c0-1.7.84-3.18 2.15-4.1A4 4 0 0120 15a4 4 0 013 1.34V20h-11z" />
        </svg>
        <span>STUDENTS</span>
      </a>

      <ul class="dropdown-menu">
        <!-- Student Dashboard -->
        <li>
          <a class="nav-link nav-link--sub" href="./">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M3 13h8V3H3v10zm10 8h8V3h-8v18zm-10 0h8v-6H3v6z" />
            </svg>
            <span>STUDENT DASHBOARD</span>
          </a>
        </li>

        <!-- Student Resources -->
        <li>
          <a class="nav-link nav-link--sub" href="../students.html">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 2a7 7 0 017 7c0 4.5-3.5 8-7 13-3.5-5-7-8.5-7-13a7 7 0 017-7zm0 4a3 3 0 100 6 3 3 0 000-6z" />
            </svg>
            <span>STUDENT RESOURCES</span>
          </a>
        </li>

        <!-- Class Check-in -->
        <li>
          <a class="nav-link nav-link--sub" href="../checkin.html">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12 3.41 13.41 9 19l12-12-1.41-1.41z" />
            </svg>
            <span>CLASS CHECK-IN</span>
          </a>
        </li>
      </ul>
    </li>

    <!-- NEWS -->
    <li>
      <a class="nav-link" href="../news.html">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M4 4h13a2 2 0 012 2v11h1v2H4a2 2 0 01-2-2V6c0-1.1.9-2 2-2zm1 3v3h7V7H5zm0 5v3h5v-3H5zm9 0h3v3h-3v-3z" />
        </svg>
        <span>NEWS</span>
      </a>
    </li>

    <!-- ABOUT -->
    <li>
      <a class="nav-link" href="../about.html">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M11 7h2V5h-2v2zm0 12h2v-8h-2v8zm1-17C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
        </svg>
        <span>ABOUT</span>
      </a>
    </li>

    <!-- ADMIN -->
    <li>
      <a class="nav-link" href="../admin-dashboard.html">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M12 2l7 3v6c0 5-3 9.74-7 11-4-1.26-7-6-7-11V5l7-3zm0 4l-3 1.29v3.71c0 3.08 1.64 6.02 3 7.13 1.36-1.11 3-4.05 3-7.13V7.29L12 6z" />
        </svg>
        <span>ADMIN</span>
      </a>
    </li>
  </ul>
</nav>

<!-- Scroll Progress Bar -->
<div class="navbar-progress" id="navbarProgress"></div>

<style>
  :root {
    --tk-blue-light: #37a9ff;
    --tk-blue-mid: #1f5ea1;
    --tk-blue-dark: #103560;
    --nav-radius: 14px;
    --shadow-offset: 4px;
  }

  /* ========== FLOATING LOGO ========== */
  .tk-logo-floating {
    position: fixed;
    top: 8px;
    left: 20px;
    z-index: 9500;
    pointer-events: none;
  }

  .tk-logo-floating img {
    height: 68px;
    width: auto;
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.9));
  }

  .nav-brand {
    display: none !important;
  }

  /* ========== NAVBAR SHELL ========== */
  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    padding: 12px 24px;
    z-index: 9000;
    background: linear-gradient(180deg, rgba(3, 7, 18, 0.97), rgba(6, 11, 25, 0.97));
    border-bottom: 1px solid rgba(148, 163, 184, 0.15);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(18px) saturate(140%);
  }

  .navbar::after {
    content: "";
    position: absolute;
    bottom: -40px;
    left: 0;
    width: 100%;
    height: 40px;
    pointer-events: none;
    background: linear-gradient(
      rgba(6, 11, 25, 0.97),
      rgba(6, 11, 25, 0.6),
      rgba(6, 11, 25, 0.25),
      rgba(6, 11, 25, 0)
    );
  }

  /* ========== NAV LINKS WRAPPER ========== */
  .nav-links {
    display: flex;
    align-items: center;
    gap: 12px;
    list-style: none;
    margin: 0;
    padding: 0;
    margin-left: auto;
  }

  /* ========== MAIN NAV BUTTONS ========== */
  .nav-link {
    font-family: "Bebas Neue", sans-serif;
    font-size: 0.95rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-decoration: none;
    position: relative;
    z-index: 10;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 6px 22px;
    min-width: 140px;
    border-radius: var(--nav-radius);
    color: #f1f5f9;
    background: none;
    cursor: pointer;
    border: none;
    outline: none;
    -webkit-tap-highlight-color: transparent;
  }

  .nav-link::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: var(--nav-radius);
    background: rgba(12, 33, 68, 0.95);
    transform: translate(var(--shadow-offset), var(--shadow-offset));
    z-index: 1;
    pointer-events: none;
  }

  .nav-link::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: var(--nav-radius);
    background: linear-gradient(135deg, var(--tk-blue-mid), var(--tk-blue-dark));
    z-index: 2;
    pointer-events: none;
  }

  .nav-link span,
  .nav-link svg {
    position: relative;
    z-index: 10;
  }

  .nav-link svg {
    width: 20px !important;
    height: 20px !important;
    flex-shrink: 0;
    fill: currentColor;
  }

  .nav-link:hover::after {
    background: linear-gradient(135deg, var(--tk-blue-light), var(--tk-blue-mid));
  }

  .nav-link.active::after {
    background: linear-gradient(135deg, #4fc3ff, var(--tk-blue-mid));
    box-shadow: 0 0 12px rgba(55, 171, 255, 0.45);
  }

  /* ========== DROPDOWN ========== */
  .dropdown {
    position: relative;
  }

  .dropdown::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 0;
    width: 170px;
    height: 18px;
    background: transparent;
    z-index: 5;
  }

  .dropdown-menu {
    background: transparent !important;
    border: none;
    padding: 6px 0;
    margin: 0;
    position: absolute;
    top: calc(100% + 2px);
    left: 0;
    display: none;
    flex-direction: column;
    gap: 6px;
    z-index: 1000;
  }

  .dropdown:hover .dropdown-menu,
  .dropdown.dropdown-open .dropdown-menu {
    display: flex;
  }

  /* ========== SUBMENU BUTTONS ========== */
  .nav-link--sub {
    font-family: "Bebas Neue", sans-serif;
    font-size: 0.9rem;
    letter-spacing: 0.05em;
    position: relative;
    padding: 5px 14px;
    min-width: 160px;
    display: flex;
    align-items: center;
    gap: 6px;
    border-radius: 10px;
    text-decoration: none;
    color: #f8fafc;
    cursor: pointer;
  }

  .nav-link--sub::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 10px;
    background: rgba(12, 33, 68, 0.9);
    transform: translate(2px, 2px);
    z-index: 1;
  }

  .nav-link--sub::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 10px;
    background: linear-gradient(135deg, #0f172a, #020617);
    z-index: 2;
  }

  .nav-link--sub svg,
  .nav-link--sub span {
    position: relative;
    z-index: 10;
  }

  .nav-link--sub svg {
    width: 14px !important;
    height: 14px !important;
    fill: currentColor;
  }

  .nav-link--sub:hover::after {
    background: linear-gradient(135deg, var(--tk-blue-light), var(--tk-blue-mid));
  }

  /* ========== HAMBURGER MENU ========== */
  .hamburger {
    display: none;
    flex-direction: column;
    gap: 5px;
    padding: 8px 10px;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(10, 15, 30, 0.9));
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.85);
    cursor: pointer;
    z-index: 9200;
  }

  .hamburger span {
    width: 22px;
    height: 2px;
    border-radius: 999px;
    background: #e5e7eb;
    transition: all 0.2s ease;
  }

  .hamburger.active span:nth-child(1) {
    transform: translateY(6px) rotate(45deg);
  }
  .hamburger.active span:nth-child(2) {
    opacity: 0;
  }
  .hamburger.active span:nth-child(3) {
    transform: translateY(-6px) rotate(-45deg);
  }

  /* ========== SCROLL PROGRESS BAR ========== */
  .navbar-progress {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    transform-origin: left;
    transform: scaleX(0);
    background: linear-gradient(90deg, #22c55e, #38bdf8, #a855f7);
    border-radius: 2px 2px 0 0;
    box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.4);
    z-index: 9999;
  }

  /* ========== MOBILE ========== */
  @media (max-width: 900px) {
    .hamburger {
      display: flex;
    }

    .nav-links {
      position: absolute;
      top: 100%;
      left: 8px;
      right: 8px;
      flex-direction: column;
      align-items: stretch;
      gap: 10px;
      padding: 14px;
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(3, 7, 18, 0.98), rgba(8, 15, 30, 0.98));
      box-shadow: 0 18px 40px rgba(0, 0, 0, 1);
      display: none;
      z-index: 9100;
    }

    .nav-links.nav-links-open {
      display: flex;
    }

    .dropdown-menu {
      position: static;
      padding: 6px 0;
    }

    .dropdown::after {
      display: none;
    }

    .nav-link {
      min-width: unset;
    }
  }
</style>
