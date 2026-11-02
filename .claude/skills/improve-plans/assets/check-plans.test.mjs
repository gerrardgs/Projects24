// Run with: node --test
// Secret-shaped values are assembled at run time so that no scanner flags this file.

import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { findCycle, findSecrets, parseIndex, parsePlan, sections, setProblems, toStories } from "./check-plans.mjs";

const SCRIPT = path.join(path.dirname(fileURLToPath(import.meta.url)), "check-plans.mjs");

const plan = ({
  number = "001",
  depends = "none",
  sha = "abc1234",
  extra = "",
} = {}) => `# Plan ${number}: Batch the order queries

> Executor note.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: ${depends}
- **Category**: perf
- **Planned at**: commit \`${sha}\`, 2026-11-02

## Why this matters

Every order-list render issues one query per item. Batching removes the extra round trips.

## Current state

\`src/orders/api.ts:130\` loops over items and queries inside the loop.

## Scope

**In scope**:
- \`src/orders/api.ts\`
- \`src/orders/api.test.ts\` (create)

**Out of scope**:
- \`src/orders/legacy-api.ts\`

## Steps

### Step 1: Add the batch query

Replace the loop with one query.

**Verify**: \`npm test -- orders\` → all pass
${extra}
## Test plan

Add a test for the empty order.

## Done criteria

- [ ] \`npm run verify\` exits 0
- [ ] \`git status\` shows only in-scope files

## STOP conditions

- The excerpts in Current state do not match the code.

## Maintenance notes

Revisit the batching if pagination is added.
`;

const index = (rows) => `# Implementation Plans

| Plan | Title | Priority | Effort | Depends on | Status |
|------|-------|----------|--------|------------|--------|
${rows.join("\n")}
`;

test("a complete plan has no problems and exposes its fields", () => {
  const parsed = parsePlan(plan(), "001-batch-order-queries.md");
  assert.deepEqual(parsed.problems, []);
  assert.equal(parsed.number, "001");
  assert.equal(parsed.plannedAt, "abc1234");
  assert.deepEqual(parsed.paths, ["src/orders/api.ts", "src/orders/api.test.ts"]);
  assert.equal(parsed.criteria.length, 2);
});

test("file name, heading number and missing sections are reported", () => {
  const parsed = parsePlan(plan({ number: "002" }).replace("## Test plan", "## Tests"), "001-batch.md");
  assert.ok(parsed.problems.some((problem) => problem.includes("does not match file number")));
  assert.ok(parsed.problems.some((problem) => problem.includes('missing section "## Test plan"')));
  assert.ok(parsePlan(plan(), "batch.md").problems.some((problem) => problem.includes("file name")));
});

test("a step without a verification line is rejected", () => {
  const parsed = parsePlan(plan().replace(/\*\*Verify\*\*:.*\n/, ""), "001-batch.md");
  assert.ok(parsed.problems.some((problem) => problem.includes("**Verify**")));
});

test("status fields and the planned-at commit are validated", () => {
  const parsed = parsePlan(
    plan()
      .replace("P1", "urgent")
      .replace(/commit `abc1234`, /, ""),
    "001-batch.md",
  );
  assert.ok(parsed.problems.some((problem) => problem.includes("Priority")));
  assert.ok(parsed.problems.some((problem) => problem.includes("Planned at")));
});

test("secret-shaped text is reported by kind and line, never by value", () => {
  const key = `AKIA${"Q".repeat(16)}`;
  const parsed = parsePlan(plan({ extra: `Config sets ${key} in the file.\n` }), "001-batch.md");
  const problem = parsed.problems.find((entry) => entry.includes("cloud access key id"));
  assert.ok(problem);
  assert.ok(!problem.includes(key));
  assert.deepEqual(
    findSecrets(`password = "${"x".repeat(14)}"`).map((entry) => entry.kind),
    ["assigned credential"],
  );
  assert.deepEqual(findSecrets("password: use the vault"), []);
});

test("sections splits by level-two heading", () => {
  assert.deepEqual([...sections("# T\n## A\none\n## B\ntwo").keys()], ["A", "B"]);
});

test("the index is parsed and compared with the plans", () => {
  const rows = parseIndex(index(["| 001 | Batch | P1 | S | — | TODO |", "| 002 | Cache | P2 | M | 001 | DONE |"]));
  assert.deepEqual(
    rows.map((row) => [row.number, row.status, row.dependsOn]),
    [
      ["001", "TODO", []],
      ["002", "DONE", ["001"]],
    ],
  );
  const plans = [parsePlan(plan(), "001-batch.md"), parsePlan(plan({ number: "002", depends: "001" }), "002-cache.md")];
  assert.deepEqual(setProblems(plans, rows), []);
});

test("set problems: missing row, unknown status, different dependencies, missing dependency, orphan row", () => {
  const plans = [
    parsePlan(plan({ depends: "009" }), "001-batch.md"),
    parsePlan(plan({ number: "002" }), "002-cache.md"),
  ];
  const rows = parseIndex(index(["| 001 | Batch | P1 | S | — | WAITING |", "| 003 | Ghost | P2 | M | — | TODO |"]));
  const problems = setProblems(plans, rows);
  assert.ok(problems.some((problem) => problem.includes("no row for plan 002")));
  assert.ok(problems.some((problem) => problem.includes('status "WAITING"')));
  assert.ok(problems.some((problem) => problem.includes("depends on 009")));
  assert.ok(problems.some((problem) => problem.includes("row 003 has no plan file")));
  const different = setProblems(
    [parsePlan(plan({ depends: "002" }), "001-batch.md")],
    parseIndex(index(["| 001 | Batch | P1 | S | — | TODO |"])),
  );
  assert.ok(different.some((problem) => problem.includes("different dependencies")));
});

test("findCycle finds a loop and accepts a chain", () => {
  assert.deepEqual(
    findCycle(
      new Map([
        ["001", ["002"]],
        ["002", ["001"]],
      ]),
    ),
    ["001", "002", "001"],
  );
  assert.equal(
    findCycle(
      new Map([
        ["001", []],
        ["002", ["001"]],
      ]),
    ),
    undefined,
  );
});

test("toStories keeps open plans, maps dependencies and orders by priority", () => {
  const plans = [
    parsePlan(plan(), "001-batch.md"),
    parsePlan(plan({ number: "002", depends: "001" }), "002-cache.md"),
    parsePlan(plan({ number: "003" }), "003-done.md"),
  ];
  const rows = parseIndex(
    index([
      "| 001 | Batch | P1 | S | — | TODO |",
      "| 002 | Cache | P1 | M | 001 | TODO |",
      "| 003 | Old | P1 | S | — | DONE |",
    ]),
  );
  const stories = toStories(plans, rows, { project: "Shop", branch: "agent/plans", verify: "npm run verify" });
  assert.deepEqual(
    stories.userStories.map((story) => story.id),
    ["US-001", "US-002"],
  );
  assert.deepEqual(stories.userStories[1].dependsOn, ["US-001"]);
  assert.equal(stories.branchName, "agent/plans");
  assert.equal(stories.userStories[0].passes, false);
});

function withFolder(run) {
  const folder = mkdtempSync(path.join(tmpdir(), "check-plans-"));
  try {
    return run(folder);
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
}
const cli = (args, cwd) => spawnSync(process.execPath, [SCRIPT, ...args], { cwd, encoding: "utf8" });

test("the command line validates a folder and reports problems with exit code 1", () => {
  withFolder((folder) => {
    mkdirSync(path.join(folder, "plans"));
    writeFileSync(path.join(folder, "plans", "001-batch.md"), plan());
    writeFileSync(path.join(folder, "plans", "README.md"), index(["| 001 | Batch | P1 | S | — | TODO |"]));
    const ok = cli(["plans"], folder);
    assert.equal(ok.status, 0);
    assert.match(ok.stdout, /plans OK: 1 plan/);
    writeFileSync(path.join(folder, "plans", "README.md"), index([]));
    const bad = cli(["plans"], folder);
    assert.equal(bad.status, 1);
    assert.match(bad.stderr, /no row for plan 001/);
  });
});

test("usage errors and unreadable folders exit with code 2", () => {
  withFolder((folder) => {
    assert.equal(cli(["--bogus"], folder).status, 2);
    assert.equal(cli(["missing"], folder).status, 2);
    assert.equal(cli(["plans", "--to-stories"], folder).status, 2);
  });
});

test("--drift reports in-scope files that changed after the recorded commit", () => {
  withFolder((folder) => {
    const git = (...args) =>
      execFileSync("git", ["-c", "user.name=t", "-c", "user.email=t@example.test", ...args], {
        cwd: folder,
        encoding: "utf8",
      });
    git("init", "-q");
    mkdirSync(path.join(folder, "src", "orders"), { recursive: true });
    writeFileSync(path.join(folder, "src", "orders", "api.ts"), "one\n");
    git("add", ".");
    git("commit", "-q", "-m", "first");
    const sha = git("rev-parse", "--short", "HEAD").trim();
    mkdirSync(path.join(folder, "plans"));
    writeFileSync(path.join(folder, "plans", "001-batch.md"), plan({ sha }));
    writeFileSync(path.join(folder, "plans", "README.md"), index(["| 001 | Batch | P1 | S | — | TODO |"]));
    assert.equal(cli(["plans", "--drift"], folder).status, 0);
    writeFileSync(path.join(folder, "src", "orders", "api.ts"), "two\n");
    git("commit", "-q", "-am", "second");
    const drifted = cli(["plans", "--drift"], folder);
    assert.equal(drifted.status, 1);
    assert.match(drifted.stderr, /plan 001: 1 in-scope file/);
    const stories = cli(
      ["plans", "--to-stories", "--project", "Shop", "--branch", "agent/plans", "--verify", "npm run verify"],
      folder,
    );
    assert.equal(stories.status, 0);
    assert.equal(JSON.parse(stories.stdout).userStories.length, 1);
  });
});
