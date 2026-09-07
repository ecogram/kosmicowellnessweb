import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { 
  Activity, Sun, Moon, Sunset, Sunrise, Watch, Plus, Droplets, 
  Camera, Users, CheckCircle2, Smartphone, Download 
} from 'lucide-react';
import { PlayStoreModal } from '../components/ui/PlayStoreModal';

export const CarePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'today';

  const [timeOfDay, setTimeOfDay] = useState<'dawn' | 'day' | 'dusk' | 'night'>('day');
  const [hydration] = useState(750); // ml
  const [isBleModalOpen, setIsBleModalOpen] = useState(true); // Open by default or on card click
  const [modalTitle, setModalTitle] = useState('Kosmico Mobile App Required');
  const [modalDesc, setModalDesc] = useState('To access and interact with live biometrics, smartwatch BLE sync, and AI food scanning, please download the Kosmico Mobile App on Google Play Store.');

  const openModalWithDetails = (title: string, desc: string) => {
    setModalTitle(title);
    setModalDesc(desc);
    setIsBleModalOpen(true);
  };

  return (
    <div className="py-10 md:py-16 bg-gradient-to-b from-stone-50 via-emerald-50/30 to-background min-h-screen relative">
      <Container>
        
        {/* Top Luxury App Banner Notice */}
        <div className="mb-8 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-emerald-700/50 relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300 border border-white/20 shadow-md">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="font-serif font-bold text-base text-amber-300">Kosmico Mobile App Premium Health Suite</div>
              <div className="text-xs text-emerald-100/90 mt-0.5">Preview live biometrics below • Click any feature card to get the App on Google Play</div>
            </div>
          </div>
          <button
            onClick={() => openModalWithDetails('Download Kosmico Mobile App', 'Get instant access to live Bluetooth smartwatch biometrics, AI food scanning, and glucose trend tracking.')}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-400/20 hover:shadow-amber-400/30 transition-all flex items-center gap-2 relative z-10 active:scale-95"
          >
            <Download className="w-4 h-4 text-neutral-950" />
            <span>Get App on Google Play</span>
          </button>
        </div>

        {/* Header Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/10 text-emerald-900 text-xs font-extrabold uppercase tracking-wider mb-2 border border-emerald-900/20">
              <Activity className="w-3.5 h-3.5 text-amber-500" />
              <span>GlucoRhythm Dashboard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-neutral-900">
              Diabetes &amp; Health Management Partner
            </h1>
          </div>

          {/* App Device Pair Action */}
          <button
            onClick={() => openModalWithDetails('Pair BLE Smartwatch & Sensors', 'Bluetooth LE smartwatch biometrics and continuous glucose monitors require native Android sensors available on the Kosmico Mobile App.')}
            className="px-6 py-3.5 bg-emerald-900 hover:bg-emerald-950 text-white font-bold text-xs rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 border border-emerald-700/50 active:scale-95"
          >
            <Watch className="w-4 h-4 text-amber-400" />
            <span>Pair BLE Smartwatch</span>
          </button>
        </div>

        {/* Sub-Navigation Tabs matching App */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {[
            { id: 'today', label: 'Today Dashboard', icon: Activity },
            { id: 'scan', label: 'Plate AI Scan', icon: Camera },
            { id: 'community', label: 'Care Community', icon: Users },
            { id: 'devices', label: 'Device Sync (BLE)', icon: Watch },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSearchParams({ tab: tab.id });
                  openModalWithDetails(`Access ${tab.label}`, `To use ${tab.label} feature, please download the Kosmico Mobile App on Google Play Store.`);
                }}
                className={`px-5 py-3 rounded-2xl text-xs font-extrabold flex items-center gap-2.5 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-900 to-emerald-950 text-white shadow-lg shadow-emerald-950/20'
                    : 'bg-white text-neutral-700 hover:bg-emerald-800/10 border border-border shadow-2xs'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-emerald-800'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: TODAY DASHBOARD */}
        {activeTab === 'today' && (
          <div className="space-y-8">
            
            {/* Time of Day Selector */}
            <div className="flex justify-center">
              <div className="inline-flex bg-white p-1.5 rounded-2xl border border-border gap-1.5 shadow-sm">
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
                      onClick={() => {
                        setTimeOfDay(item.id as any);
                        openModalWithDetails('Time-of-Day Filter Log', 'Daily glucose logging and time-of-day history sync requires the Kosmico Mobile App.');
                      }}
                      className={`px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                        isSelected
                          ? 'bg-emerald-900 text-white shadow-sm'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : ''}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ultra Luxury Live Biometrics & CGM Sync Card */}
            <div
              onClick={() => openModalWithDetails('Smartwatch & CGM Biometrics', 'Live Bluetooth LE biometrics and continuous glucose sync requires the Kosmico Mobile App on Google Play.')}
              className="cursor-pointer bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-[32px] p-7 md:p-8 shadow-2xl relative overflow-hidden group hover:border-amber-400/50 border border-emerald-700/50 transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-5 mb-6">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-serif font-bold text-base text-amber-300">Hardware &amp; CGM Sync</span>
                  </div>
                  <p className="text-xs text-emerald-100/80 mt-1">Live biometrics monitoring active via Bluetooth LE</p>
                </div>
                <button
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-amber-300 transition-colors flex items-center gap-1.5"
                >
                  <Watch className="w-4 h-4 text-amber-400" />
                  <span>Sync Smartwatch</span>
                </button>
              </div>

              {/* Vitals Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 space-y-1">
                  <div className="text-[10px] uppercase font-extrabold text-emerald-200">Glucose</div>
                  <div className="text-2xl sm:text-3xl font-black text-white">112 <span className="text-xs font-normal">mg/dL</span></div>
                  <div className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Steady &amp; Stable
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 space-y-1">
                  <div className="text-[10px] uppercase font-extrabold text-emerald-200">Blood Pressure</div>
                  <div className="text-2xl sm:text-3xl font-black text-white">118/76</div>
                  <div className="text-[10px] text-emerald-300 font-semibold">Optimal Range</div>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 space-y-1">
                  <div className="text-[10px] uppercase font-extrabold text-emerald-200">Heart Rate</div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-300">74 <span className="text-xs font-normal">BPM</span></div>
                  <div className="text-[10px] text-amber-200 font-semibold">HRV 52ms</div>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 space-y-1">
                  <div className="text-[10px] uppercase font-extrabold text-emerald-200">SpO2 Oxygen</div>
                  <div className="text-2xl sm:text-3xl font-black text-white">98%</div>
                  <div className="text-[10px] text-emerald-300 font-semibold">Optimal</div>
                </div>
              </div>
            </div>

            {/* Continuous Glucose Waveform Section */}
            <div
              onClick={() => openModalWithDetails('Continuous Glucose Waveform', 'Continuous 24-hour glucose trend monitoring requires native CGM sensor integration on the Kosmico Mobile App.')}
              className="cursor-pointer bg-white rounded-[32px] p-7 md:p-8 border border-border shadow-lg hover:border-emerald-800/40 transition-all"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-serif font-bold text-xl text-neutral-900">Continuous Glucose Waveform</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Target Range: 70 - 180 mg/dL (ADA Standard)</p>
                </div>
                <span className="px-4 py-1.5 bg-emerald-100 text-emerald-900 font-extrabold text-xs rounded-full border border-emerald-800/20">
                  112 mg/dL Current
                </span>
              </div>

              {/* Simulated Waveform Visual */}
              <div className="h-48 w-full bg-stone-50/80 rounded-2xl p-4 border border-border relative flex items-end justify-between overflow-hidden">
                <svg className="absolute inset-0 w-full h-full p-4" preserveAspectRatio="none" viewBox="0 0 400 100">
                  <defs>
                    <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#059669" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#059669" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <rect x="0" y="20" width="400" height="60" fill="#ecfdf5" opacity="0.8" />
                  <line x1="0" y1="20" x2="400" y2="20" stroke="#a7f3d0" strokeDasharray="4 4" />
                  <line x1="0" y1="80" x2="400" y2="80" stroke="#a7f3d0" strokeDasharray="4 4" />
                  <path
                    d="M 0 50 Q 50 30, 100 55 T 200 45 T 300 40 T 400 48"
                    fill="none"
                    stroke="#047857"
                    strokeWidth="3.5"
                  />
                  <path
                    d="M 0 50 Q 50 30, 100 55 T 200 45 T 300 40 T 400 48 L 400 100 L 0 100 Z"
                    fill="url(#waveGradient)"
                  />
                </svg>
              </div>

              {/* Stats Meters Grid */}
              <div className="grid grid-cols-3 gap-4 mt-6 text-center">
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
                  <div className="text-2xl font-black text-emerald-800">82%</div>
                  <div className="text-xs font-bold text-neutral-600 mt-0.5">Time in Range</div>
                </div>
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
                  <div className="text-2xl font-black text-amber-600">5.8%</div>
                  <div className="text-xs font-bold text-neutral-600 mt-0.5">Est. A1C</div>
                </div>
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
                  <div className="text-2xl font-black text-emerald-900">112</div>
                  <div className="text-xs font-bold text-neutral-600 mt-0.5">Avg Glucose</div>
                </div>
              </div>
            </div>

            {/* Lifestyle Trackers (Water, Stress, Energy) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Hydration Tracker */}
              <div
                onClick={() => openModalWithDetails('Hydration Tracker Log', 'Daily water tracking history and push reminders require the Kosmico Mobile App.')}
                className="cursor-pointer bg-white rounded-[32px] p-7 border border-border shadow-md hover:border-blue-400/50 transition-all space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Droplets className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-base text-neutral-900">Hydration Tracker</h4>
                      <p className="text-xs text-neutral-500">{hydration} / 2000 ml</p>
                    </div>
                  </div>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+250ml</span>
                  </button>
                </div>

                <div className="w-full bg-neutral-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all duration-500"
                    style={{ width: `${Math.min((hydration / 2000) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Stress & Energy Selector */}
              <div
                onClick={() => openModalWithDetails('Mood & Energy Logger', 'Log stress levels, energy scores, and supplement reminders on the Kosmico Mobile App.')}
                className="cursor-pointer bg-white rounded-[32px] p-7 border border-border shadow-md space-y-4 hover:border-emerald-800/40 transition-all"
              >
                <h4 className="font-serif font-bold text-base text-neutral-900">Log How You Feel</h4>
                
                <div>
                  <label className="text-xs text-neutral-600 font-semibold mb-1.5 block">Stress Level</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <button
                        key={lvl}
                        className="flex-1 py-2.5 rounded-xl text-xs font-extrabold bg-stone-50 text-neutral-700 border border-stone-200"
                      >
                        Lvl {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-neutral-600 font-semibold mb-1.5 block">Energy Level</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <button
                        key={lvl}
                        className="flex-1 py-2.5 rounded-xl text-xs font-extrabold bg-stone-50 text-neutral-700 border border-stone-200"
                      >
                        {lvl}⚡
                      </button>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 2: PLATE AI SCAN */}
        {activeTab === 'scan' && (
          <div
            onClick={() => openModalWithDetails('Plate AI Meal Scanner', 'Camera AI meal scanning and instant Glycemic Index analysis requires the Kosmico Mobile App on Google Play.')}
            className="cursor-pointer bg-white rounded-[32px] p-8 border border-border shadow-lg max-w-2xl mx-auto space-y-6 hover:border-emerald-800/50 transition-all"
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-emerald-800/10 text-emerald-800 mx-auto flex items-center justify-center font-bold">
                <Camera className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-neutral-900">Plate AI Meal Scanner</h2>
              <p className="text-xs text-neutral-600 max-w-md mx-auto leading-relaxed">
                Upload or capture a food photo to estimate calories, net carbs, and glycemic impact using Gemini AI Vision.
              </p>
            </div>

            <div className="border-2 border-dashed border-emerald-800/30 bg-stone-50/80 rounded-3xl p-8 text-center relative">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center">
                  <Plus className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-neutral-800">Tap to Open App Camera Scanner</div>
                <p className="text-xs text-neutral-500">Requires Kosmico Mobile App for instant AI scan</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CARE COMMUNITY */}
        {activeTab === 'community' && (
          <div
            onClick={() => openModalWithDetails('Care Community & SOS Network', 'Joining doctor SOS emergency groups and peer keto circles requires the Kosmico Mobile App.')}
            className="cursor-pointer bg-white rounded-[32px] p-8 border border-border shadow-lg max-w-3xl mx-auto space-y-6 hover:border-emerald-800/50 transition-all"
          >
            <div className="flex justify-between items-center border-b border-border pb-4">
              <div>
                <h2 className="text-xl font-bold font-serif text-neutral-900">Kosmico Care Network &amp; Community</h2>
                <p className="text-xs text-neutral-500">Connect with peer health groups &amp; family care circles</p>
              </div>
              <button
                className="px-4 py-2 bg-emerald-900 text-white font-bold text-xs rounded-xl hover:bg-emerald-950"
              >
                Join Doctor SOS Group
              </button>
            </div>

            <div className="space-y-4">
              {[
                { name: 'Dr. Priya Sharma', role: 'Endocrinologist Care', text: 'Tip of the day: Replacing refined sugar with pure monk fruit keeps your glycemic response flat throughout the day.' },
                { name: 'Rohan Mehta', role: 'Keto Community', text: 'Logged 10,000 steps today and kept my sugar level strictly at 105 mg/dL. Feel super energetic!' }
              ].map((post, idx) => (
                <div key={idx} className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-900 text-white flex items-center justify-center font-bold text-sm">
                      {post.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-neutral-900">{post.name}</div>
                      <div className="text-[10px] text-emerald-800 font-semibold">{post.role}</div>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-700 leading-relaxed">{post.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </Container>

      {/* Play Store Download Modal */}
      <PlayStoreModal
        isOpen={isBleModalOpen}
        onClose={() => setIsBleModalOpen(false)}
        featureTitle={modalTitle}
        featureDescription={modalDesc}
      />
    </div>
  );
};
