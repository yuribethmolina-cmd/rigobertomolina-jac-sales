

## Plan: Resaltar disclaimer de precios y agregar totales a la tabla de comparación

### Cambios

**1. PaymentSection.tsx — Tabla de comparación: agregar columna de precio total**

Actualizar `comparisonData` para incluir el total estimado de cada plan (Directa = cuota × 7, Fácil = afiliación + 10 cuotas + cuota final según los datos existentes). Agregar dos nuevas columnas "Total Directa" y "Total Fácil" a la tabla, o reemplazar las columnas actuales de cuota mensual para mostrar ambos valores (cuota/mes + total).

La tabla pasará a mostrar:
- Modelo
- Cuota Directa / mes
- Total Directa
- Cuota Fácil / mes  
- Total Fácil

**2. PaymentSection.tsx — Disclaimer más visible**

Reemplazar el disclaimer actual (texto xs en un `card-glow` discreto) por un bloque más prominente con:
- Icono de alerta (⚠️ o AlertTriangle de lucide)
- Fondo con borde llamativo (`border-amber-500/50 bg-amber-500/10`)
- Texto más grande (sm en vez de xs) y en negrita parcial
- Mensaje claro: los precios son **referenciales** y están **sujetos a cambio**

**3. ModelCard.tsx — Disclaimer en cada tarjeta más visible**

Cambiar el texto `* Montos referenciales Feb 2026` de `text-[10px]` a `text-xs` con color amber/warning sutil para que destaque más.

**4. ComparisonSection.tsx — Disclaimer más visible**

Aplicar el mismo estilo de disclaimer prominente al pie de la sección de comparación.

### Datos de totales estimados

Basado en los esquemas de pago:
- **Directa**: 7 pagos iguales → total = cuota × 7
- **Fácil**: afiliación + 10 cuotas + cuota final mayor (usar los totales del ejemplo de Nevado como referencia para calcular)

Se agregarán los totales calculados directamente en `comparisonData`.

