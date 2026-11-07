#!/usr/bin/env node
// Offline guard for README install instructions: version consistency (R1),
// updatable npm install form (R2), and fixed-tag warning coverage (R3).
// Pure Node ESM, built-in modules only, no network access, no temp files.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PKG_VERSION = JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8")).version;

const TARGETS = [
  { file: "README.md", warnRe: /never reports an update|no update prompts/, option1: /Option 1/ },
  { file: "README.zh.md", warnRe: /收不到更新|不提示更新|不会提示更新/, option1: /方式一/ },
];

const PIN_MARKER = "github:bloodarea/dsh-agent-team-presets#v";
const EXACT_SPEC = "dsh plugin --profile <profile> add dsh-agent-team-presets";
const RELEASE_MARKER = "<!-- release-version";
const WINDOW = 3;

const headingLevel = (line) => {
  const m = line.match(/^(#{1,6})\s/);
  return m ? m[1].length : null;
};
const exactVersionRe = /@[0-9]+\.[0-9]+\.[0-9]+/; // pinned exact version in a spec
const caretVersionRe = /@[\^~][0-9]+\.[0-9]+\.[0-9]+/; // caret/tilde range is fine

const results = [];
let failed = false;

function report(file, rule, line, ok, expected, actual) {
  results.push({ file, rule, line, ok });
  if (!ok) failed = true;
  console.log(
    `${ok ? "OK" : "FAIL"} [${rule}] ${file}:${line}` +
      (ok ? "" : ` — expected: ${expected}; actual: ${actual}`)
  );
}

// Section spanning a line: from the nearest heading above it (inclusive) to
// before the next heading of the same or higher level (or end of file).
function sectionRange(lines, idx) {
  let start = 0;
  let level = 1;
  for (let i = idx - 1; i >= 0; i--) {
    const lvl = headingLevel(lines[i]);
    if (lvl !== null) {
      start = i;
      level = lvl;
      break;
    }
  }
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    const lvl = headingLevel(lines[i]);
    if (lvl !== null && lvl <= level) {
      end = i;
      break;
    }
  }
  return { start, end, level };
}

for (const { file, warnRe, option1 } of TARGETS) {
  const filePath = path.join(ROOT, file);
  let text;
  try {
    text = readFileSync(filePath, "utf8");
  } catch (err) {
    report(file, "read", 0, false, `readable file ${file}`, String(err));
    continue;
  }
  const lines = text.split("\n");

  // R1 — version consistency
  const versionHits = [];
  lines.forEach((line, i) => {
    if (line.includes(PKG_VERSION)) versionHits.push(i + 1);
  });
  report(
    file,
    "R1",
    versionHits.length ? versionHits[0] : 0,
    versionHits.length > 0,
    `package.json version ${PKG_VERSION} present at least once`,
    versionHits.length ? `found on lines ${versionHits.join(", ")}` : "version string not found"
  );

  const markerIdx = lines.findIndex((line) => line.includes(RELEASE_MARKER));
  if (markerIdx >= 0) {
    console.log(`INFO [R1] ${file}:${markerIdx + 1} release-version marker present (reference only)`);
  }

  // R2 — updatable install form
  const specHits = [];
  lines.forEach((line, i) => {
    if (line.trim() === EXACT_SPEC) specHits.push(i + 1);
  });
  report(
    file,
    "R2",
    specHits.length ? specHits[0] : 0,
    specHits.length > 0,
    `a line equal to \`${EXACT_SPEC}\` (no \`#\`, no exact version)`,
    specHits.length ? `found on lines ${specHits.join(", ")}` : "no un-pinned npm install spec line found"
  );

  // R2b — the Option 1 / 方式一 paste block must not pin an exact version
  const optHeading = lines.findIndex(
    (line, i) => headingLevel(line) !== null && option1.test(line)
  );
  if (optHeading < 0) {
    report(file, "R2", 0, false, "an `Option 1`/`方式一` heading", "heading not found");
  } else {
    const section = sectionRange(lines, optHeading);
    let fenceStart = -1;
    for (let i = optHeading + 1; i < section.end; i++) {
      if (lines[i].trim() === "```text") {
        fenceStart = i;
        break;
      }
    }
    if (fenceStart < 0) {
      report(
        file,
        "R2",
        optHeading + 1,
        false,
        "a ```text paste block in the Option 1 / 方式一 section",
        "no ```text fence found in that section"
      );
    } else {
      let fenceEnd = -1;
      for (let i = fenceStart + 1; i < section.end; i++) {
        if (lines[i].trim() === "```") {
          fenceEnd = i;
          break;
        }
      }
      if (fenceEnd < 0) {
        report(file, "R2", fenceStart + 1, false, "closing ``` fence", "unclosed ```text block");
      } else {
        const badLines = [];
        for (let i = fenceStart + 1; i < fenceEnd; i++) {
          if (lines[i].trim() && exactVersionRe.test(lines[i]) && !caretVersionRe.test(lines[i])) {
            badLines.push(i + 1);
          }
        }
        report(
          file,
          "R2",
          badLines.length ? badLines[0] : fenceStart + 1,
          badLines.length === 0,
          "paste block lines use a bare package name or caret range (no exact `@x.y.z`)",
          badLines.length
            ? `exact version pinned in the paste block on lines ${badLines.join(", ")}`
            : "no exact version pin in the paste block"
        );
      }
    }
  }

  // R3 — every pinned GitHub spec carries an update warning nearby
  const pinLines = [];
  lines.forEach((line, i) => {
    if (line.includes(PIN_MARKER)) pinLines.push(i + 1);
  });
  for (const n of pinLines) {
    const idx = n - 1;
    const section = sectionRange(lines, idx);
    let hit = null;
    for (let i = section.start; i < section.end && hit === null; i++) {
      if (headingLevel(lines[i]) === null && warnRe.test(lines[i])) hit = i + 1;
    }
    const from = Math.max(1, n - WINDOW);
    const to = Math.min(lines.length, n + WINDOW);
    for (let i = from - 1; i < to && hit === null; i++) {
      if (headingLevel(lines[i]) === null && warnRe.test(lines[i])) hit = i + 1;
    }
    report(
      file,
      "R3",
      n,
      hit !== null,
      `warning text matching ${warnRe} in the pin's section (lines ${section.start + 1}-${section.end}) or ±${WINDOW} lines`,
      hit !== null ? `warning found on line ${hit}` : "no update warning near the pinned spec"
    );
  }
}

if (failed) {
  console.log(`FAIL ${results.filter((r) => !r.ok).length} check(s) failed`);
  process.exit(1);
}
console.log(`OK all ${results.length} check(s) passed (version ${PKG_VERSION})`);
