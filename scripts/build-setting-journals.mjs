import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUTPUT = path.join(ROOT, "packs-src", "setting", "atlas");
const atlas = JSON.parse(await readFile(path.join(ROOT, "data", "setting", "atlas.json"), "utf8"));

function stableId(kind, slug) {
  return createHash("sha256")
    .update(`reaching-the-stars:${kind}:${slug}`)
    .digest("base64url")
    .replace(/[-_]/g, "A")
    .slice(0, 16);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function stats() {
  return {
    compendiumSource: null,
    coreVersion: "14.364",
    createdTime: null,
    duplicateSource: null,
    lastModifiedBy: null,
    modifiedTime: null,
    systemId: null,
    systemVersion: null,
  };
}

function list(values) {
  return `<ul>${values.map((value) => `<li>${escapeHtml(value)}</li>`).join("")}</ul>`;
}

function page(slug, name, content, sort, sourceType, sourceId) {
  return {
    _id: stableId("journal-page", slug),
    _stats: stats(),
    category: null,
    flags: {
      "reaching-the-stars": {
        generated: true,
        sourceId,
        sourceType,
      },
    },
    image: {},
    name,
    ownership: { default: 0 },
    sort,
    src: null,
    system: {},
    text: { content, format: 1, markdown: "" },
    title: { level: 1, show: true },
    type: "text",
    video: { controls: true, volume: 0.5 },
  };
}

function systemPage(system, sort) {
  const locations = atlas.locations.filter((entry) => entry.systemId === system.id);
  const cultures = system.cultureIds.map((id) => atlas.cultures.find((entry) => entry.id === id));
  const content = [
    `<p>${escapeHtml(system.summary)}</p>`,
    `<p><strong>Primaria:</strong> ${escapeHtml(system.primary)}. <strong>Coordenadas:</strong> (${system.coordinates.q}, ${system.coordinates.r}, ${system.coordinates.s}).</p>`,
    "<h2>Lugares</h2>",
    ...locations.map((location) => `<h3>${escapeHtml(location.name)}</h3><p><em>${escapeHtml(location.type)}</em>. ${escapeHtml(location.summary)}</p>`),
    cultures.length ? `<h2>Culturas</h2>${cultures.map((culture) => `<h3>${escapeHtml(culture.name)}</h3><p>${escapeHtml(culture.summary)}</p>`).join("")}` : "",
    `<h2>Etiquetas</h2>${list(system.tags)}`,
  ].join("");
  return page(`system-${system.id}`, system.name, content, sort, "system", system.id);
}

function collectionPage(slug, name, entries, renderEntry, sort, sourceType) {
  return page(slug, name, entries.map(renderEntry).join(""), sort, sourceType, "collection");
}

const journals = atlas.sectors.map((sector) => {
  const systems = sector.systemIds.map((id) => atlas.systems.find((entry) => entry.id === id));
  const factions = sector.factionIds.map((id) => atlas.factions.find((entry) => entry.id === id));
  const conflicts = sector.conflictIds.map((id) => atlas.conflicts.find((entry) => entry.id === id));
  const overview = [
    `<p>${escapeHtml(sector.summary)}</p>`,
    `<p><strong>Estado:</strong> ${escapeHtml(sector.status)}. Una unidad de coordenadas equivale a un salto narrativo.</p>`,
    `<h2>Temas</h2>${list(sector.themes)}`,
    `<h2>Metafisica</h2><p>${escapeHtml(atlas.metaphysics.rule)}</p>`,
  ].join("");
  const pages = [
    page(`sector-${sector.id}`, sector.name, overview, 100000, "sector", sector.id),
    ...systems.map((system, index) => systemPage(system, (index + 2) * 100000)),
    collectionPage(
      `${sector.id}-factions`,
      "Facciones",
      factions,
      (entry) => `<h2>${escapeHtml(entry.name)}</h2><p>${escapeHtml(entry.goal)}</p><p><strong>Metodos:</strong> ${escapeHtml(entry.methods.join(", "))}.</p>`,
      700000,
      "factions",
    ),
    collectionPage(
      `${sector.id}-conflicts`,
      "Conflictos",
      conflicts,
      (entry) => `<h2>${escapeHtml(entry.name)}</h2><p><strong>${escapeHtml(entry.status)}.</strong> ${escapeHtml(entry.summary)}</p>`,
      800000,
      "conflicts",
    ),
    collectionPage(
      `${sector.id}-beliefs`,
      "Creencias y filosofias",
      atlas.beliefs,
      (entry) => `<h2>${escapeHtml(entry.name)}</h2><p>${escapeHtml(entry.claim)}</p><p><em>Estado: ${escapeHtml(entry.status)}.</em></p>`,
      900000,
      "beliefs",
    ),
  ];
  return {
    _id: stableId("journal", sector.id),
    _stats: stats(),
    categories: [],
    flags: {
      "reaching-the-stars": {
        canonStatus: atlas.canonStatus,
        generated: true,
        sourceId: sector.id,
        sourceType: "sector",
      },
    },
    folder: null,
    name: `Atlas: ${sector.name}`,
    ownership: { default: 0 },
    pages,
    sort: 0,
  };
});

await mkdir(OUTPUT, { recursive: true });
for (const journal of journals) {
  const slug = journal.flags["reaching-the-stars"].sourceId;
  await writeFile(path.join(OUTPUT, `${slug}.json`), `${JSON.stringify(journal, null, 2)}\n`, "utf8");
}

console.log(JSON.stringify({ journals: journals.length, pages: journals.reduce((total, journal) => total + journal.pages.length, 0) }, null, 2));
