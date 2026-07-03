# Validacion automatica

El repositorio aplica el mismo control local y remoto antes de convertir contenido de desarrollo en compendios distribuibles.

## Ejecucion local

```powershell
npm run check
```

La alternativa sin npm es `node scripts/check.mjs`. Ninguna de las dos ordenes instala dependencias. Requieren Node.js 20.11 o posterior y realizan tres pasos:

1. reconstruye los 54 documentos `Item` desde sus prototipos;
2. valida cantidades, IDs, UUID, niveles y elementos de reglas;
3. audita el manifiesto, todos los JSON, las rutas declaradas y el registro de fuentes.

## Protecciones editoriales

La auditoria falla si encuentra PDF, EPUB, documentos de Word o archivos ZIP dentro del repositorio. Tambien exige que cada fuente privada conserve un hash SHA-256 y `redistributeFile: false`.

Los Items de desarrollo no pueden aparecer en `module.json` mientras no superen las revisiones mecanica, editorial y legal.

## Integracion continua

GitHub Actions ejecuta `npm run check` en cada pull request y en cada envio a `main`. Despues vuelve a comparar `packs-src/development` con Git para detectar una generacion desactualizada.
