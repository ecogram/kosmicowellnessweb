import React, { useState } from 'react';
import { Container } from '../../components/ui/Container';
import { Download, Smartphone, Sparkles, Activity, ShieldCheck, X, ExternalLink } from 'lucide-react';
import { PLAY_STORE_URL } from '../../utils/constants';

export const AppDownloadSection: React.FC = () => {
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const playStoreUrl = PLAY_STORE_URL;
  const qrImageSrc = '/assets/icons/playstore-qr.jpg';

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-950 text-white relative overflow-hidden">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-[450px] h-[450px] bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

      <Container>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 relative z-10">
          
          {/* Left Text & CTA */}
          <div className="w-full lg:w-1/2 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-amber-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Experience Kosmico Mobile App</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-extrabold leading-tight">
              Your Complete Health & Wellness Companion, <br />
              <span className="text-amber-400 italic">Right in Your Pocket.</span>
            </h2>

            <p className="text-base text-emerald-100/90 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Download the official Kosmico Wellness mobile app on Google Play to unlock Bluetooth smartwatch synchronization, real-time meal scanning with AI, and camera vital estimation.
            </p>

            {/* Feature Pills Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-semibold text-emerald-100 max-w-lg mx-auto lg:mx-0">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-3">
                <Activity className="w-4 h-4 text-amber-400" />
                <span>GlucoRhythm Glucose Tracker</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-3">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>BLE Smartwatch Biometrics</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-3">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Plate AI Meal Scanner</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-3">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>AI Health Consultant</span>
              </div>
            </div>

            {/* Play Store Download & Real QR Code Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5">
              <a
                href={playStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-extrabold text-sm rounded-2xl shadow-xl shadow-amber-400/20 hover:shadow-amber-400/30 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-3 cursor-pointer"
              >
                <Download className="w-5 h-5 text-neutral-950" />
                <div className="text-left leading-tight">
                  <div className="text-[10px] uppercase font-bold text-neutral-800">GET IT ON</div>
                  <div className="text-base font-black">Google Play Store</div>
                </div>
              </a>

              {/* Real Play Store QR Scanner Button - Click to Open Card */}
              <button
                type="button"
                onClick={() => setIsQrModalOpen(true)}
                className="flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-amber-400/60 p-2.5 rounded-2xl backdrop-blur-md transition-all cursor-pointer group text-left"
                title="Click to expand QR Code Scanner"
              >
                <div className="w-12 h-12 bg-white rounded-xl p-1 flex items-center justify-center overflow-hidden shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  <img
                    src={qrImageSrc}
                    alt="Play Store QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-left text-xs">
                  <div className="font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-1">
                    <span>Scan to Download</span>
                  </div>
                  <div className="text-[10px] text-emerald-200">Point phone camera</div>
                </div>
              </button>
            </div>

          </div>

          {/* Right Mobile App Mockup Preview */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="relative w-full max-w-sm bg-neutral-900 rounded-[40px] p-3 shadow-2xl border-4 border-neutral-700/60 transform rotate-1 hover:rotate-0 transition-transform duration-500">
              
              {/* Phone Speaker Notch */}
              <div className="w-28 h-4 bg-neutral-800 rounded-full mx-auto mb-2 flex items-center justify-center">
                <div className="w-10 h-1 bg-neutral-600 rounded-full" />
              </div>

              {/* App Screen Content Preview */}
              <div className="bg-emerald-50 rounded-[32px] overflow-hidden p-4 space-y-4 text-neutral-900">
                {/* App Top Bar */}
                <div className="flex items-center justify-between border-b border-emerald-900/10 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white font-serif font-extrabold flex items-center justify-center text-xs">
                      K
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-neutral-900">Kosmico</div>
                      <div className="text-[9px] text-emerald-800 font-semibold">Wellness Journey</div>
                    </div>
                  </div>
                  <span className="text-[9px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                    LIVE
                  </span>
                </div>

                {/* GlucoRhythm Widget Mock */}
                <div className="bg-white rounded-2xl p-3 shadow-sm border border-emerald-900/10 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-emerald-900">GlucoRhythm Sync</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">CGM Active</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-center py-1">
                    <div className="bg-emerald-50 p-1.5 rounded-lg">
                      <div className="text-[9px] text-neutral-500">Glucose</div>
                      <div className="text-xs font-black text-emerald-800">112 mg/dL</div>
                    </div>
                    <div className="bg-amber-50 p-1.5 rounded-lg">
                      <div className="text-[9px] text-neutral-500">HRV</div>
                      <div className="text-xs font-black text-amber-700">74 BPM</div>
                    </div>
                    <div className="bg-emerald-50 p-1.5 rounded-lg">
                      <div className="text-[9px] text-neutral-500">SpO2</div>
                      <div className="text-xs font-black text-emerald-800">98%</div>
                    </div>
                  </div>
                </div>

                {/* AI Assistant Quick Pill Mock */}
                <div className="bg-emerald-800 text-white rounded-2xl p-3 text-xs space-y-1">
                  <div className="font-bold text-[11px] text-amber-300">🤖 AI Consultant</div>
                  <p className="text-[10px] text-emerald-100 leading-snug">
                    "Namaste! Aapki glucose levels optimal range (112 mg/dL) mein hain."
                  </p>
                </div>

                {/* Bottom Nav Simulation */}
                <div className="pt-2 flex justify-around text-[10px] font-bold text-neutral-500 border-t border-neutral-200">
                  <span className="text-emerald-800">Home</span>
                  <span>Products</span>
                  <span className="text-emerald-800 font-extrabold underline">Care</span>
                  <span>Profile</span>
                </div>

              </div>
            </div>
          </div>

        </div>
      </Container>

      {/* Play Store QR Code Expanded Card Modal */}
      {isQrModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsQrModalOpen(false)}
        >
          <div 
            className="relative max-w-sm w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 text-neutral-900 p-6 sm:p-8 flex flex-col items-center text-center space-y-5 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer"
              title="Close QR Code"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-1 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>Google Play Store</span>
              </div>
              <h3 className="font-serif font-bold text-2xl text-neutral-900">
                Scan to Download
              </h3>
              <p className="text-xs text-neutral-600 max-w-[240px] mx-auto leading-relaxed">
                Point your phone camera at this QR code to install the <strong>Kosmico Wellness</strong> app directly.
              </p>
            </div>

            {/* Large High-Definition Scannable QR Code */}
            <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-emerald-800/30 shadow-inner flex items-center justify-center w-60 h-60">
              <img
                src={qrImageSrc}
                alt="Kosmico Wellness Google Play QR Code"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>

            {/* Direct Link Action */}
            <div className="w-full pt-1 space-y-2">
              <a
                href={playStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Open Google Play Store</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <p className="text-[11px] text-neutral-400">Available for Android smartphones &amp; tablets</p>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
