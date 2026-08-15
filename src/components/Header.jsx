import React from 'react';
import config from '../config.json';
import { LayoutGrid, LogOut, Eye, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ activeBlock, setActiveBlock, onBackToDashboard }) {
  const { logout, profile, simulatedRole, setSimulatedRole, isRealAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md transition-colors duration-200 border-b bg-slate-900/90 border-slate-800 text-white flex flex-col">
      
      {/* BANNER DE ADVERTENCIA DE SIMULACIÓN DE ROL */}
      {simulatedRole && isRealAdmin && (
        <div className="bg-amber-500/90 border-b border-amber-600 text-slate-950 font-black text-xs px-4 py-1.5 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 animate-pulse" />
            <span>
              ESTÁS SIMULANDO LA VISTA DEL ROL: <strong className="uppercase underline">{simulatedRole}</strong>
            </span>
          </div>
          <button
            onClick={() => setSimulatedRole(null)}
            className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-950 text-amber-400 text-[10px] font-extrabold hover:bg-slate-900 transition"
          >
            <X className="w-3 h-3" />
            <span>Desactivar Simulación</span>
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Título */}
          <div className="flex items-center space-x-4 cursor-pointer font-sans" onClick={onBackToDashboard}>
            <img 
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR90xrn_DgGf9focCKboZ0XWKWfhWbQWaF9KukCaqDKSr10yk-AiPHk-S4&s=10" 
              className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-teal-500/20" 
              alt="Logo" 
            />
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-teal-400">
                {config.header.author}
              </div>
              <h1 className="text-base font-black leading-tight text-white uppercase tracking-tight">
                {config.header.title}
              </h1>
              <div className="text-[10px] hidden sm:block text-slate-500 font-semibold">
                {config.header.subtitle}
              </div>
            </div>
          </div>

          {/* Navegador de Puntos y Controles */}
          <div className="flex items-center space-x-4">
            
            {activeBlock && activeBlock !== 'admin' && (
              <button
                onClick={onBackToDashboard}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:text-white transition text-xs font-bold"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
            )}

            {profile && (
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${simulatedRole ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-800 text-slate-400 border-slate-750'}`}>
                  {simulatedRole ? `MODO: ${simulatedRole.toUpperCase()}` : profile.role}
                </span>
                <button
                  onClick={logout}
                  title="Cerrar Sesión"
                  className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
