import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container } from '../../components/ui/Container';
import {
  Activity, Camera, Watch, Footprints, BookOpen, Users,
  Sparkles, ArrowRight, Smartphone,
  Heart, Plus
} from 'lucide-react';
import { PlayStoreModal } from '../../components/ui/PlayStoreModal';
import { useAuthStore } from '../../store/useAuthStore';

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
    iconBg: 'bg-[#0f4a2d]',
    iconColor: 'text-[#4ade80]',
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
    iconBg: 'bg-[#ea580c]',
    iconColor: 'text-white',
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
    iconBg: 'bg-[#064e3b]',
    iconColor: 'text-[#34d399]',
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
    iconBg: 'bg-[#0f4a2d]',
    iconColor: 'text-[#4ade80]',
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
    iconBg: 'bg-[#ea580c]',
    iconColor: 'text-white',
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
    iconBg: 'bg-[#064e3b]',
    iconColor: 'text-[#34d399]',
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

/* ── Keyframe Animations for Feature Cards & Wires ── */
const FEATURE_MOTION_STYLES = `
/* 1. CGM Wave Flow Animation */
@keyframes cgm-flow-wave {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.animate-cgm-flow {
  animation: cgm-flow-wave 3.5s linear infinite;
}

/* 2. AI Scanner Laser Sweep */
@keyframes laser-sweep {
  0% { top: 2px; opacity: 0.9; }
  50% { top: calc(100% - 4px); opacity: 1; }
  100% { top: 2px; opacity: 0.9; }
}
.animate-laser-sweep {
  animation: laser-sweep 2s ease-in-out infinite;
}

/* 3. Footstep Walking Rhythm */
@keyframes footstep-walk {
  0%, 100% { transform: rotate(-8deg) translateY(0); }
  50% { transform: rotate(10deg) translateY(-2px); }
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
  0% { stroke-dashoffset: 140; }
  100% { stroke-dashoffset: 0; }
}
.animate-ecg-crawl {
  stroke-dasharray: 140;
  animation: ecg-crawl 2s linear infinite;
}

/* 6. Water Intake Bar Fluid Oscillation */
@keyframes fluid-level-1 {
  0%, 100% { height: 8px; }
  50% { height: 14px; }
}
@keyframes fluid-level-2 {
  0%, 100% { height: 13px; }
  50% { height: 19px; }
}
@keyframes fluid-level-3 {
  0%, 100% { height: 22px; }
  50% { height: 17px; }
}
@keyframes fluid-level-4 {
  0%, 100% { height: 17px; }
  50% { height: 25px; }
}
.animate-fluid-1 { animation: fluid-level-1 2s ease-in-out infinite; }
.animate-fluid-2 { animation: fluid-level-2 2.3s ease-in-out infinite 0.2s; }
.animate-fluid-3 { animation: fluid-level-3 1.9s ease-in-out infinite 0.4s; }
.animate-fluid-4 { animation: fluid-level-4 2.5s ease-in-out infinite 0.6s; }

/* 7. Golden Flare Underglow */
@keyframes golden-flare-pulse {
  0%, 100% { opacity: 0.6; transform: scaleX(0.95); }
  50% { opacity: 1; transform: scaleX(1.05); }
}
.animate-golden-flare {
  animation: golden-flare-pulse 3s ease-in-out infinite;
}
`;

export const SmartCareSuite: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const rawName = user?.name || user?.fullName || '';
  const firstName = rawName.trim().split(' ')[0];
  const greetingName = isAuthenticated && firstName ? firstName : 'Abhay';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDesc, setModalDesc] = useState('');
  const [activeGlowCard, setActiveGlowCard] = useState<number | null>(null);
  const [paths, setPaths] = useState<PathData[]>([]);
  const [particlePos, setParticlePos] = useState<{ x: number; y: number; activeIdx: number } | null>(null);

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

      // Vertical offsets on the phone's left/right border to spread lines
      const phoneVerticalOffsets = [0.26, 0.50, 0.74];
      const slotRatio = phoneVerticalOffsets[feature.slot] ?? 0.5;

      if (feature.side === 'left') {
        cx = cardRect.right - containerRect.left;
        cy = cardRect.top + cardRect.height / 2 - containerRect.top;
        sx = phoneRect.left - containerRect.left + 3;
        sy = phoneRect.top + phoneRect.height * slotRatio - containerRect.top;
      } else {
        cx = cardRect.left - containerRect.left;
        cy = cardRect.top + cardRect.height / 2 - containerRect.top;
        sx = phoneRect.right - containerRect.left - 3;
        sy = phoneRect.top + phoneRect.height * slotRatio - containerRect.top;
      }

      // Smooth long sweeping S-curve
      const dx = cx - sx;
      const bend = Math.abs(dx) * 0.55;
      const cp1x = sx + (feature.side === 'left' ? -bend : bend);
      const cp1y = sy;
      const cp2x = cx + (feature.side === 'left' ? bend : -bend);
      const cp2y = cy;

      const d = `M ${sx.toFixed(1)} ${sy.toFixed(1)} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${cx.toFixed(1)} ${cy.toFixed(1)}`;

      let length = 280;
      try {
        const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        tempPath.setAttribute('d', d);
        length = tempPath.getTotalLength() || 280;
      } catch {
        const dist = Math.hypot(cx - sx, cy - sy);
        length = dist * 1.25;
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

  // Recalculate on window resize, zoom, orientation, and container dimension change
  useEffect(() => {
    updateConnectorPaths();
    window.addEventListener('resize', updateConnectorPaths);

    let resizeObserver: ResizeObserver | null = null;
    if (hubContainerRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateConnectorPaths();
      });
      resizeObserver.observe(hubContainerRef.current);
    }

    const t1 = setTimeout(updateConnectorPaths, 200);
    const t2 = setTimeout(updateConnectorPaths, 600);

    return () => {
      window.removeEventListener('resize', updateConnectorPaths);
      if (resizeObserver) resizeObserver.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [updateConnectorPaths]);

  // Animation Timeline: sequential light particle travel + card border pulse
  useEffect(() => {
    if (paths.length < 6) return;

    let animId = 0;
    let startTime: number | null = null;
    let currentIdx = 0;

    const TRAVEL_DURATION = 1400; // slightly longer for longer chains
    const GLOW_HOLD_DURATION = 700;
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

  return (
    <section
      ref={sectionRef}
      id="care-suite"
      className="py-12 md:py-24 bg-gradient-to-b from-[#f7faf8] via-[#eef7f1]/60 to-background border-y border-border relative overflow-hidden"
    >
      {/* Inject feature motion keyframe styles */}
      <style>{FEATURE_MOTION_STYLES}</style>

      {/* Background Soft Glow Orbs */}
      <div className="absolute top-1/4 -left-28 w-[450px] h-[450px] bg-emerald-400/12 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-28 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-300/8 rounded-full blur-3xl pointer-events-none" />

      <Container className="relative z-10 max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-16 gap-4 sm:gap-6 text-center md:text-left">
          <div className="space-y-2.5 sm:space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-emerald-900/10 border border-emerald-900/20 text-emerald-900 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider backdrop-blur-md shadow-2xs">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
              <span>Premium Mobile Health &amp; Care Suite</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-black text-neutral-900 leading-tight">
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
            className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-emerald-800 via-emerald-900 to-emerald-950 hover:from-emerald-900 hover:to-emerald-950 px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl shadow-lg shadow-emerald-900/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 group border border-emerald-700/50 cursor-pointer mx-auto md:mx-0 shrink-0"
          >
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>Download App on Google Play</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform text-amber-400" />
          </button>
        </div>

        {/* ════════════════════════════════════════════════════════════
            SQUARE CARDS & LONGER CHAIN ECOSYSTEM
            Cards are square-proportioned, allowing wide spacing and
            dramatic, longer sweeping curved connector chains!
        ═══════════════════════════════════════════════════════════ */}
        <div ref={hubContainerRef} className="relative py-2 sm:py-6 select-none w-full">
          {/* SVG Overlay: Longer Sweeping Curved Connectors & Travelling Light Particle */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
            <defs>
              <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="particle-bloom" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4.5" result="bloom" />
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
                  <path
                    d={p.d}
                    fill="none"
                    stroke={isActive ? 'rgba(34, 197, 94, 0.75)' : 'rgba(34, 197, 94, 0.28)'}
                    strokeWidth={isActive ? 4.5 : 2.4}
                    filter="url(#neon-glow)"
                    className="transition-all duration-300"
                  />
                  <path
                    ref={(el) => {
                      pathElsRef.current[i] = el;
                    }}
                    d={p.d}
                    fill="none"
                    stroke={isActive ? '#22c55e' : '#16a34a'}
                    strokeWidth={isActive ? 2.4 : 1.6}
                    strokeDasharray={isActive ? 'none' : '5 4'}
                    opacity={isActive ? 0.95 : 0.75}
                    className="transition-all duration-300"
                  />
                  <circle
                    cx={p.phoneAnchor.x}
                    cy={p.phoneAnchor.y}
                    r={isActive ? 5 : 3.5}
                    fill="#22c55e"
                    stroke="#ffffff"
                    strokeWidth="1.2"
                    className="transition-all duration-300"
                  />
                  <circle
                    cx={p.cardAnchor.x}
                    cy={p.cardAnchor.y}
                    r={isActive ? 5.5 : 3.5}
                    fill={isActive ? '#4ade80' : '#16a34a'}
                    stroke="#ffffff"
                    strokeWidth="1.2"
                    className="transition-all duration-300"
                  />
                </g>
              );
            })}

            {/* Travelling Light Particle */}
            {particlePos && (
              <g filter="url(#particle-bloom)">
                <circle cx={particlePos.x} cy={particlePos.y} r={12} fill="url(#particle-halo)" />
                <circle cx={particlePos.x} cy={particlePos.y} r={5.5} fill="#4ade80" />
                <circle cx={particlePos.x} cy={particlePos.y} r={2.5} fill="#ffffff" />
              </g>
            )}
          </svg>

          {/* 3-Column Ecosystem Layout: Square Cards with Wider Gaps for LONGER CHAINS */}
          <div className="grid grid-cols-[1fr_minmax(105px,140px)_1fr] sm:grid-cols-[1fr_minmax(160px,210px)_1fr] lg:grid-cols-[280px_1fr_280px] xl:grid-cols-[300px_1fr_300px] gap-3 sm:gap-6 md:gap-10 lg:gap-14 xl:gap-20 items-center w-full">
            
            {/* ══════════════════════════════════════════════════════════
                LEFT COLUMN: 3 SQUARE CARDS
            ═══════════════════════════════════════════════════════════ */}
            <div className="flex flex-col gap-3.5 sm:gap-6 md:gap-8 min-w-0">
              {FEATURES.filter((f) => f.side === 'left').map((feature) => {
                const globalIdx = FEATURES.findIndex((f) => f.id === feature.id);
                const isGlow = activeGlowCard === globalIdx;
                const IconComponent = feature.icon;

                return (
                  <div key={feature.id} className="relative group">
                    {/* Golden Ambient Flare Underglow */}
                    <div className="absolute -bottom-1.5 left-4 right-4 h-1.5 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent blur-sm pointer-events-none animate-golden-flare" />

                    <div
                      ref={(el) => {
                        cardRefs.current[globalIdx] = el;
                      }}
                      onClick={() => openAppModal(feature.title, feature.featureDetails)}
                      className={`relative rounded-2xl sm:rounded-3xl p-3 sm:p-4.5 md:p-5 bg-white/95 backdrop-blur-md cursor-pointer transition-all duration-500 transform hover:-translate-y-1 hover:shadow-2xl border flex flex-col justify-between ${
                        isGlow
                          ? 'border-emerald-500 shadow-[0_0_24px_rgba(34,197,94,0.7),inset_0_0_12px_rgba(34,197,94,0.22)] scale-[1.02]'
                          : 'border-emerald-950/10 shadow-[0_10px_25px_rgba(0,0,0,0.05)] hover:border-emerald-500/40'
                      }`}
                    >
                      {/* Glowing border trace effect */}
                      <div
                        className={`absolute inset-0 rounded-2xl sm:rounded-3xl pointer-events-none transition-opacity duration-500 ${
                          isGlow ? 'opacity-100 ring-2 ring-emerald-500' : 'opacity-0'
                        }`}
                        style={{
                          boxShadow: isGlow ? 'inset 0 0 14px rgba(34, 197, 94, 0.25)' : 'none',
                        }}
                      />

                      {/* Square Card Header: Icon + Badge Pill */}
                      <div className="flex items-center justify-between gap-1.5 mb-2 sm:mb-2.5">
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-xl sm:rounded-2xl ${feature.iconBg} ${feature.iconColor} flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 ${
                            isGlow ? 'scale-110' : ''
                          }`}
                        >
                          <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5" />
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[7.5px] sm:text-[8.5px] font-black tracking-wider uppercase bg-[#0f4a2d] text-amber-300 border border-emerald-700/60 shadow-2xs">
                          <span className="text-amber-400">{feature.badgeIcon}</span>
                          <span className="truncate max-w-[80px] sm:max-w-none">{feature.badge}</span>
                        </span>
                      </div>

                      {/* Square Card Title & Description */}
                      <div className="mb-2 sm:mb-3">
                        <h3 className="text-[11px] sm:text-xs md:text-sm font-serif font-black text-neutral-900 leading-snug tracking-tight mb-1">
                          {feature.title}
                        </h3>
                        <p className="hidden md:block text-[11px] text-neutral-500 leading-relaxed line-clamp-2">
                          {feature.desc}
                        </p>
                      </div>

                      {/* ══ Square Card Bottom: Visual Feature Widget ══ */}
                      {feature.widgetType === 'gluco' && (
                        <div className="w-full rounded-xl sm:rounded-2xl p-2 bg-gradient-to-r from-emerald-50/80 to-stone-50/80 border border-emerald-200/80 shadow-inner">
                          <div className="flex items-center justify-between mb-1 px-1">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-[10px] sm:text-xs font-black text-neutral-900">112 mg/dL</span>
                            </div>
                            <span className="text-[8px] font-bold text-neutral-400 uppercase">Steady</span>
                          </div>
                          <div className="w-full h-7 relative overflow-hidden flex items-center">
                            <div className="flex w-[200%] animate-cgm-flow absolute left-0">
                              <svg viewBox="0 0 160 30" className="w-1/2 h-7 shrink-0 overflow-visible">
                                <path
                                  d="M 0 18 Q 20 6, 40 18 T 80 16 T 105 8 T 125 22 T 160 14"
                                  fill="none"
                                  stroke="#16a34a"
                                  strokeWidth="2.4"
                                  strokeLinecap="round"
                                />
                                <circle cx="160" cy="14" r="3" fill="#16a34a" />
                              </svg>
                              <svg viewBox="0 0 160 30" className="w-1/2 h-7 shrink-0 overflow-visible">
                                <path
                                  d="M 0 18 Q 20 6, 40 18 T 80 16 T 105 8 T 125 22 T 160 14"
                                  fill="none"
                                  stroke="#16a34a"
                                  strokeWidth="2.4"
                                  strokeLinecap="round"
                                />
                                <circle cx="160" cy="14" r="3" fill="#16a34a" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}

                      {feature.widgetType === 'steps' && (
                        <div className="w-full rounded-xl sm:rounded-2xl p-2 bg-gradient-to-r from-amber-50/60 to-stone-50/80 border border-stone-200/90 shadow-inner flex items-center justify-between">
                          <div className="relative w-10 h-9 sm:w-11 sm:h-10 flex items-center justify-center shrink-0">
                            <svg viewBox="0 0 50 36" className="w-full h-full">
                              <path
                                d="M 6 30 A 19 19 0 0 1 44 30"
                                fill="none"
                                stroke="#e5e7eb"
                                strokeWidth="4"
                                strokeLinecap="round"
                              />
                              <path
                                d="M 6 30 A 19 19 0 0 1 38 17"
                                fill="none"
                                stroke="#16a34a"
                                strokeWidth="4.5"
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute bottom-1 animate-footstep-walk">
                              <Footprints className="w-3.5 h-3.5 text-emerald-800" />
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-[10px] sm:text-xs font-black text-neutral-900 leading-tight">
                              6,420 Steps
                            </div>
                            <div className="text-[8.5px] sm:text-[10px] font-bold text-neutral-500">
                              320 kcal
                            </div>
                          </div>
                        </div>
                      )}

                      {feature.widgetType === 'diary' && (
                        <div className="w-full rounded-xl sm:rounded-2xl p-2 bg-gradient-to-r from-emerald-50/80 to-stone-50/80 border border-emerald-200/80 shadow-inner flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">💧</span>
                            <span className="text-[10px] sm:text-xs font-black text-neutral-900">+250 ml</span>
                          </div>
                          <div className="flex items-end gap-1.5 h-6 px-1">
                            <div className="w-2 bg-emerald-400 rounded-xs animate-fluid-1" />
                            <div className="w-2 bg-emerald-500 rounded-xs animate-fluid-2" />
                            <div className="w-2 bg-emerald-600 rounded-xs animate-fluid-3" />
                            <div className="w-2 bg-emerald-500 rounded-xs animate-fluid-4" />
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>

            {/* ══════════════════════════════════════════════════════════
                CENTER COLUMN (Phone Mockup + Pedestal Stage)
            ═══════════════════════════════════════════════════════════ */}
            <div className="flex flex-col items-center justify-center px-0.5 sm:px-2 md:px-4 min-w-0">
              {/* Phone Mockup */}
              <div
                ref={phoneRef}
                className="relative rounded-[22px] sm:rounded-[32px] md:rounded-[40px] p-1 sm:p-2 md:p-2.5 shadow-[0_15px_45px_rgba(16,185,129,0.25),0_8px_20px_rgba(0,0,0,0.18)] transition-all duration-500 w-full max-w-[130px] sm:max-w-[190px] md:max-w-[260px]"
                style={{
                  background: 'linear-gradient(145deg, #1f2937, #111827)',
                  border: '2px solid rgba(255, 255, 255, 0.25)',
                }}
              >
                {/* Outer Glow */}
                <div className="absolute -inset-1.5 rounded-[30px] bg-emerald-500/20 blur-md pointer-events-none animate-pulse" />

                {/* Speaker pill notch */}
                <div className="relative z-20 flex justify-center pb-1 pt-0.5 sm:pb-2 sm:pt-1">
                  <div className="w-10 sm:w-16 md:w-20 h-2.5 sm:h-3.5 md:h-4.5 bg-black rounded-full flex items-center justify-end pr-1 sm:pr-2">
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500/80 animate-ping" />
                  </div>
                </div>

                {/* Phone Screen Display */}
                <div className="relative rounded-[16px] sm:rounded-[24px] md:rounded-[32px] overflow-hidden bg-gradient-to-b from-emerald-50/90 via-white to-[#eef7f1] p-1.5 sm:p-3 md:p-4 text-center flex flex-col justify-between min-h-[220px] sm:min-h-[340px] md:min-h-[440px] border border-white/60">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between text-[7px] sm:text-[9px] md:text-[11px] font-bold text-neutral-800 px-0.5">
                    <span>9:41</span>
                    <div className="flex items-center gap-0.5 sm:gap-1 text-[6px] sm:text-[8px] md:text-[10px]">
                      <span>5G</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Brand Logo & User Greeting */}
                  <div className="flex flex-col items-center my-0.5 sm:my-1 space-y-0.5">
                    <img
                      src="/kosmico-logo.png"
                      alt="Kosmico"
                      className="w-6 h-6 sm:w-9 sm:h-9 md:w-12 md:h-12 object-contain drop-shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="text-[8px] sm:text-[10px] md:text-xs font-black text-emerald-950 uppercase tracking-wider">
                      Kosmico
                    </div>
                    <div className="text-[7.5px] sm:text-[10px] md:text-[12px] font-bold text-neutral-700 whitespace-nowrap">
                      Good Morning, {greetingName} ☀️
                    </div>
                  </div>

                  {/* Central Wellness Score Radial Ring */}
                  <div className="relative w-18 h-18 sm:w-26 sm:h-26 md:w-36 md:h-36 mx-auto my-1 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="7"
                      />
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
                      <span className="text-[6.5px] sm:text-[8px] md:text-[10px] font-bold text-neutral-500 uppercase tracking-tight">
                        Wellness
                      </span>
                      <span className="text-sm sm:text-2xl md:text-3xl font-black text-emerald-950 leading-none my-0.5">
                        87%
                      </span>
                      <Activity className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-emerald-600 animate-pulse" />
                    </div>
                  </div>

                  {/* Mountain wave decoration & Bottom Nav */}
                  <div>
                    <div className="h-4 sm:h-7 md:h-10 w-full mb-0.5">
                      <svg viewBox="0 0 200 40" className="w-full h-full text-emerald-600/20 fill-current">
                        <path d="M 0 35 Q 50 15, 100 28 T 200 20 L 200 40 L 0 40 Z" />
                      </svg>
                    </div>

                    <div className="rounded-lg sm:rounded-xl md:rounded-2xl bg-white/90 shadow-xs sm:shadow-md p-1 sm:p-1.5 md:p-2 flex items-center justify-around border border-emerald-900/10 text-neutral-600">
                      <span className="text-emerald-800 text-[8px] sm:text-[10px] md:text-[11px] font-bold">🏠</span>
                      <span className="text-neutral-500 text-[8px] sm:text-[10px] md:text-[11px]">❤️</span>
                      <div className="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-[8px] sm:text-xs shadow-xs">
                        +
                      </div>
                      <span className="text-neutral-500 text-[8px] sm:text-[10px] md:text-[11px]">👥</span>
                      <span className="text-neutral-500 text-[8px] sm:text-[10px] md:text-[11px]">👤</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3D Tiered Pedestal Stage under Phone */}
              <div className="relative mt-1 sm:mt-2 flex flex-col items-center w-full">
                <div
                  className="w-24 sm:w-36 md:w-48 h-3 sm:h-4 md:h-5 rounded-[50%] bg-gradient-to-r from-emerald-800 via-amber-400 to-emerald-900 shadow-xs sm:shadow-md border border-amber-300/40 relative z-10"
                />
                <div
                  className="w-28 sm:w-44 md:w-56 h-4 sm:h-5 md:h-7 rounded-[50%] bg-gradient-to-b from-emerald-900 to-emerald-950 -mt-1.5 sm:-mt-2 md:-mt-2.5 shadow-md sm:shadow-xl border border-emerald-700/50 relative z-0"
                />
                <div className="w-32 sm:w-52 md:w-64 h-3 sm:h-5 md:h-6 rounded-full bg-emerald-400/25 blur-sm sm:blur-lg -mt-2 pointer-events-none" />
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
                RIGHT COLUMN: 3 SQUARE CARDS
            ═══════════════════════════════════════════════════════════ */}
            <div className="flex flex-col gap-3.5 sm:gap-6 md:gap-8 min-w-0">
              {FEATURES.filter((f) => f.side === 'right').map((feature) => {
                const globalIdx = FEATURES.findIndex((f) => f.id === feature.id);
                const isGlow = activeGlowCard === globalIdx;
                const IconComponent = feature.icon;

                return (
                  <div key={feature.id} className="relative group">
                    {/* Golden Ambient Flare Underglow */}
                    <div className="absolute -bottom-1.5 left-4 right-4 h-1.5 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent blur-sm pointer-events-none animate-golden-flare" />

                    <div
                      ref={(el) => {
                        cardRefs.current[globalIdx] = el;
                      }}
                      onClick={() => openAppModal(feature.title, feature.featureDetails)}
                      className={`relative rounded-2xl sm:rounded-3xl p-3 sm:p-4.5 md:p-5 bg-white/95 backdrop-blur-md cursor-pointer transition-all duration-500 transform hover:-translate-y-1 hover:shadow-2xl border flex flex-col justify-between ${
                        isGlow
                          ? 'border-emerald-500 shadow-[0_0_24px_rgba(34,197,94,0.7),inset_0_0_12px_rgba(34,197,94,0.22)] scale-[1.02]'
                          : 'border-emerald-950/10 shadow-[0_10px_25px_rgba(0,0,0,0.05)] hover:border-emerald-500/40'
                      }`}
                    >
                      {/* Glowing border trace effect */}
                      <div
                        className={`absolute inset-0 rounded-2xl sm:rounded-3xl pointer-events-none transition-opacity duration-500 ${
                          isGlow ? 'opacity-100 ring-2 ring-emerald-500' : 'opacity-0'
                        }`}
                        style={{
                          boxShadow: isGlow ? 'inset 0 0 14px rgba(34, 197, 94, 0.25)' : 'none',
                        }}
                      />

                      {/* Square Card Header: Icon + Badge Pill */}
                      <div className="flex items-center justify-between gap-1.5 mb-2 sm:mb-2.5">
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-xl sm:rounded-2xl ${feature.iconBg} ${feature.iconColor} flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 ${
                            isGlow ? 'scale-110' : ''
                          }`}
                        >
                          <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5" />
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[7.5px] sm:text-[8.5px] font-black tracking-wider uppercase bg-[#0f4a2d] text-amber-300 border border-emerald-700/60 shadow-2xs">
                          <span className="text-amber-400">{feature.badgeIcon}</span>
                          <span className="truncate max-w-[80px] sm:max-w-none">{feature.badge}</span>
                        </span>
                      </div>

                      {/* Square Card Title & Description */}
                      <div className="mb-2 sm:mb-3">
                        <h3 className="text-[11px] sm:text-xs md:text-sm font-serif font-black text-neutral-900 leading-snug tracking-tight mb-1">
                          {feature.title}
                        </h3>
                        <p className="hidden md:block text-[11px] text-neutral-500 leading-relaxed line-clamp-2">
                          {feature.desc}
                        </p>
                      </div>

                      {/* ══ Square Card Bottom: Visual Feature Widget ══ */}
                      {feature.widgetType === 'scan' && (
                        <div className="w-full rounded-xl sm:rounded-2xl p-2 bg-gradient-to-r from-emerald-50/80 to-stone-50/80 border border-emerald-200/80 shadow-inner flex items-center gap-2">
                          {/* Salad Bowl Photo with Reticle Viewfinder Brackets */}
                          <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl overflow-hidden shadow-xs border border-emerald-600/30 shrink-0 bg-stone-100">
                            <svg viewBox="0 0 60 60" className="w-full h-full object-cover">
                              <defs>
                                <radialGradient id="salad-bowl-bg-square" cx="50%" cy="50%" r="50%">
                                  <stop offset="0%" stopColor="#86efac" />
                                  <stop offset="60%" stopColor="#22c55e" />
                                  <stop offset="100%" stopColor="#15803d" />
                                </radialGradient>
                              </defs>
                              <circle cx="30" cy="30" r="28" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
                              <circle cx="30" cy="30" r="24" fill="url(#salad-bowl-bg-square)" />
                              <circle cx="24" cy="22" r="5" fill="#ef4444" />
                              <circle cx="36" cy="25" r="4.5" fill="#ef4444" />
                              <circle cx="30" cy="34" r="5.5" fill="#f97316" />
                              <ellipse cx="22" cy="32" rx="6" ry="3" fill="#15803d" transform="rotate(-20 22 32)" />
                              <ellipse cx="38" cy="33" rx="5" ry="3" fill="#16a34a" transform="rotate(30 38 33)" />
                              <circle cx="28" cy="27" r="3" fill="#ffffff" opacity="0.8" />
                              <circle cx="33" cy="21" r="2" fill="#ca8a04" />
                            </svg>
                            <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t-2 border-l-2 border-emerald-800" />
                            <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 border-t-2 border-r-2 border-emerald-800" />
                            <div className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 border-b-2 border-l-2 border-emerald-800" />
                            <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b-2 border-r-2 border-emerald-800" />
                            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-400 to-emerald-500/0 shadow-[0_0_6px_#22c55e] animate-laser-sweep" />
                          </div>

                          <div className="space-y-0.5 text-[8px] sm:text-[9px] leading-tight">
                            <div className="font-bold text-neutral-600 whitespace-nowrap">
                              <span className="text-emerald-700 font-black mr-0.5">●</span>Cal: <span className="font-black text-neutral-900">420 kcal</span>
                            </div>
                            <div className="font-bold text-neutral-600 whitespace-nowrap">
                              <span className="text-amber-600 font-black mr-0.5">●</span>Carbs: <span className="font-black text-neutral-900">38 g</span>
                            </div>
                            <div className="font-bold text-neutral-600 whitespace-nowrap">
                              <span className="text-teal-700 font-black mr-0.5">●</span>GI: <span className="font-black text-emerald-800">Low</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {feature.widgetType === 'ble' && (
                        <div className="w-full rounded-xl sm:rounded-2xl p-2 bg-gradient-to-r from-rose-50/70 to-stone-50/80 border border-stone-200/90 shadow-inner flex items-center justify-between">
                          <div className="flex items-center gap-1 shrink-0">
                            <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600 animate-heartbeat-lubdub" />
                            <span className="text-[10px] sm:text-xs font-black text-neutral-900 whitespace-nowrap">74 BPM</span>
                          </div>

                          <div className="w-10 sm:w-14 h-5 flex items-center">
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

                          <div className="text-right shrink-0">
                            <div className="text-[7.5px] text-neutral-400 uppercase font-bold">SpO2</div>
                            <div className="text-[10px] sm:text-xs font-black text-neutral-900">98%</div>
                          </div>
                        </div>
                      )}

                      {feature.widgetType === 'community' && (
                        <div className="w-full rounded-xl sm:rounded-2xl p-2 bg-gradient-to-r from-emerald-50/80 to-amber-50/60 border border-emerald-200/80 shadow-inner flex items-center justify-center">
                          <div className="flex items-center -space-x-1.5 sm:-space-x-2">
                            <img
                              src="/assets/blogs/author-ritu-verma.jpg"
                              alt="Community Member"
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-white shadow-xs"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            <img
                              src="/assets/blogs/rohan-verma.jpg"
                              alt="Community Member"
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-white shadow-xs"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            <img
                              src="/assets/blogs/dr-anita-deshmukh.jpg"
                              alt="Clinical Lead"
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-white shadow-xs"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0f4a2d] text-amber-300 font-black text-xs flex items-center justify-center border-2 border-white shadow-xs hover:scale-110 transition-transform">
                              <Plus className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>

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
