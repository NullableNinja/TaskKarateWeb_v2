<script>
  export let icon = '';
  export let size = 'md';
  
  const sizeMap = { sm: 24, md: 32, lg: 48, xl: 64 };
  const sz = sizeMap[size] || 32;
</script>

{#if icon === 'chart'}
  <svg viewBox="0 0 {sz} {sz}" width={sz} height={sz} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M4 {sz-4} L{sz-4} {sz-4}M8 {sz-10}L8 {sz-4}M{sz/3} {sz-8}L{sz/3} {sz-4}M{2*sz/3} {sz-6}L{2*sz/3} {sz-4}" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>
{:else if icon === 'star'}
  <svg viewBox="0 0 {sz} {sz}" width={sz} height={sz} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M{sz/2} 2L{sz*0.61} {sz*0.35}L{sz*0.98} {sz*0.35}L{sz*0.67} {sz*0.57}L{sz*0.88} {sz*0.91}L{sz/2} {sz*0.7}L{sz*0.12} {sz*0.91}L{sz*0.33} {sz*0.57}L{sz*0.02} {sz*0.35}L{sz*0.39} {sz*0.35}Z" />
  </svg>
{:else if icon === 'heart'}
  <svg viewBox="0 0 {sz} {sz}" width={sz} height={sz} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M{sz/2} {sz*0.9}C{sz/4} {sz*0.7} 2 {sz*0.5} 2 {sz*0.35}C2 {sz*0.15} {sz*0.15} 2 {sz*0.35} 2C{sz*0.5} 2 {sz/2} {sz*0.2} {sz/2} {sz*0.2}C{sz/2} {sz*0.2} {sz*0.5} 2 {sz*0.65} 2C{sz*0.85} 2 {sz-2} {sz*0.15} {sz-2} {sz*0.35}C{sz-2} {sz*0.5} {sz*0.75} {sz*0.7} {sz/2} {sz*0.9}Z" />
  </svg>
{:else if icon === 'people'}
  <svg viewBox="0 0 {sz} {sz}" width={sz} height={sz} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <circle cx={sz*0.35} cy={sz*0.3} r={sz*0.12} />
    <circle cx={sz*0.65} cy={sz*0.3} r={sz*0.12} />
    <path d="M{sz*0.2} {sz*0.5}Q{sz*0.2} {sz*0.42} {sz*0.35} {sz*0.42}Q{sz*0.5} {sz*0.42} {sz*0.5} {sz*0.5}"/>
    <path d="M{sz*0.5} {sz*0.5}Q{sz*0.65} {sz*0.42} {sz*0.8} {sz*0.42}Q{sz*0.95} {sz*0.42} {sz*0.95} {sz*0.5}"/>
    <path d="M{sz*0.2} {sz*0.5}Q{sz*0.2} {sz*0.42} {sz/2} {sz*0.42}Q{sz*0.8} {sz*0.42} {sz*0.8} {sz*0.5}L{sz*0.8} {sz*0.8}Q{sz*0.8} {sz*0.9} {sz*0.7} {sz*0.9}L{sz*0.3} {sz*0.9}Q{sz*0.2} {sz*0.9} {sz*0.2} {sz*0.8}Z"/>
  </svg>
{:else if icon === 'trophy'}
  <svg viewBox="0 0 {sz} {sz}" width={sz} height={sz} xmlns="http://www.w3.org/2000/svg" fill="currentColor" stroke="currentColor" stroke-width="1.5">
    <path d="M{sz*0.25} {sz*0.2}L{sz*0.25} {sz*0.4}Q{sz*0.25} {sz*0.55} {sz*0.35} {sz*0.65}L{sz/2} {sz*0.8}L{sz*0.65} {sz*0.65}Q{sz*0.75} {sz*0.55} {sz*0.75} {sz*0.4}L{sz*0.75} {sz*0.2}M{sz*0.35} {sz*0.65}L{sz*0.35} {sz*0.85}L{sz*0.65} {sz*0.85}L{sz*0.65} {sz*0.65}"/>
  </svg>
{:else if icon === 'flame'}
  <svg viewBox="0 0 {sz} {sz}" width={sz} height={sz} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M{sz/2} 2C{sz/2} 2 {sz*0.3} {sz*0.5} {sz*0.3} {sz*0.75}C{sz*0.3} {sz*0.9} {sz*0.4} {sz-2} {sz/2} {sz-2}C{sz*0.6} {sz-2} {sz*0.7} {sz*0.9} {sz*0.7} {sz*0.75}C{sz*0.7} {sz*0.5} {sz/2} 2 {sz/2} 2Z"/>
  </svg>
{:else if icon === 'target'}
  <svg viewBox="0 0 {sz} {sz}" width={sz} height={sz} xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5">
    <circle cx={sz/2} cy={sz/2} r={sz*0.4}/>
    <circle cx={sz/2} cy={sz/2} r={sz*0.25}/>
    <circle cx={sz/2} cy={sz/2} r={sz*0.1}/>
  </svg>
{:else if icon === 'calendar'}
  <svg viewBox="0 0 {sz} {sz}" width={sz} height={sz} xmlns="http://www.w3.org/2000/svg" fill="currentColor" stroke="currentColor" stroke-width="1.5">
    <rect x={sz*0.15} y={sz*0.2} width={sz*0.7} height={sz*0.6} rx={sz*0.05}/>
    <line x1={sz*0.25} y1={sz*0.1} x2={sz*0.25} y2={sz*0.3}/>
    <line x1={sz*0.75} y1={sz*0.1} x2={sz*0.75} y2={sz*0.3}/>
    <line x1={sz*0.15} y1={sz*0.35} x2={sz*0.85} y2={sz*0.35}/>
  </svg>
{:else}
  <svg viewBox="0 0 {sz} {sz}" width={sz} height={sz} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <circle cx={sz/2} cy={sz/2} r={sz*0.3}/>
  </svg>
{/if}

<style>
  svg {
    display: inline-block;
    color: inherit;
  }
</style>
