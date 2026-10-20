# Modelo de Determinación y Proyección de Costos de la Prestación Dialítica

## 1. Introducción al Modelo de Costos Dialíticos

La determinación precisa de los costos asociados a la prestación dialítica constituye un pilar fundamental para la sustentabilidad financiera y la eficiencia operativa de los sistemas de salud contemporáneos. En el ámbito de la economía de la salud, este análisis trasciende la mera identificación del gasto histórico, orientándose hacia la construcción de proyecciones robustas que permitan mitigar la incertidumbre en la asignación de recursos.

La prestación dialítica se caracteriza por una estructura de costos compleja, altamente dependiente de insumos importados, tecnología médica de alta complejidad y personal especializado. Debido a esta naturaleza, el desarrollo de modelos econométricos capaces de capturar la variabilidad de los determinantes macroeconómicos y operativos, es imperativo para garantizar una gestión basada en evidencia. El objetivo primordial de este estudio es implementar un marco analítico que asegure estimaciones estables, incluso ante escenarios de alta volatilidad en los precios de los factores productivos.

## 2. Metodología: Estimación mediante Regresión Lineal y MCO

Para modelar la determinación de costos, se emplea inicialmente el modelo de regresión lineal múltiple, donde la variable dependiente ($\mathbf{Y}$) representa el costo total de la prestación y el conjunto de variables explicativas ($\mathbf{X}$) comprende indicadores macroeconómicos y operativos críticos [1].

El modelo general se define mediante la siguiente relación matricial:

$\mathbf{Y} = \mathbf{X}\boldsymbol{\beta} + \boldsymbol{\epsilon}$

Donde:

- $\mathbf{Y}$ es un vector de dimensión ($n \times 1$) que contiene los valores observados de los costos de diálisis.
- $\mathbf{X}$ es la matriz de diseño de dimensión ($n \times (m + 1)$), que integra observaciones de variables como el precio de filtros de polisulfona, concentrados, salarios de enfermería especializada y el tipo de cambio.
- $\boldsymbol{\beta}$ es el vector de parámetros de dimensión ($(m + 1) \times 1$) que cuantifica el efecto marginal de cada insumo sobre el costo total.
- $\boldsymbol{\epsilon}$ es el vector de errores aleatorios, asumiendo $\boldsymbol{\epsilon} \sim N(0, \sigma^2\mathbf{I}_n)$.

Bajo el cumplimiento de los supuestos clásicos, la estimación de los parámetros se realiza mediante **Mínimos Cuadrados Ordinarios (MCO)**, cuya solución analítica requiere la invertibilidad de la matriz de información ($\mathbf{X}^T\mathbf{X}$) [1]:

$\hat{\boldsymbol{\beta}}_{OLS} = (\mathbf{X}^T\mathbf{X})^{-1}\mathbf{X}^T\mathbf{Y}$

Este procedimiento garantiza los mejores estimadores lineales insesgados (BLUE), siempre que no existan violaciones graves a la independencia de las variables explicativas.

## 3. El Problema de la Multicolinealidad en Salud

En el análisis de costos de salud, es frecuente encontrar que las variables independientes (como los precios de diferentes insumos médicos o el nivel general de inflación) presentan una asociación lineal extremadamente fuerte. Este fenómeno, denominado multicolinealidad, impide la identificación precisa de la contribución individual de cada factor al costo prestacional.

Desde un enfoque econométrico, la multicolinealidad se vincula con la pérdida de **ortogonalidad**. Cuando las variables son perfectamente ortogonales, los autovalores (*eigenvalues*) de la matriz de información son iguales a la unidad; a medida que la asociación lineal aumenta, al menos un autovalor se aproxima a cero, provocando que la varianza de los estimadores se infle de manera desproporcionada [1].

Se distinguen dos manifestaciones del problema:

1. **Multicolinealidad Perfecta:** Cuando $|\mathbf{X}^T\mathbf{X}| = 0$, la matriz es singular y el sistema de ecuaciones normales no tiene solución única.
2. **Semi-Multicolinealidad:** Cuando $|\mathbf{X}^T\mathbf{X}| \approx 0$, los estimadores se vuelven extremadamente sensibles a pequeñas fluctuaciones en los datos, comprometiendo la validez de las inferencias [1].

### Métodos de Detección

Para diagnosticar la severidad de este problema en modelos de diálisis, se aplican dos métricas fundamentales:

- **Condition Number (CN):** Evalúa la dispersión de los autovalores de la matriz de diseño. Se calcula como:
  $CN = \sqrt{\lambda_{max} / \lambda_{min}}$ 
  Valores de CN entre **20 y 30** sugieren una multicolinealidad alta, mientras que valores en el rango de **30 a 100** indican una multicolinealidad muy severa, exigiendo medidas correctivas inmediatas [1].

- **Variance Inflation Factor (VIF):** Cuantifica cuánto se incrementa la varianza de un coeficiente debido a su correlación con las demás variables explicativas:
  $VIF = \frac{1}{1 - R_j^2}$
  Se adopta el criterio de $VIF \geq 10$ como umbral crítico para confirmar la presencia de multicolinealidad significativa [1].

## 4. Regularización mediante Ridge Regression (Regresión Cresta)

Cuando la matriz ($\mathbf{X}^T\mathbf{X}$) se aproxima a la singularidad, los resultados de MCO dejan de ser confiables, produciendo a menudo **signos contraintuitivos** (por ejemplo, que un aumento en el salario de enfermería parezca reducir el costo total), lo cual carece de lógica económica [1]. La Regresión Cresta (Ridge Regression) soluciona este dilema mediante la adición de un parámetro de sesgo positivo $k$ (o $n\lambda$) a la diagonal principal de la matriz de información [2], [3].

El objetivo es minimizar la función de pérdida penalizada para obtener el vector de pesos $\vec{w} (o \boldsymbol{\beta})$:

$R_{ridge}(\vec{w}) = \frac{1}{n} \cdot \lVert \vec{y} - \mathbf{X} \cdot \vec{w} \rVert_2^2 + \lambda \cdot \sum_{j=1}^d w_j^2$

El estimador de cresta ordinario ($\hat{\boldsymbol{\beta}}_{ORR}$) se define como:

$\hat{\boldsymbol{\beta}}_{ORR} = (\mathbf{X}^T\mathbf{X} + k\mathbf{I})^{-1}\mathbf{X}^T\mathbf{Y}$

Donde $\mathbf{I}$ es la matriz identidad. Este estimador es único y siempre está definido, incluso cuando la matriz $\mathbf{X}$ no es de rango completo [3], [5]. Aunque introduce un sesgo controlado, logra una reducción drástica de la varianza, resultando en un Error Cuadrático Medio (MSE) significativamente menor al de MCO en presencia de multicolinealidad [1].

### Selección del Parámetro $k$ Óptimo

La precisión del modelo depende de la selección adecuada del parámetro $k$. Se implementa el procedimiento iterativo de **Hoerl & Kennard (1976)**, partiendo de un valor inicial:

$K_{HKB} = \frac{p \hat{\sigma}^2}{\hat{\boldsymbol{\beta}}' \hat{\boldsymbol{\beta}}}$

Donde $p$ es el número de variables y los parámetros iniciales provienen de MCO. El algoritmo itera hasta alcanzar la convergencia, definida por el umbral $\epsilon$ [1], [4]:

$\epsilon = 20 [tr(\mathbf{X}^T\mathbf{X})^{-1} P/]^{-1.30}$

## 5. Análisis de Sensibilidad y Proyección de Costos

La superioridad de la Regresión Cresta en el análisis de costos dialíticos radica en su capacidad para estabilizar los coeficientes de los "cost drivers" [6]. Al regularizar el modelo, se eliminan los efectos de la inflación artificial de la varianza, permitiendo que las proyecciones de costos reflejen la realidad técnica de la prestación.

A diferencia de MCO, que puede arrojar resultados inestables ante ruidos en variables como el precio de los concentrados o la energía para el tratamiento de agua, Ridge asegura que los signos de los coeficientes sean económicamente consistentes. Esto facilita la realización de análisis de sensibilidad robustos, permitiendo a los gestores de salud proyectar el impacto de variaciones en insumos específicos con una precisión estadística superior, fundamental para la negociación de tasas prestacionales y la planificación financiera a largo plazo.

## 6. Referencias

1. Bager, A., Roman, M., Algedih, M., & Mohammed, B. (2017). *Addressing multicollinearity in regression models: a ridge regression application*. Munich Personal RePEc Archive (MPRA), No. 81390.
2. Hoerl, A. E., & Kennard, R. W. (1970). *Ridge Regression: Biased Estimation for Nonorthogonal Problems*. Technometrics.
3. Van Wieringen, W. N. (2015). *Lecture notes on ridge regression*. arXiv:1509.09169.
4. Dorugade, A. V., & Kashid, D. N. (2010). *Alternative Method for Choosing Ridge Parameter for Regression*.
5. Practical Data Science (EECS 398). *Guide to Ridge Regression and Normal Equations under Multicollinearity*.
6. NCSS Statistical Software. *Ridge Regression Analysis*. (Ref: Solari).
