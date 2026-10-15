// Run with: node --test "scripts/*.test.mjs"
import { test } from "node:test";
import assert from "node:assert/strict";
import { extractUrls } from "./check-links.mjs";

test("extracts unique http(s) Markdown link targets", () => {
  const markdown = "[a](https://a.example/x) and [b](http://b.example) and [a again](https://a.example/x)";
  assert.deepEqual(extractUrls(markdown), ["https://a.example/x", "http://b.example"]);
});

test("ignores relative links, anchors and links inside code", () => {
  const markdown = ["[rel](../x.md) [anchor](#top)", "`[inline](https://code.example)`", "```", "[fenced](https://fenced.example)", "```"].join("\n");
  assert.deepEqual(extractUrls(markdown), []);
});

test("keeps titles out of the URL", () => {
  assert.deepEqual(extractUrls('[t](https://t.example/page "Title")'), ["https://t.example/page"]);
});
