import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SKIPPED_DIRECTORIES = new Set([".git", "node_modules", "tmp", "dist", "output"]);
const FORBIDDEN_EXTENSIONS = new Set([".pdf", ".epub", ".mobi", ".doc", ".docx", ".zip"]);
const errors = [];

async function collectFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && SKIPPED_DIRECTORIES.has(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectFiles(fullPath)));
    if (entry.isFile()) files.push(fullPath);
  }
  return files;
}

function relative(filename) {
  return path.relative(ROOT, filename).split(path.sep).join("/");
}

async function requirePath(relativePath, label) {
  try {
    await access(path.join(ROOT, relativePath));
  } catch {
    errors.push(`${label} points to a missing path: ${relativePath}`);
  }
}

const files = await collectFiles(ROOT);
const jsonFiles = files.filter((filename) => path.extname(filename).toLowerCase() === ".json");
const parsedJson = new Map();

for (const filename of jsonFiles) {
  try {
    parsedJson.set(relative(filename), JSON.parse(await readFile(filename, "utf8")));
  } catch (error) {
    errors.push(`${relative(filename)} is not valid JSON: ${error.message}`);
  }
}

for (const filename of files) {
  const extension = path.extname(filename).toLowerCase();
  if (FORBIDDEN_EXTENSIONS.has(extension)) {
    errors.push(`${relative(filename)} is a restricted source or distributable archive`);
  }
}

const manifest = parsedJson.get("module.json");
if (!manifest) {
  errors.push("module.json could not be read");
} else {
  if (manifest.id !== "reaching-the-stars") errors.push("module.json has an unexpected module id");
  if (manifest.title !== "Reaching the Stars") errors.push("module.json has an unexpected module title");
  if (manifest.compatibility?.minimum !== "14" || manifest.compatibility?.verified !== "14") {
    errors.push("module.json must retain Foundry VTT 14 minimum and verified compatibility");
  }
  const expectedPack = manifest.packs?.find((pack) => pack.name === "setting-atlas");
  if (manifest.packs?.length !== 1 || !expectedPack) errors.push("module.json must register only the original setting-atlas pack");
  if (expectedPack?.type !== "JournalEntry" || expectedPack?.path !== "packs/setting-atlas") {
    errors.push("setting-atlas must be a JournalEntry pack at packs/setting-atlas");
  }
  if (expectedPack?.system) errors.push("the setting-atlas pack must remain system-neutral");
  if (expectedPack?.path) await requirePath(expectedPack.path, "module.json setting-atlas pack");
  for (const script of manifest.esmodules ?? []) await requirePath(script, "module.json esmodules");
  for (const stylesheet of manifest.styles ?? []) await requirePath(stylesheet, "module.json styles");
  for (const language of manifest.languages ?? []) await requirePath(language.path, `language ${language.lang}`);
  if (manifest.readme) await requirePath(manifest.readme, "module.json readme");
  if (manifest.license) await requirePath(manifest.license, "module.json license");
}

const ledger = parsedJson.get("data/source-ledger.json");
if (!ledger?.sources?.length) {
  errors.push("data/source-ledger.json must contain at least one source record");
} else {
  const sourceIds = new Set();
  for (const source of ledger.sources) {
    if (sourceIds.has(source.id)) errors.push(`duplicate source ledger id: ${source.id}`);
    sourceIds.add(source.id);
    if (source.redistributeFile !== false) errors.push(`${source.id} must explicitly prohibit source-file redistribution`);
    if (!/^[A-F0-9]{64}$/.test(source.sha256 ?? "")) errors.push(`${source.id} has an invalid SHA-256 digest`);
    if (!Number.isInteger(source.pageCount) || source.pageCount < 1) errors.push(`${source.id} has an invalid page count`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      filesAudited: files.length,
      jsonParsed: jsonFiles.length,
      restrictedFilesFound: 0,
      distributablePacksRegistered: manifest?.packs?.length ?? 0,
      sourceRecords: ledger?.sources?.length ?? 0,
    },
    null,
    2,
  ),
);
