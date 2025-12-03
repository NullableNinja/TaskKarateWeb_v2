<script>
  import { onDestroy } from 'svelte';
  import { newsModalState, closeNewsModal } from '$lib/stores/newsModal.js';
  import { derived } from 'svelte/store';

  let open = false;
  let article = null;

  const unsub = newsModalState.subscribe((s) => {
    open = s.open;
    article = s.article;
    if (open) document.body.classList.add('news-modal-open');
    else document.body.classList.remove('news-modal-open');
  });

  onDestroy(() => {
    unsub();
    document.body.classList.remove('news-modal-open');
  });

  function onBackdropClick(e) {
    if (e.target === e.currentTarget) closeNewsModal();
  }

  function onKey(e) {
    if (e.key === 'Escape') closeNewsModal();
  }
</script>

{#if open}
  <div class="news-modal-backdrop" on:click={onBackdropClick} on:keydown={onKey} tabindex="-1">
    <article class="news-modal" role="dialog" aria-modal="true">
      <div class="news-modal-content">
        <header class="news-modal-header">
          <h2 class="news-modal-title">{article?.title || 'News Article'}</h2>
          <button class="news-modal-close" aria-label="Close" on:click={closeNewsModal}>&times;</button>
        </header>

        <div class="news-modal-body">
          <div class="news-modal-tag">{article?.tag || 'General'}</div>
          <p class="news-modal-date">{article?.date || 'Recent'}</p>
          <div class="news-modal-text">{@html article?.fullText || article?.summary || 'No content available.'}</div>
        </div>

        <footer class="news-modal-meta">
          <span>Category: {article?.tag || 'General'}</span>
          <span>Published: {article?.date || 'Recent'}</span>
        </footer>
      </div>
    </article>
  </div>
{/if}

<style>
  .news-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(2,6,23,0.6);
    display:flex;
    align-items:center;
    justify-content:center;
    z-index: 10010;
  }

  .news-modal { width: min(860px, 95%); max-height: 90vh; overflow:auto; }
  .news-modal-content { background: rgba(15,23,42,0.96); padding: 18px; border-radius: 12px; color: #e5e7eb }
  .news-modal-header { display:flex; justify-content:space-between; align-items:center; }
  .news-modal-title { margin:0 }
  .news-modal-close { background:transparent; border:0; font-size:1.6rem; color:#e5e7eb }
  .news-modal-body { margin-top:10px }
  .news-modal-tag { background: rgba(255,255,255,0.03); padding:4px 8px; border-radius:6px; display:inline-block }
  .news-modal-date { color: #9ca3af; margin-top:6px }
  .news-modal-text { margin-top:12px; color:#d1d5db }
  .news-modal-meta { display:flex; gap:12px; margin-top:12px; color:#9ca3af }
</style>
