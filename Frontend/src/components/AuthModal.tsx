import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Phone,
  Mail,
  User as UserIcon,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  ChevronLeft,
  KeyRound,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isValidBDPhone } from '../data/bangladeshGeo';

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
    showToast,
    t,
  } = useApp();

  const [tab, setTab] = useState<'login' | 'register' | 'otp'>('login');

  // Google Chooser State
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [googleChooserMode, setGoogleChooserMode] = useState<'signin' | 'signup'>('signin');
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [isEnteringCustomGoogle, setIsEnteringCustomGoogle] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Standard inputs
  const [identifier, setIdentifier] = useState('01722222222');
  const [password, setPassword] = useState('123456');

  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Phone OTP Flow State
  const [otpPhone, setOtpPhone] = useState('01722222222');
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('4829');
  const [otpCountdown, setOtpCountdown] = useState(60);

  useEffect(() => {
    if (isAuthModalOpen) {
      setTab(authModalTab || 'login');
      setShowGoogleChooser(false);
      setIsEnteringCustomGoogle(false);
      setErrorMsg('');
      setOtpSent(false);
      setEnteredOtp('');
    }
  }, [isAuthModalOpen, authModalTab]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpSent && otpCountdown > 0) {
      timer = setInterval(() => setOtpCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, otpCountdown]);

  if (!isAuthModalOpen) return null;

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

  const handleSelectDefaultGoogle = async () => {
    try {
      setGoogleLoading(true);
      if (googleChooserMode === 'signup') {
        await registerWithGoogle({
          email: defaultGoogleAccount.email,
          name: defaultGoogleAccount.name,
          avatarUrl: defaultGoogleAccount.avatar,
          googleId: 'gid_retro_class_001',
        });
      } else {
        await loginWithGoogle({
          email: defaultGoogleAccount.email,
          name: defaultGoogleAccount.name,
          avatarUrl: defaultGoogleAccount.avatar,
          googleId: 'gid_retro_class_001',
        });
      }
      setShowGoogleChooser(false);
    } catch {
      setErrorMsg('Could not authenticate with Google Mail.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleCustomGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.includes('@')) {
      setErrorMsg('Please enter a valid Google Mail address.');
      return;
    }
    try {
      setGoogleLoading(true);
      const payload = {
        email: customGoogleEmail.trim().toLowerCase(),
        name: customGoogleName.trim() || customGoogleEmail.split('@')[0],
        googleId: `gid_${Date.now()}`,
      };
      if (googleChooserMode === 'signup') {
        await registerWithGoogle(payload);
      } else {
        await loginWithGoogle(payload);
      }
      setShowGoogleChooser(false);
    } catch {
      setErrorMsg('Failed to authenticate Google Mail account.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await login(identifier);
    } catch {
      setErrorMsg('Invalid login credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!regName.trim() || !regPhone.trim()) {
      setErrorMsg('Please enter your full name and mobile number.');
      return;
    }
    if (!isValidBDPhone(regPhone)) {
      setErrorMsg('Please enter a valid 11-digit Bangladesh phone (e.g. 017XXXXXXXX).');
      return;
    }
    setLoading(true);
    try {
      await register({
        name: regName.trim(),
        phone: regPhone.trim(),
        email: regEmail.trim() || undefined,
      });
    } catch {
      setErrorMsg('Could not register account. Phone number may already exist.');
    } finally {
      setLoading(false);
    }
  };

  // OTP Handlers
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidBDPhone(otpPhone)) {
      setErrorMsg('Please enter a valid 11-digit Bangladesh mobile number.');
      return;
    }
    setErrorMsg('');
    const code = `${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedOtp(code);
    setOtpSent(true);
    setOtpCountdown(60);
    showToast(`Verification code sent to +88${otpPhone}: [ ${code} ]`, 'info');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (enteredOtp.trim() !== generatedOtp) {
      setErrorMsg('Incorrect OTP code. Please check SMS and try again.');
      return;
    }
    setLoading(true);
    try {
      await login(otpPhone);
      showToast('Phone number verified! Welcome to Deshi Commerce.', 'success');
      closeAuthModal();
    } catch {
      setErrorMsg('Authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              {showGoogleChooser
                ? 'Sign In with Google Mail'
                : tab === 'otp'
                ? 'Instant Phone OTP Verification'
                : tab === 'register'
                ? 'Create Customer Account'
                : 'Customer Sign In'}
            </h3>
            <p className="text-xs text-slate-500">
              Deshi Commerce &bull; Nationwide Verified Shopping
            </p>
          </div>
          <button
            type="button"
            onClick={closeAuthModal}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div>
          {/* VIEW A: Google Account Chooser */}
          {showGoogleChooser ? (
            <div className="p-6 space-y-4">
              <button
                type="button"
                onClick={() => setShowGoogleChooser(false)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-semibold cursor-pointer mb-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to sign in options</span>
              </button>

              <div className="text-center pb-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 border border-slate-200">
                  <GoogleGIcon className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Choose a Google Account</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  to continue to <strong className="text-slate-800">Deshi Commerce</strong>
                </p>
              </div>

              {!isEnteringCustomGoogle ? (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleSelectDefaultGoogle}
                    disabled={googleLoading}
                    className="w-full p-3 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all text-left flex items-center gap-3 cursor-pointer group"
                  >
                    <img
                      src={defaultGoogleAccount.avatar}
                      alt={defaultGoogleAccount.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-xs text-slate-900 block truncate group-hover:text-blue-600">
                        {defaultGoogleAccount.name}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono block truncate">
                        {defaultGoogleAccount.email}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEnteringCustomGoogle(true)}
                    className="w-full py-2.5 px-3 border border-dashed border-slate-300 hover:border-slate-500 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span>Use another Google Mail account</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCustomGoogleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      placeholder="e.g. Tanvir Hasan"
                      required
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Google Mail Address
                    </label>
                    <input
                      type="email"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      required
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEnteringCustomGoogle(false)}
                      className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={googleLoading}
                      className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Continue with Google</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* VIEW B: Standard Tabs (Sign In / Register / OTP) */
            <div>
              {/* Tab Switcher */}
              <div className="flex border-b border-slate-200 text-xs font-bold bg-slate-50">
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    setAuthModalTab('login');
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer uppercase tracking-wider ${
                    tab === 'login'
                      ? 'border-[#0F172A] text-[#0F172A] bg-white font-extrabold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
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
                  className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer uppercase tracking-wider ${
                    tab === 'register'
                      ? 'border-[#0F172A] text-[#0F172A] bg-white font-extrabold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab('otp');
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer uppercase tracking-wider ${
                    tab === 'otp'
                      ? 'border-[#0F172A] text-[#0F172A] bg-white font-extrabold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Phone OTP
                </button>
              </div>

              {errorMsg && (
                <div className="m-4 mb-0 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="p-6 space-y-4">
                {/* 1-Click Google Mail */}
                {tab !== 'otp' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleOpenGoogle(tab === 'register' ? 'signup' : 'signin')}
                      className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs uppercase tracking-wider rounded-lg shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-2.5"
                    >
                      <GoogleGIcon className="w-4 h-4 shrink-0" />
                      <span>{tab === 'register' ? 'Sign up with Google Mail' : 'Sign in with Google Mail'}</span>
                    </button>

                    <div className="relative flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                      </div>
                      <span className="relative bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Or with Credentials
                      </span>
                    </div>
                  </>
                )}

                {/* TAB 1: Password Sign In */}
                {tab === 'login' && (
                  <form onSubmit={handleLoginSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Mobile Number or Email
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="e.g. 017XXXXXXXX or user@example.com"
                          required
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          required
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-2 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                      {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                  </form>
                )}

                {/* TAB 2: Register Form */}
                {tab === 'register' && (
                  <form onSubmit={handleRegisterSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="e.g. Tanvir Hasan"
                          required
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                        <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Mobile Phone Number *
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="017XXXXXXXX"
                          required
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                        />
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Email Address (Optional)
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Create Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={regPass}
                          onChange={(e) => setRegPass(e.target.value)}
                          placeholder="Min 6 characters"
                          required
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-2 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                      {loading ? 'Creating Account...' : 'Register Account'}
                    </button>
                  </form>
                )}

                {/* TAB 3: Phone OTP Verification Flow */}
                {tab === 'otp' && (
                  <div className="space-y-4">
                    {!otpSent ? (
                      <form onSubmit={handleSendOtp} className="space-y-3">
                        <p className="text-xs text-slate-600">
                          We will send a 4-digit verification code via SMS to your mobile phone.
                        </p>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Mobile Phone Number *
                          </label>
                          <div className="relative">
                            <input
                              type="tel"
                              value={otpPhone}
                              onChange={(e) => setOtpPhone(e.target.value)}
                              placeholder="01XXXXXXXXX"
                              required
                              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono font-bold"
                            />
                            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>Send Verification Code</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifyOtp} className="space-y-3">
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                          <span className="text-slate-500 block">Code sent to:</span>
                          <span className="font-mono font-bold text-slate-900 block text-sm">
                            +88 {otpPhone}
                          </span>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>Enter 4-Digit Code *</span>
                            <span className="text-[10px] text-slate-400">
                              Demo Code: <strong className="font-mono text-slate-900">{generatedOtp}</strong>
                            </span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              maxLength={4}
                              value={enteredOtp}
                              onChange={(e) => setEnteredOtp(e.target.value)}
                              placeholder="&bull; &bull; &bull; &bull;"
                              required
                              className="w-full pl-9 pr-3 py-2 text-center text-lg font-mono font-bold tracking-widest border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                            />
                            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading || enteredOtp.length < 4}
                          className="w-full py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>{loading ? 'Verifying...' : 'Verify & Enter Store'}</span>
                        </button>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <button
                            type="button"
                            onClick={() => setOtpSent(false)}
                            className="text-slate-500 hover:underline"
                          >
                            Change Phone Number
                          </button>

                          <button
                            type="button"
                            disabled={otpCountdown > 0}
                            onClick={handleSendOtp}
                            className="text-blue-600 hover:underline font-semibold disabled:text-slate-400 disabled:no-underline"
                          >
                            {otpCountdown > 0 ? `Resend code in ${otpCountdown}s` : 'Resend Code'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
