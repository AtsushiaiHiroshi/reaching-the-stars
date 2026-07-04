import { mkdir, readFile, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { loadClassicLevel } from "./lib/foundry-leveldb.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const SOURCE = path.join(ROOT, "packs-src", "setting", "atlas");
const PACKS_ROOT = path.join(ROOT, "packs");
const OUTPUT = path.join(PACKS_ROOT, "setting-atlas");

if (!OUTPUT.startsWith(`${PACKS_ROOT}${path.sep}`)) throw new Error("Refusing to build outside the packs directory");

const journals = [];
for (const filename of (await readdir(SOURCE)).sort()) {
  if (filename.endsWith(".json")) journals.push(JSON.parse(await readFile(path.join(SOURCE, filename), "utf8")));
}
if (!journals.length) throw new Error("No JournalEntry sources found");

await rm(OUTPUT, { force: true, recursive: true });
await mkdir(OUTPUT, { recursive: true });

const { ClassicLevel, appPath } = await loadClassicLevel();
const database = new ClassicLevel(OUTPUT, { valueEncoding: "json" });
await database.open();

try {
  const operations = [];
  for (const journal of journals) {
    const pages = journal.pages;
    operations.push({
      type: "put",
      key: `!journal!${journal._id}`,
      value: { ...journal, pages: pages.map((page) => page._id) },
    });
    for (const page of pages) {
      operations.push({
        type: "put",
        key: `!journal.pages!${journal._id}.${page._id}`,
        value: page,
      });
    }
  }
  await database.batch(operations);
  await database.compactRange("\x00", "\xff");
} finally {
  await database.close();
}

console.log(
  JSON.stringify(
    {
      pack: path.relative(ROOT, OUTPUT).split(path.sep).join("/"),
      journals: journals.length,
      pages: journals.reduce((total, journal) => total + journal.pages.length, 0),
      foundryApp: appPath,
    },
    null,
    2,
  ),
);
