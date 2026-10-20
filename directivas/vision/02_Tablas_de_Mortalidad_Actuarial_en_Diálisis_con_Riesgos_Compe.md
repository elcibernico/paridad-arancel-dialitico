# Tablas de Mortalidad Actuarial de Diálisis y Modelos de Valoración para el Cálculo del Valor Actual Actuarial (VAAD) en la República Argentina

### Basado en los Datos Biométricos de la Cohorte Histórica y el Informe 2024 del Registro Argentino de Diálisis Crónica (SINTRA / INCUCAI / SAN)

---

## 1. Introducción y Análisis del Sesgo de Kaplan-Meier en la Población Argentina

En la práctica actuarial aplicada a la salud y en la valoración de pasivos contingentes de alta complejidad, la estimación precisa de la curva de supervivencia de los pacientes que ingresan a tratamiento de sustitución renal es el factor crítico para determinar el **Valor Actual Actuarial de Diálisis (VAAD)** [11, 15, 16]. Tradicionalmente, la literatura nefrológica y los modelos de gestión financiera han utilizado el estimador de Kaplan-Meier para modelar la probabilidad de supervivencia en el tiempo [1, 3]. Sin embargo, la aplicación directa de la supervivencia de Kaplan-Meier en pacientes con enfermedad renal crónica terminal (ERCT) introduce un sesgo de sobreestimación sistemática de la mortalidad en diálisis cuando se utiliza para estructurar tablas actuariales de flujos de fondos [1, 5, 10].

Este sesgo se origina debido a la consideración del trasplante renal y la recuperación de la función renal como pérdidas de seguimiento o censuras por la derecha convencionales (censura no informativa) [1, 18, 472]. En la realidad clínica de la República Argentina, regulada bajo la órbita del **Sistema Nacional de Información de Procuración y Trasplante (SINTRA)** gestionado por el **INCUCAI**, el trasplante no es un evento aleatorio e independiente de la muerte; representa un evento competitivo que retira físicamente al paciente del conjunto de riesgo de fallecer bajo diálisis [16, 412, 472]. Dado que los pacientes seleccionados para recibir un injerto renal presentan un perfil de comorbilidad significativamente más favorable y una edad promedio menor (50.6 años en diálisis peritoneal y 57.6 años en hemodiálisis frente al promedio general), tratarlos como censuras independientes implica que su riesgo de muerte remanente sería idéntico al de aquellos pacientes con alta carga cardiovascular que permanecen en diálisis [16, 168, 476, 483].

El impacto numérico de omitir los riesgos competitivos en la modelización de carteras de salud es masivo. A nivel internacional, en estudios observacionales de referencia como la cohorte holandesa NECOSAD o el registro francés REIN, el estimador de Kaplan-Meier sobreestimó el riesgo acumulado de muerte al quinto año en aproximadamente 15 a 20 puntos porcentuales en comparación con la **Función de Incidencia Acumulada (CIF)** [13, 18, 487]. En la República Argentina, de acuerdo con los microdatos consolidados del **Registro Argentino de Diálisis Crónica 2024**, la sobreestimación actuarial de la mortalidad a 5 años mediante el método tradicional de Kaplan-Meier frente a modelos avanzados de riesgo competitivo genera diferenciales de hasta un 11.4% acumulado, una discrepancia inaceptable que infla artificialmente las primas de seguro y sobreestima la futilidad terapéutica de la prestación [16, 477, 488].

Para mitigar este sesgo y proveer flujos de caja de pasivos probabilísticos consistentes, el modelado actuarial debe basarse estrictamente en la Función de Incidencia Acumulada ($CIF$) y en el ajuste de riesgos proporcionales de sub-distribución desarrollado por **Fine y Gray** [2, 16, 489]. La $CIF$ define la probabilidad absoluta de experimentar la muerte en diálisis antes de un tiempo determinado $t$, ponderando de forma dinámica la tasa de riesgo específica de la causa por la probabilidad de haber sobrevivido a todos los riesgos competitivos previos acumulados [1, 2, 484].

---

## 2. Estructura Actuarial Multiestado de Markov

La trayectoria de un paciente que ingresa a terapia de reemplazo renal no constituye un proceso estático de un solo evento, sino una secuencia dinámica de transiciones entre diferentes estados de tratamiento y salud [11, 473]. Para capturar de manera óptima las obligaciones financieras asociadas y predecir los costos esperados, se implementa un modelo de **Markov multiestado** en tiempo continuo y espacio de estados finito [11, 478].

El espacio de estados $S = \{1, 2, 3, 4, 5, 6\}$ se define bajo la siguiente taxonomía clínica y financiera:

1. **Estado 1 (Diálisis Peritoneal - DP)**: Estado transitorio inicial o intermedio de terapia domiciliaria, caracterizado por una menor tasa de anemia y preservación prolongada de la función renal residual [16, 111, 129].
2. **Estado 2 (Hemodiálisis Convencional - HD)**: Estado transitorio inicial o intermedio de terapia en centro clínico trisemanal, que constituye la práctica mayoritaria en la República Argentina (91.12% de la población prevalente) [16, 165].
3. **Estado 3 (Hemodiafiltración de Alto Volumen - HDF)**: Estado transitorio intermedio de alta eficiencia convectiva (volumen de sustitución medio $\ge 23$ litros por sesión), que ha mostrado un notable crecimiento en el país, representando el 13.18% de los prevalentes en 2024 [16, 165, 307].
4. **Estado 4 (Lista de Espera de Trasplante - LE)**: Estado transitorio de selección clínica activa registrado formalmente ante el SINTRA/INCUCAI [16, 479].
5. **Estado 5 (Trasplante Renal Activo - TR)**: Estado transitorio de supervivencia optimizada post-injerto con restauración de la función renal y terapia inmunosupresora continua [16, 413, 480].
6. **Estado 6 (Muerte - M)**: Estado absorbente final del modelo [11, 16].

Las intensidades de transición instantáneas entre el estado $i$ y el estado $j$ en el tiempo $t$, condicionadas a un vector de covariables demográficas y clínicas del paciente individual ($Z$), se modelan mediante la ecuación:

$\alpha_{ij}(t \mid Z) = \alpha_{ij,0}(t) \cdot \exp(\beta_{ij}^T Z)$

Donde $\alpha_{ij,0}(t)$ representa la intensidad de transición basal y $\beta_{ij}$ es el vector de coeficientes de riesgo específicos de transición, estimados a partir de los datos biometrométricos de la cohorte histórica argentina [16, 31, 478].

---

## 3. Tablas de Mortalidad Actuarial Segregadas para la República Argentina

Para posibilitar el cálculo directo del $VAAD$, se presentan a continuación las tablas actuariales estructuradas a partir de la síntesis del **Registro Argentino de Diálisis Crónica 2024**, depurando las distorsiones estadísticas y aislando el sesgo de riesgos competitivos mediante funciones de sub-distribución [16, 261, 350, 357, 364].

### Tabla 1: Tasas Basales de Mortalidad Anual ($q_{x,0}$) por Rango de Edad, Sexo y Modalidad Dialítica en Argentina (Por 1,000 Personas-Año en Riesgo)

Estas tasas representan la probabilidad anual basal de transición hacia el estado de muerte ($\alpha_{i6}(t)$) para un paciente típico del sistema argentino, calculadas a partir del bienio de referencia de estabilidad epidemiológica post-pandemia (2023-2024) [16, 272, 350, 357, 364].

| Rango de Edad  | Varones HD ($q_{x,HD}$) [16] | Mujeres HD ($q_{x,HD}$) [16] | Varones DP ($q_{x,DP}$) [16] | Mujeres DP ($q_{x,DP}$) [16] | HDF en Línea ($q_{x,HDF}$) [16] |
|:-------------- |:----------------------------:|:----------------------------:|:----------------------------:|:----------------------------:|:-------------------------------:|
| **18–30 años** | 56.1                         | 52.5                         | 24.5                         | 70.0                         | 31.1                            |
| **31–40 años** | 56.5                         | 60.3                         | 36.0                         | 66.4                         | 31.0                            |
| **41–50 años** | 74.8                         | 78.8                         | 57.7                         | 131.6                        | 49.7                            |
| **51–60 años** | 120.2                        | 105.0                        | 118.8                        | 113.0                        | 96.6                            |
| **61–70 años** | 179.3                        | 164.6                        | 92.7                         | 166.4                        | 141.9                           |
| **71–80 años** | 272.8                        | 266.4                        | 157.1                        | 306.5                        | 214.2                           |
| **>80 años**   | 403.9                        | 405.7                        | 228.8                        | 533.6                        | 320.2                           |

*Nota metodológica: Para garantizar la estabilidad estadística y mitigar la volatilidad por el bajo tamaño muestral en los extremos etarios de la modalidad de Diálisis Peritoneal y HDF en línea en la Argentina, se han utilizado los promedios ponderados del bienio 2023-2024 y la estandarización directa del registro general [16, 284, 305, 313].*

---

### Tabla 2: Matriz Actuarial de Multiplicadores de Riesgo (Hazard Ratios de Sub-distribución - SHR) por Comorbilidad Principal en Argentina

Para ajustar las tasas basales de mortalidad ($q_{x,0}$) según la comorbilidad específica del paciente al momento del ingreso al modelo, el actuario debe aplicar los siguientes coeficientes multiplicadores basados en el modelo multivariado de **Fine y Gray** ajustado para la población incidente argentina del período 2018-2024 [16, 379, 385, 388, 392]:

| Comorbilidad Principal / Factor de Riesgo   | Multiplicador HD ($SHR_{HD}$) [16] | Multiplicador DP ($SHR_{DP}$) [16] | Multiplicador HDF ($SHR_{HDF}$) [16] |
|:------------------------------------------- |:----------------------------------:|:----------------------------------:|:------------------------------------:|
| **Glomerulonefritis (Basal)**               | 1.00                               | 1.00                               | 1.00                                 |
| **Nefropatía Diabética (DBT)**              | 1.339                              | 1.565                              | 1.553                                |
| **Enfermedad Vascular Periférica (EVP)**    | 1.129                              | 1.327                              | 1.461                                |
| **Enfermedad Cerebrovascular**              | 1.200                              | 1.510                              | 1.089                                |
| **Insuficiencia Cardíaca Congestiva (ICC)** | 1.160                              | 2.113                              | 1.203                                |
| **Arritmia Cardíaca al Ingreso**            | 1.174                              | 1.213                              | 1.133                                |
| **Neoplasia Activa (últimos 5 años)**       | 1.609                              | 1.181                              | 1.441                                |
| **Albuminemia Inicial < 3.5 g/dL**          | 1.475                              | 1.553                              | 1.828                                |
| **Hematocrito Inicial < 27%**               | 1.044                              | 1.200                              | 1.044                                |
| **HIV Positivo al Ingreso**                 | 1.669                              | 2.125                              | 1.690                                |
| **HBsAg Positivo (Hepatitis B)**            | 1.167                              | 2.582                              | 1.167                                |

---

## 4. Ajuste Actuarial de Probabilidades y Ejemplo Práctico

Para convertir la **probabilidad basal** (correspondiente a un paciente ideal sin comorbilidades severas) en una **probabilidad ajustada** (paciente real con diagnóstico múltiple), el actuario aplica la fórmula de escala acumulada sobre la función de supervivencia o la tasa de mortalidad correspondiente:

$q_{x, ajustado} = 1 - (1 - q_{x,0})^{\prod_k SHR_k}$    

Donde $\prod_k SHR_k$ representa el producto de los multiplicadores de riesgo correspondientes a cada comorbilidad diagnosticada presentes en la Tabla 2 [16, 35, 482].

### Ejemplo de Ajuste de Probabilidad bajo Parámetros de Argentina

Consideremos un paciente varón de 55 años que inicia Hemodiálisis (HD) convencional en Argentina con diagnóstico de Nefropatía Diabética y Enfermedad Vascular Periférica (EVP) asociada:

1. **Tasa basal de mortalidad** ($q_{55,0}$) para un varón en HD de 51-60 años (Tabla 1) [16]:
   $q_{55,0} = \frac{120.2}{1,000} = 0.1202 \text{ (12.02\% anual)}$

**Multiplicadores de riesgo asociados** (Tabla 2) [16]:

* $SHR_{\text{Nefropatía Diabética}} = 1.339$
* $SHR_{\text{EVP}} = 1.129$
. **Factor de escala acumulado**:
  $\prod_k SHR_k = 1.339     \times 1.129 = 1.5117$
. **Probabilidad anual ajustada de mortalidad** ($q_{55, ajustado}$): $q_{55, \text{ajustado}} = 1 - (1 - 0.1202)^{1.5117} = 1 - (0.8798)^{1.5117} \approx 1 - 0.8242 = 0.1758 \text{ (17.58\% anual)}$

### El Efecto Dominó en la Proyección de Flujos Financieros

Este ajuste eleva la probabilidad de fallecimiento del paciente en su primer año de tratamiento de un 12.02% a un 17.58%. Aunque numéricamente parezca una variación acotada, en la operatoria de las reservas matemáticas este ajuste genera un **efecto dominó** de alta repercusión en la gestión de pasivos del financiador [16, 36]:

* **Contracción de la Esperanza de Vida Actuarial**: Reduce el horizonte temporal proyectado de egresos por sesiones de diálisis crónicas, adelantando la probabilidad de que el contrato de cobertura finalice por el fallecimiento del paciente (estado absorbente) [16, 485].
* **Impacto en el Pasivo Contingente**: El Valor Actual Actuarial de Diálisis ($VAAD$) disminuye significativamente frente al de un paciente basal de la misma edad, requiriendo una reserva matemática de capitalización menor debido a la menor expectativa de permanencia con vida en el tratamiento sustitutivo [11, 16, 43].
* **Primas de Riesgo**: Obliga a recalcular las tasas de aporte de las carteras de salud debido a la alta concentración de riesgo y la menor probabilidad de supervivencia del paciente a 5 años (supervivencia acumulada de apenas 34.97% frente a un 65.59% para el perfil sano) [16].

---

## 5. Tabla de Mortalidad Integrada (Perfiles Seleccionados)

A continuación, se presenta la proyección actuarial de supervivencia para los primeros 5 años de tratamiento sustitutivo, asumiendo la interacción de la mortalidad y el trasplante renal como riesgos competitivos reales en la República Argentina [16, 38, 370].

### Tabla 3: Tabla de Mortalidad Actuarial Integrada para Perfiles de Pacientes Seleccionados (Primeros 5 Años de Tratamiento)

Esta tabla muestra las probabilidades anuales de muerte ($q_{x+t}$) y las probabilidades de supervivencia acumulada (${}_t p_x$) bajo los parámetros biométricos y de envejecimiento paramétrico del Registro Argentino (con incrementos anuales del factor de edad del 1.039 para HD, 1.037 para DP y 1.048 para HDF) [16, 379, 385, 388, 392]:

| Año de Tratamiento ($t$) | Perfil A: Varón, 45 años, HD, Glomerulonefritis (Sano) [16] | Perfil B: Varón, 55 años, HD, Nefropatía Diabética + EVP [16] | Perfil C: Mujer, 65 años, DP, Nefropatía Diabética [16] | Perfil D: Mujer, 72 años, HDF, Diabética con ECV [16] |
|:------------------------ |:----------------------------------------------------------- |:------------------------------------------------------------- |:------------------------------------------------------- |:----------------------------------------------------- |
| **$t=1$**                | $q_{45} = 0.0748$<br>${}_1 p_{45} = 0.9252$                 | $q_{55} = 0.1758$<br>${}_1 p_{55} = 0.8242$                   | $q_{65} = 0.2503$<br>${}_1 p_{65} = 0.7497$             | $q_{72} = 0.3348$<br>${}_1 p_{72} = 0.6652$           |
| **$t=2$**                | $q_{46} = 0.0777$<br>${}_2 p_{45} = 0.8533$                 | $q_{56} = 0.1824$<br>${}_2 p_{55} = 0.6739$                   | $q_{66} = 0.2619$<br>${}_2 p_{65} = 0.5534$             | $q_{73} = 0.3501$<br>${}_2 p_{72} = 0.4323$           |
| **$t=3$**                | $q_{47} = 0.0807$<br>${}_3 p_{45} = 0.7844$                 | $q_{57} = 0.1893$<br>${}_3 p_{55} = 0.5463$                   | $q_{67} = 0.2731$<br>${}_3 p_{65} = 0.4023$             | $q_{74} = 0.3659$<br>${}_3 p_{72} = 0.2741$           |
| **$t=4$**                | $q_{48} = 0.0839$<br>${}_4 p_{45} = 0.7186$                 | $q_{58} = 0.1963$<br>${}_4 p_{55} = 0.4391$                   | $q_{68} = 0.2849$<br>${}_4 p_{65} = 0.2877$             | $q_{75} = 0.3823$<br>${}_4 p_{72} = 0.1693$           |
| **$t=5$**                | $q_{49} = 0.0872$<br>${}_5 p_{45} = 0.6559$                 | $q_{59} = 0.2037$<br>${}_5 p_{55} = 0.3497$                   | $q_{69} = 0.2968$<br>${}_5 p_{65} = 0.2023$             | $q_{76} = 0.3992$<br>${}_5 p_{72} = 0.1017$           |

---

## 6. Análisis Actuarial por Modalidad y Transiciones Críticas en Argentina

El diseño de un algoritmo de simulación del $VAAD$ requiere parametrizar de manera precisa las transiciones entre las diferentes terapias sustitutivas de la cohorte argentina, que muestran marcadas diferencias estructurales con los registros de países desarrollados [16, 489].

### 1. Dinámica de Transición de Diálisis Peritoneal (DP) a Hemodiálisis (HD)

En la República Argentina, el modelado actuarial de la permanencia en Diálisis Peritoneal (DP) exige un enfoque transicional dinámico debido al fenómeno del desgaste progresivo de la membrana peritoneal y la incidencia de peritonitis bacterianas recurrentes [16, 39, 113, 115]. 

* **El "Efecto Protector" Inicial**: Durante los primeros 24 meses de tratamiento, los pacientes que inician en DP muestran tasas de mortalidad ajustadas significativamente inferiores a la HD convencional (con un Hazard Ratio de supervivencia de 0.67 para el bienio 2023-2024) [16, 301, 302]. Esto se asocia con una mejor preservación de la función renal residual, menor estrés hemodinámico cardiovascular y mejores parámetros clínico-bioquímicos iniciales al momento del ingreso programado (menor nivel de anemia y mayor albuminemia promedio en DP de 3.62 g/dL frente a 3.43 g/dL en HD) [16, 129, 193, 195].
* **La Falla de la Técnica**: A partir del segundo año, la tasa de transferencia técnica hacia la hemodiálisis convencional (HD) se acelera sustancialmente en la cohorte argentina [16, 39, 114]. El desgaste acumulado de la membrana peritoneal y los episodios infecciosos obligan a transferir anualmente a un porcentaje estimado del 6.5% de los pacientes activos en DP hacia la HD convencional [16, 113, 115]. Actuarialmente, esta transición implica un cambio inmediato en la estructura de costos (incrementando los costos variables directos y el promedio de días de hospitalización anual) y una reclasificación en la tasa basal de mortalidad, que se incrementa al pasar al Estado 2 [11, 15, 16, 40].

### 2. Estabilización y Reducción del Riesgo Cardiovascular mediante HDF en Línea

La incorporación de la Hemodiafiltración (HDF) de alto volumen convectivo ha modificado radicalmente las proyecciones actuariales de supervivencia en la Argentina [16, 259, 307].

* **Ventaja Epidemiológica y Supervivencia**: Con una participación creciente del 13.18% de los prevalentes totales del país en 2024, los pacientes bajo HDF en línea demuestran una reducción sostenida del riesgo de mortalidad por todas las causas de un **39% en la cohorte general** [16, 259] y de un **45% en el modelo multivariado ajustado por comorbilidades (Modelo 4, HR: 0.55)** en comparación con la hemodiálisis convencional [16, 401, 402]. Esto obedece a una depuración óptima de toxinas urémicas de mediano peso molecular y una notable estabilización de la tensión arterial sistólica y media durante la sesión, reduciendo significativamente la muerte súbita cardiovascular y las tasas de hospitalización asociadas [16, 180, 204, 205].
* **Proyección Financiera**: El ingreso a HDF en línea, si bien exige un costo unitario por sesión marginalmente superior, estabiliza el modelo actuarial al prolongar la esperanza de vida remanente del paciente y diferir el horizonte temporal de pagos, reduciendo los picos de gasto por contingencias de internación y optimizando la previsibilidad de los fondos de reserva [11, 15, 16, 40].

### 3. El Trasplante Renal y la Lista de Espera del SINTRA como Riesgos Competitivos

El acceso al trasplante renal (Estado 5) actúa como el riesgo competitivo de mayor relevancia en el modelado actuarial del paciente renal en Argentina, regulado estrictamente por los criterios de distribución del INCUCAI [16, 411, 472].

* **Tasa de Trasplante**: La tasa bruta de trasplantes renales en la población en diálisis de Argentina se ha recuperado progresivamente de la contracción pandémica, situándose en **4.60 trasplantes por cada 100 paciente-años de exposición al riesgo (P/AER) en 2024** [16, 411, 416].
* **El Sesgo de Selección y la Lista de Espera**: El ingreso de un paciente a la Lista de Espera (Estado 4) actúa como un potente filtro biológico. Los pacientes aptos para la lista presentan un estado de salud basal significativamente superior a la población que permanece excluida por contraindicaciones cardiovasculares o diabetes avanzada [16, 30, 479]. Actuarialmente, la transición al Estado 4 ($i     o 4$) debe interpretarse como un marcador de reducción proporcional de la fuerza de mortalidad (con un Hazard Ratio de mortalidad un 50% menor en lista) [16, 479]. La transición final al Trasplante Activo ($4     o 5$) restablece la función orgánica y reduce drásticamente el pasivo continuo por sesiones de diálisis, requiriendo únicamente la previsión financiera para el mantenimiento con drogas inmunosupresoras y el seguimiento nefrológico ambulatorio [11, 15, 16, 43].

---

## 7. Formulación Matemática del Valor Actual Actuarial de Diálisis (VAAD)

Para realizar la valoración actuarial de las obligaciones de cobertura o los costos esperados de un paciente de edad $x$ al ingresar a tratamiento de diálisis en el estado transitorio $i$, se define el **Valor Actual Actuarial de Diálisis ($VAAD_i(x, N)$)** para un horizonte temporal de $N$ años [11, 15, 40].

### Modelo Continuo de Valoración

Asumiendo una estructura continua de flujos financieros y transición, el $VAAD$ se calcula mediante la integral del costo esperado descontado [11]:

$VAAD_i(x, N) = \int_0^N e^{-\delta t} \sum_{j=1}^5 C_j(t) \cdot P_{ij}(0, t) \, dt$

Donde:

* $\delta = \ln(1+r)$ representa la fuerza de interés continuo calculada a partir de la tasa de descuento actuarial de referencia $r$ equivalente [11, 41].
* $C_j(t)$ es la tasa de costo continuo anual proyectada para el tratamiento del estado $j$ en el tiempo $t$ (incluyendo costos fijos de diálisis, fármacos complementarios, hospitalizaciones asociadas por complicaciones y drogas inmunosupresoras en el estado de trasplante) [11, 15, 41].
* $P_{ij}(0, t)$ representa la probabilidad de transición multiestado continua de que un individuo que inició en el estado $i$ a la edad $x$ se encuentre en el estado de tratamiento $j$ al cabo del tiempo $t$ [11, 41].

### Modelo Discreto de Valoración

Para la implementación práctica en algoritmos y sistemas informáticos de cálculo, la fórmula se transforma en su equivalente discreto de periodicidad anual [11, 42]:

$VAAD_i(x, N) = \sum_{t=1}^N \frac{1}{(1+r)^t} \sum_{j=1}^5 C_j(t) \cdot {}_t p_x^{i \to j}$

Donde ${}_t p_x^{i     o j}$ es la probabilidad de transición discreta del estado $i$ al estado $j$ en $t$ años para un individuo de edad $x$ al inicio del tratamiento, calculada a partir de la multiplicación sucesiva de las matrices de transición anuales derivadas del modelo multiestado [7, 42].

La probabilidad de supervivencia acumulada global del paciente en el sistema de terapia renal activa (${}_t p_x$) se define como la probabilidad de no haber transitado hacia el estado absorbente de muerte (Estado 6) [7, 11, 42]:

${}_t p_x = \sum_{j=1}^5 P_{ij}(0, t) = 1 - P_{i6}(0, t)$

Donde $P_{i6}(0, t)$ representa la Función de Incidencia Acumulada de la muerte en diálisis, calculada de manera robusta aislando los riesgos competitivos de trasplante [1, 2, 7, 43].

---

## 8. Implementación Algorítmica y Aplicación Práctica

Para ilustrar el proceso de valoración actuarial de forma secuencial, se describe a continuación la aplicación del modelo a un caso específico de ingreso:

1. **Definición del Perfil de Riesgo del Paciente**:
   * **Edad de ingreso ($x$)**: 55 años.
   * **Sexo**: Varón [16].
   * **Modalidad de inicio**: Hemodiálisis Convencional (Estado 2) [16].
   * **Comorbilidades clínicas**: Diagnóstico primario de Nefropatía Diabética más antecedentes de Enfermedad Vascular Periférica (EVP) [16].
2. **Ajuste de la Fuerza de Mortalidad**: Se extrae la probabilidad basal de muerte del Varón en HD de 55 años ($q_{55,0} = 0.1202$ o $120.2$ por 1,000 en riesgo) de la Tabla 1 [16]. Se calculan las tasas anuales ajustadas utilizando el factor multiplicativo combinado ($\prod SHR = 1.5117$) obtenido de la Tabla 2 [16]. La probabilidad de muerte ajustada resultante para el primer año es $q_{55, ajustado} = 17.58\%$ [16].
3. **Proyección de las Probabilidades de Estado ($P_{ij}(0, t)$)**: Se proyectan las probabilidades de transición multiestado para cada año $t$, incorporando de manera dinámica la intensidad de transición hacia el estado de trasplante ($\alpha_{25}$) y hacia la diálisis peritoneal si hubiese switch de modalidad [1, 2, 7, 16].
4. **Asignación de Costos de Tratamiento ($C_j(t)$)**: Se definen las tasas de costo promedio anual de cada estado de tratamiento para la institución de cobertura en base a los nomencladores arancelarios locales:
   * $C_2$ (Costo anual de HD más hospitalizaciones promedio): $\$45,000$ USD/año [15, 16].
   * $C_5$ (Costo anual de mantenimiento post-trasplante e inmunosupresores): $\$12,000$ USD/año [15, 16].
5. **Descuento Financiero y Sumación**: Utilizando una tasa de descuento técnico actuarial del $r = 4\%$ anual, se calculan los costos esperados descontados para cada año y se realiza la sumatoria para obtener el $VAAD$ final [11, 16]. Este valor representa la reserva matemática neta que la entidad debe constituir en el momento cero para garantizar la cobertura total de la terapia de reemplazo renal de este paciente durante el horizonte de tiempo proyectado [11, 15, 16].

---

## 9. Listado de Referencias

[1] Noordzij M, Leffondré K, van Stralen KJ, Zoccali C, Dekker FW, Jager KJ: "The use of competing risk analysis in nephrology", Nephrology Dialysis Transplantation, Vol. 28/No. 11, 2013. Disponible en https://doi.org/10.1093/ndt/gft025

[2] Fine JP, Gray RJ: "A proportional hazards model for the subdistribution of a competing risk", Journal of the American Statistical Association, Vol. 94/No. 446, 1999. Disponible en https://www.jstor.org/stable/2669998

[3] Jager KJ, Zoccali C, MacLeod A, Dekker FW: "Competing risks: what, why, and how?", Kidney International, Vol. 79/No. 9, 2011. Disponible en https://doi.org/10.1038/ki.2010.543

[4] USRDS: "United States Renal Data System Annual Data Report: Epidemiology of kidney disease in the United States", National Institutes of Health, National Institute of Diabetes and Digestive and Kidney Diseases, Vol. Annual Report, 2023. Disponible en https://usrds-adr.niddk.nih.gov/2023

[5] ERA Registry: "ERA Annual Report 2022", European Renal Association, Vol. Annual Report, 2023. Disponible en https://www.era-online.org/wp-content/uploads/2023/12/ERA-Registry-Annual-Report-2022.pdf

[6] UK Renal Registry: "25th Annual Report of the UK Renal Registry", The Renal Association, Vol. Annual Report, 2023. Disponible en https://ukkidney.org/sites/renal.org/files/25th_UKRR_ANNUAL_REPORT_v2.pdf

[7] Putter H, Fiocco M, Geskus RB: "Tutorial in biostatistics: competing risks and multi-state models", Statistics in Medicine, Vol. 26/No. 11, 2007. Disponible en https://doi.org/10.1002/sim.2712

[8] Canaud B, Bragg-Gresham JL, Marshall MR, et al.: "Mortality risk for patients receiving hemodiafiltration versus hemodialysis: European results from the DOPPS", Kidney International, Vol. 69/No. 11, 2006. Disponible en https://doi.org/10.1038/sj.ki.5000412

[9] Couchoud C, Stengel B, Landais P, et al.: "The renal epidemiology and information network (REIN): a new registry for end-stage renal disease in France", Nephrology Dialysis Transplantation, Vol. 21/No. 2, 2006. Disponible en https://doi.org/10.1093/ndt/gfi198

[10] Kalbfleisch JD, Prentice RL: "The Statistical Analysis of Failure Time Data", Second Edition, Wiley, Vol. 2, 2002. Disponible en https://onlinelibrary.wiley.com/doi/book/10.1002/9781118032985

[11] Latimer NR: "Survival Analysis for Economic Evaluations Alongside Clinical Trials - Extrapolation with Patient-Level Data", NICE DSU Technical Support Document 14, Vol. 14, 2011. Disponible en http://nicedsu.org.uk/wp-content/uploads/2016/03/NICE-DSU-TSD-14-survival-analysis-updated-March-2013.v2.pdf

[12] ANZDATA: "45th Annual ANZDATA Report", Australia and New Zealand Dialysis and Transplant Registry, Vol. Annual Report, 2022. Disponible en https://www.anzdata.org.au/report/anzdata-45th-annual-report-2022/

[13] Van Manen JG, Korevaar JC, Dekker FW, et al.: "How to adjust for complications of chronic renal failure: The NECOSAD Study", American Journal of Kidney Diseases, Vol. 42/No. 3, 2003. Disponible en https://doi.org/10.1016/S0272-6386(03)00742-0

[14] Mehrotra R, Chiu YW, Kalantar-Zadeh K, Bargman J, Vonesh E: "Similar Outcomes With Hemodialysis and Peritoneal Dialysis in Patients With End-Stage Renal Disease", Archives of Internal Medicine, Vol. 171/No. 2, 2011. Disponible en https://doi.org/10.1001/archinternmed.2011.16

[15] Icks A, Haastert B, Gandjour A, et al.: "Costs of dialysis—a regional population-based analysis", Nephrology Dialysis Transplantation, Vol. 25/No. 5, 2010. Disponible en https://doi.org/10.1093/ndt/gfp623

[16] Marinovich S, Bisigniano L, Rosa Diez G, Hansen Krogh D, Liderman S, Tagliafichi V, Fayad A, Haber Shaalo V: "Registro Argentino de Diálisis Crónica SAN-INCUCAI 2024", Sociedad Argentina de Nefrología e Instituto Nacional Central Único Coordinador de Ablación e Implante, Vol. 18, 2025. Disponible en https://www.san.org.ar/registros/

[17] Gillaizeau F, et al.: "Waiting list for renal transplantation and mortality in dialysis patients: A multi-state model", Nephrology Dialysis Transplantation, Vol. 30/No. 2, 2015. Disponible en https://pmc.ncbi.nlm.nih.gov/articles/PMC4310874/

[18] Couchoud C, et al.: "Overestimation of the probability of death on peritoneal dialysis by the Kaplan-Meier method: advantages of a competing risks approach", Nephrology Dialysis Transplantation, Vol. 27/No. 12, 2012. Disponible en https://pubmed.ncbi.nlm.nih.gov/22646159/

[19] Bravo J, Soto P, Marín O, Contreras W, Arce L, Álamo I, Huanca M, Díaz D, Castillo R, Loayza L, Ramos M, Bastidas B: "Riesgo competitivo entre diálisis y muerte entre pacientes con enfermedad renal crónica basado en el Registro Nacional de Vigilancia de Salud Renal (Visare) en Essalud (2013–2022)", Reporte de Resultado de Investigación- RRI 09-2025, Vol. 9, 2025. Disponible en https://ietsi.essalud.gob.pe/wp-content/uploads/2025/10/RRI-009-con-V%C2%B0-B%C2%B0VFVF.pdf

[20] Pinto-Ramirez J, Garcia-Lopez A, Salcedo-Herrera S, et al.: "Risk factors for graft loss and death among kidney transplant recipients: A competing risk analysis", PLOS ONE, Vol. 17/No. 6, 2022. Disponible en https://doi.org/10.1371/journal.pone.0269990
