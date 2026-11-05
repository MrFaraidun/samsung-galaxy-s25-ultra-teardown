/**
 * Galaxy S25 Ultra — Isometric Geometry Engine
 * Built using the installed Anatomy engineering illustration kit.
 * True painter's depth ordering, solid volumes with 4-tone shading,
 * realistic component seating, physical thickness, and zero floating line ends.
 */
import * as k from "../kit/iso-kit.mjs";
import * as G from "../kit/lathe.mjs";
import * as A from "../kit/audit.mjs";
import {
  PHONE,
  PLAN,
  BASE_PLATE,
  BASE_H,
  FOOT_H,
  P,
  V,
  ASSEMBLIES,
  ASSEMBLY_ORDER,
  STAGGER_SEQUENCE,
  at,
  S,
  Ln,
  Dots,
} from "./model.mjs";
import { buildAssemblyIllumination } from "./illumination.mjs";

export function buildScene(options = {}) {
  const auditMode = options.audit ?? false;
  const theme = options.theme ?? "dark";

  // Initialize Anatomy recorder with spring animation and stagger order
  const SPRING = { stagger: 0.04, stiffness: 58, damping: 13.8, substeps: 4 };
  const R = A.recorder(P, { order: STAGGER_SEQUENCE, spring: SPRING });
  const { nameFor } = R;

  const PIECE_BIAS = {
    stand: -500,
    display: 0,
    midframe: 200,
    spen: 250,
    cooling: 300,
    battery: 400,
    motherboard: 450,
    cameras: 550,
    wireless: 650,
    rear: 800,
  };

  function put(piece, refPoint, svg, { bias = 0, move, ride, shapes = [], name } = {}) {
    const moveVec = move ?? ASSEMBLIES[piece]?.move ?? [0, 0, 0];
    const itemName = name ?? nameFor(`${piece}.item`);
    const totalBias = (PIECE_BIAS[piece] ?? 0) + bias;
    R.put({
      piece,
      ride: ride ?? piece,
      at: refPoint,
      bias: totalBias,
      svg,
      move: moveVec,
      shapes,
      name: itemName,
    });
  }

  // =========================================================================
  // 00. EXHIBITION PEDESTAL & GROUND PLATE (Stand - Fixed Background)
  // =========================================================================
  // Soft ambient halo under the exhibition base
  put("stand", [0, 0, -BASE_H - FOOT_H], `<path class="iso-halo" d="${k.haloOf(BASE_PLATE, -BASE_H - FOOT_H, 14, P)}" />`, {
    name: "stand.halo",
  });

  // Architectural Turned Legs & Cross-Stretchers (Matching Anatomy Sorting Desk)
  const zGround = -BASE_H - FOOT_H;
  const zStretcher = zGround + 12.0;

  // Four vibration-damping foot halos on the slate floor
  const footCorners = k.corners(BASE_PLATE, 12);
  const sortedFeet = [...footCorners].sort(
    (a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P)
  );

  sortedFeet.forEach(([fx, fy], idx) => {
    put("stand", [fx, fy, zGround], `<path class="iso-halo" d="${k.haloOf({ x: fx - 8, y: fy - 8, w: 16, d: 16, r: 8 }, zGround, 8, P)}" />`, {
      name: `stand.halo_${idx}`,
    });
  });

  // Turned legs with collar, shaft, knuckle and bell foot
  sortedFeet.forEach(([fx, fy], idx) => {
    const bellFoot = k.cylinder(fx, fy, 5.6, zGround, 2.4, P, 24);
    const footCollar = k.cylinder(fx, fy, 4.4, zGround + 2.4, 1.8, P, 24);
    const lowerShaft = k.cylinder(fx, fy, 3.2, zGround + 4.2, 7.8, P, 24);
    const knuckle = k.cylinder(fx, fy, 4.8, zStretcher - 1.2, 2.6, P, 24);
    const upperShaft = k.cylinder(fx, fy, 3.4, zStretcher + 1.4, 6.6, P, 24);
    const topCollar = k.cylinder(fx, fy, 5.4, -BASE_H - 3.0, 3.0, P, 24);

    const legSvg = S(bellFoot, { tone: "mid" }) +
      S(footCollar, { tone: "lo" }) +
      S(lowerShaft, { tone: "mid" }) +
      S(knuckle, { tone: "hi" }) +
      S(upperShaft, { tone: "mid" }) +
      S(topCollar, { tone: "lo" });

    put("stand", [fx, fy, zGround + 12], legSvg, {
      name: `stand.leg_${idx}`,
    });
  });

  // Cross-Stretchers (Bracing rails connecting legs at knuckle height)
  const xs = sortedFeet.map((f) => f[0]).sort((a, b) => a - b);
  const ys = sortedFeet.map((f) => f[1]).sort((a, b) => a - b);
  const minX = xs[0], maxX = xs[xs.length - 1];
  const minY = ys[0], maxY = ys[ys.length - 1];

  const leftRail = k.slabOf({ x: minX - 1.1, y: minY + 2.5, w: 2.2, d: maxY - minY - 5.0, r: 0.8 }, zStretcher - 1.0, 2.0, P, 4, 0);
  const rightRail = k.slabOf({ x: maxX - 1.1, y: minY + 2.5, w: 2.2, d: maxY - minY - 5.0, r: 0.8 }, zStretcher - 1.0, 2.0, P, 4, 0);
  const frontRail = k.slabOf({ x: minX + 2.5, y: maxY - 1.1, w: maxX - minX - 5.0, d: 2.2, r: 0.8 }, zStretcher - 1.0, 2.0, P, 4, 0);
  const backRail = k.slabOf({ x: minX + 2.5, y: minY - 1.1, w: maxX - minX - 5.0, d: 2.2, r: 0.8 }, zStretcher - 1.0, 2.0, P, 4, 0);

  put("stand", [0, 0, zStretcher], S(backRail, { tone: "lo" }) + S(leftRail, { tone: "mid" }) + S(rightRail, { tone: "mid" }) + S(frontRail, { tone: "hi" }), {
    name: "stand.stretchers",
  });

  // Main base workbench table slab
  const baseSlab = k.slabOf(BASE_PLATE, -BASE_H, BASE_H, P, 8, 1.4);
  const baseGroove = k.planOutline(k.insetPlan(BASE_PLATE, 4.5), 0, P, 8);
  put("stand", [0, 0, -BASE_H / 2], S(baseSlab, { tone: "mid", inner: Ln(baseGroove, { tone: "faint" }) }), {
    bias: -100,
    name: "stand.base_slab",
  });

  // Four corner Torx mounting screws
  const screwPoints = k.corners(BASE_PLATE, 8);
  screwPoints.forEach(([sx, sy], idx) => {
    const screwRing = k.ring(sx, sy, 2.0, 0, P, 16);
    put("stand", [sx, sy, 0], Ln(screwRing, { tone: "lo" }) + Dots([[sx, sy, 0]], { size: 0.52, tone: "mid" }), {
      name: `stand.screw_${idx}`,
    });
  });

  // Precision millimeter engineering ruler strip on base plate
  const rulerStrip = { x: BASE_PLATE.x + BASE_PLATE.w - 11, y: -68, w: 6.5, d: 136, r: 1.0 };
  const rulerSlab = k.slabOf(rulerStrip, 0, 0.5, P, 4, 0);
  const ticks = k.topTicks(
    rulerStrip.y + 4,
    rulerStrip.y + rulerStrip.d - 4,
    2.5,
    4,
    rulerStrip.x,
    0.5,
    [1.8, 3.2],
    P,
    "y"
  );
  put("stand", [rulerStrip.x, 0, 0.25], S(rulerSlab, { tone: "lo" }) + Ln(ticks.minor, { tone: "lo", free: true }) + Ln(ticks.major, { tone: "mid", free: true }), {
    name: "stand.ruler_strip",
  });

  // Engraved Titanium Specification Label Plate
  const labelPlan = { x: -28, y: BASE_PLATE.y + 3.8, w: 56, d: 11, r: 1.8 };
  const labelSlab = k.slabOf(labelPlan, 0, 0.6, P, 4, 0);
  const labelInset = k.planOutline(k.insetPlan(labelPlan, 1.2), 0.6, P, 4);
  const ruleL1 = k.lineOnTop([-22, labelPlan.y + 3.4], [18, labelPlan.y + 3.4], 0.6, P);
  const ruleL2 = k.lineOnTop([-22, labelPlan.y + 6.0], [12, labelPlan.y + 6.0], 0.6, P);
  const ruleL3 = k.lineOnTop([-22, labelPlan.y + 8.6], [22, labelPlan.y + 8.6], 0.6, P);
  put("stand", [0, labelPlan.y + 5.5, 0.3], S(labelSlab, { tone: "lo", inner: Ln(labelInset, { tone: "faint" }) }) + Ln(ruleL1, { tone: "lo", free: true }) + Ln(ruleL2, { tone: "lo", free: true }) + Ln(ruleL3, { tone: "lo", free: true }) + Dots([[-24, labelPlan.y + 5.5, 0.6], [24, labelPlan.y + 5.5, 0.6]], { size: 0.45, tone: "mid" }), {
    name: "stand.label_plate",
  });

  // =========================================================================
  // 01. DISPLAY ASSEMBLY (`display`) — Dynamic AMOLED 2X + Gorilla Armor 2
  // Exploded move: [0, 0, -48]
  // =========================================================================
  {
    const dz = 0; // Local z reference inside display assembly

    // Layer 1: Gorilla Armor 2 Front Glass Cover (with 2.5D micro-bevel)
    const glassSlab = k.slabOf(PLAN, dz, 0.65, P, 8, 0.6);
    const glassSeam = k.sideSeam(PLAN, dz + 0.35, P, 8);
    put("display", [0, 0, dz + 0.35], S(glassSlab, { tone: "hi", inner: Ln(glassSeam, { tone: "faint" }) }), {
      name: "display.cover_glass",
    });

    // Layer 2: 1.2mm Symmetrical Ultra-Narrow Bezel Mask & Ear Slit
    const bezelPlan = k.insetPlan(PLAN, PHONE.screenBezel);
    const bezelOutline = k.planOutline(bezelPlan, dz + 0.65, P, 8);
    const earY = -PHONE.d / 2 + 0.8;
    const earSlit = k.lineOnTop([-7, earY], [7, earY], dz + 0.65, P);
    put("display", [0, -PHONE.d / 2 + 10, dz + 0.65], Ln(bezelOutline, { tone: "mid" }) + Ln(earSlit, { tone: "hi" }), {
      name: "display.bezel_and_earpiece",
    });

    // Layer 3: Dynamic AMOLED 2X Active Matrix Screen Substrate
    const screenPlan = k.insetPlan(bezelPlan, 0.4);
    const screenSlab = k.slabOf(screenPlan, dz - 0.4, 0.4, P, 6, 0);
    put("display", [0, 0, dz - 0.2], S(screenSlab, { tone: "hi", lit: true }), {
      name: "display.amoled_matrix",
    });

    // Layer 4: Centered Infinity-O Punch-Hole Selfie Camera (12 MP dual-pixel)
    const punchX = 0, punchY = -PHONE.d / 2 + 6.2, punchR = 1.8;
    const punchRing = k.ring(punchX, punchY, punchR, dz + 0.65, P, 24);
    const punchVoid = k.cylinder(punchX, punchY, punchR * 0.7, dz, 0.65, P, 20);
    put("display", [punchX, punchY, dz + 0.3], Ln(punchRing, { tone: "mid" }) + S(punchVoid, { tone: "lo" }), {
      name: "display.punch_hole_camera",
    });

    // Layer 5: Wacom EMR Digitizer Layer on underside
    const emrPlan = k.insetPlan(PLAN, 2.8);
    const emrSlab = k.slabOf(emrPlan, dz - 0.75, 0.35, P, 6, 0);
    const emrGrid = k.planOutline(k.insetPlan(emrPlan, 2.0), dz - 0.75, P, 6);
    put("display", [0, 0, dz - 0.6], S(emrSlab, { tone: "mid", inner: Ln(emrGrid, { tone: "faint" }) }), {
      name: "display.emr_digitizer",
    });

    // Layer 6: Display FPC Ribbon Flex Connector Header & Fingerprint Sensor
    const fpcPlan = { x: -14, y: 52, w: 28, d: 18, r: 1.2 };
    const fpcSlab = k.slabOf(fpcPlan, dz - 1.1, 0.35, P, 4, 0);
    const fpcFingers = k.topTicks(-11, 11, 1.8, 1, 62, dz - 0.75, [1.4, 2.2], P, "x");
    const fpPad = { x: -8, y: 28, w: 16, d: 20, r: 1.5 };
    const fpSlab = k.slabOf(fpPad, dz - 1.0, 0.25, P, 4, 0);
    put("display", [0, 45, dz - 0.9], S(fpcSlab, { tone: "lo" }) + Ln(fpcFingers.major, { tone: "hi", free: true }) + S(fpSlab, { tone: "mid" }), {
      name: "display.fpc_flex_and_sensor",
    });

    // Illumination overlays for display
    put("display", [0, 0, dz + 0.5], buildAssemblyIllumination("display", dz), {
      name: "display.illumination",
    });
  }

  // =========================================================================
  // 02. STRUCTURAL MIDFRAME & TITANIUM PERIMETER CHASSIS (`midframe`)
  // Reference layer at [0, 0, 0]
  // =========================================================================
  {
    const mz = 0; // Reference height

    // Layer 1: Grade 5 Titanium Outer Perimeter Band (Ti-6Al-4V)
    const frameSlab = k.slabOf(PLAN, mz, 3.2, P, 8, 0.8);
    const frameSeam = k.sideSeam(PLAN, mz + 1.6, P, 8);
    put("midframe", [0, 0, mz + 1.6], S(frameSlab, { tone: "mid", inner: Ln(frameSeam, { tone: "lo" }) }), {
      name: "midframe.titanium_rail",
    });

    // Layer 2: PVD Antenna Isolation Slit Bands on rails
    const antSlots = [
      k.rise([-PHONE.w / 2, -50], mz + 0.2, mz + 3.0, P),
      k.rise([-PHONE.w / 2, 45], mz + 0.2, mz + 3.0, P),
      k.rise([PHONE.w / 2, -50], mz + 0.2, mz + 3.0, P),
      k.rise([PHONE.w / 2, 45], mz + 0.2, mz + 3.0, P),
    ];
    put("midframe", [0, 0, mz + 1.6], antSlots.map((s) => Ln(s, { tone: "hi" })).join(""), {
      name: "midframe.antenna_insulators",
    });

    // Layer 3: Internal CNC Machined Aluminum Midplate Web
    const webPlan = k.insetPlan(PLAN, 2.0);
    const webSlab = k.slabOf(webPlan, mz + 0.4, 0.8, P, 8, 0);
    put("midframe", [0, 0, mz + 0.8], S(webSlab, { tone: "lo" }), {
      name: "midframe.cnc_midplate",
    });

    // Cavity A: Milled Battery Compartment Well & Silo
    const batCavity = { x: -4, y: -28, w: 38, d: 76, r: 2.0 };
    const batOutline = k.planOutline(batCavity, mz + 1.2, P, 6);
    const batFloor = k.planOutline(k.insetPlan(batCavity, 1.4), mz + 0.4, P, 6);
    const siloRoute = [
      [28, 20, mz + 1.4],
      [28, 78, mz + 1.4],
    ];
    const siloPath = k.pathOf(siloRoute.map((p) => at(p)));
    put("midframe", [15, 10, mz + 0.8], Ln(batOutline, { tone: "mid" }) + Ln(batFloor, { tone: "faint" }) + Ln(siloPath, { tone: "mid", dashed: true, free: true }), {
      name: "midframe.cavities_and_silo",
    });

    // Cavity B: Motherboard Standoff Tray with 4× M1.2 Threaded Bosses
    const mbCavity = { x: -35, y: -78, w: 32, d: 88, r: 2.2 };
    const mbOutline = k.planOutline(mbCavity, mz + 1.2, P, 6);
    const standoffs = [
      [-30, -72],
      [-8, -72],
      [-30, -38],
      [-8, -2],
    ];
    let bossSvg = Ln(mbOutline, { tone: "mid" });
    standoffs.forEach(([sx, sy]) => {
      const boss = k.cylinder(sx, sy, 1.4, mz + 0.4, 1.4, P, 16);
      bossSvg += S(boss, { tone: "hi" }) + Dots([[sx, sy, mz + 1.8]], { size: 0.42, tone: "mid" });
    });
    put("midframe", [-20, -50, mz + 1.0], bossSvg, {
      name: "midframe.standoffs_and_tray",
    });

    // External Frame Features: Side Keys & Ports
    const volKey = { x: PHONE.w / 2, y: -38, w: 1.2, d: 24, r: 0.6 };
    const volSlab = k.slabOf(volKey, mz + 1.0, 1.2, P, 4, 0.3);
    const pwrKey = { x: PHONE.w / 2, y: 6, w: 1.2, d: 14, r: 0.6 };
    const pwrSlab = k.slabOf(pwrKey, mz + 1.0, 1.2, P, 4, 0.3);
    const usbP1 = at([-4, PHONE.d / 2, mz + 1.6]);
    const usbP2 = at([4, PHONE.d / 2, mz + 1.6]);
    const portSvg = S(volSlab, { tone: "hi" }) + S(pwrSlab, { tone: "hi" }) +
      `<line x1="${usbP1[0]}" y1="${usbP1[1]}" x2="${usbP2[0]}" y2="${usbP2[1]}" stroke="var(--ink-hi)" stroke-width="1.8" stroke-linecap="round" />` +
      Dots([[14, PHONE.d / 2, mz + 1.6], [-14, PHONE.d / 2, mz + 1.6]], { size: 0.5, tone: "lo" });
    put("midframe", [PHONE.w / 2, 0, mz + 1.6], portSvg, {
      name: "midframe.keys_and_ports",
    });

    // Illumination overlays
    put("midframe", [0, 0, mz + 2.4], buildAssemblyIllumination("midframe", mz), {
      name: "midframe.illumination",
    });
  }

  // =========================================================================
  // 03. S PEN STYLUS & EMR MECHANISM (`spen`)
  // Exploded move: [22, 56, 0] (diagonal extraction from silo)
  // =========================================================================
  {
    const sz = 1.6;

    // Stylus Main Body: 104.6mm length, 5.8mm width, 4.35mm thickness
    const spenPlan = { x: 26, y: -36, w: 5.6, d: 94, r: 1.6 };
    const spenSlab = k.slabOf(spenPlan, sz, 3.8, P, 6, 0.6);
    const spenSeam = k.sideSeam(spenPlan, sz + 1.9, P, 6);
    put("spen", [28.8, 10, sz + 1.9], S(spenSlab, { tone: "hi", inner: Ln(spenSeam, { tone: "lo" }) }), {
      name: "spen.shaft",
    });

    // Fine 0.7mm Elastomer Stylus Nib (tapered cone)
    const tipCone = [
      [28.8, -36, sz + 1.9],
      [28.8, -42, sz + 1.9],
    ];
    put("spen", [28.8, -39, sz + 1.9], Ln(k.pathOf(tipCone.map((p) => at(p))), { tone: "hi", free: true }) + Dots([[28.8, -42, sz + 1.9]], { size: 0.65, tone: "hi" }), {
      name: "spen.nib",
    });

    // Push-Push Mechanical Ejection Clicker Cap (spring loaded)
    const capPlan = { x: 26.2, y: 58, w: 5.2, d: 8, r: 1.2 };
    const capSlab = k.slabOf(capPlan, sz + 0.3, 3.2, P, 4, 0.3);
    const capKnurl = k.sideTicks(59, 64, 1.2, 1, 28.8, sz + 3.5, [1.0, 1.8], P, "y");
    put("spen", [28.8, 62, sz + 1.9], S(capSlab, { tone: "mid" }) + Ln(capKnurl.major, { tone: "lo" }), {
      name: "spen.clicker_cap",
    });

    // Internal Ferrite Core Induction Coil & Lateral Shortcut Button
    const coilTicks = k.sideTicks(-20, 10, 2.0, 1, 28.8, sz + 2.8, [1.2, 2.0], P, "y");
    const btnPlan = { x: 31.6, y: -2, w: 0.8, d: 14, r: 0.4 };
    const btnSlab = k.slabOf(btnPlan, sz + 1.2, 1.4, P, 4, 0);
    put("spen", [28.8, -5, sz + 2.0], Ln(coilTicks.major, { tone: "hi", flow: true }) + S(btnSlab, { tone: "mid" }), {
      name: "spen.coil_and_button",
    });

    // Illumination overlays
    put("spen", [28.8, 0, sz + 3.0], buildAssemblyIllumination("spen", sz), {
      name: "spen.illumination",
    });
  }

  // =========================================================================
  // 04. VAPOR CHAMBER COOLING ASSEMBLY (`cooling`) — 40% Enlarged Area
  // Exploded move: [0, 0, 14]
  // =========================================================================
  {
    const cz = 2.4;

    // Asymmetric Vapor Chamber Plan (covering SoC + battery boundary >4,200 mm²)
    const vcPoints = [
      [-32, -62],
      [6, -62],
      [6, -16],
      [24, -16],
      [24, 32],
      [-14, 32],
      [-14, -20],
      [-32, -20],
    ];
    const vcRing = vcPoints;
    const vcSlab = k.extrude(vcRing, cz, 0.42, P, { convex: false });
    const vcOutline = k.pathOf(vcPoints.map((p) => at([p[0], p[1], cz + 0.42])), true);
    const vcSeam = k.pathOf(vcPoints.map((p) => at([p[0], p[1], cz + 0.2])), true);
    put("cooling", [-4, -15, cz + 0.2], S(vcSlab, { tone: "mid", inner: Ln(vcSeam, { tone: "faint" }) }) + Ln(vcOutline, { tone: "hi" }), {
      bias: -20,
      name: "cooling.vc_plate",
    });

    // Evaporator Zone & Sintered Capillary Wick Ribs
    const evapPlan = { x: -22, y: -50, w: 18, d: 18, r: 1.5 };
    const evapOutline = k.planOutline(evapPlan, cz + 0.44, P, 4);
    let wickSvg = Ln(evapOutline, { tone: "hi" });
    for (let py = -42; py <= 20; py += 6.5) {
      const ribX0 = py < -16 ? -28 : -8;
      const ribX1 = py < -16 ? 2 : 18;
      const ribLine = k.lineOnTop([ribX0, py], [ribX1, py], cz + 0.44, P);
      wickSvg += Ln(ribLine, { tone: "lo", free: true });
    }
    const tabDots = [
      [-30, -60, cz + 0.44],
      [4, -60, cz + 0.44],
      [22, -14, cz + 0.44],
      [22, 30, cz + 0.44],
    ];
    tabDots.forEach(([tx, ty, tz]) => {
      wickSvg += Dots([[tx, ty, tz]], { size: 0.45, tone: "mid" });
    });
    put("cooling", [-10, -30, cz + 0.44], wickSvg, {
      name: "cooling.wick_channels",
    });

    // Illumination overlays
    put("cooling", [-4, -15, cz + 1.0], buildAssemblyIllumination("cooling", cz), {
      name: "cooling.illumination",
    });
  }

  // =========================================================================
  // 05. 5,000 mAh POWER CELL & BMS (`battery`)
  // Exploded move: [-8, 10, 28]
  // =========================================================================
  {
    const bz = 2.8;

    // Battery Main Pouch Cell (37 × 74 × 4.8 mm)
    const batPlan = { x: -3.5, y: -26, w: 37, d: 74, r: 2.2 };
    const batSlab = k.slabOf(batPlan, bz, 4.8, P, 6, 0.7);
    const batSeam = k.sideSeam(batPlan, bz + 2.4, P, 6);
    const sealOutline = k.planOutline(k.insetPlan(batPlan, 1.2), bz + 4.8, P, 6);
    put("battery", [15, 11, bz + 2.4], S(batSlab, { tone: "mid", inner: Ln(batSeam, { tone: "lo" }) }) + Ln(sealOutline, { tone: "faint" }), {
      name: "battery.pouch_cell",
    });

    // Solvent-Free Pull-Tab Quick Release Strip & BMS Circuit Bar
    const pullTab = { x: 8, y: -26, w: 14, d: 6.5, r: 0.8 };
    const pullSlab = k.slabOf(pullTab, bz + 4.85, 0.35, P, 4, 0);
    const pullArrow = k.lineOnTop([11, -23], [19, -23], bz + 5.2, P);
    const bmsPlan = { x: -2.5, y: -25, w: 35, d: 4.5, r: 0.6 };
    const bmsSlab = k.slabOf(bmsPlan, bz + 4.9, 0.45, P, 4, 0);
    const batFlex = [
      [15, -20.5, bz + 5.1],
      [15, -14, bz + 5.1],
      [4, -14, bz + 5.1],
    ];
    put("battery", [15, -20, bz + 5.0], S(pullSlab, { tone: "hi" }) + Ln(pullArrow, { tone: "lo", free: true }) + S(bmsSlab, { tone: "lo" }) + Ln(k.pathOf(batFlex.map((p) => at(p))), { tone: "hi" }), {
      name: "battery.bms_and_flex",
    });

    // Technical Laser Engraving Print on Battery Jacket (free lines)
    const labelLines = [
      k.lineOnTop([2, -6], [28, -6], bz + 4.85, P),
      k.lineOnTop([2, 0], [24, 0], bz + 4.85, P),
      k.lineOnTop([2, 6], [20, 6], bz + 4.85, P),
      k.lineOnTop([2, 16], [26, 16], bz + 4.85, P),
    ];
    put("battery", [15, 5, bz + 4.85], labelLines.map((ll) => Ln(ll, { tone: "lo", free: true })).join(""), {
      name: "battery.labels",
    });

    // Illumination overlays
    put("battery", [15, 11, bz + 5.5], buildAssemblyIllumination("battery", bz), {
      name: "battery.illumination",
    });
  }

  // =========================================================================
  // 06. LOGIC MOTHERBOARD & SILICON PACKAGE (`motherboard`)
  // Exploded move: [0, 0, 44]
  // =========================================================================
  {
    const mbZ = 3.6;

    // High-Density Interconnect (HDI) Motherboard Substrate (L-shaped)
    const mbPlan1 = { x: -34, y: -76, w: 30, d: 48, r: 2.0 };
    const mbPlan2 = { x: -34, y: -28, w: 16, d: 44, r: 1.8 };
    const mbSlab1 = k.slabOf(mbPlan1, mbZ, 1.2, P, 6, 0.3);
    const mbSlab2 = k.slabOf(mbPlan2, mbZ, 1.2, P, 4, 0.3);
    put("motherboard", [-20, -40, mbZ + 0.6], S(mbSlab1, { tone: "mid" }) + S(mbSlab2, { tone: "mid" }), {
      bias: -30,
      name: "motherboard.hdi_pcb",
    });

    // Qualcomm Snapdragon 8 Elite for Galaxy SoC Package (3nm TSMC N3E) + LPDDR5X
    const socPlan = { x: -21.5, y: -49.5, w: 15, d: 15, r: 0.8 };
    const socSlab = k.slabOf(socPlan, mbZ + 1.2, 0.75, P, 4, 0.2);
    const ramPlan = k.insetPlan(socPlan, 1.2);
    const ramOutline = k.planOutline(ramPlan, mbZ + 1.95, P, 4);
    put("motherboard", [-14, -42, mbZ + 1.6], S(socSlab, { tone: "hi", lit: true }) + Dots([[-19.5, -47.5, mbZ + 1.95]], { size: 0.38, tone: "hi" }) + Ln(ramOutline, { tone: "mid" }), {
      name: "motherboard.snapdragon_8_elite",
    });

    // 3× Nickel-Silver Laser-Perforated EMI Shield Cans
    const rfCan = { x: -33, y: -74, w: 14, d: 20, r: 1.2 };
    const rfSlab = k.slabOf(rfCan, mbZ + 1.2, 1.1, P, 4, 0.2);
    const rfGrid = k.planOutline(k.insetPlan(rfCan, 1.0), mbZ + 2.3, P, 4);
    const pmicCan = { x: -17, y: -74, w: 12, d: 18, r: 1.2 };
    const pmicSlab = k.slabOf(pmicCan, mbZ + 1.2, 1.0, P, 4, 0.2);
    const ufsCan = { x: -33, y: -24, w: 13, d: 18, r: 1.0 };
    const ufsSlab = k.slabOf(ufsCan, mbZ + 1.2, 0.9, P, 4, 0.2);
    put("motherboard", [-24, -60, mbZ + 1.8], S(rfSlab, { tone: "mid", inner: Ln(rfGrid, { tone: "faint" }) }) + S(pmicSlab, { tone: "mid" }) + S(ufsSlab, { tone: "mid" }), {
      name: "motherboard.shield_cans",
    });

    // Micro SMD Components & B2B Mezzanine Sockets & Standoff Screws
    const smdGrid = k.dotGrid(-20, -32, 4, 3, 2.2, mbZ + 1.2, P);
    const b2bSockets = [
      { x: -31, y: -52, w: 6.5, d: 3.2 },
      { x: -31, y: -4, w: 8.0, d: 3.5 },
      { x: -21, y: 10, w: 7.2, d: 3.2 },
    ];
    let compSvg = Dots(smdGrid, { size: 0.36, tone: "hi" });
    b2bSockets.forEach((sock) => {
      const sSlab = k.slabOf(sock, mbZ + 1.2, 0.5, P, 4, 0);
      compSvg += S(sSlab, { tone: "hi" });
    });
    const mbScrews = [
      [-30, -72, mbZ + 1.2],
      [-8, -72, mbZ + 1.2],
      [-30, -38, mbZ + 1.2],
      [-8, -2, mbZ + 1.2],
    ];
    compSvg += Dots(mbScrews, { size: 0.48, tone: "mid" });
    put("motherboard", [-25, -20, mbZ + 1.4], compSvg, {
      name: "motherboard.components_and_b2b",
    });

    // Illumination overlays
    put("motherboard", [-14, -42, mbZ + 2.5], buildAssemblyIllumination("motherboard", mbZ), {
      name: "motherboard.illumination",
    });
  }

  // =========================================================================
  // 07. QUAD OPTICAL CAMERA ARRAY (`cameras`)
  // Exploded move: [16, -12, 58]
  // =========================================================================
  {
    const cz = 4.2;

    // Carrier Substrate
    const carrierPlan = { x: -28, y: -64, w: 26, d: 56, r: 2.2 };
    const carrierSlab = k.slabOf(carrierPlan, cz, 0.6, P, 6, 0);
    put("cameras", [-15, -36, cz + 0.3], S(carrierSlab, { tone: "lo" }), {
      name: "cameras.carrier_pcb",
    });

    // Module 1: 200 MP Primary Wide Camera
    const hp2Box = { x: -27.5, y: -61.5, w: 15, d: 15, r: 1.5 };
    const hp2Slab = k.slabOf(hp2Box, cz + 0.6, 5.8, P, 4, 0.6);
    const hp2Ring1 = k.cylinder(-20, -54, 5.8, cz + 6.4, 1.4, P, 28);
    const hp2Ring2 = k.cylinder(-20, -54, 4.4, cz + 7.8, 0.8, P, 24);
    const oisWires = [
      [[-26, -60, cz + 6.2], [-24, -60, cz + 6.2]],
      [[-14, -60, cz + 6.2], [-16, -60, cz + 6.2]],
      [[-26, -48, cz + 6.2], [-24, -48, cz + 6.2]],
      [[-14, -48, cz + 6.2], [-16, -48, cz + 6.2]],
    ];
    let hp2Svg = S(hp2Slab, { tone: "hi" }) + S(hp2Ring1, { tone: "hi" }) + S(hp2Ring2, { tone: "hi", lit: true });
    oisWires.forEach((w) => (hp2Svg += Ln(k.pathOf(w.map((p) => at(p))), { tone: "hi" })));
    put("cameras", [-20, -54, cz + 4.0], hp2Svg, {
      name: "cameras.hp2_200mp",
    });

    // Module 2: 50 MP Ultra-Wide & Module 3: 10 MP 3x Telephoto
    const uwBox = { x: -26.5, y: -40.5, w: 13, d: 13, r: 1.4 };
    const uwSlab = k.slabOf(uwBox, cz + 0.6, 4.8, P, 4, 0.5);
    const uwLens = k.cylinder(-20, -34, 4.8, cz + 5.4, 1.2, P, 24);
    const tele3Box = { x: -25.5, y: -21.5, w: 11, d: 11, r: 1.2 };
    const tele3Slab = k.slabOf(tele3Box, cz + 0.6, 4.4, P, 4, 0.4);
    const tele3Lens = k.cylinder(-20, -16, 3.8, cz + 5.0, 1.0, P, 20);
    put("cameras", [-20, -28, cz + 3.2], S(uwSlab, { tone: "mid" }) + S(uwLens, { tone: "hi" }) + S(tele3Slab, { tone: "mid" }) + S(tele3Lens, { tone: "hi" }), {
      name: "cameras.uw_and_tele3x",
    });

    // Module 4: 50 MP 5× Periscope Telephoto Module (Folded Optics) & Aux Sensors
    const periBox = { x: -11, y: -45, w: 10, d: 20, r: 1.4 };
    const periSlab = k.slabOf(periBox, cz + 0.6, 4.2, P, 4, 0.4);
    const prismWindow = k.cylinder(-6, -36, 3.6, cz + 4.8, 0.8, P, 20);
    const prismRail = [
      [-6, -42, cz + 4.6],
      [-6, -28, cz + 4.6],
    ];
    const auxBox = { x: -10, y: -21, w: 8, d: 11, r: 1.2 };
    const auxSlab = k.slabOf(auxBox, cz + 0.6, 2.6, P, 4, 0.3);
    const tofDiode = k.cylinder(-6, -18, 1.4, cz + 3.2, 0.5, P, 16);
    const ledDiode = k.cylinder(-6, -13, 1.4, cz + 3.2, 0.5, P, 16);
    put("cameras", [-6, -30, cz + 3.0], S(periSlab, { tone: "hi" }) + S(prismWindow, { tone: "hi", lit: true }) + Ln(k.pathOf(prismRail.map((p) => at(p))), { tone: "mid", dashed: true }) + S(auxSlab, { tone: "mid" }) + S(tofDiode, { tone: "lo" }) + S(ledDiode, { tone: "hi" }), {
      name: "cameras.periscope_and_sensors",
    });

    // Illumination overlays
    put("cameras", [-15, -36, cz + 7.0], buildAssemblyIllumination("cameras", cz), {
      name: "cameras.illumination",
    });
  }

  // =========================================================================
  // 08. WIRELESS CHARGING & LOWER DAUGHTERBOARD (`wireless`)
  // Exploded move: [0, 0, 75]
  // =========================================================================
  {
    const wz = 4.8;

    // Concentric Planar Copper Induction Coil (15W Qi2 Litz-Wire) & Ferrite Magnets
    const coilCenter = [0, 6];
    const coilRadii = [13, 16.5, 20, 23.5];
    let coilSvg = "";
    coilRadii.forEach((r, idx) => {
      const ringD = k.ring(coilCenter[0], coilCenter[1], r, wz + 0.3, P, 36);
      coilSvg += Ln(ringD, { tone: idx === 1 || idx === 2 ? "hi" : "mid" });
    });
    const magnetPoints = [];
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
      magnetPoints.push([coilCenter[0] + 25.5 * Math.cos(angle), coilCenter[1] + 25.5 * Math.sin(angle), wz + 0.3]);
    }
    coilSvg += Dots(magnetPoints, { size: 0.55, tone: "mid" });
    const nfcPlan = k.insetPlan(PLAN, 4.0);
    coilSvg += Ln(k.planOutline(nfcPlan, wz + 0.2, P, 8), { tone: "faint" });
    put("wireless", [0, 6, wz + 0.3], coilSvg, {
      name: "wireless.induction_coil",
    });

    // Lower Daughterboard (Sub-board PCB) & USB-C & Haptic Engine & Loudspeaker
    const subPlan = { x: -32, y: 54, w: 46, d: 24, r: 1.8 };
    const subSlab = k.slabOf(subPlan, wz, 1.0, P, 4, 0.2);
    const usbReceptacle = { x: -6, y: 70, w: 12, d: 8, r: 1.0 };
    const usbSlab = k.slabOf(usbReceptacle, wz + 1.0, 2.4, P, 4, 0.3);
    const lraCan = k.cylinder(-22, 64, 4.8, wz + 1.0, 2.2, P, 24);
    const spkBox = { x: -31, y: 56, w: 8, d: 18, r: 1.2 };
    const spkSlab = k.slabOf(spkBox, wz + 1.0, 2.6, P, 4, 0.3);
    const spkGrille = k.sideTicks(58, 72, 1.6, 1, -23, wz + 3.6, [1.0, 1.8], P, "y");
    const coaxRoute = [
      [-32, -2, wz + 1.0],
      [-36, -2, wz + 1.0],
      [-36, 52, wz + 1.0],
      [-28, 52, wz + 1.0],
    ];
    put("wireless", [-10, 64, wz + 1.5], S(subSlab, { tone: "mid" }) + S(usbSlab, { tone: "hi" }) + S(lraCan, { tone: "hi" }) + Dots([[-22, 64, wz + 3.2]], { size: 0.45, tone: "mid" }) + S(spkSlab, { tone: "mid" }) + Ln(spkGrille.major, { tone: "lo", free: true }) + Ln(k.pathOf(coaxRoute.map((p) => at(p))), { tone: "hi", free: true }) + Dots([[-32, -2, wz + 1.0], [-28, 52, wz + 1.0]], { size: 0.55, tone: "hi" }), {
      name: "wireless.sub_board_and_haptics",
    });

    // Illumination overlays
    put("wireless", [0, 6, wz + 3.0], buildAssemblyIllumination("wireless", wz), {
      name: "wireless.illumination",
    });
  }

  // =========================================================================
  // 09. REAR ENCLOSURE & TITANIUM CAMERA RINGS (`rear`)
  // Exploded move: [0, 0, 95]
  // =========================================================================
  {
    const rz = 5.6;

    // Precision Engineering Cutaway Glass Panel (Exposing internal silicon and optics)
    // The lower casing (from y = -6 to +81.4) provides solid satin Gorilla Armor protection
    const lowerGlassPlan = { x: PLAN.x, y: -6, w: PLAN.w, d: PLAN.d / 2 + 6, r: PLAN.r };
    const lowerGlassSlab = k.slabOf(lowerGlassPlan, rz, 0.65, P, 6, 0.4);
    const glassSeam = k.sideSeam(lowerGlassPlan, rz + 0.32, P, 6);
    const brandLine1 = k.lineOnTop([-7, 52], [7, 52], rz + 0.65, P);
    const brandLine2 = k.lineOnTop([-5, 55], [5, 55], rz + 0.65, P);
    // Precision chamfered cutaway border revealing the upper processor/camera bay
    const cutawayBorder = k.lineOnTop([PLAN.x + 1.2, -6], [PLAN.x + PLAN.w - 1.2, -6], rz + 0.65, P);
    const cutawayBevel = k.lineOnTop([PLAN.x + 1.2, -6], [PLAN.x + 1.2, -81.4 + 4], rz + 0.65, P);
    const cutawayTop = k.lineOnTop([PLAN.x + 1.2, -81.4 + 4], [PLAN.x + PLAN.w - 1.2, -81.4 + 4], rz + 0.65, P);
    const cutawayRight = k.lineOnTop([PLAN.x + PLAN.w - 1.2, -81.4 + 4], [PLAN.x + PLAN.w - 1.2, -6], rz + 0.65, P);

    put("rear", [0, 36, rz + 0.35], S(lowerGlassSlab, { tone: "mid", inner: Ln(glassSeam, { tone: "lo" }) }) +
      Ln(brandLine1, { tone: "lo", free: true }) +
      Ln(brandLine2, { tone: "faint", free: true }) +
      Ln(cutawayBorder, { tone: "hi", free: true }) +
      Ln(cutawayBevel, { tone: "faint", free: true }) +
      Ln(cutawayTop, { tone: "faint", free: true }) +
      Ln(cutawayRight, { tone: "faint", free: true }), {
      bias: -60,
      name: "rear.glass_cover",
    });

    // 4× Independent Elevated Grade 5 Titanium Camera Bezel Rings
    // Ring 1: 200 MP Primary Wide Bezel
    const ring1 = k.cylinder(-20, -54, 7.8, rz + 0.65, 2.2, P, 32);
    const sapphire1 = k.cylinder(-20, -54, 6.2, rz + 2.4, 0.45, P, 28);
    put("rear", [-20, -54, rz + 1.8], S(ring1, { tone: "hi" }) + S(sapphire1, { tone: "hi", lit: true }), {
      name: "rear.camera_ring_200mp",
    });

    // Ring 2: 50 MP Ultra-Wide Bezel
    const ring2 = k.cylinder(-20, -34, 6.8, rz + 0.65, 2.0, P, 28);
    const sapphire2 = k.cylinder(-20, -34, 5.2, rz + 2.2, 0.45, P, 24);
    put("rear", [-20, -34, rz + 1.7], S(ring2, { tone: "hi" }) + S(sapphire2, { tone: "hi", lit: true }), {
      name: "rear.camera_ring_50mp_uw",
    });

    // Ring 3: 10 MP 3× Telephoto Bezel
    const ring3 = k.cylinder(-20, -16, 5.8, rz + 0.65, 1.8, P, 24);
    const sapphire3 = k.cylinder(-20, -16, 4.4, rz + 2.0, 0.45, P, 20);
    put("rear", [-20, -16, rz + 1.6], S(ring3, { tone: "hi" }) + S(sapphire3, { tone: "hi", lit: true }), {
      name: "rear.camera_ring_10mp_tele",
    });

    // Ring 4: 50 MP 5× Periscope Telephoto Bezel
    const ring4 = k.cylinder(-6, -36, 5.6, rz + 0.65, 1.8, P, 24);
    const sapphire4 = k.cylinder(-6, -36, 4.2, rz + 2.0, 0.45, P, 20);
    put("rear", [-6, -36, rz + 1.6], S(ring4, { tone: "hi" }) + S(sapphire4, { tone: "hi", lit: true }), {
      name: "rear.camera_ring_50mp_periscope",
    });

    // Auxiliary Sensor Dual-Pill Bezel (Laser AF + Flash)
    const pillPlan = { x: -8.8, y: -20.5, w: 5.6, d: 9.0, r: 2.2 };
    const pillSlab = k.slabOf(pillPlan, rz + 0.65, 1.2, P, 6, 0.3);
    put("rear", [-6, -16, rz + 1.3], S(pillSlab, { tone: "mid" }) + Dots([[-6, -18, rz + 1.85], [-6, -14, rz + 1.85]], { size: 0.52, tone: "hi" }), {
      name: "rear.sensor_pill_bezel",
    });

    // Illumination overlays
    put("rear", [0, 0, rz + 3.0], buildAssemblyIllumination("rear", rz), {
      name: "rear.illumination",
    });
  }

  // Settle painter's depth keys across all assemblies and moving items
  A.settle(R, P);

  // Run geometry audit if requested
  if (auditMode) {
    A.auditOrExit(R, P);
  }

  return {
    R,
    P,
    V,
    items: R.items,
  };
}
