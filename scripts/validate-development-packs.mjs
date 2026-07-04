import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { loadClassicLevel } from "./lib/foundry-leveldb.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const SOURCE_ROOT = path.join(ROOT, "packs-src", "development");
const PACKS_ROOT = path.join(ROOT, "packs");
const CONFIGURATIONS = [
  { source: "ancestries", pack: "rts-ancestries", expected: 6, type: "ancestry" },
  { source: "heritages", pack: "rts-heritages", expected: 18, type: "heritage" },
  { source: "feats", pack: "rts-feats", expected: 30, type: "feat" },
];
const { ClassicLevel } = await loadClassicLevel();
const errors = [];
const results = [];

for (const configuration of CONFIGURATIONS) {
  const sourceDirectory = path.join(SOURCE_ROOT, configuration.source);
  const sources = [];
  for (const filename of (await readdir(sourceDirectory)).sort()) {
    if (filename.endsWith(".json")) sources.push(JSON.parse(await readFile(path.join(sourceDirectory, filename), "utf8")));
  }
  if (sources.length !== configuration.expected) {
    errors.push(`${configuration.pack}: expected ${configuration.expected} sources, found ${sources.length}`);
  }

  const database = new ClassicLevel(path.join(PACKS_ROOT, configuration.pack), { valueEncoding: "json" });
  await database.open();
  let actualKeys = 0;
  try {
    for (const source of sources) {
      const stored = await database.get(`!items!${source._id}`);
      if (JSON.stringify(stored) !== JSON.stringify(source)) errors.push(`${configuration.pack}/${source.system.slug}: stored Item differs from source`);
    }
    for await (const _ of database.keys()) actualKeys += 1;
  } finally {
    await database.close();
  }
  if (actualKeys !== sources.length) errors.push(`${configuration.pack}: expected ${sources.length} keys, found ${actualKeys}`);
  results.push({ pack: configuration.pack, documents: sources.length, levelDbKeys: actualKeys, type: configuration.type });
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(JSON.stringify({ packs: results, totalDocuments: results.reduce((total, result) => total + result.documents, 0) }, null, 2));
