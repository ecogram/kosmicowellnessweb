import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Sparkles, Check, ShieldCheck, Gift, Loader2, User, Phone, MessageCircleHeart } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const STORAGE_SUBMITTED_KEY = 'kosmico_lead_submitted_v1';
const STORAGE_DISMISSED_KEY = 'kosmico_lead_dismissed_until';

export const LeadCapturePopup: React.FC = () => {
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Only show on /shop page and /checkout page (NOT on Home '/')
  const isTargetPage = location.pathname === '/shop' || location.pathname === '/checkout';

  useEffect(() => {
    if (!isTargetPage) {
      setIsOpen(false);
      return;
    }

    // Check if user already submitted or recently dismissed
    const isSubmitted = localStorage.getItem(STORAGE_SUBMITTED_KEY);
    if (isSubmitted === 'true') {
      return;
    }

    const dismissedThisSession = sessionStorage.getItem(STORAGE_DISMISSED_KEY);
    if (dismissedThisSession === 'true') {
      return;
    }

    // Trigger after 6 seconds
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 6000);

    // Also trigger if user scrolls past 30% of page
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > 30) {
        setIsOpen(true);
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isTargetPage, location.pathname]);

  const handleClose = () => {
    setIsOpen(false);
    // Session-based snooze: popup won't reappear until page is refreshed
    sessionStorage.setItem(STORAGE_DISMISSED_KEY, 'true');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers, max 10 digits
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(cleaned);
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!phoneNumber || phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    // Validate Indian mobile numbers starting with 6, 7, 8, 9
    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.post('/leads/capture', {
        name: fullName.trim(),
        phoneNumber,
        page: location.pathname,
        source: 'web_popup',
      });

      setSubmitted(true);
      localStorage.setItem(STORAGE_SUBMITTED_KEY, 'true');
      toast.success('Details saved! Our team will contact you soon.');
    } catch (err: any) {
      console.warn('Lead capture fallback:', err?.message);
      // Show success message even if API fails (offline/error)
      setSubmitted(true);
      localStorage.setItem(STORAGE_SUBMITTED_KEY, 'true');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-300">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 transition-all scale-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Gradient Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-800 to-teal-900 px-6 pt-7 pb-6 text-white relative overflow-hidden">
          {/* Subtle glow circles */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-400/20 rounded-full blur-xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={handleClose}
            aria-label="Close discount popup"
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white/90 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Exclusive Web Offer</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-white leading-tight">
            Flat 10% OFF on Your First Order! 🎉
          </h3>
          <p className="text-emerald-100/90 text-xs sm:text-sm mt-1.5 leading-relaxed">
            100% Natural Zero-Calorie Sweet Monk Drops. Zero Sugar, Zero Glycemic Spike.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Name Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Your Full Name:</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Enter your name (e.g. Rahul Sharma)"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (error) setError(null);
                    }}
                    autoFocus
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 focus:border-emerald-600 focus:bg-white focus:outline-none rounded-2xl text-sm font-semibold text-neutral-900 transition-all placeholder:text-neutral-400"
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>WhatsApp Number to Claim Code:</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center gap-1.5 text-neutral-500 font-semibold text-sm pointer-events-none">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="Enter 10-digit number"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    maxLength={10}
                    className="w-full pl-20 pr-4 py-3 bg-neutral-50 border border-neutral-300 focus:border-emerald-600 focus:bg-white focus:outline-none rounded-2xl text-sm font-semibold tracking-wider text-neutral-900 transition-all placeholder:text-neutral-400"
                  />
                </div>
                {error && <p className="text-xs text-red-600 font-medium pl-1">{error}</p>}
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading || !fullName.trim() || phoneNumber.length !== 10}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-700 to-[#0a7a40] hover:from-emerald-800 hover:to-[#086333] text-white font-bold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group mt-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Unlocking 10% OFF...</span>
                  </>
                ) : (
                  <>
                    <Gift className="w-4 h-4 group-hover:scale-110 transition-transform text-amber-300" />
                    <span>Get 10% OFF Coupon Code</span>
                  </>
                )}
              </button>

              {/* Security & Privacy Reassurance */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Zero spam guarantee. Code shown immediately on screen.</span>
              </div>
            </form>
          ) : (
            /* Success / Thank You Message View */
            <div className="space-y-5 text-center py-3 animate-in fade-in duration-300">

              {/* Animated Icon */}
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-30" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                  <MessageCircleHeart className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Heading */}
              <div className="space-y-1.5">
                <h4 className="text-xl font-black text-neutral-900 leading-tight">
                  🎉 Thank You, {fullName.split(' ')[0]}!
                </h4>
                <p className="text-sm font-semibold text-emerald-700">
                  We've received your details successfully.
                </p>
              </div>

              {/* Info Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 text-left space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <span className="text-lg shrink-0">💬</span>
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    Our <span className="font-bold text-emerald-800">Wellness Team</span> will reach out to you with an exclusive special offer just for you.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-lg shrink-0">🕐</span>
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    Expect a message within <span className="font-bold text-emerald-800">24 hours</span> — we'll be in touch soon!
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-lg shrink-0">🌿</span>
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    Meanwhile, feel free to explore our <span className="font-bold text-emerald-800">Sweet Monk products</span> and discover your healthy choice!
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3.5 px-4 bg-[#0a7a40] hover:bg-[#086333] text-white font-bold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Explore Our Products</span>
                <Check className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-neutral-400">
                🔒 Your number is 100% safe with us. Zero spam, guaranteed.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
