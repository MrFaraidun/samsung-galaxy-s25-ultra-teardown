/**
 * Samsung Galaxy S25 Ultra — 2-Axis Optical Image Stabilization (OIS) Gyro Tracking Engine
 *
 * Simulates physical dual-axis voice coil motor (VCM) stabilization & periscope prism
 * magnetic levitation rails responsive to pointer gyro and device orientation.
 *
 * Architecture:
 * - Viewport-relative pointer normalization to [-1, 1] with touch & mouse tracking
 * - Realistic spring-damped 2-axis inertia physics (stiffness ~0.12, damping ~0.84)
 * - Counter-acting micro-stabilization transforms: ±3.5px shift & ±1.5deg tilt
 * - Multi-layer stage parallax tilt calculation for exploded assemblies
 * - Zero-allocation update tick loop with O(1) performance
 */

export class OisGyro {
  /**
   * @param {Object} [options]
   * @param {number} [options.stiffness=0.12] Spring stiffness (k ~ 0.12)
   * @param {number} [options.damping=0.84] Velocity damping (d ~ 0.84)
   * @param {number} [options.maxShift=3.5] Maximum lens stabilization shift in pixels (±3.5px)
   * @param {number} [options.maxTilt=1.5] Maximum lens stabilization tilt in degrees (±1.5deg)
   * @param {number} [options.stageTilt=2.2] Maximum stage parallax tilt in degrees
   * @param {number} [options.stageShift=4.0] Maximum stage parallax translation in pixels
   */
  constructor(options = {}) {
    // Physics parameters
    this.stiffness = options.stiffness ?? 0.12;
    this.damping = options.damping ?? 0.84;
    this.maxShift = options.maxShift ?? 3.5;
    this.maxTilt = options.maxTilt ?? 1.5;
    this.stageTilt = options.stageTilt ?? 2.2;
    this.stageShift = options.stageShift ?? 4.0;

    // Normalized pointer target coordinates [-1, 1]
    this.targetX = 0;
    this.targetY = 0;

    // Spring-damped 2-axis state
    this.gyroX = 0;
    this.gyroY = 0;
    this.velX = 0;
    this.velY = 0;

    // DOM references
    this.stageEl = null;
    this.sceneEl = null;
    this.primaryLensEl = null;
    this.periscopePrismEl = null;

    // Internal state
    this.isTracking = false;
    this.isSettled = true;
    this.lastPointerTime = 0;

    this._boundOnPointerMove = this._onPointerMove.bind(this);
    this._boundOnPointerLeave = this._onPointerLeave.bind(this);
    this._boundOnTouchMove = this._onTouchMove.bind(this);
    this._boundOnTouchEnd = this._onTouchEnd.bind(this);
    this._boundOnOrientation = this._onOrientation.bind(this);
  }

  /**
   * Initialize OIS tracking on stage and scene elements.
   * @param {HTMLElement|SVGElement} stageEl Stage viewport container
   * @param {HTMLElement|SVGElement} sceneEl SVG scene or assemblies container
   * @returns {OisGyro} this instance for chaining
   */
  initOis(stageEl, sceneEl) {
    if (this.stageEl) {
      this.destroy();
    }

    this.stageEl = stageEl;
    this.sceneEl = sceneEl;

    if (!stageEl) return this;

    // Bind pointer events (handles mouse, pen, and touch)
    if (typeof window !== "undefined" && "PointerEvent" in window) {
      stageEl.addEventListener("pointermove", this._boundOnPointerMove, { passive: true });
      stageEl.addEventListener("pointerdown", this._boundOnPointerMove, { passive: true });
      stageEl.addEventListener("pointerleave", this._boundOnPointerLeave, { passive: true });
      stageEl.addEventListener("pointercancel", this._boundOnPointerLeave, { passive: true });
    } else if (stageEl.addEventListener) {
      // Fallback for older touch/mouse environments
      stageEl.addEventListener("mousemove", this._boundOnPointerMove, { passive: true });
      stageEl.addEventListener("mouseleave", this._boundOnPointerLeave, { passive: true });
      stageEl.addEventListener("touchmove", this._boundOnTouchMove, { passive: true });
      stageEl.addEventListener("touchend", this._boundOnTouchEnd, { passive: true });
      stageEl.addEventListener("touchcancel", this._boundOnTouchEnd, { passive: true });
    }

    // Optional physical device gyroscope support
    if (typeof window !== "undefined" && window.addEventListener) {
      window.addEventListener("deviceorientation", this._boundOnOrientation, { passive: true });
    }

    this._queryLensElements();
    return this;
  }

  /**
   * Query or discover OIS camera elements in the DOM.
   * @private
   */
  _queryLensElements() {
    const root = this.sceneEl || (typeof document !== "undefined" ? document : null);
    if (!root) return;

    // Primary 200MP ISOCELL HP2 OIS lens
    this.primaryLensEl =
      root.querySelector("#ois-lens-primary") ||
      (typeof document !== "undefined" ? document.getElementById("ois-lens-primary") : null) ||
      root.querySelector(".wide-200mp-vcm") ||
      root.querySelector("[data-assembly='cameras'] .wide-200mp-vcm");

    // 50MP 5x Folded periscope optical prism element
    this.periscopePrismEl =
      root.querySelector("#periscope-prism-element") ||
      (typeof document !== "undefined" ? document.getElementById("periscope-prism-element") : null) ||
      root.querySelector(".periscope-telephoto") ||
      root.querySelector("[data-assembly='cameras'] .periscope-telephoto");

    // Prepare hardware acceleration and transform-origin
    if (this.primaryLensEl && this.primaryLensEl.style) {
      this.primaryLensEl.style.transformOrigin = "center center";
      this.primaryLensEl.style.transformBox = "fill-box";
      this.primaryLensEl.style.willChange = "transform";
    }
    if (this.periscopePrismEl && this.periscopePrismEl.style) {
      this.periscopePrismEl.style.transformOrigin = "center center";
      this.periscopePrismEl.style.transformBox = "fill-box";
      this.periscopePrismEl.style.willChange = "transform";
    }
  }

  /**
   * Handle pointer movements relative to the stage viewport.
   * Normalizes coordinates to [-1.0, +1.0].
   * @param {PointerEvent|MouseEvent} e
   * @private
   */
  _onPointerMove(e) {
    if (!this.stageEl || !this.stageEl.getBoundingClientRect) return;
    const rect = this.stageEl.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const relX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const relY = ((e.clientY - rect.top) / rect.height) * 2 - 1;

    this.targetX = Math.max(-1, Math.min(1, relX));
    this.targetY = Math.max(-1, Math.min(1, relY));
    this.isTracking = true;
    this.lastPointerTime = Date.now();
  }

  /**
   * Handle pointer departure: spring smoothly recenters to [0, 0].
   * @private
   */
  _onPointerLeave() {
    this.targetX = 0;
    this.targetY = 0;
    this.isTracking = false;
  }

  /**
   * Handle mobile touch movement fallback.
   * @param {TouchEvent} e
   * @private
   */
  _onTouchMove(e) {
    if (!e.touches || e.touches.length === 0) return;
    this._onPointerMove(e.touches[0]);
  }

  /**
   * Handle mobile touch end.
   * @private
   */
  _onTouchEnd() {
    this._onPointerLeave();
  }

  /**
   * Device orientation tilt fallback for mobile gyro hardware.
   * @param {DeviceOrientationEvent} e
   * @private
   */
  _onOrientation(e) {
    if (this.isTracking || Date.now() - this.lastPointerTime < 1500) return;
    if (e.gamma == null || e.beta == null) return;

    // Gamma: -45° to +45° roll -> [-1, 1]
    const roll = Math.max(-45, Math.min(45, e.gamma)) / 45;
    // Beta: 15° to 75° pitch (standard hand-held tilt centered around 45°) -> [-1, 1]
    const pitch = Math.max(-30, Math.min(30, e.beta - 45)) / 30;

    this.targetX = roll;
    this.targetY = pitch;
  }

  /**
   * Manually set target gyro offsets [-1, 1].
   * @param {number} x
   * @param {number} y
   */
  setTarget(x, y) {
    this.targetX = Math.max(-1, Math.min(1, Number(x) || 0));
    this.targetY = Math.max(-1, Math.min(1, Number(y) || 0));
  }

  /**
   * Animation tick update method.
   * Computes spring physics, applies VCM counter-shifts to OIS lenses,
   * updates stage parallax tilt, and returns telemetry.
   *
   * @param {number} [dt=1] Optional frame step multiplier (normalized to ~60fps)
   * @returns {Object} Current telemetry data
   */
  updateOis(dt = 1) {
    // ponytail: normalize dt gracefully whether passed as frame delta or milliseconds
    const step = typeof dt === "number" && dt > 2 ? Math.min(2.0, dt / 16.667) : Math.min(2.0, Math.max(0.1, Number(dt) || 1));

    // Dual-axis spring-damped physics simulation with realistic physical inertia
    const forceX = -this.stiffness * (this.gyroX - this.targetX) - this.damping * this.velX;
    const forceY = -this.stiffness * (this.gyroY - this.targetY) - this.damping * this.velY;

    this.velX += forceX * step;
    this.velY += forceY * step;

    this.gyroX += this.velX * step;
    this.gyroY += this.velY * step;

    // Rest/convergence deadband to prevent sub-pixel micro-jitter
    const dTargetX = Math.abs(this.targetX - this.gyroX);
    const dTargetY = Math.abs(this.targetY - this.gyroY);
    if (dTargetX < 0.0003 && Math.abs(this.velX) < 0.0003) {
      this.gyroX = this.targetX;
      this.velX = 0;
    }
    if (dTargetY < 0.0003 && Math.abs(this.velY) < 0.0003) {
      this.gyroY = this.targetY;
      this.velY = 0;
    }

    this.isSettled =
      dTargetX < 0.0005 &&
      dTargetY < 0.0005 &&
      Math.abs(this.velX) < 0.0005 &&
      Math.abs(this.velY) < 0.0005;

    // Check DOM elements if not yet cached
    if (!this.primaryLensEl || !this.periscopePrismEl) {
      this._queryLensElements();
    }

    // 1. Counter-shift transforms for Primary 200MP OIS Lens
    // Dual-axis voice coil motor (VCM) moves lens in OPPOSITE direction of shake
    // Clamped strictly to physical end-stops ±3.5px and ±1.5deg
    const rawPrimaryShiftX = -this.gyroX * this.maxShift;
    const rawPrimaryShiftY = -this.gyroY * this.maxShift;
    const rawPrimaryRot = -this.gyroX * this.maxTilt;

    const primaryShiftX = Math.max(-this.maxShift, Math.min(this.maxShift, rawPrimaryShiftX));
    const primaryShiftY = Math.max(-this.maxShift, Math.min(this.maxShift, rawPrimaryShiftY));
    const primaryRot = Math.max(-this.maxTilt, Math.min(this.maxTilt, rawPrimaryRot));

    if (this.primaryLensEl && this.primaryLensEl.style) {
      this.primaryLensEl.style.transform = `translate(${primaryShiftX.toFixed(2)}px, ${primaryShiftY.toFixed(2)}px) rotate(${primaryRot.toFixed(2)}deg)`;
    }

    // 2. Counter-shift transforms for 50MP 5x Folded Periscope Prism
    // Magnetic rail levitation stabilizes folding prism along reflective pitch axis
    const rawPeriShiftX = -this.gyroX * this.maxShift;
    const rawPeriShiftY = -this.gyroY * (this.maxShift * 0.75);
    const rawPeriRot = -this.gyroY * this.maxTilt;

    const periShiftX = Math.max(-this.maxShift, Math.min(this.maxShift, rawPeriShiftX));
    const periShiftY = Math.max(-this.maxShift, Math.min(this.maxShift, rawPeriShiftY));
    const periRot = Math.max(-this.maxTilt, Math.min(this.maxTilt, rawPeriRot));

    if (this.periscopePrismEl && this.periscopePrismEl.style) {
      this.periscopePrismEl.style.transform = `translate(${periShiftX.toFixed(2)}px, ${periShiftY.toFixed(2)}px) rotate(${periRot.toFixed(2)}deg)`;
    }

    // 3. Stage Parallax Tilt for Exploded Assemblies
    const stageTiltX = -this.gyroY * this.stageTilt; // pitch
    const stageTiltY = this.gyroX * this.stageTilt; // yaw
    const stageTransX = this.gyroX * this.stageShift;
    const stageTransY = this.gyroY * (this.stageShift * 0.75);

    if (this.sceneEl && this.sceneEl.style) {
      this.sceneEl.style.transform = `perspective(1200px) rotateX(${stageTiltX.toFixed(2)}deg) rotateY(${stageTiltY.toFixed(2)}deg) translate(${stageTransX.toFixed(2)}px, ${stageTransY.toFixed(2)}px)`;
      this.sceneEl.style.transformOrigin = "550px 480px";
    }

    return {
      gyroX: this.gyroX,
      gyroY: this.gyroY,
      velX: this.velX,
      velY: this.velY,
      targetX: this.targetX,
      targetY: this.targetY,
      primaryLens: {
        shiftX: primaryShiftX,
        shiftY: primaryShiftY,
        rotateDeg: primaryRot,
      },
      periscopePrism: {
        shiftX: periShiftX,
        shiftY: periShiftY,
        rotateDeg: periRot,
      },
      stageParallax: {
        tiltX: stageTiltX,
        tiltY: stageTiltY,
        shiftX: stageTransX,
        shiftY: stageTransY,
      },
      isSettled: this.isSettled,
    };
  }

  /**
   * Compute per-assembly exploded depth parallax offset.
   * Higher assemblies (closer to top of stack) experience amplified parallax depth.
   * @param {number} restZ Resting Z height of assembly (-14 to 230 mm)
   * @returns {{x: number, y: number}}
   */
  computeAssemblyParallax(restZ = 0) {
    const depthFactor = 0.02 + Math.max(0, (restZ + 15) / 250) * 0.06;
    return {
      x: +(this.gyroX * depthFactor * 12).toFixed(2),
      y: +(this.gyroY * depthFactor * 10).toFixed(2),
    };
  }

  /**
   * Teardown and detach event listeners.
   */
  destroy() {
    if (this.stageEl) {
      this.stageEl.removeEventListener("pointermove", this._boundOnPointerMove);
      this.stageEl.removeEventListener("pointerdown", this._boundOnPointerMove);
      this.stageEl.removeEventListener("pointerleave", this._boundOnPointerLeave);
      this.stageEl.removeEventListener("pointercancel", this._boundOnPointerLeave);
      this.stageEl.removeEventListener("mousemove", this._boundOnPointerMove);
      this.stageEl.removeEventListener("mouseleave", this._boundOnPointerLeave);
      this.stageEl.removeEventListener("touchmove", this._boundOnTouchMove);
      this.stageEl.removeEventListener("touchend", this._boundOnTouchEnd);
      this.stageEl.removeEventListener("touchcancel", this._boundOnTouchEnd);
    }
    if (typeof window !== "undefined" && window.removeEventListener) {
      window.removeEventListener("deviceorientation", this._boundOnOrientation);
    }
    if (this.primaryLensEl && this.primaryLensEl.style) {
      this.primaryLensEl.style.transform = "";
    }
    if (this.periscopePrismEl && this.periscopePrismEl.style) {
      this.periscopePrismEl.style.transform = "";
    }
    if (this.sceneEl && this.sceneEl.style) {
      this.sceneEl.style.transform = "";
    }
    this.stageEl = null;
    this.sceneEl = null;
    this.primaryLensEl = null;
    this.periscopePrismEl = null;
  }
}

// ---------------------------------------------------------------------------
// Singleton / Global Convenience Methods & Browser Support
// ---------------------------------------------------------------------------

const defaultInstance = new OisGyro();

/**
 * Initialize OIS engine on stage and scene elements.
 * @param {HTMLElement|SVGElement} stageEl Stage viewport container
 * @param {HTMLElement|SVGElement} sceneEl SVG scene or assemblies container
 * @returns {OisGyro}
 */
export function initOis(stageEl, sceneEl) {
  return defaultInstance.initOis(stageEl, sceneEl);
}

/**
 * Update OIS tracking and physical transforms for current animation tick.
 * @param {number} [dt=1] Optional frame step
 * @returns {Object} Telemetry data
 */
export function updateOis(dt = 1) {
  return defaultInstance.updateOis(dt);
}

// Attach static convenience methods directly to class
OisGyro.initOis = initOis;
OisGyro.updateOis = updateOis;
OisGyro.defaultInstance = defaultInstance;

// Universal browser export
if (typeof window !== "undefined") {
  window.OisGyro = OisGyro;
}

export default OisGyro;
