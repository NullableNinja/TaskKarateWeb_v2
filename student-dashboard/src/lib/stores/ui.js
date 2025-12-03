import { writable } from "svelte/store";

// default tab when dashboard opens
export const activeTab = writable("status");
