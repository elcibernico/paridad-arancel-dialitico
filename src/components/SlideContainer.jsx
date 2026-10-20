import React from 'react';

export default function SlideContainer({
  section,
  children,
  currentPoint,
  totalPoints,
  onNext,
  onPrev,
  sections = [],
  onSelectSection,
  showSelect = false
}) {
  return (
    <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Encabezado del Punto/Diapositiva */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-6 mb-8 gap-4 border-slate-300 dark:border-slate-800">
        <div>
          {section.badge && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs mb-3 border bg-teal-100 text-teal-950 border-teal-300 font-extrabold dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20 dark:font-bold">
              {section.badge}
            </span>
          )}
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {section.title}
          </h2>
          <p className="text-sm sm:text-base mt-1 font-semibold text-slate-800 dark:text-slate-400">
            {section.subtitle}
          </p>
        </div>

        {/* Controles de Navegación Diapositiva */}
        <div className="flex items-center flex-wrap gap-2.5 self-end md:self-center">
          <button
            onClick={onPrev}
            disabled={currentPoint === 1}
            className="flex items-center space-x-1 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition disabled:opacity-40 disabled:cursor-not-allowed bg-white hover:bg-slate-100 text-slate-900 border-slate-300 shadow-md dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <span>← Anterior</span>
          </button>

          {/* DESPLEGABLE ELEGIR DIAPOSITIVA (SOLO PARTES 1 Y 3) */}
          {showSelect && sections && sections.length > 0 && (
            <div className="relative flex items-center">
              <select
                value={section.id}
                onChange={(e) => onSelectSection && onSelectSection(e.target.value)}
                className="appearance-none bg-white hover:bg-slate-50 text-slate-800 border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-100 dark:border-slate-700 border text-xs sm:text-sm font-bold py-2 pl-3 pr-8 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer transition max-w-[190px] sm:max-w-[260px] truncate"
                title="Elegir diapositiva"
              >
                {sections.map((s, idx) => (
                  <option
                    key={s.id}
                    value={s.id}
                    className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-1 font-medium"
                  >
                    {idx + 1}. {s.title}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500 dark:text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          )}

          <button
            onClick={onNext}
            disabled={currentPoint === totalPoints}
            className="flex items-center space-x-1 px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-black transition shadow-lg shadow-teal-700/20 cursor-pointer"
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
