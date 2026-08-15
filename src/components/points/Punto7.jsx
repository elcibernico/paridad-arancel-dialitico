import React, { useState, useMemo } from 'react';
import { MathJaxFormula } from '../MathJaxFormula';
import seriesData from '../../data/seriesData.json';
import { fmtAR, fmtLatex } from '../../utils/format';
import { useGlobalParams } from '../../context/GlobalContext';

export default function Punto7() {
  const [activeTab, setActiveTab] = useState(null);
  const [mostrarVariables, setMostrarVariables] = useState(false);

  const {
    incidencias, setIncidencias,
    modalidadDialitica: modalidad, setModalidadDialitica: setModalidad,
    periodoDesde: t0, setPeriodoDesde: setT0,
    periodoHasta: t, setPeriodoHasta: setT
  } = useGlobalParams();

  const wCCT = incidencias.cct;
  const wUSD = incidencias.usd;
  const wIPC = incidencias.ipc;

  const setWCCT = (v) => setIncidencias({ ...incidencias, cct: v });
  const setWUSD = (v) => setIncidencias({ ...incidencias, usd: v });
  const setWIPC = (v) => setIncidencias({ ...incidencias, ipc: v });

  const totalW = wCCT + wUSD + wIPC;
  const isValidSum = totalW === 100;

  const handleAjustarCCT = () => setWCCT(100 - wUSD - wIPC);
  const handleAjustarUSD = () => setWUSD(100 - wCCT - wIPC);
  const handleAjustarIPC = () => setWIPC(100 - wCCT - wUSD);

  const restoreStandard = () => {
    setIncidencias({ cct: 40, usd: 30, ipc: 30 });
  };

  // Opciones de Modalidad
  const opcionesModalidades = [
    { id: 'HD', nombre: 'Hemodiálisis Convencional (HD)', tipoBrecha: 'por sesión', campoExcel: 'valorSesionHD' },
    { id: 'DP', nombre: 'Diálisis Peritoneal (DP)', tipoBrecha: 'por módulo', campoExcel: 'valorModuloDP' },
    { id: 'HDF', nombre: 'Hemodiafiltración en Línea (HDF)', tipoBrecha: 'por sesión', campoExcel: 'valorSesionHDF' }
  ];

  // Selectors
  const defaultT0 = seriesData.find(d => d.periodo === '2023-11') || seriesData[0];
  const ultimoPeriodoData = seriesData[seriesData.length - 1];

  const [searchT0, setSearchT0] = useState('');
  const [searchT, setSearchT] = useState('');

  // Computations
  const { dataT0, dataT, iCCT, iUSD, iIPC, iP, vP, vReal, brecha, pctIncremento, modObj } = useMemo(() => {
    const dT0 = seriesData.find(d => d.periodo === t0) || seriesData[0];
    const dT = seriesData.find(d => d.periodo === t) || ultimoPeriodoData;
    const currentMod = opcionesModalidades.find(m => m.id === modalidad) || opcionesModalidades[0];

    const indCCT = dT.cct / (dT0.cct || 1);
    const indUSD = dT.usd / (dT0.usd || 1);
    const indIPC = dT.ipc / (dT0.ipc || 1);

    const indP = isValidSum ? (wCCT / 100) * indCCT + (wUSD / 100) * indUSD + (wIPC / 100) * indIPC : 1;

    const baseVal = dT0[currentMod.campoExcel] || 0;
    const vPol = baseVal * indP;
    const vR = dT[currentMod.campoExcel] || 0;
    const b = vPol > 0 ? ((vR - vPol) / vPol) * 100 : 0;
    const pctInc = vR > 0 ? ((vPol - vR) / vR) * 100 : 0;

    return {
      dataT0: dT0,
      dataT: dT,
      iCCT: indCCT,
      iUSD: indUSD,
      iIPC: indIPC,
      iP: indP,
      vP: vPol,
      vReal: vR,
      brecha: b,
      pctIncremento: pctInc,
      modObj: currentMod
    };
  }, [t0, t, modalidad, wCCT, wUSD, wIPC, isValidSum, ultimoPeriodoData]);

  const periodosT0Filtrados = seriesData.filter(p =>
    p.label.toLowerCase().includes(searchT0.toLowerCase()) || p.periodo.includes(searchT0)
  );

  const periodosTFiltrados = seriesData.filter(p =>
    (p.label.toLowerCase().includes(searchT.toLowerCase()) || p.periodo.includes(searchT)) &&
    p.periodo >= t0 // Solo mostrar periodos mayores o iguales a t0
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="border-b pb-4 border-slate-300 dark:border-slate-800">
        <h3 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white">
          Modelo Polinómico de Costos Estructurales
        </h3>
        <p className="text-base sm:text-lg mt-2 leading-relaxed text-slate-800 font-normal dark:text-slate-300">
          Una fórmula polinómica agrupa los componentes del costo en tres familias (Trabajo, Insumos Dolarizados, e Insumos, Servicios y Costos que siguen IPC).
          Al ponderarlos y actualizarlos por sus índices correspondientes, obtenemos un Índice Polinómico que refleja la inflación real de la actividad.
        </p>
      </div>

      {/* Botones de Control de Revelado (Apartados 1 a 4) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={() => setActiveTab(activeTab === 'pesos' ? null : 'pesos')}
          className={`p-2.5 rounded-xl border text-xs font-bold transition-all duration-200 flex items-center justify-between ${activeTab === 'pesos'
            ? 'bg-indigo-50 border-indigo-600 text-indigo-950 shadow-md ring-2 ring-indigo-600 dark:bg-indigo-950 dark:border-indigo-500 dark:text-indigo-200'
            : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-indigo-50/50 hover:border-indigo-400 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:border-indigo-500/50 dark:hover:text-white'
            }`}
        >
          <span>1. Ponderación de Incidencias</span>
          <span>{activeTab === 'pesos' ? '👁️' : '🙈'}</span>
        </button>

        <button
          onClick={() => setActiveTab(activeTab === 'relativos' ? null : 'relativos')}
          className={`p-2.5 rounded-xl border text-xs font-bold transition-all duration-200 flex items-center justify-between ${activeTab === 'relativos'
            ? 'bg-blue-50 border-blue-600 text-blue-950 shadow-md ring-2 ring-blue-600 dark:bg-blue-950 dark:border-blue-500 dark:text-blue-200'
            : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-blue-50/50 hover:border-blue-400 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:border-blue-500/50 dark:hover:text-white'
            }`}
        >
          <span>2. Índices Relativos</span>
          <span>{activeTab === 'relativos' ? '👁️' : '🙈'}</span>
        </button>

        <button
          onClick={() => setActiveTab(activeTab === 'polinomico' ? null : 'polinomico')}
          className={`p-2.5 rounded-xl border text-xs font-bold transition-all duration-200 flex items-center justify-between ${activeTab === 'polinomico'
            ? 'bg-fuchsia-50 border-fuchsia-600 text-fuchsia-950 shadow-md ring-2 ring-fuchsia-600 dark:bg-fuchsia-950 dark:border-fuchsia-500 dark:text-fuchsia-200'
            : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-fuchsia-50/50 hover:border-fuchsia-400 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:border-fuchsia-500/50 dark:hover:text-white'
            }`}
        >
          <span>3. Índice Polinómico</span>
          <span>{activeTab === 'polinomico' ? '👁️' : '🙈'}</span>
        </button>

        <button
          onClick={() => setActiveTab(activeTab === 'simulador' ? null : 'simulador')}
          className={`p-2.5 rounded-xl border text-xs font-extrabold transition-all duration-200 flex items-center justify-between ${activeTab === 'simulador'
            ? 'bg-emerald-100 border-emerald-600 text-emerald-950 shadow-md ring-2 ring-emerald-600 dark:bg-emerald-950 dark:border-emerald-500 dark:text-emerald-200'
            : 'bg-slate-50 border-slate-300 text-emerald-800 hover:bg-emerald-50/50 hover:border-emerald-400 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-emerald-400 dark:hover:bg-slate-800/80 dark:hover:text-white'
            }`}
        >
          <span>⚡ 4. Simulador Polinómico</span>
          <span>{activeTab === 'simulador' ? '👁️' : '🙈'}</span>
        </button>
      </div>

      {/* SECCION 1 */}
      {activeTab === 'pesos' && (
        <div className="p-5 rounded-2xl border transition-all space-y-4 bg-indigo-50 border-indigo-500 text-slate-800 font-normal dark:bg-slate-950 dark:border-indigo-500/30 dark:text-slate-300">
          <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
            ⚖️ 1. Ponderación de Incidencias (Restricción de Completitud)
          </h4>
          <div className="p-4 rounded-xl border text-xs leading-relaxed bg-white border-indigo-300 shadow-sm dark:bg-slate-900/80 dark:border-slate-800">
            <p>Se asigna a cada factor una incidencia porcentual ( <MathJaxFormula formula="w" className="inline-block text-[18px]" /> ) según la estructura operativa. La hemodiálisis combina mano de obra calificada (CCT), insumos importados (USD) y gastos generales (IPC). Estas incidencias deben sumar 100%.</p>
          </div>
          <div className="p-4 rounded-xl border text-xs space-y-2 bg-white border-indigo-300 shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <MathJaxFormula display={true} formula="w_{CCT} + w_{USD} + w_{IPC} = 1.0" />
          </div>
          <div className="pl-3 border-l-2 border-indigo-500/40 text-xs leading-relaxed space-y-1">
            <span className="font-bold">donde:</span>
            <ul className="list-disc pl-4 space-y-0.5">
              <li><MathJaxFormula formula="w_{CCT}" className="inline-block text-[18px]" />: Incidencia de la escala salarial del Convenio Colectivo de Trabajo (CCT 108/75).</li>
              <li><MathJaxFormula formula="w_{USD}" className="inline-block text-[18px]" />: Incidencia del tipo de cambio oficial frente al Dólar estadounidense.</li>
              <li><MathJaxFormula formula="w_{IPC}" className="inline-block text-[18px]" />: Incidencia del Índice de Precios al Consumidor general.</li>
            </ul>
          </div>
        </div>
      )}

      {/* SECCION 2 */}
      {activeTab === 'relativos' && (
        <div className="p-5 rounded-2xl border transition-all space-y-4 bg-blue-50 border-blue-500 text-slate-800 font-normal dark:bg-slate-950 dark:border-blue-500/30 dark:text-slate-300">
          <h4 className="text-sm font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 flex flex-wrap items-center gap-1">
            <span>📊 2. Construcción de Índices Relativos con Base </span>
            <MathJaxFormula formula="t_0" className="inline-block text-[20px]" />
          </h4>
          <div className="p-4 rounded-xl border text-xs leading-relaxed bg-white border-blue-300 shadow-sm dark:bg-slate-900/80 dark:border-slate-800">
            <p>Se selecciona un mes base <MathJaxFormula formula="t_0" className="inline-block text-[18px]" /> que represente un equilibrio de costos (ej. nov 2023). Para cualquier mes <MathJaxFormula formula="t" className="inline-block text-[18px]" />, calculamos la variación relativa respecto al mes base.</p>
          </div>
          <div className="p-4 rounded-xl border text-xs space-y-2 bg-white border-blue-300 shadow-sm dark:bg-slate-900 dark:border-slate-800 flex flex-col gap-2">
            <MathJaxFormula display={true} formula="I^{CCT}_t = \frac{CCT_t}{CCT_{t_0}}" />
            <MathJaxFormula display={true} formula="I^{USD}_t = \frac{USD_t}{USD_{t_0}}" />
            <MathJaxFormula display={true} formula="I^{IPC}_t = \frac{IPC_t}{IPC_{t_0}}" />
          </div>
          <div className="pl-3 border-l-2 border-blue-500/40 text-xs leading-relaxed space-y-1">
            <span className="font-bold">donde:</span>
            <ul className="list-disc pl-4 space-y-0.5">
              <li><MathJaxFormula formula="I" className="inline-block text-[18px]" />: Índice relativo de crecimiento desde <MathJaxFormula formula="t_0" className="inline-block text-[18px]" /> hasta <MathJaxFormula formula="t" className="inline-block text-[18px]" />.</li>
              <li><MathJaxFormula formula="t_0" className="inline-block text-[18px]" />: Período base o de equilibrio original.</li>
              <li><MathJaxFormula formula="t" className="inline-block text-[18px]" />: Período de análisis futuro o presente.</li>
            </ul>
          </div>
        </div>
      )}

      {/* SECCION 3 */}
      {activeTab === 'polinomico' && (
        <div className="p-5 rounded-2xl border transition-all space-y-4 bg-fuchsia-50 border-fuchsia-500 text-slate-800 font-normal dark:bg-slate-950 dark:border-fuchsia-500/30 dark:text-slate-300">
          <h4 className="text-sm font-bold uppercase tracking-wider text-fuchsia-900 dark:text-fuchsia-300 flex flex-wrap items-center gap-1">
            <span>🎯 3. Agregación del Índice Polinómico (</span>
            <MathJaxFormula formula="I^P_t" />
            <span>) y Valor Polinómico Teórico (</span>
            <MathJaxFormula formula="V^P_t" />
            <span>)</span>
          </h4>
          <div className="p-4 rounded-xl border text-xs leading-relaxed bg-white border-fuchsia-300 shadow-sm dark:bg-slate-900/80 dark:border-slate-800">
            <p>Se consolida la variacion, multiplicando cada Índice Relativo por su incidencia en el precio (<MathJaxFormula formula="I^P_t" className="inline-block text-[14px]" />).<br />
              Luego, <MathJaxFormula formula="Y_{t_0}" className="inline-block text-[14px]" /> (el arancel del mes base <MathJaxFormula formula="t_0" className="inline-block text-[14px]" />), se actualiza con este Índice (<MathJaxFormula formula="I^P_t" className="inline-block text-[14px]" />) para hallar el valor de paridad técnica teórica (<MathJaxFormula formula="V^P_t" className="inline-block text-[14px]" />)</p>
          </div>
          <div className="p-4 rounded-xl border text-xs space-y-2 bg-white border-fuchsia-300 shadow-sm dark:bg-slate-900 dark:border-slate-800 flex flex-col gap-2">
            <MathJaxFormula display={true} formula="I^P_t = w_{CCT} \cdot I^{CCT}_t + w_{USD} \cdot I^{USD}_t + w_{IPC} \cdot I^{IPC}_t" />
            <MathJaxFormula display={true} formula="V^P_t = Y_{t_0} \cdot I^P_t" />
          </div>
          <div className="pl-3 border-l-2 border-fuchsia-500/40 text-xs leading-relaxed space-y-1">
            <span className="font-bold">donde:</span>
            <ul className="list-disc pl-4 space-y-0.5">
              <li><MathJaxFormula formula="I^P_t" />: Índice de Variación de Costos Polinómico agregado.</li>
              <li><MathJaxFormula formula="V^P_t" />: Valor Polinómico Teórico que la financiadora debería pagar en el mes <MathJaxFormula formula="t" />.</li>
              <li><MathJaxFormula formula="Y_{t_0}" />: Arancel real cobrado (liquidado) en el mes base <MathJaxFormula formula="t_0" />.</li>
            </ul>
          </div>
        </div>
      )}

      {/* SECCION 4: SIMULADOR */}
      {activeTab === 'simulador' && (
        <div className="p-6 rounded-3xl border-2 shadow-2xl transition-all space-y-6 bg-white border-emerald-600 ring-2 ring-emerald-600/10 text-slate-900 dark:bg-slate-950 dark:border-emerald-500/40 dark:ring-1 dark:ring-emerald-500/20 dark:text-slate-100">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 border-emerald-500/30 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <h4 className="text-base sm:text-lg font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  4. Simulador Interactivo de Paridad Polinómica
                </h4>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manipula la estructura de costos and selecciona los períodos para proyectar el Valor Teórico de Paridad.
              </p>
            </div>
            <button
              onClick={() => setMostrarVariables(!mostrarVariables)}
              className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-600 text-white hover:bg-emerald-500 transition-all shadow-sm"
            >
              {mostrarVariables ? 'Ocultar variables' : 'Administrar variables'}
            </button>
          </div>

          {!mostrarVariables && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="font-bold text-slate-400">Modalidad:</span>
                <span className="text-white font-semibold">{modObj.nombre}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <div>
                  <span className="text-slate-400">Base (t₀):</span>{' '}
                  <span className="text-teal-400 font-bold font-mono">{dataT0?.label || t0}</span>
                </div>
                <div>
                  <span className="text-slate-400">Corte (t):</span>{' '}
                  <span className="text-teal-400 font-bold font-mono">{dataT?.label || t}</span>
                </div>
                <div className="border-l border-slate-800 h-3 hidden md:block"></div>
                <div>
                  <span className="text-slate-400">Pesos:</span>{' '}
                  <span className="text-slate-200 font-mono">
                    CCT <span className="text-emerald-400 font-bold">{wCCT}%</span> |{' '}
                    USD <span className="text-emerald-400 font-bold">{wUSD}%</span> |{' '}
                    IPC <span className="text-emerald-400 font-bold">{wIPC}%</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {mostrarVariables && (
            <>
              {/* CONTROLES DE PESOS */}
              <div className="p-4 rounded-2xl border space-y-3 bg-emerald-50/50 border-emerald-500 text-slate-900 shadow-md dark:bg-slate-900 dark:border-emerald-500/30 dark:text-slate-100">
                <span className="text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex justify-between items-center">
                  <span>🎛️ 1. Estructura de Incidencias Relativas (%) de las Variables</span>
                  <span className={`px-2 py-0.5 rounded font-mono ${isValidSum ? 'bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100' : 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-100'}`}>Σ = {totalW}%</span>
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* wCCT */}
                  <div className="p-3 rounded-xl border space-y-2 bg-white border-slate-300 dark:bg-slate-950 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold">Laboral (<MathJaxFormula formula="w_{CCT}" />)</label>
                      <input type="number" value={wCCT} onChange={e => setWCCT(Number(e.target.value) || 0)} className="w-14 text-center text-xs py-0.5 rounded border focus:outline-none dark:bg-slate-900 border-slate-300 dark:border-slate-700 font-mono" />
                    </div>
                    <input type="range" min="0" max="100" step="5" value={wCCT} onChange={e => setWCCT(Number(e.target.value))} className="w-full accent-teal-500 cursor-pointer h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg" />
                    <button onClick={handleAjustarCCT} className="w-full py-1 text-xs font-bold rounded border bg-slate-100 hover:bg-teal-50 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700 transition">⇋ Ajustar CCT a Resto</button>
                  </div>
                  {/* wUSD */}
                  <div className="p-3 rounded-xl border space-y-2 bg-white border-slate-300 dark:bg-slate-950 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold">Insumos y Costos dolarizados (<MathJaxFormula formula="w_{USD}" />)</label>
                      <input type="number" value={wUSD} onChange={e => setWUSD(Number(e.target.value) || 0)} className="w-14 text-center text-xs py-0.5 rounded border focus:outline-none dark:bg-slate-900 border-slate-300 dark:border-slate-700 font-mono" />
                    </div>
                    <input type="range" min="0" max="100" step="5" value={wUSD} onChange={e => setWUSD(Number(e.target.value))} className="w-full accent-teal-500 cursor-pointer h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg" />
                    <button onClick={handleAjustarUSD} className="w-full py-1 text-xs font-bold rounded border bg-slate-100 hover:bg-teal-50 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700 transition">⇋ Ajustar USD a Resto</button>
                  </div>
                  {/* wIPC */}
                  <div className="p-3 rounded-xl border space-y-2 bg-white border-slate-300 dark:bg-slate-950 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold">Insumos, Servicios y Costos que siguen IPC (<MathJaxFormula formula="w_{IPC}" />)</label>
                      <input type="number" value={wIPC} onChange={e => setWIPC(Number(e.target.value) || 0)} className="w-14 text-center text-xs py-0.5 rounded border focus:outline-none dark:bg-slate-900 border-slate-300 dark:border-slate-700 font-mono" />
                    </div>
                    <input type="range" min="0" max="100" step="5" value={wIPC} onChange={e => setWIPC(Number(e.target.value))} className="w-full accent-teal-500 cursor-pointer h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg" />
                    <button onClick={handleAjustarIPC} className="w-full py-1 text-xs font-bold rounded border bg-slate-100 hover:bg-teal-50 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700 transition">⇋ Ajustar IPC a Resto</button>
                  </div>
                </div>
              </div>

              {!isValidSum && (
                <div className="p-3 rounded-xl border border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-200 text-xs font-bold flex items-center justify-between">
                  <span>⚠️ ERROR MATEMÁTICO: La suma de incidencias debe ser exactamente 100%. Suma actual: {totalW}%.</span>
                  <button onClick={restoreStandard} className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded shadow-sm text-xs font-bold tracking-wide">Restaurar 100%</button>
                </div>
              )}

              {/* CONTROLES DE PERIODOS Y MODALIDAD */}
              <div className="p-4 rounded-2xl border space-y-3 bg-emerald-50/50 border-emerald-500 text-slate-900 shadow-md dark:bg-slate-900 dark:border-emerald-500/30 dark:text-slate-100">
                <span className="text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                  🗓️ 2. Horizonte Temporal y Modalidad Dialítica
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-bold flex gap-1">Periodo Base (<MathJaxFormula formula="t_0" />)</label>
                    <select value={t0} onChange={e => setT0(e.target.value)} className="w-full text-xs font-bold p-1.5 rounded border focus:outline-none bg-white border-slate-300 dark:bg-slate-950 dark:border-slate-700">
                      {periodosT0Filtrados.map(p => <option key={p.periodo} value={p.periodo}>{p.label}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-bold flex gap-1">Periodo Actual (<MathJaxFormula formula="t" />)</label>
                    <select value={t} onChange={e => setT(e.target.value)} className="w-full text-xs font-bold p-1.5 rounded border focus:outline-none bg-white border-slate-300 dark:bg-slate-950 dark:border-slate-700">
                      {periodosTFiltrados.map(p => <option key={p.periodo} value={p.periodo}>{p.label}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-bold">Modalidad de Tratamiento</label>
                    <select value={modalidad} onChange={e => setModalidad(e.target.value)} className="w-full text-xs font-bold p-1.5 rounded border focus:outline-none bg-white border-slate-300 dark:bg-slate-950 dark:border-slate-700">
                      {opcionesModalidades.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* DASHBOARD RESULTADOS */}
          <div className="p-6 rounded-2xl border-2 shadow-xl flex flex-col gap-6 bg-white border-emerald-600 ring-2 ring-emerald-600/20 dark:bg-slate-900 dark:border-emerald-500/60 dark:ring-1 dark:ring-emerald-500/30">

            {/* Cabeceras de métricas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Arancel Real t0 */}
              <div className="p-4 rounded-xl border text-center space-y-1 bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Arancel Real en <MathJaxFormula formula="t_0" /></span>
                <span className="text-xl font-black text-slate-900 dark:text-white">${Math.round(dataT0[modObj.campoExcel] || 0).toLocaleString('es-AR')}</span>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">{modObj.tipoBrecha}</p>
              </div>

              {/* Indice Polinomico */}
              <div className="p-4 rounded-xl border text-center space-y-1 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-800">
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider block">Índice Polinómico <MathJaxFormula formula="I^P_t" /></span>
                <span className="text-xl font-black text-indigo-900 dark:text-indigo-100">{fmtAR(iP, 4)}x</span>
                <p className="text-[11px] text-indigo-500 font-mono mt-1">CCT: {fmtAR(iCCT, 2)}x | USD: {fmtAR(iUSD, 2)}x | IPC: {fmtAR(iIPC, 2)}x</p>
              </div>

              {/* Arancel Real t */}
              <div className="p-4 rounded-xl border text-center space-y-1 bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Arancel Pagado en <MathJaxFormula formula="t" /></span>
                <span className="text-xl font-black text-slate-900 dark:text-white">${Math.round(vReal).toLocaleString('es-AR')}</span>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">{modObj.tipoBrecha}</p>
              </div>
            </div>

            {/* Resultado Principal (Valor Teorico y Brecha) */}
            <div className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center text-center gap-5 shadow-inner ${brecha < 0 ? 'bg-red-50 border-red-500 dark:bg-red-950/30 dark:border-red-500/50' : 'bg-emerald-50 border-emerald-500 dark:bg-emerald-950/30 dark:border-emerald-500/50'}`}>
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                  Paridad Técnica Arancelaria Requerida (<MathJaxFormula formula="V^P_t" />)
                </span>
                <div className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                  ${Math.round(vP).toLocaleString('es-AR')} <span className="text-sm font-normal text-slate-400">ARS</span>
                </div>
              </div>

              <div className="w-full h-0.5 bg-slate-300 dark:bg-slate-700/50"></div>

              <div className="w-full flex flex-col md:flex-row items-center md:items-start justify-around gap-6 text-center md:text-left">
                {/* Lado izquierdo: Brecha */}
                <div className="flex flex-col items-center md:items-start space-y-1">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                    {brecha < 0 ? 'Brecha Identificada' : 'Resultado de Paridad'}
                  </span>
                  <div className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight ${brecha < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {brecha < 0 ? `Pérdida del ${fmtAR(Math.abs(brecha), 2)} %` : `Suficiencia del ${fmtAR(brecha, 2)} %`}
                  </div>
                  <span className={`inline-block mt-1 text-xs font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded ${brecha < 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'}`}>
                    {modObj.tipoBrecha}
                  </span>
                </div>

                {/* Lado derecho: Incremento */}
                {brecha < 0 && (
                  <div className="flex flex-col items-center md:items-start space-y-1 border-t md:border-t-0 md:border-l border-slate-300/60 dark:border-slate-800/60 pt-4 md:pt-0 md:pl-8">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                      El precio actual debería
                    </span>
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-indigo-600 dark:text-indigo-400">
                      Incrementarse un {fmtAR(pctIncremento, 2)} %
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">
                      para que el valor vigente equipare el valor de paridad técnica
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Fórmulas Evaluadas (Leyenda) */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl text-center space-y-2 border border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Ecuación Final Evaluada con Datos:</h4>
                <div className="overflow-x-auto py-2">
                  {isValidSum ? (
                    <MathJaxFormula formula={`V^P_{${t.split('-').reverse().join('/')}} = ${fmtLatex(Math.round(dataT0[modObj.campoExcel] || 0), 0)} \\cdot \\left[ ${fmtLatex(wCCT / 100, 2)} \\cdot \\left( ${fmtLatex(iCCT, 3)} \\right) + ${fmtLatex(wUSD / 100, 2)} \\cdot \\left( ${fmtLatex(iUSD, 3)} \\right) + ${fmtLatex(wIPC / 100, 2)} \\cdot \\left( ${fmtLatex(iIPC, 3)} \\right) \\right] = ${fmtLatex(Math.round(vP), 0)} \\text{ (${modObj.tipoBrecha})}`} />
                  ) : (
                    <span className="text-red-500 font-bold text-xs">Corrige la suma de pesos para ver la ecuación.</span>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

