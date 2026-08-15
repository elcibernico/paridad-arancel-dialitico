import React from 'react';
import config from '../config.json';
import { useAuth } from '../context/AuthContext';

export default function Footer({ onAdminClick }) {
  const { user } = useAuth();
  const isAdmin = user && (user.email === 'ndemartis@fcecon.unr.edu.ar' || user.email === 'elcibernico@gmail.com');

  return (
    <footer className="border-t py-8 mt-auto transition-colors duration-200 bg-slate-950 border-slate-800 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Información y Copyright */}
        <div className="text-center md:text-left">
          <p className="text-xs font-medium">{config.footer.disclaimer}</p>
          <p className="text-xs opacity-75 mt-1">{config.footer.copyright}</p>
        </div>

        {/* Contacto & Acceso Admin Discreto */}
        <div className="flex items-center space-x-6">
          <a
            href={config.footer.contactWhatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:opacity-80 transition"
          >
            <span>Prof. CP Pablo Nicolás Demartis</span>
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-0.999 3.648 3.742-.981z"/>
            </svg>
          </a>

          {/* Enlace discreto de Admin Pi solo para administradores */}
          {isAdmin && (
            <button
              onClick={onAdminClick}
              className="hover:text-teal-500 font-serif text-base transition px-2 py-1 rounded cursor-pointer"
              title="Panel de Control"
            >
              π
            </button>
          )}
        </div>

      </div>
    </footer>
  );
}
