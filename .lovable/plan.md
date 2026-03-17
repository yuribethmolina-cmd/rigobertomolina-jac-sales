

## Plan: Actualizar datos del catálogo con PDFs y priorizar Comerciales

Analice los 4 PDFs del catálogo oficial Bel JAC Venezuela. A continuacion el resumen de hallazgos y cambios propuestos.

### Hallazgos principales de los PDFs

1. **Specs incorrectas o incompletas** en `constants.ts` vs. los PDFs oficiales:
   - **X100 Ferretero**: Motor real es 1.6L Gasolina Euro II (118 Hp, 155 Nm), no 1.3L (87 Hp). Capacidad de carga: 1.6 ton, no 760 kg. Dimensiones: 5182x1700x2070mm, tanque 60L.
   - **Urban Chasis Largo 3 Ton**: Motor real es 2.8L Diesel Euro II (91 Hp, 216 Nm), no lo que hay actualmente.
   - **Urban Ferretero 3 Ton**: Igual, 2.8L Diesel (91 Hp, 216 Nm).
   - **C-3500 4x4**: Motor 2.8L Diesel (91 Hp, 216 Nm), traccion 4x4, capacidad 3.5 ton.
   - **Doble Cabina**: Motor 2.8L Diesel (91 Hp, 216 Nm), dimensiones 6045x1900x2370mm, carga 2 ton.
   - **6T Chasis/Ferretero**: Motor 4.0L Diesel Euro II CUMMINS (138 Hp, 502 Nm), no 3.8L (156 Hp).
   - **Bufalo 12 Ton**: Motor CUMMINS C230-20, 8.3L Diesel (230 Hp, 861 Nm), 8 velocidades, tanque 1000L.
   - **Bufalo XL 13 Ton**: Mismo motor CUMMINS 8.3L (230 Hp), chasis extra largo 9.5mt carrozable.
   - **Leyenda 20 Ton**: Motor WEICHAI WP10.340, 9.8L Diesel (340 Hp, 1400 Nm), tanque 1225L.
   - **Cavalino 22 Ton**: Motor WEICHAI WP6.240E32, 6.8L Diesel (240 Hp, 900 Nm).
   - **Chuto 400HP 40 Ton**: Motor 10.3L Diesel (400 Hp, 1800 Nm), 12 velocidades.
   - **K5 Chuto 430HP 45 Ton**: Motor WEICHAI WP12.430, 11.6L Diesel (430 Hp, 2000 Nm), tanque 900L.
   - **La Venezolana 4x2**: Motor 2.0L Euro V (145 Hp, 190 Nm), dimensiones 5315x1830x1815mm.
   - **La Venezolana 4x2 Diesel**: Motor 2.8L WT Turbo Euro II (137 Hp, 210 Nm).
   - **La Venezolana 4x4 Diesel**: Motor 2.8L WT Turbo Euro I (137 Hp, 210 Nm), 6 velocidades.
   - **La Venezolana PRO 4x4**: Motor 2.0L Turbo Euro V (188 Hp, 320 Nm), incluye BELJIMMY 125 (moto).
   - **Aventura**: Motor 2.0L Turbo Euro II (231 Hp, 380 Nm), 8 vel automática, tanque 150L.
   - **Aventura Pro**: Edicion Limitada F-ROAD, mismos 231 Hp, equipamiento especial (winche, snorkel, suspension reforzada).
   - **Nevado MT**: Motor 1.6L DVT Euro V (118 Hp, 150 Nm), pantalla 12", tanque 50L.
   - **Nevado AT**: Motor 1.5L Turbo Euro V (147 Hp, 210 Nm), techo corredizo electrico.
   - **Arena Sport MT/AT**: Motor 1.5L Euro V (111 Hp, 146 Nm), pantalla 10", Apple CarPlay/Android Auto.
   - **Arena Pro**: Motor 1.5L Euro V (112 Hp, 146 Nm), CVT automatico, 6 altavoces, TPMS.
2. **Modelo nuevo encontrado**: **TEPUY PRO** ($4,285.6) - no esta en el sitio actual.
3. **Hay dos modalidades de pago**: "Compra Directa" (5 cuotas) y "Pago Facil" (10 cuotas + ultima cuota).
4. No se pudo acceder al Instagram (403 de Instagram).

---

### Cambios a implementar

#### 1. `src/lib/constants.ts` -- Actualizar TODOS los specs con datos reales del PDF

- Corregir motor, potencia, torque, dimensiones, tanque, capacidad de carga, peso neto, etc. para cada modelo.
- Agregar colores reales de los PDFs a cada modelo que los mencione.
- Agregar modelo **TEPUY PRO** a los SUVs ($4,285.6).
- Agregar campo `instagram` al archivo de constantes: `https://www.instagram.com/ventasjacvzla/`
- Agregar informacion de planes de pago (Compra Directa 5 cuotas vs Pago Facil 10 cuotas).

#### 2. `src/components/ModelsSection.tsx` -- Reordenar tabs

- Mover "Comerciales" como la primera tab (prioridad del papa).
- Orden nuevo: `["Comerciales", "Camiones", "Pickups", "SUVs"]`
- Tab activa por defecto: "Comerciales".

#### 3. `src/components/PaymentSection.tsx` -- Agregar modalidad Pago Facil

- Agregar tabs o subseccion mostrando las dos modalidades:
  - **Compra Directa**: Afiliacion + 5 cuotas + previo a entrega (7 pagos iguales).
  - **Pago Facil**: Afiliacion + 10 cuotas + ultima cuota mayor.
- Ejemplo para cada modalidad.

#### 4. `src/components/AboutSection.tsx` -- Actualizar perfil de Rigoberto

- Cambiar "vendedor independiente" a "embajador de la marca JAC y vendedor independiente".
- Agregar enlace a Instagram `@ventasjacvzla`.
- Agregar icono de Instagram junto a los badges existentes.

#### 5. `src/components/FooterSection.tsx` -- Agregar Instagram

- Agregar enlace a Instagram en el footer.
- Actualizar texto a "Embajador de la marca JAC".

#### 6. `src/components/ContactSection.tsx` -- Agregar Tepuy Pro al select

- Agregar "Tepuy Pro" a la lista de `modelOptions`.

#### 7. `src/components/ModelCard.tsx` -- Mejorar con nuevos campos de specs

- Agregar soporte para nuevos campos del PDF: `pesoNeto`, mas detalles de dimensiones, equipamiento interior/exterior.

### Detalle tecnico

Los cambios mas grandes son en `constants.ts` (reescritura de datos de ~30 modelos con specs corregidas del PDF oficial). El resto son cambios puntuales de UI. Estimado: ~8 archivos modificados.

