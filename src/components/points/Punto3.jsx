import React, { useState } from 'react';
import { MathJaxFormula } from '../MathJaxFormula';
import { useAuth } from '../../context/AuthContext';

export default function Punto3({ isDarkMode, onNext }) {
  const [activeTab, setActiveTab] = useState(null);
  const [showMathFormula, setShowMathFormula] = useState(false);
  const [selectedState, setSelectedState] = useState(null);
  const { hasPermission } = useAuth();

  const states = [
    {
      id: 1,
      name: 'Hemodiálisis (HD)',
      type: 'Transitorio (Estado 1)',
      color: 'border-teal-500 bg-teal-500/10 text-teal-900 dark:text-teal-300',
      formula: '\\alpha_{1,6}(t)',
      desc: 'Modalidad de depuración extracorpórea principal en Argentina. El paciente asiste típicamente 3 veces por semana.',
      transitionTitle: 'Tasa instantánea de transición de HD a Muerte:',
      transitionExplanation: [
        { symbol: '\\alpha_{1,6}(t)', label: 'Riesgo instantáneo (fuerza de mortalidad) de morir bajo hemodiálisis en el instante t.' },
        { symbol: 't', label: 'Tiempo transcurrido desde el ingreso a diálisis crónica.' }
      ]
    },
    {
      id: 2,
      name: 'Diálisis Peritoneal (DP)',
      type: 'Transitorio (Estado 2)',
      color: 'border-indigo-500 bg-indigo-500/10 text-indigo-900 dark:text-indigo-300',
      formula: '\\alpha_{2,6}(t)',
      desc: 'Modalidad domiciliaria. Menor prevalencia en Argentina, pero con ventajas de costo y preservación de función renal residual.',
      transitionTitle: 'Tasa instantánea de transición de DP a Muerte:',
      transitionExplanation: [
        { symbol: '\\alpha_{2,6}(t)', label: 'Riesgo instantáneo de morir bajo la modalidad de diálisis peritoneal en el instante t.' }
      ]
    },
    {
      id: 3,
      name: 'Trasplante Renal Activo (TX)',
      type: 'Transitorio (Estado 3)',
      color: 'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300',
      formula: '\\alpha_{3,6}(t)',
      desc: 'Estado óptimo de rehabilitación. Representa un riesgo competitivo mayor frente a la mortalidad en diálisis.',
      transitionTitle: 'Tasa de transición de TX a Muerte:',
      transitionExplanation: [
        { symbol: '\\alpha_{3,6}(t)', label: 'Fuerza de mortalidad del paciente trasplantado (típicamente muy inferior a la de diálisis).' }
      ]
    },
    {
      id: 4,
      name: 'Pérdida de Función del Injerto (PFI)',
      type: 'Transitorio (Estado 4)',
      color: 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300',
      formula: '\\alpha_{3,4}(t)',
      desc: 'Falla del riñón trasplantado. El paciente debe regresar obligatoriamente a terapia de diálisis (HD o DP).',
      transitionTitle: 'Transición por rechazo o falla del injerto:',
      transitionExplanation: [
        { symbol: '\\alpha_{3,4}(t)', label: 'Tasa instantánea de pérdida del injerto renal que fuerza la vuelta a diálisis (reingreso).' }
      ]
    },
    {
      id: 5,
      name: 'Recuperación de Función Renal (RFR)',
      type: 'Transitorio (Estado 5)',
      color: 'border-cyan-500 bg-cyan-500/10 text-cyan-900 dark:text-cyan-300',
      formula: '\\alpha_{1,5}(t)',
      desc: 'Caso poco frecuente pero posible en nefropatías agudas sobre crónicas. El paciente suspende diálisis temporalmente.',
      transitionTitle: 'Tasa de transición a recuperación:',
      transitionExplanation: [
        { symbol: '\\alpha_{1,5}(t)', label: 'Probabilidad infinitesimal de recuperar función renal autónoma suficiente.' }
      ]
    },
    {
      id: 6,
      name: 'Muerte (Absorbente)',
      type: 'Absorbente (Estado 6)',
      color: 'border-red-650 bg-red-500/10 text-red-950 dark:text-red-300',
      formula: '\\text{Absorbente}',
      desc: 'Estado terminal definitivo (Muerte). Ningún paciente puede salir de este estado una vez ingresado.',
      transitionTitle: 'Fase de acumulación final de costos:',
      transitionExplanation: [
        { symbol: '\\text{Absorbente}', label: 'Cesa el flujo de erogaciones directas por diálisis del financiador.' }
      ]
    }
  ];

  const visibleCount = [
    hasPermission('p1_p3_a1'),
    hasPermission('p1_p3_a2'),
    hasPermission('p1_p3_a3'),
    hasPermission('p1_p3_a4')
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">

      {/* Título y Hilo Narrativo */}
      <div className={`border-b pb-4 border-slate-300 dark:border-slate-800`}>
        <span className={`text-sm font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400`}>
          El Modelado Estocástico
        </span>
        <h3 className={`text-3xl sm:text-4xl font-extrabold mt-1 text-slate-900 dark:text-white`}>
          La Transición entre Estados: El Modelo Multiestado de Markov
        </h3>
      </div>

      {/* Botones de Control de Revelado (Apartados) */}
      <div className={`grid grid-cols-2 sm:grid-cols-4 md:grid-cols-${visibleCount || 1} gap-2.5`}>
        {/* ------------------------------------------- INI: p1_p3_a1 --------------------------------------------- */}
        {hasPermission('p1_p3_a1') && (
          <button
            onClick={() => setActiveTab(activeTab === 'problema' ? null : 'problema')}
            className={`p-3 rounded-xl border text-sm font-bold transition-all duration-200 flex items-center justify-between ${activeTab === 'problema'
              ? 'bg-rose-50 border-rose-500 text-slate-900 shadow-md ring-2 ring-rose-500 dark:bg-rose-500/20 dark:border-rose-500 dark:text-rose-300'
              : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-rose-50/50 hover:border-rose-400 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:border-rose-500/50 dark:hover:text-white'
              }`}
          >
            <span>¿Por qué Markov?</span>
            <span>{activeTab === 'problema' ? '👁️' : '🙈'}</span>
          </button>
        )}
        {/* ------------------------------------------- FIN: p1_p3_a1 --------------------------------------------- */}

        {/* ------------------------------------------- INI: p1_p3_a2 --------------------------------------------- */}
        {hasPermission('p1_p3_a2') && (
          <button
            onClick={() => setActiveTab(activeTab === 'diagrama' ? null : 'diagrama')}
            className={`p-3 rounded-xl border text-sm font-bold transition-all duration-200 flex items-center justify-between ${activeTab === 'diagrama'
              ? 'bg-teal-50 border-teal-500 text-slate-900 shadow-md ring-2 ring-teal-500 dark:bg-teal-500/20 dark:border-teal-500 dark:text-teal-300'
              : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-teal-50/50 hover:border-teal-400 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:border-teal-500/50 dark:hover:text-white'
              }`}
          >
            <span>Diagrama de los 6 Estados</span>
            <span>{activeTab === 'diagrama' ? '👁️' : '🙈'}</span>
          </button>
        )}
        {/* ------------------------------------------- FIN: p1_p3_a2 --------------------------------------------- */}

        {/* ------------------------------------------- INI: p1_p3_a3 --------------------------------------------- */}
        {hasPermission('p1_p3_a3') && (
          <button
            onClick={() => setActiveTab(activeTab === 'matriz' ? null : 'matriz')}
            className={`p-3 rounded-xl border text-sm font-bold transition-all duration-200 flex items-center justify-between ${activeTab === 'matriz'
              ? 'bg-cyan-50 border-cyan-600 text-slate-900 shadow-md ring-2 ring-cyan-600 dark:bg-cyan-500/20 dark:border-cyan-500 dark:text-cyan-300'
              : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-cyan-50/50 hover:border-cyan-400 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:border-cyan-500/50 dark:hover:text-white'
              }`}
          >
            <span>Matriz de Transición de Estados</span>
            <span>{activeTab === 'matriz' ? '👁️' : '🙈'}</span>
          </button>
        )}
        {/* ------------------------------------------- FIN: p1_p3_a3 --------------------------------------------- */}

        {/* ------------------------------------------- INI: p1_p3_a4 --------------------------------------------- */}
        {hasPermission('p1_p3_a4') && (
          <button
            onClick={() => setActiveTab(activeTab === 'conflicto' ? null : 'conflicto')}
            className={`p-3 rounded-xl border text-sm font-bold transition-all duration-200 flex items-center justify-between ${activeTab === 'conflicto'
              ? 'bg-amber-50 border-amber-600 text-slate-950 shadow-md ring-2 ring-amber-600 dark:bg-amber-500/20 dark:border-amber-500 dark:text-amber-300'
              : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-amber-50/50 hover:border-amber-400 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:border-amber-500/50 dark:hover:text-white'
              }`}
          >
            <span>El Conflicto Metodológico</span>
            <span>{activeTab === 'conflicto' ? '👁️' : '🙈'}</span>
          </button>
        )}
        {/* ------------------------------------------- FIN: p1_p3_a4 --------------------------------------------- */}
      </div>

      {/* APARTADO 1: POR QUÉ MARKOV */}
      {activeTab === 'problema' && (
        <div className={`p-5 rounded-2xl border transition-all bg-rose-55/60 border-rose-500 text-slate-950 font-medium dark:bg-slate-950 dark:border-rose-500/30 dark:text-slate-300`}>
          <h4 className={`text-sm font-black uppercase tracking-wider text-rose-950 dark:text-rose-400`}>⚠️ El Problema de la Rigidez Biométrica</h4>
          <p className="text-base sm:text-lg leading-relaxed mt-1">
            Un paciente en diálisis no permanece estático en un solo estado. Cambia de técnica (ej. de DP a HD), entra y sale de Lista de Espera, se trasplanta o recupera su función renal, y vuelve a un estado activo "en tratamiento". <br /><br />Tratar la trayectoria como un evento binario simple destruye la precisión del costo actuarial acumulado.
          </p>
        </div>
      )}

      {/* APARTADO 3: LA MATRIZ DE TRANSICIÓN Y FÓRMULAS */}
      {activeTab === 'matriz' && (
        <div className={`p-5 rounded-2xl border transition-all bg-teal-50 border-teal-500 text-slate-950 font-medium dark:bg-slate-950 dark:border-teal-500/30 dark:text-slate-300`}>
          <div className="flex items-center justify-between">
            <h4 className={`text-sm font-black uppercase tracking-wider text-teal-950 dark:text-teal-400`}>💡 La Solución: Matriz Estocástica de Markov</h4>
            <button
              onClick={() => setShowMathFormula(!showMathFormula)}
              className={`text-xs px-2.5 py-1 rounded font-bold border transition bg-teal-800 text-white border-teal-900 hover:bg-teal-900 dark:bg-slate-800 dark:text-teal-300 dark:border-teal-500/30 dark:hover:bg-slate-700`}
            >
              {showMathFormula ? 'Ocultar Ecuación Matrix' : 'Mostrar Ecuaciones MathJax'}
            </button>
          </div>

          <p className="text-base sm:text-lg leading-relaxed mt-2">
            Construimos un <strong>Proceso Multiestado de Tiempo Continuo</strong> definido por probabilidades de transición instantáneas entre estados transitorios y absorbentes.
          </p>

          {showMathFormula && (
            <div className={`p-4 rounded-xl border mt-3 space-y-3 text-xs bg-white border-teal-300 shadow-sm text-slate-950 font-semibold dark:bg-slate-900 dark:border-slate-800`}>
              <div className="font-bold">
                <span>Matriz de Transición P(s,t):</span>
                <MathJaxFormula display={true} formula="P_{ij}(s,t) = P(X(t) = j \mid X(s) = i)" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* APARTADO 2: DIAGRAMA INTERACTIVO DE 6 ESTADOS */}
      {activeTab === 'diagrama' && (
        <div className={`p-5 rounded-2xl border transition-all bg-emerald-50/60 border-emerald-500 text-slate-800 font-normal dark:bg-slate-950 dark:border-emerald-500/30 dark:text-slate-300`}>
          <h4 className={`text-sm font-black uppercase tracking-wider mb-3 text-emerald-950 dark:text-emerald-400`}>🕹️ Diagrama Estocástico de Estados S</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {states.map((st) => {
              const isSelected = selectedState?.id === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => setSelectedState(st)}
                  className={`p-3.5 rounded-xl border text-left transition-all duration-150 ${st.color} ${
                    isSelected
                      ? 'ring-2 ring-teal-400 dark:ring-teal-400 font-black shadow-lg scale-[1.02] bg-white dark:bg-slate-900 border-teal-500'
                      : 'bg-white/90 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800/90 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">{st.name}</div>
                  <div className="text-[11px] opacity-90 font-bold mt-0.5">{st.type}</div>
                </button>
              );
            })}
          </div>

          {selectedState && (
            <div className="space-y-3 mt-4">

              {/* DIV 1 (SUPERIOR): Título, Descripción y Ecuación Gigante a la Derecha */}
              <div className="p-5 rounded-xl border flex items-center justify-between min-h-[96px] bg-white border-teal-200 shadow-sm text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-white">
                <div className="space-y-1.5 max-w-[70%]">
                  <span className="font-extrabold text-base sm:text-lg text-teal-700 dark:text-teal-400 block">
                    {selectedState.name}
                  </span>
                  <p className="font-medium text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
                    {selectedState.desc}
                  </p>
                </div>

                <div className="flex items-center justify-end text-teal-600 dark:text-teal-300 shrink-0 pl-4">
                  <MathJaxFormula formula={selectedState.formula} className="text-3xl sm:text-4xl md:text-5xl font-extrabold" />
                </div>
              </div>

              {/* DIV 2 (INFERIOR): Título del Pase de Estado y Desglose de Variables */}
              <div className="p-5 rounded-xl border space-y-3 bg-teal-50/80 border-teal-200 shadow-sm text-slate-900 dark:bg-slate-900/90 dark:border-teal-500/30 dark:text-slate-200">
                {/* Título de la Transición */}
                <div className="flex items-center gap-2 border-b pb-2.5 border-teal-500/20">
                  <span className="text-base">🔄</span>
                  <h5 className="font-extrabold text-base sm:text-lg text-teal-950 dark:text-teal-300">
                    {selectedState.transitionTitle}
                  </h5>
                </div>

                {/* Desglose de Cada Variable */}
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                    Desglose de Parámetros and Significado:
                  </span>
                  <ul className="space-y-2">
                    {selectedState.transitionExplanation.map((exp, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                        <span className="font-extrabold font-serif px-2 py-0.5 rounded border text-xs shrink-0 bg-white border-teal-400 text-teal-900 shadow-xs dark:bg-slate-800 dark:border-teal-500/40 dark:text-teal-300">
                          <MathJaxFormula formula={exp.symbol} />
                        </span>
                        <span className="text-slate-800 font-medium dark:text-slate-300">
                          {exp.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* APARTADO 4: EL CONFLICTO METODOLÓGICO Y DISPARADOR DEL PUNTO 4 */}
      {activeTab === 'conflicto' && (
        <div className={`p-5 rounded-2xl border transition-all bg-amber-50 border-amber-500 text-slate-950 font-medium dark:bg-slate-950 dark:border-amber-500/30 dark:text-slate-300`}>
          <h4 className={`text-sm font-black uppercase tracking-wider text-amber-950 dark:text-amber-400`}>🔥 El Conflicto para la Práctica Real</h4>
          <p className="text-base sm:text-lg leading-relaxed mt-1">
            El modelo de Markov teórico es perfecto en los papeles, pero <strong>¿de dónde sacamos las tasas de mortalidad reales ajustadas por comorbilidades en Argentina?</strong> Las tablas de mortalidad generales de población no sirven para pacientes en diálisis.
          </p>
          <div
            onClick={onNext}
            className="p-3 rounded-xl border mt-2 text-xs font-black bg-amber-200 border-amber-400 text-amber-950 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-200 cursor-pointer hover:bg-amber-100/50 dark:hover:bg-amber-500/20 transition-all"
          >
            👉 Próximo paso (Punto 4): La Tabla Actuarial Híbrida basada en el Registro Argentino de Diálisis.
          </div>
        </div>
      )}

    </div>
  );
}
