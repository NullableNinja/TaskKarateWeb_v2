<script>
  // Minimal stub of DashboardTile — non-draggable wrapper used when customization is disabled.
  export let tileId = '';
  export let zone = 'mid';
  export let studentId = '';
  export let index = 0;
</script>

<div class="dashboard-tile tile-panel">
  <slot />
</div>

<style>
  .dashboard-tile { width: 100%; }
  .tile-panel { display:block; }
</style>
