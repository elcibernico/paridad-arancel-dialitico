import React, { useState, useMemo } from 'react';
import { MathJaxFormula } from '../MathJaxFormula';
import { fmtAR } from '../../utils/format';
import { useGlobalParams } from '../../context/GlobalContext';
import { useAuth } from '../../context/AuthContext';

export default function Punto9() {
  const { hasPermission } = useAuth();

  const canShowBrecha = hasPermission('p3_p3_a2');
  const canShowTimeLag = hasPermission('p3_p3_a3');

  const defaultTab = useMemo(() => {
    if (canShowBrecha) return 'brecha';
    if (canShowTimeLag) return 'timelag';
    return null;
  }, [canShowBrecha, canShowTimeLag]);

  const [activeTabState, setActiveTabState] = useState(null);
  const activeTab = activeTabState || defaultTab;

  const opcionesModalidades = [
    { id: 'HD', nombre: 'Hemodiálisis Convencional (HD)', campoExcel: 'valorSesionHD' },
    { id: 'DP', nombre: 'Diálisis Peritoneal (DP)', campoExcel: 'valorModuloDP' },
    { id: 'HDF', nombre: 'Hemodiafiltración en Línea (HDF)', campoExcel: 'valorSesionHDF' }
  ];

  const {
    seriesData,
    modalidadDialitica: modalidad, setModalidadDialitica: setModalidad,
    periodoHasta: tHasta, setPeriodoHasta: setTHasta,
    periodoDesde: tDesde, setPeriodoDesde: setTDesde,
    padronPacientes: pacientes, setPadronPacientes: setPacientes,
    sesionesMensuales: sesiones, setSesionesMensuales: setSesiones,
    expectativas, setExpectativas,
    plazoPago: timeLagDays, setPlazoPago: setTimeLagDays,
    tasaDescuento: tna, setTasaDescuento: setTna,
    aplicarCalidad
  } = useGlobalParams();

  const gIPC = expectativas.ipc;
  const gUSD = expectativas.usd;
  const gCCT = expectativas.cct;

  const setGIPC = (v) => setExpectativas({ ...expectativas, ipc: v });
  const setGUSD = (v) => setExpectativas({ ...expectativas, usd: v });
  const setGCCT = (v) => setExpectativas({ ...expectativas, cct: v });

  const [mostrarMathBrecha, setMostrarMathBrecha] = useState(false);
  const [mostrarMathTimeLag, setMostrarMathTimeLag] = useState(false);
  const [mostrarVariablesBrecha, setMostrarVariablesBrecha] = useState(false);
  const [mostrarVariablesTimeLag, setMostrarVariablesTimeLag] = useState(false);

  const periodosHastaFiltrados = seriesData.filter(p => p.periodo);

  const handleTHastaChange = (e) => {
    const newHasta = e.target.value;
    setTHasta(newHasta);
    const indexHasta = seriesData.findIndex(d => d.periodo === newHasta);
    const indexDesde = Math.max(0, indexHasta - 11);
    setTDesde(seriesData[indexDesde].periodo);
  };

  // ----------------------------------------------------
  // COMPUTACIONES DE TAB 1: BRECHA DE IMPACTO FINANCIERO (Punto 13)
  // ----------------------------------------------------
  const calculationsBrecha = useMemo(() => {
    const filtered = seriesData.filter(d => d.periodo >= tDesde && d.periodo <= tHasta);
    if (filtered.length === 0) return null;

    const modObj = opcionesModalidades.find(m => m.id === modalidad) || opcionesModalidades[0];
    const baseRef = seriesData.find(d => d.periodo === tDesde) || seriesData[0];
    const sesionesEfectivas = modalidad === 'DP' ? 1 : sesiones;

    let sumY = 0;
    let sumVP = 0;
    let totalDeficit = 0;
    const mensualDetails = [];

    filtered.forEach(d => {
      const Y_m = d[modObj.campoExcel];
      const indCCT = d.cct / baseRef.cct;
      const indUSD = d.usd / baseRef.usd;
      const indIPC = d.ipc / baseRef.ipc;
      const IP_m = (0.40 * indCCT) + (0.30 * indUSD) + (0.30 * indIPC);

      const VP_m = baseRef[modObj.campoExcel] * IP_m;

      const brecha_m = ((Y_m - VP_m) / VP_m) * 100;
      const deficit_m = (Y_m - VP_m) * sesionesEfectivas * pacientes;

      sumY += Y_m;
      sumVP += VP_m;
      totalDeficit += deficit_m;

      mensualDetails.push({
        periodo: d.periodo,
        label: d.label,
        Y: Y_m,
        VP: VP_m,
        brecha: brecha_m,
        deficit: deficit_m,
        indCCT,
        indUSD,
        indIPC
      });
    });

    const meses = filtered.length;
    const avgY = sumY / meses;
    const avgVP = sumVP / meses;
    const deficitMensualTotal = totalDeficit / meses;
    const deficitMensualPaciente = deficitMensualTotal / pacientes;

    return {
      meses,
      avgY,
      avgVP,
      sumY,
      sumVP,
      brecha: ((avgY - avgVP) / avgVP) * 100,
      deficitMensualPaciente,
      deficitMensualTotal,
      deficitAnualTotal: totalDeficit,
      mensualDetails
    };
  }, [tDesde, tHasta, modalidad, pacientes, sesiones]);

  // ----------------------------------------------------
  // COMPUTACIONES DE TAB 2: TIME LAG (Punto 12)
  // ----------------------------------------------------
  const calculationsTimeLag = useMemo(() => {
    const dataCorte = seriesData.find(d => d.periodo === tHasta);
    if (!dataCorte) return null;

    const modObj = opcionesModalidades.find(m => m.id === modalidad) || opcionesModalidades[0];
    const Y_nominal = dataCorte[modObj.campoExcel];
    const mesesAtraso = timeLagDays / 30;
    const tem = (tna / 100) / 12;

    // Descuento Financiero
    const factorDescuento = Math.pow(1 + tem, mesesAtraso);
    const Y_descontado = Y_nominal / factorDescuento;
    const lossDescuento = Y_nominal - Y_descontado;

    // Descuento por Inflación
    const factorInflacion = Math.pow(1 + gIPC / 100, mesesAtraso);
    const Y_real = Y_descontado / factorInflacion;
    const lossInflacion = Y_descontado - Y_real;

    const lossTotal = Y_nominal - Y_real;
    const lossPct = (lossTotal / Y_nominal) * 100;

    const baseRef = seriesData.find(d => d.periodo === tDesde) || seriesData[0];
    const indCCT = dataCorte.cct / baseRef.cct;
    const indUSD = dataCorte.usd / baseRef.usd;
    const indIPC = dataCorte.ipc / baseRef.ipc;
    const IP = (0.40 * indCCT) + (0.30 * indUSD) + (0.30 * indIPC);

    const VP = baseRef[modObj.campoExcel] * IP;

    return {
      Y_nominal,
      mesesAtraso,
      tem,
      Y_descontado,
      lossDescuento,
      Y_real,
      lossInflacion,
      lossTotal,
      lossPct,
      VP
    };
  }, [tHasta, modalidad, gIPC, timeLagDays, tna, tDesde]);

  // SVG de cascada (waterfall) para Time Lag
  const svgWidth = 460;
  const svgHeight = 220;
  const margin = { top: 30, right: 30, bottom: 40, left: 60 };

  const waterfallBars = useMemo(() => {
    if (!calculationsTimeLag) return [];
    const { Y_nominal, lossDescuento, lossInflacion, Y_real } = calculationsTimeLag;

    const maxVal = Y_nominal;
    const scaleY = (v) => svgHeight - margin.bottom - (v / maxVal) * (svgHeight - margin.top - margin.bottom);

    const yNominal = scaleY(Y_nominal);
    const hNominal = (svgHeight - margin.bottom) - yNominal;

    const yDesc = scaleY(Y_nominal);
    const hDesc = scaleY(Y_nominal - lossDescuento) - yNominal;

    const yInfl = scaleY(Y_nominal - lossDescuento);
    const hInfl = scaleY(Y_nominal - lossDescuento - lossInflacion) - yInfl;

    const yReal = scaleY(Y_real);
    const hReal = (svgHeight - margin.bottom) - yReal;

    const w = 60;
    const gap = 30;

    return [
      { label: 'Nominal', x: margin.left + 20, y: yNominal, h: hNominal, color: '#38bdf8', val: Y_nominal, type: 'base' },
      { label: 'Costo Financiero', x: margin.left + 20 + w + gap, y: yDesc, h: hDesc, color: '#ef4444', val: -lossDescuento, type: 'loss' },
      { label: 'Pérdida Inflación', x: margin.left + 20 + (w + gap) * 2, y: yInfl, h: hInfl, color: '#f97316', val: -lossInflacion, type: 'loss' },
      { label: 'Real Neto', x: margin.left + 20 + (w + gap) * 3, y: yReal, h: hReal, color: '#10b981', val: Y_real, type: 'base' }
    ];
  }, [calculationsTimeLag]);

  return (
    <div className="space-y-6">
      {/* TABS DE SELECCIÓN */}
      <div className="flex border-b border-slate-800">
        {canShowBrecha && (
          <button
            onClick={() => setActiveTabState('brecha')}
            className={`px-6 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${activeTab === 'brecha'
              ? 'border-teal-400 text-teal-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
          >
            🔍 Brecha de Impacto Financiero
          </button>
        )}
        {canShowTimeLag && (
          <button
            onClick={() => setActiveTabState('timelag')}
            className={`px-6 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${activeTab === 'timelag'
              ? 'border-teal-400 text-teal-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
          >
            ⏳ El Espejismo del Pago Nominal (Time Lag)
          </button>
        )}
      </div>

      {activeTab === 'brecha' && (
        <div className="space-y-6">
          {/* NARRATIVA DE ENCUADRE */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <h2 className="text-[24px] font-bold text-teal-400 uppercase tracking-wider mb-2">
              📖 Traduciendo Porcentajes a Dinero Real
            </h2>
            <p className="text-[20px] text-slate-300 leading-relaxed">
              Hasta ahora, los desajustes y desfasajes arancelarios se han expresado en porcentajes de brecha y coeficientes.<br />
              Pero una clínica no paga salarios ni compra insumos con porcentajes: lo hace con dinero.
              Aquí traducimos la <strong>Brecha de Cobertura</strong> a "<i>desfasaje de caja real</i>" del prestador.
              Esto permite dimensionar el riesgo de insolvencia o desabastecimiento de insumos básicos.
            </p>
          </div>

          {/* ------------------------------------------- INI: p3_p3_a1 --------------------------------------------- */}
          {hasPermission('p3_p3_a1') && (
            <>
              {/* CONTROLES / SEGMENTADORES */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Parámetros del escenario</span>
                <button
                  onClick={() => setMostrarVariablesBrecha(!mostrarVariablesBrecha)}
                  className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-teal-600 text-white hover:bg-teal-500 transition-all shadow-sm"
                >
                  {mostrarVariablesBrecha ? 'Ocultar variables' : 'Administrar variables'}
                </button>
              </div>

              {!mostrarVariablesBrecha && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></span>
                    <span className="font-bold text-slate-400">Modalidad:</span>
                    <span className="text-white font-semibold">{(opcionesModalidades.find(m => m.id === modalidad) || opcionesModalidades[0]).nombre}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <div>
                      <span className="text-slate-400">Desde:</span>{' '}
                      <span className="text-teal-400 font-bold font-mono">{seriesData.find(d => d.periodo === tDesde)?.label || tDesde}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Hasta:</span>{' '}
                      <span className="text-teal-400 font-bold font-mono">{seriesData.find(d => d.periodo === tHasta)?.label || tHasta}</span>
                    </div>
                    <div className="border-l border-slate-800 h-3 hidden md:block"></div>
                    <div>
                      <span className="text-slate-400">Padrón:</span>{' '}
                      <span className="text-slate-200 font-mono"><span className="text-teal-400 font-bold">{pacientes}</span> pacientes</span>
                    </div>
                    <div>
                      <span className="text-slate-400">{modalidad === 'DP' ? 'Módulo:' : 'Sesiones:'}</span>{' '}
                      <span className="text-slate-200 font-mono">
                        <span className="text-teal-400 font-bold">{modalidad === 'DP' ? 1 : sesiones}</span>
                        {modalidad === 'DP' ? ' módulo/mes' : '/mes'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {mostrarVariablesBrecha && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md space-y-4">
                    <span className="text-xs font-black uppercase tracking-wider text-teal-400 block border-b border-slate-800 pb-1.5">
                      🎛️ Configuración de Escenario
                    </span>

                    <div className="flex flex-col space-y-1">
                      <label className="text-xs uppercase font-bold text-slate-400">Modalidad Médica:</label>
                      <select
                        value={modalidad}
                        onChange={(e) => setModalidad(e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-xs rounded-xl p-2 text-white cursor-pointer"
                      >
                        {opcionesModalidades.map(m => (
                          <option key={m.id} value={m.id}>{m.nombre}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="text-xs uppercase font-bold text-slate-400">Período de Facturación (Hasta):</label>
                      <select
                        value={tHasta}
                        onChange={handleTHastaChange}
                        className="bg-slate-950 border border-slate-800 text-xs rounded-xl p-2 text-white cursor-pointer"
                      >
                        {periodosHastaFiltrados.map(p => (
                          <option key={p.periodo} value={p.periodo}>{p.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="text-xs uppercase font-bold text-slate-500">Punto de Partida (Desde):</label>
                      <select
                        value={tDesde}
                        onChange={(e) => setTDesde(e.target.value)}
                        className="bg-slate-950/40 border border-slate-900 text-xs rounded-xl p-2 text-slate-400 cursor-pointer"
                      >
                        {seriesData.filter(p => p.periodo <= tHasta).map(p => (
                          <option key={p.periodo} value={p.periodo} className="text-white bg-slate-950">{p.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md space-y-4 md:col-span-2">
                    <span className="text-xs font-black uppercase tracking-wider text-teal-400 block border-b border-slate-800 pb-1.5">
                      👥 Dimensión del Padrón y {modalidad === 'DP' ? 'Frecuencia de Módulos' : 'Frecuencia de Sesiones'}
                    </span>

                    <div className="flex flex-col space-y-6 justify-center h-full">
                      <div className="flex flex-col space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Padrón de Pacientes Activos (N):</span>
                          <span className="text-teal-400 font-mono font-black">{pacientes} Pacientes</span>
                        </div>
                        <input
                          type="range" min="1" max="500" step="1" value={pacientes}
                          onChange={(e) => setPacientes(Number(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500 mt-2"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 font-bold font-mono">
                          <span>Min: 1</span>
                          <span>Max: 500</span>
                        </div>
                      </div>

                      {(() => {
                        const isDP = modalidad === 'DP';
                        const sesionesAMostrar = isDP ? 1 : sesiones;
                        return (
                          <div className={`flex flex-col space-y-1 transition-opacity ${isDP ? 'opacity-40' : ''}`}>
                            <div className="flex justify-between text-xs font-bold">
                              <span>{isDP ? 'Módulo Mensual promedio (S):' : 'Sesiones Mensuales promedio (S):'}</span>
                              <span className="text-teal-400 font-mono font-black">
                                {sesionesAMostrar} {isDP ? 'Módulo/mes (Fijo DP)' : 'Sesiones/mes'}
                              </span>
                            </div>
                            <input
                              type="range" min="1" max="30" step="1"
                              value={sesionesAMostrar}
                              disabled={isDP}
                              onChange={(e) => setSesiones(Number(e.target.value))}
                              className={`w-full h-1 bg-slate-800 rounded-lg appearance-none mt-2 ${isDP ? 'cursor-not-allowed accent-slate-600' : 'cursor-pointer accent-teal-500'}`}
                            />
                            <span className="text-[10px] text-slate-500 font-bold italic mt-1.5 leading-tight">
                              {isDP
                                ? '* Bloqueo de Diálisis Peritoneal: se liquida de manera mensual por módulo (1 por mes).'
                                : '* La frecuencia médica estándar es de 3 sesiones semanales (aprox. 13 al mes).'}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          {/* ------------------------------------------- FIN: p3_p3_a1 --------------------------------------------- */}

          {/* DASHBOARD DE IMPACTO FINANCIERO */}
          {/* ------------------------------------------- INI: p3_p3_a2 --------------------------------------------- */}
          {hasPermission('p3_p3_a2') && calculationsBrecha && (() => {
            const esPerdida = calculationsBrecha.deficitAnualTotal < 0;
            const absDeficitTotal = Math.abs(calculationsBrecha.deficitAnualTotal);
            const absDeficitMensual = Math.abs(calculationsBrecha.deficitMensualTotal);
            const absDeficitPaciente = Math.abs(calculationsBrecha.deficitMensualPaciente);

            const visibleCardsCount = [
                hasPermission('p3_p3_a2_b1'),
                hasPermission('p3_p3_a2_b2'),
                hasPermission('p3_p3_a2_b3'),
                hasPermission('p3_p3_a2_b4')
              ].filter(Boolean).length;

              const gridColsClass = visibleCardsCount === 4
                ? 'md:grid-cols-4'
                : visibleCardsCount === 3
                  ? 'md:grid-cols-3'
                  : visibleCardsCount === 2
                    ? 'md:grid-cols-2'
                    : 'md:grid-cols-1';

              const absDeficitSesion = Math.abs(calculationsBrecha.avgY - calculationsBrecha.avgVP);

              return (
                <div className={`grid grid-cols-1 ${gridColsClass} gap-4`}>
                  {/* ------------------------------------------- INI: p3_p3_a2_b1 (Brecha) --------------------------------------------- */}
                  {hasPermission('p3_p3_a2_b1') && (
                    <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md flex flex-col justify-between items-center text-center">
                      <span className="text-[14px] text-slate-400 uppercase font-black tracking-wider">
                        Brecha de Cobertura Promedio
                      </span>
                      <div className={`text-2xl font-black font-mono my-3 ${esPerdida ? 'text-red-400' : 'text-emerald-400'}`}>
                        {fmtAR(calculationsBrecha.brecha, 2)} %
                      </div>
                      <p className="text-[14px] text-slate-500 leading-relaxed">
                        Diferencia "relativa" promedio en el período entre el arancel promedio abonado (${Math.round(calculationsBrecha.avgY).toLocaleString('es-AR')}) y el promedio valor de paridad polinómico de referencia (${Math.round(calculationsBrecha.avgVP).toLocaleString('es-AR')}).
                      </p>
                    </div>
                  )}
                  {/* ------------------------------------------- FIN: p3_p3_a2_b1 (Brecha) --------------------------------------------- */}

                  {/* ------------------------------------------- INI: p3_p3_a2_b2 (Déficit por sesión) --------------------------------------------- */}
                  {hasPermission('p3_p3_a2_b2') && (() => {
                    const titleCard = modalidad === 'DP'
                      ? (esPerdida ? 'Déficit por módulo' : 'Suficiencia por módulo')
                      : (esPerdida ? 'Déficit por sesión' : 'Suficiencia por sesión');
                    
                    let descCard = '';
                    if (modalidad === 'DP') {
                      descCard = esPerdida
                        ? 'Pérdida promedio por módulo de DP respecto al costo referencial.'
                        : 'Suficiencia promedio por módulo de DP respecto al costo referencial.';
                    } else if (modalidad === 'HDF') {
                      descCard = esPerdida
                        ? 'Pérdida promedio por sesión individual de hemodiálisis HDF respecto al costo referencial.'
                        : 'Suficiencia promedio por sesión individual de hemodiálisis HDF respecto al costo referencial.';
                    } else {
                      descCard = esPerdida
                        ? 'Pérdida promedio por sesión individual de hemodiálisis HD respecto al costo referencial.'
                        : 'Suficiencia promedio por sesión individual de hemodiálisis HD respecto al costo referencial.';
                    }

                    return (
                      <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md flex flex-col justify-between items-center text-center">
                        <span className="text-[14px] text-slate-400 uppercase font-black tracking-wider">
                          {titleCard}
                        </span>
                        <div className={`text-2xl font-black font-mono my-3 ${esPerdida ? 'text-red-400' : 'text-emerald-400'}`}>
                          {esPerdida ? '-' : ''}${Math.round(absDeficitSesion).toLocaleString('es-AR')}
                        </div>
                        <p className="text-[14px] text-slate-500 leading-relaxed">
                          {descCard}
                        </p>
                      </div>
                    );
                  })()}
                  {/* ------------------------------------------- FIN: p3_p3_a2_b2 (Déficit por sesión) --------------------------------------------- */}

                  {/* ------------------------------------------- INI: p3_p3_a2_b3 (Déficit / Superávit Mensual) --------------------------------------------- */}
                  {hasPermission('p3_p3_a2_b3') && (
                    <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md flex flex-col justify-between items-center text-center">
                      <span className="text-[14px] text-slate-400 uppercase font-black tracking-wider">
                        {esPerdida ? 'Déficit Promedio Mensual' : 'Suficiencia Promedio Mensual'}
                      </span>
                      <div className={`text-2xl font-black font-mono my-3 ${esPerdida ? 'text-red-400' : 'text-emerald-400'}`}>
                        {esPerdida ? '-' : ''}${Math.round(absDeficitMensual).toLocaleString('es-AR')}
                      </div>
                      <p className="text-[14px] text-slate-500 leading-relaxed">
                        {esPerdida
                          ? `Pérdida neta promedio al mes para el padrón de ${pacientes} pacientes. ($${Math.round(absDeficitPaciente).toLocaleString('es-AR')} promedio por paciente).`
                          : `Suficiencia neta promedio al mes para el padrón de ${pacientes} pacientes. ($${Math.round(absDeficitPaciente).toLocaleString('es-AR')} promedio por paciente).`
                        }
                      </p>
                    </div>
                  )}
                  {/* ------------------------------------------- FIN: p3_p3_a2_b3 (Déficit / Superávit Mensual) --------------------------------------------- */}

                  {/* ------------------------------------------- INI: p3_p3_a2_b4 (Daño / Suficiencia Acumulada) --------------------------------------------- */}
                  {hasPermission('p3_p3_a2_b4') && (
                    <div className={`p-4 rounded-3xl border-2 shadow-lg flex flex-col justify-between items-center text-center transition-all ${esPerdida
                      ? 'bg-red-950/20 border-red-500/30'
                      : 'bg-emerald-950/20 border-emerald-500/30'
                      }`}>
                      <span className={`text-[14px] uppercase font-black tracking-wider block ${esPerdida ? 'text-red-400' : 'text-emerald-400'}`}>
                        {esPerdida ? '💥 Daño Económico Acumulado' : '✅ Suficiencia Económica Acumulada'}
                      </span>
                      <span className="text-[14px] text-slate-400">(<MathJaxFormula formula="IF_{acumulado}" className="inline-block text[14px]" />)</span>
                      <div className={`text-2xl font-black font-mono my-2 ${esPerdida ? 'text-red-400' : 'text-emerald-400'}`}>
                        {esPerdida ? '-' : ''}${Math.round(absDeficitTotal).toLocaleString('es-AR')}
                      </div>
                      <p className="text-[14px] text-slate-400 leading-relaxed">
                        {esPerdida
                          ? `Pérdida acumulada total para ${pacientes} pacientes durante los ${calculationsBrecha.meses} meses de la ventana temporal definida.`
                          : `Superávit acumulado total para ${pacientes} pacientes durante los ${calculationsBrecha.meses} meses de la ventana temporal definida.`
                        }
                      </p>
                    </div>
                  )}
                  {/* ------------------------------------------- FIN: p3_p3_a2_b4 (Daño / Suficiencia Acumulada) --------------------------------------------- */}
                </div>
              );
          })()}
          {/* ------------------------------------------- FIN: p3_p3_a2 --------------------------------------------- */}
          {/* ------------------------------------------- FIN: p3_p3_a2 --------------------------------------------- */}

          {/* BOTÓN DESARROLLO MATEMÁTICO */}
          {/* ------------------------------------------- INI: p3_p3_a2_b5 --------------------------------------------- */}
          {hasPermission('p3_p3_a2_b5') && calculationsBrecha && (
            <div className="flex flex-col space-y-4">
              <div className="flex justify-center">
                <button
                  onClick={() => setMostrarMathBrecha(!mostrarMathBrecha)}
                  className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-900 border border-slate-700 text-teal-400 hover:bg-slate-800 transition"
                >
                  {mostrarMathBrecha ? '🙈 Ocultar Demostración Matemática' : '🎓 Mostrar Planteo y Desarrollo Matemático'}
                </button>
              </div>

              {mostrarMathBrecha && (
                <div className="p-5 rounded-2xl border bg-slate-950/60 border-slate-800 space-y-4 text-xs leading-relaxed text-slate-300">
                  <h4 className="text-teal-400 font-bold uppercase tracking-wide border-b border-slate-800 pb-2 text-[14px]">
                    🎓 Ecuación de Impacto Financiero e Institucional
                  </h4>

                  <div className="space-y-3 font-mono text-[14px]">
                    <p className="text-slate-300 font-sans">
                      El Impacto Financiero acumulado (<MathJaxFormula className="inline-block text-[14px]" formula="IF_{acumulado}" />) suma las pérdidas netas mensuales basándose en el padrón (<MathJaxFormula className="inline-block text-[14px]" formula="N" />) y el número de prestaciones mensuales (<MathJaxFormula className="inline-block text-[14px]" formula="S" />).<br />
                      Lo definimos como la <i><u>DIFERENCIA</u></i> entre el "<i><u>Promedio de Arancel Nominal Cobrado</u></i>" y el "<u><i>Promedio del Valor de Paridad de Referencia</i></u>", multiplicado por la cantidad de pacientes y {modalidad === 'DP' ? 'módulos realizados' : 'sesiones realizadas'}:
                    </p>
                    {(() => {
                      const isLoss = calculationsBrecha.deficitAnualTotal < 0;
                      const sesionesEfectivas = modalidad === 'DP' ? 1 : sesiones;
                      const labelStatus = isLoss ? '\\text{ (Pérdida)}' : '\\text{ (Suficiencia)}';
                      const valY = Math.round(calculationsBrecha.avgY).toLocaleString('es-AR');
                      const valVP = Math.round(calculationsBrecha.avgVP).toLocaleString('es-AR');
                      const valTotal = Math.round(calculationsBrecha.deficitAnualTotal).toLocaleString('es-AR');
                      const formulaCalc = `\\text{Cálculo: } \\left( ${valY} - ${valVP} \\right) \\cdot ${pacientes} \\cdot \\left( ${sesionesEfectivas} \\cdot ${calculationsBrecha.meses} \\right) = ${valTotal} \\text{ ARS}${labelStatus}`;

                      const mes1 = calculationsBrecha.mensualDetails[0];
                      const mes2 = calculationsBrecha.mensualDetails[1];
                      const mesUlt = calculationsBrecha.mensualDetails[calculationsBrecha.mensualDetails.length - 1];

                      const mes1Y = mes1 ? Math.round(mes1.Y).toLocaleString('es-AR') : '0';
                      const mes2Y = mes2 ? Math.round(mes2.Y).toLocaleString('es-AR') : '0';
                      const mesUltY = mesUlt ? Math.round(mesUlt.Y).toLocaleString('es-AR') : '0';

                      const mes1VP = mes1 ? Math.round(mes1.VP).toLocaleString('es-AR') : '0';
                      const mes2VP = mes2 ? Math.round(mes2.VP).toLocaleString('es-AR') : '0';
                      const mesUltVP = mesUlt ? Math.round(mesUlt.VP).toLocaleString('es-AR') : '0';

                      const mes1Label = mes1 ? mes1.label : '';
                      const mes2Label = mes2 ? mes2.label : '';
                      const mesUltLabel = mesUlt ? mesUlt.label : '';

                      const valSumY = Math.round(calculationsBrecha.sumY).toLocaleString('es-AR');
                      const valSumVP = Math.round(calculationsBrecha.sumVP).toLocaleString('es-AR');

                      const labelDesdeEq = `t=\\text{${mes1Label}}`;
                      const labelHastaEq = `\\text{${mesUltLabel}}`;

                      const modObj = opcionesModalidades.find(m => m.id === modalidad) || opcionesModalidades[0];
                      const baseRef = seriesData.find(d => d.periodo === tDesde) || seriesData[0];
                      const baseRefVal = Math.round(baseRef[modObj.campoExcel]).toLocaleString('es-AR');

                      const mes1Eq = mes1 
                        ? `V^P_1 = \\$${baseRefVal} \\cdot \\left[ 0.40 \\cdot ${mes1.indCCT.toFixed(4)} + 0.30 \\cdot ${mes1.indUSD.toFixed(4)} + 0.30 \\cdot ${mes1.indIPC.toFixed(4)} \\right] = \\$${mes1VP}`
                        : '';
                        
                      const mes2Eq = mes2
                        ? `V^P_2 = \\$${baseRefVal} \\cdot \\left[ 0.40 \\cdot ${mes2.indCCT.toFixed(4)} + 0.30 \\cdot ${mes2.indUSD.toFixed(4)} + 0.30 \\cdot ${mes2.indIPC.toFixed(4)} \\right] = \\$${mes2VP}`
                        : '';

                      const mesUltEq = mesUlt
                        ? `V^P_{${calculationsBrecha.meses}} = \\$${baseRefVal} \\cdot \\left[ 0.40 \\cdot ${mesUlt.indCCT.toFixed(4)} + 0.30 \\cdot ${mesUlt.indUSD.toFixed(4)} + 0.30 \\cdot ${mesUlt.indIPC.toFixed(4)} \\right] = \\$${mesUltVP}`
                        : '';

                      return (
                        <>
                          <div className={`p-4 rounded-xl border ${isLoss ? 'bg-rose-950/20 border-rose-500/30' : 'bg-emerald-950/20 border-emerald-500/30'} flex flex-col items-center space-y-4`}>
                            <span className={`text-[14px] font-black uppercase tracking-wider block ${isLoss ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {isLoss ? '❌ Pérdida/Daño Acumulado Simulado' : '✅ Suficiencia Simulada'}
                            </span>
                            <div className="py-1 text-base text-slate-200">
                              <MathJaxFormula formula={"IF_{acumulado} = (\\overline{Y} - \\overline{V}^P) \\cdot N \\cdot S"} />
                            </div>
                            <div className="py-1 text-base text-slate-200">
                              <MathJaxFormula formula={"IF_{acumulado} = \\sum_{t=t_{desde}}^{t_{hasta}} (Y_t - V^P_t) \\cdot N \\cdot S"} />
                            </div>
                            <div className={`py-1 text-sm ${isLoss ? 'text-rose-400' : 'text-emerald-400'} font-bold`}>
                              <MathJaxFormula formula={formulaCalc} />
                            </div>
                          </div>

                          <div className="p-4 bg-slate-900/30 border border-slate-850 rounded-xl space-y-4 font-sans text-slate-300">
                            <span className="text-[14px] font-black uppercase tracking-wider text-teal-400 block border-b border-slate-800 pb-1.5">
                              📐 Desglose de Promedios y Brecha de Cobertura
                            </span>
                            <p className="text-[14px] text-slate-400 leading-relaxed">
                              Deducción de los indicadores de paridad a partir de los datos históricos del modelo en los <span className="font-bold text-white">{calculationsBrecha.meses} meses</span> de la ventana temporal definida:
                            </p>

                            <div className="space-y-3.5">
                              {/* 1. Promedio Cobrado */}
                              <div className="space-y-1">
                                <span className="text-[14px] font-bold text-slate-200 block">
                                  1. Promedio de Arancel Nominal Cobrado (<MathJaxFormula formula="\overline{Y}" className="inline-block text-slate-200 font-bold px-1 text-[14px]" />):
                                </span>
                                <p className="text-[14px] text-slate-400 leading-relaxed">
                                  La media aritmética de los aranceles nominales cobrados a la Obra Social (<MathJaxFormula formula="Y_t" className="inline-block text-slate-400 px-1 text-[14px]" />):
                                </p>
                                
                                <div className="text-[13px] text-slate-400 pl-4 py-2 bg-slate-950/45 rounded-lg border border-slate-800/40 my-2 font-mono space-y-1">
                                  <div className="text-teal-400 font-bold text-[11px] uppercase tracking-wider pb-0.5">Componentes de la sumatoria (Arancel Cobrado):</div>
                                  
                                  {/* Mes 1 */}
                                  <div>• Mes 1 ({mes1Label}): <MathJaxFormula formula={`Y_1 = \\$${mes1Y}`} className="inline-block text-slate-200" /></div>
                                  
                                  {/* Si hay 2 meses */}
                                  {calculationsBrecha.meses === 2 && (
                                    <div>• Mes 2 ({mesUltLabel}): <MathJaxFormula formula={`Y_2 = \\$${mesUltY}`} className="inline-block text-slate-200" /></div>
                                  )}

                                  {/* Si hay 3 meses */}
                                  {calculationsBrecha.meses === 3 && (
                                    <>
                                      {mes2 && <div>• Mes 2 ({mes2Label}): <MathJaxFormula formula={`Y_2 = \\$${mes2Y}`} className="inline-block text-slate-200" /></div>}
                                      <div>• Mes 3 ({mesUltLabel}): <MathJaxFormula formula={`Y_3 = \\$${mesUltY}`} className="inline-block text-slate-200" /></div>
                                    </>
                                  )}

                                  {/* Si hay más de 3 meses */}
                                  {calculationsBrecha.meses > 3 && (
                                    <>
                                      {mes2 && <div>• Mes 2 ({mes2Label}): <MathJaxFormula formula={`Y_2 = \\$${mes2Y}`} className="inline-block text-slate-200" /></div>}
                                      <div>• ...</div>
                                      <div>• Mes {calculationsBrecha.meses} ({mesUltLabel}): <MathJaxFormula formula={`Y_{${calculationsBrecha.meses}} = \\$${mesUltY}`} className="inline-block text-slate-200" /></div>
                                    </>
                                  )}
                                </div>

                                <MathJaxFormula
                                  formula={`\\overline{Y} = \\frac{\\sum_{t=t_{\\text{desde}}}^{t_{\\text{hasta}}} Y_t}{M} = \\frac{\\sum_{${labelDesdeEq}}^{${labelHastaEq}} Y_t}{${calculationsBrecha.meses}} = \\frac{\\sum Y_t}{${calculationsBrecha.meses}} = \\frac{\\$${valSumY}}{${calculationsBrecha.meses}} = \\$${valY}`}
                                  display={true}
                                  className="block text-center text-teal-300 font-bold text-[14px]"
                                />
                              </div>

                              {/* 2. Promedio Paridad */}
                              <div className="space-y-1">
                                <span className="text-[14px] font-bold text-slate-200 block">
                                  2. Promedio del Valor de Paridad de Referencia (<MathJaxFormula formula="\overline{V}^P" className="inline-block text-slate-200 font-bold px-1 text-[12px]" />):
                                </span>
                                <p className="text-[14px] text-slate-400 leading-relaxed">
                                  La media del arancel referencial de costos (<MathJaxFormula formula="V^P_t" className="inline-block text-slate-400 px-1 text-[12px]" />), ajustado por la fórmula de paridad polinómica (40% Salarios CCT, 30% Insumos USD, 30% Inflación IPC) con base de comparación en {tDesde}:
                                </p>
                                <MathJaxFormula
                                  formula={`V^P_t = Y_{\\text{base}} \\cdot \\left[ 0.40 \\left( \\frac{\\text{CCT}_t}{\\text{CCT}_{\\text{base}}} \\right) + 0.30 \\left( \\frac{\\text{USD}_t}{\\text{USD}_{\\text{base}}} \\right) + 0.30 \\left( \\frac{\\text{IPC}_t}{\\text{IPC}_{\\text{base}}} \\right) \\right]`}
                                  display={true}
                                  className="block text-center text-slate-400 text-[14px] py-1"
                                />

                                <div className="text-[13px] text-slate-400 pl-4 py-2 bg-slate-950/45 rounded-lg border border-slate-800/40 my-2 font-mono space-y-1.5 overflow-x-auto">
                                  <div className="text-teal-400 font-bold text-[11px] uppercase tracking-wider pb-0.5">Componentes de la sumatoria (Costo de Paridad):</div>
                                  
                                  {/* Mes 1 */}
                                  <div className="whitespace-nowrap">• Mes 1 ({mes1Label}): <MathJaxFormula formula={mes1Eq} className="inline-block text-slate-200" /></div>
                                  
                                  {/* Si hay 2 meses */}
                                  {calculationsBrecha.meses === 2 && (
                                    <div className="whitespace-nowrap">• Mes 2 ({mesUltLabel}): <MathJaxFormula formula={mesUltEq} className="inline-block text-slate-200" /></div>
                                  )}

                                  {/* Si hay 3 meses */}
                                  {calculationsBrecha.meses === 3 && (
                                    <>
                                      {mes2 && <div className="whitespace-nowrap">• Mes 2 ({mes2Label}): <MathJaxFormula formula={mes2Eq} className="inline-block text-slate-200" /></div>}
                                      <div className="whitespace-nowrap">• Mes 3 ({mesUltLabel}): <MathJaxFormula formula={mesUltEq} className="inline-block text-slate-200" /></div>
                                    </>
                                  )}

                                  {/* Si hay más de 3 meses */}
                                  {calculationsBrecha.meses > 3 && (
                                    <>
                                      {mes2 && <div className="whitespace-nowrap">• Mes 2 ({mes2Label}): <MathJaxFormula formula={mes2Eq} className="inline-block text-slate-200" /></div>}
                                      <div>• ...</div>
                                      <div className="whitespace-nowrap">• Mes {calculationsBrecha.meses} ({mesUltLabel}): <MathJaxFormula formula={mesUltEq} className="inline-block text-slate-200" /></div>
                                    </>
                                  )}
                                </div>

                                <MathJaxFormula
                                  formula={`\\overline{V}^P = \\frac{\\sum_{t=t_{\\text{desde}}}^{t_{\\text{hasta}}} V^P_t}{M} = \\frac{\\sum_{${labelDesdeEq}}^{${labelHastaEq}} V^P_t}{${calculationsBrecha.meses}} = \\frac{\\sum V^P_t}{${calculationsBrecha.meses}} = \\frac{\\$${valSumVP}}{${calculationsBrecha.meses}} = \\$${valVP}`}
                                  display={true}
                                  className="block text-center text-teal-300 font-bold text-[14px]"
                                />
                              </div>

                              {/* 3. Brecha de Cobertura */}
                              <div className="space-y-1">
                                <span className="text-[14px] font-bold text-slate-200 block">
                                  3. Brecha de Cobertura Promedio (<MathJaxFormula formula="BC_{\text{prom}}" className="inline-block text-slate-200 font-bold px-1 text-[14px]" />):
                                </span>
                                <p className="text-[14px] text-slate-400 leading-relaxed">
                                  Diferencia porcentual relativa entre el promedio cobrado real y el promedio de costos de referencia:
                                </p>
                                <MathJaxFormula
                                  formula={`BC_{\\text{prom}} = \\frac{\\overline{Y} - \\overline{V}^P}{\\overline{V}^P} \\cdot 100 = \\frac{\\$${valY} - \\$${valVP}}{\\$${valVP}} \\cdot 100 = ${fmtAR(calculationsBrecha.brecha, 2)}\\%`}
                                  display={true}
                                  className="block text-center text-teal-300 font-bold text-[14px]"
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* ------------------------------------------- FIN: p3_p3_a2_b5 --------------------------------------------- */}
        </div>
      )
      }

      {
        activeTab === 'timelag' && (
          <div className="space-y-6">
            {/* NARRATIVA DE ENCUADRE */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <h2 className="text-[24px] font-bold text-teal-400 uppercase tracking-wider mb-2">
                📖 El Espejismo del Pago Nominal
              </h2>
              <p className="text-[20px] text-slate-300 leading-relaxed">
                Las obras sociales rara vez pagan al día. En contextos inflacionarios, cobrar a <strong>60 o 90 días</strong> distorsiona la caja. Aunque nominalmente se liquide el 100% del arancel, el valor real que ingresa se ha erosionado por la inflación y el costo financiero del capital inmovilizado.
              </p>
            </div>

            {/* CONTROLES / SEGMENTADORES */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Parámetros del escenario</span>
              <button
                onClick={() => setMostrarVariablesTimeLag(!mostrarVariablesTimeLag)}
                className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-teal-600 text-white hover:bg-teal-500 transition-all shadow-sm"
              >
                {mostrarVariablesTimeLag ? 'Ocultar variables' : 'Administrar variables'}
              </button>
            </div>

            {!mostrarVariablesTimeLag && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></span>
                  <span className="font-bold text-slate-400">Modalidad:</span>
                  <span className="text-white font-semibold">{(opcionesModalidades.find(m => m.id === modalidad) || opcionesModalidades[0]).nombre}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <div>
                    <span className="text-slate-400">Período:</span>{' '}
                    <span className="text-teal-400 font-bold font-mono">{seriesData.find(d => d.periodo === tHasta)?.label || tHasta}</span>
                  </div>
                  <div className="border-l border-slate-800 h-3 hidden md:block"></div>
                  <div>
                    <span className="text-slate-400">Plazo pago:</span>{' '}
                    <span className="text-slate-200 font-mono"><span className="text-teal-400 font-bold">{timeLagDays}</span> días</span>
                  </div>
                  <div>
                    <span className="text-slate-400">TNA:</span>{' '}
                    <span className="text-slate-200 font-mono"><span className="text-teal-400 font-bold">{tna}</span>%</span>
                  </div>
                  {/* ------------------------------------------- INI: p3_p3_a3 --------------------------------------------- */}
                  {hasPermission('p3_p3_a3') && (
                    <div>
                      <span className="text-slate-400">g<sub>IPC</sub>:</span>{' '}
                      <span className="text-slate-200 font-mono"><span className="text-yellow-400 font-bold">{fmtAR(gIPC, 1)}</span>%</span>
                    </div>
                  )}
                  {/* ------------------------------------------- FIN: p3_p3_a3 --------------------------------------------- */}
                </div>
              </div>
            )}

            {mostrarVariablesTimeLag && (
              <div className={`grid grid-cols-1 md:grid-cols-${hasPermission('p3_p3_a3') ? 3 : 2} gap-4`}>
                <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md space-y-4">
                  <span className="text-xs font-black uppercase tracking-wider text-teal-400 block border-b border-slate-800 pb-1.5">
                    🎛️ Filtros de Escenario
                  </span>

                  <div className="flex flex-col space-y-1">
                    <label className="text-xs uppercase font-bold text-slate-400">Modalidad Dialítica:</label>
                    <select
                      value={modalidad}
                      onChange={(e) => setModalidad(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs rounded-xl p-2 text-white cursor-pointer"
                    >
                      {opcionesModalidades.map(m => (
                        <option key={m.id} value={m.id}>{m.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-xs uppercase font-bold text-slate-400">Período de Facturación:</label>
                    <select
                      value={tHasta}
                      onChange={(e) => setTHasta(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs rounded-xl p-2 text-white cursor-pointer"
                    >
                      {periodosHastaFiltrados.map(p => (
                        <option key={p.periodo} value={p.periodo}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md space-y-4">
                  <span className="text-xs font-black uppercase tracking-wider text-teal-400 block border-b border-slate-800 pb-1.5">
                    💼 Plazo y Costo del Capital
                  </span>

                  <div className="flex flex-col space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>Plazo de Pago Diferido:</span>
                      <span className="text-teal-400 font-mono font-black">{timeLagDays} Días</span>
                    </div>
                    <input
                      type="range" min="0" max="180" step="5" value={timeLagDays}
                      onChange={(e) => setTimeLagDays(Number(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400 mt-2"
                    />
                    <span className="text-[10px] text-slate-500 font-bold text-right font-mono mt-1">
                      = {fmtAR(timeLagDays / 30, 1)} meses
                    </span>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>Tasa de Descuento (TNA %):</span>
                      <span className="text-teal-400 font-mono font-black">{tna}%</span>
                    </div>
                    <input
                      type="range" min="0" max="150" step="2.5" value={tna}
                      onChange={(e) => setTna(Number(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400 mt-2"
                    />
                    <span className="text-[10px] text-slate-500 font-bold text-right font-mono mt-1">
                      TEM = {fmtAR(tna / 12, 2)}% mensual
                    </span>
                  </div>
                </div>

                {/* ------------------------------------------- INI: p3_p3_a3 --------------------------------------------- */}
                {hasPermission('p3_p3_a3') && (
                  <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md space-y-4">
                    <span className="text-xs font-black uppercase tracking-wider text-teal-400 block border-b border-slate-800 pb-1.5">
                      🔥 Expectativa de Inflación
                    </span>

                    <div className="flex flex-col space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-yellow-500">Tasa de Inflación Mensual (g<sub>IPC</sub>):</span>
                        <span className="text-white font-mono">{fmtAR(gIPC, 1)}%</span>
                      </div>
                      <input
                        type="range" min="0" max="30" step="0.5" value={gIPC}
                        onChange={(e) => setGIPC(Number(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-500 mt-2"
                      />
                      <span className="text-[9.5px] text-slate-400 leading-relaxed mt-2">
                        * Tasa que licúa el poder adquisitivo del cobro diferido.
                      </span>
                    </div>
                  </div>
                )}
                {/* ------------------------------------------- FIN: p3_p3_a3 --------------------------------------------- */}
              </div>
            )}

            {/* RESULTADO Y GRÁFICO CASCADA */}
            {calculationsTimeLag && (
              <div className={`grid grid-cols-1 ${[hasPermission('p3_p3_a3_b1'), hasPermission('p3_p3_a3_b2')].filter(Boolean).length === 2
                ? 'lg:grid-cols-2'
                : 'lg:grid-cols-1'
                } gap-6`}>
                {/* RESUMEN DEL TIME LAG */}
                {/* ------------------------------------------- INI: p3_p3_a3_b1 --------------------------------------------- */}
                {hasPermission('p3_p3_a3_b1') && (
                  <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md flex flex-col justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-teal-400 block border-b border-slate-800 pb-1.5">
                      📋 Resumen del Daño Financiero por Rezago
                    </span>

                    <div className="grid grid-cols-2 gap-3 text-xs font-mono my-3">
                      <div className="p-2.5 bg-slate-950/40 border border-slate-850 rounded-xl">
                        <span className="text-[10px] text-slate-500 block">Facturado Nominal:</span>
                        <span className="text-sky-400 font-extrabold text-sm">${calculationsTimeLag.Y_nominal.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="p-2.5 bg-slate-950/40 border border-slate-850 rounded-xl">
                        <span className="text-[10px] text-slate-500 block">Valor de Paridad Polinómico:</span>
                        <span className="text-slate-300 font-extrabold text-sm">${calculationsTimeLag.VP.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="p-2.5 bg-slate-950/40 border border-slate-850 rounded-xl">
                        <span className="text-[10px] text-slate-500 block">Erosión Total Absoluta:</span>
                        <span className="text-red-400 font-extrabold text-sm">-${calculationsTimeLag.lossTotal.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="p-2.5 bg-slate-950/40 border border-slate-850 rounded-xl">
                        <span className="text-[10px] text-slate-500 block">Porcentaje Descuento Real:</span>
                        <span className="text-red-400 font-extrabold text-sm">{fmtAR(calculationsTimeLag.lossPct, 1)} %</span>
                      </div>
                    </div>

                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/25 rounded-2xl text-center">
                      <span className="text-[11px] text-emerald-400 uppercase font-black tracking-wider block">Valor Real Neto Percibido:</span>
                      <span className="text-xl font-black text-emerald-400 block font-mono mt-1">
                        ${calculationsTimeLag.Y_real.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-[9.5px] text-slate-400 block mt-1">
                        * Descuenta conjuntamente la inflación y la pérdida financiera.
                      </span>
                    </div>
                  </div>
                )}
                {/* ------------------------------------------- FIN: p3_p3_a3_b1 --------------------------------------------- */}

                {/* GRÁFICO CASCADA (WATERFALL) */}
                {/* ------------------------------------------- INI: p3_p3_a3_b2 --------------------------------------------- */}
                {hasPermission('p3_p3_a3_b2') && (
                  <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-teal-400 block mb-1">
                        📊 Gráfico Cascada: Descomposición de la Erosión
                      </span>
                      <p className="text-[10px] text-slate-400 mb-3">
                        Desglose de cómo el retraso comercial licúa el arancel nominal.
                      </p>
                    </div>

                    <div className="w-full flex justify-center my-auto">
                      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto bg-slate-950/60 rounded-xl border border-slate-800/80">
                        <line x1={margin.left} y1={svgHeight - margin.bottom} x2={svgWidth - margin.right} y2={svgHeight - margin.bottom} stroke="#475569" />

                        {/* Línea de Paridad Polinómica */}
                        <line
                          x1={margin.left}
                          y1={svgHeight - margin.bottom - (calculationsTimeLag.VP / calculationsTimeLag.Y_nominal) * (svgHeight - margin.top - margin.bottom)}
                          x2={svgWidth - margin.right}
                          y2={svgHeight - margin.bottom - (calculationsTimeLag.VP / calculationsTimeLag.Y_nominal) * (svgHeight - margin.top - margin.bottom)}
                          stroke="#ef4444"
                          strokeWidth="1.5"
                          strokeDasharray="4 3"
                        />
                        <text
                          x={svgWidth - margin.right - 5}
                          y={svgHeight - margin.bottom - (calculationsTimeLag.VP / calculationsTimeLag.Y_nominal) * (svgHeight - margin.top - margin.bottom) - 5}
                          fill="#f87171"
                          fontSize="9.5"
                          fontWeight="bold"
                          textAnchor="end"
                        >
                          Valor Paridad Polinómico
                        </text>

                        {/* Línea divisoria */}
                        <line x1={330} y1={margin.top - 10} x2={330} y2={svgHeight - margin.bottom + 5} stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.8" />

                        {/* Barras */}
                        {waterfallBars.map((b, i) => (
                          <g key={i}>
                            <rect x={b.x} y={b.y} width={50} height={b.h} fill={b.color} rx="3" opacity="0.8" />
                            <text
                              x={b.x + 25}
                              y={b.type === 'loss' ? b.y + b.h + 12 : b.y - 7}
                              fill={b.type === 'loss' ? '#f87171' : '#f8fafc'}
                              fontSize="9.5"
                              fontFamily="monospace"
                              fontWeight="bold"
                              textAnchor="middle"
                            >
                              {b.type === 'loss' ? '' : '$'}{Math.round(b.val).toLocaleString('es-AR')}
                            </text>
                            <text x={b.x + 25} y={svgHeight - margin.bottom + 18} fill="#e2e8f0" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                              {b.label}
                            </text>
                          </g>
                        ))}
                      </svg>
                    </div>
                  </div>
                )}
                {/* ------------------------------------------- FIN: p3_p3_a3_b2 --------------------------------------------- */}
              </div>
            )}

            {/* BOTÓN DESARROLLO MATEMÁTICO */}
            {/* ------------------------------------------- INI: p3_p3_a3_b3 --------------------------------------------- */}
            {hasPermission('p3_p3_a3_b3') && calculationsTimeLag && (
              <div className="flex flex-col space-y-4">
                <div className="flex justify-center">
                  <button
                    onClick={() => setMostrarMathTimeLag(!mostrarMathTimeLag)}
                    className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-900 border border-slate-700 text-teal-400 hover:bg-slate-800 transition"
                  >
                    {mostrarMathTimeLag ? '🙈 Ocultar Demostración Matemática' : '🎓 Mostrar Planteo y Desarrollo Matemático'}
                  </button>
                </div>

                {mostrarMathTimeLag && (
                  <div className="p-5 rounded-2xl border bg-slate-950/60 border-slate-800 space-y-4 text-xs leading-relaxed text-slate-300">
                    <h4 className="text-teal-400 font-bold uppercase tracking-wide border-b border-slate-800 pb-2">
                      🎓 Planteo del Impuesto Inflacionario por Time Lag
                    </h4>

                    <div className="space-y-3 font-mono">
                      <p className="text-slate-300 font-sans text-[18px]">
                        <strong>1. Ecuación de Descuento Financiero e Inflacionario Combinado:</strong>
                        <br />
                        El Valor Real Neto se obtiene descontando la tasa real (inflación) y la tasa financiera conjunta sobre la base temporal:
                      </p>
                      {(() => {
                        const isLoss = calculationsTimeLag.lossTotal > 0;
                        return (
                          <div className={`p-4 rounded-xl border ${isLoss ? 'bg-rose-950/20 border-rose-500/30' : 'bg-emerald-950/20 border-emerald-500/30'} text-center space-y-2`}>
                            <span className={`text-[18px] font-black uppercase tracking-wider block ${isLoss ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {isLoss ? '❌ Pérdida por Rezago Financiero' : '✅ Resultado Simulado Suficiente'}
                            </span>
                            <span className="text-[24px]"><MathJaxFormula formula={"Y_{real} = \\frac{Y_{nominal}}{(1 + g_{IPC})^m \\cdot (1 + TEM)^m}"} /></span>
                            <br /><br />
                            <span className={`inline-block text-base font-mono font-bold ${isLoss ? 'text-rose-350' : 'text-emerald-400'}`}>
                              <MathJaxFormula className="text-white text-[24px]" formula={`Y_{real} = \\frac{${fmtAR(calculationsTimeLag.Y_nominal, 2)}}{\\left(1 + ${fmtAR(gIPC / 100, 4)}\\right)^{${fmtAR(calculationsTimeLag.mesesAtraso, 2)}} \\cdot \\left(1 + ${fmtAR(calculationsTimeLag.tem, 4)}\\right)^{${fmtAR(calculationsTimeLag.mesesAtraso, 2)}}} = ${fmtAR(calculationsTimeLag.Y_real, 2)}`} />
                            </span>
                          </div>
                        );
                      })()}
                      <p className="text-slate-300 font-sans text-[16px]">
                        <strong>2. Conversión de Tasa de Descuento (TNA a TEM):</strong>
                        <br />
                        La Tasa Nominal Anual (<MathJaxFormula formula="TNA" />) se divide por 12 para obtener la tasa mensual efectiva:
                      </p>
                      <div className="p-3 bg-slate-900/60 rounded-xl text-center">
                        <span className="text-[24px]"><MathJaxFormula formula={"TEM = \\frac{TNA}{12}"} /></span>
                        <br />
                        <span className="inline-block text-base">
                          <MathJaxFormula className="text-white text-[24px]" formula={`TEM = \\frac{${tna}\\%}{12} = ${fmtAR(calculationsTimeLag.tem, 4)} \\text{ (}${fmtAR(calculationsTimeLag.tem * 100, 2)}\\%\\text{ mensual)}`} />
                        </span>
                      </div>

                      <p className="text-slate-300 font-sans text-[16px]">
                        <strong>3. Plazo de Pago expresado en Fracción de Meses (<MathJaxFormula formula="m" />):</strong>
                        <br />
                        Se calcula dividiendo el rezago en días por un mes comercial estándar de 30 días:
                      </p>
                      <div className="p-3 bg-slate-900/60 rounded-xl text-center">
                        <span className="text-[24px]"><MathJaxFormula formula={`m = \\frac{\\text{Días de Atraso}}{30}`} /></span>
                        <br />
                        <span className="inline-block text-base">
                          <MathJaxFormula className="text-[24px] text-white" formula={`m = \\frac{${timeLagDays}\\text{ días}}{30} = ${fmtAR(calculationsTimeLag.mesesAtraso, 2)}\\text{ meses}`} />
                        </span>
                      </div>


                    </div>
                  </div>
                )}
              </div>
            )}
            {/* ------------------------------------------- FIN: p3_p3_a3_b3 --------------------------------------------- */}
          </div>
        )
      }
    </div >
  );
}
