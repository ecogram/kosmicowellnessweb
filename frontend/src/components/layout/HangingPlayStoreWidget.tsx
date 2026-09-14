import { useState } from 'react';
import { PlayStoreModal } from '../ui/PlayStoreModal';
import { Sparkles } from 'lucide-react';

export function HangingPlayStoreWidget() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Floating App Badge Container right below Navbar (No Chain across Navbar) */}
      <div 
        className="fixed top-20 sm:top-24 right-2 sm:right-6 md:right-12 z-40 pointer-events-auto cursor-pointer group select-none block"
        onClick={() => setIsModalOpen(true)}
        title="Click to Download Kosmico Mobile App"
      >
        <div className="flex flex-col items-center">
          {/* Main Kosmico Ornament Ball / Circular Logo Badge */}
          <div className="relative group-hover:scale-110 transition-transform duration-300">
            {/* Ambient Gold Glow Backdrop */}
            <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-md animate-pulse-glow" />

            {/* Circular Ornament Container */}
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 p-0.5 sm:p-1 border-2 border-amber-400 shadow-2xl flex items-center justify-center overflow-hidden ring-3 sm:ring-4 ring-amber-400/20">
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
            <div className="mt-1 bg-emerald-950/95 text-amber-300 border border-amber-400/60 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] md:text-[10px] font-black shadow-lg backdrop-blur-md flex items-center justify-center gap-1 group-hover:bg-amber-400 group-hover:text-emerald-950 transition-colors whitespace-nowrap">
              <span>App Store 📱</span>
            </div>
          </div>

        </div>
      </div>

      {/* Play Store Download Modal */}
      <PlayStoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        featureTitle="Kosmico Mobile &amp; Biometric Care App"
        featureDescription="Download the official Kosmico Mobile App on Google Play Store for AI meal scanning, smartwatch sync, and personalized health biometrics."
      />
    </>
  );
}
