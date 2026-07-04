# Reaching the Stars

**Alcanzando las Estrellas** en espanol. Base de desarrollo de una ambientacion de ciencia ficcion sin deidades objetivamente existentes. Su primera integracion mecanica esta destinada a Starfinder Segunda Edicion, pero el lore y las herramientas genericas se mantienen separados mediante adaptadores.

## Arquitectura

- `data/`: registros neutrales de fuentes, conceptos y procedencia.
- `data/setting/`: atlas neutral de sistemas, lugares, culturas, facciones y conflictos.
- `scripts/`: nucleo del modulo y adaptadores de sistema.
- `docs/`: biblia del mundo, politica de conversion y control de licencias.
- `docs/wiki/`: fuente versionada de la Wiki de GitHub.
- `packs-src/development/`: Items SF2e generados que aun no se distribuyen como compendio.
- `packs/setting-atlas/`: compendio neutral de diarios con el atlas original.
- futuros `packs/setting-*`: diarios, tablas y ambientacion neutrales.
- futuros `packs/sf2e-*`: ascendencias, dotes y equipo exclusivos del adaptador SF2e.

No se modifican los archivos del sistema `sf2e`. Esto evita que una actualizacion borre el proyecto.

El inventario inicial separa las referencias culturales de las fuentes que permiten redistribucion. Una coincidencia en el catalogo de investigacion nunca autoriza copiar nombres, texto, arte o mecanicas cerradas.

El codigo se publica bajo MIT. El contenido creativo y las obligaciones de licencias de terceros se documentan por separado en `CONTENT-LICENSE.md`.

## Validacion

Con Node.js 20.11 o posterior:

```powershell
npm run check
```

Si npm no esta disponible, puede ejecutarse el mismo flujo con `node scripts/check.mjs`. La orden reconstruye los Items de desarrollo, valida su esquema y audita que el repositorio no contenga fuentes privadas ni registre prematuramente esos Items como compendios distribuibles.

El compendio del atlas se reconstruye con `node scripts/build-setting-pack.mjs` y se comprueba con `node scripts/validate-setting-pack.mjs`. Estas ordenes usan `classic-level` incluido en la instalacion local de Foundry VTT.
