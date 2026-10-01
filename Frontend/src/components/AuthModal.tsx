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
  RotateCcw,
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
    sendRegistrationOtp,
    register,
    loginWithGoogle,
    registerWithGoogle,
    showToast,
    t,
  } = useApp();

  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Google Chooser State
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [googleChooserMode, setGoogleChooserMode] = useState<'signin' | 'signup'>('signin');
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [isEnteringCustomGoogle, setIsEnteringCustomGoogle] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Sign In inputs
  const [identifier, setIdentifier] = useState('01722222222');
  const [password, setPassword] = useState('123456');

  // Registration inputs & step state
  const [regStep, setRegStep] = useState<1 | 2>(1); // 1 = Details, 2 = Inline OTP Verification
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regOtp, setRegOtp] = useState('');
  const [demoOtpHint, setDemoOtpHint] = useState('123456');
  const [otpCountdown, setOtpCountdown] = useState(60);

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthModalOpen) {
      setTab(authModalTab || 'login');
      setShowGoogleChooser(false);
      setIsEnteringCustomGoogle(false);
      setErrorMsg('');
      setRegStep(1);
      setRegOtp('');
    }
  }, [isAuthModalOpen, authModalTab]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (regStep === 2 && otpCountdown > 0) {
      timer = setInterval(() => setOtpCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [regStep, otpCountdown]);

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
      setErrorMsg('Invalid login credentials. Please check your phone/email and password.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1 of Account Creation: Submit details and trigger OTP dispatch
  const handleInitiateRegistration = async (e: React.FormEvent) => {
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
    if (regPass.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await sendRegistrationOtp(regPhone.trim(), regName.trim());
      if (res.demoOtp) {
        setDemoOtpHint(res.demoOtp);
      }
      setRegStep(2);
      setOtpCountdown(60);
      showToast(`Verification code sent to +88${regPhone}`, 'info');
    } catch (err: any) {
      setErrorMsg(err.message || 'Mobile number is already registered. Please sign in instead.');
    } finally {
      setLoading(false);
    }
  };

  // Resend Registration OTP
  const handleResendOtp = async () => {
    if (otpCountdown > 0) return;
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await sendRegistrationOtp(regPhone.trim(), regName.trim());
      if (res.demoOtp) {
        setDemoOtpHint(res.demoOtp);
      }
      setOtpCountdown(60);
      showToast(`Fresh verification code sent to +88${regPhone}`, 'info');
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 of Account Creation: Verify OTP & complete account creation
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!regOtp.trim() || regOtp.trim().length < 4) {
      setErrorMsg('Please enter the 6-digit verification code sent to your phone.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: regName.trim(),
        phone: regPhone.trim(),
        email: regEmail.trim() || undefined,
        password: regPass,
        otp: regOtp.trim(),
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 my-8">
        {/* Modal Top Header */}
        <div className="bg-[#0F172A] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Deshi Commerce</h2>
              <p className="text-[11px] text-slate-400">Authentic Retail &bull; Verified Security</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeAuthModal}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          {/* VIEW A: Google Account Chooser */}
          {showGoogleChooser ? (
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-slate-700 pb-2 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGoogleChooser(false)}
                  className="text-slate-500 hover:text-slate-800 p-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold uppercase tracking-wider">
                  {googleChooserMode === 'signup' ? 'Create account with Google' : 'Sign in with Google'}
                </span>
              </div>

              {!isEnteringCustomGoogle ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600">Choose an account to continue to Deshi Commerce</p>

                  <button
                    type="button"
                    onClick={handleSelectDefaultGoogle}
                    disabled={googleLoading}
                    className="w-full p-3 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-3 text-left"
                  >
                    <img
                      src={defaultGoogleAccount.avatar}
                      alt={defaultGoogleAccount.name}
                      className="w-10 h-10 rounded-full border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-slate-900 truncate">
                        {defaultGoogleAccount.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate font-mono">
                        {defaultGoogleAccount.email}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsEnteringCustomGoogle(true);
                      setErrorMsg('');
                    }}
                    className="w-full p-3 rounded-xl border border-dashed border-slate-300 hover:border-slate-500 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <GoogleGIcon className="w-4 h-4" />
                    <span>Use another Google account</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCustomGoogleSubmit} className="space-y-3">
                  <p className="text-xs text-slate-600">Enter your Google email address</p>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      placeholder="e.g. Tanvir Hasan"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Google Mail Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      placeholder="username@gmail.com"
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
            /* VIEW B: Standard Tabs (Sign In / Create Account with Inline OTP) */
            <div>
              {/* Tab Switcher */}
              <div className="flex border-b border-slate-200 text-xs font-bold bg-slate-50">
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    setAuthModalTab('login');
                    setErrorMsg('');
                    setRegStep(1);
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
                    setRegStep(1);
                  }}
                  className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer uppercase tracking-wider ${
                    tab === 'register'
                      ? 'border-[#0F172A] text-[#0F172A] bg-white font-extrabold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Create Account
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
                {!(tab === 'register' && regStep === 2) && (
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
                        Or with Mobile Number
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

                {/* TAB 2: Register Flow with Integrated OTP Verification */}
                {tab === 'register' && (
                  <div>
                    {/* Step 1: User fills in account credentials */}
                    {regStep === 1 ? (
                      <form onSubmit={handleInitiateRegistration} className="space-y-3">
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
                              placeholder="01XXXXXXXXX"
                              required
                              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono font-semibold"
                            />
                            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          </div>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">
                            We will send a 6-digit SMS verification code to this number.
                          </span>
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
                            Create Password *
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
                          className="w-full mt-2 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>{loading ? 'Sending Verification Code...' : 'Continue to Phone Verification'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    ) : (
                      /* Step 2: Inline OTP Verification */
                      <form onSubmit={handleCompleteRegistration} className="space-y-4">
                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Verification Code Sent To:</span>
                            <button
                              type="button"
                              onClick={() => {
                                setRegStep(1);
                                setErrorMsg('');
                              }}
                              className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                            >
                              Edit Phone
                            </button>
                          </div>
                          <span className="font-mono font-bold text-slate-900 block text-sm">
                            +88 {regPhone}
                          </span>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                            <span>Enter 6-Digit OTP Code *</span>
                            <span className="text-[10px] text-slate-500 font-normal">
                              Demo Code: <strong className="font-mono font-bold text-slate-900">{demoOtpHint}</strong>
                            </span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              maxLength={6}
                              autoFocus
                              value={regOtp}
                              onChange={(e) => setRegOtp(e.target.value.replace(/[^0-9]/g, ''))}
                              placeholder="&bull; &bull; &bull; &bull; &bull; &bull;"
                              required
                              className="w-full pl-9 pr-3 py-2.5 text-center text-xl font-mono font-bold tracking-widest border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                            />
                            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading || regOtp.length < 4}
                          className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>{loading ? 'Verifying & Creating Account...' : 'Verify & Complete Account'}</span>
                        </button>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setRegStep(1);
                              setErrorMsg('');
                            }}
                            className="text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Back to Details</span>
                          </button>

                          <button
                            type="button"
                            disabled={otpCountdown > 0 || loading}
                            onClick={handleResendOtp}
                            className="text-blue-600 hover:underline font-semibold disabled:text-slate-400 disabled:no-underline cursor-pointer flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>{otpCountdown > 0 ? `Resend code (${otpCountdown}s)` : 'Resend Code'}</span>
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
