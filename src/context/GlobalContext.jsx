import React, { createContext, useContext, useState, useMemo } from 'react';
import seriesDataRaw from '../data/seriesData.json';

const GlobalContext = createContext();

export function GlobalProvider({ children }) {
  const [modalidadDialitica, setModalidadDialitica] = useState('HD');
  const [comorbilidadIngreso, setComorbilidadIngreso] = useState('DBT_EVP');
  const [edadPaciente, setEdadPaciente] = useState(45);
  const [tasaCrecimientoVaad, setTasaCrecimientoVaad] = useState(2); // en % mensual
  const [tasaDescuento, setTasaDescuento] = useState(25); // en % TNA

  const [aplicarCalidad, setAplicarCalidad] = useState(true); // Toggle con/sin calidad

  // Cómputo dinámico de extremos de la serie de datos para inicialización robusta
  const ultPeriodo = seriesDataRaw[seriesDataRaw.length - 1]?.periodo || '2026-07';
  const primerPeriodo = seriesDataRaw[0]?.periodo || '2020-12';

  const [periodoDesde, setPeriodoDesde] = useState(primerPeriodo);
  const [periodoHasta, setPeriodoHasta] = useState(ultPeriodo);
  const [momentoCalculatorio, setMomentoCalculatorio] = useState(ultPeriodo);
  const [mesesProyeccion, setMesesProyeccion] = useState(6);
  const [incidencias, setIncidencias] = useState({ cct: 40, usd: 30, ipc: 30 });
  const [lambdaRidge, setLambdaRidge] = useState(0.00001);
  const [expectativas, setExpectativas] = useState({ ipc: 2.0, usd: 2.0, cct: 2.5 });
  const [plazoPago, setPlazoPago] = useState(30); // en días
  const [padronPacientes, setPadronPacientes] = useState(30);
  const [sesionesMensuales, setSesionesMensuales] = useState(13);
  const [mesesAmortizacion, setMesesAmortizacion] = useState(12);

  // Serie de datos procesada centralmente inyectando Calidad si corresponde
  const seriesData = useMemo(() => {
    return seriesDataRaw.map(row => {
      const pctCalidad = row.porcentajeCalidad !== undefined ? row.porcentajeCalidad : 0;
      const factor = aplicarCalidad ? (1 + pctCalidad) : 1;
      return {
        ...row,
        valorSesionHD: row.valorSesionHD * factor,
        valorSesionHDF: row.valorSesionHDF * factor,
        valorModuloDP: row.valorModuloDP * factor
      };
    });
  }, [aplicarCalidad]);

  const value = {
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
    mesesAmortizacion, setMesesAmortizacion,
    aplicarCalidad, setAplicarCalidad,
    seriesData
  };

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobalParams() {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalParams must be used within a GlobalProvider');
  }
  return context;
}
