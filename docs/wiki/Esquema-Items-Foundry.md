# Esquema de Items Foundry

Los prototipos se generan como documentos Item compatibles con la forma de datos de SF2e 1.2.0 y se compilan en tres compendios de desarrollo. Los ve el GM y los asistentes; permanecen ocultos para jugadores mientras no superen las revisiones mecanica, editorial y legal.

## Documentos generados

| Tipo | Cantidad |
| --- | ---: |
| Ascendencia | 6 |
| Herencia | 18 |
| Dote de ascendencia | 30 |
| Total | 54 |

## Automatizacion segura

- `ActiveEffectLike` para entrenamiento de habilidades.
- `CreatureSize` para cambios de tamano.
- `FlatModifier` para bonificadores circunstanciales acotados.
- `Resistance` para resistencia de fuerza.
- `Sense` para pensamientos y otros sentidos.
- `Strike` para cuernos, garras y rayos vectoriales.

## Automatizacion aplazada

Fase, curacion, identidades preparadas, cromatoforos, espacios de aumentos, manos activas y rerolls permanecen descritos en texto. Requieren pruebas dentro de Foundry antes de recibir elementos de reglas.

## Reproduccion

```powershell
node scripts/build-development-items.mjs
node scripts/validate-development-items.mjs
```

La generacion usa IDs deterministas y UUID cruzados entre herencias y ascendencias. La licencia interna se etiqueta como `Custom` mientras no exista una declaracion final de material licenciado y reservado.

## Compendios de desarrollo

- `Reaching the Stars: Ancestries (Development)` — 6 Items.
- `Reaching the Stars: Heritages (Development)` — 18 Items.
- `Reaching the Stars: Ancestry Feats (Development)` — 30 Items.

```powershell
node scripts/build-development-packs.mjs
node scripts/validate-development-packs.mjs
```
