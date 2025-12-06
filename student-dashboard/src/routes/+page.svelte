<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  
  // Client-side redirect to login page
  onMount(() => {
    goto(`${base}/login`, { replaceState: true });
  });
</script>

<svelte:head>
  <meta http-equiv="refresh" content="0; url={base}/login" />
</svelte:head>
