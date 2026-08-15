import React, { useState, useMemo } from 'react';
import { MathJaxFormula } from '../MathJaxFormula';
import { useAuth } from '../../context/AuthContext';
import { useGlobalParams } from '../../context/GlobalContext';
import seriesData from '../../data/seriesData.json';
import { fmtAR, fmtLatex } from '../../utils/format';

export default function Punto11() {
  const { hasPermission } = useAuth();
  const {
    modalidadDialitica, setModalidadDialitica,
    periodoDesde, setPeriodoDesde,
    periodoHasta, setPeriodoHasta,
    incidencias, setIncidencias,
    plazoPago, setPlazoPago,
    padronPacientes, setPadronPacientes,
    sesionesMensuales, setSesionesMensuales,
    mesesAmortizacion, setMesesAmortizacion,
    expectativas, setExpectativas,
    tasaDescuento, setTasaDescuento
  } = useGlobalParams();

  const [mostrarVariables, setMostrarVariables] = useState(false);
  const [mostrarMath, setMostrarMath] = useState(false);

  const opcionesModalidades = [
    { id: 'HD', nombre: 'Hemodiálisis Convencional (HD)', campoExcel: 'valorSesionHD', tipoBrecha: 'por sesión' },
    { id: 'DP', nombre: 'Diálisis Peritoneal (DP)', campoExcel: 'valorModuloDP', tipoBrecha: 'por módulo' },
    { id: 'HDF', nombre: 'Hemodiafiltración en Línea (HDF)', campoExcel: 'valorSesionHDF', tipoBrecha: 'por sesión' }
  ];

  const currentMod = opcionesModalidades.find(m => m.id === modalidadDialitica) || opcionesModalidades[0];

  const wCCT = incidencias.cct / 100;
  const wUSD = incidencias.usd / 100;
  const wIPC = incidencias.ipc / 100;
  
  const gIPC = expectativas.ipc;
  const gUSD = expectativas.usd;
  const gCCT = expectativas.cct;

  const setGIPC = (v) => setExpectativas({ ...expectativas, ipc: v });
  const setGUSD = (v) => setExpectativas({ ...expectativas, usd: v });
  const setGCCT = (v) => setExpectativas({ ...expectativas, cct: v });

  // Opciones de periodos
  const periodosHastaFiltrados = seriesData.filter(p => p.periodo);

  // --- CALCULOS UNIFICADOS DE LOS 3 PILARES ---
  const calculations = useMemo(() => {
    // 1. Paridad Polinómica actual V_P_T
    const dT0 = seriesData.find(d => d.periodo === periodoDesde) || seriesData[0];
    const dT = seriesData.find(d => d.periodo === periodoHasta) || seriesData[seriesData.length - 1];

    const indCCT = dT.cct / (dT0.cct || 1);
    const indUSD = dT.usd / (dT0.usd || 1);
    const indIPC = dT.ipc / (dT0.ipc || 1);

    const IP = (wCCT * indCCT) + (wUSD * indUSD) + (wIPC * indIPC);
    const baseVal = dT0[currentMod.campoExcel] || 0;
    const VP_T = baseVal * IP;
    const Y_T = dT[currentMod.campoExcel] || 0;

    // 2. Amortización Pasada (Pérdidas acumuladas históricas netas)
    const filtered = seriesData.filter(d => d.periodo >= periodoDesde && d.periodo <= periodoHasta);
    let unitLossAccumulated = 0;

    filtered.forEach(d => {
      const Y_m = d[currentMod.campoExcel];
      const indCCT_m = d.cct / (dT0.cct || 1);
      const indUSD_m = d.usd / (dT0.usd || 1);
      const indIPC_m = d.ipc / (dT0.ipc || 1);
      const IP_m = (wCCT * indCCT_m) + (wUSD * indUSD_m) + (wIPC * indIPC_m);
      const VP_m = baseVal * IP_m;

      const deficit_m = VP_m - Y_m;
      if (deficit_m > 0) {
        unitLossAccumulated += deficit_m;
      }
    });

    const Delta_recuperacion = mesesAmortizacion > 0 ? unitLossAccumulated / mesesAmortizacion : 0;

    // 3. Cobertura Prospectiva (Erosión futura esperada)
    const timeLagMonths = plazoPago / 30;
    const tem = (tasaDescuento / 100) / 12;
    const factorErosion = Math.pow(1 + gIPC / 100, timeLagMonths) * Math.pow(1 + tem, timeLagMonths);
    const Phi_prospectiva = VP_T * (factorErosion - 1);

    // 4. Arancel Objetivo Final (Equilibrio Recompuesto)
    const Y_star = VP_T + Delta_recuperacion + Phi_prospectiva;

    // Métricas para la clínica
    const sesionesEfectivas = modalidadDialitica === 'DP' ? 1 : sesionesMensuales;
    const totalLossDollar = unitLossAccumulated * padronPacientes * sesionesEfectivas;
    const recuperoMensualDollar = Delta_recuperacion * padronPacientes * sesionesEfectivas;

    return {
      VP_T,
      Y_T,
      unitLossAccumulated,
      Delta_recuperacion,
      Phi_prospectiva,
      Y_star,
      totalLossDollar,
      recuperoMensualDollar,
      factorErosion,
      sesionesEfectivas
    };
  }, [
    periodoDesde,
    periodoHasta,
    modalidadDialitica,
    wCCT, wUSD, wIPC,
    mesesAmortizacion,
    plazoPago,
    expectativas.ipc,
    tasaDescuento,
    padronPacientes,
    sesionesMensuales
  ]);

  // Coordenadas para el gráfico de cascada
  const svgWidth = 500;
  const svgHeight = 280;
  const margin = { top: 40, bottom: 40, left: 65, right: 35 };

  const waterfallBars = useMemo(() => {
    if (!calculations) return [];
    const { VP_T, Delta_recuperacion, Phi_prospectiva, Y_star } = calculations;

    const maxVal = Y_star * 1.05;
    const scaleY = (v) => svgHeight - margin.bottom - (v / maxVal) * (svgHeight - margin.top - margin.bottom);

    const yVP = scaleY(VP_T);
    const hVP = (svgHeight - margin.bottom) - yVP;

    const yDelta = scaleY(VP_T + Delta_recuperacion);
    const hDelta = yVP - yDelta;

    const yPhi = scaleY(Y_star);
    const hPhi = yDelta - yPhi;

    const yStar = scaleY(Y_star);
    const hStar = (svgHeight - margin.bottom) - yStar;

    const w = 55;
    const gap = 30;

    return [
      { label: 'Paridad Vᴾᵀ', x: margin.left + 15, y: yVP, h: hVP, color: '#eab308', val: VP_T, type: 'base' },
      { label: 'Amortiz. Δ', x: margin.left + 15 + w + gap, y: yDelta, h: hDelta, color: '#06b6d4', val: Delta_recuperacion, type: 'add' },
      { label: 'Cobert. Φ', x: margin.left + 15 + (w + gap) * 2, y: yPhi, h: hPhi, color: '#10b981', val: Phi_prospectiva, type: 'add' },
      { label: 'Objetivo Y*', x: margin.left + 15 + (w + gap) * 3, y: yStar, h: hStar, color: '#6366f1', val: Y_star, type: 'base' }
    ];
  }, [calculations]);

  if (!calculations) return null;

  return (
    <div className="space-y-6">
      {/* NARRATIVA DE CIERRE */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <h2 className="text-xl font-black text-white">
          La Síntesis Unificada de la Paridad Arancelaria
        </h2>

        <div className="text-[14px] border-l-4 border-teal-500 pl-4 italic text-slate-300 leading-relaxed space-y-2">
          <p>
            "La paridad técnica arancelaria no es un indicador estático. Constituye la intersección donde
            el comportamiento histórico del financiamiento (análisis retrospectivo) se concilia con la estructura de costos reales
            (ecuación polinómica) y los escenarios futuros de inflación y rezago (análisis prospectivo)."
          </p>
          <p>
            "El objetivo final del modelo es determinar un arancel de equilibrio que no solo cubra los costos de hoy,
            sino que además absorba el daño acumulado en el pasado y prevea la erosión del valor en el futuro."
          </p>
        </div>
      </div>

      {/* DASHBOARD INTEGRADO DE VINCULACIÓN */}
      {/* ------------------------------------------- INI: p3_p5_a1 --------------------------------------------- */}
      {hasPermission('p3_p5_a1') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* ESTRUCTURA POLINÓMICA */}
          <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-yellow-500 block border-b border-slate-800 pb-1.5">
              ⚙️ Estructura de Paridad Polinómica
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Establece los pesos técnicos relativos de la actividad (CCT, USD, IPC), definiendo la velocidad objetiva de actualización arancelaria.
            </p>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 text-center overflow-x-auto">
              <MathJaxFormula formula="I^P_t = w_{CCT} I^{CCT}_t + w_{USD} I^{USD}_t + w_{IPC} I^{IPC}_t" />
            </div>
          </div>

          {/* MODELO RETROSPECTIVO */}
          <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-400 block border-b border-slate-800 pb-1.5">
              🔍 Análisis Retrospectivo
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Identifica el daño acumulado histórico. Utiliza la paridad polinómica comparada con los aranceles reales pagados para medir el desfasaje monetario total.
            </p>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 text-center overflow-x-auto">
              <MathJaxFormula formula="\text{Daño Retro} = \sum_{t \in \text{historia}} (V^P_t - Y_t)" />
            </div>
          </div>

          {/* MODELO PROSPECTIVO */}
          <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400 block border-b border-slate-800 pb-1.5">
              🔮 Proyección Prospectiva
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Simula las pérdidas por el cobro diferido (Time Lag) y la inflación esperada a futuro, estableciendo la prima de cobertura prospectiva.
            </p>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 text-center">
              <MathJaxFormula formula="\text{Cobertura } \Phi = V^P_T \cdot (factorErosi\acute{o}n - 1)" />
            </div>
          </div>
        </div>
      )}
      {/* ------------------------------------------- FIN: p3_p5_a1 --------------------------------------------- */}

      {/* PROPUESTA DE ARANCEL DE EQUILIBRIO UNIFICADO */}
      {/* ------------------------------------------- INI: p3_p5_a2 --------------------------------------------- */}
      {hasPermission('p3_p5_a2') && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border bg-slate-900/40 border-slate-855 shadow-md space-y-4">
            <span className="text-xs font-black uppercase tracking-wider text-teal-400 block border-b border-slate-855 pb-1.5">
              💡 Ecuación de Vinculación y Recomposición Arancelaria (Arancel Objetivo)
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Para restablecer el equilibrio económico-financiero de la clínica, definimos el <strong>Arancel de Equilibrio Recompuesto (<MathJaxFormula formula="Y^*_T" />)</strong>.
              Este valor unifica el costo polinómico de paridad del mes actual con un factor de amortización de pérdida pasada
              y una prima de cobertura de riesgos macroeconómicos futuros:
            </p>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-center my-3 overflow-x-auto">
              <MathJaxFormula formula="Y^*_T = V^P_T + \Delta_{\text{recuperación}} + \Phi_{\text{prospectiva}}" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-400 leading-relaxed">
              <div className="p-3 bg-slate-950/30 rounded-xl border border-slate-855">
                <strong className="text-yellow-500 block mb-1">Paridad Polinómica Real (<MathJaxFormula formula="V^P_T" />)</strong>
                Garantiza la cobertura del 100% de la estructura de costos actual ponderada (CCT, USD, IPC).
              </div>
              <div className="p-3 bg-slate-950/30 rounded-xl border border-slate-855">
                <strong className="text-cyan-400 block mb-1">Amortización Pasada (<MathJaxFormula formula="\Delta_{\text{recuperación}}" />)</strong>
                Recompone progresivamente la pérdida institucional acumulada generada por la brecha histórica y el retraso en el cobro (Time Lag).
              </div>
              <div className="p-3 bg-slate-950/30 rounded-xl border border-slate-855">
                <strong className="text-emerald-400 block mb-1">Cobertura Prospectiva (<MathJaxFormula formula="\Phi_{\text{prospectiva}}" />)</strong>
                Cubre de manera predictiva la pérdida por erosión nominal futura calculada a partir del plazo de pago de la obra social y las expectativas de variaciones macroeconómicas.
              </div>
            </div>
          </div>

          {/* SIMULADOR ACTIVO DE RECOMPOSICIÓN */}
          <div className="p-6 rounded-3xl border shadow-2xl transition-all space-y-6 bg-slate-950 border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 border-slate-800 gap-2">
              <div>
                <h4 className="text-base sm:text-lg font-black uppercase tracking-wider text-teal-400">
                  ⚡ 5. Simulador de Recomposición Arancelaria
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Establece las pautas de amortización y plazos comerciales para calcular el valor objetivo técnico.
                </p>
              </div>
              <button
                onClick={() => setMostrarVariables(!mostrarVariables)}
                className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-900 text-white hover:bg-slate-800 border border-slate-700/60 transition-all shadow-sm cursor-pointer"
              >
                {mostrarVariables ? 'Ocultar Variables' : 'Administrar Variables'}
              </button>
            </div>

            {/* CONTROLES / SLIDERS GENERALES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Amortización temporal */}
              <div className="p-4 rounded-2xl border bg-slate-900/40 border-slate-800/80 shadow-md space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Plazo de Amortización Histórica:</span>
                  <span className="text-cyan-400 font-mono font-black">{mesesAmortizacion} meses</span>
                </div>
                <input
                  type="range" min="1" max="36" step="1" value={mesesAmortizacion}
                  onChange={(e) => setMesesAmortizacion(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 mt-2"
                />
                <span className="text-[10px] text-slate-500 block leading-tight font-sans">
                  Tiempo estimado para recuperar el 100% de la pérdida histórica unitaria.
                </span>
              </div>

              {/* Plazo de pago diferido */}
              <div className="p-4 rounded-2xl border bg-slate-900/40 border-slate-800/80 shadow-md space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Plazo de Pago de OS (Diferido):</span>
                  <span className="text-emerald-400 font-mono font-black">{plazoPago} días</span>
                </div>
                <input
                  type="range" min="0" max="180" step="5" value={plazoPago}
                  onChange={(e) => setPlazoPago(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 mt-2"
                />
                <span className="text-[10px] text-slate-500 block leading-tight font-sans">
                  Término comercial promedio que la Obra Social demora en liquidar.
                </span>
              </div>

              {/* Tasa costo financiero de oportunidad (TNA) */}
              <div className="p-4 rounded-2xl border bg-slate-900/40 border-slate-800/80 shadow-md space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Costo de Capital (TNA):</span>
                  <span className="text-purple-400 font-mono font-black">{tasaDescuento}%</span>
                </div>
                <input
                  type="range" min="0" max="150" step="5" value={tasaDescuento}
                  onChange={(e) => setTasaDescuento(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400 mt-2"
                />
                <span className="text-[10px] text-slate-500 block leading-tight font-sans">
                  Tasa nominal de descuento financiero para el capital de trabajo.
                </span>
              </div>
            </div>

            {/* CONTROLES EXPANDIDOS (MODALIDAD, PADRON, EXPECTATIVAS) */}
            {mostrarVariables && (
              <div className="p-4 rounded-2xl border space-y-4 bg-slate-900/20 border-slate-800/60 shadow-md grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs uppercase font-bold text-slate-400">Modalidad Médica:</label>
                  <select
                    value={modalidadDialitica}
                    onChange={(e) => setModalidadDialitica(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-xs rounded-xl p-2.5 text-white cursor-pointer"
                  >
                    {opcionesModalidades.map(m => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-400">
                    <span>Padrón de Pacientes:</span>
                    <span className="text-teal-400 font-mono font-black">{padronPacientes} Pacientes</span>
                  </div>
                  <input
                    type="range" min="1" max="250" step="1" value={padronPacientes}
                    onChange={(e) => setPadronPacientes(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500 mt-2"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-400">
                    <span>Expectativa Inflación Mensual (g_IPC):</span>
                    <span className="text-yellow-500 font-mono font-black">{gIPC}%</span>
                  </div>
                  <input
                    type="range" min="0" max="30" step="0.5" value={gIPC}
                    onChange={(e) => setGIPC(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-500 mt-2"
                  />
                </div>
              </div>
            )}

            {/* PRESENTACIÓN GRÁFICA Y DE IMPORTES */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* COLUMNA METRICAS */}
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 block border-b border-slate-850 pb-1.5">
                  📋 Síntesis de Valores y Facturación
                </span>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 bg-slate-900/30 border border-slate-800 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] text-slate-500 block">Último Real Cobrado:</span>
                    <span className="text-slate-350 font-extrabold text-sm">${Math.round(calculations.Y_T).toLocaleString('es-AR')}</span>
                  </div>
                  <div className="p-3 bg-slate-900/30 border border-slate-800 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] text-slate-500 block">Pérdida Unit. Acumulada:</span>
                    <span className="text-red-400 font-extrabold text-sm">${Math.round(calculations.unitLossAccumulated).toLocaleString('es-AR')}</span>
                  </div>
                  <div className="p-3 bg-slate-900/30 border border-slate-800 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] text-slate-500 block">Amortiz. Pasada (Mensual):</span>
                    <span className="text-cyan-400 font-extrabold text-sm">+${Math.round(calculations.Delta_recuperacion).toLocaleString('es-AR')}</span>
                  </div>
                  <div className="p-3 bg-slate-900/30 border border-slate-800 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] text-slate-500 block">Cobertura Prospectiva (unit.):</span>
                    <span className="text-emerald-400 font-extrabold text-sm">+${Math.round(calculations.Phi_prospectiva).toLocaleString('es-AR')}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-2.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                    <span>Daño Económico Acumulado Histórico:</span>
                    <span className="text-red-400 font-mono">${Math.round(calculations.totalLossDollar).toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                    <span>Recupero Mensual Estimado Padrón:</span>
                    <span className="text-cyan-400 font-mono">${Math.round(calculations.recuperoMensualDollar).toLocaleString('es-AR')}</span>
                  </div>
                </div>

                {/* ARANCEL OBJETIVO DESTACADO */}
                <div className="p-5 bg-gradient-to-r from-teal-950/30 to-indigo-950/30 border border-teal-500/30 rounded-3xl text-center space-y-1.5 shadow-xl">
                  <span className="text-[11px] text-teal-400 uppercase font-black tracking-wider block">
                    🚀 Arancel Objetivo de Equilibrio Unificado (Y*)
                  </span>
                  <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
                    ${Math.round(calculations.Y_star).toLocaleString('es-AR')}{' '}
                    <span className="text-xs font-normal text-slate-400">ARS / {currentMod.tipoBrecha}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-snug font-sans">
                    Precio técnico sugerido para neutralizar el time lag actual y amortizar las pérdidas acumuladas desde {periodoDesde}.
                  </p>
                </div>
              </div>

              {/* COLUMNA GRÁFICO CASCADA */}
              <div className="lg:col-span-7 flex flex-col justify-between p-4 rounded-2xl border bg-slate-900/20 border-slate-800 shadow-md">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-teal-400 block mb-1">
                    📊 Composición del Arancel de Equilibrio
                  </span>
                  <p className="text-[10px] text-slate-500">
                    Estructura en cascada desde la paridad polinómica base hasta el arancel de equilibrio recompuesto.
                  </p>
                </div>

                <div className="w-full flex justify-center mt-3 mb-auto overflow-x-auto py-1">
                  <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full max-w-[480px] h-auto bg-slate-950/60 rounded-xl border border-slate-900/60">
                    {/* Y Gridlines and Ticks */}
                    {[0, 0.25, 0.5, 0.75, 1.0].map((pct, idx) => {
                      const val = calculations.Y_star * pct;
                      const maxVal = calculations.Y_star * 1.05;
                      const y = svgHeight - margin.bottom - (val / maxVal) * (svgHeight - margin.top - margin.bottom);
                      return (
                        <g key={idx}>
                          <line x1={margin.left} y1={y} x2={svgWidth - margin.right} y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                          <text x={margin.left - 6} y={y + 3} fill="#475569" fontSize="8.5" fontFamily="monospace" textAnchor="end">
                            ${Math.round(val / 1000)}k
                          </text>
                        </g>
                      );
                    })}

                    <line x1={margin.left} y1={svgHeight - margin.bottom} x2={svgWidth - margin.right} y2={svgHeight - margin.bottom} stroke="#334155" />

                    {/* Conectores horizontales del Waterfall */}
                    {waterfallBars.map((bar, idx) => {
                      if (idx === 0) return null;
                      const prevBar = waterfallBars[idx - 1];
                      const connY = prevBar.y;
                      return (
                        <line
                          key={`conn-${idx}`}
                          x1={prevBar.x + 55}
                          y1={connY}
                          x2={bar.x}
                          y2={connY}
                          stroke="#475569"
                          strokeWidth="1.5"
                          strokeDasharray="2 2"
                        />
                      );
                    })}

                    {/* Barras */}
                    {waterfallBars.map((b, i) => (
                      <g key={i}>
                        <rect x={b.x} y={b.y} width={55} height={b.h} fill={b.color} rx="3" opacity="0.8" />
                        <text
                          x={b.x + 27.5}
                          y={b.y - 6}
                          fill="#f8fafc"
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="black"
                          textAnchor="middle"
                        >
                          ${Math.round(b.val).toLocaleString('es-AR')}
                        </text>
                        <text x={b.x + 27.5} y={svgHeight - margin.bottom + 15} fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">
                          {b.label}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>

            </div>

            {/* SECCIÓN ECUACIÓN EXPLICATIVA */}
            <div className="flex flex-col space-y-4">
              <div className="flex justify-center">
                <button
                  onClick={() => setMostrarMath(!mostrarMath)}
                  className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-900 border border-slate-700 text-teal-400 hover:bg-slate-800 transition cursor-pointer"
                >
                  {mostrarMath ? '🙈 Ocultar Deducción de Ecuaciones' : '🎓 Mostrar Planteo y Ecuación Final del Ajuste'}
                </button>
              </div>

              {mostrarMath && (
                <div className="p-5 rounded-2xl border bg-slate-950/60 border-slate-800 space-y-4 text-xs leading-relaxed text-slate-300">
                  <h4 className="text-teal-400 font-bold uppercase tracking-wide border-b border-slate-800 pb-2 font-sans">
                    📐 Deducción Matemática Completa
                  </h4>

                  <div className="space-y-4 font-mono">
                    <p className="text-slate-355 font-sans">
                      El modelo unificado de equilibrio recompone la paridad actual incorporando la tasa de interés efectiva mensual (TEM = TNA / 12) y el rezago de cobranzas comercial (<MathJaxFormula formula="d / 30" /> meses), sumando el prorrateo de la pérdida acumulada en el pasado sobre la ventana de recomposición elegida:
                    </p>

                    <div className="p-4 bg-slate-900/60 rounded-xl space-y-3 flex flex-col items-center">
                      <div className="py-1.5 text-base text-slate-200">
                        <MathJaxFormula formula={"Y^*_T = V^P_T \\cdot \\left[ (1 + g_{\\text{IPC}})^{\\frac{d}{30}} \\cdot (1 + \\text{TEM})^{\\frac{d}{30}} \\right] + \\frac{\\sum_{m \\in \\text{hist}} (V^P_m - Y_m)}{M_{\\text{amortizaci\\acute{o}n}}}"} />
                      </div>
                      <div className="text-teal-400 font-bold py-1">
                        <MathJaxFormula 
                          formula={`\\text{Cálculo: } Y^*_T = ${fmtLatex(Math.round(calculations.VP_T), 0)} \\cdot [ (1 + ${gIPC / 100})^{${(plazoPago/30).toFixed(2)}} \\cdot (1 + ${(tasaDescuento/100/12).toFixed(5)})^{${(plazoPago/30).toFixed(2)}} ] + \\frac{${fmtLatex(Math.round(calculations.unitLossAccumulated), 0)}}{${mesesAmortizacion}} = \\$${fmtLatex(Math.round(calculations.Y_star), 0)}`} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
      {/* ------------------------------------------- FIN: p3_p5_a2 --------------------------------------------- */}
    </div>
  );
}
