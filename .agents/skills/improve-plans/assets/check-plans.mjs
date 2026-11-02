#!/usr/bin/env node
// Checks a folder of implementation plans (plans/NNN-slug.md plus plans/README.md) before they are handed to
// an executor: every plan is self-contained in form, has a verification command per step and machine-checkable
// done criteria, the index and the plans agree, dependencies exist and have no cycle, and no secret value
// is written into a plan. Optional: report plans whose in-scope files changed since they were written
// (--drift), and turn the plans into a story file for the story loop (--to-stories).
// The plan format follows the structure of shadcn/improve (MIT) but is checked here by this script alone.
//
// Usage (Node.js 22+, no dependencies):
//   node check-plans.mjs [plans-dir]                         validate and print a one-line summary
//   node check-plans.mjs [plans-dir] --drift                 also compare in-scope files with the recorded commit
//   node check-plans.mjs [plans-dir] --to-stories --project <name> --branch <branch> --verify <command>
//                                                            print a stories file (JSON) for open plans
// Exit code 0 when valid, 1 when there are problems or drift, 2 on usage or read errors.

import { execFileSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const STATUSES = ["TODO", "IN PROGRESS", "DONE", "BLOCKED", "REJECTED"];
const REQUIRED_SECTIONS = [
  "Status",
  "Why this matters",
  "Current state",
  "Scope",
  "Steps",
  "Test plan",
  "Done criteria",
  "STOP conditions",
  "Maintenance notes",
];
const PLAN_FILE = /^(\d{3})-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;
const MAX_CRITERIA_PER_STORY = 8;

// Shapes of common credentials. Only the kind and the location are ever reported, never the value.
const SECRET_PATTERNS = [
  ["cloud access key id", /\bAKIA[0-9A-Z]{16}\b/],
  ["private key block", /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ["GitHub token", /\bgh[pousr]_[A-Za-z0-9]{36,}\b/],
  ["Slack token", /\bxox[abprs]-[A-Za-z0-9-]{10,}/],
  ["API key with sk- prefix", /\bsk-[A-Za-z0-9_-]{20,}/],
  ["assigned credential", /\b(?:password|passwd|secret|token|api[_-]?key)\b\s*[:=]\s*["'][^"'\s]{12,}["']/i],
];

/** Splits Markdown into its level-2 sections, keyed by heading text. Pure. */
export function sections(text) {
  const result = new Map();
  let current = null;
  for (const line of text.split("\n")) {
    const heading = /^## (.+?)\s*$/.exec(line);
    if (heading) {
      current = heading[1];
      result.set(current, []);
    } else if (current) {
      result.get(current).push(line);
    }
  }
  return new Map([...result].map(([name, lines]) => [name, lines.join("\n")]));
}

function statusFields(block) {
  const fields = {};
  for (const line of block.split("\n")) {
    const match = /^- \*\*([^*]+)\*\*:\s*(.*)$/.exec(line);
    if (match) fields[match[1].trim()] = match[2].trim();
  }
  return fields;
}

function parseDependsOn(value) {
  if (!value || /^(none|—|-)$/i.test(value)) return [];
  return [...value.matchAll(/\b(\d{3})\b/g)].map((match) => match[1]);
}

function inScopePaths(scope) {
  const part = scope.split(/\*\*Out of scope\*\*/i)[0];
  const paths = [];
  for (const line of part.split("\n")) {
    const match = /^\s*[-*]\s+`([^`]+)`/.exec(line);
    if (match) paths.push(match[1]);
  }
  return paths;
}

function stepProblems(steps) {
  const problems = [];
  const blocks = steps.split(/^### /m).slice(1);
  if (blocks.length === 0) return ['Steps needs at least one "### Step N: <title>" block'];
  for (const block of blocks) {
    const title = block.split("\n")[0].trim();
    if (!/^Step \d+:/.test(title)) problems.push(`step heading "${title}" must read "Step N: <title>"`);
    if (!/\*\*Verify\*\*:\s*\S/.test(block))
      problems.push(`${title || "a step"}: add a "**Verify**: <command> → <expected result>" line`);
  }
  return problems;
}

/** Credential-shaped text in a document: [{ kind, line }]. Values are never returned. Pure. */
export function findSecrets(text) {
  const found = [];
  text.split("\n").forEach((line, index) => {
    for (const [kind, pattern] of SECRET_PATTERNS) {
      if (pattern.test(line)) found.push({ kind, line: index + 1 });
    }
  });
  return found;
}

function nameProblems(text, fileName) {
  const problems = [];
  const fileNumber = PLAN_FILE.exec(fileName)?.[1];
  if (!fileNumber) problems.push("file name must look like NNN-short-slug.md (three digits, lowercase words)");
  const title = /^# Plan (\d{3}): (.+)$/m.exec(text);
  if (!title) problems.push('first heading must read "# Plan NNN: <imperative title>"');
  else if (fileNumber && title[1] !== fileNumber)
    problems.push(`heading number ${title[1]} does not match file number ${fileNumber}`);
  return { fileNumber, title, problems };
}

function statusProblems(fields) {
  const problems = [];
  if (!/^P[123]$/.test(fields.Priority ?? "")) problems.push("Status: Priority must be P1, P2 or P3");
  if (!/^[SML]$/.test(fields.Effort ?? "")) problems.push("Status: Effort must be S, M or L");
  if (!/^(LOW|MED|HIGH)$/.test(fields.Risk ?? "")) problems.push("Status: Risk must be LOW, MED or HIGH");
  if (!fields["Depends on"]) problems.push('Status: "Depends on" must list plan numbers or say none');
  if (!fields.Category) problems.push("Status: Category is required");
  return problems;
}

function scopeProblems(scope, paths) {
  const problems = [];
  if (paths.length === 0)
    problems.push("Scope: list the in-scope files as bullets that start with a path in backticks");
  if (!/\*\*Out of scope\*\*/i.test(scope)) problems.push("Scope: add an **Out of scope** list");
  return problems;
}

function bodyProblems(parts, criteria) {
  const problems = [];
  if (parts.has("Steps")) problems.push(...stepProblems(parts.get("Steps")));
  if (parts.has("Done criteria") && criteria.length === 0)
    problems.push('Done criteria needs at least one "- [ ] <command and expected result>" item');
  if (parts.has("STOP conditions") && !/^- \S/m.test(parts.get("STOP conditions")))
    problems.push("STOP conditions needs at least one bullet");
  return problems;
}

/** Parses one plan file. Returns its fields and a list of problems. Pure. */
export function parsePlan(text, fileName) {
  const { fileNumber, title, problems } = nameProblems(text, fileName);
  const parts = sections(text);
  for (const name of REQUIRED_SECTIONS) {
    if (!parts.has(name)) problems.push(`missing section "## ${name}"`);
  }
  const fields = statusFields(parts.get("Status") ?? "");
  problems.push(...statusProblems(fields));
  const plannedAt = /`([0-9a-f]{7,40})`/.exec(fields["Planned at"] ?? "");
  if (!plannedAt)
    problems.push('Status: "Planned at" must name the commit in backticks, for example commit `abc1234`, 2026-11-02');

  const scope = parts.get("Scope") ?? "";
  const paths = inScopePaths(scope);
  problems.push(...scopeProblems(scope, paths));
  const criteria = (parts.get("Done criteria") ?? "").split("\n").filter((line) => /^- \[[ xX]\] \S/.test(line));
  problems.push(...bodyProblems(parts, criteria));
  for (const secret of findSecrets(text))
    problems.push(
      `line ${secret.line}: looks like a ${secret.kind}; plans name the location and kind only, never the value`,
    );

  return {
    number: fileNumber ?? null,
    title: title?.[2] ?? null,
    priority: fields.Priority ?? null,
    dependsOn: parseDependsOn(fields["Depends on"]),
    plannedAt: plannedAt?.[1] ?? null,
    paths,
    criteria: criteria.map((line) => line.replace(/^- \[[ xX]\]\s+/, "")),
    why: (parts.get("Why this matters") ?? "").trim(),
    problems,
  };
}

/** Rows of the index table: [{ number, status, dependsOn }]. Pure. */
export function parseIndex(text) {
  const rows = [];
  for (const line of text.split("\n")) {
    const cells = line.split("|").map((cell) => cell.trim());
    if (cells.length < 8 || !/^\d{3}$/.test(cells[1])) continue;
    rows.push({
      number: cells[1],
      status: cells[cells.length - 2],
      dependsOn: parseDependsOn(cells[cells.length - 3]),
    });
  }
  return rows;
}

/** First dependency cycle as a list of plan numbers, or undefined. Pure. */
export function findCycle(graph) {
  const state = new Map();
  const visit = (node, trail) => {
    if (state.get(node) === "done") return undefined;
    if (state.get(node) === "active") return [...trail.slice(trail.indexOf(node)), node];
    state.set(node, "active");
    for (const next of graph.get(node) ?? []) {
      const cycle = visit(next, [...trail, node]);
      if (cycle) return cycle;
    }
    state.set(node, "done");
    return undefined;
  };
  for (const node of graph.keys()) {
    const cycle = visit(node, []);
    if (cycle) return cycle;
  }
  return undefined;
}

function indexRowProblem(plan, row) {
  if (!row) return `README.md: no row for plan ${plan.number}`;
  if (!STATUSES.includes(row.status))
    return `README.md: plan ${plan.number} has status "${row.status}"; use ${STATUSES.join(", ")}`;
  if ([...row.dependsOn].sort().join() !== [...plan.dependsOn].sort().join())
    return `README.md: plan ${plan.number} lists different dependencies than the plan itself`;
  return undefined;
}

/** Problems that only show across the whole set: index agreement, dependencies, duplicates. Pure. */
export function setProblems(plans, indexRows) {
  const problems = [];
  const numbers = new Set(plans.map((plan) => plan.number));
  const rowByNumber = new Map(indexRows.map((row) => [row.number, row]));
  if (rowByNumber.size !== indexRows.length) problems.push("README.md: a plan number appears in more than one row");
  for (const plan of plans) {
    const problem = indexRowProblem(plan, rowByNumber.get(plan.number));
    if (problem) problems.push(problem);
    for (const dependency of plan.dependsOn.filter((candidate) => !numbers.has(candidate)))
      problems.push(`plan ${plan.number}: depends on ${dependency}, which does not exist`);
  }
  for (const row of indexRows) {
    if (!numbers.has(row.number)) problems.push(`README.md: row ${row.number} has no plan file`);
  }
  const cycle = findCycle(new Map(plans.map((plan) => [plan.number, plan.dependsOn])));
  if (cycle) problems.push(`dependency cycle: ${cycle.join(" → ")}`);
  return problems;
}

/** Stories for the story loop from the plans that are still open, in dependency-friendly order. Pure. */
export function toStories(plans, indexRows, options) {
  const open = new Set(
    indexRows.filter((row) => row.status === "TODO" || row.status === "IN PROGRESS").map((row) => row.number),
  );
  const ordered = plans
    .filter((plan) => open.has(plan.number))
    .sort((a, b) => a.priority.localeCompare(b.priority) || a.number.localeCompare(b.number));
  return {
    project: options.project,
    branchName: options.branch,
    description: `Open implementation plans from ${plans.length} written.`,
    verifyCommand: options.verify,
    userStories: ordered.map((plan, index) => ({
      id: `US-${plan.number}`,
      title: plan.title,
      description: plan.why.split("\n").join(" ").slice(0, 400),
      acceptanceCriteria: plan.criteria.slice(0, MAX_CRITERIA_PER_STORY),
      priority: index + 1,
      passes: false,
      notes: `Source: plans/${plan.number}-*.md`,
      ...(plan.dependsOn.some((dependency) => open.has(dependency))
        ? {
            dependsOn: plan.dependsOn
              .filter((dependency) => open.has(dependency))
              .map((dependency) => `US-${dependency}`),
          }
        : {}),
    })),
  };
}

/** In-scope files that changed since the plan's commit. Throws when git cannot answer. */
export function changedSince(directory, plan) {
  if (!plan.plannedAt || plan.paths.length === 0) return [];
  const git = (cwd, ...args) => execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const root = git(directory, "rev-parse", "--show-toplevel").trim();
  const output = git(root, "diff", "--name-only", `${plan.plannedAt}..HEAD`, "--", ...plan.paths);
  return output.split("\n").filter(Boolean);
}

const SWITCHES = { "--drift": "drift", "--to-stories": "toStories" };
const VALUE_FLAGS = { "--project": "project", "--branch": "branch", "--verify": "verify" };

function applyArgument(options, argument, rest) {
  if (SWITCHES[argument]) {
    options[SWITCHES[argument]] = true;
  } else if (VALUE_FLAGS[argument]) {
    const value = rest.shift();
    if (value === undefined) throw new Error(`${argument} needs a value`);
    options[VALUE_FLAGS[argument]] = value;
  } else if (argument.startsWith("--")) {
    throw new Error(`unknown option ${argument}`);
  } else {
    options.directory = argument;
  }
}

function parseOptions(argv) {
  const options = { directory: "plans", drift: false, toStories: false };
  const rest = [...argv];
  while (rest.length > 0) applyArgument(options, rest.shift(), rest);
  if (options.toStories && !(options.project && options.branch && options.verify))
    throw new Error("--to-stories needs --project, --branch and --verify");
  return options;
}

async function loadPlans(directory) {
  const names = (await readdir(directory)).filter((name) => /^\d{3}-.*\.md$/.test(name)).sort();
  const plans = [];
  for (const name of names) {
    const parsed = parsePlan(await readFile(path.join(directory, name), "utf8"), name);
    plans.push({ ...parsed, file: name });
  }
  const index = await readFile(path.join(directory, "README.md"), "utf8");
  return { plans, indexRows: parseIndex(index) };
}

function driftReport(directory, plans, indexRows) {
  const open = new Set(
    indexRows.filter((row) => row.status === "TODO" || row.status === "IN PROGRESS").map((row) => row.number),
  );
  const lines = [];
  for (const plan of plans.filter((candidate) => open.has(candidate.number))) {
    try {
      const changed = changedSince(directory, plan);
      if (changed.length > 0)
        lines.push(
          `plan ${plan.number}: ${changed.length} in-scope file(s) changed since ${plan.plannedAt}: ${changed.slice(0, 5).join(", ")}`,
        );
    } catch {
      lines.push(`plan ${plan.number}: cannot compare with commit ${plan.plannedAt} (unknown to this repository?)`);
    }
  }
  return lines;
}

function collectProblems(plans, indexRows) {
  return [
    ...(plans.length === 0 ? ["no plan files found"] : []),
    ...plans.flatMap((plan) => plan.problems.map((problem) => `plan ${plan.number ?? plan.file}: ${problem}`)),
    ...setProblems(
      plans.filter((plan) => plan.number),
      indexRows,
    ),
  ];
}

function summaryLine(plans, indexRows, drift, options) {
  const todo = indexRows.filter((row) => row.status === "TODO").length;
  return `plans OK: ${plans.length} plan(s), ${todo} to do${options.drift ? `, ${drift.length} drifted` : ""}`;
}

async function load(argv) {
  try {
    const options = parseOptions(argv);
    return { options, ...(await loadPlans(options.directory)) };
  } catch (error) {
    console.error(`check-plans: ${error.message}`);
    return undefined;
  }
}

async function main(argv) {
  const run = await load(argv);
  if (!run) return 2;
  const { options, plans, indexRows } = run;
  const problems = collectProblems(plans, indexRows);
  const drift = options.drift ? driftReport(options.directory, plans, indexRows) : [];
  for (const line of [...problems, ...drift]) console.error(line);
  if (problems.length > 0) return 1;
  console.log(
    options.toStories
      ? JSON.stringify(toStories(plans, indexRows, options), null, 2)
      : summaryLine(plans, indexRows, drift, options),
  );
  return drift.length > 0 ? 1 : 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).then((code) => process.exit(code));
}
