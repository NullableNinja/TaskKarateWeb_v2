<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  
  // Client-side redirect to login page
  onMount(() => {
    goto('/login', { replaceState: true });
  });
</script>

<svelte:head>
  <meta http-equiv="refresh" content="0; url=/student-dashboard/login" />
</svelte:head>
