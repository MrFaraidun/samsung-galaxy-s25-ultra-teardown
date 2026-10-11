import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "./kit/iso-kit.mjs";
import { kitScript } from "./scripts/inline-kit.mjs";
import { PHONE_SPECS, ASSEMBLIES } from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const THEME = process.argv.includes("--light") ? "light" : "dark";

const W = 1100;
const H = 960;
const AZIMUTH = 44;
const ELEVATION = 28;

// Define bounding points including the base fixture and fully exploded upper layers
const BOUNDS = [
  [-85, -125, -22],
  [85, 125, -22],
  [-85, -125, 260],
  [85, 125, 260],
  [-110, 0, 10], // S Pen full extension along -X
];

const P = k.fitProjection(BOUNDS, W, H, {
  pad: 32,
  azimuth: AZIMUTH,
  elevation: ELEVATION,
});

async function main() {
  // Dynamically import geometry modules as they are completed
  const { buildDisplay, buildChassis } = await import("./geometry-frame.mjs");
  const { buildVaporChamber, buildBattery, buildSPen } = await import("./geometry-internals.mjs");
  const { buildMotherboard, buildSubBoard, buildCameras } = await import("./geometry-electronics.mjs");
  const { buildFixture, buildWirelessCoil, buildBackGlass } = await import("./geometry-enclosure.mjs");

  const builders = {
    fixture: buildFixture,
    display: buildDisplay,
    chassis: buildChassis,
    vapor_chamber: buildVaporChamber,
    battery: buildBattery,
    spen: buildSPen,
    motherboard: buildMotherboard,
    sub_board: buildSubBoard,
    cameras: buildCameras,
    wireless_coil: buildWirelessCoil,
    back_glass: buildBackGlass,
  };

  const assembliesData = [];
  let totalSolids = 0;
  let totalPaths = 0;

  for (const assem of ASSEMBLIES) {
    const builder = builders[assem.id];
    if (!builder) {
      console.warn(`No builder found for ${assem.id}`);
      continue;
    }
    const result = builder(P);
    totalSolids += result.solidsCount || 0;
    totalPaths += result.pathsCount || 0;
    assembliesData.push({
      ...assem,
      svg: result.svg,
      solidsCount: result.solidsCount,
      pathsCount: result.pathsCount,
    });
  }

  console.log(`Model generated: ${ASSEMBLIES.length} assemblies, ${totalSolids} solids, ${totalPaths} paths`);

  // Build SVG group nodes with data attributes for live.js
  const groups = assembliesData.map((item, index) => {
    const [mx, my, mz] = item.explodeVector;
    return `<g class="it assembly-group" data-id="${item.id}" data-index="${index}" data-mx="${mx}" data-my="${my}" data-mz="${mz}" data-restz="${item.restZ}">${item.svg}</g>`;
  });

  const figureLabel = "Samsung Galaxy S25 Ultra engineering teardown model: titanium frame, Dynamic AMOLED 2X display, 4100mm² vapor chamber, 5000mAh battery, S Pen stylus, Qualcomm Snapdragon 8 Elite motherboard, quad cameras with 200MP wide and 50MP periscope zoom, wireless Qi2 charging coil, and Gorilla Glass Victus 2 back panel on a cleanroom inspection bench.";
  const figureSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="iso-svg galaxy-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${figureLabel}">
    <defs>
      <linearGradient id="titanium-sheen" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4b4b4b" stop-opacity="0.9"/>
        <stop offset="50%" stop-color="#737373" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#2c2c2c" stop-opacity="0.9"/>
      </linearGradient>
      <linearGradient id="copper-wick" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#8a532a" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#542e14" stop-opacity="0.9"/>
      </linearGradient>
      <filter id="halo-blur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8"/>
      </filter>
    </defs>
    <g class="galaxy-scene">${groups.join("")}</g>
  </svg>`;

  const topBar = `
    <header class="galaxy-top-bar">
      <div class="top-bar-left">
        <button type="button" class="tool-btn" data-theme-toggle title="Toggle light/dark display theme">
          <span class="tool-icon">${THEME === "light" ? "🌙" : "☀️"}</span> ${THEME === "light" ? "Dark Titanium" : "Paper Light"}
        </button>
        <button type="button" class="tool-btn active" data-sound-toggle title="Toggle synthesized mechanical sound effects">
          <span class="tool-icon">🔊</span> Sound On
        </button>
      </div>
    </header>
  `;

  const corners = `
    <div class="iso-plate-corners" aria-hidden="true">
      <span class="iso-plate-corner" data-corner="fig">Fig 1</span>
      <span class="iso-plate-corner" data-corner="title">SAMSUNG GALAXY S25 ULTRA</span>
      <span class="iso-plate-corner" data-corner="hint">DRAG SLIDER · CLICK PARTS · 0-9 ISOLATE · SPACE EXPLODE</span>
      <span class="iso-plate-corner" data-corner="readout" data-readout>ASSEMBLED · 8.2 MM · 218 G</span>
    </div>
  `;

  const narrative = `
    <div class="galaxy-narrative" id="galaxy-narrative" aria-live="polite">
      <span class="narrative-badge" id="narrative-badge">GALAXY S25 ULTRA · 3NM TEARDOWN</span>
      <h2 class="narrative-headline" id="narrative-headline">Engineered flush. Grade 5 Titanium exterior meets 3nm Snapdragon compute.</h2>
      <p class="narrative-sub" id="narrative-sub">Drag slider or select components to inspect internal architecture.</p>
    </div>
  `;

  const stageLayout = `
    <div class="galaxy-stage-layout">
      <div class="galaxy-stage" tabindex="0" role="slider" aria-label="Samsung Galaxy S25 Ultra engineering inspection stage. Use arrow keys to adjust explode separation, 0-9 to inspect components, Space to toggle explode, Esc to reassemble." aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-valuetext="Assembled, flush 8.2 mm">
        <div class="camera-flash-overlay" id="camera-flash-overlay" aria-hidden="true"></div>
        ${figureSvg}
        <div class="part-detail-box galaxy-inspector-hud" id="galaxy-inspector-hud" role="region" aria-label="Component Telemetry Inspector"></div>
        <div class="camera-toolbar" role="group" aria-label="Cinematic Viewports">
          <span class="camera-toolbar-label">VIEWPORT</span>
          <button type="button" class="camera-pill-btn active" data-camera-preset="overview" title="Full teardown overview">Overview</button>
          <button type="button" class="camera-pill-btn" data-camera-preset="soc" title="Snapdragon 8 Elite die and motherboard">SoC Core</button>
          <button type="button" class="camera-pill-btn" data-camera-preset="optics" title="200MP OIS and 5x folded periscope">Optics</button>
          <button type="button" class="camera-pill-btn" data-camera-preset="thermal" title="4,100 mm² vapor chamber and battery">Thermal</button>
          <button type="button" class="camera-pill-btn" data-camera-preset="spen" title="S Pen stylus and silo">S Pen</button>
        </div>
      </div>
    </div>
  `;

  const controls = `
    <div class="galaxy-controls">
      <div class="slider-group">
        <label for="explode-slider" class="slider-label">Separation</label>
        <input type="range" id="explode-slider" min="0" max="100" value="0" step="1" class="galaxy-slider" aria-label="Explode separation percentage" />
        <span class="slider-readout" data-slider-val>0%</span>
      </div>
      <div class="preset-group">
        <button type="button" class="preset-btn active" data-preset="0">Assemble</button>
        <button type="button" class="preset-btn" data-preset="35">Inspection</button>
        <button type="button" class="preset-btn" data-preset="70">Subsystems</button>
        <button type="button" class="preset-btn" data-preset="100">Exploded</button>
      </div>
      <div class="action-dock" role="group" aria-label="Interactive Mechanisms">
        <button type="button" class="action-btn" data-action="snap-shutter" title="Trigger 200MP mechanical shutter snap with sensor flash">
          <span class="action-btn-dot"></span> 📷 Snap Shutter
        </button>
        <button type="button" class="action-btn" data-action="benchmark-stress" title="Run 4.47GHz benchmark thermal stress with capillary wick flow">
          <span class="action-btn-dot"></span> ⚡ Benchmark
        </button>
        <button type="button" class="action-btn" data-action="eject-spen" title="Eject internal S Pen stylus with spring release">
          <span class="action-btn-dot"></span> ⏏ Eject S Pen
        </button>
      </div>
      <button type="button" class="tool-btn" data-tour-btn title="Toggle automated inspection tour">
        <span class="tool-icon">●</span> Auto Tour
      </button>
    </div>
  `;

  const legendKeys = assembliesData
    .map(
      (a, i) =>
        `<button type="button" class="iso-key" data-idx="${i}" title="Inspect and isolate ${a.name}">◇ <strong>${a.number}</strong> ${a.short}</button>`
    )
    .join("\n        ");

  const caption = "The Samsung Galaxy S25 Ultra is engineered with a Grade 5 Titanium exterior frame bonded to an internal 6013 aluminum sub-chassis. Its thermal core features a 4,100 mm² liquid vapor chamber with sintered capillary wick, cooling the 3nm Qualcomm Snapdragon 8 Elite for Galaxy SoC. A 5,000 mAh dual-tab battery powers the 6.86″ Dynamic AMOLED 2X display, while the quad camera module integrates a 200MP OIS wide sensor and 50MP 5x optical folded periscope prism. An internal inductive S Pen docks seamlessly into the left flank.";

  const legend = `
    <figcaption class="galaxy-legend">
      <div class="iso-keys">
        ${legendKeys}
      </div>
      <p class="iso-caption">${caption}</p>
    </figcaption>
  `;

  const body = `
    <div class="galaxy-container">
      ${topBar}
      ${narrative}
      <figure class="iso-figure galaxy-figure">
        <div class="iso-plate galaxy-plate">
          ${corners}
          ${stageLayout}
          ${controls}
        </div>
        ${legend}
      </figure>
    </div>
  `;

  const CSS = readFileSync(join(HERE, "galaxy.css"), "utf8");
  const THEME_GRID_CSS = readFileSync(join(HERE, "modules/theme-and-grid.css"), "utf8");
  const MOBILE_CSS = readFileSync(join(HERE, "modules/mobile-layout.css"), "utf8");
  const FULL_CSS = `${CSS}\n\n/* === Theme & Grid === */\n${THEME_GRID_CSS}\n\n/* === Mobile Layout === */\n${MOBILE_CSS}`;

  const LIVE_JS = readFileSync(join(HERE, "live.js"), "utf8");

  function wrapModule(filename) {
    let code = readFileSync(join(HERE, "modules", filename), "utf8");
    code = code.replace(/export\s+default\s+[^;]+;/g, "");
    code = code.replace(/export\s*\{[^}]*\};?/g, "");
    code = code.replace(/export\s+(const|let|var|function|class)\s+/g, "$1 ");
    return `;(function() {\n${code}\n})();\n`;
  }

  const MODULES_BUNDLE = [
    "audio-synth.js",
    "cinematic-camera.js",
    "ois-gyro.js",
    "callout-pills.js",
    "kinetic-actions.js",
    "narrative-engine.js",
  ].map(wrapModule).join("\n");

  const DATA_PAYLOAD = {
    W,
    H,
    specs: PHONE_SPECS,
    assemblies: ASSEMBLIES.map((a) => ({
      id: a.id,
      number: a.number,
      name: a.name,
      short: a.short,
      say: a.say,
      description: a.description,
      explodeVector: a.explodeVector,
      restZ: a.restZ,
    })),
  };

  const clientScript = `
    ${kitScript()}
    window.__GALAXY_DATA__ = ${JSON.stringify(DATA_PAYLOAD)};
    ${MODULES_BUNDLE}
    ${LIVE_JS}
  `;

  const page = k.pageHtml({
    title: "Samsung Galaxy S25 Ultra · Anatomy",
    theme: THEME,
    body: `<style>${FULL_CSS}</style>${body}`,
    script: clientScript,
    width: 1140,
  });

  const outName = THEME === "light" ? "galaxy-s25-ultra-light.html" : "galaxy-s25-ultra.html";
  writeFileSync(join(HERE, outName), page);
  if (THEME === "dark") {
    writeFileSync(join(HERE, "index.html"), page);
    console.log(`Saved page to ${outName} and index.html`);
  } else {
    console.log(`Saved page to ${outName}`);
  }
}

main().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
