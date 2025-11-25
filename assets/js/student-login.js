// ================================
// student-login.js
// Search + tile select + PIN modal → stores tkStudentSession in localStorage
// ================================

(function () {
  const SESSION_STORAGE_KEY = "tkStudentSession";

  // -----------------------------
  // DOM SELECTORS
  // -----------------------------
  const selectors = {
    form: document.getElementById("loginForm"),
    searchInput: document.getElementById("studentSearchInput"),
    results: document.getElementById("studentResults"),
    status: document.getElementById("loginStatus"),
    enterBtn: document.getElementById("enterDojoBtn"),

    // Modal bits
    pinModal: document.getElementById("pinModal"),
    pinForm: document.getElementById("pinForm"),
    pinInput: document.getElementById("pinModalInput"),
    pinStatus: document.getElementById("pinModalStatus"),
    pinCancelBtn: document.getElementById("pinCancelBtn"),
    pinStudentName: document.getElementById("pinModalStudentName")
  };

  let students = [];
  let selectedStudentId = null;

  // -----------------------------
  // LOAD STUDENT DATA
  // -----------------------------
  async function loadStudents() {
    try {
      const res = await fetch("./assets/data/students.json");
      if (!res.ok) throw new Error("Unable to load students.json");
      const data = await res.json();
      students = data.students || [];

      // Initial render — show all tiles
      renderResults("");
    } catch (err) {
      if (selectors.status) {
        selectors.status.textContent =
          "Unable to load student list. Please try again.";
        selectors.status.classList.add("text-error");
      }
      console.error(err);
    }
  }

  // -----------------------------
  // SEARCH + TILE RENDER
  // -----------------------------
  function normalize(str) {
    return (str || "").toString().toLowerCase().trim();
  }

  function renderResults(query) {
    if (!selectors.results) return;
    selectors.results.innerHTML = "";

    const q = normalize(query);
    let matches = students;

    if (q) {
      matches = students.filter((s) => {
        const name = normalize(s.name);
        const display = normalize(s.displayName || "");
        return name.includes(q) || display.includes(q);
      });
    }

    if (!matches.length) {
      selectors.results.innerHTML =
        '<p class="muted text-sm">No matches yet. Try a different spelling or ask an instructor.</p>';
      selectedStudentId = null;
      return;
    }

    matches.forEach((s) => {
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = "login-tile";
      tile.dataset.studentId = s.id;

      const displayName = s.displayName || s.name || s.id;
      const initials = displayName
        .split(" ")
        .map((n) => n[0] || "")
        .join("")
        .slice(0, 2)
        .toUpperCase();

      const rank = s.rank || "";
      const roles = Array.isArray(s.roles) ? s.roles : [];
      const isStaff = roles.includes("assistant") || roles.includes("instructor");

      tile.innerHTML = `
        <div class="login-tile__avatar ${
          isStaff ? "login-tile__avatar--staff" : ""
        }">
          <span>${initials || "TK"}</span>
        </div>
        <div class="login-tile__meta">
          <strong>${displayName}</strong>
          <p class="muted text-xs">${rank}</p>
          ${
            isStaff
              ? '<p class="login-tile__role text-xs">Instructor / Helper</p>'
              : ""
          }
        </div>
      `;

      tile.addEventListener("click", () => handleTileClick(s.id, tile));
      selectors.results.appendChild(tile);
    });

    // Re-apply selected state after re-filtering
    if (selectedStudentId) {
      const selectedTile = selectors.results.querySelector(
        `[data-student-id="${selectedStudentId}"]`
      );
      if (selectedTile) {
        selectedTile.classList.add("is-selected");
      }
    }
  }

  function handleTileClick(studentId, tileElement) {
    selectedStudentId = studentId;

    const tiles = selectors.results.querySelectorAll(".login-tile");
    tiles.forEach((t) => t.classList.remove("is-selected"));

    if (tileElement) {
      tileElement.classList.add("is-selected");
    }

    // Clear main status when a tile is chosen
    if (selectors.status) {
      selectors.status.textContent = "";
      selectors.status.classList.remove("text-error");
    }
  }

  // -----------------------------
  // SESSION STORAGE
  // -----------------------------
  function saveSession(student) {
    const payload = {
      id: student.id,
      displayName: student.displayName || student.name || student.id,
      roles: Array.isArray(student.roles) ? student.roles : ["student"],
      lastActive: Date.now()
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
  }

  // -----------------------------
  // PIN MODAL CONTROL
  // -----------------------------
  function openPinModal() {
    if (!selectors.pinModal) return;

    const student = students.find((s) => s.id === selectedStudentId);

    if (selectors.pinStudentName) {
      const span =
        selectors.pinStudentName.querySelector("span") ||
        selectors.pinStudentName;
      span.textContent = student
        ? student.displayName || student.name || student.id
        : "";
    }

    if (selectors.pinStatus) {
      selectors.pinStatus.textContent = "";
      selectors.pinStatus.classList.remove("text-error");
    }

    if (selectors.pinInput) {
      selectors.pinInput.value = "";
    }

    selectors.pinModal.classList.add("is-open");
    document.body.classList.add("pin-modal-open");

    // Slight delay to allow DOM to paint before focusing
    setTimeout(() => {
      if (selectors.pinInput) {
        selectors.pinInput.focus();
        selectors.pinInput.select();
      }
    }, 50);
  }

  function closePinModal() {
    if (!selectors.pinModal) return;
    selectors.pinModal.classList.remove("is-open");
    document.body.classList.remove("pin-modal-open");
  }

  // -----------------------------
  // ENTER DOJO CLICK
  // -----------------------------
  function handleEnterClick() {
    if (!selectors.status) return;

    selectors.status.textContent = "";
    selectors.status.classList.remove("text-error");

    if (!selectedStudentId) {
      selectors.status.textContent =
        "Tap your name tile before entering your PIN.";
      selectors.status.classList.add("text-error");
      return;
    }

    openPinModal();
  }

  // -----------------------------
  // PIN SUBMIT HANDLER
  // -----------------------------
  function handlePinSubmit(e) {
    e.preventDefault();
    if (!selectors.pinStatus) return;

    selectors.pinStatus.textContent = "";
    selectors.pinStatus.classList.remove("text-error");

    const pin = (selectors.pinInput && selectors.pinInput.value.trim()) || "";

    if (!selectedStudentId) {
      selectors.pinStatus.textContent =
        "Select your profile tile first, then enter your PIN.";
      selectors.pinStatus.classList.add("text-error");
      return;
    }

    if (!pin) {
      selectors.pinStatus.textContent = "Enter your PIN to continue.";
      selectors.pinStatus.classList.add("text-error");
      return;
    }

    const student = students.find((s) => s.id === selectedStudentId);
    if (!student) {
      selectors.pinStatus.textContent = "Student record not found.";
      selectors.pinStatus.classList.add("text-error");
      return;
    }

    if (student.pin !== pin) {
      selectors.pinStatus.textContent =
        "Incorrect PIN. Try again or ask an instructor.";
      selectors.pinStatus.classList.add("text-error");
      return;
    }

    // Success → save session and go to dashboard
    saveSession(student);
    closePinModal();
    window.location.href = "student-dashboard.html";
  }

  // -----------------------------
  // EVENT WIRING
  // -----------------------------
  function wireEvents() {
    // Main form: pressing Enter inside search should behave like clicking Enter Dojo
    if (selectors.form) {
      selectors.form.addEventListener("submit", (e) => {
        e.preventDefault();
        handleEnterClick();
      });
    }

    if (selectors.searchInput) {
      selectors.searchInput.addEventListener("input", (e) => {
        renderResults(e.target.value);
      });
    }

    if (selectors.enterBtn) {
      selectors.enterBtn.addEventListener("click", handleEnterClick);
    }

    // Modal form
    if (selectors.pinForm) {
      selectors.pinForm.addEventListener("submit", handlePinSubmit);
    }

    if (selectors.pinCancelBtn) {
      selectors.pinCancelBtn.addEventListener("click", closePinModal);
    }

    // Close modal on ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (selectors.pinModal && selectors.pinModal.classList.contains("is-open")) {
          closePinModal();
        }
      }
    });

    // Optional: clicking backdrop closes modal
    if (selectors.pinModal) {
      selectors.pinModal.addEventListener("click", (e) => {
        if (e.target === selectors.pinModal) {
          closePinModal();
        }
      });
    }
  }

  // -----------------------------
  // INIT
  // -----------------------------
  wireEvents();
  loadStudents();
})();
