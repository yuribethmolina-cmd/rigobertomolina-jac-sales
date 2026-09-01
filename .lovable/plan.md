# Enlace compartible por modelo

Crear una página propia para cada vehículo con toda la información de precios y formas de pago, accesible por un link corto que Rigoberto pueda enviar por WhatsApp.

Ejemplo: `rigobertomolina.com/modelo/nevado-mt`

## Qué verá el cliente al abrir el link

- Nombre del modelo, imagen y ficha resumida (transmisión, tracción, capacidad, colores).
- Precios en el formato actual: Compra Directa (7 pagos) y Pago Fácil (afiliación + 12 cuotas + pago final), con total estimado.
- Planes adicionales disponibles para ese modelo (Credijac 35x35, Ruta 66, Llévatelo Fiao, CrediExpress, Travesía) cuando apliquen.
- Desglose de cuotas del plan elegido.
- Botón de WhatsApp con mensaje prellenado que ya menciona el modelo.
- Disclaimer: "* Montos referenciales Agosto 2026. Sujetos a variación."
- Enlace de vuelta al catálogo completo.

## Cómo se comparte

- Botón "Compartir" en cada tarjeta de modelo del catálogo: copia el link al portapapeles con aviso de confirmación, y opción de enviarlo directo por WhatsApp.
- Vista previa correcta al pegar el link en WhatsApp (título, descripción y datos del modelo en las etiquetas de la página).

## Detalles técnicos

- Nueva ruta `/modelo/:slug` en `src/App.tsx` con la página `src/pages/ModelDetail.tsx`.
- Añadir un helper `slugify(name)` en `src/lib/constants.ts` (sin cambiar la data existente): el slug se deriva del campo `name`, así no hay que editar los 30+ modelos. Búsqueda por slug sobre las listas de modelos ya existentes.
- Reutilizar los datos actuales: `constants.ts` (ficha y precios de tarjeta) y `paymentPlans.ts` (cuotas y totales por plan); se emparejan por nombre normalizado. Si un modelo no está en `paymentPlans.ts`, se muestra solo lo disponible más "Consultar".
- Reutilizar componentes ya existentes para las cuotas y el botón de WhatsApp (`WhatsAppButton`, helpers de `paymentPlans.ts`), sin duplicar lógica de cálculo.
- SEO por modelo con `react-helmet-async`: title, description, canonical, og/twitter y JSON-LD tipo `Product`/`Vehicle`.
- Añadir las URLs de modelo a `public/sitemap.xml`.
- Registrar el evento de compartir y de contacto en `contact_events` mediante `src/lib/track.ts`, para que aparezca en /estadisticas.
- Botón de compartir en `ModelCard.tsx` / `CatalogCard.tsx` usando `navigator.share` cuando exista y copia al portapapeles como respaldo (toast con `sonner`).

## Nota

La vista previa enriquecida en WhatsApp usa la información del HTML servido; como la app es una SPA, el título y la descripción serán los generales del sitio en algunos clientes. El link igual abre la página correcta del modelo. Si quieres vista previa 100% personalizada por modelo, se puede añadir después con una función de backend que sirva las etiquetas.
