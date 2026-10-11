/**
 * Samsung Galaxy S25 Ultra — Live Interactive Engineering Controller
 * Features:
 * - Synthesized Web Audio API precision sound effects (mechanical ticks, spring clicks, slide glides)
 * - Dynamic Theme Toggle (Dark Mode & Light Mode)
 * - Subsystems Inspection Sidebar (inspect and isolate each part independently)
 * - Physics-based multi-assembly spring engine & S Pen extraction
 * - Full keyboard accessibility & mobile touch support
 */

(function () {
  "use strict";

  // Raw component telemetry database for all 11 assemblies
  const SUBSYSTEMS_DATA = [
    {
      id: "fixture",
      number: "00",
      name: "Cleanroom Inspection Bench",
      badge: "METROLOGY BED",
      short: "Bench",
      metrics: [
        { k: "MATERIAL", v: "Hard-Anodized 6061-T6 Al" },
        { k: "VERNIER", v: "0.02 mm / 50 Div Metric" },
        { k: "CHUCKS", v: "4× Delrin Polymer Jaws" },
        { k: "ESD RESIST", v: "< 10⁶ Ω Grounded" },
      ],
      desc: "Anti-static optical metrology bench with millimeter calibration ruler, 4 corner locking clamps, and vertical micrometer column with vernier stylus.",
    },
    {
      id: "display",
      number: "01",
      name: "Dynamic AMOLED 2X & EMR Stack",
      badge: "OPTICAL & TOUCH",
      short: "Display",
      metrics: [
        { k: "PANEL", v: "6.86″ Dynamic AMOLED 2X" },
        { k: "RESOLUTION", v: "3120 × 1440 QHD+ (505 ppi)" },
        { k: "REFRESH", v: "1–120 Hz Dynamic LTPO" },
        { k: "COVER", v: "Gorilla Armor (75% Anti-Glare)" },
        { k: "DIGITIZER", v: "Wacom 0.3mm Active EMR" },
      ],
      desc: "Flat AMOLED display with anti-reflective Corning Gorilla Armor, punch-hole selfie camera aperture, ultrasonic fingerprint sensor, and Wacom EMR digitizer layer.",
    },
    {
      id: "chassis",
      number: "02",
      name: "Titanium Frame & Chassis",
      badge: "STRUCTURE",
      short: "Frame",
      metrics: [
        { k: "PERIMETER", v: "Grade 5 Titanium (Ti-6Al-4V)" },
        { k: "SUBFRAME", v: "CNC Milled 6013 Aluminum" },
        { k: "INGRESS", v: "IP68 Submersible (1.5m 30m)" },
        { k: "I/O PORTS", v: "USB-C 3.2 · Speaker · Mic · Silo" },
      ],
      desc: "Grade 5 Titanium outer band with CNC chamfered edges, laser-welded aluminum inner chassis with milled battery and motherboard bays, and internal S Pen silo.",
    },
    {
      id: "vapor_chamber",
      number: "03",
      name: "4,100 mm² Vapor Chamber",
      badge: "THERMAL CORE",
      short: "Cooling",
      metrics: [
        { k: "SURFACE AREA", v: "4,100 mm² Extended Flank" },
        { k: "WICK CORE", v: "Sintered Copper Capillary" },
        { k: "CONDUCTIVITY", v: "> 5,000 W/m·K Effective" },
        { k: "DELTA-T", v: "-4.2°C Die Junction Drop" },
      ],
      desc: "Ultra-thin stainless steel & copper two-phase vapor chamber. Direct copper contact boss dissipates heat from the Snapdragon 8 Elite across the battery bay.",
    },
    {
      id: "battery",
      number: "04",
      name: "5,000 mAh Dual-Tab Battery",
      badge: "POWER CELL",
      short: "Battery",
      metrics: [
        { k: "CAPACITY", v: "5,000 mAh / 19.35 Wh" },
        { k: "NOMINAL V", v: "3.88 V (4.45 V Peak)" },
        { k: "FAST CHARGE", v: "45W USB-PD PPS (SFC 2.0)" },
        { k: "CHEMISTRY", v: "Dual-Tab Low-Impedance Li-ion" },
      ],
      desc: "Dual-tab Lithium-Ion polymer pouch cell with lower internal impedance, laser-welded nickel tabs, integrated protection circuit (PCM), and pull-tab release tape.",
    },
    {
      id: "spen",
      number: "05",
      name: "S Pen & Silo Ejector",
      badge: "STYLUS SYSTEM",
      short: "S Pen",
      metrics: [
        { k: "PRESSURE", v: "4,096 Levels Sensitivity" },
        { k: "TIP RADIUS", v: "0.7 mm Elastomer Bullet Nib" },
        { k: "CHARGING", v: "Inductive (40s for 40h BLE)" },
        { k: "CAPACITOR", v: "TiO₂ Solid Super-Capacitor" },
      ],
      desc: "Integrated inductive stylus dockable in the left frame. Features 4,096 pressure levels, BLE 6-axis gyro for Air Actions, and clickable spring ejection plunger.",
    },
    {
      id: "motherboard",
      number: "06",
      name: "Motherboard & Snapdragon 8 Elite",
      badge: "SYSTEM COMPUTE",
      short: "Logic Board",
      metrics: [
        { k: "PROCESSOR", v: "Snapdragon 8 Elite (3nm N3E)" },
        { k: "CPU CORES", v: "2× 4.47GHz Prime + 6× 3.53GHz" },
        { k: "SYSTEM RAM", v: "16 GB LPDDR5X-9600 PoP" },
        { k: "STORAGE", v: "512 GB UFS 4.0 Dual-Lane" },
        { k: "NPU INFER", v: "45 TOPS Qualcomm Hexagon" },
      ],
      desc: "Stacked Substrate-Like PCB (SLP) hosting the TSMC 3nm Snapdragon 8 Elite for Galaxy SoC, LPDDR5X RAM, UFS 4.0 storage, X80 5G modem, and stamped EMI shield cans.",
    },
    {
      id: "sub_board",
      number: "07",
      name: "Sub-Board, USB-C & Haptics",
      badge: "DAUGHTERBOARD",
      short: "I/O Board",
      metrics: [
        { k: "DATA PORT", v: "USB 3.2 Gen 1 (5 Gbps OTG)" },
        { k: "HAPTIC", v: "X-Axis Linear Resonant (LRA)" },
        { k: "MICROPHONES", v: "Dual Knowles MEMS Beamforming" },
        { k: "SIM SOCKET", v: "Dual nano-SIM + eSIM Secure" },
      ],
      desc: "Lower I/O daughterboard with moisture-sealed USB-C 3.2 receptacle, primary beamforming microphone capsules, dual SIM card tray, and linear resonant vibration motor.",
    },
    {
      id: "cameras",
      number: "08",
      name: "Quad Camera System & Periscope",
      badge: "OPTOELECTRONICS",
      short: "Cameras",
      metrics: [
        { k: "WIDE 200MP", v: "ISOCELL HP2 1/1.3″ f/1.7 OIS" },
        { k: "5X PERISCOPE", v: "50MP 111mm f/3.4 Folded Prism" },
        { k: "ULTRAWIDE", v: "50MP ISOCELL JN3 120° Macro" },
        { k: "3X TELEPHOTO", v: "10MP 67mm f/2.4 OIS" },
        { k: "RANGEFINDER", v: "Class 1 IR ToF Laser AF" },
      ],
      desc: "Quad camera array featuring 200MP OIS sensor with dual-axis voice coil motor, 50MP 5x optical folded periscope prism with magnetic levitation rails, and Laser AF diode.",
    },
    {
      id: "wireless_coil",
      number: "09",
      name: "Wireless Qi2 Coil & NFC / UWB",
      badge: "INDUCTION & RF",
      short: "Coil & NFC",
      metrics: [
        { k: "QI2 WIRELESS", v: "15W Pure Copper Induction" },
        { k: "POWERSHARE", v: "4.5W Reverse Wireless Tx" },
        { k: "SPATIAL UWB", v: "Ultra-Wideband Channel 5/9" },
        { k: "NFC TRANSIT", v: "13.56 MHz Perimeter Loop" },
      ],
      desc: "Pure copper Archimedean spiral induction coil for 15W Qi2 wireless charging and reverse PowerShare, surrounded by NFC loop, UWB spatial antenna, and graphite cooling sheet.",
    },
    {
      id: "back_glass",
      number: "10",
      name: "Gorilla Glass Victus 2 Back",
      badge: "ENCLOSURE",
      short: "Back Glass",
      metrics: [
        { k: "MATERIAL", v: "Corning Gorilla Glass Victus 2" },
        { k: "FINISH", v: "Satin Frosted Matte Acid-Etch" },
        { k: "LENS RINGS", v: "4× Titanium Bezels + Sapphire" },
        { k: "SEAL GASKET", v: "Die-Cut Closed-Cell Silicone" },
      ],
      desc: "Satin frosted Gorilla Glass Victus 2 rear panel with 4 individual Grade 5 Titanium protective camera bezels, sapphire crystal lens caps, flash window, and IP68 gasket.",
    },
  ];

  /* ==========================================================================
     Web Audio API Procedural Sound Synthesizer (Zero Audio Files Needed)
     ========================================================================== */
  let audioCtx = null;
  let soundEnabled = true;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  const sound = {
    // Soft precision mechanical tick (slider drag, hover)
    tick: function (freq = 1100, gainVal = 0.03) {
      if (!soundEnabled) return;
      if (typeof window !== "undefined" && window.AudioSynth && window.AudioSynth.tick) {
        return window.AudioSynth.tick(freq, gainVal);
      }
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.018);
        gain.gain.setValueAtTime(gainVal, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.018);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.018);
      } catch (e) {}
    },

    // Mechanical latch click (part selection, preset snap)
    click: function () {
      if (!soundEnabled) return;
      if (typeof window !== "undefined" && window.AudioSynth && window.AudioSynth.click) {
        return window.AudioSynth.click();
      }
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(1800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.022);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.022);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.022);
      } catch (e) {}
    },

    // S Pen crisp microswitch spring pop
    spen: function () {
      if (!soundEnabled) return;
      if (typeof window !== "undefined" && window.AudioSynth && window.AudioSynth.spen) {
        return window.AudioSynth.spen();
      }
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(2600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.02);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.02);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.02);
      } catch (e) {}
    },

    // Smooth subtle glide for explosion / reassembly transition
    glide: function (upwards = true) {
      if (!soundEnabled) return;
      if (typeof window !== "undefined" && window.AudioSynth && window.AudioSynth.glide) {
        return window.AudioSynth.glide(upwards);
      }
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        const startF = upwards ? 340 : 580;
        const endF = upwards ? 580 : 340;
        osc.frequency.setValueAtTime(startF, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(endF, ctx.currentTime + 0.07);
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.07);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.07);
      } catch (e) {}
    },

    // 40Hz sub-bass resonant haptic pulse
    haptic: function (intensity = 1.0) {
      if (!soundEnabled) return;
      if (typeof window !== "undefined" && window.AudioSynth && window.AudioSynth.haptic) {
        return window.AudioSynth.haptic(intensity);
      }
    },

    // Pro-grade mechanical camera shutter snap
    shutter: function () {
      if (!soundEnabled) return;
      if (typeof window !== "undefined" && window.AudioSynth && window.AudioSynth.shutter) {
        return window.AudioSynth.shutter();
      }
    },

    // Continuous vapor chamber thermal hum
    thermalStart: function () {
      if (!soundEnabled) return;
      if (typeof window !== "undefined" && window.AudioSynth && window.AudioSynth.thermalStart) {
        return window.AudioSynth.thermalStart();
      }
    },

    thermalStop: function () {
      if (typeof window !== "undefined" && window.AudioSynth && window.AudioSynth.thermalStop) {
        return window.AudioSynth.thermalStop();
      }
    },
  };

  /* ==========================================================================
     DOM Querying & Initial Bindings
     ========================================================================== */
  const root = document.querySelector(".galaxy-container") || document.body;
  const stage = root.querySelector(".galaxy-stage");
  const scene = root.querySelector(".galaxy-scene");
  const svgEl = stage ? stage.querySelector(".galaxy-svg") : null;
  const readout = root.querySelector("[data-readout]");
  const slider = root.querySelector("#explode-slider");
  const sliderVal = root.querySelector("[data-slider-val]");
  const presetBtns = [...root.querySelectorAll(".preset-btn")];
  const tourBtn = root.querySelector("[data-tour-btn]");
  const soundBtn = root.querySelector("[data-sound-toggle]");
  const themeBtn = root.querySelector("[data-theme-toggle]");
  const sidebarBtn = root.querySelector("[data-sidebar-toggle]");

  const cameraBtns = [...root.querySelectorAll(".camera-pill-btn")];
  let camera = null;

  function updateCameraButtons(activePreset) {
    cameraBtns.forEach((b) => b.classList.toggle("active", b.dataset.cameraPreset === activePreset));
  }

  // Sidebar Elements
  const sidebar = root.querySelector(".galaxy-sidebar");
  const sidebarClose = root.querySelector(".sidebar-close-btn");
  const sidebarPartsList = root.querySelector(".sidebar-parts-list");
  const partDetailBox = root.querySelector(".part-detail-box");
  const stepPrevBtn = root.querySelector("[data-step-prev]");
  const stepNextBtn = root.querySelector("[data-step-next]");
  const isolateBtn = root.querySelector("[data-act-isolate]");
  const assembleBtn = root.querySelector("[data-act-assemble]");

  if (!stage || !scene) return;

  // Node records for all assemblies
  const groups = [...scene.querySelectorAll(".assembly-group")].map((el) => {
    return {
      el,
      id: el.dataset.id,
      index: Number(el.dataset.index),
      mx: Number(el.dataset.mx || 0),
      my: Number(el.dataset.my || 0),
      mz: Number(el.dataset.mz || 0),
      restZ: Number(el.dataset.restz || 0),
    };
  });

  /* ==========================================================================
     Spring Physics Engine
     ========================================================================== */
  const spring = {
    pos: 0.0,
    target: 0.0,
    vel: 0.0,
    k: 300, // stiffness
    d: 28,  // damping
  };

  let animationFrame = null;
  let lastTimestamp = 0;
  let activeIndex = -1; // -1 means device overview; 0-10 means isolated part
  let isIsolated = false;
  let isolationMode = "solo"; // "solo" or "stack"
  let isTouring = false;
  let tourTimer = null;
  let idleTimer = null;
  let lastTickSoundValue = 0;
  let isHudCollapsed = typeof window !== "undefined" && window.innerWidth <= 768;

  // Update DOM transform for an assembly group at explode fraction `t`
  function applyTransform(group, t) {
    // S Pen has custom lateral extraction along -X
    let fx = group.mx * t;
    let fy = group.my * t;
    let fz = group.mz * t;

    if (group.id === "spen") {
      // If S Pen is isolated, extract it completely
      if (isIsolated && activeIndex === group.index) {
        fx = -72;
      } else {
        fx = -68 * Math.min(1.0, t * 1.35);
      }
    } else if (isIsolated && isolationMode === "solo" && group.index === activeIndex) {
      // If isolated in solo mode and near rest, elevate part slightly above the bench for clear inspection
      if (t < 0.25 && group.id !== "fixture") {
        fz = 24;
      }
    }

    if (Math.abs(fx) < 0.05 && Math.abs(fy) < 0.05 && Math.abs(fz) < 0.05) {
      group.el.removeAttribute("transform");
    } else {
      const sx = (fx * 1.604 - fy * 1.661).toFixed(2);
      const sy = (fx * 0.78 + fy * 0.753 - fz * 1.705).toFixed(2);
      group.el.setAttribute("transform", `translate(${sx} ${sy})`);
    }
  }

  function updateReadout(t) {
    if (isIsolated && activeIndex >= 0) {
      const part = SUBSYSTEMS_DATA[activeIndex];
      const text = `${part.number} · ${part.short.toUpperCase()} · ${isolationMode === "stack" ? "IN STACK" : "SOLO ISOLATED"}`;
      if (readout && readout.textContent !== text) readout.textContent = text;
      stage.setAttribute("aria-valuetext", `${part.name} isolated for inspection`);
      return;
    }

    const mm = (t * 230).toFixed(1);
    let text = "";
    if (t < 0.03) {
      text = "ASSEMBLED · 8.2 MM · 218 G";
      stage.setAttribute("aria-valuetext", "Assembled flush 8.2 mm");
    } else if (t > 0.95) {
      text = `EXPLODED · +${mm} MM · 11 ASSEMBLIES`;
      stage.setAttribute("aria-valuetext", "Fully exploded view, 230 mm separation");
    } else {
      text = `SEPARATION +${mm} MM · 11 ASSEMBLIES`;
      stage.setAttribute("aria-valuetext", `Exploded separation ${mm} mm`);
    }

    if (readout && readout.textContent !== text) readout.textContent = text;
  }

  function tick(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const dt = Math.min((timestamp - lastTimestamp) / 1000, 1 / 30);
    lastTimestamp = timestamp;

    // Substep spring integration (4 iterations)
    const subDt = dt / 4;
    for (let i = 0; i < 4; i++) {
      const force = -spring.k * (spring.pos - spring.target) - spring.d * spring.vel;
      spring.vel += force * subDt;
      spring.pos += spring.vel * subDt;
    }

    // Audio tick on slider movement milestones
    const currentTickBucket = Math.floor(spring.pos * 35);
    if (currentTickBucket !== lastTickSoundValue) {
      sound.tick(800 + currentTickBucket * 20);
      lastTickSoundValue = currentTickBucket;
    }

    // Apply transforms
    for (const group of groups) {
      applyTransform(group, spring.pos);
    }

    // Update UI slider values
    const pct = Math.round(spring.pos * 100);
    if (slider && Number(slider.value) !== pct) slider.value = pct;
    if (sliderVal) sliderVal.textContent = `${pct}%`;
    stage.setAttribute("aria-valuenow", pct);

    updateReadout(spring.pos);

    // Update Cinematic Camera
    if (camera && svgEl) {
      camera.tickCamera(svgEl, dt);
    }

    // Update OIS Gyro Tracking
    if (window.OisGyro) {
      window.OisGyro.updateOis(dt * 60);
    }

    // Update In-Canvas 3D Callout Pills
    if (window.CalloutPills) {
      window.CalloutPills.updatePillPositions(spring.pos, isIsolated ? activeIndex : -1);
    }

    // Convergence threshold
    const springSettled = Math.abs(spring.pos - spring.target) < 0.001 && Math.abs(spring.vel) < 0.005;
    const camSettled = camera ? camera.isSettled() : true;
    const oisSettled = window.OisGyro && window.OisGyro.defaultInstance ? window.OisGyro.defaultInstance.isSettled : true;

    if (!springSettled || !camSettled || !oisSettled) {
      animationFrame = requestAnimationFrame(tick);
    } else {
      spring.pos = spring.target;
      spring.vel = 0;
      for (const group of groups) {
        applyTransform(group, spring.pos);
      }
      if (window.CalloutPills) {
        window.CalloutPills.updatePillPositions(spring.pos, isIsolated ? activeIndex : -1);
      }
      animationFrame = null;
    }
  }

  function kickPhysics() {
    if (!animationFrame) {
      lastTimestamp = 0;
      animationFrame = requestAnimationFrame(tick);
    }
  }

  function setTarget(val, playAudio = true) {
    const clamped = Math.max(0, Math.min(1, val));
    if (Math.abs(spring.target - clamped) > 0.02 && playAudio) {
      sound.glide(clamped > spring.target);
    }
    spring.target = clamped;
    kickPhysics();
    updatePresetButtons(clamped);

    if (window.NarrativeEngine && !isIsolated) {
      window.NarrativeEngine.updateNarrative(clamped > 0.05 ? "exploding" : "assembled");
    }
  }

  function updatePresetButtons(t) {
    const pct = Math.round(t * 100);
    presetBtns.forEach((btn) => {
      const p = Number(btn.dataset.preset);
      btn.classList.toggle("active", Math.abs(p - pct) <= 5);
    });
  }

  /* ==========================================================================
     Sidebar & Subsystem Inspection Controller
     ========================================================================== */
  function populateSidebarList() {
    if (!sidebarPartsList) return;
    sidebarPartsList.innerHTML = SUBSYSTEMS_DATA.map((part, i) => {
      return `
        <button type="button" class="sidebar-part-item ${i === activeIndex ? "active" : ""}" data-idx="${i}">
          <div class="item-left">
            <span class="item-idx">${part.number}</span>
            <span class="item-name">${part.name}</span>
          </div>
          <span class="item-indicator"></span>
        </button>
      `;
    }).join("");
  }

  function resetToOverview() {
    sound.click();
    activeIndex = -1;
    toggleIsolation("off");
    setTarget(0.0);
    if (camera && svgEl) {
      camera.setCameraPreset("overview");
    }
    updateCameraButtons("overview");
    updateLegendButtons(-1);
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      isHudCollapsed = true;
    }
    renderPartDetails(-1);
    if (window.NarrativeEngine) {
      window.NarrativeEngine.updateNarrative("assembled");
    }
    if (window.CalloutPills) {
      window.CalloutPills.updatePillPositions(0.0, -1);
    }
    kickPhysics();
  }

  function renderPartDetails(index) {
    if (!partDetailBox) return;
    const hasActivePart = index >= 0 && index < SUBSYSTEMS_DATA.length;
    partDetailBox.classList.toggle("has-active-part", hasActivePart);
    partDetailBox.classList.toggle("is-collapsed", isHudCollapsed);

    if (index < 0 || index >= SUBSYSTEMS_DATA.length) {
      // Default overview card
      partDetailBox.innerHTML = `
        <div class="part-detail-top">
          <div class="hud-tag-wrap">
            <span class="part-detail-num">00–10</span>
            <span class="part-detail-status">Complete Assembly</span>
          </div>
          <button type="button" class="hud-toggle-btn" data-act-hud-collapse title="${isHudCollapsed ? "Expand Telemetry HUD" : "Collapse Telemetry HUD"}">${isHudCollapsed ? "+" : "—"}</button>
        </div>
        <h3 class="part-detail-title">Samsung Galaxy S25 Ultra</h3>
        <div class="part-metrics-grid">
          <div class="part-metric-row"><span class="metric-k">CHASSIS</span><span class="metric-v">Grade 5 Titanium</span></div>
          <div class="part-metric-row"><span class="metric-k">DIMENSIONS</span><span class="metric-v">162.8 × 77.6 × 8.2 mm</span></div>
          <div class="part-metric-row"><span class="metric-k">SOC COMPUTE</span><span class="metric-v">Snapdragon 8 Elite 3nm</span></div>
          <div class="part-metric-row"><span class="metric-k">POWER CELL</span><span class="metric-v">5,000 mAh Dual-Tab</span></div>
          <div class="part-metric-row"><span class="metric-k">THERMAL</span><span class="metric-v">4,100 mm² Vapor Chamber</span></div>
        </div>
        <p class="part-desc-text">Flagship engineering model. Select any subsystem or viewport button to inspect isolated CAD geometry, material composition, and operating telemetry.</p>
        <div class="part-actions-row">
          <button type="button" class="part-act-btn" data-act-explode-all>Explode View</button>
          <button type="button" class="part-act-btn is-active" data-act-assemble-all>Assemble</button>
        </div>
      `;
      bindDetailButtons();
      return;
    }

    const part = SUBSYSTEMS_DATA[index];
    const metricsHtml = part.metrics.map((m) => {
      return `<div class="part-metric-row"><span class="metric-k">${m.k}</span><span class="metric-v">${m.v}</span></div>`;
    }).join("");

    partDetailBox.innerHTML = `
      <div class="part-detail-top">
        <div class="hud-tag-wrap">
          <span class="part-detail-num">${part.number}</span>
          <span class="part-detail-status">${part.badge}</span>
        </div>
        <div class="hud-btn-group">
          <button type="button" class="hud-toggle-btn" data-act-hud-collapse title="${isHudCollapsed ? "Expand Telemetry HUD" : "Collapse Telemetry HUD"}">${isHudCollapsed ? "+" : "—"}</button>
          <button type="button" class="hud-close-btn" data-act-reset-view title="Return to Overview (Esc)">✕ Overview</button>
        </div>
      </div>
      <h3 class="part-detail-title">${part.name}</h3>
      <div class="part-metrics-grid">${metricsHtml}</div>
      <p class="part-desc-text">${part.desc}</p>
      <div class="part-actions-row">
        <button type="button" class="part-act-btn ${isIsolated && isolationMode === "solo" ? "is-active" : ""}" data-act-solo-iso title="Solo isolate this part on the bench">
          ${isIsolated && isolationMode === "solo" ? "✓ Isolated" : "Solo Isolate"}
        </button>
        <button type="button" class="part-act-btn ${isIsolated && isolationMode === "stack" ? "is-active" : ""}" data-act-stack-iso title="Highlight this part inside the full stack">
          In Stack
        </button>
        <button type="button" class="part-act-btn" data-act-reset-view title="Reset camera to overview and un-isolate">
          ✕ Reset View
        </button>
      </div>
    `;

    bindDetailButtons();

    // Update stepper button states
    if (stepPrevBtn) stepPrevBtn.disabled = index <= 0;
    if (stepNextBtn) stepNextBtn.disabled = index >= SUBSYSTEMS_DATA.length - 1;

    // Highlight active in list
    root.querySelectorAll(".sidebar-part-item").forEach((item, i) => {
      item.classList.toggle("active", i === index);
    });
  }

  function bindDetailButtons() {
    const collapseBtn = partDetailBox.querySelector("[data-act-hud-collapse]");
    if (collapseBtn) {
      collapseBtn.addEventListener("click", () => {
        sound.click();
        isHudCollapsed = !isHudCollapsed;
        partDetailBox.classList.toggle("is-collapsed", isHudCollapsed);
        collapseBtn.textContent = isHudCollapsed ? "+" : "—";
        collapseBtn.title = isHudCollapsed ? "Expand Telemetry HUD" : "Collapse Telemetry HUD";
      });
    }

    partDetailBox.querySelectorAll("[data-act-reset-view]").forEach((btn) => {
      btn.addEventListener("click", () => {
        resetToOverview();
      });
    });

    const soloBtn = partDetailBox.querySelector("[data-act-solo-iso]");
    if (soloBtn) {
      soloBtn.addEventListener("click", () => {
        if (isIsolated && isolationMode === "solo") {
          resetToOverview();
        } else {
          toggleIsolation("solo");
        }
      });
    }

    const stackBtn = partDetailBox.querySelector("[data-act-stack-iso]");
    if (stackBtn) {
      stackBtn.addEventListener("click", () => {
        toggleIsolation("stack");
      });
    }

    const showAllBtn = partDetailBox.querySelector("[data-act-show-all]");
    if (showAllBtn) {
      showAllBtn.addEventListener("click", () => {
        resetToOverview();
      });
    }

    const expAll = partDetailBox.querySelector("[data-act-explode-all]");
    if (expAll) {
      expAll.addEventListener("click", () => {
        toggleIsolation("off");
        setTarget(1.0);
      });
    }

    const assAll = partDetailBox.querySelector("[data-act-assemble-all]");
    if (assAll) {
      assAll.addEventListener("click", () => {
        toggleIsolation("off");
        setTarget(0.0);
      });
    }
  }

  function selectPart(index, openSide = false, isolate = true) {
    // If clicking the currently active & isolated part, toggle isolation off and reset view!
    if (index === activeIndex && isIsolated) {
      resetToOverview();
      return;
    }

    activeIndex = index;
    sound.click();

    if (openSide && sidebar) {
      sidebar.classList.add("is-open");
    }

    if (isolate) {
      isIsolated = true;
      isolationMode = "solo";
    }

    // Auto-separate internal layers to 38% if phone is clamped shut at 0%
    if (index > 0 && spring.target < 0.25) {
      setTarget(0.38);
    }

    // Auto-frame camera based on subsystem focal area
    if (camera && svgEl) {
      if (index === 6) { // Motherboard -> soc
        camera.setCameraPreset("soc");
        updateCameraButtons("soc");
      } else if (index === 8) { // Cameras -> optics
        camera.setCameraPreset("optics");
        updateCameraButtons("optics");
      } else if (index === 3 || index === 4) { // Vapor Chamber or Battery -> thermal
        camera.setCameraPreset("thermal");
        updateCameraButtons("thermal");
      } else if (index === 5) { // S Pen -> spen
        camera.setCameraPreset("spen");
        updateCameraButtons("spen");
      } else {
        camera.setCameraPreset("overview");
        updateCameraButtons("overview");
      }
    }

    renderPartDetails(activeIndex);
    applyIsolationHighlight();
    updateReadout(spring.pos);
    updateLegendButtons(isIsolated ? activeIndex : -1);

    if (window.NarrativeEngine) {
      if (isIsolated && activeIndex >= 0 && SUBSYSTEMS_DATA[activeIndex]) {
        window.NarrativeEngine.updateNarrative(SUBSYSTEMS_DATA[activeIndex].id);
      } else {
        window.NarrativeEngine.updateNarrative(spring.pos > 0.05 ? "exploding" : "assembled");
      }
    }

    if (window.CalloutPills) {
      window.CalloutPills.updatePillPositions(spring.pos, isIsolated ? activeIndex : -1);
    }
  }

  function toggleIsolation(mode) {
    sound.click();
    if (!mode || mode === "off" || mode === false) {
      isIsolated = false;
      isolationMode = "solo";
    } else if (mode === "stack") {
      isIsolated = true;
      isolationMode = "stack";
    } else {
      isIsolated = true;
      isolationMode = "solo";
    }

    applyIsolationHighlight();
    renderPartDetails(activeIndex);
    updateReadout(spring.pos);
    updateLegendButtons(isIsolated ? activeIndex : -1);

    if (window.NarrativeEngine) {
      if (isIsolated && activeIndex >= 0 && SUBSYSTEMS_DATA[activeIndex]) {
        window.NarrativeEngine.updateNarrative(SUBSYSTEMS_DATA[activeIndex].id);
      } else {
        window.NarrativeEngine.updateNarrative(spring.pos > 0.05 ? "exploding" : "assembled");
      }
    }

    if (window.CalloutPills) {
      window.CalloutPills.updatePillPositions(spring.pos, isIsolated ? activeIndex : -1);
    }
  }

  function applyIsolationHighlight() {
    if (!isIsolated || activeIndex < 0) {
      scene.classList.remove("has-isolation", "has-stack-highlight");
      groups.forEach((g) => g.el.classList.remove("is-isolated"));
    } else if (isolationMode === "stack") {
      scene.classList.remove("has-isolation");
      scene.classList.add("has-stack-highlight");
      groups.forEach((g) => {
        g.el.classList.toggle("is-isolated", g.index === activeIndex);
      });
    } else {
      // Solo mode: all other groups hidden, bench visible faint, active part 100% visible
      scene.classList.remove("has-stack-highlight");
      scene.classList.add("has-isolation");
      groups.forEach((g) => {
        g.el.classList.toggle("is-isolated", g.index === activeIndex);
      });
      if (SUBSYSTEMS_DATA[activeIndex] && SUBSYSTEMS_DATA[activeIndex].id === "spen") {
        sound.spen();
      }
    }
    kickPhysics();
  }

  /* ==========================================================================
     Event Handlers & Interactivity
     ========================================================================== */

  // Slider change
  if (slider) {
    slider.addEventListener("input", (e) => {
      stopTour();
      setTarget(Number(e.target.value) / 100, false);
    });
  }

  // Presets
  presetBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      stopTour();
      const p = Number(btn.dataset.preset);
      setTarget(p / 100);
      toggleIsolation("off");
    });
  });

  // Scene Group Click to inspect and isolate
  scene.addEventListener("click", (e) => {
    stopTour();
    const grp = e.target.closest(".assembly-group");
    if (grp) {
      const idx = Number(grp.dataset.index);
      selectPart(idx, false, true);
    }
  });

  // Stage click: clear isolation and reset to overview if clicking background canvas
  stage.addEventListener("click", (e) => {
    if (
      e.target.closest(".galaxy-inspector-hud") ||
      e.target.closest(".camera-toolbar") ||
      e.target.closest(".galaxy-controls") ||
      e.target.closest(".assembly-group") ||
      e.target.closest(".callout-pills-container") ||
      e.target.closest(".callout-pill-item") ||
      e.target.closest(".action-dock") ||
      e.target.closest("button")
    ) {
      return;
    }
    if (isIsolated || activeIndex >= 0 || (camera && camera.currentPreset !== "overview")) {
      resetToOverview();
    }
  });

  // Sidebar list item click (auto-isolates)
  if (sidebarPartsList) {
    sidebarPartsList.addEventListener("click", (e) => {
      const item = e.target.closest(".sidebar-part-item");
      if (item) {
        stopTour();
        const idx = Number(item.dataset.idx);
        selectPart(idx, false, true);
      }
    });
  }

  // Legend part buttons click
  const legendBtns = [...root.querySelectorAll(".iso-key[data-idx]")];
  legendBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      stopTour();
      const idx = Number(btn.dataset.idx);
      selectPart(idx, true, true);
    });
  });

  function updateLegendButtons(activeIdx) {
    legendBtns.forEach((btn, i) => {
      btn.classList.toggle("active", i === activeIdx);
    });
  }

  // Sidebar controls
  if (sidebarBtn) {
    sidebarBtn.addEventListener("click", () => {
      sound.click();
      if (sidebar) sidebar.classList.toggle("is-open");
    });
  }

  if (sidebarClose) {
    sidebarClose.addEventListener("click", () => {
      sound.click();
      if (sidebar) sidebar.classList.remove("is-open");
    });
  }

  if (stepPrevBtn) {
    stepPrevBtn.addEventListener("click", () => {
      if (activeIndex > 0) selectPart(activeIndex - 1, false, true);
    });
  }

  if (stepNextBtn) {
    stepNextBtn.addEventListener("click", () => {
      if (activeIndex < SUBSYSTEMS_DATA.length - 1) selectPart(activeIndex + 1, false, true);
    });
  }

  // Sound toggle
  if (soundBtn) {
    soundBtn.addEventListener("click", () => {
      soundEnabled = !soundEnabled;
      if (typeof window !== "undefined" && window.AudioSynth && window.AudioSynth.setEnabled) {
        window.AudioSynth.setEnabled(soundEnabled);
      }
      soundBtn.classList.toggle("active", soundEnabled);
      soundBtn.innerHTML = soundEnabled ? '<span class="tool-icon">🔊</span> Sound On' : '<span class="tool-icon">🔇</span> Muted';
      if (soundEnabled) sound.click();
    });
  }

  // Dynamic Theme Toggle (Dark & Light)
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      sound.click();
      const currentTheme = document.body.getAttribute("data-theme") || "dark";
      const nextTheme = currentTheme === "light" ? "dark" : "light";
      document.body.setAttribute("data-theme", nextTheme);
      themeBtn.innerHTML = nextTheme === "light" ? '<span class="tool-icon">☀️</span> Paper Light' : '<span class="tool-icon">🌙</span> Dark Titanium';
    });
  }

  // Tour toggle
  if (tourBtn) {
    tourBtn.addEventListener("click", () => {
      sound.click();
      if (isTouring) stopTour();
      else startTour();
    });
  }

  /* ==========================================================================
     Automated Calm Idle Tour
     ========================================================================== */
  const tourSteps = [0.0, 0.35, 0.70, 1.0, 0.0];
  let tourStepIdx = 0;

  function runTourStep() {
    if (!isTouring) return;
    tourStepIdx = (tourStepIdx + 1) % tourSteps.length;
    setTarget(tourSteps[tourStepIdx]);
    tourTimer = setTimeout(runTourStep, 3600);
  }

  function startTour() {
    isTouring = true;
    tourStepIdx = 0;
    if (tourBtn) tourBtn.classList.add("active");
    toggleIsolation(false);
    runTourStep();
  }

  function stopTour() {
    if (!isTouring) return;
    isTouring = false;
    clearTimeout(tourTimer);
    if (tourBtn) tourBtn.classList.remove("active");
  }

  /* ==========================================================================
     Keyboard Accessibility
     ========================================================================== */
  stage.addEventListener("keydown", (e) => {
    stopTour();
    if (e.code === "Space") {
      e.preventDefault();
      setTarget(spring.target > 0.5 ? 0.0 : 1.0);
    } else if (e.code === "ArrowRight" || e.code === "ArrowUp") {
      e.preventDefault();
      setTarget(spring.target + 0.1);
    } else if (e.code === "ArrowLeft" || e.code === "ArrowDown") {
      e.preventDefault();
      setTarget(spring.target - 0.1);
    } else if (e.code === "Escape") {
      e.preventDefault();
      resetToOverview();
      setTarget(0.0);
      if (sidebar) sidebar.classList.remove("is-open");
    } else if (e.key >= "0" && e.key <= "9") {
      e.preventDefault();
      const idx = Number(e.key);
      selectPart(idx, false, true);
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.code === "Escape") {
      resetToOverview();
    }
  });

  /* ==========================================================================
     Kinetic Engine & Subsystems Initialization
     ========================================================================== */

  // 1. Cinematic Camera
  if (typeof window !== "undefined" && window.CinematicCamera && svgEl) {
    camera = new window.CinematicCamera({ initialPreset: "overview" });
  }

  cameraBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      sound.click();
      const preset = btn.dataset.cameraPreset;

      // Toggle back to overview if clicking an already active preset
      if (btn.classList.contains("active") && preset !== "overview") {
        resetToOverview();
        return;
      }

      if (preset === "overview") {
        resetToOverview();
        return;
      }

      if (camera && svgEl) {
        camera.setCameraPreset(preset);
      }
      updateCameraButtons(preset);
      kickPhysics();

      // Correlate camera view with corresponding component telemetry & highlight
      if (preset === "soc") {
        selectPart(6, false, true);
      } else if (preset === "optics") {
        selectPart(8, false, true);
      } else if (preset === "thermal") {
        selectPart(3, false, true);
      } else if (preset === "spen") {
        selectPart(5, false, true);
      }

      // Update narrative
      if (window.NarrativeEngine) {
        if (preset === "soc") window.NarrativeEngine.updateNarrative("motherboard");
        else if (preset === "optics") window.NarrativeEngine.updateNarrative("cameras");
        else if (preset === "thermal") window.NarrativeEngine.updateNarrative("vapor_chamber");
        else if (preset === "spen") window.NarrativeEngine.updateNarrative("spen");
      }
    });
  });

  // 2. 2-Axis OIS Gyro Motion Tracking
  if (typeof window !== "undefined" && window.OisGyro) {
    window.OisGyro.initOis(stage, scene);
  }
  stage.addEventListener("pointermove", () => {
    kickPhysics();
  }, { passive: true });

  // 3. In-Canvas 3D Floating Callout Badges
  if (typeof window !== "undefined" && window.CalloutPills && svgEl) {
    window.CalloutPills.renderPills(svgEl, spring.pos, activeIndex, (idx) => {
      selectPart(idx, false, true);
    });
  }

  // 4. Kinetic Actions Trigger Dock
  if (typeof window !== "undefined" && window.KineticActions) {
    window.KineticActions.init({ root });
  }

  // 5. Dynamic Narrative Engine
  const narrativeEl = document.getElementById("galaxy-narrative");
  if (typeof window !== "undefined" && window.NarrativeEngine && narrativeEl) {
    window.NarrativeEngine.initNarrative(narrativeEl);
  }

  // Initialize
  populateSidebarList();
  renderPartDetails(-1);
  updatePresetButtons(0);

})();
