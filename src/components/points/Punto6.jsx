import React, { useState } from 'react';
import MathJaxFormula from '../MathJaxFormula';

export default function Punto6({ isDarkMode, onNext }) {
  const [showSection1, setShowSection1] = useState(false);
  const [showSection2, setShowSection2] = useState(false);

  return (
    <div className="space-y-6">

      {/* Encabezado Principal del Punto 6 */}
      <div className={`border-b pb-4 border-slate-300 dark:border-slate-800`}>
        <span className={`text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400`}>
          Punto 6 • El Quiebre Metodológico y Cambio de Paradigma
        </span>
        <h3 className={`text-3xl sm:text-4xl font-black mt-1 text-slate-950 dark:text-white`}>
          Desestimación del VAAD de Pago Único y Transición al Modelo Econométrico del Arancel
        </h3>
        <p className={`text-base sm:text-lg mt-2 leading-relaxed text-slate-800 font-normal dark:text-slate-300`}>
          Tras construir el sofisticado modelo actuarial del Valor Actual Actuarial de Diálisis (<b><MathJaxFormula formula="VAAD" /></b>), la investigación enfrenta una ruptura conceptual insalvable: el <MathJaxFormula formula="VAAD" /> de cobro anticipado debe desestimarse como mecanismo prestacional, dando paso a la deconstrucción econométrica del precio por sesión.
        </p>
      </div>

      {/* Botones de Control de Revelado (Apartados 1 y 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => setShowSection1(!showSection1)}
          className={`p-3.5 rounded-xl border text-xs font-bold transition flex items-center justify-between ${showSection1 ? 'bg-amber-50 border-amber-600 text-slate-950 shadow-md ring-2 ring-amber-600 dark:bg-amber-500/20 dark:border-amber-500 dark:text-amber-300' : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white'}`}
        >
          <div className="flex items-center gap-2">
            <span>🚨</span>
            <span>1. Las 3 Razones para Desestimar el VAAD Único</span>
          </div>
          <span>{showSection1 ? '👁️' : '🙈'}</span>
        </button>

        <button
          onClick={() => setShowSection2(!showSection2)}
          className={`p-3.5 rounded-xl border text-xs font-bold transition flex items-center justify-between ${showSection2 ? 'bg-teal-50 border-teal-600 text-slate-950 shadow-md ring-2 ring-teal-600 dark:bg-teal-500/20 dark:border-teal-500 dark:text-teal-300' : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white'}`}
        >
          <div className="flex items-center gap-2">
            <span>🔄</span>
            <span>2. Cambio de Paradigma (Deconstrucción del VAAD)</span>
          </div>
          <span>{showSection2 ? '👁️' : '🙈'}</span>
        </button>
      </div>

      {/* APARTADO 1: LAS 3 RAZONES PARA DESESTIMAR EL VAAD */}
      {showSection1 && (
        <div className={`p-5 rounded-2xl border transition-all space-y-4 bg-amber-50/60 border-amber-500 text-slate-800 font-normal dark:bg-slate-950 dark:border-amber-500/30 dark:text-slate-300`}>
          <div className="flex items-center gap-2">
            <span className="text-xl">🛑</span>
            <h4 className={`text-sm font-bold uppercase tracking-wider text-amber-950 dark:text-amber-400`}>
              1. Las Tres Razones Fundamentales por las que se Desestima la Primera Parte
            </h4>
          </div>

          <p className="text-xs leading-relaxed">
            A pesar de la precisión matemática alcanzada al integrar tablas híbridas y riesgos competitivos, el cobro de la suma capitalizada única del $VAAD$ al inicio del tratamiento presenta <strong>tres limitaciones críticas e insalvables</strong> que obligan a dejarlo de lado:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">

            {/* Razón 1: Inviabilidad Operativa y de Mercado */}
            <div className={`p-4 rounded-xl border text-xs space-y-2 flex flex-col justify-between bg-white border-amber-300 shadow-sm dark:bg-slate-900 dark:border-slate-800`}>
              <div>
                <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400 mb-1">
                  <span className="text-base">🏦</span>
                  <h5>1. Inviabilidad Operativa y Financiera del Mercado</h5>
                </div>
                <p className="leading-relaxed text-xs">
                  En la práctica real del sistema de salud (obras sociales y prepagas), ningún financiador transferirá por adelantado la totalidad del valor actual actuarial de un paciente crónico al momento de su ingreso. El mercado no opera ni operará mediante pagos capitados únicos por adelantado.
                </p>
              </div>
              <div className="mt-2 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                ⚠️ Imposibilidad de aplicación comercial directa en el mercado de la salud.
              </div>
            </div>

            {/* Razón 2: Opacidad de Costos y Falta de Visibilidad Marginal */}
            <div className={`p-4 rounded-xl border text-xs space-y-2 flex flex-col justify-between bg-white border-amber-300 shadow-sm dark:bg-slate-900 dark:border-slate-800`}>
              <div>
                <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400 mb-1">
                  <span className="text-base">🔍</span>
                  <h5>2. Opacidad de Costos y Ceguera Marginal</h5>
                </div>
                <p className="leading-relaxed text-xs">
                  Un valor global resumido en una sola cifra de capitalización oculta la dinámica diaria de los costos reales. No permite visibilizar el comportamiento marginal de los insumos (dólar, mano de obra, mantenimiento) ni evaluar la suficiencia puntual de la facturación mes a mes.
                </p>
              </div>
              <div className="mt-2 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                ⚠️ Pérdida de sensibilidad sobre el costo marginal y la variabilidad mensual.
              </div>
            </div>

            {/* Razón 3: Conflicto Bioético y Perverso Incentivo sobre la Supervivencia */}
            <div className={`p-4 rounded-xl border text-xs space-y-2 flex flex-col justify-between bg-white border-amber-300 shadow-sm dark:bg-slate-900 dark:border-slate-800`}>
              <div>
                <div className="flex items-center gap-2 font-bold text-rose-600 dark:text-rose-400 mb-1">
                  <span className="text-base">⚖️</span>
                  <h5>3. Conflicto Bioético e Perverso Incentivo Económico</h5>
                </div>
                <p className="leading-relaxed text-xs">
                  Percibir la totalidad del tratamiento del paciente en el momento cero genera un perverso incentivo económico: el prestador cobraría todo el capital inicial y una menor supervivencia del paciente derivaría en "mayores resultados económicos". Esto atenta directamente contra los principios bioéticos rectores de este trabajo.
                </p>
              </div>
              <div className="mt-2 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-500/20 p-2 rounded border border-rose-500/30">
                🚨 Inaceptable conflicto de intereses sobre la vida del paciente.
              </div>
            </div>

          </div>

          <div className={`p-3 rounded-xl border mt-3 text-xs font-bold text-center bg-rose-100 border-rose-300 text-rose-950 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-200`}>
            📌 <strong>Conclusión del uso del VAAD</strong> <br /> Por estas 3 razones, el VAAD queda desestimado como mecanismo de cobro directo.
          </div>
        </div>
      )}

      {/* APARTADO 2: CAMBIO DE PARADIGMA (DEL VAAD AL MODELO ECONOMÉTRICO DE PARIDAD) */}
      {showSection2 && (
        <div className={`p-5 rounded-2xl border transition-all space-y-4 bg-teal-50/60 border-teal-500 text-slate-800 font-normal dark:bg-slate-950 dark:border-teal-500/30 dark:text-slate-300`}>
          <div className="flex items-center gap-2">
            <span className="text-xl">🔄</span>
            <h4 className={`text-sm font-bold uppercase tracking-wider text-teal-950 dark:text-teal-400`}>
              2. Cambio de paradigma (del VAAD al Modelo Econométrico de Paridad)
            </h4>
          </div>

          {/* Explicación Didáctica Inicial */}
          <div className={`p-4 rounded-xl border text-xs leading-relaxed bg-white border-teal-300 shadow-sm dark:bg-slate-900/80 dark:border-slate-800`}>
            <p className="mb-2">
              <strong>El Cambio de Paradigma:</strong> El hecho de desestimar el cobro único del <MathJaxFormula formula="VAAD" /> no significa descartar la matemática construida. La reconvertimos en nuestra <strong>herramienta de diagnóstico de fondo</strong>.
            </p>
            <p>
              En lugar de usar la fórmula para ponerle precio de liquidación al paciente, la usaremos a la inversa: para <strong>deconstruir y auditar el precio de la sesión de diálisis que paga la obra social</strong> y verificar si cubre o destruye el patrimonio del centro médico.
            </p>
          </div>

          {/* Tres Pilares del Nuevo Enfoque Econométrico */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

            <div className={`p-4 rounded-xl border text-xs space-y-2 bg-white border-teal-300 shadow-sm dark:bg-slate-900 dark:border-slate-800`}>
              <div className="font-bold text-teal-600 dark:text-teal-400">1. Desvinculación Ética Financiera</div>
              <p className="text-xs leading-relaxed">
                El prestador percibirá el arancel en tanto y en cuanto continúe brindando la prestación con vida al paciente. La supervivencia de la persona vuelve a alinearse perfectamente con la supervivencia del prestador.
              </p>
            </div>

            <div className={`p-4 rounded-xl border text-xs space-y-2 bg-white border-teal-300 shadow-sm dark:bg-slate-900 dark:border-slate-800`}>
              <div className="font-bold text-teal-600 dark:text-teal-400">2. Motor Econométrico de Costos</div>
              <p className="text-xs leading-relaxed">
                Pasamos a la Parte 2 del trabajo: modelar la sesión mediante una función polinómica estructural de 3 variables macroeconómicas clave: <strong>Cotización del Dólar (<MathJaxFormula formula="USD" />)</strong>, <strong>IPC General (<MathJaxFormula formula="IPC" />)</strong> y <strong>Paritarias de Salud (<MathJaxFormula formula="CCT" />)</strong>.
              </p>
            </div>

            <div className={`p-4 rounded-xl border text-xs space-y-2 bg-white border-teal-300 shadow-sm dark:bg-slate-900 dark:border-slate-800`}>
              <div className="font-bold text-teal-600 dark:text-teal-400">3. Arancel Técnico de Paridad</div>
              <p className="text-xs leading-relaxed">
                Utilizaremos el andamiaje actuarial para medir el descalce y fijar el <strong>Precio Técnico de Paridad</strong> necesario para resarcir la pérdida por el retraso de las obras sociales y garantizar la sustentabilidad.
              </p>
            </div>

          </div>

          <button
            onClick={onNext}
            className={`w-full p-3.5 rounded-xl border text-xs font-bold text-center transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 shadow-sm bg-teal-100 border-teal-400 text-teal-950 hover:bg-teal-200 hover:border-teal-500 dark:bg-teal-500/20 dark:border-teal-500/50 dark:text-teal-300 dark:hover:bg-teal-500/30 dark:hover:border-teal-400`}
          >
            <span>👉</span>
            <span>Parte 2 (Punto 7): El Motor de Costos Microeconómico!</span>
            <span className="text-sm"></span>
          </button>

        </div>
      )}

    </div>
  );
}
