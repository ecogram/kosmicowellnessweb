import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { 
  Sun, Moon, Sunset, Sunrise, Watch, Droplets, 
  CheckCircle2, Smartphone, 
  Lock, Download, Sparkles
} from 'lucide-react';
import { PlayStoreModal } from '../components/ui/PlayStoreModal';
import { PLAY_STORE_URL } from '../utils/constants';

export const CarePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'today';

  const [timeOfDay, setTimeOfDay] = useState<'dawn' | 'day' | 'dusk' | 'night'>('day');
  const [hydration] = useState(750); // ml display preview
  const [selectedStress] = useState<number | null>(null);
  const [selectedEnergy] = useState<number | null>(null);

  // Play Store promotion modal
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Mobile App Exclusive Feature');
  const [modalDesc, setModalDesc] = useState('Access live BLE sync, AI food vision, and real-time health tracking on the Kosmico Mobile App on Google Play Store.');

  const openAppStoreModal = (title: string, desc: string) => {
    setModalTitle(title);
    setModalDesc(desc);
    setIsStoreModalOpen(true);
  };

  const handleTabChange = (tabId: string) => {
    if (tabId !== 'today') {
      const titles: Record<string, { title: string; desc: string }> = {
        community: {
          title: 'Kosmico Community & Social',
          desc: 'Posting recipes, milestones and connecting with wellness buddies is exclusively available on the Kosmico Mobile App.',
        },
        scan: {
          title: 'AI Camera Plate Scanner',
          desc: 'Real-time AI camera plate food scanning and carb analysis is exclusively available on the Kosmico Mobile App on Google Play.',
        },
        log: {
          title: 'Daily Glucose & Insulin Logger',
          desc: 'Direct biometric sync and clinical diabetes logging is exclusively available on the Kosmico Mobile App.',
        },
        network: {
          title: 'Care Network & SOS Emergency Alert',
          desc: 'Emergency SOS alerts, doctor network and caregiver sync are exclusively available on the Kosmico Mobile App.',
        },
      };

      const feature = titles[tabId] || {
        title: 'Mobile App Exclusive Feature',
        desc: 'Please download the Kosmico Mobile App on Google Play Store to use this feature.',
      };

      openAppStoreModal(feature.title, feature.desc);
      return;
    }
    setSearchParams({ tab: tabId });
  };

  return (
    <div className="py-8 md:py-14 bg-gradient-to-b from-[#eef9f2] via-stone-50 to-[#eef9f2] min-h-screen relative">
      <Container className="max-w-4xl">
        
        {/* Top App Update / Mobile App Banner Notice */}
        <div className="mb-6 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-3xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 border border-emerald-700/50">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300 border border-white/20 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="font-serif font-bold text-sm text-amber-300 flex items-center gap-2">
                <span>Kosmico GlucoRhythm &amp; Care Suite</span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-sans">App Exclusive</span>
              </div>
              <div className="text-xs text-emerald-100/90 mt-0.5">Your Clinical Diabetes &amp; Wellness Management Partner</div>
            </div>
          </div>
          <button
            onClick={() => openAppStoreModal('Bluetooth Smartwatch & CGM Sync', 'Pairing smartwatches (Samsung, Apple, Noise, boAt) and CGM monitors requires the Kosmico Mobile App on Google Play.')}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-neutral-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95 shrink-0 cursor-pointer"
          >
            <Watch className="w-3.5 h-3.5 text-neutral-950" />
            <span>Devices &amp; BLE Sync</span>
          </button>
        </div>

        {/* Header Title Matching App */}
        <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#14532d]">
                GlucoRhythm
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <Lock className="w-3 h-3" /> App View
              </span>
            </div>
            <p className="text-xs text-neutral-600 mt-0.5">
              Your Diabetes Management Partner (Preview Dashboard)
            </p>
          </div>

          <button
            onClick={() => openAppStoreModal('Smartwatch & CGM Devices', 'Connect your smartwatches and CGMs via Bluetooth on the Kosmico Mobile App.')}
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#16a34a] border border-[#16a34a]/30 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Watch className="w-4 h-4" />
            <span>Devices</span>
          </button>
        </div>

        {/* 5 Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {[
            { id: 'today', label: 'Today', isAppOnly: false },
            { id: 'community', label: 'Community', isAppOnly: true },
            { id: 'scan', label: 'Scan Meal', isAppOnly: true },
            { id: 'log', label: 'Log Entry', isAppOnly: true },
            { id: 'network', label: 'Care Network', isAppOnly: true },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#16a34a] text-white shadow-md'
                    : 'bg-white text-neutral-700 hover:bg-emerald-50 border border-neutral-200'
                }`}
              >
                <span>{tab.label}</span>
                {tab.isAppOnly && (
                  <span className="text-[10px] opacity-75 font-normal">📱</span>
                )}
              </button>
            );
          })}
        </div>

        {/* ================= TAB 1: TODAY ================= */}
        {activeTab === 'today' && (
          <div className="space-y-6">
            
            {/* Time of Day Selector */}
            <div className="flex justify-between items-center bg-white p-2 rounded-2xl border border-neutral-200 shadow-xs max-w-md mx-auto">
              {[
                { id: 'dawn', label: 'Dawn', icon: Sunrise },
                { id: 'day', label: 'Day', icon: Sun },
                { id: 'dusk', label: 'Dusk', icon: Sunset },
                { id: 'night', label: 'Night', icon: Moon },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = timeOfDay === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTimeOfDay(item.id as any)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#16a34a] text-white shadow-xs'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Hardware & CGM Sync Strip */}
            <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-2xl p-4 sm:p-5 shadow-md border border-emerald-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Hardware &amp; CGM Sync</span>
                </div>
                <div className="text-emerald-100/90 text-[11px] flex flex-wrap gap-2">
                  <span>Live: <strong className="text-white">112 mg/dL</strong> (Steady &amp; Stable)</span>
                  <span>•</span>
                  <span>BP: <strong className="text-white">118/76 mmHg</strong></span>
                  <span>•</span>
                  <span><strong className="text-white">74 BPM</strong></span>
                  <span>•</span>
                  <span><strong className="text-white">98% SpO2</strong></span>
                </div>
              </div>
              <button
                onClick={() => openAppStoreModal('Pair Smartwatch / CGM', 'Hardware pairing with Dexcom, Abbott, Apple Watch & Samsung Galaxy Watch requires the Kosmico Mobile App on Google Play.')}
                className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-xl text-xs transition-colors shrink-0 cursor-pointer"
              >
                Pair on App
              </button>
            </div>

            {/* 4 Vitals Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div 
                onClick={() => openAppStoreModal('Continuous Glucose Monitor (CGM)', 'Live minute-by-minute glucose streaming is active on the Kosmico Mobile App.')}
                className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-3.5 space-y-1 cursor-pointer hover:border-emerald-500 transition-all hover:scale-[1.02]"
              >
                <div className="text-lg font-black text-[#14532d]">112 mg/dL</div>
                <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Steady &amp; Stable
                </div>
              </div>

              <div 
                onClick={() => openAppStoreModal('Blood Pressure Sync', 'Optical BP vitals sync requires the Kosmico Mobile App.')}
                className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-3.5 space-y-1 cursor-pointer hover:border-emerald-500 transition-all hover:scale-[1.02]"
              >
                <div className="text-lg font-black text-[#14532d]">118/76</div>
                <div className="text-[10px] text-emerald-700 font-bold">Optimal Normal</div>
              </div>

              <div 
                onClick={() => openAppStoreModal('Heart Rate & HRV', 'Live heart rate pulse sync is available on the Kosmico Mobile App.')}
                className="bg-[#fdf2f8] border border-[#fbcfe8] rounded-2xl p-3.5 space-y-1 cursor-pointer hover:border-pink-400 transition-all hover:scale-[1.02]"
              >
                <div className="text-lg font-black text-pink-900">74 BPM</div>
                <div className="text-[10px] text-pink-700 font-bold">HRV 52ms</div>
              </div>

              <div 
                onClick={() => openAppStoreModal('SpO2 Blood Oxygen', 'Continuous blood oxygen saturation is available on the Kosmico Mobile App.')}
                className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-3.5 space-y-1 cursor-pointer hover:border-emerald-500 transition-all hover:scale-[1.02]"
              >
                <div className="text-lg font-black text-[#14532d]">98%</div>
                <div className="text-[10px] text-emerald-700 font-bold">Optimal</div>
              </div>
            </div>

            {/* Continuous Glucose Waveform Section */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-serif font-bold text-base text-neutral-900">
                    Continuous Glucose Waveform <span className="text-xs text-neutral-500 font-normal">({timeOfDay.toUpperCase()})</span>
                  </h3>
                  <p className="text-[11px] text-neutral-500">Target: 70 - 180 mg/dL (ADA Standard)</p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-[#16a34a] font-bold text-xs rounded-full border border-emerald-200">
                  112 mg/dL &rarr;
                </span>
              </div>

              {/* Waveform Line Visual */}
              <div className="h-36 w-full bg-[#f8fafc] rounded-2xl p-3 border border-neutral-200 relative flex items-end justify-between overflow-hidden">
                <svg className="absolute inset-0 w-full h-full p-2" preserveAspectRatio="none" viewBox="0 0 400 100">
                  <defs>
                    <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#16a34a" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <rect x="0" y="20" width="400" height="60" fill="#ecfdf5" opacity="0.6" />
                  <line x1="0" y1="20" x2="400" y2="20" stroke="#86efac" strokeDasharray="3 3" />
                  <line x1="0" y1="80" x2="400" y2="80" stroke="#86efac" strokeDasharray="3 3" />
                  <path
                    d="M 0 50 Q 50 30, 100 55 T 200 45 T 300 40 T 400 48"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="3"
                  />
                  <path
                    d="M 0 50 Q 50 30, 100 55 T 200 45 T 300 40 T 400 48 L 400 100 L 0 100 Z"
                    fill="url(#waveGradient)"
                  />
                </svg>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200">
                  <div className="text-xl font-black text-[#16a34a]">82%</div>
                  <div className="text-[10px] font-bold text-neutral-600 mt-0.5">Time in Range</div>
                </div>
                <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200">
                  <div className="text-xl font-black text-amber-600">5.8%</div>
                  <div className="text-[10px] font-bold text-neutral-600 mt-0.5">Est. A1C</div>
                </div>
                <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200">
                  <div className="text-xl font-black text-neutral-900">112</div>
                  <div className="text-[10px] font-bold text-neutral-600 mt-0.5">Avg Glucose</div>
                </div>
              </div>
            </div>

            {/* Lifestyle Trackers (Hydration, Stress, Energy) */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-sm space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="font-serif font-bold text-base text-neutral-900">Lifestyle Trackers</h3>
                <span 
                  onClick={() => openAppStoreModal('Clinical Biomarkers', 'Track and correlate glycemic response with hydration, sleep, stress and meal timing on the Kosmico Mobile App.')}
                  className="text-xs text-[#16a34a] font-bold cursor-pointer hover:underline"
                >
                  Why this?
                </span>
              </div>

              {/* Hydration */}
              <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-xs font-bold text-neutral-900">Hydration</div>
                      <div className="text-[10px] text-neutral-500">{hydration} / 2500 ml</div>
                    </div>
                  </div>
                  <button
                    onClick={() => openAppStoreModal('Hydration & Water Logger', 'Logging water intake and hydration alarms is available on the Kosmico Mobile App.')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    +250ml
                  </button>
                </div>
                <div className="w-full bg-blue-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${Math.min((hydration / 2500) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Stress & Energy Emojis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-3.5">
                  <div className="text-xs font-bold text-neutral-900 mb-1">Stress Level</div>
                  <div className="text-[10px] text-neutral-500 mb-2">
                    {selectedStress !== null ? `Logged: Level ${selectedStress + 1}` : 'Not logged • Tap to log on App'}
                  </div>
                  <div className="flex justify-between text-xl">
                    {['😢', '😐', '🙂', '😌'].map((emoji, idx) => (
                      <button
                        key={idx}
                        onClick={() => openAppStoreModal('Stress Biomarker Logger', 'Correlate stress cortisol levels with glucose spikes on the Kosmico Mobile App.')}
                        className="p-1.5 rounded-xl transition-all hover:scale-110 cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-3.5">
                  <div className="text-xs font-bold text-neutral-900 mb-1">Energy Level</div>
                  <div className="text-[10px] text-neutral-500 mb-2">
                    {selectedEnergy !== null ? `Logged: Level ${selectedEnergy + 1}` : 'Tap to log how you feel'}
                  </div>
                  <div className="flex justify-between text-xl">
                    {['😴', '😐', '⚡', '🔥'].map((emoji, idx) => (
                      <button
                        key={idx}
                        onClick={() => openAppStoreModal('Energy & Fatigue Tracker', 'Track energy levels throughout the day on the Kosmico Mobile App.')}
                        className="p-1.5 rounded-xl transition-all hover:scale-110 cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Meal & Medication Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div 
                  onClick={() => openAppStoreModal('Meal Markers', 'Log meals and photograph food plates on the Kosmico Mobile App.')}
                  className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600 cursor-pointer hover:bg-emerald-50/50"
                >
                  <strong className="block text-neutral-800 font-bold mb-0.5">Meal Markers</strong>
                  No meals logged for {timeOfDay} • Tap to log
                </div>
                <div 
                  onClick={() => openAppStoreModal('Medication & Insulin Schedule', 'Schedule and track insulin dosage and metformin reminders on the Kosmico Mobile App.')}
                  className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600 cursor-pointer hover:bg-emerald-50/50"
                >
                  <strong className="block text-neutral-800 font-bold mb-0.5">Medication &amp; Insulin</strong>
                  No medication logged today • Tap to log
                </div>
              </div>

              {/* App Promotion Banner at Bottom of Dashboard */}
              <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-2xl border border-emerald-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
                  <p className="text-xs text-emerald-950 font-medium">
                    Want to log readings, sync your smartwatch or scan food plates?
                  </p>
                </div>
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Get App</span>
                </a>
              </div>

            </div>

          </div>
        )}

      </Container>

      {/* Play Store Modal Popup */}
      <PlayStoreModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        featureTitle={modalTitle}
        featureDescription={modalDesc}
      />
    </div>
  );
};
