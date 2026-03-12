

## Plan: Actualizar catalogo completo con fichas expandibles

### Resumen

Actualizar todos los datos de modelos con la informacion completa de los catalogos PDF (precios, specs, colores), agregar todos los modelos faltantes (incluyendo camiones pesados), y agregar una ficha expandible en cada tarjeta para ver especificaciones detalladas. Tambien copiar las 3 imagenes de vehiculos comerciales subidas.

### Datos extraidos de los catalogos

**Precios actualizados (cuota referencial):**

| Modelo | Cuota actual en web | Cuota correcta (catalogo Feb 2026) |
|---|---|---|
| X100 FERRETERO | - | $2.564,7 |
| URBAN CHASIS LARGO 3 TON | - | $3.236,4 |
| URBAN FERRETERO 3 TON | - | $3.395,2 |
| C-3500 4X4 | - | $4.709,3 |
| DOBLE CABINA | no existe | $3.713,3 |
| LA VENEZOLANA 4X2 | - | $2.972,3 |
| LA VENEZOLANA 4X2 DIESEL | - | $3.214,6 |
| LA VENEZOLANA 4X4 DIESEL | - | $3.613,3 |
| LA VENEZOLANA PRO 4X4 | - | $4.165,2 |
| ARENA SPORT MT | $2.564,7 | $2.383,2 |
| ARENA SPORT AT | $3.236,4 | $2.586,2 |
| ARENA PRO XIP-4 | - | $2.824,7 |
| NEVADO MT | $3.018,6 | $3.018,6 (OK) |
| NEVADO AT | - | $3.715,2 |
| AVENTURA (Tepuy Pro) | $5.259,0 | $5.259,0 (OK) |
| AVENTURA PRO | no existe | $6.392,4 |
| 6T CHASIS 6 TON | no existe | $4.473,1 |
| 6T FERRETERO 6 TON | no existe | $4.671,3 |
| BUFALO 12 TON | no existe | $7.322,6 |
| BUFALO XL 13 TON | no existe | $7.850,3 |
| LEYENDA 20 TON | no existe | $10.223,2 |
| CAVALINO 22 TON | no existe | $7.106,4 |
| CHUTO 400HP 40 TON | no existe | $9.312,5 |
| K5 CHUTO 430HP 45 TON | no existe | $11.209,9 |

### Cambios tecnicos

#### 1. Copiar imagenes comerciales a `src/assets/`
Copiar las 3 imagenes subidas: Urban Ferretero 3 Ton, Urban Chasis Largo 3 Ton, X100 Ferretero.

#### 2. Actualizar `src/lib/constants.ts`
- Expandir la interfaz `CarModel` con campos opcionales para specs: `motor`, `potencia`, `torque`, `combustible`, `transmisionDetalle`, `suspension`, `frenos`, `dimensiones`, `capacidades`, `seguridad`, `tecnologia`, `equipamiento`.
- Usar un tipo `CarSpecs` como objeto anidado para mantenerlo limpio.
- Actualizar todos los precios existentes con los datos correctos del catalogo.
- Agregar colores faltantes a todos los modelos segun el catalogo.
- Agregar modelos nuevos:
  - **Pickups**: DOBLE CABINA, AVENTURA, AVENTURA PRO (reorganizar: Tepuy Pro pasa a pickups como Aventura)
  - **Comerciales**: Expandir la lista con todos los camiones pesados (6T, Bufalo, Leyenda, Cavalino, Chuto, K5), dandoles la misma estructura de `CarModel` con specs.
- Reorganizar tabs: "SUVs" | "Pickups" | "Comerciales Livianos" | "Camiones"

#### 3. Actualizar `src/components/ModelCard.tsx`
- Agregar boton "Ver especificaciones" que despliega un acordeon/collapsible con las specs organizadas en secciones: Motor, Transmision, Suspension/Frenos, Dimensiones, Seguridad, Tecnologia.
- Usar el componente Collapsible de Radix ya disponible.
- Mostrar las specs como lista compacta con iconos.

#### 4. Actualizar `src/components/ModelsSection.tsx`
- Agregar las nuevas tabs (o reorganizar en 4 tabs).
- La seccion "Comerciales" ahora muestra tarjetas completas con specs en vez de lista simple, ya que ahora tienen datos detallados.
- Usar las imagenes reales para los 3 comerciales que tienen foto.

#### 5. Actualizar `src/components/ComparisonSection.tsx`
- Ajustar precios en la tabla comparativa.

#### 6. Actualizar `src/components/PaymentSection.tsx`
- Verificar que el ejemplo de pago siga siendo correcto con los datos actualizados.

#### 7. Actualizar `src/components/ContactSection.tsx`
- Agregar los modelos nuevos al dropdown del formulario.

### Estructura de datos propuesta

```typescript
interface CarSpecs {
  motor?: string;        // "1.6 L DVT Euro V"
  potencia?: string;     // "118 Hp"
  torque?: string;       // "150 Nm"
  combustible?: string;  // "Gasolina" | "Diésel"
  transmisionDetalle?: string; // "Manual MF20V MT - 6 velocidades"
  suspension?: string[];
  frenos?: string;
  dimensiones?: string;  // "4410x1800x1660 mm"
  pesoNeto?: string;
  capacidadCarga?: string;
  tanque?: string;
  seguridad?: string[];
  tecnologia?: string[];
  equipamiento?: string[];
}

interface CarModel {
  // ...campos existentes...
  specs?: CarSpecs;
  image?: string; // ruta a imagen importada
}
```

### Resultado esperado

Cada tarjeta de modelo mantiene su aspecto actual limpio, pero con un boton "Ver especificaciones" que al hacer clic despliega toda la informacion tecnica del catalogo organizada en secciones claras. Todos los precios quedan actualizados y se incluyen absolutamente todos los modelos del catalogo, incluyendo los camiones pesados.

