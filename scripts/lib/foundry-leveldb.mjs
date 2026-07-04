import { createRequire } from "node:module";
import { access } from "node:fs/promises";
import path from "node:path";

async function isDirectoryCandidate(candidate) {
  try {
    await access(path.join(candidate, "node_modules", "classic-level"));
    return true;
  } catch {
    return false;
  }
}

export async function resolveFoundryApp() {
  const candidates = [
    process.env.FOUNDRY_APP_PATH,
    process.platform === "win32" ? "C:\\Program Files\\Foundry Virtual Tabletop\\resources\\app" : null,
    process.platform === "win32" && process.env.LOCALAPPDATA
      ? path.join(process.env.LOCALAPPDATA, "Programs", "Foundry Virtual Tabletop", "resources", "app")
      : null,
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (await isDirectoryCandidate(candidate)) return candidate;
  }
  throw new Error("Foundry VTT application not found. Set FOUNDRY_APP_PATH to its resources/app directory.");
}

export async function loadClassicLevel() {
  const appPath = await resolveFoundryApp();
  const require = createRequire(import.meta.url);
  const { ClassicLevel } = require(path.join(appPath, "node_modules", "classic-level"));
  return { ClassicLevel, appPath };
}
