import React, { useState } from 'react';
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

  return (
    <section id="care-suite" className="py-16 md:py-24 bg-gradient-to-b from-stone-50 via-emerald-50/40 to-background border-y border-border relative overflow-hidden">
      {/* Subtle Background Glow Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <Container className="relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/10 border border-emerald-900/20 text-emerald-900 text-xs font-extrabold uppercase tracking-wider backdrop-blur-md shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
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
            className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-emerald-800 via-emerald-900 to-emerald-950 hover:from-emerald-900 hover:to-emerald-950 px-6 py-4 rounded-2xl shadow-xl shadow-emerald-900/20 hover:shadow-2xl hover:shadow-emerald-900/30 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 group border border-emerald-700/50"
          >
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>Download App on Google Play</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform text-amber-400" />
          </button>
        </div>

        {/* Ultra Premium Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {careFeatures.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => openAppModal(item.title, item.featureDetails)}
                className="group cursor-pointer h-full bg-white/80 backdrop-blur-md rounded-[32px] p-7 border border-emerald-900/10 hover:border-emerald-600/40 shadow-lg shadow-emerald-950/5 hover:shadow-2xl hover:shadow-emerald-900/15 transition-all duration-500 transform hover:-translate-y-1.5 flex flex-col justify-between relative overflow-hidden"
              >
                {/* Top Subtle Metallic Shimmer */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-800 via-amber-400 to-emerald-600 opacity-80 group-hover:opacity-100 transition-opacity" />

                <div>
                  {/* Card Badge & Icon Row */}
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl ${item.iconBg} flex items-center justify-center font-bold shadow-md shadow-emerald-900/10 transform group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] font-black tracking-wider uppercase bg-gradient-to-r from-emerald-900 to-emerald-950 text-amber-300 px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm border border-emerald-700/50">
                      <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
                      {item.badge}
                    </span>
                  </div>

                  {/* Feature Title */}
                  <h3 className="text-xl font-serif font-bold text-neutral-900 mb-2 group-hover:text-emerald-800 transition-colors leading-snug">
                    {item.title}
                  </h3>

                  {/* Feature Description */}
                  <p className="text-xs text-neutral-600 leading-relaxed mb-6">
                    {item.desc}
                  </p>

                  {/* Live Stat Preview Box */}
                  <div className="bg-stone-50/80 border border-stone-200/80 rounded-2xl p-3.5 mb-6 flex justify-between items-center">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-neutral-400">{item.statLabel}</div>
                      <div className="text-xs font-black text-emerald-900 mt-0.5">{item.stat}</div>
                    </div>
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  </div>
                </div>

                {/* Bottom Action Trigger Link */}
                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs font-extrabold text-emerald-800">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{item.actionText}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center shadow-md group-hover:bg-emerald-900 group-hover:scale-110 transition-all">
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
