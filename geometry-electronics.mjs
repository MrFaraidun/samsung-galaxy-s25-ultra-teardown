/**
 * Samsung Galaxy S25 Ultra — Electronics & Optical Geometry Module
 * Hero scale interactive teardown model adhering to Anatomy specifications.
 * 
 * Exports:
 * 1. buildMotherboard(P): Substrate-Like PCB (SLP) mainboard, Snapdragon 8 Elite SoC,
 *    LPDDR5X RAM, UFS 4.0 storage, X80 5G modem, EMI shielding cans, and test points.
 * 2. buildSubBoard(P): Lower daughterboard, USB-C 3.2 port with silicone gasket,
 *    dual MEMS mics, dual SIM socket, X-axis linear haptic motor, and RF cabling.
 * 3. buildCameras(P): Rigid-flex camera housing bracket holding 200MP Wide OIS,
 *    50MP 5x Folded Periscope, 50MP Ultra-Wide, 10MP 3x Telephoto, and Laser AF / Dual Flash.
 */

import * as k from "./kit/iso-kit.mjs";

const TAU = Math.PI * 2;
const DEG2RAD = Math.PI / 180;

// Default fallback projection if none provided
const DEFAULT_P = {
  origin: [550, 480],
  scale: 3.5,
  azimuth: 44,
  elevation: 28,
};

/**
 * Rounds convex or non-convex 2D polygons with circular corner fillets
 */
function roundedPolygon(polygon, radius = 0, steps = 4) {
  let area = 0;
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    area += a[0] * b[1] - b[0] * a[1];
  }
  const poly = area < 0 ? polygon.slice().reverse() : polygon.slice();
  if (!(radius > 0)) return poly.map(([x, y]) => [x, y]);

  const n = poly.length;
  const normals = poly.map((a, i) => {
    const b = poly[(i + 1) % n];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [(b[1] - a[1]) / l, -(b[0] - a[0]) / l];
  });

  const out = [];
  for (let i = 0; i < n; i++) {
    const na = normals[(i - 1 + n) % n];
    const nb = normals[i];
    const denom = 1 + na[0] * nb[0] + na[1] * nb[1];
    const c = [
      poly[i][0] - (radius * (na[0] + nb[0])) / denom,
      poly[i][1] - (radius * (na[1] + nb[1])) / denom,
    ];
    const a0 = Math.atan2(na[1], na[0]);
    let a1 = Math.atan2(nb[1], nb[0]);
    while (a1 < a0 - 1e-9) a1 += TAU;
    for (let s = 0; s <= steps; s++) {
      const t = a0 + ((a1 - a0) * s) / steps;
      out.push([c[0] + radius * Math.cos(t), c[1] + radius * Math.sin(t)]);
    }
  }
  return out;
}

/**
 * Creates precision Torx screw head with gold grounding ring and 6-point star slot
 */
function createScrew(cx, cy, z, r = 1.1, h = 0.45, P) {
  const solids = [];
  const details = [];

  // Gold outer grounding washer
  details.push(k.lineSvg(k.ring(cx, cy, r * 1.55, z, P, 24), { tone: "hi" }));

  // Cylindrical screw head solid
  const head = k.cylinder(cx, cy, r, z, h, P, 20, 0.1);
  solids.push({
    depth: k.depthOf([cx, cy, z + h / 2], P),
    svg: k.solidSvg(head, { tone: "hi", crease: "faint" }),
  });

  // Top recessed drive depression
  const zTop = z + h;
  details.push(k.lineSvg(k.ring(cx, cy, r * 0.65, zTop, P, 16), { tone: "mid" }));

  // Torx T3 6-point star drive slot
  const slotR = r * 0.5;
  for (let a = 0; a < 3; a++) {
    const rad = (a * 60) * DEG2RAD;
    const dx = slotR * Math.cos(rad);
    const dy = slotR * Math.sin(rad);
    const seg = k.segment([cx - dx, cy - dy, zTop], [cx + dx, cy + dy, zTop], P);
    details.push(k.lineSvg(seg, { tone: "hi" }));
  }

  return { solids, details };
}

/**
 * Creates miniature SMD 0201/0402 ceramic capacitor with silver solder endcaps
 */
function createSmdCapacitor(x, y, z, w = 1.2, d = 0.8, h = 0.5, P, horizontal = true) {
  const center = [x + w / 2, y + d / 2, z + h / 2];
  const cap = k.slabOf({ x, y, w, d, r: 0.1 }, z, h, P, 4, 0.05);
  const solid = k.solidSvg(cap, { tone: "mid", crease: "faint" });

  const zTop = z + h;
  const lines = [];
  if (horizontal) {
    const padW = w * 0.28;
    lines.push(k.lineSvg(k.segment([x + padW, y, zTop], [x + padW, y + d, zTop], P), { tone: "hi" }));
    lines.push(k.lineSvg(k.segment([x + w - padW, y, zTop], [x + w - padW, y + d, zTop], P), { tone: "hi" }));
  } else {
    const padD = d * 0.28;
    lines.push(k.lineSvg(k.segment([x, y + padD, zTop], [x + w, y + padD, zTop], P), { tone: "hi" }));
    lines.push(k.lineSvg(k.segment([x, y + d - padD, zTop], [x + w, y + d - padD, zTop], P), { tone: "hi" }));
  }

  return {
    depth: k.depthOf(center, P),
    svg: solid + lines.join(""),
  };
}

/**
 * Creates Board-to-Board (BTB) mezzanine connector socket with gold contact pins
 */
function createBtbSocket(x, y, z, w, d, h, pinCount = 20, P) {
  const center = [x + w / 2, y + d / 2, z + h / 2];
  const zTop = z + h;
  const body = k.slabOf({ x, y, w, d, r: 0.3 }, z, h, P, 4, 0.08);
  const bodySvg = k.solidSvg(body, { tone: "hi", crease: "lo" });

  // Inner slot channel
  const slotMargin = 0.7;
  const slotOutline = k.planOutline(
    { x: x + slotMargin, y: y + slotMargin, w: w - slotMargin * 2, d: d - slotMargin * 2, r: 0.2 },
    zTop,
    P,
    4
  );

  // Gold contact pins
  const pins = [];
  const isWide = w > d;
  const span = isWide ? w - slotMargin * 3 : d - slotMargin * 3;
  const step = span / Math.max(1, pinCount / 2);
  for (let i = 0; i < pinCount / 2; i++) {
    if (isWide) {
      const px = x + slotMargin * 1.5 + i * step;
      pins.push(k.segment([px, y + slotMargin, zTop], [px, y + slotMargin + 0.4, zTop], P));
      pins.push(k.segment([px, y + d - slotMargin - 0.4, zTop], [px, y + d - slotMargin, zTop], P));
    } else {
      const py = y + slotMargin * 1.5 + i * step;
      pins.push(k.segment([x + slotMargin, py, zTop], [x + slotMargin + 0.4, py, zTop], P));
      pins.push(k.segment([x + w - slotMargin - 0.4, py, zTop], [x + w - slotMargin, py, zTop], P));
    }
  }

  // Metal retention side tabs
  const tabs = [];
  if (isWide) {
    tabs.push(k.segment([x, y + d / 2 - 0.5, zTop], [x, y + d / 2 + 0.5, zTop], P));
    tabs.push(k.segment([x + w, y + d / 2 - 0.5, zTop], [x + w, y + d / 2 + 0.5, zTop], P));
  }

  const detailSvg =
    k.lineSvg(slotOutline, { tone: "lo" }) +
    k.lineSvg(pins.join(""), { tone: "hi" }) +
    k.lineSvg(tabs.join(""), { tone: "lit" });

  return {
    depth: k.depthOf(center, P),
    svg: bodySvg + detailSvg,
  };
}

// =============================================================================
// 1. MOTHERBOARD ASSEMBLY (Assembly 06)
// =============================================================================

export function buildMotherboard(P = DEFAULT_P) {
  const solids = [];
  const details = [];

  const zBase = 2.6; // restZ
  const pcbHeight = 1.2;
  const zPcbTop = zBase + pcbHeight; // 3.8 mm

  // 1. Substrate-Like PCB (SLP) mainboard
  // Contoured envelope: width 70mm (X: -35 to +35), depth 58mm (Y: 20 to 78)
  // Stepped to wrap around camera cluster cutouts on the left (X: -35 to -10)
  // and battery boundary on the bottom (Y: 20)
  const pcbContour = [
    [-11, 20],
    [33, 20],
    [35, 22],
    [35, 76],
    [33, 78],
    [-33, 78],
    [-35, 76],
    [-35, 73],
    [-11, 73], // Inner top bridge margin for camera column
    [-11, 45],
    [-14, 45], // Camera middle anchor rib
    [-14, 39],
    [-11, 39], // Periscope bay cutout inner edge
    [-11, 24],
    [-35, 24], // Bottom-left grounding tongue
    [-35, 20],
    [-11, 20],
  ];

  const roundedPcb = roundedPolygon(pcbContour, 1.2, 4);
  const pcbSolid = k.extrude(roundedPcb, zBase, pcbHeight, P, { convex: false, bevel: 0.18 });
  const pcbSvg = k.solidSvg(pcbSolid, { tone: "hi", crease: "faint", className: "slp-motherboard" });

  // Surface ground planes, silkscreen markings & test traces at zPcbTop
  const pcbArtwork = [];
  // Ground plane boundary lines
  pcbArtwork.push(
    k.lineSvg(
      k.planOutline({ x: 0, y: 22, w: 33, d: 54, r: 0.6 }, zPcbTop, P, 4),
      { tone: "lo", dashed: true }
    )
  );
  pcbArtwork.push(
    k.lineSvg(
      k.planOutline({ x: -10, y: 46, w: 9, d: 26, r: 0.5 }, zPcbTop, P, 4),
      { tone: "lo" }
    )
  );

  // Silkscreen engineering labels
  pcbArtwork.push(
    k.faceTextSvg(
      k.topMatrix([14, 21.5], zPcbTop, P, "x"),
      "SEC-S938B-MAIN REV1.0 · SLP 10-LAYER HDI",
      { size: 1.8, tone: "lo" }
    )
  );
  pcbArtwork.push(
    k.faceTextSvg(
      k.topMatrix([-33, 76.5], zPcbTop, P, "x"),
      "ANT_DIV_TOP",
      { size: 1.4, tone: "lo" }
    )
  );

  // Gold micro-via test arrays
  const viaArray1 = k.dotGrid(2, 23, 14, 3, 1.4, zPcbTop, P);
  const viaArray2 = k.dotGrid(30, 26, 3, 24, 1.6, zPcbTop, P);
  const viaArray3 = k.dotGrid(-9, 48, 4, 12, 1.5, zPcbTop, P);
  pcbArtwork.push(k.dotsSvg([...viaArray1, ...viaArray2, ...viaArray3], { size: 0.35, tone: "mid" }));

  // Gold test points
  const testPoints = [
    [1, 28], [2.8, 28], [1, 30.5], [2.8, 30.5],
    [26, 21.5], [28, 21.5], [30, 21.5],
    [-2, 60], [-4, 60], [-2, 62],
  ];
  testPoints.forEach(([px, py]) => {
    pcbArtwork.push(k.lineSvg(k.ring(px, py, 0.45, zPcbTop, P, 16), { tone: "hi" }));
  });

  // PCB mounting screws with gold grounding washers
  const screwLocs = [
    [-33, 75.5],
    [32.5, 75.5],
    [32.5, 22.5],
    [-33, 22],
    [-12.5, 42],
  ];
  screwLocs.forEach(([sx, sy]) => {
    const scr = createScrew(sx, sy, zPcbTop, 1.15, 0.45, P);
    scr.solids.forEach((s) => solids.push(s));
    scr.details.forEach((d) => details.push(d));
  });

  // 2. Qualcomm Snapdragon 8 Elite for Galaxy SoC
  // Position: X = 5 to 21, Y = 43 to 59
  const socX = 5.2;
  const socY = 43.2;
  const socW = 15.6;
  const socD = 15.6;
  const socSubH = 0.25;
  const socLidH = 0.65;
  const zSocLid = zPcbTop + socSubH; // 4.05 mm
  const zSocTop = zSocLid + socLidH; // 4.70 mm

  // Silicon substrate interposer
  const socSub = k.slabOf({ x: socX - 0.4, y: socY - 0.4, w: socW + 0.8, d: socD + 0.8, r: 0.6 }, zPcbTop, socSubH, P, 6, 0.08);
  solids.push({
    depth: k.depthOf([socX + socW / 2, socY + socD / 2, zPcbTop + socSubH / 2], P),
    svg: k.solidSvg(socSub, { tone: "mid", crease: "faint" }),
  });

  // Metallic heat lid with beveled edge
  const socLid = k.slabOf({ x: socX, y: socY, w: socW, d: socD, r: 0.8 }, zSocLid, socLidH, P, 8, 0.25);
  solids.push({
    depth: k.depthOf([socX + socW / 2, socY + socD / 2, zSocLid + socLidH / 2], P),
    svg: k.solidSvg(socLid, { tone: "hi", crease: "lo", lit: true, className: "soc-heat-lid" }),
  });

  // Laser etched Snapdragon 8 Elite & Oryon logo markings on heat lid
  const socEtchings = [];
  socEtchings.push(
    k.lineSvg(
      k.planOutline({ x: socX + 0.8, y: socY + 0.8, w: socW - 1.6, d: socD - 1.6, r: 0.5 }, zSocTop, P, 4),
      { tone: "mid" }
    )
  );
  // Pin 1 laser dot
  socEtchings.push(k.lineSvg(k.ring(socX + 1.5, socY + 1.5, 0.35, zSocTop, P, 16), { tone: "lit" }));

  // Qualcomm Oryon stylized chevron glyph
  const oryonCenter = [socX + socW / 2, socY + socD / 2 - 2.5, zSocTop];
  const chevron1 = k.pathOf([
    k.iso([oryonCenter[0] - 2.4, oryonCenter[1] - 1.2, zSocTop], P),
    k.iso([oryonCenter[0], oryonCenter[1] + 1.2, zSocTop], P),
    k.iso([oryonCenter[0] + 2.4, oryonCenter[1] - 1.2, zSocTop], P),
  ]);
  const chevron2 = k.pathOf([
    k.iso([oryonCenter[0] - 1.6, oryonCenter[1] - 2.0, zSocTop], P),
    k.iso([oryonCenter[0], oryonCenter[1] + 0.4, zSocTop], P),
    k.iso([oryonCenter[0] + 1.6, oryonCenter[1] - 2.0, zSocTop], P),
  ]);
  socEtchings.push(k.lineSvg(chevron1, { tone: "lit" }));
  socEtchings.push(k.lineSvg(chevron2, { tone: "hi" }));

  // Etched text lines on SoC
  socEtchings.push(
    k.faceTextSvg(
      k.topMatrix([socX + 1.8, socY + 3.2], zSocTop, P, "x"),
      "QUALCOMM SNAPDRAGON",
      { size: 1.25, tone: "lit" }
    )
  );
  socEtchings.push(
    k.faceTextSvg(
      k.topMatrix([socX + 2.2, socY + 5.0], zSocTop, P, "x"),
      "8 ELITE FOR GALAXY",
      { size: 1.35, tone: "lit" }
    )
  );
  socEtchings.push(
    k.faceTextSvg(
      k.topMatrix([socX + 2.8, socY + socD - 2.8], zSocTop, P, "x"),
      "SM8750-AC · ORYON 3nm",
      { size: 1.1, tone: "mid" }
    )
  );
  details.push(socEtchings.join(""));

  // 3. PoP Stacked 16GB LPDDR5X RAM Package
  // Stacked package atop the SoC center tier
  const ramX = socX + 1.8;
  const ramY = socY + 1.8;
  const ramW = 12.0;
  const ramD = 12.0;
  const ramH = 0.42;
  const zRam = zSocTop;
  const zRamTop = zRam + ramH; // 5.12 mm

  const ramSolid = k.slabOf({ x: ramX, y: ramY, w: ramW, d: ramD, r: 0.4 }, zRam, ramH, P, 6, 0.12);
  solids.push({
    depth: k.depthOf([ramX + ramW / 2, ramY + ramD / 2, zRam + ramH / 2], P),
    svg: k.solidSvg(ramSolid, { tone: "hi", crease: "lo", className: "lpddr5x-package" }),
  });

  const ramMarkings = [];
  ramMarkings.push(
    k.faceTextSvg(
      k.topMatrix([ramX + 1.2, ramY + 3.5], zRamTop, P, "x"),
      "SEC LPDDR5X 16GB",
      { size: 1.1, tone: "hi" }
    )
  );
  ramMarkings.push(
    k.faceTextSvg(
      k.topMatrix([ramX + 1.2, ramY + 5.2], zRamTop, P, "x"),
      "9600 Mbps · PoP BGA",
      { size: 0.95, tone: "mid" }
    )
  );
  details.push(ramMarkings.join(""));

  // 4. 512GB UFS 4.0 Flash Storage Package
  // Position: X = 7 to 20, Y = 25 to 37
  const ufsX = 7.0;
  const ufsY = 25.5;
  const ufsW = 13.0;
  const ufsD = 11.5;
  const ufsH = 0.75;
  const zUfsTop = zPcbTop + ufsH; // 4.55 mm

  const ufsSolid = k.slabOf({ x: ufsX, y: ufsY, w: ufsW, d: ufsD, r: 0.5 }, zPcbTop, ufsH, P, 6, 0.15);
  solids.push({
    depth: k.depthOf([ufsX + ufsW / 2, ufsY + ufsD / 2, zPcbTop + ufsH / 2], P),
    svg: k.solidSvg(ufsSolid, { tone: "hi", crease: "faint", className: "ufs-storage" }),
  });

  const ufsMarkings = [];
  ufsMarkings.push(
    k.lineSvg(k.ring(ufsX + 1.4, ufsY + 1.4, 0.35, zUfsTop, P, 16), { tone: "hi" })
  );
  ufsMarkings.push(
    k.faceTextSvg(
      k.topMatrix([ufsX + 1.4, ufsY + 3.6], zUfsTop, P, "x"),
      "SAMSUNG FLASH",
      { size: 1.2, tone: "hi" }
    )
  );
  ufsMarkings.push(
    k.faceTextSvg(
      k.topMatrix([ufsX + 1.4, ufsY + 5.6], zUfsTop, P, "x"),
      "512GB UFS 4.0",
      { size: 1.3, tone: "lit" }
    )
  );
  ufsMarkings.push(
    k.faceTextSvg(
      k.topMatrix([ufsX + 1.4, ufsY + 7.6], zUfsTop, P, "x"),
      "4200MB/s READ",
      { size: 1.0, tone: "mid" }
    )
  );
  details.push(ufsMarkings.join(""));

  // 5. Qualcomm X80 5G RF Modem Chip & Transceivers
  // Modem IC: X = -8 to 2, Y = 25 to 35
  const modemX = -8.0;
  const modemY = 25.5;
  const modemW = 9.8;
  const modemD = 9.5;
  const modemH = 0.65;
  const zModemTop = zPcbTop + modemH; // 4.45 mm

  const modemSolid = k.slabOf({ x: modemX, y: modemY, w: modemW, d: modemD, r: 0.4 }, zPcbTop, modemH, P, 6, 0.12);
  solids.push({
    depth: k.depthOf([modemX + modemW / 2, modemY + modemD / 2, zPcbTop + modemH / 2], P),
    svg: k.solidSvg(modemSolid, { tone: "hi", crease: "faint" }),
  });

  const modemMarkings = [];
  modemMarkings.push(
    k.faceTextSvg(
      k.topMatrix([modemX + 1.0, modemY + 3.2], zModemTop, P, "x"),
      "QUALCOMM X80",
      { size: 1.15, tone: "lit" }
    )
  );
  modemMarkings.push(
    k.faceTextSvg(
      k.topMatrix([modemX + 1.0, modemY + 5.2], zModemTop, P, "x"),
      "5G RF MODEM",
      { size: 1.05, tone: "hi" }
    )
  );
  details.push(modemMarkings.join(""));

  // RF Transceiver IC (WTR7955)
  const wtrSolid = k.slabOf({ x: -8.0, y: 36.5, w: 6.2, d: 5.8, r: 0.3 }, zPcbTop, 0.55, P, 4, 0.1);
  solids.push({
    depth: k.depthOf([-4.9, 39.4, zPcbTop + 0.27], P),
    svg: k.solidSvg(wtrSolid, { tone: "mid", crease: "faint" }),
  });
  details.push(
    k.faceTextSvg(
      k.topMatrix([-7.2, 39.8], zPcbTop + 0.55, P, "x"),
      "WTR7955",
      { size: 0.9, tone: "hi" }
    )
  );

  // Envelope Tracking IC (QET7100)
  const qetSolid = k.slabOf({ x: -0.6, y: 36.5, w: 4.5, d: 4.5, r: 0.3 }, zPcbTop, 0.5, P, 4, 0.08);
  solids.push({
    depth: k.depthOf([1.65, 38.75, zPcbTop + 0.25], P),
    svg: k.solidSvg(qetSolid, { tone: "mid", crease: "faint" }),
  });

  // 6. Stamped Nickel-Silver EMI Shielding Cans with Graphite Thermal Foil
  // Can 1: RF Front-End (RFFE) Power Amplifier & Filter Shield Can (X: 20 to 33, Y: 62 to 74)
  const rffeCan = k.slabOf({ x: 20.0, y: 62.0, w: 13.0, d: 12.0, r: 0.6 }, zPcbTop, 1.15, P, 6, 0.18);
  solids.push({
    depth: k.depthOf([26.5, 68.0, zPcbTop + 0.57], P),
    svg: k.solidSvg(rffeCan, { tone: "hi", crease: "lo", className: "shield-can-rffe" }),
  });

  // Stamped structural cross ribs on RFFE can
  const rffeRibs = [];
  rffeRibs.push(k.segment([21.5, 63.5, zPcbTop + 1.15], [31.5, 72.5, zPcbTop + 1.15], P));
  rffeRibs.push(k.segment([21.5, 72.5, zPcbTop + 1.15], [31.5, 63.5, zPcbTop + 1.15], P));
  details.push(k.lineSvg(rffeRibs.join(""), { tone: "mid" }));

  // Can 2: Power Management (PMIC) & Audio Codec Shield Can (X: 4 to 18, Y: 62 to 74)
  const pmicCan = k.slabOf({ x: 4.0, y: 62.0, w: 14.2, d: 12.0, r: 0.6 }, zPcbTop, 1.15, P, 6, 0.18);
  solids.push({
    depth: k.depthOf([11.1, 68.0, zPcbTop + 0.57], P),
    svg: k.solidSvg(pmicCan, { tone: "hi", crease: "lo", className: "shield-can-pmic" }),
  });
  details.push(
    k.faceTextSvg(
      k.topMatrix([6.0, 68.2], zPcbTop + 1.15, P, "x"),
      "PMIC / AUDIO MATRIX",
      { size: 1.1, tone: "mid" }
    )
  );

  // Can 3: Wi-Fi 7 / Bluetooth 5.4 Connectivity Section (X: 22 to 33, Y: 25 to 37)
  const wifiCan = k.slabOf({ x: 22.0, y: 25.5, w: 11.0, d: 11.5, r: 0.5 }, zPcbTop, 1.1, P, 6, 0.15);
  solids.push({
    depth: k.depthOf([27.5, 31.25, zPcbTop + 0.55], P),
    svg: k.solidSvg(wifiCan, { tone: "hi", crease: "lo" }),
  });
  details.push(
    k.faceTextSvg(
      k.topMatrix([23.2, 31.5], zPcbTop + 1.1, P, "x"),
      "Wi-Fi 7 / BT 5.4",
      { size: 1.0, tone: "mid" }
    )
  );

  // Graphite Thermal Foil layer over AP / RAM shield area
  // Dimensions: 18.5 × 18.5 mm, elevated above SoC/RAM
  const foilX = 3.8;
  const foilY = 41.8;
  const foilW = 18.4;
  const foilD = 18.4;
  const zFoil = zRamTop + 0.15; // 5.27 mm
  const foilH = 0.22;
  const foilSolid = k.slabOf({ x: foilX, y: foilY, w: foilW, d: foilD, r: 0.6 }, zFoil, foilH, P, 6, 0.1);
  solids.push({
    depth: k.depthOf([foilX + foilW / 2, foilY + foilD / 2, zFoil + foilH / 2], P),
    svg: k.solidSvg(foilSolid, { tone: "mid", crease: "faint", className: "graphite-thermal-foil" }),
  });

  // Graphite carbon texture sheen hatching lines
  const foilHatch = [];
  for (let i = 2; i < foilW - 2; i += 3.0) {
    foilHatch.push(k.segment([foilX + i, foilY + 1.5, zFoil + foilH], [foilX + i + 2.0, foilY + foilD - 1.5, zFoil + foilH], P));
  }
  details.push(k.lineSvg(foilHatch.join(""), { tone: "lo" }));
  details.push(
    k.faceTextSvg(
      k.topMatrix([foilX + 2.0, foilY + foilD - 2.5], zFoil + foilH, P, "x"),
      "GRAPHITE THERMAL HEAT SPREADER",
      { size: 0.95, tone: "hi" }
    )
  );

  // 7. Board Connector Sockets
  // Main Display FPC socket
  const dispSock = createBtbSocket(20.0, 40.0, zPcbTop, 13.0, 3.4, 0.95, 30, P);
  solids.push(dispSock);

  // Sub-board FPC bus connector socket
  const subSock = createBtbSocket(12.0, 20.6, zPcbTop, 11.0, 3.2, 0.9, 24, P);
  solids.push(subSock);

  // Quad Camera BTB connectors along camera bay inner rib (X: -10.5)
  const camSock1 = createBtbSocket(-10.2, 46.5, zPcbTop, 3.2, 11.0, 0.9, 24, P);
  const camSock2 = createBtbSocket(-10.2, 30.5, zPcbTop, 3.2, 8.5, 0.9, 18, P);
  const camSock3 = createBtbSocket(-10.2, 63.5, zPcbTop, 3.2, 8.5, 0.9, 18, P);
  solids.push(camSock1, camSock2, camSock3);

  // Battery power connector with dual gold knife terminals
  const battSock = k.slabOf({ x: -3.0, y: 20.6, w: 6.8, d: 3.4, r: 0.3 }, zPcbTop, 1.05, P, 4, 0.1);
  solids.push({
    depth: k.depthOf([0.4, 22.3, zPcbTop + 0.52], P),
    svg: k.solidSvg(battSock, { tone: "hi", crease: "lo" }),
  });
  // Dual gold blade terminals
  const blades = [
    k.segment([-1.5, 21.3, zPcbTop + 1.05], [-1.5, 23.3, zPcbTop + 1.05], P),
    [k.segment([1.5, 21.3, zPcbTop + 1.05], [1.5, 23.3, zPcbTop + 1.05], P)],
  ];
  details.push(k.lineSvg(blades.flat().join(""), { tone: "lit" }));

  // 8. Decoupling SMD Capacitors (MLCCs) and Inductors around power rails
  const smdList = [
    // SoC / RAM decoupling row
    createSmdCapacitor(3.4, 43.5, zPcbTop, 1.2, 0.7, 0.45, P, false),
    createSmdCapacitor(3.4, 45.0, zPcbTop, 1.2, 0.7, 0.45, P, false),
    createSmdCapacitor(3.4, 46.5, zPcbTop, 1.2, 0.7, 0.45, P, false),
    createSmdCapacitor(3.4, 48.0, zPcbTop, 1.2, 0.7, 0.45, P, false),
    createSmdCapacitor(3.4, 49.5, zPcbTop, 1.2, 0.7, 0.45, P, false),
    createSmdCapacitor(3.4, 51.0, zPcbTop, 1.2, 0.7, 0.45, P, false),
    createSmdCapacitor(3.4, 52.5, zPcbTop, 1.2, 0.7, 0.45, P, false),
    createSmdCapacitor(3.4, 54.0, zPcbTop, 1.2, 0.7, 0.45, P, false),
    createSmdCapacitor(3.4, 55.5, zPcbTop, 1.2, 0.7, 0.45, P, false),
    createSmdCapacitor(3.4, 57.0, zPcbTop, 1.2, 0.7, 0.45, P, false),
    // Right flank capacitors
    createSmdCapacitor(21.5, 45.0, zPcbTop, 1.2, 0.7, 0.45, P, false),
    createSmdCapacitor(21.5, 46.5, zPcbTop, 1.2, 0.7, 0.45, P, false),
    createSmdCapacitor(21.5, 48.0, zPcbTop, 1.2, 0.7, 0.45, P, false),
    createSmdCapacitor(21.5, 49.5, zPcbTop, 1.2, 0.7, 0.45, P, false),
    createSmdCapacitor(21.5, 51.0, zPcbTop, 1.2, 0.7, 0.45, P, false),
    createSmdCapacitor(21.5, 52.5, zPcbTop, 1.2, 0.7, 0.45, P, false),
    // Bottom storage decoupling row
    createSmdCapacitor(7.0, 38.0, zPcbTop, 0.8, 1.2, 0.45, P, true),
    createSmdCapacitor(8.5, 38.0, zPcbTop, 0.8, 1.2, 0.45, P, true),
    createSmdCapacitor(10.0, 38.0, zPcbTop, 0.8, 1.2, 0.45, P, true),
    createSmdCapacitor(11.5, 38.0, zPcbTop, 0.8, 1.2, 0.45, P, true),
    createSmdCapacitor(13.0, 38.0, zPcbTop, 0.8, 1.2, 0.45, P, true),
    createSmdCapacitor(14.5, 38.0, zPcbTop, 0.8, 1.2, 0.45, P, true),
    createSmdCapacitor(16.0, 38.0, zPcbTop, 0.8, 1.2, 0.45, P, true),
    createSmdCapacitor(17.5, 38.0, zPcbTop, 0.8, 1.2, 0.45, P, true),
    // RF modem filter capacitors
    createSmdCapacitor(-7.5, 33.5, zPcbTop, 0.8, 1.2, 0.45, P, true),
    createSmdCapacitor(-6.0, 33.5, zPcbTop, 0.8, 1.2, 0.45, P, true),
    createSmdCapacitor(-4.5, 33.5, zPcbTop, 0.8, 1.2, 0.45, P, true),
    createSmdCapacitor(-3.0, 33.5, zPcbTop, 0.8, 1.2, 0.45, P, true),
  ];
  smdList.forEach((smd) => solids.push(smd));

  // Power Choke Inductors near PMIC
  const choke1 = k.slabOf({ x: 0.5, y: 63.0, w: 2.6, d: 2.6, r: 0.3 }, zPcbTop, 0.95, P, 4, 0.1);
  const choke2 = k.slabOf({ x: 0.5, y: 66.5, w: 2.6, d: 2.6, r: 0.3 }, zPcbTop, 0.95, P, 4, 0.1);
  const choke3 = k.slabOf({ x: 0.5, y: 70.0, w: 2.6, d: 2.6, r: 0.3 }, zPcbTop, 0.95, P, 4, 0.1);
  solids.push({ depth: k.depthOf([1.8, 64.3, zPcbTop + 0.47], P), svg: k.solidSvg(choke1, { tone: "mid", crease: "lo" }) });
  solids.push({ depth: k.depthOf([1.8, 67.8, zPcbTop + 0.47], P), svg: k.solidSvg(choke2, { tone: "mid", crease: "lo" }) });
  solids.push({ depth: k.depthOf([1.8, 71.3, zPcbTop + 0.47], P), svg: k.solidSvg(choke3, { tone: "mid", crease: "lo" }) });

  // Back-to-front depth sort for all solids placed on the PCB
  solids.sort((a, b) => a.depth - b.depth);

  const fullSvg = `<g class="assembly-motherboard" data-assembly="motherboard">${pcbSvg}${pcbArtwork.join("")}${solids.map((s) => s.svg).join("")}${details.join("")}</g>`;
  const solidsCount = solids.length + 1; // +1 for the main SLP PCB solid
  const pathsCount = (fullSvg.match(/<path|<circle|<text/g) || []).length;

  return {
    svg: fullSvg,
    solidsCount,
    pathsCount,
    bounds: { min: [-35, 20, zBase], max: [35, 78, zFoil + foilH] },
  };
}

// =============================================================================
// 2. SUB-BOARD ASSEMBLY (Assembly 07)
// =============================================================================

export function buildSubBoard(P = DEFAULT_P) {
  const solids = [];
  const details = [];

  const zBase = 2.4; // restZ
  const pcbHeight = 1.2;
  const zPcbTop = zBase + pcbHeight; // 3.6 mm

  // 1. Lower daughterboard PCB
  // Contoured: width 70mm (X: -35 to +35), depth 22mm (Y: -78 to -56)
  // Corner cutout at bottom-left for S-Pen silo sleeve pass-through (X: -35 to -27, Y: -78 to -66)
  const pcbContour = [
    [-27, -78],
    [32, -78],
    [34, -76],
    [34, -58],
    [32, -56],
    [-32, -56],
    [-34, -58],
    [-34, -66],
    [-27, -66],
    [-27, -78],
  ];

  const roundedPcb = roundedPolygon(pcbContour, 1.0, 4);
  const pcbSolid = k.extrude(roundedPcb, zBase, pcbHeight, P, { convex: false, bevel: 0.16 });
  const pcbSvg = k.solidSvg(pcbSolid, { tone: "hi", crease: "faint", className: "sub-board-pcb" });

  // Surface artwork and traces at zPcbTop
  const pcbArtwork = [];
  pcbArtwork.push(
    k.faceTextSvg(
      k.topMatrix([-23, -57.5], zPcbTop, P, "x"),
      "SEC-SUB-S938B · IP68 SEALED I/O",
      { size: 1.6, tone: "lo" }
    )
  );

  // Micro-vias and test pads
  const subVias = k.dotGrid(-20, -62, 10, 3, 1.4, zPcbTop, P);
  const subVias2 = k.dotGrid(24, -63, 6, 4, 1.3, zPcbTop, P);
  pcbArtwork.push(k.dotsSvg([...subVias, ...subVias2], { size: 0.35, tone: "mid" }));

  // Gold test pads
  const testPads = [[-12, -58], [-10.5, -58], [4, -58], [5.5, -58]];
  testPads.forEach(([px, py]) => {
    pcbArtwork.push(k.lineSvg(k.ring(px, py, 0.4, zPcbTop, P, 16), { tone: "hi" }));
  });

  // Torx mounting screws with gold grounding washers
  const screwLocs = [
    [-25, -60],
    [31.5, -60],
    [-10, -75],
    [10, -75],
  ];
  screwLocs.forEach(([sx, sy]) => {
    const scr = createScrew(sx, sy, zPcbTop, 1.1, 0.4, P);
    scr.solids.forEach((s) => solids.push(s));
    scr.details.forEach((d) => details.push(d));
  });

  // 2. USB-C 3.2 Gen 1 Receptacle with Silicone Moisture Seal Gasket
  // Centered at X = 0, Y: -79.5 to -70
  const usbX = -5.5;
  const usbY = -79.5;
  const usbW = 11.0;
  const usbD = 9.5;
  const usbH = 3.2;
  const zUsb = 2.6; // straddles PCB
  const zUsbTop = zUsb + usbH; // 5.8 mm

  // Stainless steel outer shell
  const usbShell = k.slabOf({ x: usbX, y: usbY, w: usbW, d: usbD, r: 1.5 }, zUsb, usbH, P, 8, 0.28);
  solids.push({
    depth: k.depthOf([0, -74.75, zUsb + usbH / 2], P),
    svg: k.solidSvg(usbShell, { tone: "hi", crease: "lo", lit: true, className: "usbc-receptacle" }),
  });

  // Front entry port chamfer and cavity opening
  const usbDetails = [];
  usbDetails.push(
    k.lineSvg(
      k.planOutline({ x: usbX + 1.1, y: usbY + 0.2, w: usbW - 2.2, d: 2.0, r: 1.0 }, zUsb + 0.4, P, 4),
      { tone: "mid" }
    )
  );

  // Center contact pin tongue inside port
  const tongueSolid = k.slabOf({ x: -3.8, y: -79.0, w: 7.6, d: 5.5, r: 0.3 }, zUsb + 1.3, 0.6, P, 4, 0.08);
  solids.push({
    depth: k.depthOf([0, -76.25, zUsb + 1.6], P),
    svg: k.solidSvg(tongueSolid, { tone: "hi", crease: "lo" }),
  });

  // 24 gold plated pins (12 top, 12 bottom)
  const tongueZ = zUsb + 1.9;
  const pinStep = 6.4 / 12;
  const usbPins = [];
  for (let i = 0; i < 12; i++) {
    const px = -3.2 + i * pinStep;
    usbPins.push(k.segment([px, -79.0, tongueZ], [px, -74.5, tongueZ], P));
  }
  usbDetails.push(k.lineSvg(usbPins.join(""), { tone: "lit" }));

  // Red/Orange silicone moisture seal gasket collar around USB-C midsection
  const gasketX = usbX - 0.7;
  const gasketY = usbY + 3.2;
  const gasketW = usbW + 1.4;
  const gasketD = 2.4;
  const gasketH = 3.4;
  const zGasket = zUsb - 0.1;

  const gasketSolid = k.slabOf({ x: gasketX, y: gasketY, w: gasketW, d: gasketD, r: 1.6 }, zGasket, gasketH, P, 6, 0.2);
  solids.push({
    depth: k.depthOf([0, gasketY + gasketD / 2, zGasket + gasketH / 2], P),
    svg: k.solidSvg(gasketSolid, { tone: "red", crease: "faint", className: "silicone-gasket" }),
  });
  // Gasket compression sealing rings
  usbDetails.push(
    k.lineSvg(
      k.planOutline({ x: gasketX + 0.2, y: gasketY + 0.5, w: gasketW - 0.4, d: gasketD - 1.0, r: 1.4 }, zGasket + gasketH, P, 4),
      { tone: "red" }
    )
  );
  details.push(usbDetails.join(""));

  // 3. Dual MEMS Beamforming Microphone Capsules
  // Primary Voice Mic (near USB-C port at X: -10, Y: -74)
  const mic1X = -11.5;
  const mic1Y = -75.5;
  const mic1Solid = k.slabOf({ x: mic1X, y: mic1Y, w: 3.0, d: 3.0, r: 0.4 }, zPcbTop, 1.1, P, 4, 0.1);
  solids.push({
    depth: k.depthOf([mic1X + 1.5, mic1Y + 1.5, zPcbTop + 0.55], P),
    svg: k.solidSvg(mic1Solid, { tone: "hi", crease: "lo", className: "mems-mic" }),
  });
  details.push(k.lineSvg(k.ring(mic1X + 1.5, mic1Y + 1.5, 0.45, zPcbTop + 1.1, P, 16), { tone: "lo" }));
  details.push(k.lineSvg(k.ring(mic1X + 1.5, mic1Y + 1.5, 0.9, zPcbTop + 1.1, P, 16), { tone: "mid" }));

  // Secondary Beamforming Noise-Cancelling Mic (X: 18, Y: -74)
  const mic2X = 16.5;
  const mic2Y = -75.5;
  const mic2Solid = k.slabOf({ x: mic2X, y: mic2Y, w: 3.0, d: 3.0, r: 0.4 }, zPcbTop, 1.1, P, 4, 0.1);
  solids.push({
    depth: k.depthOf([mic2X + 1.5, mic2Y + 1.5, zPcbTop + 0.55], P),
    svg: k.solidSvg(mic2Solid, { tone: "hi", crease: "lo", className: "mems-mic" }),
  });
  details.push(k.lineSvg(k.ring(mic2X + 1.5, mic2Y + 1.5, 0.45, zPcbTop + 1.1, P, 16), { tone: "lo" }));
  details.push(k.lineSvg(k.ring(mic2X + 1.5, mic2Y + 1.5, 0.9, zPcbTop + 1.1, P, 16), { tone: "mid" }));

  // 4. Dual nano-SIM / eSIM Controller Card Socket
  // Position: X: -25 to -11, Y: -74 to -60 (14 × 14 × 1.3 mm)
  const simX = -25.0;
  const simY = -74.0;
  const simW = 14.0;
  const simD = 14.0;
  const simH = 1.35;
  const zSimTop = zPcbTop + simH; // 4.95 mm

  const simSolid = k.slabOf({ x: simX, y: simY, w: simW, d: simD, r: 0.8 }, zPcbTop, simH, P, 6, 0.18);
  solids.push({
    depth: k.depthOf([simX + simW / 2, simY + simD / 2, zPcbTop + simH / 2], P),
    svg: k.solidSvg(simSolid, { tone: "hi", crease: "lo", className: "sim-socket" }),
  });

  const simDetails = [];
  // Ejector pin guide aperture
  simDetails.push(k.lineSvg(k.ring(simX + 1.5, simY + 1.8, 0.55, zSimTop, P, 16), { tone: "mid" }));
  // SIM card tray slot opening
  simDetails.push(k.lineSvg(k.segment([simX + 3.0, simY, zSimTop], [simX + simW - 1.0, simY, zSimTop], P), { tone: "lo" }));

  // Inspection window cutouts exposing internal gold contact pins
  simDetails.push(
    k.lineSvg(k.planOutline({ x: simX + 2.5, y: simY + 3.5, w: 4.5, d: 8.0, r: 0.3 }, zSimTop, P, 4), { tone: "mid" })
  );
  simDetails.push(
    k.lineSvg(k.planOutline({ x: simX + 8.0, y: simY + 3.5, w: 4.5, d: 8.0, r: 0.3 }, zSimTop, P, 4), { tone: "mid" })
  );

  // Gold spring contact fingers inside the windows
  for (let i = 0; i < 3; i++) {
    const py = simY + 5.0 + i * 2.2;
    simDetails.push(k.lineSvg(k.segment([simX + 3.2, py, zSimTop], [simX + 6.2, py, zSimTop], P), { tone: "hi" }));
    simDetails.push(k.lineSvg(k.segment([simX + 8.7, py, zSimTop], [simX + 11.7, py, zSimTop], P), { tone: "hi" }));
  }

  // eSIM secure element controller IC
  const esimSolid = k.slabOf({ x: -16.0, y: -59.0, w: 3.5, d: 3.0, r: 0.3 }, zPcbTop, 0.5, P, 4, 0.08);
  solids.push({
    depth: k.depthOf([-14.25, -57.5, zPcbTop + 0.25], P),
    svg: k.solidSvg(esimSolid, { tone: "mid", crease: "faint" }),
  });
  simDetails.push(
    k.faceTextSvg(
      k.topMatrix([-15.6, -57.2], zPcbTop + 0.5, P, "x"),
      "eSIM",
      { size: 0.9, tone: "lit" }
    )
  );
  details.push(simDetails.join(""));

  // 5. X-axis Linear Resonant Haptic Actuator (Vibration Motor)
  // Large tactile motor: X = 7 to 27, Y = -72 to -60 (20 × 12 × 3.4 mm)
  const hapticX = 7.0;
  const hapticY = -72.0;
  const hapticW = 20.0;
  const hapticD = 12.0;
  const hapticH = 3.4;
  const zHapticTop = zPcbTop + hapticH; // 7.0 mm

  const hapticSolid = k.slabOf({ x: hapticX, y: hapticY, w: hapticW, d: hapticD, r: 1.4 }, zPcbTop, hapticH, P, 8, 0.3);
  solids.push({
    depth: k.depthOf([hapticX + hapticW / 2, hapticY + hapticD / 2, zPcbTop + hapticH / 2], P),
    svg: k.solidSvg(hapticSolid, { tone: "hi", crease: "lo", lit: true, className: "haptic-actuator" }),
  });

  const hapticDetails = [];
  // Laser marked text on top cover
  hapticDetails.push(
    k.faceTextSvg(
      k.topMatrix([hapticX + 2.0, hapticY + 2.4], zHapticTop, P, "x"),
      "TACTILE ENGINE · 170Hz",
      { size: 1.15, tone: "lit" }
    )
  );
  hapticDetails.push(
    k.faceTextSvg(
      k.topMatrix([hapticX + 2.0, hapticY + 4.0], zHapticTop, P, "x"),
      "X-AXIS RESONANT MOTOR",
      { size: 1.0, tone: "hi" }
    )
  );

  // INTERNAL TUNGSTEN WEIGHT OUTLINE
  // Moving heavy tungsten mass outline inside the motor
  const wMassX = hapticX + 2.5;
  const wMassY = hapticY + 4.8;
  const wMassW = 15.0;
  const wMassD = 6.0;
  hapticDetails.push(
    k.lineSvg(
      k.planOutline({ x: wMassX, y: wMassY, w: wMassW, d: wMassD, r: 1.0 }, zHapticTop, P, 6),
      { tone: "lit", dashed: true }
    )
  );
  hapticDetails.push(
    k.faceTextSvg(
      k.topMatrix([wMassX + 2.5, wMassY + 3.8], zHapticTop, P, "x"),
      "TUNGSTEN MASS 1.8g",
      { size: 0.95, tone: "lit" }
    )
  );

  // Dual spiral / leaf suspension springs at left and right extremes
  const spring1 = [
    k.segment([hapticX + 1.2, hapticY + 6.0, zHapticTop], [wMassX, hapticY + 5.2, zHapticTop], P),
    k.segment([hapticX + 1.2, hapticY + 8.5, zHapticTop], [wMassX, hapticY + 9.5, zHapticTop], P),
  ];
  const spring2 = [
    k.segment([hapticX + hapticW - 1.2, hapticY + 6.0, zHapticTop], [wMassX + wMassW, hapticY + 5.2, zHapticTop], P),
    k.segment([hapticX + hapticW - 1.2, hapticY + 8.5, zHapticTop], [wMassX + wMassW, hapticY + 9.5, zHapticTop], P),
  ];
  hapticDetails.push(k.lineSvg(spring1.join(""), { tone: "hi" }));
  hapticDetails.push(k.lineSvg(spring2.join(""), { tone: "hi" }));

  // Central copper electromagnetic drive coil outline
  const coilOutline = k.planOutline({ x: hapticX + 7.5, y: hapticY + 5.8, w: 5.0, d: 4.0, r: 0.8 }, zHapticTop, P, 4);
  hapticDetails.push(k.lineSvg(coilOutline, { tone: "red" }));

  details.push(hapticDetails.join(""));

  // 6. Braided RF Antenna Coaxial Micro-Cables and Main FPC Bus Connector
  // Main FPC Bus Connector (X = -5 to 8, Y = -59)
  const fpcConn = createBtbSocket(-5.0, -59.2, zPcbTop, 13.0, 3.2, 0.95, 36, P);
  solids.push(fpcConn);

  // Dual Braided RF Antenna Coaxial Micro-Cables
  // U.FL gold micro-coax connector sockets at X: 29
  const coaxConn1 = k.cylinder(29.0, -64.0, 1.15, zPcbTop, 0.85, P, 16, 0.1);
  const coaxConn2 = k.cylinder(29.0, -70.0, 1.15, zPcbTop, 0.85, P, 16, 0.1);
  solids.push({
    depth: k.depthOf([29.0, -64.0, zPcbTop + 0.42], P),
    svg: k.solidSvg(coaxConn1, { tone: "hi", crease: "lo" }),
  });
  solids.push({
    depth: k.depthOf([29.0, -70.0, zPcbTop + 0.42], P),
    svg: k.solidSvg(coaxConn2, { tone: "hi", crease: "lo" }),
  });
  details.push(k.lineSvg(k.ring(29.0, -64.0, 0.35, zPcbTop + 0.85, P, 16), { tone: "lit" }));
  details.push(k.lineSvg(k.ring(29.0, -70.0, 0.35, zPcbTop + 0.85, P, 16), { tone: "lit" }));

  // Braided coaxial cables routing upwards
  const cable1Points = [
    [29.0, -70.0, zPcbTop + 0.6],
    [30.5, -67.0, zPcbTop + 0.6],
    [30.5, -56.0, zPcbTop + 0.6],
  ];
  const cable2Points = [
    [29.0, -64.0, zPcbTop + 0.6],
    [31.8, -61.0, zPcbTop + 0.6],
    [31.8, -56.0, zPcbTop + 0.6],
  ];

  details.push(
    k.lineSvg(k.pathOf(cable1Points.map((p) => k.iso(p, P))), { tone: "hi" })
  );
  details.push(
    k.lineSvg(k.pathOf(cable2Points.map((p) => k.iso(p, P))), { tone: "mid" })
  );

  // Braided texture tick marks along the coaxial cables
  const braidTicks = [];
  for (let y = -66; y <= -56; y += 1.6) {
    braidTicks.push(k.segment([30.1, y, zPcbTop + 0.6], [30.9, y + 0.8, zPcbTop + 0.6], P));
    braidTicks.push(k.segment([31.4, y, zPcbTop + 0.6], [32.2, y + 0.8, zPcbTop + 0.6], P));
  }
  details.push(k.lineSvg(braidTicks.join(""), { tone: "lo" }));

  // SMD decoupling caps near USB-C power rail
  const subSmds = [
    createSmdCapacitor(-4.8, -69.0, zPcbTop, 1.2, 0.8, 0.5, P, true),
    createSmdCapacitor(-3.2, -69.0, zPcbTop, 1.2, 0.8, 0.5, P, true),
    createSmdCapacitor(2.2, -69.0, zPcbTop, 1.2, 0.8, 0.5, P, true),
    createSmdCapacitor(3.8, -69.0, zPcbTop, 1.2, 0.8, 0.5, P, true),
  ];
  subSmds.forEach((s) => solids.push(s));

  // Back-to-front depth sort
  solids.sort((a, b) => a.depth - b.depth);

  const fullSvg = `<g class="assembly-sub-board" data-assembly="sub_board">${pcbSvg}${pcbArtwork.join("")}${solids.map((s) => s.svg).join("")}${details.join("")}</g>`;
  const solidsCount = solids.length + 1; // +1 for daughterboard PCB
  const pathsCount = (fullSvg.match(/<path|<circle|<text/g) || []).length;

  return {
    svg: fullSvg,
    solidsCount,
    pathsCount,
    bounds: { min: [-35, -78, zBase], max: [35, -56, zHapticTop] },
  };
}

// =============================================================================
// 3. CAMERAS ASSEMBLY (Assembly 08)
// =============================================================================

export function buildCameras(P = DEFAULT_P) {
  const solids = [];
  const details = [];

  const zBase = 3.2; // restZ
  const zBracketTop = 4.2; // bracket base height 1.0 mm

  // 1. Rigid-flex camera housing bracket holding the quad camera system
  // Machined aluminum/titanium chassis bracket (X: -33 to -2, Y: 24 to 76)
  const bracketPoly = [
    [-33.0, 24.5],
    [-8.0, 24.5],
    [-8.0, 41.0],
    [-2.0, 41.0], // Extension for secondary column (3x Tele & Flash)
    [-2.0, 75.5],
    [-33.0, 75.5],
    [-33.0, 24.5],
  ];

  const roundedBracket = roundedPolygon(bracketPoly, 1.2, 4);
  const bracketSolid = k.extrude(roundedBracket, zBase, 1.0, P, { convex: true, bevel: 0.18 });
  const bracketSvg = k.solidSvg(bracketSolid, { tone: "hi", crease: "lo", className: "camera-bracket" });

  // Bracket mounting screw bosses with Torx screws
  const bracketScrews = [
    [-31.5, 26.0],
    [-31.5, 73.8],
    [-4.0, 43.0],
    [-4.0, 73.8],
  ];
  bracketScrews.forEach(([sx, sy]) => {
    const scr = createScrew(sx, sy, zBracketTop, 1.1, 0.45, P);
    scr.solids.forEach((s) => solids.push(s));
    scr.details.forEach((d) => details.push(d));
  });

  // Camera bay machined well outlines on bracket top face
  details.push(
    k.lineSvg(
      k.planOutline({ x: -32.5, y: 25.5, w: 23.5, d: 13.5, r: 0.8 }, zBracketTop, P, 4),
      { tone: "mid" }
    )
  );
  details.push(k.lineSvg(k.ring(-21.0, 50.0, 9.8, zBracketTop, P, 32), { tone: "mid" }));
  details.push(k.lineSvg(k.ring(-21.0, 68.0, 6.5, zBracketTop, P, 28), { tone: "mid" }));
  details.push(k.lineSvg(k.ring(-7.5, 50.0, 6.1, zBracketTop, P, 28), { tone: "mid" }));

  // Flex circuit bus ribbon tails
  const flexRibbon = [
    k.segment([-8.0, 31.0, zBracketTop], [-10.5, 31.0, zBracketTop], P),
    k.segment([-8.0, 47.0, zBracketTop], [-10.5, 47.0, zBracketTop], P),
    k.segment([-8.0, 64.0, zBracketTop], [-10.5, 64.0, zBracketTop], P),
  ];
  details.push(k.lineSvg(flexRibbon.join(""), { tone: "hi" }));

  // ---------------------------------------------------------------------------
  // a) 200MP Main Wide Primary Camera
  // Large voice-coil motor (VCM) cylindrical housing (radius 9.5 mm, h 6.2 mm)
  // Position: X = -21.0, Y = 50.0, Z: 4.0 to 10.2 mm
  // ---------------------------------------------------------------------------
  const wideX = -21.0;
  const wideY = 50.0;
  const wideR = 9.5;
  const wideH = 6.2;
  const zWide = 4.0;
  const zWideTop = zWide + wideH; // 10.2 mm

  // Main VCM outer cylindrical barrel
  const wideCyl = k.cylinder(wideX, wideY, wideR, zWide, wideH, P, 44, 0.4);
  solids.push({
    depth: k.depthOf([wideX, wideY, zWide + wideH / 2], P),
    svg: `<g id="ois-lens-primary" class="ois-lens-primary">${k.solidSvg(wideCyl, { tone: "hi", crease: "lo", lit: true, className: "wide-200mp-vcm" })}</g>`,
  });

  const wideDetails = [];
  // 4 Corner permanent neodymium magnet poles
  for (let dx of [-1, 1]) {
    for (let dy of [-1, 1]) {
      const magX = wideX + dx * 7.2;
      const magY = wideY + dy * 7.2;
      const pole = k.slabOf({ x: magX - 1.2, y: magY - 1.2, w: 2.4, d: 2.4, r: 0.3 }, zWide + 1.2, 3.8, P, 4, 0.1);
      solids.push({
        depth: k.depthOf([magX, magY, zWide + 3.1], P),
        svg: k.solidSvg(pole, { tone: "mid", crease: "faint" }),
      });
    }
  }

  // Copper voice coil windings around the actuator perimeter
  const coilKnurl = k.knurl(wideX, wideY, wideR - 0.2, zWide + 1.2, zWide + 4.8, 52, P, 0.2);
  wideDetails.push(k.lineSvg(coilKnurl, { tone: "red" }));
  wideDetails.push(k.lineSvg(k.ring(wideX, wideY, wideR - 0.15, zWide + 1.8, P, 36), { tone: "red" }));
  wideDetails.push(k.lineSvg(k.ring(wideX, wideY, wideR - 0.15, zWide + 3.0, P, 36), { tone: "red" }));
  wideDetails.push(k.lineSvg(k.ring(wideX, wideY, wideR - 0.15, zWide + 4.2, P, 36), { tone: "red" }));

  // 8-ELEMENT OPTICAL LENS APERTURE ON TOP (zWideTop = 10.2 mm)
  // Stepped concentric optical lens rings and multi-coatings
  const oisLensRings = [];
  oisLensRings.push(k.lineSvg(k.ring(wideX, wideY, 9.1, zWideTop, P, 40), { tone: "hi" })); // Element 1: Outer bezel
  oisLensRings.push(k.lineSvg(k.ring(wideX, wideY, 8.4, zWideTop, P, 36), { tone: "mid" })); // Element 2: Retaining collar
  oisLensRings.push(k.lineSvg(k.ring(wideX, wideY, 7.6, zWideTop, P, 36), { tone: "hi" })); // Element 3: Convex aspherical glass
  oisLensRings.push(k.lineSvg(k.ring(wideX, wideY, 6.7, zWideTop, P, 32), { tone: "green" })); // Element 4: Anti-reflective coating
  oisLensRings.push(k.lineSvg(k.ring(wideX, wideY, 5.8, zWideTop, P, 32), { tone: "hi" })); // Element 5: Aperture iris stop
  // Element 6: 8-blade iris polygon chords
  const irisPoints = [];
  for (let i = 0; i < 8; i++) {
    const a1 = (i * 45) * DEG2RAD;
    const a2 = ((i + 1) * 45) * DEG2RAD;
    const p1 = [wideX + 5.0 * Math.cos(a1), wideY + 5.0 * Math.sin(a1), zWideTop];
    const p2 = [wideX + 3.8 * Math.cos(a2), wideY + 3.8 * Math.sin(a2), zWideTop];
    irisPoints.push(k.segment(p1, p2, P));
  }
  oisLensRings.push(k.lineSvg(irisPoints.join(""), { tone: "mid" }));
  oisLensRings.push(k.lineSvg(k.ring(wideX, wideY, 4.4, zWideTop, P, 28), { tone: "hi" })); // Element 7: Inner concave lens
  oisLensRings.push(k.lineSvg(k.ring(wideX, wideY, 3.2, zWideTop, P, 24), { tone: "mid" })); // Element 8: Optical pupil
  oisLensRings.push(k.lineSvg(k.ring(wideX, wideY, 1.8, zWideTop, P, 20), { tone: "lit" })); // Center optical core

  // Sensor-shift OIS spring suspension arms
  const oisArms = [
    k.segment([wideX - 7.5, wideY - 7.5, zWide + 5.5], [wideX - 5.5, wideY - 5.5, zWide + 5.5], P),
    k.segment([wideX + 7.5, wideY - 7.5, zWide + 5.5], [wideX + 5.5, wideY - 5.5, zWide + 5.5], P),
    k.segment([wideX - 7.5, wideY + 7.5, zWide + 5.5], [wideX - 5.5, wideY + 5.5, zWide + 5.5], P),
    k.segment([wideX + 7.5, wideY + 7.5, zWide + 5.5], [wideX + 5.5, wideY + 5.5, zWide + 5.5], P),
  ];
  oisLensRings.push(k.lineSvg(oisArms.join(""), { tone: "hi" }));
  wideDetails.push(`<g id="ois-lens-primary" class="ois-lens-primary">${oisLensRings.join("")}</g>`);
  details.push(wideDetails.join(""));

  // ---------------------------------------------------------------------------
  // b) 50MP 5x Folded Periscope Telephoto
  // Rectangular prism housing (w 24, d 14, h 5.8 mm)
  // Position: X: -33 to -9, Y: 25 to 39, Z: 4.0 to 9.8 mm
  // ---------------------------------------------------------------------------
  const periX = -33.0;
  const periY = 25.0;
  const periW = 24.0;
  const periD = 14.0;
  const periH = 5.8;
  const zPeri = 4.0;
  const zPeriTop = zPeri + periH; // 9.8 mm

  const periSolid = k.slabOf({ x: periX, y: periY, w: periW, d: periD, r: 1.0 }, zPeri, periH, P, 8, 0.3);
  solids.push({
    depth: k.depthOf([periX + periW / 2, periY + periD / 2, zPeri + periH / 2], P),
    svg: `<g id="periscope-prism-element" class="periscope-prism-element">${k.solidSvg(periSolid, { tone: "hi", crease: "lo", lit: true, className: "periscope-telephoto" })}</g>`,
  });

  const periDetails = [];
  // 45° ANGLED FOLDED GLASS PRISM MIRROR
  // Optical entrance window on top face (X: -31.5 to -22, Y: 26.5 to 37.5)
  const prismWinX = periX + 1.2;
  const prismWinY = periY + 1.5;
  const prismWinW = 9.5;
  const prismWinD = 11.0;
  periDetails.push(
    k.lineSvg(
      k.planOutline({ x: prismWinX, y: prismWinY, w: prismWinW, d: prismWinD, r: 0.8 }, zPeriTop, P, 4),
      { tone: "hi" }
    )
  );

  // 45° Sloped reflective mirror surface
  // Slopes down from [prismWinX, zPeriTop - 0.2] to [prismWinX + prismWinW, zPeri + 0.8]
  const pMirrorTop = [
    [prismWinX, prismWinY + 1.0, zPeriTop - 0.2],
    [prismWinX, prismWinY + prismWinD - 1.0, zPeriTop - 0.2],
  ];
  const pMirrorBot = [
    [prismWinX + prismWinW, prismWinY + prismWinD - 1.0, zPeri + 0.8],
    [prismWinX + prismWinW, prismWinY + 1.0, zPeri + 0.8],
  ];
  const mirrorPoly = [pMirrorTop[0], pMirrorTop[1], pMirrorBot[0], pMirrorBot[1]];
  periDetails.push(
    k.lineSvg(k.pathOf(mirrorPoly.map((p) => k.iso(p, P)), true), { tone: "lit" })
  );
  // Mirror silver reflection sheen rays across the prism face
  for (let s = 2.0; s < prismWinD - 2.0; s += 2.5) {
    const ray1 = [prismWinX, prismWinY + s, zPeriTop - 0.2];
    const ray2 = [prismWinX + prismWinW, prismWinY + s, zPeri + 0.8];
    periDetails.push(k.lineSvg(k.segment(ray1, ray2, P), { tone: "lit" }));
  }

  // OPTICAL RAIL BEARINGS
  // Dual stainless steel guide rails along the horizontal optical zoom axis
  const rail1Start = [prismWinX + prismWinW + 0.8, periY + 3.5, zPeri + 2.8];
  const rail1End = [periX + periW - 2.5, periY + 3.5, zPeri + 2.8];
  const rail2Start = [prismWinX + prismWinW + 0.8, periY + periD - 3.5, zPeri + 2.8];
  const rail2End = [periX + periW - 2.5, periY + periD - 3.5, zPeri + 2.8];

  periDetails.push(k.lineSvg(k.segment(rail1Start, rail1End, P), { tone: "hi" }));
  periDetails.push(k.lineSvg(k.segment(rail2Start, rail2End, P), { tone: "hi" }));

  // Precision ball bearing sleeve carriages
  const bSleeve1 = k.cylinder(prismWinX + prismWinW + 4.5, periY + 3.5, 0.9, zPeri + 2.1, 1.4, P, 16, 0.08);
  const bSleeve2 = k.cylinder(prismWinX + prismWinW + 4.5, periY + periD - 3.5, 0.9, zPeri + 2.1, 1.4, P, 16, 0.08);
  solids.push({ depth: k.depthOf([prismWinX + prismWinW + 4.5, periY + 3.5, zPeri + 2.8], P), svg: k.solidSvg(bSleeve1, { tone: "hi" }) });
  solids.push({ depth: k.depthOf([prismWinX + prismWinW + 4.5, periY + periD - 3.5, zPeri + 2.8], P), svg: k.solidSvg(bSleeve2, { tone: "hi" }) });

  // Floating lens carrier between rails
  const lensCarrier = k.slabOf({ x: prismWinX + prismWinW + 2.8, y: periY + 3.2, w: 3.5, d: periD - 6.4, r: 0.4 }, zPeri + 1.2, 3.2, P, 4, 0.1);
  solids.push({
    depth: k.depthOf([prismWinX + prismWinW + 4.5, periY + periD / 2, zPeri + 2.8], P),
    svg: k.solidSvg(lensCarrier, { tone: "mid", crease: "faint" }),
  });

  // PERPENDICULAR SENSOR MOUNT
  // Vertical image sensor mount plate at the end of the optical tunnel
  const sensX = periX + periW - 1.6;
  const sensY = periY + 2.0;
  const sensW = 1.2;
  const sensD = 10.0;
  const sensH = 4.8;
  const sensSolid = k.slabOf({ x: sensX, y: sensY, w: sensW, d: sensD, r: 0.2 }, zPeri + 0.5, sensH, P, 4, 0.08);
  solids.push({
    depth: k.depthOf([sensX + sensW / 2, sensY + sensD / 2, zPeri + 2.9], P),
    svg: k.solidSvg(sensSolid, { tone: "hi", crease: "lo", className: "perpendicular-sensor" }),
  });

  // 50MP Sensor silicon die and gold wirebonds on the perpendicular face
  const dieZ = zPeri + 1.6;
  periDetails.push(k.lineSvg(k.segment([sensX, sensY + 2.0, dieZ], [sensX, sensY + 8.0, dieZ], P), { tone: "lit" }));
  periDetails.push(k.lineSvg(k.segment([sensX, sensY + 2.0, dieZ + 2.4], [sensX, sensY + 8.0, dieZ + 2.4], P), { tone: "lit" }));
  // Wirebond fanning loops
  for (let dy = 2.5; dy <= 7.5; dy += 1.2) {
    periDetails.push(k.lineSvg(k.segment([sensX, sensY + dy, dieZ + 0.3], [sensX - 0.6, sensY + dy, dieZ + 0.6], P), { tone: "hi" }));
  }

  // Label text on Periscope cover
  periDetails.push(
    k.faceTextSvg(
      k.topMatrix([prismWinX + prismWinW + 1.0, periY + 2.2], zPeriTop, P, "x"),
      "50MP 5x OPTICAL PERISCOPE",
      { size: 1.05, tone: "lit" }
    )
  );
  periDetails.push(
    k.faceTextSvg(
      k.topMatrix([prismWinX + prismWinW + 1.0, periY + 3.8], zPeriTop, P, "x"),
      "FOLDED PRISM · BALL RAILS",
      { size: 0.9, tone: "hi" }
    )
  );
  details.push(periDetails.join(""));

  // ---------------------------------------------------------------------------
  // c) 50MP Ultra-Wide Camera
  // Cylindrical lens barrel (radius 6.2 mm, h 4.5 mm) with macro VCM ring
  // Position: X = -21.0, Y = 68.0, Z: 4.0 to 8.5 mm
  // ---------------------------------------------------------------------------
  const uwX = -21.0;
  const uwY = 68.0;
  const uwR = 6.2;
  const uwH = 4.5;
  const zUw = 4.0;
  const zUwTop = zUw + uwH; // 8.5 mm

  const uwCyl = k.cylinder(uwX, uwY, uwR, zUw, uwH, P, 36, 0.35);
  solids.push({
    depth: k.depthOf([uwX, uwY, zUw + uwH / 2], P),
    svg: k.solidSvg(uwCyl, { tone: "hi", crease: "lo", lit: true, className: "ultrawide-50mp" }),
  });

  const uwDetails = [];
  // Macro VCM autofocus ring with knurled grip texture
  const uwKnurl = k.knurl(uwX, uwY, uwR + 0.1, zUw + 1.0, zUw + 3.2, 36, P, 0.2);
  uwDetails.push(k.lineSvg(uwKnurl, { tone: "mid" }));
  uwDetails.push(k.lineSvg(k.ring(uwX, uwY, uwR + 0.1, zUw + 1.0, P, 32), { tone: "hi" }));
  uwDetails.push(k.lineSvg(k.ring(uwX, uwY, uwR + 0.1, zUw + 3.2, P, 32), { tone: "hi" }));

  // Optical front elements on top face
  uwDetails.push(k.lineSvg(k.ring(uwX, uwY, 5.9, zUwTop, P, 36), { tone: "hi" })); // Outer bezel
  uwDetails.push(k.lineSvg(k.ring(uwX, uwY, 5.1, zUwTop, P, 32), { tone: "hi" })); // Multi-coating lens
  uwDetails.push(k.lineSvg(k.ring(uwX, uwY, 4.0, zUwTop, P, 28), { tone: "hi" })); // Aperture ring
  uwDetails.push(k.lineSvg(k.ring(uwX, uwY, 2.6, zUwTop, P, 24), { tone: "mid" })); // Core pupil
  uwDetails.push(k.lineSvg(k.ring(uwX, uwY, 1.4, zUwTop, P, 16), { tone: "lit" }));

  details.push(uwDetails.join(""));

  // ---------------------------------------------------------------------------
  // d) 10MP 3x Telephoto Camera
  // Cylindrical OIS lens barrel (radius 5.8 mm, h 4.2 mm)
  // Position: X = -7.5, Y = 50.0, Z: 4.0 to 8.2 mm
  // ---------------------------------------------------------------------------
  const teleX = -7.5;
  const teleY = 50.0;
  const teleR = 5.8;
  const teleH = 4.2;
  const zTele = 4.0;
  const zTeleTop = zTele + teleH; // 8.2 mm

  const teleCyl = k.cylinder(teleX, teleY, teleR, zTele, teleH, P, 36, 0.3);
  solids.push({
    depth: k.depthOf([teleX, teleY, zTele + teleH / 2], P),
    svg: k.solidSvg(teleCyl, { tone: "hi", crease: "lo", lit: true, className: "telephoto-10mp" }),
  });

  const teleDetails = [];
  // 4-point OIS leaf spring flexure arms
  const teleOis = [
    k.segment([teleX - 4.5, teleY - 4.5, zTele + 2.2], [teleX - 3.2, teleY - 3.2, zTele + 2.2], P),
    k.segment([teleX + 4.5, teleY - 4.5, zTele + 2.2], [teleX + 3.2, teleY - 3.2, zTele + 2.2], P),
    k.segment([teleX - 4.5, teleY + 4.5, zTele + 2.2], [teleX - 3.2, teleY + 3.2, zTele + 2.2], P),
    k.segment([teleX + 4.5, teleY + 4.5, zTele + 2.2], [teleX + 3.2, teleY + 3.2, zTele + 2.2], P),
  ];
  teleDetails.push(k.lineSvg(teleOis.join(""), { tone: "hi" }));
  teleDetails.push(k.lineSvg(k.ring(teleX, teleY, teleR + 0.1, zTele + 2.2, P, 32), { tone: "mid" }));

  // Optical lens rings on top face
  teleDetails.push(k.lineSvg(k.ring(teleX, teleY, 5.5, zTeleTop, P, 32), { tone: "hi" })); // Outer bezel
  teleDetails.push(k.lineSvg(k.ring(teleX, teleY, 4.6, zTeleTop, P, 28), { tone: "green" })); // Coating ring
  teleDetails.push(k.lineSvg(k.ring(teleX, teleY, 3.6, zTeleTop, P, 24), { tone: "hi" })); // Lens aperture
  teleDetails.push(k.lineSvg(k.ring(teleX, teleY, 2.4, zTeleTop, P, 20), { tone: "mid" })); // Core pupil
  teleDetails.push(k.lineSvg(k.ring(teleX, teleY, 1.2, zTeleTop, P, 16), { tone: "lit" }));

  details.push(teleDetails.join(""));

  // ---------------------------------------------------------------------------
  // e) Laser AF Time-of-Flight (ToF) & Dual-LED Flash Module
  // Position: X: -10 to -4, Y: 62 to 74, Z: 4.0 to 6.4 mm
  // ---------------------------------------------------------------------------
  // Laser AF ToF module pill casing
  const tofX = -10.5;
  const tofY = 61.5;
  const tofW = 6.0;
  const tofD = 5.2;
  const tofH = 2.4;
  const zTofTop = zBracketTop + tofH; // 6.6 mm

  const tofSolid = k.slabOf({ x: tofX, y: tofY, w: tofW, d: tofD, r: 0.9 }, zBracketTop, tofH, P, 6, 0.15);
  solids.push({
    depth: k.depthOf([tofX + tofW / 2, tofY + tofD / 2, zBracketTop + tofH / 2], P),
    svg: k.solidSvg(tofSolid, { tone: "hi", crease: "lo", className: "laser-af-module" }),
  });

  const sensorDetails = [];
  // Dual optical apertures on ToF top face
  // 1. VCSEL 940nm IR laser transmitter aperture
  const txX = tofX + 1.8;
  const txY = tofY + tofD / 2;
  sensorDetails.push(k.lineSvg(k.ring(txX, txY, 1.05, zTofTop, P, 16), { tone: "hi" }));
  sensorDetails.push(k.lineSvg(k.ring(txX, txY, 0.45, zTofTop, P, 16), { tone: "red" })); // IR emitter dot

  // 2. SPAD receiver diode aperture
  const rxX = tofX + tofW - 1.8;
  const rxY = tofY + tofD / 2;
  sensorDetails.push(k.lineSvg(k.ring(rxX, rxY, 1.05, zTofTop, P, 16), { tone: "hi" }));
  sensorDetails.push(k.lineSvg(k.ring(rxX, rxY, 0.55, zTofTop, P, 16), { tone: "mid" })); // SPAD receiver filter

  // Dual-tone LED Flash Module
  const flashX = -10.2;
  const flashY = 68.2;
  const flashW = 5.4;
  const flashD = 5.0;
  const flashH = 1.9;
  const zFlashTop = zBracketTop + flashH; // 6.1 mm

  const flashSolid = k.slabOf({ x: flashX, y: flashY, w: flashW, d: flashD, r: 0.6 }, zBracketTop, flashH, P, 6, 0.12);
  solids.push({
    depth: k.depthOf([flashX + flashW / 2, flashY + flashD / 2, zBracketTop + flashH / 2], P),
    svg: k.solidSvg(flashSolid, { tone: "hi", crease: "lo", className: "flash-module" }),
  });

  // Circular reflector cup on top face
  const flCenter = [flashX + flashW / 2, flashY + flashD / 2];
  sensorDetails.push(k.lineSvg(k.ring(flCenter[0], flCenter[1], 1.95, zFlashTop, P, 24), { tone: "mid" }));

  // Dual phosphor LED dies
  // Warm amber 3000K die
  const warmDie = k.slabOf({ x: flCenter[0] - 1.2, y: flCenter[1] - 0.6, w: 1.0, d: 1.2, r: 0.1 }, zFlashTop, 0.25, P, 4, 0.05);
  solids.push({
    depth: k.depthOf([flCenter[0] - 0.7, flCenter[1], zFlashTop + 0.12], P),
    svg: k.solidSvg(warmDie, { tone: "hi", lit: true }),
  });
  // Cool white 5700K die
  const coolDie = k.slabOf({ x: flCenter[0] + 0.2, y: flCenter[1] - 0.6, w: 1.0, d: 1.2, r: 0.1 }, zFlashTop, 0.25, P, 4, 0.05);
  solids.push({
    depth: k.depthOf([flCenter[0] + 0.7, flCenter[1], zFlashTop + 0.12], P),
    svg: k.solidSvg(coolDie, { tone: "lit", lit: true }),
  });

  // Fresnel collimating lens micro groove rings
  sensorDetails.push(k.lineSvg(k.ring(flCenter[0], flCenter[1], 1.45, zFlashTop + 0.25, P, 20), { tone: "lo" }));
  sensorDetails.push(k.lineSvg(k.ring(flCenter[0], flCenter[1], 0.95, zFlashTop + 0.25, P, 16), { tone: "lo" }));

  details.push(sensorDetails.join(""));

  // Back-to-front depth sort
  solids.sort((a, b) => a.depth - b.depth);

  const fullSvg = `<g class="assembly-cameras" data-assembly="cameras">${bracketSvg}${solids.map((s) => s.svg).join("")}${details.join("")}</g>`;
  const solidsCount = solids.length + 1; // +1 for the main bracket solid
  const pathsCount = (fullSvg.match(/<path|<circle|<text/g) || []).length;

  return {
    svg: fullSvg,
    solidsCount,
    pathsCount,
    bounds: { min: [-33, 24, zBase], max: [-2, 76, zWideTop] },
  };
}
