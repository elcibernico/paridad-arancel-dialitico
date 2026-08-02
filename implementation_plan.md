# Corrección de Arquitectura Dark Mode y Contraste

El problema actual donde "los botones se ven oscuros en modo claro" y "las letras se ven blancas sobre fondos claros" se debe a una falla de sincronización en el compilador JIT de TailwindCSS (provocada por la modificación masiva de archivos vía script). Tailwind no compiló las nuevas clases estáticas generadas (`bg-white`, `text-slate-900`, etc.), por lo que el navegador aplica los estilos globales definidos en el `body` de `index.css` (fondo oscuro y texto blanco).

Adicionalmente, el script de migración omitió los operadores ternarios anidados (multilínea) presentes en los botones de selección, dejando una mezcla inconsistente de lógica en los componentes.

## User Review Required
> [!IMPORTANT]  
> Este plan delega en Gemini Flash la limpieza final manual de los componentes y el reinicio del servidor de desarrollo para forzar la recompilación de TailwindCSS. ¿Estás de acuerdo con proceder con esta limpieza?

## Proposed Changes

### 1. Limpieza de JSX (Componentes Punto 1 al 6)
- **Eliminar remanentes de ternarios:** Buscar en los archivos `Punto1.jsx` a `Punto6.jsx` cualquier bloque que siga utilizando `${isDarkMode ? ... : ...}` (especialmente en los botones de pestañas que estaban escritos en múltiples líneas) y convertirlos puramente a clases de Tailwind `dark:`.
- **Limpiar Props:** Eliminar el prop `isDarkMode` de la firma de todos los componentes `PuntoX` (ej: `export default function Punto1({ isDarkMode })` pasa a `export default function Punto1()`).

### 2. Refactorización en App.jsx y SlideContainer.jsx
#### [MODIFY] src/App.jsx
- Eliminar el paso del prop `isDarkMode` a los componentes `Punto1` a `Punto6`.
- Mantener el `useEffect` que gestiona la clase `.dark` en el `<html>` raíz, ya que esta es la base de la estrategia `darkMode: 'class'`.

#### [MODIFY] src/components/SlideContainer.jsx
- Corregir el uso de colores inexistentes en Tailwind (ej: reemplazar `text-slate-850` por `text-slate-800` o `text-slate-900`).
- Convertir la lógica del contenedor principal para usar `dark:` en lugar del ternario manual de JS.

### 3. Recompilación (Reinicio de Servidor)
- **Matar los procesos huérfanos de Vite:** Existen múltiples instancias de `npm run dev` corriendo en background que colisionaron durante la escritura masiva.
- **Iniciar un servidor limpio:** Ejecutar nuevamente `npm run dev -- --host` para que Tailwind JIT escanee desde cero los archivos `.jsx` y genere correctamente las reglas CSS para `bg-white`, `text-slate-900`, etc.

## Verification Plan
1. **Verificación Visual en Navegador:** Una vez que Vite se reinicie, verificar que en modo claro los contenedores tengan fondo blanco (`bg-white`) y el texto sea oscuro (`text-slate-900`), solucionando la invisibilidad actual.
2. **Revisión de Consola:** Confirmar que no haya errores de React por clases mal formadas o variables `isDarkMode` no definidas.
