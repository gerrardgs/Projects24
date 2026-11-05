#!/usr/bin/env node
// Checks the design identity briefs of a set of projects: every brief is complete and uses the shared
// vocabulary, is dated and not overdue for review, and no two projects look alike. "Alike" is measured
// on the choices that make a design recognisable (hue, display font, type style, shape, layout, density,
// energy, imagery, voice, personality). The thresholds are guardrails set by the maintainers, not findings
// from research: change them with --min-distance when the portfolio needs it, and say why.
//
// Usage (Node.js 22+, no dependencies):
//   node check-identity.mjs <brief.md | folder>... [--registry registry.json] [--evidence register.md]
//                           [--today YYYY-MM-DD] [--min-distance 0.40] [--gaps] [--strict]
// A folder is searched for DESIGN-IDENTITY.md and *.identity.md files, one level deep.
// A registry lists the projects that must have a brief: {"projects":[{"name":"...","path":"relative/path.md"}]}.
// Exit code 0 when valid (overdue reviews and missing briefs are warnings unless --strict),
// 1 on errors, 2 on usage or read errors.

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const VOCABULARY = {
  mode: ["persuade", "operate", "read", "experience"],
  neutralTone: ["cool", "neutral", "warm"],
  chroma: ["muted", "balanced", "vivid"],
  typeStyle: ["grotesk", "humanist", "serif-display", "geometric", "rounded", "mono-accent"],
  shape: ["sharp", "soft", "round", "mixed"],
  density: ["compact", "comfortable", "airy"],
  layout: ["grid", "editorial", "dashboard", "stacked", "asymmetric", "sidebar-app"],
  imagery: ["photography", "illustration", "three-d", "type-only", "data", "abstract"],
  voice: ["plain", "warm", "formal", "playful", "technical"],
};
export const PERSONALITY = ["sincerity", "excitement", "competence", "sophistication", "ruggedness"];
const ORDINALS = {
  neutralTone: ["cool", "neutral", "warm"],
  chroma: ["muted", "balanced", "vivid"],
  density: ["compact", "comfortable", "airy"],
};
const REQUIRED_SECTIONS = [
  "Audience and context",
  "Personality and feeling",
  "Signature decisions",
  "Not like",
  "Studied references",
  "Evidence and rationale",
  "Open questions",
  "Change log",
];
// Weights of the distance. They add up to 21.5; the result is divided by the total.
const WEIGHTS = {
  primaryHue: 3,
  accentHue: 1,
  neutralTone: 1,
  chroma: 1,
  displayFont: 3,
  bodyFont: 1,
  typeStyle: 2,
  shape: 1.5,
  density: 1,
  layout: 2,
  energy: 0.5,
  rhythm: 0.5,
  motion: 0.5,
  imagery: 1.5,
  voice: 1,
  personality: 1,
};
const SIGNATURE_AXES = ["hue", "displayFont", "typeStyle", "shape", "layout", "imagery", "voice", "density"];
const HUE_BAND_DEGREES = 40;
const SAME_FONT_SAME_HUE_DEGREES = 30;
const MIN_DIFFERING_SIGNATURE_AXES = 4;
export const DEFAULT_MIN_DISTANCE = 0.4;
const DAY_MS = 86_400_000;

/** Today's calendar date in the user's own time zone, as midnight UTC, so that a date written today is never "in the future". */
const localToday = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
};

const validDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? undefined : date;
};

function parseValue(raw) {
  const value = raw.replace(/\s+#.*$/, "").trim();
  if (value.startsWith("[") && value.endsWith("]"))
    return value
      .slice(1, -1)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  if (/^-?\d+$/.test(value)) return Number(value);
  return value.replace(/^["']|["']$/g, "");
}

/** Splits a brief into its front matter fields and its body. Pure. */
export function parseBrief(text) {
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text.replace(/\r\n/g, "\n"));
  if (!match) return { fields: {}, body: text, hasFrontMatter: false };
  const fields = {};
  for (const line of match[1].split("\n")) {
    const pair = /^([A-Za-z][A-Za-z0-9]*):\s*(.*)$/.exec(line);
    if (pair) fields[pair[1]] = parseValue(pair[2]);
  }
  return { fields, body: match[2], hasFrontMatter: true };
}

function enumProblem(fields, key) {
  return VOCABULARY[key].includes(fields[key])
    ? undefined
    : `${key} "${fields[key] ?? ""}" must be one of ${VOCABULARY[key].join(", ")}`;
}

const inRange = (value, low, high) => Number.isInteger(value) && value >= low && value <= high;
const hasText = (value) => typeof value === "string" && value.length > 0;

function fieldProblems(fields) {
  const problems = [];
  if (!hasText(fields.project)) problems.push("project is required");
  for (const key of Object.keys(VOCABULARY)) {
    const problem = enumProblem(fields, key);
    if (problem) problems.push(problem);
  }
  for (const key of ["primaryHue", "accentHue"]) {
    if (!inRange(fields[key], 0, 359)) problems.push(`${key} must be a whole number from 0 to 359 (OKLCH hue angle)`);
  }
  for (const key of ["energy", "rhythm", "motion"]) {
    if (!inRange(fields[key], 1, 3)) problems.push(`${key} must be 1, 2 or 3`);
  }
  for (const key of ["displayFont", "bodyFont"]) {
    if (!hasText(fields[key])) problems.push(`${key} is required (a licensed font family, rule 13)`);
  }
  return problems;
}

function personalityProblems(personality) {
  const valid =
    Array.isArray(personality) &&
    inRange(personality.length, 1, 3) &&
    personality.every((item) => PERSONALITY.includes(item));
  return valid ? [] : [`personality must list one to three of ${PERSONALITY.join(", ")}`];
}

function reviewProblems(fields, today) {
  const problems = [];
  const updated = validDate(fields.updated);
  if (!updated) problems.push("updated must be a real date, YYYY-MM-DD");
  else if (updated.getTime() > today.getTime()) problems.push("updated is in the future");
  if (!inRange(fields.reviewEveryDays, 30, 730)) problems.push("reviewEveryDays must be a whole number from 30 to 730");
  const reasonMissing = !hasText(fields.shareReason) || fields.shareReason.length < 10;
  if (fields.sharesBrandWith !== undefined && reasonMissing)
    problems.push("sharesBrandWith needs a shareReason of at least a sentence");
  return problems;
}

function bodyProblems(fields, body) {
  const problems = [];
  for (const section of REQUIRED_SECTIONS) {
    if (!new RegExp(`^## ${section}\\s*$`, "m").test(body)) problems.push(`missing section "## ${section}"`);
  }
  if (validDate(fields.updated) && !new RegExp(`^- ${fields.updated}\\b`, "m").test(body))
    problems.push(`the Change log needs a line starting "- ${fields.updated}" for the latest update`);
  if (!/\bE-\d{2}\b/.test(body))
    problems.push(
      "Evidence and rationale must cite at least one evidence id (E-nn) from the human-design-nature register",
    );
  return problems;
}

/** Problems with one brief: fields, vocabulary, sections, dates. Pure. */
export function briefProblems(brief, today) {
  const { fields, body, hasFrontMatter } = brief;
  if (!hasFrontMatter) return ["no front matter; start the file with --- and the identity fields"];
  return [
    ...fieldProblems(fields),
    ...personalityProblems(fields.personality),
    ...reviewProblems(fields, today),
    ...bodyProblems(fields, body),
  ];
}

/** Evidence ids cited anywhere in a body. Pure. */
export function evidenceIds(body) {
  return [...new Set(body.match(/\bE-\d{2}\b/g) ?? [])];
}

const hueDistance = (a, b) => {
  const diff = Math.abs(a - b) % 360;
  return Math.min(diff, 360 - diff);
};
const ordinalDistance = (key, a, b) =>
  Math.abs(ORDINALS[key].indexOf(a) - ORDINALS[key].indexOf(b)) / (ORDINALS[key].length - 1);
const sameText = (a, b) => String(a).trim().toLowerCase() === String(b).trim().toLowerCase();

/** How far apart two briefs are, 0 (identical) to 1, and which signature axes differ. Pure. */
export function compare(a, b) {
  const parts = {
    primaryHue: hueDistance(a.primaryHue, b.primaryHue) / 180,
    accentHue: hueDistance(a.accentHue, b.accentHue) / 180,
    neutralTone: ordinalDistance("neutralTone", a.neutralTone, b.neutralTone),
    chroma: ordinalDistance("chroma", a.chroma, b.chroma),
    displayFont: sameText(a.displayFont, b.displayFont) ? 0 : 1,
    bodyFont: sameText(a.bodyFont, b.bodyFont) ? 0 : 1,
    typeStyle: a.typeStyle === b.typeStyle ? 0 : 1,
    shape: a.shape === b.shape ? 0 : 1,
    density: ordinalDistance("density", a.density, b.density),
    layout: a.layout === b.layout ? 0 : 1,
    energy: Math.abs(a.energy - b.energy) / 2,
    rhythm: Math.abs(a.rhythm - b.rhythm) / 2,
    motion: Math.abs(a.motion - b.motion) / 2,
    imagery: a.imagery === b.imagery ? 0 : 1,
    voice: a.voice === b.voice ? 0 : 1,
  };
  const shared = a.personality.filter((item) => b.personality.includes(item)).length;
  const union = new Set([...a.personality, ...b.personality]).size;
  parts.personality = 1 - shared / union;
  const total = Object.values(WEIGHTS).reduce((sum, weight) => sum + weight, 0);
  const distance = Object.entries(WEIGHTS).reduce((sum, [key, weight]) => sum + weight * parts[key], 0) / total;
  const differing = SIGNATURE_AXES.filter((axis) => {
    if (axis === "hue") return hueDistance(a.primaryHue, b.primaryHue) >= HUE_BAND_DEGREES;
    if (axis === "displayFont") return !sameText(a.displayFont, b.displayFont);
    if (axis === "density") return a.density !== b.density;
    return a[axis] !== b[axis];
  });
  return { distance, differing };
}

/** Problems between two briefs, or none when they are far enough apart or deliberately share a brand. Pure. */
export function pairProblems(a, b, minDistance) {
  const shares = (x, y) => x.sharesBrandWith && sameText(x.sharesBrandWith, y.project);
  if (shares(a, b) || shares(b, a)) return [];
  const { distance, differing } = compare(a, b);
  const label = `${a.project} and ${b.project}`;
  const problems = [];
  if (sameText(a.displayFont, b.displayFont) && hueDistance(a.primaryHue, b.primaryHue) < SAME_FONT_SAME_HUE_DEGREES) {
    problems.push(
      `${label}: the same display font and a primary hue within ${SAME_FONT_SAME_HUE_DEGREES} degrees make them look like one product`,
    );
  }
  if (differing.length < MIN_DIFFERING_SIGNATURE_AXES) {
    problems.push(
      `${label}: only ${differing.length} of ${SIGNATURE_AXES.length} signature axes differ (${differing.join(", ") || "none"}); at least ${MIN_DIFFERING_SIGNATURE_AXES} must`,
    );
  }
  if (distance < minDistance)
    problems.push(`${label}: distance ${distance.toFixed(2)} is below the minimum ${minDistance.toFixed(2)}`);
  return problems;
}

/** Free space to move into: the widest hue gaps and the vocabulary values nobody uses yet. Pure. */
export function gaps(briefs) {
  const hues = [...new Set(briefs.map((brief) => brief.primaryHue))].sort((x, y) => x - y);
  const arcs =
    hues.length === 0
      ? [{ from: 0, to: 360, size: 360, middle: 180 }]
      : hues.map((hue, index) => {
          const next = index + 1 < hues.length ? hues[index + 1] : hues[0] + 360;
          return { from: hue, to: next % 360, size: next - hue, middle: Math.round((hue + (next - hue) / 2) % 360) };
        });
  arcs.sort((x, y) => y.size - x.size);
  const unused = {};
  for (const key of ["typeStyle", "shape", "layout", "imagery", "voice"]) {
    unused[key] = VOCABULARY[key].filter((value) => !briefs.some((brief) => brief[key] === value));
  }
  return { widestHueGaps: arcs.slice(0, 3), unused };
}

/** A brief is overdue when updated plus reviewEveryDays has passed. Pure. */
export function overdue(fields, today) {
  const updated = validDate(fields.updated);
  if (!updated || !Number.isInteger(fields.reviewEveryDays)) return undefined;
  const dueInDays = fields.reviewEveryDays - Math.floor((today.getTime() - updated.getTime()) / DAY_MS);
  return dueInDays < 0 ? -dueInDays : undefined;
}

const SWITCHES = { "--gaps": "gaps", "--strict": "strict" };
const VALUE_FLAGS = {
  "--registry": (options, value) => {
    options.registry = value;
  },
  "--evidence": (options, value) => {
    options.evidence = value;
  },
  "--today": (options, value) => {
    const date = validDate(value);
    if (!date) throw new Error("--today must be a real date, YYYY-MM-DD");
    options.today = date;
  },
  "--min-distance": (options, value) => {
    options.minDistance = Number(value);
    if (!(options.minDistance > 0 && options.minDistance < 1))
      throw new Error("--min-distance must be between 0 and 1");
  },
};

function applyArgument(options, argument, rest) {
  if (SWITCHES[argument]) {
    options[SWITCHES[argument]] = true;
  } else if (VALUE_FLAGS[argument]) {
    const value = rest.shift();
    if (value === undefined) throw new Error(`${argument} needs a value`);
    VALUE_FLAGS[argument](options, value);
  } else if (argument.startsWith("--")) {
    throw new Error(`unknown option ${argument}`);
  } else {
    options.inputs.push(argument);
  }
}

function parseOptions(argv) {
  const options = { inputs: [], today: localToday(), minDistance: DEFAULT_MIN_DISTANCE, gaps: false, strict: false };
  const rest = [...argv];
  while (rest.length > 0) applyArgument(options, rest.shift(), rest);
  if (options.inputs.length === 0 && !options.registry)
    throw new Error("give at least one brief or folder, or --registry");
  return options;
}

async function briefFiles(input) {
  const info = await stat(input);
  if (!info.isDirectory()) return [input];
  const names = (await readdir(input)).filter((name) => name === "DESIGN-IDENTITY.md" || name.endsWith(".identity.md"));
  return names.map((name) => path.join(input, name)).sort();
}

async function readRegistry(registryPath) {
  const registry = JSON.parse(await readFile(registryPath, "utf8"));
  if (!Array.isArray(registry.projects)) throw new Error("the registry needs a projects array");
  return registry.projects.map((entry) => ({
    name: entry.name,
    file: path.resolve(path.dirname(registryPath), entry.path),
  }));
}

async function readBrief(file) {
  try {
    return { file, ...parseBrief(await readFile(file, "utf8")) };
  } catch (error) {
    if (error.code === "ENOENT") return { file, missing: true };
    throw error;
  }
}

async function loadAll(options) {
  const files = (await Promise.all(options.inputs.map(briefFiles))).flat();
  const registered = options.registry ? await readRegistry(options.registry) : [];
  for (const { file } of registered) {
    if (!files.includes(file)) files.push(file);
  }
  const read = await Promise.all(files.map(readBrief));
  return {
    briefs: read.filter((brief) => !brief.missing),
    missing: read.filter((brief) => brief.missing).map((brief) => brief.file),
    registered,
  };
}

async function readRegisterIds(evidencePath) {
  if (!evidencePath) return undefined;
  const text = await readFile(evidencePath, "utf8");
  const rows = text.split("\n").filter((line) => /^\|\s*E-\d{2}\s*\|/.test(line));
  return new Set(rows.map((line) => /E-\d{2}/.exec(line)[0]));
}

function registryProblems(loaded) {
  const errors = [];
  for (const entry of loaded.registered) {
    const brief = loaded.briefs.find((candidate) => candidate.file === entry.file);
    if (brief?.fields.project && !sameText(brief.fields.project, entry.name))
      errors.push(`${entry.file}: the registry calls it "${entry.name}" but the brief says "${brief.fields.project}"`);
  }
  return errors;
}

function oneBriefReport(brief, options, registerIds) {
  const problems = briefProblems(brief, options.today).map((problem) => `${brief.file}: ${problem}`);
  const unknownIds = registerIds ? evidenceIds(brief.body).filter((id) => !registerIds.has(id)) : [];
  const errors = [
    ...problems,
    ...unknownIds.map((id) => `${brief.file}: cites ${id}, which is not in the evidence register`),
  ];
  const days = overdue(brief.fields, options.today);
  const warnings =
    days === undefined
      ? []
      : [
          `${brief.file}: review was due ${days} days ago; re-check the audience, the evidence and the choices, then add a Change log line`,
        ];
  return { errors, warnings, valid: problems.length === 0 };
}

function portfolioProblems(valid, minDistance) {
  const errors = [];
  const names = new Set();
  for (const fields of valid) {
    const key = fields.project.toLowerCase();
    if (names.has(key)) errors.push(`two briefs are named "${fields.project}"`);
    names.add(key);
  }
  let closest = 1;
  for (let i = 0; i < valid.length; i += 1) {
    for (let j = i + 1; j < valid.length; j += 1) {
      errors.push(...pairProblems(valid[i], valid[j], minDistance));
      closest = Math.min(closest, compare(valid[i], valid[j]).distance);
    }
  }
  return { errors, closest };
}

async function load(argv) {
  try {
    const options = parseOptions(argv);
    return { options, loaded: await loadAll(options), registerIds: await readRegisterIds(options.evidence) };
  } catch (error) {
    console.error(`check-identity: ${error.message}`);
    return undefined;
  }
}

async function main(argv) {
  const run = await load(argv);
  if (!run) return 2;
  const { options, loaded, registerIds } = run;
  const errors = registryProblems(loaded);
  const warnings = loaded.missing.map((file) => `${file}: registered but there is no identity brief yet`);
  const valid = [];
  for (const brief of loaded.briefs) {
    const report = oneBriefReport(brief, options, registerIds);
    errors.push(...report.errors);
    warnings.push(...report.warnings);
    if (report.valid) valid.push(brief.fields);
  }
  const portfolio = portfolioProblems(valid, options.minDistance);
  errors.push(...portfolio.errors);
  for (const message of errors) console.error(`error: ${message}`);
  for (const message of warnings) console.error(`${options.strict ? "error" : "warning"}: ${message}`);
  if (errors.length > 0 || (options.strict && warnings.length > 0)) return 1;
  const closest = valid.length > 1 ? `, closest pair distance ${portfolio.closest.toFixed(2)}` : "";
  console.log(`identity OK: ${valid.length} project(s)${closest}`);
  if (options.gaps) console.log(JSON.stringify(gaps(valid), null, 2));
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).then((code) => process.exit(code));
}
