# Panel privado de catálogos

## 1. Cómo están hoy los datos (revisión hecha)

- Los montos viven en archivos de código: `src/data/vehicleFinancing.ts` (una lista por plan: Compra Directa, Pago Fácil, Ruta 48, Llévatelo de Una, Llévatelo Fiao) y la definición de cada plan (nombre, vigencia, fuente, cronograma, recaudos) en `src/data/financingPlans.ts`. Los vehículos (nombre, categoría, foto, enlace de ficha) están en `src/data/vehicles.ts`.
- Todas las páginas (inicio, fichas de modelo, financiamiento, simulador, cotizaciones en PDF) piden los montos a una sola función, `financingOptionsFor(modelo)`. Nadie escribe montos sueltos en pantalla.
- El Asesor JAC usa una copia de texto generada desde esos mismos archivos (`supabase/functions/asesor/knowledge.ts`) que hoy se regenera a mano con un script y se vuelve a publicar la función.
- Hay autenticación y rol de administrador ya funcionando (`/acceso`, rutas protegidas como `/estadisticas` y `/resenas/moderar`).

## 2. Propuesta: una sola fuente, ahora editable

La fuente única de verdad pasa de los archivos de código a la base de datos, con la misma forma que ya tiene el sitio. No se crea una base paralela ni se duplican los datos: los archivos actuales se usan una sola vez para cargar el contenido inicial y después quedan como respaldo de arranque.

```text
PDF  ->  extracción  ->  BORRADOR (revisable/editable)  ->  aprobar  ->  ACTIVO
                                                             |
                                      versión anterior  ->  ARCHIVADO (rollback)

ACTIVO  ->  el sitio (fichas, inicio, financiamiento, cotizaciones)
        ->  el Asesor JAC
```

Reglas que se respetan por diseño:
- Cada plan tiene sus propias versiones; publicar Pago Fácil no toca Compra Directa, Ruta 48 ni Llévatelo de Una.
- Solo puede haber una versión ACTIVA por plan (garantizado por la base de datos, no solo por la pantalla).
- Nada se publica sin tu aprobación explícita. La extracción solo crea BORRADOR.
- Lo que no se pueda asociar con certeza queda como REQUIERE REVISIÓN y no se publica hasta que lo corrijas.

## 3. Qué se construye

**Base de datos (3 tablas nuevas, solo para administración):**
- `catalog_versions`: plan, fecha del catálogo, fecha de carga, estado (BORRADOR / ACTIVO / ARCHIVADO), fuente (nombre del PDF), cantidad de registros, notas.
- `catalog_entries`: cada modelo/versión de esa carga, con campos comunes (modelo, versión, monto a la firma, número de cuotas, valor de cuota, monto previo a la entrega, promoción, condiciones), más un campo flexible para los planes con estructura distinta (Ruta 48, Llévatelo de Una y futuros). Cada registro guarda su clasificación (ACTUALIZADO / SIN CAMBIOS / NUEVO / RETIRADO / REQUIERE REVISIÓN) y marca qué campos editaste a mano.
- `catalog_audit`: quién publicó o restauró qué y cuándo.
- Acceso: lectura pública solo de la versión ACTIVA; borradores, archivados y edición solo para administradores. Los PDF se guardan en un depósito privado de archivos.

**Panel `/admin/catalogos`** (protegido con el mismo control de administrador que ya usa `/estadisticas`, sin enlace en el menú público):
- Lista de planes con fecha del catálogo activo, última actualización, número de modelos, estado y fuente, con los botones Ver datos y Actualizar catálogo.
- Actualizar catálogo: subir el PDF, indicar la fecha, procesar y esperar el resultado.
- Pantalla Revisar cambios: tabla comparativa (modelo/versión, dato actual, dato nuevo, tipo de cambio) con filtros por tipo, edición manual de nombre, versión, montos, cuotas, promoción y condiciones, y aviso de cuántos registros siguen en REQUIERE REVISIÓN.
- Botón Aprobar y publicar con confirmación; publica, archiva la versión anterior de ese mismo plan y deja el resto intacto.
- Historial por plan con la posibilidad de Restaurar una versión archivada, también con confirmación.

**Extracción del PDF:** una función de servidor lee el documento (texto y, cuando hace falta, reconocimiento de imagen igual que hicimos a mano con los catálogos de septiembre), empareja cada cronograma con la ficha del modelo que le corresponde y no rellena ningún hueco: lo que no queda claro se marca REQUIERE REVISIÓN. Nunca redondea ni calcula montos.

**Sitio:** `financingOptionsFor` pasa a leer la versión ACTIVA desde la base de datos, con el contenido actual de `src/data` como respaldo si la base no responde. Las páginas y componentes no cambian de diseño ni de estructura.

**Asesor JAC:** la función `asesor` arma su base comercial leyendo las versiones ACTIVAS en cada conversación (con caché corto), en lugar del archivo generado a mano. Así, al publicar un catálogo el asesor queda actualizado al instante, sin volver a publicar nada. Se mantienen todas sus prohibiciones actuales y la frase "Información basada en el último catálogo disponible. Confirma disponibilidad y condiciones finales con Rigoberto."

## 4. Migración de los datos actuales (sin duplicar)

Una carga inicial crea la versión ACTIVA de cada plan con exactamente lo que hoy está publicado: Compra Directa 16/09 (66 registros), Pago Fácil 16/09 (65), CrediJAC Ruta 48 17/08 (15), Llévatelo de Una 08/09 (6) y Llévatelo Fiao 06/08 (6). Ningún monto cambia en esa carga: es una copia literal.

## 5. Orden de trabajo propuesto

1. Tablas, permisos y depósito privado de PDF.
2. Carga inicial desde los datos actuales y verificación de que el sitio muestra exactamente lo mismo.
3. El sitio empieza a leer desde la base (con respaldo).
4. Panel: lista de catálogos e historial.
5. Subida de PDF y extracción.
6. Pantalla de revisión con edición manual.
7. Publicar, archivar y restaurar.
8. Asesor JAC leyendo las versiones activas.

## 6. Decisiones que conviene confirmar

- La extracción automática funciona bien con catálogos con el formato actual de JAC (una página de cronograma seguida de la ficha del modelo). Con un formato muy distinto, muchos registros caerán en REQUIERE REVISIÓN y habrá que corregirlos a mano en el panel: es el comportamiento seguro, no un error.
- Los planes sin catálogo vigente (Crédito Bel, Travesía, CrediJAC 35x35, CrediExpress, Facilito) aparecerán en el panel listos para recibir su primer catálogo, sin inventar datos.
- Las promociones (ñapas) hoy no se muestran en el sitio. El panel las guardará al extraerlas; decidir después si se publican en las fichas.
