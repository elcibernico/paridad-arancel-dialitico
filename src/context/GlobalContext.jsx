import React, { createContext, useContext, useState } from 'react';

const GlobalContext = createContext();

export function GlobalProvider({ children }) {
  const [modalidadDialitica, setModalidadDialitica] = useState('HD');
  const [comorbilidadIngreso, setComorbilidadIngreso] = useState('DBT_EVP');
  const [edadPaciente, setEdadPaciente] = useState(45);
  const [tasaCrecimientoVaad, setTasaCrecimientoVaad] = useState(2); // en % mensual
  const [tasaDescuento, setTasaDescuento] = useState(25); // en % TNA
  const [periodoDesde, setPeriodoDesde] = useState('2024-01');
  const [periodoHasta, setPeriodoHasta] = useState('2026-04');
  const [mesesProyeccion, setMesesProyeccion] = useState(6);
  const [incidencias, setIncidencias] = useState({ cct: 40, usd: 30, ipc: 30 });
  const [lambdaRidge, setLambdaRidge] = useState(0.001);
  const [expectativas, setExpectativas] = useState({ ipc: 2.0, usd: 2.0, cct: 2.5 });
  const [plazoPago, setPlazoPago] = useState(30); // en días
  const [padronPacientes, setPadronPacientes] = useState(30);
  const [sesionesMensuales, setSesionesMensuales] = useState(13);
  const [mesesAmortizacion, setMesesAmortizacion] = useState(12);

  const value = {
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
    sesionesMensuales, setSesionesMensuales,
    mesesAmortizacion, setMesesAmortizacion
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
