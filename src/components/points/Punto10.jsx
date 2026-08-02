import React, { useState, useMemo } from 'react';
import { MathJaxFormula } from '../MathJaxFormula';
import seriesData from '../../data/seriesData.json';
import { buildMatrices, calculateMCO, calculateRidge } from '../../utils/matrixMath';

export default function Punto10() {
  const opcionesModalidades = [
    { id: 'HD', nombre: 'Hemodiálisis Convencional (HD)', campoExcel: 'valorSesionHD' },
    { id: 'DP', nombre: 'Diálisis Peritoneal (DP)', campoExcel: 'valorModuloDP' },
    { id: 'HDF', nombre: 'Hemodiafiltración en Línea (HDF)', campoExcel: 'valorSesionHDF' }
  ];
  const [modalidad, setModalidad] = useState('HD');

  // Rango por defecto (últimos 12 meses)
  const defaultHasta = seriesData[seriesData.length - 1];
  const defaultDesdeIndex = Math.max(0, seriesData.length - 12);
  const defaultDesde = seriesData[defaultDesdeIndex];

  const [tDesde, setTDesde] = useState(defaultDesde.periodo);
  const [tHasta, setTHasta] = useState(defaultHasta.periodo);
  const [searchDesde, setSearchDesde] = useState('');
  const [searchHasta, setSearchHasta] = useState('');

  // Parámetro Lambda (regularización)
  const [lambda, setLambda] = useState(10);
  const [mostrarMatricesRidge, setMostrarMatricesRidge] = useState(false);

  const periodosDesdeFiltrados = seriesData.filter(p =>
    p.label.toLowerCase().includes(searchDesde.toLowerCase()) || p.periodo.includes(searchDesde)
  );

  const periodosHastaFiltrados = seriesData.filter(p =>
    (p.label.toLowerCase().includes(searchHasta.toLowerCase()) || p.periodo.includes(searchHasta)) &&
    p.periodo > tDesde
  );

  // Computaciones dinámicas de MCO vs Ridge
  const results = useMemo(() => {
    const filtered = seriesData.filter(d => d.periodo >= tDesde && d.periodo <= tHasta);
    const modObj = opcionesModalidades.find(m => m.id === modalidad) || opcionesModalidades[0];
    const { X, Y } = buildMatrices(filtered, modObj.campoExcel);

    // Calcular OLS (MCO)
    const mcoRes = calculateMCO(X, Y);

    // Calcular Ridge con lambda seleccionado
    const ridgeRes = calculateRidge(X, Y, lambda);

    // Precomputar curva de coeficientes para la traza Ridge (de lambda = 0 a 0.001)
    const steps = 10;
    const tracePoints = [];
    for (let i = 0; i <= steps; i++) {
      const l = (i / steps) * 0.001;
      const res = calculateRidge(X, Y, l);
      if (res && res.beta && !res.error) {
        tracePoints.push({ lambda: l, beta: res.beta, beta_star: res.beta_star });
      }
    }

    return {
      X,
      Y,
      mcoRes,
      ridgeRes,
      tracePoints,
      filtered
    };
  }, [tDesde, tHasta, modalidad, lambda]);

  // Configuración del gráfico de traza Ridge (SVG)
  const svgWidth = 460;
  const svgHeight = 180;
  const margin = { top: 25, right: 30, bottom: 30, left: 35 };

  const traceCoords = useMemo(() => {
    let globalMin = Infinity;
    let globalMax = -Infinity;
    if (results.tracePoints && results.tracePoints.length > 0) {
      results.tracePoints.forEach(p => {
        [1, 2, 3].forEach(idx => {
          const val = p.beta_star[idx];
          if (val < globalMin) globalMin = val;
          if (val > globalMax) globalMax = val;
        });
      });
    } else {
      globalMin = 0; globalMax = 1;
    }

    const delta = globalMax - globalMin;
    const yMax = globalMax + (delta * 0.1 || 1.0);
    const yMin = globalMin - (delta * 0.1 || 1.0);

    const getTracePolylineCoords = (index) => {
      const { tracePoints } = results;
      if (!tracePoints || tracePoints.length === 0) return { points: '' };

      const xStep = (svgWidth - margin.left - margin.right) / (tracePoints.length - 1 || 1);

      const points = tracePoints.map((p, i) => {
        const x = margin.left + i * xStep;
        const val = p.beta_star[index];
        const y = svgHeight - margin.bottom - ((val - yMin) / (yMax - yMin)) * (svgHeight - margin.top - margin.bottom);
        return `${x},${y}`;
      });

      return { points: points.join(' ') };
    };

    return {
      ipc: getTracePolylineCoords(1),
      usd: getTracePolylineCoords(2),
      cct: getTracePolylineCoords(3),
      yZero: svgHeight - margin.bottom - ((0 - yMin) / (yMax - yMin)) * (svgHeight - margin.top - margin.bottom)
    };
  }, [results]);

  // Si hay error en Ridge
  const hasError = results.ridgeRes.error || results.mcoRes.error;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="border-b pb-4 border-slate-300 dark:border-slate-800">
        <span className="text-xs font-black uppercase tracking-wider text-teal-800 dark:text-teal-400">
          Punto 10 • Regularización Econométrica
        </span>
        <h3 className="text-3xl sm:text-4xl font-black mt-1 text-slate-950 dark:text-white">
          La Regresión Ridge (Cresta)
        </h3>
        <p className="text-base sm:text-lg mt-2 leading-relaxed text-slate-800 font-normal dark:text-slate-300">
          Al añadir una penalización <MathJaxFormula formula={"L_2"} /> a la diagonal de la matriz (<MathJaxFormula formula={"\\lambda \\mathbf{I}"} />), la regresión Ridge estabiliza el condicionamiento numérico. Los coeficientes estimados abandonan sus signos erráticos y convergen hacia ponderaciones económicas consistentes con la realidad del tratamiento.
        </p>
      </div>

      {/* CONTROLES */}
      <div className="p-4 rounded-2xl border space-y-4 bg-slate-900 border-slate-800 text-slate-100 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <label className="text-xs font-bold text-slate-400">Modalidad:</label>
            <select
              value={modalidad}
              onChange={(e) => setModalidad(e.target.value)}
              className="w-full text-xs font-bold py-1 px-1 rounded border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-teal-500"
            >
              {opcionesModalidades.map(m => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <label className="text-xs font-bold text-slate-400">Desde:</label>
            <select
              value={tDesde}
              onChange={(e) => setTDesde(e.target.value)}
              className="w-full text-xs font-bold py-1 px-1 rounded border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-teal-500"
            >
              {periodosDesdeFiltrados.map(p => (
                <option key={p.periodo} value={p.periodo}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <label className="text-xs font-bold text-slate-400">Hasta:</label>
            <select
              value={tHasta}
              onChange={(e) => setTHasta(e.target.value)}
              className="w-full text-xs font-bold py-1 px-1 rounded border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-teal-500"
            >
              {periodosHastaFiltrados.map(p => (
                <option key={p.periodo} value={p.periodo}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* SLIDER DE LAMBDA */}
        <div className="flex flex-col space-y-1 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-teal-400">Factor de Penalización Lambda (<MathJaxFormula formula={"\\lambda"} />):</span>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                step="0.0001"
                min="0"
                value={lambda}
                onChange={(e) => setLambda(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 text-teal-400 font-mono text-sm px-2 py-0.5 rounded w-28 text-right focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="0.001"
            step="0.00001"
            value={lambda}
            onChange={(e) => setLambda(Number(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500 focus:outline-none focus:ring-0 mt-2"
          />
          <span className="text-[11px] text-slate-500 mt-1">
            * Ajusta el slider: un valor de 0 equivale a MCO puro (máxima distorsión); valores más altos contraen los coeficientes y restablecen sus signos económicos reales.
          </span>
        </div>
      </div>

      {/* COMPARATIVAS MCO VS RIDGE */}
      {!hasError && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* TABLA COMPARATIVA DE COEFICIENTES */}
          <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-teal-400 block border-b border-slate-800 pb-1.5">
              📊 Estabilización de Coeficientes (<MathJaxFormula formula={"\\beta"} />): MCO vs Ridge
            </span>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs uppercase font-bold text-slate-500">
                    <th className="py-2 text-left">Factor</th>
                    <th>MCO (<MathJaxFormula formula={"\\lambda = 0"} />)</th>
                    <th>Ridge (<MathJaxFormula formula={`\\lambda = ${lambda}`} />)</th>
                    <th>Estado de Coeficiente</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'IPC (Gastos)', idx: 1, color: 'text-yellow-500' },
                    { name: 'USD (Insumos)', idx: 2, color: 'text-cyan-400' },
                    { name: 'CCT (Salarios)', idx: 3, color: 'text-orange-500' }
                  ].map(f => {
                    const mcoVal = results.mcoRes.beta[f.idx];
                    const ridgeVal = results.ridgeRes.beta[f.idx];

                    const mcoSignErr = mcoVal < 0;
                    const ridgeSignErr = ridgeVal < 0;

                    return (
                      <tr key={f.idx} className="border-b border-slate-850 hover:bg-slate-900/30">
                        <td className="py-2.5 text-left font-semibold text-slate-300">{f.name}</td>
                        <td className={`font-mono ${mcoSignErr ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                          {mcoVal.toFixed(4)}
                        </td>
                        <td className={`font-mono font-bold ${ridgeSignErr ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {ridgeVal.toFixed(4)}
                        </td>
                        <td className="py-1">
                          {ridgeVal >= 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              ✓ Signo Lógico (+)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              ✗ Inconsistente (-)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[9.5px] text-slate-400 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-850 mt-1">
              <strong>💡 Diagnóstico:</strong> Nota cómo en la regresión Ridge, el coeficiente CCT (Salarios) o USD (Insumos) que figuraba inicialmente distorsionado debido al colapso del determinante en MCO, ahora asume un coeficiente positivo coherente con la realidad económica de los costos médicos.
            </p>
          </div>

          {/* GRÁFICO DE TRAZA RIDGE (SENSIVILIDAD Y CONVERGENCIA) */}
          <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md flex flex-col justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-teal-400 block mb-1">
                📈 Traza Ridge: Convergencia de los Coeficientes
              </span>
              <p className="text-xs text-slate-400 mb-3">
                Evolución de las elasticidades estimadas a medida que aumenta la penalización <MathJaxFormula formula={"\\lambda"} /> de 0 a 0.001.
              </p>
            </div>

            <div className="w-full flex justify-center my-auto">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto bg-slate-950/60 rounded-xl border border-slate-800/80">
                {/* Eje de Cero (Línea horizontal central de referencia) */}
                <line x1={margin.left} y1={traceCoords.yZero} x2={svgWidth - margin.right} y2={traceCoords.yZero} stroke="#334155" strokeDasharray="3 3" />

                {/* Ejes */}
                <line x1={margin.left} y1={svgHeight - margin.bottom} x2={svgWidth - margin.right} y2={svgHeight - margin.bottom} stroke="#475569" />
                <line x1={margin.left} y1={margin.top} x2={margin.left} y2={svgHeight - margin.bottom} stroke="#475569" />

                {/* Polylines de Traza */}
                <polyline fill="none" stroke="#eab308" strokeWidth="2.5" points={traceCoords.ipc.points} strokeLinecap="round" />
                <polyline fill="none" stroke="#06b6d4" strokeWidth="2.5" points={traceCoords.usd.points} strokeLinecap="round" />
                <polyline fill="none" stroke="#f97316" strokeWidth="2.5" points={traceCoords.cct.points} strokeLinecap="round" />

                {/* Marcador Vertical del Lambda Actual */}
                <line
                  x1={margin.left + (lambda / 0.001) * (svgWidth - margin.left - margin.right)}
                  y1={margin.top}
                  x2={margin.left + (lambda / 0.001) * (svgWidth - margin.left - margin.right)}
                  y2={svgHeight - margin.bottom}
                  stroke="#2dd4bf"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />

                {/* Etiquetas de Ejes */}
                <text x={margin.left} y={svgHeight - 10} fill="#64748b" fontSize="8" textAnchor="middle">λ = 0</text>
                <text x={svgWidth - margin.right} y={svgHeight - 10} fill="#64748b" fontSize="8" textAnchor="middle">λ = 0.001</text>

                {/* Leyenda vertical y desplazada fuera de las líneas */}
                <text x={margin.left} y={margin.top - 8} fill="#94a3b8" fontSize="8" fontStyle="italic" fontWeight="bold">Magnitud Z-Score (Elasticidad Estandarizada)</text>
              </svg>
            </div>

            <div className="flex items-center justify-center gap-4 mt-3 text-xs font-black font-mono">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-yellow-500 rounded" /> <span>IPC</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-cyan-500 rounded" /> <span>USD</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-orange-500 rounded" /> <span>CCT (Salarios)</span></div>
            </div>
          </div>

        </div>
      )}

      {/* BOTON DESARROLLO MATEMÁTICO RIDGE */}
      {!hasError && (
        <div className="flex justify-center">
          <button
            onClick={() => setMostrarMatricesRidge(!mostrarMatricesRidge)}
            className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-900 border border-slate-700 text-teal-400 hover:bg-slate-800 transition"
          >
            {mostrarMatricesRidge ? '🙈 Ocultar Demostración Ridge' : '🎓 Mostrar Demostración Ridge en Tiempo Real'}
          </button>
        </div>
      )}

      {/* PANEL MATEMÁTICO DESPLEGABLE RIDGE */}
      {mostrarMatricesRidge && !hasError && (
        <div className="p-5 rounded-3xl border bg-slate-950 border-slate-800/80 text-slate-300 space-y-6">
          <div className="border-b border-slate-850 pb-2">
            <h4 className="text-sm font-black uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              <span>📓</span>
              <span>Demostración Algebraica de la Penalización L2 (Cresta)</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Ecuación modificada: <MathJaxFormula formula={"\\hat{\\beta}_{MCO\\_Ridge} = (\\mathbf{X}^T \\mathbf{X} + \\lambda \\mathbf{I})^{-1} \\mathbf{X}^T \\mathbf{Y}"} />.
            </p>
          </div>

          <div className="space-y-4">

            {/* Visualizacion del Modificador de la Diagonal */}
            <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-3.5">
              <span className="text-xs font-bold text-slate-200 block border-b border-slate-800 pb-1">
                Estructura del modificador diagonal de la cresta (<MathJaxFormula formula={"\\lambda \\mathbf{I}"} />):
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Para evitar distorsionar el arancel base autónomo (<MathJaxFormula formula={"\\beta_0"} />), la matriz de penalización <MathJaxFormula formula={"\\mathbf{I}"} /> posee un coeficiente de cero en la primera fila. De esta forma, <MathJaxFormula formula={"\\lambda"} /> se suma únicamente a los factores macroeconómicos que covarían (IPC, USD y CCT):
              </p>

              <div className="flex justify-center text-xs p-3.5 bg-slate-950 rounded-xl border border-slate-850">
                <table className="text-center font-mono text-xs text-slate-300">
                  <tbody>
                    <tr>
                      <td className="px-3 border-r border-slate-800">0</td>
                      <td className="px-3">0</td>
                      <td className="px-3">0</td>
                      <td className="px-3">0</td>
                    </tr>
                    <tr>
                      <td className="px-3 border-r border-slate-800">0</td>
                      <td className="px-3 font-bold text-teal-400">{lambda}</td>
                      <td className="px-3">0</td>
                      <td className="px-3">0</td>
                    </tr>
                    <tr>
                      <td className="px-3 border-r border-slate-800">0</td>
                      <td className="px-3">0</td>
                      <td className="px-3 font-bold text-teal-400">{lambda}</td>
                      <td className="px-3">0</td>
                    </tr>
                    <tr>
                      <td className="px-3 border-r border-slate-800">0</td>
                      <td className="px-3">0</td>
                      <td className="px-3">0</td>
                      <td className="px-3 font-bold text-teal-400">{lambda}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Matriz resultante final corregida */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-200 block">
                Matriz de Información Estabilizada <MathJaxFormula formula={"\\mathbf{X}^T \\mathbf{X} + \\lambda \\mathbf{I}"} />:
              </span>
              <div className="overflow-x-auto p-3.5 rounded-xl border border-slate-800 bg-slate-900/30">
                <table className="w-full text-center text-xs font-mono">
                  <tbody>
                    {results.ridgeRes.XtX.map((row, idx) => (
                      <tr key={idx}>
                        {row.map((val, colIdx) => (
                          <td key={colIdx} className={`px-3 py-1 ${idx === colIdx && idx > 0 ? 'text-teal-400 font-bold' : 'text-slate-300'}`}>
                            {val.toLocaleString('es-AR', { maximumFractionDigits: 1 })}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <span className="text-[9.5px] text-slate-500 block">
                * Nota: Observa los valores resaltados en verde en la diagonal principal. Al sumarse <MathJaxFormula formula={`\\lambda = ${lambda}`} /> a los elementos originales de la diagonal, se rompe matemáticamente la singularidad del determinante. La matriz ya no está mal condicionada, y su inversa resulta numéricamente estable.
              </span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
