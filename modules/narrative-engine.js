/**
 * Samsung Galaxy S25 Ultra — Dynamic Editorial Narrative Headline Engine
 * Module: modules/narrative-engine.js
 *
 * Provides dynamic, engineering-grade editorial narrative copy tailored to
 * the 11 physical assemblies and interactive inspection states of the S25 Ultra.
 * Manages headline DOM updates with fluid fade/slide transitions and full accessibility.
 */

// Master registry of editorial states and technical copy
export const NARRATIVE_STATES = {
  assembled: {
    key: "assembled",
    text: "Engineered flush. Grade 5 Titanium exterior meets 3nm Snapdragon compute.",
    lead: "Engineered flush.",
    body: "Grade 5 Titanium exterior meets 3nm Snapdragon compute.",
    kicker: "ASSEMBLED · 8.2 MM · FLUSH",
    subsystemIndex: -1,
    aliases: ["assembled", "assemble", "rest", "flush", "closed", "default", "overview"],
  },
  exploding: {
    key: "exploding",
    text: "Take it apart. One slider, 11 surgical assemblies.",
    lead: "Take it apart.",
    body: "One slider, 11 surgical assemblies.",
    kicker: "EXPLODED VIEW · 11 ASSEMBLIES",
    subsystemIndex: -1,
    aliases: [
      "exploding",
      "explode",
      "exploded",
      "separation",
      "inspect",
      "inspection",
      "subsystems",
      "open",
    ],
  },
  cameras: {
    key: "cameras",
    text: "The cameras stabilize with you. ISOCELL HP2 200MP wide & 5× folded periscope.",
    lead: "The cameras stabilize with you.",
    body: "ISOCELL HP2 200MP wide & 5× folded periscope.",
    kicker: "08 · OPTOELECTRONICS · 200MP OIS",
    subsystemIndex: 8,
    aliases: [
      "cameras",
      "camera",
      "optics",
      "optics view",
      "camera isolated",
      "camera_isolated",
      "cameras isolated",
      "quad cameras",
      "periscope",
      "08",
      8,
    ],
  },
  motherboard: {
    key: "motherboard",
    text: "Snapdragon 8 Elite for Galaxy. 3nm N3E compute with 16GB PoP RAM.",
    lead: "Snapdragon 8 Elite for Galaxy.",
    body: "3nm N3E compute with 16GB PoP RAM.",
    kicker: "06 · SYSTEM COMPUTE · 3NM N3E",
    subsystemIndex: 6,
    aliases: [
      "motherboard",
      "soc",
      "soc view",
      "motherboard isolated",
      "motherboard_isolated",
      "logic_board",
      "logic board",
      "snapdragon",
      "cpu",
      "06",
      6,
    ],
  },
  vapor_chamber: {
    key: "vapor_chamber",
    text: "4,100 mm² liquid vapor chamber. Capillary wick cooling at >5,000 W/m·K.",
    lead: "4,100 mm² liquid vapor chamber.",
    body: "Capillary wick cooling at >5,000 W/m·K.",
    kicker: "03 · THERMAL CORE · 4,100 MM²",
    subsystemIndex: 3,
    aliases: [
      "vapor_chamber",
      "vapor chamber",
      "thermal",
      "thermal view",
      "cooling",
      "vapor chamber isolated",
      "vapor_chamber_isolated",
      "heatsink",
      "03",
      3,
    ],
  },
  battery: {
    key: "battery",
    text: "5,000 mAh dual-tab pouch cell. Low-impedance 45W PPS fast charging.",
    lead: "5,000 mAh dual-tab pouch cell.",
    body: "Low-impedance 45W PPS fast charging.",
    kicker: "04 · POWER CELL · 5,000 MAH",
    subsystemIndex: 4,
    aliases: [
      "battery",
      "battery isolated",
      "battery_isolated",
      "power",
      "cell",
      "power cell",
      "04",
      4,
    ],
  },
  spen: {
    key: "spen",
    text: "Wacom 0.3mm active EMR digitizer. 4,096 pressure levels with inductive dock.",
    lead: "Wacom 0.3mm active EMR digitizer.",
    body: "4,096 pressure levels with inductive dock.",
    kicker: "05 · STYLUS SYSTEM · EMR DIGITIZER",
    subsystemIndex: 5,
    aliases: [
      "spen",
      "s pen",
      "s-pen",
      "spen isolated",
      "spen_isolated",
      "s pen isolated",
      "ejected",
      "s pen ejected",
      "spen ejected",
      "stylus",
      "05",
      5,
    ],
  },
  display: {
    key: "display",
    text: "Corning Gorilla Armor. 75% anti-reflective Dynamic AMOLED 2X.",
    lead: "Corning Gorilla Armor.",
    body: "75% anti-reflective Dynamic AMOLED 2X.",
    kicker: "01 · OPTICAL & TOUCH · DYNAMIC AMOLED 2X",
    subsystemIndex: 1,
    aliases: [
      "display",
      "display isolated",
      "display_isolated",
      "screen",
      "amoled",
      "panel",
      "gorilla armor",
      "01",
      1,
    ],
  },
  chassis: {
    key: "chassis",
    text: "Ti-6Al-4V Grade 5 Titanium outer band bonded to 6013 aluminum sub-chassis.",
    lead: "Ti-6Al-4V Grade 5 Titanium outer band",
    body: "bonded to 6013 aluminum sub-chassis.",
    kicker: "02 · STRUCTURE · GRADE 5 TITANIUM",
    subsystemIndex: 2,
    aliases: [
      "chassis",
      "chassis isolated",
      "chassis_isolated",
      "frame",
      "frame isolated",
      "titanium",
      "midframe",
      "02",
      2,
    ],
  },
  sub_board: {
    key: "sub_board",
    text: "USB-C 3.2 daughterboard with dual MEMS microphones & linear resonant haptics.",
    lead: "USB-C 3.2 daughterboard.",
    body: "Dual MEMS microphones & linear resonant haptics.",
    kicker: "07 · DAUGHTERBOARD · USB 3.2 & HAPTICS",
    subsystemIndex: 7,
    aliases: ["sub_board", "sub board", "io", "i/o", "haptics", "subboard", "07", 7],
  },
  wireless_coil: {
    key: "wireless_coil",
    text: "Pure copper Archimedean Qi2 induction coil with spatial UWB & NFC loop.",
    lead: "Pure copper Archimedean Qi2 induction coil.",
    body: "Integrated spatial UWB antenna and NFC perimeter loop.",
    kicker: "09 · INDUCTION & RF · 15W QI2",
    subsystemIndex: 9,
    aliases: ["wireless_coil", "wireless coil", "wireless", "induction", "qi2", "nfc", "uwb", "09", 9],
  },
  back_glass: {
    key: "back_glass",
    text: "Satin frosted Gorilla Glass Victus 2 with 4 Grade 5 Titanium lens bezels.",
    lead: "Satin frosted Gorilla Glass Victus 2.",
    body: "4 Grade 5 Titanium lens bezels & die-cut IP68 silicone gasket.",
    kicker: "10 · ENCLOSURE · GORILLA GLASS VICTUS 2",
    subsystemIndex: 10,
    aliases: ["back_glass", "back glass", "rear", "victus", "rear glass", "enclosure", "10", 10],
  },
  fixture: {
    key: "fixture",
    text: "Cleanroom optical metrology bench with millimeter calibration and Delrin polymer clamps.",
    lead: "Cleanroom optical metrology bench.",
    body: "Millimeter calibration ruler with 4 Delrin polymer locking jaws.",
    kicker: "00 · METROLOGY BED · 6061-T6 AL",
    subsystemIndex: 0,
    aliases: ["fixture", "bench", "metrology", "inspection bench", "cleanroom", "00", 0],
  },
};

// State Resolution Helper
export function resolveState(input) {
  if (input === null || input === undefined) {
    return NARRATIVE_STATES.assembled;
  }

  // Direct boolean handling
  if (typeof input === "boolean") {
    return input ? NARRATIVE_STATES.exploding : NARRATIVE_STATES.assembled;
  }

  // Numeric index handling (matches subsystem 0-10)
  if (typeof input === "number") {
    const found = Object.values(NARRATIVE_STATES).find((s) => s.subsystemIndex === input);
    return found || NARRATIVE_STATES.assembled;
  }

  // String identifier handling
  if (typeof input === "string") {
    const raw = input.trim().toLowerCase();
    if (!raw) return NARRATIVE_STATES.assembled;

    // Direct key match
    if (NARRATIVE_STATES[raw]) {
      return NARRATIVE_STATES[raw];
    }

    // Normalized alias match
    const normalized = raw.replace(/[_-]+/g, " ");
    for (const state of Object.values(NARRATIVE_STATES)) {
      for (const alias of state.aliases) {
        if (typeof alias === "string" && (alias === raw || alias === normalized)) {
          return state;
        }
      }
    }

    // Keyword heuristics
    if (raw.includes("camera") || raw.includes("optic")) return NARRATIVE_STATES.cameras;
    if (raw.includes("motherboard") || raw.includes("soc") || raw.includes("snapdragon")) return NARRATIVE_STATES.motherboard;
    if (raw.includes("vapor") || raw.includes("thermal") || raw.includes("cooling")) return NARRATIVE_STATES.vapor_chamber;
    if (raw.includes("battery") || raw.includes("pouch")) return NARRATIVE_STATES.battery;
    if (raw.includes("spen") || raw.includes("s pen") || raw.includes("s-pen") || raw.includes("stylus") || raw.includes("eject")) return NARRATIVE_STATES.spen;
    if (raw.includes("display") || raw.includes("amoled") || raw.includes("screen")) return NARRATIVE_STATES.display;
    if (raw.includes("chassis") || raw.includes("titanium") || raw.includes("frame")) return NARRATIVE_STATES.chassis;
    if (raw.includes("sub") || raw.includes("haptic")) return NARRATIVE_STATES.sub_board;
    if (raw.includes("wireless") || raw.includes("coil") || raw.includes("qi2")) return NARRATIVE_STATES.wireless_coil;
    if (raw.includes("back") || raw.includes("victus") || raw.includes("glass")) return NARRATIVE_STATES.back_glass;
    if (raw.includes("bench") || raw.includes("fixture")) return NARRATIVE_STATES.fixture;
    if (raw.includes("explod") || raw.includes("separat")) return NARRATIVE_STATES.exploding;
    if (raw.includes("assembl") || raw.includes("flush")) return NARRATIVE_STATES.assembled;

    return NARRATIVE_STATES.assembled;
  }

  // Object / State telemetry handling
  if (typeof input === "object") {
    // Direct named property
    if (input.state) return resolveState(input.state);
    if (input.view) return resolveState(input.view);
    if (input.mode && typeof input.mode === "string" && input.mode !== "solo" && input.mode !== "stack") {
      return resolveState(input.mode);
    }
    if (input.partId) return resolveState(input.partId);
    if (input.id && typeof input.id === "string") return resolveState(input.id);

    // Ejected stylus check
    if (input.isEjected) {
      return NARRATIVE_STATES.spen;
    }

    // Isolated subsystem check
    if (input.isIsolated) {
      if (typeof input.activeIndex === "number" && input.activeIndex >= 0) {
        return resolveState(input.activeIndex);
      }
      if (typeof input.index === "number" && input.index >= 0) {
        return resolveState(input.index);
      }
      if (input.part) return resolveState(input.part);
    }

    // Subsystem active index without explicit isIsolated flag
    if (typeof input.activeIndex === "number" && input.activeIndex >= 0) {
      return resolveState(input.activeIndex);
    }

    // Explode fraction / slider progress
    const t = input.t ?? input.explode ?? input.separation ?? input.progress ?? input.explodeProgress;
    if (typeof t === "number") {
      const frac = t > 1.0 ? t / 100 : t;
      return frac > 0.05 ? NARRATIVE_STATES.exploding : NARRATIVE_STATES.assembled;
    }

    if (input.isExploded !== undefined) {
      return input.isExploded ? NARRATIVE_STATES.exploding : NARRATIVE_STATES.assembled;
    }
  }

  return NARRATIVE_STATES.assembled;
}

// Injects micro CSS transition styles into the document head
let stylesInjected = false;
export function ensureStyles() {
  if (stylesInjected || typeof document === "undefined") return;
  if (document.getElementById("galaxy-narrative-styles")) {
    stylesInjected = true;
    return;
  }

  const style = document.createElement("style");
  style.id = "galaxy-narrative-styles";
  style.textContent = `
.galaxy-narrative-container {
  position: relative;
  min-height: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.galaxy-narrative-text {
  margin: 0;
  font-family: var(--galaxy-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
  font-size: 15px;
  line-height: 1.5;
  color: var(--anatomy-text, #a3a3a3);
  letter-spacing: -0.005em;
  opacity: 1;
  transform: translateY(0);
  transition: opacity 220ms ease, transform 220ms cubic-bezier(0.16, 1, 0.3, 1);
  will-change: opacity, transform;
}

.galaxy-narrative-text.is-fading-out {
  opacity: 0 !important;
  transform: translateY(-4px) !important;
  transition: opacity 120ms ease, transform 120ms cubic-bezier(0.32, 0.72, 0, 1) !important;
}

.galaxy-narrative-text.is-entering {
  opacity: 0 !important;
  transform: translateY(6px) !important;
  transition: none !important;
}

.galaxy-narrative-lead {
  color: var(--anatomy-strong, #ffffff);
  font-weight: 600;
  letter-spacing: -0.01em;
}

.galaxy-narrative-body {
  color: var(--anatomy-text, #a3a3a3);
  font-weight: 400;
}

@media (prefers-reduced-motion: reduce) {
  .galaxy-narrative-text {
    transition: none !important;
    transform: none !important;
  }
}
  `.trim();

  document.head.appendChild(style);
  stylesInjected = true;
}

function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * NarrativeEngine Class
 * Manages headline copy resolution, DOM updates, and fluid animations.
 */
export class NarrativeEngine {
  constructor(element = null, options = {}) {
    this.options = {
      transitionDuration: 220,
      renderMode: "rich", // "rich" (lead/body spans) | "text" (raw text)
      showKicker: false,
      kickerElement: null,
      ...options,
    };

    this.element = null;
    this.textElement = null;
    this.kickerElement = this.options.kickerElement || null;
    this.currentEntry = NARRATIVE_STATES.assembled;
    this.isTransitioning = false;
    this.pendingState = null;
    this.transitionTimer = null;
    this.listeners = new Set();

    if (element) {
      this.init(element);
    }
  }

  /**
   * Initializes or re-binds the narrative engine to a DOM element.
   * @param {HTMLElement|string} element - DOM element or CSS selector query
   * @param {Object} options - Configuration overrides
   */
  init(element, options = {}) {
    if (options) {
      this.options = { ...this.options, ...options };
    }

    if (typeof element === "string" && typeof document !== "undefined" && typeof document.querySelector === "function") {
      this.element = document.querySelector(element);
    } else if (element && (element.nodeType === 1 || typeof element.appendChild === "function")) {
      this.element = element;
    } else if (!this.element && typeof document !== "undefined" && typeof document.querySelector === "function") {
      this.element =
        document.querySelector("[data-narrative]") ||
        document.querySelector("#narrative-headline") ||
        document.querySelector(".narrative-headline");
    }

    if (!this.element) {
      return this;
    }

    ensureStyles();

    this.element.classList.add("galaxy-narrative-container");
    this.element.setAttribute("role", "region");
    this.element.setAttribute("aria-live", "polite");

    let textNode = this.element.querySelector(".galaxy-narrative-text");
    if (!textNode) {
      textNode = document.createElement("p");
      textNode.className = "galaxy-narrative-text";
      this.element.innerHTML = "";
      this.element.appendChild(textNode);
    }
    this.textElement = textNode;

    // Initial render without animation
    this.renderEntry(this.currentEntry, false);
    return this;
  }

  /**
   * Updates the narrative headline to reflect the provided engineering state.
   * @param {*} state - State identifier, index, or telemetry object
   * @param {boolean} immediate - If true, skip animations
   * @returns {Object} The resolved narrative state entry
   */
  update(state, immediate = false) {
    const entry = resolveState(state);
    if (!entry) return this.currentEntry;

    // Skip if state is already current
    if (this.currentEntry && this.currentEntry.key === entry.key && !immediate) {
      return entry;
    }

    if (this.isTransitioning && !immediate) {
      this.pendingState = state;
      return entry;
    }

    this.currentEntry = entry;
    this.renderEntry(entry, !immediate);
    return entry;
  }

  /**
   * Renders the narrative entry into the DOM with transition states.
   */
  renderEntry(entry, animate = true) {
    if (!this.textElement) {
      this.notify(entry);
      return;
    }

    const { text, kicker, key } = entry;
    if (this.element) {
      this.element.setAttribute("data-narrative-state", key);
      this.element.setAttribute("data-narrative-text", text);
    }

    if (this.kickerElement) {
      this.kickerElement.textContent = kicker;
    }

    if (!animate || prefersReducedMotion()) {
      this.applyDOMContent(entry);
      this.textElement.className = "galaxy-narrative-text";
      this.notify(entry);
      return;
    }

    if (this.transitionTimer) {
      clearTimeout(this.transitionTimer);
      this.transitionTimer = null;
    }

    this.isTransitioning = true;
    const dur = this.options.transitionDuration;
    const halfDur = Math.round(dur * 0.45);

    // Phase 1: Fade out & slide up
    this.textElement.classList.remove("is-entering");
    this.textElement.classList.add("is-fading-out");

    this.transitionTimer = setTimeout(() => {
      // Phase 2: Update content while hidden & reset offset
      this.applyDOMContent(entry);
      this.textElement.classList.remove("is-fading-out");
      this.textElement.classList.add("is-entering");

      // Force reflow
      void this.textElement.offsetHeight;

      // Phase 3: Transition to natural rest
      this.textElement.classList.remove("is-entering");

      this.transitionTimer = setTimeout(() => {
        this.isTransitioning = false;
        this.transitionTimer = null;
        if (this.pendingState) {
          const next = this.pendingState;
          this.pendingState = null;
          this.update(next);
        }
      }, dur);

      this.notify(entry);
    }, halfDur);
  }

  /**
   * Directly sets the lead/body text content in the text node.
   */
  applyDOMContent(entry) {
    if (!this.textElement) return;

    if (this.options.renderMode === "text") {
      this.textElement.textContent = entry.text;
    } else {
      this.textElement.innerHTML = "";
      const leadSpan = document.createElement("span");
      leadSpan.className = "galaxy-narrative-lead";
      leadSpan.textContent = entry.lead + " ";

      const bodySpan = document.createElement("span");
      bodySpan.className = "galaxy-narrative-body";
      bodySpan.textContent = entry.body;

      this.textElement.appendChild(leadSpan);
      this.textElement.appendChild(bodySpan);
    }
  }

  /**
   * Registers a change listener callback.
   */
  subscribe(callback) {
    if (typeof callback === "function") {
      this.listeners.add(callback);
    }
    return () => this.listeners.delete(callback);
  }

  notify(entry) {
    for (const cb of this.listeners) {
      try {
        cb(entry);
      } catch (e) {
        console.error("NarrativeEngine subscriber error:", e);
      }
    }
  }

  getCurrent() {
    return this.currentEntry;
  }

  destroy() {
    if (this.transitionTimer) {
      clearTimeout(this.transitionTimer);
      this.transitionTimer = null;
    }
    this.listeners.clear();
    this.textElement = null;
    this.element = null;
  }
}

// Module-level Singleton
let defaultInstance = null;

export function initNarrative(element, options) {
  if (!defaultInstance) {
    defaultInstance = new NarrativeEngine(element, options);
  } else if (element) {
    defaultInstance.init(element, options);
  }
  return defaultInstance;
}

export function updateNarrative(state, immediate = false) {
  if (!defaultInstance) {
    defaultInstance = new NarrativeEngine();
  }
  return defaultInstance.update(state, immediate);
}

export function getNarrative(state) {
  return resolveState(state);
}

export function getNarrativeText(state) {
  return resolveState(state).text;
}

// Attach static helper methods to NarrativeEngine
NarrativeEngine.initNarrative = initNarrative;
NarrativeEngine.updateNarrative = updateNarrative;
NarrativeEngine.getNarrative = getNarrative;
NarrativeEngine.getNarrativeText = getNarrativeText;
NarrativeEngine.resolveState = resolveState;
NarrativeEngine.NARRATIVE_STATES = NARRATIVE_STATES;

export default NarrativeEngine;

// Browser global exposure
if (typeof window !== "undefined") {
  window.NarrativeEngine = NarrativeEngine;
}
