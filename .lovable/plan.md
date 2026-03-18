
Objetivo: sacar el proyecto del bucle de build fallido y recuperar publicaciones estables.

Diagnóstico (confirmado con el código + error):
1) El fallo no es de dominio, es de build: `Cannot find module '@alloc/quick-lru'`.
2) El build remoto está cargando Tailwind desde `/opt/template-node-modules/...` (entorno de plantilla), no de forma confiable desde tu árbol local.
3) En el repo quedó `vendor/@alloc/quick-lru/` pero vacío; antes funcionaba como fallback y ahora está incompleto.
4) `package.json` ya no declara `@alloc/quick-lru`, así que no hay garantía de resolución en publish.

Plan de corrección (implementación):
1) Reinstalar fallback estable de resolución de módulos
- `package.json`:
  - volver a agregar `@alloc/quick-lru` en `dependencies`.
  - restaurar scripts `dev/build/preview` con `NODE_PATH=./vendor:./node_modules ...` para que publish encuentre el módulo aunque use runtime de plantilla.

2) Restaurar shim local funcional
- Crear `vendor/@alloc/quick-lru/index.js` con implementación mínima compatible (API usada por Tailwind: constructor, get, set, has, delete, clear, size).
- Esto evita que el build dependa del estado interno de `/opt/template-node-modules`.

3) Ajustar PostCSS a carga explícita local
- `postcss.config.js`:
  - usar `createRequire(import.meta.url)`.
  - cargar `tailwindcss` y `autoprefixer` desde `./node_modules/...`.
- Así forzamos el plugin local y evitamos resolver contra paquete global de plantilla.

4) Mantener trazabilidad de despliegue (ya existe, conservar)
- No tocar `RELEASE_ID` en `src/main.tsx` ni etiqueta visible en footer.
- Solo incrementarlo al siguiente intento de publicación para verificar instantáneamente qué versión está viva.

Validación que haré después de aplicar:
1) Verificar que `vite build` compile sin `@alloc/quick-lru` error.
2) Publicar una sola vez (sin 30 intentos).
3) Confirmar en:
   - Preview
   - `jac-caracas-connect.lovable.app`
   - `www.rigobertomolina.com`
   que muestran el mismo `RELEASE_ID`.
4) Si el `RELEASE_ID` coincide en lovable.app pero no en custom domain, entonces ya es propagación/caché DNS-CDN y se escala con evidencia exacta.

Resultado esperado:
- El publish vuelve a completar.
- Dejas de depender de condiciones frágiles del entorno remoto.
- Puedes comprobar con certeza cuándo una actualización realmente quedó en vivo.
