import { mkdir, readFile, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { loadClassicLevel } from "./lib/foundry-leveldb.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const SOURCE_ROOT = path.join(ROOT, "packs-src", "development");
const PACKS_ROOT = path.join(ROOT, "packs");
const CONFIGURATIONS = [
  { source: "ancestries", pack: "rts-ancestries", type: "ancestry" },
  { source: "heritages", pack: "rts-heritages", type: "heritage" },
  { source: "feats", pack: "rts-feats", type: "feat" },
];
const { ClassicLevel, appPath } = await loadClassicLevel();
const results = [];

for (const configuration of CONFIGURATIONS) {
  const sourceDirectory = path.join(SOURCE_ROOT, configuration.source);
  const output = path.join(PACKS_ROOT, configuration.pack);
  if (!output.startsWith(`${PACKS_ROOT}${path.sep}`)) throw new Error("Refusing to build outside the packs directory");

  const documents = [];
  for (const filename of (await readdir(sourceDirectory)).sort()) {
    if (!filename.endsWith(".json")) continue;
    const document = JSON.parse(await readFile(path.join(sourceDirectory, filename), "utf8"));
    if (document.type !== configuration.type) throw new Error(`${filename} has type ${document.type}, expected ${configuration.type}`);
    documents.push(document);
  }

  await rm(output, { force: true, recursive: true });
  await mkdir(output, { recursive: true });
  const database = new ClassicLevel(output, { valueEncoding: "json" });
  await database.open();
  try {
    await database.batch(
      documents.map((document) => ({
        type: "put",
        key: `!items!${document._id}`,
        value: document,
      })),
    );
    await database.compactRange("\x00", "\xff");
  } finally {
    await database.close();
  }
  results.push({ pack: configuration.pack, documents: documents.length, type: configuration.type });
}

console.log(JSON.stringify({ foundryApp: appPath, packs: results }, null, 2));
