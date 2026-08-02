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
import Punto12 from './components/points/Punto12';
import Punto13 from './components/points/Punto13';
import Punto14 from './components/points/Punto14';
import config from './config.json';

export default function App() {
  const [currentPoint, setCurrentPoint] = useState(1);

  // Asegurar que el documento esté SIEMPRE en Modo Oscuro (.dark)
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  }, []);

  const totalPoints = config.sections.length;
  const currentSection = config.sections.find(s => s.id === currentPoint) || config.sections[0];

  const handleNext = () => {
    if (currentPoint < totalPoints) setCurrentPoint(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentPoint > 1) setCurrentPoint(prev => prev - 1);
  };

  const handleAdminClick = () => {
    alert("Acceso al Panel de Administración (En construcción para configuración RBAC / Whitelist).");
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 bg-slate-950 text-slate-100 font-sans antialiased selection:bg-teal-500 selection:text-white">
      
      {/* Header Sticky */}
      <Header
        currentPoint={currentPoint}
        setCurrentPoint={setCurrentPoint}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        <SlideContainer
          section={currentSection}
          currentPoint={currentPoint}
          totalPoints={totalPoints}
          onNext={handleNext}
          onPrev={handlePrev}
        >
          {/* Renderizado condicional del Punto actual */}
          {currentPoint === 1 && <Punto1 />}
          {currentPoint === 2 && <Punto2 />}
          {currentPoint === 3 && <Punto3 />}
          {currentPoint === 4 && <Punto4 />}
          {currentPoint === 5 && <Punto5 />}
          {currentPoint === 6 && <Punto6 onNext={handleNext} />}
          {currentPoint === 7 && <Punto7 />}
          {currentPoint === 8 && <Punto8 />}
          {currentPoint === 9 && <Punto9 />}
          {currentPoint === 10 && <Punto10 />}
          {currentPoint === 11 && <Punto11 />}
          {currentPoint === 12 && <Punto12 />}
          {currentPoint === 13 && <Punto13 />}
          {currentPoint === 14 && <Punto14 />}
          {currentPoint > 14 && (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-2xl">
                {currentPoint}
              </div>
              <h3 className="text-xl font-bold">{currentSection.title}</h3>
              <p className="text-sm text-slate-400 max-w-md">
                El contenido académico y simulador para este punto está preparado en la directiva para su integración completa.
              </p>
            </div>
          )}
        </SlideContainer>
      </main>

      {/* Footer Unificado */}
      <Footer onAdminClick={handleAdminClick} />

    </div>
  );
}
