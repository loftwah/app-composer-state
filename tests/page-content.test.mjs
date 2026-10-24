import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";

const root = new URL("..", import.meta.url);
const html = readFileSync(new URL("public/index.html", root), "utf8");
const client = readFileSync(new URL("public/client.mjs", root), "utf8");

// The page is one long explanation, so the review items here are about saying
// each thing once and naming the app as its own repository does.
test("the reviewed artwork is wired in and every referenced asset exists", () => {
  assert.match(html, /\/brand\/carry-forward-art-v4-960\.webp/);
  assert.match(html, /\/brand\/carry-forward-art-v4-480\.webp 480w/);
  assert.match(html, /\/brand\/carryforward-share-20261018\.jpg/);
  assert.match(html, /<link rel="icon" type="image\/png" sizes="32x32" href="\/brand\/carryforward-icon-20261018-32\.png"/);
  assert.match(html, /rel="preload" href="\/brand\/space-latin-20261018\.woff2" as="font"/);
  const paths = [...html.matchAll(/\/brand\/[a-z0-9./-]+\.(?:webp|jpg|png|svg|woff2)/g)].map(
    ([path]) => path,
  );
  assert.ok(paths.length >= 6, "the page names its brand assets");
  for (const path of new Set(paths))
    assert.equal(existsSync(new URL("public" + path, root)), true, "public" + path + " must exist");
  assert.doesNotMatch(html, /state-v1|share-ai-v1|carry-forward-share-v2|Portable AI State/);
});

test("the bundled font and its licence are kept in one place", () => {
  assert.equal(existsSync(new URL("public/brand/space-latin-20261018.woff2", root)), true);
  assert.equal(existsSync(new URL("public/brand/OFL-Space-Grotesk.txt", root)), true);
  assert.equal(existsSync(new URL("public/space-latin-20261018.woff2", root)), false);
  assert.equal(existsSync(new URL("public/OFL-Space-Grotesk.txt", root)), false);
  assert.match(readFileSync(new URL("public/style.css", root), "utf8"), /url\('\/brand\/space-latin-20261018\.woff2'\)/);
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
    ["Here / there", "herethere-small-20261018"],
    ["Linkarooie", "linkarooie-small-20261018"],
    ["Link Check", "linkcheck-small-20261018"],
    ["Hello World", "hello-small-20261018"],
    ["Carry / forward", "carryforward-small-20261018"],
    ["LDraw", "ldraw-tile-c9c2339a1296-d2e0dc4b-r2-96"],
  ]) {
    assert.ok(html.includes(name), name + " stays in the switcher");
    assert.ok(html.includes(`/brand/apps/${crop}.webp`), crop + " thumbnail stays in the switcher");
  }
  assert.match(html, /Carry \/ forward · Fictional example/);
});

// The authored row is the local navigation authority; the shared controller keeps
// the same named destination and its reviewed search aliases.
const destinations = [...html.matchAll(/<li data-destination>([\s\S]*?)<\/li>/g)].map(
  ([, body]) => ({
    body,
    href: body.match(/<a href="([^"]+)"/)?.[1] ?? "",
    label: (
      body.match(/<span>([^<]*)</)?.[1] ??
      body.match(/<a href="[^"]*"(?:\s[^>]*)?>\s*([^<]*)/)?.[1] ??
      ""
    ).trim(),
    image: body.match(/<img\s+src="([^"]+)"/)?.[1] ?? "",
    alt: body.match(/\salt="([^"]*)"/)?.[1],
    description: body.match(/<small>([^<]*)<\/small>/)?.[1] ?? "",
  }),
);

test("the authored LDraw destination sits after Carry / forward and before the Composer tasks", () => {
  const ldraw = destinations.filter((row) => row.label === "LDraw");
  assert.equal(ldraw.length, 1, "exactly one authored LDraw row");
  assert.equal(ldraw[0].href, "https://ldraw.loftwah.com/");
  assert.equal(ldraw[0].image, "/brand/apps/ldraw-tile-c9c2339a1296-d2e0dc4b-r2-96.webp");
  assert.equal(ldraw[0].alt, "", "the tile is decorative beside the label");
  assert.equal(ldraw[0].description, "Editable diagrams");
  assert.match(ldraw[0].body, /width="40"\s+height="40"/);
  const index = destinations.indexOf(ldraw[0]);
  assert.equal(destinations[index - 1].label, "Carry / forward");
  assert.ok(
    destinations.slice(index + 1).every((row) => !row.image),
    "the Composer task rows stay after the app rows",
  );
});

test("the local Apps menu controller is the reviewed Composer distribution with LDraw", () => {
  const launcher = readFileSync(new URL("public/brand/launcher.js", root));
  assert.equal(
    createHash("sha256").update(launcher).digest("hex"),
    "c952399adeb5fc8bfa8f7916222d2c57c1e792b2164807cb9b80592bd520c3cb",
    "public/brand/launcher.js must be the reviewed Composer distribution",
  );
  const code = launcher.toString("utf8");
  assert.match(
    code,
    /\{ name: "LDraw", href: "https:\/\/ldraw\.loftwah\.com\/", image: "apps\/ldraw-tile-c9c2339a1296-d2e0dc4b-r2-96\.webp", standaloneOnly: true, explainer: "\/ldraw", description: "Editable diagrams, PNG and SVG", keywords: "draw drawing diagram excalidraw scene png svg local offline" \}/,
  );
  // The same local controller keeps the documented keyboard and search paths.
  for (const pattern of [
    /event\.key === "Escape"/,
    /event\.key === "ArrowDown" \|\| event\.key === "ArrowUp"/,
    /event\.key === "Home"/,
    /event\.key === "End"/,
    /event\.key\.toLowerCase\(\) === "k"/,
    /event\.isComposing/,
    /keyCode === 229/,
    /normalize\("NFD"\)/,
    /\\p\{Diacritic\}/,
  ])
    assert.match(code, pattern);
});

test("the local LDraw tile is the reviewed 96px WebP and no drawn logo was added", () => {
  const tile = readFileSync(
    new URL("public/brand/apps/ldraw-tile-c9c2339a1296-d2e0dc4b-r2-96.webp", root),
  );
  assert.equal(tile.subarray(0, 4).toString("latin1"), "RIFF");
  assert.equal(tile.subarray(8, 12).toString("latin1"), "WEBP");
  assert.equal(
    createHash("sha256").update(tile).digest("hex"),
    "eeabb3049de7c9f830a9ded2e40a5014fbcd0fdb7c51373115ba45da2b15748f",
    "the committed tile must be the reviewed Composer export",
  );
  for (const path of ["/brand/ldraw", "/brand/apps/ldraw-icon", "ldraw-logo"])
    assert.equal(html.includes(path), false, "no invented LDraw mark " + path);
});
