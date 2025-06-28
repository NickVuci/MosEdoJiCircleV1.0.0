# D3.js Dependency Management Refactor Plan

**Goal:**
Eliminate reliance on the D3.js CDN by bundling the D3.js library locally with the application, improving reliability and offline support.

---

## 1. Audit Current Usage
- D3.js is currently loaded via CDN in `index.html`:
  ```html
  <script src="https://d3js.org/d3.v7.min.js"></script>
  ```
- All JavaScript modules (`main.js`, `edo.js`, `ji.js`, `mos.js`, etc.) use the global `d3` object.

---

## 2. Download and Bundle D3.js
- Download the appropriate D3.js version (e.g., `d3.v7.min.js`) from the official site.
- Place the file in a new or existing local directory, e.g., `js/lib/d3.v7.min.js`.

---

## 3. Update `index.html`
- Remove the CDN `<script>` tag.
- Add a local `<script src="js/lib/d3.v7.min.js"></script>` tag before your own scripts.

---

## 4. Test Application
- Open the app in a browser and verify all D3-dependent features work as before.
- Test offline to ensure D3 loads from the local bundle.

---

## 5. Document the Change
- Update developer documentation to note that D3.js is now bundled locally.
- Remove any instructions referencing the CDN.

---

**Result:**
D3.js is bundled with the application, eliminating external dependency on the CDN and improving reliability.
