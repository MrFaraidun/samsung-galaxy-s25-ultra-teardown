/**
 * ==============================================================================
 * Samsung Galaxy S25 Ultra — Procedural Web Audio API Sound Synthesis Engine
 * File: modules/audio-synth.js
 * ==============================================================================
 * Pure Web Audio API procedural synthesis engine with ZERO audio files or external assets.
 * 
 * Provides physically-modeled acoustic feedback for:
 * - Mechanical rotary encoder ticks and stepper detents
 * - Magnetic latch closures and assembly snap-fit selection
 * - S Pen spring-loaded plunger ejector microswitch
 * - Fluid spatial explosion / reassembly acoustic glides
 * - Galaxy S25 Ultra X-axis Linear Resonant Actuator (LRA) 40Hz haptic pulse
 * - Pro-grade dual-curtain mechanical camera shutter (2400Hz / 1200Hz, 45ms spacing)
 * - 4,100 mm² vapor chamber capillary two-phase phase-change cooling hum (12Hz LFO)
 * ==============================================================================
 */

// Singleton state & AudioContext holder
let audioCtx = null;
let masterGainNode = null;
let soundEnabled = true;
let masterVolume = 1.0;

// Continuous thermal cooling sound state
let thermalState = {
  active: false,
  carrier1: null,
  carrier2: null,
  lfo: null,
  lfoGain: null,
  filter: null,
  gainNode: null,
  stopTimeout: null,
};

/**
 * Lazily retrieves or instantiates the Web Audio AudioContext.
 * Automatically handles browser autoplay suspension and resumes context.
 * @returns {AudioContext|null}
 */
function getAudioContext() {
  if (typeof window === "undefined" && typeof globalThis.AudioContext === "undefined") {
    return null;
  }

  try {
    if (!audioCtx) {
      const AudioCtxClass =
        (typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext)) ||
        globalThis.AudioContext ||
        globalThis.webkitAudioContext;

      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }

    if (audioCtx) {
      if (!masterGainNode) {
        masterGainNode = audioCtx.createGain();
        masterGainNode.gain.setValueAtTime(masterVolume, audioCtx.currentTime);
        masterGainNode.connect(audioCtx.destination);
      }

      if (audioCtx.state === "suspended") {
        audioCtx.resume().catch(() => {});
      }
    }
  } catch (err) {
    // Graceful fallback for restricted/headless environments
  }

  return audioCtx;
}

/**
 * Register automatic user interaction listeners to unlock AudioContext.
 */
function setupAutoUnlock() {
  if (typeof window === "undefined" || typeof window.addEventListener !== "function") {
    return;
  }

  const unlock = () => {
    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
    } catch (e) {}

    window.removeEventListener("pointerdown", unlock, true);
    window.removeEventListener("keydown", unlock, true);
    window.removeEventListener("touchstart", unlock, true);
    window.removeEventListener("click", unlock, true);
  };

  window.addEventListener("pointerdown", unlock, { passive: true, capture: true, once: true });
  window.addEventListener("keydown", unlock, { passive: true, capture: true, once: true });
  window.addEventListener("touchstart", unlock, { passive: true, capture: true, once: true });
  window.addEventListener("click", unlock, { passive: true, capture: true, once: true });
}

// Initialize unlock listeners in browser environment
setupAutoUnlock();

/**
 * Procedural Audio Synthesis Engine
 */
const AudioSynth = {
  /**
   * Current enabled state
   */
  get enabled() {
    return soundEnabled;
  },
  set enabled(val) {
    soundEnabled = Boolean(val);
    if (!soundEnabled && thermalState.active) {
      this.thermalStop();
    }
  },

  /**
   * Sound enabled property compatibility
   */
  get soundEnabled() {
    return soundEnabled;
  },
  set soundEnabled(val) {
    this.enabled = val;
  },

  /**
   * Master volume control (0.0 to 1.0+)
   */
  get volume() {
    return masterVolume;
  },
  set volume(val) {
    masterVolume = Math.max(0, Number(val) || 0);
    if (audioCtx && masterGainNode) {
      masterGainNode.gain.setValueAtTime(masterVolume, audioCtx.currentTime);
    }
  },

  /**
   * Enable audio playback
   */
  enable() {
    this.enabled = true;
    return this;
  },

  /**
   * Disable audio playback
   */
  disable() {
    this.enabled = false;
    return this;
  },

  /**
   * Toggle audio on/off
   * @returns {boolean} New enabled state
   */
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  },

  /**
   * Get underlying AudioContext (or lazily initialize it)
   * @returns {AudioContext|null}
   */
  getContext() {
    return getAudioContext();
  },

  /**
   * High-precision mechanical tick for slider movements and stepper detents.
   * Synthesizes an ultra-crisp metallic micro-detent with rapid exponential pitch decay.
   * 
   * @param {number} [freq=1100] - Base frequency in Hz
   * @param {number} [gainVal=0.03] - Amplitude volume level
   */
  tick(freq = 1100, gainVal = 0.03) {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx || !masterGainNode) return;

      const t0 = ctx.currentTime;
      const duration = 0.018;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      const f = Math.max(100, Number(freq) || 1100);
      const targetF = Math.max(80, f * 0.29);

      osc.frequency.setValueAtTime(f, t0);
      osc.frequency.exponentialRampToValueAtTime(targetF, t0 + duration);

      const peakGain = Math.max(0.001, Number(gainVal) || 0.03);
      gain.gain.setValueAtTime(peakGain, t0);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

      osc.connect(gain);
      gain.connect(masterGainNode);

      osc.start(t0);
      osc.stop(t0 + duration);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch (e) {}
      };
    } catch (e) {}
  },

  /**
   * Precision latch click for assembly part selection and preset snapping.
   * Models the dual-acoustic event of mechanical contact and locking jaw engagement.
   */
  click() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx || !masterGainNode) return;

      const t0 = ctx.currentTime;
      const duration = 0.024;

      // Primary metallic strike
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "triangle";
      osc1.frequency.setValueAtTime(1800, t0);
      osc1.frequency.exponentialRampToValueAtTime(450, t0 + duration);

      gain1.gain.setValueAtTime(0.06, t0);
      gain1.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

      osc1.connect(gain1);
      gain1.connect(masterGainNode);

      osc1.start(t0);
      osc1.stop(t0 + duration);

      // Low mechanical inertia body click
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(320, t0);
      osc2.frequency.exponentialRampToValueAtTime(80, t0 + 0.016);

      gain2.gain.setValueAtTime(0.04, t0);
      gain2.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.016);

      osc2.connect(gain2);
      gain2.connect(masterGainNode);

      osc2.start(t0);
      osc2.stop(t0 + 0.016);

      osc1.onended = () => {
        try {
          osc1.disconnect();
          gain1.disconnect();
          osc2.disconnect();
          gain2.disconnect();
        } catch (e) {}
      };
    } catch (e) {}
  },

  /**
   * Crisp mechanical microswitch spring pop for the Galaxy S25 Ultra S Pen plunger.
   * Models the fast electrical microswitch contact break paired with the miniature
   * titanium/steel compression spring release ping.
   */
  spen() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx || !masterGainNode) return;

      const t0 = ctx.currentTime;

      // Stage 1: Sharp microswitch snap (square wave edge transient)
      const oscSnap = ctx.createOscillator();
      const gainSnap = ctx.createGain();
      oscSnap.type = "square";
      oscSnap.frequency.setValueAtTime(2600, t0);
      oscSnap.frequency.exponentialRampToValueAtTime(1100, t0 + 0.016);

      gainSnap.gain.setValueAtTime(0.045, t0);
      gainSnap.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.016);

      oscSnap.connect(gainSnap);
      gainSnap.connect(masterGainNode);

      oscSnap.start(t0);
      oscSnap.stop(t0 + 0.016);

      // Stage 2: Resonant helical spring ping ring (~3600Hz high-Q ring)
      const oscSpring = ctx.createOscillator();
      const gainSpring = ctx.createGain();
      oscSpring.type = "sine";
      oscSpring.frequency.setValueAtTime(3600, t0 + 0.002);
      oscSpring.frequency.exponentialRampToValueAtTime(2800, t0 + 0.028);

      gainSpring.gain.setValueAtTime(0.0001, t0);
      gainSpring.gain.setValueAtTime(0.022, t0 + 0.002);
      gainSpring.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.028);

      oscSpring.connect(gainSpring);
      gainSpring.connect(masterGainNode);

      oscSpring.start(t0 + 0.002);
      oscSpring.stop(t0 + 0.028);

      oscSpring.onended = () => {
        try {
          oscSnap.disconnect();
          gainSnap.disconnect();
          oscSpring.disconnect();
          gainSpring.disconnect();
        } catch (e) {}
      };
    } catch (e) {}
  },

  /**
   * Smooth subtle pitch slide for explosion and reassembly state transitions.
   * 
   * @param {boolean} [upwards=true] - True for explosion disassembly, False for reassembly
   */
  glide(upwards = true) {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx || !masterGainNode) return;

      const t0 = ctx.currentTime;
      const duration = 0.075;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      const startF = upwards ? 320 : 580;
      const endF = upwards ? 580 : 320;

      osc.frequency.setValueAtTime(startF, t0);
      osc.frequency.exponentialRampToValueAtTime(endF, t0 + duration);

      // Smooth parabolic envelope to eliminate attack/release clicks
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(0.025, t0 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

      osc.connect(gain);
      gain.connect(masterGainNode);

      osc.start(t0);
      osc.stop(t0 + duration);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch (e) {}
      };
    } catch (e) {}
  },

  /**
   * 40Hz sub-bass resonant pulse simulating the Galaxy S25 Ultra X-axis LRA
   * (Linear Resonant Actuator) tungsten proof-mass haptic motor.
   * 
   * Features 40Hz fundamental resonant sine wave reinforced with an 80Hz 2nd harmonic
   * for realistic audible punch on mobile/laptop speakers alongside physical sub-bass.
   * 
   * @param {number} [intensity=1.0] - Haptic impulse strength (0.1 to 2.0)
   */
  haptic(intensity = 1.0) {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx || !masterGainNode) return;

      const t0 = ctx.currentTime;
      const duration = 0.075;
      const scale = Math.min(Math.max(Number(intensity) || 1.0, 0.1), 2.0);

      // 40Hz fundamental LRA mechanical resonance
      const oscFund = ctx.createOscillator();
      const gainFund = ctx.createGain();
      oscFund.type = "sine";
      oscFund.frequency.setValueAtTime(40, t0);

      const peakGainFund = 0.09 * scale;
      gainFund.gain.setValueAtTime(0.0001, t0);
      gainFund.gain.linearRampToValueAtTime(peakGainFund, t0 + 0.006);
      gainFund.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

      oscFund.connect(gainFund);
      gainFund.connect(masterGainNode);

      oscFund.start(t0);
      oscFund.stop(t0 + duration);

      // 80Hz 2nd harmonic for acoustic definition on small speaker cones
      const oscHarm = ctx.createOscillator();
      const gainHarm = ctx.createGain();
      oscHarm.type = "sine";
      oscHarm.frequency.setValueAtTime(80, t0);

      const peakGainHarm = 0.028 * scale;
      gainHarm.gain.setValueAtTime(0.0001, t0);
      gainHarm.gain.linearRampToValueAtTime(peakGainHarm, t0 + 0.004);
      gainHarm.gain.exponentialRampToValueAtTime(0.0001, t0 + duration * 0.85);

      oscHarm.connect(gainHarm);
      gainHarm.connect(masterGainNode);

      oscHarm.start(t0);
      oscHarm.stop(t0 + duration);

      oscFund.onended = () => {
        try {
          oscFund.disconnect();
          gainFund.disconnect();
          oscHarm.disconnect();
          gainHarm.disconnect();
        } catch (e) {}
      };
    } catch (e) {}
  },

  /**
   * Realistic two-stage mechanical camera shutter.
   * Simulates the 200MP ISOCELL HP2 dual-curtain focal plane shutter mechanism:
   * First curtain sharp release click at 2400Hz, followed by second curtain closure
   * at 1200Hz with an authentic 45ms mechanical exposure spacing.
   */
  shutter() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx || !masterGainNode) return;

      const t0 = ctx.currentTime;

      // ==========================================
      // STAGE 1: First Curtain Release (2400Hz sharp click)
      // ==========================================
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "triangle";
      osc1.frequency.setValueAtTime(2400, t0);
      osc1.frequency.exponentialRampToValueAtTime(1300, t0 + 0.014);

      gain1.gain.setValueAtTime(0.07, t0);
      gain1.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.014);

      osc1.connect(gain1);
      gain1.connect(masterGainNode);

      osc1.start(t0);
      osc1.stop(t0 + 0.014);

      // Curtain blade transit friction noise burst
      try {
        const bufferSize = Math.floor(ctx.sampleRate * 0.008);
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.08;
        }

        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = noiseBuffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = "bandpass";
        noiseFilter.frequency.setValueAtTime(3200, t0);
        noiseFilter.Q.setValueAtTime(2.0, t0);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.035, t0);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.008);

        noiseNode.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(masterGainNode);

        noiseNode.start(t0);
        noiseNode.stop(t0 + 0.008);
      } catch (noiseErr) {}

      // ==========================================
      // STAGE 2: Second Curtain Closure (1200Hz click, 45ms spacing)
      // ==========================================
      const t1 = t0 + 0.045; // 45ms spacing
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(1200, t1);
      osc2.frequency.exponentialRampToValueAtTime(550, t1 + 0.018);

      gain2.gain.setValueAtTime(0.055, t1);
      gain2.gain.exponentialRampToValueAtTime(0.0001, t1 + 0.018);

      osc2.connect(gain2);
      gain2.connect(masterGainNode);

      osc2.start(t1);
      osc2.stop(t1 + 0.018);

      // Low mechanical damping resonance at shutter close
      const oscCloseBraking = ctx.createOscillator();
      const gainCloseBraking = ctx.createGain();
      oscCloseBraking.type = "sine";
      oscCloseBraking.frequency.setValueAtTime(220, t1);
      oscCloseBraking.frequency.exponentialRampToValueAtTime(65, t1 + 0.025);

      gainCloseBraking.gain.setValueAtTime(0.03, t1);
      gainCloseBraking.gain.exponentialRampToValueAtTime(0.0001, t1 + 0.025);

      oscCloseBraking.connect(gainCloseBraking);
      gainCloseBraking.connect(masterGainNode);

      oscCloseBraking.start(t1);
      oscCloseBraking.stop(t1 + 0.025);

      osc2.onended = () => {
        try {
          osc1.disconnect();
          gain1.disconnect();
          osc2.disconnect();
          gain2.disconnect();
          oscCloseBraking.disconnect();
          gainCloseBraking.disconnect();
        } catch (e) {}
      };
    } catch (e) {}
  },

  /**
   * Continuous low-frequency hum with 12Hz modulated LFO simulating the
   * 4,100 mm² vapor chamber sintered copper capillary wick two-phase
   * thermodynamic phase change (evaporation -> expansion -> condensation -> capillary return).
   */
  thermalStart() {
    if (!soundEnabled) return;
    if (thermalState.active) return;

    try {
      const ctx = getAudioContext();
      if (!ctx || !masterGainNode) return;

      if (thermalState.stopTimeout) {
        clearTimeout(thermalState.stopTimeout);
        thermalState.stopTimeout = null;
      }

      const t0 = ctx.currentTime;

      // Master gain for smooth fade-in / fade-out transitions
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.0001, t0);
      gainNode.gain.linearRampToValueAtTime(0.028, t0 + 0.25);

      // Dual carrier oscillators for rich, organic thermal acoustic cavity
      const carrier1 = ctx.createOscillator();
      carrier1.type = "sine";
      carrier1.frequency.setValueAtTime(68, t0); // 68Hz low thermodynamic hum

      const carrier2 = ctx.createOscillator();
      carrier2.type = "triangle";
      carrier2.frequency.setValueAtTime(82, t0); // 82Hz subtle metal chamber harmonic

      // 12Hz modulated LFO representing capillary cycling and phase changes
      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(12, t0); // 12Hz capillary phase-change cycle

      // LFO modulation depth gain
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(18, t0); // +/- 18Hz modulation depth

      // Resonant lowpass filter modulated by the 12Hz LFO
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(140, t0);
      filter.Q.setValueAtTime(3.5, t0);

      // Connect LFO to modulate filter frequency
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      // Carrier mixing through filter to master thermal gain
      carrier1.connect(filter);
      carrier2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(masterGainNode);

      // Start all oscillators
      carrier1.start(t0);
      carrier2.start(t0);
      lfo.start(t0);

      thermalState = {
        active: true,
        carrier1,
        carrier2,
        lfo,
        lfoGain,
        filter,
        gainNode,
        stopTimeout: null,
      };
    } catch (e) {}
  },

  /**
   * Gracefully ramps down and terminates the vapor chamber thermal cooling hum.
   */
  thermalStop() {
    if (!thermalState.active) return;

    try {
      const ctx = getAudioContext();
      const state = thermalState;
      thermalState = {
        active: false,
        carrier1: null,
        carrier2: null,
        lfo: null,
        lfoGain: null,
        filter: null,
        gainNode: null,
        stopTimeout: null,
      };

      if (!ctx || !state.gainNode) {
        return;
      }

      const t0 = ctx.currentTime;
      const fadeDuration = 0.28;

      // Smooth exponential decay fade-out
      state.gainNode.gain.cancelScheduledValues(t0);
      state.gainNode.gain.setValueAtTime(state.gainNode.gain.value, t0);
      state.gainNode.gain.exponentialRampToValueAtTime(0.0001, t0 + fadeDuration);

      state.stopTimeout = setTimeout(() => {
        try {
          if (state.carrier1) state.carrier1.stop();
          if (state.carrier2) state.carrier2.stop();
          if (state.lfo) state.lfo.stop();

          if (state.carrier1) state.carrier1.disconnect();
          if (state.carrier2) state.carrier2.disconnect();
          if (state.lfo) state.lfo.disconnect();
          if (state.lfoGain) state.lfoGain.disconnect();
          if (state.filter) state.filter.disconnect();
          if (state.gainNode) state.gainNode.disconnect();
        } catch (e) {}
      }, fadeDuration * 1000 + 40);
    } catch (e) {}
  },

  /**
   * Query whether the vapor chamber thermal hum is currently running
   * @returns {boolean}
   */
  isThermalActive() {
    return thermalState.active;
  },
};

// Clean browser global export
if (typeof window !== "undefined") {
  window.AudioSynth = AudioSynth;
}
if (typeof globalThis !== "undefined") {
  globalThis.AudioSynth = AudioSynth;
}

export default AudioSynth;
export { AudioSynth };
