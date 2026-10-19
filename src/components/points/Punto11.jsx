import React, { useState, useMemo, useEffect } from 'react';
import { MathJaxFormula } from '../MathJaxFormula';
import { useAuth } from '../../context/AuthContext';
import { useGlobalParams } from '../../context/GlobalContext';
import { fmtAR, fmtLatex } from '../../utils/format';

export default function Punto11() {
  const { hasPermission } = useAuth();
  const {
    seriesData,
    modalidadDialitica, setModalidadDialitica,
    periodoDesde, setPeriodoDesde,
    periodoHasta, setPeriodoHasta,
    momentoCalculatorio, setMomentoCalculatorio,
    incidencias, setIncidencias,
    plazoPago, setPlazoPago,
    padronPacientes, setPadronPacientes,
    sesionesMensuales, setSesionesMensuales,
    mesesAmortizacion, setMesesAmortizacion,
    expectativas, setExpectativas,
    tasaDescuento, setTasaDescuento,
    aplicarCalidad
  } = useGlobalParams();

  const [mostrarVariables, setMostrarVariables] = useState(false);
  const [mostrarMath, setMostrarMath] = useState(false);

  // Estados locales específicos para el simulador del Punto 11
  const [ajustePolinomicoDesde, setAjustePolinomicoDesde] = useState(periodoDesde);
  const [mesesProyeccion, setMesesProyeccion] = useState(12); // K: 3, 6, 9, 12 meses
  const [mesesHistorialRecuperar, setMesesHistorialRecuperar] = useState(12); // M_históricos: 1 a 36 meses
  const [aplicarAjustePolinomico, setAplicarAjustePolinomico] = useState(true);

  // Helper para diferencia de meses inclusivo
  const getMesesDiferencia = (desde, hasta) => {
    if (!desde || !hasta) return 0;
    const [yD, mD] = desde.split('-').map(Number);
    const [yH, mH] = hasta.split('-').map(Number);
    return (yH * 12 + mH) - (yD * 12 + mD) + 1;
  };

  // Asegura que momentoCalculatorio no sea menor que ajustePolinomicoDesde
  useEffect(() => {
    if (ajustePolinomicoDesde && momentoCalculatorio && momentoCalculatorio < ajustePolinomicoDesde) {
      setMomentoCalculatorio(ajustePolinomicoDesde);
    }
  }, [ajustePolinomicoDesde, momentoCalculatorio]);

  // Límite dinámico del historial de amortización retrospectiva
  useEffect(() => {
    const maxH = getMesesDiferencia(ajustePolinomicoDesde, momentoCalculatorio);
    if (maxH > 0 && mesesHistorialRecuperar > maxH) {
      setMesesHistorialRecuperar(maxH);
    }
  }, [ajustePolinomicoDesde, momentoCalculatorio, mesesHistorialRecuperar]);

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

  // Opciones de periodos para el selector de Ajuste Desde y Momento Calculatorio
  const opcionesDesde = useMemo(() => {
    return seriesData.filter(p => p.periodo);
  }, [seriesData]);

  const opcionesHasta = useMemo(() => {
    if (!ajustePolinomicoDesde) return seriesData.filter(p => p.periodo);
    return seriesData.filter(p => p.periodo && p.periodo >= ajustePolinomicoDesde);
  }, [seriesData, ajustePolinomicoDesde]);

  // --- CALCULOS DEL NUEVO MODELO DE PARIDAD TECNICA ---
  const calculations = useMemo(() => {
    // 1. Determinar los índices de los períodos en la serie de datos
    const idxT = seriesData.findIndex(d => d.periodo === momentoCalculatorio);
    const idxT_resolved = idxT !== -1 ? idxT : seriesData.length - 1;

    // dT0 es el mes base del ajuste polinómico (T_base)
    const idxBase = seriesData.findIndex(d => d.periodo === ajustePolinomicoDesde);
    const dT0 = seriesData[idxBase !== -1 ? idxBase : 0];
    const dT = seriesData[idxT_resolved] || seriesData[seriesData.length - 1];

    const baseVal = dT0[currentMod.campoExcel] || 0; // Y_T0: Arancel real en el intercepto inicial

    // T0 es el mes inicial de la recuperación de la pérdida histórica (M_históricos meses hacia atrás)
    const idxT0 = Math.max(0, idxT_resolved - mesesHistorialRecuperar + 1);

    // 2. Amortización Retrospectiva del Déficit (PTP_retrosp,T) - NOMINAL PURA (sin capitalización)
    // Sumamos algebraicamente las brechas unitarias mensuales desde T0 hasta T
    const filteredHistorical = seriesData.slice(idxT0, idxT_resolved + 1);
    let sumDeficitNominal = 0;
    let unitLossAccumulated = 0;
    let PTP_retrosp_T = 0;

    if (mesesHistorialRecuperar > 0) {
      filteredHistorical.forEach(d => {
        const Y_m = d[currentMod.campoExcel] || 0;

        // La polinómica en m se calcula indexando el arancel de inicio T_base (dT0)
        const indCCT_m = d.cct / (dT0.cct || 1);
        const indUSD_m = d.usd / (dT0.usd || 1);
        const indIPC_m = d.ipc / (dT0.ipc || 1);

        const IP_m = (wCCT * indCCT_m) + (wUSD * indUSD_m) + (wIPC * indIPC_m);
        const VP_m = baseVal * IP_m; // costo polinómico teórico en el mes m

        sumDeficitNominal += Math.max(0, VP_m - Y_m); // Suma acumulada de pérdidas (deuda nominal)
      });

      // Masa total acumulada de pérdida histórica a recuperar
      unitLossAccumulated = sumDeficitNominal;
      // Amortización lineal dividida únicamente por las K cuotas del horizonte prospectivo
      PTP_retrosp_T = mesesProyeccion > 0 ? unitLossAccumulated / mesesProyeccion : 0;
    }

    // Costo Polinómico teórico en T (deber ser en Hoy) indexado con base en T_base (dT0)
    const indCCT_T = dT.cct / (dT0.cct || 1);
    const indUSD_T = dT.usd / (dT0.usd || 1);
    const indIPC_T = dT.ipc / (dT0.ipc || 1);

    const IP_T = (wCCT * indCCT_T) + (wUSD * indUSD_T) + (wIPC * indIPC_T);

    // Y_T: Arancel real cobrado en T
    const Y_T = dT[currentMod.campoExcel] || 0;

    // VP_T es el costo polinómico de paridad base.
    const VP_T = baseVal * IP_T;

    // B_T: Valor Base del cálculo (siempre Tarifa Real cobrada actual Y_T)
    const B_T = Y_T;
    const ajustePolinomico = aplicarAjustePolinomico ? VP_T - Y_T : 0;

    // 3. Expansión Prospectiva de Costos (PTP_prosp,T) - NOMINAL PURA (sin actualización)
    let sumVP_future = 0;
    const lastKnownData = seriesData[seriesData.length - 1]; // último mes con datos en JSON

    // Parsear momentoCalculatorio para proyectar a futuro
    const [yearStr, monthStr] = momentoCalculatorio.split('-');
    const baseYear = parseInt(yearStr, 10);
    const baseMonth = parseInt(monthStr, 10) - 1; // 0-indexed para JS Dates

    for (let k = 1; k <= mesesProyeccion; k++) {
      const currentMonthIndex = baseMonth + k;
      const targetYear = baseYear + Math.floor(currentMonthIndex / 12);
      const targetMonth = currentMonthIndex % 12;
      const periodoK = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}`;

      const dataK = seriesData.find(d => d.periodo === periodoK);

      let cctVal_k, usdVal_k, ipcVal_k;

      if (dataK) {
        // Tramo conocido (Escenario híbrido)
        cctVal_k = dataK.cct;
        usdVal_k = dataK.usd;
        ipcVal_k = dataK.ipc;
      } else {
        // Tramo proyectado (a partir del último mes conocido)
        const [lastYearStr, lastMonthStr] = lastKnownData.periodo.split('-');
        const lastYear = parseInt(lastYearStr, 10);
        const lastMonth = parseInt(lastMonthStr, 10) - 1;
        const m = (targetYear * 12 + targetMonth) - (lastYear * 12 + lastMonth);

        cctVal_k = lastKnownData.cct * Math.pow(1 + gCCT / 100, m);
        usdVal_k = lastKnownData.usd * Math.pow(1 + gUSD / 100, m);
        ipcVal_k = lastKnownData.ipc * Math.pow(1 + gIPC / 100, m);
      }

      // Variación relativa de los índices proyectados con respecto al momento calculatorio T (dT)
      const cctIndex_k = cctVal_k / dT.cct;
      const usdIndex_k = usdVal_k / dT.usd;
      const ipcIndex_k = ipcVal_k / dT.ipc;

      // Costo polinómico proyectado en el mes k partiendo del costo de paridad VP_T
      const IP_k = (wCCT * cctIndex_k) + (wUSD * usdIndex_k) + (wIPC * ipcIndex_k);
      const VP_k = VP_T * IP_k;
      sumVP_future += VP_k;
    }

    const PTP_prosp_T = mesesProyeccion > 0 ? sumVP_future / mesesProyeccion : VP_T;

    // 4. Arancel Técnico de Paridad Objetivo Final (PTP_T)
    const PTP_T = Y_T + ajustePolinomico + (PTP_prosp_T - VP_T) + PTP_retrosp_T;

    return {
      VP_T,
      Y_T,
      B_T,
      ajustePolinomico,
      unitLossAccumulated,
      PTP_retrosp_T,
      PTP_prosp_T,
      PTP_T,
      dT0
    };
  }, [
    ajustePolinomicoDesde,
    momentoCalculatorio,
    modalidadDialitica,
    wCCT, wUSD, wIPC,
    mesesHistorialRecuperar,
    gIPC, gUSD, gCCT,
    mesesProyeccion,
    aplicarAjustePolinomico,
    seriesData
  ]);

  // Coordenadas para el gráfico de cascada
  const svgWidth = 500;
  const svgHeight = 280;
  const margin = { top: 40, bottom: 40, left: 65, right: 35 };

  const waterfallBars = useMemo(() => {
    if (!calculations) return [];
    const { Y_T, VP_T, ajustePolinomico, PTP_retrosp_T, PTP_prosp_T, PTP_T } = calculations;

    // Incremento prospectivo es la diferencia entre PTP_prosp_T y el costo polinómico VP_T
    const incrementoProsp = PTP_prosp_T - VP_T;

    const maxVal = PTP_T * 1.05;
    const scaleY = (v) => svgHeight - margin.bottom - (v / maxVal) * (svgHeight - margin.top - margin.bottom);

    // Barra 1: Tarifa Base (Y_T)
    const yBase = scaleY(Y_T);
    const hBase = (svgHeight - margin.bottom) - yBase;

    // Barra 2: Ajuste Polinómico (ajustePolinomico)
    const yAjuste = scaleY(Y_T + ajustePolinomico);
    const hAjuste = yBase - yAjuste;

    // Barra 3: PTP Prosp. (incrementoProsp)
    const yProsp = scaleY(Y_T + ajustePolinomico + incrementoProsp);
    const hProsp = yAjuste - yProsp;

    // Barra 4: PTP Retrosp. (PTP_retrosp_T)
    const yRetro = scaleY(Y_T + ajustePolinomico + incrementoProsp + PTP_retrosp_T);
    const hRetro = yProsp - yRetro;

    // Barra 5: PTP Final (PTP_T)
    const yTotal = scaleY(PTP_T);
    const hTotal = (svgHeight - margin.bottom) - yTotal;

    const w = 52;
    const gap = 35;

    return [
      { label: 'Tarifa Base', x: margin.left, y: yBase, h: hBase, color: '#eab308', val: Y_T, type: 'base', barW: w },
      { label: 'Aj. Polin.', x: margin.left + (w + gap) * 1, y: yAjuste, h: hAjuste, color: '#f97316', val: ajustePolinomico, type: 'add', barW: w },
      { label: 'PTP Prosp.', x: margin.left + (w + gap) * 2, y: yProsp, h: hProsp, color: '#10b981', val: incrementoProsp, type: 'add', barW: w },
      { label: 'PTP Retrosp.', x: margin.left + (w + gap) * 3, y: yRetro, h: hRetro, color: '#06b6d4', val: PTP_retrosp_T, type: 'add', barW: w },
      { label: 'PTP Final', x: margin.left + (w + gap) * 4, y: yTotal, h: hTotal, color: '#6366f1', val: PTP_T, type: 'base', barW: w }
    ];
  }, [calculations]);

  if (!calculations) return null;

  return (
    <div className="space-y-6">
      {/* NARRATIVA DE CIERRE */}
      {/* ------------------------------------------- INI: p3_p5_a1 --------------------------------------------- */}
      {hasPermission('p3_p5_a1') && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-[24px] font-black text-white">
            La Síntesis Unificada de la Paridad Arancelaria
          </h2>

          <div className="text-[18px] border-l-4 border-teal-500 pl-4 italic text-slate-300 leading-relaxed space-y-2">
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
      )}
      {/* ------------------------------------------- FIN: p3_p5_a1 --------------------------------------------- */}

      {/* DASHBOARD INTEGRADO DE VINCULACIÓN */}
      {/* ------------------------------------------- INI: p3_p5_a2 --------------------------------------------- */}
      {hasPermission('p3_p5_a2') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* ESTRUCTURA POLINÓMICA */}
          <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md space-y-3">
            <span className="text-[14px] font-black uppercase tracking-wider text-yellow-500 block border-b border-slate-800 pb-1.5">
              ⚙️ Estructura de Paridad Polinómica
            </span>
            <p className="text-[16px] text-slate-300 leading-relaxed">
              Establece los pesos técnicos relativos de la actividad (CCT, USD, IPC), definiendo la velocidad objetiva de actualización arancelaria.
            </p>
            <div className="bg-slate-950/60 text-[18px] p-3 rounded-xl border border-slate-850 text-center overflow-x-auto">
              <MathJaxFormula formula="I^P_t = w_{CCT}\cdot I^{CCT}_t + w_{USD}\cdot I^{USD}_t + w_{IPC}\cdot I^{IPC}_t" />
            </div>
          </div>

          {/* MODELO PROSPECTIVO */}
          <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md space-y-3">
            <span className="text-[14px] font-black uppercase tracking-wider text-emerald-400 block border-b border-slate-800 pb-1.5">
              🔮 Proyección Prospectiva
            </span>
            <p className="text-[16px] text-slate-300 leading-relaxed">
              Simula las pérdidas por el cobro diferido (Time Lag) y la inflación esperada a futuro, estableciendo la prima de cobertura prospectiva.
            </p>
            <div className="bg-slate-950/60 text-[18px] p-3 rounded-xl border border-slate-850 text-center">
              <MathJaxFormula formula="PTP_{\text{prosp}} = \frac{1}{K}\cdot \sum_{k=1}^K V^P_{T+k}" />
            </div>
          </div>

          {/* MODELO RETROSPECTIVO */}
          <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md space-y-3">
            <span className="text-[14px] font-black uppercase tracking-wider text-cyan-400 block border-b border-slate-800 pb-1.5">
              🔍 Análisis Retrospectivo
            </span>
            <p className="text-[16px] text-slate-300 leading-relaxed">
              Identifica el daño acumulado histórico. Utiliza la paridad polinómica comparada con los aranceles reales pagados para medir el desfasaje monetario total.
            </p>
            <div className="bg-slate-950/60 text-[18px] p-3 rounded-xl border border-slate-850 text-center overflow-x-auto">
              <MathJaxFormula formula="\text{IF} = \sum_{t \in \text{historia}}\cdot (V^P_t - Y_t)" />
            </div>
          </div>

        </div>
      )}
      {/* ------------------------------------------- FIN: p3_p5_a2 --------------------------------------------- */}

      {/* PROPUESTA DE ARANCEL DE EQUILIBRIO UNIFICADO */}
      {/* ------------------------------------------- INI: p3_p5_a3 --------------------------------------------- */}
      {hasPermission('p3_p5_a3') && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border bg-slate-900/40 border-slate-855 shadow-md space-y-4">
            <span className="text-[14px] font-black uppercase tracking-wider text-teal-400 block border-b border-slate-855 pb-1.5">
              💡 Ecuación de Vinculación y Recomposición Arancelaria (Arancel Objetivo)
            </span>
            <p className="text-[16px] text-slate-300 leading-relaxed">
              Para restablecer el equilibrio económico-financiero del prestador, definimos el <strong>Precio Técnico de Paridad (<MathJaxFormula formula="PTP_T" />)</strong>.
              Este valor unifica el costo polinómico proyectado con la amortización lineal del déficit histórico acumulado:
            </p>

            <div className="bg-slate-950/80 text-[18px] p-4 rounded-xl border border-slate-800 text-center my-3 overflow-x-auto">
              <MathJaxFormula formula="PTP_T = Y_{T} + (V^P_T - Y_T) + PTP_{\text{prosp}, T} + PTP_{\text{retrosp}, T}" />
              <MathJaxFormula className="block text-left text-slate-300 font-mono mt-3 overflow-x-auto text-[14px]"
                formula={`\\begin{aligned} PTP_T = &\\text{Valor Prestacional (al momento calculatorio)} \\\\ 
                  & + \\text{Ajuste Polinómico} \\\\ 
                  & + \\text{Ajuste Prospectivo (sobre expectativas macroeconómicas futuras)} \\\\ 
                  & + \\text{Amortización Retrospectiva (de pérdidas sufridas)} \\end{aligned}`} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-400 leading-relaxed">
              <div className="p-3 bg-slate-950/30 text-[14px] rounded-xl border border-slate-855">
                <strong className="text-emerald-400 block mb-1">Expansión Prospectiva de Costos (<MathJaxFormula className="inline-block text-[16px]" formula="PTP_{\text{prosp}, T}" />)</strong>
                Calcula el impacto futuro esperado ante las expectativas sobre el tipo de cambio, inflación y salarios, para el horizonte de prospección, aplicando la elasticidad con la que responde la financiadora a estos cambios.
              </div>
              <div className="p-3 bg-slate-950/30 text-[14px] rounded-xl border border-slate-855">
                <strong className="text-cyan-400 block mb-1">Amortización Retrospectiva del Déficit (<MathJaxFormula className="inline-block text-[16px]" formula="PTP_{\text{retrosp}, T}" />)</strong>
                Recompone linealmente la pérdida histórica acumulada sufrida por la brecha arancelaria <b>SIN</b> aplicar sobrecargos de capitalización compuesta.
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ------------------------------------------- FIN: p3_p5_a3 --------------------------------------------- */}

      {/* SIMULADOR ACTIVO DE RECOMPOSICIÓN */}
      {/* ------------------------------------------- INI: p3_p5_a4 --------------------------------------------- */}
      {hasPermission('p3_p5_a4') && (
        <div className="p-6 rounded-3xl border shadow-2xl transition-all space-y-6 bg-slate-950 border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 border-slate-800 gap-2">
            <div>
              <h4 className="text-base sm:text-lg font-black uppercase tracking-wider text-teal-400">
                ⚡ 5. Simulador de Recomposición Arancelaria
              </h4>
              <p className="text-[14px] text-slate-500 mt-0.5">
                Establece las pautas de amortización y las expectativas de los shocks para calcular el valor objetivo técnico.
              </p>
            </div>
            {/* ------------------------------------------- INI: p3_p5_a4_b1 (Botón) --------------------------------------------- */}
            {hasPermission('p3_p5_a4_b1') && (
              <button
                onClick={() => setMostrarVariables(!mostrarVariables)}
                className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-900 text-white hover:bg-slate-800 border border-slate-700/60 transition-all shadow-sm cursor-pointer"
              >
                {mostrarVariables ? 'Ocultar Variables' : 'Administrar Variables'}
              </button>
            )}
            {/* ------------------------------------------- FIN: p3_p5_a4_b1 (Botón) --------------------------------------------- */}
          </div>

          {/* ------------------------------------------- INI: p3_p5_a4_b1 (Controles) --------------------------------------------- */}
          {hasPermission('p3_p5_a4_b1') && (
            <>
              {/* RESUMEN DE VARIABLES SELECCIONADAS (CUANDO ESTÁN OCULTAS) */}
              {!mostrarVariables && (
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400 bg-slate-900/15 border border-slate-900/40 rounded-xl p-3 px-4 font-mono">
                  <div>
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mr-1.5">Modalidad Prestacional:</span>
                    <span className="text-teal-400 font-black">{opcionesModalidades.find(m => m.id === modalidadDialitica)?.nombre || modalidadDialitica}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mr-1.5">Ajuste Polinómico:</span>
                    <span className={aplicarAjustePolinomico ? "text-teal-400 font-black" : "text-rose-400 font-black"}>{aplicarAjustePolinomico ? "SÍ" : "NO"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mr-1.5">Ajuste Polinómico Desde:</span>
                    <span className="text-yellow-500 font-black">{opcionesDesde.find(p => p.periodo === ajustePolinomicoDesde)?.label || ajustePolinomicoDesde}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mr-1.5">Momento Calculatorio:</span>
                    <span className="text-yellow-500 font-black">{opcionesHasta.find(p => p.periodo === momentoCalculatorio)?.label || momentoCalculatorio}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mr-1.5">Amortización Histórica:</span>
                    <span className="text-cyan-400 font-black">{mesesHistorialRecuperar} meses</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mr-1.5">Horizonte de Prospección:</span>
                    <span className="text-emerald-400 font-black">{mesesProyeccion} meses</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mr-1.5">Expectativas:</span>
                    <span className="text-slate-205">g<sub>IPC</sub>: <strong className="text-yellow-500">{gIPC} % mensual</strong>, g<sub>USD</sub>: <strong className="text-cyan-400">{gUSD} % mensual</strong>, g<sub>CCT</sub>: <strong className="text-emerald-400">{gCCT} % mensual</strong></span>
                  </div>
                </div>
              )}

              {/* CONTROLES / VARIABLES DEL SIMULADOR */}
              {mostrarVariables && (
                <div className="space-y-4">
                  {/* CONTROLES / SLIDERS GENERALES */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Historial a recuperar */}
                    <div className="p-4 rounded-2xl border bg-slate-900/40 border-slate-800/80 shadow-md space-y-2 md:col-span-5 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-300">
                          <span>Plazo de Amortización Histórica</span>
                          <span className="text-cyan-400 font-mono font-black">{mesesHistorialRecuperar} meses</span>
                        </div>
                        <input
                          type="range" min="0" max={getMesesDiferencia(ajustePolinomicoDesde, momentoCalculatorio)} step="1" value={mesesHistorialRecuperar}
                          onChange={(e) => setMesesHistorialRecuperar(Number(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 mt-2"
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 block leading-tight font-sans">
                        Meses del historial pasado de pérdidas nominales que se pretenden recuperar (0 = no amortizar).
                      </span>
                    </div>

                    {/* Meses de prospección */}
                    <div className="p-4 rounded-2xl border bg-slate-900/40 border-slate-800/80 shadow-md space-y-2 md:col-span-5 flex flex-col justify-between">
                      <div>
                        <label className="text-xs uppercase font-bold text-slate-300 font-sans">Horizonte de Prospección (Meses)</label>
                        <div className="grid grid-cols-5 gap-2 mt-1">
                          {[0, 3, 6, 9, 12].map(m => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setMesesProyeccion(m)}
                              className={`p-2 rounded-xl text-xs font-bold border transition-all ${mesesProyeccion === m ? 'bg-teal-950 border-teal-500 text-teal-400 font-mono' : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-700 font-mono'}`}
                            >
                              {m}m
                            </button>
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 block leading-tight font-sans">
                        Horizonte futuro y divisor dinámico del recupero del déficit histórico.
                      </span>
                    </div>

                    {/* Ajuste Polinómico Sí/No */}
                    <div className="p-4 rounded-2xl border bg-slate-900/40 border-slate-800/80 shadow-md space-y-2 md:col-span-2 flex flex-col justify-between">
                      <label className="text-xs uppercase font-bold text-slate-300 font-sans block leading-tight">Ajuste Polinómico</label>
                      <div className="flex flex-col gap-1.5 mt-1 h-full justify-center">
                        <button
                          type="button"
                          onClick={() => setAplicarAjustePolinomico(true)}
                          className={`p-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${aplicarAjustePolinomico ? 'bg-teal-950 border-teal-500 text-teal-400' : 'bg-slate-950 border-slate-850 text-slate-500 hover:border-slate-800'}`}
                        >
                          SÍ
                        </button>
                        <button
                          type="button"
                          onClick={() => setAplicarAjustePolinomico(false)}
                          className={`p-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${!aplicarAjustePolinomico ? 'bg-rose-950/40 border-rose-900 text-rose-400' : 'bg-slate-950 border-slate-850 text-slate-500 hover:border-slate-800'}`}
                        >
                          NO
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* CONTROLES EXPANDIDOS (MODALIDAD, EXPECTATIVAS, MOMENTO CALCULATORIO) */}
                  <div className="p-4 rounded-2xl border bg-slate-900/20 border-slate-800/60 shadow-md grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    {/* 1. Modalidad Prestacional */}
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-xs uppercase font-bold text-slate-400">Modalidad Prestacional</label>
                      <select
                        value={modalidadDialitica}
                        onChange={(e) => setModalidadDialitica(e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-xs rounded-xl p-2.5 text-white cursor-pointer w-full"
                      >
                        {opcionesModalidades.map(m => (
                          <option key={m.id} value={m.id}>{m.nombre}</option>
                        ))}
                      </select>
                    </div>

                    {/* 2. Período Ajuste Desde (T0) */}
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-xs uppercase font-bold text-slate-400 font-sans">Ajuste Polinómico Desde (T<sub>base</sub>)</label>
                      <select
                        value={ajustePolinomicoDesde}
                        onChange={(e) => setAjustePolinomicoDesde(e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-xs rounded-xl p-2.5 text-white cursor-pointer w-full"
                      >
                        {opcionesDesde.map(p => (
                          <option key={p.periodo} value={p.periodo}>{p.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* 3. Momento Calculatorio (T) */}
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-xs uppercase font-bold text-slate-400 font-sans">Momento Calculatorio (T)</label>
                      <select
                        value={momentoCalculatorio}
                        onChange={(e) => setMomentoCalculatorio(e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-xs rounded-xl p-2.5 text-white cursor-pointer w-full"
                      >
                        {opcionesHasta.map(p => (
                          <option key={p.periodo} value={p.periodo}>{p.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* 4. Expectativa Inflación */}
                    <div className="flex flex-col space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-400">
                        <span>Expectativa Inflación (g<sub>IPC</sub>)</span>
                        <span className="text-yellow-500 font-mono font-black">{gIPC}% / MES</span>
                      </div>
                      <input
                        type="range" min="0" max="30" step="0.5" value={gIPC}
                        onChange={(e) => setGIPC(Number(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-500 mt-2"
                      />
                    </div>

                    {/* 5. Expectativa Dólar */}
                    <div className="flex flex-col space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-400">
                        <span>Expectativa Dólar (g<sub>USD</sub>)</span>
                        <span className="text-cyan-400 font-mono font-black">{gUSD}% / MES</span>
                      </div>
                      <input
                        type="range" min="0" max="30" step="0.5" value={gUSD}
                        onChange={(e) => setGUSD(Number(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 mt-2"
                      />
                    </div>

                    {/* 6. Expectativa Paritarias */}
                    <div className="flex flex-col space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-400">
                        <span>Expectativa Paritarias (g<sub>CCT</sub>)</span>
                        <span className="text-emerald-400 font-mono font-black">{gCCT}% / MES</span>
                      </div>
                      <input
                        type="range" min="0" max="30" step="0.5" value={gCCT}
                        onChange={(e) => setGCCT(Number(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-2"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          {/* ------------------------------------------- FIN: p3_p5_a4_b1 (Controles) --------------------------------------------- */}

          {/* PRESENTACIÓN GRÁFICA Y DE IMPORTES */}
          {/* ------------------------------------------- INI: p3_p5_a4_b2 --------------------------------------------- */}
          {hasPermission('p3_p5_a4_b2') && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* COLUMNA METRICAS */}
              <div className="lg:col-span-5 space-y-4">
                <span className="text-[14px] font-black uppercase tracking-wider text-slate-400 block border-b border-slate-850 pb-1.5">
                  📋 Síntesis de Valores y Paridad Unitarios
                </span>

                <div className="grid grid-cols-2 gap-3 text-[16px] font-mono">
                  <div className="p-3 bg-slate-900/30 border border-slate-800 rounded-2xl flex flex-col justify-between">
                    <span className="text-[14px] text-slate-500 block text-wrap font-sans">Cobrado Actual (Y<sub>T</sub>):</span>
                    <span className="text-slate-350 font-extrabold text-[14px]">${Math.round(calculations.Y_T).toLocaleString('es-AR')}</span>
                  </div>
                  <div className="p-3 bg-slate-900/30 border border-slate-800 rounded-2xl flex flex-col justify-between">
                    <span className="text-[14px] text-slate-500 block text-wrap font-sans">Ajuste Polinómico:</span>
                    <span className="text-orange-400 font-extrabold text-[14px]">+${Math.max(0, Math.round(calculations.ajustePolinomico)).toLocaleString('es-AR')}</span>
                  </div>
                  <div className="p-3 bg-slate-900/30 border border-slate-800 rounded-2xl flex flex-col justify-between">
                    <span className="text-[14px] text-slate-500 block text-wrap font-sans">Expansión (PTP<sub>prosp</sub>):</span>
                    <span className="text-emerald-400 font-extrabold text-[14px] font-bold text-wrap font-bold">+${Math.max(0, Math.round(calculations.PTP_prosp_T - calculations.VP_T)).toLocaleString('es-AR')}</span>
                  </div>
                  <div className="p-3 bg-slate-900/30 border border-slate-800 rounded-2xl flex flex-col justify-between">
                    <span className="text-[14px] text-slate-500 block text-wrap font-sans">Amortización (PTP<sub>retrosp</sub>):</span>
                    <span className="text-cyan-400 font-extrabold text-[14px] font-bold text-wrap font-bold">+${Math.round(calculations.PTP_retrosp_T).toLocaleString('es-AR')}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-2.5">
                  <div className="flex justify-between items-center text-[14px] font-bold text-slate-400 font-sans">
                    <span>Costo Polinómico de Paridad (V<sup>P</sup><sub>T</sub>):</span>
                    <span className="text-yellow-500 font-mono">${Math.round(calculations.VP_T).toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between items-center text-[14px] font-bold text-slate-400 font-sans">
                    <span>Pérdida Total Acumulada Histórica ({currentMod.tipoBrecha}):</span>
                    <span className="text-red-400 font-mono">${Math.round(calculations.unitLossAccumulated).toLocaleString('es-AR')}</span>
                  </div>
                </div>

                {/* ARANCEL OBJETIVO DESTACADO */}
                <div className="p-5 bg-gradient-to-r from-teal-950/30 to-indigo-950/30 border border-teal-500/30 rounded-3xl text-center space-y-1.5 shadow-xl">
                  <span className="text-[18px] text-teal-400 uppercase font-black tracking-wider block">
                    🚀 Precio Técnico de Paridad Unificado (PTP)
                  </span>
                  <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
                    ${Math.round(calculations.PTP_T).toLocaleString('es-AR')}{' '}
                    <span className="text-xs font-normal text-slate-400 font-sans">ARS / {currentMod.tipoBrecha}</span>
                  </div>
                  <p className="text-[14px] text-slate-500 leading-snug font-sans">
                    Arancel unitario normalizado a valores de Hoy para neutralizar variaciones futuras y recomponer pérdidas pasadas desde {calculations.dT0?.label || periodoDesde}.
                  </p>
                </div>
              </div>

              {/* COLUMNA GRÁFICO CASCADA */}
              <div className="lg:col-span-7 flex flex-col justify-between p-4 rounded-2xl border bg-slate-900/20 border-slate-800 shadow-md">
                <div>
                  <span className="text-[18px] font-black uppercase tracking-wider text-teal-400 block mb-1">
                    📊 Composición del Precio Técnico de Paridad (PTP)
                  </span>
                  <p className="text-[14px] text-slate-500">
                    Estructura en cascada desde la tarifa/costo base hasta el valor final de recomposición.
                  </p>
                </div>

                <div className="w-full flex justify-center mt-3 mb-auto overflow-x-auto py-1">
                  <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full max-w-[98%] h-auto bg-slate-950/60 rounded-xl border border-slate-900/60">
                    {/* Y Gridlines and Ticks */}
                    {[0, 0.25, 0.5, 0.75, 1.0].map((pct, idx) => {
                      const val = calculations.PTP_T * pct;
                      const maxVal = calculations.PTP_T * 1.05;
                      const y = svgHeight - margin.bottom - (val / maxVal) * (svgHeight - margin.top - margin.bottom);
                      return (
                        <g key={idx}>
                          <line x1={margin.left} y1={y} x2={svgWidth - margin.right} y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                          <text x={margin.left - 6} y={y + 3} fill="#475569" fontSize="16" fontFamily="monospace" textAnchor="end">
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
                          x1={prevBar.x + prevBar.barW}
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
                        <rect x={b.x} y={b.y} width={b.barW} height={b.h} fill={b.color} rx="3" opacity="0.8" />
                        <text
                          x={b.x + b.barW / 2}
                          y={b.y - 6}
                          fill="#f8fafc"
                          fontSize="13"
                          fontFamily="monospace"
                          fontWeight="black"
                          textAnchor="middle"
                        >
                          ${Math.round(b.val).toLocaleString('es-AR')}
                        </text>
                        <text x={b.x + b.barW / 2} y={svgHeight - margin.bottom + 15} fill="#94a3b8" fontSize="11" fontWeight="bold" textAnchor="middle">
                          {b.label}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>

                {/* LEYENDAS DINÁMICAS DE AJUSTES EN CERO / ESTABILIDAD */}
                {(mesesHistorialRecuperar === 0 || mesesProyeccion === 0 || (gIPC === 0 && gUSD === 0 && gCCT === 0)) && (
                  <div className="mt-3 p-3 bg-slate-950/80 border border-slate-900 rounded-xl text-xs space-y-1.5 font-sans leading-relaxed">
                    {mesesHistorialRecuperar === 0 && (
                      <p className="text-cyan-400">
                        ℹ️ <b>Plazo retrospectivo en 0 meses:</b> Se ha configurado la simulación sin trasladar pérdidas nominales históricas del pasado al precio objetivo.
                      </p>
                    )}
                    {(mesesProyeccion === 0 || (gIPC === 0 && gUSD === 0 && gCCT === 0)) && (
                      <p className="text-emerald-400">
                        ℹ️ <b>Escenario de Estabilidad:</b> Se asume un escenario futuro de ESTABILIDAD PERFECTA (no se esperan variaciones de IPC, CCT ni USD).
                      </p>
                    )}
                  </div>
                )}
              </div>

            </div>
          )}
          {/* ------------------------------------------- FIN: p3_p5_a4_b2 --------------------------------------------- */}

          {/* SECCIÓN ECUACIÓN EXPLICATIVA */}
          <div className="flex flex-col space-y-4">
            {/* ------------------------------------------- INI: p3_p5_a4_b3 (Botón) --------------------------------------------- */}
            {hasPermission('p3_p5_a4_b3') && (
              <div className="flex justify-center">
                <button
                  onClick={() => setMostrarMath(!mostrarMath)}
                  className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-900 border border-slate-700 text-teal-400 hover:bg-slate-800 transition cursor-pointer"
                >
                  {mostrarMath ? '🙈 Ocultar Deducción de Ecuaciones' : '🎓 Mostrar Planteo y Ecuación Final del Ajuste'}
                </button>
              </div>
            )}
            {/* ------------------------------------------- FIN: p3_p5_a4_b3 (Botón) --------------------------------------------- */}

            {/* ------------------------------------------- INI: p3_p5_a4_b3 (Panel) --------------------------------------------- */}
            {hasPermission('p3_p5_a4_b3') && mostrarMath && (
              <div className="p-5 rounded-2xl border bg-slate-950/60 border-slate-800 space-y-5 text-[18px] leading-relaxed text-slate-355">
                <h4 className="text-teal-400 font-bold uppercase tracking-wide border-b border-slate-800 pb-2 font-sans text-sm">
                  📐 Deducción Matemática Completa
                </h4>

                <div className="space-y-4 font-sans text-slate-300">
                  <p className="text-slate-300">
                    El Precio Técnico de Paridad "Hoy" (<MathJaxFormula formula="PTP_T" />) se define formalmente como la suma de la <strong>Expansión Prospectiva de Costos</strong> (<MathJaxFormula formula="PTP_{\text{prosp}, T}" />) y la <strong>Amortización Retrospectiva del Déficit</strong> (<MathJaxFormula formula="PTP_{\text{retrosp}, T}" />):
                  </p>

                  <div className="bg-slate-900/60 p-4 rounded-xl space-y-3 flex flex-col items-center">
                    <div className="py-1.5 text-sm md:text-[18px] text-slate-200">
                      <MathJaxFormula formula="PTP_T = Y_{T} + (V^P_T - Y_T) + PTP_{\text{prosp}, T} + PTP_{\text{retrosp}, T}" />
                    </div>
                  </div>

                  <h5 className="text-slate-200 font-bold mt-4 font-sans text-[18px]">1. Expansión Prospectiva de Costos (<MathJaxFormula formula="PTP_{\text{prosp}, T}" />)</h5>
                  <p>
                    Mide el promedio de los costos polinómicos proyectados durante el horizonte de prospección futura de <MathJaxFormula formula="K" /> meses, partiendo de la base de cálculo <MathJaxFormula formula="B_T" /> seleccionada (el arancel real cobrado <MathJaxFormula formula="Y_T" /> o el costo teórico polinómico de paridad <MathJaxFormula formula="V^P_T" />):
                  </p>
                  <div className="bg-slate-900/60 p-4 rounded-xl space-y-3 flex flex-col items-center overflow-x-auto">
                    <div className="py-1.5 text-xs md:text-[18px] text-slate-200">
                      <MathJaxFormula formula={"PTP_{\\text{prosp}, T} = \\frac{1}{K} \\sum_{k=1}^K V^P_{T+k}"} />
                    </div>
                    <div className="py-1.5 text-xs md:text-[18px] text-slate-200">
                      <MathJaxFormula formula={"V^P_{T+k} = B_T \\cdot \\left[ w_{\\text{CCT}} \\cdot (1 + g_{\\text{CCT}})^k + w_{\\text{USD}} \\cdot (1 + g_{\\text{USD}})^k + w_{\\text{IPC}} \\cdot (1 + g_{\\text{IPC}})^k \\right]"} />
                    </div>
                  </div>
                  <p className="text-[14px] text-slate-400 italic pl-2 border-l border-slate-700">
                    Donde <MathJaxFormula className="inline-block text-[16px]" formula="w_{\text{CCT}}, w_{\text{USD}}, w_{\text{IPC}}" /> son las participaciones de costos (paritarias CCT, cotización de dólar oficial e inflación IPC) y <MathJaxFormula className="inline-block text-[16px]" formula="g_{\text{CCT}}, g_{\text{USD}}, g_{\text{IPC}}" /> son las variaciones porcentuales mensuales esperadas para cada una de las variables macroeconómicas exógenas.
                  </p>

                  <h5 className="text-slate-200 font-bold mt-4 font-sans text-[18px]">2. Amortización Retrospectiva del Déficit (<MathJaxFormula formula="PTP_{\text{retrosp}, T}" />)</h5>
                  <p>
                    Consiste en la acumulación nominal pura de las pérdidas históricas unitarias sufridas debido al rezago y la brecha arancelaria de los últimos <MathJaxFormula formula="M_{\text{historicos}}" /> meses del pasado, amortizadas de forma lineal dividiendo dinámicamente por los <MathJaxFormula formula="K" /> meses del horizonte prospectivo:
                  </p>
                  <div className="bg-slate-900/60 p-4 rounded-xl space-y-3 flex flex-col items-center overflow-x-auto">
                    <div className="py-1.5 text-xs md:text-[24px] text-slate-200">
                      <MathJaxFormula formula={"PTP_{\\text{retrosp}, T} = \\frac{\\sum_{m \\in \\text{historia}} \\max(0, V^P_m - Y_m)}{K}"} />
                    </div>
                  </div>
                  <p className="text-[14px] text-slate-400 italic pl-2 border-l border-slate-700">
                    Donde <MathJaxFormula className="inline-block text-[14px]" formula="V^P_m - Y_m" /> representa la brecha deficitaria nominal en cada mes de la historia.
                  </p>

                  <h5 className="text-slate-200 font-bold mt-4 text-[18px] font-sans">3. Ecuación Desarrollada Completa del Ajuste</h5>
                  <div className="bg-slate-900/60 p-4 rounded-xl flex flex-col items-center overflow-x-auto">
                    <div className="py-1.5 text-xs md:text-[22px] text-slate-200">
                      <MathJaxFormula formula={"PTP_T = Y_{T} + (V^P_T - Y_T) + \\left( \\frac{\\sum_{k=1}^K B_T \\cdot \\left[ w_{\\text{CCT}} \\cdot (1 + g_{\\text{CCT}})^k + w_{\\text{USD}} \\cdot (1 + g_{\\text{USD}})^k + w_{\\text{IPC}} \\cdot (1 + g_{\\text{IPC}})^k \\right]}{K} \\right) + \\left( \\frac{\\sum_{m \\in \\text{historia}} \\max(0, V^P_m - Y_m)}{K} \\right)"} />
                    </div>
                    <div className="text-teal-400 font-bold py-1 text-center font-mono mt-2 text-xs md:text-[18px]">
                      <MathJaxFormula
                        formula={`\\text{Cálculo: } PTP_T = Y_T (\\$${fmtLatex(Math.round(calculations.Y_T), 0)}) + (V^P_T - Y_T) (\\$${fmtLatex(Math.round(calculations.ajustePolinomico), 0)}) + PTP_{\\text{prosp}} (\\$${fmtLatex(Math.max(0, Math.round(calculations.PTP_prosp_T - calculations.VP_T)), 0)}) + PTP_{\\text{retrosp}} (\\$${fmtLatex(Math.round(calculations.PTP_retrosp_T), 0)}) = \\$${fmtLatex(Math.round(calculations.PTP_T), 0)}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* ------------------------------------------- FIN: p3_p5_a4_b3 (Panel) --------------------------------------------- */}
          </div>

        </div>
      )}
      {/* ------------------------------------------- FIN: p3_p5_a4 --------------------------------------------- */}
    </div>
  );
}
