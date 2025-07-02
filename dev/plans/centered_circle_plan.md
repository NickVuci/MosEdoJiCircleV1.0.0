# Centered, Uncut, and Stable Circle Plan

## Objective
Ensure the main circle visualization is always fully visible, never off screen or obscured, and stable—never cut off or moving—regardless of screen size, orientation, or user interaction. The layout should adapt so that:
- The circle is always fully on screen and never obscured by UI elements.
- The header and menus never push the circle out of view.
- In landscape (wide) mode, the circle is centered vertically and left-aligned horizontally, with menus to the left side.
- In portrait (tall/narrow) mode, the circle is centered horizontally and bottom-aligned vertically, with menus above or hidden/collapsible.
- The circle is always rendered within its own dedicated container area, separate from all controls and headers. All sizing and centering logic is based on this container, not the window or body.

## Key Considerations

### SVG and Visualization
- Use a responsive SVG with `viewBox` and `preserveAspectRatio="xMidYMid meet"`.
- Set SVG width/height to 100% of its container, and constrain the container with CSS to avoid overflow.
- Always draw the circle at the center of the SVG (`cx=width/2`, `cy=height/2`).
- Dynamically calculate the radius as the minimum of half the SVG’s width or height, minus a margin for labels.
- All calculations for centering and sizing the circle must use the dimensions of the dedicated circle area/container (e.g., `#circle-area`), not the window or document body.
- On window resize, orientation change, or layout change, recalculate the available space in the dedicated area and update the SVG/circle accordingly.
- Prevent panning/dragging/zooming on the SVG unless explicitly desired. Use `touch-action: none;` if needed.

### Layout and Controls
- Place all controls (menus, sliders, checkboxes) outside the SVG area, either in a sidebar, above, or below, depending on screen orientation.
- In landscape (wide) mode: use a horizontal flex or grid layout with the menu/sidebar on the left and the circle SVG container on the right, both vertically centered.
- In portrait (tall/narrow) mode: use a vertical flex or grid layout with the menu above (or collapsible/hidden) and the circle SVG container at the bottom, both horizontally centered.
- The header should be minimal, overlay, or collapsible, and must never push the circle out of view.
- Use media queries or JavaScript to switch layouts based on aspect ratio (`window.innerWidth > window.innerHeight`).
- Ensure controls never overlap or obscure the SVG/circle. Avoid fixed overlays unless transparent and non-blocking.
- Use CSS to prevent layout shifts and scrollbars. The SVG and controls should always fit within the viewport.
- Always recalculate SVG size and circle position after layout changes, using the dedicated circle area/container as the reference.
- The dedicated circle area/container must never be overlapped or obscured by other UI elements, and must always have enough space for the full circle.

## Responsive Layout Requirements

- Dynamically switch between landscape and portrait layouts using CSS or JS based on aspect ratio.
- The circle container must always have enough space for the full circle, regardless of UI elements.
- Explicitly set a max radius in JS to ensure the circle never exceeds the available space, accounting for all UI elements (header, menus, etc.).
- On very small screens, use collapsible menus, overlays, or hide less-used controls to ensure the circle remains usable.
- All dynamic sizing and centering logic must reference the size of the dedicated circle area/container, not the window.

## Step 1: Refactor SVG to use `viewBox` and `preserveAspectRatio="xMidYMid meet"`

**Actionable Tasks:**
1. Identify the SVG element in `index.html` (or where it is created in JS).
2. Add or update the `viewBox` attribute to cover the intended drawing area (e.g., `viewBox="0 0 600 600"`).
3. Set `preserveAspectRatio="xMidYMid meet"` on the SVG.
4. Remove any fixed `width` and `height` attributes from the SVG in HTML; set them to `100%` via CSS instead.
5. Ensure the SVG’s parent container is responsive (uses `%`, `vw`, `vh`, flex, or grid units).
6. Test the SVG in the browser: verify it scales and remains centered as the window size changes.
7. Adjust the SVG’s parent container or add wrappers as needed to prevent overflow or scrollbars.
8. Document any issues or edge cases encountered during this step.

## Implementation Steps
1. Refactor SVG to use `viewBox` and `preserveAspectRatio="xMidYMid meet"`.
2. Set SVG and container to 100% width/height, with CSS constraints.
3. In JS, always center the circle and recalculate radius on resize/orientation change, and after any layout change, using the dedicated circle area/container as the reference.
4. Move all controls outside the SVG, using a responsive layout that adapts to landscape/portrait mode as described above.
5. Ensure the header and menus never push the circle out of view; use overlays, drawers, or sidebars as needed.
6. Prevent unwanted touch/pan/zoom on the SVG.
7. Test on various devices and orientations to ensure the circle is always fully visible, stable, and never cut off or obscured.

## Potential Issues & Mitigations

### SVG Responsiveness and Centering
- **Issue:** SVG/container sizing may not work if the parent container is not responsive.
  - **Mitigation:** Ensure all parent containers use responsive units (%, vw/vh, flex, or grid) and have no fixed pixel sizes.
- **Issue:** Non-square containers may leave extra space around the circle.
  - **Mitigation:** Accept extra space as a tradeoff for centering, or use CSS to visually balance the layout.
- **Issue:** Margin for labels may be insufficient for long text or large fonts, causing cut-off.
  - **Mitigation:** Dynamically calculate margin based on label size, or set a minimum margin in JS/CSS.
- **Issue:** If the dedicated circle area/container is not sized or positioned correctly, the circle may be cut off or not centered.
  - **Mitigation:** Always use the container's dimensions for all calculations, and test thoroughly on all layouts.

### Window Resize and Orientation Change
- **Issue:** Frequent recalculation/redraw on resize can cause performance issues.
  - **Mitigation:** Debounce/throttle resize/orientation event handlers.
- **Issue:** Initial calculation may run before fonts/layout are loaded, causing mis-sizing.
  - **Mitigation:** Run initial sizing after `DOMContentLoaded` and `window.onload`, and after web fonts load if used.

### Touch and Interaction
- **Issue:** Disabling all gestures with `touch-action: none;` may harm accessibility (e.g., disables double-tap to zoom).
  - **Mitigation:** Only disable pan/zoom on the SVG, not the whole page. Test with accessibility tools.
- **Issue:** Disabling gestures may interfere with screen readers or keyboard navigation.
  - **Mitigation:** Ensure ARIA roles and keyboard navigation are implemented for all controls and SVG elements.

### Layout and Controls
- **Issue:** On very small screens, controls and SVG may not both fit, causing overflow or unusable UI.
  - **Mitigation:** Use collapsible menus, overlays, or hide less-used controls on small screens. Set min/max sizes for SVG and controls.
- **Issue:** SVG and controls together may exceed viewport height, causing unwanted scrolling.
  - **Mitigation:** Use CSS to constrain max heights and enable vertical scrolling only for controls if needed.
- **Issue:** The dedicated circle area/container may be overlapped by other UI elements if not properly managed.
  - **Mitigation:** Use CSS z-index, layout rules, and testing to ensure the circle area is always unobstructed.

### Safe Areas and Notches
- **Issue:** Not all browsers/devices support `env(safe-area-inset-*)`.
  - **Mitigation:** Test on real devices and provide fallback padding/margins in CSS.

### D3/Library Defaults
- **Issue:** D3 or other libraries may enable drag/zoom/pan by default.
  - **Mitigation:** Explicitly disable or override these behaviors unless needed.

### Accessibility
- **Issue:** SVGs may not be accessible to screen readers or keyboard users by default.
  - **Mitigation:** Add ARIA labels/roles, ensure all controls are keyboard accessible, and test with screen readers.

### Edge Cases
- **Issue:** Extremely small screens may make the circle or controls unusable.
  - **Mitigation:** Set minimum SVG/control sizes, provide alternate layouts, or warn users if the screen is too small.
- **Issue:** Rapid orientation changes can cause layout thrashing.
  - **Mitigation:** Debounce orientation change handlers and test for smooth transitions.
- **Issue:** Font loading may cause layout shifts after initial render.
  - **Mitigation:** Use font loading events or CSS `font-display: swap` to minimize layout shifts.

---

This document is focused solely on the technical and UX requirements for a perfectly centered, uncut, and stable circle visualization. Expand with more details as implementation progresses.
