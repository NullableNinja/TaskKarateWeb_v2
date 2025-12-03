<script>
  import Modal from '$lib/components/Modal.svelte';
  import { activeStudent } from '$lib/stores/students.js';

  export let open = false;
  export let item = null; // { name, steps, progress }
  export let onClose = () => {};

  let currentStep = 0;
  $: totalSteps = (item?.steps || 8);
  $: currentStep = item ? (item.progress || 0) : 0;
  $: stepLabel = item && Array.isArray(item.stepLabels) && item.stepLabels[currentStep-1] ? item.stepLabels[currentStep-1] : `Step ${currentStep} of ${totalSteps}`;

  let timer = 0;
  let ticking = false;
  let intervalId;

  function toggleTimer() {
    ticking = !ticking;
    if (ticking) {
      intervalId = setInterval(() => { timer += 1; }, 1000);
    } else {
      if (intervalId) clearInterval(intervalId);
    }
  }

  function nextStep() {
    if (!item) return;
    currentStep = Math.min(totalSteps, currentStep + 1);
    item.progress = currentStep;
    // persist to active student store
    const me = $activeStudent;
    if (me && Array.isArray(me.practiceItems)) {
      const idx = me.practiceItems.findIndex(pi => pi.name === item.name);
      if (idx !== -1) {
        me.practiceItems[idx] = { ...item };
        activeStudent.set({ ...me });
        if (typeof window !== 'undefined') {
          try {
            const all = JSON.parse(localStorage.getItem('studentsData') || '[]');
            const si = all.findIndex(s => s.id === me.id);
            if (si !== -1) { all[si] = me; localStorage.setItem('studentsData', JSON.stringify(all)); }
          } catch (_) {}
        }
      }
    }
  }
</script>

{#if open && item}
  <Modal title={item.name || 'Training Session'} onClose={onClose}>
    <div class="session-modal">
      <div class="session-header">
        <div class="step-label">{stepLabel}</div>
        <div class="timer">
          <button class="btn btn-small" on:click={toggleTimer}>{ticking ? 'Pause' : 'Start'} Timer</button>
          <span class="time-val">{String(Math.floor(timer/60)).padStart(2,'0')}:{String(timer%60).padStart(2,'0')}</span>
        </div>
      </div>
      <div class="heatbar">
        {#each Array.from({ length: totalSteps }) as _, i}
          <div class={`heat-seg ${i < currentStep ? 'is-filled' : ''}`} style={`--h:${Math.round(0 + 120 * (i/Math.max(1,totalSteps-1)))}`}></div>
        {/each}
      </div>
      <div class="session-controls">
        <button class="btn" on:click={nextStep} disabled={currentStep >= totalSteps}>{currentStep >= totalSteps ? 'Completed' : 'Next Step'}</button>
      </div>
    </div>
  </Modal>
{/if}

<style>
  .session-modal { display:flex; flex-direction:column; gap:12px }
  .session-header { display:flex; align-items:center; justify-content:space-between }
  .step-label { font-weight:700; color: var(--text-main,#e5e7eb) }
  .timer { display:flex; align-items:center; gap:8px }
  .heatbar { display:grid; grid-template-columns: repeat(8, minmax(0,1fr)); gap:6px }
  .heat-seg { height:12px; border-radius:6px; background: rgba(148,163,184,0.2) }
  .heat-seg.is-filled { background: hsl(var(--h,120), 70%, 45%); box-shadow: 0 4px 10px rgba(0,0,0,0.25) }
  .session-controls { display:flex; justify-content:flex-end }
  .btn { padding:8px 12px; border-radius:8px; border:1px solid rgba(148,163,184,0.25); background: rgba(255,255,255,0.06); color:#e5e7eb; cursor:pointer }
  .btn-small { padding:6px 10px; font-size:0.85rem }
  .btn[disabled] { opacity:0.6; cursor:not-allowed }
</style>