# MosEdoJiCircleV1.0.0

Explore musical scales and intervals visually! MosEdoJiCircleV1.0.0 is an interactive web tool for musicians, theorists, and the curious to experiment with three powerful tuning systems:
- **MOS (Moment of Symmetry)**
- **EDO (Equal Divisions of the Octave)**
- **JI (Just Intonation)**

## How to Use
1. **Open `index.html` in your web browser.**
2. **Choose a tuning system** (MOS, EDO, or JI) using the interface.
3. **Enter your parameters:**
   - For MOS: set the generator and number of stacks.
   - For EDO: set the number of divisions.
   - For JI: select prime factors and odd limit.
4. **Interact with the visualization:**
   - Hover over notes, lines, or intervals to see detailed tooltips.
   - Use checkboxes and controls to toggle features, colors, and labels.
5. **Experiment!** Instantly see how your choices affect the musical structure.

## Features
- **Instant feedback:** Visualizations update in real time as you change parameters.
- **Helpful tooltips:** Hover to reveal musical details for every note and interval.
- **Flexible controls:** Easily switch between tuning systems and customize the display.
- **Accessible:** No installation or account required—just open and explore.

## Potential Future Development
- Audio playback for intervals and scales directly from the visualization.
- Export options for SVG images or scale data.
- Mobile-friendly and touch interaction improvements.
- More advanced tuning systems or custom scale entry.
- User presets and sharing features.
- Accessibility enhancements.

## Project Structure (for Developers)
- `index.html` – Main HTML file and UI container.
- `css/styles.css` – App and SVG styles.
- `js/`
  - `main.js` – App logic, input/checkbox handling, UI state.
  - `edo.js`, `mos.js`, `ji.js` – Visualization logic for each system.
  - `sound.js` – (Optional) Sound playback.
  - `utils.js` – Shared utilities (including DRY tooltip handler).
- `dev/` – Developer docs and refactor plans.

### Developer Notes
- Tooltip logic is fully DRY and managed via `attachTooltipHandlers` in `js/utils.js`.
- All input and checkbox logic is config-driven for maintainability.
- See `dev/tooltip_refactor_plan.md` for details on the tooltip refactor process.

## License
MIT License (see LICENSE file if present).

## Credits
- Developed by Nick Vuci.
- Uses [D3.js](https://d3js.org/) for SVG rendering and interactivity.
