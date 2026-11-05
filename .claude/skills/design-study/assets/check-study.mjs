#!/usr/bin/env node
// Checks a design study ledger: the record of what was observed in a reference, which technique was imitated
// and how it was modified. It keeps "imitate" honest: a reference that is all rights reserved or of unknown
// status may be imitated as a technique, a structure or a pattern, never as an asset, text or code; borrowed
// assets and text carry their licence and credit; every row says what was changed; observations say whether
// they are a fact or an impression; and a reference that too many rows lean on is reported.
//
// Usage (Node.js 22+, no dependencies):
//   node check-study.mjs <ledger.md>... [--cards study-cards.md] [--brief identity-brief.md]
//                        [--today YYYY-MM-DD] [--max-age-days N] [--strict]
// Exit code 0 when valid (stale rows and heavy reuse are warnings unless --strict), 1 on errors,
// 2 on usage or read errors.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const STATUSES = new Set(["open", "own", "licensed", "restricted", "unknown"]);
export const SCOPES = new Set(["technique", "structure", "pattern", "asset", "text", "code"]);
const BORROWING_SCOPES = new Set(["asset", "text", "code"]);
const COLUMNS = ["ID", "Reference", "Seen", "Status", "Observed", "Imitated", "Modified", "Scope", "Credit", "Used in"];
const DAY_MS = 86_400_000;

/** Today's calendar date in the user's own time zone, as midnight UTC, so that a date written today is never "in the future". */
const localToday = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
};
const REUSE_WARNING_ROWS = 3;
const DEFAULT_CARDS = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "references", "study-cards.md");

const validDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) return undefined;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? undefined : date;
};

/** Rows of the ledger table: those whose first cell is an ST id. Pure. */
export function parseLedger(text) {
  const rows = [];
  for (const [index, line] of text.split("\n").entries()) {
    if (!/^\|\s*ST-/.test(line)) continue;
    const cells = line
      .replace(/^\||\|\s*$/g, "")
      .split("|")
      .map((cell) => cell.trim());
    rows.push({ line: index + 1, cells, id: cells[0] });
  }
  return rows;
}

const isEmpty = (value) => !value || /^(none|n\/a|-|—)$/i.test(value);

function sourceProblems(label, row) {
  const problems = [];
  if (!/https?:\/\/\S+/.test(row.reference) && !/^card:S-\d{2}$/.test(row.reference))
    problems.push(`${label}: Reference needs a link, or card:S-nn for a study card`);
  if (!validDate(row.seen)) problems.push(`${label}: Seen "${row.seen}" must be a real date, YYYY-MM-DD`);
  if (!STATUSES.has(row.status))
    problems.push(`${label}: Status "${row.status}" must be one of ${[...STATUSES].join(", ")}`);
  if (!SCOPES.has(row.scope)) problems.push(`${label}: Scope "${row.scope}" must be one of ${[...SCOPES].join(", ")}`);
  return problems;
}

function studyProblems(label, row) {
  const problems = [];
  if (!/^(fact|impression):\s*\S/i.test(row.observed))
    problems.push(
      `${label}: Observed must start with "Fact:" or "Impression:" so a guess is not read as a measurement`,
    );
  if (isEmpty(row.imitated) || row.imitated.length < 10) problems.push(`${label}: say which technique was imitated`);
  if (isEmpty(row.modified) || row.modified.length < 10)
    problems.push(`${label}: a modification is required; say what was changed to fit this project`);
  else if (row.modified.toLowerCase() === row.imitated.toLowerCase())
    problems.push(`${label}: Modified repeats Imitated; say what is different`);
  if (isEmpty(row.usedIn)) problems.push(`${label}: Used in must name the project`);
  return problems;
}

function licenceProblems(label, row) {
  if (!BORROWING_SCOPES.has(row.scope)) return [];
  if (row.status === "restricted" || row.status === "unknown")
    return [
      `${label}: a ${row.status} reference may be imitated as a technique, structure or pattern, never as ${row.scope}`,
    ];
  if ((row.status === "open" || row.status === "licensed") && isEmpty(row.credit))
    return [`${label}: borrowed ${row.scope} needs the licence name and the credit line in Credit`];
  return [];
}

function toRow(cells) {
  const [id, reference, seen, status, observed, imitated, modified, scope, credit, usedIn] = cells;
  return { id, reference, seen, status, observed, imitated, modified, scope, credit, usedIn };
}

/** Problems with the rows themselves. Pure. */
export function rowProblems(rows) {
  const problems = [];
  const seen = new Set();
  for (const { line, cells, id } of rows) {
    const label = `${id} (line ${line})`;
    if (cells.length !== COLUMNS.length) {
      problems.push(`${label}: expected ${COLUMNS.length} columns, found ${cells.length}`);
      continue;
    }
    const row = toRow(cells);
    if (!/^ST-\d{2}$/.test(id)) problems.push(`${label}: id must look like ST-01`);
    if (seen.has(id)) problems.push(`${label}: duplicate id`);
    seen.add(id);
    problems.push(...sourceProblems(label, row), ...studyProblems(label, row), ...licenceProblems(label, row));
  }
  return problems;
}

/** Ids of cards cited as card:S-nn in rows, and defined in a cards file. Pure. */
export const citedCards = (rows) => rows.map((row) => /card:(S-\d{2})/.exec(row.cells[1] ?? "")?.[1]).filter(Boolean);
export const definedCards = (text) =>
  new Set(text.match(/^#{2,4} (S-\d{2})\b/gm)?.map((line) => /S-\d{2}/.exec(line)[0]) ?? []);

/** References that many rows lean on: [{ reference, count }]. Pure. */
export function heavyReuse(rows, threshold = REUSE_WARNING_ROWS) {
  const counts = new Map();
  for (const row of rows) {
    const key = (row.cells[1] ?? "").toLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts].filter(([, count]) => count >= threshold).map(([reference, count]) => ({ reference, count }));
}

/** Rows seen longer ago than maxAgeDays. Pure. */
export function staleRows(rows, today, maxAgeDays) {
  return rows
    .map(({ id, cells }) => ({ id, date: validDate(cells[2]) }))
    .filter(({ date }) => date && (today.getTime() - date.getTime()) / DAY_MS > maxAgeDays)
    .map(({ id, date }) => ({ id, ageDays: Math.floor((today.getTime() - date.getTime()) / DAY_MS) }));
}

/** Rows in the future. Pure. */
export const futureRows = (rows, today) =>
  rows.filter(({ cells }) => (validDate(cells[2])?.getTime() ?? 0) > today.getTime()).map((row) => row.id);

/** Ledger ids a brief cites, and the project name its front matter gives. Pure. */
export function briefInfo(text) {
  return {
    cited: [...new Set(text.match(/\bST-\d{2}\b/g) ?? [])],
    project: /^project:\s*(.+?)\s*$/m.exec(text)?.[1],
  };
}

const VALUE_FLAGS = {
  "--cards": (options, value) => {
    options.cards = value;
  },
  "--brief": (options, value) => {
    options.brief = value;
  },
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

function applyArgument(options, argument, rest) {
  if (argument === "--strict") {
    options.strict = true;
  } else if (VALUE_FLAGS[argument]) {
    const value = rest.shift();
    if (value === undefined) throw new Error(`${argument} needs a value`);
    VALUE_FLAGS[argument](options, value);
  } else if (argument.startsWith("--")) {
    throw new Error(`unknown option ${argument}`);
  } else {
    options.ledgers.push(argument);
  }
}

function parseOptions(argv) {
  const options = { ledgers: [], cards: DEFAULT_CARDS, today: localToday(), maxAgeDays: 365, strict: false };
  const rest = [...argv];
  while (rest.length > 0) applyArgument(options, rest.shift(), rest);
  if (options.ledgers.length === 0) throw new Error("give at least one ledger file");
  return options;
}

async function load(argv) {
  try {
    const options = parseOptions(argv);
    const ledgers = await Promise.all(
      options.ledgers.map(async (file) => ({ file, rows: parseLedger(await readFile(file, "utf8")) })),
    );
    const cards = definedCards(await readFile(options.cards, "utf8"));
    const brief = options.brief ? briefInfo(await readFile(options.brief, "utf8")) : undefined;
    return { options, ledgers, cards, brief };
  } catch (error) {
    console.error(`check-study: ${error.message}`);
    return undefined;
  }
}

function briefProblems(brief, rows) {
  const ids = new Set(rows.map((row) => row.id));
  const missing = brief.cited
    .filter((id) => !ids.has(id))
    .map((id) => `the brief cites ${id}, which is not in the ledger`);
  const uncited = rows
    .filter(
      (row) =>
        brief.project &&
        (row.cells[9] ?? "").toLowerCase().includes(brief.project.toLowerCase()) &&
        !brief.cited.includes(row.id),
    )
    .map((row) => `${row.id} is used in ${brief.project} but the brief's "Studied references" does not cite it`);
  return [...missing, ...uncited];
}

async function main(argv) {
  const run = await load(argv);
  if (!run) return 2;
  const { options, ledgers, cards, brief } = run;
  const rows = ledgers.flatMap((ledger) => ledger.rows);
  const errors = [...rowProblems(rows)];
  if (rows.length === 0) errors.push("no study rows found; rows must start with | ST-01 |");
  for (const id of citedCards(rows))
    if (!cards.has(id)) errors.push(`${id} is cited as a study card but is not in the cards file`);
  for (const id of futureRows(rows, options.today)) errors.push(`${id}: Seen is in the future`);
  if (brief) errors.push(...briefProblems(brief, rows));
  const warnings = [
    ...staleRows(rows, options.today, options.maxAgeDays).map(
      ({ id, ageDays }) => `${id} was seen ${ageDays} days ago; look again before relying on it`,
    ),
    ...heavyReuse(rows).map(
      ({ reference, count }) => `${count} rows lean on ${reference}; many projects imitating one reference converge`,
    ),
  ];
  for (const message of errors) console.error(`error: ${message}`);
  for (const message of warnings) console.error(`${options.strict ? "error" : "warning"}: ${message}`);
  if (errors.length > 0 || (options.strict && warnings.length > 0)) return 1;
  console.log(`study OK: ${rows.length} row(s), ${warnings.length} warning(s)`);
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).then((code) => process.exit(code));
}
