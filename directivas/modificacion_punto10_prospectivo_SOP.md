# SOP: Modificación del Modelo de Simulación Prospectivo (Punto 10)

Este procedimiento operativo estándar (SOP) detalla la lógica de transición del modelo prospectivo interactivo en la sección "Punto 10: El Modelo Prospectivo" (`Punto10.jsx`).

---

## 1. Objetivo y Cambio de Paradigma

El modelo prospectivo original estimaba la evolución del arancel nominal de la Obra Social ($Y$) mediante una tasa de incremento mensual fija y arbitraria ($g_{OS}$). Esto se reemplaza por un enfoque predictivo econométrico consistente con el comportamiento histórico de la financiadora.

* **Antes:** 
  $$Y_{T+k} = Y_T \cdot (1 + g_{OS})^k$$

* **Ahora:** El arancel futuro de la Obra Social se predice a partir del modelo econométrico (MCO o Ridge) estimado sobre la serie histórica del proyecto:
  $$Y_{T+k} = \hat{\beta}_0 + \hat{\beta}_1 \cdot IPC_{T+k} + \hat{\beta}_2 \cdot USD_{T+k} + \hat{\beta}_3 \cdot CCT_{T+k}$$
  donde los valores futuros de las variables exógenas se simulan a partir de las tasas de shock parametrizadas por el investigador ($g_{IPC}$, $g_{USD}$ y $g_{CCT}$).

---

## 2. Flujo de Cálculo Matemático y Momento Calculatorio (T)

La simulación retrospectiva y la proyección prospectiva interactúan a través de tres parámetros temporales clave:

* **Período Desde:** Punto de partida histórico para la estimación econométrica.
* **Período Hasta:** Punto de llegada del análisis histórico (por defecto, fin de serie).
* **Momento Calculatorio ($T$):** Momento de corte en el cual se realiza la recomposición actuarial y a partir del cual se efectúa la proyección (mes 0).
  * **Límite de la Regresión ($T_{regression}$):** El entrenamiento de las betas de la regresión lineal se realiza estrictamente en el rango `[periodoDesde, min(periodoHasta, momentoCalculatorio)]`. Esto evita fugas de información futura del modelo.

Para cada mes $k \in \{1, 2, \dots, K\}$ a partir del momento de corte $T$ (donde el mes proyectado es $t_k = T + k$):

### Caso A: Tramo con Datos Conocidos ($t_k \le \text{último mes del dataset}$)
* **Expectativa de comportamiento de Financiadora ($Y_{t_k}$):** Toma el valor nominal real pagado registrado en `seriesData.json` para ese período.
  * **Leyenda visual:** `"Comportamiento de Financiadora"`.
* **Paridad Polinómica ($VP_{t_k}$):** Utiliza los índices reales del dataset ($IPC_{t_k}$, $USD_{t_k}$, $CCT_{t_k}$) aplicados al valor inicial en $T$:
  $$VP_{t_k} = Y_T \cdot \left[ w_{CCT} \cdot \left(\frac{CCT_{t_k}}{CCT_T}\right) + w_{USD} \cdot \left(\frac{USD_{t_k}}{USD_T}\right) + w_{IPC} \cdot \left(\frac{IPC_{t_k}}{IPC_T}\right) \right]$$
  * **Leyenda visual:** `"Valor que se debió haber abonado según Modelo Polinómico de Costos Estructurales"`.
* **Estilo de línea gráfica:** Segmentada (puntos / dashed).

### Caso B: Tramo Proyectado a Futuro ($t_k > \text{último mes del dataset}$)
* **Shocks Macroeconómicos:** Se simulan acumulando shocks exógenos ($g$) a partir de los valores reales del último mes conocido del JSON ($L$):
  $$IPC_{t_k} = IPC_L \cdot (1 + g_{IPC})^m$$
  $$USD_{t_k} = USD_L \cdot (1 + g_{USD})^m$$
  $$CCT_{t_k} = CCT_L \cdot (1 + g_{CCT})^m$$
  donde $m$ es la distancia en meses desde $L$ hasta $t_k$.
* **Expectativa de comportamiento de Financiadora ($Y_{t_k}$):** Se estima econométricamente mediante la predicción de la regresión regularizada indexada a $T$:
  $$Y_{t_k} = Y_T \cdot \frac{Y^{pred}_{t_k}}{Y^{pred}_T}$$
  * **Leyenda visual:** `"Expectativa de comportamiento de Financiadora"`.
* **Paridad Polinómica ($VP_{t_k}$):** Se calcula a partir de los índices simulados.
  * **Leyenda visual:** `"Valor que debería abonar la Financiadora para equivaler los efectos IPC, USD y CCT"`.
* **Estilo de línea gráfica:** Continua.

---

## 3. Modificaciones en la Interfaz de Usuario (UI)

* **Eliminación:** Remover por completo el slider y parámetros asociados a $g_{OS}$ en la UI.
* **Control interactivo:** Agregar un selector o botón de opción para que el investigador elija el "Modelo Predictivo del Arancel OS" (Ridge vs MCO).
* **Muestra de Coeficientes:** Añadir una pequeña sección visual informativa que muestre las Betas calculadas y utilizadas en la simulación, alertando sobre signos contraintuitivos en el caso de MCO.
* **Desarrollo Matemático:** Actualizar las explicaciones de la pestaña interactiva para que reflejen esta nueva formulación basada en predicción econométrica.

---

## 4. Consideraciones Técnicas y Reglas de RBAC

* Los bloques interactivos y paneles de simulación en `Punto10.jsx` deben seguir delimitados estrictamente por las marcas de permisos:
  * `{/* ------------------------------------------- INI: p3_p4_a1 --------------------------------------------- */}`
  * `{/* ------------------------------------------- INI: p3_p4_a2 --------------------------------------------- */}`
* Se deben importar `buildMatrices`, `calculateMCO` y `calculateRidge` desde `../../utils/matrixMath` para no duplicar código de cálculo matricial.
