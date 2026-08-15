import React, { useState } from 'react';
import { MathJaxFormula } from '../MathJaxFormula';
import { useAuth } from '../../context/AuthContext';

export default function Punto2({ isDarkMode, onNext }) {
  const [activeTab, setActiveTab] = useState(null);
  const [showMathFormula, setShowMathFormula] = useState(false);
  const [expandedStep, setExpandedStep] = useState(null);
  const { hasPermission } = useAuth();

  const data = [
    { plazo: 'Inicio (0 Meses)', km: '100%', cif: '100%', error: 'Sin error inicial' },
    { plazo: '1 Año (12 Meses)', km: '88%', cif: '91%', error: 'Subestima la supervivencia en 3%' },
    { plazo: '2 Años (24 Meses)', km: '76%', cif: '82%', error: 'Subestima la supervivencia en 6%' },
    { plazo: '3 Años (36 Meses)', km: '65%', cif: '74%', error: 'Subestima la supervivencia en 9%' },
    { plazo: '4 Años (48 Meses)', km: '54%', cif: '65%', error: 'Subestima la supervivencia en 11%' },
    { plazo: '5 Años (60 Meses)', km: '42.6%', cif: '54.0%', error: 'Subestima la supervivencia en 11.4%' },
  ];

  const sequenceSteps = [
    {
      id: 1,
      number: 'PASO 1',
      title: 'Trata el Trasplante Renal como censura independiente',
      detail: 'Asumiendo falsamente que el paciente trasplantado mantiene el mismo riesgo de morir en diálisis que quienes continúan en tratamiento.',
      icon: '❌',
      bgColor: 'bg-rose-50 border-rose-300 text-slate-900 dark:bg-rose-950/50 dark:border-rose-500/60 dark:text-rose-200',
      expandedBg: 'bg-slate-900 border-rose-500 text-white shadow-rose-500/20',
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/40'
    },
    {
      id: 2,
      number: 'PASO 2',
      title: 'Eleva artificialmente la mortalidad en diálisis',
      detail: 'Distorsionando la sobrevida real observada al sobreestimar la tasa puntual de muertes en la cohorte.',
      icon: '📈',
      bgColor: 'bg-amber-50 border-amber-300 text-slate-900 dark:bg-amber-950/50 dark:border-amber-500/60 dark:text-amber-200',
      expandedBg: 'bg-slate-900 border-amber-500 text-white shadow-amber-500/20',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40'
    },
    {
      id: 3,
      number: 'PASO 3',
      title: 'Reduce en el modelo la expectativa de sobrevida remanente',
      detail: 'Proyectando un cese más rápido del conjunto de pacientes en la serie temporal.',
      icon: '📊',
      bgColor: 'bg-purple-50 border-purple-300 text-slate-900 dark:bg-purple-950/50 dark:border-purple-400/60 dark:text-purple-200',
      expandedBg: 'bg-slate-900 border-purple-500 text-white shadow-purple-500/20',
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/40'
    },
    {
      id: 4,
      number: 'PASO 4',
      title: 'Proyecta un horizonte de erogaciones más corto que el real',
      detail: 'Estimando que el paciente consumirá una menor cantidad de servicios dialíticos.',
      icon: '📉',
      bgColor: 'bg-purple-50 border-purple-300 text-slate-900 dark:bg-purple-950/50 dark:border-purple-400/60 dark:text-purple-200',
      expandedBg: 'bg-slate-900 border-purple-500 text-white shadow-purple-500/20',
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/40'
    },
    {
      id: 5,
      number: 'PASO 5',
      title: 'El Valor Actual Actuarial de Diálisis resulta INFERIOR a los costos efectivos',
      detail: 'Al existir una menor cantidad de flujos financieros futuros para descontar en la ecuación.',
      icon: '💸',
      bgColor: 'bg-purple-50 border-purple-300 text-slate-900 dark:bg-purple-950/50 dark:border-purple-400/60 dark:text-purple-200',
      expandedBg: 'bg-slate-900 border-purple-500 text-white shadow-purple-500/20',
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/40'
    },
    {
      id: 6,
      number: 'CONCLUSIÓN',
      title: 'La entidad financiadora SUB-ESTIMA la Reserva Técnica necesaria',
      detail: 'Asignando a cada paciente incidente un capital inicial menor al que exigirá la totalidad de su tratamiento dialítico.',
      icon: '📌',
      bgColor: 'bg-rose-600 border-rose-700 text-white dark:bg-rose-600 dark:border-rose-500 dark:text-white',
      expandedBg: 'bg-slate-900 border-rose-500 text-white shadow-rose-500/30',
      badgeColor: 'bg-rose-500/30 text-rose-300 border-rose-500/50'
    }
  ];

  const visibleCount = [
    hasPermission('p1_p2_a1'),
    hasPermission('p1_p2_a2'),
    hasPermission('p1_p2_a3'),
    hasPermission('p1_p2_a4'),
    hasPermission('p1_p2_a5')
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">

      {/* Título y Hilo Narrativo */}
      <div className={`border-b pb-4 border-slate-300 dark:border-slate-800`}>
        <span className={`text-sm font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400`}>
          El Sesgo Biométrico
        </span>
        <h3 className={`text-3xl sm:text-4xl font-extrabold mt-1 text-slate-900 dark:text-white`}>
          El Error de Kaplan-Meier: Sobreestimación del Riesgo
        </h3>
      </div>

      {/* Botones de Control de Revelado Interactivos (Apartados) */}
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-${visibleCount || 1} gap-2.5`}>
        {/* ------------------------------------------- INI: p1_p2_a1 --------------------------------------------- */}
        {hasPermission('p1_p2_a1') && (
          <button
            onClick={() => setActiveTab(activeTab === 'problema' ? null : 'problema')}
            className={`p-3 rounded-xl border text-sm font-bold transition-all duration-200 flex items-center justify-between ${activeTab === 'problema'
              ? 'bg-rose-50 border-rose-500 text-slate-900 shadow-md ring-2 ring-rose-500 dark:bg-rose-500/20 dark:border-rose-500 dark:text-rose-300'
              : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-rose-50/50 hover:border-rose-400 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:border-rose-500/50 dark:hover:text-white'
              }`}
          >
            <span>El Problema</span>
            <span>{activeTab === 'problema' ? '👁️' : '🙈'}</span>
          </button>
        )}
        {/* ------------------------------------------- FIN: p1_p2_a1 --------------------------------------------- */}

        {/* ------------------------------------------- INI: p1_p2_a2 --------------------------------------------- */}
        {hasPermission('p1_p2_a2') && (
          <button
            onClick={() => setActiveTab(activeTab === 'solucion' ? null : 'solucion')}
            className={`p-3 rounded-xl border text-sm font-bold transition-all duration-200 flex items-center justify-between ${activeTab === 'solucion'
              ? 'bg-teal-50 border-teal-500 text-slate-900 shadow-md ring-2 ring-teal-500 dark:bg-teal-500/20 dark:border-teal-500 dark:text-teal-300'
              : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-teal-50/50 hover:border-teal-400 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:border-teal-500/50 dark:hover:text-white'
              }`}
          >
            <span>La Solución</span>
            <span>{activeTab === 'solucion' ? '👁️' : '🙈'}</span>
          </button>
        )}
        {/* ------------------------------------------- FIN: p1_p2_a2 --------------------------------------------- */}

        {/* ------------------------------------------- INI: p1_p2_a3 --------------------------------------------- */}
        {hasPermission('p1_p2_a3') && (
          <button
            onClick={() => setActiveTab(activeTab === 'desviacion' ? null : 'desviacion')}
            className={`p-3 rounded-xl border text-sm font-bold transition-all duration-200 flex items-center justify-between ${activeTab === 'desviacion'
              ? 'bg-emerald-50 border-emerald-500 text-slate-900 shadow-md ring-2 ring-emerald-600 dark:bg-emerald-500/20 dark:border-emerald-500 dark:text-emerald-300'
              : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-emerald-50/50 hover:border-emerald-400 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:border-emerald-500/50 dark:hover:text-white'
              }`}
          >
            <span>La Desviación</span>
            <span>{activeTab === 'desviacion' ? '👁️' : '🙈'}</span>
          </button>
        )}
        {/* ------------------------------------------- FIN: p1_p2_a3 --------------------------------------------- */}

        {/* ------------------------------------------- INI: p1_p2_a4 --------------------------------------------- */}
        {hasPermission('p1_p2_a4') && (
          <button
            onClick={() => setActiveTab(activeTab === 'reservas' ? null : 'reservas')}
            className={`p-3 rounded-xl border text-sm font-bold transition-all duration-200 flex items-center justify-between ${activeTab === 'reservas'
              ? 'bg-purple-50 border-purple-500 text-slate-900 shadow-md ring-2 ring-purple-500 dark:bg-purple-500/20 dark:border-purple-500 dark:text-purple-300'
              : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-purple-50/50 hover:border-purple-400 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:border-purple-500/50 dark:hover:text-white'
              }`}
          >
            <span>Subestimación de Reservas</span>
            <span>{activeTab === 'reservas' ? '👁️' : '🙈'}</span>
          </button>
        )}
        {/* ------------------------------------------- FIN: p1_p2_a4 --------------------------------------------- */}

        {/* ------------------------------------------- INI: p1_p2_a5 --------------------------------------------- */}
        {hasPermission('p1_p2_a5') && (
          <button
            onClick={() => setActiveTab(activeTab === 'conflicto' ? null : 'conflicto')}
            className={`p-3 rounded-xl border text-sm font-bold transition-all duration-200 flex items-center justify-between ${activeTab === 'conflicto'
              ? 'bg-amber-50 border-amber-600 text-slate-950 shadow-md ring-2 ring-amber-600 dark:bg-amber-500/20 dark:border-amber-500 dark:text-amber-300'
              : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-amber-50/50 hover:border-amber-400 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:border-amber-500/50 dark:hover:text-white'
              }`}
          >
            <span>El Conflicto Final</span>
            <span>{activeTab === 'conflicto' ? '👁️' : '🙈'}</span>
          </button>
        )}
        {/* ------------------------------------------- FIN: p1_p2_a5 --------------------------------------------- */}
      </div>

      {/* APARTADO 1: EL PROBLEMA */}
      {activeTab === 'problema' && (
        <div className={`p-5 rounded-2xl border transition-all bg-rose-50/60 border-rose-500 text-slate-800 font-normal dark:bg-slate-950 dark:border-rose-500/30 dark:text-slate-300`}>
          <h4 className={`text-base font-bold uppercase tracking-wider text-rose-900 dark:text-rose-400`}>⚠️ El Problema Biométrico</h4>
          <p className="text-sm sm:text-base leading-relaxed mt-1">
            Las estadísticas médicas tradicionales aplican el método de <strong>Kaplan-Meier</strong> tratando el Trasplante Renal como si fuera una "censura independiente" (igual que un paciente que abandona el estudio o se cambia de clínica). Esto asume falsamente que el paciente trasplantado mantiene el mismo riesgo de morir en diálisis que quienes continúan en tratamiento.
          </p>
        </div>
      )}

      {/* APARTADO 2: LA SOLUCIÓN Y FÓRMULAS CON COLOR AMARILLO UNIFICADO PARA KM */}
      {activeTab === 'solucion' && (
        <div className={`p-5 rounded-2xl border transition-all bg-teal-50/60 border-teal-500 text-slate-800 font-normal dark:bg-slate-950 dark:border-teal-500/30 dark:text-slate-300`}>
          <div className="flex items-center justify-between">
            <h4 className={`text-sm font-bold uppercase tracking-wider text-teal-900 dark:text-teal-400`}>💡 La Solución: Función de Incidencia Acumulada</h4>
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

      {/* APARTADO 3: TABLA DE COMPARACIÓN */}
      {activeTab === 'desviacion' && (
        <div className={`p-5 rounded-2xl border transition-all bg-emerald-50/60 border-emerald-500 text-slate-800 font-normal dark:bg-slate-950 dark:border-emerald-500/30 dark:text-slate-300`}>
          <h4 className={`text-sm font-bold uppercase tracking-wider mb-2 text-emerald-950 dark:text-emerald-400`}>
            📊 Comparación de Supervivencia: Método Sesgado vs. Método Real (Argentina)
          </h4>
          <p className="text-xs mb-3 text-slate-600 dark:text-slate-400">
            Se compara la estimación del porcentaje de pacientes sobrevivientes a lo largo de 5 años. El método tradicional de Kaplan-Meier subestima sistemáticamente la supervivencia real observada en el Registro Argentino de Diálisis Crónica.
          </p>
          <div className="overflow-x-auto border rounded-xl border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs text-slate-800 dark:text-slate-300">
              <thead className="font-bold uppercase bg-emerald-100/80 text-slate-900 dark:bg-slate-900 dark:text-teal-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3 text-slate-900 dark:text-slate-200">Plazo Evaluado</th>
                  <th className="p-3 text-amber-900 dark:text-amber-400">Supervivencia Sesgada<br /><span className="text-[10px] text-amber-600 dark:text-amber-400/80 font-normal">(Método Kaplan-Meier)</span></th>
                  <th className="p-3 text-emerald-900 dark:text-emerald-400">Supervivencia Real<br /><span className="text-[10px] text-emerald-600 dark:text-emerald-400/80 font-normal">(Función de Incidencia Acumulada)</span></th>
                  <th className="p-3 text-rose-900 dark:text-rose-400">Distorsión del Método Sesgado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-semibold">
                {data.map((row, index) => (
                  <tr key={index} className="bg-white dark:bg-slate-950/80 hover:bg-emerald-50/50 dark:hover:bg-slate-900/60 transition-colors">
                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{row.plazo}</td>
                    <td className="p-3 text-amber-700 dark:text-amber-300">{row.km} de pacientes vivos</td>
                    <td className="p-3 text-emerald-700 dark:text-emerald-400 font-bold">{row.cif} de pacientes vivos</td>
                    <td className="p-3 text-rose-600 dark:text-rose-400 font-bold">{row.error}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* APARTADO 4: IMPACTO EN RESERVAS */}
      {activeTab === 'reservas' && (
        <div className={`p-5 rounded-2xl border transition-all bg-purple-50/60 border-purple-500 text-slate-800 font-normal dark:bg-slate-950 dark:border-purple-500/30 dark:text-slate-300`}>
          <h4 className={`text-sm font-bold uppercase tracking-wider text-purple-900 dark:text-purple-400`}>
            📉 El Impacto Financiero: Subestimación de la Reserva Matemática
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

          {/* DIAGRAMA INTERACTIVO DE 6 PASOS CON EXPANSIÓN Y HOVER */}
          <div className="p-6 rounded-2xl border mt-5 overflow-x-auto bg-white border-purple-200 shadow-sm dark:bg-slate-900/90 dark:border-purple-500/30">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-black uppercase tracking-wider text-purple-900 dark:text-purple-300">
                ⚡ Secuencia de Razonamiento:
              </span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                💡 Clic en cada paso para maximizar
              </span>
            </div>

            <div className="space-y-6">

              {/* RENGLÓN 1: Pasos 1, 2, 3 + INDICADOR 1 (CONTINÚA) */}
              <div className="flex flex-col md:flex-row items-center gap-3">

                {sequenceSteps.slice(0, 3).map((st) => (
                  <React.Fragment key={st.id}>
                    <div
                      onClick={() => setExpandedStep(st)}
                      className={`p-3.5 rounded-2xl border text-xs font-bold flex-1 flex items-center justify-between shadow-sm min-h-[76px] cursor-pointer transition-all duration-200 hover:scale-[1.04] hover:shadow-xl hover:ring-2 hover:ring-purple-400 group ${st.bgColor}`}
                    >
                      <span className="leading-snug">
                        <strong className="text-purple-700 dark:text-purple-300 block mb-0.5 group-hover:underline">{st.number}</strong>
                        {st.id}. {st.title}
                      </span>
                      <span className="text-base ml-2 shrink-0 group-hover:scale-125 transition-transform">{st.icon}</span>
                    </div>

                    {st.id < 3 && (
                      <div className="hidden md:block text-purple-500 text-xl font-extrabold shrink-0">➔</div>
                    )}
                  </React.Fragment>
                ))}

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

                {sequenceSteps.slice(3, 6).map((st) => (
                  <React.Fragment key={st.id}>
                    <div
                      onClick={() => setExpandedStep(st)}
                      className={`p-3.5 rounded-2xl border text-xs font-bold flex-1 flex items-center justify-between shadow-sm min-h-[76px] cursor-pointer transition-all duration-200 hover:scale-[1.04] hover:shadow-xl hover:ring-2 hover:ring-purple-400 group ${st.bgColor}`}
                    >
                      <span className="leading-snug">
                        <strong className="text-purple-700 dark:text-purple-300 block mb-0.5 group-hover:underline">{st.number}</strong>
                        {st.id === 6 ? '' : `${st.id}. `}{st.title}
                      </span>
                      <span className="text-base ml-2 shrink-0 group-hover:scale-125 transition-transform">{st.icon}</span>
                    </div>

                    {st.id < 6 && (
                      <div className="hidden md:block text-purple-500 text-xl font-extrabold shrink-0">➔</div>
                    )}
                  </React.Fragment>
                ))}

              </div>

            </div>

          </div>

          {/* MODAL / POPUP DE AMPLIACIÓN (CLIC PARA EXPANDIR / CONTRAER) */}
          {expandedStep && (
            <div
              onClick={() => setExpandedStep(null)}
              className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className={`max-w-2xl w-full p-6 sm:p-8 rounded-3xl border-2 shadow-2xl space-y-5 transition-all transform scale-100 ${expandedStep.expandedBg}`}
              >
                <div className="flex items-center justify-between border-b pb-4 border-white/10">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider border ${expandedStep.badgeColor}`}>
                      {expandedStep.number}
                    </span>
                    <span className="text-3xl sm:text-4xl">{expandedStep.icon}</span>
                  </div>
                  <button
                    onClick={() => setExpandedStep(null)}
                    className="text-xs font-black px-3.5 py-2 rounded-xl border border-white/20 hover:bg-white/15 text-white/90 hover:text-white transition flex items-center gap-1.5 bg-white/5 cursor-pointer"
                  >
                    <span>✕ Contraer</span>
                  </button>
                </div>

                <div className="space-y-3 py-2">
                  <h4 className="text-xl sm:text-2xl font-black leading-snug">
                    {expandedStep.id === 6 ? '' : `${expandedStep.id}. `}{expandedStep.title}
                  </h4>
                  <p className="text-base sm:text-lg opacity-90 leading-relaxed font-medium">
                    {expandedStep.detail}
                  </p>
                </div>

                <div className="pt-3 text-xs text-center opacity-70 font-semibold border-t border-white/10">
                  💡 Haz clic en cualquier lugar fuera o presiona el botón para contraer la tarjeta.
                </div>
              </div>
            </div>
          )}

          {/* CUADRO EN SÍNTESIS */}
          <div className={`p-3 rounded-xl border mt-4 text-xs font-semibold bg-purple-100 border-purple-300 text-purple-950 dark:bg-purple-500/10 dark:border-purple-500/30 dark:text-purple-200`}>
            💡 <strong>En síntesis:</strong> Kaplan-Meier comete el doble error de <em>sobreestimar la mortalidad puntual en diálisis</em> y al mismo tiempo <em>subestimar el pasivo financiero global a largo plazo</em> por ignorar los reingresos y la sobrevida real del paciente en el sistema.
          </div>
        </div>
      )}

      {/* APARTADO 5: EL CONFLICTO FINAL */}
      {activeTab === 'conflicto' && (
        <div className={`p-5 rounded-2xl border transition-all bg-amber-50/60 border-amber-500 text-slate-800 font-normal dark:bg-slate-950 dark:border-amber-500/30 dark:text-slate-300`}>
          <h4 className={`text-sm font-bold uppercase tracking-wider text-amber-950 dark:text-amber-400`}>🔥 El Nuevo Conflicto Disparador</h4>
          <p className="text-xs sm:text-sm leading-relaxed mt-1">
            Aunque la Función de Incidencia Acumulada corrige el sesgo estático de muerte vs. trasplante, <strong>no nos permite modelar cómo los pacientes cambian dinámicamente de modalidad</strong> (ej: pasar de Hemodiálisis a Diálisis Peritoneal, o reingresar desde un Trasplante fallido) a lo largo del tiempo.
          </p>
          <div
            onClick={onNext}
            className="p-3 rounded-xl border mt-2 text-xs font-bold bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-200 cursor-pointer hover:bg-amber-200/50 dark:hover:bg-amber-50/10 transition-all"
          >
            👉 Necesitamos una estructura estocástica multiestado: El Modelo de Markov.
          </div>
        </div>
      )}

    </div>
  );
}
