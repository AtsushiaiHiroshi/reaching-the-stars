# Atlas en Foundry

La Orla de Ceniza se genera como un `JournalEntry` neutral compatible con el esquema documental de Foundry VTT 14.364.

## Estructura actual

- una entrada de diario: **Atlas: La Orla de Ceniza**;
- una pagina general del sector;
- cinco paginas de sistemas con sus lugares y culturas;
- una pagina de facciones;
- una pagina de conflictos;
- una pagina de creencias y filosofias.

El resultado contiene nueve paginas y diez IDs deterministas contando la entrada principal. Los metadatos `systemId` y `systemVersion` son nulos para permitir su uso con SF2e y con otros sistemas.

## Compendio distribuible

La fuente JSON permanece en `packs-src/setting/atlas/` y se compila como LevelDB en `packs/setting-atlas/`. `module.json` lo declara como el compendio neutral **Reaching the Stars: Atlas**, visible para jugadores y editable por asistentes.

```powershell
node scripts/build-setting-pack.mjs
node scripts/validate-setting-pack.mjs
```

El compilador usa la biblioteca `classic-level` incluida en Foundry VTT y comprueba que cada pagina almacenada coincida con su fuente JSON.

Las especies adaptadas siguen en un arbol de desarrollo distinto y no se mezclan con este atlas original.

## Referencias tecnicas

- [JournalEntryData en Foundry VTT 14](https://foundryvtt.com/api/v14/interfaces/foundry.documents.types.JournalEntryData.html)
- [JournalEntryPageData en Foundry VTT 14](https://foundryvtt.com/api/v14/interfaces/foundry.documents.types.JournalEntryPageData.html)
