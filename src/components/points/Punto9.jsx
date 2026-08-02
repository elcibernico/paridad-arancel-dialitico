import React, { useState, useMemo } from 'react';
import { MathJaxFormula } from '../MathJaxFormula';
import seriesData from '../../data/seriesData.json';
import { buildMatrices, calculateMCO, calculateConditionNumber, calculateVIFs } from '../../utils/matrixMath';
import { fmtAR } from '../../utils/format';

export default function Punto9() {
  // Rango por defecto (últimos 12 meses)
  const defaultHasta = seriesData[seriesData.length - 1];
  const defaultDesdeIndex = Math.max(0, seriesData.length - 12);
  const defaultDesde = seriesData[defaultDesdeIndex];

  const [tDesde, setTDesde] = useState(defaultDesde.periodo);
  const [tHasta, setTHasta] = useState(defaultHasta.periodo);
  const [searchDesde, setSearchDesde] = useState('');
  const [searchHasta, setSearchHasta] = useState('');

  const periodosDesdeFiltrados = seriesData.filter(p =>
    p.label.toLowerCase().includes(searchDesde.toLowerCase()) || p.periodo.includes(searchDesde)
  );

  const periodosHastaFiltrados = seriesData.filter(p =>
    (p.label.toLowerCase().includes(searchHasta.toLowerCase()) || p.periodo.includes(searchHasta)) &&
    p.periodo > tDesde
  );

  // Computaciones del colapso (No dependen de la modalidad arancelaria)
  const metrics = useMemo(() => {
    const filtered = seriesData.filter(d => d.periodo >= tDesde && d.periodo <= tHasta);
    const { X, Y } = buildMatrices(filtered, 'valorSesionHD'); // Fijo ya que la colinealidad solo depende de la matriz X

    const mcoResult = calculateMCO(X, Y);
    const vifs = calculateVIFs(filtered);
    
    let conditionNumber = Infinity;
    if (mcoResult && !mcoResult.error && mcoResult.XtX_inv) {
      conditionNumber = calculateConditionNumber(mcoResult.XtX, mcoResult.XtX_inv);
    }

    // Calcular correlaciones de Pearson
    const getCorrelation = (arrX, arrY) => {
      const n = arrX.length;
      if (n === 0) return 0;
      const meanX = arrX.reduce((s, v) => s + v, 0) / n;
      const meanY = arrY.reduce((s, v) => s + v, 0) / n;
      let num = 0;
      let denX = 0;
      let denY = 0;
      for (let i = 0; i < n; i++) {
        const dx = arrX[i] - meanX;
        const dy = arrY[i] - meanY;
        num += dx * dy;
        denX += dx * dx;
        denY += dy * dy;
      }
      return denX * denY === 0 ? 0 : num / Math.sqrt(denX * denY);
    };

    const ipcVals = filtered.map(d => d.ipc);
    const usdVals = filtered.map(d => d.usd);
    const cctVals = filtered.map(d => d.cct);

    const corrIPC_USD = getCorrelation(ipcVals, usdVals);
    const corrIPC_CCT = getCorrelation(ipcVals, cctVals);
    const corrUSD_CCT = getCorrelation(usdVals, cctVals);

    return {
      filtered,
      vifs,
      conditionNumber,
      mcoError: mcoResult.error,
      corr: {
        ipc_usd: corrIPC_USD,
        ipc_cct: corrIPC_CCT,
        usd_cct: corrUSD_CCT
      }
    };
  }, [tDesde, tHasta]);

  // Alerta según CN y VIF
  const getSeverityLevel = () => {
    if (metrics.mcoError) return { label: 'Colapso Matemático Total', color: 'text-red-500 border-red-500 bg-red-950/20', desc: 'La devaluación y la inflación se movieron de forma idéntica en este tramo. La matriz es singular (determinante cero), haciendo imposible calcular la regresión.' };
    
    const maxVif = Math.max(metrics.vifs.ipc, metrics.vifs.usd, metrics.vifs.cct);
    const cn = metrics.conditionNumber;

    if (cn > 100 || maxVif > 50) {
      return { label: 'Multicolinealidad Crítica', color: 'text-red-400 border-red-800 bg-red-950/10', desc: 'Los coeficientes del simulador no tienen validez predictiva. El signo de los coeficientes puede alterarse (ej. salarios con peso negativo) debido a la colinealidad extrema.' };
    } else if (cn > 30 || maxVif > 10) {
      return { label: 'Multicolinealidad Moderada a Alta', color: 'text-yellow-400 border-yellow-800 bg-yellow-950/10', desc: 'Hay un solapamiento importante en el comportamiento de los índices. El modelo MCO empieza a perder precisión y estabilidad.' };
    }
    return { label: 'Ortogonalidad Aceptable', color: 'text-emerald-400 border-emerald-800 bg-emerald-950/10', desc: 'El nivel de correlación de los índices permite una estimación de MCO relativamente estable.' };
  };

  const severity = getSeverityLevel();

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="border-b pb-4 border-slate-300 dark:border-slate-800">
        <span className="text-xs font-black uppercase tracking-wider text-red-800 dark:text-red-400">
          Punto 9 • Diagnóstico de Colapso Estructural
        </span>
        <h3 className="text-3xl sm:text-4xl font-black mt-1 text-slate-950 dark:text-white">
          La Pérdida de Ortogonalidad
        </h3>
        <p className="text-base sm:text-lg mt-2 leading-relaxed text-slate-800 font-normal dark:text-slate-300">
          En economías de alta inflación recurrente como la Argentina, el Dólar (USD), la paritaria sectorial (CCT) y el nivel de precios general (IPC) avanzan juntos en la misma dirección. Al perderse la independencia de estas variables, el estimador MCO colapsa numéricamente.
        </p>
      </div>

      {/* CONTROLES (Modificado: Se eliminó el parámetro de Modalidad de Diálisis por no tener incidencia sobre la colinealidad) */}
      <div className="p-4 rounded-2xl border space-y-3 bg-slate-900 border-slate-800 text-slate-100 shadow-md">
        <span className="text-sm font-bold uppercase tracking-wider text-red-400 block">
          🎛️ Configurar Período para Análisis de Multicolinealidad:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <label className="text-xs font-bold text-slate-400">Desde:</label>
            <select
              value={tDesde}
              onChange={(e) => setTDesde(e.target.value)}
              className="w-full text-xs font-bold py-1 px-1 rounded border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-red-500"
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

          <div className="flex flex-col space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <label className="text-xs font-bold text-slate-400">Hasta:</label>
            <select
              value={tHasta}
              onChange={(e) => setTHasta(e.target.value)}
              className="w-full text-xs font-bold py-1 px-1 rounded border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-red-500"
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

      {/* ALERTA DE SEVERIDAD */}
      <div className={`p-4 rounded-2xl border-2 ${severity.color} space-y-1.5`}>
        <div className="text-xs uppercase font-black tracking-wider flex items-center gap-1.5">
          <span>⚠️</span>
          <span>Estado del Sistema: {severity.label}</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-normal">
          {severity.desc}
        </p>
      </div>

      {/* METRICAS Y EXPLICACIONES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* CARD 1: VIF CON EXPLICACION DE VALORES EN TIEMPO REAL */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 block border-b border-slate-800 pb-1.5">
            📊 Factor de Inflación de la Varianza (VIF)
          </span>
          <div className="space-y-3">
            <div className="space-y-0.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-350">VIF IPC (Gastos):</span>
                <span className={`font-mono font-black ${metrics.vifs.ipc > 10 ? 'text-red-450' : 'text-emerald-400'}`}>
                   {metrics.vifs.ipc === Infinity ? '∞' : fmtAR(metrics.vifs.ipc, 2)}
                </span>
              </div>
              <p className="text-[10.5px] text-slate-450 leading-tight">
                {metrics.vifs.ipc === Infinity 
                  ? 'Colapso total.' : `La varianza del estimador de IPC está inflada en un factor de ${fmtAR(metrics.vifs.ipc, 1)}. Destruye la precisión estadística de la variable.`}
              </p>
            </div>
            
            <div className="space-y-0.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-350">VIF USD (Insumos):</span>
                <span className={`font-mono font-black ${metrics.vifs.usd > 10 ? 'text-red-450' : 'text-emerald-400'}`}>
                   {metrics.vifs.usd === Infinity ? '∞' : fmtAR(metrics.vifs.usd, 2)}
                </span>
              </div>
              <p className="text-[10.5px] text-slate-450 leading-tight">
                {metrics.vifs.usd === Infinity 
                  ? 'Colapso total.' : `La varianza de la variable cambiaria (USD) está inflada en un factor de ${fmtAR(metrics.vifs.usd, 1)} debido a su alta correlación.`}
              </p>
            </div>

            <div className="space-y-0.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-350">VIF CCT (Salarios):</span>
                <span className={`font-mono font-black ${metrics.vifs.cct > 10 ? 'text-red-450' : 'text-emerald-400'}`}>
                   {metrics.vifs.cct === Infinity ? '∞' : fmtAR(metrics.vifs.cct, 2)}
                </span>
              </div>
              <p className="text-[10.5px] text-slate-450 leading-tight">
                {metrics.vifs.cct === Infinity 
                  ? 'Colapso total.' : `La varianza del salario CCT está inflada en un factor de ${fmtAR(metrics.vifs.cct, 1)}, provocando inestabilidad extrema de signo.`}
              </p>
            </div>
          </div>
        </div>

        {/* CARD 2: CONDITION NUMBER CON EXPLICACION EN TIEMPO REAL */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 block border-b border-slate-800 pb-1.5">
              🔢 Número de Condición (<MathJaxFormula formula={"\\kappa_1"} />)
            </span>
            <div className="text-center py-2.5">
              <div className={`text-xl font-black truncate ${metrics.conditionNumber > 30 ? 'text-red-400' : 'text-emerald-400'}`}>
                {metrics.conditionNumber === Infinity ? 'Colapso (Singular)' : fmtAR(metrics.conditionNumber, 1)}
              </div>
              <span className="text-[10.5px] text-slate-500 uppercase block font-bold mt-0.5">Índice de inestabilidad matricial</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight bg-slate-950/50 p-2.5 rounded-xl border border-slate-850">
            <strong>¿Qué significa e incide?</strong> Mide la sensibilidad de la matriz inversa. Al valer <b>{metrics.conditionNumber === Infinity ? 'Infinito' : fmtAR(metrics.conditionNumber, 0)}</b> (muy superior al límite crítico de 30), cualquier ínfimo cambio o redondeo en la base de datos provoca que los resultados del simulador MCO fluctúen de forma caótica, arrojando ponderaciones negativas incoherentes.
          </p>
        </div>

        {/* CARD 3: MATRIZ DE CORRELACIONES */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 block border-b border-slate-800 pb-1.5">
            🤝 Correlaciones de Pearson (r)
          </span>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-400">r (IPC vs USD):</span>
              <span className="font-mono font-bold text-cyan-400">
                 {fmtAR(metrics.corr.ipc_usd, 4)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-400">r (IPC vs CCT):</span>
              <span className="font-mono font-bold text-cyan-400">
                 {fmtAR(metrics.corr.ipc_cct, 4)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-400">r (USD vs CCT):</span>
              <span className="font-mono font-bold text-cyan-400">
                 {fmtAR(metrics.corr.usd_cct, 4)}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            Indica el grado de asociación lineal de los índices. Valores cercanos a +1.000 demuestran que las variables se comportan de manera casi idéntica, destruyendo la propiedad de ortogonalidad del modelo.
          </p>
        </div>

      </div>

    </div>
  );
}
