// Shim for dashboard layout (customization disabled)
export const AVAILABLE_TILES = {};

export const dashboardLayout = {
  subscribe(run) { return () => {}; },
  loadLayout() {},
  saveLayout() {},
  moveTile() {},
  reorderInZone() {},
  resetLayout() {}
};
