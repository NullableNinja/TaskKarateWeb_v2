<script>
// @ts-nocheck
  import { createEventDispatcher, onMount } from "svelte";

  export let title = "";
  export let subtitle = "";
  export let value = "";
  export let pinField = null;
  export let pinError = "";
  export let avatarInitials = "";
  export let avatarColor = "";
  export let rank = "";
  export let is3Rank = "";

  const dispatch = createEventDispatcher();

  function handleCancel() {
    dispatch("cancel");
  }

  function handleSubmit() {
    dispatch("submit");
  }

  onMount(() => {
  if (pinField) {
    pinField.focus();
    pinField.select();
  }
});

function handleKey(e) {
  if (e.key === "Enter") {
    dispatch("submit");
  }
}

</script>

<div class="pin-backdrop">
  <div class="pin-card">
    <!-- Avatar -->
    <div class="avatar" style="background: {avatarColor}">
      {avatarInitials}
    </div>

    <!-- Title -->
    <h2 class="pin-title">{title}</h2>

    <!-- Handwritten subtitle (name) -->
    <p class="pin-subtitle handwritten">{subtitle}</p>

    <!-- Pills -->
    <div class="pills">
      {#if rank}
        <span class="pill">{rank}</span>
      {/if}

      {#if is3Rank}
        <span class="pill is3">{is3Rank}</span>
      {/if}
    </div>

    <!-- Input -->
    <label class="pin-label" for="pinInput">PIN</label>
<input
  id="pinInput"
  type="password"
  class="pin-input"
  bind:value={value}
  bind:this={pinField}
  placeholder="Enter PIN…"
  maxlength="8"
  on:keydown={handleKey}
/>

    {#if pinError}
      <p class="pin-error">{pinError}</p>
    {/if}

    <!-- Buttons -->
    <div class="actions">
      <button class="btn ghost" on:click={handleCancel}>
        CANCEL
      </button>
      <button class="btn ok" on:click={handleSubmit}>
        OK
      </button>
    </div>
  </div>
</div>

<style>
@import url("https://fonts.googleapis.com/css2?family=Caveat:wght@600&display=swap");

/* ---------------- BACKDROP ---------------- */
.pin-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
}

/* ---------------- CHALKBOARD CARD ---------------- */
.pin-card {
  width: 360px;
  padding: 2rem;
  border-radius: 22px;
  background: #0d1320;

  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 140px 120px, 120px 140px;

  border: 1px solid rgba(255,255,255,0.08);
  box-shadow:
    0 18px 42px rgba(0,0,0,0.55),
    inset 0 0 14px rgba(255,255,255,0.03);
}

/* ---------------- AVATAR (Material Pop) ---------------- */
.avatar {
  width: 74px;
  height: 74px;
  border-radius: 999px;
  display: flex;
  justify-content: center;
  align-items: center;

  font-weight: 900;
  font-size: 1.55rem;
  color: #0f172a;

  margin: 0 auto 1.3rem auto;

  /* STRONG Material elevation */
  box-shadow:
    0 8px 18px rgba(0,0,0,0.75),
    0 12px 32px rgba(0,0,0,0.55),
    0 0 8px rgba(255,255,255,0.18),   /* rim light */
    inset 0 0 8px rgba(255,255,255,0.18);

  border: 2px solid rgba(255,255,255,0.12);
}

/* ---------------- TEXT ---------------- */
.pin-title {
  text-align: center;
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
  color: #f1f5f9;
}

.handwritten {
  font-family: 'Caveat', cursive;
  font-size: 1.75rem;
  text-align: center;
  margin-top: 4px;
  margin-bottom: 1.1rem;
  color: #f8fafc;
  opacity: 0.95;
}

/* ---------------- PILLS ---------------- */
.pills {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.2rem;
  flex-wrap: wrap;
}

.pill {
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.18);
  background: rgba(255,255,255,0.05);
  color: #e2e8f0;
  font-size: 0.72rem;
  font-weight: 600;
}

.pill.is3 {
  border-color: rgba(56,189,248,0.45);
  background: rgba(56,189,248,0.12);
  color: #7dd3fc;
}

/* ---------------- INPUT ---------------- */

.pin-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.05em;
}

/* Chalkboard-style input */
/* ---------------- PIN INPUT (Narrow + centered) ---------------- */
.pin-input {
  width: 275px;            /* 👈 NEW: smaller width */
  margin: 6px auto 1rem;   /* 👈 NEW: perfectly centered */
  padding: 0.8rem 1rem;

  border-radius: 12px;
  background: #151b2c;

  background-image:
    radial-gradient(circle at 20% 20%, rgba(255,255,255,0.05) 0%, transparent 60%),
    radial-gradient(circle at 80% 60%, rgba(255,255,255,0.04) 0%, transparent 70%);

  border: 1px solid rgba(255,255,255,0.22);
  box-shadow:
    inset 0 0 8px rgba(255,255,255,0.06),
    0 0 4px rgba(255,255,255,0.05);

  color: #e2e8f0;
  font-size: 1rem;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;
}

.pin-input::placeholder {
  font-family: "Caveat", cursive;
  color: rgba(255,255,255,0.25);
  font-size: 1.2rem;
}

.pin-input:focus {
  outline: none;
  border-color: rgba(255,255,255,0.32);
  box-shadow:
    inset 0 0 10px rgba(255,255,255,0.09),
    0 0 6px rgba(255,255,255,0.12);
}

/* ---------------- ERRORS ---------------- */
.pin-error {
  color: #f87171;
  font-size: 0.85rem;
  text-align: center;
  margin-top: -0.3rem;
  margin-bottom: 0.6rem;
}

/* ---------------- BUTTONS ---------------- */
.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 0.4rem;
}

.btn {
  width: 48%;
  padding: 0.7rem 0;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  border: none;
}

.ghost {
  background: rgba(255,255,255,0.06);
  color: #e2e8f0;
  border: 1px solid rgba(255,255,255,0.1);
}

.ok {
  background: linear-gradient(135deg, #0d65ac, #1a89e3);
  color: #eaf4ff;
  box-shadow:
    0 4px 0 #0a4d80,
    0 8px 18px rgba(26, 139, 227, 0.3);
}
.ok:hover {
  box-shadow:
    0 4px 0 #0a4d80,
    0 12px 24px rgba(26, 139, 227, 0.4);
}
</style>
