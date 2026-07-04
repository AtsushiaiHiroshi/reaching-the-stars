# Modelo neutral de ambientacion

`data/setting/atlas.json` es la fuente canonica provisional del atlas. No contiene estadisticas, CD, niveles, precios ni UUID de un sistema anfitrion.

Cada entidad usa un ID estable en minusculas. Las relaciones se guardan como IDs y se validan antes de publicar. Los adaptadores pueden convertir estas entidades en diarios, escenas, tablas o documentos propios de otro sistema sin alterar el archivo neutral.

Las coordenadas usan cubos hexagonales y siempre cumplen `q + r + s = 0`. Una unidad representa un salto narrativo; la distancia fisica se definira cuando exista una cosmologia de viaje definitiva.

El estado `provisional` permite revisar nombres, sensibilidad cultural, continuidad y licencias antes de declarar canon una entrada.
