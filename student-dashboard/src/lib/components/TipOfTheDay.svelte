<script>
  import { onMount } from 'svelte';

  const tips = [
    "Bow before entering the dojo — the floor likes respect.",
    "Your stance is your superpower. Wide base, strong mind.",
    "Block first. Ask questions later.",
    "A perfect day starts with one awesome punch.",
    "Today’s goal: Hit the pad, not your sibling.",
    "Breathe. Reset. Strike with purpose.",
    "A black belt is a white belt who didn’t give up… even on bad hair days.",
    "Hydrate before you dominate.",
    "If Sensei smiles, something cool (or terrifying) is coming.",
    "Your kicks don’t need to be high — just effective.",
    "Practice at home: The dog will forgive you eventually.",
    "The mirror is not judging you. It’s cheering for you.",
    "Remember: Respect beats strength every time.",
    "Stretch like you're reaching for the last slice of pizza.",
    "Left foot, right foot, punch things responsibly.",
    "Be the student your belt color believes you are.",
    "Energy follows intention — don’t half-send it.",
    "If you can imagine the move… you can learn the move.",
    "Leg day? Every day is leg day.",
    "Don’t chase perfection; chase progress.",
    "Your biggest opponent is yesterday’s you.",
    "Take pride in slow mastery — fast mastery is how ankles explode.",
    "Strong heart, calm mind, sharp technique.",
    "Push-ups: Sensei’s love language.",
    "A good bow shows good character.",
    "Hold your guard up… unless you like boops on the nose.",
    "Karate doesn’t build character — it reveals it.",
    "Every class is a step toward awesome.",
    "Listen twice as much as you punch.",
    "Smile after your kata. You earned it."
  ];

  let tip = "";

  onMount(() => {
    tip = tips[Math.floor(Math.random() * tips.length)];
  });
</script>

<div class="tip-container">
  <p class="tip-text">{tip}</p>
</div>

<style>
@import url("https://fonts.googleapis.com/css2?family=Caveat:wght@600&display=swap");

.tip-container {
  position: fixed;
  top: 148px; /* directly under the tab bar (104px) */
  left: 50%;
  transform: translateX(-50%);
  z-index: 14; /* just under the tabs (15) but above content */
  text-align: center;
}

.tip-text {
  font-family: 'Caveat', cursive;
  font-size: 1.4rem;
  color: #f8fafc;
  opacity: 0.88;

  animation: fadeUp 0.8s ease forwards;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
