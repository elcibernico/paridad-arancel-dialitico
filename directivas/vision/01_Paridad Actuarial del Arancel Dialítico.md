# Paridad Actuarial del Arancel Dialítico: Modelización frente al Riesgo Biométrico

## Parte 1: La Construcción del Ideal Teórico

### 1. Introducción y Concepto Central

El cálculo del Valor Actual Actuarial de Diálisis (**VAAD**).
**Objetivo principal:** Desarrollar un modelo para calcular el Valor Actual Actuarial de un paciente que ingresa a tratamiento de diálisis.
**Definición del VAAD:** Representa el valor presente único de la totalidad de los flujos de fondos futuros esperados que el financiador (obra social o prepaga) transferiría al prestador (centro de diálisis) para delegar de forma completa la cobertura y gestión del paciente.

### 2. Variables de Variabilidad (Biométricas y Clínicas)

Para calcular este valor, es necesario identificar la complejidad y heterogeneidad de las trayectorias de los pacientes. Al efecto de este trabajo, se definen las siguientes fuentes de variabilidad:
**a. Riesgos Competidores (Eventos de Salida):**

- **Mortalidad:** Tasa de fallecimiento del paciente en diálisis.

- **Trasplante Renal:** Salida del tratamiento dialítico hacia una alternativa terapéutica de diferente costo y dinámica.

- **Recuperación de la Función Renal:** Casos de insuficiencia renal aguda o reversible donde el paciente deja de requerir diálisis.

**b. Factores Demográficos:**

- **Edad de Ingreso:** La expectativa de vida y permanencia difiere drásticamente según la edad de inicio (ej. paciente de 12 años vs. paciente de 60 años).

**c. Factores Clínicos:**

- **Comorbilidades:** El diagnóstico de base y enfermedades asociadas impactan directamente en la supervivencia (ej. nefropatía diabética, cardiopatías, problemas cardiovasculares, otras).

**d. Modalidad del Tratamiento:** La duración y los flujos de costos asociados varían en función de la técnica elegida:

- Hemodiálisis (HD)

- Diálisis Peritoneal (DP)

- Hemodiafiltración (HDF)

### 3. Propuesta Metodológica: La Necesidad de una Tabla Actuarial

Para resolver la variabilidad descrita en el punto anterior y poder calcular con precisión el VAAD, es un prerrequisito indispensable la construcción de una **Tabla Actuarial de Mortalidad y Transición Específica para Pacientes en Diálisis**. Esta tabla debe fundamentarse en:

- Modelos de riesgos competitivos (para capturar muerte, trasplante y recuperación).

- Segmentación multi-estado según edad, comorbilidades y modalidad de tratamiento inicial.

- Estimación de las probabilidades de permanencia año a año (o mes a mes) para poder descontar financieramente los flujos de fondos futuros.

### 4. Evolución de la Propuesta: Estrategia de Calibración

En lugar de intentar construir una tabla desde cero —lo cual presentaría severas dificultades empíricas—, la estrategia metodológica adopta un enfoque más eficiente: tomar como base tablas de mortalidad específicas de diálisis ya calculadas y validadas en la literatura internacional, y **adaptar/calibrar sus parámetros biométricos** utilizando los datos reales, históricos y actualizados del último Registro Argentino de Diálisis.

### 5. Innovación en la Estructura Temporal: Modelo Híbrido

Para capturar la realidad clínica que expone el Registro Argentino de Diálisis (que hace hincapié en el impacto crítico de los primeros meses), el modelo no puede utilizar una tabla anual tradicional. Se propone diseñar una tabla con estructura temporal partida o híbrida:

- **Fase de Inicio (Primer año - Meses 1 al 12):** Se trabajará con unidades temporales **mensuales**. Esto permite mapear con lupa la altísima vulnerabilidad inicial, los eventos de salida tempranos y el claro "sesgo de selección" por mortalidad en etapas agudas.

- **Fase de Estabilización (A partir del segundo año):** Se hará una transición a unidades temporales **anuales**, dado que la curva de supervivencia de la población remanente tiende a estabilizarse y comportarse de manera más homogénea a largo plazo.

### 6. Modelo Matemático-Financiero Inicial

Una vez determinada la estructura híbrida de la tabla, y considerando que las financiadoras realizan pagos mensuales expuestos a modificaciones de precios, el modelo de cálculo se define bajo los siguientes lineamientos:

- **Coincidencia Temporal Inicial:** Durante los meses 1 al 12, existe un calce perfecto entre la periodicidad mensual de la tabla de mortalidad y el flujo de fondos.

- **Subperiodización del Cálculo:** Para el tramo anualizado (año 2 en adelante), se emplearán fórmulas actuariales de rentas fraccionarias (subperiódicas) que incorporen la tasa de descuento mensual y permitan absorber dinámicamente los ajustes del financiador.

### 7. Incorporación de Variabilidad: Rentas Actuariales con flujos variables en Progresión Geométrica

Para corregir la falta de representatividad de un valor actual estático en economías inflacionarias, el modelo del VAAD incorporará una **variación en progresión geométrica**:

- **Mecanismo de Ajuste:** Cada flujo de fondos futuro ($C_t$) no será constante, sino que aumentará de un período a otro multiplicándose por un factor $(1 + g)$, donde $g$ representa la tasa de crecimiento/inflación médica.

- **Impacto en el Cálculo:** Al calcular el valor actual, el factor de descuento financiero tradicional se combinará con este factor de crecimiento geométrico, transformando la ecuación en una **renta variable en progresión geométrica con base actuarial**. Esto busca que el número final sea representativo del costo real en el tiempo.

|=> NOTA: por otro lado, no todas las obras sociales plantean aumentos complementarios y acumulativos (régimen compuesto), lo que implicaría complejizar el modelo para atender a los diferentes tipos de aumentos brindados por las diferentes financiadoras. Si bien se puede plantear un modelo que establezca la equivalencia financiera de ambas modalidades de actualización de precios, se plantea además, otra cuestión en relación al modelo de flujos variables

|=> NOTA: la irregularidad de la variación => la realidad económica de la variabilidad de precios, establece que las variaciones de precios en varias de las financiadoras, no sea "mes a mes", sino que se planteen en determinados momentos (se da aumento para un mes determinado), se sostengan durante algún tiempo (algunos meses), para luego volver a variar.

### 8. El Quiebre Metodológico: Las Limitaciones del VAAD

Es en este punto del desarrollo donde se produce una ruptura conceptual. A pesar de la sofisticación de cruzar tablas híbridas, riesgos competidores y progresiones geométricas, el valor absoluto del VAAD presenta dos limitaciones críticas insalvables en la realidad:

1. **Inviabilidad Operativa y de Mercado:** En la práctica del sistema de salud, ningún financiador transferirá por adelantado la totalidad del valor actual actuarial de un paciente crónico al momento de su ingreso. El mercado no opera mediante capitaciones únicas adelantadas.

2. **Opacidad de Costos:** Un valor único capitalizado y resumido en un solo número no es representativo de la dinámica de los costos reales diarios, ni permite ver el comportamiento marginal de las variables a lo largo del tiempo.
   |=> NOTA: además, pensar en percibir la totalidad del tratamiento del paciente en el momento cero, puede inducir a esperar menor "supervivencia del paciente", a la espera de "mayores resultados económicos", y esto va en contra de los principios rectores del autor.

## Parte 2: La Reorientación Hacia el Arancel Dialítico

### 9. Nueva Propuesta Central: Deconstrucción del VAAD

Ante el quiebre planteado, el paper propone un cambio de paradigma: **desestimar el VAAD como un indicador de cobro único**. En su lugar, el VAAD se reconvierte en la **herramienta de diagnóstico de fondo**.
La estrategia pasa a ser el uso inverso del andamiaje matemático-actuarial que ya hemos construido. El objetivo es descomponer el modelo actuarial para evaluar si el **precio actual de la sesión de diálisis** que paga la obra social es matemáticamente suficiente para cubrir el riesgo y los costos reales del paciente.

|=> NOTA:  por otro lado, nos evita mirar "la supervivencia del paciente" al momento de pensar en "la supervivencia financiera del prestador o centro de diálisis" (lo cual es filosóficamente más acorde a los valores que movilizan al autor)

### 10. El Motor de Costos: Estructura de la Función Polinómica Sectorial

Para poder auditar el precio de la sesión, primero hay que entender de qué está compuesto. El comportamiento de los precios responde a una estructura de costos subyacente guiada por tres macro-variables críticas:

- **Cotización del Dólar (**$X_1$**):** Captura el impacto de insumos importados (descartables, concentrados, tecnología).

- **Inflación General (**$X_2$**):** Mide la evolución de los costos de estructura, mantenimiento y servicios (IPC).

- **Paritarias de Salud (**$X_3$**):** Pondera el peso de la mano de obra calificada (médicos, enfermeros, técnicos), un componente masivo del costo operativo.

|=> NOTA: Estas 3 variables macro-económicas, definen una función polinómica de uso aceptado en el sector.

### 11. Análisis Econométrico y Validación del Modelo

Para que el cruce empírico no sea arbitrario, se estructurará un análisis matemático sobre las series históricas de los aranceles pagados frente a las variaciones del IPC, Dólar y Paritarias:

- **Estimación de Betas:** Calcular estadísticamente las incidencias y pesos reales de cada variable de la polinómica.

- **Efecto Cascada (Correlación Cruzada):** Modelar la interdependencia temporal (ej. cómo el dólar tracciona la inflación, y luego las paritarias).

- **Medición del** **"Lag"**: Determinar formalmente la demora (*time lag*) que manifiestan las financiadoras en trasladar los aumentos de costos al arancel.

- **Control:** Implementar pruebas de bondad de ajuste y análisis de residuos para garantizar que la herramienta sea científicamente válida y no esté sesgada.

### 12. Bifurcación del Modelo: Análisis de Dos Vías

Con el modelo validado, la herramienta se abre en dos aplicaciones concretas:

**Vía A: Análisis Retrospectivo Dinámico (Cuantificación de la Pérdida)**

- Permite fijar un Momento Base ($T_0$) y un Momento de Destino ($T_1$), estableciendo los momentos temporales del análisis de manera arbitraria ("medir lo que el analista desee medir").

- Reconstruye el "Deber Ser" arancelario, demostrando matemáticamente dónde debió estar posicionado el valor de la sesión en $T_1$.

- Al contrastar este valor teórico contra lo que realmente pagó la financiadora, se cuantifica la **pérdida financiera acumulada por año y por paciente**, visibilizando el daño por el rezago.

**Vía B: Potencial Predictivo (Análisis Prospectivo)**

- Generación de escenarios futuros de inflación, devaluación o paritarias.

- Simulación de la velocidad de reacción (*lag*) de las financiadoras ante esos shocks.

- Cruce con el riesgo actuarial futuro para anticipar márgenes de cobertura y riesgo de descalce financiero. |=> NOTA: esto quedó fuera de análisis, debido a que el prestador percibirá la prima de riesgo (valor prestacional) en tanto continúe brindando servicios dialíticos al paciente. => mencionar esto en el paper (que se consideró pero dado el razonamiento que acabo de hacer, se desestimó y eliminó del modelo)

cCierre Metodológico: El Precio de Recuperación Actuarial "Hoy"

Como culminación del trabajo, y estableciendo el momento de cálculo final en el presente ("Hoy"), se introduce la propuesta aplicada definitiva:

- El modelo une matemáticamente el daño económico histórico (Vía A) con la simulación prospectiva (Vía B).

- Determina exactamente qué valor de sesión de diálisis tendría que fijarse **Hoy** para que, estando sujeto a la variabilidad de precios durante un **horizonte de 12 meses**, el prestador logre:
  
  1. Absorber el riesgo biométrico y la inflación del año entrante |=> NOTA: no solo de la inflación, sino de las otras dos variables también (paritarias y el IPC)
  
  2. Amortizar y **recuperar la totalidad del dinero perdido en el pasado** por culpa del rezago del financiador.

Este resultado final se consolida como el **"precio técnico de paridad"**, entregándole al mercado la herramienta científica y objetiva definitiva, para la determinación del valor prestacional y resarcimiento del pasivo generado.

### 14. Tema abierto a futuros trabajos

Determinar un modelo que permita:

**a) Medir diferentes modalidades prestacionales:** que el modelo realice los cálculos actuariales utilizando precios y expectativa de vida de la modalidad que corresponda (HD, DP, HDF)

**b) Comparativa de Financiadoras:** Cruce de resultados para evidenciar qué obras sociales o financiadoras han mantenido, mejorado o deteriorado el valor real de la cobertura del paciente crónico a lo largo de la línea de tiempo analizada.

**c) Comparativa de Modalidades por Financiadora:** Cruce de resultados para evidenciar, para cada obra social o financiadora, para las 3 modalidades, si han mantenido, mejorado o deteriorado el valor real de la cobertura del paciente crónico a lo largo de la línea de tiempo analizada.
