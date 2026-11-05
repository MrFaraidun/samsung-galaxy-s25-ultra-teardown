/**
 * Galaxy S25 Ultra — Interactive Engineering Anatomy Motion & Interaction Runtime
 * 
 * Controls state machine, smooth reversible spring physics, component inspection,
 * live corner readouts, dynamic specs drawer updates, and synthesized Web Audio feedback.
 */
(() => {
  "use strict";

  // =========================================================================
  // 1. HARDWARE SPECIFICATIONS & CONFIGURATION FALLBACKS
  // =========================================================================

  const FALLBACK_ASSEMBLIES = {
    rear: {
      id: "rear",
      num: "01",
      name: "Rear Enclosure & Titanium Rings",
      short: "Rear Glass & Rings",
      move: [0, 0, 95],
      tone: "mid",
      say: "satin gorilla glass · 4× titanium lens bezels · ip68 gasket",
    },
    wireless: {
      id: "wireless",
      num: "02",
      name: "Wireless Charging & NFC Flex",
      short: "Wireless Coil",
      move: [0, 0, 75],
      tone: "mid",
      say: "15w qi2 induction coil · nfc loop · graphite heat sink",
    },
    cameras: {
      id: "cameras",
      num: "03",
      name: "Quad Optical Camera Cluster",
      short: "Camera Array",
      move: [16, -12, 58],
      tone: "hi",
      say: "200mp isocell hp2 · 50mp 5× periscope prism · 50mp ultra-wide",
    },
    motherboard: {
      id: "motherboard",
      num: "04",
      name: "Snapdragon 8 Elite Logic Board",
      short: "Logic Board",
      move: [0, 0, 44],
      tone: "hi",
      say: "snapdragon 8 elite · 3nm oryon cpu · 16gb lpddr5x · shield cans",
    },
    battery: {
      id: "battery",
      num: "05",
      name: "5,000 mAh Power Cell",
      short: "Battery",
      move: [-8, 10, 28],
      tone: "mid",
      say: "5,000 mah · 19.4 wh · 45w fast charge · quick-release pull tab",
    },
    cooling: {
      id: "cooling",
      num: "06",
      name: "Vapor Chamber (+40% Area)",
      short: "Vapor Chamber",
      move: [0, 0, 14],
      tone: "mid",
      say: "4,200 mm² vapor chamber · sintered copper capillary wick",
    },
    spen: {
      id: "spen",
      num: "07",
      name: "S Pen & EMR Mechanism",
      short: "S Pen",
      move: [22, 56, 0],
      tone: "hi",
      say: "passive emr stylus · 4,096 pressure levels · push-push clicker",
    },
    midframe: {
      id: "midframe",
      num: "08",
      name: "Titanium Perimeter & CNC Chassis",
      short: "Chassis Frame",
      move: [0, 0, 0],
      tone: "mid",
      say: "grade 5 titanium rails · cnc aluminum midplate · speaker chamber",
    },
    display: {
      id: "display",
      num: "09",
      name: "Dynamic AMOLED 2X & Armor 2",
      short: "Display",
      move: [0, 0, -48],
      tone: "hi",
      say: "6.9-inch 120hz dynamic amoled 2x · gorilla armor 2 · 1.2mm bezels",
    },
  };

  const FALLBACK_ORDER = [
    "display",      // Key 1
    "midframe",     // Key 2
    "spen",         // Key 3
    "cooling",      // Key 4
    "battery",      // Key 5
    "motherboard",  // Key 6
    "cameras",      // Key 7
    "wireless",     // Key 8
    "rear",         // Key 9
  ];

  const FALLBACK_STAGGER = [
    "rear",
    "wireless",
    "cameras",
    "motherboard",
    "battery",
    "cooling",
    "spen",
    "midframe",
    "display",
  ];

  const METRIC_LABELS = {
    soc: "SoC Architecture",
    cpu: "Oryon CPU",
    gpu: "Adreno GPU",
    npu: "Hexagon NPU",
    ram: "System Memory",
    storage: "Flash Storage",
    panel: "Display Panel",
    glass: "Cover Glass",
    resolution: "Resolution & PPI",
    refreshRate: "Refresh Rate",
    peakBrightness: "Peak Brightness",
    bezels: "Symmetrical Bezels",
    outerRail: "Perimeter Rail",
    midplate: "Structural Midplate",
    chambers: "Internal Cavities",
    ingress: "Ingress Protection",
    surfaceArea: "Chamber Area",
    material: "Material & Composition",
    thickness: "Z-Thickness",
    internalWorkingFluid: "Working Fluid",
    thermalInterface: "Thermal Interface",
    capacity: "Nominal Capacity",
    voltage: "Operating Voltage",
    chemistry: "Cell Chemistry",
    charging: "Wired Charging",
    mechanism: "Mounting / Release",
    wide: "Primary Wide Lens",
    ultraWide: "Ultra-Wide Lens",
    tele3x: "3× Telephoto Lens",
    tele5x: "5× Folded Periscope",
    sensors: "Sensor Suite & Flash",
    type: "Induction Architecture",
    fastWireless: "Qi2 Wireless Charging",
    reverseShare: "PowerShare Reverse",
    nfcAntenna: "NFC / MST Antenna",
    dimensions: "Physical Dimensions",
    technology: "EMR Active Digitizer",
    pressureLevels: "Pressure Sensitivity",
    ejectionMechanism: "Ejection Clicker",
    latency: "Digitizer Latency",
    finish: "Surface Finish",
    cameraBezels: "Titanium Lens Rings",
  };

  function formatMetricKey(key) {
    if (METRIC_LABELS[key]) return METRIC_LABELS[key];
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (s) => s.toUpperCase());
  }

  function escapeHtml(str) {
    if (typeof str !== "string") return String(str ?? "");
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // =========================================================================
  // 2. ISOMETRIC PROJECTION MATHEMATICS
  // =========================================================================

  const P_CONFIG = {
    scale: 2.4033239650949123,
    azimuth: 42,
    elevation: 32,
  };

  const RAD = Math.PI / 180;
  const UNIT = Math.sqrt(1.6);
  const azimuthRad = P_CONFIG.azimuth * RAD;
  const elevationRad = P_CONFIG.elevation * RAD;
  const sinA = Math.sin(azimuthRad);
  const cosA = Math.cos(azimuthRad);
  const sinE = Math.sin(elevationRad);
  const cosE = Math.cos(elevationRad);
  const projK = P_CONFIG.scale * UNIT;

  /**
   * Projects a 3D movement delta [mx, my, mz] in physical millimeters
   * into 2D SVG screen pixel deltas [dx, dy].
   */
  function projectDelta(mx, my, mz) {
    const sx = (mx * sinA - my * cosA) * projK;
    const sy = ((mx * cosA + my * sinA) * sinE - mz * cosE) * projK;
    return [sx, sy];
  }

  // Elevation vector applied to an assembly during inspection (+16 mm Z lift)
  const [ELEVATE_DX, ELEVATE_DY] = projectDelta(0, 0, 16);

  // =========================================================================
  // 3. SYNTHESIZED WEB AUDIO FEEDBACK
  // =========================================================================

  let audioCtx = null;
  let soundEnabled = true;
  try {
    if (typeof localStorage !== "undefined") {
      soundEnabled = localStorage.getItem("s25_sound") !== "false";
    }
  } catch (e) {}

  function ensureAudioContext() {
    try {
      if (!audioCtx && typeof window !== "undefined") {
        const AudioClass = window.AudioContext || window.webkitAudioContext;
        if (AudioClass) {
          audioCtx = new AudioClass();
        }
      }
      if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume().catch(() => {});
      }
    } catch (e) {
      // Audio policy guard
    }
  }

  // Bind first gesture listener
  if (typeof window !== "undefined") {
    const unlockAudio = () => {
      ensureAudioContext();
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
    window.addEventListener("pointerdown", unlockAudio, { passive: true, once: true });
    window.addEventListener("keydown", unlockAudio, { passive: true, once: true });
  }

  function playTick() {
    if (!soundEnabled) return;
    try {
      ensureAudioContext();
      if (!audioCtx || audioCtx.state !== "running") return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(2600, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.009);
      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.009);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.009);
    } catch (e) {}
  }

  function playClick() {
    if (!soundEnabled) return;
    try {
      ensureAudioContext();
      if (!audioCtx || audioCtx.state !== "running") return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.016);
      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.016);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.016);
    } catch (e) {}
  }

  function playClose() {
    if (!soundEnabled) return;
    try {
      ensureAudioContext();
      if (!audioCtx || audioCtx.state !== "running") return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.035);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.035);
    } catch (e) {}
  }

  function playToggle() {
    if (!soundEnabled) return;
    try {
      ensureAudioContext();
      if (!audioCtx || audioCtx.state !== "running") return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.038);
      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.038);
    } catch (e) {}
  }

  function playInspect() {
    if (!soundEnabled) return;
    try {
      ensureAudioContext();
      if (!audioCtx || audioCtx.state !== "running") return;
      const now = audioCtx.currentTime;
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc1.type = "sine";
      osc2.type = "sine";
      osc1.frequency.setValueAtTime(880, now);
      osc2.frequency.setValueAtTime(1320, now);
      osc1.frequency.exponentialRampToValueAtTime(1100, now + 0.055);
      osc2.frequency.exponentialRampToValueAtTime(1650, now + 0.055);
      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.055);
      osc2.stop(now + 0.055);
    } catch (e) {}
  }

  // =========================================================================
  // 4. MOTION PHYSICS SOLVER (TIME-BASED SUBSTEPPED SPRINGS)
  // =========================================================================

  const STILLNESS_QUERY = "(prefers-reduced-motion: reduce)";
  function isReducedMotion() {
    return typeof window !== "undefined" && window.matchMedia && window.matchMedia(STILLNESS_QUERY).matches;
  }

  /**
   * Evaluates one frame of physical spring motion using 4 internal substeps
   * for numerical stability and zero velocity overshoot.
   */
  function stepSpring(state, target, dt, stiffness = 58, damping = 13.8) {
    const substeps = 4;
    const h = dt / substeps;
    for (let i = 0; i < substeps; i++) {
      const acc = (target - state.x) * stiffness - state.v * damping;
      state.v += acc * h;
      state.x += state.v * h;
    }
    if (Math.abs(target - state.x) < 5e-4 && Math.abs(state.v) < 5e-4) {
      state.x = target;
      state.v = 0;
      return true;
    }
    return false;
  }

  // =========================================================================
  // 5. RUNTIME STATE & CONTROLLER
  // =========================================================================

  function initHeroRuntime() {
    // Resolve runtime data contracts
    const data = window.__S25_DATA__ || {};
    const ASSEMBLIES = data.assemblies || FALLBACK_ASSEMBLIES;
    const ASSEMBLY_ORDER = data.assemblyOrder || FALLBACK_ORDER;
    const STAGGER_SEQUENCE = data.staggerSequence || FALLBACK_STAGGER;
    const hardwareSpecs = data.hardwareSpecs || { assemblies: [] };

    // DOM Elements Cache
    const stageEl = document.querySelector(".s25-stage") || document.querySelector(".iso-svg");
    const readoutCorner = document.querySelector('.iso-plate-corner[data-corner="readout"]');
    const liveStatus = document.getElementById("liveStatus");
    const hintCorner = document.querySelector('.iso-plate-corner[data-corner="hint"]');
    const titleCorner = document.querySelector('.iso-plate-corner[data-corner="title"]');

    const btnAssembled = document.getElementById("btnAssembled");
    const btnExploded = document.getElementById("btnExploded");
    const btnInspect = document.getElementById("btnInspect");
    const scrubInput = document.getElementById("explodeScrub");
    const scrubVal = document.getElementById("scrubVal");

    const specsDrawer = document.getElementById("specsDrawer");
    const specBadge = document.getElementById("specBadge");
    const specTitle = document.getElementById("specTitle");
    const specDesc = document.getElementById("specDesc");
    const specMetrics = document.getElementById("specMetrics");
    const specsCloseBtn = document.getElementById("specsCloseBtn");

    // Header Controls Cache
    const btnSoundToggle = document.getElementById("btnSoundToggle");
    const soundIcon = document.getElementById("soundIcon");
    const soundLabel = document.getElementById("soundLabel");

    const btnThemeToggle = document.getElementById("btnThemeToggle");
    const themeIcon = document.getElementById("themeIcon");
    const themeLabel = document.getElementById("themeLabel");

    // Responsive Parts Sidebar Cache
    const btnPartsToggle = document.getElementById("btnPartsToggle");
    const partsSidebar = document.getElementById("partsSidebar");
    const sidebarBackdrop = document.getElementById("sidebarBackdrop");
    const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");
    const isolateCheck = document.getElementById("isolateCheck");
    const sidebarExplodeToggle = document.getElementById("sidebarExplodeToggle");
    const sidebarList = document.getElementById("sidebarList");

    let isolateMode = false;

    // Interactive SVG Item Groups Cache
    const itemNodes = document.querySelectorAll(".it");
    const items = [];

    itemNodes.forEach((el, index) => {
      const piece = el.getAttribute("data-piece") || "stand";
      const name = el.getAttribute("data-name") || `item_${index}`;
      const rawMove = el.getAttribute("data-m") || "0,0,0";
      const [mx, my, mz] = rawMove.split(",").map((v) => parseFloat(v) || 0);
      const [sx, sy] = projectDelta(mx, my, mz);

      // Disable CSS transition on transform so JS spring maintains 60fps frame precision
      el.style.transition = "opacity 0.24s cubic-bezier(0.16, 1, 0.3, 1), filter 0.24s cubic-bezier(0.16, 1, 0.3, 1)";

      items.push({
        el,
        piece,
        name,
        mx,
        my,
        mz,
        sx,
        sy,
      });
    });

    // Helper: Lookup detailed hardware spec
    function getAssemblySpec(pieceId) {
      const list = hardwareSpecs.assemblies || [];
      return (
        list.find(
          (a) =>
            a.id === pieceId ||
            (pieceId === "wireless" && a.id === "wireless_coil") ||
            (pieceId === "wireless_coil" && a.id === "wireless")
        ) || null
      );
    }

    // State Variables
    let currentMode = "assembled"; // 'assembled' | 'exploded' | 'inspect'
    let inspectedAssembly = null;
    let globalProgress = 0.0;
    let lastScrubTickPct = 0;
    let hoveredPiece = null;

    // Springs per assembly
    const springs = {};
    const inspectState = {};

    STAGGER_SEQUENCE.forEach((id) => {
      springs[id] = {
        x: 0.0,
        v: 0.0,
        target: 0.0,
        pending: null,
      };
      inspectState[id] = {
        elevate: 0.0,
        targetElevate: 0.0,
        elevateV: 0.0,
      };
    });

    // Animation Loop Control
    let animFrame = 0;
    let lastFrameTime = 0;

    function renderScene() {
      // Render each SVG item group
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const piece = item.piece;
        const sp = springs[piece];
        const pProgress = sp ? sp.x : globalProgress;

        const insp = inspectState[piece];
        const pElevate = insp ? insp.elevate : 0.0;

        let curDx = item.sx * pProgress;
        let curDy = item.sy * pProgress;

        if (pElevate > 0.0001) {
          curDx += ELEVATE_DX * pElevate;
          curDy += ELEVATE_DY * pElevate;
        }

        const tx = curDx.toFixed(2);
        const ty = curDy.toFixed(2);
        item.el.style.transform = `translate(${tx}px, ${ty}px)`;
        item.el.setAttribute("transform", `translate(${tx} ${ty})`);
      }

      // Update Scrubber Position when not scrubbing directly
      if (scrubInput && !scrubInput.matches(":active")) {
        let sumX = 0;
        let count = 0;
        for (const id of STAGGER_SEQUENCE) {
          sumX += springs[id].x;
          count++;
        }
        const avg = count > 0 ? sumX / count : globalProgress;
        const pct = Math.round(avg * 100);
        scrubInput.value = pct;
        if (scrubVal) scrubVal.textContent = `${pct}%`;
      }
    }

    function tick(now) {
      const dt = lastFrameTime ? Math.min((now - lastFrameTime) / 1000, 1 / 30) : 1 / 60;
      lastFrameTime = now;
      const calm = isReducedMotion();

      let isMoving = false;

      // Advance springs
      for (const id of STAGGER_SEQUENCE) {
        const sp = springs[id];

        // Process scheduled stagger start time
        if (sp.pending && now >= sp.pending.at) {
          sp.target = sp.pending.value;
          sp.pending = null;
        }

        if (calm) {
          sp.x = sp.target;
          sp.v = 0;
          sp.pending = null;
        } else {
          const settled = stepSpring(sp, sp.target, dt, 58, 13.8);
          if (!settled || sp.pending) isMoving = true;
        }

        // Advance inspect elevation spring
        const insp = inspectState[id];
        if (calm) {
          insp.elevate = insp.targetElevate;
          insp.elevateV = 0;
        } else {
          const settledElevate = stepSpring(
            { x: insp.elevate, v: insp.elevateV },
            insp.targetElevate,
            dt,
            72,
            16.2
          );
          insp.elevate = settledElevate ? insp.targetElevate : insp.elevate;
          if (!settledElevate) isMoving = true;
        }
      }

      renderScene();

      if (isMoving) {
        animFrame = requestAnimationFrame(tick);
      } else {
        animFrame = 0;
        lastFrameTime = 0;
      }
    }

    function wakeLoop() {
      if (!animFrame) {
        lastFrameTime = performance.now();
        animFrame = requestAnimationFrame(tick);
      }
    }

    // =======================================================================
    // 6. READOUTS & UI CARD UPDATES
    // =======================================================================

    function updateReadout(text, statusText, extra = {}) {
      if (readoutCorner) readoutCorner.textContent = text;
      document.querySelectorAll(".rp-live").forEach((el) => {
        el.textContent = text;
      });
      if (liveStatus && statusText) liveStatus.textContent = statusText;
      if (hintCorner && extra.hint) hintCorner.textContent = extra.hint;
      if (titleCorner && extra.title) titleCorner.textContent = extra.title;
    }

    function updateSpecsDrawer(pieceId) {
      const asmb = ASSEMBLIES[pieceId];
      if (!asmb) return;
      const spec = getAssemblySpec(pieceId);

      if (specBadge) specBadge.textContent = `Assembly ${asmb.num}`;
      if (specTitle) specTitle.textContent = spec?.name || asmb.name;
      if (specDesc) specDesc.textContent = spec?.description || asmb.say;

      if (specMetrics) {
        const specsObj = spec?.specs || {};
        const rows = Object.entries(specsObj).map(([key, val]) => `
          <div class="metric-row">
            <span class="metric-label">${escapeHtml(formatMetricKey(key))}</span>
            <span class="metric-val">${escapeHtml(val)}</span>
          </div>
        `);
        specMetrics.innerHTML = rows.join("");
      }

      if (specsDrawer) {
        specsDrawer.classList.add("open");
        specsDrawer.classList.add("active");
      }
    }

    function closeSpecsDrawer() {
      if (specsDrawer) {
        specsDrawer.classList.remove("open");
        specsDrawer.classList.remove("active");
      }
    }

    function restoreModeReadout() {
      if (currentMode === "inspect" && inspectedAssembly) {
        const asmb = ASSEMBLIES[inspectedAssembly];
        if (asmb) {
          updateReadout(
            `${asmb.num}/09 · ${asmb.short.toLowerCase()} · ${asmb.say}`,
            `Inspecting Assembly ${asmb.num}: ${asmb.name}`,
            {
              hint: "Arrow Keys to Cycle · Esc to Return · Space to Toggle",
              title: `GALAXY S25 ULTRA · ${asmb.name.toUpperCase()}`,
            }
          );
        }
      } else if (currentMode === "assembled") {
        updateReadout("cold · 218 g · assembled", "Titanium Chassis Seated · Assembled", {
          hint: "Space to Explode · 1–9 to Inspect · Esc to Reset",
          title: "GALAXY S25 ULTRA · 162.8 × 77.6 × 8.2 mm",
        });
      } else {
        const pct = Math.round(globalProgress * 100);
        updateReadout(`separation ${pct}% · 9 assemblies · 218 g`, `Exploded View · ${pct}% Separation`, {
          hint: "Space to Assemble · 1–9 to Inspect · Scrub to Adjust",
          title: "GALAXY S25 ULTRA · EXPLODED ARCHITECTURE",
        });
      }
    }

    // =======================================================================
    // 7. STATE TRANSITIONS
    // =======================================================================

    function setExplodedState(targetGoal) {
      const now = performance.now();
      const order = targetGoal === 1 ? STAGGER_SEQUENCE : [...STAGGER_SEQUENCE].reverse();
      const staggerDelay = 0.035 * 1000; // 35ms stagger between layers

      order.forEach((id, index) => {
        const sp = springs[id];
        if (sp) {
          if (isReducedMotion()) {
            sp.target = targetGoal;
            sp.x = targetGoal;
            sp.v = 0;
            sp.pending = null;
          } else {
            sp.pending = {
              value: targetGoal,
              at: now + index * staggerDelay,
            };
          }
        }
      });

      globalProgress = targetGoal;
      wakeLoop();
    }

    function applyIsolationStyles(assemblyId) {
      items.forEach((item) => {
        if (item.piece === assemblyId) {
          item.el.classList.add("selected", "is-active");
          item.el.classList.remove("subdued", "is-dimmed", "is-isolated-hidden");
          item.el.style.opacity = "1";
        } else if (item.piece === "stand") {
          item.el.classList.remove("selected", "is-active", "subdued", "is-dimmed", "is-isolated-hidden");
          item.el.style.opacity = isolateMode ? "0.12" : "";
        } else {
          item.el.classList.add("subdued", "is-dimmed");
          item.el.classList.remove("selected", "is-active");
          if (isolateMode) {
            item.el.classList.add("is-isolated-hidden");
            item.el.style.opacity = "0.04";
          } else {
            item.el.classList.remove("is-isolated-hidden");
            item.el.style.opacity = "";
          }
        }
      });
    }

    function inspectAssembly(assemblyId) {
      if (!ASSEMBLIES[assemblyId]) return;

      currentMode = "inspect";
      inspectedAssembly = assemblyId;

      // Ensure assemblies are separated so internal components are fully visible
      if (globalProgress < 0.6) {
        setExplodedState(1.0);
      }

      // Update inspection elevation targets
      for (const id of STAGGER_SEQUENCE) {
        const insp = inspectState[id];
        if (insp) {
          insp.targetElevate = id === assemblyId ? 1.0 : 0.0;
        }
      }

      // Update Stage Selection Cascade
      if (stageEl) {
        stageEl.classList.add("has-selection");
      }

      // Apply isolation styles (full or dimmed)
      applyIsolationStyles(assemblyId);

      // Update Mode Buttons
      btnAssembled?.classList.remove("active");
      btnExploded?.classList.remove("active");
      btnInspect?.classList.add("active");

      // Update Legend Chips
      document.querySelectorAll(".legend-chip").forEach((chip) => {
        chip.classList.toggle("active", chip.getAttribute("data-part") === assemblyId);
      });

      // Update Sidebar Cards & Status
      document.querySelectorAll(".sidebar-part-card").forEach((card) => {
        const pId = card.getAttribute("data-part");
        const isTarget = pId === assemblyId;
        card.classList.toggle("active", isTarget);
        const statusEl = document.getElementById(`part-status-${pId}`);
        if (statusEl) {
          statusEl.textContent = isTarget ? "Inspecting" : (globalProgress > 0.05 ? "Exploded" : "Seated");
        }
      });

      const activeSideCard = document.getElementById(`sidepart-${assemblyId}`);
      if (activeSideCard && partsSidebar && partsSidebar.classList.contains("open")) {
        activeSideCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }

      // Update Specs Drawer & Readouts
      updateSpecsDrawer(assemblyId);

      const asmb = ASSEMBLIES[assemblyId];
      updateReadout(
        `${asmb.num}/09 · ${asmb.short.toLowerCase()} · ${asmb.say}`,
        `Inspecting Assembly ${asmb.num}: ${asmb.name}`,
        {
          hint: "Arrow Keys to Cycle · Esc to Return · Space to Toggle",
          title: `GALAXY S25 ULTRA · ${asmb.name.toUpperCase()}`,
        }
      );

      playInspect();
      wakeLoop();
    }

    function closeInspection(targetMode = "exploded") {
      inspectedAssembly = null;
      currentMode = targetMode;

      // Reset inspect elevations
      for (const id of STAGGER_SEQUENCE) {
        const insp = inspectState[id];
        if (insp) {
          insp.targetElevate = 0.0;
        }
      }

      // Remove stage selection cascade
      if (stageEl) {
        stageEl.classList.remove("has-selection");
      }

      // Reset item focus classes & opacities
      items.forEach((item) => {
        item.el.classList.remove("selected", "is-active", "subdued", "is-dimmed", "is-isolated-hidden");
        item.el.style.opacity = "";
      });

      // Reset legend chips
      document.querySelectorAll(".legend-chip").forEach((chip) => {
        chip.classList.remove("active");
      });

      // Reset sidebar cards
      document.querySelectorAll(".sidebar-part-card").forEach((card) => {
        card.classList.remove("active");
        const pId = card.getAttribute("data-part");
        const statusEl = document.getElementById(`part-status-${pId}`);
        if (statusEl) {
          statusEl.textContent = targetMode === "assembled" ? "Seated" : "Exploded";
        }
      });

      closeSpecsDrawer();

      if (targetMode === "assembled") {
        btnAssembled?.classList.add("active");
        btnExploded?.classList.remove("active");
        btnInspect?.classList.remove("active");
        setExplodedState(0.0);
        updateReadout("cold · 218 g · assembled", "Titanium Chassis Seated · Assembled", {
          hint: "Space to Explode · 1–9 to Inspect · Esc to Reset",
          title: "GALAXY S25 ULTRA · 162.8 × 77.6 × 8.2 mm",
        });
      } else {
        btnAssembled?.classList.remove("active");
        btnExploded?.classList.add("active");
        btnInspect?.classList.remove("active");
        setExplodedState(1.0);
        updateReadout("separation 100% · 9 assemblies · 218 g", "Exploded View · 100% Separation", {
          hint: "Space to Assemble · 1–9 to Inspect · Scrub to Adjust",
          title: "GALAXY S25 ULTRA · EXPLODED ARCHITECTURE",
        });
      }

      playClose();
      wakeLoop();
    }

    function setMode(newMode) {
      if (newMode === "assembled") {
        if (currentMode === "inspect") {
          closeInspection("assembled");
        } else {
          currentMode = "assembled";
          btnAssembled?.classList.add("active");
          btnExploded?.classList.remove("active");
          btnInspect?.classList.remove("active");
          setExplodedState(0.0);
          updateReadout("cold · 218 g · assembled", "Titanium Chassis Seated · Assembled", {
            hint: "Space to Explode · 1–9 to Inspect · Esc to Reset",
            title: "GALAXY S25 ULTRA · 162.8 × 77.6 × 8.2 mm",
          });
          playToggle();
        }
      } else if (newMode === "exploded") {
        if (currentMode === "inspect") {
          closeInspection("exploded");
        } else {
          currentMode = "exploded";
          btnAssembled?.classList.remove("active");
          btnExploded?.classList.add("active");
          btnInspect?.classList.remove("active");
          setExplodedState(1.0);
          updateReadout("separation 100% · 9 assemblies · 218 g", "Exploded View · 100% Separation", {
            hint: "Space to Assemble · 1–9 to Inspect · Scrub to Adjust",
            title: "GALAXY S25 ULTRA · EXPLODED ARCHITECTURE",
          });
          playToggle();
        }
      } else if (newMode === "inspect") {
        const targetId = inspectedAssembly || "motherboard";
        inspectAssembly(targetId);
      }
    }

    function toggleExploded() {
      if (currentMode === "inspect") {
        closeInspection("assembled");
      } else if (currentMode === "assembled") {
        setMode("exploded");
      } else {
        setMode("assembled");
      }
    }

    function cycleInspect(direction) {
      let nextId = "display";
      if (inspectedAssembly) {
        const currIdx = ASSEMBLY_ORDER.indexOf(inspectedAssembly);
        if (currIdx !== -1) {
          const nextIdx = (currIdx + direction + ASSEMBLY_ORDER.length) % ASSEMBLY_ORDER.length;
          nextId = ASSEMBLY_ORDER[nextIdx];
        }
      } else {
        nextId = direction > 0 ? ASSEMBLY_ORDER[0] : ASSEMBLY_ORDER[ASSEMBLY_ORDER.length - 1];
      }
      inspectAssembly(nextId);
    }

    function handleScrub(val) {
      const progress = Math.max(0, Math.min(100, val)) / 100;
      globalProgress = progress;

      // Direct synchronous update on scrub (instant response)
      for (const id of STAGGER_SEQUENCE) {
        const sp = springs[id];
        if (sp) {
          sp.pending = null;
          sp.target = progress;
          sp.x = progress;
          sp.v = 0;
        }
      }

      const pct = Math.round(progress * 100);
      if (scrubVal) scrubVal.textContent = `${pct}%`;

      if (currentMode !== "inspect") {
        if (pct === 0) {
          currentMode = "assembled";
          btnAssembled?.classList.add("active");
          btnExploded?.classList.remove("active");
          btnInspect?.classList.remove("active");
          updateReadout("cold · 218 g · assembled", "Titanium Chassis Seated · Assembled", {
            hint: "Space to Explode · 1–9 to Inspect · Esc to Reset",
            title: "GALAXY S25 ULTRA · 162.8 × 77.6 × 8.2 mm",
          });
        } else {
          currentMode = "exploded";
          btnAssembled?.classList.remove("active");
          btnExploded?.classList.add("active");
          btnInspect?.classList.remove("active");
          updateReadout(`separation ${pct}% · 9 assemblies · 218 g`, `Exploded View · ${pct}% Separation`, {
            hint: "Space to Assemble · 1–9 to Inspect · Scrub to Adjust",
            title: "GALAXY S25 ULTRA · EXPLODED ARCHITECTURE",
          });
        }
      }

      if (Math.abs(pct - lastScrubTickPct) >= 5) {
        lastScrubTickPct = pct;
        playTick();
      }

      wakeLoop();
    }

    // =======================================================================
    // 8. EVENT LISTENERS & INTERACTION CONTROLLERS
    // =======================================================================

    // Theme Toggle Controller
    function applyTheme(theme) {
      document.body.setAttribute("data-theme", theme);
      const isoEl = document.querySelector(".iso");
      if (isoEl) isoEl.setAttribute("data-theme", theme);
      
      if (themeIcon) themeIcon.textContent = theme === "light" ? "☽" : "☼";
      if (themeLabel) themeLabel.textContent = theme === "light" ? "Dark" : "Light";
      try {
        localStorage.setItem("s25_theme", theme);
      } catch (e) {}
    }

    try {
      const savedTheme = localStorage.getItem("s25_theme");
      if (savedTheme) {
        applyTheme(savedTheme);
      }
    } catch (e) {}

    btnThemeToggle?.addEventListener("click", () => {
      const current = document.body.getAttribute("data-theme") === "light" ? "light" : "dark";
      const next = current === "light" ? "dark" : "light";
      applyTheme(next);
      playToggle();
    });

    // Audio Feedback Controller
    function updateSoundUI() {
      if (soundIcon) soundIcon.textContent = soundEnabled ? "🔊" : "🔇";
      if (soundLabel) soundLabel.textContent = soundEnabled ? "Sound" : "Muted";
      btnSoundToggle?.classList.toggle("active", soundEnabled);
    }
    updateSoundUI();

    btnSoundToggle?.addEventListener("click", () => {
      soundEnabled = !soundEnabled;
      try {
        localStorage.setItem("s25_sound", soundEnabled ? "true" : "false");
      } catch (e) {}
      updateSoundUI();
      if (soundEnabled) {
        ensureAudioContext();
        playClick();
      }
    });

    // Responsive Parts Sidebar Controller
    function toggleSidebar(forceState) {
      if (!partsSidebar) return;
      const willOpen = typeof forceState === "boolean" ? forceState : !partsSidebar.classList.contains("open");
      partsSidebar.classList.toggle("open", willOpen);
      partsSidebar.setAttribute("aria-hidden", (!willOpen).toString());
      sidebarBackdrop?.classList.toggle("active", willOpen);
      btnPartsToggle?.classList.toggle("active", willOpen);
      if (willOpen) {
        playClick();
        if (inspectedAssembly) {
          const activeCard = document.getElementById(`sidepart-${inspectedAssembly}`);
          if (activeCard) activeCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      } else {
        playClose();
      }
    }

    btnPartsToggle?.addEventListener("click", () => toggleSidebar());
    sidebarCloseBtn?.addEventListener("click", () => toggleSidebar(false));
    sidebarBackdrop?.addEventListener("click", () => toggleSidebar(false));

    sidebarExplodeToggle?.addEventListener("click", () => {
      toggleExploded();
      if (sidebarExplodeToggle) {
        sidebarExplodeToggle.textContent = globalProgress > 0.5 ? "Assemble View" : "Explode View";
      }
    });

    isolateCheck?.addEventListener("change", (e) => {
      isolateMode = e.target.checked;
      playClick();
      if (currentMode === "inspect" && inspectedAssembly) {
        applyIsolationStyles(inspectedAssembly);
      }
    });

    if (sidebarList) {
      sidebarList.addEventListener("click", (e) => {
        const btn = e.target.closest(".sidebar-action-btn");
        const card = e.target.closest(".sidebar-part-card");
        if (!card) return;
        const part = card.getAttribute("data-part");
        if (!part) return;

        if (btn && btn.getAttribute("data-action") === "isolate") {
          isolateMode = true;
          if (isolateCheck) isolateCheck.checked = true;
        }
        inspectAssembly(part);
      });
    }

    // Control buttons
    btnAssembled?.addEventListener("click", () => {
      playClick();
      setMode("assembled");
    });
    btnExploded?.addEventListener("click", () => {
      playClick();
      setMode("exploded");
    });
    btnInspect?.addEventListener("click", () => {
      playClick();
      setMode("inspect");
    });

    // Scrubber input
    if (scrubInput) {
      scrubInput.addEventListener("input", (e) => {
        handleScrub(parseFloat(e.target.value));
      });
    }

    // Specs drawer close button
    if (specsCloseBtn) {
      specsCloseBtn.addEventListener("click", () => {
        playClose();
        closeInspection(globalProgress > 0.4 ? "exploded" : "assembled");
      });
    }

    // Legend chips
    document.querySelectorAll(".legend-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const part = chip.getAttribute("data-part");
        if (part) {
          playClick();
          inspectAssembly(part);
        }
      });
    });

    // Stage Event Delegation for Seamless Pointer & Click Handling
    if (stageEl) {
      stageEl.addEventListener("click", (e) => {
        const it = e.target.closest(".it");
        if (!it) return;
        const piece = it.getAttribute("data-piece");
        if (piece && piece !== "stand") {
          inspectAssembly(piece);
        }
      });

      stageEl.addEventListener("pointerover", (e) => {
        const it = e.target.closest(".it");
        const piece = it ? it.getAttribute("data-piece") : null;
        if (!piece || piece === "stand") {
          if (hoveredPiece) {
            document.querySelectorAll(".it.it-hover").forEach((p) => p.classList.remove("it-hover"));
            hoveredPiece = null;
            restoreModeReadout();
          }
          return;
        }

        if (hoveredPiece !== piece) {
          document.querySelectorAll(".it.it-hover").forEach((p) => p.classList.remove("it-hover"));
          hoveredPiece = piece;
          playTick();

          document.querySelectorAll(`.it[data-piece="${piece}"]`).forEach((p) => p.classList.add("it-hover"));
          const asmb = ASSEMBLIES[piece];
          if (asmb) {
            if (currentMode !== "inspect") {
              updateReadout(
                `${asmb.num}/09 · ${asmb.short.toLowerCase()} · ${asmb.say}`,
                `${asmb.name} · Click to Inspect`
              );
            } else if (piece !== inspectedAssembly) {
              if (liveStatus) liveStatus.textContent = `Previewing: ${asmb.name}`;
            }
          }
        }
      });

      stageEl.addEventListener("pointerleave", () => {
        if (hoveredPiece) {
          document.querySelectorAll(".it.it-hover").forEach((p) => p.classList.remove("it-hover"));
          hoveredPiece = null;
          restoreModeReadout();
        }
      });
    }

    // Direct per-group fallback listeners
    items.forEach((item) => {
      const el = item.el;
      const piece = item.piece;
      if (!piece || piece === "stand") return;

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        inspectAssembly(piece);
      });
    });

    // Keyboard Shortcuts
    window.addEventListener("keydown", (e) => {
      // Ignore if user is inside a form input or editable field
      if (
        e.target &&
        ((e.target.tagName === "INPUT" && e.target.type === "text") ||
          e.target.tagName === "TEXTAREA" ||
          e.target.isContentEditable)
      ) {
        return;
      }

      const key = e.key;

      if (e.code === "Space" || key === " " || key === "Spacebar") {
        e.preventDefault();
        toggleExploded();
      } else if (key === "Enter") {
        if (!e.target || e.target.tagName !== "BUTTON") {
          e.preventDefault();
          toggleExploded();
        }
      } else if (key === "Escape") {
        e.preventDefault();
        if (partsSidebar && partsSidebar.classList.contains("open")) {
          toggleSidebar(false);
        } else if (currentMode === "inspect") {
          closeInspection("assembled");
        } else {
          setMode("assembled");
        }
      } else if (key >= "1" && key <= "9") {
        e.preventDefault();
        const idx = parseInt(key, 10) - 1;
        if (idx >= 0 && idx < ASSEMBLY_ORDER.length) {
          inspectAssembly(ASSEMBLY_ORDER[idx]);
        }
      } else if (key === "ArrowLeft") {
        e.preventDefault();
        cycleInspect(-1);
      } else if (key === "ArrowRight") {
        e.preventDefault();
        cycleInspect(1);
      }
    });

    // Dynamic Reduced Motion Listener
    if (typeof window !== "undefined" && window.matchMedia) {
      const mql = window.matchMedia(STILLNESS_QUERY);
      if (mql.addEventListener) {
        mql.addEventListener("change", () => {
          wakeLoop();
        });
      }
    }

    // Initial Render
    renderScene();
    restoreModeReadout();

    // Export test & programmatic API hook
    window.__S25_HERO__ = {
      getState: () => ({
        mode: currentMode,
        inspected: inspectedAssembly,
        progress: globalProgress,
      }),
      setMode,
      inspect: inspectAssembly,
      closeInspection,
      toggle: toggleExploded,
      setSeparation: handleScrub,
    };
  }

  // Self-boot on ready
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initHeroRuntime);
    } else {
      initHeroRuntime();
    }
  }
})();
