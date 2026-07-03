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

## Estado de publicacion

La fuente JSON permanece en `packs-src/setting/atlas/`. Todavia no se declara como compendio en `module.json`: primero debe compilarse a LevelDB y abrirse dentro de Foundry v14 para verificar navegacion, permisos y presentacion.

Las especies adaptadas siguen en un arbol de desarrollo distinto y no se mezclan con este atlas original.

## Referencias tecnicas

- [JournalEntryData en Foundry VTT 14](https://foundryvtt.com/api/v14/interfaces/foundry.documents.types.JournalEntryData.html)
- [JournalEntryPageData en Foundry VTT 14](https://foundryvtt.com/api/v14/interfaces/foundry.documents.types.JournalEntryPageData.html)
