import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { loadClassicLevel } from "./lib/foundry-leveldb.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const SOURCE = path.join(ROOT, "packs-src", "setting", "atlas");
const PACK = path.join(ROOT, "packs", "setting-atlas");
const errors = [];
const sources = [];

for (const filename of (await readdir(SOURCE)).sort()) {
  if (filename.endsWith(".json")) sources.push(JSON.parse(await readFile(path.join(SOURCE, filename), "utf8")));
}

const { ClassicLevel } = await loadClassicLevel();
const database = new ClassicLevel(PACK, { valueEncoding: "json" });
await database.open();

let journalCount = 0;
let pageCount = 0;
try {
  for (const source of sources) {
    const storedJournal = await database.get(`!journal!${source._id}`);
    journalCount += 1;
    const expectedPageIds = source.pages.map((page) => page._id);
    if (JSON.stringify(storedJournal.pages) !== JSON.stringify(expectedPageIds)) {
      errors.push(`${source.name}: stored page index differs from source`);
    }
    for (const page of source.pages) {
      const storedPage = await database.get(`!journal.pages!${source._id}.${page._id}`);
      pageCount += 1;
      if (JSON.stringify(storedPage) !== JSON.stringify(page)) errors.push(`${source.name}/${page.name}: stored page differs from source`);
    }
  }

  const expectedKeys = sources.reduce((total, journal) => total + 1 + journal.pages.length, 0);
  let actualKeys = 0;
  for await (const _ of database.keys()) actualKeys += 1;
  if (actualKeys !== expectedKeys) errors.push(`expected ${expectedKeys} database keys, found ${actualKeys}`);
} finally {
  await database.close();
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(JSON.stringify({ journals: journalCount, pages: pageCount, levelDbKeys: journalCount + pageCount }, null, 2));
