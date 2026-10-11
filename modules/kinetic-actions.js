/**
 * ============================================================================
 * SAMSUNG GALAXY S25 ULTRA — KINETIC ACTION TRIGGERS ENGINE
 * modules/kinetic-actions.js
 * ============================================================================
 * High-precision kinetic simulator and procedural audio synth engine:
 * 
 * 1. 📷 Snap Shutter:
 *    - Mechanical leaf aperture & iris chord closure animation
 *    - Stage / full-screen white flash overlay (.camera-flash-overlay)
 *    - Two-stage front/rear curtain mechanical shutter procedural audio synth
 *    - Telemetry: "ISOCELL HP2 · 200MP RAW · 1/2000s · ISO 50 · f/1.7"
 * 
 * 2. ⚡ Benchmark Stress:
 *    - Dual Oryon Prime cores 4.47 GHz thermal load simulation
 *    - Capillary liquid wick fluid animation in vapor chamber (.iso-flow)
 *    - Continuous thermal coil hum & flux audio synth with temperature tracking
 *    - Real-time telemetry: 32.0°C -> 68.4°C, Wick Flow -> 1.4 m/s over 6.5s
 *    - Automatic cool-down at 6.5s with harmonic crystalline cool-off chime
 * 
 * 3. ⏏ Eject S Pen:
 *    - Lateral extraction along -X axis (+45mm slide out with +12mm vertical lift)
 *    - Microswitch latch & resonant spring pop procedural audio synth
 *    - Telemetry: "S Pen Ejected · 4,096 Levels · BLE Active"
 * 
 * Pure ES Module, zero external runtime dependencies, 100% Web Audio API synth.
 */

// Isometric projection translation coefficients for Galaxy S25 Ultra stage
// X: dx * 1.604, dy * 0.78 | Z: dz * -1.705
const SPEN_DELTA_X_MM = -45.0; // mm lateral slide out along -X axis
const SPEN_DELTA_Z_MM = 12.0;  // mm vertical inspection lift along +Z axis
const SPEN_PX_SX = Number((SPEN_DELTA_X_MM * 1.604).toFixed(2)); // -72.18 px
const SPEN_PX_SY = Number((SPEN_DELTA_X_MM * 0.78 - SPEN_DELTA_Z_MM * 1.705).toFixed(2)); // -55.56 px

const BENCHMARK_DURATION_MS = 6500; // 6.5 seconds stress cycle
const BENCHMARK_TEMP_START = 32.0;  // °C
const BENCHMARK_TEMP_END = 68.4;    // °C
const BENCHMARK_FLOW_END = 1.4;     // m/s
const BENCHMARK_FREQ_GHZ = "4.47";  // GHz dual Prime Oryon cores

const READOUT_SHUTTER = "ISOCELL HP2 · 200MP RAW · 1/2000s · ISO 50 · f/1.7";
const READOUT_SPEN_EJECTED = "S Pen Ejected · 4,096 Levels · BLE Active";
const READOUT_SPEN_DOCKED = "S Pen Docked · Silo Latched · Fast Inductive Charge";

/* ============================================================================
   Procedural Web Audio API Synthesizer (Zero External Audio Files)
   ============================================================================ */

class KineticSoundSynth {
  constructor(sharedCtx = null) {
    this.ctx = sharedCtx;
    this.thermalHumNodes = null;
    this.soundEnabled = true;
  }

  getAudioContext() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      // Reuse window context if available
      if (window.__GALAXY_AUDIO_CTX__) {
        this.ctx = window.__GALAXY_AUDIO_CTX__;
      } else {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
          window.__GALAXY_AUDIO_CTX__ = this.ctx;
        }
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  isSoundActive() {
    if (!this.soundEnabled) return false;
    if (typeof window !== "undefined" && window.soundEnabled === false) return false;
    return true;
  }

  /**
   * Two-stage mechanical camera shutter sound:
   * Stage 1: Front curtain solenoid engagement & mirror flip transient (t = 0)
   * Stage 2: Rear curtain snap & spring dampener rebound (t = +65ms)
   */
  playShutterSound() {
    if (!this.isSoundActive()) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const t0 = ctx.currentTime;

      // --- STAGE 1: Front-Curtain Solenoid Click (t = 0) ---
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "square";
      osc1.frequency.setValueAtTime(2400, t0);
      osc1.frequency.exponentialRampToValueAtTime(520, t0 + 0.02);
      gain1.gain.setValueAtTime(0.09, t0);
      gain1.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.022);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(t0);
      osc1.stop(t0 + 0.022);

      // Low mechanical body resonance
      const bodyOsc1 = ctx.createOscillator();
      const bodyGain1 = ctx.createGain();
      bodyOsc1.type = "triangle";
      bodyOsc1.frequency.setValueAtTime(340, t0);
      bodyOsc1.frequency.exponentialRampToValueAtTime(90, t0 + 0.035);
      bodyGain1.gain.setValueAtTime(0.07, t0);
      bodyGain1.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.035);
      bodyOsc1.connect(bodyGain1);
      bodyGain1.connect(ctx.destination);
      bodyOsc1.start(t0);
      bodyOsc1.stop(t0 + 0.035);

      // --- STAGE 2: High-Speed Rear-Curtain Latch Snap (t = +65ms) ---
      const t1 = t0 + 0.065;

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "square";
      osc2.frequency.setValueAtTime(3100, t1);
      osc2.frequency.exponentialRampToValueAtTime(360, t1 + 0.024);
      gain2.gain.setValueAtTime(0.12, t1);
      gain2.gain.exponentialRampToValueAtTime(0.0001, t1 + 0.025);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(t1);
      osc2.stop(t1 + 0.025);

      // Spring damper click (mechanical rebound)
      const t2 = t1 + 0.028;
      const oscBounce = ctx.createOscillator();
      const gainBounce = ctx.createGain();
      oscBounce.type = "triangle";
      oscBounce.frequency.setValueAtTime(1600, t2);
      oscBounce.frequency.exponentialRampToValueAtTime(450, t2 + 0.015);
      gainBounce.gain.setValueAtTime(0.04, t2);
      gainBounce.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.015);
      oscBounce.connect(gainBounce);
      gainBounce.connect(ctx.destination);
      oscBounce.start(t2);
      oscBounce.stop(t2 + 0.015);
    } catch (err) {
      // AudioContext policy suppression fallback
    }
  }

  /**
   * Continuous thermal hum sound during benchmark stress test:
   * Dual 56Hz / 112Hz inductors with modulated lowpass filter sweeping as die heats up.
   */
  startThermalHum() {
    if (!this.isSoundActive()) return;
    try {
      this.stopThermalHum();
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      // Base inductor fundamental (56Hz)
      const osc1 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(56, t);

      // 2nd harmonic coil whine (112Hz)
      const osc2 = ctx.createOscillator();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(112, t);

      // Sub-harmonic flux (28Hz)
      const oscSub = ctx.createOscillator();
      oscSub.type = "sawtooth";
      oscSub.frequency.setValueAtTime(28, t);

      // Sweeping thermal lowpass filter
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(190, t);
      filter.Q.setValueAtTime(2.5, t);

      // LFO modulation to create subtle vapor pulsating
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(3.4, t);
      lfoGain.gain.setValueAtTime(28, t);
      lfo.connect(filter.frequency);
      lfo.start(t);

      // Master hum gain with smooth swell
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, t);
      masterGain.gain.exponentialRampToValueAtTime(0.065, t + 0.35);

      // Connections
      osc1.connect(filter);
      osc2.connect(filter);
      oscSub.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      osc1.start(t);
      osc2.start(t);
      oscSub.start(t);

      this.thermalHumNodes = {
        osc1,
        osc2,
        oscSub,
        filter,
        lfo,
        lfoGain,
        masterGain,
      };
    } catch (err) {}
  }

  /**
   * Modulate thermal hum dynamically as die temperature climbs
   */
  updateThermalHum(temp, progress) {
    if (!this.thermalHumNodes) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const t = ctx.currentTime;
      const { osc1, osc2, filter } = this.thermalHumNodes;

      // Slight thermal pitch drift: 56Hz -> 74Hz
      const pitch1 = 56 + progress * 18;
      const pitch2 = 112 + progress * 36;
      osc1.frequency.setValueAtTime(pitch1, t);
      osc2.frequency.setValueAtTime(pitch2, t);

      // Lowpass cutoff sweeps up as thermal dissipation increases: 190Hz -> 540Hz
      const cutoff = 190 + progress * 350;
      filter.frequency.setValueAtTime(cutoff, t);
    } catch (err) {}
  }

  /**
   * Stop thermal hum smoothly
   */
  stopThermalHum() {
    if (!this.thermalHumNodes) return;
    try {
      const ctx = this.getAudioContext();
      const { osc1, osc2, oscSub, lfo, masterGain } = this.thermalHumNodes;
      if (ctx && masterGain) {
        const t = ctx.currentTime;
        masterGain.gain.setValueAtTime(masterGain.gain.value, t);
        masterGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
        setTimeout(() => {
          try {
            osc1.stop();
            osc2.stop();
            oscSub.stop();
            lfo.stop();
            osc1.disconnect();
            osc2.disconnect();
            oscSub.disconnect();
            lfo.disconnect();
            masterGain.disconnect();
          } catch (e) {}
        }, 250);
      }
    } catch (err) {}
    this.thermalHumNodes = null;
  }

  /**
   * Crystalline harmonic cool-off chime played at end of 6.5s benchmark:
   * Ascending E6 (1318Hz) -> B6 (1975Hz) -> E7 (2637Hz) bell envelope
   */
  playCoolOffChime() {
    if (!this.isSoundActive()) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const t0 = ctx.currentTime;

      const notes = [
        { freq: 1318.51, delay: 0.00, gain: 0.075, dur: 0.70 },
        { freq: 1975.53, delay: 0.08, gain: 0.060, dur: 0.65 },
        { freq: 2637.02, delay: 0.16, gain: 0.050, dur: 0.85 },
      ];

      notes.forEach((note) => {
        const nt = t0 + note.delay;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(note.freq, nt);

        gain.gain.setValueAtTime(0.0001, nt);
        gain.gain.exponentialRampToValueAtTime(note.gain, nt + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, nt + note.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(nt);
        osc.stop(nt + note.dur);
      });
    } catch (err) {}
  }

  /**
   * S Pen crisp microswitch spring pop sound (Ejection)
   */
  playSPenPopSound() {
    if (!this.isSoundActive()) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const t0 = ctx.currentTime;

      // Crisp mechanical latch click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(2800, t0);
      osc.frequency.exponentialRampToValueAtTime(950, t0 + 0.02);
      gain.gain.setValueAtTime(0.08, t0);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.02);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.02);

      // Helical spring acoustic resonance
      const sOsc = ctx.createOscillator();
      const sGain = ctx.createGain();
      sOsc.type = "sine";
      sOsc.frequency.setValueAtTime(920, t0 + 0.008);
      sOsc.frequency.exponentialRampToValueAtTime(410, t0 + 0.045);
      sGain.gain.setValueAtTime(0.05, t0 + 0.008);
      sGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.045);
      sOsc.connect(sGain);
      sGain.connect(ctx.destination);
      sOsc.start(t0 + 0.008);
      sOsc.stop(t0 + 0.045);
    } catch (err) {}
  }

  /**
   * S Pen docking latch lock click (Re-insertion into Silo)
   */
  playSPenLockSound() {
    if (!this.isSoundActive()) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const t0 = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(1700, t0);
      osc.frequency.exponentialRampToValueAtTime(540, t0 + 0.022);
      gain.gain.setValueAtTime(0.065, t0);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.022);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.022);
    } catch (err) {}
  }
}

/* ============================================================================
   Kinetic Actions Styles Injector
   ============================================================================ */

const KINETIC_STYLE_ID = "galaxy-kinetic-actions-styles";

function injectKineticStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(KINETIC_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = KINETIC_STYLE_ID;
  style.textContent = `
    /* Full-stage / viewport camera flash overlay */
    .camera-flash-overlay {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 45% 42%, #ffffff 0%, rgba(255, 255, 255, 0.96) 65%, rgba(235, 245, 255, 0.88) 100%);
      pointer-events: none;
      opacity: 0;
      z-index: 150;
      border-radius: inherit;
      mix-blend-mode: screen;
      transition: opacity 0.04s cubic-bezier(0, 0, 0.2, 1);
    }
    .camera-flash-overlay.is-flashing {
      opacity: 0.98 !important;
      transition: none !important;
    }

    /* Mechanical shutter aperture blade snap keyframe animation */
    @keyframes mechanicalShutterSnap {
      0% {
        transform: scale(1);
        filter: brightness(1);
      }
      20% {
        transform: scale(0.14);
        filter: brightness(2.6);
        stroke-width: 2.8px;
      }
      45% {
        transform: scale(0.06);
        filter: brightness(3.0);
        stroke-width: 3.2px;
      }
      70% {
        transform: scale(1.08);
        filter: brightness(1.25);
      }
      100% {
        transform: scale(1);
        filter: brightness(1);
      }
    }

    .aperture-shutter-anim {
      transform-box: fill-box !important;
      transform-origin: center !important;
      animation: mechanicalShutterSnap 0.26s cubic-bezier(0.18, 0.95, 0.25, 1) forwards !important;
    }

    /* Sintered copper capillary wick fluid flow animation */
    @keyframes isoFlowDash {
      from { stroke-dashoffset: 0; }
      to { stroke-dashoffset: -36; }
    }

    .iso-flow {
      stroke-dasharray: 4.5 3 !important;
      stroke: #ff7235 !important;
      stroke-width: 1.5px !important;
      animation: isoFlowDash 0.42s linear infinite !important;
      filter: drop-shadow(0 0 2.8px rgba(255, 114, 53, 0.85)) !important;
      transition: stroke 0.3s ease;
    }

    /* Vapor chamber thermal stress active state */
    .vapor-chamber-stressed {
      filter: drop-shadow(0 0 12px rgba(255, 90, 25, 0.55)) !important;
      transition: filter 0.6s ease;
    }

    /* S Pen extraction transition helper */
    .spen-kinetic-carriage {
      will-change: transform;
    }
  `;
  document.head.appendChild(style);
}

/* ============================================================================
   KineticActions Controller Class
   ============================================================================ */

export class KineticActions {
  /**
   * @param {Object} [options]
   * @param {HTMLElement} [options.root] Container root (defaults to .galaxy-container or body)
   * @param {AudioContext} [options.audioCtx] Shared AudioContext instance
   * @param {boolean} [options.soundEnabled] Initial sound enabled state
   */
  constructor(options = {}) {
    this.root = options.root || (typeof document !== "undefined" ? document.querySelector(".galaxy-container") || document.body : null);
    this.synth = new KineticSoundSynth(options.audioCtx || null);
    if (typeof options.soundEnabled === "boolean") {
      this.synth.soundEnabled = options.soundEnabled;
    }

    // State tracking
    this.isSPenEjected = false;
    this.isBenchmarking = false;
    this.isShutterActive = false;
    this.currentDieTemp = BENCHMARK_TEMP_START;
    this.currentWickFlow = 0.0;

    // Timers & RAF handles
    this.readoutTimer = null;
    this.baselineReadoutText = null;
    this.benchmarkTimer = null;
    this.benchmarkAnimFrame = null;
    this.spenAnimFrame = null;

    // Spring engine for S Pen extraction
    this.spenSpring = {
      pos: 0.0,    // 0 = docked, 1 = fully extracted
      target: 0.0,
      vel: 0.0,
      k: 240,      // spring stiffness
      d: 22,       // damping
    };

    // Auto-setup styles and DOM elements if running in browser
    if (typeof window !== "undefined") {
      injectKineticStyles();
      this.ensureFlashOverlay();
      this.ensureSPenCarriage();
    }
  }

  /* --------------------------------------------------------------------------
     DOM Element Resolvers
     -------------------------------------------------------------------------- */

  getStageElement() {
    if (!this.root && typeof document !== "undefined") {
      this.root = document.querySelector(".galaxy-container") || document.body;
    }
    return this.root ? (this.root.querySelector(".galaxy-stage") || this.root.querySelector(".galaxy-plate") || this.root) : null;
  }

  getReadoutElement() {
    if (typeof document === "undefined") return null;
    return (
      (this.root && this.root.querySelector("[data-readout]")) ||
      document.querySelector("[data-readout]") ||
      document.querySelector(".iso-plate-corner[data-corner='readout']")
    );
  }

  ensureFlashOverlay() {
    if (typeof document === "undefined") return null;
    let overlay = document.querySelector(".camera-flash-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "camera-flash-overlay";
      overlay.setAttribute("aria-hidden", "true");
      const stage = this.getStageElement();
      if (stage) {
        stage.appendChild(overlay);
      } else {
        document.body.appendChild(overlay);
      }
    }
    return overlay;
  }

  ensureSPenCarriage() {
    if (typeof document === "undefined") return null;
    const spenGroup = document.querySelector('.assembly-group[data-id="spen"]') || document.querySelector('[data-id="spen"]');
    if (!spenGroup) return null;

    let carriage = spenGroup.querySelector(".spen-kinetic-carriage");
    if (!carriage) {
      carriage = document.createElementNS("http://www.w3.org/2000/svg", "g");
      carriage.setAttribute("class", "spen-kinetic-carriage");

      // Relocate existing child nodes into the kinetic carriage
      while (spenGroup.firstChild) {
        carriage.appendChild(spenGroup.firstChild);
      }
      spenGroup.appendChild(carriage);
    }
    return carriage;
  }

  getVaporChamberElements() {
    if (typeof document === "undefined") return [];
    const vcGroup = document.querySelector('.assembly-group[data-id="vapor_chamber"]') || document.querySelector('[data-id="vapor_chamber"]');
    if (!vcGroup) return [];

    // Target internal mesh lines, distribution channels, and capillary patterns
    const lines = [...vcGroup.querySelectorAll("path, line")];
    return { vcGroup, lines };
  }

  getCameraApertureElements() {
    if (typeof document === "undefined") return [];
    const elements = [];

    // 1. Camera assembly group
    const camGroup = document.querySelector('.assembly-group[data-id="cameras"]') || document.querySelector('[data-id="cameras"]');
    if (camGroup) {
      // Wide 200MP VCM lens and aperture elements
      const wideVcm = camGroup.querySelector(".wide-200mp-vcm");
      if (wideVcm) elements.push(wideVcm);

      // Rings and optical pupils in camera group
      const rings = camGroup.querySelectorAll("path, circle");
      rings.forEach((el) => {
        elements.push(el);
      });
    }

    // 2. Rear cover sapphire camera bezels
    const backGroup = document.querySelector('.assembly-group[data-id="back_glass"]') || document.querySelector('[data-id="back_glass"]');
    if (backGroup) {
      const lenses = backGroup.querySelectorAll(".sapphire-lens, .titanium-ring");
      lenses.forEach((el) => elements.push(el));
    }

    return elements;
  }

  /* --------------------------------------------------------------------------
     Telemetry Readout Helper
     -------------------------------------------------------------------------- */

  updateReadout(text, autoRevertMs = 0) {
    const el = this.getReadoutElement();
    if (!el) return;

    if (this.readoutTimer) {
      clearTimeout(this.readoutTimer);
      this.readoutTimer = null;
    }

    if (this.baselineReadoutText === null && !this.isBenchmarking) {
      this.baselineReadoutText = el.textContent;
    }

    el.textContent = text;

    if (autoRevertMs > 0) {
      this.readoutTimer = setTimeout(() => {
        if (!this.isBenchmarking && this.baselineReadoutText) {
          el.textContent = this.baselineReadoutText;
        }
        this.readoutTimer = null;
      }, autoRevertMs);
    }
  }

  /* ==========================================================================
     ACTION 1: 📷 Snap Shutter
     ========================================================================== */

  /**
   * Triggers mechanical shutter animation on camera lens aperture,
   * activates stage white flash overlay, plays two-stage procedural shutter sound,
   * and updates exposure telemetry readout.
   *
   * @returns {Object} Trigger metadata
   */
  triggerShutter() {
    injectKineticStyles();
    this.isShutterActive = true;

    // 1. Play two-stage procedural shutter sound
    this.synth.playShutterSound();

    // 2. Mechanical shutter aperture animation
    const apertureEls = this.getCameraApertureElements();
    apertureEls.forEach((el) => {
      el.classList.remove("aperture-shutter-anim");
      // Trigger DOM reflow to restart CSS animation
      void el.offsetWidth;
      el.classList.add("aperture-shutter-anim");
    });

    setTimeout(() => {
      apertureEls.forEach((el) => el.classList.remove("aperture-shutter-anim"));
      this.isShutterActive = false;
    }, 280);

    // 3. Stage / full-screen white flash overlay
    const overlay = this.ensureFlashOverlay();
    if (overlay) {
      overlay.classList.remove("is-flashing");
      void overlay.offsetWidth;
      overlay.classList.add("is-flashing");

      setTimeout(() => {
        overlay.classList.remove("is-flashing");
      }, 70);
    }

    // 4. Update readout telemetry
    this.updateReadout(READOUT_SHUTTER, 3800);

    return {
      action: "snap_shutter",
      telemetry: READOUT_SHUTTER,
      timestamp: Date.now(),
    };
  }

  /* ==========================================================================
     ACTION 2: ⚡ Benchmark Stress
     ========================================================================== */

  /**
   * Simulates thermal load test:
   * - Activates animated capillary fluid wick flow inside vapor chamber (.iso-flow)
   * - Starts continuous thermal hum sound via audio synth
   * - Animates real-time telemetry over 6.5s (Prime cores 4.47 GHz, 32°C -> 68.4°C, Flow 1.4 m/s)
   * - Automatically cools down after 6.5 seconds with cool-off chime
   *
   * @returns {Promise<Object>} Resolves when 6.5s benchmark cycle completes
   */
  triggerBenchmark() {
    injectKineticStyles();

    // If benchmark is already in progress, stop it first to allow re-triggering
    if (this.isBenchmarking) {
      this.stopBenchmark(false);
    }

    this.isBenchmarking = true;
    const startTime = performance.now();

    // 1. Activate capillary wick fluid flow animation on vapor chamber
    const { vcGroup, lines } = this.getVaporChamberElements();
    if (vcGroup) vcGroup.classList.add("vapor-chamber-stressed");
    lines.forEach((line) => line.classList.add("iso-flow"));

    // 2. Start continuous thermal hum audio synth
    this.synth.startThermalHum();

    return new Promise((resolve) => {
      const updateFrame = (now) => {
        if (!this.isBenchmarking) return;

        const elapsed = Math.min(now - startTime, BENCHMARK_DURATION_MS);
        const progress = elapsed / BENCHMARK_DURATION_MS; // 0.0 to 1.0

        // Realistic non-linear heating curve: rapid initial climb easing toward thermal saturation
        const easeHeat = 1 - Math.pow(1 - progress, 1.7);
        const easeFlow = 1 - Math.pow(1 - progress, 2.1);

        const temp = BENCHMARK_TEMP_START + (BENCHMARK_TEMP_END - BENCHMARK_TEMP_START) * easeHeat;
        const flow = BENCHMARK_FLOW_END * easeFlow;

        this.currentDieTemp = temp;
        this.currentWickFlow = flow;

        // Modulate continuous thermal hum frequency & lowpass filter cutoff
        this.synth.updateThermalHum(temp, progress);

        // Real-time telemetry readout formatting
        const tempStr = temp.toFixed(1);
        const flowStr = flow.toFixed(1);
        const telemetry = `PRIME CORES ${BENCHMARK_FREQ_GHZ} GHz · DIE TEMP ${tempStr}°C · VAPOR WICK FLOW ${flowStr} m/s`;
        this.updateReadout(telemetry, 0);

        if (elapsed < BENCHMARK_DURATION_MS) {
          this.benchmarkAnimFrame = requestAnimationFrame(updateFrame);
        } else {
          // Completed 6.5s stress test: execute automatic cool-down
          this.completeBenchmarkCoolDown(resolve);
        }
      };

      this.benchmarkAnimFrame = requestAnimationFrame(updateFrame);
    });
  }

  /**
   * Internal handler for 6.5s cool-down completion
   */
  completeBenchmarkCoolDown(resolveCallback = null) {
    this.isBenchmarking = false;
    if (this.benchmarkAnimFrame) {
      cancelAnimationFrame(this.benchmarkAnimFrame);
      this.benchmarkAnimFrame = null;
    }

    // 1. Stop thermal hum smoothly
    this.synth.stopThermalHum();

    // 2. Play harmonic crystalline cool-off chime
    this.synth.playCoolOffChime();

    // 3. Remove capillary fluid flow animation
    const { vcGroup, lines } = this.getVaporChamberElements();
    if (vcGroup) vcGroup.classList.remove("vapor-chamber-stressed");
    lines.forEach((line) => line.classList.remove("iso-flow"));

    // 4. Cool-down confirmation telemetry
    const coolText = `THERMAL DISSIPATION COMPLETE · 4,100mm² VC COOLED · SNAPDRAGON 8 ELITE NORMAL`;
    this.updateReadout(coolText, 3500);

    const result = {
      action: "benchmark_stress",
      durationMs: BENCHMARK_DURATION_MS,
      peakTemp: BENCHMARK_TEMP_END,
      peakFlow: BENCHMARK_FLOW_END,
      primeGhz: BENCHMARK_FREQ_GHZ,
      status: "cooled",
      timestamp: Date.now(),
    };

    if (typeof resolveCallback === "function") {
      resolveCallback(result);
    }
  }

  /**
   * Abort or stop active benchmark prematurely
   */
  stopBenchmark(playChime = true) {
    if (!this.isBenchmarking) return;
    this.isBenchmarking = false;

    if (this.benchmarkAnimFrame) {
      cancelAnimationFrame(this.benchmarkAnimFrame);
      this.benchmarkAnimFrame = null;
    }

    this.synth.stopThermalHum();
    if (playChime) this.synth.playCoolOffChime();

    const { vcGroup, lines } = this.getVaporChamberElements();
    if (vcGroup) vcGroup.classList.remove("vapor-chamber-stressed");
    lines.forEach((line) => line.classList.remove("iso-flow"));
  }

  /* ==========================================================================
     ACTION 3: ⏏ Eject S Pen
     ========================================================================== */

  /**
   * Toggles S Pen extraction along -X axis (+45mm slide out with +12mm lift),
   * plays spring pop procedural sound, and updates telemetry readout.
   *
   * @returns {boolean} New ejected state (true = ejected, false = docked)
   */
  toggleSPen() {
    return this.setSPenEjected(!this.isSPenEjected);
  }

  /**
   * Explicitly eject S Pen
   */
  ejectSPen() {
    return this.setSPenEjected(true);
  }

  /**
   * Explicitly dock S Pen
   */
  dockSPen() {
    return this.setSPenEjected(false);
  }

  /**
   * Set S Pen extraction state with physics spring interpolation
   *
   * @param {boolean} ejectState Target extraction state
   * @returns {boolean} Resulting state
   */
  setSPenEjected(ejectState) {
    injectKineticStyles();
    this.isSPenEjected = Boolean(ejectState);
    this.spenSpring.target = this.isSPenEjected ? 1.0 : 0.0;

    // 1. Play procedural spring audio
    if (this.isSPenEjected) {
      this.synth.playSPenPopSound();
      this.updateReadout(READOUT_SPEN_EJECTED, 3600);
    } else {
      this.synth.playSPenLockSound();
      this.updateReadout(READOUT_SPEN_DOCKED, 3200);
    }

    // 2. Animate physical extraction with spring physics
    this.animateSPenSpring();

    return this.isSPenEjected;
  }

  /**
   * Spring physics loop for S Pen extraction along -X (-45mm) and +Z (+12mm)
   */
  animateSPenSpring() {
    const carriage = this.ensureSPenCarriage();
    if (!carriage) return;

    if (this.spenAnimFrame) {
      cancelAnimationFrame(this.spenAnimFrame);
      this.spenAnimFrame = null;
    }

    let lastTime = performance.now();

    const tick = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 1 / 30);
      lastTime = now;

      // Sub-step numerical integration
      const subDt = dt / 4;
      for (let i = 0; i < 4; i++) {
        const force = -this.spenSpring.k * (this.spenSpring.pos - this.spenSpring.target) - this.spenSpring.d * this.spenSpring.vel;
        this.spenSpring.vel += force * subDt;
        this.spenSpring.pos += this.spenSpring.vel * subDt;
      }

      // Calculate current isometric screen translation
      const t = this.spenSpring.pos;
      const currentSx = (SPEN_PX_SX * t).toFixed(2);
      const currentSy = (SPEN_PX_SY * t).toFixed(2);

      if (Math.abs(t) < 0.002 && this.spenSpring.target === 0.0) {
        carriage.removeAttribute("transform");
      } else {
        carriage.setAttribute("transform", `translate(${currentSx} ${currentSy})`);
      }

      // Check spring equilibrium convergence
      const settled = Math.abs(this.spenSpring.pos - this.spenSpring.target) < 0.001 && Math.abs(this.spenSpring.vel) < 0.004;

      if (!settled) {
        this.spenAnimFrame = requestAnimationFrame(tick);
      } else {
        this.spenSpring.pos = this.spenSpring.target;
        this.spenSpring.vel = 0;
        if (this.spenSpring.target === 0.0) {
          carriage.removeAttribute("transform");
        } else {
          carriage.setAttribute("transform", `translate(${SPEN_PX_SX} ${SPEN_PX_SY})`);
        }
        this.spenAnimFrame = null;
      }
    };

    this.spenAnimFrame = requestAnimationFrame(tick);
  }

  /* --------------------------------------------------------------------------
     UI Button Auto-Binding Convenience Helper
     -------------------------------------------------------------------------- */

  /**
   * Binds kinetic actions to matching HTML buttons if present in the page:
   * [data-action="snap-shutter"], [data-action="benchmark-stress"], [data-action="eject-spen"]
   */
  bindButtons(container = null) {
    const root = container || this.root || document;
    if (!root) return;

    // 1. Shutter buttons
    const shutterBtns = root.querySelectorAll('[data-action="snap-shutter"], [data-kinetic="shutter"]');
    shutterBtns.forEach((btn) => {
      btn.addEventListener("click", () => this.triggerShutter());
    });

    // 2. Benchmark buttons
    const benchBtns = root.querySelectorAll('[data-action="benchmark-stress"], [data-kinetic="benchmark"]');
    benchBtns.forEach((btn) => {
      btn.addEventListener("click", () => this.triggerBenchmark());
    });

    // 3. S Pen toggle buttons
    const spenBtns = root.querySelectorAll('[data-action="eject-spen"], [data-kinetic="spen"]');
    spenBtns.forEach((btn) => {
      btn.addEventListener("click", () => this.toggleSPen());
    });
  }

  /* --------------------------------------------------------------------------
     State & Lifecycle
     -------------------------------------------------------------------------- */

  getState() {
    return {
      isSPenEjected: this.isSPenEjected,
      isBenchmarking: this.isBenchmarking,
      isShutterActive: this.isShutterActive,
      currentDieTemp: this.currentDieTemp,
      currentWickFlow: this.currentWickFlow,
    };
  }

  destroy() {
    this.stopBenchmark(false);
    if (this.readoutTimer) clearTimeout(this.readoutTimer);
    if (this.spenAnimFrame) cancelAnimationFrame(this.spenAnimFrame);
  }

  /* --------------------------------------------------------------------------
     Static Convenience API & Singleton Instance
     -------------------------------------------------------------------------- */

  static getInstance(options = {}) {
    if (!KineticActions._instance) {
      KineticActions._instance = new KineticActions(options);
    }
    return KineticActions._instance;
  }

  static triggerShutter() {
    return KineticActions.getInstance().triggerShutter();
  }

  static triggerBenchmark() {
    return KineticActions.getInstance().triggerBenchmark();
  }

  static toggleSPen() {
    return KineticActions.getInstance().toggleSPen();
  }

  static ejectSPen() {
    return KineticActions.getInstance().ejectSPen();
  }

  static dockSPen() {
    return KineticActions.getInstance().dockSPen();
  }

  static init(options = {}) {
    const instance = KineticActions.getInstance(options);
    instance.bindButtons();
    return instance;
  }
}

// Global browser window attachment for vanilla script workflows
if (typeof window !== "undefined") {
  window.KineticActions = KineticActions;
}

export default KineticActions;
