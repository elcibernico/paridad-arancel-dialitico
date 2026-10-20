# Especificación Técnica e Instrucciones de Integración: Simulador Dinámico de Sensibilidad y Elasticidad

> **PROMPT PARA ANTIGRAVITY 2.0:**
> Por favor, integra en el módulo de simulación de la aplicación la lógica de cálculo dinámico en tiempo real para cualquier rango de fechas o períodos seleccionados por el usuario ($n$ observaciones).
> 
> La aplicación debe filtrar la serie de datos según los meses seleccionados, realizar las operaciones matriciales de regresión regularizada Ridge, calcular dinámicamente los coeficientes de sensibilidad marginal, las elasticidades promedio en la media y las métricas de bondad de ajuste ($SS_{\text{Res}}$, $SS_{\text{Tot}}$, $R^2$) en tiempo real, actualizando la interfaz y las visualizaciones.

---

## 1. Justificación del Modelo: Ridge vs. MCO (OLS)

Para mitigar los problemas de multicolinealidad entre las variables explicativas ($\text{IPC}$, $\text{USD}$ y $\text{CCT}$) a lo largo del tiempo, la estimación de los coeficientes del modelo se realiza mediante **Regresión Ridge** en lugar de Mínimos Cuadrados Ordinarios (MCO).

La razón teórica y práctica es la reducción del Error Cuadrático Medio (MSE) de los estimadores:

$$MSE(\hat{\beta}_{\text{Ridge}}) < MSE(\hat{\beta}_{\text{MCO}})$$

El estimador Ridge para un conjunto de $n$ períodos seleccionados se calcula matricialmente como:

$$\hat{\beta}_{\text{Ridge}} = (X^T X + \lambda I)^{-1} X^T Y$$

Donde:

- $X$: Matriz de diseño de dimensión $n \times (k+1)$, compuesta por una columna de unos (intercepto) y las $k$ variables independientes ($\text{IPC}$, $\text{USD}$, $\text{CCT}$).
- $Y$: Vector columna de dimensión $n \times 1$ con los valores históricos del arancel (`valorSesionHD`).
- $\lambda$: Parámetro de penalización o regularización ($\lambda \ge 0$).
- $I$: Matriz identidad de dimensión $(k+1) \times (k+1)$.

---

## 2. Sensibilidad vs. Elasticidad Dinámica ($n$ Períodos)

Cada vez que el usuario modifica el rango de fechas en la interfaz, el sistema filtra $n$ observaciones mensuales y evalúa dos métricas complementarias para cada variable $j \in \{\text{IPC}, \text{USD}, \text{CCT}\}$:

### A. Sensibilidad Marginal Absoluta ($\beta_j$)

Corresponde a los coeficientes obtenidos directamente del vector $\hat{\beta}_{\text{Ridge}}$:

$$\hat{\beta}_{\text{Ridge}} = \begin{bmatrix} \beta_0 \\ \beta_{\text{IPC}} \\ \beta_{\text{USD}} \\ \beta_{\text{CCT}} \end{bmatrix}$$

- **Interpretación:** Mide el cambio absoluto en pesos ($) en la tarifa de la sesión por cada incremento de **1 unidad** en la variable $X_j$, manteniendo constantes las demás variables (*ceteris paribus*).

### B. Elasticidad Promedio Punto ($\epsilon_j$)

Para mostrar en la interfaz la variación porcentual esperada, el sistema calcula dinámicamente la **elasticidad evaluada en la media** del subconjunto de $n$ períodos seleccionados:

$$\text{Elasticidad}_{X_j} = \beta_j \cdot \frac{\bar{X}_j}{\bar{Y}}$$

Donde las medias muestrales del rango activo son:

$$\bar{Y} = \frac{1}{n} \sum_{t=1}^n Y_t, \quad \bar{X}_j = \frac{1}{n} \sum_{t=1}^n X_{j,t}$$

- **Interpretación:** Un incremento del 1% en la variable $X_j$ produce una variación porcentual promedio del $\epsilon_j\%$ en el valor del arancel durante el período analizado.

---

## 3. Evaluador de Bondad de Ajuste ($R^2$)

Para validar en tiempo real si el subconjunto de $n$ períodos elegido posee un buen ajuste predictivo, el sistema recalcula el Coeficiente de Determinación ($R^2$):

### A. Suma de Residuos al Cuadrado ($SS_{\text{Res}}$)

Cuantifica la variabilidad del arancel nominal que el modelo regularizado no logra explicar:

$$SS_{\text{Res}} = \sum_{t=1}^n (Y_t - \hat{Y}_t)^2$$

Donde $\hat{Y}_t = X_t \hat{\beta}_{\text{Ridge}}$ es la estimación del modelo para el período $t$.

### B. Suma Total de Cuadrados ($SS_{\text{Tot}}$)

Mide la variabilidad total intrínseca observada en las tarifas con respecto a su media muestral:

$$SS_{\text{Tot}} = \sum_{t=1}^n (Y_t - \bar{Y})^2$$

### C. Coeficiente de Determinación ($R^2$)

Calculado dinámicamente como:

$$R^2 = 1 - \left(\frac{SS_{\text{Res}}}{SS_{\text{Tot}}}\right)$$

---

## 4. Flujo Algorítmico de Ejecución en Tiempo Real

1. **Filtro de Entrada:** Capturar el rango de fechas seleccionado por el usuario y extraer la submatriz de datos con $n$ filas.
2. **Construcción de Matrices:**
   - Crear vector $Y_{n \times 1}$ con `valorSesionHD`.
   - Crear matriz $X_{n \times 4}$ agregando columna de unos para el término independiente.
3. **Cálculo de Parámetros:**
   - Resolver $\hat{\beta}_{\text{Ridge}} = (X^T X + \lambda I)^{-1} X^T Y$.
   - Calcular vector de estimaciones $\hat{Y} = X \hat{\beta}_{\text{Ridge}}$.
4. **Cálculo de Métricas Descriptivas:**
   - Obtener las medias $\bar{Y}$ y $\bar{X}_j$ para el subconjunto $n$.
   - Calcular elasticidades: $\epsilon_j = \beta_j \cdot (\bar{X}_j / \bar{Y})$.
5. **Cálculo de Ajuste:**
   - Computar $SS_{\text{Res}} = \sum (Y_t - \hat{Y}_t)^2$.
   - Computar $SS_{\text{Tot}} = \sum (Y_t - \bar{Y})^2$.
   - Computar $R^2 = 1 - (SS_{\text{Res}} / SS_{\text{Tot}})$.
6. **Renderizado:** Actualizar las tarjetas de métricas, coeficientes de sensibilidad, elasticidades y gráficos del simulador.
