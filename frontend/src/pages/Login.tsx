import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Mail, ArrowLeft, ShieldCheck, Sparkles, Lock } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingModal, setIsVerifyingModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const from = location.state?.from?.pathname || '/';

  // 30-Second Countdown timer
  useEffect(() => {
    let interval: any;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const formatTimer = (seconds: number) => {
    const s = seconds < 10 ? `0${seconds}` : `${seconds}`;
    return `00:${s}`;
  };

  // Handle Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      await api.post('/auth/login', { email: email.trim().toLowerCase() });

      setStep('otp');
      setResendTimer(30);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);

      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to send OTP. Please check your email and try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP digit input
  const handleOtpChange = (index: number, value: string) => {
    const cleanedValue = value.replace(/\D/g, '');
    if (!cleanedValue && value !== '') return;

    const newOtp = [...otp];

    if (cleanedValue.length > 1) {
      const digits = cleanedValue.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newOtp[i] = digits[i] || '';
      }
      setOtp(newOtp);
      const nextFocus = Math.min(digits.length, 5);
      otpInputRefs.current[nextFocus]?.focus();

      if (digits.length === 6) {
        verifyOtpCode(newOtp.join(''));
      }
      return;
    }

    newOtp[index] = cleanedValue;
    setOtp(newOtp);

    if (cleanedValue && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (cleanedValue && index === 5 && newOtp.every((d) => d !== '')) {
      verifyOtpCode(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, idx) => {
      if (idx < 6) newOtp[idx] = char;
    });
    setOtp(newOtp);

    if (pastedData.length === 6) {
      verifyOtpCode(pastedData);
    } else {
      otpInputRefs.current[pastedData.length]?.focus();
    }
  };

  // Verify OTP
  const verifyOtpCode = async (otpString: string) => {
    if (otpString.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit code');
      return;
    }

    try {
      setIsVerifyingModal(true);
      setErrorMessage(null);
      const response = await api.post('/auth/login-verify', {
        email: email.trim().toLowerCase(),
        otp: otpString,
      });

      const resData = response.data?.data || response.data;
      const userObj = resData?.user || resData;
      const authToken = resData?.accessToken || resData?.token || response.data?.token || response.data?.accessToken;
      setAuth(userObj, authToken);

      setTimeout(() => {
        setIsVerifyingModal(false);
        navigate(from, { replace: true });
      }, 400);
    } catch (error: any) {
      setIsVerifyingModal(false);
      const msg = error.response?.data?.message || 'Incorrect or expired OTP. Please try again.';
      setErrorMessage(msg);
      setOtp(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-[#e8f7ee] via-[#f2faf5] to-[#e4f6eb] relative overflow-hidden">
      {/* Decorative botanical ambient blur circles */}
      <div className="absolute top-12 left-1/4 w-72 h-72 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-12 right-1/4 w-80 h-80 bg-teal-400/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* LUXURY CARD CONTAINER */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl p-7 sm:p-9 shadow-2xl border border-emerald-100/80 relative transition-all duration-300 hover:shadow-emerald-900/10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/90 border border-emerald-200/60 flex items-center justify-center shadow-inner mb-3 p-2">
            <img
              src="/logo.png"
              alt="Kosmico Wellness"
              className="w-full h-full object-contain drop-shadow-sm"
              onError={(e) => {
                // Fallback icon if logo image is missing
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-[11px] font-semibold tracking-wide uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pure Ayurvedic Sweetness</span>
          </div>

          <span className="font-serif text-2xl font-bold text-[#064e3b] tracking-tight">
            Kosmico Wellness
          </span>
        </div>

        {/* ================= STEP 1: EMAIL LOGIN ================= */}
        {step === 'email' && (
          <div className="flex flex-col">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-neutral-900 font-sans tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                Enter your email address to receive a secure 6-digit OTP
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="w-full mb-5 p-3.5 bg-red-50 text-red-700 text-xs rounded-2xl font-medium border border-red-200/80 flex items-start gap-2 animate-shake">
                <span className="text-red-500 font-bold shrink-0">⚠️</span>
                <span className="flex-1">{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSendOtp} className="w-full space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-emerald-600 absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. name@gmail.com"
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 font-medium focus:bg-white focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 focus:outline-none transition-all shadow-inner"
                    autoFocus
                    required
                  />
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-600 to-[#064e3b] hover:from-emerald-700 hover:to-[#043327] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-900/20 cursor-pointer transition-all duration-200 text-sm flex items-center justify-center gap-2 disabled:opacity-70 mt-2 active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Continue with OTP</span>
                    <span className="text-emerald-200">→</span>
                  </>
                )}
              </button>
            </form>

            {/* Trust Badges */}
            <div className="mt-6 pt-5 border-t border-neutral-100 flex items-center justify-center gap-4 text-[11px] text-neutral-500 font-medium">
              <div className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Passwordless</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-Bit Encrypted</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="mt-5 text-center text-xs text-neutral-600">
              New to Kosmico Wellness?{' '}
              <Link to="/register" className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline">
                Create Account
              </Link>
            </div>
          </div>
        )}

        {/* ================= STEP 2: VERIFICATION CODE ================= */}
        {step === 'otp' && (
          <div className="flex flex-col">
            {/* Top Back Navigation Arrow */}
            <button
              onClick={() => {
                setStep('email');
                setErrorMessage(null);
              }}
              className="text-emerald-700 hover:text-emerald-900 -ml-2 mb-3 inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-emerald-50 transition-colors self-start"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Email</span>
            </button>

            {/* Heading & Instructions */}
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-[#064e3b] font-sans">
                Verify Code
              </h2>
              <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed">
                Enter the 6-digit code sent to
                <br />
                <span className="font-bold text-neutral-900 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block mt-1">
                  {email}
                </span>
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3.5 bg-red-50 text-red-700 text-xs rounded-2xl font-medium border border-red-200 flex items-start gap-2">
                <span className="text-red-500 font-bold shrink-0">⚠️</span>
                <span className="flex-1">{errorMessage}</span>
              </div>
            )}

            {/* 6 Rounded OTP Boxes */}
            <div className="flex justify-between gap-2 mb-6" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    otpInputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-11 h-14 sm:w-12 sm:h-15 text-center font-extrabold text-2xl rounded-2xl bg-neutral-50 border-2 border-neutral-200 text-emerald-900 focus:bg-white focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 focus:outline-none transition-all shadow-inner"
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              onClick={() => verifyOtpCode(otp.join(''))}
              disabled={otp.join('').length !== 6 || isLoading}
              className="w-full bg-gradient-to-r from-emerald-600 to-[#064e3b] hover:from-emerald-700 hover:to-[#043327] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-900/20 cursor-pointer transition-all duration-200 text-sm flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.99]"
            >
              <span>Verify & Access Account</span>
            </button>

            {/* Resend Code / Timer */}
            <div className="mt-6 text-center text-xs">
              {canResend ? (
                <div className="space-y-1">
                  <p className="text-neutral-500">Didn't receive the email?</p>
                  <button
                    onClick={() => handleSendOtp()}
                    className="text-emerald-600 font-bold underline hover:text-emerald-800 cursor-pointer"
                  >
                    Resend 6-Digit Code
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-neutral-500">Resend code available in</p>
                  <p className="text-emerald-700 font-bold text-sm tracking-wider font-mono">
                    {formatTimer(resendTimer)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ================= VERIFYING POPUP MODAL ================= */}
      {isVerifyingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-xs w-full flex flex-col items-center text-center shadow-2xl border border-emerald-100 animate-scale-up">
            <div className="w-12 h-12 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
            <h3 className="text-base font-bold text-neutral-900 mb-1">
              Verifying Code
            </h3>
            <p className="text-xs text-neutral-500">
              Setting up your secure session...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
