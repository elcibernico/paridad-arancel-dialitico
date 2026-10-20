# Valor Actual Actuarial en Pacientes bajo Tratamiento Dialítico

# Parte 1

## 1. Introducción y Concepto Central

**Punto 1. Introducción y Objetivo Central:** El cálculo del Valor Actual Actuarial de Diálisis (**VAAD**).

**Objetivo principal:** Desarrollar un modelo para calcular el **Valor Actual Actuarial de un Paciente en Diálisis (VAAD)** de un paciente que ingresa a tratamiento de diálisis.

**Definición del VAAD:** Representa el valor presente único de la totalidad de los flujos de fondos futuros esperados que el financiador (obra social o prepaga) transferiría al prestador (centro de diálisis) para delegar de forma completa la cobertura y gestión del paciente.

* **Mortalidad:** Tasa de fallecimiento del paciente en diálisis.

* **Trasplante Renal:** Salida del tratamiento dialítico hacia una alternativa terapéutica de diferente costo y dinámica.

* **Recuperación de la Función Renal:** Casos de insuficiencia renal aguda o reversible donde el paciente deja de requerir diálisis.
  
  ### b. Factores Demográficos
  
  **Edad de Ingreso:** La expectativa de vida y permanencia difiere drásticamente según la edad de inicio (ej. paciente de 12 años vs. paciente de 60 años).
  
  ### c. Factores Clínicos
  
  **Comorbilidades:** El diagnóstico de base y enfermedades asociadas impactan directamente en la supervivencia (ej. nefropatía diabética, cardiopatías, problemas cardiovasculares).
  
  ### d. Modalidad del Tratamiento
  
  La duración y los costos asociados varían en función de la técnica elegida:

* Hemodiálisis (HD)

* Diálisis Peritoneal (DP)

* Hemodiafiltración (HDF)
  
  ## 3. Propuesta Metodológica: Tabla Actuarial de Mortalidad y Permanencia en Diálisis

**Punto 2. Variables de Variabilidad (Biométricas y Clínicas):** Riesgos competidores (muerte, trasplante, recuperación), demografía (edad de ingreso) y comorbilidades (nefropatía diabética, problemas cardiovasculares).

**Punto 3. Modalidades de Tratamiento:** Separación de flujos según Hemodiálisis, Diálisis Peritoneal y Hemodiafiltración.

Para resolver esta variabilidad y poder calcular con precisión el **VAAD**, es un prerrequisito indispensable la construcción de una **Tabla Actuarial de Mortalidad y Transición Específica para Pacientes en Diálisis**. Esta tabla se fundamentará en:

* Modelos de riesgos competitivos (para capturar muerte, trasplante y recuperación).
* Segmentación multi-estado según edad, comorbilidades y modalidad de tratamiento inicial.
* Estimación de las probabilidades de permanencia año a año (o mes a mes) para descontar financieramente los flujos de fondos futuros.

## 3-1. Evolución de la Propuesta Metodológica: Construcción de la Tabla Actuarial

**Estrategia Adoptada:** Tomar como base tablas de mortalidad específicas de diálisis ya calculadas en la literatura y **adaptar/calibrar sus parámetros biométricos** utilizando los datos reales y actualizados del Registro Argentino de Diálisis.

**Primeros dos años (Meses 1 al 12):** Unidades temporales de carácter **mensual**. Esto permite mapear la alta vulnerabilidad inicial y el "sesgo de selección" por mortalidad temprana o fallas agudas.

**A partir del segundo año (Año 2 en adelante):** Transición a unidades temporales **anuales**, dado que la curva de supervivencia tiende a estabilizarse y comportarse de manera más homogénea a largo plazo.

**Punto 4. Estrategia de la Tabla de Mortalidad:** Calibración de tablas preexistentes de la literatura adaptándolas con los datos biométricos del **Registro Argentino de Diálisis**.

## ## 5. Estructura Temporal de la Tabla: Modelo Híbrido (Mensual-Anual)

**Punto 5. Innovación de la Estructura Temporal (Modelo Híbrido):** Primeros dos años con unidades temporales **mensuales** (mes 1 al 12 por alta tasa de eventos) y paso a unidades **anuales** a partir del segundo año.

Para capturar la realidad clínica que expone el Registro Argentino de Diálisis (que hace hincapié en el impacto crítico de los primeros meses), el paper propondrá una tabla estructurada en dos fases:

- **Fase de Inicio (Primer año):** Se trabajará con unidades temporales **mensuales** (mes 1 al 12) para medir con lupa la altísima variabilidad y eventos de salida tempranos.

- **Fase de Estabilización (A partir del segundo año):** Se hará una transición a unidades temporales **anuales**, donde la población remanente es más estable y sigue una curva de supervivencia tradicional.

## 6. Modelo Matemático Financiero y Actuarial

**Punto 6. Modelo Matemático-Financiero Inicial:** Aplicación de **rentas actuariales variables en progresión geométrica** con un coeficiente de variabilidad/inflación para que el número sea representativo en el tiempo.

Una vez determinada la estructura híbrida de la tabla y considerando que las Financiadoras realizan pagos mensuales expuestos a modificaciones de precios dentro de un mismo año, el modelo de cálculo se define bajo los siguientes lineamientos:

* **Coincidencia Temporal Inicial:** Durante los meses 1 al 12, existe un calce perfecto entre la periodicidad mensual de la tabla de mortalidad y el flujo de fondos.
* **Subperiodización del Cálculo:** Para el tramo anualizado (año 2 en adelante), se emplearán fórmulas actuariales de rentas fraccionarias (subperiódicas) que incorporen la tasa de descuento mensual y permitan absorber dinámicamente los ajustes arancelarios o de indexación de precios del financiador.

### 7. Incorporación de Variabilidad de Precios: Rentas Actuariales en Progresión Geométrica

Para corregir la falta de representatividad de un valor actual estático y absorber el impacto inflacionario o de ajuste de costos arancelarios período a período, el modelo matemático-financiero del **VAAD** incorporará una **variación en progresión geométrica**:

- **Mecanismo de Ajuste:** Cada flujo de fondos futuro ($C_t$) no será constante, sino que aumentará (o variará) de un período a otro multiplicándose por un factor $(1 + g)$, donde $g$ representa la tasa geométrica de variabilidad arancelaria.

- **Impacto en el Cálculo del VAAD:** Al calcular el valor actual de los flujos de fondos esperados (multiplicados por las probabilidades de permanencia de la tabla híbrida), el factor de descuento financiero tradicional $\frac{1}{(1 + i)^t}$ se combinará con el factor de crecimiento geométrico $(1 + g)^t$.

- **Modelización Matemática:** Esto transformará la ecuación tradicional en una estructura de **renta variable en progresión geométrica con base actuarial**, permitiendo que el número final sea verdaderamente representativo del costo real que el financiador transfiere en el tiempo.

### 8. El Quiebre Metodológico: Limitaciones del VAAD y Giro hacia el Análisis de Precios

**Punto 7. El Quiebre de Mercado (Desestimación del VAAD como cobro único):** Conclusión de que ninguna financiadora entrega el VAAD completo hoy y que el número absoluto pierde visibilidad de costos. El VAAD pasa a ser la herramienta de diagnóstico de fondo.

A pesar de la sofisticación matemática de introducir una progresión geométrica, el valor absoluto del VAAD presenta dos limitaciones críticas que exigen reorientar el enfoque del paper:

1. **Inviabilidad Operativa y de Mercado:** En la práctica del sistema de salud, ningún financiador transferirá por adelantado la totalidad del valor actual actuarial de un paciente crónico al momento de su ingreso.

2. **Opacidad de Costos:** Un valor único capitalizado no es representativo de la dinámica de los costos reales, las complicaciones clínicas ni el comportamiento marginal de las variables a lo largo del tiempo.

# Parte 2

### 9. Nueva Propuesta Central: Desconstrucción del VAAD para el Análisis del Precio por Sesión

**Punto 8. Fase de Transición al Análisis del Precio por Sesión:** Uso inverso del andamio actuarial para auditar si el precio que paga la obra social cubre el riesgo real.

Por lo tanto, el paper plantea **desestimar el VAAD como un indicador de cobro único** y, en su lugar, utilizar su andamiaje matemático de forma inversa. El objetivo pasa a ser:

- **Descomponer el modelo actuarial** (que ya cruza la tabla híbrida de mortalidad, comorbilidades y progresión geométrica) para evaluar si el **precio actual que la financiadora paga por sesión de diálisis** cubre el riesgo y los costos reales esperados del paciente en su trayectoria temporal.

- Utilizar el modelo para determinar el **"Precio Actuarial Teórico de la Sesión"** que el prestador debería exigir para no incurrir en pérdidas, dadas las probabilidades de supervivencia, trasplante y la inflación de costos proyectada.

### 

## Introducción y Reorientación del Enfoque

**Punto 9. El Motor de Costos (Función Polinómica Sectorial):** Modelización de la evolución del precio de la sesión basado en las tres variables reales del mercado: **Dólar** (insumos), **Inflación** (estructura) y **Paritarias** (mano de obra).

**Objetivo principal:** Evaluar la suficiencia del precio abonado por sesión de diálisis por parte de las financiadoras, contrastándolo con el riesgo biométrico y los costos futuros esperados del paciente.

**Cambio de Paradigma:** Se desestima el Valor Actual Actuarial de Diálisis (VAAD) como un indicador de cobro único (debido a su inviabilidad operativa y opacidad en el mercado real). El VAAD se reconvierte en la **herramienta de diagnóstico de fondo** para evaluar el punto de equilibrio del precio por sesión.

## 2. Fase Inicial: Modelización Matemática de la Evolución Histórica de Precios

Para fundamentar el análisis, el primer paso empírico del paper consiste en comprender y modelar cómo se han comportado los precios pagados por la financiadora a lo largo del tiempo.

**Objetivo:** Establecer un conocimiento matemático riguroso de la evolución histórica de los valores arancelarios que el financiador efectivamente abonó o reconoció por las prestaciones de diálisis.

## 3. El Motor de Costos: Estructura de la Función Polinómica Sectorial

El comportamiento de los precios en el mercado de la diálisis no es arbitrario, sino que responde a una estructura de costos subyacente guiada por tres macro-variables críticas. El paper incorporará la **función polinómica de costos tradicional del sector** para ponderar estas incidencias:

### a. Variables de la Ecuación Polinómica

**Cotización del Dólar (Insumos dolarizados):** Captura el impacto de los materiales descartables, concentrados, líneas y tecnología importada.

**Inflación General (Costos generales y servicios):** Mide la evolución de los costos de estructura, mantenimiento y servicios públicos de los centros.

**Paritarias de Salud (Mano de obra calificada):** Pondera el peso del personal médico, de enfermería y técnico, que representa un componente masivo del costo operativo.

### b. Análisis Empírico de Series de Datos

**Punto 10. Cruce Empírico de Series Históricas:** Contraste de las series de aranceles de las financiadoras contra el IPC, el tipo de cambio y los acuerdos de FATSA para medir el *lag* (retraso) y la pérdida de poder de compra frente al costo biométrico esperado

Para validar y calibrar este modelo, se recopilarán y cruzarán las siguientes series cronológicas históricas:

Serie histórica de los aranceles pagados por las sucesivas financiadoras (obras sociales/prepagas).

Serie histórica del Índice de Precios al Consumidor (Inflación IPC).

Serie histórica del Tipo de Cambio Oficial/Financiero (Cotización del Dólar).

Serie histórica de los aumentos salariales homologados por el sector salud (Paritarias FATSA/regionales).

### c. Objetivo de esta Fase

Definir el modelo matemático que no solo explique retrospectivamente el comportamiento de los aranceles de las financiadoras, sino que también determine con precisión el coeficiente de incidencia (los "pesos" del polinomio) y el grado de rezago (*lag*) con el que las obras sociales reconocen los aumentos reales de costos.

### 9. Análisis Econométrico: Estimación de Betas, Correlaciones y Reacción Temporal

Para que el modelo polinómico sea empíricamente robusto, se estructurará un análisis matemático sobre las series de datos históricas:

- **Estimación de Betas ($\beta$):** Calcular estadísticamente las incidencias y pesos reales de cada variable del polinomio (Dólar, Inflación, Paritarias) sobre el precio de la sesión.

- **Correlación Cruzada (Efecto Cascada):** Modelar matemáticamente la interdependencia temporal entre las variables: cómo la variación de la cotización del dólar tracciona la inflación general y cómo esto decanta posteriormente en los ajustes de paritarias.

- **Modelización del *Lag* de las Obras Sociales:** Medir formalmente la demora o tiempo de reacción (*time lag*) de las financiadoras; es decir, cuántos meses tardan en trasladar el impacto de estas variaciones macroeconómicas a los aranceles que pagan al prestador.

### 10. Control y Validación del Modelo Matemático

El paper propondrá un mecanismo dual para asegurar que la herramienta sea científicamente válida:

- **Fase Explicativa:** Evaluar la bondad de ajuste (mediante coeficientes de correlación y significancia de las betas) para demostrar matemática y retrospectivamente el comportamiento de las variables.

- **Fase de Control:** Implementar un testeo del modelo (análisis de residuos o *backtesting*) para controlar y verificar que lo que el modelo intenta explicar sea estadísticamente correcto, asegurando que no existan sesgos y que el modelo sea apto para auditar los precios del sector.

### 11. Bifurcación del Modelo: Análisis de Dos Vías (Retrospección vs. Prospección)

A partir de la validación del modelo de control, el paper divide su aplicación en dos caminos independientes y complementarios:

#### Vía A: Análisis Retrospectivo Dinámico (Cuantificación de la Pérdida Histórica)

Antes de proyectar a futuro, el modelo permite "anclar" el momento calculatorio en cualquier punto del tiempo a elección arbitraria del investigador.

- **Independencia del Momento Calculatorio:** Aunque la investigación se haga "hoy", el modelo permite fijar un Momento de Inicio ($T_0$) y un Momento de Destino ($T_1$) del pasado de manera completamente arbitraria.

- **Cálculo del "Deber Ser" Arancelario:** El modelo calcula matemáticamente dónde **debió haber estado posicionado** el valor de la sesión en $T_1$ en función de cómo variaron las incidencias de la polinómica desde $T_0$.

- **Determinación del Perjuicio Económico:** Al contrastar ese valor teórico contra el arancel real que entregó la obra social, el modelo determina con precisión matemática:
  
  1. *Cuánta plata hizo perder la financiadora por año*.
  
  2. *Cuánta plata hizo perder por paciente*.
     
     Esto demuestra de forma irrefutable el impacto del rezago arancelario sobre el prestador.

#### Vía B: Potencial Predictivo (Análisis Prospectivo)

Una vez validada la capacidad del modelo para explicar el pasado y controlar los desvíos, el paper avanza hacia la fase prospectiva, utilizando el entramado matemático para predecir el comportamiento futuro bajo diferentes condiciones macroeconómicas:

* **Generación de Escenarios (Proyección de Variables):** Modelar proyecciones a corto y mediano plazo de las variables macroeconómicas clave (shocks de devaluación del dólar, picos inflacionarios o acuerdos paritarios de alta magnitud).
* **Simulación del Comportamiento Arancelario:** Predecir con qué velocidad, magnitud y *lag* temporal reaccionará el arancel de las financiadoras ante cada uno de estos escenarios proyectados.
* **Cruce con el Riesgo Actuarial Futuro:** Integrar estas predicciones de precios con la progresión geométrica y la tabla híbrida de permanencia de los pacientes. Esto le permitirá al prestador estimar anticipadamente sus márgenes reales de cobertura y anticipar situaciones de quiebre financiero o descalce arancelario frente a la cohorte de pacientes bajo tratamiento.

## 12. Cierre Metodológico y Propuesta Aplicada: El Precio de Recuperación Actuarial "Hoy"

Como culminación del modelo predictivo—y con la condición estricta de que el momento de cálculo final se establezca en el presente ("Hoy")—se introduce la variable de negociación y recupero:

* **El Vínculo Retrospección-Prospección:** El modelo une el daño económico calculado en la Vía A con la simulación prospectiva de la Vía B.
* **Determinación del "Precio de Recuperación" Actual:** El algoritmo calcula de manera exacta qué valor de sesión de diálisis tendría que fijarse **Hoy** para que, estando sujeto a la variabilidad de precios y al comportamiento estimado de las variables macroeconómicas en el término de **un año (horizonte de 12 meses)**, el prestador logre:
  1. Absorber el costo de riesgo biométrico y la inflación del año entrante.
  2. Amortizar y **recuperar la totalidad del dinero perdido en el pasado** debido al rezago histórico de la financiadora.
* **Utilidad Estratégica:** Este valor funciona como el "precio técnico de quiebre o de paridad" que el centro de diálisis debe poner sobre la mesa de negociación frente al financiador para resarcir el pasivo financiero acumulado.
