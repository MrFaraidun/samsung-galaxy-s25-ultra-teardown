/**
 * Samsung Galaxy S25 Ultra — Isometric Geometry Frame Module
 * Front display stack & Titanium Frame / Inner Sub-chassis.
 * Adheres strictly to Anatomy engineering craft rules.
 */

import * as k from "./kit/iso-kit.mjs";

const PHONE_WIDTH = 77.6;
const PHONE_DEPTH = 162.8;
const PHONE_RADIUS = 4.2;
const HALF_WIDTH = PHONE_WIDTH / 2; // 38.8 mm
const HALF_DEPTH = PHONE_DEPTH / 2; // 81.4 mm

/**
 * Generates an SVG path for a pill / stadium shape on the vertical plane Y = cy.
 * Facing along +Y towards the isometric viewer.
 */
function verticalFacePill(cx, cy, cz, w, h, r, projection, steps = 8) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  const pts = [];
  // Right semicircular cap
  for (let i = 0; i <= steps; i++) {
    const a = -Math.PI / 2 + (Math.PI * i) / steps;
    pts.push([cx + w / 2 - radius + radius * Math.cos(a), cy, cz + radius * Math.sin(a)]);
  }
  // Left semicircular cap
  for (let i = 0; i <= steps; i++) {
    const a = Math.PI / 2 + (Math.PI * i) / steps;
    pts.push([cx - w / 2 + radius + radius * Math.cos(a), cy, cz + radius * Math.sin(a)]);
  }
  const screenPts = pts.map((pt) => k.iso(pt, projection));
  return k.pathOf(screenPts, true);
}

/**
 * Generates an SVG path for a circle on the vertical plane Y = cy.
 */
function verticalFaceCircle(cx, cy, cz, radius, projection, steps = 24) {
  const pts = [];
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    pts.push([cx + radius * Math.cos(a), cy, cz + radius * Math.sin(a)]);
  }
  const screenPts = pts.map((pt) => k.iso(pt, projection));
  return k.pathOf(screenPts, true);
}

/**
 * 1. buildDisplay(P)
 * Front panel stack for Galaxy S25 Ultra:
 * - Corning Gorilla Armor front glass (width 77.6, depth 162.8, r 4.2, thickness 0.6 mm, anti-reflective bezel)
 * - 6.86" Dynamic AMOLED 2X emissive matrix (bezel inset 1.4 mm, punch hole selfie camera aperture at top center [0, -74])
 * - Under-display ultrasonic fingerprint sensor module pad at [0, 42]
 * - Wacom EMR active digitizer grid lines
 * Returns { svg, solidsCount, pathsCount, bounds }
 */
export function buildDisplay(P) {
  const solids = [];
  const paths = [];

  // 1. Corning Gorilla Armor Front Glass Slab
  const zGlassBase = -1.2;
  const glassThickness = 0.6;
  const zGlassTop = zGlassBase + glassThickness; // -0.6 mm

  const glassPlan = {
    x: -HALF_WIDTH,
    y: -HALF_DEPTH,
    w: PHONE_WIDTH,
    d: PHONE_DEPTH,
    r: PHONE_RADIUS,
  };

  const glassSlabPaths = k.slabOf(glassPlan, zGlassBase, glassThickness, P, 16, 0.25);
  solids.push(k.solidSvg(glassSlabPaths, { tone: "hi", crease: "faint", className: "glass-outer" }));

  // Anti-reflective outer border line & polished bevel highlight
  paths.push(k.lineSvg(k.planOutline(k.insetPlan(glassPlan, 0.4), zGlassTop, P, 16), { tone: "lo" }));
  paths.push(k.lineSvg(k.planOutline(k.insetPlan(glassPlan, 0.8), zGlassTop, P, 16), { tone: "faint" }));

  // 2. 6.86" Dynamic AMOLED 2X Emissive Matrix
  const bezelInset = 1.4;
  const screenPlan = k.insetPlan(glassPlan, bezelInset); // w: 74.8, d: 160.0, r: 2.8
  const matrixThickness = 0.15;
  const zMatrixTop = zGlassTop + matrixThickness; // -0.45 mm

  const screenSlabPaths = k.slabOf(screenPlan, zGlassTop, matrixThickness, P, 16, 0.1);
  solids.push(k.solidSvg(screenSlabPaths, { tone: "mid", crease: "faint", className: "amoled-matrix" }));

  // Active matrix perimeter boundary line
  paths.push(k.lineSvg(k.planOutline(screenPlan, zMatrixTop, P, 16), { tone: "hi" }));

  // 3. Wacom EMR Active Digitizer Grid Lines
  // Orthogonal inductive resonant coil matrix embedded behind AMOLED panel
  const emrXMin = -33.0;
  const emrXMax = 33.0;
  const emrYMin = -74.0;
  const emrYMax = 74.0;
  const emrZ = zMatrixTop;

  // Grid border bounding loop so all traces end on a solid stroke
  const emrBoundsPts = [
    [emrXMin, emrYMin, emrZ],
    [emrXMax, emrYMin, emrZ],
    [emrXMax, emrYMax, emrZ],
    [emrXMin, emrYMax, emrZ],
  ].map((pt) => k.iso(pt, P));
  paths.push(k.lineSvg(k.pathOf(emrBoundsPts, true), { tone: "mid" }));

  const dotTerminals = [];

  // Vertical EMR loop traces (X coils) spaced every 5.5 mm
  const xStep = 5.5;
  for (let x = emrXMin + xStep; x <= emrXMax - 1e-4; x += xStep) {
    paths.push(
      k.lineSvg(k.segment([x, emrYMin, emrZ], [x, emrYMax, emrZ], P), {
        tone: "faint",
        dashed: Math.round(x) % 11 === 0,
      })
    );
    dotTerminals.push(k.iso([x, emrYMin, emrZ], P));
    dotTerminals.push(k.iso([x, emrYMax, emrZ], P));
  }

  // Horizontal EMR loop traces (Y coils) spaced every 9.25 mm
  const yStep = 9.25;
  for (let y = emrYMin + yStep; y <= emrYMax - 1e-4; y += yStep) {
    paths.push(
      k.lineSvg(k.segment([emrXMin, y, emrZ], [emrXMax, y, emrZ], P), {
        tone: "faint",
        dashed: Math.round(y) % 18 === 0,
      })
    );
    dotTerminals.push(k.iso([emrXMin, y, emrZ], P));
    dotTerminals.push(k.iso([emrXMax, y, emrZ], P));
  }

  // EMR coil termination solder vias at bounding wire ends
  paths.push(k.dotsSvg(dotTerminals, { size: 0.35, tone: "lo" }));

  // 4. Punch Hole Selfie Camera Aperture at Top Center [0, -74]
  const camX = 0;
  const camY = -74;
  const camZ = zMatrixTop;

  // Outer antireflection bezel ring
  paths.push(k.lineSvg(k.ring(camX, camY, 2.4, camZ, P, 32), { tone: "mid" }));
  // Dark punch-hole display aperture cut ring
  paths.push(k.lineSvg(k.ring(camX, camY, 1.8, camZ, P, 32), { tone: "hi" }));
  // Internal optic lens iris rim
  paths.push(k.lineSvg(k.ring(camX, camY, 1.1, camZ, P, 24), { tone: "lo" }));
  // Camera entrance pupil center optical element
  paths.push(k.dotsSvg([k.iso([camX, camY, camZ], P)], { size: 0.85, tone: "lit" }));

  // Precision optical alignment reticle ticks (all ending cleanly on circles)
  paths.push(k.lineSvg(k.segment([camX - 3.4, camY, camZ], [camX - 2.4, camY, camZ], P), { tone: "lo" }));
  paths.push(k.lineSvg(k.segment([camX + 2.4, camY, camZ], [camX + 3.4, camY, camZ], P), { tone: "lo" }));
  paths.push(k.lineSvg(k.segment([camX, camY - 3.4, camZ], [camX, camY - 2.4, camZ], P), { tone: "lo" }));
  paths.push(k.lineSvg(k.segment([camX, camY + 2.4, camZ], [camX, camY + 3.4, camY + 3.4 ? camZ : camZ], P), { tone: "lo" }));

  // 5. Under-Display Ultrasonic Fingerprint Sensor Module Pad at [0, 42]
  const fpCenter = [0, 42];
  const fpWidth = 20;
  const fpDepth = 15;
  const fpPlan = {
    x: fpCenter[0] - fpWidth / 2, // -10 mm
    y: fpCenter[1] - fpDepth / 2, // 34.5 mm
    w: fpWidth,
    d: fpDepth,
    r: 1.6,
  };
  const fpThickness = 0.12;
  const zFpTop = zMatrixTop + fpThickness; // -0.33 mm

  const fpSlabPaths = k.slabOf(fpPlan, zMatrixTop, fpThickness, P, 8, 0.1);
  solids.push(k.solidSvg(fpSlabPaths, { tone: "mid", crease: "lo", className: "ultrasonic-sensor" }));

  // Sensor active pad outline
  paths.push(k.lineSvg(k.planOutline(fpPlan, zFpTop, P, 8), { tone: "hi" }));

  // Ultrasonic acoustic impedance matching concentric wave rings
  paths.push(k.lineSvg(k.ring(fpCenter[0], fpCenter[1], 3.2, zFpTop, P, 24), { tone: "lo" }));
  paths.push(k.lineSvg(k.ring(fpCenter[0], fpCenter[1], 5.8, zFpTop, P, 32), { tone: "lo", dashed: true }));

  // Piezoelectric transducer micro-dot array lattice
  const fpDots = k.dotGrid(-8, 36.5, 9, 7, 2.0, zFpTop, P);
  paths.push(k.dotsSvg(fpDots, { size: 0.45, tone: "hi", pulse: true }));

  // Four corner datum alignment brackets on fingerprint pad
  const bracketSize = 1.6;
  const bracketCorners = [
    [-9.0, 35.5],
    [9.0, 35.5],
    [-9.0, 48.5],
    [9.0, 48.5],
  ];
  for (const [bx, by] of bracketCorners) {
    const sx = Math.sign(bx) || 1;
    const sy = Math.sign(by - fpCenter[1]) || 1;
    paths.push(
      k.lineSvg(
        k.pathOf([
          k.iso([bx - sx * bracketSize, by, zFpTop], P),
          k.iso([bx, by, zFpTop], P),
          k.iso([bx, by - sy * bracketSize, zFpTop], P),
        ]),
        { tone: "mid" }
      )
    );
  }

  // 6. Display Driver IC (DDIC) & COP Flex Connector at bottom chin
  const ddicPlan = {
    x: -14.0,
    y: 73.0,
    w: 28.0,
    d: 4.5,
    r: 0.6,
  };
  const ddicThickness = 0.25;
  const ddicSlabPaths = k.slabOf(ddicPlan, zGlassTop, ddicThickness, P, 4, 0.08);
  solids.push(k.solidSvg(ddicSlabPaths, { tone: "lo", crease: "lo", className: "ddic-controller" }));

  // COP flexible ribbon trace lines connecting to sub-chassis
  for (let fx = -10.0; fx <= 10.0; fx += 2.5) {
    paths.push(k.lineSvg(k.segment([fx, 77.5, zGlassTop], [fx, 80.0, zGlassTop], P), { tone: "lo" }));
  }

  // Top earpiece acoustic speaker mesh slit at [0, -80.6]
  const earpiecePath = verticalFacePill(0, -80.6, zGlassTop + 0.1, 14.0, 0.6, 0.3, P, 6);
  paths.push(k.lineSvg(earpiecePath, { tone: "mid" }));

  const svg = solids.join("") + paths.join("");
  const bounds = [
    [-HALF_WIDTH, -HALF_DEPTH, zGlassBase],
    [HALF_WIDTH, HALF_DEPTH, zFpTop],
  ];

  return {
    svg,
    solidsCount: solids.length,
    pathsCount: paths.length,
    bounds,
  };
}

/**
 * 2. buildChassis(P)
 * Titanium Grade 5 outer frame & aluminum inner sub-chassis:
 * - Grade 5 Titanium perimeter band (w 77.6, d 162.8, r 4.2, height 8.2 mm) with chamfered bevels
 * - Inner CNC milled 6013 aluminum sub-chassis floor with pockets:
 *   - Battery bay pocket (w 44, d 88, at [10, 8])
 *   - Motherboard upper bay (w 72, d 62, at [0, -48])
 *   - Sub-board lower bay (w 72, d 24, at [0, 68])
 *   - S Pen internal silo channel (w 6.8, d 110, at [-33, 24])
 * - Antenna dielectric injection-molded isolation seams (4 corner slits)
 * - Side buttons on right rail: Volume rocker and Power key
 * - Bottom cutouts: USB-C port slot, primary speaker grill slots, microphone pinholes
 * Returns { svg, solidsCount, pathsCount, bounds }
 */
export function buildChassis(P) {
  const solids = [];
  const paths = [];

  const zBase = 0.0;
  const frameHeight = 8.2;
  const zTop = zBase + frameHeight; // 8.2 mm

  // 1. Grade 5 Titanium Perimeter Band & Main Chassis Body
  const framePlan = {
    x: -HALF_WIDTH,
    y: -HALF_DEPTH,
    w: PHONE_WIDTH,
    d: PHONE_DEPTH,
    r: PHONE_RADIUS,
  };

  const chassisSlabPaths = k.slabOf(framePlan, zBase, frameHeight, P, 16, 0.4);
  solids.push(k.solidSvg(chassisSlabPaths, { tone: "hi", crease: "faint", className: "titanium-perimeter-frame" }));

  // 2. Inner CNC Milled 6013 Aluminum Sub-Chassis Floor
  // Laser-welded to the titanium outer band with a 1.8 mm rim wall
  const subChassisPlan = k.insetPlan(framePlan, 1.8);
  paths.push(k.lineSvg(k.planOutline(subChassisPlan, zTop, P, 16), { tone: "mid" }));

  // CNC machined inner transition chamfer step
  paths.push(k.lineSvg(k.planOutline(k.insetPlan(framePlan, 2.4), zTop, P, 16), { tone: "lo" }));

  // 3. Inner CNC Milled Sub-Chassis Pockets
  const pocketFloorZ = zTop - 1.2; // 7.0 mm (1.2 mm pocket milling depth)

  // A. Motherboard Upper Bay (w 72, d 62, at [0, -48])
  const mbPlan = {
    x: -36.0,
    y: -79.0,
    w: 72.0,
    d: 62.0,
    r: 2.2,
  };
  paths.push(k.lineSvg(k.planOutline(mbPlan, zTop, P, 16), { tone: "hi" }));
  paths.push(k.lineSvg(k.planOutline(k.insetPlan(mbPlan, 0.8), pocketFloorZ, P, 16), { tone: "lo" }));

  // Recessed inner wall shadow facets (visible back wall at y = -79, left wall at x = -36)
  const mbWallTop = [
    [-36.0, -17.0, zTop],
    [-36.0, -79.0, zTop],
    [36.0, -79.0, zTop],
  ].map((pt) => k.iso(pt, P));
  const mbWallBot = [
    [36.0 - 0.8, -79.0 + 0.8, pocketFloorZ],
    [-36.0 + 0.8, -79.0 + 0.8, pocketFloorZ],
    [-36.0 + 0.8, -17.0, pocketFloorZ],
  ].map((pt) => k.iso(pt, P));
  paths.push(k.lineSvg(k.pathOf([...mbWallTop, ...mbWallBot], true), { tone: "lo" }));

  // Snapdragon 8 Elite SoC Pedestal Recess (Solid Pedestal)
  const socPlan = {
    x: -7.0,
    y: -55.0,
    w: 15.0,
    d: 15.0,
    r: 1.0,
  };
  const socSlabPaths = k.slabOf(socPlan, pocketFloorZ, 0.6, P, 4, 0.1);
  solids.push(k.solidSvg(socSlabPaths, { tone: "mid", crease: "lo", className: "soc-pedestal" }));

  // SoC thermal interface crosshatch scoring
  paths.push(k.lineSvg(k.segment([-7.0, -47.5, pocketFloorZ + 0.6], [8.0, -47.5, pocketFloorZ + 0.6], P), { tone: "lo" }));
  paths.push(k.lineSvg(k.segment([0.5, -55.0, pocketFloorZ + 0.6], [0.5, -40.0, pocketFloorZ + 0.6], P), { tone: "lo" }));

  // RF Shield Can Partition Ribs in Motherboard Bay
  paths.push(k.lineSvg(k.segment([-35.0, -45.0, pocketFloorZ], [-8.0, -45.0, pocketFloorZ], P), { tone: "lo", dashed: true }));
  paths.push(k.lineSvg(k.segment([9.0, -45.0, pocketFloorZ], [35.0, -45.0, pocketFloorZ], P), { tone: "lo", dashed: true }));
  paths.push(k.lineSvg(k.segment([-18.0, -78.0, pocketFloorZ], [-18.0, -45.0, pocketFloorZ], P), { tone: "lo", dashed: true }));

  // Quad camera mount wells in upper left quadrant
  // 200MP Wide OIS well:
  paths.push(k.lineSvg(k.ring(-14.0, -64.0, 7.5, pocketFloorZ, P, 24), { tone: "mid" }));
  paths.push(k.lineSvg(k.ring(-14.0, -64.0, 5.5, pocketFloorZ, P, 20), { tone: "lo" }));
  // 50MP Periscope rectangular well:
  const periWellPlan = { x: -28.0, y: -42.0, w: 12.0, d: 22.0, r: 1.2 };
  paths.push(k.lineSvg(k.planOutline(periWellPlan, pocketFloorZ, P, 8), { tone: "mid" }));
  // Ultra-wide & 3x Tele wells:
  paths.push(k.lineSvg(k.ring(-14.0, -32.0, 6.0, pocketFloorZ, P, 20), { tone: "mid" }));
  paths.push(k.lineSvg(k.ring(2.0, -64.0, 4.5, pocketFloorZ, P, 16), { tone: "mid" }));

  // B. Battery Bay Pocket (w 44, d 88, at [10, 8])
  const batPlan = {
    x: 10.0 - 22.0, // -12.0 mm
    y: 8.0 - 44.0, // -36.0 mm
    w: 44.0,
    d: 88.0,
    r: 2.8,
  };
  const batFloorZ = zTop - 1.4; // 6.8 mm deep pocket
  paths.push(k.lineSvg(k.planOutline(batPlan, zTop, P, 16), { tone: "hi" }));
  paths.push(k.lineSvg(k.planOutline(k.insetPlan(batPlan, 0.8), batFloorZ, P, 16), { tone: "lo" }));

  // Battery bay visible inner wall facets (back wall at y = -36, left wall at x = -12)
  const batWallTop = [
    [-12.0, 52.0, zTop],
    [-12.0, -36.0, zTop],
    [32.0, -36.0, zTop],
  ].map((pt) => k.iso(pt, P));
  const batWallBot = [
    [32.0 - 0.8, -36.0 + 0.8, batFloorZ],
    [-12.0 + 0.8, -36.0 + 0.8, batFloorZ],
    [-12.0 + 0.8, 52.0, batFloorZ],
  ].map((pt) => k.iso(pt, P));
  paths.push(k.lineSvg(k.pathOf([...batWallTop, ...batWallBot], true), { tone: "lo" }));

  // CNC Milling Toolpaths across Battery Floor (Aerospace pocket surfacing spirals)
  const batInnerPlan = k.insetPlan(batPlan, 4.0);
  for (let step = 0; step < 3; step++) {
    const spiralPlan = k.insetPlan(batInnerPlan, step * 3.5);
    paths.push(k.lineSvg(k.planOutline(spiralPlan, batFloorZ, P, 12), { tone: "faint" }));
  }

  // Battery removal pull-tab recessed adhesive channels
  paths.push(k.lineSvg(k.segment([-4.0, -28.0, batFloorZ], [-4.0, 44.0, batFloorZ], P), { tone: "lo" }));
  paths.push(k.lineSvg(k.segment([24.0, -28.0, batFloorZ], [24.0, 44.0, batFloorZ], P), { tone: "lo" }));

  // C. Sub-Board Lower Bay (w 72, d 24, at [0, 68])
  const subBayPlan = {
    x: -36.0,
    y: 56.0,
    w: 72.0,
    d: 24.0,
    r: 2.2,
  };
  paths.push(k.lineSvg(k.planOutline(subBayPlan, zTop, P, 16), { tone: "hi" }));
  paths.push(k.lineSvg(k.planOutline(k.insetPlan(subBayPlan, 0.8), pocketFloorZ, P, 16), { tone: "lo" }));

  // Sub-board pocket visible inner wall facet
  const subWallTop = [
    [-36.0, 80.0, zTop],
    [-36.0, 56.0, zTop],
    [36.0, 56.0, zTop],
  ].map((pt) => k.iso(pt, P));
  const subWallBot = [
    [36.0 - 0.8, 56.0 + 0.8, pocketFloorZ],
    [-36.0 + 0.8, 56.0 + 0.8, pocketFloorZ],
    [-36.0 + 0.8, 80.0, pocketFloorZ],
  ].map((pt) => k.iso(pt, P));
  paths.push(k.lineSvg(k.pathOf([...subWallTop, ...subWallBot], true), { tone: "lo" }));

  // Linear Resonant Haptic Actuator Cradle (Solid block in sub-bay)
  const hapticPlan = {
    x: 12.0,
    y: 60.0,
    w: 18.0,
    d: 13.0,
    r: 1.2,
  };
  const hapticSlabPaths = k.slabOf(hapticPlan, pocketFloorZ, 0.7, P, 4, 0.1);
  solids.push(k.solidSvg(hapticSlabPaths, { tone: "lo", crease: "lo", className: "haptic-cradle" }));

  // Acoustic speaker resonance baffle rib slots
  for (let sx = -30.0; sx <= -10.0; sx += 4.5) {
    paths.push(k.lineSvg(k.segment([sx, 62.0, pocketFloorZ], [sx, 74.0, pocketFloorZ], P), { tone: "lo" }));
  }

  // D. S Pen Internal Silo Channel (w 6.8, d 110, at [-33, 24])
  const spenPlan = {
    x: -33.0 - 3.4, // -36.4 mm
    y: 24.0 - 55.0, // -31.0 mm
    w: 6.8,
    d: 110.0,
    r: 1.8,
  };
  const spenFloorZ = zTop - 2.0; // 6.2 mm deep silo dock
  paths.push(k.lineSvg(k.planOutline(spenPlan, zTop, P, 8), { tone: "hi" }));
  paths.push(k.lineSvg(k.planOutline(k.insetPlan(spenPlan, 0.5), spenFloorZ, P, 8), { tone: "lo" }));

  // Silo sleeve internal guide rib rails
  paths.push(k.lineSvg(k.segment([-35.0, -28.0, spenFloorZ], [-35.0, 77.0, spenFloorZ], P), { tone: "mid" }));
  paths.push(k.lineSvg(k.segment([-31.0, -28.0, spenFloorZ], [-31.0, 77.0, spenFloorZ], P), { tone: "mid" }));

  // Inductive fast-charging receiver coil well at silo tip
  paths.push(k.lineSvg(k.ring(-33.0, -25.0, 2.2, spenFloorZ, P, 16), { tone: "lo" }));

  // S Pen Ejection Spring Silo Sleeve (Solid sleeve body inside midframe)
  const siloSleevePlan = {
    x: -36.0,
    y: 65.0,
    w: 6.0,
    d: 14.0,
    r: 1.2,
  };
  const siloSleeveSlab = k.slabOf(siloSleevePlan, spenFloorZ, 0.9, P, 4, 0.1);
  solids.push(k.solidSvg(siloSleeveSlab, { tone: "lo", crease: "lo", className: "spen-ejection-sleeve" }));

  // Dividing Bulkhead Structural Ribs between bays
  // Rib between MB and Battery:
  paths.push(k.lineSvg(k.segment([-12.0, -36.0, zTop], [36.0, -36.0, zTop], P), { tone: "hi" }));
  // Bridge between Battery and S-Pen Silo:
  paths.push(k.lineSvg(k.segment([-29.6, -31.0, zTop], [-29.6, 52.0, zTop], P), { tone: "mid" }));
  paths.push(k.lineSvg(k.segment([-12.0, -31.0, zTop], [-12.0, 52.0, zTop], P), { tone: "mid" }));
  // Lower bulkhead between Battery and Sub-board:
  paths.push(k.lineSvg(k.segment([-36.0, 54.0, zTop], [36.0, 54.0, zTop], P), { tone: "hi" }));

  // Standoff CNC screw boss positions (structural anchor points)
  const bosses = [
    [-32.0, -75.0],
    [32.0, -75.0],
    [32.0, -20.0],
    [-16.0, -38.0],
    [30.0, 50.0],
    [-28.0, 54.0],
    [-32.0, 76.0],
    [32.0, 76.0],
  ];
  for (const [bx, by] of bosses) {
    paths.push(k.lineSvg(k.ring(bx, by, 1.2, pocketFloorZ, P, 12), { tone: "mid" }));
    paths.push(k.dotsSvg([k.iso([bx, by, pocketFloorZ], P)], { size: 0.45, tone: "lo" }));
  }

  // 4. Side Buttons on Right Rail (+X rail at X = 38.8 mm)
  const zBtnMid = 4.1; // Centered vertically on the 8.2 mm titanium band
  const btnHeight = 1.8;
  const btnZ = zBtnMid - btnHeight / 2; // 3.2 mm
  const btnProtrusion = 0.8;

  // A. Volume Rocker: center y = -28.0, length 18.0 mm (y: -37.0 to -19.0)
  const volPlan = {
    x: HALF_WIDTH, // 38.8 mm
    y: -37.0,
    w: btnProtrusion,
    d: 18.0,
    r: 0.35,
  };
  const volSlabPaths = k.slabOf(volPlan, btnZ, btnHeight, P, 4, 0.12);
  solids.push(k.solidSvg(volSlabPaths, { tone: "hi", crease: "lo", className: "volume-rocker" }));

  // Volume rocker divider notch line
  paths.push(k.lineSvg(k.segment([HALF_WIDTH + btnProtrusion, -28.0, btnZ], [HALF_WIDTH + btnProtrusion, -28.0, btnZ + btnHeight], P), { tone: "hi" }));

  // B. Power / Side Key: center y = -2.0, length 10.0 mm (y: -7.0 to 3.0)
  const pwrPlan = {
    x: HALF_WIDTH, // 38.8 mm
    y: -7.0,
    w: btnProtrusion,
    d: 10.0,
    r: 0.35,
  };
  const pwrSlabPaths = k.slabOf(pwrPlan, btnZ, btnHeight, P, 4, 0.12);
  solids.push(k.solidSvg(pwrSlabPaths, { tone: "hi", crease: "lo", className: "power-key" }));

  // Power key tactile micro-groove
  paths.push(k.lineSvg(k.segment([HALF_WIDTH + btnProtrusion, -2.0, btnZ + 0.3], [HALF_WIDTH + btnProtrusion, -2.0, btnZ + btnHeight - 0.3], P), { tone: "lo" }));

  // 5. Bottom Cutouts on Bottom Rail (+Y rail at Y = 81.4 mm)
  const bottomY = HALF_DEPTH; // 81.4 mm
  const portZCenter = 4.1;

  // A. USB-C 3.2 Port Slot (centered at X = 0)
  const usbWidth = 8.6;
  const usbHeight = 2.8;
  const usbRadius = 1.2;
  const usbOuterPath = verticalFacePill(0, bottomY, portZCenter, usbWidth, usbHeight, usbRadius, P, 8);
  const usbInnerPath = verticalFacePill(0, bottomY, portZCenter, usbWidth - 0.6, usbHeight - 0.6, usbRadius - 0.3, P, 8);
  paths.push(k.lineSvg(usbOuterPath, { tone: "hi" }));
  paths.push(k.lineSvg(usbInnerPath, { tone: "lo" }));

  // USB-C internal pin tongue contact terminal array
  paths.push(k.lineSvg(k.segment([-2.8, bottomY, portZCenter], [2.8, bottomY, portZCenter], P), { tone: "lit", free: true }));

  // B. Primary Speaker Grill Slots (to the right of USB-C: x = 11 to 23)
  const speakerSlotsX = [11.0, 14.0, 17.0, 20.0, 23.0];
  const spkWidth = 1.8;
  const spkHeight = 1.5;
  const spkRadius = 0.65;
  for (const sx of speakerSlotsX) {
    const spkPath = verticalFacePill(sx, bottomY, portZCenter, spkWidth, spkHeight, spkRadius, P, 6);
    paths.push(k.lineSvg(spkPath, { tone: "hi" }));
  }

  // C. Microphone Pinholes on bottom face
  const mic1Path = verticalFaceCircle(-7.5, bottomY, portZCenter, 0.5, P, 16);
  const mic2Path = verticalFaceCircle(-15.0, bottomY, portZCenter, 0.5, P, 16);
  paths.push(k.lineSvg(mic1Path, { tone: "mid" }));
  paths.push(k.lineSvg(mic2Path, { tone: "mid" }));
  paths.push(k.dotsSvg([k.iso([-7.5, bottomY, portZCenter], P), k.iso([-15.0, bottomY, portZCenter], P)], { size: 0.35, tone: "lo" }));

  // D. S Pen Silo Dock Opening at [-33.0, 81.4]
  const spenOpeningWidth = 6.4;
  const spenOpeningHeight = 4.6;
  const spenOpeningRadius = 1.4;
  const spenDockPath = verticalFacePill(-33.0, bottomY, portZCenter, spenOpeningWidth, spenOpeningHeight, spenOpeningRadius, P, 8);
  const spenDockInner = verticalFacePill(-33.0, bottomY, portZCenter, spenOpeningWidth - 0.8, spenOpeningHeight - 0.8, spenOpeningRadius - 0.4, P, 8);
  paths.push(k.lineSvg(spenDockPath, { tone: "hi" }));
  paths.push(k.lineSvg(spenDockInner, { tone: "mid" }));

  // 6. Antenna Dielectric Injection-Molded Isolation Seams (4 Corner Slits)
  // Injection molded PEEK slits decoupling RF antennas on titanium perimeter
  const seamWidth = 0.5;

  // A. Right rail upper seam (y = -68.0, x = 38.8 mm)
  paths.push(k.lineSvg(k.segment([HALF_WIDTH, -68.0, zBase], [HALF_WIDTH, -68.0, zTop], P), { tone: "hi" }));
  paths.push(k.lineSvg(k.segment([HALF_WIDTH, -68.0 - seamWidth, zBase], [HALF_WIDTH, -68.0 - seamWidth, zTop], P), { tone: "mid" }));
  paths.push(k.lineSvg(k.segment([HALF_WIDTH, -68.0, zTop], [HALF_WIDTH - 1.8, -68.0, zTop], P), { tone: "hi" }));

  // B. Right rail lower seam (y = 62.0, x = 38.8 mm)
  paths.push(k.lineSvg(k.segment([HALF_WIDTH, 62.0, zBase], [HALF_WIDTH, 62.0, zTop], P), { tone: "hi" }));
  paths.push(k.lineSvg(k.segment([HALF_WIDTH, 62.0 + seamWidth, zBase], [HALF_WIDTH, 62.0 + seamWidth, zTop], P), { tone: "mid" }));
  paths.push(k.lineSvg(k.segment([HALF_WIDTH, 62.0, zTop], [HALF_WIDTH - 1.8, 62.0, zTop], P), { tone: "hi" }));

  // C. Bottom rail right seam (x = 28.0, y = 81.4 mm)
  paths.push(k.lineSvg(k.segment([28.0, bottomY, zBase], [28.0, bottomY, zTop], P), { tone: "hi" }));
  paths.push(k.lineSvg(k.segment([28.0 + seamWidth, bottomY, zBase], [28.0 + seamWidth, bottomY, zTop], P), { tone: "mid" }));
  paths.push(k.lineSvg(k.segment([28.0, bottomY, zTop], [28.0, bottomY - 1.8, zTop], P), { tone: "hi" }));

  // D. Bottom rail left seam (x = -28.0, y = 81.4 mm)
  paths.push(k.lineSvg(k.segment([-28.0, bottomY, zBase], [-28.0, bottomY, zTop], P), { tone: "hi" }));
  paths.push(k.lineSvg(k.segment([-28.0 - seamWidth, bottomY, zBase], [-28.0 - seamWidth, bottomY, zTop], P), { tone: "mid" }));
  paths.push(k.lineSvg(k.segment([-28.0, bottomY, zTop], [-28.0, bottomY - 1.8, zTop], P), { tone: "hi" }));

  const svg = solids.join("") + paths.join("");
  const bounds = [
    [-HALF_WIDTH, -HALF_DEPTH, zBase],
    [HALF_WIDTH + btnProtrusion, HALF_DEPTH, zTop],
  ];

  return {
    svg,
    solidsCount: solids.length,
    pathsCount: paths.length,
    bounds,
  };
}
