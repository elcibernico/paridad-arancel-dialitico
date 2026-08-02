import React, { useState } from 'react';
import { MathJaxFormula } from '../MathJaxFormula';

export default function Punto1() {
  const [activeTab, setActiveTab] = useState(null);

  return (
    <div className="space-y-8">
      
      {/* Encabezado Narrativo */}
      <div className="border-b pb-4 border-slate-300 dark:border-slate-800">
        <span className="text-sm font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
          El Dilema Inicial
        </span>
        <h3 className="text-3xl sm:text-4xl font-extrabold mt-1 text-slate-900 dark:text-white">
          Definir el Valor Actual Actuarial de Diálisis (VAAD) de un paciente que HOY inicia tratamiento sustitutivo.
        </h3>
        <p className="text-base sm:text-lg mt-2 leading-relaxed text-slate-800 font-normal dark:text-slate-300">
          El punto de equilibrio de largo plazo entre el financiador (obra social, entidad de la seguridad social o prepaga) y el prestador especializado (centro de diálisis autónomo o red nefrológica).<br /><br />
          Denominamos Valor Actual Actuarial de Diálisis (VAAD), el cual se define formalmente como la prima única pura; es decir, “<i>el valor presente esperado de la totalidad de las erogaciones financieras futuras en las que incurrirá la entidad de cobertura médica por un paciente desde el momento exacto de su ingreso al tratamiento sustitutivo y durante toda su vida remanente</i>”.<br />
        </p>
      </div>

      {/* Controles de Revelado Narrativo: 4 Pasos Progresivos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        
        {/* Tarjeta 1: La Pregunta de Fondo */}
        <button
          onClick={() => setActiveTab(activeTab === 'pregunta' ? null : 'pregunta')}
          className={`p-4 rounded-xl border text-left transition-all duration-200 ${
            activeTab === 'pregunta'
              ? 'bg-teal-50 border-teal-600 text-slate-900 shadow-md ring-2 ring-teal-600 dark:bg-teal-500/10 dark:border-teal-500 dark:text-white dark:shadow-lg dark:shadow-teal-500/10'
              : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100 font-semibold dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">❓</span>
            <span className="text-sm font-bold px-2 py-0.5 rounded bg-teal-800 text-white dark:bg-slate-800 dark:text-teal-400">
              {activeTab === 'pregunta' ? 'Ocultar' : 'Explorar'}
            </span>
          </div>
          <h4 className="font-bold text-sm sm:text-base mb-1 text-slate-900 dark:text-white">
            1. El Enigma Financiero
          </h4>
          <p className="text-xs text-slate-700 dark:text-slate-400">
            El desafío de calcular el VAAD.
          </p>
        </button>

        {/* Tarjeta 2: Las 3 Dimensiones de Riesgo */}
        <button
          onClick={() => setActiveTab(activeTab === 'variables' ? null : 'variables')}
          className={`p-4 rounded-xl border text-left transition-all duration-200 ${
            activeTab === 'variables'
              ? 'bg-emerald-50 border-emerald-600 text-slate-900 shadow-md ring-2 ring-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500 dark:text-white dark:shadow-lg dark:shadow-emerald-500/10'
              : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100 font-semibold dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🎲</span>
            <span className="text-sm font-bold px-2 py-0.5 rounded bg-emerald-800 text-white dark:bg-slate-800 dark:text-emerald-400">
              {activeTab === 'variables' ? 'Ocultar' : 'Explorar'}
            </span>
          </div>
          <h4 className="font-bold text-sm sm:text-base mb-1 text-slate-900 dark:text-white">
            2. Las 3 Incertidumbres
          </h4>
          <p className="text-xs text-slate-700 dark:text-slate-400">
            Biométrica, Financiera y Operativa.
          </p>
        </button>

        {/* Tarjeta Intermedia NUEVA: Necesidad de la Tabla Actuarial */}
        <button
          onClick={() => setActiveTab(activeTab === 'tabla_necesidad' ? null : 'tabla_necesidad')}
          className={`p-4 rounded-xl border text-left transition-all duration-200 ${
            activeTab === 'tabla_necesidad'
              ? 'bg-cyan-50 border-cyan-600 text-slate-900 shadow-md ring-2 ring-cyan-600 dark:bg-cyan-500/10 dark:border-cyan-500 dark:text-white dark:shadow-lg dark:shadow-cyan-500/10'
              : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100 font-semibold dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">📊</span>
            <span className="text-sm font-bold px-2 py-0.5 rounded bg-cyan-800 text-white dark:bg-slate-800 dark:text-cyan-400">
              {activeTab === 'tabla_necesidad' ? 'Ocultar' : 'Explorar'}
            </span>
          </div>
          <h4 className="font-bold text-sm sm:text-base mb-1 text-slate-900 dark:text-white">
            3. La Necesidad de la Tabla
          </h4>
          <p className="text-xs text-slate-700 dark:text-slate-400">
            Construir la Tabla Actuarial de Diálisis.
          </p>
        </button>

        {/* Tarjeta 4: El Punto de Quiebre */}
        <button
          onClick={() => setActiveTab(activeTab === 'paradigma' ? null : 'paradigma')}
          className={`p-4 rounded-xl border text-left transition-all duration-200 ${
            activeTab === 'paradigma'
              ? 'bg-amber-50 border-amber-600 text-slate-900 shadow-md ring-2 ring-amber-600 dark:bg-amber-500/10 dark:border-amber-500 dark:text-white dark:shadow-lg dark:shadow-amber-500/10'
              : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100 font-semibold dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">⚡</span>
            <span className="text-sm font-bold px-2 py-0.5 rounded bg-amber-800 text-white dark:bg-slate-800 dark:text-amber-400">
              {activeTab === 'paradigma' ? 'Ocultar' : 'Explorar'}
            </span>
          </div>
          <h4 className="font-bold text-sm sm:text-base mb-1 text-slate-900 dark:text-white">
            4. El Punto de Quiebre
          </h4>
          <p className="text-xs text-slate-700 dark:text-slate-400">
            Falla de la supervivencia médica en actuaría.
          </p>
        </button>

      </div>

      {/* Contenido Revelado Dinámicamente */}
      {activeTab === 'pregunta' && (
        <div className={`p-6 rounded-2xl border transition-all bg-teal-50/50 border-teal-500 text-slate-800 font-normal dark:bg-slate-950 dark:border-teal-500/30 dark:text-slate-300`}>
          <h4 className={`text-xl font-bold text-teal-900 dark:text-teal-400`}>
            El Planteo del VAAD
          </h4>
          <p className="text-base leading-relaxed mt-2">
            Teóricamente, el <strong>Valor Actual Actuarial de Diálisis (VAAD)</strong> intenta responder: <em>"¿Qué suma de dinero debería reservarse hoy para cubrir todos los costos dialíticos futuros de un paciente hasta su fallecimiento o trasplante?"</em>
          </p>
          <div className={`p-4 rounded-xl border mt-3 text-sm bg-white border-teal-200 text-slate-800 shadow-sm dark:bg-slate-900/90 dark:border-slate-800 dark:text-slate-300`}>
            <p className={`font-bold text-slate-900 dark:text-slate-200`}>🔍 El problema implícito:</p>
            <p className="mt-1">Para calcular ese monto actuarial se requiere conocer dos cosas con precisión absoluta: la <strong>sobrevivencia exacta del paciente</strong> en el tiempo y la <strong>evolución de la inflación médica</strong>.</p>
          </div>
        </div>
      )}

      {activeTab === 'variables' && (
        <div className={`p-6 rounded-2xl border transition-all bg-emerald-50/50 border-emerald-500 text-slate-800 font-normal dark:bg-slate-950 dark:border-emerald-500/30 dark:text-slate-300`}>
          <h4 className={`text-xl font-bold text-emerald-900 dark:text-emerald-400`}>
            Las 3 Dimensiones de transferencia del riesgo (Financiadora al prestador)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
            <div className={`p-4 rounded-xl border bg-white border-emerald-200 shadow-sm dark:bg-slate-900 dark:border-slate-800`}>
              <h5 className={`font-bold text-base mb-1 text-slate-900 dark:text-white`}>1. Biométrica</h5>
              <p className={`text-sm text-slate-700 dark:text-slate-400`}>¿Cuánto tiempo vive el paciente y cuándo se trasplanta?</p>
            </div>
            <div className={`p-4 rounded-xl border bg-white border-emerald-200 shadow-sm dark:bg-slate-900 dark:border-slate-800`}>
              <h5 className={`font-bold text-base mb-1 text-slate-900 dark:text-white`}>2. Financiera</h5>
              <p className={`text-sm text-slate-700 dark:text-slate-400`}>¿A qué ritmo crecen los insumos dolarizados y los salarios de salud?</p>
            </div>
            <div className={`p-4 rounded-xl border bg-white border-emerald-200 shadow-sm dark:bg-slate-900 dark:border-slate-800`}>
              <h5 className={`font-bold text-base mb-1 text-slate-900 dark:text-white`}>3. Operativa</h5>
              <p className={`text-sm text-slate-700 dark:text-slate-400`}>¿Cuánto tarda la obra social en ajustar el arancel nominal?</p>
            </div>
          </div>
        </div>
      )}

      {/* NUEVO APARTADO: LA NECESIDAD DE LA TABLA ACTUARIAL DE DIÁLISIS */}
      {activeTab === 'tabla_necesidad' && (
        <div className={`p-6 rounded-2xl border transition-all bg-cyan-50/50 border-cyan-500 text-slate-800 font-normal dark:bg-slate-950 dark:border-cyan-500/30 dark:text-slate-300`}>
          <h4 className={`text-xl font-bold text-cyan-900 dark:text-cyan-400`}>
            El Requisito Técnico: Construir una Tabla de Mortalidad Actuarial Específica
          </h4>
          <p className="text-base leading-relaxed mt-2">
            En la práctica actuarial aplicada a la salud y en la valoración de pasivos contingentes de alta complejidad, la estimación precisa de la curva de supervivencia de los pacientes que ingresan a tratamiento sustitutivo es el <strong>factor crítico e indispensable para estructurar la tabla actuarial de flujos de fondos del VAAD</strong>.
          </p>
          <div className={`p-4 rounded-xl border mt-3 text-sm bg-white border-cyan-200 text-slate-800 shadow-sm dark:bg-slate-900/90 dark:border-slate-800 dark:text-slate-300`}>
            <p className={`font-bold text-slate-900 dark:text-slate-200`}>📌 El imperativo metodológico:</p>
            <p className="mt-1">
              Las tablas de mortalidad generales de la población no aplican a la insuficiencia renal crónica. Necesitamos construir una <strong>Tabla Actuarial de Diálisis</strong> que traduzca las probabilidades biométricas en tasas de exposición financiera mensualizadas.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'paradigma' && (
        <div className={`p-6 rounded-2xl border transition-all bg-amber-50/50 border-amber-500 text-slate-800 font-normal dark:bg-slate-950 dark:border-amber-500/30 dark:text-slate-300`}>
          <h4 className={`text-xl font-bold text-amber-900 dark:text-amber-400`}>
            La Semilla del Conflicto: Falla de la Literatura Nefrológica Clásica para los calculos ACTUARIALES financieros
          </h4>
          <p className="text-base leading-relaxed mt-2">
            Tradicionalmente, la literatura nefrológica y los modelos de gestión han utilizado el estimador de <strong>Kaplan-Meier</strong> para calcular esa supervivencia. Sin embargo, cuando pretendemos usar Kaplan-Meier para armar la tabla actuarial, <strong>descubrimos que introduce un sesgo de sobreestimación sistemática de la mortalidad en diálisis</strong>.
          </p>
          <div className={`p-4 rounded-xl border mt-3 text-sm bg-amber-100 border-amber-300 text-amber-900 font-bold dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-200`}>
            <strong>Siguiente Desafío (Punto 2):</strong> Analizaremos cómo el estimador de Kaplan-Meier distorsiona las probabilidades de la tabla actuarial argentina al ignorar la competencia del Trasplante Renal.
          </div>
        </div>
      )}

    </div>
  );
}
