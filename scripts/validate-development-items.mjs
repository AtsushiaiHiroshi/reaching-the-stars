import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SOURCE = path.join(ROOT, "packs-src", "development");
const SUPPORTED_TYPES = new Set(["ancestry", "heritage", "feat"]);
const SUPPORTED_RULES = new Set([
  "ActiveEffectLike",
  "CreatureSize",
  "FlatModifier",
  "Resistance",
  "Sense",
  "Strike",
]);
const EXPECTED_COUNTS = { ancestry: 6, heritage: 18, feat: 30 };

const documents = [];
for (const folder of ["ancestries", "heritages", "feats"]) {
  for (const filename of await readdir(path.join(SOURCE, folder))) {
    if (!filename.endsWith(".json")) continue;
    documents.push(JSON.parse(await readFile(path.join(SOURCE, folder, filename), "utf8")));
  }
}

const errors = [];
const ids = new Set();
const slugs = new Set();
const counts = { ancestry: 0, heritage: 0, feat: 0 };
for (const document of documents) {
  if (!SUPPORTED_TYPES.has(document.type)) errors.push(`${document.name}: unsupported type ${document.type}`);
  counts[document.type] = (counts[document.type] ?? 0) + 1;
  if (!/^[A-Za-z0-9]{16}$/.test(document._id)) errors.push(`${document.name}: invalid 16-character ID`);
  if (ids.has(document._id)) errors.push(`${document.name}: duplicate ID ${document._id}`);
  ids.add(document._id);
  const slugKey = `${document.type}:${document.system?.slug}`;
  if (slugs.has(slugKey)) errors.push(`${document.name}: duplicate slug ${slugKey}`);
  slugs.add(slugKey);
  if (!document.system?.description?.value) errors.push(`${document.name}: missing description`);
  if (!document.system?.publication) errors.push(`${document.name}: missing publication metadata`);
  if (!Array.isArray(document.system?.rules)) errors.push(`${document.name}: rules must be an array`);
  for (const rule of document.system?.rules ?? []) {
    if (!SUPPORTED_RULES.has(rule.key)) errors.push(`${document.name}: unsupported Rule Element ${rule.key}`);
  }
  if (document.type === "feat" && ![1, 5, 9, 13, 17].includes(document.system.level?.value)) {
    errors.push(`${document.name}: unexpected feat level ${document.system.level?.value}`);
  }
}

const ancestryIds = new Set(documents.filter((entry) => entry.type === "ancestry").map((entry) => entry._id));
for (const heritage of documents.filter((entry) => entry.type === "heritage")) {
  const linkedId = heritage.system.ancestry?.uuid?.split(".").at(-1);
  if (!ancestryIds.has(linkedId)) errors.push(`${heritage.name}: broken ancestry UUID`);
}
for (const [type, expected] of Object.entries(EXPECTED_COUNTS)) {
  if (counts[type] !== expected) errors.push(`Expected ${expected} ${type} documents, found ${counts[type]}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      documents: documents.length,
      counts,
      uniqueIds: ids.size,
      ruleElements: [...new Set(documents.flatMap((entry) => entry.system.rules.map((rule) => rule.key)))].sort(),
    },
    null,
    2,
  ),
);
