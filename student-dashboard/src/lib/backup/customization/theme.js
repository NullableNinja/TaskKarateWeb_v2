import { writable } from 'svelte/store';

const DEFAULT_THEME = {
  panelAccent: '#0ea5e9',
  panelAccentAlpha: 0.06,
  subAccent: '#f97316',
  subAccentAlpha: 0.08
};

function setCssVars(theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--panel-accent-color', theme.panelAccent || DEFAULT_THEME.panelAccent);
  root.style.setProperty('--panel-accent-alpha', String(theme.panelAccentAlpha ?? DEFAULT_THEME.panelAccentAlpha));
  root.style.setProperty('--panel-subaccent-color', theme.subAccent || DEFAULT_THEME.subAccent);
  root.style.setProperty('--panel-subaccent-alpha', String(theme.subAccentAlpha ?? DEFAULT_THEME.subAccentAlpha));
}

function createThemeStore() {
  const { subscribe, set, update } = writable(DEFAULT_THEME);

  return {
    subscribe,
    load(studentId) {
      if (typeof localStorage === 'undefined') return;
      const key = `dashboardTheme_${studentId}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          set(parsed);
          setCssVars(parsed);
          return parsed;
        } catch (e) {
          console.warn('Invalid theme in storage', e);
        }
      }
      setCssVars(DEFAULT_THEME);
      return DEFAULT_THEME;
    },
    save(studentId, theme) {
      if (typeof localStorage !== 'undefined') {
        const key = `dashboardTheme_${studentId}`;
        try {
          localStorage.setItem(key, JSON.stringify(theme));
        } catch (e) {
          console.warn('Failed to save theme', e);
        }
      }
      set(theme);
      setCssVars(theme);
    },
    setCss(theme) {
      set(theme);
      setCssVars(theme);
    },
    reset(studentId) {
      this.save(studentId, DEFAULT_THEME);
    }
  };
}

export const theme = createThemeStore();
