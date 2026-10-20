# SOP: Selector Desplegable de Diapositivas ("Elegir diapositiva")

Este procedimiento operativo estándar (SOP) define la incorporación de un control de navegación directo en el contenedor de diapositivas (`SlideContainer.jsx`), permitiendo saltar a cualquier punto de la Parte 1 y la Parte 3 sin depender exclusivamente del avance secuencial uno a uno.

---

## 1. Requerimiento y Alcance

* **Ubicación:** Entre los botones `[← Anterior]` y `[Siguiente →]` en la barra superior de cada diapositiva (`SlideContainer.jsx`).
* **Comportamiento:** Un menú desplegable interactivo con la lista de diapositivas de la Parte activa. Al seleccionar una opción, la vista navega inmediatamente a esa diapositiva.
* **Filtro de Partes:**
  * **Parte 1 (Modelo Actuarial - VAAD):** **Activo** (5 diapositivas: Puntos 1 al 5).
  * **Parte 2 (Quiebre Metodológico):** **Inactivo** (solo 2 diapositivas, navegación secuencial directa).
  * **Parte 3 (Análisis Econométrico y PTP):** **Activo** (5 diapositivas: Puntos 7 al 11).

---

## 2. Especificaciones de Interfaz y Estilos

1. **Diseño Visual:**
   * Soporte estricto de Modo Claro y Modo Oscuro (Tailwind).
   * Indicador visual claro ("Elegir diapositiva") y flecha desplegable Chevron.
   * Contraste y bordes armonizados con la paleta de la aplicación (`slate-800`, `slate-700`, `teal-500`).
2. **Respeto de Permisos RBAC:**
   * El desplegable consumirá únicamente las secciones filtradas en `allowedSections`, garantizando que un usuario con permisos restringidos solo vea y pueda saltar a las diapositivas autorizadas para su rol.
