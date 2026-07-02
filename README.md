# Alcanzando las Estrellas

Base de desarrollo de una ambientacion de ciencia ficcion sin deidades objetivamente existentes. Su primera integracion mecanica esta destinada a Starfinder Segunda Edicion, pero el lore y las herramientas genericas se mantienen separados mediante adaptadores.

## Arquitectura

- `data/`: registros neutrales de fuentes, conceptos y procedencia.
- `scripts/`: nucleo del modulo y adaptadores de sistema.
- `docs/`: biblia del mundo, politica de conversion y control de licencias.
- `docs/wiki/`: fuente versionada de la Wiki de GitHub.
- futuros `packs/setting-*`: diarios, tablas y ambientacion neutrales.
- futuros `packs/sf2e-*`: ascendencias, dotes y equipo exclusivos del adaptador SF2e.

No se modifican los archivos del sistema `sf2e`. Esto evita que una actualizacion borre el proyecto.

El inventario inicial separa las referencias culturales de las fuentes que permiten redistribucion. Una coincidencia en el catalogo de investigacion nunca autoriza copiar nombres, texto, arte o mecanicas cerradas.

El codigo se publica bajo MIT. El contenido creativo y las obligaciones de licencias de terceros se documentan por separado en `CONTENT-LICENSE.md`.
