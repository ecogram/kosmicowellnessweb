import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../../components/ui/Container';
import { Sparkles, ArrowRight, ShieldCheck, Star, Zap, Leaf, Smartphone, HeartPulse } from 'lucide-react';
import { PlayStoreModal } from '../../components/ui/PlayStoreModal';

export function Hero() {
  const [isPlayStoreModalOpen, setIsPlayStoreModalOpen] = useState(false);

  return (
    <section className="relative bg-gradient-to-b from-emerald-50/80 via-stone-50/50 to-background py-14 sm:py-20 lg:py-24 overflow-hidden">
      {/* Subtle Luxury Ambient Glow Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-10 right-0 w-[550px] h-[550px] bg-amber-400/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

      <Container>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-14">
          
          {/* Left Side: Headline & Copy */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left z-10">
            
            {/* Top Pill Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-800/10 border border-emerald-800/20 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-6 shadow-xs backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
              <span>India's #1 Pure Monk Fruit Sweetener &amp; Care App</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-neutral-900 leading-[1.15] mb-6 tracking-tight">
              The sweet taste of sugar, <br />
              <span className="bg-gradient-to-r from-emerald-800 via-emerald-600 to-amber-600 bg-clip-text text-transparent italic">
                without the sugar.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-neutral-600 mb-8 max-w-xl leading-relaxed">
              100% natural zero-calorie liquid monk fruit sweetener paired with clinical AI biometrics. Replace sugar cup-for-cup with zero blood glucose spikes.
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-10">
              <Link to="/shop" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-8 py-4 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-emerald-900/20 hover:shadow-2xl hover:shadow-emerald-900/30 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer">
                  <span>Shop Monk Fruit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>

              <button
                onClick={() => setIsPlayStoreModalOpen(true)}
                className="w-full sm:w-auto px-7 py-4 bg-white/90 hover:bg-white border border-emerald-800/30 text-emerald-900 font-bold text-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-emerald-700" />
                <span>Get Mobile App 📱</span>
              </button>
            </div>

            {/* Key Trust Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold text-neutral-700 w-full pt-4 border-t border-emerald-900/10">
              <div className="flex items-center justify-center lg:justify-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Keto Certified</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-1.5">
                <Zap className="w-4 h-4 text-amber-500 shrink-0 fill-amber-500" />
                <span>0 Glucose Spike</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-1.5">
                <Leaf className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>100% Plant-Based</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Zero Erythritol</span>
              </div>
            </div>

          </div>

          {/* Right Side: Smartphone Frame with Animated Hero Screen */}
          <div className="w-full lg:w-1/2 relative flex justify-center items-center z-10 py-6">
            
            {/* Outer Ambient Glow Backdrop Circle */}
            <div className="absolute w-[85%] h-[85%] rounded-full bg-gradient-to-tr from-emerald-300/40 via-emerald-100/30 to-amber-200/40 blur-2xl animate-pulse-glow" />

            {/* Smartphone Chassis Container with Floating Motion */}
            <div className="relative animate-float-slow cursor-pointer group" onClick={() => setIsPlayStoreModalOpen(true)}>
              
              {/* Phone Physical Buttons */}
              <div className="absolute -left-[10px] sm:-left-[12px] top-24 w-[4px] sm:w-[5px] h-8 bg-neutral-700 rounded-l-md" />
              <div className="absolute -left-[10px] sm:-left-[12px] top-36 w-[4px] sm:w-[5px] h-12 bg-neutral-700 rounded-l-md" />
              <div className="absolute -right-[10px] sm:-right-[12px] top-28 w-[4px] sm:w-[5px] h-14 bg-neutral-700 rounded-r-md" />

              {/* Phone Main Outer Frame */}
              <div className="w-[280px] sm:w-[320px] md:w-[340px] bg-neutral-950 border-[10px] sm:border-[12px] border-neutral-900 rounded-[44px] sm:rounded-[52px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden ring-1 ring-white/20 transition-transform duration-500 group-hover:scale-[1.02]">
                
                {/* Dynamic Island / Top Notch */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-28 sm:w-32 h-4 sm:h-5 bg-black rounded-full z-40 flex items-center justify-end px-3 gap-1.5 shadow-inner">
                  <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-neutral-900 ring-1 ring-neutral-800" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
                </div>

                {/* Glass Glare Reflection Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none z-30 opacity-70" />

                {/* Phone Screen Display Content: Single Uniform Pure White Background */}
                <div className="bg-white h-[480px] sm:h-[530px] w-full pt-8 pb-4 px-3 flex flex-col justify-between items-center select-none relative z-10 overflow-hidden rounded-[34px] sm:rounded-[40px]">
                  
                  {/* Status Bar inside Screen */}
                  <div className="w-full flex justify-between items-center text-[10px] font-bold text-neutral-400 px-2.5 pb-1">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">5G</span>
                    </div>
                  </div>

                  {/* Perfectly Adjusted Product Image (Single Uniform Background Color) */}
                  <div className="relative w-full flex-1 flex items-center justify-center p-1 my-auto">
                    <img
                      src="/assets/products/product-box.jpg"
                      alt="Kosmico Sweet Monk Fruit Sweetener"
                      className="max-h-[360px] sm:max-h-[400px] w-auto object-contain mix-blend-multiply drop-shadow-xl transition-transform duration-700 transform group-hover:scale-105 relative z-10"
                    />
                  </div>

                  {/* Bottom App Product Tag inside Screen */}
                  <div className="w-full bg-stone-50 border border-stone-200/80 rounded-2xl p-2.5 shadow-sm flex items-center justify-between z-10">
                    <div className="text-left">
                      <div className="font-serif font-bold text-neutral-900 text-xs leading-snug">Kosmiko Sweet Monk</div>
                      <div className="text-[10px] text-emerald-800 font-extrabold mt-0.5">₹387 • 100% Zero Calorie</div>
                    </div>
                    <span className="bg-emerald-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1">
                      Order &rarr;
                    </span>
                  </div>

                </div>
              </div>
            </div>

            {/* Floating Badge 1: Top-Left ⭐ Rating */}
            <div className="absolute top-8 -left-2 sm:left-2 lg:-left-6 z-20 bg-white/95 backdrop-blur-md border border-neutral-200/90 px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-2.5 transform -rotate-3 hover:rotate-0 transition-transform duration-300 animate-float-reverse">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black text-neutral-900 leading-none">4.9 / 5.0 Rating</div>
                <div className="text-[10px] text-neutral-500 font-semibold mt-0.5">289+ Verified Reviews</div>
              </div>
            </div>

            {/* Floating Badge 2: Top-Right 🩺 Care Hub */}
            <div className="absolute top-16 -right-2 sm:right-2 lg:-right-6 z-20 bg-white/95 backdrop-blur-md border border-emerald-900/20 px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-2.5 transform rotate-3 hover:rotate-0 transition-transform duration-300 animate-float-slow">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <HeartPulse className="w-4 h-4 text-emerald-700 animate-pulse" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black text-neutral-900 leading-none">Care Hub Connected</div>
                <div className="text-[10px] text-emerald-700 font-bold mt-0.5">Live Smartwatch Sync</div>
              </div>
            </div>

            {/* Floating Badge 3: Bottom-Left ⚡ 0 Spike */}
            <div className="absolute bottom-16 -left-3 sm:left-2 lg:-left-8 z-20 bg-white/95 backdrop-blur-md border border-amber-500/30 px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-2.5 transform rotate-2 hover:rotate-0 transition-transform duration-300 animate-float-slow">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                0
              </div>
              <div className="text-left">
                <div className="text-xs font-black text-neutral-900 leading-none">0 Blood Sugar Spike</div>
                <div className="text-[10px] text-emerald-700 font-bold mt-0.5">Keto &amp; Diabetic Safe</div>
              </div>
            </div>

            {/* Floating Badge 4: Bottom-Right 🌿 Monk Fruit */}
            <div className="absolute bottom-8 -right-3 sm:right-2 lg:-right-4 z-20 bg-white/95 backdrop-blur-md border border-emerald-800/20 px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-2.5 transform -rotate-2 hover:rotate-0 transition-transform duration-300 animate-float-reverse">
              <div className="w-8 h-8 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center shrink-0">
                <Leaf className="w-4 h-4 text-amber-300" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black text-neutral-900 leading-none">100% Monk Fruit</div>
                <div className="text-[10px] text-neutral-500 font-bold mt-0.5">Zero Calories • Zero Aftertaste</div>
              </div>
            </div>

          </div>

        </div>
      </Container>

      {/* Direct Play Store Modal Trigger */}
      <PlayStoreModal
        isOpen={isPlayStoreModalOpen}
        onClose={() => setIsPlayStoreModalOpen(false)}
        featureTitle="Kosmico Wellness Mobile App"
        featureDescription="Experience live GlucoRhythm biometrics, AI food scanning, and order pure Monk Fruit sweeteners directly inside the Kosmico App."
      />
    </section>
  );
}

