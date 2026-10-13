import { execFileSync } from "node:child_process";
const git = (args) => execFileSync("git", args, { encoding: "utf8" }).trim();
if (git(["status", "--porcelain"]))
  throw new Error("Commit reviewed source before release");
if (
  git(["branch", "--show-current"]) !== "main" ||
  git(["rev-parse", "HEAD"]) !== git(["rev-parse", "origin/main"])
)
  throw new Error("Production requires exact reviewed pushed main");
if (execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" }).trim())
  throw new Error("Commit source before deploying");
execFileSync("pnpm", ["test"], { stdio: "inherit" });
const sha = execFileSync("git", ["rev-parse", "HEAD"], {
  encoding: "utf8",
}).trim();
execFileSync(
  "pnpm",
  ["wrangler", "deploy", "--define", "BUILD_SHA:" + JSON.stringify(sha)],
  { stdio: "inherit" },
);

let verified = false;
for (let attempt = 0; attempt < 12; attempt++) {
  try {
    const response = await fetch("https://ai.loftwah.com/build.json", {
      headers: { "User-Agent": "Mozilla/5.0 (AppComposer verification)" },
      signal: AbortSignal.timeout(10000),
    });
    if (response.ok && (await response.json()).commit === sha) {
      verified = true;
      break;
    }
  } catch {}
  await new Promise((resolve) => setTimeout(resolve, 1500));
}
if (!verified) throw new Error("Live source identity did not converge");
console.log("Verified live state " + sha);
