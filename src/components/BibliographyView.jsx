import React from 'react';

export default function BibliographyView() {
  const bibliografia = [
    {
      titulo: "La diálisis crónica en la República Argentina: Registro de pacientes 2023-2024",
      autores: "Sanz, M., Demartis, P. N., et al.",
      editorial: "Sociedad Argentina de Nefrología & INCUCAI",
      año: 2024
    },
    {
      titulo: "Survival analysis: A self-learning text",
      autores: "Kleinbaum, D. G., & Klein, M.",
      editorial: "Springer Science & Business Media",
      año: 2012
    },
    {
      titulo: "Applied Regression Analysis and Generalized Linear Models",
      autores: "Fox, J.",
      editorial: "SAGE Publications",
      año: 2015
    },
    {
      titulo: "Ridge Regression: Biased Estimation for Nonorthogonal Problems",
      autores: "Hoerl, A. E., & Kennard, R. W.",
      editorial: "Technometrics, 12(1), 55-67",
      año: 1970
    },
    {
      titulo: "Análisis Actuarial de Sistemas de Salud y Modelos de Riesgos Competitivos",
      autores: "Demartis, Pablo Nicolás",
      editorial: "Trabajo Maestro, UNR - FCECON",
      año: 2025
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="border-b pb-4 mb-6 border-slate-800">
        <h2 className="text-3xl font-extrabold text-white">Bibliografía Consultada</h2>
        <p className="text-sm text-slate-400 mt-1">Fuentes académicas, bases de datos y registros oficiales utilizados en el estudio actuarial y econométrico.</p>
      </div>

      <div className="space-y-4">
        {bibliografia.map((item, idx) => (
          <div key={idx} className="p-5 rounded-2xl border bg-slate-900/50 border-slate-800 hover:border-teal-500/35 transition-all">
            <h3 className="text-lg font-bold text-teal-400">“{item.titulo}”</h3>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-400 mt-2">
              <span className="font-semibold text-slate-300">{item.autores}</span>
              <span className="text-slate-650">•</span>
              <span className="italic">{item.editorial}</span>
              <span className="text-slate-650">•</span>
              <span className="font-mono text-xs px-2 py-0.5 bg-slate-850 rounded border border-slate-800 text-teal-300">{item.año}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
