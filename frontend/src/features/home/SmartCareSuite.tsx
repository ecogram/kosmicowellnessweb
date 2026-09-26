import React, { useState, useEffect } from 'react';
import { Container } from '../../components/ui/Container';
import { Camera, Watch, BookOpen, Users, Sparkles, ArrowRight, Smartphone, Activity, HeartPulse, ShieldCheck, Zap } from 'lucide-react';
import { PlayStoreModal } from '../../components/ui/PlayStoreModal';

export const SmartCareSuite: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDesc, setModalDesc] = useState('');

  const openAppModal = (title: string, desc: string) => {
    setModalTitle(title);
    setModalDesc(desc);
    setIsModalOpen(true);
  };

  const careFeatures = [
    {
      id: 'gluco',
      title: 'GlucoRhythm Glucose Tracker',
      desc: 'Continuous Glucose Waveform (CGM), Time in Range (82%), Est A1C (5.8%), and real-time blood sugar trends.',
      badge: 'APP EXCLUSIVE',
      stat: '112 mg/dL',
      statLabel: 'Steady & Stable',
      icon: Activity,
      gradient: 'from-emerald-900 via-emerald-800 to-emerald-950',
      iconBg: 'bg-emerald-800 text-amber-300',
      actionText: 'Get App to Track Glucose',
      featureDetails: 'Requires Kosmico App for continuous CGM sensor sync & background alerts.'
    },
    {
      id: 'scan',
      title: 'Plate AI Meal Scanner',
      desc: 'AI Vision meal photo scanner estimating calories, net carbs, and Glycemic Index (GI) impact before your first bite.',
      badge: 'AI VISION SCAN',
      stat: 'Instant GI Analysis',
      statLabel: 'Gemini 1.5 Vision',
      icon: Camera,
      gradient: 'from-emerald-800 via-emerald-900 to-stone-900',
      iconBg: 'bg-emerald-800 text-amber-300',
      actionText: 'Get App to Scan Meals',
      featureDetails: 'Requires Kosmico App camera integration & Gemini AI image recognition.'
    },
    {
      id: 'ble',
      title: 'Smartwatch BLE Sync',
      desc: 'Sync Bluetooth LE fitness bands to monitor heart rate (HRV 52ms), SpO2 oxygen, and real-time biometrics.',
      badge: 'LIVE BIOMETRICS',
      stat: '74 BPM • 98% SpO2',
      statLabel: 'Bluetooth LE Live',
      icon: Watch,
      gradient: 'from-amber-950 via-emerald-900 to-neutral-900',
      iconBg: 'bg-amber-500 text-neutral-950',
      actionText: 'Get App for Smartwatch Sync',
      featureDetails: 'Requires native Bluetooth LE hardware sensors available on the Kosmico Mobile App.'
    },
    {
      id: 'ppg',
      title: 'Camera PPG Vital Scanner',
      desc: 'Non-invasive camera PPG pulse estimation and blood pressure trend measurement directly on your smartphone.',
      badge: 'CAMERA SENSOR',
      stat: '118/76 BP',
      statLabel: 'PPG Pulse Estimation',
      icon: HeartPulse,
      gradient: 'from-rose-950 via-emerald-950 to-neutral-900',
      iconBg: 'bg-rose-600 text-white',
      actionText: 'Get App to Scan Vitals',
      featureDetails: 'Requires high-resolution smartphone camera hardware & flash sensor.'
    },
    {
      id: 'diary',
      title: 'Health Diary & Water Log',
      desc: 'Track daily water intake (+250ml logger), stress levels, workout logs, energy scores, and supplement reminders.',
      badge: 'DAILY TRACKER',
      stat: '+250ml Hydration',
      statLabel: 'Water & Mood Log',
      icon: BookOpen,
      gradient: 'from-emerald-900 via-stone-900 to-emerald-950',
      iconBg: 'bg-emerald-800 text-amber-300',
      actionText: 'Get App for Health Log',
      featureDetails: 'Requires Kosmico Mobile App for push notifications & daily log history.'
    },
    {
      id: 'community',
      title: 'Care Community & SOS',
      desc: 'Connect with peer health groups, doctor SOS support network, and share keto/diabetes friendly recipes.',
      badge: 'CARE NETWORK',
      stat: 'Doctor SOS Network',
      statLabel: 'Peer Circles & Recipes',
      icon: Users,
      gradient: 'from-emerald-950 via-emerald-900 to-stone-950',
      iconBg: 'bg-emerald-800 text-amber-300',
      actionText: 'Get App for Care Network',
      featureDetails: 'Requires Kosmico Mobile App for family care circle sync & emergency doctor SOS.'
    }
  ];

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeCycleIndex, setActiveCycleIndex] = useState<number>(0);

  // Auto-cycle through care features every 3.2 seconds when not hovering
  useEffect(() => {
    if (hoveredIndex !== null) return;
    const interval = setInterval(() => {
      setActiveCycleIndex((prev) => (prev + 1) % careFeatures.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [hoveredIndex]);

  const activeIndex = hoveredIndex !== null ? hoveredIndex : activeCycleIndex;

  return (
    <section id="care-suite" className="py-16 md:py-24 bg-gradient-to-b from-stone-50 via-emerald-50/40 to-background border-y border-border relative overflow-hidden">
      {/* Subtle Background Glow Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-10 right-0 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

      <Container className="relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-14 gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/10 border border-emerald-900/20 text-emerald-900 text-xs font-extrabold uppercase tracking-wider backdrop-blur-md shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
              <span>Premium Mobile Health &amp; Care Suite</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-neutral-900 leading-tight">
              Clinical-Grade Wellness Features, <br />
              <span className="bg-gradient-to-r from-emerald-800 via-emerald-600 to-amber-600 bg-clip-text text-transparent italic">
                Built for Your Everyday Life.
              </span>
            </h2>
          </div>

          <button
            onClick={() => openAppModal('Kosmico Mobile App Download', 'Download the official Kosmico Wellness mobile app on Google Play Store to unlock all premium health tools & biometrics.')}
            className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-emerald-800 via-emerald-900 to-emerald-950 hover:from-emerald-900 hover:to-emerald-950 px-6 py-4 rounded-2xl shadow-xl shadow-emerald-900/20 hover:shadow-2xl hover:shadow-emerald-900/30 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 group border border-emerald-700/50 cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>Download App on Google Play</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform text-amber-400" />
          </button>
        </div>

        {/* Responsive Grid without manual horizontal scrolling on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {careFeatures.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeIndex === index;

            return (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => {
                  setActiveCycleIndex(index);
                  setHoveredIndex(index);
                  openAppModal(item.title, item.featureDetails);
                }}
                className={`group cursor-pointer rounded-[32px] p-7 transition-all duration-500 transform flex flex-col justify-between relative overflow-hidden select-none ${
                  isActive
                    ? 'bg-gradient-to-br from-emerald-500/10 via-emerald-50/70 to-amber-50/50 border-2 border-emerald-600/70 shadow-2xl shadow-emerald-900/15 -translate-y-2 scale-[1.02]'
                    : 'bg-white/90 backdrop-blur-md border border-emerald-900/10 shadow-lg shadow-emerald-950/5 hover:border-emerald-600/40 hover:-translate-y-1'
                }`}
              >
                {/* Top Shimmer / Accent Bar */}
                <div 
                  className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-800 via-amber-400 to-emerald-600 transition-all duration-500 ${
                    isActive ? 'opacity-100' : 'opacity-40 group-hover:opacity-80'
                  }`} 
                />

                <div>
                  {/* Card Badge & Icon Row */}
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl ${item.iconBg} flex items-center justify-center font-bold shadow-md shadow-emerald-900/10 transform transition-transform duration-500 ${
                      isActive ? 'scale-110 rotate-3' : 'group-hover:scale-105'
                    }`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] font-black tracking-wider uppercase bg-gradient-to-r from-emerald-900 to-emerald-950 text-amber-300 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-emerald-700/50">
                      <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400 animate-pulse" />
                      {item.badge}
                    </span>
                  </div>

                  {/* Feature Title */}
                  <h3 className={`text-xl font-serif font-bold mb-2 transition-colors duration-300 leading-snug ${
                    isActive ? 'text-emerald-950 font-black' : 'text-neutral-900 group-hover:text-emerald-800'
                  }`}>
                    {item.title}
                  </h3>

                  {/* Feature Description */}
                  <p className="text-xs text-neutral-600 leading-relaxed mb-6">
                    {item.desc}
                  </p>

                  {/* Live Stat Preview Box */}
                  <div className={`border rounded-2xl p-3.5 mb-6 flex justify-between items-center transition-colors ${
                    isActive ? 'bg-white/90 border-emerald-300 shadow-xs' : 'bg-stone-50/90 border-stone-200/90 group-hover:border-emerald-200'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-2.5 w-2.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                      </span>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-neutral-400">{item.statLabel}</div>
                        <div className="text-xs font-black text-emerald-900 mt-0.5">{item.stat}</div>
                      </div>
                    </div>
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  </div>
                </div>

                {/* Bottom Action Trigger Link */}
                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs font-extrabold text-emerald-800">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
                    <span>{item.actionText}</span>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${
                    isActive ? 'bg-emerald-950 scale-110 text-amber-300' : 'bg-emerald-800 text-white group-hover:bg-emerald-900 group-hover:scale-105'
                  }`}>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>

      {/* Direct Play Store Download Modal */}
      <PlayStoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        featureTitle={modalTitle}
        featureDescription={modalDesc}
      />
    </section>
  );
};
