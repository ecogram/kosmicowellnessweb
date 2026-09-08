import { useState } from 'react';
import { PlayStoreModal } from '../ui/PlayStoreModal';
import { Sparkles } from 'lucide-react';

export function HangingPlayStoreWidget() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Play Store Badge Container - Positioned directly BELOW the Navbar bottom border */}
      <div 
        className="absolute top-[calc(100%+6px)] right-3 sm:right-12 md:right-16 z-40 pointer-events-auto cursor-pointer group select-none"
        onClick={() => setIsModalOpen(true)}
        title="Click to Download Kosmico Mobile App"
      >
        {/* Subtle Floating Motion */}
        <div className="animate-float-slow flex flex-col items-center">
          
          {/* Small Top Attachment Clip at Navbar Bottom Edge (No Long Chain) */}
          <div className="w-3 h-1.5 rounded-b-md bg-gradient-to-r from-amber-400 to-amber-500 border border-amber-600/50 shadow-xs -mt-1" />

          {/* Main Kosmico Circular Logo Badge */}
          <div className="relative group-hover:scale-105 transition-transform duration-300">
            {/* Ambient Gold Glow Backdrop */}
            <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-md animate-pulse-glow" />

            {/* Circular Badge Container */}
            <div className="relative w-12 h-12 sm:w-15 sm:h-15 rounded-full bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 p-0.5 border-2 border-amber-400 shadow-xl flex items-center justify-center overflow-hidden ring-2 ring-amber-400/30">
              {/* Inner White Ring with Logo */}
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-1 shadow-inner border border-amber-200">
                <img
                  src="/logo.png"
                  alt="Kosmico App"
                  className="w-full h-full object-contain filter drop-shadow-sm group-hover:rotate-6 transition-transform duration-300"
                />
              </div>

              {/* Floating Sparkle Icon Badge */}
              <div className="absolute top-0 right-0 bg-amber-400 text-emerald-950 p-0.5 rounded-full border border-white shadow-xs">
                <Sparkles className="w-2.5 h-2.5 fill-emerald-950" />
              </div>
            </div>

            {/* App Store Label Pill */}
            <div className="mt-1 bg-emerald-950/95 text-amber-300 border border-amber-400/60 px-2 py-0.5 rounded-full text-[9px] sm:text-[11px] font-black shadow-md backdrop-blur-md flex items-center justify-center gap-1 group-hover:bg-amber-400 group-hover:text-emerald-950 transition-colors whitespace-nowrap">
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
