import React from 'react';
import config from '../config.json';

export default function Header({ currentPoint, setCurrentPoint }) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md transition-colors duration-200 border-b bg-slate-900/90 border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Título */}
          <div className="flex items-center space-x-4 cursor-pointer" onClick={() => setCurrentPoint(1)}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-bold text-xl shadow-lg shadow-teal-500/20">
              Σ
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                {config.header.author}
              </div>
              <h1 className="text-base font-bold leading-tight text-white">
                {config.header.title}
              </h1>
              <div className="text-xs hidden sm:block text-slate-400">
                {config.header.subtitle}
              </div>
            </div>
          </div>

          {/* Navegador de Puntos y Controles */}
          <div className="flex items-center space-x-3 sm:space-x-6">
            
            {/* Selector desplegable de Puntos */}
            <div className="relative">
              <select
                value={currentPoint}
                onChange={(e) => setCurrentPoint(Number(e.target.value))}
                className="text-xs sm:text-sm font-medium py-2 px-3 sm:px-4 pr-8 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer bg-slate-800 text-slate-200 border-slate-700"
              >
                {config.sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    Punto {sec.id}: {sec.title.split(':')[1] || sec.title}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l0.707 0.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
