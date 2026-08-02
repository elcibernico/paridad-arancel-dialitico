import React from 'react';
import { ChevronLeft, ChevronRight, Calculator, FileText, TrendingUp, Layers, CheckCircle2 } from 'lucide-react';

export default function MainContent({ currentPoint, setCurrentPoint, totalPoints = 15 }) {
  const handlePrev = () => {
    if (currentPoint > 1) setCurrentPoint(currentPoint - 1);
  };

  const handleNext = () => {
    if (currentPoint < totalPoints) setCurrentPoint(currentPoint + 1);
  };

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col justify-between">
      {/* Slide / Section Container */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 md:p-10 border border-slate-800/90 shadow-2xl relative overflow-hidden flex-1 flex flex-col justify-between">
        
        {/* Subtle background glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Content Header */}
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-400 bg-teal-950/80 border border-teal-800/60 rounded-full">
              Punto {currentPoint} de {totalPoints}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              SOP Arquitectura Actuarial
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            {currentPoint === 1 ? 'Evaluación Actuarial y Paridad Arancelaria' : `Análisis Actuarial del Punto ${currentPoint}`}
          </h2>

          <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed max-w-3xl">
            {currentPoint === 1 
              ? 'Estudio exhaustivo sobre la estructura de costos dialíticos, variabilidad macroeconómica (IPC/USD) y equilibrio financiero en centros de hemodiálisis.'
              : `Desarrollo formal del punto ${currentPoint} del documento "Trabajo Final - Paridad Técnica Arancel Dialítico". Integración de modelos econométricos e indicadores de paridad.`
            }
          </p>
        </div>

        {/* Dynamic Card / Demo Simulator Preview */}
        <div className="my-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/50 transition-all">
            <div className="p-2 w-fit rounded-lg bg-teal-500/10 text-teal-400 mb-3">
              <Calculator className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">Paridad Dialítica</h3>
            <p className="text-xs text-slate-400 mt-1">Cálculo de cobertura arancelaria ajustada por estructura de insumos importados.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 transition-all">
            <div className="p-2 w-fit rounded-lg bg-emerald-500/10 text-emerald-400 mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">Series Temporales</h3>
            <p className="text-xs text-slate-400 mt-1">Simulación de inflación y fluctuación cambiaria sobre la matriz de costos.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 transition-all">
            <div className="p-2 w-fit rounded-lg bg-indigo-500/10 text-indigo-400 mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">Sensibilidad Actuarial</h3>
            <p className="text-xs text-slate-400 mt-1">Simuladores de escenarios con datos estáticos locales (.xlsx / .csv).</p>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentPoint === 1}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              currentPoint === 1
                ? 'opacity-40 cursor-not-allowed bg-slate-900 text-slate-600'
                : 'bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <div className="flex items-center space-x-1.5">
            {Array.from({ length: totalPoints }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPoint(num)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  num === currentPoint 
                    ? 'bg-teal-400 w-6' 
                    : 'bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Ir al Punto ${num}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentPoint === totalPoints}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              currentPoint === totalPoints
                ? 'opacity-40 cursor-not-allowed bg-slate-900 text-slate-600'
                : 'bg-teal-600 text-white hover:bg-teal-500 shadow-lg shadow-teal-600/20'
            }`}
          >
            <span>Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </main>
  );
}
