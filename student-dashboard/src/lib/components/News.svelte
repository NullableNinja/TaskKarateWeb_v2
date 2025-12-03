<script>
  import { news } from '$lib/stores/students.js';
  import { openNewsModal } from '$lib/stores/newsModal.js';
  import NewsModal from './NewsModal.svelte';

  let newsList = [];
  const unsub = news.subscribe(n => newsList = n || []);

  let activeTag = 'all'; // 'all' | 'Announcements' | 'Events' | 'Tips'
  $: filteredNews = activeTag === 'all' ? newsList : newsList.filter(n => (n.tag||'').toLowerCase() === activeTag.toLowerCase());
  // Featured: prefer explicit flag, else most recent by date
  $: featured = (() => {
    if (!Array.isArray(newsList) || newsList.length === 0) return null;
    const flagged = newsList.find(n => n.featured === true);
    if (flagged) return flagged;
    const sorted = [...newsList].sort((a,b) => (new Date(b.date)) - (new Date(a.date)));
    return sorted[0] || null;
  })();

  function openArticle(a) {
    openNewsModal(a);
  }

  // clean up subscription when component is destroyed
  import { onDestroy } from 'svelte';
  onDestroy(() => unsub());
</script>

<section class="news-root">
  <header>
    <h2>News</h2>
    <div class="news-funstrip">
      <div class="fun-chip"><div class="fun-label">New This Week</div><div class="fun-value">{newsList.filter(n => { const d=new Date(n.date); const now=new Date(); const diff=(now - d)/(1000*60*60*24); return !isNaN(d) && diff <= 7; }).length}</div></div>
      <div class="fun-chip"><div class="fun-label">This Month</div><div class="fun-value">{newsList.filter(n => { const d=new Date(n.date); const now=new Date(); return !isNaN(d) && d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear(); }).length}</div></div>
      <div class="fun-chip"><div class="fun-label">Total</div><div class="fun-value">{newsList.length}</div></div>
    </div>
  </header>
  <div class="news-body">
    {#if featured}
      <div class="featured-banner">
        <div class="featured-content">
          <div class="featured-eyebrow">Featured</div>
          <h3 class="featured-title">{featured.title}</h3>
          <div class="featured-meta"><span class="tag">{featured.tag}</span> • <span class="date">{featured.date}</span></div>
          {#if featured.summary}<p class="featured-summary">{featured.summary}</p>{/if}
          <div>
            <button class="featured-btn" on:click={() => openArticle(featured)}>Read More</button>
          </div>
        </div>
      </div>
    {/if}
    <div class="news-filters">
      <button class="tag-chip {activeTag==='all' ? 'is-active' : ''}" on:click={() => activeTag='all'}>All</button>
      <button class="tag-chip {activeTag==='Announcements' ? 'is-active' : ''}" on:click={() => activeTag='Announcements'}>Announcements</button>
      <button class="tag-chip {activeTag==='Events' ? 'is-active' : ''}" on:click={() => activeTag='Events'}>Events</button>
      <button class="tag-chip {activeTag==='Tips' ? 'is-active' : ''}" on:click={() => activeTag='Tips'}>Tips</button>
    </div>
    {#if filteredNews.length}
      <ul class="news-list">
        {#each filteredNews as item}
          <li class="news-item">
            <button class="news-link" on:click={() => openArticle(item)}>
              <strong>{item.title}</strong>
              <div class="news-meta"><span class="tag">{item.tag}</span> <span class="date">{item.date}</span></div>
              <div class="news-summary">{item.summary}</div>
            </button>
          </li>
        {/each}
      </ul>
    {:else}
      <p>No news at the moment.</p>
    {/if}
  </div>

  <NewsModal />
</section>

<style>
  .news-root { padding: 16px; color: var(--text-main,#e5e7eb) }
  header h2 { margin:0 0 8px 0 }
  .news-funstrip { display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap:10px; margin-bottom:10px }
  .fun-chip { display:flex; flex-direction:column; align-items:center; gap:6px; padding:10px; border-radius:12px; background: rgba(255,255,255,0.03); border:1px solid rgba(148,163,184,0.15) }
  .fun-label { font-size:0.75rem; color: var(--text-muted,#9ca3af); text-transform: uppercase; letter-spacing:0.06em }
  .fun-value { font-weight:800; color: var(--text-main,#e5e7eb) }
  .news-list { display:flex; flex-direction:column; gap:10px; list-style:none; padding:0; margin:0 }
  .news-link { display:block; text-align:left; background:rgba(255,255,255,0.02); padding:12px; border-radius:8px; border:0; color:inherit }
  .news-meta { color:var(--text-muted,#9ca3af); font-size:0.85rem }
  .news-summary { color:var(--text-muted,#9ca3af); margin-top:6px }
  .news-filters { display:flex; gap:8px; margin-bottom:10px }
  .tag-chip { padding:6px 10px; border-radius:999px; border:1px solid rgba(148,163,184,0.25); background: rgba(255,255,255,0.02); color: var(--text-main,#e5e7eb); cursor:pointer }
  .tag-chip.is-active { background: rgba(56,189,248,0.15); border-color: rgba(56,189,248,0.5); color:#38bdf8 }
  .featured-banner { position:relative; border-radius:14px; overflow:hidden; margin-bottom:12px; border:1px solid rgba(148,163,184,0.2); background: linear-gradient(135deg, rgba(30,41,59,0.6), rgba(2,6,23,0.6)); }
  .featured-content { padding:16px }
  .featured-eyebrow { display:inline-block; padding:4px 8px; border-radius:8px; background: rgba(56,189,248,0.14); border:1px solid rgba(56,189,248,0.35); color:#38bdf8; font-weight:700; font-size:0.75rem; letter-spacing:0.08em; text-transform:uppercase }
  .featured-title { margin:8px 0 6px 0 }
  .featured-meta { color:var(--text-muted,#9ca3af); font-size:0.85rem; margin-bottom:6px }
  .featured-summary { color:var(--text-main,#e5e7eb); margin:0 0 10px 0 }
  .featured-btn { padding:8px 12px; border-radius:8px; border:1px solid rgba(148,163,184,0.3); background: rgba(255,255,255,0.06); color:#e5e7eb; cursor:pointer }
  .featured-btn:hover { background: rgba(255,255,255,0.1) }
</style>
