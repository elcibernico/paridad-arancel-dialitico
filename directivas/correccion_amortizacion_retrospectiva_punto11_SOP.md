# SOP: Corrección del Cálculo de Amortización Retrospectiva (Punto 11)

Este procedimiento operativo estándar (SOP) define la lógica y corrección del componente de amortización retrospectiva ($PTP_{\text{retrosp}, T}$) en el simulador de recomposición del arancel dialítico (`Punto11.jsx`).

---

## 1. Diagnóstico del Error Detectado

### El Problema
Al incrementar el **"Plazo de Amortización Histórica"** ($M_{\text{históricos}}$), el componente unitario de amortización ($PTP_{\text{retrosp}}$) **disminuía en lugar de aumentar**, generando una inconsistencia financiera y actuarial directa: quien acumulaba más meses de déficit histórico terminaba recibiendo un recargo por sesión menor.

### Causa Raíz (La "Doble División")
En la implementación original de `Punto11.jsx`, se calculaba:
```javascript
const avgDeficitNominal = sumDeficitNominal / mesesHistorialRecuperar;
unitLossAccumulated = Math.max(0, avgDeficitNominal);
PTP_retrosp_T = mesesProyeccion > 0 ? unitLossAccumulated / mesesProyeccion : 0;
```
Esto dividía el déficit primero por los meses históricos ($M$) para obtener un promedio, y luego volvía a dividir ese promedio por los meses futuros de prospección ($K$).
Al tomar un promedio simple no indexado, la inclusión de meses más antiguos (con valores nominales en pesos significativamente menores por la inflación pasada) reducía el promedio, licuando la deuda a recuperar en lugar de acumularla.

---

## 2. Formulación Matemática Correcta

La deducción teórica y la fórmula expuesta en la interfaz estipulan:
$$PTP_{\text{retrosp}, T} = \frac{\sum_{m \in \text{historia}} \max(0, V^P_m - Y_m)}{K}$$

Donde:
* $\sum_{m \in \text{historia}} \max(0, V^P_m - Y_m)$: Es la **masa total acumulada de deuda nominal histórica** generada por la brecha arancelaria durante el plazo retrospectivo seleccionado ($M_{\text{históricos}}$ meses hacia atrás desde $T$).
* $K$ (`mesesProyeccion`): Es el **horizonte futuro de prospección** (divisor de amortización en cuotas futuras: 3, 6, 9 o 12 meses).

### Dinámica de los Controles
1. **Plazo de Amortización Histórica ($M$):**
   * A **mayor cantidad de meses** pasados reclamados $\rightarrow$ Mayor es la suma de deuda acumulada ($\sum$) $\rightarrow$ **Aumenta** el componente $PTP_{\text{retrosp}, T}$.
2. **Horizonte de Prospección ($K$):**
   * A **mayor plazo de prospección** $\rightarrow$ La deuda se diluye en más cuotas $\rightarrow$ **Disminuye** el recargo por sesión.

---

## 3. Plan de Modificación en Código (`Punto11.jsx`)

1. **Reemplazo de la Doble División:**
   * Acumular la deuda total: `totalDeficitNominal = sumDeficitNominal`.
   * Calcular la amortización por cuota futura:
     $$PTP_{\text{retrosp}, T} = \frac{\text{totalDeficitNominal}}{K}$$
2. **Clarificación en la UI:**
   * Mostrar en la tarjeta de métricas la **Pérdida Total Acumulada Histórica** y/o el promedio de manera inequívoca para que el usuario aprecie el incremento de la masa deficitaria al deslizar el control de meses.
