import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Mail,
  ArrowLeft,
  KeyRound,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import footerLogo from '../../images/footer logo.png';

export const AdminLoginView: React.FC = () => {
  const { navigateTo, adminLogin } = useApp();
  const [identifier, setIdentifier] = useState('admin@store.com.bd');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await adminLogin(identifier.trim(), password);
    } catch (err: any) {
      setError(err?.message || 'Invalid administrator credentials. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 font-sans selection:bg-rose-600 selection:text-white">
      {/* Brand Logo */}
      <div className="flex justify-center mb-6">
        <img src={footerLogo} alt="Deshi Commerce" className="h-9 sm:h-10 w-auto object-contain drop-shadow" />
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-2xl">
        <h1 className="text-xl font-bold tracking-tight text-white mb-6 text-center">
          Admin Login
        </h1>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email / Phone
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin@store.com.bd"
                autoComplete="username"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono transition-colors"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                className="w-full pl-9 pr-9 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-rose-950/50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Logging in...' : 'Sign In'}</span>
            </button>
          </div>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-center text-xs">
          <button
            type="button"
            onClick={() => navigateTo('/')}
            className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Storefront</span>
          </button>
        </div>
      </div>
    </div>
  );
};
