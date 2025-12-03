import { writable, derived } from 'svelte/store';

// Define all available tiles/widgets
export const AVAILABLE_TILES = {
  // Top row widgets (small HUD chips)
  favoriteTechnique: { id: 'favoriteTechnique', name: 'Favorite Technique', type: 'chip', zone: 'top' },
  totalClasses: { id: 'totalClasses', name: 'Total Classes', type: 'chip', zone: 'top' },
  trainingGoals: { id: 'trainingGoals', name: 'Training Goals', type: 'chip', zone: 'top' },
  perfectDays: { id: 'perfectDays', name: 'Perfect Days', type: 'chip', zone: 'top' },
  highFives: { id: 'highFives', name: 'Fist Bumps Given', type: 'chip', zone: 'top' },
  dojoFriends: { id: 'dojoFriends', name: 'Dojo Friends', type: 'chip', zone: 'top' },
  formsMastered: { id: 'formsMastered', name: 'Forms Mastered', type: 'chip', zone: 'top' },
  energyLevel: { id: 'energyLevel', name: 'Energy Level', type: 'chip', zone: 'top' },
  motivationScore: { id: 'motivationScore', name: 'Motivation Score', type: 'chip', zone: 'top' },

  // Major panels (mid/bottom)
  profile: { id: 'profile', name: 'Profile Card', type: 'panel', zone: 'mid' },
  trainingOverview: { id: 'trainingOverview', name: 'Training Overview', type: 'panel', zone: 'mid' },
  rankProgress: { id: 'rankProgress', name: 'Rank Progress', type: 'panel', zone: 'mid' },
  hudPanel: { id: 'hudPanel', name: 'Training HUD', type: 'panel', zone: 'bottom' },
  achievements: { id: 'achievements', name: 'Achievements', type: 'panel', zone: 'bottom' }
};

// Default layout per zone
const DEFAULT_LAYOUT = {
  top: ['favoriteTechnique', 'totalClasses', 'trainingGoals', 'perfectDays', 'highFives'],
  mid: ['profile', 'trainingOverview', 'rankProgress'],
  bottom: ['hudPanel', 'achievements']
};

function createDashboardLayout() {
  const { subscribe, set, update } = writable(DEFAULT_LAYOUT);

  return {
    subscribe,
    // Load from localStorage
    loadLayout(studentId) {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(`dashboardLayout_${studentId}`);
        if (saved) {
          try {
            set(JSON.parse(saved));
            return;
          } catch (e) {
            console.warn('Invalid saved layout:', e);
          }
        }
      }
      set(DEFAULT_LAYOUT);
    },
    // Save to localStorage
    saveLayout(studentId, layout) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`dashboardLayout_${studentId}`, JSON.stringify(layout));
      }
      set(layout);
    },
    // Move tile between zones
    moveTile(tileId, fromZone, toZone, toIndex) {
      update((layout) => {
        const newLayout = JSON.parse(JSON.stringify(layout));
        
        // Remove from source zone
        newLayout[fromZone] = newLayout[fromZone].filter(id => id !== tileId);
        
        // Add to target zone at specified index
        if (!newLayout[toZone]) newLayout[toZone] = [];
        newLayout[toZone].splice(toIndex, 0, tileId);
        
        return newLayout;
      });
    },
    // Reorder within same zone
    reorderInZone(tileId, zone, fromIndex, toIndex) {
      update((layout) => {
        const newLayout = JSON.parse(JSON.stringify(layout));
        const items = newLayout[zone];
        
        items.splice(fromIndex, 1);
        items.splice(toIndex, 0, tileId);
        
        return newLayout;
      });
    },
    // Reset to default
    resetLayout() {
      set(DEFAULT_LAYOUT);
    }
  };
}

export const dashboardLayout = createDashboardLayout();
