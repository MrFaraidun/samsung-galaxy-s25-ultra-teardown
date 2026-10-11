/**
 * ==============================================================================
 * SAMSUNG GALAXY S25 ULTRA — REGRESSION VERIFICATION & LINE AUDIT SUITE
 * File: modules/verification.mjs
 * ==============================================================================
 * Comprehensive automated regression verification suite validating:
 * 1. Line Audit: Zero floating line ends on dark and light builds via scripts/lines.mjs
 * 2. Assemblies: All 11 discrete engineering assemblies present in compiled SVG
 * 3. Interactive IDs: Presence of ois-lens-primary, periscope-prism-element,
 *    vapor-chamber-wick, and spen-stylus-body in the DOM/SVG
 * 4. Runtime Modules: Syntax integrity & method definitions for Web Audio synthesis,
 *    Cinematic Camera presets, and Kinetic Action triggers
 * 5. Clean, structured telemetry reporting with exit code 0 on pass
 * ==============================================================================
 */

import { spawn } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");

// Target HTML builds to verify
export const TARGET_BUILDS = [
  "galaxy-s25-ultra.html",
  "galaxy-s25-ultra-light.html",
];

// The 11 physical assemblies required in the teardown model
export const REQUIRED_ASSEMBLIES = [
  "fixture",
  "display",
  "chassis",
  "vapor_chamber",
  "battery",
  "spen",
  "motherboard",
  "sub_board",
  "cameras",
  "wireless_coil",
  "back_glass",
];

// The 4 interactive IDs required for live manipulation and OIS tracking
export const REQUIRED_INTERACTIVE_IDS = [
  "ois-lens-primary",
  "periscope-prism-element",
  "vapor-chamber-wick",
  "spen-stylus-body",
];

// Expected Web Audio procedural synthesis methods
export const REQUIRED_AUDIO_METHODS = [
  "tick",
  "click",
  "spen",
  "glide",
  "haptic",
  "shutter",
  "thermalStart",
  "thermalStop",
];

// Expected camera view presets
export const REQUIRED_CAMERA_PRESETS = [
  "overview",
  "soc",
  "optics",
  "thermal",
  "spen",
];

// Expected kinetic actions on KineticActions controller
export const REQUIRED_KINETIC_ACTIONS = [
  "triggerShutter",
  "triggerBenchmark",
  "toggleSPen",
  "ejectSPen",
  "dockSPen",
];

/**
 * Executes a child process command and buffers stdout / stderr.
 * @param {string} cmd
 * @param {string[]} args
 * @param {string} cwd
 * @param {number} timeoutMs
 * @returns {Promise<{ code: number, stdout: string, stderr: string }>}
 */
function execCommand(cmd, args, cwd = ROOT, timeoutMs = 30000) {
  return new Promise((resolvePromise) => {
    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const child = spawn(cmd, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      resolvePromise({
        code: timedOut ? 124 : (code ?? 1),
        stdout,
        stderr: timedOut ? `${stderr}\nProcess timed out after ${timeoutMs}ms` : stderr,
      });
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      resolvePromise({
        code: 1,
        stdout,
        stderr: `${stderr}\n${err.message}`,
      });
    });
  });
}

/**
 * Validates syntax of a file using Node's syntax checker.
 * @param {string} filePath
 * @returns {Promise<{ passed: boolean, error?: string }>}
 */
export async function verifySyntax(filePath) {
  const fullPath = resolve(ROOT, filePath);
  if (!existsSync(fullPath)) {
    return { passed: false, error: `File not found: ${filePath}` };
  }

  const res = await execCommand(process.execPath, ["--check", fullPath]);
  if (res.code !== 0) {
    return { passed: false, error: res.stderr.trim() || res.stdout.trim() };
  }
  return { passed: true };
}

/**
 * Validates Web Audio synthesizer methods in modules/audio-synth.js
 * @returns {Promise<{ passed: boolean, methodsFound: string[], missing: string[], error?: string }>}
 */
export async function verifyAudioSynth() {
  try {
    const syntaxCheck = await verifySyntax("modules/audio-synth.js");
    if (!syntaxCheck.passed) {
      return { passed: false, methodsFound: [], missing: REQUIRED_AUDIO_METHODS, error: syntaxCheck.error };
    }

    const audioModule = await import(pathToFileURL(join(ROOT, "modules/audio-synth.js")).href);
    const synth = audioModule.AudioSynth || audioModule.default;

    if (!synth) {
      return { passed: false, methodsFound: [], missing: REQUIRED_AUDIO_METHODS, error: "AudioSynth export missing" };
    }

    const methodsFound = REQUIRED_AUDIO_METHODS.filter((m) => typeof synth[m] === "function");
    const missing = REQUIRED_AUDIO_METHODS.filter((m) => typeof synth[m] !== "function");

    return {
      passed: missing.length === 0,
      methodsFound,
      missing,
    };
  } catch (err) {
    return { passed: false, methodsFound: [], missing: REQUIRED_AUDIO_METHODS, error: err.message };
  }
}

/**
 * Validates Cinematic Camera presets in modules/cinematic-camera.js
 * @returns {Promise<{ passed: boolean, presetsFound: string[], missing: string[], error?: string }>}
 */
export async function verifyCinematicCamera() {
  try {
    const syntaxCheck = await verifySyntax("modules/cinematic-camera.js");
    if (!syntaxCheck.passed) {
      return { passed: false, presetsFound: [], missing: REQUIRED_CAMERA_PRESETS, error: syntaxCheck.error };
    }

    const camModule = await import(pathToFileURL(join(ROOT, "modules/cinematic-camera.js")).href);
    const presets = camModule.CAMERA_PRESETS;

    if (!presets || typeof presets !== "object") {
      return { passed: false, presetsFound: [], missing: REQUIRED_CAMERA_PRESETS, error: "CAMERA_PRESETS export missing" };
    }

    const presetsFound = [];
    const missing = [];

    for (const key of REQUIRED_CAMERA_PRESETS) {
      const val = presets[key];
      if (Array.isArray(val) && val.length === 4 && val.every((n) => typeof n === "number")) {
        presetsFound.push(key);
      } else {
        missing.push(key);
      }
    }

    return {
      passed: missing.length === 0,
      presetsFound,
      missing,
    };
  } catch (err) {
    return { passed: false, presetsFound: [], missing: REQUIRED_CAMERA_PRESETS, error: err.message };
  }
}

/**
 * Validates Kinetic Action triggers in modules/kinetic-actions.js
 * @returns {Promise<{ passed: boolean, actionsFound: string[], missing: string[], error?: string }>}
 */
export async function verifyKineticActions() {
  try {
    const syntaxCheck = await verifySyntax("modules/kinetic-actions.js");
    if (!syntaxCheck.passed) {
      return { passed: false, actionsFound: [], missing: REQUIRED_KINETIC_ACTIONS, error: syntaxCheck.error };
    }

    const kineticModule = await import(pathToFileURL(join(ROOT, "modules/kinetic-actions.js")).href);
    const KineticActions = kineticModule.KineticActions || kineticModule.default;

    if (!KineticActions) {
      return { passed: false, actionsFound: [], missing: REQUIRED_KINETIC_ACTIONS, error: "KineticActions export missing" };
    }

    const target = KineticActions.prototype || KineticActions;
    const actionsFound = REQUIRED_KINETIC_ACTIONS.filter(
      (act) => typeof target[act] === "function" || typeof KineticActions[act] === "function"
    );
    const missing = REQUIRED_KINETIC_ACTIONS.filter(
      (act) => typeof target[act] !== "function" && typeof KineticActions[act] !== "function"
    );

    return {
      passed: missing.length === 0,
      actionsFound,
      missing,
    };
  } catch (err) {
    return { passed: false, actionsFound: [], missing: REQUIRED_KINETIC_ACTIONS, error: err.message };
  }
}

/**
 * Verifies compiled SVG content in an HTML build:
 * - Checks for all 11 assemblies (via data-id and assembly-group)
 * - Checks for all 4 interactive IDs
 * @param {string} htmlFileName
 * @returns {{ passed: boolean, assemblies: { found: string[], missing: string[] }, interactiveIds: { found: string[], missing: string[] }, error?: string }}
 */
export function verifyCompiledSvg(htmlFileName) {
  const fullPath = resolve(ROOT, htmlFileName);
  if (!existsSync(fullPath)) {
    return {
      passed: false,
      assemblies: { found: [], missing: REQUIRED_ASSEMBLIES },
      interactiveIds: { found: [], missing: REQUIRED_INTERACTIVE_IDS },
      error: `File not found: ${htmlFileName}`,
    };
  }

  const content = readFileSync(fullPath, "utf8");

  // Check 11 assemblies
  const assembliesFound = [];
  const assembliesMissing = [];
  for (const assem of REQUIRED_ASSEMBLIES) {
    const regex = new RegExp(`data-id=["']${assem}["']`, "i");
    if (regex.test(content)) {
      assembliesFound.push(assem);
    } else {
      assembliesMissing.push(assem);
    }
  }

  // Check 4 interactive IDs
  const idsFound = [];
  const idsMissing = [];
  for (const id of REQUIRED_INTERACTIVE_IDS) {
    const regex = new RegExp(`id=["']${id}["']`, "i");
    if (regex.test(content)) {
      idsFound.push(id);
    } else {
      idsMissing.push(id);
    }
  }

  const passed = assembliesMissing.length === 0 && idsMissing.length === 0;

  return {
    passed,
    assemblies: { found: assembliesFound, missing: assembliesMissing },
    interactiveIds: { found: idsFound, missing: idsMissing },
  };
}

/**
 * Runs node scripts/lines.mjs against an HTML build and verifies 0 floating ends.
 * @param {string} htmlFileName
 * @returns {Promise<{ passed: boolean, floatingEnds: number, totalEnds: number, totalLines: number, rawOutput: string, error?: string }>}
 */
export async function verifyLineAudit(htmlFileName) {
  const fullPath = resolve(ROOT, htmlFileName);
  if (!existsSync(fullPath)) {
    return {
      passed: false,
      floatingEnds: -1,
      totalEnds: 0,
      totalLines: 0,
      rawOutput: "",
      error: `File not found: ${htmlFileName}`,
    };
  }

  const linesScript = resolve(ROOT, "scripts/lines.mjs");
  const res = await execCommand(process.execPath, [linesScript, htmlFileName]);

  const output = `${res.stdout}\n${res.stderr}`.trim();

  // Pattern: "line ends: 0 of 1698 ends on 607 lines float"
  const match = output.match(/line ends:\s*(\d+)\s*of\s*(\d+)\s*ends\s*on\s*(\d+)\s*lines\s*float/i);

  if (!match) {
    return {
      passed: false,
      floatingEnds: -1,
      totalEnds: 0,
      totalLines: 0,
      rawOutput: output,
      error: res.code !== 0 ? `lines.mjs exited with code ${res.code}: ${output}` : `Could not parse line ends output: ${output}`,
    };
  }

  const floatingEnds = Number(match[1]);
  const totalEnds = Number(match[2]);
  const totalLines = Number(match[3]);
  const passed = res.code === 0 && floatingEnds === 0;

  return {
    passed,
    floatingEnds,
    totalEnds,
    totalLines,
    rawOutput: output,
    error: passed ? undefined : `Detected ${floatingEnds} floating line ends (expected 0)`,
  };
}

/**
 * Master execution runner that runs the entire regression verification suite.
 * @param {Object} [options]
 * @param {boolean} [options.skipLineAudit=false]
 * @param {boolean} [options.quiet=false]
 * @returns {Promise<{ success: boolean, results: Object, summary: string }>}
 */
export async function runFullVerification(options = {}) {
  const startTime = Date.now();
  const results = {
    modules: {},
    svg: {},
    lineAudit: {},
  };

  let allPassed = true;

  // 1. Module & Syntax Verifications
  results.modules.audioSynth = await verifyAudioSynth();
  if (!results.modules.audioSynth.passed) allPassed = false;

  results.modules.cinematicCamera = await verifyCinematicCamera();
  if (!results.modules.cinematicCamera.passed) allPassed = false;

  results.modules.kineticActions = await verifyKineticActions();
  if (!results.modules.kineticActions.passed) allPassed = false;

  results.modules.oisGyroSyntax = await verifySyntax("modules/ois-gyro.js");
  if (!results.modules.oisGyroSyntax.passed) allPassed = false;

  results.modules.narrativeSyntax = await verifySyntax("modules/narrative-engine.js");
  if (!results.modules.narrativeSyntax.passed) allPassed = false;

  // 2. Compiled SVG & Interactive ID Verifications across builds
  for (const buildFile of TARGET_BUILDS) {
    const svgRes = verifyCompiledSvg(buildFile);
    results.svg[buildFile] = svgRes;
    if (!svgRes.passed) allPassed = false;
  }

  // 3. Line Audits via scripts/lines.mjs
  if (!options.skipLineAudit) {
    for (const buildFile of TARGET_BUILDS) {
      const lineRes = await verifyLineAudit(buildFile);
      results.lineAudit[buildFile] = lineRes;
      if (!lineRes.passed) allPassed = false;
    }
  }

  const elapsedMs = Date.now() - startTime;

  // Build clean console status summary
  const lines = [];
  lines.push("================================================================================");
  lines.push("        SAMSUNG GALAXY S25 ULTRA — REGRESSION VERIFICATION & LINE AUDIT         ");
  lines.push("================================================================================");
  lines.push(`Status:   ${allPassed ? "✔ ALL REGRESSION CHECKS PASSED (CLEAN)" : "✖ VERIFICATION FAILURES DETECTED"}`);
  lines.push(`Duration: ${elapsedMs} ms`);
  lines.push("--------------------------------------------------------------------------------");
  lines.push("1. RUNTIME MODULES & SYNTAX:");
  lines.push(
    `   [${results.modules.audioSynth.passed ? "PASS" : "FAIL"}] Web Audio Synth:       ${results.modules.audioSynth.methodsFound.length}/${REQUIRED_AUDIO_METHODS.length} methods defined (zero syntax errors)`
  );
  lines.push(
    `   [${results.modules.cinematicCamera.passed ? "PASS" : "FAIL"}] Cinematic Camera:     ${results.modules.cinematicCamera.presetsFound.length}/${REQUIRED_CAMERA_PRESETS.length} presets valid (zero syntax errors)`
  );
  lines.push(
    `   [${results.modules.kineticActions.passed ? "PASS" : "FAIL"}] Kinetic Actions:      ${results.modules.kineticActions.actionsFound.length}/${REQUIRED_KINETIC_ACTIONS.length} actions defined (zero syntax errors)`
  );
  lines.push(
    `   [${results.modules.oisGyroSyntax.passed ? "PASS" : "FAIL"}] OIS Gyro Tracking:    Syntax check OK`
  );
  lines.push(
    `   [${results.modules.narrativeSyntax.passed ? "PASS" : "FAIL"}] Narrative Engine:     Syntax check OK`
  );
  lines.push("--------------------------------------------------------------------------------");
  lines.push("2. COMPILED SVG & ASSEMBLY AUDIT:");
  for (const buildFile of TARGET_BUILDS) {
    const res = results.svg[buildFile];
    lines.push(`   • ${buildFile}:`);
    lines.push(
      `     - Assemblies:      ${res.assemblies.found.length}/${REQUIRED_ASSEMBLIES.length} present [${res.assemblies.missing.length === 0 ? "100% Complete" : "Missing: " + res.assemblies.missing.join(", ")}]`
    );
    lines.push(
      `     - Interactive IDs: ${res.interactiveIds.found.length}/${REQUIRED_INTERACTIVE_IDS.length} present [${res.interactiveIds.found.join(", ")}]`
    );
  }
  lines.push("--------------------------------------------------------------------------------");
  lines.push("3. ISOMETRIC LINE AUDIT (0 FLOATING ENDS TOLERANCE):");
  if (options.skipLineAudit) {
    lines.push("   [SKIPPED] Line audit skipped via --skip-lines flag");
  } else {
    for (const buildFile of TARGET_BUILDS) {
      const res = results.lineAudit[buildFile];
      if (res.passed) {
        lines.push(
          `   [PASS] ${buildFile}: 0 of ${res.totalEnds} ends on ${res.totalLines} lines float (100% rooted/covered)`
        );
      } else {
        lines.push(
          `   [FAIL] ${buildFile}: ${res.floatingEnds} floating line ends detected! Error: ${res.error || res.rawOutput}`
        );
      }
    }
  }
  lines.push("================================================================================");

  const summary = lines.join("\n");

  if (!options.quiet) {
    console.log(summary);
  }

  return {
    success: allPassed,
    results,
    summary,
  };
}

// Direct CLI invocation
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const skipLineAudit = process.argv.includes("--skip-lines");
  const quiet = process.argv.includes("--quiet");

  runFullVerification({ skipLineAudit, quiet })
    .then(({ success }) => {
      process.exit(success ? 0 : 1);
    })
    .catch((err) => {
      console.error("Fatal verification error:", err);
      process.exit(1);
    });
}
