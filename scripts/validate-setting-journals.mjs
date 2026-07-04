import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SOURCE = path.join(ROOT, "packs-src", "setting", "atlas");
const errors = [];
const ids = new Set();
const journals = [];

for (const filename of await readdir(SOURCE)) {
  if (filename.endsWith(".json")) journals.push(JSON.parse(await readFile(path.join(SOURCE, filename), "utf8")));
}

for (const journal of journals) {
  if (!/^[A-Za-z0-9]{16}$/.test(journal._id)) errors.push(`${journal.name}: invalid journal ID`);
  if (journal._stats?.systemId !== null || journal._stats?.systemVersion !== null) errors.push(`${journal.name}: journal must remain system-neutral`);
  if (journal.flags?.["reaching-the-stars"]?.canonStatus !== "provisional") errors.push(`${journal.name}: unexpected canon status`);
  if (!Array.isArray(journal.pages) || !journal.pages.length) errors.push(`${journal.name}: missing pages`);
  for (const document of [journal, ...(journal.pages ?? [])]) {
    if (ids.has(document._id)) errors.push(`${journal.name}: duplicate document ID ${document._id}`);
    ids.add(document._id);
  }
  for (const page of journal.pages ?? []) {
    if (page.type !== "text" || page.text?.format !== 1 || !page.text?.content) errors.push(`${journal.name}/${page.name}: invalid text page`);
    if (page._stats?.coreVersion !== "14.364") errors.push(`${journal.name}/${page.name}: unexpected core schema version`);
    if (page._stats?.systemId !== null) errors.push(`${journal.name}/${page.name}: page must remain system-neutral`);
    if (!Number.isInteger(page.sort) || page.sort < 1) errors.push(`${journal.name}/${page.name}: invalid sort order`);
  }
}

const expectedPages = 1 + 5 + 3;
if (journals.length !== 1) errors.push(`expected 1 atlas journal, found ${journals.length}`);
if ((journals[0]?.pages.length ?? 0) !== expectedPages) errors.push(`expected ${expectedPages} atlas pages, found ${journals[0]?.pages.length ?? 0}`);

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(JSON.stringify({ journals: journals.length, pages: journals[0].pages.length, uniqueIds: ids.size, systemNeutral: true }, null, 2));
