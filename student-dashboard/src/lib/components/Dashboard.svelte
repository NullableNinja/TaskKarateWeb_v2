<script>
  import { onMount } from 'svelte';
  import DashboardHeader from "./DashboardHeader.svelte";
  import DashboardTabs from "./DashboardTabs.svelte";
  import Status from "./Status.svelte";
  import Social from "./Social.svelte";
  import Achievements from "./Achievements.svelte";
  import Training from "./Training.svelte";
  import Friends from "./Friends.svelte";
  import Feed from "./Feed.svelte";
  import News from "./News.svelte";
  import { activeTab } from "$lib/stores/ui.js";
  import { students, loadStudents } from "$lib/stores/students.js";

  $: allStudents = $students || [];
  onMount(() => {
    if (!allStudents || allStudents.length === 0) {
      loadStudents().catch((err) => console.error("Failed to load students:", err));
    }
  });
</script>

<div class="dashboard-root" style="margin-top: 80px;">
  <DashboardHeader />
  <DashboardTabs />

  <div class="hub-content">
    {#if $activeTab === 'status'}
      <Status />
    {:else if $activeTab === 'messages'}
      <Social />
    {:else if $activeTab === 'achievements'}
      <Achievements />
    {:else if $activeTab === 'training'}
      <Training />
    {:else}
      <News />
    {/if}
  </div>
</div>

<style>
  .dashboard-root {
    --tk-blue: #38bdf8;
    --tk-blue-soft: rgba(56, 189, 248, 0.35);
    --panel-bg: rgba(15, 23, 42, 0.86);
    --panel-border: rgba(148, 163, 184, 0.35);
    --panel-shadow: 0 14px 32px rgba(0, 0, 0, 0.55);
    --text-main: #e5e7eb;
    --text-muted: #9ca3af;
    padding-top: 60px;
    font-family: Inter, system-ui;
    color: var(--text-main);
  }

  .hub-content {
    padding: 20px 24px 32px;
  }
</style>
