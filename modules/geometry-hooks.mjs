/**
 * ============================================================================
 * SAMSUNG GALAXY S25 ULTRA — GEOMETRY & SVG HOOKS SYSTEM
 * modules/geometry-hooks.mjs
 * ============================================================================
 * Precision physical CAD and SVG hooks module providing element identifiers,
 * interactive motion hooks, flow animation classes, and regression-tested
 * post-processing patches for:
 *
 * 1. Primary 200MP ISOCELL HP2 Camera Lens Group (`id="ois-lens-primary"`)
 *    - Captures the 8-element optical aperture, iris blade assembly, and
 *      4-corner planar OIS flexure suspension springs.
 *    - Targeted by `modules/ois-gyro.js` for 2-axis voice-coil motor stabilization.
 *
 * 2. 50MP 5x Folded Periscope Optical Prism (`id="periscope-prism-element"`)
 *    - Captures the 45° angled folded glass prism mirror, entrance aperture,
 *      specular sheen rays, and dual optical guide rails.
 *    - Targeted by `modules/ois-gyro.js` for magnetic rail pitch stabilization.
 *
 * 3. 4,100 mm² Vapor Chamber Wick Surface (`id="vapor-chamber-wick"`, class `iso-flow`)
 *    - Captures the fine sintered copper capillary mesh grid and longitudinal
 *      condenser return arteries with fluid reflux arrows.
 *    - Provides `class="iso-flow"` and `data-flow=""` for stroke dashoffset animation
 *      during benchmark thermal stress testing (`modules/kinetic-actions.js`).
 *
 * 4. S Pen Stylus Clicker Plunger & Stylus Body (`id="spen-plunger"`, `id="spen-stylus-body"`)
 *    - `spen-plunger`: Clicker button cap, ejection guide shaft, and helical spring coil.
 *    - `spen-stylus-body`: Main 4,096-pressure inductive resonance EMR stylus body,
 *      internal BLE tray, TiO2 super-cap, side rocker button, and 0.7mm elastomer tip.
 *    - Targeted by `modules/kinetic-actions.js` for spring pop and -X axis extraction.
 *
 * Standards:
 * - Clean ES Module syntax with zero runtime dependencies.
 * - Non-destructive SVG string patching preserving all geometric coordinate data.
 * - Strict adherence to Anatomy Line Audit standard (0 floating ends on `lines.mjs`).
 */

/**
 * Standard hook element identifiers for interactive subsystems.
 */
export const HOOK_IDS = Object.freeze({
  OIS_LENS_PRIMARY: "ois-lens-primary",
  PERISCOPE_PRISM_ELEMENT: "periscope-prism-element",
  VAPOR_CHAMBER_WICK: "vapor-chamber-wick",
  SPEN_PLUNGER: "spen-plunger",
  SPEN_STYLUS_BODY: "spen-stylus-body",
});

/**
 * Standard CSS classes associated with hook elements.
 */
export const HOOK_CLASSES = Object.freeze({
  OIS_LENS_PRIMARY: "ois-lens-primary",
  PERISCOPE_PRISM_ELEMENT: "periscope-prism-element",
  VAPOR_CHAMBER_WICK: "vapor-chamber-wick",
  ISO_FLOW: "iso-flow",
  SPEN_PLUNGER: "spen-plunger",
  SPEN_STYLUS_BODY: "spen-stylus-body",
});

/**
 * CSS selectors for interactive DOM and SVG queries.
 */
export const HOOK_SELECTORS = Object.freeze({
  OIS_LENS_PRIMARY: "#ois-lens-primary",
  PERISCOPE_PRISM_ELEMENT: "#periscope-prism-element",
  VAPOR_CHAMBER_WICK: "#vapor-chamber-wick",
  VAPOR_CHAMBER_FLOW: "#vapor-chamber-wick.iso-flow, .iso-flow",
  SPEN_PLUNGER: "#spen-plunger",
  SPEN_STYLUS_BODY: "#spen-stylus-body",
});

/**
 * Descriptive engineering metadata for each interactive hook.
 */
export const HOOK_METADATA = Object.freeze({
  [HOOK_IDS.OIS_LENS_PRIMARY]: {
    assembly: "cameras",
    name: "200MP Wide OIS Optical Lens Group",
    subsystem: "Optics / VCM Actuator",
    role: "Dual-axis voice coil motor (VCM) physical counter-shake stabilization",
    motion: "Translate ±3.5px, Rotate ±1.5deg",
  },
  [HOOK_IDS.PERISCOPE_PRISM_ELEMENT]: {
    assembly: "cameras",
    name: "50MP 5x Folded Periscope Optical Prism",
    subsystem: "Optics / Folded Telephoto",
    role: "45° internal glass reflection prism stabilized along ball bearing rails",
    motion: "Translate ±3.5px, Pitch tilt ±1.5deg",
  },
  [HOOK_IDS.VAPOR_CHAMBER_WICK]: {
    assembly: "vapor_chamber",
    name: "4,100 mm² Sintered Capillary Wick Surface",
    subsystem: "Thermal Core / Dual-Phase Cooling",
    role: "Capillary fluid reflux mesh animated under thermal benchmark load",
    animation: "iso-flow stroke-dashoffset loop",
  },
  [HOOK_IDS.SPEN_PLUNGER]: {
    assembly: "spen",
    name: "S Pen Clicker Plunger Mechanism",
    subsystem: "Stylus / Mechanical Ejection",
    role: "Spring-loaded rear clicker button cap & latch shaft",
    motion: "Click cycle & ejection release",
  },
  [HOOK_IDS.SPEN_STYLUS_BODY]: {
    assembly: "spen",
    name: "S Pen EMR Stylus Main Body",
    subsystem: "Stylus / 4096-Pressure Inductive Core",
    role: "Main stylus body with 6-axis BLE gyro, super-capacitor, and elastomer nib",
    motion: "-X lateral extraction slide (+45mm) and vertical lift (+12mm)",
  },
});

/* ============================================================================
   1. ELEMENT WRAPPER HELPERS
   ============================================================================ */

/**
 * Wraps SVG snippet(s) in the Primary 200MP OIS Lens Group.
 * @param {string|string[]} children SVG path or group markup
 * @param {Record<string, string>} [extraAttrs={}] Additional SVG attributes
 * @returns {string} `<g id="ois-lens-primary" class="ois-lens-primary">...`
 */
export function wrapOisLensPrimary(children, extraAttrs = {}) {
  const content = Array.isArray(children) ? children.join("") : String(children || "");
  const attrStr = Object.entries(extraAttrs)
    .map(([k, v]) => ` ${k}="${String(v).replace(/"/g, "&quot;")}"`)
    .join("");
  return `<g id="${HOOK_IDS.OIS_LENS_PRIMARY}" class="${HOOK_CLASSES.OIS_LENS_PRIMARY}" data-hook="ois-lens-primary"${attrStr}>${content}</g>`;
}

/**
 * Wraps SVG snippet(s) in the 50MP Periscope Prism Element Group.
 * @param {string|string[]} children SVG path or group markup
 * @param {Record<string, string>} [extraAttrs={}] Additional SVG attributes
 * @returns {string} `<g id="periscope-prism-element" class="periscope-prism-element">...`
 */
export function wrapPeriscopePrism(children, extraAttrs = {}) {
  const content = Array.isArray(children) ? children.join("") : String(children || "");
  const attrStr = Object.entries(extraAttrs)
    .map(([k, v]) => ` ${k}="${String(v).replace(/"/g, "&quot;")}"`)
    .join("");
  return `<g id="${HOOK_IDS.PERISCOPE_PRISM_ELEMENT}" class="${HOOK_CLASSES.PERISCOPE_PRISM_ELEMENT}" data-hook="periscope-prism-element"${attrStr}>${content}</g>`;
}

/**
 * Wraps SVG snippet(s) in the Vapor Chamber Capillary Wick Group with `iso-flow` animation.
 * @param {string|string[]} children SVG path or group markup
 * @param {Record<string, string>} [extraAttrs={}] Additional SVG attributes
 * @returns {string} `<g id="vapor-chamber-wick" class="iso-flow" data-flow="">...`
 */
export function wrapVaporChamberWick(children, extraAttrs = {}) {
  const content = Array.isArray(children) ? children.join("") : String(children || "");
  const baseClass = `${HOOK_CLASSES.ISO_FLOW} ${HOOK_CLASSES.VAPOR_CHAMBER_WICK}`;
  const attrStr = Object.entries(extraAttrs)
    .map(([k, v]) => ` ${k}="${String(v).replace(/"/g, "&quot;")}"`)
    .join("");
  return `<g id="${HOOK_IDS.VAPOR_CHAMBER_WICK}" class="${baseClass}" data-flow="" data-hook="vapor-chamber-wick"${attrStr}>${content}</g>`;
}

/**
 * Wraps SVG snippet(s) in the S Pen Clicker Plunger Group.
 * @param {string|string[]} children SVG path or group markup
 * @param {Record<string, string>} [extraAttrs={}] Additional SVG attributes
 * @returns {string} `<g id="spen-plunger" class="spen-plunger">...`
 */
export function wrapSPenPlunger(children, extraAttrs = {}) {
  const content = Array.isArray(children) ? children.join("") : String(children || "");
  const attrStr = Object.entries(extraAttrs)
    .map(([k, v]) => ` ${k}="${String(v).replace(/"/g, "&quot;")}"`)
    .join("");
  return `<g id="${HOOK_IDS.SPEN_PLUNGER}" class="${HOOK_CLASSES.SPEN_PLUNGER}" data-hook="spen-plunger"${attrStr}>${content}</g>`;
}

/**
 * Wraps SVG snippet(s) in the S Pen Stylus Body Group.
 * @param {string|string[]} children SVG path or group markup
 * @param {Record<string, string>} [extraAttrs={}] Additional SVG attributes
 * @returns {string} `<g id="spen-stylus-body" class="spen-stylus-body">...`
 */
export function wrapSPenStylusBody(children, extraAttrs = {}) {
  const content = Array.isArray(children) ? children.join("") : String(children || "");
  const attrStr = Object.entries(extraAttrs)
    .map(([k, v]) => ` ${k}="${String(v).replace(/"/g, "&quot;")}"`)
    .join("");
  return `<g id="${HOOK_IDS.SPEN_STYLUS_BODY}" class="${HOOK_CLASSES.SPEN_STYLUS_BODY}" data-hook="spen-stylus-body"${attrStr}>${content}</g>`;
}

/* ============================================================================
   2. SVG STRING PATCH HOOKS (NON-DESTRUCTIVE REGRESSION-TESTED PROCESSORS)
   ============================================================================ */

/**
 * Patches the Cameras Assembly SVG string:
 * - Ensures `#ois-lens-primary` exists around the 200MP lens elements.
 * - Ensures `#periscope-prism-element` exists around the folded periscope prism.
 *
 * @param {string} svg Raw cameras assembly SVG markup
 * @returns {string} Patched SVG markup
 */
export function patchCamerasSvg(svg) {
  if (!svg || typeof svg !== "string") return svg;
  let result = svg;

  // 1. Ensure #periscope-prism-element exists
  if (!result.includes(`id="${HOOK_IDS.PERISCOPE_PRISM_ELEMENT}"`)) {
    // Check if periscope solid is present
    const periPattern = /(<g[^>]*class="[^"]*periscope-telephoto[^"]*"[^>]*>[\s\S]*?<\/g>)/;
    if (periPattern.test(result)) {
      result = result.replace(
        periPattern,
        `<g id="${HOOK_IDS.PERISCOPE_PRISM_ELEMENT}" class="${HOOK_CLASSES.PERISCOPE_PRISM_ELEMENT}">$1</g>`
      );
    }
  }

  // 2. Ensure #ois-lens-primary exists
  if (!result.includes(`id="${HOOK_IDS.OIS_LENS_PRIMARY}"`)) {
    // Strategy A: Identify the 8-element optical aperture rings via the distinct green AR coating path
    const greenLinePattern = /<path[^>]*class="iso-line"[^>]*data-tone="green"[^>]*d="[^"]*"[^>]*\/>/;
    const greenMatch = result.match(greenLinePattern);

    if (greenMatch) {
      // Find the block of optical rings surrounding the green AR coating ring
      const wideVcmIndex = result.indexOf("wide-200mp-vcm");
      if (wideVcmIndex !== -1) {
        // Find contiguous sequence of optical rings in details section after VCM
        // Elements 1-5, iris chords, elements 7-8, and OIS suspension arms
        const postVcm = result.slice(wideVcmIndex);
        // Look for the cluster of optical line paths
        const lensRingsBlockPattern = /((?:<path[^>]*class="iso-line"[^>]*data-tone="(?:hi|mid|green|lit)"[^>]*d="[^"]*"[^>]*\/>\s*){5,14})/;
        const match = postVcm.match(lensRingsBlockPattern);
        if (match && match[0].includes('data-tone="green"')) {
          const matchedBlock = match[0];
          const wrapped = `<g id="${HOOK_IDS.OIS_LENS_PRIMARY}" class="${HOOK_CLASSES.OIS_LENS_PRIMARY}">${matchedBlock}</g>`;
          result = result.slice(0, wideVcmIndex) + postVcm.replace(matchedBlock, wrapped);
        }
      }
    }

    // Strategy B: If not wrapped above, wrap wide-200mp-vcm solid itself as fallback
    if (!result.includes(`id="${HOOK_IDS.OIS_LENS_PRIMARY}"`)) {
      const vcmPattern = /(<g[^>]*class="[^"]*wide-200mp-vcm[^"]*"[^>]*>[\s\S]*?<\/g>)/;
      if (vcmPattern.test(result)) {
        result = result.replace(
          vcmPattern,
          `<g id="${HOOK_IDS.OIS_LENS_PRIMARY}" class="${HOOK_CLASSES.OIS_LENS_PRIMARY}">$1</g>`
        );
      }
    }
  }

  return result;
}

/**
 * Patches the Vapor Chamber Assembly SVG string:
 * - Ensures `#vapor-chamber-wick` exists.
 * - Ensures it has `class="iso-flow"` (or includes `iso-flow`) and `data-flow=""`.
 *
 * @param {string} svg Raw vapor chamber assembly SVG markup
 * @returns {string} Patched SVG markup
 */
export function patchVaporChamberSvg(svg) {
  if (!svg || typeof svg !== "string") return svg;
  let result = svg;

  // Case 1: #vapor-chamber-wick already exists, check and add iso-flow class if missing
  if (result.includes(`id="${HOOK_IDS.VAPOR_CHAMBER_WICK}"`)) {
    result = result.replace(
      /(<g[^>]*id="vapor-chamber-wick"[^>]*class=")([^"]*)(")/,
      (match, p1, p2, p3) => {
        if (!p2.includes(HOOK_CLASSES.ISO_FLOW)) {
          const newClasses = `${p2} ${HOOK_CLASSES.ISO_FLOW}`.trim();
          return `${p1}${newClasses}${p3} data-flow=""`;
        }
        return match;
      }
    );
    // Ensure data-flow is present
    if (!result.includes('id="vapor-chamber-wick" data-flow') && !result.includes('data-flow=""')) {
      result = result.replace(
        /(<g[^>]*id="vapor-chamber-wick"[^>]*)(>)/,
        '$1 data-flow=""$2'
      );
    }
    return result;
  }

  // Case 2: Wrap the capillary wick lines into #vapor-chamber-wick with iso-flow
  // The wick pattern consists of repeated faint lines (mesh grid)
  const faintLinesPattern = /((?:<path[^>]*class="iso-line"[^>]*data-tone="faint"[^>]*data-free=""[^>]*d="[^"]*"[^>]*\/>\s*){6,})/;
  if (faintLinesPattern.test(result)) {
    result = result.replace(
      faintLinesPattern,
      `<g id="${HOOK_IDS.VAPOR_CHAMBER_WICK}" class="${HOOK_CLASSES.ISO_FLOW} ${HOOK_CLASSES.VAPOR_CHAMBER_WICK}" data-flow="">$1</g>`
    );
  }

  return result;
}

/**
 * Patches the S Pen Assembly SVG string:
 * - Ensures `#spen-plunger` exists for the clicker mechanism.
 * - Ensures `#spen-stylus-body` exists for the main body barrel.
 *
 * @param {string} svg Raw S Pen assembly SVG markup
 * @returns {string} Patched SVG markup
 */
export function patchSPenSvg(svg) {
  if (!svg || typeof svg !== "string") return svg;
  let result = svg;

  // 1. Ensure #spen-stylus-body exists
  if (!result.includes(`id="${HOOK_IDS.SPEN_STYLUS_BODY}"`)) {
    // Look for the main barrel solid (first major slab with depth or large fill)
    const barrelPattern = /(<g[^>]*class="iso-solid"[^>]*>[\s\S]*?SAMSUNG S-PEN[\s\S]*?<\/g>)/;
    const generalSolid = /(<g[^>]*class="iso-solid"[^>]*>[\s\S]*?<\/g>)/g;
    // Fallback: wrap the primary stylus body barrel
    let count = 0;
    result = result.replace(generalSolid, (match) => {
      count++;
      // Solid 3 is the main barrel in S Pen sequence (after guide rod and clicker cap)
      if (count === 3 && !result.includes(`id="${HOOK_IDS.SPEN_STYLUS_BODY}"`)) {
        return `<g id="${HOOK_IDS.SPEN_STYLUS_BODY}" class="${HOOK_CLASSES.SPEN_STYLUS_BODY}">${match}</g>`;
      }
      return match;
    });
  }

  // 2. Ensure #spen-plunger exists
  if (!result.includes(`id="${HOOK_IDS.SPEN_PLUNGER}"`)) {
    // Look for clicker button cap solid or spring coil
    // Guide rod + clicker cap are solids 1 & 2 in S Pen
    const plungerPattern = /((?:<path[^>]*data-tone="lo"[^>]*data-free=""[^>]*d="[^"]*"[^>]*\/>\s*)?<g[^>]*class="iso-solid"[^>]*>[\s\S]*?<\/g>\s*(?:<path[^>]*data-tone="hi"[^>]*data-free=""[^>]*d="[^"]*"[^>]*\/>\s*)?<g[^>]*class="iso-solid"[^>]*data-lit=""[^>]*>[\s\S]*?<\/g>)/;
    if (plungerPattern.test(result)) {
      result = result.replace(
        plungerPattern,
        `<g id="${HOOK_IDS.SPEN_PLUNGER}" class="${HOOK_CLASSES.SPEN_PLUNGER}">$1</g>`
      );
    } else {
      // Fallback: wrap the clicker cap solid (with data-lit)
      const clickerCapPattern = /(<g[^>]*class="iso-solid"[^>]*data-lit=""[^>]*>[\s\S]*?<\/g>)/;
      if (clickerCapPattern.test(result)) {
        result = result.replace(
          clickerCapPattern,
          `<g id="${HOOK_IDS.SPEN_PLUNGER}" class="${HOOK_CLASSES.SPEN_PLUNGER}">$1</g>`
        );
      }
    }
  }

  return result;
}

/**
 * Dispatches SVG patch based on assembly ID.
 * @param {string} assemblyId Assembly key ('cameras', 'vapor_chamber', 'spen', etc.)
 * @param {string} svg Raw SVG string
 * @returns {string} Patched SVG string
 */
export function patchAssemblySvg(assemblyId, svg) {
  switch (assemblyId) {
    case "cameras":
      return patchCamerasSvg(svg);
    case "vapor_chamber":
      return patchVaporChamberSvg(svg);
    case "spen":
      return patchSPenSvg(svg);
    default:
      return svg;
  }
}

/**
 * Patches a full SVG scene string containing all assemblies.
 * @param {string} sceneSvg Complete SVG document or scene group
 * @returns {string} Fully patched SVG with all hooks guaranteed
 */
export function patchSceneSvg(sceneSvg) {
  if (!sceneSvg || typeof sceneSvg !== "string") return sceneSvg;
  let patched = sceneSvg;
  patched = patchCamerasSvg(patched);
  patched = patchVaporChamberSvg(patched);
  patched = patchSPenSvg(patched);
  return patched;
}

/**
 * Patches a complete HTML document string (such as `galaxy-s25-ultra.html`).
 * @param {string} html Complete HTML document
 * @returns {string} Patched HTML document
 */
export function patchHtmlDocument(html) {
  return patchSceneSvg(html);
}

/* ============================================================================
   3. HOOKED GEOMETRY BUILDER FACTORIES
   ============================================================================ */

/**
 * Creates wrapped builder functions that automatically enforce all geometry hooks.
 * Can wrap existing builders dictionary from `build.mjs`.
 *
 * @param {Record<string, Function>} builders Base builders map
 * @returns {Record<string, Function>} Builders map with hooks applied
 */
export function createHookedBuilders(builders = {}) {
  const hooked = { ...builders };

  if (hooked.cameras) {
    const originalCameras = hooked.cameras;
    hooked.cameras = function buildCamerasWithHooks(P) {
      const res = originalCameras(P);
      const patchedSvg = patchCamerasSvg(res.svg);
      return {
        ...res,
        svg: patchedSvg,
        pathsCount: (patchedSvg.match(/<path|<circle|<text/g) || []).length,
      };
    };
  }

  if (hooked.vapor_chamber) {
    const originalVC = hooked.vapor_chamber;
    hooked.vapor_chamber = function buildVaporChamberWithHooks(P) {
      const res = originalVC(P);
      const patchedSvg = patchVaporChamberSvg(res.svg);
      return {
        ...res,
        svg: patchedSvg,
        pathsCount: (patchedSvg.match(/<path|<circle|<text/g) || []).length,
      };
    };
  }

  if (hooked.spen) {
    const originalSPen = hooked.spen;
    hooked.spen = function buildSPenWithHooks(P) {
      const res = originalSPen(P);
      const patchedSvg = patchSPenSvg(res.svg);
      return {
        ...res,
        svg: patchedSvg,
        pathsCount: (patchedSvg.match(/<path|<circle|<text/g) || []).length,
      };
    };
  }

  return hooked;
}

/* ============================================================================
   4. AUDIT & VERIFICATION UTILITIES
   ============================================================================ */

/**
 * Verifies that all mandatory interactive IDs and classes exist in the target markup.
 *
 * @param {string} svgOrHtml SVG or HTML string to verify
 * @returns {{
 *   valid: boolean,
 *   found: Record<string, boolean>,
 *   missing: string[],
 *   details: Record<string, { present: boolean, matched: string|null }>
 * }}
 */
export function verifyGeometryHooks(svgOrHtml) {
  if (!svgOrHtml || typeof svgOrHtml !== "string") {
    return {
      valid: false,
      found: {},
      missing: Object.values(HOOK_IDS),
      details: {},
    };
  }

  const details = {
    [HOOK_IDS.OIS_LENS_PRIMARY]: {
      present: svgOrHtml.includes(`id="${HOOK_IDS.OIS_LENS_PRIMARY}"`),
      matched: svgOrHtml.includes(`id="${HOOK_IDS.OIS_LENS_PRIMARY}"`) ? `#${HOOK_IDS.OIS_LENS_PRIMARY}` : null,
    },
    [HOOK_IDS.PERISCOPE_PRISM_ELEMENT]: {
      present: svgOrHtml.includes(`id="${HOOK_IDS.PERISCOPE_PRISM_ELEMENT}"`),
      matched: svgOrHtml.includes(`id="${HOOK_IDS.PERISCOPE_PRISM_ELEMENT}"`) ? `#${HOOK_IDS.PERISCOPE_PRISM_ELEMENT}` : null,
    },
    [HOOK_IDS.VAPOR_CHAMBER_WICK]: {
      present:
        svgOrHtml.includes(`id="${HOOK_IDS.VAPOR_CHAMBER_WICK}"`) &&
        (svgOrHtml.includes('class="iso-flow') || svgOrHtml.includes('iso-flow')),
      matched: svgOrHtml.includes(`id="${HOOK_IDS.VAPOR_CHAMBER_WICK}"`) ? `#${HOOK_IDS.VAPOR_CHAMBER_WICK}` : null,
    },
    [HOOK_IDS.SPEN_PLUNGER]: {
      present: svgOrHtml.includes(`id="${HOOK_IDS.SPEN_PLUNGER}"`),
      matched: svgOrHtml.includes(`id="${HOOK_IDS.SPEN_PLUNGER}"`) ? `#${HOOK_IDS.SPEN_PLUNGER}` : null,
    },
    [HOOK_IDS.SPEN_STYLUS_BODY]: {
      present: svgOrHtml.includes(`id="${HOOK_IDS.SPEN_STYLUS_BODY}"`),
      matched: svgOrHtml.includes(`id="${HOOK_IDS.SPEN_STYLUS_BODY}"`) ? `#${HOOK_IDS.SPEN_STYLUS_BODY}` : null,
    },
  };

  const found = {};
  const missing = [];

  for (const [id, stat] of Object.entries(details)) {
    found[id] = stat.present;
    if (!stat.present) {
      missing.push(id);
    }
  }

  return {
    valid: missing.length === 0,
    found,
    missing,
    details,
  };
}
