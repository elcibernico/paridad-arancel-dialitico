# Desarrollo Matemático y Actuarial del Valor Actual Actuarial de Diálisis (VAAD)

**Integración Metodológica de Riesgos Competitivos mediante Modelos Multiestado de Markov y Riesgos de Subdistribución (Fine & Gray)**

## 1. Introducción y Postulado Fundamental

El Valor Actual Actuarial de Diálisis (VAAD) representa el valor presente esperado de todas las erogaciones futuras que una financiadora de salud deberá afrontar por un paciente que ingresa a tratamiento dialítico [1].

**Condición Metodológica Mandatoria:** El paciente en diálisis está expuesto a múltiples eventos que determinan su salida del estado "En Tratamiento". Estos eventos son principalmente dos: **Muerte** y **Trasplante Renal**.
Si el trasplante se tratara algebraicamente como una simple censura por la derecha (Right-Censoring) bajo un estimador clásico de Kaplan-Meier, se asumiría el supuesto de *Censura Independiente*. Esto implicaría que el paciente trasplantado "se retira" pero su riesgo de muerte esperado sigue siendo igual al de la cohorte que permanece en diálisis. Dado que los pacientes trasplantados suelen ser más jóvenes y tener menos comorbilidades (Censura Informativa), el modelo clásico de Kaplan-Meier sesgaría los resultados, subestimando la mortalidad real de la cohorte atrapada en diálisis y, consecuentemente, calculando incorrectamente (por exceso) el VAAD [2].

Por lo tanto, este desarrollo utiliza un **Enfoque de Riesgos Competitivos (Competing Risks)**, formulado a través de un Modelo Multiestado de Markov en tiempo continuo [3], combinado con el modelado de incidencias acumuladas de Fine y Gray [4].

## 2. Definición del Espacio de Estados y Transiciones (Modelo de Markov)

Definimos un proceso estocástico en tiempo continuo $\{Y(t), t \ge 0\}$ con un espacio de estados finito $S = \{0, 1, 2\}$ [3], donde:

- **Estado 0:** Vivo y en tratamiento de Diálisis (Estado Transitorio).

- **Estado 1:** Muerte (Estado Absorbente).

- **Estado 2:** Trasplante Renal (Estado Absorbente a los efectos del cese de la prestación dialítica).

### 2.1. Fuerzas de Transición (Tasas de Riesgo Causa-Específicas)

Sea $\mu_{x+t}^{(0j)}$ la fuerza de transición instantánea (Cause-Specific Hazard) del Estado 0 al Estado $j$ para un individuo de edad $x$ tras un tiempo $t$ de exposición. Matemáticamente se define como:

$\mu_{x+t}^{(0j)} = \lim_{\Delta t \to 0} \frac{P(Y(t+\Delta t) = j \mid Y(t) = 0, \text{Edad} = x)}{\Delta t} \quad \text{para } j \in \{1, 2\}$

- $\mu_{x+t}^{(01)}$: Fuerza de mortalidad en diálisis.

- $\mu_{x+t}^{(02)}$: Tasa instantánea de trasplante.

La fuerza total de decremento o salida del estado de diálisis, denotada como $\mu_{x+t}^{(\tau)}$, es la suma aditiva de los riesgos competitivos [2]:

$\mu_{x+t}^{(\tau)} = \mu_{x+t}^{(01)} + \mu_{x+t}^{(02)}$

## 3. Probabilidad de Permanencia y Función de Supervivencia Múltiple

Para que la financiadora pague la prestación en el instante $t$, el paciente debe haber permanecido ininterrumpidamente en el Estado 0. La probabilidad de permanecer en diálisis desde el instante $0$ hasta el instante $t$, dado que el individuo tiene edad $x$, se denota actuarialmente como $_t p_x^{(\tau)}$.

Resolviendo la ecuación diferencial de Kolmogorov hacia adelante para el Estado 0 [3]:

$\frac{d}{dt} {_t p_x^{(\tau)}} = - {_t p_x^{(\tau)}} \cdot \mu_{x+t}^{(\tau)}$

Integrando ambos lados respecto a $t$, obtenemos la probabilidad exacta de permanencia sin sesgo de censura:

${_t p_x^{(\tau)}} = \exp \left( - \int_{0}^{t} \left( \mu_{x+s}^{(01)} + \mu_{x+s}^{(02)} \right) ds \right)$

Esta formulación garantiza que la salida por trasplante penaliza la probabilidad de permanencia exactamente en su justa medida, sin distorsionar el riesgo intrínseco de muerte [2].

## 4. Incorporación de Covariables (Modalidad, Comorbilidades y Edad)

Para particularizar el cálculo según el paciente, modelamos las tasas causa-específicas $\mu_{x+t}^{(0j)}$ utilizando un modelo de regresión de Cox de riesgos proporcionales para cada transición [3]:

$\mu_{x+t}^{(0j)}(Z) = \mu_{0}^{(0j)}(t) \cdot \exp(\beta_j^T Z)$

Donde:

- $\mu_{0}^{(0j)}(t)$ es el riesgo base (baseline hazard) para el evento $j$.

- $Z$ es el vector de covariables (ej. Edad, Modalidad, Comorbilidades registradas en bases de datos como el USRDS [1]).

- $\beta_j$ es el vector de coeficientes de regresión para el evento $j$.

### 4.1. Conexión con el Modelo de Fine y Gray (Subdistribution Hazard)

Si en lugar de las tasas causa-específicas partiéramos de la literatura basada en Fine y Gray, que modela la **Función de Incidencia Acumulada (CIF)** directamente usando el riesgo de subdistribución $\bar{\lambda}_j(t)$ [4], sabemos que la CIF para el evento $j$ es:

$CIF_j(t; Z) = 1 - \exp \left( - \int_0^t \bar{\lambda}_j(s; Z) ds \right)$

Por propiedad fundamental de los riesgos competitivos, la probabilidad total de haber salido del Estado 0 por *cualquier* causa antes del tiempo $t$ es la suma de las incidencias acumuladas. Por ende, la probabilidad de seguir vivo y en diálisis es exactamente su complemento [2, 4]:

${_t p_x^{(\tau)}}(Z) = 1 - CIF_{\text{muerte}}(t; Z) - CIF_{\text{trasplante}}(t; Z)$

Ambas formulaciones son algebraicamente equivalentes para el cálculo de la permanencia en el estado y **libres del sesgo de censura independiente**.

## 5. Bases Matemáticas y Financieras (Sub-periodicidad)

Dado que las prestaciones de diálisis se facturan y pagan de forma **mensual**, el modelo continuo clásico debe convertirse a una **Anualidad Subperiódica Anticipada**.

Definimos:

- $i$: Tasa de interés técnica o de descuento anual efectiva.

- $m$: Fraccionamiento del periodo. Al ser mensual, $m = 12$.

- $j$: Tasa efectiva mensual, calculada por equivalencia de tasas: $j = (1+i)^{1/12} - 1$.

- $v_m$: Factor de descuento mensual: $v_m = \frac{1}{1+j} = (1+i)^{-1/12}$.

- $C$: Costo de la prestación mensual según la modalidad.

## 6. Ecuación Final del Valor Actual Actuarial de Diálisis (VAAD)

El VAAD es la sumatoria del valor presente de los pagos mensuales $C$, condicionados a que el paciente siga en el Estado 0 (Diálisis) al inicio de cada mes $k$.

Sea $k$ el índice que representa los meses transcurridos ($k = 0, 1, 2, \dots, \omega \cdot 12$). El tiempo en años transcurrido hasta el mes $k$ es $t = \frac{k}{12}$.

El valor presente de un pago mensual esperado en el mes $k$ es el producto del monto, el factor de descuento temporal y la probabilidad de permanencia:

$PV_k = C \cdot (v_m)^k \cdot {}_{k/12} p_x^{(\tau)}(Z)$

Sumando sobre todos los meses posibles hasta la edad extrema de la tabla ($\omega$), obtenemos la ecuación general unificada del VAAD:

$VAAD_x(Z) = C \cdot \sum_{k=0}^{(\omega - x) \cdot 12 - 1} (1+i)^{-k/12} \cdot \exp \left( - \int_{0}^{k/12} \left[ \mu_{x+s}^{(01)}(Z) + \mu_{x+s}^{(02)}(Z) \right] ds \right)$

O, expresado de forma directa mediante las Funciones de Incidencia Acumulada (CIF) de Fine y Gray [4]:

$VAAD_x(Z) = C \cdot \sum_{k=0}^{(\omega - x) \cdot 12 - 1} (1+i)^{-k/12} \cdot \Big[ 1 - CIF_{\text{muerte}}\Big(\frac{k}{12}; Z\Big) - CIF_{\text{trasplante}}\Big(\frac{k}{12}; Z\Big) \Big]$

## Referencias

1. United States Renal Data System (USRDS): Annual Data Report: Epidemiology of kidney disease in the United States, 2023. Disponible en https://usrds-adr.niddk.nih.gov/2023

2. Noordzij M, Leffondré K, van Stralen KJ, et al.: When do we need competing risks methods for survival analysis in nephrology?, Nephrology Dialysis Transplantation 28(11):2670-2677, 2013. Disponible en https://academic.oup.com/ndt/article/28/11/2670/1823126

3. Putter H, Fiocco M, Geskus RB: Tutorial in biostatistics: competing risks and multi-state models, Statistics in Medicine 26(11):2389-430, 2007. Disponible en https://onlinelibrary.wiley.com/doi/10.1002/sim.2712

4. Fine JP, Gray RJ: A Proportional Hazards Model for the Subdistribution of a Competing Risk, Journal of the American Statistical Association 94:446, 496-509, 1999. Disponible en https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2835541/
