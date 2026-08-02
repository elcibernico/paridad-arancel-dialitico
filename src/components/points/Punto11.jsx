import React, { useState, useMemo } from 'react';
import { MathJaxFormula } from '../MathJaxFormula';
import seriesData from '../../data/seriesData.json';
import { fmtAR, fmtLatex } from '../../utils/format';

export default function Punto11() {
  const opcionesModalidades = [
    { id: 'HD', nombre: 'Hemodiálisis Convencional (HD)', campoExcel: 'valorSesionHD' },
    { id: 'DP', nombre: 'Diálisis Peritoneal (DP)', campoExcel: 'valorModuloDP' },
    { id: 'HDF', nombre: 'Hemodiafiltración en Línea (HDF)', campoExcel: 'valorSesionHDF' }
  ];
  const [modalidad, setModalidad] = useState('HD');

  // Rango de corte
  const defaultHasta = seriesData[seriesData.length - 1];
  // Corte temporal
  const defaultHastaIndex = seriesData.findIndex(d => d.periodo === defaultHasta.periodo);
  const defaultDesdeIndex = Math.max(0, defaultHastaIndex - 11);
  const [tHasta, setTHasta] = useState(defaultHasta.periodo);
  const [tDesde, setTDesde] = useState(seriesData[defaultDesdeIndex].periodo);

  // Expectativas mensuales (tasas nominales g_IPC, g_USD, g_CCT, g_OS)
  const [gIPC, setGIPC] = useState(5.0); // % mensual
  const [gUSD, setGUSD] = useState(4.0); // % mensual
  const [gCCT, setGCCT] = useState(4.5); // % mensual
  const [gOS, setGOS] = useState(3.0);   // % mensual

  // Horizonte
  const [horizonte, setHorizonte] = useState(12); // 3, 6, 9, 12 meses

  const [mostrarMath, setMostrarMath] = useState(false);

  const periodosHastaFiltrados = seriesData.filter(p => p.periodo);

  const handleTHastaChange = (e) => {
    const newHasta = e.target.value;
    setTHasta(newHasta);
    const indexHasta = seriesData.findIndex(d => d.periodo === newHasta);
    const indexDesde = Math.max(0, indexHasta - 11);
    setTDesde(seriesData[indexDesde].periodo);
  };

  // Computaciones
  const simulation = useMemo(() => {
    // Buscar la observación de corte
    const indexCorte = seriesData.findIndex(d => d.periodo === tHasta);
    if (indexCorte === -1) return null;

    const baseData = seriesData[indexCorte];
    const modObj = opcionesModalidades.find(m => m.id === modalidad) || opcionesModalidades[0];
    const Y_corte = baseData[modObj.campoExcel];

    // Encontrar mes base t0 para la fórmula polinómica
    const baseRef = seriesData.find(d => d.periodo === tDesde) || seriesData[0]; // Pivote base dinámico

    // Proyección recursiva
    const proyectado = [];
    let currentIPC = baseData.ipc;
    let currentUSD = baseData.usd;
    let currentCCT = baseData.cct;
    let currentY = Y_corte;

    // Pesos polinómicos estándar: w_CCT = 45%, w_USD = 35%, w_IPC = 20%
    const wCCT = 0.40;
    const wUSD = 0.30;
    const wIPC = 0.30;

    for (let k = 1; k <= horizonte; k++) {
      currentIPC = currentIPC * (1 + gIPC / 100);
      currentUSD = currentUSD * (1 + gUSD / 100);
      currentCCT = currentCCT * (1 + gCCT / 100);
      currentY = currentY * (1 + gOS / 100);

      // Calcular Costo Polinómico Proyectado usando el pivote de referencia baseRef
      const indCCT = currentCCT / baseRef.cct;
      const indUSD = currentUSD / baseRef.usd;
      const indIPC = currentIPC / baseRef.ipc;
      const IP_k = (wCCT * indCCT) + (wUSD * indUSD) + (wIPC * indIPC);
      const VP_k = baseRef[modObj.campoExcel] * IP_k;

      proyectado.push({
        mes: k,
        ipc: currentIPC,
        usd: currentUSD,
        cct: currentCCT,
        Y: currentY,
        VP: VP_k,
        brecha: ((currentY - VP_k) / VP_k) * 100
      });
    }

    return {
      baseData,
      Y_corte,
      proyectado,
      wCCT,
      wUSD,
      wIPC,
      baseRef
    };
  }, [tHasta, tDesde, modalidad, gIPC, gUSD, gCCT, gOS, horizonte]);

  // Dimensiones del gráfico de líneas SVG
  const svgWidth = 460;
  const svgHeight = 200;
  const margin = { top: 20, right: 80, bottom: 35, left: 50 };

  const chartCoords = useMemo(() => {
    if (!simulation || simulation.proyectado.length === 0) return null;
    const { proyectado, Y_corte } = simulation;

    // Encontrar máximos y mínimos para la escala Y
    let maxVal = Y_corte;
    let minVal = Y_corte;
    proyectado.forEach(d => {
      if (d.Y > maxVal) maxVal = d.Y;
      if (d.VP > maxVal) maxVal = d.VP;
      if (d.Y < minVal) minVal = d.Y;
      if (d.VP < minVal) minVal = d.VP;
    });

    const delta = maxVal - minVal;
    const yMax = maxVal + (delta * 0.15 || Y_corte * 0.2);
    const yMin = Math.max(0, minVal - (delta * 0.15 || Y_corte * 0.2));

    const xStep = (svgWidth - margin.left - margin.right) / (proyectado.length);

    // Coordenada del punto inicial (Mes 0)
    const x0 = margin.left;
    const y0 = svgHeight - margin.bottom - ((Y_corte - yMin) / (yMax - yMin)) * (svgHeight - margin.top - margin.bottom);

    const pointsY = [`${x0},${y0}`];
    const pointsVP = [`${x0},${y0}`];

    proyectado.forEach((d, i) => {
      const x = margin.left + (i + 1) * xStep;
      const yY = svgHeight - margin.bottom - ((d.Y - yMin) / (yMax - yMin)) * (svgHeight - margin.top - margin.bottom);
      const yVP = svgHeight - margin.bottom - ((d.VP - yMin) / (yMax - yMin)) * (svgHeight - margin.top - margin.bottom);
      pointsY.push(`${x},${yY}`);
      pointsVP.push(`${x},${yVP}`);
    });

    return {
      pointsY: pointsY.join(' '),
      pointsVP: pointsVP.join(' '),
      yMin,
      yMax,
      xStep,
      lastY: proyectado[proyectado.length - 1].Y,
      lastVP: proyectado[proyectado.length - 1].VP,
      lastX: margin.left + proyectado.length * xStep,
      lastY_y: svgHeight - margin.bottom - ((proyectado[proyectado.length - 1].Y - yMin) / (yMax - yMin)) * (svgHeight - margin.top - margin.bottom),
      lastVP_y: svgHeight - margin.bottom - ((proyectado[proyectado.length - 1].VP - yMin) / (yMax - yMin)) * (svgHeight - margin.top - margin.bottom)
    };
  }, [simulation]);

  return (
    <div className="space-y-6">
      {/* NARRATIVA DE ENCUADRE */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 shadow-sm">
        <h2 className="text-sm font-bold text-teal-400 uppercase tracking-wider mb-2">
          📖 Paridad Polinómica Proyectada
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          Una vez estabilizada la relación histórica mediante regularización Ridge, la pregunta lógica es:
          <strong> ¿Qué pasará mañana?</strong> Si los costos macroeconómicos continúan subiendo por inflación y devaluación,
          mientras que la obra social ajusta el arancel a tasas menores, se produce un <em>quiebre financiero prospectivo</em>.
          Este simulador dinámico modela la trayectoria a futuro basándose en las decisiones del analista.
        </p>
      </div>

      {/* CONTROLES / SEGMENTADORES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* PARÁMETROS DE ESCENARIO */}
        <div className="md:col-span-1 p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md space-y-4">
          <span className="text-xs font-black uppercase tracking-wider text-teal-400 block border-b border-slate-800 pb-1.5">
            🎛️ Filtros de Corte y Modalidad Dialítica
          </span>

          {/* Modalidad */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs uppercase font-bold text-slate-400">Modalidad Médica:</label>
            <select
              value={modalidad}
              onChange={(e) => setModalidad(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs rounded-xl p-2 text-white focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              {opcionesModalidades.map(m => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
          </div>

          {/* Período de Corte */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs uppercase font-bold text-slate-400">Mes de Corte de Inicio (Hasta):</label>
            <select
              value={tHasta}
              onChange={handleTHastaChange}
              className="bg-slate-950 border border-slate-800 text-xs rounded-xl p-2 text-white focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              {periodosHastaFiltrados.map(p => (
                <option key={p.periodo} value={p.periodo}>{p.label}</option>
              ))}
            </select>
            <span className="text-[11px] text-slate-500 italic mt-0.5">
              * La proyección simula el futuro partiendo desde el corte elegido.
            </span>
          </div>

          {/* Mes Pivote de Inicio */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs uppercase font-bold text-slate-500">Punto de Partida / Mes Pivote (Desde):</label>
            <select
              value={tDesde}
              onChange={(e) => setTDesde(e.target.value)}
              className="bg-slate-950/40 border border-slate-900 text-xs rounded-xl p-2 text-slate-400 focus:outline-none focus:border-teal-900 cursor-pointer"
            >
              {seriesData.filter(p => p.periodo <= tHasta).map(p => (
                <option key={p.periodo} value={p.periodo} className="text-white bg-slate-950">{p.label}</option>
              ))}
            </select>
          </div>

          {/* Horizonte */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs uppercase font-bold text-slate-400">Horizonte de Proyección:</label>
            <div className="flex justify-between items-center gap-2 mt-1">
              {[3, 6, 9, 12].map(h => (
                <button
                  key={h}
                  onClick={() => setHorizonte(h)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-black transition ${horizonte === h
                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                    : 'bg-slate-950 text-slate-400 border border-slate-850 hover:bg-slate-900'
                    }`}
                >
                  {h}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* EXPECTATIVAS EXÓGENAS */}
        <div className="md:col-span-2 p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md space-y-4">
          <span className="text-xs font-black uppercase tracking-wider text-teal-400 block border-b border-slate-800 pb-1.5">
            📈 Expectativas de Incremento Mensual (%)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* g_IPC */}
            <div className="flex flex-col space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-yellow-500">Tasa de Inflación (<MathJaxFormula formula="g_{IPC}" />):</span>
                <span className="text-white font-mono">{fmtAR(gIPC, 1)} %</span>
              </div>
              <input
                type="range" min="0" max="30" step="0.5" value={gIPC}
                onChange={(e) => setGIPC(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-500 mt-2"
              />
            </div>

            {/* g_USD */}
            <div className="flex flex-col space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-cyan-400">Tasa Cambiaria (<MathJaxFormula formula="g_{USD}" />):</span>
                <span className="text-white font-mono">{fmtAR(gUSD, 1)} %</span>
              </div>
              <input
                type="range" min="0" max="30" step="0.5" value={gUSD}
                onChange={(e) => setGUSD(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 mt-2"
              />
            </div>

            {/* g_CCT */}
            <div className="flex flex-col space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-orange-500">Tasa de Convenio (<MathJaxFormula formula="g_{CCT}" />):</span>
                <span className="text-white font-mono">{fmtAR(gCCT, 1)} %</span>
              </div>
              <input
                type="range" min="0" max="30" step="0.5" value={gCCT}
                onChange={(e) => setGCCT(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500 mt-2"
              />
            </div>

            {/* g_OS */}
            <div className="flex flex-col space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-teal-400">Ajuste de Obra Social (<MathJaxFormula formula="g_{OS}" />):</span>
                <span className="text-white font-mono">{fmtAR(gOS, 1)} %</span>
              </div>
              <input
                type="range" min="0" max="30" step="0.5" value={gOS}
                onChange={(e) => setGOS(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400 mt-2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* RESULTADO Y GRÁFICO */}
      {simulation && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* TABLA DE PROYECCIÓN */}
          <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-teal-400 block border-b border-slate-800 pb-1.5">
              📊 Tabla Proyectiva: Arancel vs Valor de Paridad Polinómico
            </span>
            <div className="overflow-x-auto text-xs max-h-52 overflow-y-auto font-mono">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10.5px] uppercase font-bold text-slate-500 sticky top-0 bg-slate-900">
                    <th className="py-2 text-left">
                      <div className="leading-tight">Mes</div>
                      <div className="text-[11px] text-slate-600 font-mono mt-0.5">t</div>
                    </th>
                    <th className="py-2">
                      <div className="leading-tight">Arancel Sim.</div>
                      <div className="font-mono text-teal-400 mt-0.5"><MathJaxFormula formula="Y_t" /></div>
                    </th>
                    <th className="py-2">
                      <div className="leading-tight">Val. Paridad Pol.</div>
                      <div className="font-mono text-teal-400 mt-0.5"><MathJaxFormula formula="V^P_t" /></div>
                    </th>
                    <th className="py-2">
                      <div className="leading-tight">Diferencia</div>
                      <div className="font-mono text-slate-400 mt-0.5">$</div>
                    </th>
                    <th className="py-2">
                      <div className="leading-tight">Brecha</div>
                      <div className="font-mono text-slate-400 mt-0.5">%</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-850 bg-slate-950/20 text-slate-400">
                    <td className="py-2 text-left font-bold text-teal-500">Corte ({tHasta})</td>
                    <td className="font-mono">${simulation.Y_corte.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="font-mono">${simulation.Y_corte.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="font-mono">$0.00</td>
                    <td className="font-mono font-bold text-teal-500">0.0%</td>
                  </tr>
                  {simulation.proyectado.map(d => {
                    const diff = d.Y - d.VP;
                    const loss = diff < 0;
                    return (
                      <tr key={d.mes} className="border-b border-slate-850 hover:bg-slate-900/30">
                        <td className="py-2 text-left font-bold text-slate-400">Mes {d.mes}</td>
                        <td className="font-mono">${d.Y.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="font-mono">${d.VP.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className={`font-mono font-semibold ${loss ? 'text-rose-400' : 'text-emerald-400'}`}>
                          ${diff.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className={`font-mono font-bold ${loss ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {fmtAR(d.brecha, 1)} %
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* GRÁFICO PROYECTADO */}
          <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md flex flex-col justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-teal-400 block mb-1">
                📈 Trayectoria del Arancel vs Valor de Paridad Polinómico
              </span>
              <p className="text-xs text-slate-400 mb-3">
                Divergencia entre el cobro real simulado y el valor de paridad polinómico de costos.
              </p>
            </div>

            {chartCoords && (
              <div className="w-full flex justify-center my-auto">
                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto bg-slate-950/60 rounded-xl border border-slate-800/80">
                  {/* Ejes */}
                  <line x1={margin.left} y1={svgHeight - margin.bottom} x2={svgWidth - margin.right} y2={svgHeight - margin.bottom} stroke="#475569" />
                  <line x1={margin.left} y1={margin.top} x2={margin.left} y2={svgHeight - margin.bottom} stroke="#475569" />

                  {/* Polylines de Proyección */}
                  <polyline fill="none" stroke="#2dd4bf" strokeWidth="2.5" points={chartCoords.pointsY} strokeLinecap="round" />
                  <polyline fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 3" points={chartCoords.pointsVP} strokeLinecap="round" />

                  {/* Etiquetas de Ejes */}
                  {(() => {
                    const [yr, mo] = tHasta.split('-').map(Number);
                    const endDate = new Date(yr, mo - 1 + horizonte, 1);
                    const endLabel = endDate.toLocaleDateString('es-AR', { month: 'short', year: 'numeric' });
                    const startLabel = simulation.baseData.label;
                    return (
                      <>
                        <text x={margin.left} y={svgHeight - 10} fill="#64748b" fontSize="8" textAnchor="middle">{startLabel}</text>
                        <text x={svgWidth - margin.right} y={svgHeight - 10} fill="#64748b" fontSize="8" textAnchor="middle">{endLabel}</text>
                      </>
                    );
                  })()}

                  {/* Leyendas al final de la línea */}
                  <text x={chartCoords.lastX + 5} y={chartCoords.lastY_y + 3} fill="#2dd4bf" fontSize="8" fontWeight="bold">Arancel</text>
                  <text x={chartCoords.lastX + 5} y={chartCoords.lastVP_y + 3} fill="#ef4444" fontSize="8" fontWeight="bold">Valor Paridad</text>

                  {/* Leyenda vertical y */}
                  <text x={margin.left} y={margin.top - 8} fill="#94a3b8" fontSize="8" fontStyle="italic" fontWeight="bold">Arancel y Costos (ARS)</text>
                </svg>
              </div>
            )}

            <div className="flex items-center justify-center gap-6 mt-3 text-xs font-black font-mono">
              <div className="flex items-center gap-1.5"><div className="w-3.5 h-1 bg-teal-400 rounded" /> <span>Arancel (<MathJaxFormula formula="Y_t" />)</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3.5 h-1 border-t-2 border-dashed border-red-500" /> <span>Valor Paridad Polinómico (<MathJaxFormula formula="V^P_t" />)</span></div>
            </div>
          </div>
        </div>
      )}

      {/* BOTÓN DESARROLLO MATEMÁTICO */}
      {simulation && (
        <div className="flex flex-col space-y-4">
          <div className="flex justify-center">
            <button
              onClick={() => setMostrarMath(!mostrarMath)}
              className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-900 border border-slate-700 text-teal-400 hover:bg-slate-800 transition"
            >
              {mostrarMath ? '🙈 Ocultar Demostración Matemática' : '🎓 Mostrar Planteo y Desarrollo Matemático'}
            </button>
          </div>

          {mostrarMath && (
            <div className="p-5 rounded-2xl border bg-slate-950/60 border-slate-800 space-y-4 text-xs leading-relaxed text-slate-300">
              <h4 className="text-teal-400 font-bold uppercase tracking-wide border-b border-slate-800 pb-2">
                🎓 Planteo Algebraico y Desarrollo en Tiempo Real
              </h4>

              <div className="space-y-3">
                <p>
                  <strong>1. Proyección de las Variables Exógenas:</strong>
                  <br />
                  Las variables nominales se actualizan de forma geométrica acumulativa para cada período de proyección <MathJaxFormula formula="T+k" />:
                </p>
                <div className="p-3 bg-slate-900/60 rounded-xl text-center space-y-3">
                  <div className="block">
                    <MathJaxFormula formula={"IPC_{T+k} = IPC_{T+k-1} \\cdot (1 + g_{IPC})"} />
                  </div>
                  <div className="border-t border-slate-700/60 pt-2 space-y-2">
                    <div className="block">
                      <MathJaxFormula formula={`IPC_{\\text{${simulation.baseData.label}}+1} = ${fmtLatex(simulation.baseData.ipc, 2)} \\cdot (1 + ${fmtLatex(gIPC / 100, 2)}) = ${fmtLatex(simulation.proyectado[0].ipc, 2)}`} />
                    </div>
                    <div className="block">
                      <MathJaxFormula formula={`IPC_{\\text{${simulation.baseData.label}}+2} = ${fmtLatex(simulation.proyectado[0].ipc, 2)} \\cdot (1 + ${fmtLatex(gIPC / 100, 2)}) = ${fmtLatex(simulation.proyectado[1].ipc, 2)}`} />
                    </div>
                    <div className="block">
                      <MathJaxFormula formula={`IPC_{\\text{${simulation.baseData.label}}+3} = ${fmtLatex(simulation.proyectado[1].ipc, 2)} \\cdot (1 + ${fmtLatex(gIPC / 100, 2)}) = ${fmtLatex(simulation.proyectado[2].ipc, 2)}`} />
                    </div>
                    <div className="text-[11px] text-slate-500 italic pt-1">
                      ⋯ acumulación geométrica hasta el mes {horizonte} (horizonte de simulación seleccionado)
                    </div>
                  </div>
                </div>

                <p>
                  <strong>2. Fórmula Polinómica Prospectiva:</strong>
                  <br />
                  Mantenemos constante la ponderación estructural (<MathJaxFormula formula="w_{CCT} = 40%" />, <MathJaxFormula formula="w_{USD} = 30%" />, <MathJaxFormula formula="w_{IPC} = 30%" />) y calculamos la paridad ajustada desde la base histórica del primer mes (<MathJaxFormula formula="t_0" />):
                </p>
                <div className="p-3 bg-slate-900/60 rounded-xl font-mono text-center space-y-1">
                  <MathJaxFormula formula={"V^P_{T+k} = Y_{t_0} \\cdot \\left[ 0.40 \\left(\\frac{CCT_{T+k}}{CCT_{t_0}}\\right) + 0.30 \\left(\\frac{USD_{T+k}}{USD_{t_0}}\\right) + 0.30 \\left(\\frac{IPC_{T+k}}{IPC_{t_0}}\\right) \\right]"} />
                  <br />
                  <span className="text-xs text-slate-500">
                    Pivote Base <MathJaxFormula formula="t_0" /> ({simulation.baseRef.label}): CCT={fmtAR(simulation.baseRef.cct, 1)}, USD={fmtAR(simulation.baseRef.usd, 1)}, IPC={fmtAR(simulation.baseRef.ipc, 1)}
                  </span>
                </div>

                <p>
                  <strong>3. Desvío Proyectado (Brecha de Paridad):</strong>
                  <br />
                  La subfinanciación resultante en el último mes de simulación (Mes {horizonte}) se calcula como:
                </p>
                {(() => {
                  const lastProy = simulation.proyectado[horizonte - 1];
                  const isLoss = lastProy.brecha < 0;
                  return (
                    <div className={`p-4 rounded-xl border ${isLoss ? 'bg-rose-950/20 border-rose-500/30' : 'bg-emerald-950/20 border-emerald-500/30'} text-center space-y-3`}>
                      <span className={`text-xs font-black uppercase tracking-wider block ${isLoss ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {isLoss ? '❌ Resultado Simulado (Pérdida/Desfasaje)' : '✅ Resultado Simulado (Suficiencia)'}
                      </span>
                      <div className="block">
                        <MathJaxFormula formula={`\\text{Brecha}_{T+${horizonte}} = \\left( \\frac{Y_{T+${horizonte}} - V^P_{T+${horizonte}}}{V^P_{T+${horizonte}}} \\right) \\cdot 100`} />
                      </div>
                      <div className={`border-t ${isLoss ? 'border-rose-500/20' : 'border-emerald-500/20'} pt-2 block`}>
                        <MathJaxFormula formula={`\\text{Brecha}_{\\text{${simulation.baseData.label}}+${horizonte}} = \\left( \\frac{${fmtLatex(lastProy.Y, 2)} - ${fmtLatex(lastProy.VP, 2)}}{${fmtLatex(lastProy.VP, 2)}} \\right) \\cdot 100 = ${fmtLatex(lastProy.brecha, 2)}\\%`} />
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
