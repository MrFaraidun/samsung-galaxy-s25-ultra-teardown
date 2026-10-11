/**
 * Samsung Galaxy S25 Ultra — Enclosure & Test Fixture Geometry
 *
 * Assemblies:
 * 00 - Cleanroom Inspection Bench & Fixture (buildFixture)
 * 09 - Qi2 Wireless Coil, NFC & UWB (buildWirelessCoil)
 * 10 - Gorilla Glass Victus 2 Rear & Rings (buildBackGlass)
 *
 * Adheres strictly to Anatomy engineering craft rules:
 * - True 3D solids (slabOf, cylinder, extrude) with proper shading and creasing
 * - Depth-sorted painter's algorithm rendering
 * - Knurled thumb knobs, precision vernier scale, micrometer column
 * - Pure copper Archimedean Qi2 induction spiral coil and ferrite shield
 * - Grade 5 Titanium stepped camera rings with sapphire crystal lens caps
 */

import * as k from "./kit/iso-kit.mjs";

/**
 * Assembly 00: Cleanroom Inspection Bench & Fixture
 *
 * Heavy cast aluminum inspection bench plate on 4 stepped feet:
 * - Base plate (w 160, d 240, h 12 mm, r 10 mm, bevel 1.6 mm) with soft halo underneath
 * - 4 corner cylindrical feet with stepped flanges (depth sorted)
 * - Top perimeter groove inset 5 mm
 * - 4 corner screws as 0.5 dots with 2.2 radius rings
 * - Millimeter calibration ruler strips along front and side edges with major and minor ticks
 * - 4 corner locking clamp chucks holding the phone chassis, with knurled thumbscrew knobs
 * - Side vertical micrometer height gauge column with vernier height slider indicator reading separation
 *
 * @param {object} P Projection camera
 * @returns {{ svg: string, solidsCount: number, pathsCount: number, bounds: number[][] }}
 */
export function buildFixture(P) {
  const parts = [];
  let solidsCount = 0;

  // Helper to add solid and track counts
  const addSolid = (paths, options) => {
    parts.push(k.solidSvg(paths, options));
    solidsCount++;
  };

  const addLine = (d, options) => {
    if (d) parts.push(k.lineSvg(d, options));
  };

  // --- 1. 4 Corner Cylindrical Feet with Stepped Flanges (depth sorted) ---
  // Bench plate is 160x240, corners are +/-80, +/-120. Inset feet centers to +/-64, +/-104.
  // Feet rise from z = -32 to -26 (height 6 mm). Stepped base flange z = -32 to -29.5, column z = -29.5 to -26.
  const feetLocs = [
    [-64, -104],
    [64, -104],
    [-64, 104],
    [64, 104],
  ];

  // Depth sort feet back-to-front
  feetLocs.sort((a, b) => k.depthOf([a[0], a[1], -29], P) - k.depthOf([b[0], b[1], -29], P));

  for (const [fx, fy] of feetLocs) {
    // Stepped base flange (r = 8.5, h = 2.5)
    const flange = k.cylinder(fx, fy, 8.5, -32, 2.5, P, 24, 0.3);
    addSolid(flange, { tone: "mid", crease: "faint" });

    // Stepped upper riser cylinder (r = 5.5, h = 3.5)
    const riser = k.cylinder(fx, fy, 5.5, -29.5, 3.5, P, 24, 0.2);
    addSolid(riser, { tone: "mid", crease: "faint" });

    // Bottom anti-slip pad seam
    addLine(k.ring(fx, fy, 8.5, -32, P, 24), { tone: "lo" });
  }

  // --- 2. Base Plate (w 160, d 240, h 12 mm, r 10 mm, bevel 1.6 mm) ---
  // Extends from z = -26 to -14 (top face at restZ = -14)
  const basePlan = { x: -80, y: -120, w: 160, d: 240, r: 10 };
  const baseSlab = k.slabOf(basePlan, -26, 12, P, 16, 1.6);
  addSolid(baseSlab, { tone: "hi", crease: "faint", halo: true, className: "bench-base-plate" });

  // --- 3. Top Perimeter Groove inset 5 mm ---
  const grooveOuter = k.insetPlan(basePlan, 5.0);
  const grooveInner = k.insetPlan(basePlan, 5.6);
  addLine(k.planOutline(grooveOuter, -14, P, 16), { tone: "mid" });
  addLine(k.planOutline(grooveInner, -14, P, 16), { tone: "faint" });

  // --- 4. 4 Corner Screws (0.5 dots with 2.2 radius rings) ---
  const screwCoords = [
    [-70, -110],
    [70, -110],
    [-70, 110],
    [70, 110],
  ];

  for (const [sx, sy] of screwCoords) {
    // Countersink recess ring
    addLine(k.ring(sx, sy, 3.0, -14, P, 20), { tone: "faint" });
    // 2.2 radius screw head ring
    addLine(k.ring(sx, sy, 2.2, -14, P, 20), { tone: "hi" });
    // Screw drive slot
    addLine(k.segment([sx - 1.2, sy, -14], [sx + 1.2, sy, -14], P), { tone: "mid" });
    // 0.5 dot center
    parts.push(k.dotsSvg([k.iso([sx, sy, -14], P)], { size: 0.5, tone: "hi" }));
  }

  // --- 5. Millimeter Calibration Ruler Strips along Front and Side Edges ---
  // Front ruler strip: along front edge at y = 114 (z = -14), from x = -65 to +65
  const frontTicks = k.topTicks(-65, 65, 1, 5, 114, -14, [-1.2, -2.8], P, "x");
  addLine(frontTicks.minor, { tone: "faint" });
  addLine(frontTicks.major, { tone: "mid" });
  addLine(k.segment([-65, 114, -14], [65, 114, -14], P), { tone: "lo" });

  // Front edge calibration numeral marks every 20 mm
  for (let markX = -60; markX <= 60; markX += 20) {
    const mat = k.topMatrix([markX, 109], -14, P, "x");
    parts.push(k.faceTextSvg(mat, String(Math.abs(markX)), { size: 2.2, tone: "lo", anchor: "middle" }));
  }

  // Side ruler strip: along side edge at x = 74 (z = -14), from y = -95 to +95
  const sideTicks = k.topTicks(-95, 95, 1, 5, 74, -14, [-1.2, -2.8], P, "y");
  addLine(sideTicks.minor, { tone: "faint" });
  addLine(sideTicks.major, { tone: "mid" });
  addLine(k.segment([74, -95, -14], [74, 95, -14], P), { tone: "lo" });

  // Side edge calibration numeral marks every 20 mm
  for (let markY = -80; markY <= 80; markY += 20) {
    const mat = k.topMatrix([69, markY], -14, P, "y");
    parts.push(k.faceTextSvg(mat, String(Math.abs(markY)), { size: 2.2, tone: "lo", anchor: "middle" }));
  }

  // Calibration title inscription on bench surface
  const benchTitleMat = k.topMatrix([-45, -108], -14, P, "x");
  parts.push(k.faceTextSvg(benchTitleMat, "CLEANROOM OPTICAL INSPECTION BENCH · 1:1 CALIBRATION", { size: 2.0, tone: "faint", anchor: "start" }));

  // --- 6. 4 Corner Locking Clamp Chucks Holding Phone Chassis ---
  // Phone corners: x = +/-38.8, y = +/-81.4.
  // Chuck mounting bases situated at +/-46, +/-89.
  const chucks = [
    { cx: -46, cy: -89 },
    { cx: 46, cy: -89 },
    { cx: -46, cy: 89 },
    { cx: 46, cy: 89 },
  ];

  // Depth-sort chucks
  chucks.sort((a, b) => k.depthOf([a.cx, a.cy, 0], P) - k.depthOf([b.cx, b.cy, 0], P));

  for (const { cx, cy } of chucks) {
    // Chuck riser block anchored to bench: z = -14 to -2 (h = 12)
    const baseBlock = k.slabOf({ x: cx - 6, y: cy - 6, w: 12, d: 12, r: 2 }, -14, 12, P, 8, 0.4);
    addSolid(baseBlock, { tone: "mid", crease: "faint" });

    // Chuck clamping jaw cantilever reaching toward phone corner: z = -2 to 3 (h = 5)
    const jx = cx > 0 ? cx - 7.5 : cx - 1.5;
    const jy = cy > 0 ? cy - 7.5 : cy - 1.5;
    const clampJaw = k.slabOf({ x: jx, y: jy, w: 9, d: 9, r: 1.5 }, -2, 5, P, 8, 0.3);
    addSolid(clampJaw, { tone: "hi", crease: "faint" });

    // Protective elastomer corner pad on clamp jaw: z = 1.5 to 3.2 (h = 1.7)
    const pad = k.slabOf({ x: jx + 0.8, y: jy + 0.8, w: 7.4, d: 7.4, r: 1 }, 1.5, 1.7, P, 6, 0.2);
    addSolid(pad, { tone: "lo", crease: "none" });

    // Knurled thumbscrew knob on top: z = 3 to 8 (radius 3.5, h = 5)
    const knob = k.cylinder(cx, cy, 3.5, 3, 5, P, 24, 0.4);
    addSolid(knob, { tone: "hi", crease: "faint" });

    // Knurled grip ridges on thumbscrew knob
    addLine(k.knurl(cx, cy, 3.5, 3, 8, 16, P, 0.3), { tone: "mid" });

    // Screw top socket and ring
    addLine(k.ring(cx, cy, 2.0, 8, P, 16), { tone: "lo" });
    parts.push(k.dotsSvg([k.iso([cx, cy, 8], P)], { size: 0.5, tone: "hi" }));
  }

  // --- 7. Side Vertical Micrometer Height Gauge Column with Vernier Slider Indicator ---
  // Positioned along -X flank at (-62, 0)
  const colX = -62;
  const colY = 0;

  // Heavy circular base flange on bench: z = -14 to -10.5 (radius 8.5, h = 3.5)
  const flange = k.cylinder(colX, colY, 8.5, -14, 3.5, P, 32, 0.5);
  addSolid(flange, { tone: "mid", crease: "faint" });

  // 3 flange mounting bolt rings
  for (let i = 0; i < 3; i++) {
    const angle = (i * 2 * Math.PI) / 3;
    const bx = colX + 6.2 * Math.cos(angle);
    const by = colY + 6.2 * Math.sin(angle);
    addLine(k.ring(bx, by, 1.2, -10.5, P, 12), { tone: "hi" });
    parts.push(k.dotsSvg([k.iso([bx, by, -10.5], P)], { size: 0.4, tone: "lo" }));
  }

  // Precision ground vertical column: z = -10.5 to 120 (radius 3.2, h = 130.5)
  const mast = k.cylinder(colX, colY, 3.2, -10.5, 130.5, P, 24, 0.2);
  addSolid(mast, { tone: "hi", crease: "faint" });

  // Column top cap: z = 120 to 122.5 (radius 3.8, h = 2.5)
  const topCap = k.cylinder(colX, colY, 3.8, 120, 2.5, P, 24, 0.3);
  addSolid(topCap, { tone: "mid", crease: "faint" });

  // Millimeter height graduations along front-facing profile of column
  for (let zTick = 0; zTick <= 110; zTick += 5) {
    const isMajor = zTick % 10 === 0;
    const tickLen = isMajor ? 2.5 : 1.4;
    // Tick along column face
    const tickPath = k.segment(
      [colX + 2.2, colY + 2.2, zTick],
      [colX + 2.2 + tickLen * 0.7, colY + 2.2 + tickLen * 0.7, zTick],
      P
    );
    addLine(tickPath, { tone: isMajor ? "mid" : "faint", free: true });
  }

  // Vernier height slider indicator reading separation
  // Sliding collar riding on column at z = 6 to 16 mm (height 10 mm)
  const sliderCollar = k.cylinder(colX, colY, 5.2, 6, 10, P, 28, 0.4);
  addSolid(sliderCollar, { tone: "hi", crease: "faint" });

  // Cantilever horizontal vernier indicator arm reaching towards phone chassis
  // Extends from x = -58 to -39.5 at z = 9 to 13 (h = 4 mm)
  const arm = k.slabOf({ x: -58, y: -1.5, w: 18.5, d: 3, r: 0.8 }, 9, 4, P, 6, 0.2);
  addSolid(arm, { tone: "hi", crease: "faint" });

  // Precision stylus pointer needle tip reaching flush to chassis corner at x = -39
  const needlePath = k.segment([-39.5, 0, 11], [-38.8, 0, 11], P);
  addLine(needlePath, { tone: "lit", free: true });

  // Knurled thumb lock knob on side of slider at (-67, 0): z = 8 to 12
  const sliderKnob = k.cylinder(colX - 5.0, colY, 2.2, 8, 4, P, 16, 0.3);
  addSolid(sliderKnob, { tone: "mid", crease: "faint" });
  addLine(k.knurl(colX - 5.0, colY, 2.2, 8, 12, 12, P, 0.2), { tone: "lo" });

  // Vernier scale engraved readout lines on slider window
  for (let v = 0; v <= 5; v++) {
    const vz = 8.5 + v * 0.8;
    const vline = k.segment([colX + 3.6, colY + 3.6, vz], [colX + 4.8, colY + 4.8, vz], P);
    addLine(vline, { tone: "lo", free: true });
  }

  // Vernier label text
  const vmat = k.topMatrix([colX - 2, colY - 8], 16, P, "x");
  parts.push(k.faceTextSvg(vmat, "SEP: 0.00mm", { size: 1.6, tone: "lo", anchor: "start" }));

  const svg = parts.join("");
  const pathsCount = (svg.match(/<(path|circle|text)/g) || []).length;

  return {
    svg,
    solidsCount,
    pathsCount,
    bounds: [
      [-80, -120, -32],
      [80, 120, 122.5],
    ],
  };
}

/**
 * Assembly 09: Qi2 Wireless Coil, NFC & UWB
 *
 * - Concentric spiraling pure copper induction coil (outer r 24 mm, inner r 12 mm, turns ~12) for 15W Qi2 charging
 * - Black ferrite magnetic shielding plate backing
 * - Outer perimeter NFC antenna loop trace
 * - Ultra-Wideband (UWB) spatial patch antenna square
 * - Graphite thermal dissipation sheet draping over battery and chassis
 *
 * @param {object} P Projection camera
 * @returns {{ svg: string, solidsCount: number, pathsCount: number, bounds: number[][] }}
 */
export function buildWirelessCoil(P) {
  const parts = [];
  let solidsCount = 0;

  const addSolid = (paths, options) => {
    parts.push(k.solidSvg(paths, options));
    solidsCount++;
  };

  const addLine = (d, options) => {
    if (d) parts.push(k.lineSvg(d, options));
  };

  // Base rest height for wireless charging assembly: restZ = 4.8 mm
  const baseZ = 4.6;

  // --- 1. Graphite Thermal Dissipation Sheet Draping over Battery & Chassis ---
  // Sits at z = 4.6 to 4.85 mm (thickness 0.25 mm), spans battery / chassis area
  const graphitePlan = { x: -33, y: -58, w: 66, d: 116, r: 4.5 };
  const graphiteSlab = k.slabOf(graphitePlan, baseZ, 0.25, P, 12, 0.08);
  addSolid(graphiteSlab, { tone: "lo", crease: "faint", className: "graphite-sheet" });

  // Battery pull-tab laser cutout relief notch at bottom of graphite sheet
  const pullTabRelief = { x: -28, y: 50, w: 16, d: 5, r: 1.5 };
  addLine(k.planOutline(pullTabRelief, baseZ + 0.25, P, 8), { tone: "mid" });

  // Secondary flex clearance cutout
  const flexCutout = { x: -31, y: -48, w: 7, d: 18, r: 1.2 };
  addLine(k.planOutline(flexCutout, baseZ + 0.25, P, 8), { tone: "lo" });

  // Gold ground bonding contact pads
  const groundPad1 = k.slabOf({ x: 22, y: -48, w: 4, d: 6, r: 0.5 }, baseZ + 0.25, 0.1, P, 6);
  addSolid(groundPad1, { tone: "hi", crease: "none" });
  parts.push(k.dotsSvg([k.iso([24, -45, baseZ + 0.35], P)], { size: 0.5, tone: "hi" }));

  const groundPad2 = k.slabOf({ x: -28, y: 40, w: 4, d: 6, r: 0.5 }, baseZ + 0.25, 0.1, P, 6);
  addSolid(groundPad2, { tone: "hi", crease: "none" });
  parts.push(k.dotsSvg([k.iso([-26, 43, baseZ + 0.35], P)], { size: 0.5, tone: "hi" }));

  // Graphite thermal grain directional heat-spreading lines
  for (let yG = -40; yG <= 30; yG += 14) {
    const gLine = k.segment([-26, yG, baseZ + 0.25], [26, yG, baseZ + 0.25], P);
    addLine(gLine, { tone: "faint" });
  }

  // --- 2. Black Ferrite Magnetic Shielding Plate Backing ---
  // Sits at center (0, 6) directly beneath the induction coil
  // Diameter 51 mm (radius 25.5 mm), z = 4.85 to 5.2 mm (thickness 0.35 mm)
  const coilCenterX = 0;
  const coilCenterY = 6;
  const ferriteRadius = 25.5;

  const ferriteSlab = k.cylinder(coilCenterX, coilCenterY, ferriteRadius, 4.85, 0.35, P, 36, 0.1);
  addSolid(ferriteSlab, { tone: "lo", crease: "none", className: "ferrite-shield" });

  // Central flux alignment hole
  addLine(k.ring(coilCenterX, coilCenterY, 8.5, 5.2, P, 32), { tone: "lo" });

  // Qi2 NdFeB Magnetic Alignment Ring Array (18 segmented permanent magnets)
  const magOuterR = 24.2;
  const magInnerR = 21.0;
  addLine(k.ring(coilCenterX, coilCenterY, magOuterR, 5.2, P, 36), { tone: "lo" });
  addLine(k.ring(coilCenterX, coilCenterY, magInnerR, 5.2, P, 36), { tone: "lo" });

  // Radial segment dividing ticks for the 18 Qi2 alignment magnets
  const magTicks = k.radialTicks(coilCenterX, coilCenterY, magOuterR, 18, 1, 5.2, [3.2, 3.2], P);
  addLine(magTicks.minor, { tone: "lo" });
  addLine(magTicks.major, { tone: "lo" });

  // --- 3. Concentric Spiraling Pure Copper Induction Coil (outer r 24 mm, inner r 12 mm, turns ~12) ---
  // Sits on top of ferrite shield: z = 5.2 to 5.45 mm (thickness 0.25 mm)
  const coilOuterR = 24.0;
  const coilInnerR = 12.0;
  const turns = 12;

  // Pure copper annular base ribbon solid
  const coilBase = k.cylinder(coilCenterX, coilCenterY, coilOuterR, 5.2, 0.25, P, 36, 0.08);
  addSolid(coilBase, { tone: "hi", crease: "faint", className: "copper-coil" });

  // Inner coil aperture ring
  addLine(k.ring(coilCenterX, coilCenterY, coilInnerR, 5.45, P, 32), { tone: "mid" });

  // Concentric turn boundary rings (12 turns)
  for (let i = 0; i <= turns; i++) {
    const turnR = coilInnerR + (i * (coilOuterR - coilInnerR)) / turns;
    addLine(k.ring(coilCenterX, coilCenterY, turnR, 5.45, P, 36), { tone: "mid" });
  }

  // Continuous Archimedean copper spiral ribbon trace
  const totalSteps = turns * 16;
  const spiralPoints = [];
  for (let step = 0; step <= totalSteps; step++) {
    const fraction = step / totalSteps;
    const theta = fraction * turns * 2 * Math.PI;
    const currentR = coilInnerR + fraction * (coilOuterR - coilInnerR);
    spiralPoints.push([
      coilCenterX + currentR * Math.cos(theta),
      coilCenterY + currentR * Math.sin(theta),
    ]);
  }
  const spiralPath = k.onTop(spiralPoints, 5.45, P, false);
  addLine(spiralPath, { tone: "hi" });

  // Copper coil power feed ribbon tails exiting downwards to battery management circuit
  const terminalRibbon = k.slabOf({ x: -4, y: 30, w: 8, d: 13, r: 1.2 }, 5.2, 0.25, P, 6, 0.1);
  addSolid(terminalRibbon, { tone: "hi", crease: "faint" });

  // Gold-plated solder pads for coil leads
  parts.push(k.dotsSvg([
    k.iso([-2.2, 40, 5.45], P),
    k.iso([2.2, 40, 5.45], P),
  ], { size: 0.8, tone: "hi" }));

  // Central thermal thermistor sensor dot
  parts.push(k.dotsSvg([k.iso([coilCenterX, coilCenterY + 10, 5.45], P)], { size: 0.6, tone: "mid" }));

  // Qi2 Specification Engraving on coil face
  const coilMat = k.topMatrix([-10, coilCenterY - 1], 5.45, P, "x");
  parts.push(k.faceTextSvg(coilMat, "15W Qi2 · DUAL COIL", { size: 1.6, tone: "faint", anchor: "start" }));

  // --- 4. Outer Perimeter NFC Antenna Loop Trace ---
  // Multiple nested conductive loops routing along outer perimeter of graphite sheet at z = 5.3 mm
  const nfcLoops = [0, 1.2, 2.4, 3.6];
  for (const offset of nfcLoops) {
    const loopPlan = {
      x: -30.5 + offset,
      y: -50.0 + offset,
      w: 61.0 - offset * 2,
      d: 96.0 - offset * 2,
      r: 6.5 - offset * 0.4,
    };
    addLine(k.planOutline(loopPlan, 5.3, P, 14), { tone: "mid" });
  }

  // NFC feed jumper crossing and terminal pads at top
  addLine(k.segment([-2.5, -50, 5.3], [2.5, -50, 5.3], P), { tone: "hi" });
  parts.push(k.dotsSvg([
    k.iso([-2.5, -50, 5.3], P),
    k.iso([2.5, -50, 5.3], P),
  ], { size: 0.5, tone: "hi" }));

  // --- 5. Ultra-Wideband (UWB) Spatial Patch Antenna Square ---
  // S25 Ultra spatial awareness patch antenna located near top-right flank at (21, -38)
  const uwbPlan = { x: 16, y: -43, w: 10, d: 10, r: 1.5 };
  // Ceramic dielectric substrate block: z = 4.85 to 6.05 (h = 1.2 mm)
  const uwbSubstrate = k.slabOf(uwbPlan, 4.85, 1.2, P, 8, 0.2);
  addSolid(uwbSubstrate, { tone: "mid", crease: "faint" });

  // Copper radiating square patch element on top: z = 6.05 to 6.2 (h = 0.15 mm)
  const patchPlan = { x: 17.2, y: -41.8, w: 7.6, d: 7.6, r: 0.8 };
  const patchSlab = k.slabOf(patchPlan, 6.05, 0.15, P, 6, 0.05);
  addSolid(patchSlab, { tone: "hi", crease: "none" });

  // Center RF coaxial feed probe via dot
  parts.push(k.dotsSvg([k.iso([21, -38, 6.2], P)], { size: 0.6, tone: "hi" }));

  // Diagonal corner slot perturbation notches for spatial circular polarization
  addLine(k.segment([17.2, -40, 6.2], [19.0, -41.8, 6.2], P), { tone: "lo" });
  addLine(k.segment([24.8, -39.8, 6.2], [23.0, -38.0, 6.2], P), { tone: "lo" });

  // Microstrip feed transmission line running to RF transceiver
  addLine(k.segment([21, -34.2, 5.0], [21, -26, 5.0], P), { tone: "mid" });

  // UWB identification marking
  const uwbMat = k.topMatrix([15.5, -45], 4.85, P, "x");
  parts.push(k.faceTextSvg(uwbMat, "UWB 6.5-8.0 GHz", { size: 1.4, tone: "lo", anchor: "start" }));

  const svg = parts.join("");
  const pathsCount = (svg.match(/<(path|circle|text)/g) || []).length;

  return {
    svg,
    solidsCount,
    pathsCount,
    bounds: [
      [-33, -58, baseZ],
      [33, 58, 6.2],
    ],
  };
}

/**
 * Assembly 10: Gorilla Glass Victus 2 Rear & Rings
 *
 * - Corning Gorilla Glass Victus 2 rear panel (w 77.6, d 162.8, r 4.2, thickness 0.8 mm) with satin frosted matte tone
 * - 4 Individual Grade 5 Titanium camera protection rings (stepped outer cylinders with chamfered bezels) and sapphire crystal lens caps
 * - Flash & Laser AF cutout window
 * - Perimeter waterproof adhesive sealing gasket
 * - Laser-etched Samsung logo mark
 *
 * @param {object} P Projection camera
 * @returns {{ svg: string, solidsCount: number, pathsCount: number, bounds: number[][] }}
 */
export function buildBackGlass(P) {
  const parts = [];
  let solidsCount = 0;

  const addSolid = (paths, options) => {
    parts.push(k.solidSvg(paths, options));
    solidsCount++;
  };

  const addLine = (d, options) => {
    if (d) parts.push(k.lineSvg(d, options));
  };

  // Dimensions of the rear glass panel (restZ = 5.6 mm, thickness = 0.8 mm -> top at z = 6.4 mm)
  const glassW = 77.6;
  const glassD = 162.8;
  const glassR = 4.2;
  const glassZ = 5.6;
  const glassThickness = 0.8;
  const topZ = glassZ + glassThickness; // 6.4 mm

  // --- 1. Perimeter Waterproof Adhesive Sealing Gasket (IP68) ---
  // Underneath the glass panel at z = 5.55 mm
  const glassPlan = {
    x: -glassW / 2,
    y: -glassD / 2,
    w: glassW,
    d: glassD,
    r: glassR,
  };

  const gasketOuter = k.insetPlan(glassPlan, 1.2);
  const gasketInner = k.insetPlan(glassPlan, 2.4);
  addLine(k.planOutline(gasketOuter, 5.55, P, 16), { tone: "mid", dashed: true });
  addLine(k.planOutline(gasketInner, 5.55, P, 16), { tone: "lo", dashed: true });

  // --- 2. Corning Gorilla Glass Victus 2 Rear Panel (Satin Frosted Matte Tone) ---
  const glassSlab = k.slabOf(glassPlan, glassZ, glassThickness, P, 16, 0.25);
  addSolid(glassSlab, { tone: "hi", crease: "faint", className: "back-glass-panel" });

  // Subtle perimeter refraction highlight inside the glass bevel
  const glassRefractPlan = k.insetPlan(glassPlan, 0.6);
  addLine(k.planOutline(glassRefractPlan, topZ, P, 16), { tone: "faint" });

  // --- 3. 4 Individual Grade 5 Titanium Camera Protection Rings & Sapphire Lens Caps ---
  // S25 Ultra quad camera layout:
  // Primary column:
  // 1. Ultra-Wide: cx = -23.0, cy = -56.0, r = 6.8 mm
  // 2. 200MP Wide Main: cx = -23.0, cy = -36.0, r = 7.2 mm
  // 3. 50MP 5x Folded Periscope Telephoto: cx = -23.0, cy = -16.0, r = 7.0 mm
  // Secondary column:
  // 4. Flash & Laser AF cutout window: cx = -7.5, cy = -54.0, r = 3.8 mm
  // 5. 10MP 3x Optical Telephoto: cx = -7.5, cy = -36.0, r = 5.6 mm

  const cameraElements = [
    { id: "uw", cx: -23.0, cy: -56.0, r: 6.8, isPeriscope: false, isFlash: false },
    { id: "flash", cx: -7.5, cy: -54.0, r: 3.8, isPeriscope: false, isFlash: true },
    { id: "wide", cx: -23.0, cy: -36.0, r: 7.2, isPeriscope: false, isFlash: false },
    { id: "tele", cx: -7.5, cy: -36.0, r: 5.6, isPeriscope: false, isFlash: false },
    { id: "periscope", cx: -23.0, cy: -16.0, r: 7.0, isPeriscope: true, isFlash: false },
  ];

  // Depth-sort camera rings and windows back-to-front
  cameraElements.sort((a, b) => k.depthOf([a.cx, a.cy, 7.5], P) - k.depthOf([b.cx, b.cy, 7.5], P));

  for (const cam of cameraElements) {
    const { cx, cy, r, isPeriscope, isFlash } = cam;

    if (isFlash) {
      // --- Flash & Laser AF Cutout Window ---
      // Stepped metal cutout bezel: z = 6.4 to 7.0 (h = 0.6 mm, r = 3.8 mm, bevel = 0.15)
      const flashBezel = k.cylinder(cx, cy, r, topZ, 0.6, P, 28, 0.15);
      addSolid(flashBezel, { tone: "mid", crease: "faint" });

      // Sapphire protective window rim
      addLine(k.ring(cx, cy, r - 0.5, topZ + 0.6, P, 28), { tone: "faint" });

      // Dual-tone high-CRI LED flash emitters (warm and cool phosphor squares)
      const ledWarm = k.slabOf({ x: cx - 1.2, y: cy - 2.0, w: 2.4, d: 1.6, r: 0.3 }, topZ + 0.4, 0.2, P, 4);
      addSolid(ledWarm, { tone: "hi", crease: "none" });

      const ledCool = k.slabOf({ x: cx - 1.2, y: cy + 0.2, w: 2.4, d: 1.6, r: 0.3 }, topZ + 0.4, 0.2, P, 4);
      addSolid(ledCool, { tone: "hi", crease: "none" });

      // Laser Auto-Focus ToF sensor receiver / transmitter dark optics
      parts.push(k.dotsSvg([
        k.iso([cx, cy - 2.8, topZ + 0.5], P),
        k.iso([cx, cy + 2.4, topZ + 0.5], P),
      ], { size: 0.4, tone: "lo" }));
    } else {
      // --- Individual Grade 5 Titanium Camera Protection Ring ---
      // Stepped base collar on back glass: z = 6.4 to 6.9 (h = 0.5 mm, r = r + 0.5)
      const baseCollar = k.cylinder(cx, cy, r + 0.5, topZ, 0.5, P, 32, 0.1);
      addSolid(baseCollar, { tone: "mid", crease: "none" });

      // Main Grade 5 Titanium barrel: z = 6.9 to 8.6 (h = 1.7 mm, r = r, chamfered bevel = 0.35 mm)
      const barrelZ = topZ + 0.5; // 6.9 mm
      const barrelH = 1.7; // reaches 8.6 mm
      const rimZ = barrelZ + barrelH; // 8.6 mm
      const barrel = k.cylinder(cx, cy, r, barrelZ, barrelH, P, 32, 0.35);
      addSolid(barrel, { tone: "hi", crease: "faint", className: "titanium-ring" });

      // Chamfered bezel edge highlight
      addLine(k.ring(cx, cy, r - 0.35, rimZ, P, 32), { tone: "lit" });
      addLine(k.ring(cx, cy, r, barrelZ, P, 32), { tone: "lo" });

      // Sapphire crystal lens cap (recessed at z = 8.2 mm)
      const capZ = 8.1;
      const capH = 0.25;
      const capR = r - 0.75;
      const lensCap = k.cylinder(cx, cy, capR, capZ, capH, P, 32, 0.05);
      addSolid(lensCap, { tone: "lo", crease: "none", className: "sapphire-lens" });

      // Anti-reflective coating circular iridescent interference ring
      addLine(k.ring(cx, cy, capR - 0.6, capZ + capH, P, 32), { tone: "lo" });

      // Specular highlight arc on curved sapphire lens surface
      addLine(k.sideArc(cx, cy, capR - 0.9, capZ + capH, P, 24), { tone: "lit", free: true });

      // Internal optical aperture iris
      if (isPeriscope) {
        // 50MP 5x Folded Periscope optical rectangular prism pupil
        const prismPupil = k.slabOf({ x: cx - 2.4, y: cy - 2.4, w: 4.8, d: 4.8, r: 0.6 }, capZ - 0.05, 0.15, P, 6);
        addSolid(prismPupil, { tone: "lo", crease: "none" });

        // 45° internal reflection prism edge
        addLine(k.segment([cx - 2.2, cy - 2.2, capZ + 0.1], [cx + 2.2, cy + 2.2, capZ + 0.1], P), { tone: "mid" });
      } else {
        // Voice Coil Motor (VCM) circular aperture diaphragm ring
        addLine(k.ring(cx, cy, capR - 2.2, capZ + 0.1, P, 24), { tone: "lo" });
        // Sensor center pupil
        parts.push(k.dotsSvg([k.iso([cx, cy, capZ + 0.1], P)], { size: 0.7, tone: "lo" }));
      }
    }
  }

  // --- 4. Laser-Etched Samsung Logo Mark ---
  // Centered horizontally on the lower portion of the rear glass: (0, 52) at z = 6.4 mm
  const logoMat = k.topMatrix([0, 52], topZ, P, "x");
  parts.push(k.faceTextSvg(logoMat, "SAMSUNG", { size: 3.2, tone: "mid", anchor: "middle" }));

  // Laser alignment framing registration marks
  addLine(k.segment([-15, 52, topZ], [-12, 52, topZ], P), { tone: "faint" });
  addLine(k.segment([12, 52, topZ], [15, 52, topZ], P), { tone: "faint" });

  // Model identification & regulatory laser inscription
  const modelMat = k.topMatrix([0, 56.5], topZ, P, "x");
  parts.push(k.faceTextSvg(modelMat, "SM-S938B · GRADE 5 TITANIUM · CE", { size: 1.4, tone: "lo", anchor: "middle" }));

  const svg = parts.join("");
  const pathsCount = (svg.match(/<(path|circle|text)/g) || []).length;

  return {
    svg,
    solidsCount,
    pathsCount,
    bounds: [
      [-glassW / 2, -glassD / 2, glassZ],
      [glassW / 2, glassD / 2, 8.6],
    ],
  };
}
