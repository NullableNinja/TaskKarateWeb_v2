<script>
  import { students, activeStudent, addFeedInteraction } from "$lib/stores/students.js";

  let all = [];
  let me = null;
  $: all = $students || [];
  $: me = $activeStudent || null;
  
  let commentTexts = {};

  function derivedClassesPerStripe(s) {
    if (!s) return 0;
    if (s.classesPerStripe && s.classesPerStripe > 0) return s.classesPerStripe;
    const isBrown = (s.rank || '').toLowerCase().includes('brown');
    return isBrown ? 12 : 8;
  }

  function classesUntilNextStripe(s) {
    const per = derivedClassesPerStripe(s);
    const done = s?.classesSinceStripe || 0;
    const remaining = per - done;
    return remaining;
  }

  function daysSince(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return Math.floor((Date.now() - d.getTime()) / 86400000);
  }

  $: friendIds = me ? (me.friends || []) : [];
  $: friends = all.filter(s => friendIds.includes(s.id));
  $: feedItems = friends.map(s => {
    const remaining = classesUntilNextStripe(s);
    const last = daysSince(s.lastClassDate);
    let message;
    if (remaining <= 0) {
      message = "Ready for next stripe!";
    } else {
      message = `${remaining} classes until next stripe`;
    }
    const interactions = Array.isArray(s.feedInteractions) ? s.feedInteractions : [];
    const fistBumps = interactions.filter(i => i.type === 'fistBump');
    const comments = interactions.filter(i => i.type === 'comment');
    const myFistBump = fistBumps.some(fb => fb.actorId === me?.id);
    return {
      id: s.id,
      name: s.displayName || s.name,
      rank: s.rank,
      remaining,
      lastClassDays: last,
      classesPerStripe: derivedClassesPerStripe(s),
      fistBumpCount: fistBumps.length,
      myFistBump,
      comments
    };
  });
  
  function fistBump(studentId) {
    if (!me) return;
    addFeedInteraction(studentId, me.id, 'fistBump');
  }
  
  function addComment(studentId) {
    if (!me) return;
    const text = commentTexts[studentId];
    if (!text || !text.trim()) return;
    addFeedInteraction(studentId, me.id, 'comment', text.trim());
    commentTexts[studentId] = '';
  }
</script>

<div class="panel">
  <h2 class="panel-title">Activity Feed</h2>
  {#if !me}
    <p class="muted">Select a student to view their feed.</p>
  {:else if feedItems.length === 0}
    <p class="muted">Add buddies to see promotions and stripe progress here.</p>
  {:else}
    <ul class="feed">
      {#each feedItems as f}
        <li class="feed-item">
          <div class="left">
            <div class="avatar">{(f.name).split(' ').map(n => n[0]).join('').toUpperCase()}</div>
          </div>
          <div class="mid">
            <div class="title"><strong>{f.name}</strong> · <span class="rank">{f.rank}</span></div>
            <div class="sub">
              {#if f.remaining <= 0}
                <span class="ready">Ready for next stripe!</span>
              {:else}
                <span class="progress">{f.remaining} classes until next stripe</span>
              {/if}
              {#if f.lastClassDays !== null}
                <span class="divider">•</span>
                <span class="last">Last class: {f.lastClassDays === 0 ? 'Today' : `${f.lastClassDays}d ago`}</span>
              {/if}
            </div>
            <div class="bar">
              <div class="bar-fill" style={`width:${Math.min(100, Math.max(0, ((f.classesPerStripe - f.remaining) / f.classesPerStripe) * 100))}%`}></div>
            </div>
            <div class="interactions">
              <button class={`fb-btn ${f.myFistBump ? 'active' : ''}`} on:click={() => fistBump(f.id)} title="Fist bump!">
                👊 {f.fistBumpCount || ''}
              </button>
              <input class="comment-input" type="text" placeholder="Add a comment..." bind:value={commentTexts[f.id]} on:keydown={(e) => e.key === 'Enter' && addComment(f.id)} />
            </div>
            {#if f.comments.length}
              <div class="comments">
                {#each f.comments as c}
                  {@const actor = all.find(s => s.id === c.actorId)}
                  <div class="comment"><strong>{actor?.displayName || actor?.name || 'Unknown'}:</strong> {c.text}</div>
                {/each}
              </div>
            {/if}
          </div>
          <div class="right">
            <span class="chip">{f.classesPerStripe - Math.max(0, f.remaining)} / {f.classesPerStripe}</span>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .panel { background: rgba(15, 23, 42, 0.86); border: 1px solid rgba(148,163,184,0.35); border-radius: 16px; padding: 16px; box-shadow: 0 14px 32px rgba(0,0,0,0.55); }
  .panel-title { margin: 0 0 12px; font-size: 1.1rem; font-weight: 700; }
  .muted { color: #9ca3af; }
  .feed { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
  .feed-item { display: grid; grid-template-columns: 46px 1fr auto; gap: 12px; align-items: center; padding: 10px; border-radius: 12px; background: rgba(2,6,23,0.6); border: 1px solid rgba(148,163,184,0.25); }
  .avatar { width: 36px; height: 36px; border-radius: 10px; background: rgba(56, 189, 248, 0.2); color: #38bdf8; display:flex; align-items:center; justify-content:center; font-weight:800; }
  .title { font-size: 0.95rem; }
  .rank { color: #9ca3af; }
  .sub { font-size: 0.85rem; color: #9ca3af; display:flex; align-items:center; gap: 8px; }
  .ready { color: #22c55e; font-weight: 700; }
  .progress { color: #e5e7eb; }
  .divider { opacity: 0.6; }
  .bar { height: 8px; background: rgba(148,163,184,0.2); border-radius: 6px; overflow: hidden; margin-top: 6px; }
  .bar-fill { height: 100%; background: #38bdf8; }
  .interactions { display:flex; gap:8px; align-items:center; margin-top:8px; }
  .fb-btn { background: rgba(148,163,184,0.2); border:1px solid rgba(148,163,184,0.35); color:#e5e7eb; padding:4px 10px; border-radius:8px; cursor:pointer; font-size:0.85rem; font-weight:700; }
  .fb-btn.active { background: rgba(239,68,68,0.25); border-color: rgba(239,68,68,0.5); color:#fca5a5; }
  .fb-btn:hover { filter: brightness(1.2); }
  .comment-input { flex:1; background:rgba(2,6,23,0.6); border:1px solid rgba(148,163,184,0.25); color:#e5e7eb; padding:6px 10px; border-radius:8px; font-size:0.85rem; }
  .comment-input::placeholder { color:#9ca3af; }
  .comments { margin-top:6px; display:flex; flex-direction:column; gap:4px; }
  .comment { font-size:0.8rem; color:#e5e7eb; background:rgba(2,6,23,0.8); padding:6px 8px; border-radius:6px; }
  .chip { background: rgba(56,189,248,0.2); color: #38bdf8; border: 1px solid rgba(56,189,248,0.35); padding: 4px 8px; border-radius: 8px; font-weight: 700; font-size: 0.8rem; }
</style>
