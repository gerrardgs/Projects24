// Run with: node --test

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { citedIds, entryProblems, parseRegister, staleEntries } from "./check-evidence.mjs";

const SCRIPT = path.join(path.dirname(fileURLToPath(import.meta.url)), "check-evidence.mjs");
const TODAY = new Date("2026-11-02T00:00:00Z");

const row = (overrides = {}) => {
  const cells = {
    id: "E-01",
    finding: "People group nearby elements together",
    source: "Wagemans et al. 2012, [PubMed](https://pubmed.ncbi.nlm.nih.gov/22845751/)",
    type: "peer-reviewed",
    strength: "A",
    readAs: "abstract",
    checked: "2026-11-02",
    limits: "A review, not a screen study",
    ...overrides,
  };
  return `| ${Object.values(cells).join(" | ")} |`;
};
const register = (rows) =>
  `# Register\n\n| ID | Finding we use | Source | Type | Strength | Read as | Checked | Limits |\n| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n${rows.join("\n")}\n`;
const problemsFor = (rows) => entryProblems(parseRegister(register(rows)), TODAY);

test("a well-formed entry has no problems", () => {
  assert.deepEqual(problemsFor([row()]), []);
});

test("header and separator rows are not entries", () => {
  assert.equal(parseRegister(register([row(), row({ id: "E-02" })])).length, 2);
});

test("duplicate ids, bad id format and wrong column count are reported", () => {
  assert.ok(problemsFor([row(), row()]).some((problem) => problem.includes("duplicate id")));
  assert.ok(problemsFor([row({ id: "E-1" })]).some((problem) => problem.includes("id must look like")));
  assert.ok(problemsFor(["| E-03 | only two cells |"]).some((problem) => problem.includes("expected 8 columns")));
});

test("type, strength and read-as values are restricted", () => {
  const problems = problemsFor([row({ type: "blog", strength: "S", readAs: "skimmed" })]);
  assert.ok(problems.some((problem) => problem.includes('type "blog"')));
  assert.ok(problems.some((problem) => problem.includes('strength "S"')));
  assert.ok(problems.some((problem) => problem.includes('read as "skimmed"')));
});

test("a source needs a link unless it is a theory or book", () => {
  assert.ok(problemsFor([row({ source: "Norman 2004" })]).some((problem) => problem.includes("needs a link")));
  assert.deepEqual(problemsFor([row({ source: "Norman 2004, a book", type: "theory", strength: "C" })]), []);
});

test("a source read only second-hand cannot be rated above C", () => {
  assert.ok(problemsFor([row({ readAs: "secondary", strength: "B" })]).some((problem) => problem.includes("above C")));
  assert.deepEqual(problemsFor([row({ readAs: "secondary", strength: "C" })]), []);
});

test("dates must be real and not in the future", () => {
  assert.ok(problemsFor([row({ checked: "2026-02-30" })]).some((problem) => problem.includes("real date")));
  assert.ok(problemsFor([row({ checked: "2027-01-01" })]).some((problem) => problem.includes("future")));
  assert.ok(problemsFor([row({ checked: "yesterday" })]).some((problem) => problem.includes("real date")));
});

test("an empty register is a problem", () => {
  assert.ok(problemsFor([]).some((problem) => problem.includes("no entries")));
});

test("citedIds finds ids inside brackets, also with strength letters, and ignores plain text", () => {
  const ids = citedIds("See [E-03, B] and [E-04, E-05, B]. Plain E-09 without brackets. [link text E-07](x)");
  assert.deepEqual([...ids].sort(), ["E-03", "E-04", "E-05", "E-07"]);
});

test("staleEntries lists entries older than the limit", () => {
  const entries = parseRegister(register([row({ checked: "2025-01-01" }), row({ id: "E-02", checked: "2026-10-01" })]));
  const stale = staleEntries(entries, TODAY, 365);
  assert.deepEqual(
    stale.map((entry) => entry.id),
    ["E-01"],
  );
  assert.equal(stale[0].ageDays, 670);
});

function withFolder(run) {
  const folder = mkdtempSync(path.join(tmpdir(), "check-evidence-"));
  try {
    mkdirSync(path.join(folder, "references"));
    return run(folder);
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
}
const cli = (args) => spawnSync(process.execPath, [SCRIPT, ...args], { encoding: "utf8" });

test("the command line passes a good register and fails a citation that has no entry", () => {
  withFolder((folder) => {
    const file = path.join(folder, "references", "evidence-register.md");
    writeFileSync(file, register([row()]));
    writeFileSync(path.join(folder, "references", "notes.md"), "Cited [E-01, A].\n");
    const ok = cli([file, "--today", "2026-11-02"]);
    assert.equal(ok.status, 0);
    assert.match(ok.stdout, /evidence OK: 1 entries, 0 stale/);
    writeFileSync(path.join(folder, "references", "notes.md"), "Cited [E-77, B].\n");
    const bad = cli([file, "--today", "2026-11-02"]);
    assert.equal(bad.status, 1);
    assert.match(bad.stderr, /cites E-77, which is not in the register/);
  });
});

test("stale entries are a warning, and an error with --strict", () => {
  withFolder((folder) => {
    const file = path.join(folder, "references", "evidence-register.md");
    writeFileSync(file, register([row({ checked: "2025-01-01" })]));
    const warning = cli([file, "--today", "2026-11-02"]);
    assert.equal(warning.status, 0);
    assert.match(warning.stderr, /warning: E-01 was last checked 670 days ago/);
    assert.equal(cli([file, "--today", "2026-11-02", "--strict"]).status, 1);
  });
});

test("usage errors exit with code 2", () => {
  assert.equal(cli(["--bogus"]).status, 2);
  assert.equal(cli(["--today", "soon"]).status, 2);
  assert.equal(cli(["/nonexistent/register.md"]).status, 2);
});

test("the shipped register passes", () => {
  const result = cli([]);
  assert.equal(result.status, 0, result.stderr);
});
