// Run with: node --test

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  briefInfo,
  definedCards,
  futureRows,
  heavyReuse,
  parseLedger,
  rowProblems,
  staleRows,
} from "./check-study.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(HERE, "check-study.mjs");
const TODAY = new Date("2026-11-02T00:00:00Z");

const row = (overrides = {}) => {
  const cells = {
    id: "ST-01",
    reference: "card:S-09",
    seen: "2026-11-02",
    status: "own",
    observed: "Impression: restraint reads as confidence",
    imitated: "A narrow column with small headings",
    modified: "Larger text and a warm illustration",
    scope: "pattern",
    credit: "—",
    usedIn: "Alpha",
    ...overrides,
  };
  return `| ${Object.values(cells).join(" | ")} |`;
};
const ledger = (rows) =>
  `# Ledger\n\n| ID | Reference | Seen | Status | Observed | Imitated | Modified | Scope | Credit | Used in |\n| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |\n${rows.join("\n")}\n`;
const problemsFor = (rows) => rowProblems(parseLedger(ledger(rows)));

test("a well-formed row has no problems", () => {
  assert.deepEqual(problemsFor([row()]), []);
});

test("header and separator rows are not study rows", () => {
  assert.equal(parseLedger(ledger([row(), row({ id: "ST-02" })])).length, 2);
});

test("id format, duplicates and column count", () => {
  assert.ok(problemsFor([row({ id: "ST-1" })]).some((problem) => problem.includes("id must look like")));
  assert.ok(problemsFor([row(), row()]).some((problem) => problem.includes("duplicate id")));
  assert.ok(problemsFor(["| ST-03 | only | three |"]).some((problem) => problem.includes("expected 10 columns")));
});

test("reference needs a link or a card; dates, statuses and scopes are restricted", () => {
  assert.ok(problemsFor([row({ reference: "a website I liked" })]).some((problem) => problem.includes("needs a link")));
  assert.deepEqual(problemsFor([row({ reference: "https://example.com/work" })]), []);
  const found = problemsFor([row({ seen: "2026-02-30", status: "free", scope: "vibe" })]);
  for (const text of ["real date", 'Status "free"', 'Scope "vibe"'])
    assert.ok(
      found.some((problem) => problem.includes(text)),
      text,
    );
});

test("an observation must say whether it is a fact or an impression", () => {
  assert.ok(problemsFor([row({ observed: "It looks calm" })]).some((problem) => problem.includes("Fact:")));
  assert.deepEqual(problemsFor([row({ observed: "Fact: the column is 560 px wide" })]), []);
});

test("a modification is required and must differ from the imitation", () => {
  assert.ok(problemsFor([row({ modified: "none" })]).some((problem) => problem.includes("modification is required")));
  assert.ok(problemsFor([row({ modified: "—" })]).some((problem) => problem.includes("modification is required")));
  assert.ok(
    problemsFor([row({ imitated: "Same thing here", modified: "same thing here" })]).some((problem) =>
      problem.includes("repeats Imitated"),
    ),
  );
  assert.ok(problemsFor([row({ imitated: "short" })]).some((problem) => problem.includes("which technique")));
});

test("restricted and unknown references may only be imitated as technique, structure or pattern", () => {
  for (const status of ["restricted", "unknown"]) {
    for (const scope of ["asset", "text", "code"]) {
      assert.ok(
        problemsFor([row({ status, scope })]).some((problem) => problem.includes("never as")),
        `${status} ${scope}`,
      );
    }
    for (const scope of ["technique", "structure", "pattern"])
      assert.deepEqual(problemsFor([row({ status, scope })]), []);
  }
});

test("borrowed material from an open or licensed reference needs its credit", () => {
  assert.ok(
    problemsFor([row({ status: "open", scope: "asset", credit: "—" })]).some((problem) =>
      problem.includes("needs the licence name"),
    ),
  );
  assert.deepEqual(problemsFor([row({ status: "open", scope: "asset", credit: "CC BY 4.0, A. Maker" })]), []);
  assert.deepEqual(problemsFor([row({ status: "own", scope: "asset", credit: "—" })]), []);
});

test("used in must name a project", () => {
  assert.ok(problemsFor([row({ usedIn: "" })]).some((problem) => problem.includes("Used in")));
});

test("definedCards and card citations", () => {
  assert.deepEqual([...definedCards("### S-01 One\n### S-02 Two\ntext S-03")], ["S-01", "S-02"]);
});

test("heavyReuse lists a reference used by many rows", () => {
  const rows = parseLedger(
    ledger([row(), row({ id: "ST-02" }), row({ id: "ST-03" }), row({ id: "ST-04", reference: "card:S-01" })]),
  );
  assert.deepEqual(heavyReuse(rows), [{ reference: "card:s-09", count: 3 }]);
});

test("staleRows and futureRows use the Seen date", () => {
  const rows = parseLedger(ledger([row({ seen: "2025-01-01" }), row({ id: "ST-02", seen: "2027-01-01" })]));
  assert.deepEqual(
    staleRows(rows, TODAY, 365).map((entry) => entry.id),
    ["ST-01"],
  );
  assert.deepEqual(futureRows(rows, TODAY), ["ST-02"]);
});

test("briefInfo reads cited row ids and the project name", () => {
  const info = briefInfo("---\nproject: Alpha\n---\n## Studied references\nST-01 and ST-03, ST-01 again.");
  assert.deepEqual(info.cited, ["ST-01", "ST-03"]);
  assert.equal(info.project, "Alpha");
});

function withFolder(run) {
  const folder = mkdtempSync(path.join(tmpdir(), "check-study-"));
  try {
    return run(folder);
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
}
const cli = (args) => spawnSync(process.execPath, [SCRIPT, "--today", "2026-11-02", ...args], { encoding: "utf8" });

test("the command line passes a good ledger and fails an unknown study card", () => {
  withFolder((folder) => {
    const file = path.join(folder, "study.md");
    writeFileSync(file, ledger([row()]));
    const ok = cli([file]);
    assert.equal(ok.status, 0, ok.stderr);
    assert.match(ok.stdout, /study OK: 1 row\(s\), 0 warning\(s\)/);
    writeFileSync(file, ledger([row({ reference: "card:S-77" })]));
    const bad = cli([file]);
    assert.equal(bad.status, 1);
    assert.match(bad.stderr, /S-77 is cited as a study card/);
  });
});

test("--brief checks citations both ways", () => {
  withFolder((folder) => {
    const file = path.join(folder, "study.md");
    writeFileSync(file, ledger([row(), row({ id: "ST-02", usedIn: "Alpha" })]));
    const brief = path.join(folder, "brief.md");
    writeFileSync(brief, "---\nproject: Alpha\n---\n## Studied references\nST-01 and ST-09.\n");
    const result = cli([file, "--brief", brief]);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /cites ST-09, which is not in the ledger/);
    assert.match(result.stderr, /ST-02 is used in Alpha but the brief/);
  });
});

test("stale rows and heavy reuse warn, and fail with --strict", () => {
  withFolder((folder) => {
    const file = path.join(folder, "study.md");
    writeFileSync(file, ledger([row({ seen: "2025-01-01" })]));
    const warn = cli([file]);
    assert.equal(warn.status, 0);
    assert.match(warn.stderr, /warning: ST-01 was seen 670 days ago/);
    assert.equal(cli([file, "--strict"]).status, 1);
  });
});

test("usage errors exit with code 2", () => {
  assert.equal(cli([]).status, 2);
  assert.equal(cli(["--bogus"]).status, 2);
  assert.equal(cli(["/nonexistent/ledger.md"]).status, 2);
  assert.equal(spawnSync(process.execPath, [SCRIPT, "--today", "later", "x.md"], { encoding: "utf8" }).status, 2);
});

test("the shipped example ledger passes", () => {
  const result = cli([path.join(HERE, "example-study.md")]);
  assert.equal(result.status, 0, result.stderr);
});

test("the shipped template parses and passes", () => {
  const result = cli([path.join(HERE, "design-study.template.md")]);
  assert.notEqual(result.status, 2, result.stderr);
});
