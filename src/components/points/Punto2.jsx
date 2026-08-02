import React, { useState } from 'react';
import { MathJaxFormula } from '../MathJaxFormula';

export default function Punto2({ isDarkMode }) {
  const [showProblem, setShowProblem] = useState(false);
  const [showMethod, setShowMethod] = useState(false);
  const [showComparisonTable, setShowComparisonTable] = useState(false);
  const [showReservesImpact, setShowReservesImpact] = useState(false);
  const [showMathFormula, setShowMathFormula] = useState(false);
  const [showConflict, setShowConflict] = useState(false);

  const data = [
    { plazo: 'Inicio (0 Meses)', km: '100%', cif: '100%', error: 'Sin error inicial' },
    { plazo: '1 Año (12 Meses)', km: '88%', cif: '91%', error: 'Subestima la supervivencia en 3%' },
    { plazo: '2 Años (24 Meses)', km: '76%', cif: '82%', error: 'Subestima la supervivencia en 6%' },
    { plazo: '3 Años (36 Meses)', km: '65%', cif: '74%', error: 'Subestima la supervivencia en 9%' },
    { plazo: '4 Años (48 Meses)', km: '54%', cif: '65%', error: 'Subestima la supervivencia en 11%' },
    { plazo: '5 Años (60 Meses)', km: '42.6%', cif: '54.0%', error: 'Subestima la supervivencia en 11.4%' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Título y Hilo Narrativo */}
      <div className={`border-b pb-4 border-slate-300 dark:border-slate-800`}>
        <span className={`text-sm font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400`}>
          Punto 2 • El Sesgo Biométrico
        </span>
        <h3 className={`text-3xl sm:text-4xl font-extrabold mt-1 text-slate-900 dark:text-white`}>
          El Error de Kaplan-Meier: Sobreestimación del Riesgo
        </h3>
      </div>

      {/* Botones de Control de Revelado Interactivos (5 Apartados) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        <button
          onClick={() => setShowProblem(!showProblem)}
          className={`p-3 rounded-xl border text-sm font-bold transition flex items-center justify-between ${showProblem ? 'bg-rose-50 border-rose-500 text-slate-900 shadow-md ring-2 ring-rose-500 dark:bg-rose-500/20 dark:border-rose-500 dark:text-rose-300' : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white'}`}
        >
          <span>1. ¿El Problema?</span>
          <span>{showProblem ? '👁️' : '🙈'}</span>
        </button>

        <button
          onClick={() => setShowMethod(!showMethod)}
          className={`p-3 rounded-xl border text-sm font-bold transition flex items-center justify-between ${showMethod ? 'bg-teal-50 border-teal-500 text-slate-900 shadow-md ring-2 ring-teal-500 dark:bg-teal-500/20 dark:border-teal-500 dark:text-teal-300' : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white'}`}
        >
          <span>2. ¿La Solución?</span>
          <span>{showMethod ? '👁️' : '🙈'}</span>
        </button>

        <button
          onClick={() => setShowComparisonTable(!showComparisonTable)}
          className={`p-3 rounded-xl border text-sm font-bold transition flex items-center justify-between ${showComparisonTable ? 'bg-emerald-50 border-emerald-500 text-slate-900 shadow-md ring-2 ring-emerald-500 dark:bg-emerald-500/20 dark:border-emerald-500 dark:text-emerald-300' : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white'}`}
        >
          <span>3. Ver Desviación (+11.4%)</span>
          <span>{showComparisonTable ? '👁️' : '🙈'}</span>
        </button>

        <button
          onClick={() => setShowReservesImpact(!showReservesImpact)}
          className={`p-3 rounded-xl border text-sm font-bold transition flex items-center justify-between ${showReservesImpact ? 'bg-purple-50 border-purple-500 text-slate-900 shadow-md ring-2 ring-purple-500 dark:bg-purple-500/20 dark:border-purple-500 dark:text-purple-300' : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white'}`}
        >
          <span>4. Subestimación de Reservas</span>
          <span>{showReservesImpact ? '👁️' : '🙈'}</span>
        </button>

        <button
          onClick={() => setShowConflict(!showConflict)}
          className={`p-3 rounded-xl border text-sm font-bold transition flex items-center justify-between ${showConflict ? 'bg-amber-50 border-amber-600 text-slate-950 shadow-md ring-2 ring-amber-600 dark:bg-amber-500/20 dark:border-amber-500 dark:text-amber-300' : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white'}`}
        >
          <span>5. ¿El Conflicto Final?</span>
          <span>{showConflict ? '👁️' : '🙈'}</span>
        </button>
      </div>

      {/* APARTADO 1: EL PROBLEMA */}
      {showProblem && (
        <div className={`p-5 rounded-2xl border transition-all bg-rose-50/60 border-rose-500 text-slate-800 font-normal dark:bg-slate-950 dark:border-rose-500/30 dark:text-slate-300`}>
          <h4 className={`text-base font-bold uppercase tracking-wider text-rose-900 dark:text-rose-400`}>⚠️ 1. El Problema Biométrico</h4>
          <p className="text-sm sm:text-base leading-relaxed mt-1">
            Las estadísticas médicas tradicionales aplican el método de <strong>Kaplan-Meier</strong> tratando el Trasplante Renal como si fuera una "censura independiente" (igual que un paciente que abandona el estudio o se cambia de clínica). Esto asume falsamente que el paciente trasplantado mantiene el mismo riesgo de morir en diálisis que quienes continúan en tratamiento.
          </p>
        </div>
      )}

      {/* APARTADO 2: LA SOLUCIÓN Y FÓRMULAS CON COLOR AMARILLO UNIFICADO PARA KM */}
      {showMethod && (
        <div className={`p-5 rounded-2xl border transition-all bg-teal-50/60 border-teal-500 text-slate-800 font-normal dark:bg-slate-950 dark:border-teal-500/30 dark:text-slate-300`}>
          <div className="flex items-center justify-between">
            <h4 className={`text-sm font-bold uppercase tracking-wider text-teal-900 dark:text-teal-400`}>💡 2. La Solución: Función de Incidencia Acumulada</h4>
            <button
              onClick={() => setShowMathFormula(!showMathFormula)}
              className={`text-xs px-2.5 py-1 rounded font-bold border transition bg-teal-700 text-white border-teal-800 hover:bg-teal-800 dark:bg-slate-800 dark:text-teal-300 dark:border-teal-500/30 dark:hover:bg-slate-700`}
            >
              {showMathFormula ? 'Ocultar Ecuaciones' : 'Mostrar Ecuaciones MathJax'}
            </button>
          </div>

          <p className="text-xs sm:text-sm leading-relaxed mt-2">
            Se debe utilizar la <strong>Función de Incidencia Acumulada</strong> bajo riesgos competitivos (modelo de Fine y Gray), reconociendo que el trasplante elimina permanentemente la posibilidad de morir bajo tratamiento dialítico.
          </p>

          {showMathFormula && (
            <div className={`p-5 rounded-xl border mt-3 space-y-6 text-xs bg-white border-teal-200 shadow-sm text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300`}>
              
              {/* Ecuación 1: Kaplan-Meier (Unificada a Amarillo) */}
              <div className="space-y-2">
                <span className="font-bold text-amber-500 dark:text-amber-400">Ecuación de Kaplan-Meier (Sesgada):</span>
                <MathJaxFormula 
                  display={true} 
                  className="block text-center my-3 text-amber-400 dark:text-amber-400 font-serif text-lg" 
                  formula="\hat{S}_{KM}(t) = \prod_{t_i \le t} \left( 1 - \frac{d_i}{n_i} \right)" 
                />
                
                <div className="pl-3 border-l-2 border-amber-500/40 text-[11px] leading-relaxed space-y-1">
                  <span className="font-bold text-amber-500 dark:text-amber-400">donde:</span>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>
                      <MathJaxFormula className="inline-block text-amber-400 font-serif px-0.5" formula="\hat{S}_{KM}(t)" />: Probabilidad estimada de sobrevida hasta el tiempo <MathJaxFormula className="inline-block text-amber-400 font-serif px-0.5" formula="t" /> bajo supuestos de censura independiente.
                    </li>
                    <li>
                      <MathJaxFormula className="inline-block text-amber-400 font-serif px-0.5" formula="t_i" />: Instante de tiempo discreto ordenado donde ocurre al menos un fallecimiento (<MathJaxFormula className="inline-block text-amber-400 font-serif px-0.5" formula="t_1 < t_2 < \dots < t_i" />).
                    </li>
                    <li>
                      <MathJaxFormula className="inline-block text-amber-400 font-serif px-0.5" formula="d_i" />: Número exacto de muertes ocurridas en el intervalo de tiempo <MathJaxFormula className="inline-block text-amber-400 font-serif px-0.5" formula="t_i" />.
                    </li>
                    <li>
                      <MathJaxFormula className="inline-block text-amber-400 font-serif px-0.5" formula="n_i" />: Número total de pacientes vivos y "en riesgo" presentes inmediatamente antes del instante <MathJaxFormula className="inline-block text-amber-400 font-serif px-0.5" formula="t_i" /> (incluye erróneamente a los trasplantados como censuras no informativas).
                    </li>
                  </ul>
                </div>
              </div>

              {/* Ecuación 2: CIF Fine & Gray (Manteniendo Teal) */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-bold text-teal-600 dark:text-teal-400">Ecuación de la Función de Incidencia Acumulada (Fine y Gray):</span>
                <MathJaxFormula display={true} formula="CIF_k(t) = \int_0^t S(u^-) \cdot dH_k(u)" />
                
                <div className="pl-3 border-l-2 border-teal-500/40 text-[11px] leading-relaxed space-y-1">
                  <span className="font-bold text-teal-600 dark:text-teal-400">donde:</span>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li><MathJaxFormula formula="CIF_k(t)" />: Función de Incidencia Acumulada o probabilidad absoluta de experimentar la muerte en diálisis antes del tiempo <MathJaxFormula formula="t" />.</li>
                    <li><MathJaxFormula formula="S(u^-)" />: Probabilidad de sobrevivencia global de la cohorte libre de todos los eventos competitivos combinados justo en el instante inmediatamente anterior a <MathJaxFormula formula="u" />.</li>
                    <li><MathJaxFormula formula="dH_k(u)" />: Incremento en la tasa de falla acumulada subdistributiva para la causa específica en el instante <MathJaxFormula formula="u" />.</li>
                    <li><MathJaxFormula formula="k" />: Causa de salida de interés (<MathJaxFormula formula="k=1" /> para Muerte en Diálisis, compitiendo contra <MathJaxFormula formula="k=2" /> para Trasplante Renal Activo).</li>
                  </ul>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* APARTADO 3: LA TABLA DE DESVIACIONES TOTALMENTE CLARA Y SIN ABREVIATURAS */}
      {showComparisonTable && (
        <div className={`p-5 rounded-2xl border transition-all bg-emerald-50/60 border-emerald-500 text-slate-800 font-normal dark:bg-slate-950 dark:border-emerald-500/30 dark:text-slate-300`}>
          <h4 className={`text-sm font-bold uppercase tracking-wider mb-2 text-emerald-950 dark:text-emerald-400`}>
            📊 3. Comparación de Supervivencia: Método Sesgado vs. Método Real (Argentina)
          </h4>
          <p className="text-xs mb-3 text-slate-600 dark:text-slate-400">
            Se compara la estimación del porcentaje de pacientes sobrevivientes a lo largo de 5 años. El método tradicional de Kaplan-Meier subestima sistemáticamente la supervivencia real observada en el Registro Argentino de Diálisis Crónica.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800 dark:text-slate-300">
              <thead className={`font-bold uppercase bg-emerald-100 text-slate-900 dark:bg-slate-900 dark:text-teal-400`}>
                <tr>
                  <th className="p-2.5">Plazo Evaluado</th>
                  <th className="p-2.5">Supervivencia Sesgada<br /><span className="text-[10px] text-amber-500 font-normal">(Método Kaplan-Meier)</span></th>
                  <th className="p-2.5">Supervivencia Real<br /><span className="text-[10px] text-emerald-500 font-normal">(Función de Incidencia Acumulada)</span></th>
                  <th className="p-2.5">Distorsión del Método Sesgado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-semibold">
                {data.map((row, index) => (
                  <tr key={index} className="hover:bg-emerald-100/40 bg-white dark:hover:bg-slate-900/50">
                    <td className="p-2.5 font-bold text-slate-900 dark:text-white">{row.plazo}</td>
                    <td className="p-2.5 text-amber-700 dark:text-amber-400">{row.km} de pacientes vivos</td>
                    <td className="p-2.5 text-emerald-800 dark:text-emerald-400 font-bold">{row.cif} de pacientes vivos</td>
                    <td className="p-2.5 text-rose-700 dark:text-rose-400 font-bold">{row.error}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* APARTADO 4: IMPACTO EN RESERVAS CON LOS 6 TEXTOS PROFESIONALES REVISADOS */}
      {showReservesImpact && (
        <div className={`p-5 rounded-2xl border transition-all bg-purple-50/60 border-purple-500 text-slate-800 font-normal dark:bg-slate-950 dark:border-purple-500/30 dark:text-slate-300`}>
          <h4 className={`text-sm font-bold uppercase tracking-wider text-purple-900 dark:text-purple-400`}>
            📉 4. El Impacto Financiero: Subestimación de la Reserva Matemática
          </h4>
          
          <p className="text-xs sm:text-sm leading-relaxed mt-2">
            Al asumir que un paciente trasplantado o que haya recuperado su función renal opera como una simple censura convencional, el modelo ignora que este no ha fallecido y que existe la probabilidad real de que reingrese a diálisis.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div className={`p-4 rounded-xl border text-xs space-y-1 bg-white border-purple-200 shadow-sm dark:bg-slate-900 dark:border-slate-800`}>
              <h5 className={`font-bold text-purple-900 dark:text-purple-300`}>
                1. Acortamiento Artificial del Horizonte
              </h5>
              <p className="text-slate-700 dark:text-slate-400">
                Al asumir falsamente que la cohorte morirá más rápido de lo que ocurre en la realidad clínica, la probabilidad de supervivencia complementaria se reduce artificialmente. Esto acorta el horizonte temporal proyectado, estimando una <strong>menor cantidad de flujos de fondos erogables futuros</strong>.
              </p>
            </div>

            <div className={`p-4 rounded-xl border text-xs space-y-1 bg-white border-purple-200 shadow-sm dark:bg-slate-900 dark:border-slate-800`}>
              <h5 className={`font-bold text-purple-900 dark:text-purple-300`}>
                2. Subestimación de la Reserva Técnica
              </h5>
              <p className="text-slate-700 dark:text-slate-400">
                Esta distorsión proyecta egresos financieros futuros <strong>menores a los reales</strong>, lo que conduce a la entidad financiadora a <strong>subestimar peligrosamente su reserva matemática de cobertura</strong> para la cohorte de diálisis.
              </p>
            </div>
          </div>

          {/* DIAGRAMA CON LOS 6 TEXTOS PROFESIONALES REVISADOS */}
          <div className={`p-6 rounded-2xl border mt-5 overflow-x-auto bg-white border-purple-300 shadow-sm dark:bg-slate-900/90 dark:border-purple-500/30`}>
            <span className={`text-xs font-bold uppercase tracking-wider block mb-6 text-purple-900 dark:text-purple-300`}>
              ⚡ Secuencia de Razonamiento (Conexión Continua por Renglones):
            </span>

            <div className="space-y-6">
              
              {/* RENGLÓN 1: Pasos 1, 2, 3 + INDICADOR 1 (CONTINÚA) */}
              <div className="flex flex-col md:flex-row items-center gap-3">
                
                {/* 1. Tarjeta 1 */}
                <div className={`p-3.5 rounded-2xl border text-xs font-bold flex-1 flex items-center justify-between shadow-sm min-h-[72px] bg-rose-50 border-rose-300 text-slate-900 dark:bg-rose-950/40 dark:border-rose-500/50 dark:text-rose-200`}>
                  <span className="leading-snug">1. Trata el Trasplante Renal como censura independiente (asumiendo falsamente que el trasplantado mantiene el mismo riesgo de morir en diálisis).</span>
                  <span className="text-base ml-2 shrink-0">❌</span>
                </div>

                <div className="hidden md:block text-purple-500 text-xl font-extrabold shrink-0">➔</div>

                {/* 2. Tarjeta 2 */}
                <div className={`p-3.5 rounded-2xl border text-xs font-bold flex-1 flex items-center justify-between shadow-sm min-h-[72px] bg-amber-50 border-amber-300 text-slate-900 dark:bg-amber-950/40 dark:border-amber-500/50 dark:text-amber-200`}>
                  <span className="leading-snug">2. Eleva artificialmente la mortalidad en diálisis (distorsionando la sobrevida real).</span>
                  <span className="text-base ml-2 shrink-0">📈</span>
                </div>

                <div className="hidden md:block text-purple-500 text-xl font-extrabold shrink-0">➔</div>

                {/* 3. Tarjeta 3 */}
                <div className={`p-3.5 rounded-2xl border text-xs font-bold flex-1 flex items-center justify-between shadow-sm min-h-[72px] bg-purple-50 border-purple-300 text-slate-900 dark:bg-purple-950/50 dark:border-purple-400/60 dark:text-purple-200`}>
                  <span className="leading-snug">3. Reduce en el modelo la expectativa de sobrevida remanente del conjunto de pacientes.</span>
                  <span className="text-base ml-2 shrink-0">📊</span>
                </div>

                {/* INDICADOR 1: CONTINÚA */}
                <div className="hidden md:flex flex-col items-center justify-center shrink-0 pl-2 text-purple-400">
                  <svg className="w-6 h-6 text-purple-400 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider">CONTINÚA</span>
                </div>

              </div>

              {/* RENGLÓN 2: INDICADOR 2 (VIENE DE ARRIBA) + Pasos 4, 5 y Conclusión */}
              <div className="flex flex-col md:flex-row items-center gap-3">
                
                {/* INDICADOR 2: VIENE DE ARRIBA */}
                <div className="hidden md:flex flex-col items-center justify-center shrink-0 pr-2 text-purple-400">
                  <svg className="w-6 h-6 text-purple-400 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider">VIENE DE ARRIBA</span>
                </div>

                {/* 4. Tarjeta 4 */}
                <div className={`p-3.5 rounded-2xl border text-xs font-bold flex-1 flex items-center justify-between shadow-sm min-h-[72px] bg-purple-50 border-purple-300 text-slate-900 dark:bg-purple-950/50 dark:border-purple-400/60 dark:text-purple-200`}>
                  <span className="leading-snug">4. Proyecta un horizonte de erogaciones más corto al real (estimando que el paciente consumirá menor cantidad de servicios dialíticos).</span>
                  <span className="text-base ml-2 shrink-0">📉</span>
                </div>

                <div className="hidden md:block text-purple-500 text-xl font-extrabold shrink-0">➔</div>

                {/* 5. Tarjeta 5 */}
                <div className={`p-3.5 rounded-2xl border text-xs font-bold flex-1 flex items-center justify-between shadow-sm min-h-[72px] bg-purple-50 border-purple-300 text-slate-900 dark:bg-purple-950/40 dark:border-purple-400/50 dark:text-purple-200`}>
                  <span className="leading-snug">5. El Valor Actual Actuarial de Diálisis resulta inferior a los costos efectivos (al existir menor cantidad de flujos financieros futuros para descontar).</span>
                  <span className="text-base ml-2 shrink-0">💸</span>
                </div>

                <div className="hidden md:block text-purple-500 text-xl font-extrabold shrink-0">➔</div>

                {/* Conclusión */}
                <div className="p-3.5 rounded-2xl border text-xs font-extrabold flex-1 flex items-center justify-center text-center shadow-md bg-rose-600 border-rose-700 text-white min-h-[72px]">
                  <span className="leading-snug">📌 CONCLUSIÓN: La entidad financiadora subestima la Reserva Técnica necesaria (asignando a cada paciente incidente un capital inicial menor al que exigirá su tratamiento).</span>
                </div>

              </div>

            </div>

          </div>

          {/* CUADRO EN SÍNTESIS */}
          <div className={`p-3 rounded-xl border mt-4 text-xs font-semibold bg-purple-100 border-purple-300 text-purple-950 dark:bg-purple-500/10 dark:border-purple-500/30 dark:text-purple-200`}>
            💡 <strong>En síntesis:</strong> Kaplan-Meier comete el doble error de <em>sobreestimar la mortalidad puntual en diálisis</em> y al mismo tiempo <em>subestimar el pasivo financiero global a largo plazo</em> por ignorar los reingresos y la sobrevida real del paciente en el sistema.
          </div>
        </div>
      )}

      {/* APARTADO 5: EL CONFLICTO QUE DISPARA EL PUNTO 3 */}
      {showConflict && (
        <div className={`p-5 rounded-2xl border transition-all bg-amber-50/60 border-amber-500 text-slate-800 font-normal dark:bg-slate-950 dark:border-amber-500/30 dark:text-slate-300`}>
          <h4 className={`text-sm font-bold uppercase tracking-wider text-amber-950 dark:text-amber-400`}>🔥 5. El Nuevo Conflicto Disparador</h4>
          <p className="text-xs sm:text-sm leading-relaxed mt-1">
            Aunque la Función de Incidencia Acumulada corrige el sesgo estático de muerte vs. trasplante, <strong>no nos permite modelar cómo los pacientes cambian dinámicamente de modalidad</strong> (ej: pasar de Hemodiálisis a Diálisis Peritoneal, o reingresar desde un Trasplante fallido) a lo largo del tiempo.
          </p>
          <div className={`p-3 rounded-xl border mt-2 text-xs font-bold bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-200`}>
            👉 Necesitamos una estructura estocástica multiestado: El Modelo de Markov (Punto 3).
          </div>
        </div>
      )}

    </div>
  );
}
