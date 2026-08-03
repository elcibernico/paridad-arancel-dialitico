import React, { useState, useMemo } from 'react';
import { MathJaxFormula } from '../MathJaxFormula';
import seriesData from '../../data/seriesData.json';
import { fmtAR } from '../../utils/format';

export default function Punto12() {
  const opcionesModalidades = [
    { id: 'HD', nombre: 'Hemodiálisis Convencional (HD)', campoExcel: 'valorSesionHD' },
    { id: 'DP', nombre: 'Diálisis Peritoneal (DP)', campoExcel: 'valorModuloDP' },
    { id: 'HDF', nombre: 'Hemodiafiltración en Línea (HDF)', campoExcel: 'valorSesionHDF' }
  ];
  const [modalidad, setModalidad] = useState('HD');

  // Corte temporal
  const defaultHasta = seriesData[seriesData.length - 1];
  const [tHasta, setTHasta] = useState(defaultHasta.periodo);

  // Expectativas heredadas/configurables
  const [gIPC, setGIPC] = useState(5.0); // % mensual
  const [gUSD, setGUSD] = useState(4.0); // % mensual
  const [gCCT, setGCCT] = useState(4.5); // % mensual

  // Time Lag y Descuento
  const [timeLagDays, setTimeLagDays] = useState(60); // 0 a 180 días
  const [tna, setTna] = useState(25.0); // TNA %

  const [mostrarMath, setMostrarMath] = useState(false);

  const periodosHastaFiltrados = seriesData.filter(p => p.periodo);

  // Computaciones del Time Lag
  const calculations = useMemo(() => {
    const dataCorte = seriesData.find(d => d.periodo === tHasta);
    if (!dataCorte) return null;

    const modObj = opcionesModalidades.find(m => m.id === modalidad) || opcionesModalidades[0];
    const Y_nominal = dataCorte[modObj.campoExcel];

    // Meses de atraso
    const mesesAtraso = timeLagDays / 30;

    // Conversión TNA a TEM
    // TEM = TNA / 12 (capitalización simple mensual)
    const tem = (tna / 100) / 12;

    // Descuento Financiero (Costo de Oportunidad)
    const factorDescuento = Math.pow(1 + tem, mesesAtraso);
    const Y_descontado = Y_nominal / factorDescuento;
    const lossDescuento = Y_nominal - Y_descontado;

    // Descuento por Inflación (Erosión del Poder Adquisitivo)
    // Se aplica la inflación g_IPC acumulada durante los meses de atraso
    const factorInflacion = Math.pow(1 + gIPC / 100, mesesAtraso);
    const Y_real = Y_descontado / factorInflacion;
    const lossInflacion = Y_descontado - Y_real;

    const lossTotal = Y_nominal - Y_real;
    const lossPct = (lossTotal / Y_nominal) * 100;

    // Costo Polinómico de referencia en el mes
    const baseRef = seriesData[0];
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
  }, [tHasta, modalidad, gIPC, timeLagDays, tna]);

  // Dimensiones del gráfico de cascada
  const svgWidth = 460;
  const svgHeight = 220;
  const margin = { top: 30, right: 30, bottom: 40, left: 60 };

  const waterfallBars = useMemo(() => {
    if (!calculations) return [];
    const { Y_nominal, lossDescuento, lossInflacion, Y_real } = calculations;

    // Escalar altura
    const maxVal = Y_nominal;
    const scaleY = (v) => svgHeight - margin.bottom - (v / maxVal) * (svgHeight - margin.top - margin.bottom);

    // Barra 1: Nominal
    const yNominal = scaleY(Y_nominal);
    const hNominal = (svgHeight - margin.bottom) - yNominal;

    // Barra 2: Pérdida Descuento (Empieza en Y_nominal y va hacia abajo)
    const yDesc = scaleY(Y_nominal);
    const hDesc = scaleY(Y_nominal - lossDescuento) - yNominal;

    // Barra 3: Pérdida Inflación (Empieza en Y_nominal - lossDescuento y va hacia abajo)
    const yInfl = scaleY(Y_nominal - lossDescuento);
    const hInfl = scaleY(Y_nominal - lossDescuento - lossInflacion) - yInfl;

    // Barra 4: Real
    const yReal = scaleY(Y_real);
    const hReal = (svgHeight - margin.bottom) - yReal;

    const w = 60; // Ancho de barra
    const gap = 30; // Espaciado

    return [
      { label: 'Nominal', x: margin.left + 20, y: yNominal, h: hNominal, color: '#38bdf8', val: Y_nominal, type: 'base' },
      { label: 'Costo Oport.', x: margin.left + 20 + w + gap, y: yDesc, h: hDesc, color: '#ef4444', val: -lossDescuento, type: 'loss' },
      { label: 'Erosión IPC', x: margin.left + 20 + (w + gap) * 2, y: yInfl, h: hInfl, color: '#f97316', val: -lossInflacion, type: 'loss' },
      { label: 'Real Neto', x: margin.left + 20 + (w + gap) * 3, y: yReal, h: hReal, color: '#10b981', val: Y_real, type: 'base' }
    ];
  }, [calculations]);

  return (
    <div className="space-y-6">
      {/* NARRATIVA DE ENCUADRE */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 shadow-sm">
        <h2 className="text-sm font-bold text-teal-400 uppercase tracking-wider mb-2">
          📖 El Espejismo del Pago Nominal
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          Las obras sociales rara vez pagan las prestaciones al día. En contextos de alta inflación, cobrar a los
          <strong> 60 o 90 días</strong> distorsiona por completo la estructura de costos del prestador. Aunque nominalmente
          se liquide el 100% del arancel acordado, el valor real que ingresa en caja se ha erosionado por la inflación
          y por el costo financiero (pérdida de rendimiento de ese capital).
        </p>
      </div>

      {/* SEGMENTADORES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* PARÁMETROS BÁSICOS */}
        <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md space-y-4">
          <span className="text-xs font-black uppercase tracking-wider text-teal-400 block border-b border-slate-800 pb-1.5">
            🎛️ Filtros de Escenario
          </span>

          {/* Modalidad */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs uppercase font-bold text-slate-400">Modalidad Dialítica:</label>
            <select
              value={modalidad}
              onChange={(e) => setModalidad(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs rounded-xl p-2 text-white focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              {opcionesModalidades.map(m => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
          </div>

          {/* Período de Corte */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs uppercase font-bold text-slate-400">Período de Facturación:</label>
            <select
              value={tHasta}
              onChange={(e) => setTHasta(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs rounded-xl p-2 text-white focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              {periodosHastaFiltrados.map(p => (
                <option key={p.periodo} value={p.periodo}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* TIME LAG Y DESCUENTO */}
        <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md space-y-4">
          <span className="text-xs font-black uppercase tracking-wider text-teal-400 block border-b border-slate-800 pb-1.5">
            ⏳ Plazos de Pago y Costo Financiero
          </span>

          {/* Time Lag (Días) */}
          <div className="flex flex-col space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span>Time Lag (Atraso de Cobro):</span>
              <span className="text-teal-400 font-mono font-black">{timeLagDays} Días</span>
            </div>
            <input
              type="range" min="0" max="180" step="5" value={timeLagDays}
              onChange={(e) => setTimeLagDays(Number(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400 mt-2"
            />
            <span className="text-[11px] text-slate-500 font-bold text-right font-mono">
              = {fmtAR(timeLagDays / 30, 1)} meses
            </span>
          </div>

          {/* TNA Descuento */}
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
            <span className="text-[11px] text-slate-500 font-bold text-right font-mono">
              TEM = {fmtAR(tna / 12, 2)} % mensual
            </span>
          </div>
        </div>

        {/* EXPECTATIVA DE INFLACIÓN (Erosión) */}
        <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md space-y-4">
          <span className="text-xs font-black uppercase tracking-wider text-teal-400 block border-b border-slate-800 pb-1.5">
            🔥 Expectativa Inflacionaria
          </span>

          <div className="flex flex-col space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-yellow-500">Tasa de Inflación Mensual (<MathJaxFormula formula="g_{IPC}" />):</span>
              <span className="text-white font-mono">{fmtAR(gIPC, 1)} %</span>
            </div>
            <input
              type="range" min="0" max="30" step="0.5" value={gIPC}
              onChange={(e) => setGIPC(Number(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-500 mt-2"
            />
            <span className="text-[9.5px] text-slate-400 leading-relaxed mt-2">
              * Afecta directamente al poder de compra de la factura cobrada con rezago.
            </span>
          </div>
        </div>
      </div>

      {/* RESULTADO Y GRÁFICO CASCADA */}
      {calculations && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* MÉTRICAS RESUMEN */}
          <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md space-y-4 flex flex-col justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-teal-400 block border-b border-slate-800 pb-1.5">
              📋 Resumen del Daño Financiero por Cobro Diferido
            </span>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl">
                <span className="text-[11px] text-slate-500 block">Facturado Nominal:</span>
                <span className="text-sky-400 font-extrabold text-sm">${calculations.Y_nominal.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl">
                <span className="text-[11px] text-slate-500 block">Valor de Paridad Polinómico:</span>
                <span className="text-slate-300 font-extrabold text-sm">${calculations.VP.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl">
                <span className="text-[11px] text-slate-500 block">Erosión Total Absoluta:</span>
                <span className="text-red-400 font-extrabold text-sm">-${calculations.lossTotal.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl">
                <span className="text-[11px] text-slate-500 block">Porcentaje de Descuento Real:</span>
                <span className="text-red-400 font-extrabold text-sm">{fmtAR(calculations.lossPct, 1)} %</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-500/5 border border-emerald-500/25 rounded-2xl text-center">
              <span className="text-xs text-emerald-400 uppercase font-black tracking-wider block">Valor Real Neto Percibido:</span>
              <span className="text-2xl font-black text-emerald-400 block font-mono mt-1">
                ${calculations.Y_real.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
              </span>
              <span className="text-[9.5px] text-slate-400 block mt-1">
                * Representa el poder de compra real descontando la inflación y el costo financiero.
              </span>
            </div>
          </div>

          {/* GRÁFICO CASCADA (WATERFALL) */}
          <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md flex flex-col justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-teal-400 block mb-1">
                📊 Gráfico Cascada: Impacto Financiero del Time Lag
              </span>
              <p className="text-xs text-slate-400 mb-3">
                Desglose de cómo la demora de cobro erosiona el arancel nominal hasta su valor real.
              </p>
            </div>

            <div className="w-full flex justify-center my-auto">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto bg-slate-950/60 rounded-xl border border-slate-800/80">
                {/* Ejes */}
                <line x1={margin.left} y1={svgHeight - margin.bottom} x2={svgWidth - margin.right} y2={svgHeight - margin.bottom} stroke="#475569" />

                {/* Línea de Costo Polinómico de Referencia */}
                <line
                  x1={margin.left}
                  y1={svgHeight - margin.bottom - (calculations.VP / calculations.Y_nominal) * (svgHeight - margin.top - margin.bottom)}
                  x2={svgWidth - margin.right}
                  y2={svgHeight - margin.bottom - (calculations.VP / calculations.Y_nominal) * (svgHeight - margin.top - margin.bottom)}
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                <text
                  x={svgWidth - margin.right - 5}
                  y={svgHeight - margin.bottom - (calculations.VP / calculations.Y_nominal) * (svgHeight - margin.top - margin.bottom) - 5}
                  fill="#f87171"
                  fontSize="9.5"
                  fontWeight="bold"
                  textAnchor="end"
                >
                  Valor Paridad Polinómico
                </text>

                {/* Línea divisoria vertical (separa pérdidas de resultado neto real) */}
                <line
                  x1={330}
                  y1={margin.top - 10}
                  x2={330}
                  y2={svgHeight - margin.bottom + 5}
                  stroke="#64748b"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  opacity="0.8"
                />

                {/* Barras */}
                {waterfallBars.map((b, i) => (
                  <g key={i}>
                    {/* Rectángulo de barra */}
                    <rect
                      x={b.x}
                      y={b.y}
                      width={50}
                      height={b.h}
                      fill={b.color}
                      rx="3"
                      opacity="0.8"
                    />
                    {/* Valor de texto sobre la barra */}
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
                    {/* Etiqueta de la barra */}
                    <text
                      x={b.x + 25}
                      y={svgHeight - margin.bottom + 18}
                      fill="#e2e8f0"
                      fontSize="9.5"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {b.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* BOTÓN DESARROLLO MATEMÁTICO */}
      {calculations && (
        <div className="flex flex-col space-y-4">
          <div className="flex justify-center">
            <button
              onClick={() => setMostrarMath(!mostrarMath)}
              className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-900 border border-slate-700 text-teal-400 hover:bg-slate-800 transition"
            >
              {mostrarMath ? '🙈 Ocultar Demostración Matemática' : '🎓 Mostrar Planteo y Desarrollo Matemático'}
            </button>
          </div>

          {mostrarMath && (
            <div className="p-5 rounded-2xl border bg-slate-950/60 border-slate-800 space-y-4 text-xs leading-relaxed text-slate-300">
              <h4 className="text-teal-400 font-bold uppercase tracking-wide border-b border-slate-800 pb-2">
                🎓 Planteo del Impuesto Inflacionario por Time Lag
              </h4>

              <div className="space-y-3 font-mono">
                <p className="text-slate-300 font-sans">
                  <strong>1. Conversión de Tasa de Descuento (TNA a TEM):</strong>
                  <br />
                  La Tasa Nominal Anual (<MathJaxFormula formula="TNA" />) se convierte a Tasa Efectiva Mensual (<MathJaxFormula formula="TEM" />) para computar el costo financiero de la demora en el cobro:
                </p>
                <div className="p-3 bg-slate-900/60 rounded-xl text-center">
                  <span className={`text-[20px]`}><MathJaxFormula formula={"TEM = \\frac{TNA}{12}"} /></span>
                  <br />
                  <span className="inline-block text-[24px]">
                    <MathJaxFormula className="text-white" formula={`TEM = \\frac{${tna}\\%}{12} = ${fmtAR(calculations.tem, 4)} \\text{ (}${fmtAR(calculations.tem * 100, 2)}\\%\\text{ mensual)}`} />
                  </span>
                </div>

                <p className="text-slate-300 font-sans">
                  <strong>2. Conversión del Plazo de Pago en Días a Meses (<MathJaxFormula formula="m" />):</strong>
                  <br />
                  Se convierte el atraso comercial en días a su fracción equivalente en meses tomando como base estándar meses de 30 días:
                </p>
                <div className="p-3 bg-slate-900/60 rounded-xl text-center">
                  <span className={`text-[20px]`}><MathJaxFormula formula={`m = \\frac{\\text{Días de Atraso}}{30}`} /></span>
                  <br />
                  <span className="inline-block text-[24px]">
                    <MathJaxFormula className="text-white" formula={`m = \\frac{${timeLagDays}\\text{ días}}{30\\text{ días}} = ${fmtAR(calculations.mesesAtraso, 2)}\\text{ meses } (m = ${fmtAR(calculations.mesesAtraso, 2)})`} />
                  </span>
                </div>

                <p className="text-slate-300 font-sans">
                  <strong>3. Ecuación de Descuento Financiero e Inflacionario Combinado:</strong>
                  <br />
                  El Arancel Real Percibido se calcula descontando conjuntamente el efecto inflación (<MathJaxFormula formula="g_{IPC}" />) y la tasa efectiva (<MathJaxFormula formula="TEM" />) durante los meses de atraso (<MathJaxFormula formula="m" />):
                </p>
                {(() => {
                  const isLoss = calculations.lossTotal > 0;
                  return (
                    <div className={`p-4 rounded-xl border ${isLoss ? 'bg-rose-950/20 border-rose-500/30' : 'bg-emerald-950/20 border-emerald-500/30'} text-center space-y-2`}>
                      <span className={`text-xs font-black uppercase tracking-wider block ${isLoss ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {isLoss ? '❌ Resultado Simulado (Pérdida por Rezago)' : '✅ Resultado Simulado (Suficiencia)'}
                      </span>
                      <span className={`text-[24px]`}><MathJaxFormula formula={"Y_{real} = \\frac{Y_{nominal}}{(1 + g_{IPC})^m \\cdot (1 + TEM)^m}"} /></span>
                      <br />
                      <br />
                      <span className={`inline-block text-[24px] font-mono font-bold ${isLoss ? 'text-rose-300' : 'text-emerald-300'}`}>
                        <MathJaxFormula className="text-white" formula={`Y_{real} = \\frac{${fmtAR(calculations.Y_nominal, 2)}}{\\left(1 + ${fmtAR(gIPC / 100, 4)}\\right)^{${fmtAR(calculations.mesesAtraso, 2)}} \\cdot \\left(1 + ${fmtAR(calculations.tem, 4)}\\right)^{${fmtAR(calculations.mesesAtraso, 2)}}} = ${fmtAR(calculations.Y_real, 2)}`} />
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
