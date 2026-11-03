import React, { useState, useEffect, useRef } from 'react';
import { Container } from '../../components/ui/Container';
import { Camera, Watch, BookOpen, Users, Sparkles, ArrowRight, Smartphone, Activity, Footprints, ShieldCheck, Zap, ChevronLeft, ChevronRight, Heart, Leaf } from 'lucide-react';
import { PlayStoreModal } from '../../components/ui/PlayStoreModal';

/* ─── Tiny CSS injected once ─────────────────────────────────────── */
const HUB_STYLES = `
@keyframes hub-pulse-ring {
  0%   { transform: scale(1);   opacity: 0.7; }
  50%  { transform: scale(1.08); opacity: 0.3; }
  100% { transform: scale(1);   opacity: 0.7; }
}
@keyframes hub-float {
  0%,100% { transform: translateY(0px); }
  50%      { transform: translateY(-8px); }
}
@keyframes dot-travel-right {
  0%   { left: 0%;   opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { left: 100%; opacity: 0; }
}
@keyframes dot-travel-left {
  0%   { right: 0%;   opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { right: 100%; opacity: 0; }
}
@keyframes dot-travel-down {
  0%   { top: 0%;   opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { top: 100%;  opacity: 0; }
}
@keyframes dot-travel-up {
  0%   { bottom: 0%;   opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { bottom: 100%; opacity: 0; }
}
@keyframes line-draw-h {
  from { width: 0%; }
  to   { width: 100%; }
}
@keyframes line-draw-v {
  from { height: 0%; }
  to   { height: 100%; }
}
@keyframes card-fade-in {
  from { opacity: 0; transform: translateY(24px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)   scale(1); }
}
@keyframes hub-shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
@keyframes orb-drift {
  0%,100% { transform: translate(0,0); }
  33%      { transform: translate(20px,-15px); }
  66%      { transform: translate(-10px,20px); }
}
.hub-card-animate  { animation: card-fade-in 0.6s ease both; }
.hub-float-anim    { animation: hub-float 4s ease-in-out infinite; }
.hub-pulse-ring    { animation: hub-pulse-ring 2.5s ease-in-out infinite; }

/* travelling dots */
.dot-right { position:absolute; top:50%; transform:translateY(-50%);
             width:8px; height:8px; border-radius:50%; background:#16a34a;
             box-shadow:0 0 6px #16a34a; animation: dot-travel-right 2s linear infinite; }
.dot-left  { position:absolute; top:50%; transform:translateY(-50%);
             width:8px; height:8px; border-radius:50%; background:#16a34a;
             box-shadow:0 0 6px #16a34a; animation: dot-travel-left  2s linear infinite; }
.dot-down  { position:absolute; left:50%; transform:translateX(-50%);
             width:8px; height:8px; border-radius:50%; background:#16a34a;
             box-shadow:0 0 6px #16a34a; animation: dot-travel-down  2s linear infinite; }
.dot-up    { position:absolute; left:50%; transform:translateX(-50%);
             width:8px; height:8px; border-radius:50%; background:#16a34a;
             box-shadow:0 0 6px #16a34a; animation: dot-travel-up    2s linear infinite; }
`;

/* ─── Feature data ───────────────────────────────────────────────── */
const careFeatures = [
  {
    id: 'gluco', position: 'top' as const,
    title: 'GlucoRhythm Glucose Tracker',
    desc: 'Continuous Glucose Waveform (CGM), Time in Range (82%), Est A1C (5.8%), and real-time blood sugar trends.',
    badge: 'APP EXCLUSIVE', stat: '112 mg/dL', statLabel: 'Steady & Stable',
    icon: Activity, iconBg: 'bg-emerald-800 text-amber-300',
    actionText: 'Get App to Track Glucose',
    featureDetails: 'Requires Kosmico App for continuous CGM sensor sync & background alerts.',
    animDelay: '0s',
  },
  {
    id: 'scan', position: 'left' as const,
    title: 'Plate AI Meal Scanner',
    desc: 'AI Vision meal photo scanner estimating calories, net carbs, and Glycemic Index (GI) impact before your first bite.',
    badge: 'AI VISION SCAN', stat: 'Instant GI Analysis', statLabel: 'Gemini 1.5 Vision',
    icon: Camera, iconBg: 'bg-emerald-800 text-amber-300',
    actionText: 'Get App to Scan Meals',
    featureDetails: 'Requires Kosmico App camera integration & Gemini AI image recognition.',
    animDelay: '0.15s',
  },
  {
    id: 'ble', position: 'right' as const,
    title: 'Smartwatch BLE Sync',
    desc: 'Sync Bluetooth LE fitness bands to monitor heart rate (HRV 52ms), SpO2 oxygen, and real-time biometrics.',
    badge: 'LIVE BIOMETRICS', stat: '74 BPM • 98% SpO2', statLabel: 'Bluetooth LE Live',
    icon: Watch, iconBg: 'bg-amber-500 text-neutral-950',
    actionText: 'Get App for Smartwatch Sync',
    featureDetails: 'Requires native Bluetooth LE hardware sensors available on the Kosmico Mobile App.',
    animDelay: '0.3s',
  },
  {
    id: 'steps', position: 'bottom' as const,
    title: 'Footstep Counter',
    desc: 'Real-time step pedometer, active calorie burn tracking, smart hydration sync, and food vs burn balance.',
    badge: 'LIVE STEPS', stat: '6,420 Steps • 320 kcal', statLabel: 'Live Step Pedometer',
    icon: Footprints, iconBg: 'bg-amber-500 text-neutral-950',
    actionText: 'Get App to Track Steps',
    featureDetails: 'Requires native smartphone pedometer sensor & motion hardware on the Kosmico Mobile App.',
    animDelay: '0.45s',
  },
  // extra 2 for mobile carousel only
  {
    id: 'diary', position: 'bottom' as const,
    title: 'Health Diary & Water Log',
    desc: 'Track daily water intake (+250ml logger), stress levels, workout logs, energy scores, and supplement reminders.',
    badge: 'DAILY TRACKER', stat: '+250ml Hydration', statLabel: 'Water & Mood Log',
    icon: BookOpen, iconBg: 'bg-emerald-800 text-amber-300',
    actionText: 'Get App for Health Log',
    featureDetails: 'Requires Kosmico Mobile App for push notifications & daily log history.',
    animDelay: '0.55s',
  },
  {
    id: 'community', position: 'bottom' as const,
    title: 'Care Community & SOS',
    desc: 'Connect with peer health groups, doctor SOS support network, and share keto/diabetes friendly recipes.',
    badge: 'CARE NETWORK', stat: 'Doctor SOS Network', statLabel: 'Peer Circles & Recipes',
    icon: Users, iconBg: 'bg-emerald-800 text-amber-300',
    actionText: 'Get App for Care Network',
    featureDetails: 'Requires Kosmico Mobile App for family care circle sync & emergency doctor SOS.',
    animDelay: '0.65s',
  },
];

/* ─── Mini feature card (hub layout) ────────────────────────────── */
const HubFeatureCard: React.FC<{
  item: typeof careFeatures[0];
  isActive: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onClick: () => void;
  animDelay: string;
  visible: boolean;
}> = ({ item, isActive, onEnter, onLeave, onClick, animDelay, visible }) => {
  const Icon = item.icon;
  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
      style={{
        animationDelay: animDelay,
        opacity: visible ? undefined : 0,
        animationFillMode: 'both',
      }}
      className={`hub-card-animate group cursor-pointer rounded-3xl p-5 flex flex-col gap-3 transition-all duration-500 relative overflow-hidden select-none
        ${isActive
          ? 'bg-gradient-to-br from-emerald-50 via-white to-amber-50 border-2 border-emerald-600/60 shadow-2xl shadow-emerald-900/15 -translate-y-1 scale-[1.02]'
          : 'bg-white/90 backdrop-blur-md border border-emerald-900/10 shadow-lg hover:border-emerald-500/40 hover:-translate-y-1 hover:shadow-xl'
        }`}
    >
      {/* top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-700 via-amber-400 to-emerald-600 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-50 group-hover:opacity-90'}`} />

      {/* icon + badge */}
      <div className="flex items-center justify-between">
        <div className={`w-11 h-11 rounded-xl ${item.iconBg} flex items-center justify-center shadow-md transition-transform duration-300 ${isActive ? 'scale-110 rotate-3' : 'group-hover:scale-105'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-[9px] font-black tracking-wider uppercase bg-gradient-to-r from-emerald-900 to-emerald-950 text-amber-300 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-700/50">
          <Sparkles className="w-2.5 h-2.5 text-amber-400 fill-amber-400 animate-pulse" />
          {item.badge}
        </span>
      </div>

      {/* title + desc */}
      <div>
        <h3 className={`text-sm font-serif font-bold leading-snug mb-1 ${isActive ? 'text-emerald-950' : 'text-neutral-900 group-hover:text-emerald-800'}`}>
          {item.title}
        </h3>
        <p className="text-[11px] text-neutral-500 leading-relaxed line-clamp-2">{item.desc}</p>
      </div>

      {/* live stat */}
      <div className={`border rounded-xl p-2.5 flex justify-between items-center transition-colors ${isActive ? 'bg-white border-emerald-300' : 'bg-stone-50 border-stone-200 group-hover:border-emerald-200'}`}>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
          </span>
          <div>
            <div className="text-[9px] uppercase font-bold text-neutral-400">{item.statLabel}</div>
            <div className="text-[11px] font-black text-emerald-900">{item.stat}</div>
          </div>
        </div>
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
      </div>

      {/* action */}
      <div className="flex items-center justify-between text-[11px] font-extrabold text-emerald-800 pt-1 border-t border-neutral-100">
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-500 fill-amber-500 animate-pulse" />
          <span>{item.actionText}</span>
        </div>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow transition-all ${isActive ? 'bg-emerald-950 text-amber-300' : 'bg-emerald-800 text-white group-hover:bg-emerald-900'}`}>
          <ArrowRight className="w-3 h-3 text-amber-400" />
        </div>
      </div>
    </div>
  );
};

/* ─── Animated connection line ───────────────────────────────────── */
const ConnLine: React.FC<{
  dir: 'h' | 'v';
  delay?: string;
  visible: boolean;
  glowing?: boolean;
}> = ({ dir, delay = '0s', visible, glowing }) => {
  const base = 'bg-gradient-to-r from-emerald-500/30 via-emerald-400/60 to-emerald-500/30 rounded-full relative overflow-hidden';
  const glowCls = glowing ? 'shadow-[0_0_8px_2px_rgba(16,185,129,0.5)]' : '';

  if (dir === 'h') return (
    <div className={`w-full h-px ${base} ${glowCls}`} style={{ minWidth: 32 }}>
      {visible && (
        <>
          <div className="dot-right" style={{ animationDelay: delay }} />
          <div className="dot-right" style={{ animationDelay: `calc(${delay} + 0.7s)` }} />
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500/0 via-emerald-400 to-emerald-500/0 rounded-full"
            style={{ animation: `line-draw-h 0.8s ease both`, animationDelay: delay }}
          />
        </>
      )}
    </div>
  );

  return (
    <div className={`h-full w-px mx-auto ${base.replace('from-r', 'from-t')} ${glowCls}`} style={{ minHeight: 32 }}>
      {visible && (
        <>
          <div className="dot-down" style={{ animationDelay: delay }} />
          <div className="dot-down" style={{ animationDelay: `calc(${delay} + 0.7s)` }} />
          <div
            className="absolute inset-x-0 top-0 bg-gradient-to-b from-emerald-500/0 via-emerald-400 to-emerald-500/0 rounded-full"
            style={{ animation: `line-draw-v 0.8s ease both`, animationDelay: delay }}
          />
        </>
      )}
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────────── */
export const SmartCareSuite: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDesc, setModalDesc] = useState('');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeCycleIndex, setActiveCycleIndex] = useState<number>(0);
  const [hubVisible, setHubVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const openAppModal = (title: string, desc: string) => {
    setModalTitle(title); setModalDesc(desc); setIsModalOpen(true);
  };

  /* scroll trigger */
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setHubVisible(true); }, { threshold: 0.15 });
    if (hubRef.current) obs.observe(hubRef.current);
    return () => obs.disconnect();
  }, []);

  /* auto-cycle (desktop only) */
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;
    if (hoveredIndex !== null) return;
    const t = setInterval(() => setActiveCycleIndex(p => (p + 1) % 4), 3200);
    return () => clearInterval(t);
  }, [hoveredIndex]);

  /* 3-D tilt on mouse move over section */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width  - 0.5) * 6,
        y: ((e.clientY - rect.top)  / rect.height - 0.5) * -4,
      });
    };
    el.addEventListener('mousemove', handler);
    return () => el.removeEventListener('mousemove', handler);
  }, []);

  /* mobile swipe */
  const scrollToIndex = (idx: number) => {
    setActiveCycleIndex(idx);
    if (containerRef.current) {
      const card = containerRef.current.children[idx] as HTMLElement;
      if (card) {
        const tgt = card.offsetLeft - (containerRef.current.clientWidth - card.clientWidth) / 2;
        containerRef.current.scrollTo({ left: Math.max(0, tgt), behavior: 'smooth' });
      }
    }
  };
  const handleScroll = () => {
    if (!containerRef.current || window.innerWidth >= 768) return;
    const sl = containerRef.current.scrollLeft;
    const cw = containerRef.current.children[0]?.clientWidth || 1;
    const ni = Math.round(sl / cw);
    if (ni >= 0 && ni < careFeatures.length && ni !== activeCycleIndex) setActiveCycleIndex(ni);
  };
  const handlePrev = () => scrollToIndex((activeCycleIndex - 1 + careFeatures.length) % careFeatures.length);
  const handleNext = () => scrollToIndex((activeCycleIndex + 1) % careFeatures.length);

  const activeIndex = hoveredIndex !== null ? hoveredIndex : activeCycleIndex;

  /* hub card 3D style */
  const hubStyle = hubVisible
    ? { transform: `perspective(900px) rotateX(${mousePos.y}deg) rotateY(${mousePos.x}deg)` }
    : {};

  return (
    <section
      ref={sectionRef}
      id="care-suite"
      className="py-16 md:py-28 bg-gradient-to-b from-stone-50 via-emerald-50/40 to-background border-y border-border relative overflow-hidden"
    >
      {/* inject keyframe styles once */}
      <style>{HUB_STYLES}</style>

      {/* Background orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" style={{ animation: 'orb-drift 12s ease-in-out infinite' }} />
      <div className="absolute bottom-10 right-0 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-3xl pointer-events-none" style={{ animation: 'orb-drift 16s ease-in-out infinite reverse' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(16,185,129,0.05) 0%, transparent 70%)' }} />

      <Container className="relative z-10">
        {/* ── Section Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-16 gap-6">
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

        {/* ════════════════════════════════════════════════════════
            DESKTOP — 3-D Hub Layout  (hidden on mobile)
        ═══════════════════════════════════════════════════════ */}
        <div
          ref={hubRef}
          className="hidden md:block"
          style={{ transition: 'transform 0.1s ease-out', ...hubStyle }}
        >
          {/* ── Row 1: [empty] [TOP card] [empty] ── */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-0 mb-0">
            <div /> {/* left spacer */}

            {/* TOP card */}
            <div className="flex justify-center" style={{ minWidth: 280 }}>
              <div className="w-72">
                <HubFeatureCard
                  item={careFeatures[0]}
                  isActive={activeIndex === 0}
                  onEnter={() => setHoveredIndex(0)}
                  onLeave={() => setHoveredIndex(null)}
                  onClick={() => openAppModal(careFeatures[0].title, careFeatures[0].featureDetails)}
                  animDelay={careFeatures[0].animDelay}
                  visible={hubVisible}
                />
              </div>
            </div>

            <div /> {/* right spacer */}
          </div>

          {/* vertical line top → center */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-0">
            <div />
            <div className="flex justify-center" style={{ minWidth: 280 }}>
              <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                <div style={{ width: 2, height: '100%', position: 'relative' }}>
                  <ConnLine dir="v" delay="0.2s" visible={hubVisible} glowing={activeIndex === 0} />
                </div>
              </div>
            </div>
            <div />
          </div>

          {/* ── Row 2: [LEFT card] — [CENTER HUB] — [RIGHT card] ── */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-0">

            {/* LEFT card */}
            <div className="flex justify-end pr-0">
              <div className="w-72">
                <HubFeatureCard
                  item={careFeatures[1]}
                  isActive={activeIndex === 1}
                  onEnter={() => setHoveredIndex(1)}
                  onLeave={() => setHoveredIndex(null)}
                  onClick={() => openAppModal(careFeatures[1].title, careFeatures[1].featureDetails)}
                  animDelay={careFeatures[1].animDelay}
                  visible={hubVisible}
                />
              </div>
            </div>

            {/* horizontal line LEFT → center */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              <div style={{ width: 48, height: 2, position: 'relative', flexShrink: 0 }}>
                <ConnLine dir="h" delay="0.3s" visible={hubVisible} glowing={activeIndex === 1} />
              </div>

              {/* ══ CENTER HUB CARD ══ */}
              <div
                className={`relative flex-shrink-0 rounded-3xl border-2 p-7 flex flex-col items-center text-center gap-3
                  transition-all duration-700 cursor-default select-none
                  ${hubVisible ? 'hub-card-animate' : 'opacity-0'}
                  bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950
                  border-emerald-500/60 shadow-2xl shadow-emerald-900/40`}
                style={{ width: 240, minWidth: 240, animationDelay: '0.1s' }}
              >
                {/* outer glow ring */}
                <div
                  className="hub-pulse-ring absolute inset-0 rounded-3xl pointer-events-none"
                  style={{ boxShadow: '0 0 0 8px rgba(16,185,129,0.18), 0 0 0 20px rgba(16,185,129,0.07)' }}
                />
                {/* rotating ring */}
                <div
                  className="absolute inset-[-10px] rounded-[36px] pointer-events-none"
                  style={{
                    background: 'conic-gradient(from 0deg, transparent 70%, rgba(16,185,129,0.5) 100%)',
                    animation: 'hub-shimmer 3s linear infinite',
                    backgroundSize: '200% auto',
                  }}
                />

                {/* icon */}
                <div className="hub-float-anim w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-xl mb-1">
                  <Leaf className="w-8 h-8 text-emerald-300" />
                  <Heart className="w-4 h-4 text-amber-400 absolute -top-1 -right-1" />
                </div>

                {/* label */}
                <div>
                  <div className="text-[9px] font-black tracking-widest uppercase text-amber-400/80 mb-1">Connected Hub</div>
                  <h3 className="text-base font-serif font-black text-white leading-tight">Kosmico Health<br />&amp; Wellness</h3>
                </div>

                {/* pills */}
                <div className="flex flex-col gap-1.5 w-full mt-1">
                  {['6 Smart Features','AI Powered','100% Natural'].map(t => (
                    <div key={t} className="flex items-center gap-1.5 text-[10px] text-emerald-200 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      {t}
                    </div>
                  ))}
                </div>

                {/* bottom badge */}
                <div className="mt-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[9px] font-black text-amber-300 tracking-wider uppercase">
                  ✦ Wellness Ecosystem
                </div>
              </div>

              {/* horizontal line center → RIGHT */}
              <div style={{ width: 48, height: 2, position: 'relative', flexShrink: 0 }}>
                <ConnLine dir="h" delay="0.3s" visible={hubVisible} glowing={activeIndex === 2} />
              </div>
            </div>

            {/* RIGHT card */}
            <div className="flex justify-start pl-0">
              <div className="w-72">
                <HubFeatureCard
                  item={careFeatures[2]}
                  isActive={activeIndex === 2}
                  onEnter={() => setHoveredIndex(2)}
                  onLeave={() => setHoveredIndex(null)}
                  onClick={() => openAppModal(careFeatures[2].title, careFeatures[2].featureDetails)}
                  animDelay={careFeatures[2].animDelay}
                  visible={hubVisible}
                />
              </div>
            </div>
          </div>

          {/* vertical line center → bottom */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-0">
            <div />
            <div className="flex justify-center" style={{ minWidth: 240 }}>
              <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                <div style={{ width: 2, height: '100%', position: 'relative' }}>
                  <ConnLine dir="v" delay="0.5s" visible={hubVisible} glowing={activeIndex === 3} />
                </div>
              </div>
            </div>
            <div />
          </div>

          {/* ── Row 3: [empty] [BOTTOM card] [empty] ── */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-0">
            <div />
            <div className="flex justify-center" style={{ minWidth: 240 }}>
              <div className="w-72">
                <HubFeatureCard
                  item={careFeatures[3]}
                  isActive={activeIndex === 3}
                  onEnter={() => setHoveredIndex(3)}
                  onLeave={() => setHoveredIndex(null)}
                  onClick={() => openAppModal(careFeatures[3].title, careFeatures[3].featureDetails)}
                  animDelay={careFeatures[3].animDelay}
                  visible={hubVisible}
                />
              </div>
            </div>
            <div />
          </div>

          {/* ── Extra 2 cards below in a 2-col row ── */}
          <div className="mt-8 grid grid-cols-2 gap-6 max-w-2xl mx-auto">
            {careFeatures.slice(4).map((item, i) => (
              <HubFeatureCard
                key={item.id}
                item={item}
                isActive={activeIndex === 4 + i}
                onEnter={() => setHoveredIndex(4 + i)}
                onLeave={() => setHoveredIndex(null)}
                onClick={() => openAppModal(item.title, item.featureDetails)}
                animDelay={item.animDelay}
                visible={hubVisible}
              />
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            MOBILE — Swipe Carousel  (hidden on desktop)
        ═══════════════════════════════════════════════════════ */}
        <div className="md:hidden">
          {/* swipe nav */}
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Swipe features left / right</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={handlePrev} className="p-2 rounded-full bg-white border border-emerald-900/15 shadow-xs text-neutral-800 hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer" aria-label="Previous">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={handleNext} className="p-2 rounded-full bg-white border border-emerald-900/15 shadow-xs text-neutral-800 hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer" aria-label="Next">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {careFeatures.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeIndex === index;
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => { scrollToIndex(index); openAppModal(item.title, item.featureDetails); }}
                  className={`w-[85vw] sm:w-[75vw] max-w-[340px] shrink-0 snap-center group cursor-pointer rounded-[32px] p-7 transition-all duration-500 flex flex-col justify-between relative overflow-hidden select-none ${
                    isActive
                      ? 'bg-gradient-to-br from-emerald-500/10 via-emerald-50/70 to-amber-50/50 border-2 border-emerald-600/70 shadow-2xl -translate-y-2 scale-[1.02]'
                      : 'bg-white/90 backdrop-blur-md border border-emerald-900/10 shadow-lg hover:border-emerald-600/40 hover:-translate-y-1'
                  }`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-800 via-amber-400 to-emerald-600 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-40 group-hover:opacity-80'}`} />
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-14 h-14 rounded-2xl ${item.iconBg} flex items-center justify-center shadow-md transition-transform duration-500 ${isActive ? 'scale-110 rotate-3' : 'group-hover:scale-105'}`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <span className="text-[10px] font-black tracking-wider uppercase bg-gradient-to-r from-emerald-900 to-emerald-950 text-amber-300 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-emerald-700/50">
                        <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400 animate-pulse" />
                        {item.badge}
                      </span>
                    </div>
                    <h3 className={`text-xl font-serif font-bold mb-2 leading-snug ${isActive ? 'text-emerald-950 font-black' : 'text-neutral-900 group-hover:text-emerald-800'}`}>{item.title}</h3>
                    <p className="text-xs text-neutral-600 leading-relaxed mb-6">{item.desc}</p>
                    <div className={`border rounded-2xl p-3.5 mb-6 flex justify-between items-center ${isActive ? 'bg-white/90 border-emerald-300 shadow-xs' : 'bg-stone-50/90 border-stone-200/90 group-hover:border-emerald-200'}`}>
                      <div className="flex items-center gap-2.5">
                        <span className="relative flex h-2.5 w-2.5 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
                        </span>
                        <div>
                          <div className="text-[10px] uppercase font-bold text-neutral-400">{item.statLabel}</div>
                          <div className="text-xs font-black text-emerald-900 mt-0.5">{item.stat}</div>
                        </div>
                      </div>
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs font-extrabold text-emerald-800">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
                      <span>{item.actionText}</span>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${isActive ? 'bg-emerald-950 scale-110 text-amber-300' : 'bg-emerald-800 text-white group-hover:bg-emerald-900 group-hover:scale-105'}`}>
                      <ArrowRight className="w-4 h-4 text-amber-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* dot indicators */}
          <div className="flex justify-center items-center gap-2 mt-6">
            {careFeatures.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => scrollToIndex(dotIdx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${activeIndex === dotIdx ? 'w-7 bg-emerald-800' : 'w-2 bg-emerald-800/25 hover:bg-emerald-800/50'}`}
                aria-label={`Go to feature ${dotIdx + 1}`}
              />
            ))}
          </div>
        </div>
      </Container>

      <PlayStoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        featureTitle={modalTitle}
        featureDescription={modalDesc}
      />
    </section>
  );
};
