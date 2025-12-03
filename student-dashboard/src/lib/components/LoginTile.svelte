<script>
  export let student;
  export let index;
  export let expanded = false;

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  // -----------------------------
  // COLORS
  // -----------------------------
  const tileColors = [
    "#1a2232",
    "#1c2638",
    "#1d293d",
    "#202c42",
    "#1b2635",
    "#1e2b44"
  ];

  const avatarColors = [
    "#93c5fd",
    "#a5f3fc",
    "#fda4af",
    "#fcd34d",
    "#bbf7d0",
    "#c7d2fe"
  ];

  function getTileColor(i) {
    return tileColors[i % tileColors.length];
  }

  function getAvatarColor(i) {
    return avatarColors[i % avatarColors.length];
  }

  function getBeltColor(rank) {
    const r = rank.toLowerCase();
    if (r.includes("white")) return "#e5e7eb";
    if (r.includes("yellow")) return "#facc15";
    if (r.includes("orange")) return "#fb923c";
    if (r.includes("green")) return "#22c55e";
    if (r.includes("blue")) return "#3b82f6";
    if (r.includes("purple")) return "#a855f7";
    if (r.includes("brown")) return "#92400e";
    if (r.includes("red")) return "#dc2626";
    if (r.includes("black")) return "#111827";
    return "#334155";
  }

  function getBeltTextColor(rank) {
    const bg = getBeltColor(rank);
    const darkSet = new Set(["#111827", "#92400e", "#dc2626", "#334155"]);
    return darkSet.has(bg) ? "#f9fafb" : "#111827";
  }

  function getInitials(fullname) {
    if (!fullname) return "";
    return fullname
      .replace(/^(Mr\.?|Ms\.?|Mrs\.?|Miss|Dr\.?)\s+/i, "")
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function getDisplayName(student) {
    return (student?.displayName || student?.name || "Unknown").toString();
  }
</script>

<div class="tile-wrapper">
  <button
    class="login-tile"
    style="background:{getTileColor(index)};border-color:{getTileColor(index)};"
    on:click={() => dispatch("toggle")}
  >
    <div
      class="login-tile-avatar"
      style="background:{getAvatarColor(index)};"
    >
      <span class="avatar-initials">{getInitials(getDisplayName(student))}</span>
    </div>

    <div class="login-tile-info">
      <div class="login-tile-name">{getDisplayName(student)}</div>

      <div
        class="belt-pill"
        style="background:{getBeltColor(student.rank)};color:{getBeltTextColor(student.rank)};"
      >
        {student.rank}
      </div>
    </div>
  </button>

  {#if expanded}
    <div class="expanded-panel">
      <button class="enter-btn-small" on:click={() => dispatch("enter")}>
        Enter Dojo
      </button>
    </div>
  {/if}
</div>

<style>
.tile-wrapper {
  width: 100%;
}

.login-tile {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.1rem 1.2rem;
  border-radius: 18px;
  border: 1px solid rgba(15, 23, 42, 0.6);
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
  box-shadow: 0 4px 10px rgba(0,0,0,0.35);
  text-align: left;
}
.login-tile:hover {
  transform: translateY(-3px);
  border-color: #38bdf8;
  box-shadow: 0 10px 26px rgba(0,0,0,0.55);
}

.login-tile-avatar {
  width: 54px;
  height: 54px;
  border-radius: 999px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.5);
}

.avatar-initials {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

.login-tile-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.login-tile-name {
  font-size: 1.05rem;
  font-weight: 600;
  color: #f8fafc;
}

/* BELT PILL */
.belt-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  border: 1px solid rgba(15, 23, 42, 0.6);
  white-space: nowrap;
}

/* EXPANDED PANEL */
.expanded-panel {
  margin-top: 0.65rem;
  padding: 0.75rem 1rem;
  background: rgba(255,255,255,0.04);
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  animation: expandIn 0.18s ease;
}

@keyframes expandIn {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}

.enter-btn-small {
  width: 100%;
  padding: 0.7rem 1.2rem;
  background: linear-gradient(135deg, #0d65ac, #1a89e3);
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 700;
  color: #eaf4ff;
  cursor: pointer;
  box-shadow:
    0 3px 0 #0a4d80,
    0 8px 18px rgba(26, 139, 227, 0.25);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.enter-btn-small:hover {
  transform: translateY(-2px);
  box-shadow:
    0 3px 0 #0a4d80,
    0 14px 28px rgba(26, 139, 227, 0.35);
}
</style>
