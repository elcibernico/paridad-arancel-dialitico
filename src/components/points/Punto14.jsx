import React from 'react';
import { MathJaxFormula } from '../MathJaxFormula';

export default function Punto14() {
  return (
    <div className="space-y-6">
      {/* NARRATIVA DE CIERRE */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        {/*<span className="text-xs font-black uppercase tracking-widest text-teal-400">
          🎓 Epílogo Aplicado • Conclusión Metodológica
        </span>*/}
        <h2 className="text-xl font-black text-white">
          La Síntesis Unificada de la Paridad Arancelaria
        </h2>

        <div className="text-[20px] border-l-4 border-teal-500 pl-4 italic text-slate-300 text-xs leading-relaxed space-y-2">
          <p>
            "La paridad técnica arancelaria no es un indicador estático. Constituye la intersección donde
            el comportamiento histórico del financiamiento (análisis retrospectivo) se concilia con la estructura de costos reales
            (ecuación polinómica) y los escenarios futuros de inflación y rezago (análisis prospectivo)."
          </p>
          <br />
          <p>
            "El objetivo final del modelo es determinar un arancel de equilibrio que no solo cubra los costos de hoy,
            sino que además absorba el daño acumulado en el pasado y prevea la erosión del valor en el futuro."
          </p>
        </div>
      </div>

      {/* DASHBOARD INTEGRADO DE VINCULACIÓN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ESTRUCTURA POLINÓMICA */}
        <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-yellow-500 block border-b border-slate-800 pb-1.5">
            ⚙️ 1. Estructura de Paridad Polinómica
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">
            Establece los pesos técnicos relativos de la actividad (45% salarios CCT, 35% insumos dolarizados USD, 20% gastos generales IPC),
            definiendo la velocidad objetiva de actualización arancelaria.
          </p>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 text-center overflow-x-auto">
            <MathJaxFormula formula="I^P_t = w_{CCT} I^{CCT}_t + w_{USD} I^{USD}_t + w_{IPC} I^{IPC}_t" />
          </div>
        </div>

        {/* MODELO RETROSPECTIVO */}
        <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-cyan-400 block border-b border-slate-800 pb-1.5">
            🔍 2. Análisis Retrospectivo
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">
            Identifica el daño acumulado histórico. Utiliza la regresión MCO y Ridge para aislar la colinealidad macroeconómica
            y medir la brecha acumulada real y la erosión generada por el rezago financiero (Time Lag).
          </p>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 text-center overflow-x-auto">
            <MathJaxFormula formula="\text{Daño Retro} = \sum_{t \in \text{historia}} (Y_t - V^P_t)" />
          </div>
        </div>

        {/* MODELO PROSPECTIVO */}
        <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-400 block border-b border-slate-800 pb-1.5">
            🔮 3. Proyección Prospectiva
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">
            Simula las trayectorias futuras recursivas ante shocks macroeconómicos y plazos de pago proyectados,
            asegurando la sostenibilidad operativa ante la erosión esperada.
          </p>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 text-center">
            <MathJaxFormula formula="Y_{T+k} = Y_{T+k-1} (1 + g_{OS})" />
          </div>
        </div>
      </div>

      {/* PROPUESTA DE ARANCEL DE EQUILIBRIO UNIFICADO */}
      <div className="p-5 rounded-2xl border bg-slate-900/50 border-slate-850 shadow-md space-y-4">
        <span className="text-xs font-black uppercase tracking-wider text-teal-400 block border-b border-slate-850 pb-1.5">
          💡 Ecuación de Vinculación y Recomposición Arancelaria (Arancel Objetivo)
        </span>
        <p className="text-xs text-slate-300 leading-relaxed">
          Para restablecer el equilibrio económico-financiero de la clínica, definimos el <strong>Arancel de Equilibrio Recompuesto (<MathJaxFormula formula="Y^*_T" />)</strong>.
          Este valor unifica el costo polinómico de paridad del mes actual con un factor de amortización de pérdida pasada
          y una prima de cobertura de riesgos (macroeconómicos) futuros:
        </p>

        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-center my-3 overflow-x-auto">
          <MathJaxFormula formula="Y^*_T = V^P_T + \Delta_{\text{recuperación}} + \Phi_{\text{prospectiva}}" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-400 leading-relaxed">
          <div className="p-3 bg-slate-950/30 rounded-xl border border-slate-850">
            <strong className="text-yellow-500 block mb-1">1. Paridad Polinómica Real (<MathJaxFormula formula="V^P_T" />)</strong>
            Garantiza la cobertura del 100% de la estructura de costos actual ponderada (CCT, USD, IPC).
          </div>
          <div className="p-3 bg-slate-950/30 rounded-xl border border-slate-850">
            <strong className="text-cyan-400 block mb-1">2. Amortización Pasada (<MathJaxFormula formula="\Delta_{\text{recuperación}}" />)</strong>
            Recompone progresivamente la pérdida institucional acumulada generada por la brecha histórica y el retraso en el cobro (Time Lag).
          </div>
          <div className="p-3 bg-slate-950/30 rounded-xl border border-slate-850">
            <strong className="text-emerald-400 block mb-1">3. Cobertura Prospectiva (<MathJaxFormula formula="\Phi_{\text{prospectiva}}" />)</strong>
            Cubre de manera predictiva la pérdida por erosión nominal futura calculada a partir del plazo de pago de la obra social y las expectativas de variaciones macroeconómicas.
          </div>
        </div>
      </div>
    </div>
  );
}
