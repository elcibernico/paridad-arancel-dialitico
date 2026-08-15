import React, { useState, useMemo } from 'react';
import { MathJaxFormula } from '../MathJaxFormula';
import seriesData from '../../data/seriesData.json';
import { fmtAR } from '../../utils/format';
import { useGlobalParams } from '../../context/GlobalContext';
import { useAuth } from '../../context/AuthContext';

export default function Punto10() {
  const { hasPermission } = useAuth();
  const opcionesModalidades = [
    { id: 'HD', nombre: 'Hemodiálisis Convencional (HD)', campoExcel: 'valorSesionHD' },
    { id: 'DP', nombre: 'Diálisis Peritoneal (DP)', campoExcel: 'valorModuloDP' },
    { id: 'HDF', nombre: 'Hemodiafiltración en Línea (HDF)', campoExcel: 'valorSesionHDF' }
  ];

  const {
    modalidadDialitica: modalidad, setModalidadDialitica: setModalidad,
    periodoHasta: tHasta, setPeriodoHasta: setTHasta,
    expectativas,
    incidencias
  } = useGlobalParams();

  // Tasas mensuales esperadas de las variables (de parámetros globales)
  const gIPC = expectativas.ipc;
  const gUSD = expectativas.usd;
  const gCCT = expectativas.cct;

  // Ponderaciones polinómicas
  const wCCT = incidencias.cct / 100;
  const wUSD = incidencias.usd / 100;
  const wIPC = incidencias.ipc / 100;

  // Ajuste nominal mensual de la Obra Social (parámetro local del simulador prospectivo)
  const [gOS, setGOS] = useState(6.0); // por defecto 6% mensual
  const [mesesProyectados, setMesesProyectados] = useState(12);
  const [mostrarMath, setMostrarMath] = useState(false);

  // Períodos de corte histórico para iniciar la proyección
  const periodosHastaFiltrados = seriesData.filter(p => p.periodo);

  const projectionData = useMemo(() => {
    const dataCorte = seriesData.find(d => d.periodo === tHasta) || seriesData[seriesData.length - 1];
    const modObj = opcionesModalidades.find(m => m.id === modalidad) || opcionesModalidades[0];
    
    const baseRef = seriesData[0];
    const Y_T = dataCorte[modObj.campoExcel]; // Valor nominal inicial en T

    // Índices iniciales en T
    const indCCT_T = dataCorte.cct / baseRef.cct;
    const indUSD_T = dataCorte.usd / baseRef.usd;
    const indIPC_T = dataCorte.ipc / baseRef.ipc;

    const list = [];
    
    // Mes 0 (Histórico de Corte)
    const IP_T = (wCCT * indCCT_T) + (wUSD * indUSD_T) + (wIPC * indIPC_T);
    const VP_T = baseRef[modObj.campoExcel] * IP_T;
    
    list.push({
      mes: 0,
      label: dataCorte.label,
      cctIndex: indCCT_T,
      usdIndex: indUSD_T,
      ipcIndex: indIPC_T,
      IP: IP_T,
      VP: VP_T,
      Y: Y_T,
      brecha: ((Y_T - VP_T) / VP_T) * 100
    });

    // Proyectar k meses adelante
    for (let k = 1; k <= mesesProyectados; k++) {
      const cctIndex_k = indCCT_T * Math.pow(1 + gCCT / 100, k);
      const usdIndex_k = indUSD_T * Math.pow(1 + gUSD / 100, k);
      const ipcIndex_k = indIPC_T * Math.pow(1 + gIPC / 100, k);

      const IP_k = (wCCT * cctIndex_k) + (wUSD * usdIndex_k) + (wIPC * ipcIndex_k);
      const VP_k = baseRef[modObj.campoExcel] * IP_k;
      const Y_k = Y_T * Math.pow(1 + gOS / 100, k);

      list.push({
        mes: k,
        label: `T + ${k} m`,
        cctIndex: cctIndex_k,
        usdIndex: usdIndex_k,
        ipcIndex: ipcIndex_k,
        IP: IP_k,
        VP: VP_k,
        Y: Y_k,
        brecha: ((Y_k - VP_k) / VP_k) * 100
      });
    }

    return list;
  }, [tHasta, modalidad, gIPC, gUSD, gCCT, wCCT, wUSD, wIPC, gOS, mesesProyectados]);

  // Dimensiones del gráfico de líneas SVG
  const svgWidth = 500;
  const svgHeight = 240;
  const margin = { top: 20, right: 80, bottom: 40, left: 60 };

  const plotPoints = useMemo(() => {
    if (projectionData.length === 0) return { nominal: '', parity: '', points: [] };
    
    // Buscar máximos y mínimos para escalar
    const maxVal = Math.max(...projectionData.map(d => Math.max(d.Y, d.VP))) * 1.05;
    const minVal = Math.min(...projectionData.map(d => Math.min(d.Y, d.VP))) * 0.95;

    const scaleX = (mes) => margin.left + (mes / mesesProyectados) * (svgWidth - margin.left - margin.right);
    const scaleY = (val) => svgHeight - margin.bottom - ((val - minVal) / (maxVal - minVal)) * (svgHeight - margin.top - margin.bottom);

    let nominalPath = '';
    let parityPath = '';
    const points = [];

    projectionData.forEach((d, idx) => {
      const cx = scaleX(d.mes);
      const cyNominal = scaleY(d.Y);
      const cyParity = scaleY(d.VP);

      if (idx === 0) {
        nominalPath = `M ${cx} ${cyNominal}`;
        parityPath = `M ${cx} ${cyParity}`;
      } else {
        nominalPath += ` L ${cx} ${cyNominal}`;
        parityPath += ` L ${cx} ${cyParity}`;
      }

      points.push({
        mes: d.mes,
        label: d.label,
        cx,
        cyNominal,
        cyParity,
        valNominal: d.Y,
        valParity: d.VP
      });
    });

    return { nominalPath, parityPath, points, scaleY, maxVal, minVal };
  }, [projectionData, mesesProyectados]);

  return (
    <div className="space-y-6">
      {/* ENCUADRE NARRATIVO */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 shadow-sm">
        <h2 className="text-sm font-bold text-teal-400 uppercase tracking-wider mb-2">
          🔮 Proyección Prospectiva y Sostenibilidad Financiera
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          El análisis histórico (retrospectivo) demuestra cómo se acumula la pérdida, pero la gestión de una clínica requiere anticipación.<br />
          El <strong>Modelo Prospectivo</strong> evalúa escenarios dinámicos simulando el comportamiento del arancel real y las variables macroeconómicas exógenas a futuro (CCT, USD, IPC). Esto permite calcular el desvío proyectado (Brecha de Paridad) y diseñar una cobertura predictiva.
        </p>
      </div>

      {/* SEGMENTADORES */}
      {/* ------------------------------------------- INI: p3_p4_a1 --------------------------------------------- */}
      {hasPermission('p3_p4_a1') && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* PARÁMETROS BÁSICOS */}
        <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md space-y-4">
          <span className="text-xs font-black uppercase tracking-wider text-teal-400 block border-b border-slate-800 pb-1.5">
            🎛️ Variables de Escenario
          </span>

          <div className="flex flex-col space-y-1">
            <label className="text-xs uppercase font-bold text-slate-400">Modalidad Dialítica:</label>
            <select
              value={modalidad}
              onChange={(e) => setModalidad(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs rounded-xl p-2 text-white focus:outline-none cursor-pointer"
            >
              {opcionesModalidades.map(m => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs uppercase font-bold text-slate-400">Período de Partida (T):</label>
            <select
              value={tHasta}
              onChange={(e) => setTHasta(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs rounded-xl p-2 text-white focus:outline-none cursor-pointer"
            >
              {periodosHastaFiltrados.map(p => (
                <option key={p.periodo} value={p.periodo}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* AJUSTES MACRO / EXPECTATIVAS (INFORMATIVO) */}
        <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-teal-400 block border-b border-slate-800 pb-1.5">
            📈 Shocks Macroeconómicos Mensuales
          </span>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between font-mono bg-slate-950/40 p-2 rounded-lg border border-slate-900">
              <span className="text-slate-400">Inflación Esperada (g_IPC):</span>
              <span className="text-yellow-500 font-bold">+{gIPC}% / mes</span>
            </div>
            <div className="flex justify-between font-mono bg-slate-950/40 p-2 rounded-lg border border-slate-900">
              <span className="text-slate-400">Variación Cambiaria (g_USD):</span>
              <span className="text-cyan-400 font-bold">+{gUSD}% / mes</span>
            </div>
            <div className="flex justify-between font-mono bg-slate-950/40 p-2 rounded-lg border border-slate-900">
              <span className="text-slate-400">Aumento Salarial CCT (g_CCT):</span>
              <span className="text-emerald-400 font-bold">+{gCCT}% / mes</span>
            </div>
            <span className="text-[10px] text-slate-500 block leading-tight">
              * Estos valores se configuran globalmente en la sección de Parámetros Globales.
            </span>
          </div>
        </div>

        {/* CONTROL DE AJUSTE NOMINAL DE LA OBRA SOCIAL */}
        <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md space-y-4">
          <span className="text-xs font-black uppercase tracking-wider text-teal-400 block border-b border-slate-800 pb-1.5">
            ⚙️ Actualización Nominal OS
          </span>

          <div className="flex flex-col space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span>Tasa de Ajuste de OS (g_OS):</span>
              <span className="text-teal-400 font-mono font-black">{gOS}% / mes</span>
            </div>
            <input
              type="range" min="0" max="25" step="0.5" value={gOS}
              onChange={(e) => setGOS(Number(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400 mt-2"
            />
            <span className="text-[10px] text-slate-500 block leading-tight mt-1.5">
              Representa el ajuste mensual que la financiadora otorga nominalmente al arancel.
            </span>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs uppercase font-bold text-slate-400">Meses de Proyección:</label>
            <select
              value={mesesProyectados}
              onChange={(e) => setMesesProyectados(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 text-xs rounded-xl p-1.5 text-white cursor-pointer"
            >
              <option value={6}>6 Meses</option>
              <option value={12}>12 Meses</option>
              <option value={18}>18 Meses</option>
            </select>
          </div>
        </div>
      </div>

      {/* DASHBOARD DE RESULTADOS Y SIMULACIÓN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GRÁFICO PROSPECTIVO */}
        <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md flex flex-col justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-teal-400 block mb-1">
              📊 Trayectoria Proyectada del Arancel vs Paridad Polinómica
            </span>
            <p className="text-xs text-slate-400 mb-4">
              Comparación visual del arancel nominal recibido frente al arancel de equilibrio ajustado por costos reales.
            </p>
          </div>

          <div className="w-full flex justify-center my-auto">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto bg-slate-950/60 rounded-xl border border-slate-800/80">
              {/* Ejes */}
              <line x1={margin.left} y1={svgHeight - margin.bottom} x2={svgWidth - margin.right} y2={svgHeight - margin.bottom} stroke="#475569" />
              <line x1={margin.left} y1={margin.top} x2={margin.left} y2={svgHeight - margin.bottom} stroke="#475569" />

              {/* Guía horizontal del valor inicial */}
              {plotPoints.scaleY && (
                <line
                  x1={margin.left}
                  y1={plotPoints.scaleY(projectionData[0].Y)}
                  x2={svgWidth - margin.right}
                  y2={plotPoints.scaleY(projectionData[0].Y)}
                  stroke="#64748b"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity="0.5"
                />
              )}

              {/* Trazados de Líneas */}
              <path d={plotPoints.nominalPath} fill="none" stroke="#38bdf8" strokeWidth="2.5" />
              <path d={plotPoints.parityPath} fill="none" stroke="#f43f5e" strokeWidth="2.5" />

              {/* Puntos y Hover/Labels */}
              {plotPoints.points.map((pt, i) => {
                // Mostrar solo inicio, medio y fin para no saturar
                const showLabel = i === 0 || i === Math.floor(mesesProyectados / 2) || i === mesesProyectados;
                return (
                  <g key={i}>
                    {/* Círculo Nominal */}
                    <circle cx={pt.cx} cy={pt.cyNominal} r="3.5" fill="#38bdf8" />
                    {/* Círculo Paridad */}
                    <circle cx={pt.cx} cy={pt.cyParity} r="3.5" fill="#f43f5e" />

                    {showLabel && (
                      <g>
                        <text x={pt.cx} y={svgHeight - margin.bottom + 15} fill="#94a3b8" fontSize="9" textAnchor="middle">
                          {pt.label}
                        </text>
                        {/* Textos de valores */}
                        <text x={pt.cx} y={pt.cyNominal - 8} fill="#7dd3fc" fontSize="8.5" fontWeight="bold" textAnchor="middle">
                          ${Math.round(pt.valNominal).toLocaleString('es-AR')}
                        </text>
                        <text x={pt.cx} y={pt.cyParity + 13} fill="#fda4af" fontSize="8.5" fontWeight="bold" textAnchor="middle">
                          ${Math.round(pt.valParity).toLocaleString('es-AR')}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Leyendas al margen derecho */}
              <text x={svgWidth - margin.right + 8} y={margin.top + 30} fill="#38bdf8" fontSize="10" fontWeight="bold">
                Nominal (OS)
              </text>
              <text x={svgWidth - margin.right + 8} y={margin.top + 50} fill="#f43f5e" fontSize="10" fontWeight="bold">
                Paridad Real
              </text>
            </svg>
          </div>
        </div>

        {/* TABLA DE TRAYECTORIA Y METRICAS */}
        <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md flex flex-col justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-teal-400 block mb-1">
              📋 Planilla de Desvíos de Paridad Proyectados
            </span>
            <p className="text-xs text-slate-400 mb-3">
              Evolución detallada de la brecha real por mes ante los shocks macroeconómicos.
            </p>
          </div>

          <div className="overflow-x-auto max-h-[180px] border border-slate-850 rounded-xl">
            <table className="w-full text-[11px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-2 text-center">Mes</th>
                  <th className="p-2">Nominal OS</th>
                  <th className="p-2">Paridad Requerida</th>
                  <th className="p-2 text-right">Brecha Proyectada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 bg-slate-900/20 font-mono">
                {projectionData.map((d, idx) => (
                  <tr key={idx} className="hover:bg-slate-950/40">
                    <td className="p-2 text-center text-slate-400 font-bold">{d.label}</td>
                    <td className="p-2 text-sky-400">${Math.round(d.Y).toLocaleString('es-AR')}</td>
                    <td className="p-2 text-slate-300">${Math.round(d.VP).toLocaleString('es-AR')}</td>
                    <td className={`p-2 text-right font-bold ${d.brecha < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {fmtAR(d.brecha, 1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 p-3 bg-slate-950/60 rounded-xl border border-slate-850 text-center">
            {(() => {
              const lastVal = projectionData[projectionData.length - 1];
              const desvioFinal = lastVal.brecha;
              const isCritico = desvioFinal < 0;
              return (
                <p className="text-xs text-slate-300">
                  Brecha al final del período ({mesesProyectados}m):{' '}
                  <span className={`font-black ${isCritico ? 'text-red-400' : 'text-emerald-400'}`}>
                    {fmtAR(desvioFinal, 2)}%
                  </span>
                  <br />
                  <span className="text-[10px] text-slate-500">
                    {isCritico
                      ? '⚠️ Alerta de desabastecimiento: los aranceles nominales no cubren la velocidad de la inflación y dolarización.'
                      : '✅ Escenario de equilibrio: el ajuste nominal de la OS neutraliza la erosión macroeconómica.'}
                  </span>
                </p>
              );
            })()}
          </div>
        </div>
      </div>
    </>
  )}
      {/* ------------------------------------------- FIN: p3_p4_a1 --------------------------------------------- */}

      {/* BOTÓN DESARROLLO MATEMÁTICO */}
      {/* ------------------------------------------- INI: p3_p4_a2 --------------------------------------------- */}
      {hasPermission('p3_p4_a2') && (
        <div className="flex flex-col space-y-4">
          <div className="flex justify-center">
            <button
              onClick={() => setMostrarMath(!mostrarMath)}
              className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-900 border border-slate-700 text-teal-400 hover:bg-slate-800 transition"
            >
              {mostrarMath ? '🙈 Ocultar Ecuaciones de Proyección' : '🎓 Mostrar Planteo y Fórmulas Prospectivas'}
            </button>
          </div>

          {mostrarMath && (
            <div className="p-5 rounded-2xl border bg-slate-950/60 border-slate-800 space-y-4 text-xs leading-relaxed text-slate-300">
              <h4 className="text-teal-400 font-bold uppercase tracking-wide border-b border-slate-800 pb-2">
                🎓 Planteo Algebraico y Desarrollo en Tiempo Real
              </h4>

              <div className="space-y-3 font-mono">
                <p className="text-slate-300 font-sans">
                  <strong>1. Proyección de las Variables Exógenas en Tiempo Real:</strong>
                  <br />
                  Dado el período de corte <MathJaxFormula formula="T" />, cada variable proyecta su evolución exponencial k meses adelante según sus tasas esperadas:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-900/60 rounded-xl text-center">
                  <div>
                    <MathJaxFormula formula="I^{CCT}_{T+k} = I^{CCT}_T (1 + g_{CCT})^k" />
                  </div>
                  <div>
                    <MathJaxFormula formula="I^{USD}_{T+k} = I^{USD}_T (1 + g_{USD})^k" />
                  </div>
                  <div>
                    <MathJaxFormula formula="I^{IPC}_{T+k} = I^{IPC}_T (1 + g_{IPC})^k" />
                  </div>
                </div>

                <p className="text-slate-300 font-sans">
                  <strong>2. Fórmula Polinómica Prospectiva (<MathJaxFormula formula="V^P_{T+k}" />):</strong>
                  <br />
                  Permite recomponer la estructura óptima teórica del arancel en base a las incidencias relativas ponderadas:
                </p>
                <div className="p-3 bg-slate-900/60 rounded-xl text-center">
                  <span className="text-lg"><MathJaxFormula formula="V^P_{T+k} = C_0 \\cdot \\left[ w_{CCT} I^{CCT}_{T+k} + w_{USD} I^{USD}_{T+k} + w_{IPC} I^{IPC}_{T+k} \\right]" /></span>
                </div>

                <p className="text-slate-300 font-sans">
                  <strong>3. Desvío Proyectado o Brecha de Paridad (<MathJaxFormula formula="B_{T+k}" />):</strong>
                  <br />
                  Expresa en tiempo real el desajuste entre la actualización de la financiadora (<MathJaxFormula formula="Y_{T+k} = Y_T (1 + g_{OS})^k" />) and la estructura de costos real:
                </p>
                <div className="p-3 bg-slate-900/60 rounded-xl text-center">
                  <span className="text-lg"><MathJaxFormula formula="B_{T+k} = \\frac{Y_{T+k} - V^P_{T+k}}{V^P_{T+k}} \\cdot 100" /></span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/* ------------------------------------------- FIN: p3_p4_a2 --------------------------------------------- */}
    </div>
  );
}
