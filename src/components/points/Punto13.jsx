import React, { useState, useMemo } from 'react';
import { MathJaxFormula } from '../MathJaxFormula';
import seriesData from '../../data/seriesData.json';
import { fmtAR } from '../../utils/format';

export default function Punto13() {
  const opcionesModalidades = [
    { id: 'HD', nombre: 'Hemodiálisis Convencional (HD)', campoExcel: 'valorSesionHD' },
    { id: 'DP', nombre: 'Diálisis Peritoneal (DP)', campoExcel: 'valorModuloDP' },
    { id: 'HDF', nombre: 'Hemodiafiltración en Línea (HDF)', campoExcel: 'valorSesionHDF' }
  ];
  const [modalidad, setModalidad] = useState('HD');

  // Corte temporal
  const defaultHasta = seriesData[seriesData.length - 1];
  const defaultHastaIndex = seriesData.findIndex(d => d.periodo === defaultHasta.periodo);
  const defaultDesdeIndex = Math.max(0, defaultHastaIndex - 11);
  const [tHasta, setTHasta] = useState(defaultHasta.periodo);
  const [tDesde, setTDesde] = useState(seriesData[defaultDesdeIndex].periodo);

  // Segmentadores del simulador clínico
  const [pacientes, setPacientes] = useState(1); // Default 1, rango 1 a 500
  const [sesiones, setSesiones] = useState(13); // Default 13

  const [mostrarMath, setMostrarMath] = useState(false);

  const periodosHastaFiltrados = seriesData.filter(p => p.periodo);

  const handleTHastaChange = (e) => {
    const newHasta = e.target.value;
    setTHasta(newHasta);
    const indexHasta = seriesData.findIndex(d => d.periodo === newHasta);
    const indexDesde = Math.max(0, indexHasta - 11);
    setTDesde(seriesData[indexDesde].periodo);
  };

  // Computaciones del Impacto Financiero
  const calculations = useMemo(() => {
    const filtered = seriesData.filter(d => d.periodo >= tDesde && d.periodo <= tHasta);
    if (filtered.length === 0) return null;

    const modObj = opcionesModalidades.find(m => m.id === modalidad) || opcionesModalidades[0];
    const baseRef = seriesData[0];
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
        deficit: deficit_m
      });
    });

    const meses = filtered.length;
    const avgY = sumY / meses;
    const avgVP = sumVP / meses;
    const avgBrecha = ((avgY - avgVP) / avgVP) * 105; // Ajuste menor para brechas ponderadas
    const deficitMensualTotal = totalDeficit / meses;
    const deficitMensualPaciente = deficitMensualTotal / pacientes;

    return {
      meses,
      avgY,
      avgVP,
      brecha: ((avgY - avgVP) / avgVP) * 100, // Brecha promedio
      deficitMensualPaciente,
      deficitMensualTotal,
      deficitAnualTotal: totalDeficit, // Déficit acumulado en el período de análisis
      mensualDetails
    };
  }, [tDesde, tHasta, modalidad, pacientes, sesiones]);

  return (
    <div className="space-y-6">
      {/* NARRATIVA DE ENCUADRE */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 shadow-sm">
        <h2 className="text-base font-bold text-teal-400 uppercase tracking-wider mb-2">
          📖 Traduciendo Porcentajes a Dinero Real
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          Hasta ahora, los desajustes y desfasajes arancelarios se han expresado en porcentajes de brecha y coeficientes.<br />
          Pero una clínica no paga salarios ni compra insumos con porcentajes: lo hace con dinero (en Argentina, pesos ARS).<br />
          Aquí traducimos la <strong>Brecha de Cobertura</strong> a "<i>desfasaje de caja real</i>" del prestador.<br />
          Esto permite dimensionar el riesgo de insolvencia o desabastecimiento de insumos básicos.
        </p>
      </div>

      {/* CONTROLES / SEGMENTADORES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* PARÁMETROS BÁSICOS */}
        <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md space-y-4">
          <span className="text-sm font-black uppercase tracking-wider text-teal-400 block border-b border-slate-800 pb-1.5">
            🎛️ Configuración de Escenario
          </span>

          {/* Modalidad */}
          <div className="flex flex-col space-y-1">
            <label className="text-sm uppercase font-bold text-slate-400">Modalidad Médica:</label>
            <select
              value={modalidad}
              onChange={(e) => setModalidad(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-sm rounded-xl p-2 text-white focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              {opcionesModalidades.map(m => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
          </div>

          {/* Período de Corte */}
          <div className="flex flex-col space-y-1">
            <label className="text-sm uppercase font-bold text-slate-400">Período Bajo Análisis (Hasta):</label>
            <select
              value={tHasta}
              onChange={handleTHastaChange}
              className="bg-slate-950 border border-slate-800 text-sm rounded-xl p-2 text-white focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              {periodosHastaFiltrados.map(p => (
                <option key={p.periodo} value={p.periodo}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Período de Inicio */}
          <div className="flex flex-col space-y-1">
            <label className="text-sm uppercase font-bold text-slate-500">Punto de Partida (Desde):</label>
            <select
              value={tDesde}
              onChange={(e) => setTDesde(e.target.value)}
              className="bg-slate-950/40 border border-slate-900 text-sm rounded-xl p-2 text-slate-400 focus:outline-none focus:border-teal-900 cursor-pointer"
            >
              {seriesData.filter(p => p.periodo <= tHasta).map(p => (
                <option key={p.periodo} value={p.periodo} className="text-white bg-slate-950">{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* DIMENSIÓN CLÍNICA */}
        <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md space-y-4 md:col-span-2">
          <span className="text-sm font-black uppercase tracking-wider text-teal-400 block border-b border-slate-800 pb-1.5">
            👥 Dimensión del Padrón y Frecuencia de Sesiones
          </span>

          <div className="flex flex-col space-y-6 justify-center h-full">
            {/* Cantidad de Pacientes */}
            <div className="flex flex-col space-y-1">
              <div className="flex justify-between text-sm font-bold">
                <span>Padrón de Pacientes Activos (N):</span>
                <span className="text-teal-400 font-mono font-black">{pacientes} Pacientes</span>
              </div>
              <input
                type="range" min="1" max="500" step="1" value={pacientes}
                onChange={(e) => setPacientes(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500 mt-2"
              />
              <div className="flex justify-between text-xs text-slate-500 font-bold font-mono">
                <span>Min: 1</span>
                <span>Max: 500</span>
              </div>
            </div>

            {/* Sesiones por Paciente al Mes */}
            {(() => {
              const isDP = modalidad === 'DP';
              const sesionesAMostrar = isDP ? 1 : sesiones;
              return (
                <div className={`flex flex-col space-y-1 transition-opacity ${isDP ? 'opacity-40' : ''}`}>
                  <div className="flex justify-between text-sm font-bold">
                    <span>Sesiones Mensuales promedio (S):</span>
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
                  <span className="text-[13px] text-slate-500 font-bold italic mt-1">
                    {isDP
                      ? '* Lock de Diálisis Peritoneal: esta prestación se liquida de manera mensual por módulo (1 por mes).'
                      : '* La frecuencia médica estándar es de 3 sesiones semanales (aprox. 13 al mes).'
                    }
                  </span>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* DASHBOARD DE IMPACTO FINANCIERO */}
      {calculations && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tarjeta 1: Brecha Porcentual */}
          <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md flex flex-col justify-between items-center text-center">
            <span className="text-sm text-slate-400 uppercase font-black tracking-wider">
              Brecha de Cobertura Promedio
            </span>
            <div className={`text-[32px] font-black font-mono my-3 ${calculations.brecha < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {fmtAR(calculations.brecha, 2)} %
            </div>
            <p className="text-[11.5px] text-slate-500 leading-relaxed">
              Diferencia relativa promedio en el período entre lo que la Obra Social paga (${Math.round(calculations.avgY).toLocaleString('es-AR')}) y el valor de paridad polinómico de referencia (${Math.round(calculations.avgVP).toLocaleString('es-AR')}).
            </p>
          </div>

          {/* Tarjeta 2: Déficit Mensual */}
          <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800 shadow-md flex flex-col justify-between items-center text-center">
            <span className="text-sm text-slate-400 uppercase font-black tracking-wider">
              Déficit Promedio Mensual
            </span>
            <div className={`text-[32px] font-black font-mono my-3 ${calculations.deficitMensualTotal < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              ${Math.round(calculations.deficitMensualTotal).toLocaleString('es-AR')}
            </div>
            <p className="text-[11.5px] text-slate-500 leading-relaxed">
              Pérdida (o ganancia) neta promedio al mes en pesos para el padrón seleccionado de {pacientes} pacientes. (${Math.round(calculations.deficitMensualPaciente).toLocaleString('es-AR')} promedio por paciente).
            </p>
          </div>

          {/* Tarjeta 3: Déficit Anualizado */}
          <div className="p-4 rounded-3xl border-2 bg-red-950/20 border-red-500/30 shadow-lg flex flex-col justify-between items-center text-center">
            <span className="text-sm text-red-400 uppercase font-black tracking-wider">
              💥 Daño Económico Acumulado (IF)
            </span>
            <div className={`text-[32px] font-black font-mono my-3 ${calculations.deficitAnualTotal < 0 ? 'text-red-500' : 'text-emerald-400'}`}>
              ${Math.round(calculations.deficitAnualTotal).toLocaleString('es-AR')}
            </div>
            <p className="text-[11.5px] text-slate-400 leading-relaxed">
              Pérdida acumulada total para el padrón seleccionado de {pacientes} pacientes durante los {calculations.meses} meses de la ventana temporal definida.
            </p>
          </div>
        </div>
      )}

      {/* BOTÓN DESARROLLO MATEMÁTICO */}
      {calculations && (
        <div className="flex flex-col space-y-4">
          <div className="flex justify-center">
            <button
              onClick={() => setMostrarMath(!mostrarMath)}
              className="px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider bg-slate-900 border border-slate-700 text-teal-400 hover:bg-slate-800 transition"
            >
              {mostrarMath ? '🙈 Ocultar Demostración Matemática' : '🎓 Mostrar Planteo y Desarrollo Matemático'}
            </button>
          </div>

          {mostrarMath && (
            <div className="p-5 rounded-2xl border bg-slate-950/60 border-slate-800 space-y-4 text-sm leading-relaxed text-slate-300">
              <h4 className="text-teal-400 font-bold uppercase tracking-wide border-b border-slate-800 pb-2">
                🎓 Ecuación de Impacto Financiero e Institucional
              </h4>

              <div className="space-y-3 font-mono">
                <p className="text-slate-300 font-sans">
                  El Impacto Financiero acumulado en el período (<span className="text-lg"><MathJaxFormula formula="IF_{acumulado}" /></span>) suma las pérdidas netas de todos los meses de la ventana de análisis en función del tamaño del padrón (<span className="text-lg"><MathJaxFormula formula="N" /></span>) y el número de prestaciones mensuales (<span className="text-lg"><MathJaxFormula formula="S" /></span>):
                </p>
                {(() => {
                  const isLoss = calculations.deficitAnualTotal < 0;
                  const sesionesEfectivas = modalidad === 'DP' ? 1 : sesiones;
                  const labelStatus = isLoss ? '\\text{ (Pérdida)}' : '\\text{ (Suficiencia)}';

                  const valY = Math.round(calculations.avgY).toLocaleString('es-AR');
                  const valVP = Math.round(calculations.avgVP).toLocaleString('es-AR');
                  const valTotal = Math.round(calculations.deficitAnualTotal).toLocaleString('es-AR');

                  const formulaCalc = `\\text{Cálculo: } \\left( ${valY} - ${valVP} \\right) \\cdot ${pacientes} \\cdot ${sesionesEfectivas} \\cdot ${calculations.meses} = ${valTotal} \\text{ ARS}${labelStatus}`;

                  return (
                    <div className={`p-4 rounded-xl border ${isLoss ? 'bg-rose-950/20 border-rose-500/30' : 'bg-emerald-950/20 border-emerald-500/30'} flex flex-col items-center space-y-4`}>
                      <span className={`text-sm font-black uppercase tracking-wider block ${isLoss ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {isLoss ? '❌ Resultado Simulado (Pérdida/Daño Acumulado)' : '✅ Resultado Simulado (Suficiencia)'}
                      </span>
                      <div className="py-1 text-lg text-slate-200">
                        <MathJaxFormula formula={"IF_{acumulado} = \\sum_{t=t_{desde}}^{t_{hasta}} (Y_t - V^P_t) \\cdot N \\cdot S"} />
                      </div>
                      <div className={`py-1 text-lg ${isLoss ? 'text-rose-450' : 'text-emerald-400'} font-bold`}>
                        <MathJaxFormula formula={formulaCalc} />
                      </div>
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
