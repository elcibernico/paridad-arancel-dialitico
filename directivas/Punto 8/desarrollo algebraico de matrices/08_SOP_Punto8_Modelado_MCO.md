# SOP Punto 8: Modelado Econométrico Histórico (Estimación MCO de Elasticidades)

## 1. Objetivo
Implementar la simulación econométrica interactiva del Punto 8 ("Modelado Econométrico Histórico: Estimación MCO de Elasticidades") dentro de la aplicación web. El usuario podrá seleccionar un rango temporal de la serie de tiempo histórica (2020-2024), visualizar la evolución de los índices macroeconómicos ($CCT$, $USD$, $IPC$), estimar los coeficientes MCO ($\hat{\boldsymbol{\beta}}$), evaluar la bondad de ajuste ($R^2$, varianza residual, errores estándar), visualizar la comparación entre arancel real vs arancel estimado por MCO, y desplegar el desarrollo matricial analítico completo en tablas HTML interactivas con estética dark glassmorphism.

---

## 2. Entradas y Fuentes de Datos
- **Dataset Principal:** `app/src/data/seriesData.json`
- **Variables Explícitas:**
  - $Y$: Arancel Real cobrado (`valorSesionHD`, `valorSesionHDF` o `valorModuloDP`).
  - $X_1$: Índice / Valor del CCT (`cct`).
  - $X_2$: Índice / Valor del Dólar (`usd`).
  - $X_3$: Índice / Valor del IPC (`ipc`).
- **Librería de Cálculo Matricial:** `mathjs` (vía `src/utils/matrixMath.js`).

---

## 3. Lógica del Modelo Matemático MCO

### 3.1. Matriz de Diseño ($\mathbf{X}$) y Vector Objetivo ($\mathbf{Y}$)
Para un rango de $n$ períodos seleccionados:
$$
\mathbf{Y} = \begin{bmatrix} Y_1 \\ Y_2 \\ \vdots \\ Y_n \end{bmatrix}, \quad
\mathbf{X} = \begin{bmatrix} 
1 & CCT_1 & USD_1 & IPC_1 \\
1 & CCT_2 & USD_2 & IPC_2 \\
\vdots & \vdots & \vdots & \vdots \\
1 & CCT_n & USD_n & IPC_n 
\end{bmatrix}
$$
*(Nota: Soporta tanto valores absolutos como índices rebasados al primer período del rango seleccionado).*

### 3.2. Ecuación Normal de Mínimos Cuadrados Ordinarios
$$
\hat{\boldsymbol{\beta}}_{OLS} = (\mathbf{X}^T \mathbf{X})^{-1} \mathbf{X}^T \mathbf{Y}
$$
donde $\hat{\boldsymbol{\beta}} = [\hat{\beta}_0, \hat{\beta}_{CCT}, \hat{\beta}_{USD}, \hat{\beta}_{IPC}]^T$.

### 3.3. Estadísticos y Métricas de Diagnóstico
1. **Valores Ajustados y Residuales:**
   $$ \hat{\mathbf{Y}} = \mathbf{X} \hat{\boldsymbol{\beta}}, \quad \mathbf{e} = \mathbf{Y} - \hat{\mathbf{Y}} $$
2. **Suma de Cuadrados Residuales (SSR) y Varianza Residual ($\hat{\sigma}^2$):**
   $$ SSR = \mathbf{e}^T \mathbf{e}, \quad \hat{\sigma}^2 = \frac{SSR}{n - p} \quad (p=4) $$
3. **Coeficiente de Determinación ($R^2$) y $R^2_{ajustado}$:**
   $$ R^2 = 1 - \frac{SSR}{\sum (Y_i - \bar{Y})^2}, \quad R^2_{adj} = 1 - (1 - R^2)\frac{n - 1}{n - p} $$
4. **Matriz de Varianza-Covarianza y Errores Estándar:**
   $$ \text{Var}(\hat{\boldsymbol{\beta}}) = \hat{\sigma}^2 (\mathbf{X}^T \mathbf{X})^{-1}, \quad SE(\hat{\beta}_j) = \sqrt{\text{Var}(\hat{\boldsymbol{\beta}})_{jj}} $$
5. **Estadístico $t$ y p-valores:**
   $$ t_j = \frac{\hat{\beta}_j}{SE(\hat{\beta}_j)} $$
6. **Autovalores, Condition Number (CN) y VIF:**
   - Autovalores $\lambda_{max}, \lambda_{min}$ de $(\mathbf{X}^T \mathbf{X})$.
   - $CN = \sqrt{\lambda_{max} / \lambda_{min}}$.
   - $VIF_j = \frac{1}{1 - R_j^2}$ donde $R_j^2$ es el $R^2$ de la regresión auxiliar de $X_j$ contra las demás variables explicativas.

---

## 4. Componentes a Desarrollar

1. `app/src/utils/matrixMath.js`
   - Cálculo determinista con `mathjs`.
   - Formateo y retorno de matrices interactivas ($\mathbf{X}$, $\mathbf{X}^T$, $\mathbf{X}^T \mathbf{X}$, $(\mathbf{X}^T \mathbf{X})^{-1}$, $\hat{\boldsymbol{\beta}}$, métricas).

2. `app/src/components/charts/EvolucionIndicesChart.jsx`
   - Gráfico SVG interactivo multilínea en modo oscuro.
   - Muestra las curvas rebasadas de $CCT$, $USD$, $IPC$ y Arancel Real.
   - Tooltip dinámico al pasar el cursor.

3. `app/src/components/charts/SensibilidadMCOChart.jsx`
   - Gráfico SVG interactivo comparativo: Arancel Real Observado vs Arancel Estimado por MCO ($\hat{Y}$).
   - Muestra la banda de dispersión/residuales.

4. `app/src/components/points/Punto8.jsx`
   - Implementa la estructura de 4 capas:
     1. El Enigma / Introducción a MCO.
     2. Especificación Econométrica Matricial.
     3. 🎛️ Filtro Temporal de Fechas + Modalidad + Gráficos y Botón para desplegar Tablas Matemáticas Analíticas.
     4. ⚠️ El Conflicto Disparador (Multicolinealidad).

5. Integración en `App.jsx` (`currentPoint === 8`).

---

## 5. Trampas Conocidas y Lecciones Aprendidas
- **Invertibilidad Singular:** En sub-rangos muy pequeños ($n \le 4$), $\mathbf{X}^T \mathbf{X}$ puede ser casi singular o no invertible. Se debe incluir try/catch o comprobación de determinante positivo antes de invertir con `math.inv()`.
- **Formateo de Números Grandes:** El arancel y los salarios son montos en pesos argentinos ($>100,000$). Los índices y matrices deben mostrar formato claro (ej. `Math.round()` o `toFixed(4)` con separadores de miles).
- **Estética Dark Glassmorphism:** Usar tarjetas `bg-slate-900/80 backdrop-blur border border-slate-800` con resplandores `shadow-2xl` y acentos `teal-400`, `indigo-400`, `fuchsia-400`, `emerald-400`.
