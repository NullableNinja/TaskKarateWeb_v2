/* ============================================================
   student-login.js — Paper-Fu + Nintendo Switch Login System
   ============================================================ */

(function () {

  const DOJO_ADMIN_PIN = "8675309";

  const elements = {
    search: document.getElementById("studentSearchInput"),
    grid: document.getElementById("studentResults"),
    enterBtn: document.getElementById("enterDojoBtn"),
    loginStatus: document.getElementById("loginStatus"),

    // Instructor
    instructorToggle: document.getElementById("instructorLoginToggle"),
    instructorPinModal: document.getElementById("instructorPinModal"),
    instructorPinInput: document.getElementById("instructorPinInput"),
    instructorPinForm: document.getElementById("instructorPinForm"),
    instructorPinStatus: document.getElementById("instructorPinStatus"),
    instructorPinCancel: document.getElementById("instructorPinCancelBtn"),

    // Student PIN
    pinModal: document.getElementById("pinModal"),
    pinInput: document.getElementById("pinModalInput"),
    pinForm: document.getElementById("pinForm"),
    pinCancel: document.getElementById("pinCancelBtn"),
    pinStatus: document.getElementById("pinModalStatus"),
    pinStudentName: document.getElementById("pinModalStudentName")
  };

  let students = [];
  let selectedStudentId = null;

  let instructorMode = false;
  let instructorAuthenticated = false;

  /* ============================================================
     [1] LOAD STUDENTS.JSON
     ============================================================ */
  async function loadStudents() {
    const res = await fetch("./assets/data/students.json");
    const data = await res.json();

    students = data.students || [];
    renderStudentGrid("");
  }

  /* ============================================================
     [2] FILTER + RENDER ROSTER GRID
     ============================================================ */
  function renderStudentGrid(query) {
    const q = query.toLowerCase();
    const filtered = students.filter(s =>
      s.name.toLowerCase().includes(q) ||
      (s.displayName || "").toLowerCase().includes(q)
    );

    elements.grid.innerHTML = "";

    filtered.forEach(student => {
      const card = document.createElement("button");
      card.className = "login-tile";
      card.dataset.id = student.id;

      const initials = (student.displayName || student.name)
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase();

      card.innerHTML = `
        <div class="login-tile-avatar">
          <span class="avatar-initials">${initials}</span>
        </div>
        <div class="login-tile-body">
          <div class="login-tile-name">${student.displayName || student.name}</div>
          <div class="login-tile-rank">${student.rank || ""}</div>
        </div>
      `;

      card.addEventListener("click", () => handleTileClick(student));
      elements.grid.appendChild(card);
    });
  }

  /* ============================================================
     [3] TILE CLICK HANDLER
     ============================================================ */
  function handleTileClick(student) {
    selectedStudentId = student.id;

    // highlight selected tile
    [...elements.grid.children].forEach(tile =>
      tile.classList.toggle("is-selected", tile.dataset.id === student.id)
    );

    // Instructor → skip student PIN
    if (instructorMode && instructorAuthenticated) {
      saveSession(student, { isInstructorProxy: true });
      window.location.href = "student-dashboard.html";
      return;
    }

    // Normal student → open PIN modal immediately
    openStudentPinModal(student);
  }

  /* ============================================================
     [4] ENTER DOJO BUTTON (keyboard support)
     ============================================================ */
  elements.enterBtn.addEventListener("click", () => {
    if (!selectedStudentId) {
      elements.loginStatus.textContent = "Select your profile first.";
      return;
    }

    const student = students.find(s => s.id === selectedStudentId);

    if (instructorMode && instructorAuthenticated) {
      saveSession(student, { isInstructorProxy: true });
      window.location.href = "student-dashboard.html";
      return;
    }

    openStudentPinModal(student);
  });

  /* ============================================================
     [5] STUDENT PIN MODAL
     ============================================================ */
  function openStudentPinModal(student) {
    elements.pinStudentName.textContent = `Logging in as ${student.displayName || student.name}`;
    elements.pinStatus.textContent = "";
    elements.pinInput.value = "";

    elements.pinModal.classList.add("is-open");
    setTimeout(() => elements.pinInput.focus(), 50);

    elements.pinForm.onsubmit = e => {
      e.preventDefault();
      const pin = elements.pinInput.value.trim();

      if (pin === student.pin) {
        saveSession(student, { isInstructorProxy: false });
        window.location.href = "student-dashboard.html";
      } else {
        elements.pinStatus.textContent = "Incorrect PIN.";
      }
    };
  }

  elements.pinCancel.addEventListener("click", () => {
    elements.pinModal.classList.remove("is-open");
  });

  /* ============================================================
     [6] INSTRUCTOR MODE TOGGLE + PIN
     ============================================================ */
  elements.instructorToggle.addEventListener("change", () => {
    if (elements.instructorToggle.checked) {
      openInstructorPinModal();
    } else {
      instructorMode = false;
      instructorAuthenticated = false;
    }
  });

  function openInstructorPinModal() {
    elements.instructorPinStatus.textContent = "";
    elements.instructorPinInput.value = "";

    elements.instructorPinModal.classList.add("is-open");
    setTimeout(() => elements.instructorPinInput.focus(), 50);

    elements.instructorPinForm.onsubmit = e => {
      e.preventDefault();
      if (elements.instructorPinInput.value.trim() === DOJO_ADMIN_PIN) {
        instructorMode = true;
        instructorAuthenticated = true;
        elements.instructorPinModal.classList.remove("is-open");
      } else {
        elements.instructorPinStatus.textContent = "Incorrect dojo PIN.";
        elements.instructorToggle.checked = false;
      }
    };
  }

  elements.instructorPinCancel.addEventListener("click", () => {
    elements.instructorPinModal.classList.remove("is-open");
    elements.instructorToggle.checked = false;
  });

  /* ============================================================
     [7] SAVE SESSION
     ============================================================ */
function saveSession(student, opts = {}) {
  const payload = {
      id: student.id,
      displayName: student.displayName || student.name,
      roles: student.roles || ["student"],
      rank: student.rank || "",
      isInstructorProxy: !!opts.isInstructorProxy,
      isInstructor: !!opts.isInstructorProxy,     // <-- ADD THIS
      lastActive: Date.now()
  };

  localStorage.setItem("tkStudentSession", JSON.stringify(payload));
}


  /* ============================================================
     [8] SEARCH BAR
     ============================================================ */
  elements.search.addEventListener("input", e =>
    renderStudentGrid(e.target.value)
  );

  /* ============================================================
     [9] INIT
     ============================================================ */
  loadStudents();

})();
