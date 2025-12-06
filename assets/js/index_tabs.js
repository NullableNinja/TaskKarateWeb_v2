// Programs Section Tabs with Auto-Rotation
(function () {
  const root = document.getElementById('programs');
  if (!root) return;

  const tabs = root.querySelectorAll('.tab');
  const panels = root.querySelectorAll('.tab-panel');
  
  let autoRotateTimer = null;
  let isPaused = false;
  const ROTATION_INTERVAL = 30000; // 30 seconds
  
  const tabIds = ['panel-kids', 'panel-teens', 'panel-eskrima', 'panel-weapons'];
  let currentIndex = 0;

  function show(id) {
    tabs.forEach(t => {
      const active = t.getAttribute('aria-controls') === id;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', active);
    });
    panels.forEach(p => p.classList.toggle('hidden', p.id !== id));
    
    // Update current index
    currentIndex = tabIds.indexOf(id);
  }

  function rotateToNext() {
    if (!isPaused) {
      currentIndex = (currentIndex + 1) % tabIds.length;
      show(tabIds[currentIndex]);
    }
  }

  function startAutoRotate() {
    stopAutoRotate();
    autoRotateTimer = setInterval(rotateToNext, ROTATION_INTERVAL);
  }

  function stopAutoRotate() {
    if (autoRotateTimer) {
      clearInterval(autoRotateTimer);
      autoRotateTimer = null;
    }
  }

  // Manual tab clicks
  tabs.forEach(t => {
    t.addEventListener('click', () => {
      isPaused = true;
      show(t.getAttribute('aria-controls'));
      stopAutoRotate();
      
      // Resume auto-rotation after 60 seconds of inactivity
      setTimeout(() => {
        isPaused = false;
        startAutoRotate();
      }, 60000);
    });
  });

  // Pause on hover
  root.addEventListener('mouseenter', () => {
    isPaused = true;
  });

  root.addEventListener('mouseleave', () => {
    isPaused = false;
  });

  // Initialize
  show('panel-kids');
  startAutoRotate();
}());

// Option 4: Parallax Effect on Hero Image
(function() {
  const heroPanel = document.querySelector('.hero-panel');
  const heroImage = document.querySelector('.hero-image');
  
  if (!heroPanel || !heroImage) return;
  
  // Add parallax class
  heroPanel.classList.add('parallax');
  
  function updateParallax() {
    const scrolled = window.pageYOffset;
    const heroTop = heroPanel.offsetTop;
    const heroHeight = heroPanel.offsetHeight;
    
    // Only apply parallax when hero is in viewport
    if (scrolled < heroTop + heroHeight) {
      const parallaxOffset = (scrolled - heroTop) * 0.3;
      heroImage.style.setProperty('--parallax-offset', `${parallaxOffset}px`);
    }
  }
  
  window.addEventListener('scroll', updateParallax);
  window.addEventListener('resize', updateParallax);
  updateParallax();
}());
