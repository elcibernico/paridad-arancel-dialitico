import React, { useState } from 'react';
import { MathJaxFormula } from '../MathJaxFormula';

export default function Punto4({ isDarkMode }) {
  const [showBasalTable, setShowBasalTable] = useState(false);
  const [showSHRTable, setShowSHRTable] = useState(false);
  const [showFormulaExample, setShowFormulaExample] = useState(false);
  const [showHybridStructure, setShowHybridStructure] = useState(false);
  const [showIntegratedTable, setShowIntegratedTable] = useState(false);
  const [showMathFormula, setShowMathFormula] = useState(false);
  const [showConflict, setShowConflict] = useState(false);

  // Datos Tabla 1: Tasas Basales de Mortalidad Anual (por 1,000 P/AER)
  const tablaBasal = [
    { rango: '18–30 años', hdVarones: 56.1, hdMujeres: 52.5, dpVarones: 24.5, dpMujeres: 70.0, hdfLinea: 31.1 },
    { rango: '31–40 años', hdVarones: 56.5, hdMujeres: 60.3, dpVarones: 36.0, dpMujeres: 66.4, hdfLinea: 31.0 },
    { rango: '41–50 años', hdVarones: 74.8, hdMujeres: 78.8, dpVarones: 57.7, dpMujeres: 131.6, hdfLinea: 49.7 },
    { rango: '51–60 años', hdVarones: 120.2, hdMujeres: 105.0, dpVarones: 118.8, dpMujeres: 113.0, hdfLinea: 96.6 },
    { rango: '61–70 años', hdVarones: 179.3, hdMujeres: 164.6, dpVarones: 92.7, dpMujeres: 166.4, hdfLinea: 141.9 },
    { rango: '71–80 años', hdVarones: 272.8, hdMujeres: 266.4, dpVarones: 157.1, dpMujeres: 306.5, hdfLinea: 214.2 },
    { rango: '>80 años', hdVarones: 403.9, hdMujeres: 405.7, dpVarones: 228.8, dpMujeres: 533.6, hdfLinea: 320.2 },
  ];

  // Datos Tabla 2: Multiplicadores de Riesgo (SHR) por Comorbilidad Principal
  const tablaSHR = [
    { comorbilidad: 'Glomerulonefritis (Basal)', shrHD: 1.000, shrDP: 1.000, shrHDF: 1.000 },
    { comorbilidad: 'Nefropatía Diabética (DBT)', shrHD: 1.339, shrDP: 1.565, shrHDF: 1.553 },
    { comorbilidad: 'Enfermedad Vascular Periférica (EVP)', shrHD: 1.129, shrDP: 1.327, shrHDF: 1.461 },
    { comorbilidad: 'Enfermedad Cerebrovascular (ECV)', shrHD: 1.200, shrDP: 1.510, shrHDF: 1.089 },
    { comorbilidad: 'Insuficiencia Cardíaca Congestiva (ICC)', shrHD: 1.160, shrDP: 2.113, shrHDF: 1.203 },
    { comorbilidad: 'Arritmia Cardíaca al Ingreso', shrHD: 1.174, shrDP: 1.213, shrHDF: 1.133 },
    { comorbilidad: 'Neoplasia Activa (últimos 5 años)', shrHD: 1.609, shrDP: 1.181, shrHDF: 1.441 },
    { comorbilidad: 'Albuminemia Inicial < 3.5 g/dL', shrHD: 1.475, shrDP: 1.553, shrHDF: 1.828 },
    { comorbilidad: 'Hematocrito Inicial < 27%', shrHD: 1.044, shrDP: 1.200, shrHDF: 1.044 },
    { comorbilidad: 'HIV Positivo al Ingreso', shrHD: 1.669, shrDP: 2.125, shrHDF: 1.690 },
    { comorbilidad: 'HBsAg Positivo (Hepatitis B)', shrHD: 1.167, shrDP: 2.582, shrHDF: 1.167 },
  ];

  // Datos Tabla 3: Tabla de Mortalidad Integrada (5 Años) EXPRESADA 100% EN TANTO POR UNO
  const tablaIntegrada = [
    { t: 'Año 1 (t=1)', perfA: 'q=0.0748 | p=0.9252', perfB: 'q=0.1758 | p=0.8242', perfC: 'q=0.2503 | p=0.7497', perfD: 'q=0.3348 | p=0.6652' },
    { t: 'Año 2 (t=2)', perfA: 'q=0.0777 | p=0.8533', perfB: 'q=0.1824 | p=0.6739', perfC: 'q=0.2619 | p=0.5534', perfD: 'q=0.3501 | p=0.4323' },
    { t: 'Año 3 (t=3)', perfA: 'q=0.0807 | p=0.7844', perfB: 'q=0.1893 | p=0.5463', perfC: 'q=0.2731 | p=0.4023', perfD: 'q=0.3659 | p=0.2741' },
    { t: 'Año 4 (t=4)', perfA: 'q=0.0839 | p=0.7186', perfB: 'q=0.1963 | p=0.4391', perfC: 'q=0.2849 | p=0.2877', perfD: 'q=0.3823 | p=16.93%' },
    { t: 'Año 5 (t=5)', perfA: 'q=0.0872 | p=0.6559', perfB: 'q=0.2037 | p=0.3497', perfC: 'q=0.2968 | p=0.2023', perfD: 'q=0.3992 | p=0.1017' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Encabezado del Punto 4 */}
      <div className={`border-b pb-4 border-slate-300 dark:border-slate-800`}>
        <span className={`text-xs font-black uppercase tracking-wider text-teal-800 dark:text-teal-400`}>
          Punto 4 • La Tabla Actuarial Híbrida
        </span>
        <h3 className={`text-3xl sm:text-4xl font-black mt-1 text-slate-950 dark:text-white`}>
          La Tabla Actuarial Híbrida de Diálisis en Argentina (SINTRA / INCUCAI / SAN 2024)
        </h3>
        <p className={`text-base sm:text-lg mt-2 leading-relaxed text-slate-800 font-normal dark:text-slate-300`}>
          Para salvar la falta de aplicabilidad de las tablas poblacionales generales, construimos una <strong>Tabla Actuarial Híbrida</strong> segregada por modalidad (Hemodiálisis, Diálisis Peritoneal, HDF) y ajustada mediante los multiplicadores de riesgo de Fine y Gray del Registro Argentino.
        </p>
      </div>

      {/* Botones de Control de Revelado Interactivos (6 Apartados) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        <button
          onClick={() => setShowBasalTable(!showBasalTable)}
          className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between ${showBasalTable ? 'bg-teal-50 border-teal-600 text-slate-900 shadow-md ring-2 ring-teal-600 dark:bg-teal-500/20 dark:border-teal-500 dark:text-teal-300' : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white'}`}
        >
          <span className="flex items-center gap-1">
            <span>1. Tasas Basales</span>
            <MathJaxFormula formula="q_{x,0}" className="inline-block text-xs font-serif" />
          </span>
          <span>{showBasalTable ? '👁️' : '🙈'}</span>
        </button>

        <button
          onClick={() => setShowSHRTable(!showSHRTable)}
          className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between ${showSHRTable ? 'bg-cyan-50 border-cyan-600 text-slate-900 shadow-md ring-2 ring-cyan-600 dark:bg-cyan-500/20 dark:border-cyan-500 dark:text-cyan-300' : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white'}`}
        >
          <span>2. Multiplicadores SHR</span>
          <span>{showSHRTable ? '👁️' : '🙈'}</span>
        </button>

        <button
          onClick={() => setShowFormulaExample(!showFormulaExample)}
          className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between ${showFormulaExample ? 'bg-amber-50 border-amber-600 text-slate-950 shadow-md ring-2 ring-amber-600 dark:bg-amber-500/20 dark:border-amber-500 dark:text-amber-300' : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white'}`}
        >
          <span>3. Fórmula y Ejemplo</span>
          <span>{showFormulaExample ? '👁️' : '🙈'}</span>
        </button>

        <button
          onClick={() => setShowHybridStructure(!showHybridStructure)}
          className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between ${showHybridStructure ? 'bg-blue-50 border-blue-600 text-slate-900 shadow-md ring-2 ring-blue-600 dark:bg-blue-500/20 dark:border-blue-500 dark:text-blue-300' : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white'}`}
        >
          <span>4. Estructura Híbrida</span>
          <span>{showHybridStructure ? '👁️' : '🙈'}</span>
        </button>

        <button
          onClick={() => setShowIntegratedTable(!showIntegratedTable)}
          className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between ${showIntegratedTable ? 'bg-purple-50 border-purple-600 text-slate-900 shadow-md ring-2 ring-purple-600 dark:bg-purple-500/20 dark:border-purple-500 dark:text-purple-300' : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white'}`}
        >
          <span>5. Tabla Integrada</span>
          <span>{showIntegratedTable ? '👁️' : '🙈'}</span>
        </button>

        <button
          onClick={() => setShowConflict(!showConflict)}
          className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between ${showConflict ? 'bg-rose-50 border-rose-600 text-slate-950 shadow-md ring-2 ring-rose-600 dark:bg-rose-500/20 dark:border-rose-500 dark:text-rose-300' : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white'}`}
        >
          <span>6. ¿Conflicto Final?</span>
          <span>{showConflict ? '👁️' : '🙈'}</span>
        </button>
      </div>

      {/* APARTADO 1: TABLA DE TASAS BASALES CON MATHJAX FORMULA RENDERIZADO */}
      {showBasalTable && (
        <div className={`p-5 rounded-2xl border transition-all bg-teal-50/60 border-teal-500 text-slate-800 font-normal dark:bg-slate-950 dark:border-teal-500/30 dark:text-slate-300`}>
          <h4 className={`text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2 flex-wrap text-teal-950 dark:text-teal-400`}>
            <span>📊 1. Tasas Basales de Mortalidad Anual</span>
            <MathJaxFormula formula="q_{x,0}" className="inline-block text-base font-serif text-teal-400 dark:text-teal-300" />
            <span>por Modalidad en Argentina</span>
          </h4>
          <p className="text-xs mb-3 leading-relaxed">
            Tasas calculadas por 1,000 personas-año en riesgo (P/AER) para el bienio de estabilidad epidemiológica 2023-2024 (Fuente: SINTRA / INCUCAI / SAN).
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800 dark:text-slate-300">
              <thead className={`font-bold uppercase bg-teal-100 text-slate-900 dark:bg-slate-900 dark:text-teal-400`}>
                <tr>
                  <th className="p-2.5">Rango de Edad</th>
                  <th className="p-2.5">Varones HD</th>
                  <th className="p-2.5">Mujeres HD</th>
                  <th className="p-2.5">Varones DP</th>
                  <th className="p-2.5">Mujeres DP</th>
                  <th className="p-2.5">HDF en Línea</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-semibold">
                {tablaBasal.map((row, idx) => (
                  <tr key={idx} className="hover:bg-teal-100/40 bg-white dark:hover:bg-slate-900/50">
                    <td className="p-2.5 font-bold text-slate-900 dark:text-white">{row.rango}</td>
                    <td className="p-2.5 text-teal-700 dark:text-teal-400">{row.hdVarones} ‰</td>
                    <td className="p-2.5 text-teal-700 dark:text-teal-400">{row.hdMujeres} ‰</td>
                    <td className="p-2.5 text-cyan-700 dark:text-cyan-400">{row.dpVarones} ‰</td>
                    <td className="p-2.5 text-cyan-700 dark:text-cyan-400">{row.dpMujeres} ‰</td>
                    <td className="p-2.5 text-emerald-800 dark:text-emerald-400 font-bold">{row.hdfLinea} ‰</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* APARTADO 2: MATRIZ DE MULTIPLICADORES SHR POR COMORBILIDAD RENDERIZADOS CON MATHJAX */}
      {showSHRTable && (
        <div className={`p-5 rounded-2xl border transition-all bg-cyan-50/60 border-cyan-500 text-slate-800 font-normal dark:bg-slate-950 dark:border-cyan-500/30 dark:text-slate-300`}>
          <h4 className={`text-sm font-bold uppercase tracking-wider mb-2 text-cyan-950 dark:text-cyan-400`}>
            🧬 2. Matriz Actuarial de Multiplicadores de Riesgo (SHR de Fine y Gray)
          </h4>
          <p className="text-xs mb-3 leading-relaxed">
            Hazard Ratios de sub-distribución (SHR) ajustados para la cohorte incidente argentina (2018-2024) para escalar las tasas basales según la patología de base del paciente.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800 dark:text-slate-300">
              <thead className={`font-bold uppercase bg-cyan-100 text-slate-900 dark:bg-slate-900 dark:text-cyan-400`}>
                <tr>
                  <th className="p-2.5">Comorbilidad Principal / Factor de Riesgo</th>
                  <th className="p-2.5">Multiplicador HD (<MathJaxFormula formula="SHR_{HD}" className="inline-block text-xs font-serif" />)</th>
                  <th className="p-2.5">Multiplicador DP (<MathJaxFormula formula="SHR_{DP}" className="inline-block text-xs font-serif" />)</th>
                  <th className="p-2.5">Multiplicador HDF (<MathJaxFormula formula="SHR_{HDF}" className="inline-block text-xs font-serif" />)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-semibold">
                {tablaSHR.map((row, idx) => (
                  <tr key={idx} className="hover:bg-cyan-100/40 bg-white dark:hover:bg-slate-900/50">
                    <td className="p-2.5 font-bold text-slate-900 dark:text-white">{row.comorbilidad}</td>
                    <td className="p-2.5 text-teal-700 dark:text-teal-400">×{row.shrHD}</td>
                    <td className="p-2.5 text-cyan-700 dark:text-cyan-400">×{row.shrDP}</td>
                    <td className="p-2.5 text-emerald-800 dark:text-emerald-400 font-bold">×{row.shrHDF}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* APARTADO 3: FÓRMULA DE AJUSTE Y EJEMPLO PRÁCTICO */}
      {showFormulaExample && (
        <div className={`p-5 rounded-2xl border transition-all bg-amber-50/60 border-amber-500 text-slate-800 font-normal dark:bg-slate-950 dark:border-amber-500/30 dark:text-slate-300`}>
          <div className="flex items-center justify-between">
            <h4 className={`text-sm font-bold uppercase tracking-wider text-amber-950 dark:text-amber-400`}>
              🧮 3. Ajuste Actuarial de Probabilidades y Ejemplo Práctico
            </h4>
            <button
              onClick={() => setShowMathFormula(!showMathFormula)}
              className={`text-xs px-2.5 py-1 rounded font-bold border transition bg-amber-800 text-white border-amber-900 hover:bg-amber-900 dark:bg-slate-800 dark:text-amber-300 dark:border-amber-500/30 dark:hover:bg-slate-700`}
            >
              {showMathFormula ? 'Ocultar Ecuaciones' : 'Mostrar Ecuaciones MathJax'}
            </button>
          </div>

          {showMathFormula && (
            <div className={`p-4 rounded-xl border mt-3 space-y-3 text-xs bg-white border-amber-300 shadow-sm text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300`}>
              <span className="font-bold text-amber-600 dark:text-amber-400">Fórmula de Ajuste por Escala Acumulada de Comorbilidades:</span>
              <MathJaxFormula display={true} formula="q_{x, \text{ajustado}} = 1 - (1 - q_{x,0})^{\prod_k SHR_k}" />
              <div className="pl-3 border-l-2 border-amber-500/40 text-xs leading-relaxed space-y-1">
                <span className="font-bold">donde:</span>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li><MathJaxFormula formula="q_{x,0}" />: Tasa de mortalidad basal anual extraída de la Tabla 1 para la edad y sexo del paciente.</li>
                  <li><MathJaxFormula formula="\prod_k SHR_k" />: Producto acumulado de los multiplicadores Hazard Ratio de sub-distribución (Tabla 2) correspondientes a cada diagnóstico clínico.</li>
                </ul>
              </div>
            </div>
          )}

          {/* EJEMPLO DESGLOSADO PASO A PASO CON DIVS SEPARADOS */}
          <div className="space-y-3 mt-4">
            
            {/* Div Superior: Perfil del Paciente */}
            <div className={`p-4 rounded-xl border text-xs bg-white border-amber-200 shadow-sm dark:bg-slate-900 dark:border-slate-800`}>
              <h5 className="font-bold text-amber-600 dark:text-amber-400 mb-1">📌 Caso de Estudio: Paciente Varón de 55 Años en Hemodiálisis (HD)</h5>
              <p className="leading-relaxed">
                El paciente ingresa al sistema argentino con diagnóstico primario de <strong>Nefropatía Diabética</strong> y <strong>Enfermedad Vascular Periférica (EVP)</strong>.
              </p>
            </div>

            {/* Div Inferior: Desarrollo del Cálculo */}
            <div className={`p-4 rounded-xl border space-y-2 text-xs bg-amber-100/60 border-amber-300 text-slate-900 font-medium dark:bg-slate-900/90 dark:border-amber-500/30`}>
              <div className="font-bold text-amber-800 dark:text-amber-300">Desarrollo Secuencial del Ajuste Actuarial:</div>
              <ul className="space-y-1.5 pl-2">
                <li>• <strong>Tasa Basal (Tabla 1):</strong> Varón HD (51-60 años) con una tasa de 120.2 por 1,000 es equivalente a <MathJaxFormula formula="q_{55,0} = 0.1202" /> (12.02% anual).</li>
                <li>• <strong>Multiplicadores SHR (Tabla 2):</strong> Nefropatía Diabética (<MathJaxFormula formula="\times 1.339" />) y EVP (<MathJaxFormula formula="\times 1.129" />).</li>
                <li>• <strong>Factor de Escala Acumulado:</strong> <MathJaxFormula formula="1.339 \times 1.129 = 1.5117" />.</li>
                <li className="font-bold text-rose-700 dark:text-rose-400">• <strong>Probabilidad Anual Ajustada Final:</strong> <MathJaxFormula formula="q_{55, \text{ajustado}} = 1 - (1 - 0.1202)^{1.5117} = 0.1758" /> anual (tanto por uno).</li>
              </ul>
            </div>

          </div>
        </div>
      )}

      {/* APARTADO 4: ESTRUCTURA HÍBRIDA DE LA TABLA (MENSUAL AÑO 1 vs ANUAL AÑO 2 EN ADELANTE) */}
      {showHybridStructure && (
        <div className={`p-5 rounded-2xl border transition-all bg-blue-50/60 border-blue-500 text-slate-800 font-normal dark:bg-slate-950 dark:border-blue-500/30 dark:text-slate-300`}>
          <h4 className={`text-sm font-bold uppercase tracking-wider mb-2 text-blue-950 dark:text-blue-400`}>
            📐 4. La Estructura Híbrida de la Tabla Actuarial: Periodicidad Mensual y Anual
          </h4>
          
          <p className="text-base sm:text-lg leading-relaxed mt-1">
            Para la estructuración práctica de las tablas de mortalidad actuariales en diálisis y el cálculo del Valor Actual Actuarial de Diálisis (VAAD), la tabla se divide en dos fases temporales con periodicidades biométricas y financieras diferenciadas:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            
            {/* Fase 1: Periodicidad Mensual (Meses 1 a 12) */}
            <div className={`p-4 rounded-xl border text-xs space-y-2 bg-white border-blue-300 shadow-sm dark:bg-slate-900 dark:border-slate-800`}>
              <div className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400">
                <span className="text-base">📅</span>
                <h5>Fase 1: Primer Año de Tratamiento (Meses 1 a 12)</h5>
              </div>
              <p className="leading-relaxed">
                <strong>Periodicidad Biométrica y Financiera Mensual:</strong> Se desglosa mes a mes (<MathJaxFormula formula="t = 1, 2, \dots, 12" />) debido a la altísima volatilidad de la mortalidad inicial, las complicaciones de ingreso, la estabilización del acceso vascular y el período de mayor tasa de abandono o adaptación.
              </p>
              <div className={`p-2.5 rounded-lg border text-xs font-semibold bg-blue-100/70 border-blue-300 text-blue-950 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-300`}>
                💡 Permite evaluar el flujo financiero mensual inicial y la tasa de falla temprana de la técnica.
              </div>
            </div>

            {/* Fase 2: Periodicidad Anual (Mes 13 / Año 2 en adelante) */}
            <div className={`p-4 rounded-xl border text-xs space-y-2 bg-white border-blue-300 shadow-sm dark:bg-slate-900 dark:border-slate-800`}>
              <div className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400">
                <span className="text-base">📆</span>
                <h5>Fase 2: Segundo Año en Adelante (Mes 13+ / Año 2+)</h5>
              </div>
              <p className="leading-relaxed">
                <strong>Periodicidad Biométrica y Financiera Anual:</strong> A partir del mes 13 (año 2 inclusive en adelante), la probabilidad de supervivencia y las tasas de transición se estabilizan, permitiendo agrupar la tabla en períodos anuales (<MathJaxFormula formula="t = 2, 3, \dots, N" />).
              </p>
              <div className={`p-2.5 rounded-lg border text-xs font-semibold bg-blue-100/70 border-blue-300 text-blue-950 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-300`}>
                💡 Agiliza el cálculo estocástico de largo plazo y el descuento financiero de los flujos de reserva.
              </div>
            </div>

          </div>

          {/* Cuadro de resumen metodológico */}
          <div className={`p-3 rounded-xl border mt-4 text-xs font-semibold bg-white border-blue-300 text-blue-950 shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:text-blue-300`}>
            📌 <strong>Regla Actuarial Híbrida:</strong> Tabla Mensualizada para <MathJaxFormula formula="t \in [1, 12]" /> meses + Tabla Anualizada para <MathJaxFormula formula="t \ge 2" /> años.
          </div>
        </div>
      )}

      {/* APARTADO 5: TABLA DE MORTALIDAD INTEGRADA (5 AÑOS) 100% EN TANTO POR UNO */}
      {showIntegratedTable && (
        <div className={`p-5 rounded-2xl border transition-all bg-purple-50/60 border-purple-500 text-slate-800 font-normal dark:bg-slate-950 dark:border-purple-500/30 dark:text-slate-300`}>
          <h4 className={`text-sm font-bold uppercase tracking-wider mb-2 text-purple-950 dark:text-purple-400`}>
            📈 5. Tabla de Mortalidad Actuarial Integrada para 4 Perfiles Típicos (Primeros 5 Años en Tanto por Uno)
          </h4>
          <p className="text-xs mb-3 leading-relaxed">
            Muestra la evolución acumulada en tanto por uno de la mortalidad anual (<MathJaxFormula formula="q_{x+t}" />) y la supervivencia remanente (<MathJaxFormula formula="p_x" />) aplicando los incrementos paramétricos del Registro Argentino.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800 dark:text-slate-300">
              <thead className={`font-bold uppercase bg-purple-100 text-slate-900 dark:bg-slate-900 dark:text-purple-300`}>
                <tr>
                  <th className="p-2.5">Año de Tratamiento</th>
                  <th className="p-2.5">Perfil A<br /><span className="text-xs text-teal-600 font-normal">Varón 45a, HD Sano</span></th>
                  <th className="p-2.5">Perfil B<br /><span className="text-xs text-amber-600 font-normal">Varón 55a, HD Diabético+EVP</span></th>
                  <th className="p-2.5">Perfil C<br /><span className="text-xs text-cyan-600 font-normal">Mujer 65a, DP Diabética</span></th>
                  <th className="p-2.5">Perfil D<br /><span className="text-xs text-purple-600 font-normal">Mujer 72a, HDF Diabética+ECV</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-semibold">
                {tablaIntegrada.map((row, idx) => (
                  <tr key={idx} className="hover:bg-purple-100/40 bg-white dark:hover:bg-slate-900/50">
                    <td className="p-2.5 font-bold text-slate-900 dark:text-white">{row.t}</td>
                    <td className="p-2.5 text-teal-700 dark:text-teal-400">{row.perfA}</td>
                    <td className="p-2.5 text-amber-700 dark:text-amber-400">{row.perfB}</td>
                    <td className="p-2.5 text-cyan-700 dark:text-cyan-400">{row.perfC}</td>
                    <td className="p-2.5 text-purple-700 dark:text-purple-400">{row.perfD}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* APARTADO 6: EL CONFLICTO FINAL QUE DISPARA EL PUNTO 5 */}
      {showConflict && (
        <div className={`p-5 rounded-2xl border transition-all bg-rose-50/60 border-rose-500 text-slate-800 font-normal dark:bg-slate-950 dark:border-rose-500/30 dark:text-slate-300`}>
          <h4 className={`text-sm font-bold uppercase tracking-wider text-rose-950 dark:text-rose-400`}>🔥 6. El Nuevo Conflicto Disparador</h4>
          <p className="text-base sm:text-lg leading-relaxed mt-1">
            Contamos con la tabla actuarial ajustada para la Argentina, pero <strong>¿cómo traducimos estas probabilidades de supervivencia en la masa de dinero concreta del pasivo financiero (VAAD)?</strong>
          </p>
          <div className={`p-3 rounded-xl border mt-2 text-xs font-bold bg-rose-100 border-rose-300 text-rose-950 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-200`}>
            👉 Próximo paso (Punto 5): La Ecuación Financiera de Valoración del VAAD.
          </div>
        </div>
      )}

    </div>
  );
}
