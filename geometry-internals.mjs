/**
 * Samsung Galaxy S25 Ultra — Engineering Internals Geometry Module
 * Precision physical CAD models for:
 * 1. buildVaporChamber(P): 4,100 mm² dual-phase vapor chamber
 * 2. buildBattery(P): 5,000 mAh Li-ion polymer pouch cell with PCM & pull-tab
 * 3. buildSPen(P): 4,096-pressure inductive resonance S Pen stylus with clicker
 *
 * Adheres strictly to Anatomy engineering craft standards:
 * - Solids, not wireframes (k.slabOf, k.cylinder, G.lathe)
 * - Kit-shaded tone hierarchy (hi, mid, lo, faint, lit)
 * - Fully resolved line geometry and proper coil depth interleaving
 */

import * as k from "./kit/iso-kit.mjs";
import * as G from "./kit/lathe.mjs";

/* ==========================================================================
   1. VAPOR CHAMBER (4,100 mm² Sintered Dual-Phase Cooling Core)
   ========================================================================== */

/**
 * Builds the enlarged 4,100 mm² stainless steel & sintered copper vapor chamber.
 * Spans from Snapdragon 8 Elite SoC evaporator down across the battery bay flank.
 *
 * @param {object} P Projection parameters
 * @returns {{ svg: string, solidsCount: number, pathsCount: number, bounds: number[][] }}
 */
export function buildVaporChamber(P) {
  const parts = [];
  let solidsCount = 0;
  let pathsCount = 0;

  const z0 = 1.0; // restZ for vapor chamber
  const t_base = 0.45; // thickness of chamber body

  // --------------------------------------------------------------------------
  // Base Flange Perimeter: Laser-welded stainless steel envelope flange
  // --------------------------------------------------------------------------
  // Upper evaporator flange (spans across SoC zone):
  const flangeUpper = k.slabOf({ x: -27.5, y: 26.5, w: 57.0, d: 43.0, r: 3.5 }, z0, 0.15, P, 10);
  parts.push(k.solidSvg(flangeUpper, { tone: "mid", crease: "faint" }));
  solidsCount++;

  // Lower condenser flank flange (runs down the battery flank):
  const flangeLower = k.slabOf({ x: -27.5, y: -45.5, w: 31.0, d: 73.0, r: 3.5 }, z0, 0.15, P, 10);
  parts.push(k.solidSvg(flangeLower, { tone: "mid", crease: "faint" }));
  solidsCount++;

  // --------------------------------------------------------------------------
  // Main Vapor Chamber Body: Stamped stainless steel dual-chamber envelope
  // Dissipation area: ~54×40 (2,160 mm²) + 28×72 (2,016 mm²) = 4,176 mm² (~4,100 mm²)
  // --------------------------------------------------------------------------
  // Upper evaporator chamber (under motherboard and Snapdragon 8 Elite SoC):
  const coreUpper = k.slabOf({ x: -26.0, y: 28.0, w: 54.0, d: 40.0, r: 2.5 }, z0, t_base, P, 10, 0.2);
  parts.push(k.solidSvg(coreUpper, { tone: "hi", crease: "faint" }));
  solidsCount++;

  // Lower condenser chamber (beside & beneath the battery bay):
  const coreLower = k.slabOf({ x: -26.0, y: -44.0, w: 28.0, d: 72.0, r: 2.5 }, z0, t_base, P, 10, 0.2);
  parts.push(k.solidSvg(coreLower, { tone: "hi", crease: "faint" }));
  solidsCount++;

  // --------------------------------------------------------------------------
  // Condenser Manifold & Internal Stamped Relief
  // --------------------------------------------------------------------------
  // Lower condensation sump / manifold return zone:
  const sumpRelief = k.slabOf({ x: -24.5, y: -42.0, w: 25.0, d: 18.0, r: 1.5 }, z0 + t_base, 0.12, P, 8);
  parts.push(k.solidSvg(sumpRelief, { tone: "mid", crease: "none" }));
  solidsCount++;

  // Evaporator lateral vapor distributor manifold:
  const evapManifold = k.slabOf({ x: -24.0, y: 32.0, w: 22.0, d: 32.0, r: 1.5 }, z0 + t_base, 0.10, P, 8);
  parts.push(k.solidSvg(evapManifold, { tone: "mid", crease: "none" }));
  solidsCount++;

  // --------------------------------------------------------------------------
  // Snapdragon 8 Elite SoC Direct Thermal Contact Elevated Copper Boss
  // --------------------------------------------------------------------------
  // Direct copper thermal boss (elevated to contact SoC heatspreader package):
  const copperBoss = k.slabOf({ x: 3.0, y: 41.5, w: 18.0, d: 18.0, r: 1.5 }, z0 + t_base, 0.38, P, 8, 0.12);
  parts.push(k.solidSvg(copperBoss, { tone: "lit", crease: "faint", lit: true }));
  solidsCount++;

  // Pure copper thermal interface contact pad (direct die zone):
  const copperSlug = k.slabOf({ x: 5.5, y: 44.0, w: 13.0, d: 13.0, r: 0.8 }, z0 + t_base + 0.38, 0.15, P, 6);
  parts.push(k.solidSvg(copperSlug, { tone: "hi", crease: "none" }));
  solidsCount++;

  // --------------------------------------------------------------------------
  // Laser Perimeter Weld Seams
  // --------------------------------------------------------------------------
  // Upper weld seam perimeter around the flange:
  const weldUpperPlan = { x: -27.0, y: 27.0, w: 56.0, d: 42.0, r: 3.0 };
  const weldUpperOutline = k.planOutline(weldUpperPlan, z0 + 0.15, P, 12);
  parts.push(k.lineSvg(weldUpperOutline, { tone: "mid", dashed: true }));
  pathsCount++;

  // Lower weld seam perimeter:
  const weldLowerPlan = { x: -27.0, y: -45.0, w: 30.0, d: 72.0, r: 3.0 };
  const weldLowerOutline = k.planOutline(weldLowerPlan, z0 + 0.15, P, 12);
  parts.push(k.lineSvg(weldLowerOutline, { tone: "mid", dashed: true }));
  pathsCount++;

  // Laser stitch pulse spots along perimeter corners:
  const weldDots = [];
  for (let y = -43; y <= 66; y += 4) {
    weldDots.push(k.iso([-27.0, y, z0 + 0.15], P));
  }
  for (let x = -25; x <= 27; x += 4) {
    weldDots.push(k.iso([x, 68.5, z0 + 0.15], P));
  }
  for (let y = 29; y <= 67; y += 4) {
    weldDots.push(k.iso([28.5, y, z0 + 0.15], P));
  }
  parts.push(k.dotsSvg(weldDots, { size: 0.35, tone: "lo" }));
  pathsCount++;

  // --------------------------------------------------------------------------
  // Condenser Return Channels: Stamped longitudinal liquid capillary veins
  // --------------------------------------------------------------------------
  const channelX = [-20.5, -14.5, -8.5, -2.5];
  for (const cx of channelX) {
    // Dual embossed groove boundary lines representing pressed channel walls:
    const segLeft = k.segment([cx - 0.7, -39.0, z0 + t_base], [cx - 0.7, 26.0, z0 + t_base], P);
    const segRight = k.segment([cx + 0.7, -39.0, z0 + t_base], [cx + 0.7, 26.0, z0 + t_base], P);
    parts.push(k.lineSvg(segLeft, { tone: "mid", free: true }));
    parts.push(k.lineSvg(segRight, { tone: "lo", free: true }));
    pathsCount += 2;

    // Fluid flow arrow notches along return channels (condensed fluid reflux):
    for (let ay = -32; ay <= 20; ay += 14) {
      const arrowTip = [cx, ay + 2.0, z0 + t_base];
      const arrowL = [cx - 0.6, ay, z0 + t_base];
      const arrowR = [cx + 0.6, ay, z0 + t_base];
      const arrowD = `${k.pathOf([k.iso(arrowL, P), k.iso(arrowTip, P), k.iso(arrowR, P)])}`;
      parts.push(k.lineSvg(arrowD, { tone: "lo", free: true }));
      pathsCount++;
    }
  }

  // Cross-manifold distribution channels in evaporator:
  for (const my of [34.0, 48.0, 60.0]) {
    const manifoldSeg = k.segment([-23.0, my, z0 + t_base], [1.5, my, z0 + t_base], P);
    parts.push(k.lineSvg(manifoldSeg, { tone: "lo", dashed: true, free: true }));
    pathsCount++;
  }

  // --------------------------------------------------------------------------
  // Micro-Etched Dual-Phase Capillary Wick Pattern (Fine Mesh Line Grid)
  // --------------------------------------------------------------------------
  const wickLines = [];
  // Fine sintered copper mesh grid across the evaporator zone:
  for (let gx = -24.0; gx <= 0.0; gx += 2.4) {
    const dMeshY = k.segment([gx, 30.0, z0 + t_base], [gx, 65.0, z0 + t_base], P);
    wickLines.push(k.lineSvg(dMeshY, { tone: "faint", free: true }));
    pathsCount++;
  }
  for (let gy = 30.0; gy <= 65.0; gy += 2.4) {
    const dMeshX = k.segment([-24.0, gy, z0 + t_base], [0.0, gy, z0 + t_base], P);
    wickLines.push(k.lineSvg(dMeshX, { tone: "faint", free: true }));
    pathsCount++;
  }

  // Capillary wick mesh in the lower condenser zone:
  for (let gx = -24.0; gx <= 0.0; gx += 2.4) {
    const dCondY = k.segment([gx, -42.0, z0 + t_base], [gx, -20.0, z0 + t_base], P);
    wickLines.push(k.lineSvg(dCondY, { tone: "faint", free: true }));
    pathsCount++;
  }
  for (let gy = -42.0; gy <= -20.0; gy += 2.4) {
    const dCondX = k.segment([-24.0, gy, z0 + t_base], [0.0, gy, z0 + t_base], P);
    wickLines.push(k.lineSvg(dCondX, { tone: "faint", free: true }));
    pathsCount++;
  }
  parts.push(`<g id="vapor-chamber-wick" class="iso-flow vapor-chamber-wick" data-flow="">${wickLines.join("")}</g>`);

  // --------------------------------------------------------------------------
  // Technical Laser Markings & Typography
  // --------------------------------------------------------------------------
  const zSurface = z0 + t_base + 0.01;

  // Header marking on upper chamber:
  const matUpper1 = k.topMatrix([-23.5, 64.0], zSurface, P, "x");
  parts.push(k.faceTextSvg(matUpper1, "SAMSUNG VC-4100mm² · DUAL-PHASE", { size: 2.2, tone: "hi" }));
  pathsCount++;

  const matUpper2 = k.topMatrix([-23.5, 60.5], zSurface, P, "x");
  parts.push(k.faceTextSvg(matUpper2, "SINTERED COPPER WICK · DEIONIZED H2O", { size: 1.7, tone: "mid" }));
  pathsCount++;

  const matUpper3 = k.topMatrix([-23.5, 57.0], zSurface, P, "x");
  parts.push(k.faceTextSvg(matUpper3, "THERMAL FLUX: >5000 W/m·K · ΔT -4.2°C", { size: 1.6, tone: "lo" }));
  pathsCount++;

  // Marking on direct copper contact boss:
  const zBossTop = z0 + t_base + 0.38 + 0.01;
  const matBoss1 = k.topMatrix([4.5, 56.5], zBossTop, P, "x");
  parts.push(k.faceTextSvg(matBoss1, "SNAPDRAGON 8 ELITE", { size: 1.8, tone: "lit" }));
  pathsCount++;

  const matBoss2 = k.topMatrix([4.5, 53.0], zBossTop, P, "x");
  parts.push(k.faceTextSvg(matBoss2, "TSMC 3nm N3E · DIRECT Cu", { size: 1.4, tone: "mid" }));
  pathsCount++;

  // Condenser return zone marking:
  const matCond = k.topMatrix([-23.5, -5.0], zSurface, P, "x");
  parts.push(k.faceTextSvg(matCond, "CONDENSER LIQUID RETURN", { size: 1.8, tone: "mid" }));
  pathsCount++;

  const matCondSub = k.topMatrix([-23.5, -8.0], zSurface, P, "x");
  parts.push(k.faceTextSvg(matCondSub, "MICRO-CAPILLARY ARTERY", { size: 1.4, tone: "lo" }));
  pathsCount++;

  const bounds = [
    [-28.0, -46.0, 1.0],
    [30.0, 70.0, 2.1],
  ];

  return {
    svg: parts.join(""),
    solidsCount,
    pathsCount,
    bounds,
  };
}

/* ==========================================================================
   2. BATTERY (5,000 mAh Li-ion Dual-Tab Polymer Pouch Cell)
   ========================================================================== */

/**
 * Builds the 5,000 mAh Li-ion polymer pouch cell assembly.
 * Complete with upper Protection Circuit Module (PCM), fuel gauge IC,
 * dual laser-welded nickel tabs, blue pull-tab carrier, and technical laser typography.
 *
 * Dimensions: w 42 mm, d 86 mm, h 4.8 mm, r 2.0 mm
 *
 * @param {object} P Projection parameters
 * @returns {{ svg: string, solidsCount: number, pathsCount: number, bounds: number[][] }}
 */
export function buildBattery(P) {
  const parts = [];
  let solidsCount = 0;
  let pathsCount = 0;

  const z0 = 1.8; // restZ for battery assembly
  const h_cell = 4.8; // cell thickness
  const z_top = z0 + h_cell; // z = 6.6 mm

  // Main Pouch Dimensions:
  const cellPlan = { x: -11.0, y: -52.0, w: 42.0, d: 86.0, r: 2.0 };

  // --------------------------------------------------------------------------
  // Main Li-Ion Polymer Pouch Cell Body
  // --------------------------------------------------------------------------
  // Aluminum-laminated foil pouch cell with smooth pillow bevel:
  const cellPouch = k.slabOf(cellPlan, z0, h_cell, P, 12, 0.45);
  parts.push(k.solidSvg(cellPouch, { tone: "hi", crease: "faint" }));
  solidsCount++;

  // Side heat-sealed foil edge crimps (folded flat along the flanks):
  const leftFlange = k.slabOf({ x: -11.6, y: -50.5, w: 0.6, d: 83.0, r: 0.2 }, z0 + 0.2, h_cell - 0.4, P, 4);
  parts.push(k.solidSvg(leftFlange, { tone: "mid", crease: "none" }));
  solidsCount++;

  const rightFlange = k.slabOf({ x: 30.9, y: -50.5, w: 0.6, d: 83.0, r: 0.2 }, z0 + 0.2, h_cell - 0.4, P, 4);
  parts.push(k.solidSvg(rightFlange, { tone: "mid", crease: "none" }));
  solidsCount++;

  // Perimeter pouch heat-seal seam crease lines:
  const seamLeft = k.segment([-11.0, -50.0, z_top - 0.2], [-11.0, 32.0, z_top - 0.2], P);
  const seamRight = k.segment([31.0, -50.0, z_top - 0.2], [31.0, 32.0, z_top - 0.2], P);
  const seamBottom = k.segment([-9.0, -52.0, z_top - 0.2], [29.0, -52.0, z_top - 0.2], P);
  parts.push(k.lineSvg(seamLeft, { tone: "lo", free: true }));
  parts.push(k.lineSvg(seamRight, { tone: "lo", free: true }));
  parts.push(k.lineSvg(seamBottom, { tone: "lo", free: true }));
  pathsCount += 3;

  // --------------------------------------------------------------------------
  // Protection Circuit Module (PCM / BMS) Board
  // Rigid-flex safety substrate sitting at the top edge of the pouch
  // --------------------------------------------------------------------------
  const pcmPlan = { x: -9.0, y: 34.0, w: 38.0, d: 4.8, r: 0.8 };
  const pcmSlab = k.slabOf(pcmPlan, z0 + 3.4, 1.4, P, 8, 0.15);
  parts.push(k.solidSvg(pcmSlab, { tone: "hi", crease: "faint" }));
  solidsCount++;

  // Fuel Gauge IC (TI BQ-series / Samsung custom low-impedance fuel gauge):
  const fuelGauge = k.slabOf({ x: 3.0, y: 34.8, w: 5.2, d: 3.2, r: 0.2 }, z0 + 4.8, 0.55, P, 4);
  parts.push(k.solidSvg(fuelGauge, { tone: "lit", crease: "none", lit: true }));
  solidsCount++;

  // Pin 1 indicator dot on Fuel Gauge IC:
  const icDot = k.iso([3.8, 35.5, z0 + 5.36], P);
  parts.push(k.dotsSvg([icDot], { size: 0.35, tone: "lit" }));
  pathsCount++;

  // Dual Power MOSFET Disconnect Switches (battery over-charge / short protection):
  const mosfetPack = k.slabOf({ x: 12.0, y: 34.8, w: 6.8, d: 3.2, r: 0.2 }, z0 + 4.8, 0.50, P, 4);
  parts.push(k.solidSvg(mosfetPack, { tone: "hi", crease: "none" }));
  solidsCount++;

  // Current Sense Shunt Resistor (precision mΩ alloy shunt):
  const shuntResistor = k.slabOf({ x: -2.0, y: 35.0, w: 3.2, d: 1.8, r: 0.1 }, z0 + 4.8, 0.38, P, 4);
  parts.push(k.solidSvg(shuntResistor, { tone: "mid", crease: "none" }));
  solidsCount++;

  // Passive SMD Decoupling Capacitors & Filtering Networks:
  const capPack1 = k.slabOf({ x: -6.5, y: 35.0, w: 2.4, d: 1.5, r: 0.1 }, z0 + 4.8, 0.35, P, 4);
  parts.push(k.solidSvg(capPack1, { tone: "mid", crease: "none" }));
  solidsCount++;

  const capPack2 = k.slabOf({ x: 21.0, y: 35.0, w: 2.4, d: 1.5, r: 0.1 }, z0 + 4.8, 0.35, P, 4);
  parts.push(k.solidSvg(capPack2, { tone: "mid", crease: "none" }));
  solidsCount++;

  // Gold Test Points / Flash Connector on PCM:
  const testPoints = [];
  for (let tx = -5.0; tx <= 1.0; tx += 2.0) {
    testPoints.push(k.iso([tx, 37.5, z0 + 4.8], P));
  }
  for (let tx = 20.0; tx <= 26.0; tx += 2.0) {
    testPoints.push(k.iso([tx, 37.5, z0 + 4.8], P));
  }
  parts.push(k.dotsSvg(testPoints, { size: 0.45, tone: "hi" }));
  pathsCount++;

  // --------------------------------------------------------------------------
  // Dual Laser-Welded Nickel Anode (-) & Cathode (+) Tabs
  // --------------------------------------------------------------------------
  // Nickel Anode Tab (-):
  const anodeTab = k.slabOf({ x: -4.0, y: 31.2, w: 4.8, d: 3.6, r: 0.2 }, z0 + 3.8, 0.28, P, 4);
  parts.push(k.solidSvg(anodeTab, { tone: "hi", crease: "none" }));
  solidsCount++;

  // Nickel/Aluminum Cathode Tab (+):
  const cathodeTab = k.slabOf({ x: 18.0, y: 31.2, w: 4.8, d: 3.6, r: 0.2 }, z0 + 3.8, 0.28, P, 4);
  parts.push(k.solidSvg(cathodeTab, { tone: "hi", crease: "none" }));
  solidsCount++;

  // Laser Weld Spots (circular laser-welded rosettes on tabs):
  const weldRings = [
    k.ring(-2.0, 32.5, 0.55, z0 + 4.1, P, 16),
    k.ring(-2.0, 33.7, 0.55, z0 + 4.1, P, 16),
    k.ring(20.0, 32.5, 0.55, z0 + 4.1, P, 16),
    k.ring(20.0, 33.7, 0.55, z0 + 4.1, P, 16),
  ];
  for (const wr of weldRings) {
    parts.push(k.lineSvg(wr, { tone: "lit" }));
    pathsCount++;
  }

  // --------------------------------------------------------------------------
  // Kapton Polyimide Tape Insulation
  // High-dielectric amber tape wrapping securely across tab junctions
  // --------------------------------------------------------------------------
  const kaptonTape = k.slabOf({ x: -7.0, y: 30.0, w: 34.0, d: 3.2, r: 0.3 }, z0 + 4.15, 0.18, P, 6);
  parts.push(k.solidSvg(kaptonTape, { tone: "lit", crease: "faint", lit: true }));
  solidsCount++;

  // Kapton tape tension lines & boundary seams:
  const kaptonEdge = k.segment([-7.0, 30.0, z0 + 4.33], [27.0, 30.0, z0 + 4.33], P);
  parts.push(k.lineSvg(kaptonEdge, { tone: "hi", free: true }));
  pathsCount++;

  // --------------------------------------------------------------------------
  // Quick-Release Blue Pull-Tab Film Casing & Pull Handle
  // --------------------------------------------------------------------------
  // Protective blue carrier film overlay adhering across the cell face:
  const blueFilm = k.slabOf({ x: -9.5, y: -48.0, w: 39.0, d: 74.0, r: 1.6 }, z_top, 0.08, P, 8);
  parts.push(k.solidSvg(blueFilm, { tone: "mid", crease: "none" }));
  solidsCount++;

  // Folded Quick-Release Pull Handle Tab (at the upper section of the battery):
  const pullHandle = k.slabOf({ x: -6.0, y: 14.0, w: 16.0, d: 13.0, r: 1.2 }, z_top + 0.08, 0.22, P, 6, 0.08);
  parts.push(k.solidSvg(pullHandle, { tone: "lit", crease: "faint", lit: true }));
  solidsCount++;

  // Pull handle grip lines & directional chevrons:
  const gripY = [16.5, 19.5, 22.5];
  for (const gy of gripY) {
    const gripLine = k.segment([-4.0, gy, z_top + 0.31], [8.0, gy, z_top + 0.31], P);
    parts.push(k.lineSvg(gripLine, { tone: "hi", free: true }));
    pathsCount++;
  }

  // Pull tab arrow symbol on handle:
  const pullArrow = `${k.pathOf([
    k.iso([1.0, 24.5, z_top + 0.31], P),
    k.iso([2.0, 26.0, z_top + 0.31], P),
    k.iso([3.0, 24.5, z_top + 0.31], P),
  ])}`;
  parts.push(k.lineSvg(pullArrow, { tone: "lit", free: true }));
  pathsCount++;

  // Text on pull handle:
  const matPull = k.topMatrix([-4.5, 15.0], z_top + 0.31, P, "x");
  parts.push(k.faceTextSvg(matPull, "▲ PULL TO REMOVE", { size: 1.8, tone: "lit" }));
  pathsCount++;

  // --------------------------------------------------------------------------
  // Technical Laser Typography Marks: "5000mAh 19.35Wh · 3.88V NOMINAL · SAMSUNG SDI"
  // --------------------------------------------------------------------------
  const zText = z_top + 0.09;

  // Primary Manufacturer Brand:
  const matBrand = k.topMatrix([-6.0, -8.0], zText, P, "x");
  parts.push(k.faceTextSvg(matBrand, "SAMSUNG SDI", { size: 3.6, tone: "hi" }));
  pathsCount++;

  // Key Technical Specification Header:
  const matSpec = k.topMatrix([-6.0, -14.0], zText, P, "x");
  parts.push(k.faceTextSvg(matSpec, "5000mAh 19.35Wh · 3.88V NOMINAL", { size: 2.7, tone: "hi" }));
  pathsCount++;

  // Charging Protocol & Voltage Ratings:
  const matCharge = k.topMatrix([-6.0, -19.5], zText, P, "x");
  parts.push(k.faceTextSvg(matCharge, "MAX CHARGE VOLTAGE: 4.45V · 1ICP6/42/86", { size: 2.0, tone: "mid" }));
  pathsCount++;

  // Chemistry & Fast Charging Classification:
  const matChem = k.topMatrix([-6.0, -24.5], zText, P, "x");
  parts.push(k.faceTextSvg(matChem, "SECONDARY LI-ION POLYMER · 45W SFC 2.0", { size: 1.9, tone: "mid" }));
  pathsCount++;

  // Safety Regulatory Caution Marks:
  const matWarn1 = k.topMatrix([-6.0, -29.5], zText, P, "x");
  parts.push(k.faceTextSvg(matWarn1, "CAUTION: DO NOT CRUSH, PUNCTURE OR DISASSEMBLE", { size: 1.6, tone: "lo" }));
  pathsCount++;

  const matWarn2 = k.topMatrix([-6.0, -33.5], zText, P, "x");
  parts.push(k.faceTextSvg(matWarn2, "DO NOT EXPOSE TO HIGH TEMPERATURE (>60°C)", { size: 1.6, tone: "lo" }));
  pathsCount++;

  // Production Traceability & Part Number:
  const matPart = k.topMatrix([-6.0, -39.0], zText, P, "x");
  parts.push(k.faceTextSvg(matPart, "P/N: EB-BS938ABY · LOT: SDI2601-N77", { size: 1.7, tone: "mid" }));
  pathsCount++;

  // Simulated 2D DataMatrix Traceability Matrix:
  const qrDots = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if ((r + c) % 2 === 0 || (r === 0 && c === 4) || (r === 4 && c === 0)) {
        qrDots.push(k.iso([23.0 + c * 1.2, -42.0 + r * 1.2, zText], P));
      }
    }
  }
  parts.push(k.dotsSvg(qrDots, { size: 0.45, tone: "mid" }));
  pathsCount++;

  const bounds = [
    [-12.0, -54.0, 1.8],
    [32.0, 40.0, 7.0],
  ];

  return {
    svg: parts.join(""),
    solidsCount,
    pathsCount,
    bounds,
  };
}

/* ==========================================================================
   3. S PEN (Active EMR Stylus, Clicker Plunger & BLE Resonance System)
   ========================================================================== */

/**
 * Builds the S Pen stylus model with full internal cutaway engineering details:
 * - Clickable top plunger mechanism with miniature helical spring coils
 * - S Pen stylus body (length 104.6 mm, width 5.8 mm, thickness 4.2 mm, r 1.6 mm)
 * - Fine 0.7 mm elastomer stylus tip with conical nose taper
 * - Internal 4,096-pressure inductive resonance coil windings
 * - Internal BLE RF chip & titanium dioxide (TiO2) super-capacitor
 * - Side tactile click rocker button
 *
 * Orientation: S Pen aligns along Y axis, docking into left chassis silo (center X = -34.0 mm).
 * Plunger is at bottom (-Y), tip points towards top (+Y).
 *
 * @param {object} P Projection parameters
 * @returns {{ svg: string, solidsCount: number, pathsCount: number, bounds: number[][] }}
 */
export function buildSPen(P) {
  const parts = [];
  let solidsCount = 0;
  let pathsCount = 0;

  const z0 = 1.5; // restZ for S Pen
  const t_pen = 4.2; // thickness
  const z_center = z0 + t_pen / 2; // z = 3.6 mm
  const cx = -34.0; // center X along silo

  // Frame aligned along the Y axis of the stylus for lathing cylindrical components:
  const F_spen = G.frameAlong([cx, 0.0, z_center], [0.0, 1.0, 0.0]);

  const plungerParts = [];
  // --------------------------------------------------------------------------
  // 1. Plunger Spring Mechanism: Helical Coil (Back Windings)
  // --------------------------------------------------------------------------
  // Coil spans from Y = -77.0 to -72.5 around the 0.85 mm guide rod:
  const springCoil = k.coil(-77.0, -72.5, [cx, z_center], 1.25, 7.5, "y", P);
  if (springCoil.back) {
    plungerParts.push(k.lineSvg(springCoil.back, { tone: "lo", free: true }));
    pathsCount++;
  }

  // --------------------------------------------------------------------------
  // 2. Clicker Plunger Mechanism Solids (Plunger Cap & Guide Shaft)
  // --------------------------------------------------------------------------
  // Ejection guide rod (lathed cylinder along Y):
  const rodMeridian = [
    [-77.5, 0.0],
    [-77.5, 0.85],
    [-72.0, 0.85],
    [-72.0, 0.0],
  ];
  const guideRod = G.lathe(rodMeridian, F_spen, P, { steps: 24 });
  plungerParts.push(k.solidSvg(guideRod, { tone: "mid", crease: "none" }));
  solidsCount++;

  // Miniature helical spring coil (Front Windings, rendered over the rod):
  if (springCoil.front) {
    plungerParts.push(k.lineSvg(springCoil.front, { tone: "hi", free: true }));
    pathsCount++;
  }

  // Clickable top clicker button cap (titanium finish button at the rear):
  const clickerCap = k.slabOf({ x: -36.5, y: -80.0, w: 5.0, d: 2.5, r: 1.2 }, z0 + 0.3, t_pen - 0.6, P, 6, 0.15);
  plungerParts.push(k.solidSvg(clickerCap, { tone: "lit", crease: "faint", lit: true }));
  solidsCount++;

  // Tactile knurling / grip ridges on clicker button cap face:
  const capRidge1 = k.segment([-36.0, -79.0, z0 + t_pen - 0.3], [-32.0, -79.0, z0 + t_pen - 0.3], P);
  const capRidge2 = k.segment([-36.0, -78.0, z0 + t_pen - 0.3], [-32.0, -78.0, z0 + t_pen - 0.3], P);
  plungerParts.push(k.lineSvg(capRidge1, { tone: "hi", free: true }));
  plungerParts.push(k.lineSvg(capRidge2, { tone: "hi", free: true }));
  pathsCount += 2;

  parts.push(`<g id="spen-plunger" class="spen-plunger">${plungerParts.join("")}</g>`);

  // --------------------------------------------------------------------------
  // 3. Main S Pen Lower Body Barrel (Y: -72.0 to -12.0 mm)
  // w 5.8 mm, thickness 4.2 mm, corner radius 1.6 mm
  // --------------------------------------------------------------------------
  const barrelPlan = { x: -36.9, y: -72.0, w: 5.8, d: 60.0, r: 1.6 };
  const barrelSlab = k.slabOf(barrelPlan, z0, t_pen, P, 10, 0.25);
  parts.push(`<g id="spen-stylus-body" class="spen-stylus-body">${k.solidSvg(barrelSlab, { tone: "hi", crease: "faint" })}</g>`);
  solidsCount++;

  // Long side flat bevel transition seam lines:
  const flatSeamL = k.segment([-36.9, -71.0, z0 + t_pen - 0.25], [-36.9, -13.0, z0 + t_pen - 0.25], P);
  const flatSeamR = k.segment([-31.1, -71.0, z0 + t_pen - 0.25], [-31.1, -13.0, z0 + t_pen - 0.25], P);
  parts.push(k.lineSvg(flatSeamL, { tone: "mid", free: true }));
  parts.push(k.lineSvg(flatSeamR, { tone: "mid", free: true }));
  pathsCount += 2;

  // Technical typography along S Pen body:
  const matPenBody = k.topMatrix([-34.5, -62.0], z0 + t_pen + 0.01, P, "y");
  parts.push(k.faceTextSvg(matPenBody, "SAMSUNG S-PEN · 4096 EMR · BLE", { size: 1.8, tone: "hi" }));
  pathsCount++;

  // --------------------------------------------------------------------------
  // 4. Teardown Inspection Window (Y: -12.0 to +12.0 mm)
  // Reveals internal flex PCB, BLE chip, and titanium dioxide capacitor
  // --------------------------------------------------------------------------
  // Internal rigid-flex tray / chassis carrier:
  const trayPlan = { x: -36.2, y: -12.0, w: 4.4, d: 24.0, r: 0.6 };
  const traySlab = k.slabOf(trayPlan, z0 + 0.3, 1.4, P, 6, 0.1);
  parts.push(k.solidSvg(traySlab, { tone: "mid", crease: "faint" }));
  solidsCount++;

  // Flex circuit golden trace lines along tray:
  for (let ty = -10.0; ty <= 10.0; ty += 4.0) {
    const traceSeg = k.segment([-35.8, ty, z0 + 1.72], [-32.2, ty, z0 + 1.72], P);
    parts.push(k.lineSvg(traceSeg, { tone: "lo", free: true }));
    pathsCount++;
  }

  // Titanium Dioxide (TiO2) Micro-Capacitor:
  // Cylindrical super-capacitor storing charge for 40 hours of BLE Air Actions
  const capMeridian = [
    [-9.0, 0.0],
    [-9.0, 1.15],
    [-2.0, 1.15],
    [-2.0, 0.0],
  ];
  const superCap = G.lathe(capMeridian, F_spen, P, { steps: 24 });
  parts.push(k.solidSvg(superCap, { tone: "lit", crease: "none", lit: true }));
  solidsCount++;

  // Silver terminal bands on TiO2 capacitor:
  const band1 = G.lathe([[-9.2, 0.0], [-9.2, 1.20], [-8.4, 1.20], [-8.4, 0.0]], F_spen, P, { steps: 20 });
  const band2 = G.lathe([[-2.6, 0.0], [-2.6, 1.20], [-1.8, 1.20], [-1.8, 0.0]], F_spen, P, { steps: 20 });
  parts.push(k.solidSvg(band1, { tone: "hi", crease: "none" }));
  parts.push(k.solidSvg(band2, { tone: "hi", crease: "none" }));
  solidsCount += 2;

  // BLE RF Chip (Qualcomm / Dialog ultra-low power Bluetooth SoC + 6-axis IMU):
  const bleChip = k.slabOf({ x: -36.0, y: 0.5, w: 4.0, d: 4.6, r: 0.2 }, z0 + 1.7, 0.70, P, 4);
  parts.push(k.solidSvg(bleChip, { tone: "hi", crease: "none" }));
  solidsCount++;

  // BLE chip label:
  const matBle = k.topMatrix([-35.5, 4.0], z0 + 2.41, P, "x");
  parts.push(k.faceTextSvg(matBle, "BLE-6AXIS", { size: 1.1, tone: "lit" }));
  pathsCount++;

  // --------------------------------------------------------------------------
  // 5. Side Tactile Click Button (Y: 2.0 to 9.5 mm)
  // Pill-shaped rocker click button mounted on stylus face
  // --------------------------------------------------------------------------
  const buttonPlan = { x: -35.2, y: 2.0, w: 2.4, d: 7.5, r: 0.8 };
  const buttonSlab = k.slabOf(buttonPlan, z0 + t_pen - 0.2, 0.85, P, 6, 0.15);
  parts.push(k.solidSvg(buttonSlab, { tone: "lit", crease: "faint", lit: true }));
  solidsCount++;

  // Tactile rocker center pivot groove:
  const pivotGroove = k.segment([-35.0, 5.75, z0 + t_pen + 0.65], [-33.0, 5.75, z0 + t_pen + 0.65], P);
  parts.push(k.lineSvg(pivotGroove, { tone: "hi", free: true }));
  pathsCount++;

  // --------------------------------------------------------------------------
  // 6. Upper Stylus Housing Collar (Y: 12.0 to 14.0 mm)
  // --------------------------------------------------------------------------
  const collarPlan = { x: -36.9, y: 12.0, w: 5.8, d: 2.2, r: 1.6 };
  const collarSlab = k.slabOf(collarPlan, z0, t_pen, P, 10, 0.2);
  parts.push(k.solidSvg(collarSlab, { tone: "hi", crease: "faint" }));
  solidsCount++;

  // --------------------------------------------------------------------------
  // 7. Internal 4,096-Pressure Inductive Resonance EMR Coil (Y: 14.0 to 21.0 mm)
  // --------------------------------------------------------------------------
  // EMR coil back windings (rendered behind the ferrite rod):
  const emrCoil = k.coil(14.5, 20.5, [cx, z_center], 1.35, 16.0, "y", P);
  if (emrCoil.back) {
    parts.push(k.lineSvg(emrCoil.back, { tone: "lo", free: true }));
    pathsCount++;
  }

  // Ferrite resonance antenna core rod:
  const ferriteMeridian = [
    [14.0, 0.0],
    [14.0, 1.05],
    [20.8, 1.05],
    [20.8, 0.0],
  ];
  const ferriteCore = G.lathe(ferriteMeridian, F_spen, P, { steps: 24 });
  parts.push(k.solidSvg(ferriteCore, { tone: "mid", crease: "none" }));
  solidsCount++;

  // EMR coil front windings (copper inductive turns wrapped around the core):
  if (emrCoil.front) {
    parts.push(k.lineSvg(emrCoil.front, { tone: "lit", free: true }));
    pathsCount++;
  }

  // Pressure sensor coupling bush:
  const bushMeridian = [
    [20.8, 0.0],
    [20.8, 1.35],
    [21.6, 1.35],
    [21.6, 0.0],
  ];
  const sensorBush = G.lathe(bushMeridian, F_spen, P, { steps: 20 });
  parts.push(k.solidSvg(sensorBush, { tone: "hi", crease: "none" }));
  solidsCount++;

  // --------------------------------------------------------------------------
  // 8. Stylus Nose Conical Taper & Fine 0.7 mm Elastomer Tip (Y: 21.6 to 24.6 mm)
  // --------------------------------------------------------------------------
  // Precision conical nose cone (tapers from r = 2.0 mm down to r = 0.5 mm):
  const noseMeridian = [
    [21.6, 0.0],
    [21.6, 2.0],
    [23.6, 0.5],
    [23.6, 0.0],
  ];
  const noseCone = G.lathe(noseMeridian, F_spen, P, { steps: 28 });
  parts.push(k.solidSvg(noseCone, { tone: "hi", crease: "faint" }));
  solidsCount++;

  // Fine 0.7 mm high-friction elastomer stylus tip (bullet nib, r = 0.35 mm):
  const nibMeridian = [
    [23.6, 0.0],
    [23.6, 0.35],
    [24.3, 0.35],
    [24.6, 0.0],
  ];
  const stylusNib = G.lathe(nibMeridian, F_spen, P, { steps: 20 });
  parts.push(k.solidSvg(stylusNib, { tone: "lit", crease: "none", lit: true }));
  solidsCount++;

  const bounds = [
    [-38.0, -81.0, 1.5],
    [-30.0, 26.0, 6.0],
  ];

  return {
    svg: parts.join(""),
    solidsCount,
    pathsCount,
    bounds,
  };
}
