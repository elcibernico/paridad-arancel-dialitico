import React, { useState, useMemo } from 'react';
import { MathJaxFormula } from '../MathJaxFormula';
import { buildMatrices, calculateMCO, calculateRidge } from '../../utils/matrixMath';
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

  const [activeTooltip, setActiveTooltip] = useState(null);

  const {
    seriesData,
    modalidadDialitica: modalidad, setModalidadDialitica: setModalidad,
    periodoHasta: tHasta, setPeriodoHasta: setTHasta,
    periodoDesde: tDesde, setPeriodoDesde: setTDesde,
    momentoCalculatorio, setMomentoCalculatorio,
    lambdaRidge,
    expectativas, setExpectativas,
    incidencias,
    aplicarCalidad, setAplicarCalidad
  } = useGlobalParams();

  // Sincroniza tDesde para que siempre sea 12 meses anterior a tHasta al cambiar este último
  const handleTHastaChange = (e) => {
    const newHasta = e.target.value;
    setTHasta(newHasta);
    const indexHasta = seriesData.findIndex(d => d.periodo === newHasta);
    const indexDesde = Math.max(0, indexHasta - 11);
    setTDesde(seriesData[indexDesde].periodo);
  };

  // Tasas mensuales esperadas de las variables (de parámetros globales)
  const gIPC = expectativas.ipc;
  const gUSD = expectativas.usd;
  const gCCT = expectativas.cct;

  const setGIPC = (v) => setExpectativas({ ...expectativas, ipc: v });
  const setGUSD = (v) => setExpectativas({ ...expectativas, usd: v });
  const setGCCT = (v) => setExpectativas({ ...expectativas, cct: v });

  // Ponderaciones polinómicas
  const wCCT = incidencias.cct / 100;
  const wUSD = incidencias.usd / 100;
  const wIPC = incidencias.ipc / 100;

  // Tipo de regresión econométrica para proyectar el arancel OS: 'ridge' (predeterminado) o 'mco'
  const [tipoRegresion, setTipoRegresion] = useState('ridge');
  const [mesesProyectados, setMesesProyectados] = useState(12);
  const [mostrarMath, setMostrarMath] = useState(false);
  const [mostrarVariables, setMostrarVariables] = useState(false);

  // Períodos de corte histórico para iniciar la proyección
  const periodosHastaFiltrados = seriesData.filter(p => p.periodo);

  // Coeficientes econométricos de la serie histórica
  const regressionCoefficients = useMemo(() => {
    // El análisis econométrico frena en el momento calculatorio si este es anterior a tHasta
    const regressionHasta = tHasta < momentoCalculatorio ? tHasta : momentoCalculatorio;
    const tDesdeEconometrico = seriesData[0].periodo; // Siempre anclado al primer período con datos de la serie

    let filteredHistorical = seriesData.filter(d => d.periodo >= tDesdeEconometrico && d.periodo <= regressionHasta);
    const modObj = opcionesModalidades.find(m => m.id === modalidad) || opcionesModalidades[0];

    // Fallback dinámico si el filtro de fechas global produce menos de 4 períodos
    if (filteredHistorical.length < 4) {
      const indexHasta = seriesData.findIndex(d => d.periodo === regressionHasta);
      if (indexHasta !== -1) {
        const startIndex = Math.max(0, indexHasta - 11);
        filteredHistorical = seriesData.slice(startIndex, indexHasta + 1);
      }
    }

    if (filteredHistorical.length < 4) {
      return {
        ridge: [0, 0, 0, 0],
        mco: [0, 0, 0, 0],
        error: 'Datos históricos insuficientes (se requieren al menos 4 períodos).'
      };
    }

    const { X, Y } = buildMatrices(filteredHistorical, modObj.campoExcel);
    const ridgeRes = calculateRidge(X, Y, lambdaRidge);
    const mcoRes = calculateMCO(X, Y);

    return {
      ridge: ridgeRes && ridgeRes.beta ? ridgeRes.beta : [0, 0, 0, 0],
      mco: mcoRes && mcoRes.beta ? mcoRes.beta : [0, 0, 0, 0],
      error: (ridgeRes && ridgeRes.error) || (mcoRes && mcoRes.error) || null
    };
  }, [tHasta, momentoCalculatorio, modalidad, lambdaRidge, seriesData]);

  const projectionData = useMemo(() => {
    const dataCorte = seriesData.find(d => d.periodo === momentoCalculatorio) || seriesData[seriesData.length - 1];
    const modObj = opcionesModalidades.find(m => m.id === modalidad) || opcionesModalidades[0];

    const Y_T = dataCorte[modObj.campoExcel]; // Valor nominal inicial real observado en T (Momento Calculatorio)
    const lastKnownData = seriesData[seriesData.length - 1]; // Último mes con datos reales en el JSON

    // Coeficientes beta elegidos para la predicción
    const beta = tipoRegresion === 'ridge' ? regressionCoefficients.ridge : regressionCoefficients.mco;

    // Calcular predicción econométrica en el momento T para usar como pivote de indexación
    const Y_pred_T = beta[0] + (beta[1] * dataCorte.ipc) + (beta[2] * dataCorte.usd) + (beta[3] * dataCorte.cct);

    // Calcular arancel real y predicho para el último mes conocido de la serie
    const Y_ultimo = lastKnownData[modObj.campoExcel];
    const Y_pred_ultimo = beta[0] + (beta[1] * lastKnownData.ipc) + (beta[2] * lastKnownData.usd) + (beta[3] * lastKnownData.cct);

    // Parsear momentoCalculatorio para calcular el avance temporal del label (ej. "2026-04" -> "Mayo 2026" para k=1)
    const [yearStr, monthStr] = momentoCalculatorio.split('-');
    const baseYear = parseInt(yearStr, 10);
    const baseMonth = parseInt(monthStr, 10) - 1; // 0-indexed para JS Dates

    const nombresMeses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const list = [];

    // Mes 0 (Momento de Partida T - Forzado a ser idéntico para ambas curvas)
    list.push({
      mes: 0,
      label: dataCorte.label,
      periodo: momentoCalculatorio,
      cctIndex: 1.0,
      usdIndex: 1.0,
      ipcIndex: 1.0,
      IP: 1.0,
      VP: Y_T, // Paridad parte exactamente del arancel actual en T
      Y: Y_T,  // Nominal OS parte del arancel actual en T
      brecha: 0.0, // Brecha inicial nula
      isKnown: true
    });

    // Proyectar k meses adelante
    for (let k = 1; k <= mesesProyectados; k++) {
      // Calcular período en formato YYYY-MM para verificar si existe en la base histórica
      const currentMonthIndex = baseMonth + k;
      const targetYear = baseYear + Math.floor(currentMonthIndex / 12);
      const targetMonth = currentMonthIndex % 12;
      const periodoK = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}`;
      const labelK = `${nombresMeses[targetMonth]} ${targetYear}`;

      const dataK = seriesData.find(d => d.periodo === periodoK);

      let cctVal_k, usdVal_k, ipcVal_k;
      let Y_k;
      let isKnown = false;

      if (dataK) {
        // ESCENARIO HÍBRIDO - Tramo conocido (Datos históricos reales del JSON)
        isKnown = true;
        cctVal_k = dataK.cct;
        usdVal_k = dataK.usd;
        ipcVal_k = dataK.ipc;
        Y_k = dataK[modObj.campoExcel]; // Valor real cobrado
      } else {
        // ESCENARIO PROYECTADO - Tramo futuro (Shocks acumulados y regresión a partir del último mes conocido)
        isKnown = false;

        // Calcular la distancia temporal en meses respecto al último mes del JSON
        const [lastYearStr, lastMonthStr] = lastKnownData.periodo.split('-');
        const lastYear = parseInt(lastYearStr, 10);
        const lastMonth = parseInt(lastMonthStr, 10) - 1;
        const m = (targetYear * 12 + targetMonth) - (lastYear * 12 + lastMonth);

        cctVal_k = lastKnownData.cct * Math.pow(1 + gCCT / 100, m);
        usdVal_k = lastKnownData.usd * Math.pow(1 + gUSD / 100, m);
        ipcVal_k = lastKnownData.ipc * Math.pow(1 + gIPC / 100, m);

        // Predicción nominal de la Obra Social
        const Y_pred_k = beta[0] + (beta[1] * ipcVal_k) + (beta[2] * usdVal_k) + (beta[3] * cctVal_k);
        Y_k = Y_pred_ultimo === 0 ? Y_pred_k : Y_ultimo * (Y_pred_k / Y_pred_ultimo);
      }

      // Variación de las variables respecto al Momento Calculatorio T
      const cctIndex_k = cctVal_k / dataCorte.cct;
      const usdIndex_k = usdVal_k / dataCorte.usd;
      const ipcIndex_k = ipcVal_k / dataCorte.ipc;

      // Paridad Requerida (Costo Teórico) partiendo de Y_T
      const IP_k = (wCCT * cctIndex_k) + (wUSD * usdIndex_k) + (wIPC * ipcIndex_k);
      const VP_k = Y_T * IP_k;

      list.push({
        mes: k,
        label: labelK,
        periodo: periodoK,
        cctIndex: cctIndex_k,
        usdIndex: usdIndex_k,
        ipcIndex: ipcIndex_k,
        IP: IP_k,
        VP: VP_k,
        Y: Y_k,
        brecha: ((Y_k - VP_k) / VP_k) * 100,
        isKnown
      });
    }

    return list;
  }, [momentoCalculatorio, modalidad, gIPC, gUSD, gCCT, wCCT, wUSD, wIPC, tipoRegresion, regressionCoefficients, mesesProyectados, tHasta, seriesData]);

  // Dimensiones del gráfico de líneas SVG
  const svgWidth = 500;
  const svgHeight = 240;
  const margin = { top: 20, right: 80, bottom: 40, left: 60 };

  const plotPoints = useMemo(() => {
    if (projectionData.length === 0) return { nominalPathKnown: '', parityPathKnown: '', nominalPathProj: '', parityPathProj: '', points: [] };

    // Buscar máximos y mínimos para escalar
    const maxVal = Math.max(...projectionData.map(d => Math.max(d.Y, d.VP))) * 1.05;
    const minVal = Math.min(...projectionData.map(d => Math.min(d.Y, d.VP))) * 0.95;

    const scaleX = (mes) => margin.left + (mes / mesesProyectados) * (svgWidth - margin.left - margin.right);
    const scaleY = (val) => svgHeight - margin.bottom - ((val - minVal) / (maxVal - minVal)) * (svgHeight - margin.top - margin.bottom);

    let nominalPathKnown = '';
    let parityPathKnown = '';
    let nominalPathProj = '';
    let parityPathProj = '';
    const points = [];

    // Encontrar el último índice con datos conocidos en la proyección
    const lastKnownIdx = projectionData.reduce((last, d, idx) => d.isKnown ? idx : last, 0);

    projectionData.forEach((d, idx) => {
      const cx = scaleX(d.mes);
      const cyNominal = scaleY(d.Y);
      const cyParity = scaleY(d.VP);

      // Tramo conocido (hasta el último índice conocido)
      if (idx <= lastKnownIdx) {
        if (idx === 0) {
          nominalPathKnown = `M ${cx} ${cyNominal}`;
          parityPathKnown = `M ${cx} ${cyParity}`;
        } else {
          nominalPathKnown += ` L ${cx} ${cyNominal}`;
          parityPathKnown += ` L ${cx} ${cyParity}`;
        }
      }

      // Tramo proyectado (desde el último índice conocido en adelante)
      if (idx >= lastKnownIdx) {
        if (idx === lastKnownIdx) {
          nominalPathProj = `M ${cx} ${cyNominal}`;
          parityPathProj = `M ${cx} ${cyParity}`;
        } else {
          nominalPathProj += ` L ${cx} ${cyNominal}`;
          parityPathProj += ` L ${cx} ${cyParity}`;
        }
      }

      points.push({
        mes: d.mes,
        label: d.label,
        cx,
        cyNominal,
        cyParity,
        valNominal: d.Y,
        valParity: d.VP,
        brecha: d.brecha,
        isKnown: d.isKnown
      });
    });

    return {
      nominalPathKnown,
      parityPathKnown,
      nominalPathProj,
      parityPathProj,
      points,
      scaleY,
      maxVal,
      minVal
    };
  }, [projectionData, mesesProyectados]);

  return (
    <div className="space-y-6">
      {/* ------------------------------------------- INI: p3_p4_a1 --------------------------------------------- */}
      {hasPermission('p3_p4_a1') && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <h2 className="text-[18px] font-bold text-teal-400 uppercase tracking-wider mb-2">
            🔮 Proyección Prospectiva y Sostenibilidad Financiera
          </h2>
          <p className="text-[18px] text-slate-300 leading-relaxed">
            El análisis histórico (retrospectivo) demuestra cómo se acumula la pérdida, pero la gestión de una clínica requiere anticipación.<br />
            El <strong>Modelo Prospectivo</strong> evalúa escenarios dinámicos simulando el comportamiento del arancel y las variables macroeconómicas exógenas a futuro (CCT, USD, IPC). Esto permite calcular el desvío proyectado (Brecha de Paridad) y diseñar una cobertura predictiva. A diferencia de enfoques tradicionales, este modelo predice el arancel de la Obra Social aplicando la estimación de la regresión (MCO o Ridge) sobre la serie de datos históricos.
          </p>
        </div>
      )}
      {/* ------------------------------------------- FIN: p3_p4_a1 --------------------------------------------- */}

      {/* ------------------------------------------- INI: p3_p4_a2 --------------------------------------------- */}
      {hasPermission('p3_p4_a2') && (
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-4 space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Parámetros del Modelo
            </h3>
            <button
              onClick={() => setMostrarVariables(!mostrarVariables)}
              className="text-xs font-black uppercase text-teal-400 bg-slate-900 border border-slate-850 px-4 py-2 rounded-xl hover:bg-slate-800 transition"
            >
              {mostrarVariables ? 'Ocultar Variables' : 'Administrar Variables'}
            </button>
          </div>

          {!mostrarVariables &&
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></span>
                <span className="font-bold text-slate-400">Modalidad:</span>
                <span className="text-white font-semibold">{(opcionesModalidades.find(m => m.id === modalidad) || opcionesModalidades[0]).nombre}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <div>
                  <span className="text-slate-400">Momento Calculatorio (T):</span>{' '}
                  <span className="text-teal-400 font-bold font-mono">{seriesData.find(d => d.periodo === momentoCalculatorio)?.label || momentoCalculatorio}</span>
                </div>
                <div>
                  <span className="text-slate-400">Proyección:</span>{' '}
                  <span className="text-teal-400 font-bold font-mono">{mesesProyectados} Meses</span>
                </div>
                <div>
                  <span className="text-slate-400">Modelo OS:</span>{' '}
                  <span className="text-teal-400 font-bold font-mono">{tipoRegresion === 'ridge' ? 'Ridge' : 'MCO'}</span>
                </div>
                <div>
                  <span className="text-slate-400">Inflación (g_IPC):</span>{' '}
                  <span className="text-yellow-500 font-bold font-mono">+{gIPC}%/mes</span>
                </div>
              </div>
            </div>
          }

          {mostrarVariables &&
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
                  <label className="text-xs uppercase font-bold text-slate-400 font-sans">Período Hasta (Llegada Econométrica):</label>
                  <select
                    value={tHasta}
                    onChange={handleTHastaChange}
                    className="bg-slate-950 border border-slate-800 text-xs rounded-xl p-2 text-white focus:outline-none cursor-pointer"
                  >
                    {periodosHastaFiltrados.map(p => (
                      <option key={p.periodo} value={p.periodo}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-xs uppercase font-bold text-slate-400 font-sans">Momento Calculatorio (T):</label>
                  <select
                    value={momentoCalculatorio}
                    onChange={(e) => setMomentoCalculatorio(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-xs rounded-xl p-2 text-white focus:outline-none cursor-pointer"
                  >
                    {seriesData.map(p => (
                      <option key={p.periodo} value={p.periodo}>{p.label}</option>
                    ))}
                  </select>
                </div>

                {/* MESES PROYECCIÓN TÉCNICO AL PIE DE VARIABLES DE ESCENARIO */}
                <div className="flex flex-col space-y-1 mt-2">
                  <label className="text-xs uppercase font-bold text-slate-400 font-sans">Meses Proyección Técnico:</label>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    {[3, 6, 9, 12].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMesesProyectados(m)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all ${mesesProyectados === m ? 'bg-teal-950 border-teal-500 text-teal-400 font-mono' : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-700 font-mono'}`}
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                </div>

                {/* CARGA POR CALIDAD BIDIRECCIONAL */}
                <div className="flex flex-col space-y-1 mt-2">
                  <label className="text-xs uppercase font-bold text-slate-400 font-sans">Carga por Calidad:</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setAplicarCalidad(false)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all uppercase tracking-wider cursor-pointer ${!aplicarCalidad ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-950 border-slate-850 text-slate-500 hover:border-slate-700'}`}
                    >
                      Sin Calidad
                    </button>
                    <button
                      type="button"
                      onClick={() => setAplicarCalidad(true)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all uppercase tracking-wider cursor-pointer ${aplicarCalidad ? 'bg-teal-950 border-teal-500 text-teal-400' : 'bg-slate-950 border-slate-850 text-slate-500 hover:border-slate-700'}`}
                    >
                      Con Calidad
                    </button>
                  </div>
                </div>
              </div>

              {/* AJUSTES MACRO / EXPECTATIVAS (EDITABLE) */}
              <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-teal-400 block border-b border-slate-800 pb-1.5">
                  📈 Shocks Macroeconómicos Mensuales
                </span>
                <div className="space-y-3 text-xs">
                  {/* Inflación */}
                  <div className="flex flex-col space-y-1 bg-slate-950/40 p-2 rounded-lg border border-slate-900">
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-400">Inflación Esperada (<MathJaxFormula className="inline-block text-[14px]" formula="g_{IPC}" />):</span>
                      <span className="text-yellow-500 font-bold">+{fmtAR(gIPC, 1)}% / mes</span>
                    </div>
                    <input
                      type="range" min="0" max="30" step="0.5" value={gIPC}
                      onChange={(e) => setGIPC(Number(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-500 mt-2"
                    />
                  </div>

                  {/* Dólar */}
                  <div className="flex flex-col space-y-1 bg-slate-950/40 p-2 rounded-lg border border-slate-900">
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-400">Variación Cambiaria (<MathJaxFormula className="inline-block text-[14px]" formula="g_{USD}" />):</span>
                      <span className="text-cyan-400 font-bold">+{fmtAR(gUSD, 1)}% / mes</span>
                    </div>
                    <input
                      type="range" min="0" max="30" step="0.5" value={gUSD}
                      onChange={(e) => setGUSD(Number(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 mt-2"
                    />
                  </div>

                  {/* Salarios CCT */}
                  <div className="flex flex-col space-y-1 bg-slate-950/40 p-2 rounded-lg border border-slate-900">
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-400">Aumento Salarial CCT (<MathJaxFormula className="inline-block text-[14px]" formula="g_{CCT}" />):</span>
                      <span className="text-emerald-400 font-bold">+{fmtAR(gCCT, 1)}% / mes</span>
                    </div>
                    <input
                      type="range" min="0" max="30" step="0.5" value={gCCT}
                      onChange={(e) => setGCCT(Number(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-2"
                    />
                  </div>

                  <span className="text-[10px] text-slate-500 block leading-tight">
                    * Estos valores se configuran globalmente en la sección de Parámetros Globales.
                  </span>
                </div>
              </div>

              {/* MODELO PREDICTIVO DEL ARANCEL DE LA OBRA SOCIAL */}
              <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md space-y-4">
                <span className="text-xs font-black uppercase tracking-wider text-teal-400 block border-b border-slate-800 pb-1.5">
                  ⚙️ Predicción Econométrica OS
                </span>

                <div className="flex flex-col space-y-1">
                  <label className="text-xs uppercase font-bold text-slate-400 font-sans">Modelo de Regresión:</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setTipoRegresion('ridge')}
                      className={`p-2 rounded-xl text-[10px] font-bold border transition-all uppercase tracking-wider ${tipoRegresion === 'ridge' ? 'bg-teal-950/50 border-teal-500 text-teal-400' : 'bg-slate-950 border-slate-850 text-slate-500 hover:border-slate-700'}`}
                    >
                      Ridge (Regularizado)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoRegresion('mco')}
                      className={`p-2 rounded-xl text-[10px] font-bold border transition-all uppercase tracking-wider ${tipoRegresion === 'mco' ? 'bg-indigo-950/50 border-indigo-500 text-indigo-400' : 'bg-slate-950 border-slate-850 text-slate-500 hover:border-slate-700'}`}
                    >
                      MCO (Clásico)
                    </button>
                  </div>
                </div>

                <div className="flex flex-col space-y-1 bg-slate-950/60 p-2 rounded-xl border border-slate-850 text-[10px] text-slate-300 font-mono">
                  <span className="font-sans font-bold text-slate-400 block text-[10px] mb-1">Coeficientes Estimados:</span>
                  {regressionCoefficients.error ? (
                    <span className="text-red-400 text-[9px]">{regressionCoefficients.error}</span>
                  ) : (
                    <>
                      <div className="flex justify-between border-b border-slate-900 pb-0.5">
                        <span>Base (β₀):</span>
                        <span className="text-white font-bold">${Math.round(tipoRegresion === 'ridge' ? regressionCoefficients.ridge[0] : regressionCoefficients.mco[0]).toLocaleString('es-AR')}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-900 pb-0.5">
                        <span>IPC (β₁):</span>
                        <span className={`font-bold ${(tipoRegresion === 'ridge' ? regressionCoefficients.ridge[1] : regressionCoefficients.mco[1]) < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {fmtAR(tipoRegresion === 'ridge' ? regressionCoefficients.ridge[1] : regressionCoefficients.mco[1], 2)}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-900 pb-0.5">
                        <span>USD (β₂):</span>
                        <span className={`font-bold ${(tipoRegresion === 'ridge' ? regressionCoefficients.ridge[2] : regressionCoefficients.mco[2]) < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {fmtAR(tipoRegresion === 'ridge' ? regressionCoefficients.ridge[2] : regressionCoefficients.mco[2], 2)}
                        </span>
                      </div>
                      <div className="flex justify-between pb-0.5">
                        <span>CCT (β₃):</span>
                        <span className={`font-bold ${(tipoRegresion === 'ridge' ? regressionCoefficients.ridge[3] : regressionCoefficients.mco[3]) < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {fmtAR(tipoRegresion === 'ridge' ? regressionCoefficients.ridge[3] : regressionCoefficients.mco[3], 2)}
                        </span>
                      </div>
                      {(tipoRegresion === 'mco' && (regressionCoefficients.mco[1] < 0 || regressionCoefficients.mco[2] < 0 || regressionCoefficients.mco[3] < 0)) && (
                        <span className="text-red-400 text-[8px] block leading-tight mt-1 font-sans">
                          ⚠️ Sesgo/Signo contraintuitivo.
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          }
        </div>
      )}
      {/* ------------------------------------------- FIN: p3_p4_a2 --------------------------------------------- */}

      {/* DASHBOARD DE RESULTADOS Y SIMULACIÓN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ------------------------------------------- INI: p3_p4_a3_b1 --------------------------------------------- */}
        {hasPermission('p3_p4_a3_b1') && (
          <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md flex flex-col justify-between relative">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-teal-400 block mb-1">
                📊 Trayectoria Proyectada del Arancel vs Paridad Polinómica
              </span>
              <p className="text-xs text-slate-400 mb-4">
                Comparación visual del arancel nominal recibido frente al arancel de equilibrio ajustado por costos reales.
              </p>
            </div>

            <div className="w-full flex justify-center my-auto relative">
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

                {/* Trazados de Líneas Segmentadas (Tramo Conocido - Backtesting) */}
                {plotPoints.nominalPathKnown && (
                  <path d={plotPoints.nominalPathKnown} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="4 4" />
                )}
                {plotPoints.parityPathKnown && (
                  <path d={plotPoints.parityPathKnown} fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="4 4" />
                )}

                {/* Trazados de Líneas Sólidas (Tramo Proyectado - Escenario Futuro) */}
                {plotPoints.nominalPathProj && (
                  <path d={plotPoints.nominalPathProj} fill="none" stroke="#38bdf8" strokeWidth="2.5" />
                )}
                {plotPoints.parityPathProj && (
                  <path d={plotPoints.parityPathProj} fill="none" stroke="#f43f5e" strokeWidth="2.5" />
                )}

                {/* Puntos y Hover/Labels */}
                {(() => {
                  const stepWidth = (svgWidth - margin.left - margin.right) / mesesProyectados;
                  return plotPoints.points.map((pt, i) => {
                    const showLabel = i === 0 || i === Math.floor(mesesProyectados / 2) || i === mesesProyectados;
                    return (
                      <g key={i}>
                        {/* Línea vertical guía fina en hover */}
                        <line x1={pt.cx} y1={margin.top} x2={pt.cx} y2={svgHeight - margin.bottom} stroke="#334155" strokeWidth="1" opacity="0.15" />

                        {/* Círculo Nominal */}
                        <circle cx={pt.cx} cy={pt.cyNominal} r="3.5" fill="#38bdf8" />
                        {/* Círculo Paridad */}
                        <circle cx={pt.cx} cy={pt.cyParity} r="3.5" fill="#f43f5e" />

                        {showLabel && (() => {
                          const parityIsAbove = pt.valParity > pt.valNominal;
                          const yNominalText = parityIsAbove ? pt.cyNominal + 14 : pt.cyNominal - 8;
                          const yParityText = parityIsAbove ? pt.cyParity - 8 : pt.cyParity + 14;
                          return (
                            <g>
                              <text x={pt.cx} y={svgHeight - margin.bottom + 15} fill="#94a3b8" fontSize="9" textAnchor="middle">
                                {pt.label}
                              </text>
                              {/* Textos de valores */}
                              <text x={pt.cx} y={yNominalText} fill="#7dd3fc" fontSize="8.5" fontWeight="bold" textAnchor="middle">
                                ${Math.round(pt.valNominal).toLocaleString('es-AR')}
                              </text>
                              <text x={pt.cx} y={yParityText} fill="#fda4af" fontSize="8.5" fontWeight="bold" textAnchor="middle">
                                ${Math.round(pt.valParity).toLocaleString('es-AR')}
                              </text>
                            </g>
                          );
                        })()}

                        {/* Rectángulo invisible vertical para capturar hover del mouse a cualquier altura */}
                        <rect
                          x={pt.cx - stepWidth / 2}
                          y={margin.top}
                          width={stepWidth}
                          height={svgHeight - margin.top - margin.bottom}
                          fill="transparent"
                          className="cursor-pointer"
                          onMouseEnter={() => {
                            setActiveTooltip({
                              x: pt.cx,
                              y: Math.min(pt.cyNominal, pt.cyParity) - 10,
                              label: pt.label,
                              valNominal: pt.valNominal,
                              valParity: pt.valParity,
                              brecha: pt.brecha,
                              isKnown: pt.isKnown
                            });
                          }}
                          onMouseLeave={() => setActiveTooltip(null)}
                        />
                      </g>
                    );
                  });
                })()}
              </svg>

              {/* TOOLTIP INTERACTIVO FLOTANTE ABSOLUTO */}
              {activeTooltip && (
                <div
                  className="absolute z-20 bg-slate-950/95 border border-slate-800 rounded-xl p-3 text-[11px] text-left text-slate-300 pointer-events-none shadow-xl backdrop-blur-sm"
                  style={{
                    left: `${(activeTooltip.x / svgWidth) * 100}%`,
                    top: `${(activeTooltip.y / svgHeight) * 100}%`,
                    transform: 'translate(-50%, -100%)',
                    marginTop: '-8px'
                  }}
                >
                  <div className="font-bold text-teal-400 border-b border-slate-800 pb-1 mb-1.5 font-sans flex items-center gap-1.5">
                    <span>📅 {activeTooltip.label}</span>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-sans uppercase font-black ${activeTooltip.isKnown ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                      {activeTooltip.isKnown ? 'Histórico' : 'Proyectado'}
                    </span>
                  </div>
                  <div className="space-y-1 font-mono leading-normal">
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-400 font-sans">{activeTooltip.isKnown ? 'Comportamiento Financiadora:' : 'Valor de la Financiadora:'}</span>
                      <span className="text-sky-300 font-bold">${Math.round(activeTooltip.valNominal).toLocaleString('es-AR')}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-400 font-sans">{activeTooltip.isKnown ? 'Valor debió abonarse (Polinómico):' : 'Valor Calculado:'}</span>
                      <span className="text-rose-400 font-bold">${Math.round(activeTooltip.valParity).toLocaleString('es-AR')}</span>
                    </div>
                    <div className="flex justify-between gap-4 border-t border-slate-850 pt-1 mt-1 font-sans text-[10px]">
                      <span className="text-slate-400">Brecha {activeTooltip.isKnown ? 'Histórica' : 'Acumulada'}:</span>
                      <span className={`font-black ${activeTooltip.brecha < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {fmtAR(activeTooltip.brecha, 1)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* REFERENCIAS AL PIE DEL GRÁFICO */}
            {(() => {
              const tieneMesesConocidos = projectionData.some(d => d.mes > 0 && d.isKnown);
              return (
                <div className="mt-4 space-y-2 text-left border-t border-slate-850/80 pt-3 text-[10px] text-slate-400">
                  <div className="flex items-start gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] mt-0.5 shrink-0" style={{ border: tieneMesesConocidos ? '1.5px dashed #0c4a6e' : 'none' }}></span>
                    <span>
                      <strong className="text-sky-400">
                        {tieneMesesConocidos ? 'Comportamiento de Financiadora' : 'Expectativa de comportamiento de Financiadora'}
                      </strong>

                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e] mt-0.5 shrink-0" style={{ border: tieneMesesConocidos ? '1.5px dashed #4c0519' : 'none' }}></span>
                    <span>
                      <strong className="text-rose-400">
                        {tieneMesesConocidos ? 'Valor que se debió haber abonado según Modelo Polinómico de Costos Estructurales' : 'Valor que debería abonar la Financiadora para equivaler los efectos IPC, USD y CCT'}
                      </strong>
                    </span>
                  </div>
                  <div>
                    {tieneMesesConocidos && <span className="text-[9px] text-slate-500 ml-1">(Línea segmentada = Datos conocidos | Línea sólida = Proyección simulada)</span>}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
        {/* ------------------------------------------- FIN: p3_p4_a3_b1 --------------------------------------------- */}

        {/* TABLA DE TRAYECTORIA Y METRICAS */}
        {/* ------------------------------------------- INI: p3_p4_a3_b2 --------------------------------------------- */}
        {hasPermission('p3_p4_a3_b2') && (
          <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md flex flex-col space-y-4 h-fit">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-teal-400 block mb-1">
                📋 Planilla de Desvíos de Paridad Proyectados
              </span>
              <p className="text-xs text-slate-400 mb-2">
                Evolución detallada de la brecha real por mes ante los shocks macroeconómicos.
              </p>
            </div>

            <div className="overflow-x-auto max-h-[320px] border border-slate-850 rounded-xl relative">
              <table className="w-full text-[11px] text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-2 text-center sticky top-0 bg-slate-950/95 z-10 border-b border-slate-800">Mes</th>
                    <th className="p-2 sticky top-0 bg-slate-950/95 z-10 border-b border-slate-800">Nominal OS</th>
                    <th className="p-2 sticky top-0 bg-slate-950/95 z-10 border-b border-slate-800">Paridad Requerida</th>
                    <th className="p-2 text-right sticky top-0 bg-slate-950/95 z-10 border-b border-slate-800">Brecha Acumulada</th>
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

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 text-center">
              {(() => {
                const lastVal = projectionData[projectionData.length - 1];
                const desvioFinal = lastVal.brecha;
                const isCritico = desvioFinal < 0;
                return (
                  <p className="text-xs text-slate-300 font-sans">
                    Brecha acumulada al final del período ({mesesProyectados}m):{' '}
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
        )}
        {/* ------------------------------------------- FIN: p3_p4_a3_b2 --------------------------------------------- */}
      </div>

      {/* BOTÓN DESARROLLO MATEMÁTICO */}
      {/* ------------------------------------------- INI: p3_p4_a3_b3 --------------------------------------------- */}
      {hasPermission('p3_p4_a3_b3') && (
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
            <div className="p-5 rounded-2xl border bg-slate-950/60 border-slate-800 space-y-4 leading-relaxed text-slate-300 text-[16px]">
              <h4 className="text-teal-400 font-bold uppercase tracking-wide border-b border-slate-800 pb-2">
                🎓 Planteo Algebraico y Desarrollo en Tiempo Real
              </h4>

              <p className="text-slate-300 font-sans text-[16px]">
                <strong>1. Predicción del Arancel de la Obra Social (<MathJaxFormula className="inline-block text-[16px]" formula="Y_{T+k}" />):</strong>
                <br />
                En lugar de una tasa de incremento fija, el arancel futuro de la obra social se estima aplicando los coeficientes econométricos (<MathJaxFormula className="inline-block text-[16px]" formula="\hat{\beta}" />) de la regresión histórica sobre las variables macro exógenas proyectadas:
              </p>
              <div className="p-3 bg-slate-900/60 rounded-xl">
                <MathJaxFormula display={true} className="flex justify-center w-full text-[18px] text-teal-300 font-semibold" formula="Y_{T+k} = \hat{\beta}_0 + \hat{\beta}_1 \cdot IPC_{T+k} + \hat{\beta}_2 \cdot USD_{T+k} + \hat{\beta}_3 \cdot CCT_{T+k}" />
              </div>

              <div className="space-y-3 font-mono">
                <p className="text-slate-300 font-sans text-[16px]">
                  <strong>2. Proyección de las Variables Exógenas en Tiempo Real:</strong>
                  <br />
                  Dado el período de corte <MathJaxFormula className="inline-block text-[16px]" formula="T" />, cada variable proyecta su evolución exponencial k meses adelante según sus tasas esperadas:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-900/60 rounded-xl text-center text-[18px]">
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

                <p className="text-slate-300 font-sans text-[16px]">
                  <strong>3. Fórmula Polinómica Prospectiva (<MathJaxFormula className="inline-block text-[16px]" formula="V^P_{T+k}" />):</strong>
                  <br />
                  Permite recomponer la estructura óptima teórica del arancel en base a las incidencias relativas ponderadas:
                </p>
                <div className="p-3 bg-slate-900/60 rounded-xl">
                  <MathJaxFormula display={true} className="flex justify-center w-full text-[18px] text-teal-300 font-semibold" formula="V^P_{T+k} = C_0 \cdot \left[ w_{CCT} I^{CCT}_{T+k} + w_{USD} I^{USD}_{T+k} + w_{IPC} I^{IPC}_{T+k} \right]" />
                </div>

                <p className="text-slate-300 font-sans text-[16px]">
                  <strong>4. Desvío Proyectado o Brecha de Paridad (<MathJaxFormula className="inline-block text-[16px]" formula="B_{T+k}" />):</strong>
                  <br />
                  Expresa el desajuste porcentual entre el arancel nominal predicho por la regresión y el costo teórico de paridad:
                </p>
                <div className="p-3 bg-slate-900/60 rounded-xl">
                  <MathJaxFormula display={true} className="flex justify-center w-full text-[18px] text-teal-300 font-semibold" formula="B_{T+k} = \frac{Y_{T+k} - V^P_{T+k}}{V^P_{T+k}} \cdot 100" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/* ------------------------------------------- FIN: p3_p4_a3_b3 --------------------------------------------- */}
    </div>
  );
}
