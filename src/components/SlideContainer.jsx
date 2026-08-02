import React from 'react';

export default function SlideContainer({ section, children, currentPoint, totalPoints, onNext, onPrev }) {
  return (
    <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Encabezado del Punto/Diapositiva */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-6 mb-8 gap-4 border-slate-300 dark:border-slate-800">
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs mb-3 border bg-teal-100 text-teal-950 border-teal-300 font-extrabold dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20 dark:font-bold">
            {section.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {section.title}
          </h2>
          <p className="text-sm sm:text-base mt-1 font-semibold text-slate-800 dark:text-slate-400">
            {section.subtitle}
          </p>
        </div>

        {/* Controles de Navegación Diapositiva */}
        <div className="flex items-center space-x-3 self-end md:self-center">
          <button
            onClick={onPrev}
            disabled={currentPoint === 1}
            className="flex items-center space-x-1 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold border transition disabled:opacity-40 disabled:cursor-not-allowed bg-white hover:bg-slate-100 text-slate-900 border-slate-300 shadow-md dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700"
          >
            <span>← Anteriores</span>
          </button>
          
          <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-400">
            {currentPoint} / {totalPoints}
          </span>

          <button
            onClick={onNext}
            disabled={currentPoint === totalPoints}
            className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-600 text-white disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-black transition shadow-lg shadow-teal-700/20"
          >
            <span>Siguiente →</span>
          </button>
        </div>
      </div>

      {/* Área Principal Dinámica adaptada a Blanco en Modo Claro / Gris Oscuro en Modo Oscuro */}
      <div className="flex-1 rounded-2xl p-6 sm:p-8 border transition-colors duration-200 bg-white border-slate-300 text-slate-900 shadow-xl shadow-slate-200/50 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-100">
        {children}
      </div>

    </div>
  );
}
