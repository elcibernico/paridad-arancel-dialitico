import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import SlideContainer from './components/SlideContainer';
import Punto1 from './components/points/Punto1';
import Punto2 from './components/points/Punto2';
import Punto3 from './components/points/Punto3';
import Punto4 from './components/points/Punto4';
import Punto5 from './components/points/Punto5';
import Punto6 from './components/points/Punto6';
import Punto7 from './components/points/Punto7';
import Punto8 from './components/points/Punto8';
import Punto9 from './components/points/Punto9';
import Punto10 from './components/points/Punto10';
import Punto11 from './components/points/Punto11';

import GlobalParamsView from './components/GlobalParamsView';
import LoginView from './components/LoginView';
import AdminPanel from './components/AdminPanel';

import { useAuth } from './context/AuthContext';
import config from './config.json';
import { Split, Activity, TrendingUp, Settings, Lock } from 'lucide-react';

export default function App() {
  const { user, profile, logout, hasPermission, isRealAdmin } = useAuth();
  const [activeBlock, setActiveBlock] = useState(null);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);

  // Asegurar Modo Oscuro
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  }, []);

  if (!user) {
    return <LoginView />;
  }

  if (profile && !profile.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-red-400 p-6 text-center select-none font-sans">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-sm">
          <h2 className="text-xl font-bold">Usuario Inactivo</h2>
          <p className="text-xs text-slate-500 mt-2">Tu cuenta ha sido dada de baja temporalmente o aún no está activa. Contacta al administrador.</p>
          <button onClick={logout} className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700">Cerrar Sesión</button>
        </div>
      </div>
    );
  }

  // Si entra al panel de administración (solo admin real)
  if (showAdmin && isRealAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
        <Header activeBlock="admin" setActiveBlock={setActiveBlock} onBackToDashboard={() => setShowAdmin(false)} />
        <main className="flex-1">
          <AdminPanel onBack={() => setShowAdmin(false)} />
        </main>
        <Footer onAdminClick={() => setShowAdmin(true)} />
      </div>
    );
  }

  const handleAdminClick = () => {
    if (isRealAdmin) {
      setShowAdmin(true);
    }
  };

  const currentBlock = config.blocks.find(b => b.id === activeBlock);
  
  // Filtrar diapositivas según los permisos del usuario de manera invisible
  const allowedSections = currentBlock
    ? currentBlock.sections.filter(s => hasPermission(s.component) && hasPermission(s.id))
    : [];

  const activeSection = allowedSections.find(s => s.id === activeSectionId) || allowedSections[0];

  const handleNextSection = () => {
    if (!currentBlock || !activeSection) return;
    const currentIndex = allowedSections.findIndex(s => s.id === activeSection.id);
    if (currentIndex < allowedSections.length - 1) {
      setActiveSectionId(allowedSections[currentIndex + 1].id);
    }
  };

  const handlePrevSection = () => {
    if (!currentBlock || !activeSection) return;
    const currentIndex = allowedSections.findIndex(s => s.id === activeSection.id);
    if (currentIndex > 0) {
      setActiveSectionId(allowedSections[currentIndex - 1].id);
    }
  };

  const sectionHasAccess = !!activeSection;

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 bg-slate-950 text-slate-100 font-sans antialiased selection:bg-teal-500 selection:text-white">
      
      <Header
        activeBlock={activeBlock}
        setActiveBlock={(b) => {
          setActiveBlock(b);
          setActiveSectionId(null);
        }}
        onBackToDashboard={() => setActiveBlock(null)}
      />

      <main className="flex-1 flex flex-col">
        {activeBlock === null && (
          <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col justify-center flex-1">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Dashboard de Simulación</h2>
              <p className="text-sm text-slate-400 mt-2">Selecciona un módulo técnico para explorar las bases actuariales y econométricas.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Tarjeta 1: Modelo Actuarial */}
              {hasPermission('p1') && (
                <div
                  onClick={() => { setActiveBlock('p1'); setActiveSectionId('p1_p1'); }}
                  className="group cursor-pointer p-6 rounded-3xl bg-slate-900/60 border border-slate-850 hover:border-teal-500/50 hover:bg-slate-900/90 transition-all flex flex-col justify-between h-48 relative overflow-hidden"
                >
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-teal-500/5 rounded-full blur-xl group-hover:bg-teal-500/10 transition-all" />
                  <div>
                    <div className="p-3 w-fit rounded-xl bg-teal-500/10 text-teal-400 mb-4 group-hover:scale-110 transition-all">
                      <Activity className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Modelo Actuarial</h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Ideal teórico del VAAD, tablas actuariales híbridas e inferencia de riesgos competitivos.
                    </p>
                  </div>
                </div>
              )}

              {/* Tarjeta 2: Quiebre Metodológico */}
              {hasPermission('p2') && (
                <div
                  onClick={() => { setActiveBlock('p2'); setActiveSectionId('p2_p1'); }}
                  className="group cursor-pointer p-6 rounded-3xl bg-slate-900/60 border border-slate-850 hover:border-indigo-500/50 hover:bg-slate-900/90 transition-all flex flex-col justify-between h-48 relative overflow-hidden"
                >
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-all" />
                  <div>
                    <div className="p-3 w-fit rounded-xl bg-indigo-500/10 text-indigo-400 mb-4 group-hover:scale-110 transition-all">
                      <Split className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Quiebre Metodológico</h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Análisis ético, conflicto de financiamiento y cambio de paradigma hacia la paridad real.
                    </p>
                  </div>
                </div>
              )}

              {/* Tarjeta 3: Análisis Econométrico */}
              {hasPermission('p3') && (
                <div
                  onClick={() => { setActiveBlock('p3'); setActiveSectionId('p3_p1'); }}
                  className="group cursor-pointer p-6 rounded-3xl bg-slate-900/60 border border-slate-850 hover:border-emerald-500/50 hover:bg-slate-900/90 transition-all flex flex-col justify-between h-48 relative overflow-hidden"
                >
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all" />
                  <div>
                    <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 mb-4 group-hover:scale-110 transition-all">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Análisis Econométrico</h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Estimación MCO, diagnóstico de colapso y corrección Ridge de elasticidades de costo.
                    </p>
                  </div>
                </div>
              )}

              {/* Tarjeta 4: Parámetros Globales */}
              <div
                onClick={() => setActiveBlock('params')}
                className="group cursor-pointer p-6 rounded-3xl bg-slate-900/60 border border-slate-850 hover:border-amber-500/50 hover:bg-slate-900/90 transition-all flex flex-col justify-between h-48 relative overflow-hidden"
              >
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-all" />
                <div>
                  <div className="p-3 w-fit rounded-xl bg-amber-500/10 text-amber-400 mb-4 group-hover:scale-110 transition-all">
                    <Settings className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Parámetros Globales</h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Configuración unificada de tasas, plazos de pago y padrón de diálisis activa.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {activeBlock === 'params' && <GlobalParamsView />}

        {activeBlock !== null && activeBlock !== 'params' && currentBlock && activeSection && (
          sectionHasAccess ? (
            <SlideContainer
              section={activeSection}
              currentPoint={allowedSections.findIndex(s => s.id === activeSection.id) + 1}
              totalPoints={allowedSections.length}
              onNext={handleNextSection}
              onPrev={handlePrevSection}
              sections={allowedSections}
              onSelectSection={(id) => setActiveSectionId(id)}
              showSelect={activeBlock === 'p1' || activeBlock === 'p3'}
            >
              {activeSection.component === 'Punto1' && <Punto1 onNext={handleNextSection} />}
              {activeSection.component === 'Punto2' && <Punto2 onNext={handleNextSection} />}
              {activeSection.component === 'Punto3' && <Punto3 onNext={handleNextSection} />}
              {activeSection.component === 'Punto4' && <Punto4 onNext={handleNextSection} />}
              {activeSection.component === 'Punto5' && <Punto5 />}
              {activeSection.component === 'Punto6' && (
                <Punto6
                  onNext={() => {
                    setActiveBlock('p3');
                    setActiveSectionId('p3_p1');
                  }}
                />
              )}
              {activeSection.component === 'Punto7' && <Punto7 />}
              {activeSection.component === 'Punto8' && <Punto8 />}
              {activeSection.component === 'Punto9' && <Punto9 />}
              {activeSection.component === 'Punto10' && <Punto10 />}
              {activeSection.component === 'Punto11' && <Punto11 />}
            </SlideContainer>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center select-none">
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md space-y-4">
                <div className="p-4 bg-red-500/10 text-red-400 rounded-2xl w-fit mx-auto border border-red-500/20">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Sección Restringida</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tu rol asignado no cuenta con los permisos necesarios para visualizar este apartado técnico del trabajo.
                </p>
                <button
                  onClick={() => setActiveBlock(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
                >
                  Volver al Dashboard
                </button>
              </div>
            </div>
          )
        )}
      </main>

      <Footer onAdminClick={handleAdminClick} />

    </div>
  );
}
