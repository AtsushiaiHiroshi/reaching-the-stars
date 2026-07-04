# Development pack sources

These JSON documents follow the installed SF2e 1.2.0 Item shapes but are not declared as Foundry compendium packs.

Run the deterministic generator with:

```powershell
node scripts/build-development-items.mjs
node scripts/validate-development-items.mjs
```

The generated development tree contains six ancestries, eighteen heritages, and thirty feats. Complex abilities intentionally remain descriptive until their action economy and Rule Elements have been tested. The PDFs used for research are never copied into this repository.

`setting/atlas/` contains system-neutral JournalEntry sources generated from the original setting atlas. Unlike the adapted species, this content does not depend on converted third-party material and is compiled into the distributable `packs/setting-atlas` compendium.

```powershell
node scripts/build-setting-journals.mjs
node scripts/validate-setting-journals.mjs
node scripts/build-setting-pack.mjs
node scripts/validate-setting-pack.mjs
```

Do not add the development Item folders to `module.json` until the licensing gate and Foundry validation checklist are complete.
