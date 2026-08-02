import React, { useState, useMemo } from 'react';
import { MathJaxFormula } from '../MathJaxFormula';
import seriesData from '../../data/seriesData.json';
import { buildMatrices, calculateMCO } from '../../utils/matrixMath';
import { fmtAR, fmtLatex } from '../../utils/format';

export default function Punto8() {
  const [mostrarDesarrolloMatematico, setMostrarDesarrolloMatematico] = useState(false);

  // Opciones de Modalidad
  const opcionesModalidades = [
    { id: 'HD', nombre: 'Hemodiálisis Convencional (HD)', campoExcel: 'valorSesionHD', unidadLabel: 'por sesión' },
    { id: 'DP', nombre: 'Diálisis Peritoneal (DP)', campoExcel: 'valorModuloDP', unidadLabel: 'por módulo' },
    { id: 'HDF', nombre: 'Hemodiafiltración en Línea (HDF)', campoExcel: 'valorSesionHDF', unidadLabel: 'por sesión' }
  ];
  const [modalidad, setModalidad] = useState('HD');

  // Rango de fechas por defecto: últimos 12 meses
  const defaultHasta = seriesData[seriesData.length - 1];
  // Mes 12 meses atrás
  const defaultDesdeIndex = Math.max(0, seriesData.length - 12);
  const defaultDesde = seriesData[defaultDesdeIndex];

  const [tDesde, setTDesde] = useState(defaultDesde.periodo);
  const [tHasta, setTHasta] = useState(defaultHasta.periodo);

  const [searchDesde, setSearchDesde] = useState('');
  const [searchHasta, setSearchHasta] = useState('');

  // Cambiar modalidad
  const handleSelectModalidad = (e) => {
    setModalidad(e.target.value);
  };

  // Filtrar periodos
  const periodosDesdeFiltrados = seriesData.filter(p =>
    p.label.toLowerCase().includes(searchDesde.toLowerCase()) || p.periodo.includes(searchDesde)
  );

  const periodosHastaFiltrados = seriesData.filter(p =>
    (p.label.toLowerCase().includes(searchHasta.toLowerCase()) || p.periodo.includes(searchHasta)) &&
    p.periodo > tDesde // Debe ser estrictamente posterior
  );

  // Computaciones del Modelo MCO y datos
  const {
    datosFiltrados,
    matrizX,
    vectorY,
    mcoResult,
    evolucionIndices,
    decomposicionSensibilidad
  } = useMemo(() => {
    // 1. Filtrar los datos en el rango [tDesde, tHasta]
    const filtered = seriesData.filter(d => d.periodo >= tDesde && d.periodo <= tHasta);
    const modObj = opcionesModalidades.find(m => m.id === modalidad) || opcionesModalidades[0];

    // 2. Construir matrices
    const { X, Y } = buildMatrices(filtered, modObj.campoExcel);

    // 3. Ejecutar regresión MCO
    const result = calculateMCO(X, Y);

    // 4. Calcular evolución de índices normalizados a Base 100
    const firstVal = filtered[0] || {};
    const evo = filtered.map(item => ({
      periodo: item.periodo,
      label: item.label,
      ipcNorm: firstVal.ipc ? (item.ipc / firstVal.ipc) * 100 : 100,
      usdNorm: firstVal.usd ? (item.usd / firstVal.usd) * 100 : 100,
      cctNorm: firstVal.cct ? (item.cct / firstVal.cct) * 100 : 100,
      valorReal: item[modObj.campoExcel]
    }));

    // 5. Decomposicion de sensibilidad: deltaX * beta
    let decomp = [];
    if (result && result.beta && !result.error) {
      const lastVal = filtered[filtered.length - 1] || {};
      const deltaIPC = lastVal.ipc - firstVal.ipc;
      const deltaUSD = lastVal.usd - firstVal.usd;
      const deltaCCT = lastVal.cct - firstVal.cct;

      const [b0, b1, b2, b3] = result.beta;

      decomp = [
        { name: 'IPC (Gastos)', val: b1 * deltaIPC, color: '#eab308', delta: deltaIPC, beta: b1 },
        { name: 'USD (Insumos)', val: b2 * deltaUSD, color: '#06b6d4', delta: deltaUSD, beta: b2 },
        { name: 'CCT (Salarios)', val: b3 * deltaCCT, color: '#f97316', delta: deltaCCT, beta: b3 }
      ];
    }

    return {
      datosFiltrados: filtered,
      matrizX: X,
      vectorY: Y,
      mcoResult: result,
      evolucionIndices: evo,
      decomposicionSensibilidad: decomp
    };
  }, [tDesde, tHasta, modalidad]);

  // Selección de modalidad activa
  const modObjActivo = opcionesModalidades.find(m => m.id === modalidad);

  // SVG Chart Config
  const svgWidth = 500;
  const svgHeight = 250;
  const margin = { top: 20, right: 30, bottom: 40, left: 45 };

  // Helper para generar coordenadas del Gráfico A (Evolución de Índices)
  const getCoordsLineChart = (data, key) => {
    if (!data.length) return '';
    const xStep = (svgWidth - margin.left - margin.right) / (data.length - 1 || 1);

    // Encontrar min/max para escalar Eje Y
    let maxVal = 100;
    let minVal = 100;
    data.forEach(d => {
      const v = d[key];
      if (v > maxVal) maxVal = v;
      if (v < minVal) minVal = v;
    });

    // Añadir un margen de 10%
    const delta = maxVal - minVal;
    const yMax = maxVal + (delta * 0.1 || 10);
    const yMin = Math.max(0, minVal - (delta * 0.1 || 10));

    const points = data.map((d, i) => {
      const x = margin.left + i * xStep;
      const y = svgHeight - margin.bottom - ((d[key] - yMin) / (yMax - yMin)) * (svgHeight - margin.top - margin.bottom);
      return `${x},${y}`;
    });

    return { points: points.join(' '), min: yMin, max: yMax };
  };

  const lineChartData = useMemo(() => {
    return {
      ipc: getCoordsLineChart(evolucionIndices, 'ipcNorm'),
      usd: getCoordsLineChart(evolucionIndices, 'usdNorm'),
      cct: getCoordsLineChart(evolucionIndices, 'cctNorm')
    };
  }, [evolucionIndices]);

  // Rango global de Y para el gráfico de índices
  const yAxisMin = Math.min(lineChartData.ipc.min, lineChartData.usd.min, lineChartData.cct.min);
  const yAxisMax = Math.max(lineChartData.ipc.max, lineChartData.usd.max, lineChartData.cct.max);

  const getYCoord = (val) => {
    return svgHeight - margin.bottom - ((val - yAxisMin) / (yAxisMax - yAxisMin)) * (svgHeight - margin.top - margin.bottom);
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="border-b pb-4 border-slate-300 dark:border-slate-800">
        <span className="text-xs font-black uppercase tracking-wider text-teal-800 dark:text-teal-400">
          Punto 8 • Modelado Econométrico Histórico
        </span>
        <h3 className="text-3xl sm:text-4xl font-black mt-1 text-slate-950 dark:text-white">
          Regresión por Mínimos Cuadrados Ordinarios (MCO)
        </h3>
        <p className="text-base sm:text-lg mt-2 leading-relaxed text-slate-800 font-normal dark:text-slate-300">
          A través del análisis econométrico de MCO, estimamos las ponderaciones porcentuales implícitas históricas que la obra social otorgó a los factores de costo (IPC, USD y CCT). Verificamos el comportamiento de los estimadores ante las volatilidades del país.
        </p>
      </div>

      {/* CONTROLES / PARAMETROS */}
      <div className="p-4 rounded-2xl border space-y-3 bg-slate-900 border-slate-800 text-slate-100 shadow-md">
        <span className="text-sm font-bold uppercase tracking-wider text-teal-400 block">
          🎛️ Configuración de la Simulación MCO:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Modalidad */}
          <div className="flex flex-col space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <label className="text-xs font-bold text-slate-400">Modalidad bajo análisis:</label>
            <select
              value={modalidad}
              onChange={handleSelectModalidad}
              className="w-full text-xs font-bold py-1 px-1 rounded border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-teal-500"
            >
              {opcionesModalidades.map(m => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
          </div>

          {/* Periodo Desde */}
          <div className="flex flex-col space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <label className="text-xs font-bold text-slate-400">Desde (Periodo base regresión):</label>
            <select
              value={tDesde}
              onChange={(e) => setTDesde(e.target.value)}
              className="w-full text-xs font-bold py-1 px-1 rounded border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-teal-500"
            >
              {periodosDesdeFiltrados.map(p => (
                <option key={p.periodo} value={p.periodo}>{p.label}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="🔍 Buscar mes..."
              value={searchDesde}
              onChange={(e) => setSearchDesde(e.target.value)}
              className="text-xs bg-slate-900 text-slate-200 border border-slate-800 p-0.5 rounded focus:outline-none mt-1"
            />
          </div>

          {/* Periodo Hasta */}
          <div className="flex flex-col space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <label className="text-xs font-bold text-slate-400">Hasta (Fin del periodo analizado):</label>
            <select
              value={tHasta}
              onChange={(e) => setTHasta(e.target.value)}
              className="w-full text-xs font-bold py-1 px-1 rounded border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-teal-500"
            >
              {periodosHastaFiltrados.map(p => (
                <option key={p.periodo} value={p.periodo}>{p.label}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="🔍 Buscar mes..."
              value={searchHasta}
              onChange={(e) => setSearchHasta(e.target.value)}
              className="text-xs bg-slate-900 text-slate-200 border border-slate-800 p-0.5 rounded focus:outline-none mt-1"
            />
          </div>

        </div>
      </div>

      {/* RESULTADO DEL MODELO (ALERTA DE COLAPSO O EXPLICACIÓN) */}
      {mcoResult.error ? (
        <div className="p-4 rounded-xl border-2 border-red-500/40 bg-red-950/20 text-red-300 text-base sm:text-lg leading-relaxed space-y-2">
          <div className="flex items-center gap-2 font-black text-red-400 uppercase text-sm">
            <span>🚨</span>
            <span>{mcoResult.error.split(':')[0]}</span>
          </div>
          <p>{mcoResult.error.split(':').slice(1).join(':')}</p>
          <p className="text-slate-400 text-xs">
            Este fenómeno se produce debido a la <strong>multicolinealidad perfecta</strong>. Al coincidir la devaluación (USD) y la inflación (IPC) de manera idéntica en ciertos tramos del historial, los vectores explicativos son linealmente dependientes, lo cual provoca que el determinante de la matriz de información sea cero y no exista su inversa.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* PANEL DE GRÁFICO A: EVOLUCIÓN DE ÍNDICES */}
          <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md">
            <span className="text-xs font-black uppercase tracking-wider text-teal-400 block mb-3">
              📈 Gráfico A: Evolución de Índices de Costo (Base 100 = {tDesde})
            </span>
            <div className="w-full flex justify-center">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto bg-slate-950/60 rounded-xl border border-slate-800/80">
                {/* Gridlines */}
                {[100, 150, 200, 250, 300].map(val => {
                  const y = getYCoord(val);
                  if (y < margin.top || y > svgHeight - margin.bottom) return null;
                  return (
                    <g key={val}>
                      <line x1={margin.left} y1={y} x2={svgWidth - margin.right} y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                      <text x={margin.left - 8} y={y + 3} fill="#475569" fontSize="8" textAnchor="end">{val}%</text>
                    </g>
                  );
                })}

                {/* Ejes */}
                <line x1={margin.left} y1={svgHeight - margin.bottom} x2={svgWidth - margin.right} y2={svgHeight - margin.bottom} stroke="#334155" />
                <line x1={margin.left} y1={margin.top} x2={margin.left} y2={svgHeight - margin.bottom} stroke="#334155" />

                {/* Líneas de Índices */}
                <polyline fill="none" stroke="#eab308" strokeWidth="2.5" points={lineChartData.ipc.points} strokeLinecap="round" />
                <polyline fill="none" stroke="#06b6d4" strokeWidth="2.5" points={lineChartData.usd.points} strokeLinecap="round" />
                <polyline fill="none" stroke="#f97316" strokeWidth="2.5" points={lineChartData.cct.points} strokeLinecap="round" />

                {/* Eje X Etiquetas */}
                <text x={margin.left} y={svgHeight - 12} fill="#64748b" fontSize="8" textAnchor="start">
                  {tDesde}
                </text>
                <text x={svgWidth - margin.right} y={svgHeight - 12} fill="#64748b" fontSize="8" textAnchor="end">
                  {tHasta}
                </text>
              </svg>
            </div>

            {/* Leyenda */}
            <div className="flex items-center justify-center gap-4 mt-3 text-xs font-black font-mono">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-yellow-500 rounded" /> <span>IPC</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-cyan-500 rounded" /> <span>USD</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-orange-500 rounded" /> <span>CCT (Salarios)</span></div>
            </div>
          </div>

          {/* PANEL DE GRÁFICO B: ANÁLISIS DE SENSIBILIDAD MCO */}
          <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md flex flex-col justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-teal-400 block mb-1">
                📊 Gráfico B: Descomposición de la Sensibilidad MCO
              </span>
              <p className="text-xs text-slate-400 mb-3">
                Impacto estimado del cambio de cada índice en el arancel final durante el período (<MathJaxFormula formula={"\\Delta Y_j = \\beta_j \\cdot \\Delta X_j"} />).
              </p>
            </div>

            <div className="space-y-3.5 my-auto">
              {decomposicionSensibilidad.map((item, idx) => {
                const total = decomposicionSensibilidad.reduce((sum, i) => sum + Math.abs(i.val), 0) || 1;
                const percentage = (Math.abs(item.val) / total) * 105; // Normalización visual
                const displayPercent = (Math.abs(item.val) / total) * 100;
                const isNegative = item.val < 0;

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold flex items-center gap-1">
                        <span style={{ color: item.color }}>■</span>
                        <span>{item.name}</span>
                      </span>
                      <span className="font-mono font-bold text-slate-200">
                        {isNegative ? '-' : '+'}${Math.abs(item.val).toLocaleString('es-AR', { maximumFractionDigits: 0 })} ARS
                        <span className="text-xs text-slate-500 ml-1">({fmtAR(displayPercent, 0)} %)</span>
                      </span>
                    </div>
                    {/* Barra */}
                    <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 flex">
                      {isNegative ? (
                        <>
                          <div className="w-1/2 flex justify-end">
                            <div 
                              style={{ width: `${Math.min(100, displayPercent / 2)}%`, backgroundColor: item.color }} 
                              className="h-full rounded-l-full opacity-80"
                            />
                          </div>
                          <div className="w-1/2 border-l border-red-500/50" />
                        </>
                      ) : (
                        <>
                          <div className="w-1/2 border-r border-teal-500/50" />
                          <div className="w-1/2 flex justify-start">
                            <div 
                              style={{ width: `${Math.min(100, displayPercent / 2)}%`, backgroundColor: item.color }} 
                              className="h-full rounded-r-full"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-xs p-2.5 bg-slate-950/80 border border-slate-850 rounded-xl mt-3 leading-relaxed text-slate-400">
              <span className="text-red-400 font-extrabold block">⚠️ Síntoma de Inestabilidad:</span> Si observas barras que crecen en sentido opuesto al esperado (o con valores desproporcionados), estás presenciando la <b>pérdida de ortogonalidad</b>. Debido a que el IPC, USD y CCT covarían fuertemente, MCO asigna coeficientes erráticos (incluso negativos) para compensar matemáticamente la colinealidad.
            </div>

            {/* Explicación en Tiempo Real de los Porcentajes */}
            {!mcoResult.error && decomposicionSensibilidad.length > 0 && (
              <div className="text-xs p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl mt-3 leading-relaxed text-slate-300">
                <span className="text-teal-400 font-extrabold block uppercase tracking-wider text-[11px] mb-1">🔍 ¿Qué significan estos importes y porcentajes?</span>
                Representan el impacto individual estimado en el precio final. Los porcentajes indican cuánto aportó cada variable a la variación absoluta del arancel en el rango:
                <ul className="list-disc pl-4 mt-1 space-y-1 text-slate-400">
                  {decomposicionSensibilidad.map((item, idx) => {
                    const absVal = Math.abs(item.val);
                    const total = decomposicionSensibilidad.reduce((sum, i) => sum + Math.abs(i.val), 0) || 1;
                    const percentage = fmtAR((absVal / total) * 100, 0);
                    const isPositive = item.val >= 0;
                    return (
                      <li key={idx} className="text-[9.5px]">
                         <span className="text-slate-300 font-semibold">{item.name}:</span> Explicó el <span className="text-white font-bold">{percentage} %</span> del movimiento total del arancel, aplicando un efecto neto de <strong className={isPositive ? 'text-emerald-400' : 'text-rose-400'}>{isPositive ? '+' : '-'}{absVal.toLocaleString('es-AR', { maximumFractionDigits: 0 })} ARS</strong>.
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

        </div>
      )}

      {/* COEFICIENTES ESTIMADOS */}
      {!mcoResult.error && (
        <div className="p-4 rounded-2xl border bg-slate-900 border-slate-800 text-slate-100 flex flex-col sm:flex-row justify-between gap-4">
          <div className="space-y-1 max-w-xs">
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Intercepto Base (Arancel Autónomo)</span>
            <div className="text-lg font-black text-teal-400">
              ${mcoResult.beta[0].toLocaleString('es-AR', { maximumFractionDigits: 2 })} ARS
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Representa el valor base de la sesión estimado de forma estática, independiente de las fluctuaciones macroeconómicas.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 flex-1 max-w-lg">
            <div className="space-y-0.5 bg-slate-950/50 p-2 rounded-xl border border-slate-850 flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-slate-500 uppercase block font-bold">Elasticidad IPC (<MathJaxFormula formula={"\\beta_1"} />)</span>
                <span className={`text-xs font-mono font-bold ${mcoResult.beta[1] >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {fmtAR(mcoResult.beta[1], 4)}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight mt-1">
                 Por cada unidad que subió el IPC, el arancel varió en promedio <b>{fmtAR(mcoResult.beta[1], 2)} ARS</b>.
              </p>
            </div>
            <div className="space-y-0.5 bg-slate-950/50 p-2 rounded-xl border border-slate-850 flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-slate-500 uppercase block font-bold">Elasticidad USD (<MathJaxFormula formula={"\\beta_2"} />)</span>
                <span className={`text-xs font-mono font-bold ${mcoResult.beta[2] >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {fmtAR(mcoResult.beta[2], 4)}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight mt-1">
                 Por cada peso de devaluación del tipo de cambio oficial (USD), el arancel varió en promedio <b>{fmtAR(mcoResult.beta[2], 2)} ARS</b>.
              </p>
            </div>
            <div className="space-y-0.5 bg-slate-950/50 p-2 rounded-xl border border-slate-850 flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-slate-500 uppercase block font-bold">Elasticidad CCT (<MathJaxFormula formula={"\\beta_3"} />)</span>
                <span className={`text-xs font-mono font-bold ${mcoResult.beta[3] >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {fmtAR(mcoResult.beta[3], 4)}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight mt-1">
                {mcoResult.beta[3] < 0 
                  ? <span className="text-rose-400"><b>Distorsión colineal:</b> El signo negativo contradice la lógica de costos (colapso MCO).</span>
                   : `Por cada peso de aumento salarial CCT, el arancel varió en promedio ${fmtAR(mcoResult.beta[3], 2)} ARS.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* BOTON DESARROLLO MATEMÁTICO */}
      <div className="flex justify-center">
        <button
          onClick={() => setMostrarDesarrolloMatematico(!mostrarDesarrolloMatematico)}
          className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-900 border border-slate-700 text-teal-400 hover:bg-slate-800 transition"
        >
          {mostrarDesarrolloMatematico ? '🙈 Ocultar Desarrollo Matricial' : '🎓 Mostrar Desarrollo Matricial MCO'}
        </button>
      </div>

      {/* PANEL MATEMÁTICO DESPLEGABLE */}
      {mostrarDesarrolloMatematico && (
        <div className="p-5 rounded-3xl border bg-slate-950 border-slate-800/80 text-slate-300 space-y-6">
          <div className="border-b border-slate-850 pb-2">
            <h4 className="text-sm font-black uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              <span>📓</span>
              <span>Demostración Algebraica de Mínimos Cuadrados Ordinarios</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Resolución matricial viva con las {datosFiltrados.length} observaciones del período seleccionado.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-slate-200">1. Ecuación General Estimada:</span>
              <div className="bg-slate-900/60 p-3 rounded-xl text-center text-xs mt-1">
                <MathJaxFormula
                  formula={"\\hat{Y}_t = \\beta_0 + \\beta_1 \\cdot IPC_t + \\beta_2 \\cdot USD_t + \\beta_3 \\cdot CCT_t"}
                />
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-200">2. Representación Matricial:</span>
              <div className="bg-slate-900/60 p-3 rounded-xl text-center text-xs mt-1">
                <MathJaxFormula
                  formula={"\\mathbf{Y} = \\mathbf{X}\\beta + \\epsilon \\quad \\implies \\quad \\hat{\\beta}_{MCO} = (\\mathbf{X}^T \\mathbf{X})^{-1} \\mathbf{X}^T \\mathbf{Y}"}
                />
              </div>
            </div>

            {/* MATRICES REALES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Matriz X */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-400 block">Matriz de Diseño X ({matrizX.length} × 4):</span>
                <div className="max-h-48 overflow-y-auto border border-slate-800 rounded-xl bg-slate-900/40 text-xs">
                  <table className="w-full text-center border-collapse">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-800 text-[11px] uppercase font-bold text-slate-500">
                        <th className="py-1">Fila</th>
                        <th>Intercepto</th>
                        <th>IPC</th>
                        <th>USD</th>
                        <th>CCT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matrizX.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-850 hover:bg-slate-900/50">
                          <td className="py-1 font-mono text-slate-600">{idx + 1}</td>
                          <td className="font-mono text-slate-400">{row[0]}</td>
                          <td className="font-mono">{fmtAR(row[1], 1)}</td>
                          <td className="font-mono">{fmtAR(row[2], 2)}</td>
                          <td className="font-mono">{fmtAR(row[3], 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Vector Y */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-400 block">Vector de Aranceles Y ({vectorY.length} × 1):</span>
                <div className="max-h-48 overflow-y-auto border border-slate-800 rounded-xl bg-slate-900/40 text-xs">
                  <table className="w-full text-center border-collapse">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-800 text-[11px] uppercase font-bold text-slate-500">
                        <th className="py-1">Fila</th>
                        <th>Arancel Nominal ({modObjActivo.unidadLabel})</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vectorY.map((val, idx) => (
                        <tr key={idx} className="border-b border-slate-850 hover:bg-slate-900/50">
                          <td className="py-1 font-mono text-slate-600">{idx + 1}</td>
                          <td className="font-mono font-bold text-teal-400">${val.toLocaleString('es-AR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* PRODUCTO X^T * X */}
            {!mcoResult.error && (
              <div className="space-y-4 pt-4 border-t border-slate-850">

                {/* Matriz XtX */}
                <div>
                  <span className="text-xs font-bold text-slate-200 block mb-1">
                    3. Matriz de Información <MathJaxFormula formula={"\\mathbf{X}^T \\mathbf{X}"} /> (4 × 4):
                  </span>
                  <div className="overflow-x-auto p-3 rounded-xl border border-slate-800 bg-slate-900/30">
                    <table className="w-full text-center text-xs font-mono">
                      <tbody>
                        {mcoResult.XtX.map((row, idx) => (
                          <tr key={idx}>
                            {row.map((val, colIdx) => (
                              <td key={colIdx} className="px-3 py-1 text-slate-300">
                                {val.toLocaleString('es-AR', { maximumFractionDigits: 1 })}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Matriz XtX_inv */}
                <div>
                  <span className="text-xs font-bold text-slate-200 block mb-1">
                    4. Matriz Inversa <MathJaxFormula formula={"(\\mathbf{X}^T \\mathbf{X})^{-1}"} /> (4 × 4):
                  </span>
                  <div className="overflow-x-auto p-3 rounded-xl border border-slate-800 bg-slate-900/30">
                    <table className="w-full text-center text-xs font-mono text-cyan-400">
                      <tbody>
                        {mcoResult.XtX_inv.map((row, idx) => (
                          <tr key={idx}>
                            {row.map((val, colIdx) => (
                              <td key={colIdx} className="px-3 py-1">
                                {val.toExponential(4)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">
                    * Nota: Observar cómo los elementos exponenciales de la inversa se incrementan desproporcionadamente cuando las variables están correlacionadas. Esta es la raíz de la inflación de varianza (VIF).
                  </span>
                </div>

                {/* Beta Vector Result */}
                <div>
                  <span className="text-xs font-bold text-slate-200 block mb-1">
                    5. Vector Resultante de Parámetros <MathJaxFormula formula={"\\hat{\\beta}_{MCO}"} /> (4 × 1):
                  </span>
                  <div className="bg-slate-900 p-4 rounded-xl text-xs space-y-1.5">
                    <div><MathJaxFormula formula={`\\beta_0 \\text{ (Intercepto)} = ${fmtLatex(mcoResult.beta[0], 6)}`} /></div>
                    <div><MathJaxFormula formula={`\\beta_1 \\text{ (IPC)} = ${fmtLatex(mcoResult.beta[1], 6)}`} /></div>
                    <div><MathJaxFormula formula={`\\beta_2 \\text{ (USD)} = ${fmtLatex(mcoResult.beta[2], 6)}`} /></div>
                    <div><MathJaxFormula formula={`\\beta_3 \\text{ (CCT)} = ${fmtLatex(mcoResult.beta[3], 6)}`} /></div>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
