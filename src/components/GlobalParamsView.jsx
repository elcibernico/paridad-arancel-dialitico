import React, { useState } from 'react';
import { useGlobalParams } from '../context/GlobalContext';

const opcionesComorbilidades = [
  { id: 'BASAL', nombre: 'Sin Comorbilidad Severa (Basal)' },
  { id: 'DBT', nombre: 'Nefropatía Diabética (DBT)' },
  { id: 'EVP', font_bold: true, nombre: 'Enfermedad Vascular Periférica (EVP)' },
  { id: 'DBT_EVP', nombre: 'Nefropatía Diabética + EVP (Comb. Frecuente)' },
  { id: 'ECV', nombre: 'Enfermedad Cerebrovascular (ECV)' },
  { id: 'ICC', nombre: 'Insuficiencia Cardíaca Congestiva (ICC)' },
  { id: 'NEO', nombre: 'Neoplasia Activa (Últimos 5 años)' },
  { id: 'ALB', nombre: 'Albuminemia Inicial < 3.5 g/dL' },
  { id: 'HIV', nombre: 'HIV Positivo al Ingreso' }
];

export default function GlobalParamsView() {
  const [mostrarSerie, setMostrarSerie] = useState(false);
  const [actualizando, setActualizando] = useState(false);
  
  const {
    modalidadDialitica, setModalidadDialitica,
    comorbilidadIngreso, setComorbilidadIngreso,
    edadPaciente, setEdadPaciente,
    tasaCrecimientoVaad, setTasaCrecimientoVaad,
    tasaDescuento, setTasaDescuento,
    periodoDesde, setPeriodoDesde,
    periodoHasta, setPeriodoHasta,
    momentoCalculatorio, setMomentoCalculatorio,
    mesesProyeccion, setMesesProyeccion,
    incidencias, setIncidencias,
    lambdaRidge, setLambdaRidge,
    expectativas, setExpectativas,
    plazoPago, setPlazoPago,
    padronPacientes, setPadronPacientes,
    sesionesMensuales, setSesionesMensuales,
    aplicarCalidad, setAplicarCalidad,
    seriesData
  } = useGlobalParams();

  const handleActualizarSerie = async () => {
    setActualizando(true);
    try {
      const response = await fetch('/api/update-series-data');
      const data = await response.json();
      if (response.ok && data.success) {
        alert(`¡Serie de datos actualizada exitosamente!\nSe importaron ${data.count} registros oficiales desde seriesData.xlsx.`);
        window.location.reload();
      } else {
        alert(`Error al actualizar la serie de datos: ${data.error || 'Respuesta inesperada'}`);
      }
    } catch (error) {
      alert(`Error al conectar con la rutina de actualización: ${error.message}`);
    } finally {
      setActualizando(false);
    }
  };

  const handleIncidenciaChange = (field, val) => {
    setIncidencias(prev => ({ ...prev, [field]: Number(val) }));
  };

  const handleExpectativaChange = (field, val) => {
    setExpectativas(prev => ({ ...prev, [field]: Number(val) }));
  };

  const totalIncidencias = (incidencias.cct || 0) + (incidencias.usd || 0) + (incidencias.ipc || 0);
  const esSumaValida = totalIncidencias === 100;

  const handleAjustarCCT = () => {
    setIncidencias(prev => ({ ...prev, cct: Math.max(0, 100 - (prev.usd || 0) - (prev.ipc || 0)) }));
  };
  const handleAjustarUSD = () => {
    setIncidencias(prev => ({ ...prev, usd: Math.max(0, 100 - (prev.cct || 0) - (prev.ipc || 0)) }));
  };
  const handleAjustarIPC = () => {
    setIncidencias(prev => ({ ...prev, ipc: Math.max(0, 100 - (prev.cct || 0) - (prev.usd || 0)) }));
  };
  const handleRestablecerIncidencias = () => {
    setIncidencias({ cct: 40, usd: 30, ipc: 30 });
  };

  return (
    <div className="max-w-[98%] mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="border-b pb-4 mb-6 border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Parámetros Globales del Modelo</h2>
          <p className="text-sm text-slate-400 mt-1">Configuración centralizada de variables de simulación actuarial, macroeconómica y econométrica.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={handleActualizarSerie}
            disabled={actualizando}
            className={`bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium px-4 py-2.5 rounded-xl transition duration-150 shadow-md flex items-center gap-1.5 cursor-pointer ${actualizando ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {actualizando ? '⏳ Procesando...' : '🔄 Actualizar Serie de Datos'}
          </button>
          <button
            onClick={() => setMostrarSerie(true)}
            className="bg-teal-500 hover:bg-teal-600 text-slate-950 text-xs font-medium px-4 py-2.5 rounded-xl transition duration-150 shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            📊 Ver Serie de Datos
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* COLUMNA 1: ACTUARIAL Y POBLACIÓN */}
        <div className="p-6 rounded-2xl border bg-slate-900/40 border-slate-850 space-y-5">
          <h3 className="text-base font-bold text-teal-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
            <span>Actuarial y Población</span>
          </h3>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-300 block">Modalidad Dialítica</label>
            <select
              value={modalidadDialitica}
              onChange={(e) => setModalidadDialitica(e.target.value)}
              className="w-full text-sm font-bold py-2.5 px-3 rounded-lg border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="HD">Hemodiálisis Convencional (HD)</option>
              <option value="HDF">Hemodiafiltración en Línea (HDF)</option>
              <option value="DP">Diálisis Peritoneal (DP)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-300 block">Comorbilidad de Ingreso</label>
            <select
              value={comorbilidadIngreso}
              onChange={(e) => setComorbilidadIngreso(e.target.value)}
              className="w-full text-sm font-bold py-2.5 px-3 rounded-lg border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              {opcionesComorbilidades.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-sm font-bold text-slate-300">
              <span>Edad del Paciente</span>
              <span className="text-teal-400 font-mono">{edadPaciente} años</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number" min="18" max="90"
                value={edadPaciente}
                onChange={(e) => setEdadPaciente(Math.min(90, Math.max(18, Number(e.target.value))))}
                className="w-24 text-sm font-bold py-1.5 px-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-teal-500 text-center"
              />
              <input
                type="range" min="18" max="90" step="1"
                value={edadPaciente}
                onChange={(e) => setEdadPaciente(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-sm font-bold text-slate-300">
              <span>Tasa Crecimiento Valores VAAD</span>
              <span className="text-teal-400 font-mono">{tasaCrecimientoVaad} % mensual</span>
            </div>
            <input
              type="range" min="0" max="45" step="0.5"
              value={tasaCrecimientoVaad}
              onChange={(e) => setTasaCrecimientoVaad(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm font-bold text-slate-300">
              <span>Pacientes Activos</span>
              <span className="text-teal-400 font-mono">{padronPacientes} ptes</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number" min="1" max="1000"
                value={padronPacientes}
                onChange={(e) => setPadronPacientes(Math.max(1, Number(e.target.value)))}
                className="w-24 text-sm font-bold py-1.5 px-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-teal-500 text-center"
              />
              <input
                type="range" min="1" max="1000" step="1"
                value={padronPacientes}
                onChange={(e) => setPadronPacientes(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm font-bold text-slate-300">
              <span>Sesiones Promedio Mes</span>
              <span className="text-teal-400 font-mono">{sesionesMensuales} ses/mes</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number" min="1" max="30"
                value={sesionesMensuales}
                onChange={(e) => setSesionesMensuales(Math.max(1, Number(e.target.value)))}
                className="w-24 text-sm font-bold py-1.5 px-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-teal-500 text-center"
              />
              <input
                type="range" min="1" max="30" step="1"
                value={sesionesMensuales}
                onChange={(e) => setSesionesMensuales(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
            </div>
          </div>

        </div>

        {/* COLUMNA 2: FINANCIERO Y PROYECCIONES */}
        <div className="p-6 rounded-2xl border bg-slate-900/40 border-slate-850 space-y-5">
          <h3 className="text-base font-bold text-teal-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
            <span>Financiero y Proyecciones</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-300 block">Período Desde</label>
              <select
                value={periodoDesde}
                onChange={(e) => setPeriodoDesde(e.target.value)}
                className="w-full text-sm font-bold py-2.5 px-3 rounded-lg border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                {seriesData.map(p => (
                  <option key={p.periodo} value={p.periodo}>{p.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-300 block">Período Hasta</label>
              <select
                value={periodoHasta}
                onChange={(e) => setPeriodoHasta(e.target.value)}
                className="w-full text-sm font-bold py-2.5 px-3 rounded-lg border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                {seriesData.filter(p => p.periodo > periodoDesde).map(p => (
                  <option key={p.periodo} value={p.periodo}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-sm font-bold text-slate-300">
              <span>Tasa de corte para cálculos financieros (TNA)</span>
              <span className="text-teal-400 font-mono text-sm">{tasaDescuento} % anual</span>
            </div>
            <input
              type="range" min="0" max="150" step="1"
              value={tasaDescuento}
              onChange={(e) => setTasaDescuento(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 block">Expectativas MENSUALES a Futuro (%)</label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="flex justify-between text-xs text-slate-400 font-bold mb-1">
                  <span>IPC</span>
                  <span className="text-teal-400 font-mono text-xs">{expectativas.ipc}%</span>
                </div>
                <input
                  type="range" min="0" max="20" step="0.1"
                  value={expectativas.ipc}
                  onChange={(e) => handleExpectativaChange('ipc', e.target.value)}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 font-bold mb-1">
                  <span>USD</span>
                  <span className="text-teal-400 font-mono text-xs">{expectativas.usd}%</span>
                </div>
                <input
                  type="range" min="0" max="20" step="0.1"
                  value={expectativas.usd}
                  onChange={(e) => handleExpectativaChange('usd', e.target.value)}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 font-bold mb-1">
                  <span>CCT</span>
                  <span className="text-teal-400 font-mono text-xs">{expectativas.cct}%</span>
                </div>
                <input
                  type="range" min="0" max="20" step="0.1"
                  value={expectativas.cct}
                  onChange={(e) => handleExpectativaChange('cct', e.target.value)}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-sm font-bold text-slate-300">
              <span>Plazo de Pago de Financiadora</span>
              <span className="text-teal-400 font-mono text-sm">{plazoPago} días</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number" min="0" max="180" step="15"
                value={plazoPago}
                onChange={(e) => setPlazoPago(Math.max(0, Number(e.target.value)))}
                className="w-24 text-sm font-bold py-1.5 px-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-teal-500 text-center"
              />
              <input
                type="range" min="0" max="180" step="5"
                value={plazoPago}
                onChange={(e) => setPlazoPago(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-300 block">Meses Proyección Técnico</label>
            <div className="flex justify-between items-center gap-2 mt-1">
              {[3, 6, 9, 12].map(m => (
                <button
                  key={m}
                  onClick={() => setMesesProyeccion(m)}
                  className={`flex-1 py-2 rounded-lg text-sm font-black transition ${mesesProyeccion === m
                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                    : 'bg-slate-950 text-slate-400 border border-slate-850 hover:bg-slate-900'
                    }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm font-bold text-slate-300 shrink-0">Momento Calculatorio</label>
              <select
                value={momentoCalculatorio}
                onChange={(e) => setMomentoCalculatorio(e.target.value)}
                className="flex-1 text-sm font-bold py-2.5 px-3 rounded-lg border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                {seriesData.map(p => (
                  <option key={p.periodo} value={p.periodo}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm font-bold text-slate-300 shrink-0">Carga por Calidad</label>
              <div className="grid grid-cols-2 gap-2 mt-1 w-56 shrink-0">
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
                  className={`p-2 rounded-xl text-xs font-bold border transition-all uppercase tracking-wider cursor-pointer ${aplicarCalidad ? 'bg-teal-950/50 border-teal-500 text-teal-400' : 'bg-slate-950 border-slate-850 text-slate-500 hover:border-slate-700'}`}
                >
                  Con Calidad
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA 3: MACROECONOMÍA Y BASE */}
        <div className="p-6 rounded-2xl border bg-slate-900/40 border-slate-850 space-y-5">
          <h3 className="text-base font-bold text-teal-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
            <span>Macroeconomía y Penalización Ridge</span>
          </h3>

          <div className="space-y-3 p-4 rounded-xl border bg-slate-950/60 border-slate-800">
            <div className="flex items-center justify-between border-b pb-2 border-slate-800">
              <label className="text-sm font-bold text-slate-300">Estructura Incidencias Relativas (%)</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRestablecerIncidencias}
                  title="Restablecer a estándar 40% CCT, 30% USD, 30% IPC"
                  className="text-xs font-bold px-2 py-0.5 rounded border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  ↺ Reset
                </button>
                <span className={`text-xs font-black px-2 py-0.5 rounded font-mono border ${esSumaValida
                  ? 'bg-teal-500/20 text-teal-400 border-teal-500/30'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse'
                  }`}>
                  Σ = {totalIncidencias}% {esSumaValida ? '✓' : '• Inválido'}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {/* CCT */}
              <div className="p-3 rounded-lg border border-slate-850 bg-slate-900/50 space-y-2">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-300">Laboral (CCT / Salarios)</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number" min="0" max="100"
                      value={incidencias.cct}
                      onChange={(e) => handleIncidenciaChange('cct', e.target.value)}
                      className="w-18 text-sm font-mono font-bold py-1 px-1.5 rounded bg-slate-950 border border-slate-800 text-teal-400 text-center"
                    />
                    <span className="text-teal-400 font-mono text-sm">%</span>
                  </div>
                </div>
                <input
                  type="range" min="0" max="100" step="1"
                  value={incidencias.cct}
                  onChange={(e) => handleIncidenciaChange('cct', e.target.value)}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
                <button
                  onClick={handleAjustarCCT}
                  className="w-full text-xs font-bold py-1 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-teal-300 hover:border-teal-500/40 transition cursor-pointer"
                >
                  ⇆ Ajustar CCT a Resto ({Math.max(0, 100 - (incidencias.usd || 0) - (incidencias.ipc || 0))}%)
                </button>
              </div>

              {/* USD */}
              <div className="p-3 rounded-lg border border-slate-850 bg-slate-900/50 space-y-2">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-300">Insumos y Dolarizados (USD)</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number" min="0" max="100"
                      value={incidencias.usd}
                      onChange={(e) => handleIncidenciaChange('usd', e.target.value)}
                      className="w-18 text-sm font-mono font-bold py-1 px-1.5 rounded bg-slate-950 border border-slate-800 text-teal-400 text-center"
                    />
                    <span className="text-teal-400 font-mono text-sm">%</span>
                  </div>
                </div>
                <input
                  type="range" min="0" max="100" step="1"
                  value={incidencias.usd}
                  onChange={(e) => handleIncidenciaChange('usd', e.target.value)}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
                <button
                  onClick={handleAjustarUSD}
                  className="w-full text-xs font-bold py-1 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-teal-300 hover:border-teal-500/40 transition cursor-pointer"
                >
                  ⇆ Ajustar USD a Resto ({Math.max(0, 100 - (incidencias.cct || 0) - (incidencias.ipc || 0))}%)
                </button>
              </div>

              {/* IPC */}
              <div className="p-3 rounded-lg border border-slate-850 bg-slate-900/50 space-y-2">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-300">Insumos y Servicios (IPC)</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number" min="0" max="100"
                      value={incidencias.ipc}
                      onChange={(e) => handleIncidenciaChange('ipc', e.target.value)}
                      className="w-18 text-sm font-mono font-bold py-1 px-1.5 rounded bg-slate-950 border border-slate-800 text-teal-400 text-center"
                    />
                    <span className="text-teal-400 font-mono text-sm">%</span>
                  </div>
                </div>
                <input
                  type="range" min="0" max="100" step="1"
                  value={incidencias.ipc}
                  onChange={(e) => handleIncidenciaChange('ipc', e.target.value)}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
                <button
                  onClick={handleAjustarIPC}
                  className="w-full text-xs font-bold py-1 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-teal-300 hover:border-teal-500/40 transition cursor-pointer"
                >
                  ⇆ Ajustar IPC a Resto ({Math.max(0, 100 - (incidencias.cct || 0) - (incidencias.usd || 0))}%)
                </button>
              </div>

            </div>

            {!esSumaValida && (
              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 font-medium leading-relaxed mt-2">
                ⚠️ <strong>Error de Ponderación:</strong> La suma de los tres factores debe dar exactamente 100% (Actual: {totalIncidencias}%). Usa los botones de ajuste anteriores para corregir el desfasaje.
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-sm font-bold text-slate-300">
              <span>Factor Penalización Lambda Ridge</span>
              <span className="text-teal-400 font-mono text-sm">{lambdaRidge}</span>
            </div>
            <input
              type="range" min="0" max="0.0005" step="0.00001"
              value={lambdaRidge}
              onChange={(e) => setLambdaRidge(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
          </div>
        </div>

      </div>

      {/* MODAL DE SERIE DE DATOS HISTÓRICOS */}
      {mostrarSerie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-6xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Cabecera del Modal */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
              <div>
                <h3 className="text-lg font-black text-teal-400">📊 Serie de Datos Históricos del Modelo</h3>
                <p className="text-xs text-slate-400">Registro histórico de aranceles de sesión/módulo, calidad e índices de referencia.</p>
              </div>
              <button
                onClick={() => setMostrarSerie(false)}
                className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center transition duration-150 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Contenido del Modal (Tabla con scroll) */}
            <div className="flex-1 overflow-auto p-4">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-2.5 sticky top-0 bg-slate-950 z-10 border-b border-slate-800 text-center">Mes</th>
                    <th className="p-2.5 sticky top-0 bg-slate-950 z-10 border-b border-slate-800">Resolución</th>
                    <th className="p-2.5 sticky top-0 bg-slate-950 z-10 border-b border-slate-800 text-right text-sky-400">Sesión HD</th>
                    <th className="p-2.5 sticky top-0 bg-slate-950 z-10 border-b border-slate-800 text-right text-sky-400">Sesión HDF</th>
                    <th className="p-2.5 sticky top-0 bg-slate-950 z-10 border-b border-slate-800 text-right text-sky-400">Módulo DP</th>
                    <th className="p-2.5 sticky top-0 bg-slate-950 z-10 border-b border-slate-800 text-right text-emerald-400">Calidad (%)</th>
                    <th className="p-2.5 sticky top-0 bg-slate-950 z-10 border-b border-slate-800 text-right text-yellow-500">Índice IPC</th>
                    <th className="p-2.5 sticky top-0 bg-slate-950 z-10 border-b border-slate-800 text-right text-cyan-400">Dólar USD</th>
                    <th className="p-2.5 sticky top-0 bg-slate-950 z-10 border-b border-slate-800 text-right text-orange-400">Salario CCT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 bg-slate-900/10 font-mono text-[11px]">
                  {seriesData.map((d, index) => (
                    <tr key={index} className="hover:bg-slate-950/40 text-slate-300">
                      <td className="p-2.5 text-center text-slate-400 font-bold font-sans">{d.label}</td>
                      <td className="p-2.5 text-slate-500 text-[10px] font-sans">{d.resolucion || '-'}</td>
                      <td className="p-2.5 text-right text-sky-300">${Math.round(d.valorSesionHD).toLocaleString('es-AR')}</td>
                      <td className="p-2.5 text-right text-sky-300">${Math.round(d.valorSesionHDF).toLocaleString('es-AR')}</td>
                      <td className="p-2.5 text-right text-sky-300">${Math.round(d.valorModuloDP).toLocaleString('es-AR')}</td>
                      <td className="p-2.5 text-right text-emerald-400 font-bold">{(d.porcentajeCalidad * 100).toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%</td>
                      <td className="p-2.5 text-right text-yellow-400">{Number(d.ipc).toLocaleString('es-AR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</td>
                      <td className="p-2.5 text-right text-cyan-300">${Number(d.usd).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="p-2.5 text-right text-orange-300">${Number(d.cct).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pie del Modal */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/20 flex justify-between items-center">
              <span className="text-[10px] text-slate-500 font-sans">
                Total de registros históricos: {seriesData.length} meses
              </span>
              <button
                onClick={() => setMostrarSerie(false)}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition duration-150 cursor-pointer"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

