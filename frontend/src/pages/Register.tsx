import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Mail, User, ArrowLeft, ShieldCheck, Sparkles, Lock } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingModal, setIsVerifyingModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  const handleNameChange = (val: string) => {
    // Only allow letters and spaces (no numbers 0-9, no special symbols)
    const filtered = val.replace(/[^a-zA-Z\s]/g, '');
    setName(filtered);
    if (val !== filtered) {
      setErrorMessage('Name should only contain letters (no numbers or special characters allowed)');
    } else if (errorMessage?.includes('Name should only')) {
      setErrorMessage(null);
    }
  };

  const handleEmailChange = (val: string) => {
    const lower = val.toLowerCase().replace(/\s/g, '');
    setEmail(lower);
    if (/[A-Z]/.test(val)) {
      setErrorMessage('Capital letters are not allowed in email. Automatically converted to lowercase.');
    } else if (errorMessage?.includes('Capital letters are not allowed')) {
      setErrorMessage(null);
    }
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName || cleanName.length < 2) {
      setErrorMessage('Please enter your full name (at least 2 letters)');
      return;
    }
    if (!/^[a-zA-Z\s]+$/.test(cleanName)) {
      setErrorMessage('Name should only contain letters (no numbers allowed)');
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMessage('Please enter a valid lowercase email address (e.g. name@domain.com)');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      await api.post('/auth/register', { email: cleanEmail, name: cleanName });

      setStep('otp');
      setResendTimer(30);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);

      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP during signup — uses /api/auth/resend-otp per API docs
  const handleResendOtp = async () => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      setIsLoading(true);
      setErrorMessage(null);
      await api.post('/auth/resend-otp', { email: cleanEmail });
      setResendTimer(30);
      setCanResend(false);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to resend OTP. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

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

  const verifyOtpCode = async (otpString: string) => {
    if (otpString.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit code');
      return;
    }

    try {
      setIsVerifyingModal(true);
      setErrorMessage(null);
      const response = await api.post('/auth/signup-verify', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        otp: otpString,
      });

      const resData = response.data?.data || response.data || {};
      let userObj = resData?.user || resData;
      const authToken = resData?.accessToken || resData?.token || response.data?.token || response.data?.accessToken;

      if (authToken) {
        setAuth(userObj, authToken);
        try {
          const profileRes = await api.get('/auth/profile', {
            headers: { Authorization: `Bearer ${authToken}` },
          });
          if (profileRes.data?.data) {
            userObj = profileRes.data.data.user || profileRes.data.data;
            setAuth(userObj, authToken);
          }
        } catch (profileErr) {
          console.warn('Profile fetch after register notice:', profileErr);
        }
      }

      setTimeout(() => {
        setIsVerifyingModal(false);
        navigate('/');
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
      <div className="absolute top-12 right-1/4 w-72 h-72 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-12 left-1/4 w-80 h-80 bg-teal-400/15 rounded-full blur-3xl pointer-events-none -z-10" />

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
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-[11px] font-semibold tracking-wide uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Join 50,000+ Happy Healthy Families</span>
          </div>

          <span className="font-serif text-2xl font-bold text-[#064e3b] tracking-tight">
            Create Account
          </span>
        </div>

        {/* ================= STEP 1: DETAILS ================= */}
        {step === 'details' && (
          <div className="flex flex-col">
            <div className="text-center mb-5">
              <p className="text-xs sm:text-sm text-neutral-500">
                Sign up with 1-tap passwordless OTP verification
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="w-full mb-4 p-3.5 bg-red-50 text-red-700 text-xs rounded-2xl font-medium border border-red-200 flex flex-col gap-1.5">
                <div className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0">⚠️</span>
                  <span className="flex-1">{errorMessage}</span>
                </div>
                {errorMessage.toLowerCase().includes('already exists') && (
                  <Link
                    to="/login"
                    className="ml-6 text-[#064e3b] font-bold underline hover:text-emerald-700 text-xs"
                  >
                    Click here to Log In directly &rarr;
                  </Link>
                )}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSendOtp} className="w-full space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Full Name (Letters Only)
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-emerald-600 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 font-medium focus:bg-white focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 focus:outline-none transition-all shadow-inner"
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Email Address (Lowercase)
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-emerald-600 absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="e.g. rahul@gmail.com"
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 font-medium lowercase focus:bg-white focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 focus:outline-none transition-all shadow-inner"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-600 to-[#064e3b] hover:from-emerald-700 hover:to-[#043327] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-900/20 cursor-pointer transition-all duration-200 text-sm flex items-center justify-center gap-2 disabled:opacity-70 mt-2 active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Continue with Verification</span>
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
                <span>100% Free Signup</span>
              </div>
            </div>

            {/* Sign In Link */}
            <div className="mt-5 text-center text-xs text-neutral-600">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline">
                Login Here
              </Link>
            </div>
          </div>
        )}

        {/* ================= STEP 2: VERIFICATION CODE ================= */}
        {step === 'otp' && (
          <div className="flex flex-col">
            <button
              onClick={() => {
                setStep('details');
                setErrorMessage(null);
              }}
              className="text-emerald-700 hover:text-emerald-900 -ml-2 mb-3 inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-emerald-50 transition-colors self-start"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Details</span>
            </button>

            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-[#064e3b] font-sans">
                Verify Code
              </h2>
              <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed">
                Please enter the 6-digit code sent to
                <br />
                <span className="font-bold text-neutral-900 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block mt-1">
                  {email}
                </span>
              </p>
            </div>

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
              <span>Verify & Complete Registration</span>
            </button>

            {/* Resend Code / Timer */}
            <div className="mt-6 text-center text-xs">
              {canResend ? (
                <div className="space-y-1">
                  <p className="text-neutral-500">Didn't receive the email?</p>
                  <button
                    onClick={() => handleResendOtp()}
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

      {isVerifyingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-xs w-full flex flex-col items-center text-center shadow-2xl border border-emerald-100 animate-scale-up">
            <div className="w-12 h-12 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
            <h3 className="text-base font-bold text-neutral-900 mb-1">
              Creating Account
            </h3>
            <p className="text-xs text-neutral-500">
              Setting up your personalized wellness profile...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
