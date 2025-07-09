// Module Management - Accordion functionality and responsive behavior
// Handles collapsible modules for mobile space efficiency

class ModuleManager {
    constructor() {
        this.modules = [];
        this.isMobile = window.matchMedia('(max-aspect-ratio: 1.05/1)').matches;
        this.init();
    }

    init() {
        this.setupAccordionBehavior();
        this.handleResponsiveChanges();
        this.bindEventListeners();
    }

    setupAccordionBehavior() {
        // Find all modules with headers
        const moduleHeaders = document.querySelectorAll('.module__header');
        
        moduleHeaders.forEach(header => {
            const module = header.closest('.module');
            if (!module) return;

            // Add ARIA attributes for accessibility
            header.setAttribute('role', 'button');
            header.setAttribute('aria-expanded', 'true');
            header.setAttribute('tabindex', '0');
            
            const content = module.querySelector('.module__content');
            if (content) {
                const contentId = `module-content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                content.setAttribute('id', contentId);
                header.setAttribute('aria-controls', contentId);
            }

            // Store module data
            this.modules.push({
                element: module,
                header: header,
                content: content,
                isCollapsed: false
            });
        });

        // Set initial state based on screen size
        this.updateAccordionState();
    }

    updateAccordionState() {
        const isMobile = window.matchMedia('(max-aspect-ratio: 1.05/1)').matches;
        
        // In portrait mode, we can optionally start some modules collapsed to save space
        // For now, keep all expanded unless user explicitly collapses them
        this.modules.forEach(moduleData => {
            if (isMobile && moduleData.isCollapsed) {
                this.collapseModule(moduleData);
            } else {
                this.expandModule(moduleData);
            }
        });
    }

    toggleModule(moduleData) {
        if (moduleData.isCollapsed) {
            this.expandModule(moduleData);
        } else {
            this.collapseModule(moduleData);
        }
    }

    collapseModule(moduleData) {
        moduleData.isCollapsed = true;
        moduleData.element.classList.add('module--collapsed');
        moduleData.header.setAttribute('aria-expanded', 'false');
        
        // Debug: Log the collapse
        console.log('Collapsing module:', moduleData.element.id || moduleData.element.className);
        
        // Announce to screen readers
        this.announceStateChange(moduleData, 'collapsed');
    }

    expandModule(moduleData) {
        moduleData.isCollapsed = false;
        moduleData.element.classList.remove('module--collapsed');
        moduleData.header.setAttribute('aria-expanded', 'true');
        
        // Debug: Log the expand
        console.log('Expanding module:', moduleData.element.id || moduleData.element.className);
        
        // Announce to screen readers
        this.announceStateChange(moduleData, 'expanded');
    }

    announceStateChange(moduleData, state) {
        const title = moduleData.header.querySelector('.module__title');
        if (title) {
            const announcement = `${title.textContent} ${state}`;
            // Create temporary element for screen reader announcement
            const announcer = document.createElement('div');
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.className = 'sr-only';
            announcer.textContent = announcement;
            document.body.appendChild(announcer);
            
            setTimeout(() => {
                document.body.removeChild(announcer);
            }, 1000);
        }
    }

    handleResponsiveChanges() {
        // Create media query for portrait mode
        const portraitMQ = window.matchMedia('(max-aspect-ratio: 1.05/1)');
        
        // Add listener for aspect ratio changes
        portraitMQ.addEventListener('change', (e) => {
            const wasMobile = this.isMobile;
            this.isMobile = e.matches;
            
            if (wasMobile !== this.isMobile) {
                this.updateAccordionState();
            }
        });
        
        // Fallback for browsers that don't support addEventListener on matchMedia
        window.addEventListener('resize', () => {
            const wasMobile = this.isMobile;
            this.isMobile = window.matchMedia('(max-aspect-ratio: 1.05/1)').matches;
            
            if (wasMobile !== this.isMobile) {
                this.updateAccordionState();
            }
        });
    }   

    bindEventListeners() {
        // Handle click events on module headers
        document.addEventListener('click', (event) => {
            const header = event.target.closest('.module__header');
            if (!header) return;

            const moduleData = this.modules.find(m => m.header === header);
            if (moduleData) {
                this.toggleModule(moduleData);
            }
        });

        // Handle keyboard events for accessibility
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                const header = event.target.closest('.module__header');
                if (!header) return;

                event.preventDefault();
                const moduleData = this.modules.find(m => m.header === header);
                if (moduleData) {
                    this.toggleModule(moduleData);
                }
            }
        });
    }
}

// Initialize module manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ModuleManager();
});

// Export for potential use in other modules
window.ModuleManager = ModuleManager;
