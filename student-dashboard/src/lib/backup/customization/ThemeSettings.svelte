<script>
  import { theme } from '$lib/stores/theme.js';
  import { activeStudent } from '$lib/stores/students.js';
  import { onMount } from 'svelte';

  let local = { panelAccent: '#0ea5e9', panelAccentAlpha: 0.06, subAccent: '#f97316', subAccentAlpha: 0.08 };
  let visible = false;
  let studentId = null;

  const unsubscribe = activeStudent.subscribe(v => {
    studentId = v?.id;
  });

  onMount(() => {
    if (studentId) {
      const loaded = theme.load(studentId);
      if (loaded) local = { ...loaded };
    } else {
      // no student yet — use default
      theme.subscribe(t => local = { ...t });
    }
  });

  function toggle() {
    visible = !visible;
  }

  function save() {
    if (!studentId) return;
    theme.save(studentId, local);
    visible = false;
  }

  function reset() {
    if (!studentId) return;
    theme.reset(studentId);
    const loaded = theme.load(studentId);
    local = { ...loaded };
  }

  $: cssPreview = `linear-gradient(180deg, ${local.panelAccent} ${Math.min(100,(local.panelAccentAlpha||0.06)*100)}%, rgba(0,0,0,0) 100%)`;
</script>

<div class="theme-settings">
  <button class="theme-toggle" on:click={toggle} aria-expanded={visible} title="Theme settings">
    ⚙️
  </button>

  {#if visible}
    <div class="theme-popover">
      <h4>Dashboard Theme</h4>
      <label for="panelAccent">Panel accent</label>
      <input id="panelAccent" type="color" bind:value={local.panelAccent} />
      <label for="panelAccentAlpha">Accent opacity</label>
      <input id="panelAccentAlpha" type="range" min="0" max="0.25" step="0.01" bind:value={local.panelAccentAlpha} />

      <label for="subAccent">Subpanel accent</label>
      <input id="subAccent" type="color" bind:value={local.subAccent} />
      <label for="subAccentAlpha">Sub-accent opacity</label>
      <input id="subAccentAlpha" type="range" min="0" max="0.25" step="0.01" bind:value={local.subAccentAlpha} />

      <div class="theme-actions">
        <button on:click={save}>Save</button>
        <button on:click={reset}>Reset</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .theme-settings { position: relative; display:inline-block }
  .theme-toggle { background: transparent; border: none; cursor: pointer; font-size: 18px }
  .theme-popover { position: absolute; right: 0; top: 36px; width: 220px; padding: 12px; border-radius: 12px; background: rgba(10,12,20,0.85); border:1px solid rgba(148,163,184,0.12); box-shadow: 0 8px 24px rgba(2,6,23,0.6); z-index: 40 }
  .theme-popover h4 { margin: 0 0 8px 0 }
  .theme-popover label { display:block; margin-top:8px; font-size: 0.8rem }
  .theme-popover input[type='color'] { width:100%; height:36px; border-radius:8px; border:none; padding:4px }
  .theme-popover input[type='range'] { width:100% }
  .theme-actions { display:flex; gap:8px; margin-top:10px }
  .theme-actions button { flex:1; padding:6px 8px; border-radius:8px; border:1px solid rgba(255,255,255,0.04); background: rgba(255,255,255,0.03); color:#fff }
</style>
