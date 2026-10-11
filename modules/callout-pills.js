/**
 * Samsung Galaxy S25 Ultra — In-Canvas 3D Floating Callout Badges & Hairline Leader Lines
 * Module: modules/callout-pills.js
 *
 * Implements high-craft interactive 3D callouts anchored to component surfaces:
 * - 11 Discrete assembly 3D anchors projected via Azimuth 44° / Elevation 28° isometric camera.
 * - Dynamic 2D tracking synchronized with assembly explosion separation vectors (mx * sep, my * sep, mz * sep).
 * - Hairline dog-leg leader lines with surface anchor dots and outer halo rings.
 * - Floating capsule callout pills with badges [00]–[10] and high-contrast typography.
 * - Visibility gating (fades in when separation > 15% or during component inspection).
 * - Full interactive hover states, pointer clicks, and keyboard accessibility (Enter/Space) to isolate parts.
 */

// Isometric camera projection parameters (Azimuth 44°, Elevation 28°)
export const PROJECTION_CONFIG = {
  width: 1100,
  height: 960,
  azimuth: 44,
  elevation: 28,
  origin: [602.5924734591489, 722.6798974127623],
  scale: 1.8259627898144788,
  unit: Math.sqrt(1.6), // 1.2649110640673518
};

const RADIANS = Math.PI / 180;
const ANG_AZIMUTH = PROJECTION_CONFIG.azimuth * RADIANS;
const ANG_ELEVATION = PROJECTION_CONFIG.elevation * RADIANS;
const SIN_A = Math.sin(ANG_AZIMUTH);
const COS_A = Math.cos(ANG_AZIMUTH);
const SIN_E = Math.sin(ANG_ELEVATION);
const COS_E = Math.cos(ANG_ELEVATION);
const K_VAL = PROJECTION_CONFIG.scale * PROJECTION_CONFIG.unit;

// Mathematical transform factors from 3D delta (dx, dy, dz) to 2D screen delta (sx, sy)
const FACTOR_X_TO_SX = SIN_A * K_VAL;              // ≈ 1.6044
const FACTOR_Y_TO_SX = -COS_A * K_VAL;             // ≈ -1.6614
const FACTOR_X_TO_SY = COS_A * SIN_E * K_VAL;      // ≈ 0.7800
const FACTOR_Y_TO_SY = SIN_A * SIN_E * K_VAL;      // ≈ 0.7532
const FACTOR_Z_TO_SY = -COS_E * K_VAL;             // ≈ -2.0393

/**
 * Projects a 3D coordinate [x, y, z] to 2D screen coordinates [sx, sy]
 * using the configured isometric projection parameters.
 *
 * @param {[number, number, number]} point3D
 * @returns {[number, number]} [screenX, screenY]
 */
export function projectIso([x, y, z]) {
  const sx = PROJECTION_CONFIG.origin[0] + (x * SIN_A - y * COS_A) * K_VAL;
  const sy = PROJECTION_CONFIG.origin[1] + ((x * COS_A + y * SIN_A) * SIN_E - z * COS_E) * K_VAL;
  return [sx, sy];
}

/**
 * Projects a 3D motion/separation vector [dx, dy, dz] to 2D screen translation [sx, sy].
 *
 * @param {[number, number, number]} vector3D
 * @returns {[number, number]} [screenDeltaX, screenDeltaY]
 */
export function projectVector([dx, dy, dz]) {
  const dsx = (dx * SIN_A - dy * COS_A) * K_VAL;
  const dsy = ((dx * COS_A + dy * SIN_A) * SIN_E - dz * COS_E) * K_VAL;
  return [dsx, dsy];
}

/**
 * 3D anchor coordinates for each of the 11 assemblies.
 * Follows exact engineering teardown specifications.
 */
export const ANCHOR_COORDINATES_3D = {
  fixture: [0, 0, -22],
  display: [0, -35, 160],
  chassis: [0, 0, 0],
  vapor_chamber: [10, -10, 45],
  battery: [-15, 30, 80],
  spen: [-88, 0, 20],
  motherboard: [12, -45, 120],
  sub_board: [0, 95, 120],
  cameras: [20, -60, 185],
  wireless_coil: [0, 10, 215],
  back_glass: [0, 0, 245],
};

/**
 * Complete metadata and spatial configuration for all 11 assemblies.
 */
export const ASSEMBLIES_CONFIG = [
  {
    index: 0,
    id: "fixture",
    number: "00",
    name: "Cleanroom Inspection Bench & Fixture",
    short: "Bench",
    anchor3D: [0, 0, -22],
    explodeVector: [0, 0, 0],
    side: "left",
    pillX: 130,
    offsetY: 15,
  },
  {
    index: 1,
    id: "display",
    number: "01",
    name: "Display & EMR Digitizer Stack",
    short: "Display",
    anchor3D: [0, -35, 160],
    explodeVector: [0, 0, -48],
    side: "right",
    pillX: 880,
    offsetY: 0,
  },
  {
    index: 2,
    id: "chassis",
    number: "02",
    name: "Titanium Frame & Midframe Chassis",
    short: "Frame",
    anchor3D: [0, 0, 0],
    explodeVector: [0, 0, 0],
    side: "left",
    pillX: 130,
    offsetY: -5,
  },
  {
    index: 3,
    id: "vapor_chamber",
    number: "03",
    name: "4,100 mm² Liquid Vapor Chamber",
    short: "Cooling",
    anchor3D: [10, -10, 45],
    explodeVector: [0, 0, 36],
    side: "right",
    pillX: 880,
    offsetY: 20,
  },
  {
    index: 4,
    id: "battery",
    number: "04",
    name: "5,000 mAh Dual-Tab Power Cell",
    short: "Battery",
    anchor3D: [-15, 30, 80],
    explodeVector: [0, 0, 70],
    side: "left",
    pillX: 130,
    offsetY: 10,
  },
  {
    index: 5,
    id: "spen",
    number: "05",
    name: "S Pen Stylus & Ejection Spring",
    short: "S Pen",
    anchor3D: [-88, 0, 20],
    explodeVector: [-70, 0, 0],
    side: "left",
    pillX: 130,
    offsetY: -10,
  },
  {
    index: 6,
    id: "motherboard",
    number: "06",
    name: "Motherboard & Snapdragon 8 Elite",
    short: "Logic Board",
    anchor3D: [12, -45, 120],
    explodeVector: [0, 0, 106],
    side: "right",
    pillX: 880,
    offsetY: 5,
  },
  {
    index: 7,
    id: "sub_board",
    number: "07",
    name: "Sub-Board, USB-C 3.2 & Haptics",
    short: "I/O Board",
    anchor3D: [0, 95, 120],
    explodeVector: [0, 0, 128],
    side: "left",
    pillX: 130,
    offsetY: -15,
  },
  {
    index: 8,
    id: "cameras",
    number: "08",
    name: "Quad Camera System & Periscope Zoom",
    short: "Cameras",
    anchor3D: [20, -60, 185],
    explodeVector: [0, 0, 160],
    side: "right",
    pillX: 880,
    offsetY: 15,
  },
  {
    index: 9,
    id: "wireless_coil",
    number: "09",
    name: "Qi2 Wireless Coil, NFC & UWB",
    short: "Wireless",
    anchor3D: [0, 10, 215],
    explodeVector: [0, 0, 194],
    side: "right",
    pillX: 880,
    offsetY: -15,
  },
  {
    index: 10,
    id: "back_glass",
    number: "10",
    name: "Gorilla Glass Victus 2 Rear & Rings",
    short: "Back Glass",
    anchor3D: [0, 0, 245],
    explodeVector: [0, 0, 230],
    side: "right",
    pillX: 880,
    offsetY: -20,
  },
];

export const REST_CENTERS_2D = {
  fixture: [602.6, 672.9],
  display: [602.6, 724.5],
  chassis: [602.6, 714.3],
  vapor_chamber: [563.4, 730.3],
  battery: [630.6, 715.1],
  spen: [595.5, 666.5],
  motherboard: [521.2, 752.5],
  sub_board: [713.9, 667.9],
  cameras: [486.6, 733.5],
  wireless_coil: [602.6, 713.0],
  back_glass: [602.6, 710.5],
};

/**
 * Computes dynamic 2D position for an assembly anchor taking into account
 * the explosion separation vector (mx * sep, my * sep, mz * sep) and live DOM transforms.
 *
 * @param {number} index Assembly index (0 to 10)
 * @param {number} separation Normalized separation (0.0 to 1.0)
 * @param {SVGElement|null} svgEl Optional SVG container element
 * @returns {[number, number]} Dynamic 2D anchor [ax, ay]
 */
export function computeAnchor2D(index, separation = 0, svgEl = null) {
  const config = ASSEMBLIES_CONFIG[index];
  if (!config) return [0, 0];

  const baseCenter = REST_CENTERS_2D[config.id] || [600, 700];

  // If live SVG assembly group has a transform attribute in the DOM, synchronize with it directly
  if (svgEl) {
    const groupEl = svgEl.querySelector(`.assembly-group[data-index="${index}"]`);
    if (groupEl) {
      const transformAttr = groupEl.getAttribute("transform");
      if (transformAttr) {
        const match = /translate\(\s*([-\d.]+)[,\s]+([-\d.]+)\s*\)/i.exec(transformAttr);
        if (match) {
          const domSx = parseFloat(match[1]);
          const domSy = parseFloat(match[2]);
          return [baseCenter[0] + domSx, baseCenter[1] + domSy];
        }
      }
    }
  }

  // Pure mathematical dynamic projection:
  const sep = Math.max(0, Math.min(1, separation > 1.5 ? separation / 100 : separation));
  let fx = config.explodeVector[0] * sep;
  let fy = config.explodeVector[1] * sep;
  let fz = config.explodeVector[2] * sep;

  if (config.id === "spen") {
    fx = -68 * Math.min(1.0, sep * 1.35);
  }

  // Calculated 2D translation offset matching live.js viewport scaling
  const sx = fx * 1.604 - fy * 1.661;
  const sy = fx * 0.78 + fy * 0.753 - fz * 1.705;

  return [baseCenter[0] + sx, baseCenter[1] + sy];
}

/**
 * Relaxes vertical spacing between adjacent callout pills to prevent overlaps.
 *
 * @param {Array<{py: number}>} pills
 * @param {number} minGap Minimum vertical distance in pixels
 * @param {number} minY Minimum allowed Y coordinate
 * @param {number} maxY Maximum allowed Y coordinate
 */
function relaxVerticalSpacing(pills, minGap = 28, minY = 45, maxY = 915) {
  if (pills.length <= 1) return;

  pills.sort((a, b) => a.py - b.py);

  // Forward pass
  for (let i = 1; i < pills.length; i++) {
    if (pills[i].py < pills[i - 1].py + minGap) {
      pills[i].py = pills[i - 1].py + minGap;
    }
  }

  // Clamp bottom and backward pass
  if (pills[pills.length - 1].py > maxY) {
    pills[pills.length - 1].py = maxY;
  }
  for (let i = pills.length - 2; i >= 0; i--) {
    if (pills[i].py > pills[i + 1].py - minGap) {
      pills[i].py = pills[i + 1].py - minGap;
    }
  }

  // Clamp top
  if (pills[0].py < minY) {
    pills[0].py = minY;
    for (let i = 1; i < pills.length; i++) {
      if (pills[i].py < pills[i - 1].py + minGap) {
        pills[i].py = pills[i - 1].py + minGap;
      }
    }
  }
}

/**
 * Creates SVG definitions and embedded stylesheet for the callout pills system.
 *
 * @returns {string} SVG defs markup
 */
function createCalloutDefs() {
  return `
    <defs>
      <filter id="callout-pill-shadow" x="-20%" y="-30%" width="140%" height="180%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.32" />
      </filter>
      <filter id="callout-pill-glow" x="-20%" y="-30%" width="140%" height="180%">
        <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.45" />
      </filter>
      <style>
        .callout-pills-container {
          pointer-events: auto;
          transition: opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.28s ease;
        }
        .callout-pills-container.is-hidden {
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
        .callout-pill-item {
          cursor: pointer;
          outline: none;
          transition: opacity 0.22s ease, transform 0.22s ease;
        }
        .callout-pill-item .leader-line {
          stroke: var(--callout-line-stroke, var(--anatomy-mid, #6a6a6a));
          stroke-width: 0.85px;
          stroke-linecap: round;
          stroke-linejoin: round;
          fill: none;
          transition: stroke 0.2s ease, stroke-width 0.2s ease, opacity 0.2s ease;
        }
        .callout-pill-item .leader-dot {
          fill: var(--callout-line-lit, var(--anatomy-lit, #ffffff));
          transition: fill 0.2s ease, r 0.2s ease;
        }
        .callout-pill-item .leader-halo {
          stroke: var(--callout-line-stroke, var(--anatomy-mid, #6a6a6a));
          stroke-width: 0.75px;
          fill: none;
          opacity: 0.65;
          transition: stroke 0.2s ease, opacity 0.2s ease, r 0.2s ease;
        }
        .callout-pill-item .pill-rect {
          fill: var(--callout-bg, var(--anatomy-card, rgba(20, 20, 22, 0.94)));
          stroke: var(--callout-border, var(--anatomy-lo, #3e3e3e));
          stroke-width: 1px;
          filter: url(#callout-pill-shadow);
          transition: fill 0.2s ease, stroke 0.2s ease, filter 0.2s ease;
        }
        .callout-pill-item .pill-badge-bg {
          fill: var(--callout-badge-bg, rgba(255, 255, 255, 0.08));
          stroke: var(--callout-badge-border, var(--anatomy-lo, #3e3e3e));
          stroke-width: 0.75px;
          transition: fill 0.2s ease, stroke 0.2s ease;
        }
        .callout-pill-item .pill-badge-text {
          font-family: var(--galaxy-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
          font-size: 9.5px;
          font-weight: 700;
          fill: var(--callout-badge-text, var(--anatomy-lit, #ffffff));
          letter-spacing: 0.04em;
          user-select: none;
          pointer-events: none;
        }
        .callout-pill-item .pill-label-text {
          font-family: var(--galaxy-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
          font-size: 9px;
          font-weight: 600;
          fill: var(--callout-text, var(--anatomy-text, #e6e6e6));
          letter-spacing: 0.05em;
          user-select: none;
          pointer-events: none;
        }

        /* Hover & Focus Interaction */
        .callout-pill-item:hover .pill-rect,
        .callout-pill-item:focus-visible .pill-rect {
          stroke: var(--callout-border-hover, var(--anatomy-hi, #d4d4d4));
          fill: var(--callout-bg-hover, var(--anatomy-face, rgba(32, 32, 36, 0.98)));
        }
        .callout-pill-item:hover .pill-badge-bg,
        .callout-pill-item:focus-visible .pill-badge-bg {
          fill: var(--callout-badge-border, rgba(255, 255, 255, 0.2));
          stroke: var(--callout-border-hover, #ffffff);
        }
        .callout-pill-item:hover .leader-line,
        .callout-pill-item:focus-visible .leader-line {
          stroke: var(--callout-line-lit, var(--anatomy-lit, #ffffff));
          stroke-width: 1.25px;
        }
        .callout-pill-item:hover .leader-dot,
        .callout-pill-item:focus-visible .leader-dot {
          fill: var(--callout-line-lit, var(--anatomy-lit, #ffffff));
          r: 2.75px;
        }
        .callout-pill-item:hover .leader-halo,
        .callout-pill-item:focus-visible .leader-halo {
          stroke: var(--callout-line-lit, var(--anatomy-lit, #ffffff));
          opacity: 1;
          r: 6px;
        }

        /* Active Isolated Inspection State */
        .callout-pill-item.is-active .pill-rect {
          stroke: var(--callout-border-active, var(--anatomy-lit, #ffffff));
          stroke-width: 1.5px;
          fill: var(--callout-bg-hover, var(--anatomy-card, rgba(20, 20, 22, 0.98)));
          filter: url(#callout-pill-shadow);
        }
        .callout-pill-item.is-active .pill-badge-bg {
          fill: var(--anatomy-lit, #ffffff);
          stroke: var(--anatomy-lit, #ffffff);
        }
        .callout-pill-item.is-active .pill-badge-text {
          fill: var(--anatomy-page, #0c0c0e);
          font-weight: 800;
        }
        .callout-pill-item.is-active .pill-label-text {
          fill: var(--callout-text, #ffffff);
          font-weight: 700;
        }
        .callout-pill-item.is-active .leader-line {
          stroke: var(--callout-line-lit, var(--anatomy-lit, #ffffff));
          stroke-width: 1.5px;
        }
        .callout-pill-item.is-active .leader-dot {
          fill: var(--callout-line-lit, var(--anatomy-lit, #ffffff));
          r: 3px;
        }
        .callout-pill-item.is-active .leader-halo {
          stroke: var(--callout-line-lit, var(--anatomy-lit, #ffffff));
          opacity: 1;
          r: 6.5px;
        }

        /* Dimmed State when another assembly is isolated */
        .callout-pills-container.has-active .callout-pill-item:not(.is-active) {
          opacity: 0.18;
        }
        .callout-pills-container.has-active .callout-pill-item:not(.is-active):hover {
          opacity: 0.75;
        }
      </style>
    </defs>
  `;
}

// Module singleton state
let activeContainerEl = null;
let activeSvgEl = null;
let cachedPillNodes = [];
let currentOnSelectHandler = null;

/**
 * Generates an SVG path string for a leader line connecting surface anchor (ax, ay)
 * to a floating callout pill (targetX, py) with a crisp horizontal shoulder.
 *
 * @param {number} ax Surface anchor X
 * @param {number} ay Surface anchor Y
 * @param {number} px Pill left X
 * @param {number} py Pill center Y
 * @param {number} pillW Pill width
 * @param {"left"|"right"} side Side flank
 * @returns {string} SVG path string
 */
function buildLeaderLinePath(ax, ay, px, py, pillW, side) {
  if (side === "left") {
    const pillRightX = px + pillW;
    // Elbow sits between right edge of pill and the anchor point
    const elbowX = Math.min(ax - 20, Math.max(pillRightX + 16, pillRightX + (ax - pillRightX) * 0.4));
    return `M ${ax.toFixed(1)} ${ay.toFixed(1)} L ${elbowX.toFixed(1)} ${py.toFixed(1)} L ${pillRightX.toFixed(1)} ${py.toFixed(1)}`;
  } else {
    // Elbow sits between left edge of pill and the anchor point
    const elbowX = Math.max(ax + 20, Math.min(px - 16, px - (px - ax) * 0.4));
    return `M ${ax.toFixed(1)} ${ay.toFixed(1)} L ${elbowX.toFixed(1)} ${py.toFixed(1)} L ${px.toFixed(1)} ${py.toFixed(1)}`;
  }
}

/**
 * Updates positions, paths, and visual states for all pills and leader lines.
 * Call this inside requestAnimationFrame or slider input events for 60fps/120fps fluid tracking.
 *
 * @param {number} separation Separation value (0.0–1.0 or 0–100%)
 * @param {number} activeIndex Currently inspected assembly index (-1 if none)
 */
export function updatePillPositions(separation = 0, activeIndex = -1) {
  if (!activeContainerEl || cachedPillNodes.length === 0) return;

  // Normalize separation supporting 0.0–1.0 (with spring overshoot) and 0–100 percentages
  const sep = Math.max(0, Math.min(1, separation > 1.5 ? separation / 100 : separation));
  const isVisible = sep > 0.15 || activeIndex >= 0;

  // Toggle visibility class
  activeContainerEl.classList.toggle("is-hidden", !isVisible);
  activeContainerEl.classList.toggle("has-active", activeIndex >= 0);

  // 1. Calculate dynamic 2D surface anchors for all 11 parts
  const computedList = cachedPillNodes.map((item) => {
    const [ax, ay] = computeAnchor2D(item.index, sep, activeSvgEl);
    const targetPy = ay + item.config.offsetY;
    return {
      ...item,
      ax,
      ay,
      py: targetPy,
    };
  });

  // 2. Relax vertical spacing on left and right stacks to eliminate overlaps
  const leftStack = computedList.filter((item) => item.config.side === "left");
  const rightStack = computedList.filter((item) => item.config.side === "right");

  relaxVerticalSpacing(leftStack, 28, 70, 780);
  relaxVerticalSpacing(rightStack, 28, 70, 780);

  // 3. Update DOM node geometry
  let currentVb = [0, 0, 1100, 960];
  if (activeSvgEl) {
    const vbAttr = activeSvgEl.getAttribute("viewBox");
    if (vbAttr) {
      const parts = vbAttr.split(/[\s,]+/).map(parseFloat).filter((v) => !isNaN(v));
      if (parts.length === 4) currentVb = parts;
    }
  }
  const isZoomed = currentVb[2] < 950;

  for (const item of computedList) {
    const { ax, ay, py, config, lineEl, dotEl, haloEl, pillGroupEl, itemGroupEl, pillW, pillH } = item;
    const isActive = item.index === activeIndex;

    let px = config.pillX;
    let finalPy = py;
    let lineSide = config.side;

    if (isActive && isZoomed) {
      // Dock active pill safely to the left of the component inside visible camera safe zone
      // Keeps HUD top-right area 100% unobstructed, never clips viewport margins
      lineSide = "left";
      px = Math.max(currentVb[0] + 16, Math.min(ax - pillW - 24, currentVb[0] + currentVb[2] * 0.38 - pillW));
      finalPy = Math.max(currentVb[1] + 36, Math.min(currentVb[1] + currentVb[3] - 40, ay - 18));
    }

    // Leader path
    const pathD = buildLeaderLinePath(ax, ay, px, finalPy, pillW, lineSide);
    lineEl.setAttribute("d", pathD);

    // Anchor dot & halo
    dotEl.setAttribute("cx", ax.toFixed(1));
    dotEl.setAttribute("cy", ay.toFixed(1));
    haloEl.setAttribute("cx", ax.toFixed(1));
    haloEl.setAttribute("cy", ay.toFixed(1));

    // Pill group translation
    pillGroupEl.setAttribute("transform", `translate(${px.toFixed(1)} ${(finalPy - pillH / 2).toFixed(1)})`);

    // Active state and visibility management
    itemGroupEl.classList.toggle("is-active", isActive);

    if (activeIndex >= 0) {
      // In isolation mode: SHOW ONLY the active component's callout badge!
      // All other 10 zombie pills are completely hidden!
      if (isActive) {
        itemGroupEl.style.opacity = "1";
        itemGroupEl.style.visibility = "visible";
        itemGroupEl.style.pointerEvents = "auto";
      } else {
        itemGroupEl.style.opacity = "0";
        itemGroupEl.style.visibility = "hidden";
        itemGroupEl.style.pointerEvents = "none";
      }
    } else {
      // In overview mode: all pills are visible when separated (> 12%), or hidden when flush assembled
      const sepFraction = separation > 1.5 ? separation / 100 : separation;
      const isVisible = sepFraction > 0.12;
      itemGroupEl.style.opacity = isVisible ? "1" : "0";
      itemGroupEl.style.visibility = isVisible ? "visible" : "hidden";
      itemGroupEl.style.pointerEvents = isVisible ? "auto" : "none";
    }
  }
}

/**
 * Renders the SVG group of floating callout pills with badges [00]–[10]
 * and hairline leader lines pointing from pill to component surface.
 *
 * @param {SVGElement} svgEl Target SVG root element (<svg class="iso-svg galaxy-svg" ...>)
 * @param {number} separation Initial separation percentage (0.0 to 1.0 or 0 to 100)
 * @param {number} activeIndex Initially isolated assembly index (-1 if none)
 * @param {function(number, object): void} onSelect Callback when an assembly pill is clicked
 * @returns {SVGGElement} The rendered callout pills SVG group
 */
export function renderPills(svgEl, separation = 0, activeIndex = -1, onSelect = null) {
  if (!svgEl) {
    console.error("renderPills: svgEl is required");
    return null;
  }

  activeSvgEl = svgEl;
  currentOnSelectHandler = onSelect;

  // Remove previous callout container if present
  const existingContainer = svgEl.querySelector(".callout-pills-container");
  if (existingContainer) {
    existingContainer.remove();
  }

  // Ensure defs and styles exist in SVG
  let defsEl = svgEl.querySelector("defs");
  if (!defsEl) {
    defsEl = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    svgEl.prepend(defsEl);
  }

  // Append defs markup if not already present
  if (!svgEl.querySelector("#callout-pill-shadow")) {
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = `<svg>${createCalloutDefs()}</svg>`;
    const newDefs = tempContainer.querySelector("defs");
    while (newDefs.childNodes.length > 0) {
      defsEl.appendChild(newDefs.childNodes[0]);
    }
  }

  // Create main callout pills SVG group container
  const container = document.createElementNS("http://www.w3.org/2000/svg", "g");
  container.setAttribute("class", "callout-pills-container");
  container.setAttribute("role", "group");
  container.setAttribute("aria-label", "Component 3D callout badges and leader lines");

  cachedPillNodes = [];
  const pillW = 124;
  const pillH = 22;

  ASSEMBLIES_CONFIG.forEach((config) => {
    const itemGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    itemGroup.setAttribute("class", "callout-pill-item");
    itemGroup.setAttribute("data-index", String(config.index));
    itemGroup.setAttribute("data-id", config.id);
    itemGroup.setAttribute("role", "button");
    itemGroup.setAttribute("tabindex", "0");
    itemGroup.setAttribute("aria-label", `Assembly ${config.number}: ${config.name}`);

    // Leader line
    const lineEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
    lineEl.setAttribute("class", "leader-line");
    lineEl.setAttribute("fill", "none");
    itemGroup.appendChild(lineEl);

    // Surface anchor halo
    const haloEl = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    haloEl.setAttribute("class", "leader-halo");
    haloEl.setAttribute("r", "5");
    itemGroup.appendChild(haloEl);

    // Surface anchor point dot
    const dotEl = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dotEl.setAttribute("class", "leader-dot");
    dotEl.setAttribute("r", "2.25");
    itemGroup.appendChild(dotEl);

    // Floating Pill Capsule
    const pillGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    pillGroup.setAttribute("class", "callout-pill-capsule");

    // Pill background rect
    const pillRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    pillRect.setAttribute("class", "pill-rect");
    pillRect.setAttribute("width", String(pillW));
    pillRect.setAttribute("height", String(pillH));
    pillRect.setAttribute("rx", String(pillH / 2));
    pillRect.setAttribute("ry", String(pillH / 2));
    pillGroup.appendChild(pillRect);

    // Badge background tag [00]–[10]
    const badgeBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    badgeBg.setAttribute("class", "pill-badge-bg");
    badgeBg.setAttribute("x", "3.5");
    badgeBg.setAttribute("y", "3.5");
    badgeBg.setAttribute("width", "25");
    badgeBg.setAttribute("height", String(pillH - 7));
    badgeBg.setAttribute("rx", "4");
    badgeBg.setAttribute("ry", "4");
    pillGroup.appendChild(badgeBg);

    // Badge text numeral
    const badgeText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    badgeText.setAttribute("class", "pill-badge-text");
    badgeText.setAttribute("x", "16");
    badgeText.setAttribute("y", String(pillH / 2 + 3.2));
    badgeText.setAttribute("text-anchor", "middle");
    badgeText.textContent = config.number;
    pillGroup.appendChild(badgeText);

    // Component name label
    const labelText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    labelText.setAttribute("class", "pill-label-text");
    labelText.setAttribute("x", "34");
    labelText.setAttribute("y", String(pillH / 2 + 3.2));
    labelText.setAttribute("text-anchor", "start");
    labelText.textContent = config.short.toUpperCase();
    pillGroup.appendChild(labelText);

    itemGroup.appendChild(pillGroup);

    // Interactive Event Handlers
    const handleSelect = (e) => {
      e.stopPropagation();
      if (typeof currentOnSelectHandler === "function") {
        currentOnSelectHandler(config.index, config);
      }
    };

    itemGroup.addEventListener("click", handleSelect);
    itemGroup.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleSelect(e);
      }
    });

    container.appendChild(itemGroup);

    cachedPillNodes.push({
      index: config.index,
      config,
      itemGroupEl: itemGroup,
      pillGroupEl: pillGroup,
      lineEl,
      dotEl,
      haloEl,
      pillW,
      pillH,
    });
  });

  svgEl.appendChild(container);
  activeContainerEl = container;

  // Apply initial positions
  updatePillPositions(separation, activeIndex);

  return container;
}

/**
 * Destroys active callout pills DOM elements and clears cached references.
 */
export function destroyPills() {
  if (activeContainerEl) {
    activeContainerEl.remove();
    activeContainerEl = null;
  }
  activeSvgEl = null;
  cachedPillNodes = [];
  currentOnSelectHandler = null;
}

/**
 * Default export object adhering to CalloutPills specification.
 */
export const CalloutPills = {
  renderPills,
  updatePillPositions,
  destroyPills,
  computeAnchor2D,
  projectIso,
  projectVector,
  ANCHOR_COORDINATES_3D,
  ASSEMBLIES_CONFIG,
  PROJECTION_CONFIG,
};

// Global browser window attachment for standalone/script compatibility
if (typeof window !== "undefined") {
  window.CalloutPills = CalloutPills;
}

export default CalloutPills;
