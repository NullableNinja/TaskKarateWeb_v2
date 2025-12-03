import { writable } from 'svelte/store';

const state = writable({ open: false, article: null });

function openNewsModal(article) {
  state.set({ open: true, article });
}

function closeNewsModal() {
  state.set({ open: false, article: null });
}

export { state as newsModalState, openNewsModal, closeNewsModal };
