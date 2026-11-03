#!/usr/bin/env node
// Checks the condition of a /goal before it is set. The evaluator that decides whether a goal is met reads only
// the conversation and runs nothing, so a condition must name an end state that Claude's own output can show, say how
// it is proved, and be bounded. This also refuses conditions that would need an outward action (push, deploy,
// publish, delete, merge): those need the owner's approval each time and do not belong inside a loop.
// Rules follow the /goal documentation (https://code.claude.com/docs/en/goal) and this repository's rules.
//
// Usage (Node.js 22+, no dependencies):
//   node check-goal.mjs "<condition>"
//   node check-goal.mjs --file condition.txt [--strict]
// Prints "goal OK" or the problems. Exit code 0 when valid (warnings do not fail unless --strict),
// 1 when the condition has errors, 2 on usage or read errors.

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export const MAX_LENGTH = 4000;
const BOUND =
  /\b(?:stop|halt|give up|abort)\s+after\s+\d+\s+(?:turns?|tries|attempts?|iterations?|minutes?|hours?)\b|\bat most\s+\d+\s+(?:turns?|tries|attempts?|iterations?)\b|\bwithin\s+\d+\s+(?:turns?|tries|attempts?|iterations?)\b/i;
const CHECK =
  /`[^`]+`|\bexits?\s+(?:with\s+)?(?:code\s+)?0\b|\b(?:tests?|checks?|builds?|lint|type-?check)\b[^.]*\b(?:pass(?:es)?|succeed(?:s|ed)?|clean|green)\b|\b(?:score|count|size|coverage|latency)\b[^.]*\b(?:at least|at most|below|above|under|over|>=|<=|\d)\b|\b(?:is|are)\s+(?:empty|zero|clean)\b|\bno\s+\w+(?:\s+\w+)?\s+(?:remain|left|errors?|failures?)\b/i;
const OUTWARD =
  /\b(?:git\s+push|push(?:ed|es)?\b|deploy(?:ed|s|ment)?\b|publish(?:ed|es)?\b|release(?:d|s)?\b|merge(?:d|s)?\b|force[- ]push|delete(?:d|s)?\b|drop\s+table|send\s+(?:an?\s+)?(?:email|message))\b|\bgh\s+\w+/i;
const VAGUE = [
  "works",
  "working",
  "good",
  "better",
  "properly",
  "nice",
  "improved",
  "fast",
  "faster",
  "perfect",
  "correct",
];
const MAX_CONJUNCTIONS = 6;
const CONSTRAINT = /\b(?:no|not|without|only|unchanged|must not|never)\b/i;

function errorsFor(condition) {
  const errors = [];
  if (condition.length > MAX_LENGTH)
    errors.push(`the condition is ${condition.length} characters; the limit is ${MAX_LENGTH}`);
  if (!BOUND.test(condition))
    errors.push('add a bound, for example "or stop after 20 turns", so the goal cannot run without limit');
  if (!CHECK.test(condition))
    errors.push(
      'state the check Claude should run and show, for example "`npm run verify` exits 0 and its output is shown"',
    );
  const outward = OUTWARD.exec(condition);
  if (outward)
    errors.push(
      `"${outward[0]}" is an outward action; a goal ends at a reviewed result, and the owner approves pushing, deploying, publishing, merging or deleting separately`,
    );
  return errors;
}

function warningsFor(condition) {
  const warnings = [];
  const vague = VAGUE.filter((word) => new RegExp(`\\b${word}\\b`, "i").test(condition));
  if (vague.length > 0)
    warnings.push(`vague word(s) ${vague.join(", ")}: say how each is proved, with a command and an expected result`);
  const conjunctions = (condition.match(/\b(?:and|or)\b/gi) ?? []).length;
  if (conjunctions > MAX_CONJUNCTIONS)
    warnings.push(
      "many conditions in one goal; prefer one measurable end state, and split the rest into separate goals",
    );
  if (!CONSTRAINT.test(condition))
    warnings.push('no constraint stated; add what must not change, for example "no other test file is modified"');
  return warnings;
}

/** Problems with a goal condition: { errors, warnings }. Pure. */
export function goalProblems(text) {
  const condition = (text ?? "").trim();
  if (condition.length === 0) return { errors: ["the condition is empty"], warnings: [] };
  return { errors: errorsFor(condition), warnings: warningsFor(condition) };
}

function parseArguments(argv) {
  const options = { text: undefined, file: undefined, strict: false };
  const rest = [...argv];
  while (rest.length > 0) {
    const argument = rest.shift();
    if (argument === "--strict") {
      options.strict = true;
    } else if (argument === "--file") {
      options.file = rest.shift();
      if (options.file === undefined) throw new Error("--file needs a value");
    } else if (argument.startsWith("--")) {
      throw new Error(`unknown option ${argument}`);
    } else {
      options.text = argument;
    }
  }
  if (options.text === undefined && options.file === undefined)
    throw new Error("give the condition as text, or --file <path>");
  return options;
}

async function main(argv) {
  let options;
  let condition;
  try {
    options = parseArguments(argv);
    condition = options.file === undefined ? options.text : await readFile(options.file, "utf8");
  } catch (error) {
    console.error(`check-goal: ${error.message}`);
    return 2;
  }
  const { errors, warnings } = goalProblems(condition);
  for (const message of errors) console.error(`error: ${message}`);
  for (const message of warnings) console.error(`${options.strict ? "error" : "warning"}: ${message}`);
  if (errors.length > 0 || (options.strict && warnings.length > 0)) return 1;
  console.log(`goal OK (${condition.trim().length} of ${MAX_LENGTH} characters, ${warnings.length} warning(s))`);
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).then((code) => process.exit(code));
}
