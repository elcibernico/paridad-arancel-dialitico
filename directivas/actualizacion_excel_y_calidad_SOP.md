# SOP: Actualización desde Excel y Toggle de Calidad (Puntos 7 a 11)

Este procedimiento operativo estándar (SOP) establece las pautas y especificaciones técnicas para la importación y procesamiento de datos de la serie histórica desde un archivo Excel, así como la inyección dinámica de incrementos por Calidad.

---

## 1. Mapeo y Normalización del Archivo Excel (`seriesData.xlsx`)

La rutina local de Node.js debe leer el archivo en `app/src/data/seriesData.xlsx` y generar `app/src/data/seriesData.json`.

### Reglas de Mapeo de Columnas:
1. **Limpieza de Cabeceras:** Limpiar los espacios de los nombres de columna en el Excel (`cleanKey(k)`).
2. **Filtrado por Resolución:** Excluir toda fila que no tenga la columna `' Resolucion '` informada.
3. **Desestimación de OS:** Ignorar la columna `'OS'`.
4. **Fechas Seriales:** Traducir la columna `Mes` (fecha serial de Excel) al formato `YYYY-MM` para `periodo` y `NombreMes Año` para `label`.
5. **Valores de Prestaciones:**
   - `' ValorSesionHD '` $\rightarrow$ `valorSesionHD`
   - `' ValorSesionHDF '` $\rightarrow$ `valorSesionHDF`
   - `' ValorMóduloDP '` $\rightarrow$ `valorModuloDP`
6. **Porcentaje de Calidad:**
   - Mapear `' PorceCalidad '` al campo `porcentajeCalidad` de forma cruda, asumiendo representación decimal (ej: `0.354`).

---

## 2. Inyección de Calidad en el Contexto Global (`GlobalContext.jsx`)

* **Parámetro:** `aplicarCalidad` (booleano).
* **Serie de Datos Procesada (`processedSeriesData`):**
  * Si `aplicarCalidad` es `true`, multiplicar las prestaciones:
    $$\text{valorSesionHD} = \text{valorSesionHD}_{crudo} \cdot (1 + \text{porcentajeCalidad})$$
    $$\text{valorSesionHDF} = \text{valorSesionHDF}_{crudo} \cdot (1 + \text{porcentajeCalidad})$$
    $$\text{valorModuloDP} = \text{valorModuloDP}_{crudo} \cdot (1 + \text{porcentajeCalidad})$$
  * Si es `false`, retornar los valores nominales crudos.

---

## 3. Integración en los Componentes

* Los componentes del Punto 7 al Punto 11 no importarán directamente `seriesData.json`.
* Consumirán `seriesData` desestructurado desde `useGlobalParams()`.
* Esto automatiza el impacto de la Calidad en todos los cálculos del simulador (MCO, Ridge, Brechas de Impacto, Recomposición Actuarial).

---

## 4. Restricciones y Entorno de Desarrollo (Windows)

* **Comando de Compilación y Automatización:** En Windows, para evitar que el sistema operativo intente abrir el archivo ejecutable wrapper `npm` como un documento de texto y dispare el diálogo emergente *"Abrir con..."*, se debe invocar siempre de forma explícita el procesador por lotes de comandos de Windows:
  ```bash
  npm.cmd run build
  ```
  De igual forma, en cualquier llamada automatizada dentro del entorno de desarrollo local, el agente utilizará `npm.cmd` o `npx.cmd` para garantizar que la ejecución sea completamente determinista y no interrumpa al usuario.
