import React from 'react';
import { X, Smartphone, Download, ShieldCheck, Zap, Star, Sparkles } from 'lucide-react';

import { PLAY_STORE_URL } from '../../utils/constants';

interface PlayStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureTitle?: string;
  featureDescription?: string;
}

export const PlayStoreModal: React.FC<PlayStoreModalProps> = ({
  isOpen,
  onClose,
  featureTitle = 'Mobile App Exclusive Feature',
  featureDescription = 'This hardware feature requires Bluetooth LE or native device sensors available on the Kosmico Mobile App.',
}) => {
  if (!isOpen) return null;

  const playStoreUrl = PLAY_STORE_URL;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-white rounded-[36px] shadow-2xl border border-emerald-900/20 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Luxury Header Background */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 px-7 py-8 text-white relative border-b border-emerald-800/40">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-amber-300 shadow-md">
              <Smartphone className="w-5 h-5" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 fill-amber-300" />
              Kosmico Mobile App
            </span>
          </div>

          <h3 className="text-xl font-serif font-black text-white mb-1.5 leading-snug">{featureTitle}</h3>
          <p className="text-xs text-emerald-100/90 leading-relaxed">{featureDescription}</p>
        </div>

        {/* Modal Body */}
        <div className="p-7 space-y-6">
          <div className="bg-gradient-to-r from-emerald-50 via-stone-50 to-emerald-50/50 border border-emerald-800/15 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-900 to-emerald-950 text-amber-300 flex items-center justify-center flex-shrink-0 font-serif font-black text-2xl shadow-md border border-emerald-700/50">
              K
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-serif font-bold text-neutral-900 text-sm">Kosmico Wellness Official App</h4>
              <p className="text-xs text-neutral-600 truncate">GlucoRhythm • BLE Biometrics • AI Scanner</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  4.9 Rating
                </span>
                <span className="text-[10px] text-neutral-500 font-bold">Downloads</span>
              </div>
            </div>
          </div>

          {/* Quick Feature Badges */}
          <div className="grid grid-cols-2 gap-2.5 text-xs text-neutral-700">
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
              <span className="font-bold text-[11px]">Live BLE Biometrics</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
              <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span className="font-bold text-[11px]">Camera PPG Vitals</span>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="space-y-3 pt-2">
            <a
              href={playStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-6 bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 hover:from-emerald-950 hover:to-emerald-900 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-950/20 hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 border border-emerald-700/50 active:scale-98"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>Get App on Google Play Store</span>
            </a>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 text-xs font-bold text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Continue on Website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
