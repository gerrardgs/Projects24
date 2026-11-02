// Run with: node --test

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { briefProblems, compare, evidenceIds, gaps, overdue, pairProblems, parseBrief } from "./check-identity.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(HERE, "check-identity.mjs");
const TODAY = new Date("2026-11-02T00:00:00Z");

const base = {
  project: "Alpha",
  updated: "2026-10-01",
  reviewEveryDays: 180,
  mode: "operate",
  primaryHue: 190,
  accentHue: 45,
  neutralTone: "warm",
  chroma: "muted",
  displayFont: "Fraunces",
  bodyFont: "Source Sans 3",
  typeStyle: "serif-display",
  shape: "soft",
  density: "airy",
  layout: "stacked",
  energy: 1,
  rhythm: 1,
  motion: 1,
  imagery: "illustration",
  voice: "warm",
  personality: ["sincerity", "competence"],
};
const other = {
  ...base,
  project: "Beta",
  primaryHue: 25,
  accentHue: 265,
  neutralTone: "cool",
  chroma: "vivid",
  displayFont: "Space Grotesk",
  bodyFont: "Literata",
  typeStyle: "grotesk",
  shape: "sharp",
  density: "compact",
  layout: "editorial",
  energy: 3,
  rhythm: 3,
  motion: 2,
  imagery: "photography",
  voice: "formal",
  personality: ["excitement", "sophistication"],
};

const sections = [
  "Audience and context",
  "Personality and feeling",
  "Signature decisions",
  "Not like",
  "Studied references",
  "Evidence and rationale",
  "Open questions",
  "Change log",
];
function render(
  fields,
  { drop = [], changeLog = `- ${fields.updated}: first version`, evidence = "Calm affect [E-11, B]." } = {},
) {
  const front = Object.entries(fields)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? `[${value.join(", ")}]` : value}`)
    .join("\n");
  const body = sections
    .filter((name) => !drop.includes(name))
    .map(
      (name) =>
        `## ${name}\n\n${name === "Change log" ? changeLog : name === "Evidence and rationale" ? evidence : "text"}\n`,
    )
    .join("\n");
  return `---\n${front}\n---\n\n# Brief\n\n${body}`;
}
const problems = (fields, options) => briefProblems(parseBrief(render(fields, options)), TODAY);

test("parseBrief reads text, numbers and lists, and strips trailing comments", () => {
  const brief = parseBrief("---\nproject: A\nenergy: 2   # calm\npersonality: [sincerity, competence]\n---\nbody\n");
  assert.deepEqual(brief.fields, { project: "A", energy: 2, personality: ["sincerity", "competence"] });
  assert.equal(brief.body, "body\n");
  assert.equal(parseBrief("no front matter").hasFrontMatter, false);
});

test("a complete brief has no problems", () => {
  assert.deepEqual(problems(base), []);
});

test("missing front matter, bad vocabulary and out-of-range numbers are reported", () => {
  assert.ok(briefProblems(parseBrief("# only a heading"), TODAY)[0].includes("no front matter"));
  const found = problems({
    ...base,
    shape: "pointy",
    primaryHue: 360,
    energy: 4,
    personality: ["fun"],
    reviewEveryDays: 5,
  });
  for (const text of [
    'shape "pointy"',
    "primaryHue must be",
    "energy must be 1, 2 or 3",
    "personality must list",
    "reviewEveryDays must be",
  ]) {
    assert.ok(
      found.some((problem) => problem.includes(text)),
      text,
    );
  }
});

test("sections, the change log line and an evidence id are required", () => {
  assert.ok(
    problems(base, { drop: ["Not like"] }).some((problem) => problem.includes('missing section "## Not like"')),
  );
  assert.ok(
    problems(base, { changeLog: "- 2026-01-01: old" }).some((problem) => problem.includes("Change log needs a line")),
  );
  assert.ok(problems(base, { evidence: "no ids here" }).some((problem) => problem.includes("evidence id")));
});

test("dates must be real and not in the future; sharing a brand needs a reason", () => {
  assert.ok(problems({ ...base, updated: "2026-13-01" }).some((problem) => problem.includes("real date")));
  assert.ok(problems({ ...base, updated: "2027-01-01" }).some((problem) => problem.includes("future")));
  assert.ok(problems({ ...base, sharesBrandWith: "Beta" }).some((problem) => problem.includes("shareReason")));
});

test("evidenceIds lists each id once", () => {
  assert.deepEqual(evidenceIds("[E-11, B] and [E-11] and E-03"), ["E-11", "E-03"]);
});

test("compare: identical briefs are at distance 0, the two examples are far apart", () => {
  assert.equal(compare(base, base).distance, 0);
  assert.deepEqual(compare(base, base).differing, []);
  const far = compare(base, other);
  assert.ok(far.distance > 0.9);
  assert.equal(far.differing.length, 8);
});

test("compare: hue distance wraps around the circle", () => {
  const near = compare({ ...base, primaryHue: 350 }, { ...base, primaryHue: 10 });
  const opposite = compare({ ...base, primaryHue: 0 }, { ...base, primaryHue: 180 });
  assert.ok(near.distance < opposite.distance);
  assert.deepEqual(near.differing, []);
});

test("pairProblems: far-apart projects pass", () => {
  assert.deepEqual(pairProblems(base, other, 0.4), []);
});

test("pairProblems: a near clone fails all three rules", () => {
  const clone = { ...base, project: "Clone", primaryHue: 200 };
  const found = pairProblems(base, clone, 0.4);
  assert.equal(found.length, 3);
  assert.ok(found.some((problem) => problem.includes("same display font")));
  assert.ok(found.some((problem) => problem.includes("signature axes differ")));
  assert.ok(found.some((problem) => problem.includes("below the minimum")));
});

test("pairProblems: the same display font with a distant hue is allowed when enough else differs", () => {
  const sibling = { ...other, displayFont: "Fraunces" };
  assert.deepEqual(pairProblems(base, sibling, 0.4), []);
});

test("pairProblems: too few differing signature axes fails even at a fair distance", () => {
  const few = {
    ...base,
    project: "Few",
    primaryHue: 100,
    displayFont: "Lora",
    shape: "round",
    neutralTone: "cool",
    chroma: "vivid",
    energy: 3,
    rhythm: 3,
    motion: 3,
    accentHue: 300,
    bodyFont: "Inter",
    personality: ["ruggedness"],
  };
  const found = pairProblems(base, few, 0.2);
  assert.ok(found.some((problem) => problem.includes("signature axes differ")));
});

test("pairProblems: a declared shared brand is exempt in either direction", () => {
  const clone = { ...base, project: "Clone", sharesBrandWith: "Alpha", shareReason: "Same company sub-brand" };
  assert.deepEqual(pairProblems(base, clone, 0.4), []);
  assert.deepEqual(pairProblems(clone, base, 0.4), []);
});

test("gaps: the widest hue gap and unused vocabulary", () => {
  const result = gaps([
    { ...base, primaryHue: 0 },
    { ...base, primaryHue: 120 },
    { ...base, primaryHue: 240 },
  ]);
  assert.equal(result.widestHueGaps[0].size, 120);
  assert.ok(result.unused.shape.includes("round"));
  assert.ok(!result.unused.shape.includes("soft"));
  assert.equal(gaps([]).widestHueGaps[0].size, 360);
  assert.equal(gaps([{ ...base, primaryHue: 90 }]).widestHueGaps[0].size, 360);
});

test("overdue: counts days past the review date", () => {
  assert.equal(overdue({ updated: "2026-10-01", reviewEveryDays: 180 }, TODAY), undefined);
  assert.equal(overdue({ updated: "2025-01-01", reviewEveryDays: 180 }, TODAY), 670 - 180);
  assert.equal(overdue({ updated: "nope", reviewEveryDays: 180 }, TODAY), undefined);
});

function withFolder(run) {
  const folder = mkdtempSync(path.join(tmpdir(), "check-identity-"));
  try {
    return run(folder);
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
}
const cli = (args) => spawnSync(process.execPath, [SCRIPT, "--today", "2026-11-02", ...args], { encoding: "utf8" });
const write = (folder, name, fields, options) => {
  const file = path.join(folder, name);
  writeFileSync(file, render(fields, options));
  return file;
};

test("the command line passes distinct briefs, fails a near clone and finds briefs in a folder", () => {
  withFolder((folder) => {
    write(folder, "a.identity.md", base);
    write(folder, "b.identity.md", other);
    const ok = cli([folder]);
    assert.equal(ok.status, 0, ok.stderr);
    assert.match(ok.stdout, /identity OK: 2 project\(s\), closest pair distance 0\.9/);
    write(folder, "c.identity.md", { ...base, project: "Clone", primaryHue: 200 });
    const bad = cli([folder]);
    assert.equal(bad.status, 1);
    assert.match(bad.stderr, /Alpha and Clone/);
  });
});

test("registry: a name mismatch is an error and a missing brief is a warning, or an error with --strict", () => {
  withFolder((folder) => {
    write(folder, "a.identity.md", base);
    const registry = path.join(folder, "registry.json");
    writeFileSync(
      registry,
      JSON.stringify({
        projects: [
          { name: "Alpha", path: "a.identity.md" },
          { name: "Gamma", path: "gamma.identity.md" },
        ],
      }),
    );
    const warn = cli(["--registry", registry]);
    assert.equal(warn.status, 0);
    assert.match(warn.stderr, /warning: .*gamma\.identity\.md: registered but there is no identity brief/);
    assert.equal(cli(["--registry", registry, "--strict"]).status, 1);
    writeFileSync(registry, JSON.stringify({ projects: [{ name: "Wrong Name", path: "a.identity.md" }] }));
    assert.match(cli(["--registry", registry]).stderr, /the registry calls it "Wrong Name"/);
  });
});

test("overdue reviews warn, and fail with --strict", () => {
  withFolder((folder) => {
    const file = write(folder, "a.identity.md", { ...base, updated: "2025-01-01" });
    const warn = cli([file]);
    assert.equal(warn.status, 0);
    assert.match(warn.stderr, /review was due/);
    assert.equal(cli([file, "--strict"]).status, 1);
  });
});

test("--evidence rejects an evidence id that is not in the register", () => {
  withFolder((folder) => {
    const file = write(folder, "a.identity.md", base, { evidence: "Cites [E-11, B] and [E-98, B]." });
    const register = path.join(folder, "register.md");
    writeFileSync(register, "| ID | Finding |\n| :-- | :-- |\n| E-11 | a finding |\n");
    const result = cli([file, "--evidence", register]);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /cites E-98/);
    assert.doesNotMatch(result.stderr, /cites E-11/);
  });
});

test("--gaps prints suggestions as JSON after the summary", () => {
  withFolder((folder) => {
    write(folder, "a.identity.md", base);
    const result = cli([folder, "--gaps"]);
    assert.equal(result.status, 0);
    const json = JSON.parse(result.stdout.slice(result.stdout.indexOf("{")));
    assert.ok(Array.isArray(json.widestHueGaps));
  });
});

test("usage errors exit with code 2", () => {
  assert.equal(cli([]).status, 2);
  assert.equal(cli(["--bogus"]).status, 2);
  assert.equal(cli(["x.md", "--min-distance", "2"]).status, 2);
  assert.equal(cli(["/nonexistent/folder"]).status, 2);
  assert.equal(spawnSync(process.execPath, [SCRIPT, "--today", "later", "x"], { encoding: "utf8" }).status, 2);
});

test("the shipped examples and registry pass with the shipped evidence register", () => {
  const result = cli([
    "--registry",
    path.join(HERE, "registry.example.json"),
    "--evidence",
    path.join(HERE, "..", "..", "human-design-nature", "references", "evidence-register.md"),
  ]);
  assert.equal(result.status, 0, result.stderr);
});
