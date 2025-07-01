# Plan: Move Control Modules to the Left Side

## Objective
Relocate all control modules (including universal controls, EDO, JI, and MOS controls) from their current position above the visualization to a vertical sidebar on the left side of the screen. This aims to maximize vertical space for the main circle visualization, improve usability, and create a more modern, app-like layout.

## Rationale
- Maximizes vertical space for the visualization, especially on laptops and mobile devices.
- Makes controls more accessible and visible without crowding the top of the page.
- Follows common UI patterns for data visualization and creative tools.
- Allows for future expansion of controls without reducing visualization area.

## Actionable Steps
1. **Design the Sidebar Layout**
   - Create a new sidebar container (e.g., `#sidebar` or `#controls-sidebar`) to house all control modules.
   - Use CSS Flexbox or Grid to create a two-column layout: sidebar (left), visualization (right).
   - Ensure the sidebar is responsive and collapsible on small screens.

2. **Move Control Modules**
   - Move the `#universal-controls`, `#edo-controls`, `#ji-controls`, and `#mos-controls` into the sidebar container.
   - Remove the old controls container from above the visualization.

3. **Update Styles**
   - Style the sidebar for clarity, accessibility, and visual separation from the main content.
   - Adjust widths, padding, and borders as needed.
   - Add responsive behavior: sidebar collapses or becomes a drawer on mobile.

4. **Update JavaScript**
   - Ensure all event listeners and references to controls are updated to their new location.
   - Test for any layout or interaction bugs.

5. **Accessibility & Responsiveness**
   - Ensure the sidebar and controls are keyboard and screen reader accessible.
   - Test the layout on various screen sizes and orientations.

6. **Documentation**
   - Update README and relevant docs to reflect the new layout.

## Potential Issues & Mitigations
- **Issue:** Sidebar may take up too much space on small screens.
  - **Mitigation:** Make sidebar collapsible or overlay on mobile; use icons or compact controls.
- **Issue:** Users may not notice relocated controls.
  - **Mitigation:** Use clear labels, icons, and possibly a short onboarding tooltip.
- **Issue:** Event listeners may break if controls are moved dynamically.
  - **Mitigation:** Update all JS references and test thoroughly.

## Next Steps
- Prototype the sidebar layout in a branch or test file.
- Gather feedback from users or stakeholders.
- Iterate and refine the design before merging to main.
