# SOP: Inserción de Comentarios de Límites RBAC en Componentes de Puntos

Este procedimiento operativo estándar describe cómo automatizar la inserción de comentarios visuales (`INI` y `FIN`) delimitando todos los bloques condicionales de permisos (`hasPermission`) en los archivos JSX de la aplicación.

## Objetivo
Facilitar al desarrollador la visualización y edición manual de los límites de acceso de cada bloque de código de los puntos (`Punto1.jsx` a `Punto11.jsx`) sin tener que descifrar el balanceo de llaves de JSX.

## Reglas de Inserción
Para cada bloque de código de la forma:
```jsx
{hasPermission('ID_DEL_BLOQUE') && (
  ...
)}
```
Se deben insertar comentarios llamativos arriba y abajo:
```jsx
{/* ------------------------------------------- INI: ID_DEL_BLOQUE --------------------------------------------- */}
{hasPermission('ID_DEL_BLOQUE') && (
  ...
)}
{/* ------------------------------------------- FIN: ID_DEL_BLOQUE --------------------------------------------- */}
```

## Algoritmo del Script de Python
1. Buscar todos los archivos `.jsx` en `app/src/components/points/`.
2. Leer el contenido de cada archivo.
3. Buscar las líneas de apertura `{hasPermission('...') && (`.
4. Rastrear el balanceo de llaves `{` y `}` a partir de esa línea para ubicar la línea de cierre correspondiente.
5. Inyectar los comentarios de inicio y fin en las líneas correctas.
6. Guardar los archivos modificados.
7. Verificar que el servidor compile limpiamente tras la modificación.
