# SOP: Coordinación de Índice y Contenido para Sistema de Permisos RBAC

Este procedimiento operativo estándar (SOP) describe el flujo de trabajo interactivo para coordinar e implementar la visibilidad condicional de componentes visuales en la aplicación basándose en los identificadores de permisos definidos en `config.json`.

---

## 1. Objetivo
Lograr una correspondencia exacta del 100% entre las opciones de permisos editables en la sección de control de roles (basada en el catálogo de `config.json`) y las secciones, tarjetas, botones y desarrollos interactivos que se renderizan en cada componente de punto (`Punto1.jsx` a `Punto11.jsx`).

---

## 2. Flujo de Trabajo Interactivo

Para cada elemento del catálogo que se desee coordinar:

1. **Recepción del Input:**
   - El usuario provee una captura de pantalla (imagen) de la sección visual que desea condicionar.
   - El usuario proporciona el fragmento JSON con los identificadores de permisos del catálogo de `config.json` que aplican a esa sección.

2. **Identificación en el Código:**
   - Buscar en el archivo JSX del componente de destino (ej. `Punto9.jsx`) los textos clave, variables o widgets que representen la sección de la imagen.

3. **Implementación de Envoltura (hasPermission):**
   - Envolver el componente, tarjeta o elemento JSX identificado dentro del condicional de permisos usando la función `hasPermission('ID_PERMISO')`.
   - Si la sección ya tiene otras condiciones lógicas (ej. `activeTab === 'x'`), concatenar el permiso usando el operador lógico `&&`.

4. **Delimitación de Comentarios (Obligatorio):**
   - Todo bloque envuelto debe comenzar y terminar con comentarios estándar y limpios de delimitación para facilitar el mantenimiento y la auditoría automática.
   
   *Ejemplo:*
   ```jsx
   {/* ------------------------------------------- INI: p3_p2_a7_b1 --------------------------------------------- */}
   {hasPermission('p3_p2_a7_b1') && (
     <div className="p-4 rounded-xl">
       ...
     </div>
   )}
   {/* ------------------------------------------- FIN: p3_p2_a7_b1 --------------------------------------------- */}
   ```

---

## 3. Consideraciones Técnicas y Casos Borde

### A. Botones de Desglose Matemático / Auditorías
- Cuando un permiso controla un botón que abre un desglose detallado (ej. *"Ver Planteo Matemático"*), se debe condicionar tanto el **botón** en la interfaz como el **panel de desglose matemático** correspondiente (incluso si están en lugares distantes del código).

### B. Elementos Adyacentes y Envoltura de Fragmentos (`<>`)
- Al envolver múltiples elementos adyacentes en una expresión JSX (ej. `{hasPermission(...) && (...) }`), se debe asegurar de utilizar una etiqueta fragmento de React (`<> ... </>`) o un contenedor común para evitar errores de parseo JSX (`Expected ',' or ')' but found '{'`).

### C. Coherencia en Modos de Modalidad (Sesiones vs Módulos)
- Al condicionar elementos dinámicos que cambian según la modalidad (como Diálisis Peritoneal), verificar que las etiquetas de los títulos y descripciones también sigan la lógica del permiso y no queden expuestas huérfanas en el layout.

---

## 4. Proceso de Verificación
1. Guardar los cambios en el componente JSX correspondiente.
2. Confirmar que el compilador de Vite / Oxc no reporte errores de sintaxis en la terminal.
3. Asegurar que las variables globales y locales permanezcan reactivas tras la envoltura.
