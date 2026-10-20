# SOP Arquitectura: Paridad Técnica Arancel Dialítico

## 1. Objetivo
Desarrollar una aplicación web interactiva que exponga los 15 puntos del documento "Trabajo Final - Paridad Técnica Arancel Dialítico" como un hilo narrativo. La app utilizará un patrón App Shell y combinará texto académico con simuladores matemáticos/econométricos interactivos.

## 2. Infraestructura y Despliegue (Regla de Disponibilidad Permanente)
*   **Hosting Web:** Vercel (Serverless). **La aplicación estará siempre viva en internet.** Al ser Serverless, escala a cero cuando no se usa y no genera costos, pero a diferencia de las bases de datos de Supabase, **nunca se pausará ni se dará de baja automáticamente por inactividad.**
*   **Repositorio:** GitHub Privado. Garantiza que el código fuente, la lógica actuarial cruda y los datos nunca queden expuestos públicamente. Vercel solo compila y expone un bundle ofuscado.

## 3. Arquitectura de Datos y Estado
*   **Origen de Datos:** No se utilizará base de datos. Las series de tiempo (IPC, USD, CCT) y parámetros de mortalidad estarán alojados internamente en archivos estáticos `.xlsx` o `.csv`.
*   **Parseo en cliente:** Se utilizarán librerías como `papaparse` o `xlsx` para cargar los datos en memoria al renderizar las simulaciones.

## 4. Seguridad, Autenticación y RBAC (Role-Based Access Control)
*   **Autenticación:** Firebase Auth (u otra alternativa stateless como NextAuth). La aplicación está completamente bloqueada para usuarios anónimos.
*   **Cuentas Root/Admin:** 
    1.  `elcibernico@gmail.com`
    2.  `ndemartis@fcecon.unr.edu.ar`
    3.  `estudiocontableid@fcecon.unr.edu.ar`
*   **Whitelisting & Permisos:** Los administradores accederán a un panel de control para dar de alta otros correos (whitelist). Mediante Custom Claims (o JSON estático encriptado temporal), los Admins definirán a qué "Puntos" (1 al 15) puede acceder cada invitado.

## 5. Diseño Visual y Navegación
*   **Framework:** React (Vite o Next.js) con TailwindCSS.
*   **Estética:** Obligatorio seguir directivas visuales de `Libro Financiera` (Modo oscuro slate-900 priorizado, tipografías elegantes, gradients útiles).
*   **Layout App Shell:**
    *   **Header Sticky:** Título, navegación, toggle dark mode, y estado de login.
    *   **Main Inmutable:** Renderiza cada "Slide/Punto" de manera independiente. Sin scroll infinito.
    *   **Footer:** Información de contacto, símbolo de pi ($\pi$) discreto para acceso a `/admin`.
*   **Textos:** Administrados por un `config.json` para evitar hardcoding en componentes.

## 6. Bucle de Desarrollo (Agente)
1. Leer siempre esta directiva antes de codificar.
2. Usar Vite (`npx -y create-vite@latest`) para inicializar si no existe el proyecto en `app/`.
3. Todo código va a `app/src/`.
4. Si hay fallas, parchear código y actualizar *esta directiva* o una nueva con las "Trampas Conocidas".

## 7. Trampas Conocidas y Lecciones Aprendidas
*   **Vite 8 + TailwindCSS v4:** En PowerShell/Windows, ejecutar comandos `npx` mediante `cmd /c` para evitar bloqueos de ejecución `.ps1`. Vite 8 requiere `@tailwindcss/vite` y `@tailwindcss/postcss` con `@import "tailwindcss";` en `index.css`. No usar la sintaxis legacy v3 `@tailwind base;` con Vite 8.
*   **Regla de Diseño Narrativo e Interactivación por Capas (No Diapositivas Estáticas):** Cada Punto o Capítulo debe funcionar como una **experiencia interactiva revelable por capas** y no como un bloque estático de texto. Debe estructurarse estrictamente bajo el esquema de 4 pasos: 
    1. **El Enigma/Problema:** Qué falla en el paradigma actual.
    2. **La Solución Metodológica:** La propuesta técnica.
    3. **Las Pruebas/Simulador (Opcional por el usuario):** Botón para revelar tablas, gráficos o demostraciones de fórmulas.
    4. **El Conflicto Disparador:** La limitación del punto actual que sirve de puente narrativo para el punto siguiente.
*   **Regla de Sintaxis JSX para Etiquetas Vacías Auto-Cerradas (`<br />`, `<img />`):** En React/JSX es estrictamente obligatorio que las etiquetas HTML sin contenido de cierre (como `<br>`, `<img>`, `<input>`, `<hr>`) estén **auto-cerradas con una barra al final: `<br />`, `<img />`, `<input />`**. Si se coloca `<br>` sin `/`, el compilador de JSX fallará esperando una etiqueta de cierre `</br>`.
## 8. Taxonomía de Jerarquía y Convención de Lenguaje (Estándar de Comunicación y RBAC)
Para garantizar una comunicación unívoca entre el Usuario y el Agente, y para estructurar la matriz de permisos del Panel de Administración (RBAC), la aplicación queda formalmente dividida en **3 Niveles Jerárquicos**:

1. **Nivel 1 - PARTES (Secciones Principales):**
   * **1ª Parte:** Modelo Actuarial (VAAD, Biometría y Riesgos Competitivos) -> Puntos 1 al 6.
   * **2ª Parte:** Análisis Econométrico (Fórmula Polinómica, MCO, Regresión Ridge e Impacto Financiero) -> Puntos 7 al 15.

2. **Nivel 2 - PUNTOS (Slides / Vistas Principales):**
   * Los 15 Capítulos individuales del trabajo (ej: *Punto 1: Introducción*, *Punto 2: Sesgo de Kaplan-Meier*, *Punto 14: Epílogo Aplicado*). Cada punto corresponde a un componente/pantalla en la aplicación.

3. **Nivel 3 - APARTADOS (Sub-secciones e Interacciones por Capas dentro de cada Punto):**
   * Bloques interactivos desplegables dentro de una misma vista (ej. en *Punto 2*: *Apartado 1: ¿El Problema?*, *Apartado 2: ¿La Solución (CIF)?*, *Apartado 3: Ver Desviación (+11.4%)*, *Apartado 4: ¿El Conflicto Final?*).

*El Panel de Administración (RBAC) deberá soportar el otorgamiento/revocación de visibilidad de manera granular a cualquiera de estos 3 niveles (Parte, Punto o Apartado específico por correo autorizado).*

*   **Entorno de Sistema Operativo y Comandos (Windows):** El usuario opera en **Windows** (PowerShell/CMD). **NUNCA** intentar abrir el navegador automáticamente o lanzar comandos que dependan de herramientas de macOS/Linux (como `open` o scripts de apertura automática de URLs). Al ejecutar servidores locales (como Vite), la instrucción debe ser lanzar el servidor en background con `isDaemon: true` o `cmd /c` sin forzar la apertura del navegador, dejando que el usuario lo acceda directamente en su navegador local.

## 9. Componentes Cerrados y Congelados (No Modificar)
Los siguientes componentes e interfaces han sido declarados como finales por el usuario y **no deben ser modificados bajo ninguna circunstancia**, salvo indicación expresa suya:
*   **Punto 7 (Modelo Polinómico de Costos Estructurales / Modelo Retrospectivo - `Punto7.jsx`):** Cerrado y congelado el 08-08-2026.


