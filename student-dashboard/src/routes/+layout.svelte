<script>
  import Navigation from '$lib/components/Navigation.svelte';
  import '$lib/styles/global-background.css';
  import '$lib/styles/tokens.css';
  import '$lib/styles/app.css';
  import '$lib/styles/paperfu.css';

  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { activeStudent } from '$lib/stores/students.js';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  // Client-side guard: if visiting any dashboard route and no active student, redirect to /login
  onMount(() => {
    const p = get(page);
    const pathname = p.url?.pathname || '';

    const isProtected = pathname.startsWith('/dashboard');
    const hasStudent = !!get(activeStudent);

    if (isProtected && !hasStudent) {
      goto('/login');
    }
  });
</script>

<Navigation />

<!-- geometric animated background used across the app -->
<div class="bg-geo" aria-hidden="true"></div>

<!-- FX root for confetti and other page-level effects -->
<div id="fx-root" aria-hidden="true" style="position:fixed;left:0;top:0;right:0;bottom:0;pointer-events:none;z-index:9999;"></div>

<slot />
