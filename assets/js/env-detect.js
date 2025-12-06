/**
 * Environment Path Helper
 * Detects if running locally or on GitHub Pages and sets the appropriate base path
 */
(function() {
  'use strict';
  
  // Detect if we're on GitHub Pages or local
  const isGitHubPages = window.location.hostname.includes('github.io');
  const basePath = isGitHubPages ? '/TaskKarateWeb_v2' : '';
  
  // Store globally for other scripts to use
  window.__SITE_BASE_PATH = basePath;
  
  // Helper function to get correct path
  window.getAssetPath = function(path) {
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return basePath + '/' + cleanPath;
  };
  
  console.log('Environment detected:', isGitHubPages ? 'GitHub Pages' : 'Local');
  console.log('Base path set to:', basePath || '(root)');
})();
