<script>
  import { activeTab } from "$lib/stores/ui.js";

  const tabs = [
    {
      id: "status",
      label: "STATUS",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.6",
      inner: `<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>`,
      inactiveColor: "#1e3a58",
      activeColor: "#2563a3"
    },
    {
      id: "messages",
      label: "SOCIAL",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.6",
      inner: `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>`,
      inactiveColor: "#113c32",
      activeColor: "#1d795b"
    },
    {
      id: "achievements",
      label: "ACHIEVEMENTS",
      viewBox: "0 0 24 24",
      fill: "currentColor",
      stroke: "currentColor",
      strokeWidth: "0",
      inner: `<path d="M12 2l2.39 6.91L21 9.24l-5 3.63L17.39 21 12 17.27 6.61 21 8 12.88 3 9.24l6.61-0.33L12 2z"/>`,
      inactiveColor: "#4f472c",
      activeColor: "#7f6f41"
    },
    {
      id: "training",
      label: "TRAINING",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.6",
      inner: `<rect x="2" y="9" width="4" height="6" rx="1"/><rect x="18" y="9" width="4" height="6" rx="1"/><path d="M6 12h12"/>`,
      inactiveColor: "#3c2c63",
      activeColor: "#5e45a3"
    },
    {
      id: "news",
      label: "NEWS",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.6",
      inner: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>`,
      inactiveColor: "#512730",
      activeColor: "#8b3a3a"
    }
  ];

  function setTab(id) {
    activeTab.set(id);
  }

  $: current = $activeTab;
</script>

<div class="floating-tab-bar">
  {#each tabs as t}
    <button
      class={`floating-tab-btn ${current === t.id ? "is-active" : ""}`}
      style={`--tab-bg:${t.inactiveColor}; --tab-bg-active:${t.activeColor};`}
      on:click={() => setTab(t.id)}
    >
      <svg
        class="floating-tab-icon"
        viewBox={t.viewBox}
        fill={t.fill}
        stroke={t.stroke}
        stroke-width={t.strokeWidth}
        aria-hidden="true"
      >
        {@html t.inner}
      </svg>
      <span class="floating-tab-label">{t.label}</span>
    </button>
  {/each}
</div>

<style>
  /* TAB BAR CONTAINER */
  .floating-tab-bar {
    position: fixed;
    top: 104px; /* match profile/logout baseline */
    left: 50%;
    transform: translateX(-50%);
    z-index: 15;
    display: flex;
    gap: 14px;
    padding: 10px 16px;
    border-radius: 20px;
    background: rgba(15, 23, 42, 0.75);
    backdrop-filter: blur(14px);
    border: 1px solid rgba(148, 163, 184, 0.28);
    box-shadow: 0 10px 26px rgba(0, 0, 0, 0.55);
  }

  /* BUTTON BASE */
  .floating-tab-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 20px;
    border-radius: 14px;
    background: var(--tab-bg);
    border: none;
    font-size: 0.78rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #e5e7eb;
    cursor: pointer;
    box-shadow:
      0 3px 8px rgba(0, 0, 0, 0.5),
      inset 0 0 0 1px rgba(255, 255, 255, 0.04);
    transition: all 0.15s ease;
  }

  .floating-tab-btn:hover {
    transform: translateY(-2px);
    box-shadow:
      0 6px 16px rgba(0, 0, 0, 0.6),
      inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  }

  /* ACTIVE */
  .floating-tab-btn.is-active {
    background: var(--tab-bg-active);
    color: #0f172a;
    box-shadow:
      0 6px 18px rgba(0, 0, 0, 0.75),
      inset 0 2px 4px rgba(255, 255, 255, 0.35);
  }

  .floating-tab-icon {
    width: 1rem;
    height: 1rem;
    opacity: 0.9;
    transform-origin: center;
    transition: transform 180ms cubic-bezier(.2,.9,.2,1), opacity 120ms ease;
  }

  .floating-tab-btn.is-active .floating-tab-icon {
    opacity: 1;
  }

  /* Subtle lift/scale animation for icons to complement the button lift */
  .floating-tab-btn:hover .floating-tab-icon {
    transform: translateY(-2px) scale(1.06);
  }

  /* Slightly less pronounced for active tab */
  .floating-tab-btn.is-active .floating-tab-icon {
    transform: translateY(-1px) scale(1.03);
  }

  /* Respect user preference for reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .floating-tab-icon {
      transition: none !important;
      transform: none !important;
    }
    .floating-tab-btn {
      transition: none !important;
    }
  }
</style>
