import { readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const atlas = JSON.parse(await readFile(path.join(ROOT, "data", "setting", "atlas.json"), "utf8"));
const errors = [];
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const collections = ["sectors", "systems", "locations", "cultures", "beliefs", "factions", "conflicts"];
const indexes = new Map();

for (const collectionName of collections) {
  const collection = atlas[collectionName];
  if (!Array.isArray(collection)) {
    errors.push(`${collectionName} must be an array`);
    continue;
  }
  const index = new Map();
  for (const entry of collection) {
    if (!ID_PATTERN.test(entry.id ?? "")) errors.push(`${collectionName} has invalid id: ${entry.id}`);
    if (index.has(entry.id)) errors.push(`${collectionName} has duplicate id: ${entry.id}`);
    if (!entry.name || !entry.summary && collectionName !== "beliefs" && collectionName !== "factions") {
      errors.push(`${collectionName}/${entry.id} is missing name or summary`);
    }
    index.set(entry.id, entry);
  }
  indexes.set(collectionName, index);
}

function checkReferences(owner, ids, targetCollection) {
  for (const id of ids ?? []) {
    if (!indexes.get(targetCollection)?.has(id)) errors.push(`${owner} references missing ${targetCollection}/${id}`);
  }
}

for (const sector of atlas.sectors ?? []) {
  checkReferences(`sector/${sector.id}`, sector.systemIds, "systems");
  checkReferences(`sector/${sector.id}`, sector.factionIds, "factions");
  checkReferences(`sector/${sector.id}`, sector.conflictIds, "conflicts");
}
for (const system of atlas.systems ?? []) {
  if (!indexes.get("sectors")?.has(system.sectorId)) errors.push(`system/${system.id} has missing sector ${system.sectorId}`);
  checkReferences(`system/${system.id}`, system.locationIds, "locations");
  checkReferences(`system/${system.id}`, system.cultureIds, "cultures");
  const { q, r, s } = system.coordinates ?? {};
  if (![q, r, s].every(Number.isInteger) || q + r + s !== 0) errors.push(`system/${system.id} has invalid cube coordinates`);
}
for (const location of atlas.locations ?? []) {
  if (!indexes.get("systems")?.has(location.systemId)) errors.push(`location/${location.id} has missing system ${location.systemId}`);
}
for (const culture of atlas.cultures ?? []) checkReferences(`culture/${culture.id}`, culture.beliefIds, "beliefs");
for (const conflict of atlas.conflicts ?? []) checkReferences(`conflict/${conflict.id}`, conflict.participantIds, "factions");

if (atlas.metaphysics?.objectiveDeitiesExist !== false) errors.push("setting metaphysics must explicitly reject objective deities");
if (atlas.canonStatus !== "provisional") errors.push("new atlas content must remain provisional during review");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(JSON.stringify(Object.fromEntries(collections.map((name) => [name, atlas[name].length])), null, 2));
