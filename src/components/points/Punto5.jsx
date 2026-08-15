import React, { useState, useMemo } from 'react';
import { MathJaxFormula } from '../MathJaxFormula';
import seriesData from '../../data/seriesData.json';
import { fmtLatex } from '../../utils/format';
import { useGlobalParams } from '../../context/GlobalContext';
import { useAuth } from '../../context/AuthContext';

export default function Punto5({ isDarkMode }) {
  const [activeTab, setActiveTab] = useState(null);
  const { hasPermission } = useAuth();

  const visibleCount = [
    hasPermission('p1_p5_a1'),
    hasPermission('p1_p5_a2'),
    hasPermission('p1_p5_a3'),
    hasPermission('p1_p5_a4'),
    hasPermission('p1_p5_a5'),
    hasPermission('p1_p5_a6')
  ].filter(Boolean).length;

  const {
    edadPaciente: edad, setEdadPaciente: setEdad,
    modalidadDialitica: modalidad, setModalidadDialitica: setModalidad,
    comorbilidadIngreso: comorbilidad, setComorbilidadIngreso: setComorbilidad,
    tasaCrecimientoVaad: ajusteG, setTasaCrecimientoVaad: setAjusteG,
    tasaDescuento: tasaInteresTNA, setTasaDescuento: setTasaInteresTNA,
    periodoHasta: periodo, setPeriodoHasta: setPeriodo
  } = useGlobalParams();

  const ultimoPeriodoData = seriesData[seriesData.length - 1];

  // Buscadores para dropdowns
  const [searchModalidad, setSearchModalidad] = useState('');
  const [searchComorbilidad, setSearchComorbilidad] = useState('');
  const [searchPeriodo, setSearchPeriodo] = useState('');

  // Opciones de Modalidad (HD/HDF multiplicados por 13 sesiones/mes, DP por 1 módulo/mes)
  const opcionesModalidades = [
    { id: 'HD', nombre: 'Hemodiálisis Convencional (HD)', multiplicadorSesiones: 13, shrBase: 1.0, campoExcel: 'valorSesionHD' },
    { id: 'DP', nombre: 'Diálisis Peritoneal (DP)', multiplicadorSesiones: 1, shrBase: 0.92, campoExcel: 'valorModuloDP' },
    { id: 'HDF', nombre: 'Hemodiafiltración en Línea (HDF)', multiplicadorSesiones: 13, shrBase: 0.78, campoExcel: 'valorSesionHDF' }
  ];

  // Opciones de Comorbilidades y multiplicadores SHR (Fine & Gray)
  const opcionesComorbilidades = [
    { id: 'BASAL', nombre: 'Sin Comorbilidad Severa (Basal)', shr: 1.0 },
    { id: 'DBT', nombre: 'Nefropatía Diabética (DBT)', shr: 1.339 },
    { id: 'EVP', nombre: 'Enfermedad Vascular Periférica (EVP)', shr: 1.129 },
    { id: 'DBT_EVP', nombre: 'Nefropatía Diabética + EVP (Comb. Frecuente)', shr: 1.5117 },
    { id: 'ECV', nombre: 'Enfermedad Cerebrovascular (ECV)', shr: 1.200 },
    { id: 'ICC', nombre: 'Insuficiencia Cardíaca Congestiva (ICC)', shr: 1.160 },
    { id: 'NEO', nombre: 'Neoplasia Activa (Últimos 5 años)', shr: 1.609 },
    { id: 'ALB', nombre: 'Albuminemia Inicial < 3.5 g/dL', shr: 1.475 },
    { id: 'HIV', nombre: 'HIV Positivo al Ingreso', shr: 1.669 }
  ];

  // Handlers para selección que resetean la palabra de búsqueda una vez seleccionado el elemento
  const handleSelectModalidad = (e) => {
    setModalidad(e.target.value);
    setSearchModalidad('');
  };

  const handleSelectComorbilidad = (e) => {
    setComorbilidad(e.target.value);
    setSearchComorbilidad('');
  };

  const handleSelectPeriodo = (e) => {
    setPeriodo(e.target.value);
    setSearchPeriodo('');
  };

  // Filtrado dinámico para dropdowns
  const modalidadesFiltradas = opcionesModalidades.filter(m =>
    m.nombre.toLowerCase().includes(searchModalidad.toLowerCase())
  );

  const comorbilidadesFiltradas = opcionesComorbilidades.filter(c =>
    c.nombre.toLowerCase().includes(searchComorbilidad.toLowerCase())
  );

  const periodosFiltrados = seriesData.filter(p =>
    p.label.toLowerCase().includes(searchPeriodo.toLowerCase()) || p.periodo.includes(searchPeriodo) || p.resolucion.toLowerCase().includes(searchPeriodo.toLowerCase())
  );

  // Valor prestacional base C0 y resolución extraídos de la serie histórica
  const periodoObj = useMemo(() => {
    return seriesData.find(p => p.periodo === periodo) || ultimoPeriodoData;
  }, [periodo, ultimoPeriodoData]);

  const modObj = useMemo(() => {
    return opcionesModalidades.find(m => m.id === modalidad) || opcionesModalidades[0];
  }, [modalidad]);

  // Cálculo del módulo mensual C0 = ValorUnitario * MultiplicadorSesiones (13 para HD/HDF, 1 para DP)
  const valorUnitario = periodoObj[modObj.campoExcel] || 0;
  const multiplicadorSesiones = modObj.multiplicadorSesiones;
  const C0 = valorUnitario * multiplicadorSesiones;
  const resolucionPAMI = periodoObj.resolucion;

  // Cálculo Actuarial de la Curva del VAAD para edades de 18 a 90 años
  const { curvaVAAD, vaadSeleccionado, esperanzaVidaMeses, teaCalculada } = useMemo(() => {
    const shrComorbilidadObj = opcionesComorbilidades.find(c => c.id === comorbilidad) || opcionesComorbilidades[0];
    const shrTotal = shrComorbilidadObj.shr * modObj.shrBase;

    const g_anual = ajusteG / 100;
    const tna_decimal = tasaInteresTNA / 100;
    const tea_decimal = Math.pow(1 + (tna_decimal / 12), 12) - 1;
    const r_anual = tea_decimal;

    const puntosCurva = [];
    let vaadCalculado = 0;
    let esperanzaMesesCalculada = 0;

    for (let e = 18; e <= 90; e += 1) {
      let q_basal = 0.056;
      if (e >= 31 && e <= 40) q_basal = 0.0575;
      else if (e >= 41 && e <= 50) q_basal = 0.0768;
      else if (e >= 51 && e <= 60) q_basal = 0.1202;
      else if (e >= 61 && e <= 70) q_basal = 0.1720;
      else if (e >= 71 && e <= 80) q_basal = 0.2696;
      else if (e > 80) q_basal = 0.4048;

      const q_ajustada = 1 - Math.pow(1 - q_basal, shrTotal);
      const q_mensual = 1 - Math.pow(1 - q_ajustada, 1 / 12);
      const p_mensual = 1 - q_mensual;

      let sumaVAAD = 0;
      let p_acumulada = 1.0;
      let mesesSupervivencia = 0;

      const maxMeses = Math.min((100 - e) * 12, 360);

      for (let k = 0; k < maxMeses; k++) {
        const factorNeto = Math.pow((1 + g_anual) / (1 + r_anual), k / 12);
        sumaVAAD += C0 * factorNeto * p_acumulada;
        mesesSupervivencia += p_acumulada;
        p_acumulada *= p_mensual;
      }

      puntosCurva.push({ edad: e, vaad: Math.round(sumaVAAD) });

      if (e === edad) {
        vaadCalculado = Math.round(sumaVAAD);
        esperanzaMesesCalculada = Math.round(mesesSupervivencia);
      }
    }

    return {
      curvaVAAD: puntosCurva,
      vaadSeleccionado: vaadCalculado,
      esperanzaVidaMeses: esperanzaMesesCalculada,
      teaCalculada: tea_decimal
    };
  }, [edad, modalidad, comorbilidad, ajusteG, C0, tasaInteresTNA, modObj]);

  // SVG Dimensiones de curva actuarial
  const minVAAD = useMemo(() => Math.min(...curvaVAAD.map(d => d.vaad)), [curvaVAAD]);
  const maxVAAD = useMemo(() => Math.max(...curvaVAAD.map(d => d.vaad)), [curvaVAAD]);

  const svgWidth = 700;
  const svgHeight = 220;
  const margin = { top: 25, right: 30, bottom: 35, left: 75 };

  const getX = (e) => margin.left + ((e - 18) / (90 - 18)) * (svgWidth - margin.left - margin.right);
  const getY = (v) => svgHeight - margin.bottom - ((v - minVAAD) / (maxVAAD - minVAAD || 1)) * (svgHeight - margin.top - margin.bottom);

  const polylinePoints = curvaVAAD.map(d => `${getX(d.edad)},${getY(d.vaad)}`).join(' ');

  const posXSeleccionada = getX(edad);
  const posYSeleccionada = getY(vaadSeleccionado);

  return (
    <div className="space-y-6">
      <div className={`border-b pb-4 border-slate-300 dark:border-slate-800`}>
        <span className={`text-sm font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400`}>
          La Expansión de Erogaciones
        </span>
        <h3 className={`text-3xl sm:text-4xl font-black mt-1 text-slate-950 dark:text-white`}>
          Expansión Geométrica por Ajustes Arancelarios y Ecuación Unificada del VAAD
        </h3>
        <p className={`text-base sm:text-lg mt-2 leading-relaxed text-slate-800 font-normal dark:text-slate-300`}>
          Para calcular cuánto dinero vale un paciente que ingresa a diálisis, debemos unir la probabilidad de que siga con vida con dos fuerzas financieras opuestas: el descuento de traer el dinero del futuro al presente y la tasa de actualización o ajustes arancelarios del módulo.
        </p>
      </div>

      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-${visibleCount || 1} gap-2.5`}>
        {/* ------------------------------------------- INI: p1_p5_a1 --------------------------------------------- */}
        {hasPermission('p1_p5_a1') && (
          <button
            onClick={() => setActiveTab(activeTab === 'sec1' ? null : 'sec1')}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-all duration-200 flex items-center justify-between ${activeTab === 'sec1'
              ? 'bg-rose-50 border-rose-500 text-slate-900 shadow-md ring-2 ring-rose-500 dark:bg-rose-500/20 dark:border-rose-500 dark:text-rose-300'
              : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-rose-50/50 hover:border-rose-400 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:border-rose-500/50 dark:hover:text-white'
              }`}
          >
            <span>Ecuación VAAD</span>
            <span>{activeTab === 'sec1' ? '👁️' : '🙈'}</span>
          </button>
        )}
        {/* ------------------------------------------- FIN: p1_p5_a1 --------------------------------------------- */}

        {/* ------------------------------------------- INI: p1_p5_a2 --------------------------------------------- */}
        {hasPermission('p1_p5_a2') && (
          <button
            onClick={() => setActiveTab(activeTab === 'sec2' ? null : 'sec2')}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-all duration-200 flex items-center justify-between ${activeTab === 'sec2'
              ? 'bg-teal-50 border-teal-500 text-slate-900 shadow-md ring-2 ring-teal-500 dark:bg-teal-500/20 dark:border-teal-500 dark:text-teal-300'
              : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-teal-50/50 hover:border-teal-400 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:border-teal-500/50 dark:hover:text-white'
              }`}
          >
            <span>Tasa Descuento</span>
            <span>{activeTab === 'sec2' ? '👁️' : '🙈'}</span>
          </button>
        )}
        {/* ------------------------------------------- FIN: p1_p5_a2 --------------------------------------------- */}

        {/* ------------------------------------------- INI: p1_p5_a3 --------------------------------------------- */}
        {hasPermission('p1_p5_a3') && (
          <button
            onClick={() => setActiveTab(activeTab === 'sec3' ? null : 'sec3')}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-all duration-200 flex items-center justify-between ${activeTab === 'sec3'
              ? 'bg-indigo-50 border-indigo-500 text-slate-900 shadow-md ring-2 ring-indigo-500 dark:bg-indigo-500/20 dark:border-indigo-500 dark:text-indigo-300'
              : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-indigo-50/50 hover:border-indigo-400 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:border-indigo-500/50 dark:hover:text-white'
              }`}
          >
            <span>Evolución de los costos de la prestación dialítica</span>
            <span>{activeTab === 'sec3' ? '👁️' : '🙈'}</span>
          </button>
        )}
        {/* ------------------------------------------- FIN: p1_p5_a3 --------------------------------------------- */}

        {/* ------------------------------------------- INI: p1_p5_a4 --------------------------------------------- */}
        {hasPermission('p1_p5_a4') && (
          <button
            onClick={() => setActiveTab(activeTab === 'sec4' ? null : 'sec4')}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-all duration-200 flex items-center justify-between ${activeTab === 'sec4'
              ? 'bg-purple-50 border-purple-500 text-slate-900 shadow-md ring-2 ring-purple-500 dark:bg-purple-500/20 dark:border-purple-500 dark:text-purple-300'
              : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-purple-50/50 hover:border-purple-400 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:border-purple-500/50 dark:hover:text-white'
              }`}
          >
            <span>Factor de Ajustes Arancelarios y Descuento Real</span>
            <span>{activeTab === 'sec4' ? '👁️' : '🙈'}</span>
          </button>
        )}
        {/* ------------------------------------------- FIN: p1_p5_a4 --------------------------------------------- */}

        {/* ------------------------------------------- INI: p1_p5_a5 --------------------------------------------- */}
        {hasPermission('p1_p5_a5') && (
          <button
            onClick={() => setActiveTab(activeTab === 'sec5' ? null : 'sec5')}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-all duration-200 flex items-center justify-between ${activeTab === 'sec5'
              ? 'bg-cyan-50 border-cyan-600 text-slate-900 shadow-md ring-2 ring-cyan-600 dark:bg-cyan-500/10 dark:border-cyan-500 dark:text-white dark:shadow-lg dark:shadow-cyan-500/10'
              : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-cyan-50/50 hover:border-cyan-400 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:border-cyan-500/50 dark:hover:text-white'
              }`}
          >
            <span>Ecuación Unificada del VAAD</span>
            <span>{activeTab === 'sec5' ? '👁️' : '🙈'}</span>
          </button>
        )}
        {/* ------------------------------------------- FIN: p1_p5_a5 --------------------------------------------- */}

        {/* ------------------------------------------- INI: p1_p5_a6 --------------------------------------------- */}
        {hasPermission('p1_p5_a6') && (
          <button
            onClick={() => setActiveTab(activeTab === 'sec6' ? null : 'sec6')}
            className={`p-2.5 rounded-xl border text-xs font-black transition-all duration-200 flex items-center justify-between ${activeTab === 'sec6'
              ? 'bg-emerald-100 border-emerald-600 text-emerald-950 shadow-md ring-2 ring-emerald-600 dark:bg-emerald-950 dark:border-emerald-500 dark:text-emerald-200'
              : 'bg-slate-50 border-slate-300 text-emerald-800 hover:bg-emerald-50/50 hover:border-emerald-400 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-emerald-400 dark:hover:bg-slate-800/80 dark:hover:text-white'
              }`}
          >
            <span>⚡ Simulador VAAD</span>
            <span>{activeTab === 'sec6' ? '👁️' : '🙈'}</span>
          </button>
        )}
        {/* ------------------------------------------- FIN: p1_p5_a6 --------------------------------------------- */}
      </div>

      {activeTab === 'sec1' && (
        <div className="p-5 rounded-2xl border transition-all space-y-4 bg-teal-50 border-teal-500 text-slate-800 font-normal dark:bg-slate-950 dark:border-teal-500/30 dark:text-slate-300">
          <h4 className={`text-sm font-bold uppercase tracking-wider text-teal-950 dark:text-teal-400`}>
            🔬 La Fuerza de Salida: ¿Por qué un paciente deja de estar en Diálisis?
          </h4>

          <div className={`p-4 rounded-xl border text-[18px] leading-relaxed bg-white border-teal-300 shadow-sm dark:bg-slate-900/80 dark:border-slate-800`}>
            <p className="mb-2">
              <strong>Concepto Claro:</strong> Un paciente que entra a diálisis no se queda allí para siempre. Solo deja de recibir diálisis por dos motivos: porque lamentablemente fallece o porque recibe un trasplante renal exitoso.
            </p>
            <p>
              Actuarialmente, sumamos estas dos "fuerzas de salida" para calcular con exactitud qué probabilidad real tiene el paciente de seguir en tratamiento en cualquier mes futuro.
            </p>
          </div>

          <div className={`p-4 rounded-xl border text-[18px] space-y-2 bg-white border-teal-300 shadow-sm dark:bg-slate-900 dark:border-slate-800`}>
            <span className="font-bold text-teal-600 dark:text-teal-400">Suma Aditiva de Salidas (Decremento Múltiple):</span>
            <MathJaxFormula display={true} formula="\mu_{x+t}^{(\tau)} = \mu_{x+t}^{(01)} + \mu_{x+t}^{(02)}" className="text-[24px]" />
            <span className="font-bold text-teal-600 dark:text-teal-400 mt-2 block">Probabilidad Exacta de Permanecer con Vida y en Diálisis:</span>
            <MathJaxFormula display={true} formula="{_t p_x^{(\tau)}} = \exp \left( - \int_{0}^{t} \left[ \mu_{x+s}^{(01)} + \mu_{x+s}^{(02)} \right] ds \right)" className="text-[24px]" />
          </div>

          <div className="pl-3 border-l-2 border-teal-500/40 text-[18px] leading-relaxed space-y-1">
            <span className="font-bold">donde:</span>
            <ul className="list-disc pl-4 space-y-0.5">
              <li><MathJaxFormula formula="\mu_{x+s}^{(01)}" className="inline-block text-[16px]" />: Fuerza o velocidad de mortalidad en diálisis para un paciente de edad <MathJaxFormula formula="x" className="inline-block text-[16px]" /> tras un tiempo transcurrido <MathJaxFormula formula="s" className="inline-block text-[16px]" />.</li>
              <li><MathJaxFormula formula="\mu_{x+s}^{(02)}" className="inline-block text-[16px]" />: Fuerza o velocidad de salida por haber recibido un trasplante renal o haber recuperado la función renal.</li>
              <li><MathJaxFormula formula="{_t p_x^{(\tau)}}" className="inline-block text-[16px]" />: Probabilidad acumulada de que el paciente continúe con vida en la sala de diálisis al tiempo <MathJaxFormula formula="t" className="inline-block text-[16px]" />.</li>
            </ul>
          </div>
        </div>
      )}

      {/* SECCION 2 */}
      {activeTab === 'sec2' && (
        <div className={`p-5 rounded-2xl border transition-all space-y-4 bg-cyan-50/60 border-cyan-500 text-slate-800 font-normal dark:bg-slate-950 dark:border-cyan-500/30 dark:text-slate-300`}>
          <h4 className={`text-sm font-bold uppercase tracking-wider text-cyan-950 dark:text-cyan-400`}>
            📊 Eventos Competitivos y Ajuste por Salud del Paciente (Fine & Gray)
          </h4>

          <div className={`p-4 rounded-xl border text-xs leading-relaxed bg-white border-cyan-300 shadow-sm dark:bg-slate-900/80 dark:border-slate-800`}>
            <p className="mb-2">
              <strong>Concepto Claro:</strong> No todos los pacientes son iguales. Un paciente joven sin diabetes tiene probabilidades de supervivencia y trasplante muy distintas a las de un paciente mayor con patologías vasculares.
            </p>
            <p>
              Mediante la metodología de Fine y Gray, restamos de la totalidad (<MathJaxFormula formula="1" />) los porcentajes acumulados de personas que ya fallecieron o que se trasplantaron, ajustando cada cifra según la salud inicial del paciente.
            </p>
          </div>

          <div className={`p-4 rounded-xl border text-xs space-y-2 bg-white border-cyan-300 shadow-sm dark:bg-slate-900 dark:border-slate-800`}>
            <span className="font-bold text-cyan-600 dark:text-cyan-400">Permanencia por Resta de Incidencias Acumuladas (CIF):</span>
            <MathJaxFormula display={true} formula="{_t p_x^{(\tau)}}(Z) = 1 - CIF_{\text{muerte}}(t; Z) - CIF_{\text{trasplante}}(t; Z)" />
          </div>

          <div className="pl-3 border-l-2 border-cyan-500/40 text-xs leading-relaxed space-y-1">
            <span className="font-bold">donde:</span>
            <ul className="list-disc pl-4 space-y-0.5">
              <li><MathJaxFormula formula="CIF_{\text{muerte}}(t; Z)" />: Porcentaje acumulado de pacientes con el perfil de salud <MathJaxFormula formula="Z" /> que habrán fallecido antes del tiempo <MathJaxFormula formula="t" />.</li>
              <li><MathJaxFormula formula="CIF_{\text{trasplante}}(t; Z)" />: Porcentaje acumulado de pacientes con el perfil <MathJaxFormula formula="Z" /> que habrán recibido un trasplante antes del tiempo <MathJaxFormula formula="t" />.</li>
              <li><MathJaxFormula formula="Z" />: Perfil de salud específico del paciente (Edad, Sexo, Diabetes, Enfermedad Vascular, etc.).</li>
            </ul>
          </div>
        </div>
      )}

      {/* SECCION 3 */}
      {activeTab === 'sec3' && (
        <div className={`p-5 rounded-2xl border transition-all space-y-4 bg-amber-50/60 border-amber-500 text-slate-800 font-normal dark:bg-slate-950 dark:border-amber-500/30 dark:text-slate-300`}>
          <h4 className={`text-sm font-bold uppercase tracking-wider text-amber-950 dark:text-amber-400`}>
            💰 La Estructura Financiera: Pagos Mensuales y Descuento por Tiempo
          </h4>

          <div className={`p-4 rounded-xl border text-xs leading-relaxed bg-white border-amber-300 shadow-sm dark:bg-slate-900/80 dark:border-amber-800`}>
            <p className="mb-2">
              <strong>Concepto Claro:</strong> Las clínicas de diálisis no le cobran a la obra social una vez al año, sino todos los meses. Por lo tanto, no podemos calcular el dinero en años enteros; debemos dividir el año en 12 meses.
            </p>
            <p>
              Además, un peso que la obra social va a pagar dentro de 5 años vale menos hoy que un peso pagado este mes. Aplicamos una tasa de descuento (<MathJaxFormula formula="r" />) para traer ese dinero futuro a valor presente.
            </p>
          </div>

          <div className={`p-4 rounded-xl border text-xs space-y-2 bg-white border-amber-300 shadow-sm dark:bg-slate-900 dark:border-amber-800`}>
            <span className="font-bold text-amber-600 dark:text-amber-400">Tasa de Descuento Financiera Mensual Equivalente:</span>
            <MathJaxFormula display={true} formula="j = (1 + r)^{1/12} - 1" />
            <span className="font-bold text-amber-600 dark:text-amber-400 mt-2 block">Factor para Actualizar Financieramente un Pago Mensual del Mes k:</span>
            <MathJaxFormula display={true} formula="v_m^k = (1 + r)^{-k/12}" />
          </div>

          <div className="pl-3 border-l-2 border-amber-500/40 text-xs leading-relaxed space-y-1">
            <span className="font-bold">donde:</span>
            <ul className="list-disc pl-4 space-y-0.5">
              <li><MathJaxFormula formula="r" />: Tasa de interés o costo de oportunidad financiero anual.</li>
              <li><MathJaxFormula formula="k" />: Número de mes futuro en el que se realizará la prestación (<MathJaxFormula formula="k = 0, 1, 2, \dots" />).</li>
              <li><MathJaxFormula formula="v_m^k" />: Factor que reduce el valor del pago futuro del mes <MathJaxFormula formula="k" /> para expresar su equivalencia hoy.</li>
            </ul>
          </div>
        </div>
      )}

      {/* SECCION 4 */}
      {activeTab === 'sec4' && (
        <div className={`p-5 rounded-2xl border transition-all space-y-4 bg-purple-50/60 border-purple-500 text-slate-800 font-normal dark:bg-slate-950 dark:border-purple-500/30 dark:text-slate-300`}>
          <h4 className={`text-sm font-bold uppercase tracking-wider text-purple-950 dark:text-purple-400`}>
            📈 El Factor de Ajustes Arancelarios (g): La Actualización del Módulo
          </h4>

          <div className={`p-4 rounded-xl border text-xs leading-relaxed bg-white border-purple-300 shadow-sm dark:bg-slate-900/80 dark:border-purple-800`}>
            <p className="mb-2">
              <strong>Concepto Claro:</strong> En el sistema de salud, los aranceles de los módulos de diálisis sufren actualizaciones periódicas de precios para mantener la paridad técnica de la prestación. Llamamos <strong>tasa de ajustes arancelarios (<MathJaxFormula formula="g" />)</strong> a esta tasa de variación del módulo.
            </p>
            <p>
              Mientras que el descuento financiero (<MathJaxFormula formula="r" />) achica los valores futuros traídos al presente, la tasa de ajustes arancelarios (<MathJaxFormula formula="g" />) los expande. El modelo combina ambas fuerzas en un solo factor neto de actualización: <MathJaxFormula formula="\left(\frac{1+g}{1+r}\right)" />.
            </p>
          </div>

          <div className={`p-4 rounded-xl border text-xs space-y-2 bg-white border-purple-300 shadow-sm dark:bg-slate-900 dark:border-purple-800`}>
            <span className="font-bold text-purple-600 dark:text-purple-400">Costo del Arancel Mensual en el Mes k con Ajustes Arancelarios:</span>
            <MathJaxFormula display={true} formula="C_k = C_0 \cdot (1 + g)^{k/12}" />
            <span className="font-bold text-purple-600 dark:text-purple-400 mt-2 block">Factor Neto Combinado (Ajustes Arancelarios vs Descuento Financiero):</span>
            <MathJaxFormula display={true} formula="v_{\text{neto}}^k = \left( \frac{1 + g}{1 + r} \right)^{k/12}" />
          </div>

          <div className="pl-3 border-l-2 border-purple-500/40 text-xs leading-relaxed space-y-1">
            <span className="font-bold">donde:</span>
            <ul className="list-disc pl-4 space-y-0.5">
              <li><MathJaxFormula formula="C_0" />: Arancel mensual inicial que cuesta un paciente hoy (<MathJaxFormula formula="k=0" />).</li>
              <li><MathJaxFormula formula="g" />: Tasa anual de variación y ajustes arancelarios del módulo de diálisis.</li>
              <li><MathJaxFormula formula="r" />: Tasa anual de descuento financiero.</li>
            </ul>
          </div>
        </div>
      )}

      {/* SECCION 5 */}
      {activeTab === 'sec5' && (
        <div className={`p-6 rounded-3xl border-2 shadow-2xl transition-all space-y-5 bg-white border-rose-600 ring-2 ring-rose-600/10 text-slate-950 dark:bg-slate-900 dark:border-rose-500/50 dark:ring-1 dark:ring-rose-500/20 dark:text-white`}>

          <div className="flex items-center justify-between border-b pb-3 border-rose-500/30">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              <h4 className="text-base sm:text-lg font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Ecuación Unificada del Valor Actual Actuarial de Diálisis (VAAD)
              </h4>
            </div>
            <span className="px-3 py-1 text-xs font-black uppercase tracking-widest rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30">
              Ecuación Base de Simulación
            </span>
          </div>

          <div className={`p-4 rounded-xl border text-xs leading-relaxed bg-rose-50/60 border-rose-200 text-slate-900 dark:bg-slate-950/80 dark:border-slate-800`}>
            <p className="mb-2">
              <strong>¿Qué significa esta Ecuación Final?</strong> Esta fórmula nos da el precio exacto en pesos que vale la cobertura de diálisis de un paciente que acaba de ingresar al sistema.
            </p>
            <p>
              Sumamos mes a mes todos los pagos futuros esperados, multiplicando el arancel inicial (<MathJaxFormula formula="C_0" />) por el factor neto de ajustes arancelarios y descuento financiero <MathJaxFormula formula="\left(\frac{1+g}{1+r}\right)^{k/12}" /> y por la probabilidad real de que el paciente siga con vida y en diálisis.
            </p>
          </div>

          <div className={`p-5 rounded-2xl border text-center space-y-4 bg-rose-50/80 border-rose-600 text-slate-900 shadow-inner dark:bg-slate-950 dark:border-rose-500/40 dark:text-rose-300`}>
            <span className="text-sm font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 block">
              Ecuación Completa en Términos de Incidencia Acumulada (Fine & Gray):
            </span>

            <div className="overflow-x-auto py-2">
              <MathJaxFormula
                display={true}
                formula="VAAD_x(Z) = C_0 \cdot \sum_{k=0}^{(\omega - x) \cdot 12 - 1} \left( \frac{1 + g}{1 + r} \right)^{k/12} \cdot \left[ 1 - CIF_{\text{muerte}}\left(\frac{k}{12}; Z\right) - CIF_{\text{trasplante}}\left(\frac{k}{12}; Z\right) \right]"
              />
            </div>
          </div>
        </div>
      )}

      {/* APARTADO 6: MODELO DE SIMULACIÓN INTERACTIVO DEL VAAD */}
      {(activeTab === 'sec6' || activeTab === null) && (
        <div className="p-6 rounded-3xl border-2 shadow-2xl transition-all space-y-6 bg-white border-emerald-600 ring-2 ring-emerald-600/10 text-slate-900 dark:bg-slate-950 dark:border-emerald-500/40 dark:ring-1 dark:ring-emerald-500/20 dark:text-slate-100">

          {/* Encabezado del Simulador */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 border-emerald-500/30 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <h4 className="text-base sm:text-lg font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Modelo de Simulación Interactivo del VAAD
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Ajusta las 5 variables de entrada alineadas en la barra superior para proyectar la curva actuarial del pasivo.
              </p>
            </div>
            <span className="self-start sm:self-auto px-3 py-1 text-xs font-black uppercase tracking-widest rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40">
              Motor Actuarial Vivo
            </span>
          </div>

          {/* BARRA SUPERIOR UNIFICADA EN UNA SOLA LÍNEA HORIZONTAL DE 5 PARÁMETROS EDITABLES */}
          <div className={`p-4 rounded-2xl border space-y-3 bg-emerald-50/50 border-emerald-500 text-slate-900 shadow-md dark:bg-slate-950 dark:border-emerald-500/30 dark:text-slate-100`}>
            <span className="text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
              🎛️ Parámetros de Entrada del Modelo de Simulación:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

              {/* 1. Edad del Paciente (Slider + Numérico) */}
              <div className={`p-2.5 rounded-xl border flex flex-col justify-between space-y-1.5 bg-white border-slate-300 text-slate-900 shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100`}>
                <div className="flex items-center justify-between text-xs font-bold">
                  <label htmlFor="input-edad" className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                    <span>Edad</span>
                    <MathJaxFormula formula="x" />
                  </label>
                  <input
                    id="input-edad"
                    type="number"
                    min="18"
                    max="90"
                    value={edad}
                    onChange={(e) => setEdad(Math.max(18, Math.min(90, Number(e.target.value) || 18)))}
                    className={`w-12 text-center text-xs font-bold py-0.5 rounded border border-emerald-500/50 focus:outline-none bg-white text-slate-900 dark:bg-slate-950 dark:text-white`}
                  />
                </div>
                <input
                  type="range"
                  min="18"
                  max="90"
                  value={edad}
                  onChange={(e) => setEdad(Number(e.target.value))}
                  className="w-full accent-teal-500 cursor-pointer h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400 text-right font-mono font-bold">{edad} años</span>
              </div>

              {/* 2. Modalidad de Ingreso (Buscador por debajo del elemento seleccionado) */}
              <div className={`p-2.5 rounded-xl border flex flex-col justify-between space-y-1.5 bg-white border-slate-300 text-slate-900 shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100`}>
                <label htmlFor="input-modalidad" className="text-xs font-bold text-slate-900 dark:text-slate-100">Modalidad Ingreso:</label>
                <select
                  id="input-modalidad"
                  value={modalidad}
                  onChange={handleSelectModalidad}
                  className={`w-full text-xs font-bold py-1 px-1 rounded border border-emerald-500/50 focus:outline-none bg-white text-slate-900 dark:bg-slate-950 dark:text-white`}
                >
                  {modalidadesFiltradas.map(m => (
                    <option key={m.id} value={m.id} className="bg-white text-slate-900 font-bold dark:bg-slate-900 dark:text-white dark:font-bold">{m.nombre}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="🔍 Buscar modalidad..."
                  value={searchModalidad}
                  onChange={(e) => setSearchModalidad(e.target.value)}
                  className={`w-full text-xs font-medium p-1 rounded border focus:outline-none border-slate-300 bg-white text-slate-900 placeholder-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:placeholder-slate-500`}
                />
              </div>

              {/* 3. Comorbilidad Principal (Buscador por debajo del elemento seleccionado) */}
              <div className={`p-2.5 rounded-xl border flex flex-col justify-between space-y-1.5 bg-white border-slate-300 text-slate-900 shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100`}>
                <label htmlFor="input-comorbilidad" className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                  <span>Comorbilidad</span>
                  <MathJaxFormula formula="Z" />
                </label>
                <select
                  id="input-comorbilidad"
                  value={comorbilidad}
                  onChange={handleSelectComorbilidad}
                  className={`w-full text-xs font-bold py-1 px-1 rounded border border-emerald-500/50 focus:outline-none bg-white text-slate-900 dark:bg-slate-950 dark:text-white`}
                >
                  {comorbilidadesFiltradas.map(c => (
                    <option key={c.id} value={c.id} className="bg-white text-slate-900 font-bold dark:bg-slate-900 dark:text-white dark:font-bold">{c.nombre}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="🔍 Buscar comorbilidad..."
                  value={searchComorbilidad}
                  onChange={(e) => setSearchComorbilidad(e.target.value)}
                  className={`w-full text-xs font-medium p-1 rounded border focus:outline-none border-slate-300 bg-white text-slate-900 placeholder-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:placeholder-slate-500`}
                />
              </div>

              {/* 4. Ajustes Esperados (g) y Tasa Nominal Anual (TNA) */}
              <div className={`p-2.5 rounded-xl border flex flex-col justify-between space-y-3 bg-white border-slate-300 text-slate-900 shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100`}>
                {/* Control g */}
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <label htmlFor="input-ajuste-g" className="text-xs text-slate-900 dark:text-slate-100 font-bold flex items-center gap-1">
                      <span>Crecimiento</span>
                      <MathJaxFormula formula="g" /> %
                    </label>
                    <input
                      id="input-ajuste-g"
                      type="number"
                      min="0"
                      max="150"
                      value={ajusteG}
                      onChange={(e) => setAjusteG(Math.max(0, Math.min(150, Number(e.target.value) || 0)))}
                      className={`w-12 text-center text-xs font-bold py-0.5 rounded border border-emerald-500/50 focus:outline-none bg-white text-slate-900 dark:bg-slate-950 dark:text-white`}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="150"
                    value={ajusteG}
                    onChange={(e) => setAjusteG(Number(e.target.value))}
                    className="w-full accent-teal-500 cursor-pointer h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400 text-right font-mono font-bold">{ajusteG}% anual</span>
                </div>

                {/* Control TNA */}
                <div className="flex flex-col space-y-1 border-t pt-2 border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <label htmlFor="input-tasa-tna" className="text-xs text-slate-900 dark:text-slate-100 font-bold flex items-center gap-1">
                      <span>Descuento (TNA)</span>
                      <MathJaxFormula formula="r" /> %
                    </label>
                    <input
                      id="input-tasa-tna"
                      type="number"
                      min="0"
                      max="150"
                      value={tasaInteresTNA}
                      onChange={(e) => setTasaInteresTNA(Math.max(0, Math.min(150, Number(e.target.value) || 0)))}
                      className={`w-12 text-center text-xs font-bold py-0.5 rounded border border-emerald-500/50 focus:outline-none bg-white text-slate-900 dark:bg-slate-950 dark:text-white`}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="150"
                    value={tasaInteresTNA}
                    onChange={(e) => setTasaInteresTNA(Number(e.target.value))}
                    className="w-full accent-teal-500 cursor-pointer h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400 text-right font-mono font-bold">
                    TNA: {tasaInteresTNA}% / TEA: {(teaCalculada * 100).toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* 5. Momento Calculatorio / Período (Buscador por debajo del elemento seleccionado) */}
              <div className={`p-2.5 rounded-xl border flex flex-col justify-between space-y-1.5 bg-white border-slate-300 text-slate-900 shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100`}>
                <label htmlFor="input-periodo" className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                  <span>Período</span>
                  <MathJaxFormula formula="C_0" />
                </label>
                <select
                  id="input-periodo"
                  value={periodo}
                  onChange={handleSelectPeriodo}
                  className={`w-full text-xs font-bold py-1 px-1 rounded border border-emerald-500/50 focus:outline-none bg-white text-slate-900 dark:bg-slate-950 dark:text-white`}
                >
                  {periodosFiltrados.map(p => (
                    <option key={p.periodo} value={p.periodo} className="bg-white text-slate-900 font-bold dark:bg-slate-900 dark:text-white dark:font-bold">{p.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="🔍 Filtrar período..."
                  value={searchPeriodo}
                  onChange={(e) => setSearchPeriodo(e.target.value)}
                  className={`w-full text-xs font-medium p-1 rounded border focus:outline-none border-slate-300 bg-white text-slate-900 placeholder-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:placeholder-slate-500`}
                />
                <span className="text-[11px] text-teal-600 dark:text-teal-400 font-extrabold truncate" title={resolucionPAMI}>
                  📜 {resolucionPAMI}
                </span>
              </div>

            </div>
          </div>

          {/* GRÁFICO SVG DE CURVA ACTUARIAL DE VALORES ACTUALES */}
          <div className={`p-4 rounded-2xl border space-y-2 bg-white border-slate-200 shadow-md dark:bg-slate-900 dark:border-slate-800`}>
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-900 dark:text-white font-black uppercase tracking-wider text-xs flex items-center gap-1">
                <span>📈 Curva del Valor Actual Actuarial</span>
                <MathJaxFormula formula="VAAD_x" />
                <span>según Edad del Paciente (18 a 90 años)</span>
              </span>
              <span className="text-xs font-mono text-slate-800 dark:text-slate-300 font-bold">
                Punto rojo = Edad Seleccionada ({edad} años)
              </span>
            </div>

            <div className="w-full overflow-x-auto">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto max-h-56">
                <line x1={margin.left} y1={svgHeight - margin.bottom} x2={svgWidth - margin.right} y2={svgHeight - margin.bottom} stroke={isDarkMode ? '#475569' : '#cbd5e1'} strokeWidth="1.5" />
                <line x1={margin.left} y1={margin.top} x2={margin.left} y2={svgHeight - margin.bottom} stroke={isDarkMode ? '#475569' : '#cbd5e1'} strokeWidth="1.5" />

                {[20, 35, 50, 65, 80].map(e => (
                  <g key={e}>
                    <line x1={getX(e)} y1={svgHeight - margin.bottom} x2={getX(e)} y2={svgHeight - margin.bottom + 5} stroke={isDarkMode ? '#94a3b8' : '#64748b'} />
                    <text x={getX(e)} y={svgHeight - margin.bottom + 18} fill={isDarkMode ? '#94a3b8' : '#64748b'} fontSize="10" textAnchor="middle" fontWeight="bold">
                      {e}a
                    </text>
                  </g>
                ))}

                {[minVAAD, (minVAAD + maxVAAD) / 2, maxVAAD].map((val, idx) => (
                  <text key={idx} x={margin.left - 8} y={getY(val) + 4} fill={isDarkMode ? '#94a3b8' : '#64748b'} fontSize="9" textAnchor="end" fontFamily="monospace">
                    ${(val / 1000000).toFixed(1)}M
                  </text>
                ))}

                <polyline fill="none" stroke="#10b981" strokeWidth="3" points={polylinePoints} strokeLinecap="round" strokeLinejoin="round" />

                <line x1={posXSeleccionada} y1={svgHeight - margin.bottom} x2={posXSeleccionada} y2={posYSeleccionada} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1={margin.left} y1={posYSeleccionada} x2={posXSeleccionada} y2={posYSeleccionada} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />

                <circle cx={posXSeleccionada} cy={posYSeleccionada} r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />

                <rect x={posXSeleccionada - 50} y={posYSeleccionada - 28} width="100" height="20" rx="4" fill={isDarkMode ? '#0f172a' : '#ffffff'} stroke="#ef4444" strokeWidth="1" />
                <text x={posXSeleccionada} y={posYSeleccionada - 15} fill="#ef4444" fontSize="10" fontWeight="extrabold" textAnchor="middle">
                  ${(vaadSeleccionado / 1000000).toFixed(2)}M
                </text>
              </svg>
            </div>
          </div>

          {/* CARD DE RESULTADO FINAL DESTACADO DE SIMULACIÓN */}
          <div className="p-6 rounded-2xl border-2 shadow-xl bg-white border-emerald-600 ring-2 ring-emerald-600/20 dark:bg-slate-900 dark:border-emerald-500/60 dark:ring-1 dark:ring-emerald-500/30">
            <div className="flex flex-col md:flex-row items-stretch justify-between gap-6">
              <div className="flex flex-col justify-between text-center md:text-left space-y-4 md:space-y-0 py-1">
                <span className="text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 flex items-center gap-1 justify-center md:justify-start">
                  <span>💎 Valor Actual Actuarial de Diálisis</span>
                  <MathJaxFormula formula="VAAD_x" />
                  <span>Determinado:</span>
                </span>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight my-auto py-4">
                  ${vaadSeleccionado.toLocaleString('es-AR')} <span className="text-xs font-normal text-slate-400">ARS</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                  En <strong>{periodoObj.label}</strong>, el valor de <strong>${vaadSeleccionado.toLocaleString('es-AR')} ARS</strong> representa la <strong>reserva de capital hoy requerida</strong> para financiar la totalidad del tratamiento futuro esperado de un paciente de <strong>{edad} años</strong> en <strong>{modObj.nombre}</strong>, considerando su expectativa de permanencia en el tratamiento, los ajustes de aranceles (<MathJaxFormula formula="g" /> = {ajusteG}%) y la tasa de descuento financiero (TNA = {tasaInteresTNA}%). Módulo mensual <MathJaxFormula formula="C_0" /> = ${C0.toLocaleString('es-AR')} ({multiplicadorSesiones === 13 ? `13 sesiones × $${valorUnitario.toLocaleString('es-AR')}` : `1 módulo × $${valorUnitario.toLocaleString('es-AR')}`}). <span className="text-teal-400 font-semibold">Fuente: {resolucionPAMI}.</span>
                </p>
              </div>

              <div className="flex flex-col gap-3 justify-between w-full md:w-72 shrink-0">
                <div className="p-3 rounded-xl border text-center text-xs bg-emerald-50 border-emerald-200 dark:bg-slate-950 dark:border-slate-800 flex-1 flex flex-col justify-center">
                  <span className="text-xs text-slate-400 uppercase font-bold block">Permanencia Esperada</span>
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm mt-1">
                    {esperanzaVidaMeses} meses ({(esperanzaVidaMeses / 12).toFixed(1)} años)
                  </span>
                </div>

                <div className="p-3 rounded-xl border text-center text-xs bg-emerald-50 border-emerald-200 dark:bg-slate-950 dark:border-slate-800 flex-1 flex flex-col justify-center">
                  <span className="text-xs text-slate-400 uppercase font-bold block">Parámetros Financieros</span>
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm mt-1">
                    g = {ajusteG}% / TNA = {tasaInteresTNA}% (TEA = {(teaCalculada * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Fórmulas matemáticas de verificación detallada */}
            {/* ------------------------------------------- INI: p1_p5_a5 --------------------------------------------- */}
            {hasPermission('p1_p5_a5') && (
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-4">
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl space-y-3">
                  <div>
                    <h4 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                      Ecuación General de Descuento Actuarial Unificada:
                    </h4>
                    <div className="overflow-x-auto py-2 text-center text-base sm:text-lg text-slate-800 dark:text-slate-200">
                      <MathJaxFormula formula={"VAAD_x = \\sum_{k=0}^{M-1} \\left[ C_0 \\cdot \\left( \\frac{1+g}{1+TEA} \\right)^{\\frac{k}{12}} \\cdot \\prod_{j=1}^{k} (1 - q_j) \\right]"} />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                      Ecuación Reemplazada con Variables de Simulación:
                    </h4>
                    <div className="overflow-x-auto py-2 text-center text-base sm:text-lg text-slate-800 dark:text-slate-200">
                      <MathJaxFormula formula={"VAAD_{" + edad + "} = \\sum_{k=0}^{" + (Math.min((100 - edad) * 12, 360) - 1) + "} \\left[ " + fmtLatex(C0, 0) + " \\cdot \\left( \\frac{1 + " + fmtLatex(ajusteG / 100, 2) + "}{1 + " + fmtLatex(teaCalculada, 4) + "} \\right)^{\\frac{k}{12}} \\cdot \\prod_{j=1}^{k} (1 - q_j) \\right] = " + fmtLatex(vaadSeleccionado, 0)} />
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-mono mt-1">
                    * Donde <MathJaxFormula formula="TEA" /> se obtiene de la TNA cargada ({tasaInteresTNA} %): <MathJaxFormula formula={`TEA = (1 + \\frac{${fmtLatex(tasaInteresTNA / 100, 4)}}{12})^{12} - 1 = ${fmtLatex(teaCalculada * 100, 2)}\\%`} />.
                    La variable <MathJaxFormula formula="k" /> representa el mes de la proyección (desde 0 hasta <MathJaxFormula formula="M-1" />), donde <MathJaxFormula formula="M" /> es el límite máximo de meses proyectados ({Math.min((100 - edad) * 12, 360)} meses).
                    La variable <MathJaxFormula formula="q_j" /> es la probabilidad mensual de salida ajustada por el riesgo total del paciente (edad base más comorbilidades).
                  </div>
                </div>
              </div>
            )}
            {/* ------------------------------------------- FIN: p1_p5_a5 --------------------------------------------- */}

          </div>

        </div>
      )}

    </div>
  );
}
