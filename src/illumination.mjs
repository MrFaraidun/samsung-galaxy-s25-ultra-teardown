/**
 * Galaxy S25 Ultra — IsoGlow Illumination System
 * Restrained, functional technical lighting anchored to real hardware geometry.
 */
import * as k from "../kit/iso-kit.mjs";
import { P, at, Ln, PHONE, PLAN } from "./model.mjs";

export function getSvgFilters() {
  return `
    <defs>
      <!-- Core IsoGlow Filters with userSpaceOnUse to prevent zero-height line clipping -->
      <filter id="iso-glow" filterUnits="userSpaceOnUse" x="-3000" y="-3000" width="8000" height="8000">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3.8" result="blur1" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="1.4" result="blur2" />
        <feMerge>
          <feMergeNode in="blur1" />
          <feMergeNode in="blur2" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <filter id="iso-soft" filterUnits="userSpaceOnUse" x="-3000" y="-3000" width="8000" height="8000">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <filter id="iso-bloom" filterUnits="userSpaceOnUse" x="-3000" y="-3000" width="8000" height="8000">
        <feGaussianBlur in="SourceGraphic" stdDeviation="9.0" />
      </filter>

      <!-- Thermal Gradient for Sintered Copper Vapor Chamber -->
      <linearGradient id="thermal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ff9a2e" stop-opacity="0.85" />
        <stop offset="45%" stop-color="#d97706" stop-opacity="0.65" />
        <stop offset="80%" stop-color="#c87a52" stop-opacity="0.45" />
        <stop offset="100%" stop-color="#78350f" stop-opacity="0.15" />
      </linearGradient>

      <!-- Silicon Core Highlight Gradient for Snapdragon 8 Elite -->
      <radialGradient id="soc-glow-grad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
        <stop offset="50%" stop-color="#e2e8f0" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#94a3b8" stop-opacity="0" />
      </radialGradient>

      <!-- Optical Anti-Reflective Lens Aperture Gradient -->
      <radialGradient id="lens-iris" cx="45%" cy="45%" r="50%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85" />
        <stop offset="40%" stop-color="#e2e8f0" stop-opacity="0.5" />
        <stop offset="80%" stop-color="#94a3b8" stop-opacity="0.25" />
        <stop offset="100%" stop-color="#475569" stop-opacity="0" />
      </radialGradient>
    </defs>
  `;
}

/**
 * Builds responsive illuminated traces and highlights for an assembly.
 */
export function buildAssemblyIllumination(assemblyId, zOffset = 0) {
  const parts = [];

  switch (assemblyId) {
    case "motherboard": {
      // Snapdragon 8 Elite active silicon halo & high-speed bus lines
      // SoC centered at x: -14, y: -42, z: 4.8 + zOffset
      const cx = -14, cy = -42, cz = 4.8 + zOffset;
      const socCorners = [
        [cx - 7.5, cy - 7.5, cz],
        [cx + 7.5, cy - 7.5, cz],
        [cx + 7.5, cy + 7.5, cz],
        [cx - 7.5, cy + 7.5, cz],
      ];
      const socPath = k.pathOf(socCorners.map((p) => at(p)), true);
      parts.push(`
        <path class="glow-active soc-core" filter="url(#iso-glow)" d="${socPath}" stroke="#ffffff" stroke-width="1.4" fill="none" />
        <path class="glow-active soc-halo" filter="url(#iso-bloom)" d="${socPath}" fill="#ffffff" opacity="0.25" />
      `);

      // High-speed bus traces fanning out from SoC to memory & PMIC
      const busRoutes = [
        // Bus route 1: SoC to RAM / PMIC
        [[cx + 7.5, cy - 3, cz], [cx + 14, cy - 3, cz], [cx + 14, cy + 8, cz], [cx + 18, cy + 8, cz]],
        // Bus route 2: SoC to Modem / RF
        [[cx - 7.5, cy + 2, cz], [cx - 15, cy + 2, cz], [cx - 15, cy - 12, cz], [cx - 19, cy - 12, cz]],
        // Bus route 3: PCIe trace to Camera interface
        [[cx + 2, cy - 7.5, cz], [cx + 2, cy - 16, cz], [cx + 8, cy - 16, cz], [cx + 8, cy - 22, cz]],
        // Bus route 4: Display MIPI DSI trace
        [[cx - 2, cy + 7.5, cz], [cx - 2, cy + 18, cz], [cx - 8, cy + 18, cz], [cx - 8, cy + 26, cz]],
      ];

      busRoutes.forEach((route, idx) => {
        const d = k.pathOf(route.map((p) => at(p)));
        parts.push(`
          <path class="glow-active wire bus-wire" filter="url(#iso-soft)" d="${d}" stroke="#e2e8f0" stroke-width="1.0" fill="none" />
          <path class="glow-active pulse go" pathLength="1000" d="${d}" stroke="#ffffff" stroke-width="1.8" fill="none" style="animation-delay:${idx * 0.18}s;" />
        `);
      });
      break;
    }

    case "cooling": {
      // Vapor chamber thermal dissipation envelope
      const vcOutline = [
        [-24, -58, 2.8 + zOffset],
        [8, -58, 2.8 + zOffset],
        [8, -14, 2.8 + zOffset],
        [22, -14, 2.8 + zOffset],
        [22, 28, 2.8 + zOffset],
        [-12, 28, 2.8 + zOffset],
        [-12, -18, 2.8 + zOffset],
        [-24, -18, 2.8 + zOffset],
      ];
      const vcPath = k.pathOf(vcOutline.map((p) => at(p)), true);
      parts.push(`
        <path class="glow-active vc-thermal-glow" filter="url(#iso-glow)" d="${vcPath}" stroke="#ff9a2e" stroke-width="1.4" fill="url(#thermal-grad)" opacity="0.45" />
      `);

      // Sintered copper capillary wick fluid circulation veins
      const capillaryVeins = [
        [[-16, -50, 3.0 + zOffset], [-16, -24, 3.0 + zOffset], [2, -24, 3.0 + zOffset], [2, 18, 3.0 + zOffset]],
        [[-8, -52, 3.0 + zOffset], [-8, -28, 3.0 + zOffset], [12, -28, 3.0 + zOffset], [12, 22, 3.0 + zOffset]],
        [[0, -48, 3.0 + zOffset], [0, -32, 3.0 + zOffset], [16, -32, 3.0 + zOffset], [16, 12, 3.0 + zOffset]],
      ];
      capillaryVeins.forEach((vein, idx) => {
        const d = k.pathOf(vein.map((p) => at(p)));
        parts.push(`
          <path class="glow-active capillary-stream" filter="url(#iso-soft)" d="${d}" stroke="#d97706" stroke-width="1.1" stroke-dasharray="4 2" fill="none" opacity="0.8" />
        `);
      });
      break;
    }

    case "cameras": {
      // Optical lens centers for the quad camera cluster
      const lenses = [
        { name: "wide200", cx: -20, cy: -54, r: 8.4, z: 9.6 + zOffset },
        { name: "uw50", cx: -20, cy: -34, r: 7.2, z: 9.4 + zOffset },
        { name: "tele3x", cx: -20, cy: -16, r: 6.2, z: 9.2 + zOffset },
        { name: "periscope", cx: -6, cy: -36, r: 5.6, z: 8.8 + zOffset },
      ];

      lenses.forEach((lens) => {
        const ringPath = k.ring(lens.cx, lens.cy, lens.r, lens.z, P, 32);
        const innerIris = k.ring(lens.cx, lens.cy, lens.r * 0.55, lens.z, P, 24);
        parts.push(`
          <path class="glow-active lens-aperture" filter="url(#iso-glow)" d="${ringPath}" stroke="#ffffff" stroke-width="1.3" fill="url(#lens-iris)" opacity="0.75" />
          <path class="glow-active lens-center" filter="url(#iso-soft)" d="${innerIris}" stroke="#ffffff" stroke-width="0.8" fill="none" opacity="0.9" />
        `);
      });

      // 90-degree folded periscope prism beam path
      const prismRay = [
        [-6, -36, 8.8 + zOffset],
        [-6, -36, 5.2 + zOffset],
        [-6, -18, 5.2 + zOffset],
      ];
      const prismD = k.pathOf(prismRay.map((p) => at(p)));
      parts.push(`
        <path class="glow-active periscope-optical-ray" filter="url(#iso-glow)" d="${prismD}" stroke="#ffffff" stroke-width="2.0" stroke-linecap="round" fill="none" opacity="0.95" />
      `);
      break;
    }

    case "battery": {
      // Battery cell boundary & BMS power bus lines
      const bPlan = { x: -3.5, y: -26, w: 37, d: 74, r: 2.2 };
      const bOutline = k.planOutline(bPlan, 6.2 + zOffset, P, 6);
      parts.push(`
        <path class="glow-active battery-energy-rim" filter="url(#iso-glow)" d="${bOutline}" stroke="#00ff88" stroke-width="1.3" fill="none" opacity="0.8" />
      `);

      // Power delivery bus rail connecting BMS to mainboard
      const pwrRail = [
        [15, -26, 6.4 + zOffset],
        [15, -34, 6.4 + zOffset],
        [2, -34, 6.4 + zOffset],
        [2, -40, 6.4 + zOffset],
      ];
      const pwrD = k.pathOf(pwrRail.map((p) => at(p)));
      parts.push(`
        <path class="glow-active power-bus-wire" filter="url(#iso-soft)" d="${pwrD}" stroke="#10b981" stroke-width="1.5" fill="none" opacity="0.9" />
        <path class="glow-active pulse go" pathLength="1000" d="${pwrD}" stroke="#a7f3d0" stroke-width="2.0" fill="none" />
      `);
      break;
    }

    case "wireless": {
      // Concentric induction spirals (Qi2 15W resonant transfer)
      const cx = 0, cy = 6, cz = 7.4 + zOffset;
      const radii = [14, 18, 22, 26];
      radii.forEach((r, idx) => {
        const spiral = k.ring(cx, cy, r, cz, P, 36);
        parts.push(`
          <path class="glow-active induction-ring" filter="url(#iso-soft)" d="${spiral}" stroke="#ff9a2e" stroke-width="1.1" stroke-dasharray="${idx % 2 === 0 ? 'none' : '6 3'}" fill="none" opacity="${0.4 + idx * 0.15}" />
        `);
      });
      break;
    }

    case "spen": {
      // Stylus EMR induction coil & tip active field
      // Stylus positioned at x: 30, y: 55 to -45, z: 3.8 + zOffset
      const tipPoint = at([30, -45, 3.8 + zOffset]);
      parts.push(`
        <circle class="glow-active spen-tip-aura" filter="url(#iso-glow)" cx="${tipPoint[0]}" cy="${tipPoint[1]}" r="4.5" fill="#ffb300" opacity="0.9" />
        <circle class="glow-active spen-tip-bloom" filter="url(#iso-bloom)" cx="${tipPoint[0]}" cy="${tipPoint[1]}" r="9.0" fill="#ffb300" opacity="0.4" />
      `);
      break;
    }

    case "display": {
      // 6.9-inch Dynamic AMOLED active matrix frame
      const screenPlan = { x: -PHONE.w / 2 + 1.2, y: -PHONE.d / 2 + 1.2, w: PHONE.w - 2.4, d: PHONE.d - 2.4, r: PHONE.r - 0.8 };
      const screenBorder = k.planOutline(screenPlan, 0.4 + zOffset, P, 8);
      const punchHole = at([0, -PHONE.d / 2 + 6.2, 0.5 + zOffset]);
      parts.push(`
        <path class="glow-active amoled-matrix-active" filter="url(#iso-glow)" d="${screenBorder}" stroke="#ffffff" stroke-width="1.4" fill="none" opacity="0.85" />
        <circle class="glow-active punch-hole-ring" filter="url(#iso-soft)" cx="${punchHole[0]}" cy="${punchHole[1]}" r="2.8" stroke="#ffffff" stroke-width="0.9" fill="none" />
      `);
      break;
    }

    case "midframe": {
      // Grade 5 Titanium perimeter datum & CNC structural contours
      const frameOutline = k.planOutline(PLAN, 2.4 + zOffset, P, 8);
      parts.push(`
        <path class="glow-active chassis-datum" filter="url(#iso-soft)" d="${frameOutline}" stroke="#e2e8f0" stroke-width="1.3" fill="none" opacity="0.7" />
      `);
      break;
    }

    case "rear": {
      // Titanium camera bezel rings & satin housing edge
      const rearBezelPlan = k.planOutline(PLAN, 8.4 + zOffset, P, 8);
      parts.push(`
        <path class="glow-active rear-perimeter-glow" filter="url(#iso-soft)" d="${rearBezelPlan}" stroke="#cbd5e1" stroke-width="1.2" fill="none" opacity="0.6" />
      `);
      break;
    }
  }

  return parts.join("\n");
}
