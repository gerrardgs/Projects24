// Runs axe-core in headless Chromium against one or more URLs, in light and dark color schemes,
// at a phone and a desktop viewport. Exits 1 when any WCAG 2.x A/AA violation is found.
//
// Usage: node check.mjs <url> [more urls...]
// Setup: npm ci && npx playwright install chromium
//
// Automated tools find only part of the problems (Deque estimates about 57% of issues by volume).
// A clean result is the start of an audit, not the end: follow the manual steps in the skill.
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const VIEWPORTS = [
  { name: "phone", width: 375, height: 812 },
  { name: "desktop", width: 1280, height: 800 },
];
const SCHEMES = ["light", "dark"];

const urls = process.argv.slice(2);
if (urls.length === 0) {
  console.error("usage: node check.mjs <url> [more urls...]");
  process.exit(2);
}

const browser = await chromium.launch();
let violationCount = 0;
try {
  for (const url of urls) {
    for (const viewport of VIEWPORTS) {
      for (const colorScheme of SCHEMES) {
        const context = await browser.newContext({ colorScheme, viewport, reducedMotion: "reduce" });
        const page = await context.newPage();
        await page.goto(url, { waitUntil: "load" });
        const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        const label = `${url} [${viewport.name}, ${colorScheme}]`;
        if (overflow) {
          // WCAG 1.4.10 Reflow: content should not need horizontal scrolling at 320 CSS px wide.
          console.log(`WARN ${label}: page scrolls horizontally`);
        }
        if (violations.length === 0) console.log(`pass ${label}`);
        for (const violation of violations) {
          violationCount += violation.nodes.length;
          console.log(`FAIL ${label}: ${violation.id} (${violation.impact}) ${violation.help}`);
          for (const node of violation.nodes) console.log(`       ${node.target.join(" ")}`);
          console.log(`       ${violation.helpUrl}`);
        }
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
}
console.log(`${violationCount} violation(s)`);
process.exitCode = violationCount > 0 ? 1 : 0;
