import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { lstatSync, readFileSync, realpathSync } from "node:fs";
import { resolve } from "node:path";
import {
  createGitHubAdapter,
  createReleaseRun,
} from "./scripts/lib/release-timing.mjs";

const REPO = "loftwah/app-composer-state";
const TARGET = "https://ai.loftwah.com";
const git = (args) => execFileSync("git", args, { encoding: "utf8" }).trim();

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.once("error", reject);
    child.once("close", (code, signal) => {
      if (code === 0) resolve();
      else
        reject(new Error(`${command} ${args[0]} failed (${signal ?? code})`));
    });
  });
}
if (git(["status", "--porcelain"]))
  throw new Error("Commit reviewed source before release");
if (
  git(["branch", "--show-current"]) !== "main" ||
  git(["rev-parse", "HEAD"]) !== git(["rev-parse", "origin/main"])
)
  throw new Error("Production requires exact reviewed pushed main");
// Bind verification and upload to this candidate, never a newly read post-build SHA.
const sha = git(["rev-parse", "HEAD"]);
const root = realpathSync(".");
const remote = git(["remote", "get-url", "origin"]);
const targetConfig = readFileSync("wrangler.jsonc");
const objectFormat = git(["rev-parse", "--show-object-format"]);
const files = git(["ls-tree", "-r", "-z", sha])
  .split("\0")
  .filter(Boolean)
  .map((entry) => {
    const match = /^(100644|100755) blob ([a-f0-9]+)\t([\s\S]+)$/.exec(entry);
    if (!match)
      throw new Error("Release source must contain regular tracked files");
    return { mode: match[1], hash: match[2], path: resolve(root, match[3]) };
  });
// Compare actual bytes with the captured Git tree, including assume-unchanged and
// skip-worktree files that status alone can miss. Config is also pinned explicitly.
const unchanged = () => {
  try {
    if (
      git(["status", "--porcelain"]) ||
      git(["branch", "--show-current"]) !== "main" ||
      git(["rev-parse", "HEAD"]) !== sha ||
      git(["rev-parse", "refs/remotes/origin/main"]) !== sha ||
      git(["remote", "get-url", "origin"]) !== remote ||
      !readFileSync("wrangler.jsonc").equals(targetConfig)
    )
      throw new Error("Source or target identity changed");
    for (const file of files) {
      const stat = lstatSync(file.path);
      if (
        !stat.isFile() ||
        realpathSync(file.path) !== file.path ||
        Boolean(stat.mode & 0o111) !== (file.mode === "100755")
      )
        throw new Error("Tracked file type changed");
      const bytes = readFileSync(file.path);
      const hash = createHash(objectFormat)
        .update(`blob ${bytes.length}\0`)
        .update(bytes)
        .digest("hex");
      if (hash !== file.hash) throw new Error("Tracked source bytes changed");
    }
  } catch (cause) {
    throw new Error(
      "The reviewed workspace changed during release verification.",
      { cause },
    );
  }
};
unchanged();

// Release timing is tooling only. One monotonic run id spans the existing
// qualification, upload and exact live-identity checks; adding the clock never
// changes the guard, candidate SHA, upload argv or live verification below.
let github = null;
try {
  github = createGitHubAdapter({ repo: REPO });
} catch (error) {
  console.error(
    "Delivery SLA reporting is unavailable; a redacted pending event will be queued. " +
      error.message,
  );
}
const release = createReleaseRun({
  repo: REPO,
  project: "app-composer-state",
  sha,
  releasePath: "deploy.mjs",
  kind: "worker-production",
  receiptDir: ".release/timing",
  firstEditAt: process.env.STATE_FIRST_EDIT_AT,
  github,
});
const alertPoll = setInterval(() => {
  void release.checkThreshold().catch(() => {
    console.error("Delivery SLA could not persist the in-progress alert.");
  });
}, 1000);
alertPoll.unref();

try {
  const pending = await release.flushPending();
  if (pending.blocked || pending.remaining)
    console.error(
      `Delivery SLA: ${pending.remaining} redacted alert(s) queued in .release/timing/pending for retry on the next release run.`,
    );
  await release.stage("required checks", () => run("pnpm", ["check"]));
  await release.stage("dry-run build", () => run("pnpm", ["build"]));
  await release.stage("post-build reviewed source preflight", () =>
    unchanged(),
  );
  await release.stage("provider upload", () =>
    run("pnpm", [
      "wrangler",
      "deploy",
      "--config",
      "wrangler.jsonc",
      "--env=",
      "--define",
      "BUILD_SHA:" + JSON.stringify(sha),
    ]),
  );

  let verified = false;
  await release.stage("exact live identity", async () => {
    for (let attempt = 0; attempt < 12; attempt++) {
      try {
        const response = await fetch(TARGET + "/build.json", {
          headers: { "User-Agent": "Mozilla/5.0 (AppComposer verification)" },
          signal: AbortSignal.timeout(10000),
        });
        const build = response.ok ? await response.json() : null;
        if (build?.commit === sha) {
          release.note("syntheticOnly", build.syntheticOnly === true);
          verified = true;
          break;
        }
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  });
  if (!verified) throw new Error("Live source identity did not converge");
  // Assets can briefly 404 while a new deployment propagates to the edge, so retry
  // the sharing probe instead of failing on a cold edge.
  let sharingVerified = false;
  await release.stage("live sharing card", async () => {
    for (let attempt = 0; attempt < 8; attempt++) {
      try {
        await run(process.execPath, ["scripts/verify-sharing.mjs"]);
        sharingVerified = true;
        break;
      } catch (error) {
        if (attempt === 7) throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 2500));
    }
  });
  if (!sharingVerified) throw new Error("Live sharing card did not converge");

  const receipt = await release.finish({
    status: "passed",
    target: TARGET,
    liveRevision: sha,
  });
  console.log("Verified live state " + sha);
  console.log(
    `release ${receipt.status}: ${(receipt.totalMs / 1000).toFixed(1)}s ` +
      `(target ${(receipt.targetMs / 1000).toFixed(0)}s, limit ${(receipt.limitMs / 1000).toFixed(0)}s)` +
      ` run ${receipt.runId}`,
  );
} catch (error) {
  await release.fail(error, { target: TARGET });
  throw error;
} finally {
  clearInterval(alertPoll);
}
