<script>
// @ts-nocheck
  import { tick, onMount } from "svelte";
  import { students, setActiveStudent, loadStudents } from "$lib/stores/students.js";
  import { goto } from '$app/navigation';
  
  import LoginTile from "$lib/components/LoginTile.svelte";
  import PinModal from "$lib/components/PinModal.svelte";
  import TipOfTheDay from '$lib/components/TipOfTheDay.svelte';


  // ---------------------------------------
  // LOCAL STATE
  // ---------------------------------------
  let searchQuery = "";
  let instructorMode = false;

  let allStudents = [];
  let filtered = [];
  let sorted = [];
  let grouped = {};

  let expandedTile = null;
  let selectedStudent = null;
  let selectedAvatarIndex = 0;

  let showStudentPin = false;
  let showInstructorPin = false;

  let studentPinInput = "";
  let instructorPinInput = "";

  let pinError = "";
  let instructorError = "";

  const DOJO_ADMIN_PIN = "8675309";

  let pinField = null;

  // ---------------------------------------
  // SHARED HELPERS
  // ---------------------------------------
  const avatarColors = [
    "#93c5fd",
    "#a5f3fc",
    "#fda4af",
    "#fcd34d",
    "#bbf7d0",
    "#c7d2fe"
  ];

  function getAvatarColor(index) {
    if (index == null) return avatarColors[0];
    return avatarColors[index % avatarColors.length];
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

  // ---------------------------------------
  // LOAD STUDENTS
  // ---------------------------------------
  $: allStudents = $students || [];

  $: filtered =
    allStudents.filter((s) => {
      const full = `${s?.name || ''} ${s?.displayName || ''}`;
      return full.toLowerCase().includes(searchQuery.toLowerCase());
    }) || [];

  function getLastName(s) {
    const nameStr = (s?.displayName || s?.name || "").toString();
    const parts = nameStr.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "";
    return parts[parts.length - 1].toUpperCase();
  }

  $: sorted = [...filtered].sort((a, b) =>
    getLastName(a).localeCompare(getLastName(b))
  );

  $: grouped = sorted.reduce((acc, s) => {
    const letter = getLastName(s)[0];
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(s);
    return acc;
  }, {});

  // ---------------------------------------
  // TILE BEHAVIOR
  // ---------------------------------------
  function toggleExpandTile(studentId) {
    expandedTile = expandedTile === studentId ? null : studentId;
  }

  // ---------------------------------------
  // PIN FLOW
  // ---------------------------------------
  function handleEnterStudent(s, index) {
    selectedStudent = s;
    selectedAvatarIndex = index ?? 0;

    if (instructorMode) {
      // Direct login (bypass student PIN)
      setActiveStudent(s);
      goto('/dashboard', { replaceState: true });
    } else {
      showStudentPin = true;
      studentPinInput = "";
      pinError = "";
    }
  }

  function submitStudentPin() {
    if (!selectedStudent) return;

    if (studentPinInput === (selectedStudent.pin ?? "")) {
      setActiveStudent(selectedStudent);
      showStudentPin = false;
      goto('/dashboard', { replaceState: true });
    } else {
      pinError = "Incorrect PIN — try again.";
    }
  }

  // Load students when the login component mounts (browser-only)
  onMount(() => {
    loadStudents().catch((err) => console.error("Failed to load students:", err));
  });

  // ---------------------------------------
  // INSTRUCTOR PIN
  // ---------------------------------------
  function toggleInstructor() {
    if (instructorMode) {
      instructorMode = false;
      return;
    }

    instructorPinInput = "";
    instructorError = "";
    showInstructorPin = true;
  }

  function submitInstructorPin() {
    if (instructorPinInput === DOJO_ADMIN_PIN) {
      instructorMode = true;
      showInstructorPin = false;
    } else {
      instructorError = "Invalid admin PIN.";
    }
  }

  // Autofocus when PIN modal opens
  $: if (showStudentPin || showInstructorPin) {
    tick().then(() => {
      if (pinField) pinField.focus();
    });
  }

  // Instructor mode highlight class
  $: instructorModeClass = instructorMode ? "instructor-active" : "";
</script>

<!-- LOGIN WRAPPER -->
<div class="login-wrapper" style="margin-top: 100px;">
  <section class="login-card {instructorModeClass}">
    <!-- OPTIONAL TAG -->
    {#if instructorMode}
      <div class="instructor-tag">Instructor Mode Enabled</div>
    {/if}

    <!-- HEADER -->
    <header class="login-header">
      <h1 class="login-title">Enter the Dojo</h1>
      <p class="login-subtitle">
        Tap your profile to begin your training journey.
      </p>
    </header>

    <!-- TIP OF THE DAY -->
    <TipOfTheDay />

    <!-- SEARCH + INSTRUCTOR TOGGLE -->
    <div class="login-toolbar">
      <input
        type="text"
        class="login-search"
        placeholder="Search students…"
        bind:value={searchQuery}
      />

      <div class="instructor-switch">
        <button
          type="button"
          aria-label="Toggle Instructor Login"
          class={"instructor-toggle " + (instructorMode ? "is-on" : "")}
          on:click={toggleInstructor}
        >
          <span class="instructor-thumb"></span>
        </button>
        <span class="instructor-label">Instructor Login</span>
      </div>
    </div>

    <!-- STUDENT GRID -->
    <div class="login-roster-scroll">
      <div class="login-grid">
        {#each Object.keys(grouped) as letter}
          <div class="letter-header">— {letter} —</div>

          {#each grouped[letter] as s, i}
            <LoginTile
              student={s}
              index={i}
              expanded={expandedTile === s.id}
              on:toggle={() => toggleExpandTile(s.id)}
              on:enter={() => handleEnterStudent(s, i)}
            />
          {/each}
        {/each}
      </div>
    </div>
  </section>
</div>

<!-- STUDENT PIN MODAL -->
{#if showStudentPin && selectedStudent}
  <PinModal
    title="Enter Your PIN"
    subtitle={selectedStudent.displayName}
    bind:value={studentPinInput}
    {pinField}
    pinError={pinError}
    avatarInitials={getInitials(selectedStudent.displayName)}
    avatarColor={getAvatarColor(selectedAvatarIndex)}
    rank={selectedStudent.rank}
    is3Rank={selectedStudent.is3Rank}
    on:submit={submitStudentPin}
    on:cancel={() => (showStudentPin = false)}
  />
{/if}

<!-- INSTRUCTOR PIN MODAL -->
{#if showInstructorPin}
  <PinModal
    title="Instructor Access"
    subtitle="Enter the Dojo Admin PIN."
    bind:value={instructorPinInput}
    {pinField}
    pinError={instructorError}
    avatarInitials="TK"
    avatarColor="#38bdf8"
    rank=""
    is3Rank=""
    on:submit={submitInstructorPin}
    on:cancel={() => (showInstructorPin = false)}
  />
{/if}

<style>
/* ROOT WRAPPER */
.login-wrapper {
  max-width: 950px;
  margin: 3rem auto;
  padding: 1.5rem;
  color: #e5e7eb;
  font-family: var(--font-body, Inter, system-ui, sans-serif);
}

/* LOGIN CARD */
.login-card {
  padding: 2rem 2.2rem;
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.88);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(148, 163, 184, 0.25);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.45);
  position: relative;
}

/* INSTRUCTOR MODE EFFECT */
.login-card.instructor-active {
  border: 1px solid rgba(56, 189, 248, 0.55);
  box-shadow:
    0 0 22px rgba(56, 189, 248, 0.25),
    0 0 60px rgba(56, 189, 248, 0.18) inset;
  animation: pulseGlow 6s ease-in-out infinite;
}

@keyframes pulseGlow {
  0%, 100% {
    box-shadow:
      0 0 22px rgba(56, 189, 248, 0.25),
      0 0 60px rgba(56, 189, 248, 0.18) inset;
  }
  50% {
    box-shadow:
      0 0 28px rgba(56, 189, 248, 0.35),
      0 0 70px rgba(56, 189, 248, 0.25) inset;
  }
}

/* TAG */
.instructor-tag {
  position: absolute;
  top: -14px;
  right: 12px;
  background: rgba(56, 189, 248, 0.25);
  backdrop-filter: blur(4px);
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #e0f7ff;
  border: 1px solid rgba(56, 189, 248, 0.4);
}

/* HEADER */
.login-title {
  font-family: var(--font-title, "Bebas Neue", sans-serif);
  margin: 0;
  font-size: 2.6rem;
  letter-spacing: 0.05em;
}
.login-subtitle {
  margin-top: 4px;
  opacity: 0.75;
  font-size: 0.95rem;
}

/* TOOLBAR */
.login-toolbar {
  display: flex;
  gap: 1rem;
  margin: 1.4rem 0 1.6rem;
  align-items: center;
}
.login-search {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid #334155;
  background: #020617;
  color: #e2e8f0;
}
.login-search::placeholder {
  color: #64748b;
}

/* INSTRUCTOR SWITCH */
.instructor-switch {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}
.instructor-toggle {
  width: 52px;
  height: 28px;
  background: #1e293b;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  position: relative;
  transition: background 0.18s ease;
  padding: 0;
}
.instructor-thumb {
  position: absolute;
  width: 22px;
  height: 22px;
  top: 3px;
  left: 3px;
  border-radius: 50%;
  background: #f8fafc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  transition: transform 0.18s ease;
}
.instructor-toggle.is-on {
  background: #38bdf8;
}
.instructor-toggle.is-on .instructor-thumb {
  transform: translateX(24px);
}
.instructor-label {
  font-size: 0.85rem;
  color: #cbd5f5;
}

/* GRID */
.login-roster-scroll {
  max-height: 480px;
  overflow-y: auto;
  padding-right: 6px;
}
.login-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}
.letter-header {
  font-family: var(--font-title, "Bebas Neue", sans-serif);
  font-size: 1.3rem;
  opacity: 0.5;
  grid-column: 1 / -1;
  margin-top: 0.75rem;
  margin-bottom: -0.4rem;
  letter-spacing: 0.05em;
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .login-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .login-grid {
    grid-template-columns: 1fr;
  }
}

/* -----------------------------
   OPTIONAL: Paper-Fu Scrollbar
   (Chrome/Edge/Safari / WebKit)
   ----------------------------- */

.login-roster-scroll::-webkit-scrollbar {
  width: 8px;
}

.login-roster-scroll::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.85);
  border-radius: 999px;
}

.login-roster-scroll::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(148, 163, 184, 0.8), rgba(51, 65, 85, 0.95));
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.9);
}

.login-roster-scroll::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgba(226, 232, 240, 0.9), rgba(148, 163, 184, 1));
}
</style>
