import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Loader2, CheckCircle2 } from 'lucide-react';

export default function LoginView() {
  const { loginWithProvider, loginWithMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleOAuthLogin = async (provider) => {
    try {
      setLoading(true);
      setErrorMsg('');
      await loginWithProvider(provider);
    } catch (err) {
      console.error(err);
      setErrorMsg(`Error al iniciar sesión con ${provider}: ${err.message || err}`);
      setLoading(false);
    }
  };

  const handleMagicLinkSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      setErrorMsg('');
      await loginWithMagicLink(email);
      setMagicLinkSent(true);
    } catch (err) {
      console.error(err);
      setErrorMsg(`Error al enviar el enlace de acceso: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 font-sans relative overflow-hidden select-none px-4 py-12">
      
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full p-8 sm:p-10 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-2xl relative z-10 flex flex-col items-center">
        
        {/* Header Title requested by user */}
        <div className="text-center mb-8">
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide leading-tight uppercase max-w-xl">
            PARIDAD TÉCNICA DEL ARANCEL DIALÍTICO
            <span className="block my-1 text-slate-400 font-semibold text-sm">Y</span>
            ESTABILIZACIÓN ECONOMÉTRICA DE COSTOS
            <span className="block my-1 text-slate-400 font-semibold text-sm">EN</span>
            CONTEXTOS MACROECONÓMICOS VARIABLES
          </h1>
          <div className="w-12 h-1 bg-gradient-to-r from-teal-500 to-purple-500 mx-auto mt-4 rounded-full" />
        </div>

        {/* Subtitle */}
        <h2 className="text-lg font-bold text-slate-350 tracking-wide mb-1">
          Iniciar Sesión
        </h2>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-6">
          Ecosistema Digital de Análisis Técnico
        </p>

        {errorMsg && (
          <div className="w-full mb-6 p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-xs text-red-400 text-center font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Providers section */}
        <div className="w-full flex flex-col items-center mb-8">
          <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-4">
            PROVEEDORES DE ACCESO ACTIVOS
          </span>
          <div className="flex gap-4">
            {/* Google Button */}
            <button
              onClick={() => handleOAuthLogin('google')}
              disabled={loading}
              className="w-12 h-12 rounded-full bg-slate-950 hover:bg-slate-900 border border-slate-800 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md"
              title="Iniciar sesión con Google"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.59 5.59 0 0 1 8.4 12.925a5.59 5.59 0 0 1 5.591-5.59c1.508 0 2.883.548 3.943 1.455l3.12-3.12C19.167 3.916 16.793 3 13.99 3 8.472 3 4 7.472 4 12.99c0 5.519 4.472 9.99 9.99 9.99 6.22 0 10.024-4.385 10.024-10.198 0-.616-.065-1.077-.145-1.5H12.24Z"
                />
              </svg>
            </button>

            {/* Microsoft Button */}
            <button
              onClick={() => handleOAuthLogin('microsoft')}
              disabled={loading}
              className="w-12 h-12 rounded-full bg-slate-950 hover:bg-slate-900 border border-slate-800 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md"
              title="Iniciar sesión con Microsoft"
            >
              <svg className="w-5 h-5" viewBox="0 0 23 23">
                <path fill="#f35325" d="M0 0h11v11H0z" />
                <path fill="#81bc06" d="M12 0h11v11H12z" />
                <path fill="#05a6f0" d="M0 12h11v11H0z" />
                <path fill="#ffba08" d="M12 12h11v11H12z" />
              </svg>
            </button>

            {/* Yahoo Button */}
            <button
              onClick={() => handleOAuthLogin('yahoo')}
              disabled={loading}
              className="w-12 h-12 rounded-full bg-slate-950 hover:bg-slate-900 border border-slate-800 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md"
              title="Iniciar sesión con Yahoo"
            >
              {/* Purple Y Icon */}
              <span className="text-xl font-black text-purple-500 font-serif">Y</span>
            </button>
          </div>
        </div>

        {/* Magic link Section */}
        <div className="w-full max-w-lg p-6 bg-slate-950/80 border border-slate-850 rounded-2xl">
          <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block mb-4 text-center">
            ACCESO POR ENLACE DIRECTO (MAGIC LINK)
          </span>

          {magicLinkSent ? (
            <div className="flex flex-col items-center text-center p-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-3" />
              <h3 className="text-sm font-bold text-white mb-1">¡Enlace de acceso enviado!</h3>
              <p className="text-xs text-slate-400">
                Revisa la bandeja de entrada de <strong>{email}</strong> para completar el acceso instantáneo.
              </p>
              <button
                onClick={() => setMagicLinkSent(false)}
                className="mt-4 text-[10px] uppercase font-bold text-teal-400 hover:underline"
              >
                Volver a intentar
              </button>
            </div>
          ) : (
            <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="tu-correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full text-xs font-semibold py-3 pl-10 pr-4 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 disabled:opacity-50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="px-5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:bg-slate-800 text-white text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-lg active:scale-95 disabled:scale-100 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Recibir Enlace</span>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal text-center">
                Ingresa cualquier dirección de correo electrónico autorizada para recibir un enlace de acceso instantáneo en tu bandeja de entrada.
              </p>
            </form>
          )}
        </div>

        {/* Security badge info */}
        <div className="w-full flex items-start gap-2.5 p-3.5 bg-slate-900/40 border border-slate-850 rounded-2xl mt-6 text-left text-[11px] text-slate-400 leading-normal">
          <ShieldCheck className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-slate-350 font-bold block mb-0.5">Control de Roles y Permisos (RBAC)</span>
            El sistema requiere autenticación. Al ingresar, tus privilegios se mapearán según los registros activos.
          </div>
        </div>

        {/* Footer info */}
        <div className="text-[9px] text-slate-650 mt-8 leading-tight text-center">
          Facultad de Ciencias Económicas y Estadística • UNR<br />
          Todos los derechos reservados.
        </div>

      </div>
    </div>
  );
}
