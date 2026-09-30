import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Phone,
  Mail,
  User as UserIcon,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isValidBDPhone } from '../data/bangladeshGeo';

// Official multi-color Google 'G' Logo SVG
const GoogleGIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    setAuthModalTab,
    login,
    register,
    loginWithGoogle,
    registerWithGoogle,
    switchUserRole,
  } = useApp();

  // Internal tab state synced with AppContext
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Google Account Chooser State
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [googleChooserMode, setGoogleChooserMode] = useState<'signin' | 'signup'>('signin');
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [isEnteringCustomGoogle, setIsEnteringCustomGoogle] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Standard form inputs
  const [identifier, setIdentifier] = useState('01722222222');
  const [password, setPassword] = useState('123456');

  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync tab with AppContext prop when modal opens
  useEffect(() => {
    if (isAuthModalOpen) {
      setTab(authModalTab || 'login');
      setShowGoogleChooser(false);
      setIsEnteringCustomGoogle(false);
      setErrorMsg('');
    }
  }, [isAuthModalOpen, authModalTab]);

  if (!isAuthModalOpen) return null;

  // Active detected Google Account (e.g. from local environment / session)
  const defaultGoogleAccount = {
    email: 'retro.class90@gmail.com',
    name: 'Retro Class',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RetroClass&backgroundColor=ffd5dc',
  };

  const handleOpenGoogle = (mode: 'signin' | 'signup') => {
    setGoogleChooserMode(mode);
    setShowGoogleChooser(true);
    setIsEnteringCustomGoogle(false);
    setErrorMsg('');
  };

  const handleSelectGoogleAccount = async (account: { email: string; name: string; avatarUrl?: string }) => {
    setGoogleLoading(true);
    setErrorMsg('');
    try {
      if (googleChooserMode === 'signup') {
        await registerWithGoogle({
          email: account.email,
          name: account.name,
          avatarUrl: account.avatarUrl,
        });
      } else {
        await loginWithGoogle({
          email: account.email,
          name: account.name,
          avatarUrl: account.avatarUrl,
        });
      }
      setShowGoogleChooser(false);
    } catch {
      setErrorMsg('Failed to authenticate with Google Mail. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleCustomGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.trim()) {
      setErrorMsg('Please enter a Google Mail address.');
      return;
    }
    const email = customGoogleEmail.trim().toLowerCase();
    const finalEmail = email.includes('@') ? email : `${email}@gmail.com`;

    if (!finalEmail.endsWith('@gmail.com') && !finalEmail.endsWith('@googlemail.com')) {
      setErrorMsg('Please provide a valid @gmail.com or @googlemail.com address.');
      return;
    }

    const name = customGoogleName.trim() || finalEmail.split('@')[0];
    await handleSelectGoogleAccount({
      email: finalEmail,
      name,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!identifier.trim()) {
      setErrorMsg('Please enter your phone number or Google Mail.');
      return;
    }
    setLoading(true);
    try {
      await login(identifier);
    } catch {
      setErrorMsg('Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!regName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!isValidBDPhone(regPhone)) {
      setErrorMsg('Please enter a valid 11-digit Bangladeshi mobile (e.g. 017XXXXXXXX).');
      return;
    }
    setLoading(true);
    try {
      await register({
        name: regName,
        phone: regPhone,
        email: regEmail,
      });
    } catch {
      setErrorMsg('Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSwitch = async (role: 'CUSTOMER' | 'ADMIN') => {
    setLoading(true);
    try {
      await switchUserRole(role);
      closeAuthModal();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={closeAuthModal}
        className="fixed inset-0 bg-stone-950/65 backdrop-blur-xs transition-opacity"
      />

      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white shadow-2xl border border-[#D4D4D4] overflow-hidden animate-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-6 bg-[#2B2B2B] text-white relative border-b border-[#3D3D3D]">
            <button
              type="button"
              onClick={closeAuthModal}
              className="rounded-none absolute top-4 right-4 p-1.5 text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-xl font-bold uppercase tracking-tight text-white font-serif">
              Deshi commerce
            </div>
            <p className="text-xs text-[#D4D4D4] mt-1">
              Shop nationwide with verified doorstep delivery and escrow protection.
            </p>
          </div>

          {/* VIEW A: Google Account Chooser Dialog */}
          {showGoogleChooser ? (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#D4D4D4]">
                <button
                  type="button"
                  onClick={() => {
                    setShowGoogleChooser(false);
                    setIsEnteringCustomGoogle(false);
                  }}
                  className="rounded-none flex items-center gap-1 text-xs text-stone-600 hover:text-[#2B2B2B] font-bold uppercase cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#2B2B2B]">
                  <GoogleGIcon className="w-4 h-4" />
                  <span>Google Identity</span>
                </div>
              </div>

              <div>
                <h4 className="text-base font-bold text-[#2B2B2B] font-serif uppercase">
                  {googleChooserMode === 'signup' ? 'Sign up with Google Mail' : 'Sign in with Google Mail'}
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Choose a Google Mail account to continue to <strong>Deshi commerce</strong>.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {googleLoading ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-10 h-10 border-4 border-[#2B2B2B] border-t-[#E11D48] animate-spin mx-auto" />
                  <div className="text-xs font-bold uppercase tracking-wider text-[#2B2B2B]">
                    Connecting with Google Mail...
                  </div>
                  <div className="text-[11px] text-stone-500">Exchanging secure OAuth token credentials</div>
                </div>
              ) : !isEnteringCustomGoogle ? (
                <div className="space-y-3">
                  {/* Primary detected Google Account */}
                  <button
                    type="button"
                    onClick={() => handleSelectGoogleAccount(defaultGoogleAccount)}
                    className="rounded-none w-full p-3.5 border-2 border-[#D4D4D4] hover:border-[#2B2B2B] hover:bg-[#F8F9FA] transition-all text-left flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={defaultGoogleAccount.avatar}
                        alt={defaultGoogleAccount.name}
                        className="w-10 h-10 rounded-full border border-stone-300 bg-white"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#2B2B2B] flex items-center gap-1.5">
                          <span>{defaultGoogleAccount.name}</span>
                          <span className="text-[10px] font-bold text-white bg-blue-600 px-1.5 py-0.2 uppercase">
                            Google Mail
                          </span>
                        </div>
                        <div className="text-xs text-stone-500 font-mono mt-0.5">
                          {defaultGoogleAccount.email}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#2B2B2B] group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* Use another Google Mail account */}
                  <button
                    type="button"
                    onClick={() => setIsEnteringCustomGoogle(true)}
                    className="rounded-none w-full py-2.5 px-3 border border-dashed border-[#D4D4D4] hover:border-[#2B2B2B] text-xs font-bold text-stone-700 hover:text-[#2B2B2B] hover:bg-[#F8F9FA] transition-colors flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                  >
                    <Mail className="w-4 h-4 text-stone-500" />
                    <span>Use another Google Mail account</span>
                  </button>
                </div>
              ) : (
                /* Enter custom Google Mail */
                <form onSubmit={handleCustomGoogleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      placeholder="e.g. Tanvir Hasan"
                      required
                      className="rounded-none w-full px-3 py-2 text-xs bg-[#F8F9FA] border border-[#D4D4D4] focus:outline-none focus:border-[#2B2B2B] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Google Mail Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={customGoogleEmail}
                        onChange={(e) => setCustomGoogleEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        required
                        className="rounded-none w-full pl-9 pr-3 py-2 text-xs bg-[#F8F9FA] border border-[#D4D4D4] focus:outline-none focus:border-[#2B2B2B] focus:bg-white font-mono"
                      />
                      <GoogleGIcon className="w-4 h-4 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEnteringCustomGoogle(false)}
                      className="rounded-none px-4 py-2.5 border border-[#D4D4D4] text-xs font-bold text-stone-600 hover:text-[#2B2B2B] cursor-pointer uppercase"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-none flex-1 py-2.5 bg-[#2B2B2B] hover:bg-[#E11D48] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Continue with Google Mail</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              )}

              <div className="pt-3 border-t border-[#D4D4D4] flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Protected by Google Identity Services &amp; 256-Bit Escrow</span>
              </div>
            </div>
          ) : (
            /* VIEW B: Standard Tabs (Sign In / Create Account) with Google CTA */
            <div>
              {/* Tabs */}
              <div className="flex border-b border-[#D4D4D4] text-sm font-bold bg-[#F8F9FA]">
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    setAuthModalTab('login');
                    setErrorMsg('');
                  }}
                  className={`rounded-none flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer uppercase tracking-wider text-xs ${
                    tab === 'login'
                      ? 'border-[#E11D48] text-[#E11D48] bg-white font-bold'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab('register');
                    setAuthModalTab('register');
                    setErrorMsg('');
                  }}
                  className={`rounded-none flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer uppercase tracking-wider text-xs ${
                    tab === 'register'
                      ? 'border-[#E11D48] text-[#E11D48] bg-white font-bold'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Sign Up (Create Account)
                </button>
              </div>

              {/* Error notice */}
              {errorMsg && (
                <div className="m-5 mb-0 p-3 bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="p-6 space-y-4">
                {/* HIGH-VISIBILITY GOOGLE MAIL AUTH BUTTON (Sign in with Google Mail / Sign up with Google Mail) */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleOpenGoogle(tab === 'register' ? 'signup' : 'signin')}
                    className="rounded-none w-full py-3 px-4 bg-white hover:bg-stone-50 text-[#2B2B2B] border-2 border-[#2B2B2B] hover:border-[#E11D48] font-bold text-xs uppercase tracking-wider shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2.5 group"
                  >
                    <GoogleGIcon className="w-4 h-4 shrink-0" />
                    <span className="group-hover:text-[#E11D48] transition-colors">
                      {tab === 'register' ? 'Sign up with Google Mail' : 'Sign in with Google Mail'}
                    </span>
                  </button>

                  <div className="text-center text-[10px] text-stone-500 flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Instant 1-click verification · No password needed</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#D4D4D4]"></div>
                  </div>
                  <span className="relative bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Or with Phone / Password
                  </span>
                </div>

                {/* TAB 1: Sign In Form */}
                {tab === 'login' ? (
                  <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Google Mail, Email or Mobile Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="e.g. 017XXXXXXXX or name@gmail.com"
                          required
                          className="rounded-none w-full pl-9 pr-3 py-2.5 text-xs bg-[#F8F9FA] border border-[#D4D4D4] focus:outline-none focus:border-[#2B2B2B] focus:bg-white"
                        />
                        <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Password</label>
                      </div>
                      <div className="relative">
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          required
                          className="rounded-none w-full pl-9 pr-3 py-2.5 text-xs bg-[#F8F9FA] border border-[#D4D4D4] focus:outline-none focus:border-[#2B2B2B] focus:bg-white"
                        />
                        <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-none w-full py-3 bg-[#2B2B2B] hover:bg-[#E11D48] text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      {loading ? 'Authenticating...' : 'Sign In to Account'}
                    </button>
                  </form>
                ) : (
                  /* TAB 2: Sign Up / Create Account Form */
                  <form onSubmit={handleRegisterSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="e.g. Karim Ahmed"
                          required
                          className="rounded-none w-full pl-9 pr-3 py-2 text-xs bg-[#F8F9FA] border border-[#D4D4D4] focus:outline-none focus:border-[#2B2B2B] focus:bg-white"
                        />
                        <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Bangladeshi Mobile Number (11 Digits)
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="017XXXXXXXX"
                          required
                          className="rounded-none w-full pl-9 pr-3 py-2 text-xs bg-[#F8F9FA] border border-[#D4D4D4] focus:outline-none focus:border-[#2B2B2B] focus:bg-white font-mono"
                        />
                        <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Google Mail or Email (Optional)
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="name@gmail.com"
                          className="rounded-none w-full pl-9 pr-3 py-2 text-xs bg-[#F8F9FA] border border-[#D4D4D4] focus:outline-none focus:border-[#2B2B2B] focus:bg-white font-mono"
                        />
                        <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      </div>
                      {regEmail.toLowerCase().includes('@gmail.com') && (
                        <div className="text-[10px] text-blue-600 mt-0.5 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Google Mail address linked</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Create Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={regPass}
                          onChange={(e) => setRegPass(e.target.value)}
                          placeholder="Min 6 characters"
                          required
                          className="rounded-none w-full pl-9 pr-3 py-2 text-xs bg-[#F8F9FA] border border-[#D4D4D4] focus:outline-none focus:border-[#2B2B2B] focus:bg-white"
                        />
                        <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-none w-full mt-2 py-3 bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      {loading ? 'Creating Account...' : 'Register Account'}
                    </button>
                  </form>
                )}

                {/* 1-Click Fast Sandbox Demo Buttons */}
                <div className="pt-2 border-t border-[#D4D4D4]">
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2 text-center">
                    ⚡ Fast 1-Click Demo Profiles:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleDemoSwitch('CUSTOMER')}
                      className="rounded-none p-2 bg-[#F8F9FA] hover:bg-stone-200 border border-[#D4D4D4] text-[#2B2B2B] font-bold text-[11px] uppercase tracking-wider cursor-pointer text-center"
                    >
                      Customer (Karim)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDemoSwitch('ADMIN')}
                      className="rounded-none p-2 bg-[#F8F9FA] hover:bg-stone-200 border border-[#D4D4D4] text-[#2B2B2B] font-bold text-[11px] uppercase tracking-wider cursor-pointer text-center"
                    >
                      Admin (Tahmid)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
