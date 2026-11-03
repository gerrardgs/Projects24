// Run with: node --test

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { goalProblems, MAX_LENGTH } from "./check-goal.mjs";

const SCRIPT = path.join(path.dirname(fileURLToPath(import.meta.url)), "check-goal.mjs");
const GOOD =
  "All tests in test/auth pass, `npm run lint` is clean, no other test file is modified, or stop after 20 turns";

test("a bounded, checked condition with a constraint has no problems", () => {
  assert.deepEqual(goalProblems(GOOD), { errors: [], warnings: [] });
});

test("the example from the loop diagram is accepted", () => {
  const result = goalProblems(
    "Get the homepage Lighthouse score to 90 or above, no other file outside src/ changes, stop after 5 tries",
  );
  assert.deepEqual(result.errors, []);
});

test("an empty condition is an error", () => {
  assert.deepEqual(goalProblems("   ").errors, ["the condition is empty"]);
  assert.deepEqual(goalProblems(undefined).errors, ["the condition is empty"]);
});

test("a missing bound is an error, and the accepted bound forms pass", () => {
  assert.ok(goalProblems("`npm test` exits 0").errors.some((error) => error.includes("add a bound")));
  for (const bound of [
    "or stop after 20 turns",
    "give up after 3 attempts",
    "at most 10 iterations",
    "within 8 tries",
    "halt after 30 minutes",
  ]) {
    assert.deepEqual(goalProblems(`\`npm test\` exits 0, ${bound}`).errors, [], bound);
  }
});

test("a missing check is an error", () => {
  const errors = goalProblems("Refactor the module until it is tidy, or stop after 10 turns").errors;
  assert.ok(errors.some((error) => error.includes("state the check")));
});

test("recognised check phrases", () => {
  for (const phrase of [
    "the build succeeds",
    "all tests pass",
    "the queue is empty",
    "no errors remain",
    "the coverage is at least 80",
    "`git status` is clean",
  ]) {
    const errors = goalProblems(`${phrase}, or stop after 5 turns`).errors;
    assert.ok(!errors.some((error) => error.includes("state the check")), phrase);
  }
});

test("outward actions are errors", () => {
  for (const phrase of [
    "then git push to main",
    "and deploy it",
    "and publish the package",
    "then merge the pull request",
    "delete the old files",
    "run gh release create",
  ]) {
    const errors = goalProblems(`${GOOD}, ${phrase}`).errors;
    assert.ok(
      errors.some((error) => error.includes("outward action")),
      phrase,
    );
  }
});

test("the length limit is enforced", () => {
  const long = `${GOOD} ${"x".repeat(MAX_LENGTH)}`;
  assert.ok(goalProblems(long).errors.some((error) => error.includes("the limit is 4000")));
});

test("vague words, stacked conditions and a missing constraint are warnings", () => {
  const vague = goalProblems("The app works properly: `npm test` exits 0, or stop after 5 turns");
  assert.ok(vague.warnings.some((warning) => warning.includes("works, properly")));
  const stacked = goalProblems(
    `\`npm test\` exits 0 and lint is clean and types pass and docs build and ${"a and b and ".repeat(2)}, no other file changes, or stop after 5 turns`,
  );
  assert.ok(stacked.warnings.some((warning) => warning.includes("many conditions")));
  const unconstrained = goalProblems("`npm test` exits 0, or stop after 5 turns");
  assert.ok(unconstrained.warnings.some((warning) => warning.includes("no constraint")));
});

const cli = (args) => spawnSync(process.execPath, [SCRIPT, ...args], { encoding: "utf8" });

test("the command line accepts a good condition and rejects a bad one", () => {
  const ok = cli([GOOD]);
  assert.equal(ok.status, 0, ok.stderr);
  assert.match(ok.stdout, /goal OK/);
  const bad = cli(["make it better"]);
  assert.equal(bad.status, 1);
  assert.match(bad.stderr, /add a bound/);
});

test("--file reads the condition and --strict fails on warnings", () => {
  const folder = mkdtempSync(path.join(tmpdir(), "check-goal-"));
  try {
    const file = path.join(folder, "goal.txt");
    writeFileSync(file, "`npm test` exits 0, or stop after 5 turns\n");
    assert.equal(cli(["--file", file]).status, 0);
    assert.equal(cli(["--file", file, "--strict"]).status, 1);
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
});

test("usage errors exit with code 2", () => {
  assert.equal(cli([]).status, 2);
  assert.equal(cli(["--bogus"]).status, 2);
  assert.equal(cli(["--file"]).status, 2);
  assert.equal(cli(["--file", "/nonexistent/goal.txt"]).status, 2);
});
