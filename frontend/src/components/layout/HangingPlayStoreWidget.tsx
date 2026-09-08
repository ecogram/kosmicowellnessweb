import { useState } from 'react';
import { PlayStoreModal } from '../ui/PlayStoreModal';
import { Sparkles } from 'lucide-react';

export function HangingPlayStoreWidget() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Top Right Hanging Ornament Container */}
      <div 
        className="fixed top-0 right-6 sm:right-14 md:right-20 z-[60] pointer-events-auto cursor-pointer group select-none"
        onClick={() => setIsModalOpen(true)}
        title="Click to Download Kosmico Mobile App"
      >
        {/* Hanging Pendulum Assembly with Swaying Motion */}
        <div className="animate-hanging-swing flex flex-col items-center">
          
          {/* Delicate Metallic Golden Chain / String */}
          <div className="w-1 h-16 sm:h-24 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 shadow-md relative">
            <div className="absolute top-0 -left-1.5 w-4 h-3 rounded-b-md bg-amber-400 border border-amber-600 shadow-xs" />
          </div>

          {/* Golden Ring Attachment */}
          <div className="w-4 h-4 rounded-full border-2 border-amber-400 bg-amber-300/40 -mt-1 shadow-xs flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          </div>

          {/* Main Kosmico Ornament Ball / Circular Logo Badge */}
          <div className="relative -mt-1 group-hover:scale-110 transition-transform duration-300">
            {/* Ambient Gold Glow Backdrop */}
            <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-md animate-pulse-glow" />

            {/* Circular Ornament Container */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 p-1 border-2 border-amber-400 shadow-2xl flex items-center justify-center overflow-hidden ring-4 ring-amber-400/20">
              {/* Inner Pattern Ring */}
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-2 shadow-inner border border-amber-200">
                <img
                  src="/logo.png"
                  alt="Kosmico App"
                  className="w-full h-full object-contain filter drop-shadow-md group-hover:rotate-6 transition-transform duration-300"
                />
              </div>

              {/* Floating Sparkle Icon Badge */}
              <div className="absolute top-0 right-0 bg-amber-400 text-emerald-950 p-1 rounded-full border border-white shadow-md">
                <Sparkles className="w-3 h-3 fill-emerald-950" />
              </div>
            </div>

            {/* Hanging Label Pill */}
            <div className="mt-1 bg-emerald-950/90 text-amber-300 border border-amber-400/60 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black shadow-lg backdrop-blur-md flex items-center justify-center gap-1 group-hover:bg-amber-400 group-hover:text-emerald-950 transition-colors whitespace-nowrap">
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
