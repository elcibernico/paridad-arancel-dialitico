# Auditoría Matemática y Desarrollo Algebraico Explícito: Regresión Ridge ($n=3$)

> **PROMPT PARA ANTIGRAVITY 2.0:**
> Por favor, integra en el módulo explicativo/educativo de la app este desglose algebraico detailed.
> El objetivo es permitir que el usuario pueda visualizar el paso a paso exacto de las operaciones matriciales (multiplicaciones vectoriales, cálculo de cofactores, determinantes e inversión) tal como si se resolvieran manualmente en papel para las observaciones seleccionadas.

---

## 1. Definición Formal de Matrices y Propiedades

Considerando las $n=3$ observaciones históricas del dataset, definimos la variable dependiente $Y$ basada exclusivamente en `valorSesionHD` y la matriz de diseño $X$ con la constante $1$ en la primera columna para estimar el intercepto.

### Vector de Respuesta ($Y$)

Dimensiones: $(3 \times 1)$
$$Y = \begin{bmatrix} 5992.2800 \\ 6411.7300 \\ 6411.7300 \end{bmatrix}$$

### Matriz de Diseño ($X$)

Dimensiones: $(3 \times 4)$
$$X = \begin{bmatrix} 1.0000 & 385.8826 & 86.2500 & 44221.9300 \\ 1.0000 & 401.5071 & 89.2500 & 46722.6800 \\ 1.0000 & 415.8595 & 91.5000 & 49848.6400 \end{bmatrix}$$

### Parámetro de Regularización y Matriz Identidad

- $\lambda = 1.0$
- $I_4$: Matriz identidad de dimensión $(4 \times 4)$.

---

## 2. Reglas Generales del Álgebra Matricial Aplicadas

1. **Multiplicación Matricial ($A_{m \times n} \cdot B_{n \times p} = C_{m \times p}$):**
   El elemento en la Fila $i$, Columna $j$ ($C_{i,j}$) es el producto escalar de la Fila $i$ de $A$ por la Columna $j$ de $B$:
   $$C_{i,j} = \sum_{k=1}^n A_{i,k} \cdot B_{k,j}$$

2. **Simetría de $X^T X$:**
   Debido a que $(X^T X)^T = X^T X$, la matriz resulta simétrica. Por ende, los elementos fuera de la diagonal principal cumplen que $A_{i,j} = A_{j,i}$, reduciendo el número de cálculos independientes.

3. **Inversión por Matriz Adjunta:**
   $$M^{-1} = \frac{1}{\det(M)} \cdot \text{Adj}(M) = \frac{1}{\det(M)} \cdot C^T$$
   Donde $C_{i,j} = (-1)^{i+j} \cdot \det(M_{ij})$ es el cofactor del elemento $(i,j)$ y $M_{ij}$ es la submatriz de $(3 \times 3)$ al eliminar la fila $i$ y columna $j$.

---

## 3. Paso a Paso Explícito: Cálculo de $X^T X$

Multiplicamos $X^T$ (dimensiones $4 \times 3$) por $X$ (dimensiones $3 \times 4$) para obtener una matriz resultante de dimensiones $(4 \times 4)$.

### Fila 1 de la Matriz Resultante

- **Elemento $(1,1)$:**
  $$\begin{bmatrix} 1 & 1 & 1 \end{bmatrix} \times \begin{bmatrix} 1 \\ 1 \\ 1 \end{bmatrix} = (1 \cdot 1) + (1 \cdot 1) + (1 \cdot 1) = 3.0000$$
  *Ubicación:* Fila 1, Columna 1.

- **Elemento $(1,2)$:**
  $$\begin{bmatrix} 1 & 1 & 1 \end{bmatrix} \times \begin{bmatrix} 385.8826 \\ 401.5071 \\ 415.8595 \end{bmatrix} = 385.8826 + 401.5071 + 415.8595 = 1203.2492$$
  *Ubicación:* Fila 1, Columna 2.

- **Elemento $(1,3)$:**
  $$\begin{bmatrix} 1 & 1 & 1 \end{bmatrix} \times \begin{bmatrix} 86.2500 \\ 89.2500 \\ 91.5000 \end{bmatrix} = 86.2500 + 89.2500 + 91.5000 = 267.0000$$
  *Ubicación:* Fila 1, Columna 3.

- **Elemento $(1,4)$:**
  $$\begin{bmatrix} 1 & 1 & 1 \end{bmatrix} \times \begin{bmatrix} 44221.9300 \\ 46722.6800 \\ 49848.6400 \end{bmatrix} = 44221.9300 + 46722.6800 + 49848.6400 = 140793.2500$$
  *Ubicación:* Fila 1, Columna 4.

### Fila 2 de la Matriz Resultante

- **Elemento $(2,1)$:** Por propiedad de simetría $A_{2,1} = A_{1,2} = 1203.2492$.
  *Ubicación:* Fila 2, Columna 1.

- **Elemento $(2,2)$:**
  $$\begin{bmatrix} 385.8826 & 401.5071 & 415.8595 \end{bmatrix} \times \begin{bmatrix} 385.8826 \\ 401.5071 \\ 415.8595 \end{bmatrix}$$
  $$= (385.8826)^2 + (401.5071)^2 + (415.8595)^2$$
  $$= 148905.381381 + 161207.951040 + 172939.123650 = 483052.4561$$
  *Ubicación:* Fila 2, Columna 2.

- **Elemento $(2,3)$:**
  $$\begin{bmatrix} 385.8826 & 401.5071 & 415.8595 \end{bmatrix} \times \begin{bmatrix} 86.2500 \\ 89.2500 \\ 91.5000 \end{bmatrix}$$
  $$= (385.8826 \cdot 86.25) + (401.5071 \cdot 89.25) + (415.8595 \cdot 91.50)$$
  $$= 33282.374250 + 35834.508675 + 38051.144250 = 107168.0272$$
  *Ubicación:* Fila 2, Columna 3.

- **Elemento $(2,4)$:**
  $$\begin{bmatrix} 385.8826 & 401.5071 & 415.8595 \end{bmatrix} \times \begin{bmatrix} 44221.9300 \\ 46722.6800 \\ 49848.6400 \end{bmatrix}$$
  $$= (385.8826 \cdot 44221.93) + (401.5071 \cdot 46722.68) + (415.8595 \cdot 49848.64)$$
  $$= 17064472.067426 + 18759487.696228 + 20730031.818872 = 56553991.5825$$
  *Ubicación:* Fila 2, Columna 4.

### Fila 3 de la Matriz Resultante

- **Elemento $(3,1)$:** Por simetría $A_{3,1} = A_{1,3} = 267.0000$.
  *Ubicación:* Fila 3, Columna 1.

- **Elemento $(3,2)$:** Por simetría $A_{3,2} = A_{2,3} = 107168.0272$.
  *Ubicación:* Fila 3, Columna 2.

- **Elemento $(3,3)$:**
  $$\begin{bmatrix} 86.2500 & 89.2500 & 91.5000 \end{bmatrix} \times \begin{bmatrix} 86.2500 \\ 89.2500 \\ 91.5000 \end{bmatrix}$$
  $$= (86.25)^2 + (89.25)^2 + (91.50)^2$$
  $$= 7439.062500 + 7965.562500 + 8372.250000 = 23776.8750$$
  *Ubicación:* Fila 3, Columna 3.

- **Elemento $(3,4)$:**
  $$\begin{bmatrix} 86.2500 & 89.2500 & 91.5000 \end{bmatrix} \times \begin{bmatrix} 44221.9300 \\ 46722.6800 \\ 49848.6400 \end{bmatrix}$$
  $$= (86.25 \cdot 44221.93) + (89.25 \cdot 46722.68) + (91.50 \cdot 49848.64)$$
  $$= 3814141.462500 + 4170000.190000 + 4561150.560000 = 12545291.2125$$
  *Ubicación:* Fila 3, Columna 4.

### Fila 4 de la Matriz Resultante

- **Elemento $(4,1)$:** Por simetría $A_{4,1} = A_{1,4} = 140793.2500$.
  *Ubicación:* Fila 4, Columna 1.

- **Elemento $(4,2)$:** Por simetría $A_{4,2} = A_{2,4} = 56553991.5825$.
  *Ubicación:* Fila 4, Columna 2.

- **Elemento $(4,3)$:** Por simetría $A_{4,3} = A_{3,4} = 12545291.2125$.
  *Ubicación:* Fila 4, Columna 3.

- **Elemento $(4,4)$:**
  $$\begin{bmatrix} 44221.9300 & 46722.6800 & 49848.6400 \end{bmatrix} \times \begin{bmatrix} 44221.9300 \\ 46722.6800 \\ 49848.6400 \end{bmatrix}$$
  $$= (44221.93)^2 + (46722.68)^2 + (49848.64)^2$$
  $$= 1955579093.324900 + 2183009825.182400 + 2484885910.649600 = 6623474829.1569$$
  *Ubicación:* Fila 4, Columna 4.

### Matriz Resultante $X^T X$:

$$X^T X = \begin{bmatrix} 3.0000 & 1203.2492 & 267.0000 & 140793.2500 \\ 1203.2492 & 483052.4561 & 107168.0272 & 56553991.5825 \\ 267.0000 & 107168.0272 & 23776.8750 & 12545291.2125 \\ 140793.2500 & 56553991.5825 & 12545291.2125 & 6623474829.1569 \end{bmatrix}$$

---

## 4. Incorporación de la Penalización: $M = X^T X + \lambda I$

Sumamos $\lambda = 1.0$ a los elementos de la diagonal principal ($M_{i,i} = A_{i,i} + 1.0$):

$$M = \begin{bmatrix} 4.0000 & 1203.2492 & 267.0000 & 140793.2500 \\ 1203.2492 & 483053.4561 & 107168.0272 & 56553991.5825 \\ 267.0000 & 107168.0272 & 23777.8750 & 12545291.2125 \\ 140793.2500 & 56553991.5825 & 12545291.2125 & 6623474830.1569 \end{bmatrix}$$

---

## 5. Inversión de la Matriz Regularizada: $M^{-1}$

### Determinante Global

$$\det(M) \approx 1.2402305888 \times 10^{12}$$

### Matriz de Cofactores ($C$) y División por el Determinante

Obtenemos cada elemento de la inversa dividiendo el cofactor correspondiente traspuesto entre el determinante: $M^{-1}_{i,j} = \frac{C_{j,i}}{\det(M)}$.

- **Posición $(1,1)$:** $C_{1,1} = +1.240001 \times 10^{12} \implies M^{-1}_{1,1} = \frac{1.240001 \times 10^{12}}{1.2402305888 \times 10^{12}} = \mathbf{0.99981499}$

- **Posición $(1,2)$:** $C_{2,1} = -7.199819 \times 10^{9} \implies M^{-1}_{1,2} = \frac{-7.199819 \times 10^{9}}{1.2402305888 \times 10^{12}} = \mathbf{-0.00580523}$

- **Posición $(1,3)$:** $C_{3,1} = -2.419524 \times 10^{9} \implies M^{-1}_{1,3} = \frac{-2.419524 \times 10^{9}}{1.2402305888 \times 10^{12}} = \mathbf{-0.00195087}$

- **Posición $(1,4)$:** $C_{4,1} = +3.969946 \times 10^{7} \implies M^{-1}_{1,4} = \frac{3.969946 \times 10^{7}}{1.2402305888 \times 10^{12}} = \mathbf{0.00003201}$

- **Posición $(2,1)$:** $C_{1,2} = -7.199819 \times 10^{9} \implies M^{-1}_{2,1} = \mathbf{-0.00580523}$

- **Posición $(2,2)$:** $C_{2,2} = +1.078867 \times 10^{11} \implies M^{-1}_{2,2} = \frac{1.078867 \times 10^{11}}{1.2402305888 \times 10^{12}} = \mathbf{0.08698925}$

- **Posición $(2,3)$:** $C_{3,2} = -3.384855 \times 10^{11} \implies M^{-1}_{2,3} = \frac{-3.384855 \times 10^{11}}{1.2402305888 \times 10^{12}} = \mathbf{-0.27292145}$

- **Posición $(2,4)$:** $C_{4,2} = -2.799153 \times 10^{8} \implies M^{-1}_{2,4} = \frac{-2.799153 \times 10^{8}}{1.2402305888 \times 10^{12}} = \mathbf{-0.00022570}$

- **Posición $(3,1)$:** $C_{1,3} = -2.419524 \times 10^{9} \implies M^{-1}_{3,1} = \mathbf{-0.00195087}$

- **Posición $(3,2)$:** $C_{2,3} = -3.384855 \times 10^{11} \implies M^{-1}_{3,2} = \mathbf{-0.27292145}$

- **Posición $(3,3)$:** $C_{3,3} = +1.138659 \times 10^{12} \implies M^{-1}_{3,3} = \frac{1.138659 \times 10^{12}}{1.2402305888 \times 10^{12}} = \mathbf{0.91810297}$

- **Posición $(3,4)$:** $C_{4,3} = +7.334874 \times 10^{8} \implies M^{-1}_{3,4} = \frac{7.334874 \times 10^{8}}{1.2402305888 \times 10^{12}} = \mathbf{0.00059141}$

- **Posición $(4,1)$:** $C_{1,4} = +3.969946 \times 10^{7} \implies M^{-1}_{4,1} = \mathbf{0.00003201}$

- **Posición $(4,2)$:** $C_{2,4} = -2.799153 \times 10^{8} \implies M^{-1}_{4,2} = \mathbf{-0.00022570}$

- **Posición $(4,3)$:** $C_{3,4} = +7.334874 \times 10^{8} \implies M^{-1}_{4,3} = \mathbf{0.00059141}$

- **Posición $(4,4)$:** $C_{4,4} = +1.000104 \times 10^{6} \implies M^{-1}_{4,4} = \frac{1.000104 \times 10^{6}}{1.2402305888 \times 10^{12}} = \mathbf{0.00000081}$

### Matriz Inversa Resultante $M^{-1}$:

$$M^{-1} = \begin{bmatrix} 0.99981499 & -0.00580523 & -0.00195087 & 0.00003201 \\ -0.00580523 & 0.08698925 & -0.27292145 & -0.00022570 \\ -0.00195087 & -0.27292145 & 0.91810297 & 0.00059141 \\ 0.00003201 & -0.00022570 & 0.00059141 & 0.00000081 \end{bmatrix}$$

---

## 6. Paso a Paso Explícito: Cálculo de $X^T Y$

Multiplicamos $X^T$ (dimensiones $4 \times 3$) por $Y$ (dimensiones $3 \times 1$) para obtener un vector columna de dimensiones $(4 \times 1)$.

- **Elemento $(1,1)$:**
  $$\begin{bmatrix} 1.0000 & 1.0000 & 1.0000 \end{bmatrix} \times \begin{bmatrix} 5992.2800 \\ 6411.7300 \\ 6411.7300 \end{bmatrix}$$
  $$= 5992.2800 + 6411.7300 + 6411.7300 = 18815.7400$$
  *Ubicación:* Fila 1, Columna 1 del Vector Resultante.

- **Elemento $(2,1)$:**
  $$\begin{bmatrix} 385.8826 & 401.5071 & 415.8595 \end{bmatrix} \times \begin{bmatrix} 5992.2800 \\ 6411.7300 \\ 6411.7300 \end{bmatrix}$$
  $$= (385.8826 \cdot 5992.28) + (401.5071 \cdot 6411.73) + (415.8595 \cdot 6411.73)$$
  $$= 2312316.634328 + 2574355.201283 + 2666378.700885 = 7553050.5365$$
  *Ubicación:* Fila 2, Columna 1 del Vector Resultante.

- **Elemento $(3,1)$:**
  $$\begin{bmatrix} 86.2500 & 89.2500 & 91.5000 \end{bmatrix} \times \begin{bmatrix} 5992.2800 \\ 6411.7300 \\ 6411.7300 \end{bmatrix}$$
  $$= (86.25 \cdot 5992.28) + (89.25 \cdot 6411.73) + (91.50 \cdot 6411.73)$$
  $$= 516834.150000 + 572246.902500 + 586673.295000 = 1675754.3475$$
  *Ubicación:* Fila 3, Columna 1 del Vector Resultante.

- **Elemento $(4,1)$:**
  $$\begin{bmatrix} 44221.9300 & 46722.6800 & 49848.6400 \end{bmatrix} \times \begin{bmatrix} 5992.2800 \\ 6411.7300 \\ 6411.7300 \end{bmatrix}$$
  $$= (44221.93 \cdot 5992.28) + (46722.68 \cdot 6411.73) + (49848.64 \cdot 6411.73)$$
  $$= 264989781.300400 + 299573215.136400 + 319616419.847200 = 884179416.2840$$
  *Ubicación:* Fila 4, Columna 1 del Vector Resultante.

### Vector Resultante $X^T Y$:

$$X^T Y = \begin{bmatrix} 18815.7400 \\ 7553050.5365 \\ 1675754.3475 \\ 884179416.2840 \end{bmatrix}$$

---

## 7. Cálculo Final de Coeficientes ($\hat{\beta}_{\text{Ridge}} = M^{-1} \cdot X^T Y$)

Multiplicamos la matriz $M^{-1}$ ($4 \times 4$) por el vector $X^T Y$ ($4 \times 1$):

### Fila 1: Intercepto ($\beta_0$)

$$\beta_0 = (0.99981499 \cdot 18815.7400) + (-0.00580523 \cdot 7553050.5365) + (-0.00195087 \cdot 1675754.3475) + (0.00003201 \cdot 884179416.2840)$$
$$\beta_0 = 18812.2592 - 43847.1953 - 3269.1788 + 28302.3855 = \mathbf{-1.728694}$$

### Fila 2: Sensibilidad al IPC ($\beta_{\text{IPC}}$)

$$\beta_{\text{IPC}} = (-0.00580523 \cdot 18815.7400) + (0.08698925 \cdot 7553050.5365) + (-0.27292145 \cdot 1675754.3475) + (-0.00022570 \cdot 884179416.2840)$$
$$\beta_{\text{IPC}} = -109.2297 + 657034.1954 - 457349.3087 - 199555.9003 = \mathbf{19.756743}$$

### Fila 3: Sensibilidad al Dólar ($\beta_{\text{USD}}$)

$$\beta_{\text{USD}} = (-0.00195087 \cdot 18815.7400) + (-0.27292145 \cdot 7553050.5365) + (0.91810297 \cdot 1675754.3475) + (0.00059141 \cdot 884179416.2840)$$
$$\beta_{\text{USD}} = -36.7071 - 2061389.9676 + 1538515.0887 + 522914.7883 = \mathbf{3.207322}$$

### Fila 4: Sensibilidad al CCT ($\beta_{\text{CCT}}$)

$$\beta_{\text{CCT}} = (0.00003201 \cdot 18815.7400) + (-0.00022570 \cdot 7553050.5365) + (0.00059141 \cdot 1675754.3475) + (0.00000081 \cdot 884179416.2840)$$
$$\beta_{\text{CCT}} = 0.6023 - 1704.7235 + 991.0589 + 713.0211 = \mathbf{-0.041238}$$

---

## 8. Vector Estimado Final

$$\hat{\beta}_{\text{Ridge}} = \begin{bmatrix} \beta_0 \\ \beta_{\text{IPC}} \\ \beta_{\text{USD}} \\ \beta_{\text{CCT}} \end{bmatrix} = \begin{bmatrix} -1.728694 \\ 19.756743 \\ 3.207322 \\ -0.041238 \end{bmatrix}$$

---

## 9. Interpretación Económica y Funcional de los Resultados

Con los coeficientes estimados en $\hat{\beta}_{\text{Ridge}} = [-1.728694, 19.756743, 3.207322, -0.041238]^T$, el modelo de predicción para el valor de la sesión ($Y$) queda expresado como:

$$\widehat{\text{valorSesionHD}} = -1.7287 + 19.7567 \cdot \text{IPC} + 3.2073 \cdot \text{USD} - 0.0412 \cdot \text{CCT}$$

### Interpretación de los Coeficientes (Ceteris Paribus):

- **Intercepto ($\beta_0 = -1.7287$):** Es el valor matemático base del modelo cuando todas las variables explicativas son cero. En términos prácticos actúa únicamente como punto de anclaje del hiperplano de regresión.
- **Sensibilidad al IPC ($\beta_{\text{IPC}} = 19.7567$):** Manteniendo constantes el dólar y el CCT, por cada incremento de **1 unidad** en el índice de precios (IPC), el valor estimado de la sesión se incrementa en promedio **$19.76**. Es la variable de mayor peso unitario en la actualización del valor.
- **Sensibilidad al Dólar ($\beta_{\text{USD}} = 3.2073$):** Manteniendo el IPC y el CCT constantes, por cada incremento de **1 unidad** en la cotización del dólar, el valor de la sesión se incrementa en promedio **$3.21**.
- **Sensibilidad al CCT ($\beta_{\text{CCT}} = -0.0412$):** Presenta un impacto marginal levemente negativo y cercano a cero (-0.04), lo que sugiere que bajo la muestra analizada, la variación del CCT no empuja el valor de la sesión al alza por sí sola de forma significativa.

---

## 10. Interpretación del Artilugio Ridge ($\lambda I$)

1. **Resolución de la Singularidad ($n < p$):**
   
   - En este caso práctico tenemos $n = 3$ observaciones y $p = 4$ parámetros a estimar (intercepto + 3 variables).
   - En Mínimos Cuadrados Ordinarios (OLS), la matriz $X^T X$ tiene un rango máximo de 3, por lo que su determinante es $0$ ($\det(X^T X) = 0$). **Es una matriz no invertible / singular**, lo que imposibilita calcular OLS tradicional.
   - **El artilugio Ridge:** Al sumar $\lambda I_4$ (con $\lambda = 1.0$), agregamos $1.0$ a la diagonal principal. Esto garantiza que la matriz $M = X^T X + \lambda I$ sea strictly definida positiva y tenga un determinante distinto de cero ($\det(M) \approx 1.24 \times 10^{12}$), **haciendo posible la inversión**.

2. **Control de Varianza y Encogimiento (Shrinkage):**
   
   - La penalización Ridge reduce la magnitud absoluta de los coeficientes para evitar que el modelo sufra de sobreajuste (*overfitting*) con tan solo 3 datos, sacrificando un pequeño sesgo a cambio de una enorme estabilidad numérica.

---


