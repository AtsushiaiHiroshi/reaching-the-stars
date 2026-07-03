# Development pack sources

These JSON documents follow the installed SF2e 1.2.0 Item shapes but are not declared as Foundry compendium packs.

Run the deterministic generator with:

```powershell
node scripts/build-development-items.mjs
node scripts/validate-development-items.mjs
```

The generated development tree contains six ancestries, eighteen heritages, and thirty feats. Complex abilities intentionally remain descriptive until their action economy and Rule Elements have been tested. The PDFs used for research are never copied into this repository.

Do not add these folders to `module.json` until the licensing gate and Foundry validation checklist are complete.
