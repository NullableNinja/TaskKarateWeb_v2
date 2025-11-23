document.addEventListener("DOMContentLoaded", () => {
  const shield = document.getElementById("mapShield");
  if (!shield) return;

  // Click to enable map interaction
  shield.addEventListener("click", () => {
    shield.classList.add("disabled");
  });

  // When mouse leaves the map, re-enable the shield
  shield.addEventListener("mouseleave", () => {
    shield.classList.remove("disabled");
  });
});
