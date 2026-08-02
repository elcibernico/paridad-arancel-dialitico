import React, { useState } from 'react';
import { MathJaxFormula } from '../MathJaxFormula';

export default function Punto3({ isDarkMode }) {
  const [activeTab, setActiveTab] = useState(null);
  const [showMathFormula, setShowMathFormula] = useState(false);
  const [selectedState, setSelectedState] = useState(null);

  const states = [
    {
      id: 1,
      name: 'Hemodiálisis (HD)',
      type: 'Transitorio (Estado 1)',
      color: 'border-teal-500 bg-teal-500/10 text-teal-900 dark:text-teal-300',
      formula: '\\alpha_{1,6}(t)',
      desc: 'Modalidad principal de tratamiento en centro clínico (91.12% de la cohorte argentina).',
      transitionTitle: 'Pase de Hemodiálisis (Estado 1) a Muerte (Estado 6)',
      transitionExplanation: [
        { symbol: '\\alpha_{1,6}(t)', label: 'Tasa o intensidad de transición instantánea desde Hemodiálisis (Estado 1) hacia Muerte (Estado 6) en el instante t.' },
        { symbol: '1', label: 'Estado de Origen: Hemodiálisis convencional.' },
        { symbol: '6', label: 'Estado de Destino: Muerte (Estado absorbente definitivo).' },
        { symbol: 't', label: 'Tiempo de permanencia o exposición al riesgo en el tratamiento sustitutivo.' }
      ]
    },
    {
      id: 2,
      name: 'Diálisis Peritoneal (DP)',
      type: 'Transitorio (Estado 2)',
      color: 'border-cyan-500 bg-cyan-500/10 text-cyan-900 dark:text-cyan-300',
      formula: '\\alpha_{2,6}(t)',
      desc: 'Terapia domiciliaria continua con menor estrés cardiovascular inicial.',
      transitionTitle: 'Pase de Diálisis Peritoneal (Estado 2) a Muerte (Estado 6)',
      transitionExplanation: [
        { symbol: '\\alpha_{2,6}(t)', label: 'Tasa o intensidad de transición instantánea desde Diálisis Peritoneal (Estado 2) hacia Muerte (Estado 6) en el instante t.' },
        { symbol: '2', label: 'Estado de Origen: Diálisis Peritoneal domiciliaria.' },
        { symbol: '6', label: 'Estado de Destino: Muerte (Estado absorbente definitivo).' },
        { symbol: 't', label: 'Tiempo transcurrido desde el inicio de la terapia domiciliaria.' }
      ]
    },
    {
      id: 3,
      name: 'Hemodiafiltración (HDF)',
      type: 'Transitorio (Estado 3)',
      color: 'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300',
      formula: '\\alpha_{3,6}(t)',
      desc: 'Técnica convectiva de alta pureza (13.18% de prevalentes) con mayor supervivencia.',
      transitionTitle: 'Pase de Hemodiafiltración de Alto Volumen (Estado 3) a Muerte (Estado 6)',
      transitionExplanation: [
        { symbol: '\\alpha_{3,6}(t)', label: 'Tasa o intensidad de transición instantánea desde Hemodiafiltración (Estado 3) hacia Muerte (Estado 6) en el instante t.' },
        { symbol: '3', label: 'Estado de Origen: Hemodiafiltración de Alto Volumen convectivo.' },
        { symbol: '6', label: 'Estado de Destino: Muerte (Estado absorbente definitivo).' },
        { symbol: 't', label: 'Tiempo de exposición bajo la modalidad convectiva.' }
      ]
    },
    {
      id: 4,
      name: 'Lista de Espera (LE)',
      type: 'Transitorio (Estado 4)',
      color: 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300',
      formula: '\\alpha_{4,5}(t)',
      desc: 'Estado de aptitud clínica activa registrado ante el SINTRA / INCUCAI.',
      transitionTitle: 'Pase de Lista de Espera SINTRA (Estado 4) a Trasplante Renal Activo (Estado 5)',
      transitionExplanation: [
        { symbol: '\\alpha_{4,5}(t)', label: 'Tasa o intensidad de transición instantánea de asignación de injerto renal desde Lista de Espera (Estado 4) hacia Trasplante Activo (Estado 5) en el instante t.' },
        { symbol: '4', label: 'Estado de Origen: Lista de Espera activa en SINTRA/INCUCAI.' },
        { symbol: '5', label: 'Estado de Destino: Trasplante Renal Activo (Salida exitosa del pasivo dialítico continuo).' },
        { symbol: 't', label: 'Tiempo de espera acumulado en la lista oficial de procuración.' }
      ]
    },
    {
      id: 5,
      name: 'Trasplante (TR)',
      type: 'Absorbente / Exitoso (Estado 5)',
      color: 'border-purple-500 bg-purple-500/10 text-purple-900 dark:text-purple-300',
      formula: '\\text{Cese de Pasivo}',
      desc: 'Restauración de la función renal con mantenimiento de inmunosupresores.',
      transitionTitle: 'Salida del Pasivo Dialítico Continuo (Estado 5)',
      transitionExplanation: [
        { symbol: '\\text{Cese}', label: 'Cese del tratamiento dialítico continuo por restauración orgánica de la función renal.' },
        { symbol: '5', label: 'Estado Alcanzado: Trasplante Renal Activo.' },
        { symbol: 'Ahorro', label: 'Elimina el costo operativo trisemanal de diálisis, requiriendo solo previsión de inmunosupresores.' }
      ]
    },
    {
      id: 6,
      name: 'Muerte (M)',
      type: 'Absorbente / Evento Falla (Estado 6)',
      color: 'border-rose-500 bg-rose-500/10 text-rose-900 dark:text-rose-300',
      formula: '\\mu_{x+t}^{(\\tau)}',
      desc: 'Estado absorbente final del modelo multiestado.',
      transitionTitle: 'Fuerza de Mortalidad Global Acumulada (Estado 6)',
      transitionExplanation: [
        { symbol: '\\mu_{x+t}^{(\\tau)}', label: 'Fuerza instantánea de mortalidad global a la edad x+t sumando todas las causas de falla en diálisis.' },
        { symbol: 'x+t', label: 'Edad alcanzada por el paciente en el tiempo t.' },
        { symbol: '\\tau', label: 'Suma de todas las causas biológicas competitivas de fallecimiento.' }
      ]
    }
  ];

  return (
    <div className="space-y-6">

      {/* Encabezado del Punto 3 */}
      <div className={`border-b pb-4 border-slate-300 dark:border-slate-800`}>
        <span className={`text-xs font-black uppercase tracking-wider text-teal-800 dark:text-teal-400`}>
          Punto 3 • Procesos Estocásticos
        </span>
        <h3 className={`text-3xl sm:text-4xl font-black mt-1 text-slate-950 dark:text-white`}>
          Modelo Multiestado de Markov: Transiciones Dinámicas
        </h3>
      </div>

      {/* Botones de Control de Revelado (4 Apartados) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={() => setActiveTab(activeTab === 'problema' ? null : 'problema')}
          className={`p-3 rounded-xl border text-sm font-bold transition-all duration-200 flex items-center justify-between ${activeTab === 'problema'
            ? 'bg-rose-50 border-rose-500 text-slate-900 shadow-md ring-2 ring-rose-500 dark:bg-rose-500/20 dark:border-rose-500 dark:text-rose-300'
            : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-rose-50/50 hover:border-rose-400 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:border-rose-500/50 dark:hover:text-white'
            }`}
        >
          <span>1. ¿Por qué Markov?</span>
          <span>{activeTab === 'problema' ? '👁️' : '🙈'}</span>
        </button>

        <button
          onClick={() => setActiveTab(activeTab === 'diagrama' ? null : 'diagrama')}
          className={`p-3 rounded-xl border text-sm font-bold transition-all duration-200 flex items-center justify-between ${activeTab === 'diagrama'
            ? 'bg-teal-50 border-teal-500 text-slate-900 shadow-md ring-2 ring-teal-500 dark:bg-teal-500/20 dark:border-teal-500 dark:text-teal-300'
            : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-teal-50/50 hover:border-teal-400 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:border-teal-500/50 dark:hover:text-white'
            }`}
        >
          <span>2. Diagrama de los 6 Estados</span>
          <span>{activeTab === 'diagrama' ? '👁️' : '🙈'}</span>
        </button>

        <button
          onClick={() => setActiveTab(activeTab === 'matriz' ? null : 'matriz')}
          className={`p-3 rounded-xl border text-sm font-bold transition-all duration-200 flex items-center justify-between ${activeTab === 'matriz'
            ? 'bg-cyan-50 border-cyan-500 text-slate-900 shadow-md ring-2 ring-cyan-500 dark:bg-cyan-500/20 dark:border-cyan-500 dark:text-cyan-300'
            : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-cyan-50/50 hover:border-cyan-400 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:border-cyan-500/50 dark:hover:text-white'
            }`}
        >
          <span>3. Matriz de Transición de Estados</span>
          <span>{activeTab === 'matriz' ? '👁️' : '🙈'}</span>
        </button>

        <button
          onClick={() => setActiveTab(activeTab === 'conflicto' ? null : 'conflicto')}
          className={`p-3 rounded-xl border text-sm font-bold transition-all duration-200 flex items-center justify-between ${activeTab === 'conflicto'
            ? 'bg-amber-50 border-amber-600 text-slate-950 shadow-md ring-2 ring-amber-600 dark:bg-amber-500/20 dark:border-amber-500 dark:text-amber-300'
            : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-amber-50/50 hover:border-amber-400 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:border-amber-500/50 dark:hover:text-white'
            }`}
        >
          <span>4. El Conflicto Metodológico</span>
          <span>{activeTab === 'conflicto' ? '👁️' : '🙈'}</span>
        </button>
      </div>

      {/* APARTADO 1: POR QUÉ MARKOV */}
      {activeTab === 'problema' && (
        <div className={`p-5 rounded-2xl border transition-all bg-rose-50 border-rose-500 text-slate-950 font-medium dark:bg-slate-950 dark:border-rose-500/30 dark:text-slate-300`}>
          <h4 className={`text-sm font-black uppercase tracking-wider text-rose-950 dark:text-rose-400`}>⚠️ 1. El Problema de la Rigidez Biométrica</h4>
          <p className="text-base sm:text-lg leading-relaxed mt-1">
            Un paciente en diálisis no permanece estático en un solo estado. Cambia de técnica (ej. de DP a HD), entra y sale de Lista de Espera, se trasplanta o recupera su función renal, y vuelve a un estado activo "en tratamiento". <br /><br />Tratar la trayectoria como un evento binario simple destruye la precisión del costo actuarial acumulado.
          </p>
        </div>
      )}

      {/* APARTADO 3: LA MATRIZ DE TRANSICIÓN Y FÓRMULAS */}
      {activeTab === 'matriz' && (
        <div className={`p-5 rounded-2xl border transition-all bg-teal-50 border-teal-500 text-slate-950 font-medium dark:bg-slate-950 dark:border-teal-500/30 dark:text-slate-300`}>
          <div className="flex items-center justify-between">
            <h4 className={`text-sm font-black uppercase tracking-wider text-teal-950 dark:text-teal-400`}>💡 2. La Solución: Matriz Estocástica de Markov</h4>
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
        <div className={`p-5 rounded-2xl border transition-all bg-emerald-50 border-emerald-500 text-slate-950 font-medium dark:bg-slate-950 dark:border-emerald-500/30 dark:text-slate-300`}>
          <h4 className={`text-sm font-black uppercase tracking-wider mb-2 text-emerald-950 dark:text-emerald-400`}>🕹️ 3. Diagrama Estocástico de Estados S</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {states.map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedState(st)}
                className={`p-3 rounded-xl border text-left transition ${st.color} ${selectedState?.id === st.id ? 'ring-2 ring-slate-900 dark:ring-white font-black' : ''
                  } ${!isDarkMode ? 'bg-white shadow-sm hover:bg-slate-100 border-slate-300' : ''}`}
              >
                <div className="text-xs font-black text-slate-950 dark:text-white">{st.name}</div>
                <div className="text-xs opacity-90 font-bold">{st.type}</div>
              </button>
            ))}
          </div>

          {selectedState && (
            <div className="space-y-3 mt-3">

              {/* DIV 1 (SUPERIOR): Título, Descripción y Ecuación Gigante a la Derecha */}
              <div className={`p-5 rounded-xl border flex items-center justify-between min-h-[96px] bg-white border-emerald-300 shadow-sm text-slate-950 dark:bg-slate-900 dark:border-slate-800`}>
                <div className="space-y-1.5 max-w-[65%]">
                  <span className="font-black text-base sm:text-lg text-teal-700 dark:text-teal-400 block">
                    {selectedState.name}
                  </span>
                  <p className="font-semibold text-base sm:text-lg leading-relaxed">{selectedState.desc}</p>
                </div>

                <div className="flex items-center justify-end text-teal-600 dark:text-teal-300 shrink-0 pl-4">
                  <MathJaxFormula formula={selectedState.formula} className="text-3xl sm:text-4xl md:text-5xl font-extrabold" />
                </div>
              </div>

              {/* DIV 2 (INFERIOR): Título del Pase de Estado y Desglose de Variables */}
              <div className={`p-5 rounded-xl border space-y-3 bg-teal-50/80 border-teal-300 shadow-sm text-slate-950 dark:bg-slate-900/90 dark:border-teal-500/30`}>
                {/* Título de la Transición */}
                <div className="flex items-center gap-2 border-b pb-2.5 border-teal-500/20">
                  <span className="text-base">🔄</span>
                  <h5 className={`font-extrabold text-base sm:text-lg text-teal-950 dark:text-teal-300`}>
                    {selectedState.transitionTitle}
                  </h5>
                </div>

                {/* Desglose de Cada Variable */}
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Desglose de Parámetros y Significado:
                  </span>
                  <ul className="space-y-2">
                    {selectedState.transitionExplanation.map((exp, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                        <span className={`font-extrabold font-serif px-2 py-0.5 rounded border text-xs shrink-0 bg-white border-teal-400 text-teal-900 shadow-xs dark:bg-slate-800 dark:border-teal-500/40 dark:text-teal-300`}>
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
          <h4 className={`text-sm font-black uppercase tracking-wider text-amber-950 dark:text-amber-400`}>🔥 4. El Conflicto para la Práctica Real</h4>
          <p className="text-base sm:text-lg leading-relaxed mt-1">
            El modelo de Markov teórico es perfecto en los papeles, pero <strong>¿de dónde sacamos las tasas de mortalidad reales ajustadas por comorbilidades en Argentina?</strong> Las tablas de mortalidad generales de población no sirven para pacientes en diálisis.
          </p>
          <div className={`p-3 rounded-xl border mt-2 text-xs font-black bg-amber-200 border-amber-400 text-amber-950 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-200`}>
            👉 Próximo paso (Punto 4): La Tabla Actuarial Híbrida basada en el Registro Argentino de Diálisis.
          </div>
        </div>
      )}

    </div>
  );
}
