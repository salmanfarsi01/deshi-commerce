import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/apiClient';
import { ShieldCheck, Lock, Mail, ArrowLeft, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import mainLogo from '../../images/main_logo.png';

export const AdminLoginView: React.FC = () => {
  const { navigateTo, showToast, switchUserRole } = useApp();
  const [identifier, setIdentifier] = useState('admin@store.com.bd');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Authenticate with admin credentials
      await switchUserRole('ADMIN');
      showToast('Admin access granted. Welcome to Executive Portal.', 'success');
    } catch (err) {
      setError('Invalid admin credentials. Access denied.');
      showToast('Admin authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 font-sans">
      {/* Top Brand Tag */}
      <div className="text-center mb-8">
        <div className="inline-block bg-white px-4 py-2 rounded-xl mb-4 shadow-lg">
          <img src={mainLogo} alt="Deshi Commerce" className="h-8 sm:h-9 w-auto object-contain" />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400 mb-3 block w-fit mx-auto">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          <span>Restricted Access &bull; Administrative Route (/admin)</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
          Administrative Portal
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Please enter verified system administrator credentials to access inventory, orders, and sales analytics.
        </p>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-md">
        <div className="flex items-center gap-3 pb-5 border-b border-slate-800 mb-6">
          <div className="w-10 h-10 rounded-xl bg-rose-600/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Administrator Sign In
            </h2>
            <p className="text-[11px] text-slate-400">
              Spring Boot JWT &bull; 256-Bit Cryptographic Vault
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Admin Email / Identifier
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin@store.com.bd"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-rose-900/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Verifying Credentials...' : 'Authenticate & Enter Dashboard'}</span>
            </button>
          </div>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => navigateTo('/')}
            className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Storefront</span>
          </button>

          <span className="text-[10px] text-slate-400 font-mono">
            IP Audited &bull; HTTPS
          </span>
        </div>
      </div>
    </div>
  );
};
