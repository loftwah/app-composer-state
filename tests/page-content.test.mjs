import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const root = new URL("..", import.meta.url);
const html = readFileSync(new URL("public/index.html", root), "utf8");
const client = readFileSync(new URL("public/client.mjs", root), "utf8");

// The page is one long explanation, so the review items here are about saying
// each thing once and naming the app as its own repository does.
test("the reviewed artwork is wired in and every referenced asset exists", () => {
  assert.match(html, /\/brand\/carry-forward-art-v4-960\.webp/);
  assert.match(html, /\/brand\/carry-forward-art-v4-480\.webp 480w/);
  assert.match(html, /\/brand\/carryforward-share-v4\.jpg/);
  assert.match(html, /<link rel="icon" href="\/brand\/mark\.svg"/);
  assert.match(html, /rel="preload" href="\/brand\/space\.woff2" as="font"/);
  const paths = [...html.matchAll(/\/brand\/[a-z0-9./-]+\.(?:webp|jpg|png|svg|woff2)/g)].map(
    ([path]) => path,
  );
  assert.ok(paths.length >= 6, "the page names its brand assets");
  for (const path of new Set(paths))
    assert.equal(existsSync(new URL("public" + path, root)), true, "public" + path + " must exist");
  assert.doesNotMatch(html, /state-v1|share-ai-v1|carry-forward-share-v2|Portable AI State/);
});

test("the bundled font and its licence are kept in one place", () => {
  assert.equal(existsSync(new URL("public/brand/space.woff2", root)), true);
  assert.equal(existsSync(new URL("public/brand/OFL-Space-Grotesk.txt", root)), true);
  assert.equal(existsSync(new URL("public/space.woff2", root)), false);
  assert.equal(existsSync(new URL("public/OFL-Space-Grotesk.txt", root)), false);
  assert.match(readFileSync(new URL("public/style.css", root), "utf8"), /url\('\/brand\/space\.woff2'\)/);
});

test("each idea is stated once: no demo wording, no restated passphrase rule", () => {
  for (const source of [html, client])
    assert.doesNotMatch(source, /\bdemo file\b|\bDemo\b/, "the example is called an example");
  assert.doesNotMatch(html, /It stays in this browser\./);
  assert.match(html, /At least 16 characters; a made-up phrase is safest\./);
});

test("the numbered steps do not repeat the section headings they point at", () => {
  const steps = [...html.matchAll(/<li><a href="#[^"]+">([^<]+)<\/a><\/li>/g)].map(([, text]) => text);
  assert.equal(steps.length, 3);
  const headings = [...html.matchAll(/<h2 id="[^"]+">([^<]+)<\/h2>/g)].map(([, text]) => text);
  for (const step of steps)
    assert.ok(
      !headings.includes(step),
      step + " must not be both a step and a section heading",
    );
});

test("the switcher lists every app by its own name and crop", () => {
  for (const [name, crop] of [
    ["Here / there", "herethere-small-v4"],
    ["Linkarooie", "linkarooie-small-v4"],
    ["Link Check", "linkcheck-small-v4"],
    ["Hello World", "hello-small-v4"],
    ["Carry / forward", "carryforward-small-v4"],
  ]) {
    assert.ok(html.includes(name), name + " stays in the switcher");
    assert.ok(html.includes(`/brand/apps/${crop}.webp`), crop + " thumbnail stays in the switcher");
  }
  assert.match(html, /Carry \/ forward · Fictional example/);
});
