<script>
  export let open = false;
  export let title = "";
  export let onClose = () => {};

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Escape' && open) {
      onClose();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<svelte:head>
  <style>
    @keyframes modalFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes modalSlideUp {
      from { 
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  </style>
</svelte:head>

{#if open}
  <div class="modal-backdrop" on:click={handleBackdropClick} on:keydown={handleKeydown} role="presentation">
    <div class="modal-content" on:click|stopPropagation on:keydown|stopPropagation role="dialog" aria-modal="true" tabindex="-1">
      <header class="modal-header">
        <h2>{title}</h2>
        <button class="modal-close" on:click={onClose}>✕</button>
      </header>
      <div class="modal-body">
        <slot />
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: modalFadeIn 0.2s ease;
  }

  .modal-content {
    background: rgba(15, 23, 42, 0.96);
    border: 1px solid rgba(148, 163, 184, 0.35);
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow: auto;
    animation: modalSlideUp 0.3s ease;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  }

  .modal-header h2 {
    margin: 0;
    font-family: var(--font-title, 'Bebas Neue', sans-serif);
    font-size: 1.5rem;
    letter-spacing: 0.03em;
    color: var(--text-main, #e5e7eb);
  }

  .modal-close {
    background: none;
    border: none;
    color: #9ca3af;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 4px 8px;
    line-height: 1;
    transition: color 0.2s ease;
  }

  .modal-close:hover {
    color: #e5e7eb;
  }

  .modal-body {
    padding: 24px;
  }
</style>
