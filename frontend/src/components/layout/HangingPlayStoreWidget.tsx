import { useState } from 'react';
import { PlayStoreModal } from '../ui/PlayStoreModal';
import { Sparkles, X } from 'lucide-react';

export function HangingPlayStoreWidget() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDismissed(true);
  };

  return (
    <>
      {/* Floating App Badge Container right below Navbar - Removable on click of 'X' */}
      <div 
        className="fixed top-[88px] sm:top-[98px] right-2 sm:right-6 md:right-10 z-40 pointer-events-auto cursor-pointer group select-none block transition-all"
        onClick={() => setIsModalOpen(true)}
        title="Click to Download Kosmico Mobile App"
      >
        <div className="flex flex-col items-center relative">
          {/* Prominent Removal / Dismiss Button ('X') */}
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute -top-1.5 -right-1.5 z-50 w-5 h-5 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 active:scale-90 transition-all cursor-pointer"
            title="Remove from screen"
            aria-label="Remove App Badge"
          >
            <X className="w-3 h-3 text-white stroke-[2.5]" />
          </button>

          {/* Main Kosmico Ornament Ball / Circular Logo Badge */}
          <div className="relative group-hover:scale-110 transition-transform duration-300">
            {/* Ambient Gold Glow Backdrop */}
            <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-md animate-pulse-glow" />

            {/* Circular Ornament Container */}
            <div className="relative w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 p-0.5 sm:p-1 border-2 border-amber-400 shadow-2xl flex items-center justify-center overflow-hidden ring-2 sm:ring-4 ring-amber-400/20">
              {/* Inner Pattern Ring */}
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-1 sm:p-1.5 shadow-inner border border-amber-200">
                <img
                  src="/logo.png"
                  alt="Kosmico App"
                  className="w-full h-full object-contain filter drop-shadow-md group-hover:rotate-6 transition-transform duration-300"
                />
              </div>

              {/* Floating Sparkle Icon Badge */}
              <div className="absolute top-0 right-0 bg-amber-400 text-emerald-950 p-0.5 rounded-full border border-white shadow-md">
                <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5 fill-emerald-950" />
              </div>
            </div>

            {/* Floating Label Pill */}
            <div className="mt-0.5 sm:mt-1 bg-emerald-950/95 text-amber-300 border border-amber-400/60 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] md:text-[10px] font-black shadow-lg backdrop-blur-md flex items-center justify-center gap-1 group-hover:bg-amber-400 group-hover:text-emerald-950 transition-colors whitespace-nowrap">
              <span>App Store 📱</span>
            </div>
          </div>

        </div>
      </div>

      {/* Play Store Download Modal */}
      <PlayStoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        featureTitle="Kosmico Mobile & Biometric Care App"
        featureDescription="Download the official Kosmico Mobile App on Google Play Store for AI meal scanning, smartwatch sync, and personalized health biometrics."
      />
    </>
  );
}
