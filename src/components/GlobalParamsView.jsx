import React from 'react';
import { useGlobalParams } from '../context/GlobalContext';
import seriesData from '../data/seriesData.json';

const opcionesComorbilidades = [
  { id: 'BASAL', nombre: 'Sin Comorbilidad Severa (Basal)' },
  { id: 'DBT', nombre: 'Nefropatía Diabética (DBT)' },
  { id: 'EVP', nombre: 'Enfermedad Vascular Periférica (EVP)' },
  { id: 'DBT_EVP', nombre: 'Nefropatía Diabética + EVP (Comb. Frecuente)' },
  { id: 'ECV', nombre: 'Enfermedad Cerebrovascular (ECV)' },
  { id: 'ICC', nombre: 'Insuficiencia Cardíaca Congestiva (ICC)' },
  { id: 'NEO', nombre: 'Neoplasia Activa (Últimos 5 años)' },
  { id: 'ALB', nombre: 'Albuminemia Inicial < 3.5 g/dL' },
  { id: 'HIV', nombre: 'HIV Positivo al Ingreso' }
];

export default function GlobalParamsView() {
  const {
    modalidadDialitica, setModalidadDialitica,
    comorbilidadIngreso, setComorbilidadIngreso,
    edadPaciente, setEdadPaciente,
    tasaCrecimientoVaad, setTasaCrecimientoVaad,
    tasaDescuento, setTasaDescuento,
    periodoDesde, setPeriodoDesde,
    periodoHasta, setPeriodoHasta,
    mesesProyeccion, setMesesProyeccion,
    incidencias, setIncidencias,
    lambdaRidge, setLambdaRidge,
    expectativas, setExpectativas,
    plazoPago, setPlazoPago,
    padronPacientes, setPadronPacientes,
    sesionesMensuales, setSesionesMensuales
  } = useGlobalParams();

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
    <div className="max-w-[95%] mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="border-b pb-4 mb-6 border-slate-800">
        <h2 className="text-3xl font-extrabold text-white">Parámetros Globales del Modelo</h2>
        <p className="text-sm text-slate-400 mt-1">Configuración centralizada de variables de simulación actuarial, macroeconómica y econométrica.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* COLUMNA 1: ACTUARIAL Y POBLACIÓN */}
        <div className="p-6 rounded-2xl border bg-slate-900/40 border-slate-850 space-y-5">
          <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
            <span>Actuarial y Población</span>
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">Modalidad Dialítica</label>
            <select
              value={modalidadDialitica}
              onChange={(e) => setModalidadDialitica(e.target.value)}
              className="w-full text-xs font-bold py-2.5 px-3 rounded-lg border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="HD">Hemodiálisis Convencional (HD)</option>
              <option value="HDF">Hemodiafiltración en Línea (HDF)</option>
              <option value="DP">Diálisis Peritoneal (DP)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">Comorbilidad de Ingreso</label>
            <select
              value={comorbilidadIngreso}
              onChange={(e) => setComorbilidadIngreso(e.target.value)}
              className="w-full text-xs font-bold py-2.5 px-3 rounded-lg border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              {opcionesComorbilidades.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-300">
              <span>Edad del Paciente</span>
              <span className="text-teal-400 font-mono">{edadPaciente} años</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number" min="18" max="90"
                value={edadPaciente}
                onChange={(e) => setEdadPaciente(Math.min(90, Math.max(18, Number(e.target.value))))}
                className="w-20 text-xs font-bold py-1.5 px-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-teal-500 text-center"
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
            <div className="flex justify-between text-xs font-bold text-slate-300">
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
            <div className="flex justify-between text-xs font-bold text-slate-300">
              <span>Pacientes Activos</span>
              <span className="text-teal-400 font-mono">{padronPacientes} ptes</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number" min="1" max="1000"
                value={padronPacientes}
                onChange={(e) => setPadronPacientes(Math.max(1, Number(e.target.value)))}
                className="w-20 text-xs font-bold py-1.5 px-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-teal-500 text-center"
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
            <div className="flex justify-between text-xs font-bold text-slate-300">
              <span>Sesiones Promedio Mes</span>
              <span className="text-teal-400 font-mono">{sesionesMensuales} ses/mes</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number" min="1" max="30"
                value={sesionesMensuales}
                onChange={(e) => setSesionesMensuales(Math.max(1, Number(e.target.value)))}
                className="w-20 text-xs font-bold py-1.5 px-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-teal-500 text-center"
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
          <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
            <span>Financiero y Proyecciones</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Período Desde</label>
              <select
                value={periodoDesde}
                onChange={(e) => setPeriodoDesde(e.target.value)}
                className="w-full text-xs font-bold py-2.5 px-3 rounded-lg border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                {seriesData.map(p => (
                  <option key={p.periodo} value={p.periodo}>{p.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Período Hasta</label>
              <select
                value={periodoHasta}
                onChange={(e) => setPeriodoHasta(e.target.value)}
                className="w-full text-xs font-bold py-2.5 px-3 rounded-lg border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                {seriesData.filter(p => p.periodo > periodoDesde).map(p => (
                  <option key={p.periodo} value={p.periodo}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-300">
              <span>Tasa de Descuento Actuarial (TNA)</span>
              <span className="text-teal-400 font-mono">{tasaDescuento} % anual</span>
            </div>
            <input
              type="range" min="0" max="150" step="1"
              value={tasaDescuento}
              onChange={(e) => setTasaDescuento(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">Expectativas MENSUALES a Futuro (%)</label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1">
                  <span>IPC</span>
                  <span className="text-teal-400 font-mono">{expectativas.ipc}%</span>
                </div>
                <input
                  type="range" min="0" max="20" step="0.1"
                  value={expectativas.ipc}
                  onChange={(e) => handleExpectativaChange('ipc', e.target.value)}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1">
                  <span>USD</span>
                  <span className="text-teal-400 font-mono">{expectativas.usd}%</span>
                </div>
                <input
                  type="range" min="0" max="20" step="0.1"
                  value={expectativas.usd}
                  onChange={(e) => handleExpectativaChange('usd', e.target.value)}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1">
                  <span>CCT</span>
                  <span className="text-teal-400 font-mono">{expectativas.cct}%</span>
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
            <div className="flex justify-between text-xs font-bold text-slate-300">
              <span>Plazo de Pago de Financiadora</span>
              <span className="text-teal-400 font-mono">{plazoPago} días</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number" min="0" max="180" step="15"
                value={plazoPago}
                onChange={(e) => setPlazoPago(Math.max(0, Number(e.target.value)))}
                className="w-20 text-xs font-bold py-1.5 px-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-teal-500 text-center"
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
            <label className="text-xs font-bold text-slate-300 block">Meses Proyección Técnico</label>
            <div className="flex justify-between items-center gap-2 mt-1">
              {[3, 6, 9, 12].map(m => (
                <button
                  key={m}
                  onClick={() => setMesesProyeccion(m)}
                  className={`flex-1 py-2 rounded-lg text-xs font-black transition ${mesesProyeccion === m
                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                    : 'bg-slate-950 text-slate-400 border border-slate-850 hover:bg-slate-900'
                    }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMNA 3: MACROECONOMÍA Y BASE */}
        <div className="p-6 rounded-2xl border bg-slate-900/40 border-slate-850 space-y-5">
          <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
            <span>Macroeconomía y Penalización Ridge</span>
          </h3>



          <div className="space-y-3 p-4 rounded-xl border bg-slate-950/60 border-slate-800">
            <div className="flex items-center justify-between border-b pb-2 border-slate-800">
              <label className="text-xs font-bold text-slate-300">Estructura Incidencias Relativas (%)</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRestablecerIncidencias}
                  title="Restablecer a estándar 40% CCT, 30% USD, 30% IPC"
                  className="text-[10px] font-bold px-2 py-0.5 rounded border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  ↺ Reset
                </button>
                <span className={`text-[11px] font-black px-2 py-0.5 rounded font-mono border ${esSumaValida
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
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-300">Laboral (CCT / Salarios)</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number" min="0" max="100"
                      value={incidencias.cct}
                      onChange={(e) => handleIncidenciaChange('cct', e.target.value)}
                      className="w-14 text-xs font-mono font-bold py-1 px-1.5 rounded bg-slate-950 border border-slate-800 text-teal-400 text-center"
                    />
                    <span className="text-teal-400 font-mono text-xs">%</span>
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
                  className="w-full text-[10px] font-bold py-1 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-teal-300 hover:border-teal-500/40 transition cursor-pointer"
                >
                  ⇆ Ajustar CCT a Resto ({Math.max(0, 100 - (incidencias.usd || 0) - (incidencias.ipc || 0))}%)
                </button>
              </div>

              {/* USD */}
              <div className="p-3 rounded-lg border border-slate-850 bg-slate-900/50 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-300">Insumos y Dolarizados (USD)</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number" min="0" max="100"
                      value={incidencias.usd}
                      onChange={(e) => handleIncidenciaChange('usd', e.target.value)}
                      className="w-14 text-xs font-mono font-bold py-1 px-1.5 rounded bg-slate-950 border border-slate-800 text-teal-400 text-center"
                    />
                    <span className="text-teal-400 font-mono text-xs">%</span>
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
                  className="w-full text-[10px] font-bold py-1 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-teal-300 hover:border-teal-500/40 transition cursor-pointer"
                >
                  ⇆ Ajustar USD a Resto ({Math.max(0, 100 - (incidencias.cct || 0) - (incidencias.ipc || 0))}%)
                </button>
              </div>

              {/* IPC */}
              <div className="p-3 rounded-lg border border-slate-850 bg-slate-900/50 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-300">Insumos y Servicios (IPC)</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number" min="0" max="100"
                      value={incidencias.ipc}
                      onChange={(e) => handleIncidenciaChange('ipc', e.target.value)}
                      className="w-14 text-xs font-mono font-bold py-1 px-1.5 rounded bg-slate-950 border border-slate-800 text-teal-400 text-center"
                    />
                    <span className="text-teal-400 font-mono text-xs">%</span>
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
                  className="w-full text-[10px] font-bold py-1 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-teal-300 hover:border-teal-500/40 transition cursor-pointer"
                >
                  ⇆ Ajustar IPC a Resto ({Math.max(0, 100 - (incidencias.cct || 0) - (incidencias.usd || 0))}%)
                </button>
              </div>

            </div>

            {!esSumaValida && (
              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-[11px] text-rose-300 font-medium leading-relaxed mt-2">
                ⚠️ <strong>Error de Ponderación:</strong> La suma de los tres factores debe dar exactamente 100% (Actual: {totalIncidencias}%). Usa los botones de ajuste anteriores para corregir el desfasaje.
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-300">
              <span>Factor Penalización Lambda Ridge</span>
              <span className="text-teal-400 font-mono">{lambdaRidge}</span>
            </div>
            <input
              type="range" min="0" max="0.001" step="0.00001"
              value={lambdaRidge}
              onChange={(e) => setLambdaRidge(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
          </div>
        </div>

      </div>
    </div>
  );
}

