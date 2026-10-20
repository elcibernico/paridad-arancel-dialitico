# Marco Metodológico: Modelo de Determinación y Proyección de Costos de la Prestación Dialítica

Este documento detalla los algoritmos, la formulación matemática y el sustento económico del modelo desarrollado para evaluar la sustentabilidad financiera de la prestación de hemodiálisis en pacientes con Enfermedad Renal Crónica Terminal (ERCT).

El modelo aborda el problema desde dos dimensiones metodológicas complementarias:

1. **El Enfoque Microeconómico de Estructura de Costos (Fórmula Polinómica)**: Determina cuál *debería* ser el valor de la sesión para mantener el equilibrio operativo del prestador.

2. **El Enfoque Econométrico de Comportamiento Histórico (Regresión Lineal Múltiple - MCO)**: Analiza cómo ha reaccionado *efectivamente* la financiadora (obra social o prepaga) ante los shocks macroeconómicos del país.

## 1. El Modelo Polinómico de Costos Estructurales

### ¿Por qué una Fórmula Polinómica?

En economía de la salud, los prestadores de servicios médicos de alta complejidad enfrentan estructuras de costos heterogéneas. La hemodiálisis es un caso crítico: combina mano de obra calificada altamente regulada con insumos biomédicos importados que cotizan en moneda dura.

Una fórmula polinómica permite agrupar los componentes del costo en grandes familias y ponderarlos según su participación real en el costo total de la práctica. Al actualizar cada componente por su índice sectorial correspondiente, obtenemos un **Índice de Costos Dialíticos** que refleja la inflación real de la actividad, aislando las presiones arbitrarias de las negociaciones de / con las obras sociales o financiadoras.

### Formulación Matemática Paso a Paso

Definimos tres dimensiones de costo fundamentales para la hemodiálisis en Argentina:

1. **Factor Trabajo (**$CCT$**):** Representado por la escala salarial del Convenio Colectivo de Trabajo (CCT 108/75) correspondiente a enfermeros, técnicos y personal de sanidad de clínicas sin internación. Es el componente más rígido.

2. **Factor Insumos y Tecnología (**$USD$**):** Representado por el tipo de cambio oficial de la moneda nacional frente al Dólar estadounidense. Prácticas como la hemodiálisis requieren dializadores (filtros de fibra hueca), líneas de sangre, agujas de fístula, concentrados de bicarbonato y membranas de ósmosis que no siempre tienen sustitutos locales y se ajustan al mercado de divisas.

3. **Factor Gastos de Estructura y Servicios (**$IPC$**):** Representado por el Índice de Precios al Consumidor general. Agrupa la energía eléctrica, el consumo masivo de agua potable tratada, la disposición de residuos biopatogénicos, el mantenimiento edilicio y los seguros médicos.

#### Paso 1: Ponderación de Pesos (Restricción de Completitud)

Se asigna a cada factor un peso porcentual ($w$) según la estructura operativa del centro de diálisis. Estos pesos deben sumar la unidad:

$w_{CCT} + w_{USD} + w_{IPC} = 1.0 \quad (\text{es decir, } 100\%)$

*El presente trabajo, asume que la composición de referencia estándar para la diálisis en Argentina se sitúa en torno a* $w_{CCT} = 45\%$*,* $w_{USD} = 35\%$ *y* $w_{IPC} = 20\%$*.*

$w_{CCT}$, incidencia de la escala salarial del Convenio Colectivo de Trabajo (CCT 108/75).

$w_{USD}$ , incidencia del tipo de cambio oficial de la moneda nacional frente al Dólar estadounidense.

$w_{IPC}$ , incidencia del Índice de Precios al Consumidor general.

#### Paso 2: Construcción de Índices Relativos con Base $t_0$

Se selecciona un mes base $t_0$ que represente un momento de equilibrio de costos (por ejemplo, noviembre de 2023, pre-devaluación fuerte, o cualquier hito histórico donde la tarifa de la obra social cubría honrosamente el coste).

Para cualquier mes bajo análisis $t$, calculamos la variación relativa de cada variable respecto a su valor en el mes base $t_0$:

- **Índice de Salarios:**
  
  $I^{CCT}_t = \frac{CCT_t}{CCT_{t_0}}$

- **Índice Cambiario:**
  
  $I^{USD}_t = \frac{USD_t}{USD_{t_0}}$

- **Índice de Inflación General:**
  
  $I^{IPC}_t = \frac{IPC_t}{IPC_{t_0}}$

#### Paso 3: Agregación del Índice Polinómico de Costos ($I^P_t$)

El índice de variación de costos en el período $t$ se obtiene multiplicando cada índice relativo por su peso correspondiente en la estructura de costos:

$I^P_t = w_{CCT} \cdot I^{CCT}_t + w_{USD} \cdot I^{USD}_t + w_{IPC} \cdot I^{IPC}_t$

#### Paso 4: Determinación del Valor Polinómico Teórico ($V^P_t$)

Multiplicamos el valor de la sesión real cobrado en el mes base $t_0$ ($Y_{t_0}$) por el índice polinómico del período $t$. Este resultado representa lo que la financiadora **debería estar pagando** en el mes $t$ para conservar idéntico poder adquisitivo y rentabilidad del periodo base:

$V^P_t = Y_{t_0} \cdot I^P_t$

## 2. El Modelo de Comportamiento Histórico (Regresión MCO)

### ¿Por qué complementar con una Regresión Lineal?

Mientras que la fórmula polinómica calcula un "deber ser"" normativo (estructura de costos), la **Regresión Lineal Múltiple por Mínimos Cuadrados Ordinarios (MCO)** analiza empíricamente la conducta histórica del pagador (obra social o financiadora).

A través de la regresión, dejamos que los datos históricos nos "digan" qué variables tuvieron mayor peso implícito en las decisiones de actualización arancelaria adoptadas por la financiadora. Esto ayuda a detectar si la/s obra/s social/es se indexan por inflación general ($IPC$), si responden a los saltos del dólar oficial ($USD$) o si se alinean puramente con el ritmo de las paritarias ($CCT$).

### Especificación del Modelo Econométrico

Proponemos la siguiente relación lineal explicativa del valor de la sesión ($Y_t$):

$Y_t = \beta_0 + \beta_1 \cdot IPC_t + \beta_2 \cdot USD_t + \beta_3 \cdot CCT_t + \varepsilon_t$

Donde:

- $Y_t$: Valor nominal liquidado por la obra social por sesión en el mes $t$.

- $\beta_0$: Intercepto. Representa el arancel autónomo o base de la práctica que no depende de las fluctuaciones macroeconómicas de corto plazo.

- $\beta_1$: Coeficiente de elasticidad/sensibilidad marginal respecto al IPC.

- $\beta_2$: Coeficiente de sensibilidad respecto al tipo de cambio oficial.

- $\beta_3$: Coeficiente de sensibilidad respecto al salario básico CCT 108/75.

- $\varepsilon_t$: Término de error estocástico (representa variables omitidas o el poder de negociación política del sector).

### Algoritmo de Estimación y Resolución de Matrices

Para hallar los estimadores óptimos $\hat{\beta} = [\hat{\beta}_0, \hat{\beta}_1, \hat{\beta}_2, \hat{\beta}_3]^T$, definimos las observaciones en forma matricial:

$\mathbf{Y} = \mathbf{X}\beta + \mathbf{\varepsilon}$

Donde $\mathbf{X}$ es la matriz de diseño de tamaño $n \times 4$ (con $n$ observaciones mensuales), cuya primera columna está compuesta por unos (para el intercepto $\beta_0$):

$\mathbf{X} = \begin{bmatrix} 1 & IPC_1 & USD_1 & CCT_1 \\ 1 & IPC_2 & USD_2 & CCT_2 \\ \vdots & \vdots & \vdots & \vdots \\ 1 & IPC_n & USD_n & CCT_n \end{bmatrix}, \quad \mathbf{Y} = \begin{bmatrix} Y_1 \\ Y_2 \\ \vdots \\ Y_n \end{bmatrix}$

La estimación clásica por MCO busca minimizar la suma de los residuos al cuadrado. La solución analítica al sistema de ecuaciones normales es:

$\hat{\beta} = (\mathbf{X}^T \mathbf{X})^{-1} \mathbf{X}^T \mathbf{Y}$

#### Tratamiento de Multicolinealidad (Regularización Ridge / Tikhonov)

En la economía argentina, las variables nominales ($IPC$, $USD$ y $CCT$) se mueven en la misma dirección a lo largo del tiempo, exhibiendo una elevada **co-integración** o multicolinealidad. Esto provoca que la matriz de covarianza $\mathbf{X}^T \mathbf{X}$ esté al borde de la singularidad (casi imposible de invertir con precisión, generando estimadores extremadamente volátiles).

Para mitigar esto, el algoritmo del software implementa una penalización Ridge (regularización L2) agregando un pequeño sesgo controlado $\lambda$ a la diagonal de la matriz antes de su inversión:

$\hat{\beta}_{Ridge} = (\mathbf{X}^T \mathbf{X} + \lambda \mathbf{I})^{-1} \mathbf{X}^T \mathbf{Y}$

*Donde* $\mathbf{I}$ *es la matriz identidad de* $4 \times 4$ *y* $\lambda = 10^{-4}$*. Esto estabiliza matemáticamente el cálculo de la regresión en entornos de alta inflación sin desviar de manera significativa el valor de los coeficientes.*

### Bondad de Ajuste ($R^2$)

Para demostrar qué tan confiable es el modelo lineal para predecir el comportamiento histórico, calculamos el Coeficiente de Determinación:

$R^2 = 1 - \frac{SS_{Res}}{SS_{Tot}}$

Donde:

- Suma de Residuos al Cuadrado ($SS_{Res}$):
  
  $SS_{Res} = \sum_{t=1}^n (Y_t - \hat{Y}_t)^2$

- Suma Total de Cuadrados ($SS_{Tot}$):
  
  $SS_{Tot} = \sum_{t=1}^n (Y_t - \bar{Y})^2$

Un $R^2$ cercano al $100\%$ indica que las tres variables macro elegidas explican casi en su totalidad el comportamiento de las tarifas arancelarias históricas.

## 3. Algoritmo de Simulación y Proyección en el Tiempo

El módulo predictivo opera transicionando los datos históricos hacia un horizonte futuro de $K$ meses ($T+1$ a $T+K$), donde $T$ es el último período con registro histórico real disponible.

```
       HISTORIAL REAL (Hasta mes T)       │        PROYECCIÓN FUTURA SIMULADA (T+1 a T+K)
──────────────────────────────────────────┼────────────────────────────────────────────────────
 2017-07 ... Nov-2023 (t0) ... Mayo-2024  │  Junio-2024 ...  Julio-2024 ...  [Horizonte Simulado]
 (Datos duros de Excel)                   │  (Ajustes parametrizables por el investigador)



```

### Paso 1: Actualización Dinámica de Variables Exógenas

El investigador define las tasas nominales mensuales de incremento esperadas para el futuro de cada una de las variables bajo estudio:

- $g_{IPC}$: Tasa de inflación mensual simulada.

- $g_{USD}$: Tasa de devaluación/depreciación mensual del tipo de cambio simulada.

- $g_{CCT}$: Incremento paritario mensual del sector salud simulado.

- $g_{OS}$: Tasa de ajuste mensual que la obra social concede al arancel de la práctica.$\forall x \in \mathbb{R}$

Para cada mes de proyección $T+k$ ($\forall \ k \in \{1, 2, \dots, K\}$), el algoritmo actualiza las series temporales de la siguiente manera:

$IPC_{T+k} = IPC_{T+k-1} \cdot (1 + g_{IPC})$

$USD_{T+k} = USD_{T+k-1} \cdot (1 + g_{USD})$

$CCT_{T+k} = CCT_{T+k-1} \cdot (1 + g_{CCT})$ 

$Y_{T+k} = Y_{T+k-1} \cdot (1 + g_{OS})$

### Paso 2: Cálculo del Costo Teórico Proyectado

La proyección de la fórmula polinómica en el horizonte futuro utiliza las variables exógenas ya actualizadas en el paso anterior, manteniendo como pivote el mes base de equilibrio original ($t_0$):

$V^P_{T+k} = Y_{t_0} \cdot \left[ w_{CCT} \left(\frac{CCT_{T+k}}{CCT_{t_0}}\right) + w_{USD} \left(\frac{USD_{T+k}}{USD_{t_0}}\right) + w_{IPC} \left(\frac{IPC_{T+k}}{IPC_{t_0}}\right) \right]$

Esto nos permite comparar el arancel que la obra social planea pagar ($Y_{T+k}$) con el costo teórico real proyectado ($V^P_{T+k}$) bajo el escenario macroeconómico simulado.

## 4. Métricas de Impacto Económico e Institucional

Para transformar estas proyecciones en conclusiones sólidas de gestión y de salud pública, el modelo calcula dos indicadores clave:

### A. La Brecha de Cobertura Porcentual ($\text{Brecha}_t$)

Mide el porcentaje de subfinanciación o sobrecobertura arancelaria que tiene el tratamiento en un período dado:

$\text{Brecha}_t (\%) = \left( \frac{Y_t - V^P_t}{V^P_t} \right) \cdot 100$

- Si $\text{Brecha}_t < 0$: El arancel real está por debajo del costo polinómico ajustado. Hay **desfasaje financiero**. El prestador absorbe pérdidas operativas.

- Si $\text{Brecha}_t \ge 0$: La obra social cubre la estructura teórica de costos del prestador.

### B. Impacto Financiero Clínico Acumulado y Anualizado ($IF$)

Para una clínica o red de clínicas con un padrón de $N$ pacientes bajo tratamiento activo de ERCT, donde cada paciente realiza en promedio $S$ sesiones mensuales (la frecuencia médica estándar es de 3 sesiones semanales, típicamente ponderado en $S = 13$ sesiones/mes):

El impacto económico mensual en términos nominales para el período $t$ es:

$IF_{\text{mensual}, t} = (Y_t - V^P_t) \cdot N \cdot S$

Y la tasa de pérdida o ganancia operativa anualizada proyectada sobre la base del desfasaje del último mes observado se calcula como:

$IF_{\text{anualizado}} = (Y_{\text{último}} - V^P_{\text{último}}) \cdot N \cdot S \cdot 12$

Este número es de alto valor argumentativo: **traduce un porcentaje abstracto de desfase a la cantidad exacta de dinero neto en pesos argentinos que el prestador pierde al año por mantener con vida a ese padrón de pacientes**. Ofrece una demostración empírica del riesgo de cese de actividades o degradación de calidad en la atención de diálisis.
