<script>
  import { dashboardLayout, AVAILABLE_TILES } from '$lib/stores/dashboardLayout.js';
  import { get } from 'svelte/store';

  export let tileId = '';
  export let zone = 'mid';
  export let studentId = '';
  export let index = 0;

  let isDragging = false;
  let dragData = null;

  function handleDragStart(e) {
    isDragging = true;
    dragData = { tileId, zone, index, studentId };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(e) {
    e.preventDefault();
    
    try {
      const sourceData = JSON.parse(e.dataTransfer.getData('application/json'));
      
      // Only allow reordering within same student's dashboard
      if (sourceData.studentId !== studentId) return;
      
      // If same zone, reorder; if different zone, move
      if (sourceData.zone === zone) {
        dashboardLayout.reorderInZone(sourceData.tileId, zone, sourceData.index, index);
      } else {
        dashboardLayout.moveTile(sourceData.tileId, sourceData.zone, zone, index);
      }
      
      // Persist the updated layout from the store (avoid reading stale localStorage)
      try {
        const updated = get(dashboardLayout);
        dashboardLayout.saveLayout(studentId, updated);
      } catch (err) {
        console.warn('Could not persist layout after drop', err);
      }
    } catch (e) {
      console.error('Drop failed:', e);
    }
  }

  function handleDragEnd() {
    isDragging = false;
  }
</script>

<div
  class={`dashboard-tile tile-${AVAILABLE_TILES[tileId]?.type || 'panel'}`}
  draggable="true"
  role="button"
  tabindex="0"
  on:dragstart={handleDragStart}
  on:dragover={handleDragOver}
  on:drop={handleDrop}
  on:dragend={handleDragEnd}
  class:dragging={isDragging}
>
  <slot />
</div>

<style>
  .dashboard-tile {
    cursor: grab;
    transition: opacity 0.2s, box-shadow 0.2s;
  }

  .dashboard-tile:hover {
    opacity: 0.95;
  }

  .dashboard-tile:active {
    cursor: grabbing;
  }

  .dashboard-tile.dragging {
    opacity: 0.5;
    box-shadow: 0 0 20px rgba(56, 189, 248, 0.3);
  }

  .tile-chip {
    display: inline-block;
  }

  .tile-panel {
    width: 100%;
  }
</style>
