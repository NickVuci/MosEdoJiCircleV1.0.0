/**
 * Layout Helpers - Provides utilities for responsive layout management
 * Helps solve common issues with layout transitions and scroll position
 * This is a standalone script that runs independently of the module system
 */

(function() {
    // Store the previous aspect ratio and fullscreen states
    let wasLandscape = window.innerWidth > window.innerHeight * 1.05;
    let wasFullscreen = !!document.fullscreenElement;
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;
    
    /**
     * Reset scroll positions and fix layout issues when layout changes
     * This is specifically designed to fix the issue where the sidebar
     * scroll position gets "stuck" when toggling fullscreen
     */
    function resetLayoutState() {
        const isLandscape = window.innerWidth > window.innerHeight * 1.05;
        const isFullscreen = !!document.fullscreenElement;
        const widthChanged = Math.abs(lastWidth - window.innerWidth) > 20; // Allow small tolerance
        const heightChanged = Math.abs(lastHeight - window.innerHeight) > 20;
        
        // If layout significantly changed or fullscreen state changed
        if (isLandscape !== wasLandscape || 
            isFullscreen !== wasFullscreen || 
            widthChanged || 
            heightChanged) {
            
            // Reset the sidebar scroll position
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                // Force scroll to top - needed to fix fullscreen transition bug
                sidebar.style.scrollBehavior = 'auto';
                sidebar.scrollTop = 0;
                
                // Force a relayout to ensure scroll position is really reset
                setTimeout(() => {
                    sidebar.style.overflow = 'hidden';
                    // Trigger reflow
                    sidebar.offsetHeight; 
                    sidebar.style.overflow = 'auto';
                    sidebar.scrollTop = 0;
                    sidebar.style.scrollBehavior = '';
                }, 50);
            }
            
            // Update state
            wasLandscape = isLandscape;
            wasFullscreen = isFullscreen;
            lastWidth = window.innerWidth;
            lastHeight = window.innerHeight;
        }
    }
    
    // Initialize - reset on page load
    window.addEventListener('load', function() {
        // Delay to ensure everything is loaded
        setTimeout(resetLayoutState, 100);
    });
    
    // Throttle resize events to prevent excessive calls
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resetLayoutState, 100);
    });
    
    // Reset on orientation change - crucial for mobile
    window.addEventListener('orientationchange', function() {
        // Orientation changes need longer timeout on some devices
        setTimeout(resetLayoutState, 200);
    });
    
    // Reset scroll position after fullscreen transitions - key for fixing the issue
    document.addEventListener('fullscreenchange', function() {
        // Multiple timeouts to catch the transition at different stages
        setTimeout(resetLayoutState, 50);
        setTimeout(resetLayoutState, 300);
    });
})();
