/**
 * Samsung Galaxy S25 Ultra — Cinematic SVG Camera Animator
 * 
 * Provides smooth spring-damped physics interpolation across dynamic SVG `viewBox` coordinates [x, y, w, h].
 * Enables cinematic camera panning and zooming into microscopic subsystem regions:
 * - overview: [0, 0, 1100, 960] (full teardown figure at 1.0x native view)
 * - soc: [480, 290, 420, 360] (2.6x zoom on Qualcomm Snapdragon 8 Elite die and motherboard)
 * - optics: [440, 160, 400, 340] (2.4x zoom on 200MP wide lens and 5x folded periscope prism)
 * - thermal: [410, 370, 460, 390] (2.2x zoom on 4,100 mm² vapor chamber and battery)
 * - spen: [150, 480, 440, 380] (2.3x zoom on S Pen silo and extraction mechanism)
 */

export const CAMERA_PRESETS = {
  overview: [0, 0, 1100, 960],
  soc: [290, 460, 520, 450],
  optics: [260, 410, 500, 440],
  thermal: [320, 475, 540, 460],
  spen: [250, 390, 520, 440],
};

export const PRESET_METADATA = {
  overview: {
    id: "overview",
    name: "Teardown Overview",
    badge: "MACRO 1.0×",
    description: "Full exploded engineering model on inspection metrology bench",
    zoom: "1.0×",
    viewBox: [0, 0, 1100, 960],
  },
  soc: {
    id: "soc",
    name: "Snapdragon 8 Elite",
    badge: "SILICON 2.4×",
    description: "3nm N3E Qualcomm application processor, LPDDR5X POP memory, and PMIC array",
    zoom: "2.4×",
    viewBox: [290, 460, 520, 450],
  },
  optics: {
    id: "optics",
    name: "Quad Optics System",
    badge: "OPTICS 2.5×",
    description: "200MP HP2 wide lens with ±3° OIS and 50MP 5× folded periscope optical prism",
    zoom: "2.5×",
    viewBox: [260, 410, 500, 440],
  },
  thermal: {
    id: "thermal",
    name: "Vapor Chamber Core",
    badge: "THERMAL 2.3×",
    description: "4,100 mm² liquid vapor chamber with sintered capillary copper wick and 5000 mAh cell",
    zoom: "2.3×",
    viewBox: [320, 475, 540, 460],
  },
  spen: {
    id: "spen",
    name: "S Pen Bay & Silo",
    badge: "MECHANICAL 2.4×",
    description: "Inductive charging dock, ejector latch, 4096-level pressure stylus nib",
    zoom: "2.4×",
    viewBox: [250, 390, 520, 440],
  },
};

export class CinematicCamera {
  /**
   * @param {Object} [options]
   * @param {string} [options.initialPreset='overview'] Starting preset name
   * @param {number} [options.stiffness=220] Spring stiffness (higher = faster snap)
   * @param {number} [options.damping=28] Damping coefficient (critically damped ~ 2 * sqrt(k))
   * @param {number} [options.precision=0.08] Positional convergence threshold
   * @param {number} [options.velocityThreshold=0.15] Velocity convergence threshold
   * @param {Object<string, number[]>} [options.presets] Custom presets to merge
   */
  constructor(options = {}) {
    this.presets = { ...CAMERA_PRESETS, ...(options.presets || {}) };

    this.stiffness = typeof options.stiffness === "number" ? options.stiffness : 220;
    this.damping = typeof options.damping === "number" ? options.damping : 28;
    this.precision = typeof options.precision === "number" ? options.precision : 0.08;
    this.velocityThreshold = typeof options.velocityThreshold === "number" ? options.velocityThreshold : 0.15;

    const startPreset = options.initialPreset && this.presets[options.initialPreset] ? options.initialPreset : "overview";
    const startBox = this.presets[startPreset] || CAMERA_PRESETS.overview;

    this.currentPreset = startPreset;
    this.current = [startBox[0], startBox[1], startBox[2], startBox[3]];
    this.target = [startBox[0], startBox[1], startBox[2], startBox[3]];
    this.velocity = [0, 0, 0, 0];
    this.settled = true;

    this._lastTimestamp = null;
    this._listeners = new Set();
  }

  /**
   * Transition camera target to a named preset or explicit [x, y, w, h] coordinates.
   * @param {string|number[]} presetName Preset key ('overview', 'soc', 'optics', 'thermal', 'spen') or [x, y, w, h]
   * @param {Object} [opts]
   * @param {boolean} [opts.immediate=false] Snap instantly without spring physics
   * @returns {boolean} True if preset was valid and set
   */
  setCameraPreset(presetName, { immediate = false } = {}) {
    let targetCoords = null;
    let resolvedName = presetName;

    if (typeof presetName === "string" && this.presets[presetName]) {
      targetCoords = this.presets[presetName];
      resolvedName = presetName;
    } else if (Array.isArray(presetName) && presetName.length === 4) {
      targetCoords = presetName;
      resolvedName = "custom";
    } else if (presetName && typeof presetName === "object" && "x" in presetName) {
      targetCoords = [presetName.x, presetName.y, presetName.w, presetName.h];
      resolvedName = "custom";
    } else {
      console.warn(`[CinematicCamera] Unknown camera preset: "${presetName}". Available:`, Object.keys(this.presets));
      return false;
    }

    this.currentPreset = resolvedName;
    this.target = [targetCoords[0], targetCoords[1], targetCoords[2], targetCoords[3]];

    if (immediate) {
      this.current = [...this.target];
      this.velocity = [0, 0, 0, 0];
      this.settled = true;
      this._emitChange();
    } else {
      // Check if target differs from current beyond threshold
      const differs = this.current.some((val, i) => Math.abs(val - this.target[i]) > this.precision);
      if (differs) {
        this.settled = false;
        this._lastTimestamp = null;
      }
    }

    return true;
  }

  /**
   * Get the current active camera preset identifier.
   * @returns {string} Preset name (e.g., 'overview', 'soc', 'optics', 'thermal', 'spen', or 'custom')
   */
  getCameraPreset() {
    return this.currentPreset;
  }

  /**
   * Advance the camera spring simulation and apply updated viewBox to SVG element.
   * Safe to call on every requestAnimationFrame loop.
   * @param {SVGElement|string|null} [svgEl] SVG element or query selector string
   * @param {number} [customDt] Optional delta time in seconds or ms
   * @returns {boolean} True if the camera has settled at its target
   */
  tickCamera(svgEl, customDt) {
    let dt = customDt;

    if (typeof dt !== "number" || dt <= 0) {
      const now = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
      if (this._lastTimestamp === null) {
        this._lastTimestamp = now;
        dt = 1 / 60;
      } else {
        dt = (now - this._lastTimestamp) / 1000;
        this._lastTimestamp = now;
      }
    } else if (dt > 1) {
      // Milliseconds passed (e.g. 16.6ms), convert to seconds
      dt = dt / 1000;
    }

    // Protect against spiral of death during background tab throttling or stutter
    dt = Math.max(0.001, Math.min(dt, 0.05));

    if (this.settled) {
      this._applyToSvg(svgEl);
      return true;
    }

    // 4-step numerical sub-stepping for smooth, stable spring integration
    const subSteps = 4;
    const subDt = dt / subSteps;

    for (let step = 0; step < subSteps; step++) {
      for (let i = 0; i < 4; i++) {
        const displacement = this.current[i] - this.target[i];
        const springForce = -this.stiffness * displacement;
        const dampingForce = -this.damping * this.velocity[i];
        const acceleration = springForce + dampingForce;

        this.velocity[i] += acceleration * subDt;
        this.current[i] += this.velocity[i] * subDt;
      }
    }

    // Convergence check
    let allSettled = true;
    for (let i = 0; i < 4; i++) {
      const dist = Math.abs(this.current[i] - this.target[i]);
      const speed = Math.abs(this.velocity[i]);
      if (dist > this.precision || speed > this.velocityThreshold) {
        allSettled = false;
        break;
      }
    }

    if (allSettled) {
      for (let i = 0; i < 4; i++) {
        this.current[i] = this.target[i];
        this.velocity[i] = 0;
      }
      this.settled = true;
    }

    this._applyToSvg(svgEl);
    this._emitChange();

    return this.settled;
  }

  /**
   * Internal helper to apply current viewBox to SVG DOM node
   * @private
   */
  _applyToSvg(svgEl) {
    if (!svgEl) return;
    let target = svgEl;
    if (typeof svgEl === "string" && typeof document !== "undefined") {
      target = document.querySelector(svgEl);
    }
    if (target && typeof target.setAttribute === "function") {
      const vb = `${this.current[0].toFixed(2)} ${this.current[1].toFixed(2)} ${this.current[2].toFixed(2)} ${this.current[3].toFixed(2)}`;
      target.setAttribute("viewBox", vb);
    }
  }

  /**
   * Get current interpolated [x, y, w, h] values.
   * @returns {number[]}
   */
  getViewBox() {
    return [...this.current];
  }

  /**
   * Get current formatted viewBox string.
   * @returns {string}
   */
  getViewBoxString() {
    return `${this.current[0].toFixed(2)} ${this.current[1].toFixed(2)} ${this.current[2].toFixed(2)} ${this.current[3].toFixed(2)}`;
  }

  /**
   * Get current target [x, y, w, h] values.
   * @returns {number[]}
   */
  getTargetViewBox() {
    return [...this.target];
  }

  /**
   * Calculate effective zoom magnification relative to the standard 1100x960 overview.
   * @returns {number}
   */
  getZoomMagnification() {
    const baseW = CAMERA_PRESETS.overview[2];
    return Number((baseW / Math.max(1, this.current[2])).toFixed(2));
  }

  /**
   * Returns metadata for the currently active preset.
   * @returns {Object}
   */
  getPresetMetadata() {
    return PRESET_METADATA[this.currentPreset] || {
      id: this.currentPreset,
      name: "Custom View",
      badge: "VIEW",
      description: "Custom framing coordinates",
      zoom: `${this.getZoomMagnification()}×`,
      viewBox: [...this.target],
    };
  }

  /**
   * Check if camera is stationary at target.
   * @returns {boolean}
   */
  isSettled() {
    return this.settled;
  }

  /**
   * Subscribe to camera frame change events.
   * @param {Function} callback (data: { preset, viewBox, settled, zoom }) => void
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    if (typeof callback === "function") {
      this._listeners.add(callback);
    }
    return () => this._listeners.delete(callback);
  }

  /**
   * @private
   */
  _emitChange() {
    if (this._listeners.size === 0) return;
    const payload = {
      preset: this.currentPreset,
      viewBox: [...this.current],
      viewBoxStr: this.getViewBoxString(),
      settled: this.settled,
      zoom: this.getZoomMagnification(),
      metadata: this.getPresetMetadata(),
    };
    for (const fn of this._listeners) {
      try {
        fn(payload);
      } catch (err) {
        console.error("[CinematicCamera] Listener error:", err);
      }
    }
  }
}

// Universal environment exports
if (typeof window !== "undefined") {
  window.CinematicCamera = CinematicCamera;
  window.CAMERA_PRESETS = CAMERA_PRESETS;
  window.PRESET_METADATA = PRESET_METADATA;
}

export default CinematicCamera;
