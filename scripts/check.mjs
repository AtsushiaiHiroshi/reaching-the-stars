import { spawnSync } from "node:child_process";
import path from "node:path";

const scripts = [
  "build-development-items.mjs",
  "validate-development-items.mjs",
  "validate-repository.mjs",
];

for (const script of scripts) {
  const result = spawnSync(process.execPath, [path.join(import.meta.dirname, script)], {
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
