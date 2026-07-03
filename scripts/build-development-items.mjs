import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUTPUT = path.join(ROOT, "packs-src", "development");
const ABILITIES = ["str", "dex", "con", "int", "wis", "cha"];
const ABILITY_MAP = {
  Strength: "str",
  Dexterity: "dex",
  Constitution: "con",
  Intelligence: "int",
  Wisdom: "wis",
  Charisma: "cha",
  free: ABILITIES,
};
const SKILL_MAP = {
  Crafting: "crafting",
  Deception: "deception",
  Diplomacy: "diplomacy",
  Occultism: "occultism",
  Society: "society",
  Survival: "survival",
};
const FREQUENCY_MAP = {
  "once per hour": { max: 1, per: "PT1H" },
  "once per 10 minutes": { max: 1, per: "PT10M" },
  "once per day": { max: 1, per: "day" },
  "once per round": { max: 1, per: "round" },
};

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function stableId(type, slug) {
  return createHash("sha256")
    .update(`alcanzando-las-estrellas:${type}:${slug}`)
    .digest("base64url")
    .replace(/[-_]/g, "A")
    .slice(0, 16);
}

function publication() {
  return {
    license: "Custom",
    remaster: true,
    title: "Alcanzando las Estrellas (Development)",
  };
}

function stats() {
  return {
    coreVersion: "14.364",
    systemId: "sf2e",
    systemVersion: "1.2.0",
  };
}

function localizedFlags(es, en) {
  return {
    "alcanzando-las-estrellas": {
      development: true,
      localization: {
        es,
        en,
      },
    },
  };
}

function paragraphs(...values) {
  return values.filter(Boolean).map((value) => `<p>${value}</p>`).join("");
}

function sourceTrait(prototypeId) {
  return prototypeId.replace(/-development-prototype$/, "");
}

function strikeRule({ damage, traits, slug, label }) {
  const match = /1d(\d+)\s+(\w+)/i.exec(damage ?? "");
  if (!match) return null;
  return {
    category: "unarmed",
    damage: {
      base: {
        damageType: match[2].toLowerCase(),
        dice: 1,
        die: `d${match[1]}`,
      },
    },
    group: "brawling",
    img: "systems/sf2e/icons/default-icons/melee.svg",
    key: "Strike",
    label,
    range: null,
    slug,
    traits,
  };
}

function trainingRule(skill) {
  const pathName = SKILL_MAP[skill];
  return pathName
    ? {
        key: "ActiveEffectLike",
        mode: "upgrade",
        path: `system.skills.${pathName}.rank`,
        value: 1,
      }
    : null;
}

function saveBonusRule(mechanics) {
  const subjects = mechanics.against ?? (mechanics.choice ? mechanics.choice.split(" or ") : []);
  const supported = subjects.filter((value) => ["poison", "mental", "radiation", "force", "cold", "fire"].includes(value));
  if (!mechanics.saveBonus || !supported.length) return null;
  return {
    key: "FlatModifier",
    predicate: [
      {
        or: supported.map((value) => `item:trait:${value}`),
      },
    ],
    selector: "saving-throw",
    type: mechanics.bonusType ?? "circumstance",
    value: mechanics.saveBonus,
  };
}

function heritageRules(heritage) {
  const mechanics = heritage.mechanics;
  const rules = [];
  if (mechanics.ruleElement === "CreatureSize") {
    rules.push({ key: "CreatureSize", value: mechanics.value });
  }
  if (mechanics.ruleElement === "Sense") {
    rules.push({
      acuity: mechanics.acuity,
      key: "Sense",
      range: mechanics.range,
      selector: mechanics.selector,
    });
  }
  if (mechanics.ruleElement === "Strike") {
    const rule = strikeRule({
      damage: mechanics.damage,
      traits: mechanics.traits,
      slug: heritage.id,
      label: heritage.nameEn,
    });
    if (rule) rules.push(rule);
  }
  if (mechanics.trainedSkill) {
    const rule = trainingRule(mechanics.trainedSkill);
    if (rule) rules.push(rule);
  }
  if (mechanics.resistance) {
    rules.push({ key: "Resistance", type: mechanics.resistance, value: "max(1,floor(@actor.level/2))" });
  }
  const saveRule = saveBonusRule(mechanics);
  if (saveRule) rules.push(saveRule);
  return rules;
}

function featRules(feat) {
  if (feat.id !== "vector-bolt") return [];
  return [
    strikeRule({
      damage: "1d4 force",
      traits: ["magical", "unarmed"],
      slug: "vector-bolt",
      label: feat.nameEn,
    }),
  ].filter(Boolean);
}

function ancestryRules(prototype) {
  if (prototype.sourceName !== "Nuar") return [];
  return [
    strikeRule({
      damage: "1d6 piercing",
      traits: ["shove", "unarmed"],
      slug: "horns",
      label: "Horns",
    }),
  ];
}

function ancestryDocument(prototype) {
  const slug = slugify(prototype.sourceName);
  const boostEntries = Object.fromEntries(
    prototype.base.boosts.map((boost, index) => [String(index), { value: ABILITY_MAP[boost] ?? ABILITIES }]),
  );
  const flawEntries = prototype.base.flaw
    ? { "0": { value: [ABILITY_MAP[prototype.base.flaw]] } }
    : {};
  const descriptionEs = `Prototipo mecanico de desarrollo. Rasgo base: ${prototype.baselineFeature}`;
  const descriptionEn = `Development mechanical prototype. Baseline feature: ${prototype.baselineFeature}`;
  return {
    _id: stableId("ancestry", slug),
    img: "systems/sf2e/icons/default-icons/ancestry.svg",
    name: prototype.sourceName,
    system: {
      additionalLanguages: { count: 0, custom: "", value: [] },
      boosts: boostEntries,
      description: { value: paragraphs(descriptionEs, descriptionEn) },
      flaws: flawEntries,
      hands: prototype.base.hands,
      hp: prototype.base.hp,
      items: {},
      languages: { custom: "", value: ["common"] },
      publication: publication(),
      reach: 5,
      rules: ancestryRules(prototype),
      size: { small: "sm", medium: "med", large: "lg" }[prototype.base.size],
      speed: prototype.base.speed,
      traits: { rarity: "uncommon", value: prototype.base.traits },
      vision: { darkvision: "darkvision", "low-light": "low-light-vision", normal: "normal" }[prototype.base.vision],
      slug,
      _migration: { version: 0.959, previous: null },
    },
    type: "ancestry",
    _stats: stats(),
    effects: [],
    flags: localizedFlags(
      { name: prototype.sourceName, description: descriptionEs },
      { name: prototype.sourceName, description: descriptionEn },
    ),
  };
}

function heritageDocument(prototype, heritage, ancestryId) {
  const trait = sourceTrait(prototype.prototypeId);
  const descriptionEs = `Herencia de desarrollo. ${JSON.stringify(heritage.mechanics)}`;
  const descriptionEn = `Development heritage. ${JSON.stringify(heritage.mechanics)}`;
  return {
    _id: stableId("heritage", heritage.id),
    img: "systems/sf2e/icons/default-icons/heritage.svg",
    name: heritage.nameEs,
    system: {
      ancestry: {
        name: prototype.sourceName,
        slug: slugify(prototype.sourceName),
        uuid: `Compendium.alcanzando-las-estrellas.ale-ancestries.Item.${ancestryId}`,
      },
      description: { value: paragraphs(descriptionEs, descriptionEn) },
      publication: publication(),
      rules: heritageRules(heritage),
      traits: { rarity: "uncommon", value: [] },
      slug: heritage.id,
      _migration: { version: 0.959, previous: null },
    },
    type: "heritage",
    _stats: stats(),
    effects: [],
    flags: localizedFlags(
      { name: heritage.nameEs, description: descriptionEs },
      { name: heritage.nameEn, description: descriptionEn },
    ),
  };
}

function featDocument(prototype, feat) {
  const descriptionEs = [feat.mechanic, feat.trigger && `Desencadenante: ${feat.trigger}`, feat.duration && `Duracion: ${feat.duration}`]
    .filter(Boolean)
    .join(" ");
  const descriptionEn = [feat.mechanic, feat.trigger && `Trigger: ${feat.trigger}`, feat.duration && `Duration: ${feat.duration}`]
    .filter(Boolean)
    .join(" ");
  const system = {
    actionType: { value: feat.actionType },
    actions: { value: feat.actions ?? null },
    category: "ancestry",
    description: { value: paragraphs(descriptionEs, descriptionEn) },
    level: { value: feat.level },
    prerequisites: { value: feat.prerequisite ? [{ value: feat.prerequisite }] : [] },
    publication: publication(),
    rules: featRules(feat),
    subfeatures: { proficiencies: {}, senses: {}, suppressedFeatures: [] },
    traits: { rarity: "uncommon", value: [sourceTrait(prototype.prototypeId)] },
    slug: feat.id,
    _migration: { version: 0.959, previous: null },
  };
  if (feat.frequency) system.frequency = FREQUENCY_MAP[feat.frequency];
  return {
    _id: stableId("feat", feat.id),
    img: "systems/sf2e/icons/default-icons/feats-sf2e.webp",
    name: feat.nameEs,
    system,
    type: "feat",
    _stats: stats(),
    effects: [],
    flags: localizedFlags(
      { name: feat.nameEs, description: descriptionEs },
      { name: feat.nameEn, description: descriptionEn },
    ),
  };
}

async function writeDocuments(folder, documents) {
  const target = path.join(OUTPUT, folder);
  await mkdir(target, { recursive: true });
  for (const document of documents) {
    await writeFile(path.join(target, `${document.system.slug}.json`), `${JSON.stringify(document, null, 2)}\n`, "utf8");
  }
}

const ancestryData = JSON.parse(
  await readFile(path.join(ROOT, "data", "prototypes", "sf1e-ancestry-prototypes.json"), "utf8"),
);
const progressionData = JSON.parse(
  await readFile(path.join(ROOT, "data", "prototypes", "sf1e-heritage-feat-progression.json"), "utf8"),
);
const ancestryByPrototype = new Map(ancestryData.prototypes.map((entry) => [entry.id, entry]));

const ancestries = ancestryData.prototypes.map(ancestryDocument);
const ancestryIdBySlug = new Map(ancestries.map((entry) => [entry.system.slug, entry._id]));
const heritages = [];
const feats = [];
for (const progression of progressionData.progressions) {
  const ancestry = ancestryByPrototype.get(progression.prototypeId);
  if (!ancestry) throw new Error(`Unknown prototype: ${progression.prototypeId}`);
  const ancestryId = ancestryIdBySlug.get(slugify(ancestry.sourceName));
  heritages.push(...progression.heritages.map((entry) => heritageDocument({ ...progression, sourceName: ancestry.sourceName }, entry, ancestryId)));
  feats.push(...progression.feats.map((entry) => featDocument(progression, entry)));
}

await writeDocuments("ancestries", ancestries);
await writeDocuments("heritages", heritages);
await writeDocuments("feats", feats);
console.log(JSON.stringify({ ancestries: ancestries.length, heritages: heritages.length, feats: feats.length }, null, 2));
