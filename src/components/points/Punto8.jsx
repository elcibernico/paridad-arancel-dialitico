import React, { useState, useMemo } from 'react';
import { MathJaxFormula } from '../MathJaxFormula';
import { buildMatrices, calculateMCO, calculateRidge, calculateConditionNumber, calculateVIFs, calculateR2Adjusted } from '../../utils/matrixMath';
import { fmtAR, fmtLatex } from '../../utils/format';
import { useGlobalParams } from '../../context/GlobalContext';
import { useAuth } from '../../context/AuthContext';

function matrixToLatex(matrix, decimals = 4) {
  if (!matrix || !Array.isArray(matrix)) return '';
  return '\\begin{bmatrix}' +
    matrix.map(row =>
      Array.isArray(row)
        ? row.map(val => (typeof val === 'number' && !isNaN(val) ? val.toFixed(decimals) : val)).join(' & ')
        : (typeof row === 'number' && !isNaN(row) ? row.toFixed(decimals) : row)
    ).join(' \\\\ ') +
    '\\end{bmatrix}';
}

// Formato numérico castellano: punto para miles, coma para decimales
function fmtES(n, dec = 4) {
  if (typeof n !== 'number' || isNaN(n)) return '—';
  return n.toLocaleString('es-AR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

export default function Punto8() {
  const { hasPermission } = useAuth();

  const canShowMco = hasPermission('p3_p2_a6');
  const canShowOrtogonalidad = hasPermission('p3_p2_a7');
  const canShowRidge = hasPermission('p3_p2_a8');
  const canShowValidacion = hasPermission('p3_p2_a9');

  const defaultTab = useMemo(() => {
    if (canShowMco) return 'mco';
    if (canShowOrtogonalidad) return 'ortogonalidad';
    if (canShowRidge) return 'ridge';
    if (canShowValidacion) return 'validacion';
    return null;
  }, [canShowMco, canShowOrtogonalidad, canShowRidge, canShowValidacion]);

  const [activeTabState, setActiveTabState] = useState(null);
  const activeTab = activeTabState || defaultTab;

  const {
    seriesData,
    modalidadDialitica, setModalidadDialitica,
    periodoDesde, setPeriodoDesde,
    periodoHasta, setPeriodoHasta,
    lambdaRidge, setLambdaRidge
  } = useGlobalParams();

  // Forzar siempre periodoDesde ante cualquier cruce de rango temporal
  const handlePeriodoHastaChange = (val) => {
    setPeriodoHasta(val);
    const indexHasta = seriesData.findIndex(d => d.periodo === val);
    const indexDesde = seriesData.findIndex(d => d.periodo === periodoDesde);
    // Si periodoDesde es posterior a periodoHasta, o si el rango tiene menos de 4 meses
    if (indexDesde === -1 || indexDesde > indexHasta || (indexHasta - indexDesde + 1) < 4) {
      const targetDesdeIdx = Math.max(0, indexHasta - 11); // Fallback a 12 meses anteriores
      setPeriodoDesde(seriesData[targetDesdeIdx].periodo);
    }
  };

  const handlePeriodoDesdeChange = (val) => {
    const indexDesde = seriesData.findIndex(d => d.periodo === val);
    const indexHasta = seriesData.findIndex(d => d.periodo === periodoHasta);
    // Evitar que el usuario elija un periodoDesde que deje menos de 4 meses
    if (indexHasta !== -1 && (indexHasta - indexDesde + 1) < 4) {
      const maxDesdeIdx = Math.max(0, indexHasta - 3); // Límite que deja exactamente 4 meses
      setPeriodoDesde(seriesData[maxDesdeIdx].periodo);
    } else {
      setPeriodoDesde(val);
    }
  };

  const [mostrarVariables, setMostrarVariables] = useState(false);
  const [mostrarFinanciadora, setMostrarFinanciadora] = useState(false);
  const [mostrarDesarrolloMco, setMostrarDesarrolloMco] = useState(false);
  const [mostrarDesarrolloOrt, setMostrarDesarrolloOrt] = useState(false);
  const [mostrarDesarrolloRidge, setMostrarDesarrolloRidge] = useState(false);
  const [mostrarDesarrolloVal, setMostrarDesarrolloVal] = useState(false);
  const [mostrarAuditoriaMco, setMostrarAuditoriaMco] = useState(false); // controla el desglose paso a paso MCO
  const [mostrarAuditoriaRidge, setMostrarAuditoriaRidge] = useState(false); // controla el desglose paso a paso Ridge
  const [metricType, setMetricType] = useState('beta'); // 'beta', 'elasticidad', 'estandarizado'
  const [expandedIndicator, setExpandedIndicator] = useState(null); // 'condicion' | 'r2' | 'insesgadez'
  const [selectedXtXCell, setSelectedXtXCell] = useState(null); // { row, col } para la auditoría de XᵀX
  const [selectedRidgeCell, setSelectedRidgeCell] = useState(null); // { row, col } para la auditoría de Ridge (XᵀX + λI)

  const opcionesModalidades = [
    { id: 'HD', nombre: 'Hemodiálisis Convencional (HD)', campoExcel: 'valorSesionHD', unidadLabel: 'por sesión' },
    { id: 'DP', nombre: 'Diálisis Peritoneal (DP)', campoExcel: 'valorModuloDP', unidadLabel: 'por módulo' },
    { id: 'HDF', nombre: 'Hemodiafiltración en Línea (HDF)', campoExcel: 'valorSesionHDF', unidadLabel: 'por sesión' }
  ];

  const modObjActivo = opcionesModalidades.find(m => m.id === modalidadDialitica) || opcionesModalidades[0];

  // ─── SVG constants ─────────────────────────────────────────────
  const svgW = 460;
  const chartAH = 205;
  const chartAM = { top: 20, right: 30, bottom: 55, left: 44 };
  const ridgeH = 195;
  const ridgeM = { top: 20, right: 30, bottom: 44, left: 44 };

  // ─── Main computation ──────────────────────────────────────────
  const results = useMemo(() => {
    let filtered = seriesData.filter(d => d.periodo >= periodoDesde && d.periodo <= periodoHasta);
    let isFallbackRange = false;

    if (filtered.length < 4) {
      filtered = seriesData.slice(-12); // Fallback a los últimos 12 meses
      isFallbackRange = true;
    }

    const firstVal = filtered[0];
    const lastVal = filtered[filtered.length - 1];
    const { X, Y } = buildMatrices(filtered, modObjActivo.campoExcel);
    const mcoRes = calculateMCO(X, Y);
    const ridgeRes = calculateRidge(X, Y, lambdaRidge);
    const vifs = calculateVIFs(filtered);

    let conditionNumber = Infinity;
    if (mcoRes && !mcoRes.error && mcoRes.XtX_inv) {
      conditionNumber = calculateConditionNumber(mcoRes.XtX, mcoRes.XtX_inv);
    }

    const r2AdjRidge = (ridgeRes && ridgeRes.beta && !ridgeRes.error)
      ? calculateR2Adjusted(X, Y, ridgeRes.beta)
      : 0;

    const insesgadezRidge = (ridgeRes && ridgeRes.beta && !ridgeRes.error)
      ? (ridgeRes.beta[1] > 0 && ridgeRes.beta[2] > 0 && ridgeRes.beta[3] > 0)
      : false;

    // Ridge trace for all lambda values 0→0.001
    const steps = 10;
    const tracePoints = [];
    for (let i = 0; i <= steps; i++) {
      const l = (i / steps) * 0.001;
      const res = calculateRidge(X, Y, l);
      if (res && res.beta && !res.error) {
        tracePoints.push({ lambda: l, beta: res.beta, beta_star: res.beta_star });
      }
    }

    // Normalized evolution (Base 100 = firstVal)
    const evo = filtered.map(item => ({
      periodo: item.periodo,
      label: item.label,
      ipcNorm: firstVal.ipc ? (item.ipc / firstVal.ipc) * 100 : 100,
      usdNorm: firstVal.usd ? (item.usd / firstVal.usd) * 100 : 100,
      cctNorm: firstVal.cct ? (item.cct / firstVal.cct) * 100 : 100,
      valorRealNorm: firstVal[modObjActivo.campoExcel]
        ? (item[modObjActivo.campoExcel] / firstVal[modObjActivo.campoExcel]) * 100
        : 100,
    }));

    const ipc = filtered.map(d => d.ipc);
    const usd = filtered.map(d => d.usd);
    const cct = filtered.map(d => d.cct);
    const n = filtered.length;

    // Calculate means and standard deviations
    const meanIPC = ipc.reduce((s, v) => s + v, 0) / (n || 1);
    const meanUSD = usd.reduce((s, v) => s + v, 0) / (n || 1);
    const meanCCT = cct.reduce((s, v) => s + v, 0) / (n || 1);
    const meanY = Y.reduce((s, v) => s + v, 0) / (n || 1);

    const stdIPC = Math.sqrt(ipc.reduce((s, v) => s + Math.pow(v - meanIPC, 2), 0) / (n - 1 || 1));
    const stdUSD = Math.sqrt(usd.reduce((s, v) => s + Math.pow(v - meanUSD, 2), 0) / (n - 1 || 1));
    const stdCCT = Math.sqrt(cct.reduce((s, v) => s + Math.pow(v - meanCCT, 2), 0) / (n - 1 || 1));
    const stdY = Math.sqrt(Y.reduce((s, v) => s + Math.pow(v - meanY, 2), 0) / (n - 1 || 1));

    const mcoBeta = mcoRes && mcoRes.beta && !mcoRes.error ? mcoRes.beta : [0, 0, 0, 0];
    const ridgeBeta = ridgeRes && ridgeRes.beta && !ridgeRes.error ? ridgeRes.beta : [0, 0, 0, 0];
    const ridgeBetaStar = ridgeRes && ridgeRes.beta_star && !ridgeRes.error ? ridgeRes.beta_star : [0, 0, 0, 0];

    const mcoElasticidad = [
      null,
      mcoBeta[1] * (meanIPC / (meanY || 1)),
      mcoBeta[2] * (meanUSD / (meanY || 1)),
      mcoBeta[3] * (meanCCT / (meanY || 1))
    ];

    const ridgeElasticidad = [
      null,
      ridgeBeta[1] * (meanIPC / (meanY || 1)),
      ridgeBeta[2] * (meanUSD / (meanY || 1)),
      ridgeBeta[3] * (meanCCT / (meanY || 1))
    ];

    const mcoBetaStar = [
      null,
      mcoBeta[1] * (stdIPC / (stdY || 1)),
      mcoBeta[2] * (stdUSD / (stdY || 1)),
      mcoBeta[3] * (stdCCT / (stdY || 1))
    ];

    // MCO sensitivity decomposition
    let decomp = [];
    if (mcoRes && mcoRes.beta && !mcoRes.error) {
      const deltaIPC = lastVal.ipc - firstVal.ipc;
      const deltaUSD = lastVal.usd - firstVal.usd;
      const deltaCCT = lastVal.cct - firstVal.cct;
      const [, b1, b2, b3] = mcoRes.beta;
      decomp = [
        { name: 'IPC (Gastos)', val: b1 * deltaIPC, color: '#eab308', delta: deltaIPC, beta: b1 },
        { name: 'USD (Insumos)', val: b2 * deltaUSD, color: '#06b6d4', delta: deltaUSD, beta: b2 },
        { name: 'CCT (Salarios)', val: b3 * deltaCCT, color: '#f97316', delta: deltaCCT, beta: b3 }
      ];
    }

    // Ridge sensitivity decomposition
    let decompRidge = [];
    if (ridgeRes && ridgeRes.beta && !ridgeRes.error) {
      const deltaIPC = lastVal.ipc - firstVal.ipc;
      const deltaUSD = lastVal.usd - firstVal.usd;
      const deltaCCT = lastVal.cct - firstVal.cct;
      const [, r1, r2, r3] = ridgeRes.beta;
      decompRidge = [
        { name: 'IPC (Gastos)', val: r1 * deltaIPC, color: '#eab308', delta: deltaIPC, beta: r1 },
        { name: 'USD (Insumos)', val: r2 * deltaUSD, color: '#06b6d4', delta: deltaUSD, beta: r2 },
        { name: 'CCT (Salarios)', val: r3 * deltaCCT, color: '#f97316', delta: deltaCCT, beta: r3 }
      ];
    }

    // Pearson correlation
    const getCorr = (a, b) => {
      const n = a.length;
      if (!n) return 0;
      const mA = a.reduce((s, v) => s + v, 0) / n;
      const mB = b.reduce((s, v) => s + v, 0) / n;
      let num = 0, dA = 0, dB = 0;
      for (let i = 0; i < n; i++) {
        const da = a[i] - mA, db = b[i] - mB;
        num += da * db; dA += da * da; dB += db * db;
      }
      return dA * dB === 0 ? 0 : num / Math.sqrt(dA * dB);
    };

    return {
      X, Y, mcoRes, ridgeRes, vifs, conditionNumber, tracePoints,
      evolucionIndices: evo,
      decomposicionSensibilidad: decomp,
      decomposicionSensibilidadRidge: decompRidge,
      mcoBeta,
      ridgeBeta,
      mcoElasticidad,
      ridgeElasticidad,
      mcoBetaStar,
      ridgeBetaStar,
      corr: { ipc_usd: getCorr(ipc, usd), ipc_cct: getCorr(ipc, cct), usd_cct: getCorr(usd, cct) },
      datosFiltrados: filtered,
      r2AdjRidge,
      insesgadezRidge,
      isFallbackRange
    };
  }, [periodoDesde, periodoHasta, modalidadDialitica, lambdaRidge]);

  // ─── Chart A: shared-scale evolution (with optional financiadora) ──
  const chartA = useMemo(() => {
    if (!results || !results.evolucionIndices.length) return null;
    const data = results.evolucionIndices;
    const n = data.length;
    const xStep = (svgW - chartAM.left - chartAM.right) / (n - 1 || 1);
    const drawH = chartAH - chartAM.top - chartAM.bottom;
    const drawW = svgW - chartAM.left - chartAM.right;

    const allVals = [
      ...data.map(d => d.ipcNorm),
      ...data.map(d => d.usdNorm),
      ...data.map(d => d.cctNorm),
      ...(mostrarFinanciadora ? data.map(d => d.valorRealNorm) : [])
    ];
    const rawMin = Math.min(...allVals);
    const rawMax = Math.max(...allVals);
    const pad = (rawMax - rawMin) * 0.12 || 12;
    const yMin = Math.max(0, rawMin - pad);
    const yMax = rawMax + pad;

    const getY = val => chartAH - chartAM.bottom - ((val - yMin) / (yMax - yMin)) * drawH;
    const getX = i => chartAM.left + i * xStep;
    const pts = key => data.map((d, i) => `${getX(i)},${getY(d[key])}`).join(' ');

    // Y ticks (nice round numbers)
    const range = yMax - yMin;
    const magnitude = Math.pow(10, Math.floor(Math.log10(range / 4)));
    const rawTickStep = Math.ceil((range / 4) / magnitude) * magnitude;
    const tickStep = rawTickStep < 5 ? 5 : rawTickStep;
    const yTicks = [];
    for (let v = Math.ceil(yMin / tickStep) * tickStep; v <= yMax + 0.001; v += tickStep) {
      yTicks.push({ val: v, y: getY(v) });
    }

    // X ticks (show ~5 labels evenly)
    const interval = Math.max(1, Math.floor(n / 5));
    const xTicks = data.map((d, i) => ({
      x: getX(i), label: d.label,
      show: i === 0 || i === n - 1 || i % interval === 0
    }));

    return {
      pts, getY, getX,
      yTicks, xTicks,
      base100y: getY(100),
      financiadora: mostrarFinanciadora ? pts('valorRealNorm') : null,
      drawW, drawH
    };
  }, [results, mostrarFinanciadora]);

  // ─── Ridge trace coords ────────────────────────────────────────
  const traceCoords = useMemo(() => {
    if (!results || !results.tracePoints.length) return null;
    const { tracePoints } = results;
    let gMin = Infinity, gMax = -Infinity;
    tracePoints.forEach(p => {
      [1, 2, 3].forEach(idx => {
        if (p.beta_star[idx] < gMin) gMin = p.beta_star[idx];
        if (p.beta_star[idx] > gMax) gMax = p.beta_star[idx];
      });
    });
    const delta = gMax - gMin;
    const yMax = gMax + (delta * 0.12 || 1);
    const yMin = gMin - (delta * 0.12 || 1);
    const drawH = ridgeH - ridgeM.top - ridgeM.bottom;
    const drawW = svgW - ridgeM.left - ridgeM.right;

    const getY = v => ridgeH - ridgeM.bottom - ((v - yMin) / (yMax - yMin)) * drawH;
    const xStep = drawW / (tracePoints.length - 1 || 1);
    const pts = idx => tracePoints.map((p, i) => `${ridgeM.left + i * xStep},${getY(p.beta_star[idx])}`).join(' ');

    // Y ticks
    const yTicks = Array.from({ length: 5 }, (_, i) => {
      const v = yMin + i * (yMax - yMin) / 4;
      return { val: v, y: getY(v) };
    });

    // X ticks (lambda values)
    const xLambdaTicks = [0, 0.00025, 0.0005, 0.00075, 0.001].map(l => ({
      label: l === 0 ? '0' : l === 0.001 ? '0.001' : l.toFixed(4),
      x: ridgeM.left + (l / 0.001) * drawW
    }));

    const lambdaX = ridgeM.left + (lambdaRidge / 0.001) * drawW;
    const yZero = getY(0);

    return { ipc: pts(1), usd: pts(2), cct: pts(3), yTicks, xLambdaTicks, lambdaX, yZero };
  }, [results, lambdaRidge]);

  if (!results) {
    return <div className="p-8 text-center text-slate-400">Cargando datos de simulación...</div>;
  }

  // Severity assessment
  const maxVif = Math.max(results.vifs.ipc, results.vifs.usd, results.vifs.cct);
  const severity = results.mcoRes.error
    ? { label: 'Colapso Matemático Total', color: 'text-red-500 border-red-500 bg-red-950/25', desc: 'La devaluación y la inflación se movieron de forma idéntica en este tramo. La matriz es singular (determinante cero), haciendo imposible calcular la regresión.' }
    : results.conditionNumber > 100 || maxVif > 50
      ? { label: 'Multicolinealidad Crítica', color: 'text-red-400 border-red-900 bg-red-950/10', desc: 'Los coeficientes no tienen validez predictiva. El signo de los coeficientes puede alterarse (ej. salarios con peso negativo) debido a la colinealidad extrema.' }
      : results.conditionNumber > 30 || maxVif > 10
        ? { label: 'Multicolinealidad Moderada a Alta', color: 'text-yellow-400 border-yellow-800 bg-yellow-950/10', desc: 'Hay un solapamiento importante en el comportamiento de los índices. El modelo MCO pierde precisión.' }
        : { label: 'Ortogonalidad Aceptable', color: 'text-emerald-400 border-emerald-900 bg-emerald-950/10', desc: 'El nivel de correlación de los índices permite una estimación relativamente estable.' };

  const activeDecomp = (activeTab === 'ridge' || activeTab === 'validacion')
    ? results.decomposicionSensibilidadRidge
    : results.decomposicionSensibilidad;

  const totalAbsDecomp = activeDecomp.reduce((s, i) => s + Math.abs(i.val), 0) || 1;

  const evolucionBaseLabel = results?.datosFiltrados[0]?.label || periodoDesde;

  const evolucionIndicesWidget = chartA && (
    <div className="p-4 rounded-2xl border bg-slate-900/30 border-slate-800 shadow-md space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[14px] font-black uppercase tracking-wider text-teal-400">
          Evolución de Índices (Base 100 = {evolucionBaseLabel})
        </span>
        <button
          onClick={() => setMostrarFinanciadora(!mostrarFinanciadora)}
          className={`flex-shrink-0 text-[10px] font-black px-2 py-1 rounded-lg border transition ${mostrarFinanciadora
            ? 'bg-violet-500/20 border-violet-500/60 text-violet-300'
            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
        >
          {mostrarFinanciadora ? 'Ocultar Financiadora' : 'Ver Financiadora'}
        </button>
      </div>

      <svg viewBox={`0 0 ${svgW} ${chartAH}`} className="w-full h-auto bg-slate-950/60 rounded-xl border border-slate-800">
        {/* Y grid + ticks */}
        {chartA.yTicks.map(t => (
          <g key={t.val}>
            <line x1={chartAM.left} y1={t.y} x2={svgW - chartAM.right} y2={t.y}
              stroke="#1e293b" strokeDasharray="2 3" />
            <text x={chartAM.left - 5} y={t.y + 3} fill="#475569" fontSize="8" textAnchor="end">
              {Math.round(t.val)}%
            </text>
          </g>
        ))}
        {/* Base 100 reference line */}
        <line x1={chartAM.left} y1={chartA.base100y} x2={svgW - chartAM.right} y2={chartA.base100y}
          stroke="#334155" strokeDasharray="3 2" opacity="0.8" />
        <text x={chartAM.left + 3} y={chartA.base100y - 3} fill="#475569" fontSize="7">Base 100</text>
        {/* Axes */}
        <line x1={chartAM.left} y1={chartAM.top} x2={chartAM.left} y2={chartAH - chartAM.bottom} stroke="#334155" />
        <line x1={chartAM.left} y1={chartAH - chartAM.bottom} x2={svgW - chartAM.right} y2={chartAH - chartAM.bottom} stroke="#334155" />
        {/* Y axis label */}
        <text x={11} y={chartAH / 2} fill="#475569" fontSize="8" textAnchor="middle"
          transform={`rotate(-90 11 ${chartAH / 2})`}>Índice (Base=100)</text>
        {/* Series */}
        <polyline fill="none" stroke="#eab308" strokeWidth="1.5" points={chartA.pts('ipcNorm')} />
        <polyline fill="none" stroke="#06b6d4" strokeWidth="1.5" points={chartA.pts('usdNorm')} />
        <polyline fill="none" stroke="#f97316" strokeWidth="1.5" points={chartA.pts('cctNorm')} />
        {chartA.financiadora && (
          <polyline fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="5 2" points={chartA.financiadora} />
        )}
        {/* X axis labels */}
        {chartA.xTicks.filter(t => t.show).map((t, i) => (
          <text key={i} x={t.x} y={chartAH - chartAM.bottom + 11}
            fill="#475569" fontSize="7.5" textAnchor="end"
            transform={`rotate(-38 ${t.x} ${chartAH - chartAM.bottom + 11})`}>
            {t.label}
          </text>
        ))}
      </svg>

      <div className="flex justify-center gap-3 text-[10px] font-bold text-slate-400 font-mono flex-wrap">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> IPC</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500" /> USD</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> CCT</span>
        {mostrarFinanciadora && (
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500" /> Financiadora</span>
        )}
      </div>
    </div>
  );

  const trazaRidgeWidget = traceCoords && (
    <div className="p-4 rounded-2xl border bg-slate-900/30 border-slate-800 shadow-md space-y-2">
      <span className="text-[14px] font-black uppercase tracking-wider text-teal-400 block">
        Traza Ridge: Convergencia de los Coeficientes
      </span>
      <div className="text-[14px] text-slate-400 space-y-0.5 leading-snug">
        <p><strong className="text-slate-300">Eje X →</strong> Valor de λ (0 = MCO puro, 0.001 = máx. regularización).</p>
        <p><strong className="text-slate-300">Eje Y ↑</strong> Coeficientes estandarizados β* de cada variable. La <span className="text-teal-400 font-bold">línea vertical es el λ activo</span>.</p>
      </div>
      <svg viewBox={`0 0 ${svgW} ${ridgeH}`} className="w-full h-auto bg-slate-950/60 rounded-xl border border-slate-800">
        {/* Y grid + ticks */}
        {traceCoords.yTicks.map((t, i) => (
          <g key={i}>
            <line x1={ridgeM.left} y1={t.y} x2={svgW - ridgeM.right} y2={t.y}
              stroke="#1e293b" strokeDasharray="2 3" />
            <text x={ridgeM.left - 4} y={t.y + 3} fill="#475569" fontSize="9" textAnchor="end">
              {fmtES(t.val, 2)}
            </text>
          </g>
        ))}
        {/* Y=0 reference */}
        <line x1={ridgeM.left} y1={traceCoords.yZero} x2={svgW - ridgeM.right} y2={traceCoords.yZero}
          stroke="#334155" strokeDasharray="3 2" />
        {/* Axes */}
        <line x1={ridgeM.left} y1={ridgeM.top} x2={ridgeM.left} y2={ridgeH - ridgeM.bottom} stroke="#334155" />
        <line x1={ridgeM.left} y1={ridgeH - ridgeM.bottom} x2={svgW - ridgeM.right} y2={ridgeH - ridgeM.bottom} stroke="#334155" />
        {/* X ticks (lambda values) */}
        {traceCoords.xLambdaTicks.map((t, i) => (
          <g key={i}>
            <line x1={t.x} y1={ridgeH - ridgeM.bottom} x2={t.x} y2={ridgeH - ridgeM.bottom + 4} stroke="#334155" />
            <text x={t.x} y={ridgeH - ridgeM.bottom + 14} fill="#475569" fontSize="7.5" textAnchor="middle">
              {t.label}
            </text>
          </g>
        ))}
        {/* Axis titles */}
        <text x={svgW / 2} y={ridgeH - 2} fill="#475569" fontSize="8" textAnchor="middle">λ (penalización Ridge)</text>
        <text x={10} y={ridgeH / 2} fill="#475569" fontSize="8" textAnchor="middle"
          transform={`rotate(-90 10 ${ridgeH / 2})`}>β* (estand.)</text>
        {/* Series */}
        <polyline fill="none" stroke="#eab308" strokeWidth="2" points={traceCoords.ipc} />
        <polyline fill="none" stroke="#06b6d4" strokeWidth="2" points={traceCoords.usd} />
        <polyline fill="none" stroke="#f97316" strokeWidth="2" points={traceCoords.cct} />
        {/* Moving lambda line */}
        <line
          x1={traceCoords.lambdaX} y1={ridgeM.top}
          x2={traceCoords.lambdaX} y2={ridgeH - ridgeM.bottom}
          stroke="#2dd4bf" strokeWidth="2" strokeDasharray="4 4"
        />
        <text
          x={traceCoords.lambdaX > svgW - ridgeM.right - 40 ? traceCoords.lambdaX - 4 : traceCoords.lambdaX + 4}
          y={ridgeM.top + 10}
          fill="#2dd4bf" fontSize="7.5" fontWeight="bold"
          textAnchor={traceCoords.lambdaX > svgW - ridgeM.right - 40 ? 'end' : 'start'}
        >
          λ={lambdaRidge}
        </text>
      </svg>
      <div className="flex justify-center gap-3 text-[12px] font-bold text-slate-400 font-mono flex-wrap">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> IPC β*</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500" /> USD β*</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> CCT β*</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-400" /> λ activo</span>
      </div>
    </div>
  );

  const descomposicionSensibilidadWidget = activeDecomp.length > 0 ? (
    <div className="p-4 rounded-2xl border bg-slate-900/30 border-slate-800 shadow-md space-y-3">
      <span className="text-[14px] font-black uppercase tracking-wider text-teal-400 block">
        Descomposición de la Sensibilidad {(activeTab === 'ridge' || activeTab === 'validacion') ? 'Ridge (Saneada)' : 'MCO'}
      </span>

      <div className="space-y-2.5">
        {activeDecomp.map((item, idx) => {
          const pct = (Math.abs(item.val) / totalAbsDecomp) * 100;
          const isNeg = item.val < 0;
          return (
            <div key={idx} className="space-y-1 text-[14px]">
              <div className="flex justify-between font-mono items-center">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="flex items-center gap-1.5 text-right">
                  <span className={`font-bold ${isNeg ? 'text-red-400' : 'text-emerald-400'}`}>
                    {isNeg ? '−' : '+'}${Math.abs(item.val).toLocaleString('es-AR', { maximumFractionDigits: 0 })} ARS
                  </span>
                  <span className={`text-[14px] px-1.5 py-0.5 rounded font-black ${isNeg ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                    {isNeg ? `-${fmtES(pct, 0)}%` : `${fmtES(pct, 0)}%`}
                  </span>
                </span>
              </div>
              {/* Barra centrada en cero: positivos → derecha, negativos → izquierda */}
              <div className="relative w-full h-2.5 bg-slate-950 rounded overflow-hidden">
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-600 z-10" />
                {isNeg ? (
                  <div
                    style={{ width: `${pct / 2}%`, right: '50%', backgroundColor: '#ef4444' }}
                    className="absolute top-0 bottom-0 rounded-l transition-all duration-300"
                  />
                ) : (
                  <div
                    style={{ width: `${pct / 2}%`, left: '50%', backgroundColor: item.color }}
                    className="absolute top-0 bottom-0 rounded-r transition-all duration-300"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {(activeTab === 'mco' || activeTab === 'ortogonalidad') && (
        <div className="p-3 rounded-xl border border-yellow-700/40 bg-yellow-950/20 text-[14px] text-slate-300 leading-relaxed space-y-1">
          <p className="font-bold text-yellow-400 flex items-center gap-1.5">⚠️ Síntoma de Inestabilidad MCO:</p>
          <p>
            Si observás barras que crecen en sentido opuesto al esperado (o con valores desproporcionados),
            estás presenciando la <strong className="text-yellow-200">pérdida de ortogonalidad</strong>.
            Debido a que el IPC, USD y CCT covarían fuertemente, MCO asigna coeficientes erráticos
            (incluso negativos) para compensar matemáticamente la colinealidad.
          </p>
        </div>
      )}

      <div className="p-3 rounded-xl border border-teal-700/30 bg-teal-950/10 text-[14px] text-slate-300 leading-relaxed space-y-1.5">
        <p className="font-bold text-teal-300 uppercase tracking-wide flex items-center gap-1.5">
          🔍 ¿Qué significan estos importes y porcentajes?
        </p>
        <p>
          Representan el impacto individual estimado en el precio final. Los porcentajes indican cuánto
          aportó cada variable a la variación absoluta del arancel en el rango seleccionado:
        </p>
        <ul className="list-disc pl-4 space-y-0.5">
          {activeDecomp.map((item, idx) => {
            const pct = (Math.abs(item.val) / totalAbsDecomp) * 100;
            const isNeg = item.val < 0;
            return (
              <li key={idx}>
                <strong>{item.name}:</strong> Explicó el <strong>{Math.round(pct)}%</strong> del movimiento
                total, aplicando un efecto neto de{' '}
                <strong className={isNeg ? 'text-red-400' : 'text-emerald-400'}>
                  {isNeg ? '−' : '+'}${Math.abs(item.val).toLocaleString('es-AR', { maximumFractionDigits: 0 })} ARS
                </strong>.
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  ) : (
    <p className="text-[14px] text-slate-500 italic">No hay datos de descomposición disponibles para el rango seleccionado.</p>
  );

  const tablaCoeficientesWidget = (
    <div className="p-4 rounded-2xl border bg-slate-900/20 border-slate-800">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-2 mb-3">
        <span className="text-[12px] font-black uppercase tracking-wider text-teal-400 block">
          📐 {metricType === 'beta' ? 'Intercepto y Coeficientes (β)' : metricType === 'elasticidad' ? 'Elasticidades (ε)' : 'Coeficientes Estandarizados (β*)'} — {activeTab === 'mco' ? 'MCO' : 'MCO vs Ridge'}
        </span>
        <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px] font-bold self-end sm:self-auto">
          <button
            onClick={() => setMetricType('beta')}
            className={`px-2 py-1 rounded transition ${metricType === 'beta' ? 'bg-teal-500/20 text-teal-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            β Crudo
          </button>
          <button
            onClick={() => setMetricType('elasticidad')}
            className={`px-2 py-1 rounded transition ${metricType === 'elasticidad' ? 'bg-teal-500/20 text-teal-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            ε Elasticidad
          </button>
          <button
            onClick={() => setMetricType('estandarizado')}
            className={`px-2 py-1 rounded transition ${metricType === 'estandarizado' ? 'bg-teal-500/20 text-teal-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            β* Estandarizado
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[14px] text-center border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[12px] uppercase font-bold text-slate-500">
              <th className="py-1.5 text-left pr-2">Factor</th>
              <th>MCO</th>
              {(activeTab === 'ridge' || activeTab === 'validacion') && (
                <th className="text-emerald-400">Ridge (λ={lambdaRidge})</th>
              )}
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-900/60">
              <td className="py-1.5 text-left text-slate-400 font-semibold pr-2">
                {metricType === 'beta' ? 'β₀ (Intercepto)' : metricType === 'elasticidad' ? 'ε₀ (Intercepto)' : 'β*₀ (Intercepto)'}
              </td>
              <td className="font-mono text-slate-300">
                {metricType === 'beta' && results.mcoBeta ? fmtES(results.mcoBeta[0], 2) : '—'}
              </td>
              {(activeTab === 'ridge' || activeTab === 'validacion') && (
                <td className="font-mono text-emerald-400">
                  {metricType === 'beta' && results.ridgeBeta ? fmtES(results.ridgeBeta[0], 2) : '—'}
                </td>
              )}
              <td><span className="text-[12px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-bold">Estable</span></td>
            </tr>
            {[
              { label: metricType === 'beta' ? 'β₁ — IPC (Gastos)' : metricType === 'elasticidad' ? 'ε₁ — IPC (Gastos)' : 'β*₁ — IPC (Gastos)', idx: 1, color: 'text-yellow-400' },
              { label: metricType === 'beta' ? 'β₂ — USD (Insumos)' : metricType === 'elasticidad' ? 'ε₂ — USD (Insumos)' : 'β*₂ — USD (Insumos)', idx: 2, color: 'text-cyan-400' },
              { label: metricType === 'beta' ? 'β₃ — CCT (Salarios)' : metricType === 'elasticidad' ? 'ε₃ — CCT (Salarios)' : 'β*₃ — CCT (Salarios)', idx: 3, color: 'text-orange-400' }
            ].map(f => {
              const mcoV = metricType === 'beta' ? results.mcoBeta[f.idx] : metricType === 'elasticidad' ? results.mcoElasticidad[f.idx] : results.mcoBetaStar[f.idx];
              const ridgeV = metricType === 'beta' ? results.ridgeBeta[f.idx] : metricType === 'elasticidad' ? results.ridgeElasticidad[f.idx] : results.ridgeBetaStar[f.idx];
              const mcoNeg = mcoV !== null && mcoV < 0;
              const ridgeOk = ridgeV !== null && ridgeV >= 0;
              return (
                <tr key={f.idx} className="border-b border-slate-900/60">
                  <td className={`py-1.5 text-left font-semibold pr-2 ${f.color}`}>{f.label}</td>
                  <td className={`font-mono font-bold ${mcoNeg ? 'text-red-400' : 'text-slate-300'}`}>
                    {mcoV !== null ? fmtES(mcoV, 4) : '—'}
                  </td>
                  {(activeTab === 'ridge' || activeTab === 'validacion') && (
                    <td className={`font-mono font-bold ${ridgeOk ? 'text-emerald-400' : 'text-red-400'}`}>
                      {ridgeV !== null ? fmtES(ridgeV, 4) : '—'}
                    </td>
                  )}
                  <td>
                    {mcoV !== null && (
                      <span className={`text-[12px] px-1.5 py-0.5 rounded font-bold ${mcoNeg && ridgeOk && (activeTab === 'ridge' || activeTab === 'validacion') ? 'bg-emerald-500/15 text-emerald-400' :
                        mcoNeg ? 'bg-red-500/10 text-red-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                        {mcoNeg && ridgeOk && (activeTab === 'ridge' || activeTab === 'validacion') ? '✓ Corregido' : mcoNeg ? '✗ Errático' : 'Estable'}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[14px] text-slate-500 italic mt-2 leading-snug">
        {metricType === 'beta' && "* β Crudo: Variación en pesos ($) del arancel ante un cambio de 1 punto en el índice."}
        {metricType === 'elasticidad' && "* ε Elasticidad: Cambio porcentual esperado en el arancel ante un cambio del 1% en el índice."}
        {metricType === 'estandarizado' && (
          <span>
            * β* Estandarizado: Coeficientes adimensionales expresados en desviaciones estándar
            <br />
            <strong>Mide el peso estadístico relativo sin efectos de escala</strong>
          </span>
        )}
        <br />
        {activeTab === 'mco' ? (
          <span>
            <strong className="text-red-500 dark:text-red-400">✗ Rojo &rarr; ¡ coeficiente errático en MCO por presencia de multicolinealidad !</strong>
          </span>
        ) : (
          <span>
            <strong className="text-red-500 dark:text-red-400">✗ Rojo &rarr; ¡ coeficiente errático !</strong>
            <br />
            <strong className="text-emerald-600 dark:text-emerald-400">✓ Verde &rarr; corregido mediante regularización L2 Ridge</strong>
          </span>
        )}
      </p>
    </div>
  );

  const labelDesde = seriesData.find(d => d.periodo === periodoDesde)?.label || periodoDesde;
  const labelHasta = seriesData.find(d => d.periodo === periodoHasta)?.label || periodoHasta;

  if (!canShowMco && !canShowOrtogonalidad && !canShowRidge && !canShowValidacion) {
    return (
      <div className="p-8 text-center text-slate-400 border border-slate-800 bg-slate-900/20 rounded-2xl">
        No tienes permisos para visualizar el Análisis Econométrico Consolidado.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {results.isFallbackRange && (
        <div className="p-4 rounded-xl border border-yellow-800/40 bg-yellow-950/20 text-yellow-300 text-xs leading-relaxed flex items-start gap-2.5 shadow-md">
          <span className="text-sm mt-0.5 shrink-0">⚠️</span>
          <p>
            <strong>Rango temporal incoherente detectado en los parámetros globales</strong> (el período de partida es anterior al período de inicio de la serie). Para evitar un bloqueo de carga en la simulación, se está visualizando un rango temporal de fallback con los últimos 12 meses históricos ({evolucionBaseLabel} a {labelHasta}). Por favor, ajusta los períodos de análisis en el menú de Parámetros Globales.
          </p>
        </div>
      )}

      {/* ── HEADER ── */}
      {/* ------------------------------------------- INI: p3_p2_a1 --------------------------------------------- */}
      {hasPermission('p3_p2_a1') && (
        <div className="border-b pb-4 border-slate-800">
          <h3 className="text-3xl font-black text-white">Análisis Econométrico Consolidado</h3>
          <p className="text-sm text-slate-400 mt-1">
            Unificación de los modelos econométricos para estimación de elasticidades históricas, detección de colinealidad y regularización de estimadores.
          </p>
        </div>
      )}
      {/* ------------------------------------------- FIN: p3_p2_a1 --------------------------------------------- */}

      {/* ── LEVEL 1: TAB NAVIGATOR + BANNER (Full Width) ── */}
      <div className="space-y-4">
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-[20px] font-black">
          {canShowMco && (
            <button onClick={() => setActiveTabState('mco')}
              className={`flex-1 py-2 rounded-lg transition ${activeTab === 'mco' ? 'bg-teal-500/20 text-teal-400' : 'text-slate-400 hover:text-slate-200'}`}>
              Regresión MCO
            </button>
          )}
          {canShowOrtogonalidad && (
            <button onClick={() => setActiveTabState('ortogonalidad')}
              className={`flex-1 py-2 rounded-lg transition ${activeTab === 'ortogonalidad' ? 'bg-teal-500/20 text-teal-400' : 'text-slate-400 hover:text-slate-200'}`}>
              Pérdida Ortogonalidad
            </button>
          )}
          {canShowRidge && (
            <button onClick={() => setActiveTabState('ridge')}
              className={`flex-1 py-2 rounded-lg transition ${activeTab === 'ridge' ? 'bg-teal-500/20 text-teal-400' : 'text-slate-400 hover:text-slate-200'}`}>
              Penalización Ridge
            </button>
          )}
          {canShowValidacion && (
            <button onClick={() => setActiveTabState('validacion')}
              className={`flex-1 py-2 rounded-lg transition ${activeTab === 'validacion' ? 'bg-teal-500/20 text-teal-400' : 'text-slate-400 hover:text-slate-200'}`}>
              Validación
            </button>
          )}
        </div>

        <div className="p-3 rounded-xl border border-teal-500/20 bg-slate-900/60 text-[24px] text-slate-300 leading-relaxed shadow-sm">
          {/* ------------------------------------------- INI: p3_p2_a6 --------------------------------------------- */}
          {activeTab === 'mco' && hasPermission('p3_p2_a6') && (
            <p>
              Se busca determinar la sensibilidad histórica directa del arancel ante variaciones en <MathJaxFormula formula="IPC,\ USD\ y\  CCT" className="inline-block  text-[20px]" />. <br />
              Sin embargo, al existir colinealidad, se mueven en la misma dirección), los coeficientes MCO pueden resultar inestables o distorsionados.
            </p>
          )}
          {/* ------------------------------------------- FIN: p3_p2_a6 --------------------------------------------- */}

          {/* ------------------------------------------- INI: p3_p2_a7 --------------------------------------------- */}
          {activeTab === 'ortogonalidad' && hasPermission('p3_p2_a7') && (
            <p>
              Existe pérdida de independencia matemática entre los factores (<MathJaxFormula formula="IPC,\ USD\,\  CCT" className="inline-block  text-[20px]" />), ya que las variables covarían fuertemente. <br />
              El modelo MCO, no logra atribuir correctamente el peso individual a cada factor a los cambios en los valores.
            </p>
          )}
          {/* ------------------------------------------- FIN: p3_p2_a7 --------------------------------------------- */}

          {/* ------------------------------------------- INI: p3_p2_a8 --------------------------------------------- */}
          {activeTab === 'ridge' && hasPermission('p3_p2_a8') && (
            <p>
              Se aplica una penalización <MathJaxFormula formula={"\\lambda > 0"} /> en la diagonal de la matriz <MathJaxFormula formula={"X^T X"} />. <br />
              Esta regularización elimina la varianza infinita producida por la colinealidad y restaura la insesgadez económica.
            </p>
          )}
          {/* ------------------------------------------- FIN: p3_p2_a8 --------------------------------------------- */}

          {/* ------------------------------------------- INI: p3_p2_a9 --------------------------------------------- */}
          {activeTab === 'validacion' && hasPermission('p3_p2_a9') && (
            <p>
              Verifica la solidez del modelo <i>regularizado (evaluando el Número de Condición, el <MathJaxFormula formula={"R^2"} /> ajustado y la coherencia de signos)</i>, garantizando un modelo sano para proyecciones actuariales.
            </p>
          )}
          {/* ------------------------------------------- FIN: p3_p2_a9 --------------------------------------------- */}
        </div>
      </div>

      {/* ── LEVEL 2: VARIABLES ADMIN ── */}
      {/* ------------------------------------------- INI: p3_p2_a5 --------------------------------------------- */}
      {hasPermission('p3_p2_a5') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Parámetros del modelo</span>
            <button
              onClick={() => setMostrarVariables(!mostrarVariables)}
              className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-teal-600 text-white hover:bg-teal-500 transition-all shadow-sm"
            >
              {mostrarVariables ? 'Ocultar variables' : 'Administrar variables'}
            </button>
          </div>

          {/* Summary bar */}
          {!mostrarVariables && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
                <span className="font-bold text-slate-400">Modalidad:</span>
                <span className="text-white font-semibold">{modObjActivo.nombre}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <div>
                  <span className="text-slate-400">Desde:</span>{' '}
                  <span className="text-teal-400 font-bold font-mono">{labelDesde}</span>
                </div>
                <div>
                  <span className="text-slate-400">Hasta:</span>{' '}
                  <span className="text-teal-400 font-bold font-mono">{labelHasta}</span>
                </div>
                {(activeTab === 'ridge' || activeTab === 'validacion') && (
                  <>
                    <div className="border-l border-slate-800 h-3 hidden md:block" />
                    <div>
                      <span className="text-slate-400">λ Ridge:</span>{' '}
                      <span className="text-teal-400 font-bold font-mono">{lambdaRidge}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Expanded controls */}
          {mostrarVariables && (
            <div className="p-4 rounded-2xl border space-y-3 bg-teal-950/10 border-teal-500/30 shadow-md">
              <span className="text-sm font-bold uppercase tracking-wider text-teal-400 block">🎛️ Parámetros del Análisis Econométrico</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl border space-y-1.5 bg-slate-950 border-slate-800">
                  <label className="text-xs font-bold text-slate-400 block uppercase">Modalidad Dialítica</label>
                  <select value={modalidadDialitica} onChange={e => setModalidadDialitica(e.target.value)}
                    className="w-full text-xs font-bold p-1.5 rounded border focus:outline-none bg-slate-900 border-slate-700 text-white">
                    {opcionesModalidades.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                  </select>
                </div>
                <div className="p-3 rounded-xl border space-y-1.5 bg-slate-950 border-slate-800">
                  <label className="text-xs font-bold text-slate-400 block uppercase">Período Desde</label>
                  <select value={periodoDesde} onChange={e => handlePeriodoDesdeChange(e.target.value)}
                    className="w-full text-xs font-bold p-1.5 rounded border focus:outline-none bg-slate-900 border-slate-700 text-white cursor-pointer">
                    {seriesData.filter(d => d.periodo <= periodoHasta || d.periodo === periodoDesde).map(d => <option key={d.periodo} value={d.periodo}>{d.label}</option>)}
                  </select>
                </div>
                <div className="p-3 rounded-xl border space-y-1.5 bg-slate-950 border-slate-800">
                  <label className="text-xs font-bold text-slate-400 block uppercase">Período Hasta</label>
                  <select value={periodoHasta} onChange={e => handlePeriodoHastaChange(e.target.value)}
                    className="w-full text-xs font-bold p-1.5 rounded border focus:outline-none bg-slate-900 border-slate-700 text-white cursor-pointer">
                    {seriesData.map(d => <option key={d.periodo} value={d.periodo}>{d.label}</option>)}
                  </select>
                </div>
              </div>
              {(activeTab === 'ridge' || activeTab === 'validacion') && (
                <div className="p-3 rounded-xl border space-y-2 bg-slate-950 border-teal-700/40">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-teal-400">Penalización Ridge (λ):</span>
                    <span className="text-white font-mono">{lambdaRidge}</span>
                  </div>
                  <input type="range" min="0" max="0.0005" step="0.00001" value={lambdaRidge}
                    onChange={e => setLambdaRidge(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500" />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>λ=0 → MCO puro</span><span>λ=0.001 → máx. regularización</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {/* ------------------------------------------- FIN: p3_p2_a5 --------------------------------------------- */}

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ═══════ LEFT COLUMN ═══════ */}
        <div className="lg:col-span-5 space-y-4">
          {activeTab === 'mco' && (
            <>
              {/* ------------------------------------------- INI: p3_p2_a2 --------------------------------------------- */}
              {hasPermission('p3_p2_a2') && evolucionIndicesWidget}
              {/* ------------------------------------------- FIN: p3_p2_a2 --------------------------------------------- */}
              {/* ------------------------------------------- INI: p3_p2_a6 --------------------------------------------- */}
              {hasPermission('p3_p2_a6') && (
                <div className="p-4 rounded-2xl border bg-slate-900/20 border-slate-800 space-y-3">
                  <h4 className="text-[14px] font-bold text-white">Mínimos Cuadrados Ordinarios</h4>
                  <p className="text-[14px] text-slate-400 leading-relaxed">
                    Estimación de la sensibilidad arancelaria a factores macroeconómicos. Cuando no hay colinealidad,
                    el MCO es el estimador insesgado de mínima varianza (Gauss-Markov). Observá la tabla de
                    <strong className="text-teal-400"> Intercepto y Elasticidades</strong> para ver los coeficientes y detectar valores erráticos (rojo).
                  </p>
                  {results.mcoRes.error && (
                    <div className="p-3 bg-red-950/20 text-red-400 rounded-lg text-xs">{results.mcoRes.error}</div>
                  )}
                </div>
              )}
              {/* ------------------------------------------- FIN: p3_p2_a6 --------------------------------------------- */}
              {/* ------------------------------------------- INI: p3_p2_a4 --------------------------------------------- */}
              {hasPermission('p3_p2_a4') && tablaCoeficientesWidget}
              {/* ------------------------------------------- FIN: p3_p2_a4 --------------------------------------------- */}
            </>
          )}

          {activeTab === 'ortogonalidad' && (
            <>
              {/* ------------------------------------------- INI: p3_p2_a2 --------------------------------------------- */}
              {hasPermission('p3_p2_a2') && evolucionIndicesWidget}
              {/* ------------------------------------------- FIN: p3_p2_a2 --------------------------------------------- */}
              {/* ------------------------------------------- INI: p3_p2_a7_b1 --------------------------------------------- */}
              {hasPermission('p3_p2_a7_b1') && (
                <div className={`p-4 rounded-2xl border ${severity.color} text-[14px] space-y-1.5`}>
                  <span className="font-bold uppercase tracking-wider block text-[14px]">Estado del Diagnóstico: {severity.label}</span>
                  <p className="leading-relaxed opacity-90 text-[14px]">{severity.desc}</p>
                </div>
              )}
              {/* ------------------------------------------- FIN: p3_p2_a7_b1 --------------------------------------------- */}
              {/* ------------------------------------------- INI: p3_p2_a7_b2 --------------------------------------------- */}
              {hasPermission('p3_p2_a7_b2') && (
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'VIF IPC', val: results.vifs.ipc, color: 'text-yellow-400' },
                    { label: 'VIF USD', val: results.vifs.usd, color: 'text-cyan-400' },
                    { label: 'VIF CCT', val: results.vifs.cct, color: 'text-orange-400' }
                  ].map(v => (
                    <div key={v.label} className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">{v.label}</span>
                      <span className={`font-mono text-[14px] font-bold ${v.color}`}>
                        {v.val === Infinity ? '∞' : fmtES(v.val, 2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {/* ------------------------------------------- FIN: p3_p2_a7_b2 --------------------------------------------- */}
              {/* ------------------------------------------- INI: p3_p2_a7_b3 --------------------------------------------- */}
              {hasPermission('p3_p2_a7_b3') && (
                <div className="p-4 bg-slate-900/10 border border-slate-800 rounded-2xl space-y-2 text-[14px]">
                  <span className="font-bold text-white block text-[14px]">Correlaciones de Pearson entre variables:</span>
                  <div className="space-y-1 font-mono text-[14px]">
                    {[
                      { label: 'r (IPC vs USD)', val: results.corr.ipc_usd },
                      { label: 'r (IPC vs CCT)', val: results.corr.ipc_cct },
                      { label: 'r (USD vs CCT)', val: results.corr.usd_cct }
                    ].map(c => (
                      <div key={c.label} className="flex justify-between">
                        <span>{c.label}:</span>
                        <span className={`${Math.abs(c.val) > 0.85 ? 'text-red-400 font-bold' : Math.abs(c.val) > 0.6 ? 'text-yellow-400' : 'text-cyan-400'}`}>
                          {fmtES(c.val, 4)}
                          {Math.abs(c.val) > 0.85 && <span className="ml-1 text-[10px] text-red-500">⚠️ Alta colinealidad</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* ------------------------------------------- FIN: p3_p2_a7_b3 --------------------------------------------- */}
            </>
          )}

          {activeTab === 'ridge' && (
            <>
              {/* ------------------------------------------- INI: p3_p2_a8_b2 --------------------------------------------- */}
              {hasPermission('p3_p2_a8_b2') && trazaRidgeWidget}
              {/* ------------------------------------------- FIN: p3_p2_a8_b2 --------------------------------------------- */}
              {/* ------------------------------------------- INI: p3_p2_a8_b1 --------------------------------------------- */}
              {hasPermission('p3_p2_a8_b1') && (
                <div className="p-4 rounded-2xl border bg-slate-900/20 border-slate-800 space-y-3">
                  <h4 className="text-[14px] font-bold text-white">Regularización L2 (Ridge)</h4>
                  <p className="text-[14px] text-slate-400 leading-relaxed">
                    Al introducir <MathJaxFormula formula={"\\lambda > 0"} />, los coeficientes se contraen,
                    eliminando la varianza infinita de la colinealidad a cambio de un sesgo controlado.
                  </p>
                </div>
              )}
              {/* ------------------------------------------- FIN: p3_p2_a8_b1 --------------------------------------------- */}
              {/* ------------------------------------------- INI: p3_p2_a4 --------------------------------------------- */}
              {hasPermission('p3_p2_a4') && tablaCoeficientesWidget}
              {/* ------------------------------------------- FIN: p3_p2_a4 --------------------------------------------- */}
            </>
          )}

          {activeTab === 'validacion' && (
            <>
              {/* ------------------------------------------- INI: p3_p2_a2 --------------------------------------------- */}
              {hasPermission('p3_p2_a2') && evolucionIndicesWidget}
              {/* ------------------------------------------- FIN: p3_p2_a2 --------------------------------------------- */}
              {/* ------------------------------------------- INI: p3_p2_a4 --------------------------------------------- */}
              {hasPermission('p3_p2_a4') && tablaCoeficientesWidget}
              {/* ------------------------------------------- FIN: p3_p2_a4 --------------------------------------------- */}
            </>
          )}
        </div>

        {/* ═══════ RIGHT COLUMN ═══════ */}
        <div className="lg:col-span-7 space-y-4">
          {activeTab === 'mco' && (
            <>
              {/* ------------------------------------------- INI: p3_p2_a3 --------------------------------------------- */}
              {hasPermission('p3_p2_a3') && descomposicionSensibilidadWidget}
              {/* ------------------------------------------- FIN: p3_p2_a3 --------------------------------------------- */}
              {/* ------------------------------------------- INI: p3_p2_a6_b3 --------------------------------------------- */}
              {hasPermission('p3_p2_a6_b3') && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setMostrarDesarrolloMco(!mostrarDesarrolloMco)}
                    className="text-xs font-black uppercase text-teal-400 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl hover:bg-slate-800 transition shadow-sm"
                  >
                    {mostrarDesarrolloMco ? 'Ocultar Planteo y Auditoría MCO' : 'Ver Planteo y Auditoría MCO'}
                  </button>
                </div>
              )}
              {/* ------------------------------------------- FIN: p3_p2_a6_b3 --------------------------------------------- */}
            </>
          )}

          {activeTab === 'ortogonalidad' && (
            <>
              {/* ------------------------------------------- INI: p3_p2_a3 --------------------------------------------- */}
              {hasPermission('p3_p2_a3') && descomposicionSensibilidadWidget}
              {/* ------------------------------------------- FIN: p3_p2_a3 --------------------------------------------- */}
              {/* ------------------------------------------- INI: p3_p2_a7_b4 --------------------------------------------- */}
              {hasPermission('p3_p2_a7_b4') && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setMostrarDesarrolloOrt(!mostrarDesarrolloOrt)}
                    className="text-xs font-black uppercase text-teal-400 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl hover:bg-slate-800 transition shadow-sm"
                  >
                    {mostrarDesarrolloOrt ? 'Ocultar Planteo de Ortogonalidad' : 'Ver Planteo de Ortogonalidad'}
                  </button>
                </div>
              )}
              {/* ------------------------------------------- FIN: p3_p2_a7_b4 --------------------------------------------- */}
            </>
          )}

          {activeTab === 'ridge' && (
            <>
              {/* ------------------------------------------- INI: p3_p2_a3 --------------------------------------------- */}
              {hasPermission('p3_p2_a3') && descomposicionSensibilidadWidget}
              {/* ------------------------------------------- FIN: p3_p2_a3 --------------------------------------------- */}
              {/* ------------------------------------------- INI: p3_p2_a8_b4 --------------------------------------------- */}
              {hasPermission('p3_p2_a8_b4') && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setMostrarDesarrolloRidge(!mostrarDesarrolloRidge)}
                    className="text-xs font-black uppercase text-teal-400 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl hover:bg-slate-800 transition shadow-sm"
                  >
                    {mostrarDesarrolloRidge ? 'Ocultar Planteo y Auditoría Ridge' : 'Ver Planteo y Auditoría Ridge'}
                  </button>
                </div>
              )}
              {/* ------------------------------------------- FIN: p3_p2_a8_b4 --------------------------------------------- */}
            </>
          )}

          {activeTab === 'validacion' && (
            <>
              {/* ------------------------------------------- INI: p3_p2_a3 --------------------------------------------- */}
              {hasPermission('p3_p2_a3') && descomposicionSensibilidadWidget}
              {/* ------------------------------------------- FIN: p3_p2_a3 --------------------------------------------- */}
              {/* ------------------------------------------- INI: p3_p2_a9_b1 --------------------------------------------- */}
              {hasPermission('p3_p2_a9_b1') && (
                <div className="p-4 rounded-2xl border bg-slate-900/20 border-slate-800 text-[14px] leading-relaxed space-y-3">
                  <h4 className="text-sm font-bold text-white">Validación Actuarial del Ajuste</h4>
                  <p className="text-slate-400">
                    La paridad estimada a través de la penalización Ridge logra estabilizar el arancel autónomo base
                    y los ponderadores macroeconómicos. La tabla de Intercepto y Elasticidades muestra el resultado.
                  </p>
                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                    <span className="font-bold text-teal-400 block font-sans">Indicadores de Calidad del Modelo (click para detalles):</span>

                    <div className="grid grid-cols-1 gap-2.5 text-[18px]">
                      {/* Botón Número de Condición */}
                      <button
                        onClick={() => setExpandedIndicator(expandedIndicator === 'condicion' ? null : 'condicion')}
                        className={`w-full text-left p-3 rounded-xl border transition-all duration-300 cursor-pointer ${expandedIndicator === 'condicion'
                          ? 'bg-indigo-950/40 border-indigo-500/80 text-white'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-indigo-500/30'
                          }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-indigo-400">κ - Número de Condición:</span>
                          <span className="font-mono text-[14px] bg-indigo-950 px-2 py-0.5 rounded text-indigo-300 border border-indigo-900/60">
                            {results.conditionNumber === Infinity ? 'Infinito' : fmtES(results.conditionNumber, 1)}
                          </span>
                        </div>
                        {expandedIndicator === 'condicion' && (
                          <p className="text-[16px] text-slate-400 mt-2 leading-relaxed font-sans normal-case">
                            Mide qué tan "enredados" están los datos (colinealidad). Si es muy alto, el modelo se "marea" porque la inflación, el dólar y los salarios se mueven todos juntos en la misma dirección, impidiendo saber qué pesa más. Nuestro ajuste matemático (Ridge) desenreda este problema para dar resultados estables y confiables.
                          </p>
                        )}
                      </button>

                      {/* Botón R2 Ajustado */}
                      <button
                        onClick={() => setExpandedIndicator(expandedIndicator === 'r2' ? null : 'r2')}
                        className={`w-full text-left p-3 rounded-xl border transition-all duration-300 cursor-pointer ${expandedIndicator === 'r2'
                          ? 'bg-teal-950/40 border-teal-500/80 text-white'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-teal-500/30'
                          }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-teal-400">R² Ajustado Histórico:</span>
                          <span className="font-mono text-[14px] bg-teal-950 px-2 py-0.5 rounded text-teal-300 border border-teal-900/60">
                            {fmtES(results.r2AdjRidge, 4)}
                          </span>
                        </div>
                        {expandedIndicator === 'r2' && (
                          <p className="text-[16px] text-slate-400 mt-2 leading-relaxed font-sans normal-case">
                            Es como la "nota de un examen" del 0 al 1 (o de 0% a 100%) que nos dice qué tan bien nuestro modelo explica la realidad. Un valor de {fmtES(results.r2AdjRidge, 4)} significa que la inflación, el dólar y los salarios logran explicar el {fmtES(results.r2AdjRidge * 100, 2)}% de por qué cambió el costo del arancel.<br />Operando con Lambda, ajustamos la pérdida de independencia matemática de los factores (IPC, USD, CCT), hasta la medida en que no se vea afectada severamente la capacidad explicativa de nuestro modelo.
                          </p>
                        )}
                      </button>

                      {/* Botón Insesgadez Económica */}
                      <button
                        onClick={() => setExpandedIndicator(expandedIndicator === 'insesgadez' ? null : 'insesgadez')}
                        className={`w-full text-left p-3 rounded-xl border transition-all duration-300 cursor-pointer ${expandedIndicator === 'insesgadez'
                          ? 'bg-fuchsia-950/40 border-fuchsia-500/80 text-white'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-fuchsia-500/30'
                          }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-fuchsia-400">Insesgadez Económica:</span>
                          <span className="font-mono text-[14px] bg-fuchsia-950 px-2 py-0.5 rounded text-fuchsia-300 border border-fuchsia-900/60">
                            {results.insesgadezRidge ? 'Signos Coherentes (+)' : 'Signos Erráticos (-)'}
                          </span>
                        </div>
                        {expandedIndicator === 'insesgadez' && (
                          <p className="text-[16px] text-slate-400 mt-2 leading-relaxed font-sans normal-case">
                            Verifica que el modelo tenga sentido en el mundo real. Si la inflación sube, el costo del arancel tiene que subir (eso es un signo "positivo"). Si la matemática diera un signo negativo, el modelo estaría roto. Esta prueba garantiza que todos los costos empujen el arancel hacia arriba, como dicta la lógica económica.
                          </p>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* ------------------------------------------- FIN: p3_p2_a9_b1 --------------------------------------------- */}
              {/* ------------------------------------------- INI: p3_p2_a9_b2 --------------------------------------------- */}
              {hasPermission('p3_p2_a9_b2') && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setMostrarDesarrolloVal(!mostrarDesarrolloVal)}
                    className="text-xs font-black uppercase text-teal-400 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl hover:bg-slate-800 transition shadow-sm"
                  >
                    {mostrarDesarrolloVal ? 'Ocultar Planteo de Indicadores' : 'Ver Planteo de Indicadores'}
                  </button>
                </div>
              )}
              {/* ------------------------------------------- FIN: p3_p2_a9_b2 --------------------------------------------- */}
            </>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
           SECCIÓN DE ANCHO COMPLETO: Planteos y Desarrollos
           Debajo de las dos columnas, usando el ancho total
      ══════════════════════════════════════════════════════ */}

      {/* ── PLANTEO MCO + DESARROLLO MATRICIAL MCO ── */}
      {/* ------------------------------------------- INI: p3_p2_a6_b3 --------------------------------------------- */}
      {activeTab === 'mco' && mostrarDesarrolloMco && hasPermission('p3_p2_a6_b3') && results.mcoRes && (
        <div className="space-y-4">
          {/* Planteo Teórico */}
          <div className="p-5 rounded-2xl border bg-slate-900/30 border-slate-800 space-y-3">
            <span className="text-[14px] font-bold uppercase tracking-wider text-teal-400 block">
              📐 Planteo Matemático de la Regresión por MCO
            </span>
            <p className="text-[14px] text-slate-400 leading-relaxed">
              La estimación por Mínimos Cuadrados Ordinarios busca el vector <MathJaxFormula formula={"\\hat{\\beta}_{\\text{MCO}}"} className="inline-block text-teal-300 font-serif px-1 font-semibold text-[14px]" /> que
              minimiza la suma de los residuos al cuadrado <MathJaxFormula formula={"\\sum (Y_t - \\hat{Y}_t)^2"} className="inline-block text-teal-300 font-serif px-1 font-semibold text-[14px]" />:
            </p>
            <MathJaxFormula formula={"\\hat{\\beta}_{\\text{MCO}} = (X^T X)^{-1} X^T Y"} display={true} className="block text-center my-3 text-teal-300 font-serif text-[14px] font-semibold" />
            <p className="text-[14px] text-slate-500 italic">
              Donde <MathJaxFormula formula={"X"} className="inline-block text-teal-300 font-serif px-1 font-semibold text-[14px]" /> es la matriz de diseño de dimensión <MathJaxFormula formula={`${results.X.length} \\times 4`} className="inline-block text-teal-300 font-serif px-1 font-semibold text-[14px]" /> (intercepto, IPC, USD, CCT)
              y <MathJaxFormula formula={"Y"} className="inline-block text-teal-300 font-serif px-1 font-semibold text-[14px]" /> es el vector del arancel real.
            </p>
          </div>

          {/* Desarrollo Matricial MCO */}
          <div className="p-5 rounded-2xl border bg-slate-950 border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[14px] font-bold uppercase tracking-wider text-teal-400">
                🧮 Desarrollo de Cálculos Matriciales MCO
              </span>
              <button
                onClick={() => setMostrarAuditoriaMco(!mostrarAuditoriaMco)}
                className="text-[14px] font-black uppercase text-teal-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg hover:bg-slate-800 transition"
              >
                {mostrarAuditoriaMco ? 'Ocultar Auditoría' : 'Ver Auditoría Paso a Paso'}
              </button>
            </div>
            {mostrarAuditoriaMco && (() => {
              const colNames = ['Intercepto (1)', 'IPC', 'USD', 'CCT'];
              const colSymbols = ['\\mathbf{1}', 'x_{\\text{IPC}}', 'x_{\\text{USD}}', 'x_{\\text{CCT}}'];
              const XtX = results.mcoRes.XtX;
              const X = results.X;
              const datosFiltrados = results.datosFiltrados;

              const renderCellDetailFW = (r, c) => {
                if (!X || !XtX) return null;
                const colALabel = colNames[r];
                const colBLabel = colNames[c];
                const symA = colSymbols[r];
                const symB = colSymbols[c];
                const N = X.length;
                const rowData = X.map((fila, t) => ({
                  periodo: datosFiltrados[t]?.label || `t=${t + 1}`,
                  valA: fila[r], valB: fila[c], producto: fila[r] * fila[c],
                }));
                const suma = rowData.reduce((s, row) => s + row.producto, 0);
                const formulaLatex = [
                  `C_{${r + 1},${c + 1}} =`,
                  `\\begin{bmatrix} ${symA}^{(1)} & ${symA}^{(2)} & \\cdots & ${symA}^{(${N})} \\end{bmatrix}`,
                  `\\cdot`,
                  `\\begin{bmatrix} ${symB}^{(1)} \\\\ ${symB}^{(2)} \\\\ \\vdots \\\\ ${symB}^{(${N})} \\end{bmatrix}`,
                  `= \\sum_{t=1}^{${N}} ${symA}^{(t)} \\cdot ${symB}^{(t)}`
                ].join(' ');
                return (
                  <div className="mt-3 space-y-3">
                    <p className="text-[14px] text-slate-400 font-sans leading-relaxed">
                      <br /><strong><u>Cálculo Matricial</u></strong><br />
                      El elemento <strong className="text-teal-300">{`C[${r + 1},${c + 1}]`}</strong> es el producto punto
                      entre la columna <strong className="text-yellow-300">"{colALabel}"</strong> y
                      la columna <strong className="text-cyan-300">"{colBLabel}"</strong> de X. En notación matricial:
                    </p>
                    <div className="overflow-x-auto py-1">
                      <MathJaxFormula formula={formulaLatex} display={true} className="block text-center my-3 text-teal-300 font-serif text-[14px] font-semibold" />
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-slate-700">
                      <table className="w-full text-[14px] font-mono border-collapse">
                        <thead>
                          <tr className="bg-slate-800 text-slate-400 uppercase text-[12px] tracking-wider">
                            <th className="py-1.5 px-2 text-left border-b border-slate-700">Período</th>
                            <th className="py-1.5 px-2 text-right border-b border-slate-700 text-yellow-300">{colALabel}</th>
                            <th className="py-1.5 px-2 text-center border-b border-slate-700 text-slate-500">×</th>
                            <th className="py-1.5 px-2 text-right border-b border-slate-700 text-cyan-300">{colBLabel}</th>
                            <th className="py-1.5 px-2 text-right border-b border-slate-700 text-emerald-300">=&nbsp;Producto</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rowData.map((row, i) => (
                            <tr key={i} className={`border-b border-slate-900 ${i % 2 === 0 ? 'bg-slate-950' : 'bg-slate-900/40'}`}>
                              <td className="py-1 px-2 text-slate-400">{row.periodo}</td>
                              <td className="py-1 px-2 text-right text-yellow-200">{fmtES(row.valA, 4)}</td>
                              <td className="py-1 px-2 text-center text-slate-600">×</td>
                              <td className="py-1 px-2 text-right text-cyan-200">{fmtES(row.valB, 4)}</td>
                              <td className="py-1 px-2 text-right text-emerald-300 font-semibold">{fmtES(row.producto, 4)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-teal-950/40 border-t-2 border-teal-700">
                            <td colSpan={4} className="py-1.5 px-2 text-right font-bold text-teal-300 text-[14px]">Σ Suma total =</td>
                            <td className="py-1.5 px-2 text-right font-black text-teal-200 text-[14px]">{fmtES(suma, 4)}</td>
                          </tr>
                          <tr className="bg-teal-950/20">
                            <td colSpan={5} className="py-1 px-2 text-[12px] text-teal-400 italic">
                              ✓ Coincide con XᵀX[{r + 1},{c + 1}] = <strong>{fmtES(XtX[r][c], 4)}</strong>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                );
              };

              return (
                <div className="space-y-4 text-[14px] font-mono text-slate-300">
                  {/* ------------------------------------------- INI: p3_p2_a6_b1 --------------------------------------------- */}
                  {hasPermission('p3_p2_a6_b1') && (
                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                      <span className="text-teal-300 font-bold block font-sans text-[14px]">Paso 1: Dimensión de Matrices de Entrada</span>
                      <p className="text-[14px] text-slate-400 font-sans">
                        Matriz de Diseño <MathJaxFormula formula={"X"} className="inline-block text-teal-300 font-serif px-1 font-semibold text-[14px]" />: <strong>{results.X.length} × 4</strong> | Vector <MathJaxFormula formula={"Y"} className="inline-block text-teal-300 font-serif px-1 font-semibold text-[14px]" />: <strong>{results.Y.length} × 1</strong>
                      </p>
                      <p className="text-[14px] text-slate-500 font-sans leading-relaxed">
                        Columna 1 = Intercepto (todos 1,0000),&nbsp;columna 2 = IPC,&nbsp;columna 3 = USD,&nbsp;columna 4 = CCT.
                      </p>
                    </div>
                  )}
                  {/* ------------------------------------------- FIN: p3_p2_a6_b1 --------------------------------------------- */}

                  {/* ------------------------------------------- INI: p3_p2_a6_b2 --------------------------------------------- */}
                  {hasPermission('p3_p2_a6_b2') && XtX && (
                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
                      <div className="font-sans space-y-1">
                        <span className="text-teal-300 font-bold block text-[14px]">Paso 1.1: Desglose del Producto Matricial XᵀX — ¿Cómo se calculó cada número?</span>
                        <p className="text-[14px] text-slate-400 leading-relaxed">
                          Cada celda es el producto punto entre dos columnas de X
                          ({results.X.length} multiplicaciones, una por período).
                          <strong className="text-yellow-300"> Tocá cualquier celda</strong> para ver el cálculo mes a mes.
                        </p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="text-[14px] font-mono border-collapse w-full">
                          <thead>
                            <tr>
                              <th className="p-1.5 text-slate-600 font-sans text-left text-[12px] uppercase">XᵀX →</th>
                              {colNames.map((name, c) => (
                                <th key={c} className="p-1.5 text-center text-cyan-400 font-sans text-[12px] uppercase tracking-wide whitespace-nowrap">{name}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {XtX.map((row, r) => (
                              <tr key={r}>
                                <td className="p-1.5 text-yellow-400 font-sans text-[12px] uppercase tracking-wide whitespace-nowrap pr-2">{colNames[r]}</td>
                                {row.map((val, c) => {
                                  const isSel = selectedXtXCell && selectedXtXCell.row === r && selectedXtXCell.col === c;
                                  return (
                                    <td key={c}
                                      onClick={() => setSelectedXtXCell(isSel ? null : { row: r, col: c })}
                                      className={`p-1.5 text-right cursor-pointer rounded transition font-mono text-[14px] border ${isSel
                                        ? 'bg-teal-500/25 border-teal-500 text-teal-200 font-black'
                                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600'
                                        }`}
                                    >
                                      {val >= 1e6 ? val.toExponential(2) : fmtES(val, 2)}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {/* ------------------------------------------- INI: p3_p2_a6_b3 --------------------------------------------- */}
                      {selectedXtXCell && hasPermission('p3_p2_a6_b3') && renderCellDetailFW(selectedXtXCell.row, selectedXtXCell.col)}
                      {/* ------------------------------------------- FIN: p3_p2_a6_b3 --------------------------------------------- */}
                    </div>
                  )}
                  {/* ------------------------------------------- FIN: p3_p2_a6_b2 --------------------------------------------- */}

                  {/* ------------------------------------------- INI: p3_p2_a6_b4 --------------------------------------------- */}
                  {hasPermission('p3_p2_a6_b4') && (
                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2 overflow-x-auto">
                      <span className="text-teal-300 font-bold block font-sans text-[14px]">Paso 2: Matriz Intersección (XᵀX — 4×4)</span>
                      <p className="text-[14px] text-slate-400 font-sans">Resultado final de todas las sumas de productos:</p>
                      {XtX && <MathJaxFormula formula={`X^T X = ${matrixToLatex(XtX, 2)}`} display={true} className="block text-center my-3 text-teal-300 font-serif text-[14px] font-semibold" />}
                    </div>
                  )}
                  {/* ------------------------------------------- FIN: p3_p2_a6_b4 --------------------------------------------- */}

                  {/* ------------------------------------------- INI: p3_p2_a6_b5 --------------------------------------------- */}
                  {hasPermission('p3_p2_a6_b5') && (
                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2 overflow-x-auto">
                      <span className="text-teal-300 font-bold block font-sans text-[14px]">Paso 3: Matriz Inversa ((XᵀX)⁻¹) y Vector XᵀY</span>
                      {results.mcoRes.XtX_inv ? (
                        <>
                          <MathJaxFormula formula={`(X^T X)^{-1} = ${matrixToLatex(results.mcoRes.XtX_inv, 6)}`} display={true} className="block text-center my-3 text-teal-300 font-serif text-[14px] font-semibold" />
                          <MathJaxFormula formula={`X^T Y = ${matrixToLatex(results.mcoRes.XtY.map(v => [v]), 2)}`} display={true} className="block text-center my-3 text-teal-300 font-serif text-[14px] font-semibold" />
                        </>
                      ) : (
                        <p className="text-red-400 font-sans text-[14px]">🚨 Inversión no computable — det(XᵀX) ≈ 0.</p>
                      )}
                    </div>
                  )}
                  {/* ------------------------------------------- FIN: p3_p2_a6_b5 --------------------------------------------- */}

                  {/* ------------------------------------------- INI: p3_p2_a6_b6 --------------------------------------------- */}
                  {hasPermission('p3_p2_a6_b6') && (
                    <div className="p-3 bg-slate-900/60 rounded-xl border border-teal-800/40 text-teal-300 font-bold space-y-2 overflow-x-auto">
                      <span className="font-sans text-[14px]">Paso 4: Vector Estimado Final β̂_MCO</span>
                      {results.mcoBeta && (
                        <MathJaxFormula formula={`\\hat{\\beta}_{\\text{MCO}} = ${matrixToLatex(results.mcoBeta.map(v => [v]), 4)}`} display={true} className="block text-center my-3 text-teal-300 font-serif text-[14px] font-semibold" />
                      )}
                    </div>
                  )}
                  {/* ------------------------------------------- FIN: p3_p2_a6_b6 --------------------------------------------- */}
                </div>
              );
            })()}
          </div>
        </div>
      )}
      {/* ------------------------------------------- FIN: p3_p2_a6_b3 --------------------------------------------- */}

      {/* ── PLANTEOS MATEMÁTICOS ORTOGONALIDAD ── */}
      {/* ------------------------------------------- INI: p3_p2_a7_b4 --------------------------------------------- */}
      {activeTab === 'ortogonalidad' && mostrarDesarrolloOrt && hasPermission('p3_p2_a7_b4') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl border bg-slate-900/30 border-slate-800 space-y-3">
            <span className="text-[14px] font-bold uppercase tracking-wider text-teal-400 block">
              📐 Planteo Matemático del VIF
            </span>
            <p className="text-[14px] text-slate-400 leading-relaxed">
              El VIF mide cuánto aumenta la varianza de un coeficiente estimado por la correlación lineal con los demás regresores:
            </p>
            <MathJaxFormula formula={"\\text{VIF}_j = \\frac{1}{1 - R_j^2}"} display={true} className="block text-center my-3 text-teal-300 font-serif text-[14px] font-semibold" />
            <p className="text-[14px] text-slate-500 italic">
              Si <MathJaxFormula formula={"\\text{VIF}_j > 10"} className="inline-block text-teal-300 font-serif px-1 font-semibold text-[14px]" />, la multicolinealidad se considera severa.
            </p>
          </div>
          <div className="p-5 rounded-2xl border bg-slate-900/30 border-slate-800 space-y-3">
            <span className="text-[14px] font-bold uppercase tracking-wider text-teal-400 block">
              📐 Planteo Matemático — Correlación de Pearson
            </span>
            <p className="text-[14px] text-slate-400 leading-relaxed">
              Cuantifica el grado de covariación lineal entre cada par de índices macroeconómicos:
            </p>
            <MathJaxFormula formula={"\\rho_{X,Y} = \\frac{\\sum_{t=1}^N (X_t - \\bar{X})(Y_t - \\bar{Y})}{\\sqrt{\\sum_{t=1}^N (X_t - \\bar{X})^2 \\cdot \\sum_{t=1}^N (Y_t - \\bar{Y})^2}}"} display={true} className="block text-center my-3 text-teal-300 font-serif text-[14px] font-semibold" />
          </div>
        </div>
      )}
      {/* ------------------------------------------- FIN: p3_p2_a7_b4 --------------------------------------------- */}

      {/* ── PLANTEO Y DESARROLLO MATRICIAL RIDGE ── */}
      {/* ------------------------------------------- INI: p3_p2_a8_b4 --------------------------------------------- */}
      {activeTab === 'ridge' && mostrarDesarrolloRidge && hasPermission('p3_p2_a8_b4') && results.ridgeRes && (() => {
        const colNames = ['Intercepto (1)', 'IPC', 'USD', 'CCT'];
        const XtX = results.mcoRes.XtX;
        const M = results.ridgeRes.M;
        const lambda = lambdaRidge;

        const xtxLatex = matrixToLatex(XtX, 2);
        const lambdaILatex = `\\begin{bmatrix} ${lambda.toFixed(5)} & 0 & 0 & 0 \\\\ 0 & ${lambda.toFixed(5)} & 0 & 0 \\\\ 0 & 0 & ${lambda.toFixed(5)} & 0 \\\\ 0 & 0 & 0 & ${lambda.toFixed(5)} \\end{bmatrix}`;
        const stabilizedLatex = matrixToLatex(M, 2);

        const renderRidgeCellDetail = (r, c) => {
          const valOriginal = XtX[r][c];
          const valStabilized = M[r][c];
          const isDiagonal = r === c;

          return (
            <div className="mt-3 p-4 rounded-xl border border-teal-850/40 bg-teal-950/20 space-y-2">
              <p className="text-[14px] text-slate-300 font-sans leading-relaxed">
                Elemento <strong className="text-teal-300">[{r + 1}, {c + 1}]</strong> ({colNames[r]} vs {colNames[c]}):
              </p>
              {isDiagonal ? (
                <div className="space-y-1.5 text-[14px]">
                  <p className="text-slate-400">
                    Es un elemento de la <strong>diagonal principal</strong> (varianza propia). Se le adiciona la penalización <MathJaxFormula formula={"\\lambda"} className="inline-block text-teal-300 font-serif px-1 font-semibold text-[14px]" /> para estabilizar la varianza:
                  </p>
                  <MathJaxFormula
                    formula={`M_{${r + 1},${c + 1}} = (X^T X)_{${r + 1},${c + 1}} + \\lambda`}
                    display={true}
                    className="block text-center my-2 text-teal-300 font-serif text-[14px] font-semibold"
                  />
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[14px] text-center flex items-center justify-center gap-2">
                    <span className="text-yellow-400">{fmtES(valOriginal, 4)}</span>
                    <span className="text-slate-500 font-bold">+</span>
                    <span className="text-cyan-400">{fmtES(lambda, 6)}</span>
                    <span className="text-slate-500 font-bold">=</span>
                    <span className="text-emerald-400 font-black">{fmtES(valStabilized, 4)}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 text-[14px]">
                  <p className="text-slate-400">
                    Es un elemento <strong>fuera de la diagonal principal</strong> (covarianza cruzada). No recibe penalización L2 (se le suma 0):
                  </p>
                  <MathJaxFormula
                    formula={`M_{${r + 1},${c + 1}} = (X^T X)_{${r + 1},${c + 1}} + 0`}
                    display={true}
                    className="block text-center my-2 text-teal-300 font-serif text-[14px] font-semibold"
                  />
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[14px] text-center flex items-center justify-center gap-2">
                    <span className="text-yellow-400">{fmtES(valOriginal, 4)}</span>
                    <span className="text-slate-500 font-bold">+</span>
                    <span className="text-cyan-400">0</span>
                    <span className="text-slate-500 font-bold">=</span>
                    <span className="text-emerald-400 font-black">{fmtES(valStabilized, 4)}</span>
                  </div>
                </div>
              )}
            </div>
          );
        };

        return (
          <div className="space-y-4">
            {/* ------------------------------------------- INI: p3_p2_a8_b3 --------------------------------------------- */}
            {hasPermission('p3_p2_a8_b3') && (
              <div className="p-5 rounded-2xl border bg-slate-900/30 border-slate-800 space-y-3">
                <span className="text-[14px] font-bold uppercase tracking-wider text-teal-400 block">
                  📐 Planteo Matemático de la Penalización Ridge
                </span>
                <p className="text-[14px] text-slate-400 leading-relaxed">
                  Se adiciona la matriz de penalización diagonal <MathJaxFormula formula={"\\lambda I"} className="inline-block text-teal-300 font-serif px-1 font-semibold text-[14px]" /> a la matriz de covarianza <MathJaxFormula formula={"X^T X"} className="inline-block text-teal-300 font-serif px-1 font-semibold text-[14px]" /> para eliminar la singularidad matemática:
                </p>
                <MathJaxFormula formula={"\\hat{\\beta}_{\\text{Ridge}} = (X^T X + \\lambda I)^{-1} X^T Y"} display={true} className="block text-center my-3 text-teal-300 font-serif text-[14px] font-semibold" />
                <p className="text-[14px] text-slate-500 italic">
                  Al regularizar la matriz original obtenemos <MathJaxFormula formula={"M = X^T X + \\lambda I"} className="inline-block text-teal-300 font-serif px-1 font-semibold text-[14px]" />, cuya inversión es estable y tiene determinante estrictamente distinto de cero.
                </p>
              </div>
            )}
            {/* ------------------------------------------- FIN: p3_p2_a8_b3 --------------------------------------------- */}

            <div className="p-5 rounded-2xl border bg-slate-950 border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[14px] font-bold uppercase tracking-wider text-teal-400">
                  🧮 Desarrollo de Cálculos Matriciales — Penalización Ridge
                </span>
                <button
                  onClick={() => setMostrarAuditoriaRidge(!mostrarAuditoriaRidge)}
                  className="text-[14px] font-black uppercase text-teal-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg hover:bg-slate-800 transition"
                >
                  {mostrarAuditoriaRidge ? 'Ocultar Auditoría' : 'Ver Auditoría Paso a Paso'}
                </button>
              </div>

              {mostrarAuditoriaRidge && (
                <div className="space-y-4 text-[14px] font-mono text-slate-300">
                  {/* Paso 1 */}
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
                    <div className="font-sans space-y-1">
                      <span className="text-teal-300 font-bold block text-[14px]">Paso 1: Suma de la Matriz de Penalización (XᵀX + λI)</span>
                      <p className="text-[14px] text-slate-400 leading-relaxed">
                        Sumamos a la matriz original <MathJaxFormula formula={"X^T X"} className="inline-block text-teal-300 font-serif px-1 font-semibold text-[14px]" /> la penalización diagonal escalada por el hiperparámetro activo <strong className="text-teal-300 font-sans">λ = {fmtES(lambda, 5)}</strong>.
                        En formato matricial:
                      </p>
                    </div>

                    <div className="overflow-x-auto py-1">
                      <MathJaxFormula formula={`M = X^T X + \\lambda I`} display={true} className="block text-center my-2 text-teal-300 font-serif text-[14px] font-semibold" />
                      <div className="flex flex-col lg:flex-row items-center justify-center gap-2 font-mono text-[14px] my-4 overflow-x-auto py-2">
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-slate-500 font-sans uppercase mb-1">XᵀX original (MCO)</span>
                          <MathJaxFormula formula={xtxLatex} display={true} className="text-teal-300 font-serif text-[14px]" />
                        </div>
                        <span className="text-xl font-bold text-slate-500 mx-2">+</span>
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-slate-500 font-sans uppercase mb-1">λI (Penalización)</span>
                          <MathJaxFormula formula={lambdaILatex} display={true} className="text-teal-300 font-serif text-[14px]" />
                        </div>
                        <span className="text-xl font-bold text-slate-500 mx-2">=</span>
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-slate-500 font-sans uppercase mb-1">M Estabilizada</span>
                          <MathJaxFormula formula={stabilizedLatex} display={true} className="text-teal-300 font-serif text-[14px]" />
                        </div>
                      </div>
                    </div>

                    {/* Grilla interactiva para entender la suma */}
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                      <span className="text-teal-300 font-bold block font-sans text-[14px]">Visor Interactivo de Estabilización (M)</span>
                      <p className="text-[14px] text-slate-400 font-sans leading-relaxed">
                        <strong className="text-yellow-300 font-sans">Tocá cualquier celda</strong> de la grilla estabilizada para ver el desglose sumando el término de regularización:
                      </p>

                      <div className="overflow-x-auto">
                        <table className="text-[14px] font-mono border-collapse w-full">
                          <thead>
                            <tr>
                              <th className="p-1.5 text-slate-600 font-sans text-left text-[12px] uppercase">M →</th>
                              {colNames.map((name, c) => (
                                <th key={c} className="p-1.5 text-center text-cyan-400 font-sans text-[12px] uppercase tracking-wide whitespace-nowrap">{name}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {M.map((row, r) => (
                              <tr key={r}>
                                <td className="p-1.5 text-yellow-400 font-sans text-[12px] uppercase tracking-wide whitespace-nowrap pr-2">{colNames[r]}</td>
                                {row.map((val, c) => {
                                  const isSel = selectedRidgeCell && selectedRidgeCell.row === r && selectedRidgeCell.col === c;
                                  return (
                                    <td key={c}
                                      onClick={() => setSelectedRidgeCell(isSel ? null : { row: r, col: c })}
                                      className={`p-1.5 text-right cursor-pointer rounded transition font-mono text-[14px] border ${isSel
                                        ? 'bg-teal-500/25 border-teal-500 text-teal-200 font-black'
                                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600'
                                        }`}
                                    >
                                      {val >= 1e6 ? val.toExponential(2) : fmtES(val, 2)}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {selectedRidgeCell && renderRidgeCellDetail(selectedRidgeCell.row, selectedRidgeCell.col)}
                    </div>
                  </div>

                  {/* Paso 2 */}
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2 overflow-x-auto">
                    <span className="text-teal-300 font-bold block font-sans text-[14px]">Paso 2: Inversa Regularizada (M⁻¹) y Vector XᵀY</span>
                    {results.ridgeRes.M_inv ? (
                      <>
                        <MathJaxFormula formula={`M^{-1} = (X^T X + \\lambda I)^{-1} = ${matrixToLatex(results.ridgeRes.M_inv, 6)}`} display={true} className="block text-center my-3 text-teal-300 font-serif text-[14px] font-semibold" />
                        <MathJaxFormula formula={`X^T Y = ${matrixToLatex(results.ridgeRes.XtY.map(v => [v]), 2)}`} display={true} className="block text-center my-3 text-teal-300 font-serif text-[14px] font-semibold" />
                      </>
                    ) : (
                      <p className="text-red-400 font-sans text-[14px]">🚨 Inversión no computable.</p>
                    )}
                  </div>

                  {/* Paso 3 */}
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-emerald-800/40 text-emerald-300 font-bold space-y-2 overflow-x-auto">
                    <span className="font-sans text-[14px]">Paso 3: Vector Final β̂_Ridge = M⁻¹ · XᵀY</span>
                    {results.ridgeBeta && (
                      <MathJaxFormula formula={`\\hat{\\beta}_{\\text{Ridge}} = ${matrixToLatex(results.ridgeBeta.map(v => [v]), 4)}`} display={true} className="block text-center my-3 text-teal-300 font-serif text-[14px] font-semibold" />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
      {/* ------------------------------------------- FIN: p3_p2_a8_b4 --------------------------------------------- */}

      {/* ── PLANTEO MATEMÁTICO VALIDACIÓN ── */}
      {/* ------------------------------------------- INI: p3_p2_a9_b2 --------------------------------------------- */}
      {activeTab === 'validacion' && mostrarDesarrolloVal && hasPermission('p3_p2_a9_b2') && (
        <div className="p-5 rounded-2xl border bg-slate-900/30 border-slate-800 space-y-4">
          <span className="text-[14px] font-bold uppercase tracking-wider text-teal-400 block">
            📐 Planteo Matemático de los Indicadores de Calidad del Modelo
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="font-bold text-sky-400 block text-[14px]">Coeficiente de Determinación (R²):</span>
              <MathJaxFormula formula={"R^2 = 1 - \\frac{SS_{\\text{Res}}}{SS_{\\text{Tot}}} = 1 - \\frac{\\sum (Y_t - \\hat{Y}_t)^2}{\\sum (Y_t - \\bar{Y})^2}"} display={true} className="block text-center my-3 text-teal-300 font-serif text-[14px] font-semibold" />
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="font-bold text-teal-400 block text-[14px]">Número de Condición (κ):</span>
              <MathJaxFormula formula={"\\kappa(X^T X) = \\|X^T X\\|_1 \\cdot \\|(X^T X)^{-1}\\|_1"} display={true} className="block text-center my-3 text-teal-300 font-serif text-[14px] font-semibold" />
            </div>
          </div>
        </div>
      )}
      {/* ------------------------------------------- FIN: p3_p2_a9_b2 --------------------------------------------- */}

    </div>
  );
}
