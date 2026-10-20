# Plan de Implementación: Matriz de Permisos Dinámica (RBAC) Jerárquica

Este plan detalla los pasos para transformar el control de accesos actual en un sistema 100% dinámico y jerárquico.

## Definición de Jerarquía e Índice (Pendiente)

> [!IMPORTANT]
> **Estructura del Índice:** El sistema leerá el archivo `config.json` reestructurado para soportar 5 niveles de profundidad: **Parte > Punto > Apartado > Bloque > Desarrollo**. 
> Se ha provisto una plantilla (`plantilla_indice_rbac.md`) para que el usuario defina este índice con exactitud antes de proceder.

## Lógica de Permisos (Herencia Ascendente Implícita)

La matriz de permisos no será un simple listado plano, sino un árbol genealógico. Se aplicarán las siguientes reglas inquebrantables de jerarquía:
1. **Bloqueo descendente:** Si un usuario NO tiene permiso para una jerarquía superior (ej. un *Punto*), automáticamente se bloquea el acceso a todos sus hijos (*Apartados, Bloques, Desarrollos*).
2. **Permiso ascendente implícito:** Si a un rol se le otorga acceso a un *Bloque* profundo, el sistema automáticamente le otorgará permiso de "solo lectura/navegación" a su *Apartado*, *Punto* y *Parte* padre correspondientes. Esto garantiza que la interfaz le permita hacer clic en los menús para llegar hasta ese bloque.

---

## Proposed Changes

### Base de Datos (Supabase SQL)

#### [NEW] `supabase_rbac_schema.sql` (Script para ejecutar en SQL Editor)
- Se añadirá una columna `last_login` (`timestamp with time zone`) a la tabla `dialitico_user_profiles`.
- Se creará una tabla `dialitico_role_permissions` con las columnas `role`, `node_id` (que identificará el nivel jerárquico exacto, ej: `parte1_punto2_apartadoA`) y `has_access`.

---

### Contexto de Autenticación y Estado

#### [MODIFY] `src/context/AuthContext.jsx`
- Al hacer login, se hará un `UPDATE` en Supabase para registrar la fecha y hora en `last_login`.
- Se extraerá la lista de permisos de `dialitico_role_permissions`.
- Se creará una función utilitaria `hasPermission(nodeId, userRole)` que resuelva la lógica de herencia para saber rápidamente si se debe renderizar un componente o no.

---

### Componentes de Interfaz

#### [MODIFY] `src/components/AdminPanel.jsx`
- **Pestaña Usuarios:** Nueva columna en la tabla para "Último Acceso".
- **Pestaña Matriz de Permisos:** La interfaz ya no será una tabla plana, sino un **Árbol Colapsable**. El Admin podrá desplegar una *Parte*, ver sus *Puntos*, desplegar un *Punto*, etc.
- Al hacer clic en el checkbox de un nivel inferior, la UI marcará visualmente a los padres directos para indicar el "permiso ascendente implícito".

#### [MODIFY] `src/components/SlideContainer.jsx` / `App.jsx`
- Refactorización para leer el nuevo `config.json` jerárquico y aplicar la función `hasPermission()`. Si el usuario no tiene acceso, el botón se bloquea o muestra un candado.

---

## Verification Plan

### Manual Verification
1. Llenaremos un `config.json` de prueba con al menos 3 niveles de profundidad.
2. Ingresaremos al Panel de Administración y verificaremos el Árbol Colapsable de Permisos.
3. Otorgaremos a un Invitado acceso a un único *Desarrollo* del *Punto 4*.
4. Nos loguearemos como Invitado y comprobaremos que solo podemos navegar por el árbol estrictamente necesario para llegar a ese *Desarrollo*, estando el resto de *Apartados* bloqueados.

---

## Reestructuración de Archivos de Componentes (`src/components/points/`)

Para alinear el código con el nuevo `indice_jerarquico_rbac.md` y evitar los saltos numéricos (ej. del Punto 7 al 12), se realizará el siguiente renombrado y consolidación de archivos correspondientes a la **PARTE 3**. Las Partes 1 y 2 (Puntos 1 al 6) permanecerán intactas en su contenido.

1.  **`Punto1.jsx` a `Punto6.jsx`**: Se mantienen idénticos (Partes 1 y 2).
2.  **`Punto7.jsx`**: Se mantiene como "Punto 7: El Modelo Retrospectivo".
3.  **`ConsolidadoEconometrico.jsx` &rarr; [RENAME] a `Punto8.jsx`**: Corresponde a "Punto 8: Relacionando la Historia con las Variables del Modelo Retrospectivo".
4.  **`Punto12.jsx` y `Punto13.jsx` &rarr; [MERGE/RENAME] a `Punto9.jsx`**: Ambos tratan sobre el impacto económico. `Punto13.jsx` aborda la "Brecha de Impacto Financiero" y `Punto12.jsx` el "Impuesto Inflacionario por Time Lag". Se consolidarán en `Punto9.jsx` ("El Impacto Financiero sufrido").
5.  **Punto 10 (Nuevo/Extraído)**: Se creará **`Punto10.jsx`** ("El Modelo Prospectivo") para aislar la lógica de proyección prospectiva (actualmente ausente o mezclada en componentes finales).
6.  **`Punto14.jsx` &rarr; [RENAME] a `Punto11.jsx`**: Corresponde a "Punto 11: El Valor Técnico de Paridad Dialítica" (La Síntesis Unificada).
7.  **Actualización de `App.jsx`**: Modificar las importaciones y el switch de renderizado para apuntar a la nueva secuencia `Punto1.jsx` hasta `Punto11.jsx`.
