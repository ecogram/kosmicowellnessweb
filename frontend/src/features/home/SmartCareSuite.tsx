import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container } from '../../components/ui/Container';
import {
  Activity, Camera, Watch, Footprints, BookOpen, Users,
  Sparkles, ArrowRight, Smartphone, ChevronLeft, ChevronRight,
  Heart, Droplets, Flame, ShieldAlert
} from 'lucide-react';
import { PlayStoreModal } from '../../components/ui/PlayStoreModal';

interface FeatureItem {
  id: string;
  side: 'left' | 'right';
  slot: number; // 0, 1, 2
  title: string;
  badge: string;
  badgeIcon: string;
  desc: string;
  icon: typeof Activity;
  iconBg: string;
  iconColor: string;
  featureDetails: string;
  widgetType: 'gluco' | 'steps' | 'diary' | 'scan' | 'ble' | 'community';
}

const FEATURES: FeatureItem[] = [
  // LEFT COLUMN (3 cards)
  {
    id: 'gluco',
    side: 'left',
    slot: 0,
    title: 'GlucoRhythm Glucose Tracker',
    badge: 'APP EXCLUSIVE',
    badgeIcon: '⚡',
    desc: 'Continuous Glucose Monitoring (CGM) with real-time trends.',
    icon: Activity,
    iconBg: 'bg-emerald-800',
    iconColor: 'text-emerald-300',
    featureDetails: 'Requires Kosmico App for continuous CGM sensor sync & background alerts.',
    widgetType: 'gluco',
  },
  {
    id: 'steps',
    side: 'left',
    slot: 1,
    title: 'Footstep Counter',
    badge: 'LIVE STEPS',
    badgeIcon: '⚡',
    desc: 'Real-time step tracking, active calorie burn, and daily activity goals.',
    icon: Footprints,
    iconBg: 'bg-amber-500',
    iconColor: 'text-neutral-950',
    featureDetails: 'Requires native smartphone pedometer sensor & motion hardware on the Kosmico Mobile App.',
    widgetType: 'steps',
  },
  {
    id: 'diary',
    side: 'left',
    slot: 2,
    title: 'Health Diary & Water Log',
    badge: 'DAILY TRACKER',
    badgeIcon: '⚡',
    desc: 'Track daily water intake, workout logs, energy levels, and supplement reminders.',
    icon: BookOpen,
    iconBg: 'bg-emerald-900',
    iconColor: 'text-emerald-300',
    featureDetails: 'Requires Kosmico Mobile App for push notifications & daily log history.',
    widgetType: 'diary',
  },

  // RIGHT COLUMN (3 cards)
  {
    id: 'scan',
    side: 'right',
    slot: 0,
    title: 'Plate AI Meal Scanner',
    badge: 'AI VISION SCAN',
    badgeIcon: '⚡',
    desc: 'AI Vision meal scanner estimating calories, net carbs, and Glycemic Index (GI).',
    icon: Camera,
    iconBg: 'bg-emerald-800',
    iconColor: 'text-emerald-300',
    featureDetails: 'Requires Kosmico App camera integration & Gemini AI image recognition.',
    widgetType: 'scan',
  },
  {
    id: 'ble',
    side: 'right',
    slot: 1,
    title: 'Smartwatch BLE Sync',
    badge: 'LIVE BIOMETRICS',
    badgeIcon: '⚡',
    desc: 'Sync fitness bands to monitor heart rate, SpO2, and real-time biometrics.',
    icon: Watch,
    iconBg: 'bg-amber-500',
    iconColor: 'text-neutral-950',
    featureDetails: 'Requires native Bluetooth LE hardware sensors available on the Kosmico Mobile App.',
    widgetType: 'ble',
  },
  {
    id: 'community',
    side: 'right',
    slot: 2,
    title: 'Care Community & SOS',
    badge: 'CARE NETWORK',
    badgeIcon: '⚡',
    desc: 'Connect with peer health groups, doctor SOS support, and share keto/diabetes recipes.',
    icon: Users,
    iconBg: 'bg-emerald-900',
    iconColor: 'text-emerald-300',
    featureDetails: 'Requires Kosmico Mobile App for family care circle sync & emergency doctor SOS.',
    widgetType: 'community',
  },
];

interface PathData {
  d: string;
  length: number;
  phoneAnchor: { x: number; y: number };
  cardAnchor: { x: number; y: number };
}

/* ── Injected Keyframe Animations for Feature Cards ── */
const FEATURE_MOTION_STYLES = `
/* 1. CGM Wave Flow Animation */
@keyframes cgm-flow-wave {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.animate-cgm-flow {
  animation: cgm-flow-wave 4s linear infinite;
}

/* 2. AI Scanner Laser Sweep */
@keyframes laser-sweep {
  0% { top: 4px; opacity: 0.9; }
  50% { top: calc(100% - 6px); opacity: 1; }
  100% { top: 4px; opacity: 0.9; }
}
.animate-laser-sweep {
  animation: laser-sweep 2.2s ease-in-out infinite;
}

/* 3. Footstep Walking Rhythm */
@keyframes footstep-walk {
  0%, 100% { transform: rotate(-8deg) translateY(0); }
  50% { transform: rotate(10deg) translateY(-3px); }
}
.animate-footstep-walk {
  animation: footstep-walk 1.1s ease-in-out infinite;
}

/* 4. Realistic Heartbeat (Lub-Dub) */
@keyframes realistic-heartbeat {
  0% { transform: scale(1); }
  14% { transform: scale(1.28); }
  28% { transform: scale(1); }
  42% { transform: scale(1.18); }
  70% { transform: scale(1); }
  100% { transform: scale(1); }
}
.animate-heartbeat-lubdub {
  animation: realistic-heartbeat 1.35s ease-in-out infinite;
}

/* 5. ECG Wave Monitor Crawl */
@keyframes ecg-crawl {
  0% { stroke-dashoffset: 160; }
  100% { stroke-dashoffset: 0; }
}
.animate-ecg-crawl {
  stroke-dasharray: 160;
  animation: ecg-crawl 2s linear infinite;
}

/* 6. Water Intake Bar Fluid Oscillation */
@keyframes fluid-level-1 {
  0%, 100% { height: 10px; }
  50% { height: 16px; }
}
@keyframes fluid-level-2 {
  0%, 100% { height: 16px; }
  50% { height: 22px; }
}
@keyframes fluid-level-3 {
  0%, 100% { height: 24px; }
  50% { height: 18px; }
}
@keyframes fluid-level-4 {
  0%, 100% { height: 18px; }
  50% { height: 26px; }
}
.animate-fluid-1 { animation: fluid-level-1 2s ease-in-out infinite; }
.animate-fluid-2 { animation: fluid-level-2 2.3s ease-in-out infinite 0.2s; }
.animate-fluid-3 { animation: fluid-level-3 1.9s ease-in-out infinite 0.4s; }
.animate-fluid-4 { animation: fluid-level-4 2.5s ease-in-out infinite 0.6s; }

/* 7. Water Drop Bounce */
@keyframes water-drip-bounce {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-3px) scale(1.15); }
}
.animate-water-drip {
  animation: water-drip-bounce 1.6s ease-in-out infinite;
}

/* 8. Doctor SOS / Community Radar Ripple */
@keyframes radar-sonar {
  0% { transform: scale(0.85); opacity: 0.9; }
  100% { transform: scale(1.75); opacity: 0; }
}
.animate-radar-sonar {
  animation: radar-sonar 2.4s cubic-bezier(0, 0.2, 0.8, 1) infinite;
}

/* 9. Card Border Pulse */
@keyframes border-glow-pulse {
  0% { box-shadow: 0 0 0 rgba(34,197,94,0); }
  50% { box-shadow: 0 0 28px rgba(34,197,94,0.7), inset 0 0 14px rgba(34,197,94,0.3); }
  100% { box-shadow: 0 0 0 rgba(34,197,94,0); }
}
.animate-card-glow {
  animation: border-glow-pulse 0.9s ease-out forwards;
}
`;

export const SmartCareSuite: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDesc, setModalDesc] = useState('');
  const [activeGlowCard, setActiveGlowCard] = useState<number | null>(null);
  const [paths, setPaths] = useState<PathData[]>([]);
  const [particlePos, setParticlePos] = useState<{ x: number; y: number; activeIdx: number } | null>(null);

  // Mobile carousel state
  const [mobileActiveIdx, setMobileActiveIdx] = useState(0);
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  // Container and element references
  const sectionRef = useRef<HTMLElement>(null);
  const hubContainerRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pathElsRef = useRef<(SVGPathElement | null)[]>([]);

  const openAppModal = (title: string, desc: string) => {
    setModalTitle(title);
    setModalDesc(desc);
    setIsModalOpen(true);
  };

  // Recalculate SVG connector paths connecting phone to each card
  const updateConnectorPaths = useCallback(() => {
    if (!hubContainerRef.current || !phoneRef.current) return;
    const containerRect = hubContainerRef.current.getBoundingClientRect();
    const phoneRect = phoneRef.current.getBoundingClientRect();

    const computed: PathData[] = [];

    FEATURES.forEach((feature, i) => {
      const cardEl = cardRefs.current[i];
      if (!cardEl) return;
      const cardRect = cardEl.getBoundingClientRect();

      let cx = 0;
      let cy = 0;
      let sx = 0;
      let sy = 0;

      // Vertical offsets on the phone's left/right border
      const phoneVerticalOffsets = [0.28, 0.50, 0.72];
      const slotRatio = phoneVerticalOffsets[feature.slot] ?? 0.5;

      if (feature.side === 'left') {
        cx = cardRect.right - containerRect.left;
        cy = cardRect.top + cardRect.height / 2 - containerRect.top;
        sx = phoneRect.left - containerRect.left + 4;
        sy = phoneRect.top + phoneRect.height * slotRatio - containerRect.top;
      } else {
        cx = cardRect.left - containerRect.left;
        cy = cardRect.top + cardRect.height / 2 - containerRect.top;
        sx = phoneRect.right - containerRect.left - 4;
        sy = phoneRect.top + phoneRect.height * slotRatio - containerRect.top;
      }

      // Smooth curved S / cubic bezier curve
      const dx = cx - sx;
      const cp1x = sx + dx * 0.45;
      const cp1y = sy;
      const cp2x = sx + dx * 0.55;
      const cp2y = cy;

      const d = `M ${sx.toFixed(1)} ${sy.toFixed(1)} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${cx.toFixed(1)} ${cy.toFixed(1)}`;

      let length = 300;
      try {
        const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        tempPath.setAttribute('d', d);
        length = tempPath.getTotalLength() || 300;
      } catch {
        const dist = Math.hypot(cx - sx, cy - sy);
        length = dist * 1.15;
      }

      computed.push({
        d,
        length,
        phoneAnchor: { x: sx, y: sy },
        cardAnchor: { x: cx, y: cy },
      });
    });

    setPaths(computed);
  }, []);

  useEffect(() => {
    updateConnectorPaths();
    window.addEventListener('resize', updateConnectorPaths);
    const timeout = setTimeout(updateConnectorPaths, 400);
    return () => {
      window.removeEventListener('resize', updateConnectorPaths);
      clearTimeout(timeout);
    };
  }, [updateConnectorPaths]);

  // Animation Timeline: sequential light particle travel + card border pulse
  useEffect(() => {
    if (paths.length < 6) return;

    let animId = 0;
    let startTime: number | null = null;
    let currentIdx = 0;

    const TRAVEL_DURATION = 1300;
    const GLOW_HOLD_DURATION = 650;
    const PAUSE_DURATION = 200;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      const pathData = paths[currentIdx];
      const pathEl = pathElsRef.current[currentIdx];

      if (elapsed <= TRAVEL_DURATION) {
        const progress = elapsed / TRAVEL_DURATION;
        if (pathEl && pathData) {
          try {
            const pt = pathEl.getPointAtLength(progress * pathData.length);
            setParticlePos({ x: pt.x, y: pt.y, activeIdx: currentIdx });
          } catch {
            const sx = pathData.phoneAnchor.x;
            const sy = pathData.phoneAnchor.y;
            const cx = pathData.cardAnchor.x;
            const cy = pathData.cardAnchor.y;
            setParticlePos({
              x: sx + (cx - sx) * progress,
              y: sy + (cy - sy) * progress,
              activeIdx: currentIdx,
            });
          }
        }
      } else if (elapsed <= TRAVEL_DURATION + GLOW_HOLD_DURATION) {
        setActiveGlowCard(currentIdx);
        if (pathData) {
          setParticlePos({
            x: pathData.cardAnchor.x,
            y: pathData.cardAnchor.y,
            activeIdx: currentIdx,
          });
        }
      } else if (elapsed <= TRAVEL_DURATION + GLOW_HOLD_DURATION + PAUSE_DURATION) {
        setParticlePos(null);
      } else {
        setActiveGlowCard(null);
        setParticlePos(null);
        currentIdx = (currentIdx + 1) % 6;
        startTime = timestamp;
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [paths]);

  // Mobile carousel navigation
  const scrollMobileTo = (idx: number) => {
    setMobileActiveIdx(idx);
    if (mobileScrollRef.current) {
      const card = mobileScrollRef.current.children[idx] as HTMLElement;
      if (card) {
        const targetScrollLeft = card.offsetLeft - (mobileScrollRef.current.clientWidth - card.clientWidth) / 2;
        mobileScrollRef.current.scrollTo({ left: Math.max(0, targetScrollLeft), behavior: 'smooth' });
      }
    }
  };

  const handleMobileScroll = () => {
    if (!mobileScrollRef.current) return;
    const el = mobileScrollRef.current;
    const cardWidth = (el.children[0] as HTMLElement)?.clientWidth || 1;
    const newIdx = Math.round(el.scrollLeft / cardWidth);
    if (newIdx !== mobileActiveIdx && newIdx >= 0 && newIdx < FEATURES.length) {
      setMobileActiveIdx(newIdx);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="care-suite"
      className="py-16 md:py-24 bg-gradient-to-b from-[#f7faf8] via-[#eef7f1]/60 to-background border-y border-border relative overflow-hidden"
    >
      {/* Inject feature motion keyframe styles */}
      <style>{FEATURE_MOTION_STYLES}</style>

      {/* Background Soft Glow Orbs */}
      <div className="absolute top-1/4 -left-28 w-[450px] h-[450px] bg-emerald-400/12 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-28 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-300/8 rounded-full blur-3xl pointer-events-none" />

      <Container className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6">
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
            onClick={() =>
              openAppModal(
                'Kosmico Mobile App Download',
                'Download the official Kosmico Wellness mobile app on Google Play Store to unlock continuous glucose sync, BLE tracking, and AI meal scans.'
              )
            }
            className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-emerald-800 via-emerald-900 to-emerald-950 hover:from-emerald-900 hover:to-emerald-950 px-6 py-4 rounded-2xl shadow-xl shadow-emerald-900/20 hover:shadow-2xl hover:shadow-emerald-900/30 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 group border border-emerald-700/50 cursor-pointer shrink-0"
          >
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>Download App on Google Play</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform text-amber-400" />
          </button>
        </div>

        {/* ════════════════════════════════════════════════════════════
            DESKTOP ECOSYSTEM (Phone in Center with 6 Connected Cards)
            Visible on lg screens (>= 1024px)
        ═══════════════════════════════════════════════════════════ */}
        <div ref={hubContainerRef} className="hidden lg:block relative py-6 select-none">
          {/* SVG Overlay: Curved Connectors & Travelling Light Particle */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
            <defs>
              <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="particle-bloom" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="bloom" />
                <feMerge>
                  <feMergeNode in="bloom" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <radialGradient id="particle-halo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#4ade80" stopOpacity="1" />
                <stop offset="40%" stopColor="#22c55e" stopOpacity="0.8" />
                <stop offset="80%" stopColor="#16a34a" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* 6 Curved Connecting Lines */}
            {paths.map((p, i) => {
              const isActive = activeGlowCard === i || particlePos?.activeIdx === i;
              return (
                <g key={i}>
                  {/* Outer soft ambient glow line */}
                  <path
                    d={p.d}
                    fill="none"
                    stroke={isActive ? 'rgba(34, 197, 94, 0.55)' : 'rgba(34, 197, 94, 0.22)'}
                    strokeWidth={isActive ? 6 : 3}
                    filter="url(#neon-glow)"
                    className="transition-all duration-300"
                  />
                  {/* Core crisp connector wire */}
                  <path
                    ref={(el) => {
                      pathElsRef.current[i] = el;
                    }}
                    d={p.d}
                    fill="none"
                    stroke={isActive ? '#22c55e' : '#16a34a'}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    strokeDasharray={isActive ? 'none' : '6 4'}
                    opacity={isActive ? 0.95 : 0.65}
                    className="transition-all duration-300"
                  />

                  {/* Phone edge terminal node */}
                  <circle
                    cx={p.phoneAnchor.x}
                    cy={p.phoneAnchor.y}
                    r={isActive ? 5.5 : 4}
                    fill="#22c55e"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="transition-all duration-300"
                  />

                  {/* Card edge terminal node */}
                  <circle
                    cx={p.cardAnchor.x}
                    cy={p.cardAnchor.y}
                    r={isActive ? 6 : 4}
                    fill={isActive ? '#4ade80' : '#16a34a'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="transition-all duration-300"
                  />
                </g>
              );
            })}

            {/* Travelling Light Particle */}
            {particlePos && (
              <g filter="url(#particle-bloom)">
                <circle cx={particlePos.x} cy={particlePos.y} r={14} fill="url(#particle-halo)" />
                <circle cx={particlePos.x} cy={particlePos.y} r={6.5} fill="#4ade80" />
                <circle cx={particlePos.x} cy={particlePos.y} r={3} fill="#ffffff" />
              </g>
            )}
          </svg>

          {/* 3-Column Ecosystem Layout */}
          <div className="grid grid-cols-[330px_1fr_330px] xl:grid-cols-[360px_1fr_360px] gap-6 items-center">
            {/* ── LEFT COLUMN (3 Cards) ── */}
            <div className="flex flex-col gap-6">
              {FEATURES.filter((f) => f.side === 'left').map((feature) => {
                const globalIdx = FEATURES.findIndex((f) => f.id === feature.id);
                const isGlow = activeGlowCard === globalIdx;
                const IconComponent = feature.icon;

                return (
                  <div
                    key={feature.id}
                    ref={(el) => {
                      cardRefs.current[globalIdx] = el;
                    }}
                    onClick={() => openAppModal(feature.title, feature.featureDetails)}
                    className={`relative rounded-[26px] p-5.5 bg-white/95 backdrop-blur-md cursor-pointer transition-all duration-500 transform hover:-translate-y-1 hover:shadow-2xl border ${
                      isGlow
                        ? 'border-emerald-500 shadow-[0_0_26px_rgba(34,197,94,0.7),inset_0_0_12px_rgba(34,197,94,0.22)] scale-[1.018]'
                        : 'border-emerald-950/10 shadow-lg shadow-emerald-950/5 hover:border-emerald-500/40'
                    }`}
                  >
                    {/* Glowing border trace effect */}
                    <div
                      className={`absolute inset-0 rounded-[26px] pointer-events-none transition-opacity duration-500 ${
                        isGlow ? 'opacity-100 ring-2 ring-emerald-500 ring-offset-1' : 'opacity-0'
                      }`}
                      style={{
                        boxShadow: isGlow ? 'inset 0 0 16px rgba(34, 197, 94, 0.25)' : 'none',
                      }}
                    />

                    {/* Top Row: Icon + Title + App Exclusive Badge */}
                    <div className="flex items-start gap-3.5 mb-2.5">
                      <div
                        className={`w-12 h-12 rounded-2xl ${feature.iconBg} ${feature.iconColor} flex items-center justify-center shrink-0 shadow-md shadow-emerald-950/10 transition-transform duration-300 ${
                          isGlow ? 'scale-110' : ''
                        }`}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h3 className="text-[15px] font-serif font-black text-neutral-900 leading-snug tracking-tight">
                            {feature.title}
                          </h3>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase bg-emerald-900 text-amber-300 border border-emerald-700/60 shadow-xs">
                          <span>{feature.badgeIcon}</span>
                          <span>{feature.badge}</span>
                        </span>
                      </div>
                    </div>

                    {/* Subtitle description */}
                    <p className="text-[11.5px] text-neutral-600 leading-relaxed mb-3.5">
                      {feature.desc}
                    </p>

                    {/* ══ DYNAMIC FEATURE MOTION WIDGETS (LEFT) ══ */}
                    {/* 1. GlucoRhythm Widget with LIVE CONTINUOUS FLOWING CGM WAVE */}
                    {feature.widgetType === 'gluco' && (
                      <div className="rounded-2xl p-3 bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-stone-50/80 border border-emerald-200/90 flex items-center justify-between overflow-hidden relative">
                        <div className="flex items-center gap-2 z-10 shrink-0">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
                          </span>
                          <div>
                            <div className="text-[9px] uppercase font-bold text-neutral-500">Live CGM</div>
                            <span className="text-xs font-black text-emerald-950">112 mg/dL</span>
                          </div>
                        </div>

                        {/* Continuous Flowing CGM Waveform SVG Animation */}
                        <div className="w-36 h-9 relative overflow-hidden flex items-center">
                          <div className="flex w-[200%] animate-cgm-flow absolute left-0">
                            {/* Seamless double wave */}
                            <svg viewBox="0 0 160 32" className="w-1/2 h-8 shrink-0 overflow-visible">
                              <path
                                d="M 0 18 Q 15 6, 30 18 T 60 18 T 80 8 T 100 24 T 120 16 T 160 18"
                                fill="none"
                                stroke="#16a34a"
                                strokeWidth="2.4"
                                strokeLinecap="round"
                              />
                              <circle cx="80" cy="8" r="3.5" fill="#22c55e" className="animate-ping opacity-75" />
                              <circle cx="80" cy="8" r="2.5" fill="#15803d" />
                            </svg>
                            <svg viewBox="0 0 160 32" className="w-1/2 h-8 shrink-0 overflow-visible">
                              <path
                                d="M 0 18 Q 15 6, 30 18 T 60 18 T 80 8 T 100 24 T 120 16 T 160 18"
                                fill="none"
                                stroke="#16a34a"
                                strokeWidth="2.4"
                                strokeLinecap="round"
                              />
                              <circle cx="80" cy="8" r="3.5" fill="#22c55e" className="animate-ping opacity-75" />
                              <circle cx="80" cy="8" r="2.5" fill="#15803d" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2. Footstep Counter Widget with WALKING CADENCE & DYNAMIC ARC */}
                    {feature.widgetType === 'steps' && (
                      <div className="rounded-2xl p-3 bg-gradient-to-r from-amber-50/70 via-stone-50/80 to-emerald-50/70 border border-stone-200/90 flex items-center justify-between">
                        {/* Semi-circular step radial progress with walking icon */}
                        <div className="relative w-14 h-12 flex items-center justify-center">
                          <svg viewBox="0 0 50 36" className="w-full h-full">
                            <path
                              d="M 5 30 A 20 20 0 0 1 45 30"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="4"
                              strokeLinecap="round"
                            />
                            <path
                              d="M 5 30 A 20 20 0 0 1 38 18"
                              fill="none"
                              stroke="#16a34a"
                              strokeWidth="4.5"
                              strokeLinecap="round"
                            />
                            {/* Animated glowing tip */}
                            <circle cx="38" cy="18" r="2.5" fill="#4ade80" className="animate-pulse" />
                          </svg>
                          {/* Animated Walking Sneaker / Footprint */}
                          <div className="absolute bottom-1 animate-footstep-walk">
                            <Footprints className="w-4 h-4 text-emerald-800" />
                          </div>
                        </div>

                        <div className="text-right space-y-0.5">
                          <div className="flex items-center justify-end gap-1 text-xs font-black text-neutral-900">
                            <span>6,420 Steps</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          </div>
                          <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-amber-700">
                            <Flame className="w-3 h-3 text-amber-500 fill-amber-500 animate-bounce" />
                            <span>320 kcal burned</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 3. Health Diary & Water Log Widget with ANIMATED FLUID OSCILLATION */}
                    {feature.widgetType === 'diary' && (
                      <div className="rounded-2xl p-3 bg-gradient-to-r from-emerald-50/90 to-teal-50/80 border border-emerald-200/90 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-teal-100/90 flex items-center justify-center animate-water-drip">
                            <Droplets className="w-4 h-4 text-teal-700" />
                          </div>
                          <div>
                            <div className="text-[9px] uppercase font-bold text-neutral-500">Hydration Log</div>
                            <span className="text-xs font-black text-emerald-950">+250 ml logged</span>
                          </div>
                        </div>

                        {/* Animated Fluid Volume Bars (Living Hydration equalizer) */}
                        <div className="flex items-end gap-1.5 h-7 px-2 py-0.5 bg-white/70 rounded-xl border border-emerald-200/60 shadow-2xs">
                          <div className="w-2.5 bg-gradient-to-t from-emerald-600 to-teal-400 rounded-sm animate-fluid-1" />
                          <div className="w-2.5 bg-gradient-to-t from-emerald-600 to-teal-400 rounded-sm animate-fluid-2" />
                          <div className="w-2.5 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-sm animate-fluid-3" />
                          <div className="w-2.5 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-sm animate-fluid-4" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── CENTER COLUMN (Phone Mockup + Pedestal Base) ── */}
            <div className="flex flex-col items-center justify-center px-4">
              {/* Phone Mockup */}
              <div
                ref={phoneRef}
                className="relative rounded-[40px] p-2.5 shadow-[0_20px_50px_rgba(16,185,129,0.22),0_10px_25px_rgba(0,0,0,0.15)] transition-all duration-500 hover:scale-[1.015]"
                style={{
                  width: 260,
                  background: 'linear-gradient(145deg, #1f2937, #111827)',
                  border: '3px solid rgba(255, 255, 255, 0.25)',
                }}
              >
                {/* Subtle Phone Outer Glow */}
                <div className="absolute -inset-2 rounded-[46px] bg-emerald-500/20 blur-xl pointer-events-none animate-pulse" />

                {/* Speaker pill notch */}
                <div className="relative z-20 flex justify-center pb-2 pt-1">
                  <div className="w-20 h-4.5 bg-black rounded-full flex items-center justify-end pr-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-ping" />
                  </div>
                </div>

                {/* Phone Screen Display */}
                <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-b from-emerald-50/90 via-white to-[#eef7f1] p-4 text-center flex flex-col justify-between min-h-[440px] border border-white/60">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between text-[11px] font-bold text-neutral-800 px-1 pt-0.5">
                    <span>9:41</span>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span>5G</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Brand Logo & User Greeting */}
                  <div className="flex flex-col items-center mt-2 space-y-1">
                    <img
                      src="/kosmico-logo.png"
                      alt="Kosmico"
                      className="w-12 h-12 object-contain drop-shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                      Kosmico
                    </div>
                    <div className="text-[12px] font-bold text-neutral-700">Good Morning, Amit ☀️</div>
                  </div>

                  {/* Central Wellness Score Radial Ring */}
                  <div className="relative w-36 h-36 mx-auto my-2 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      {/* Background track */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="7"
                      />
                      {/* Active Progress gradient ring */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="url(#wellness-score-gradient)"
                        strokeWidth="7"
                        strokeDasharray="251.2"
                        strokeDashoffset="32.6"
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="wellness-score-gradient" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="60%" stopColor="#059669" />
                          <stop offset="100%" stopColor="#047857" />
                        </linearGradient>
                      </defs>
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">
                        Wellness Score
                      </span>
                      <span className="text-3xl font-black text-emerald-950 leading-none my-0.5">
                        87%
                      </span>
                      {/* Wave pulse icon */}
                      <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse mt-0.5" />
                    </div>
                  </div>

                  {/* Soft Mountain Wave Illustration & Bottom Nav */}
                  <div>
                    {/* Mountain wave decoration */}
                    <div className="h-10 w-full mb-1">
                      <svg viewBox="0 0 200 40" className="w-full h-full text-emerald-600/20 fill-current">
                        <path d="M 0 35 Q 50 15, 100 28 T 200 20 L 200 40 L 0 40 Z" />
                        <path d="M 0 30 Q 60 10, 120 25 T 200 15 L 200 40 L 0 40 Z" opacity="0.5" />
                      </svg>
                    </div>

                    {/* App Bottom Navigation Bar */}
                    <div className="rounded-2xl bg-white/90 shadow-md p-2 flex items-center justify-around border border-emerald-900/10 text-neutral-600">
                      <span className="text-emerald-800 text-[11px] font-bold">🏠</span>
                      <span className="text-neutral-500 text-[11px]">❤️</span>
                      <div className="w-7 h-7 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shadow-md">
                        +
                      </div>
                      <span className="text-neutral-500 text-[11px]">👥</span>
                      <span className="text-neutral-500 text-[11px]">👤</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3D Tiered Pedestal Stage under Phone */}
              <div className="relative mt-2 flex flex-col items-center">
                {/* Upper gold/emerald ring */}
                <div
                  className="w-48 h-5 rounded-[50%] bg-gradient-to-r from-emerald-800 via-amber-400 to-emerald-900 shadow-md border border-amber-300/40 relative z-10"
                  style={{
                    boxShadow: '0 0 15px rgba(245, 158, 11, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
                  }}
                />
                {/* Lower tiered metallic green base */}
                <div
                  className="w-56 h-7 rounded-[50%] bg-gradient-to-b from-emerald-900 to-emerald-950 -mt-2.5 shadow-xl border border-emerald-700/50 relative z-0"
                  style={{
                    boxShadow: '0 12px 25px rgba(6, 78, 59, 0.45)',
                  }}
                />
                {/* Floor glow halo */}
                <div className="w-64 h-6 rounded-full bg-emerald-400/25 blur-lg -mt-3 pointer-events-none" />
              </div>
            </div>

            {/* ── RIGHT COLUMN (3 Cards) ── */}
            <div className="flex flex-col gap-6">
              {FEATURES.filter((f) => f.side === 'right').map((feature) => {
                const globalIdx = FEATURES.findIndex((f) => f.id === feature.id);
                const isGlow = activeGlowCard === globalIdx;
                const IconComponent = feature.icon;

                return (
                  <div
                    key={feature.id}
                    ref={(el) => {
                      cardRefs.current[globalIdx] = el;
                    }}
                    onClick={() => openAppModal(feature.title, feature.featureDetails)}
                    className={`relative rounded-[26px] p-5.5 bg-white/95 backdrop-blur-md cursor-pointer transition-all duration-500 transform hover:-translate-y-1 hover:shadow-2xl border ${
                      isGlow
                        ? 'border-emerald-500 shadow-[0_0_26px_rgba(34,197,94,0.7),inset_0_0_12px_rgba(34,197,94,0.22)] scale-[1.018]'
                        : 'border-emerald-950/10 shadow-lg shadow-emerald-950/5 hover:border-emerald-500/40'
                    }`}
                  >
                    {/* Glowing border trace effect */}
                    <div
                      className={`absolute inset-0 rounded-[26px] pointer-events-none transition-opacity duration-500 ${
                        isGlow ? 'opacity-100 ring-2 ring-emerald-500 ring-offset-1' : 'opacity-0'
                      }`}
                      style={{
                        boxShadow: isGlow ? 'inset 0 0 16px rgba(34, 197, 94, 0.25)' : 'none',
                      }}
                    />

                    {/* Top Row: Icon + Title + AI Scan Badge */}
                    <div className="flex items-start gap-3.5 mb-2.5">
                      <div
                        className={`w-12 h-12 rounded-2xl ${feature.iconBg} ${feature.iconColor} flex items-center justify-center shrink-0 shadow-md shadow-emerald-950/10 transition-transform duration-300 ${
                          isGlow ? 'scale-110' : ''
                        }`}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h3 className="text-[15px] font-serif font-black text-neutral-900 leading-snug tracking-tight">
                            {feature.title}
                          </h3>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase bg-emerald-900 text-amber-300 border border-emerald-700/60 shadow-xs">
                          <span>{feature.badgeIcon}</span>
                          <span>{feature.badge}</span>
                        </span>
                      </div>
                    </div>

                    {/* Subtitle description */}
                    <p className="text-[11.5px] text-neutral-600 leading-relaxed mb-3.5">
                      {feature.desc}
                    </p>

                    {/* ══ DYNAMIC FEATURE MOTION WIDGETS (RIGHT) ══ */}
                    {/* 4. Plate AI Meal Scanner with ACTIVE LASER SCANNING BEAM */}
                    {feature.widgetType === 'scan' && (
                      <div className="rounded-2xl p-3 bg-gradient-to-r from-emerald-50/90 to-stone-50/80 border border-emerald-200/90 flex items-center justify-between">
                        {/* Food Bowl with Live Laser Sweeping Line */}
                        <div className="relative w-12 h-12 rounded-xl bg-amber-100/80 border border-amber-300 flex items-center justify-center text-2xl shadow-xs overflow-hidden">
                          <span>🥗</span>

                          {/* 4 Corner scan reticle brackets */}
                          <div className="absolute top-0.5 left-0.5 w-2 h-2 border-t-2 border-l-2 border-emerald-700" />
                          <div className="absolute top-0.5 right-0.5 w-2 h-2 border-t-2 border-r-2 border-emerald-700" />
                          <div className="absolute bottom-0.5 left-0.5 w-2 h-2 border-b-2 border-l-2 border-emerald-700" />
                          <div className="absolute bottom-0.5 right-0.5 w-2 h-2 border-b-2 border-r-2 border-emerald-700" />

                          {/* Moving Laser Beam Scanner */}
                          <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-400 to-emerald-500/0 shadow-[0_0_8px_#22c55e] animate-laser-sweep" />
                        </div>

                        <div className="space-y-0.5 text-right text-[10.5px]">
                          <div className="font-bold text-neutral-600">
                            <span className="text-emerald-700 font-extrabold mr-1">●</span>Calories: <span className="font-black text-neutral-900">420 kcal</span>
                          </div>
                          <div className="font-bold text-neutral-600">
                            <span className="text-amber-600 font-extrabold mr-1">●</span>Net Carbs: <span className="font-black text-neutral-900">38 g</span>
                          </div>
                          <div className="font-bold text-neutral-600">
                            <span className="text-teal-600 font-extrabold mr-1">●</span>GI (Est.): <span className="font-black text-emerald-800">Low</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 5. Smartwatch BLE Sync with CARDIAC PULSE & DRAWN ECG WAVE */}
                    {feature.widgetType === 'ble' && (
                      <div className="rounded-2xl p-3 bg-gradient-to-r from-rose-50/80 via-stone-50/80 to-emerald-50/80 border border-stone-200/90 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {/* Realistic Lub-Dub Heartbeat Animation */}
                          <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center">
                            <Heart className="w-4 h-4 text-rose-600 fill-rose-600 animate-heartbeat-lubdub" />
                          </div>
                          <div>
                            <div className="text-[9px] uppercase font-bold text-neutral-500">Live Pulse</div>
                            <span className="text-xs font-black text-neutral-900">74 BPM</span>
                          </div>
                        </div>

                        {/* Living Drawn ECG Wave Line */}
                        <div className="w-20 h-5 flex items-center">
                          <svg viewBox="0 0 80 20" className="w-full h-full overflow-visible">
                            <path
                              d="M 0 10 L 22 10 L 26 2 L 31 18 L 36 6 L 41 14 L 46 10 L 80 10"
                              fill="none"
                              stroke="#f43f5e"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              className="animate-ecg-crawl"
                            />
                          </svg>
                        </div>

                        <div className="text-right">
                          <div className="text-[9px] uppercase font-bold text-neutral-400">SpO2 Oxygen</div>
                          <div className="text-xs font-black text-emerald-800 flex items-center justify-end gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            <span>98%</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 6. Care Community & SOS with RADAR SONAR PULSE & ACTIVE BADGES */}
                    {feature.widgetType === 'community' && (
                      <div className="rounded-2xl p-3 bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-amber-50/70 border border-emerald-200/90 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="relative flex items-center justify-center w-6 h-6">
                            <div className="absolute inset-0 rounded-full bg-emerald-400 animate-radar-sonar" />
                            <ShieldAlert className="w-4 h-4 text-emerald-800 relative z-10" />
                          </div>
                          <div>
                            <div className="text-[9px] uppercase font-bold text-neutral-500">Care Network</div>
                            <span className="text-[11px] font-black text-emerald-950">24/7 Peer SOS</span>
                          </div>
                        </div>

                        {/* Overlapping member avatars with active glowing status */}
                        <div className="flex items-center -space-x-2">
                          <div className="relative">
                            <div className="w-7 h-7 rounded-full bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
                              AK
                            </div>
                            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute bottom-0 right-0 ring-1 ring-white" />
                          </div>
                          <div className="relative">
                            <div className="w-7 h-7 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
                              RS
                            </div>
                            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute bottom-0 right-0 ring-1 ring-white" />
                          </div>
                          <div className="relative">
                            <div className="w-7 h-7 rounded-full bg-teal-700 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
                              DR
                            </div>
                            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute bottom-0 right-0 ring-1 ring-white" />
                          </div>
                          <div className="w-7 h-7 rounded-full bg-emerald-900 text-amber-300 text-[11px] font-black flex items-center justify-center border-2 border-white shadow-xs hover:scale-110 transition-transform">
                            +
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            MOBILE / TABLET CAROUSEL (Visible on < lg screens)
        ═══════════════════════════════════════════════════════════ */}
        <div className="lg:hidden">
          {/* Mobile Central Phone Preview */}
          <div className="flex flex-col items-center justify-center mb-8">
            <div
              className="relative rounded-[32px] p-2 shadow-2xl shadow-emerald-900/20"
              style={{
                width: 200,
                background: 'linear-gradient(145deg, #1f2937, #111827)',
                border: '2.5px solid rgba(255, 255, 255, 0.25)',
              }}
            >
              <div className="rounded-[24px] overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-[#eef7f1] p-3 text-center flex flex-col items-center">
                <img
                  src="/kosmico-logo.png"
                  alt="Kosmico"
                  className="w-9 h-9 object-contain mb-1"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="text-[10px] font-black text-emerald-950 uppercase">Kosmico</span>
                <span className="text-[11px] font-bold text-neutral-700 mb-2">Good Morning, Amit ☀️</span>

                {/* Score gauge */}
                <div className="relative w-24 h-24 flex items-center justify-center mb-2">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#059669"
                      strokeWidth="8"
                      strokeDasharray="251.2"
                      strokeDashoffset="32.6"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-emerald-950">87%</span>
                    <span className="text-[8px] font-bold text-neutral-500 uppercase">Wellness</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Pedestal */}
            <div className="w-36 h-4 rounded-[50%] bg-gradient-to-r from-emerald-800 via-amber-400 to-emerald-900 shadow-md -mt-2" />
          </div>

          {/* Swipe navigation header */}
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Swipe features left / right</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() =>
                  scrollMobileTo((mobileActiveIdx - 1 + FEATURES.length) % FEATURES.length)
                }
                className="p-2 rounded-full bg-white border border-emerald-900/15 shadow-xs text-neutral-800 hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer"
                aria-label="Previous feature"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollMobileTo((mobileActiveIdx + 1) % FEATURES.length)}
                className="p-2 rounded-full bg-white border border-emerald-900/15 shadow-xs text-neutral-800 hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer"
                aria-label="Next feature"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Horizontal Snap Scroll Cards with the motion widgets */}
          <div
            ref={mobileScrollRef}
            onScroll={handleMobileScroll}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {FEATURES.map((feature, idx) => {
              const IconComponent = feature.icon;
              const isActive = mobileActiveIdx === idx;

              return (
                <div
                  key={feature.id}
                  onClick={() => {
                    scrollMobileTo(idx);
                    openAppModal(feature.title, feature.featureDetails);
                  }}
                  className={`w-[85vw] sm:w-[75vw] max-w-[340px] shrink-0 snap-center rounded-[28px] p-6 transition-all duration-500 cursor-pointer select-none border ${
                    isActive
                      ? 'bg-white border-emerald-500 shadow-xl shadow-emerald-900/15 -translate-y-1'
                      : 'bg-white/90 border-emerald-900/10 shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-2xl ${feature.iconBg} ${feature.iconColor} flex items-center justify-center shadow-md`}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black tracking-wider uppercase bg-emerald-900 text-amber-300 px-3 py-1.5 rounded-full flex items-center gap-1 shadow-xs border border-emerald-700/50">
                      <span>{feature.badgeIcon}</span>
                      <span>{feature.badge}</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-serif font-black text-neutral-900 mb-2 leading-snug">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                    {feature.desc}
                  </p>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-extrabold text-emerald-800">
                    <span>Tap to view app demo</span>
                    <ArrowRight className="w-4 h-4 text-emerald-700" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center items-center gap-2 mt-4">
            {FEATURES.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => scrollMobileTo(dotIdx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  mobileActiveIdx === dotIdx ? 'w-7 bg-emerald-800' : 'w-2 bg-emerald-800/25'
                }`}
                aria-label={`Go to feature ${dotIdx + 1}`}
              />
            ))}
          </div>
        </div>
      </Container>

      {/* App Download Modal */}
      <PlayStoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        featureTitle={modalTitle}
        featureDescription={modalDesc}
      />
    </section>
  );
};
