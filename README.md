# Paridad Técnica y Actuarial del Arancel Dialítico

Aplicación web interactiva desarrollada con **React + Vite + Tailwind CSS** para el cálculo, análisis actuarial y presentación técnica de la fórmula de paridad y recomposición del arancel dialítico.

- **Despliegue en producción:** [https://paridad-arancel-dialitico.vercel.app](https://paridad-arancel-dialitico.vercel.app)
- **Repositorio:** [https://github.com/elcibernico/paridad-arancel-dialitico](https://github.com/elcibernico/paridad-arancel-dialitico)

---

## 🚀 Últimas Actualizaciones (Octubre 2026)

1. **Corrección de Amortización Retrospectiva (Punto 11):**
   - Ajuste actuarial en la amortización de deuda histórica: el saldo acumulado real de pérdidas históricas $\sum \max(0, V^P_m - Y_m)$ se amortiza exclusivamente sobre el horizonte prospectivo de proyección $K$, desacoplándolo del período histórico $M$.
   - Sincronización del toggle de Ajuste Polinómico con permisos RBAC y recálculo en tiempo real.

2. **Navegación Rápida por Selector Desplegable:**
   - Incorporación de un menú desplegable interactivo (*"Elegir diapositiva"*) ubicado en la barra de navegación entre los botones `← Anterior` y `Siguiente →`.
   - Disponible en la **Parte 1** y la **Parte 3** para saltar de forma no secuencial a cualquier sección.
   - Diseño optimizado con alto contraste y paleta oscura (`bg-slate-900`, `text-white font-bold`, bordes destacados).

3. **Arquitectura y Memoria Viva (Directivas SOP):**
   - Integración de la carpeta `directivas/` con los Procedimientos Operativos Estándar (SOPs) que documentan cada regla matemática, restricciones y casos de borde del proyecto.

---

## 📂 Estructura del Proyecto

```text
├── directivas/             # SOPs y documentación técnica de la lógica de negocio
├── public/                 # Recursos estáticos
├── src/
│   ├── components/         # Componentes modulares
│   │   ├── points/         # Puntos de la presentación (Punto 1 al Punto 14)
│   │   ├── SlideContainer  # Contenedor con barra de navegación y selector
│   │   ├── Header / Footer # Encabezado y pie de página
│   │   └── LoginView       # Control de acceso y autenticación Supabase
│   ├── context/            # Contexto de autenticación y permisos RBAC
│   └── index.css           # Estilos globales Tailwind CSS v4
├── package.json
└── vite.config.js
```

---

## 🛠️ Instalación y Ejecución Local

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Compilar para producción
npm run build
```
