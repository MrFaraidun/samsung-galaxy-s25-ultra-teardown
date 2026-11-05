/**
 * Master Build Script for Galaxy S25 Ultra Interactive Engineering Hero
 * Compiles standalone HTML pages with inlined styles and scripts.
 * Supports:
 *   node build.mjs          -> writes index.html (dark exhibition theme)
 *   node build.mjs --light  -> writes index-light.html
 *   node build.mjs --audit  -> runs geometry clearances and depth audit
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "./kit/iso-kit.mjs";
import * as G from "./kit/lathe.mjs";
import * as A from "./kit/audit.mjs";
import {
  PHONE,
  VIEW_WIDTH,
  VIEW_HEIGHT,
  ASSEMBLIES,
  ASSEMBLY_ORDER,
  STAGGER_SEQUENCE,
  P,
  V,
  at,
} from "./src/model.mjs";
import { buildScene } from "./src/geometry.mjs";
import { getSvgFilters } from "./src/illumination.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const THEME = process.argv.includes("--light") ? "light" : "dark";
const DO_AUDIT = process.argv.includes("--audit");

console.log(`[Galaxy S25 Ultra Build] Compiling ${THEME} theme...`);

// 1. Build Scene Geometry
const scene = buildScene({ audit: DO_AUDIT, theme: THEME });
const items = scene.items;

// Sort items by settled painter's depth key (far to near)
items.sort((a, b) => a.key - b.key);

// Wrap items into interactive SVG group nodes
const svgGroups = items.map((item, index) => {
  const [mx, my, mz] = item.move;
  return `<g class="it" data-piece="${item.piece}" data-name="${item.name}" data-k="${item.key.toFixed(2)}" data-m="${mx.toFixed(1)},${my.toFixed(1)},${mz.toFixed(1)}" data-i="${index}">${item.svg}</g>`;
});

// Construct SVG Stage
const filters = getSvgFilters();
const stageSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" class="iso-svg s25-stage" viewBox="0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}" role="img" aria-label="Interactive exploded engineering diagram of the Samsung Galaxy S25 Ultra">
    ${filters}
    <g class="s25-assembly-root" id="assemblyRoot">
      ${svgGroups.join("\n")}
    </g>
  </svg>
`;

// Load Hardware Specifications Dataset
const hardwareSpecs = JSON.parse(readFileSync(join(HERE, "src/hardware-spec.json"), "utf8"));

// 2. Build UI Layout Components
const cornersHtml = `
  <div class="iso-plate-corners" aria-hidden="true">
    <span class="iso-plate-corner" data-corner="fig">Fig 1</span>
    <span class="iso-plate-corner" data-corner="title">GALAXY S25 ULTRA · 162.8 × 77.6 × 8.2 mm</span>
    <span class="iso-plate-corner" data-corner="hint">Space to Explode · 1–9 to Inspect · Esc to Reset</span>
    <span class="iso-plate-corner" data-corner="readout" data-readout>cold · 218 g · assembled</span>
  </div>
`;

// Control Bar: Mode Toggle + Explode Scrubber
const controlsHtml = `
  <div class="s25-controls" role="toolbar" aria-label="Exploded view controls">
    <div class="mode-toggles">
      <button type="button" class="ctrl-btn active" data-mode="assembled" id="btnAssembled">
        <span class="dot-indicator"></span> Assembled
      </button>
      <button type="button" class="ctrl-btn" data-mode="exploded" id="btnExploded">
        <span class="dot-indicator"></span> Exploded
      </button>
      <button type="button" class="ctrl-btn" data-mode="inspect" id="btnInspect">
        <span class="dot-indicator"></span> Inspect
      </button>
    </div>
    <div class="scrub-container">
      <label for="explodeScrub" class="scrub-label">Separation</label>
      <input type="range" id="explodeScrub" min="0" max="100" value="0" step="0.5" aria-label="Separation progress" />
      <span class="scrub-val" id="scrubVal">0%</span>
    </div>
    <div class="s25-live-indicator" aria-live="polite">
      <span class="live-dot"></span>
      <span class="live-text" id="liveStatus">Titanium Chassis Seated</span>
    </div>
  </div>
`;

// Swatch SVG Helper matching Anatomy desk-computer standard
function swatchSvg(mark) {
  if (mark === "raised" || mark === "flat") {
    const body = "M2 4.5 8 1.5 14 4.5 8 7.5Z";
    const crease = mark === "flat" ? "" : '<path class="iso-swatch-crease" d="M2 4.5 8 7.5 14 4.5"/>';
    return `<svg class="iso-swatch" data-mark="${mark}" viewBox="0 0 16 10" aria-hidden="true"><path d="${body}"/>${crease}</svg>`;
  }
  return `<svg class="iso-swatch" data-mark="${mark}" viewBox="0 0 16 10" aria-hidden="true"><path d="M1.5 5h13"/></svg>`;
}

// Swatch Key Definitions
const swatchKeysHtml = `
  <div class="iso-keys" role="list" aria-label="Component keys">
    <span class="iso-key" role="listitem">${swatchSvg("raised")}Grade 5 Titanium: ultra-rigid perimeter frame</span>
    <span class="iso-key" role="listitem">${swatchSvg("raised")}200 MP ISOCELL HP2: quad optical array</span>
    <span class="iso-key" role="listitem">${swatchSvg("flat")}Snapdragon 8 Elite: 3nm TSMC Oryon SoC</span>
    <span class="iso-key" role="listitem">${swatchSvg("line")}4,200 mm² Vapor Chamber: sintered copper wick</span>
    <span class="iso-key" role="listitem">${swatchSvg("line")}5,000 mAh Cell: 19.4 Wh quick-release battery</span>
    <span class="iso-key" role="listitem">${swatchSvg("flat")}Dynamic AMOLED 2X: 6.9″ 120Hz display</span>
  </div>
`;

// Responsive Parts Sidebar HTML (Independent Assembly Explorer)
const sidebarPartsCards = ASSEMBLY_ORDER.map((id, index) => {
  const asmb = ASSEMBLIES[id];
  return `
    <div class="sidebar-part-card" data-part="${id}" id="sidepart-${id}">
      <div class="sidebar-part-top">
        <span class="sidebar-part-num">${String(index + 1).padStart(2, "0")}</span>
        <div class="sidebar-part-meta">
          <div class="sidebar-part-name">${asmb.name}</div>
          <div class="sidebar-part-sub">${asmb.say}</div>
        </div>
        <span class="sidebar-part-status" id="part-status-${id}">Seated</span>
      </div>
      <div class="sidebar-part-actions">
        <button type="button" class="sidebar-action-btn btn-inspect-part" data-action="inspect" data-part="${id}" aria-label="Inspect ${asmb.short}">
          Inspect
        </button>
        <button type="button" class="sidebar-action-btn btn-isolate-part" data-action="isolate" data-part="${id}" aria-label="Isolate ${asmb.short}">
          Isolate
        </button>
      </div>
    </div>
  `;
}).join("\n");

const sidebarHtml = `
  <aside class="s25-sidebar" id="partsSidebar" aria-label="Hardware assemblies list" aria-hidden="true">
    <div class="sidebar-header">
      <div class="sidebar-title-group">
        <span class="sidebar-badge">HARDWARE ARCHITECTURE</span>
        <h2 class="sidebar-title">9 Assemblies</h2>
      </div>
      <button type="button" class="sidebar-close-btn" id="sidebarCloseBtn" aria-label="Close parts sidebar">✕</button>
    </div>
    <div class="sidebar-toolbar">
      <label class="isolate-toggle-label" for="isolateCheck">
        <input type="checkbox" id="isolateCheck" class="isolate-checkbox" />
        <span class="isolate-check-indicator"></span>
        <span class="isolate-label-text">Isolate Selection (Dim Rest)</span>
      </label>
      <button type="button" class="sidebar-action-btn" id="sidebarExplodeToggle">Explode View</button>
    </div>
    <div class="sidebar-list" id="sidebarList">
      ${sidebarPartsCards}
    </div>
  </aside>
  <div class="s25-sidebar-backdrop" id="sidebarBackdrop" aria-hidden="true"></div>
`;

// Detailed Specs Inspection Card (Updates dynamically via live.js)
const specsPanelHtml = `
  <aside class="s25-specs-drawer" id="specsDrawer" aria-label="Component specifications">
    <div class="specs-header">
      <div class="specs-badge" id="specBadge">Assembly 04</div>
      <h3 class="specs-title" id="specTitle">Snapdragon 8 Elite Motherboard</h3>
      <p class="specs-desc" id="specDesc">High-Density Interconnect (HDI) multi-layer logic board with 3nm TSMC Oryon architecture and laser-soldered EMI shield cans.</p>
    </div>
    <div class="specs-metrics" id="specMetrics">
      <div class="metric-row">
        <span class="metric-label">Architecture</span>
        <span class="metric-val">Qualcomm Oryon (2× 4.47 GHz + 6× 3.53 GHz)</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Node Process</span>
        <span class="metric-val">3nm TSMC N3E FinFET</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Graphics & AI</span>
        <span class="metric-val">Adreno 830 GPU · Hexagon NPU (+45% Galaxy AI)</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Memory Subsystem</span>
        <span class="metric-val">16 GB LPDDR5X (8,533 Mbps) PoP Package</span>
      </div>
    </div>
    <div class="specs-footer">
      <span class="verified-seal">✓ Verified Teardown Engineering</span>
      <button type="button" class="specs-close-btn" id="specsCloseBtn" aria-label="Close component inspection">Close</button>
    </div>
  </aside>
`;

// Exhibition Header & Actions Bar (Anatomy Gallery Standard)
const headerHtml = `
  <header class="anatomy-gallery-header">
    <div class="anatomy-brand-group">
      <h1 class="anatomy-heading">Galaxy S25 Ultra</h1>
      <div class="anatomy-subheading">No. 01 · SVG · Hardware anatomy</div>
    </div>
    <div class="anatomy-actions-group">
      <button type="button" class="anatomy-btn-header" id="btnSoundToggle" aria-label="Toggle tactile sound feedback" title="Toggle audio feedback">
        <span class="btn-icon" id="soundIcon">🔊</span>
        <span class="btn-text" id="soundLabel">Sound</span>
      </button>
      <button type="button" class="anatomy-btn-header" id="btnThemeToggle" aria-label="Toggle light and dark color theme" title="Toggle dark/light theme">
        <span class="btn-icon" id="themeIcon">${THEME === "light" ? "☽" : "☼"}</span>
        <span class="btn-text" id="themeLabel">${THEME === "light" ? "Dark" : "Light"}</span>
      </button>
      <button type="button" class="anatomy-btn-header" id="btnPartsToggle" aria-label="Open parts sidebar" title="View all 9 hardware assemblies">
        <span class="btn-icon">☰</span>
        <span class="btn-text">Parts (9)</span>
      </button>
      <a href="https://github.com/wheresryan22/anatomy" target="_blank" rel="noopener" class="anatomy-icon-link" aria-label="GitHub Repository" title="Anatomy on GitHub">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>
      </a>
    </div>
  </header>
`;

// Entire Hero Stage Card matching Anatomy desk-computer reference
const heroBody = `
  <div class="s25-exhibition-wrap">
    ${headerHtml}
    <main class="s25-main-stage">
      <figure class="iso-figure s25-figure">
        <div class="iso-plate s25-plate" tabindex="0" role="region" aria-label="Samsung Galaxy S25 Ultra isometric technical exhibition">
          ${cornersHtml}
          <div class="s25-svg-container" id="stageContainer">
            ${stageSvg}
          </div>
          ${controlsHtml}
        </div>
        <figcaption class="iso-legend">
          ${swatchKeysHtml}
          <p class="iso-caption">
            The Galaxy S25 Ultra represents a paradigm shift in smartphone engineering: an ultra-rigid Grade 5 titanium perimeter frame bonded to a precision-milled CNC aluminum midplate, accommodating a 40% enlarged sintered-copper vapor chamber, independent quad optical cameras anchored by a 200 MP ISOCELL HP2 sensor and a 90° folded periscope prism, and the 3nm Snapdragon 8 Elite platform.
          </p>
        </figcaption>
      </figure>
      ${specsPanelHtml}
      ${sidebarHtml}
    </main>
    <footer class="exhibition-footer">
      <span>Built with <a href="https://github.com/wheresryan22/anatomy" target="_blank" rel="noopener">/anatomy</a> & <a href="https://isoglow.dev/" target="_blank" rel="noopener">/iso-glow</a></span>
      <span class="footer-meta">42° Isometric Projection · True Painter Depth Order</span>
    </footer>
  </div>
`;

// 3. Inlining Styles and Client JavaScript
let customCss = "";
try {
  customCss = readFileSync(join(HERE, "src/style.css"), "utf8");
} catch (e) {
  console.log("src/style.css not yet found, compiling with default tokens");
}

let liveJs = "";
try {
  liveJs = readFileSync(join(HERE, "src/live.js"), "utf8");
} catch (e) {
  console.log("src/live.js not yet found, compiling placeholder runtime");
}

// Inlined Runtime Data Payload
const RUNTIME_DATA = {
  viewWidth: VIEW_WIDTH,
  viewHeight: VIEW_HEIGHT,
  assemblies: ASSEMBLIES,
  assemblyOrder: ASSEMBLY_ORDER,
  staggerSequence: STAGGER_SEQUENCE,
  hardwareSpecs,
};

const finalScript = `
  window.__S25_DATA__ = ${JSON.stringify(RUNTIME_DATA)};
  ${liveJs}
`;

// Build Standalone HTML Page
const pageHtml = k.pageHtml({
  title: "Samsung Galaxy S25 Ultra · Interactive Engineering Anatomy",
  theme: THEME,
  body: `<style>${customCss}</style>${heroBody}`,
  script: finalScript,
  width: 1240,
});

const outFilename = THEME === "light" ? "index-light.html" : "index.html";
writeFileSync(join(HERE, outFilename), pageHtml);
console.log(`[Galaxy S25 Ultra Build] Successfully wrote ${outFilename} (${(pageHtml.length / 1024).toFixed(1)} KB, ${items.length} items)`);

// Run Geometry Clearance and Depth Audit if requested
if (DO_AUDIT) {
  console.log("[Galaxy S25 Ultra Build] Executing A.auditOrExit verification...");
  A.auditOrExit(scene.R, scene.P);
  console.log("[Galaxy S25 Ultra Build] ✓ Geometry Audit Passed with 0 violations!");
}
