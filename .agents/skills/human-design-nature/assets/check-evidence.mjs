#!/usr/bin/env node
// Checks the evidence register of the human-design-nature skill: every entry has a unique id, a source
// with a link, a known type, strength and "read as" value, and a valid check date; a source that was
// only read second-hand cannot be rated above C; every [E-nn] cited in the skill's other files exists;
// and entries that have not been re-checked for a year are reported.
//
// Usage (Node.js 22+, no dependencies):
//   node check-evidence.mjs [register.md] [--today YYYY-MM-DD] [--max-age-days N] [--strict]
// Default register: ../references/evidence-register.md. The other files checked for citations are
// the skill's SKILL.md and the Markdown files next to the register.
// Exit code 0 when valid (stale entries are warnings unless --strict), 1 on errors, 2 on usage or read errors.

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const TYPES = new Set(["standard", "peer-reviewed", "report", "practitioner", "theory"]);
export const STRENGTHS = new Set(["A", "B", "C"]);
export const READ_AS = new Set(["page", "abstract", "secondary"]);
const COLUMNS = ["ID", "Finding we use", "Source", "Type", "Strength", "Read as", "Checked", "Limits"];
const ID_PATTERN = /^E-\d{2}$/;
const DAY_MS = 86_400_000;

/** Today's calendar date in the user's own time zone, as midnight UTC, so that a date written today is never "in the future". */
const localToday = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
};

/** Entries from the register table: rows whose first cell is an id. Pure. */
export function parseRegister(text) {
  const entries = [];
  for (const [index, line] of text.split("\n").entries()) {
    if (!/^\|\s*E-/.test(line)) continue;
    const cells = line
      .replace(/^\||\|\s*$/g, "")
      .split("|")
      .map((cell) => cell.trim());
    entries.push({ line: index + 1, cells, id: cells[0] });
  }
  return entries;
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? undefined : date;
}

function vocabularyProblems(label, { type, strength, readAs }) {
  const problems = [];
  if (!TYPES.has(type)) problems.push(`${label}: type "${type}" must be one of ${[...TYPES].join(", ")}`);
  if (!STRENGTHS.has(strength)) problems.push(`${label}: strength "${strength}" must be A, B or C`);
  if (!READ_AS.has(readAs)) problems.push(`${label}: read as "${readAs}" must be one of ${[...READ_AS].join(", ")}`);
  if (readAs === "secondary" && strength !== "C")
    problems.push(`${label}: a source read only second-hand cannot be rated above C`);
  return problems;
}

function contentProblems(label, { finding, source, type, limits }) {
  const problems = [];
  if (finding.length < 10) problems.push(`${label}: the finding is empty or too short`);
  if (limits.length < 5) problems.push(`${label}: say what the source cannot tell you`);
  if (!/https?:\/\/\S+/.test(source) && type !== "theory")
    problems.push(`${label}: the source needs a link (only a theory or book may go without)`);
  return problems;
}

function dateProblems(label, checked, today) {
  const date = validDate(checked);
  if (!date) return [`${label}: checked "${checked}" must be a real date, YYYY-MM-DD`];
  return date.getTime() > today.getTime() ? [`${label}: checked date is in the future`] : [];
}

function rowProblems({ line, cells, id }, today) {
  const label = `${id} (line ${line})`;
  if (cells.length !== COLUMNS.length) return [`${label}: expected ${COLUMNS.length} columns, found ${cells.length}`];
  const [, finding, source, type, strength, readAs, checked, limits] = cells;
  const problems = [];
  if (!ID_PATTERN.test(id)) problems.push(`${label}: id must look like E-01`);
  problems.push(...vocabularyProblems(label, { type, strength, readAs }));
  problems.push(...contentProblems(label, { finding, source, type, limits }));
  problems.push(...dateProblems(label, checked, today));
  return problems;
}

/** Problems with the entries themselves. Pure. */
export function entryProblems(entries, today) {
  const problems = entries.flatMap((entry) => rowProblems(entry, today));
  const seen = new Set();
  for (const { id, line } of entries) {
    if (seen.has(id)) problems.push(`${id} (line ${line}): duplicate id`);
    seen.add(id);
  }
  if (entries.length === 0) problems.push("no entries found; the table rows must start with | E-01 |");
  return problems;
}

/** Evidence ids cited as [E-nn] or [E-nn, E-mm, B] in a document. Pure. */
export function citedIds(text) {
  const ids = new Set();
  for (const bracket of text.matchAll(/\[([^\]\n]*\bE-\d{2}\b[^\]\n]*)\]/g)) {
    for (const id of bracket[1].matchAll(/\bE-\d{2}\b/g)) ids.add(id[0]);
  }
  return ids;
}

/** Entries not checked within maxAgeDays. Pure. */
export function staleEntries(entries, today, maxAgeDays) {
  return entries
    .map(({ id, cells }) => ({ id, date: validDate(cells[6] ?? "") }))
    .filter(({ date }) => date && (today.getTime() - date.getTime()) / DAY_MS > maxAgeDays)
    .map(({ id, date }) => ({ id, ageDays: Math.floor((today.getTime() - date.getTime()) / DAY_MS) }));
}

const DEFAULT_REGISTER = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "references",
  "evidence-register.md",
);

const VALUE_FLAGS = {
  "--today": (options, value) => {
    const date = validDate(value);
    if (!date) throw new Error("--today must be a real date, YYYY-MM-DD");
    options.today = date;
  },
  "--max-age-days": (options, value) => {
    options.maxAgeDays = Number(value);
    if (!Number.isInteger(options.maxAgeDays) || options.maxAgeDays < 1)
      throw new Error("--max-age-days must be a positive integer");
  },
};

function parseOptions(argv) {
  const options = { register: DEFAULT_REGISTER, today: localToday(), maxAgeDays: 365, strict: false };
  const rest = [...argv];
  while (rest.length > 0) {
    const argument = rest.shift();
    if (argument === "--strict") {
      options.strict = true;
    } else if (VALUE_FLAGS[argument]) {
      const value = rest.shift();
      if (value === undefined) throw new Error(`${argument} needs a value`);
      VALUE_FLAGS[argument](options, value);
    } else if (argument.startsWith("--")) {
      throw new Error(`unknown option ${argument}`);
    } else {
      options.register = argument;
    }
  }
  return options;
}

async function readIfPresent(file) {
  try {
    return { file, text: await readFile(file, "utf8") };
  } catch {
    return undefined; // The skill file may be missing when a register is checked in isolation.
  }
}

async function loadInputs(options) {
  const text = await readFile(options.register, "utf8");
  const directory = path.dirname(options.register);
  const names = (await readdir(directory)).filter(
    (name) => name.endsWith(".md") && path.join(directory, name) !== options.register,
  );
  const files = [...names.map((name) => path.join(directory, name)), path.join(directory, "..", "SKILL.md")];
  const others = (await Promise.all(files.map(readIfPresent))).filter(Boolean);
  return { text, others };
}

function citationProblems(entries, others) {
  const defined = new Set(entries.map((entry) => entry.id));
  return others.flatMap(({ file, text }) =>
    [...citedIds(text)]
      .filter((id) => !defined.has(id))
      .map((id) => `${path.basename(file)}: cites ${id}, which is not in the register`),
  );
}

async function main(argv) {
  let options;
  let inputs;
  try {
    options = parseOptions(argv);
    inputs = await loadInputs(options);
  } catch (error) {
    console.error(`check-evidence: ${error.message}`);
    return 2;
  }
  const entries = parseRegister(inputs.text);
  const problems = [...entryProblems(entries, options.today), ...citationProblems(entries, inputs.others)];
  const stale = staleEntries(entries, options.today, options.maxAgeDays);
  const level = options.strict ? "error" : "warning";
  for (const message of problems) console.error(`error: ${message}`);
  for (const { id, ageDays } of stale)
    console.error(`${level}: ${id} was last checked ${ageDays} days ago; re-open the source and update the date`);
  if (problems.length > 0 || (options.strict && stale.length > 0)) return 1;
  console.log(`evidence OK: ${entries.length} entries, ${stale.length} stale`);
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).then((code) => process.exit(code));
}
