import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Lock, Mail, ArrowLeft, KeyRound, AlertCircle } from 'lucide-react';
import footerLogo from '../../images/footer logo.png';

export const AdminLoginView: React.FC = () => {
  const { navigateTo, showToast, adminLogin } = useApp();
  const [identifier, setIdentifier] = useState('admin@store.com.bd');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Authenticate with live Spring Boot backend
      await adminLogin(identifier, password);
    } catch (err: any) {
      setError(err?.message || 'Invalid admin credentials. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 font-sans">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <img src={footerLogo} alt="Deshi Commerce" className="h-9 sm:h-10 w-auto object-contain" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">
          Admin Portal
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Sign in with administrator credentials to manage orders, products, and analytics.
        </p>
      </div>

      {/* Simple Standard Auth Card */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg p-6 sm:p-8">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800 mb-6">
          <Lock className="w-4 h-4 text-slate-400" />
          <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Administrator Sign In
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-rose-950/80 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Admin Email / Identifier
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin@store.com.bd"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded text-white placeholder-slate-500 focus:outline-none focus:border-slate-600 font-mono"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
              />
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Verifying Credentials...' : 'Sign In'}</span>
            </button>
          </div>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => navigateTo('/')}
            className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Storefront</span>
          </button>

          <span className="text-[10px] text-slate-500 font-mono">
            IP Audited &bull; HTTPS
          </span>
        </div>
      </div>
    </div>
  );
};
