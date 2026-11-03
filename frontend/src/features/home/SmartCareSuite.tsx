import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container } from '../../components/ui/Container';
import {
  Activity, Camera, Watch, Footprints, BookOpen, Users,
  Sparkles, ArrowRight, Smartphone,
  Heart, Droplets, Flame, ShieldAlert
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

/* ── Keyframe Animations for Feature Cards & Wires ── */
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
  0% { top: 3px; opacity: 0.9; }
  50% { top: calc(100% - 5px); opacity: 1; }
  100% { top: 3px; opacity: 0.9; }
}
.animate-laser-sweep {
  animation: laser-sweep 2.2s ease-in-out infinite;
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
  0% { stroke-dashoffset: 160; }
  100% { stroke-dashoffset: 0; }
}
.animate-ecg-crawl {
  stroke-dasharray: 160;
  animation: ecg-crawl 2s linear infinite;
}

/* 6. Water Intake Bar Fluid Oscillation */
@keyframes fluid-level-1 {
  0%, 100% { height: 8px; }
  50% { height: 15px; }
}
@keyframes fluid-level-2 {
  0%, 100% { height: 13px; }
  50% { height: 20px; }
}
@keyframes fluid-level-3 {
  0%, 100% { height: 22px; }
  50% { height: 16px; }
}
@keyframes fluid-level-4 {
  0%, 100% { height: 16px; }
  50% { height: 24px; }
}
.animate-fluid-1 { animation: fluid-level-1 2s ease-in-out infinite; }
.animate-fluid-2 { animation: fluid-level-2 2.3s ease-in-out infinite 0.2s; }
.animate-fluid-3 { animation: fluid-level-3 1.9s ease-in-out infinite 0.4s; }
.animate-fluid-4 { animation: fluid-level-4 2.5s ease-in-out infinite 0.6s; }

/* 7. Water Drop Bounce */
@keyframes water-drip-bounce {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-2.5px) scale(1.15); }
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
`;

export const SmartCareSuite: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const rawName = user?.name || user?.fullName || '';
  const firstName = rawName.trim().split(' ')[0];
  const greetingName = isAuthenticated && firstName ? firstName : 'Wellness Seeker';

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
      const phoneVerticalOffsets = [0.28, 0.50, 0.72];
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

      // Smooth curved S / cubic bezier curve
      const dx = cx - sx;
      const cp1x = sx + dx * 0.45;
      const cp1y = sy;
      const cp2x = sx + dx * 0.55;
      const cp2y = cy;

      const d = `M ${sx.toFixed(1)} ${sy.toFixed(1)} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${cx.toFixed(1)} ${cy.toFixed(1)}`;

      let length = 200;
      try {
        const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        tempPath.setAttribute('d', d);
        length = tempPath.getTotalLength() || 200;
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
            FULLY RESPONSIVE ECOSYSTEM (MOBILE, TABLET & DESKTOP)
            Center Phone with 6 Connected Cards around it on ALL screens
        ═══════════════════════════════════════════════════════════ */}
        <div ref={hubContainerRef} className="relative py-2 sm:py-6 select-none w-full">
          {/* SVG Overlay: Curved Connectors & Travelling Light Particle */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
            <defs>
              <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="particle-bloom" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="bloom" />
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
                    stroke={isActive ? 'rgba(34, 197, 94, 0.65)' : 'rgba(34, 197, 94, 0.22)'}
                    strokeWidth={isActive ? 4 : 2}
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
                    strokeWidth={isActive ? 2 : 1.4}
                    strokeDasharray={isActive ? 'none' : '5 3'}
                    opacity={isActive ? 0.95 : 0.65}
                    className="transition-all duration-300"
                  />

                  {/* Phone edge terminal node */}
                  <circle
                    cx={p.phoneAnchor.x}
                    cy={p.phoneAnchor.y}
                    r={isActive ? 4.5 : 3}
                    fill="#22c55e"
                    stroke="#ffffff"
                    strokeWidth="1.2"
                    className="transition-all duration-300"
                  />

                  {/* Card edge terminal node */}
                  <circle
                    cx={p.cardAnchor.x}
                    cy={p.cardAnchor.y}
                    r={isActive ? 5 : 3}
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
                <circle cx={particlePos.x} cy={particlePos.y} r={10} fill="url(#particle-halo)" />
                <circle cx={particlePos.x} cy={particlePos.y} r={5} fill="#4ade80" />
                <circle cx={particlePos.x} cy={particlePos.y} r={2} fill="#ffffff" />
              </g>
            )}
          </svg>

          {/* 3-Column Ecosystem Layout: Responsive for ALL devices */}
          <div className="grid grid-cols-[1fr_minmax(105px,140px)_1fr] sm:grid-cols-[1fr_minmax(160px,210px)_1fr] lg:grid-cols-[330px_1fr_330px] xl:grid-cols-[360px_1fr_360px] gap-2 sm:gap-4 md:gap-6 items-center w-full">
            {/* ── LEFT COLUMN (3 Cards) ── */}
            <div className="flex flex-col gap-2.5 sm:gap-4 md:gap-6 min-w-0">
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
                    className={`relative rounded-xl sm:rounded-2xl md:rounded-[26px] p-2 sm:p-3.5 md:p-5.5 bg-white/95 backdrop-blur-md cursor-pointer transition-all duration-500 transform hover:-translate-y-0.5 md:hover:-translate-y-1 hover:shadow-xl border ${
                      isGlow
                        ? 'border-emerald-500 shadow-[0_0_20px_rgba(34,197,94,0.7),inset_0_0_10px_rgba(34,197,94,0.22)] scale-[1.018]'
                        : 'border-emerald-950/10 shadow-md sm:shadow-lg shadow-emerald-950/5 hover:border-emerald-500/40'
                    }`}
                  >
                    {/* Glowing border trace effect */}
                    <div
                      className={`absolute inset-0 rounded-xl sm:rounded-2xl md:rounded-[26px] pointer-events-none transition-opacity duration-500 ${
                        isGlow ? 'opacity-100 ring-2 ring-emerald-500' : 'opacity-0'
                      }`}
                      style={{
                        boxShadow: isGlow ? 'inset 0 0 12px rgba(34, 197, 94, 0.25)' : 'none',
                      }}
                    />

                    {/* Top Row: Icon + Title + Badge */}
                    <div className="flex items-start gap-1.5 sm:gap-3 mb-1 sm:mb-2">
                      <div
                        className={`w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl md:rounded-2xl ${feature.iconBg} ${feature.iconColor} flex items-center justify-center shrink-0 shadow-xs sm:shadow-md transition-transform duration-300 ${
                          isGlow ? 'scale-110' : ''
                        }`}
                      >
                        <IconComponent className="w-3.5 h-3.5 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[10px] sm:text-xs md:text-[15px] font-serif font-black text-neutral-900 leading-tight tracking-tight line-clamp-2 mb-0.5 sm:mb-1">
                          {feature.title}
                        </h3>
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[7px] sm:text-[8px] md:text-[9px] font-black tracking-wider uppercase bg-emerald-900 text-amber-300 border border-emerald-700/60 shadow-2xs">
                          <span>{feature.badgeIcon}</span>
                          <span className="truncate max-w-[70px] sm:max-w-none">{feature.badge}</span>
                        </span>
                      </div>
                    </div>

                    {/* Subtitle description (compact on mobile, full on tablet/desktop) */}
                    <p className="hidden md:block text-[11.5px] text-neutral-600 leading-relaxed mb-3.5">
                      {feature.desc}
                    </p>

                    {/* ══ DYNAMIC FEATURE MOTION WIDGETS (LEFT) ══ */}
                    {feature.widgetType === 'gluco' && (
                      <div className="rounded-lg sm:rounded-xl md:rounded-2xl p-1.5 sm:p-2.5 md:p-3 bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-stone-50/80 border border-emerald-200/90 flex items-center justify-between overflow-hidden relative">
                        <div className="flex items-center gap-1 sm:gap-2 z-10 shrink-0">
                          <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-emerald-600" />
                          </span>
                          <div>
                            <div className="hidden sm:block text-[8px] sm:text-[9px] uppercase font-bold text-neutral-500">Live CGM</div>
                            <span className="text-[9px] sm:text-xs font-black text-emerald-950 whitespace-nowrap">112 mg/dL</span>
                          </div>
                        </div>

                        {/* Continuous Flowing CGM Waveform SVG Animation */}
                        <div className="w-16 sm:w-28 md:w-36 h-6 sm:h-8 relative overflow-hidden flex items-center">
                          <div className="flex w-[200%] animate-cgm-flow absolute left-0">
                            <svg viewBox="0 0 160 32" className="w-1/2 h-6 sm:h-8 shrink-0 overflow-visible">
                              <path
                                d="M 0 18 Q 15 6, 30 18 T 60 18 T 80 8 T 100 24 T 120 16 T 160 18"
                                fill="none"
                                stroke="#16a34a"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                              />
                              <circle cx="80" cy="8" r="2.5" fill="#15803d" />
                            </svg>
                            <svg viewBox="0 0 160 32" className="w-1/2 h-6 sm:h-8 shrink-0 overflow-visible">
                              <path
                                d="M 0 18 Q 15 6, 30 18 T 60 18 T 80 8 T 100 24 T 120 16 T 160 18"
                                fill="none"
                                stroke="#16a34a"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                              />
                              <circle cx="80" cy="8" r="2.5" fill="#15803d" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}

                    {feature.widgetType === 'steps' && (
                      <div className="rounded-lg sm:rounded-xl md:rounded-2xl p-1.5 sm:p-2.5 md:p-3 bg-gradient-to-r from-amber-50/70 via-stone-50/80 to-emerald-50/70 border border-stone-200/90 flex items-center justify-between">
                        <div className="relative w-8 h-8 sm:w-11 sm:h-10 md:w-14 md:h-12 flex items-center justify-center shrink-0">
                          <svg viewBox="0 0 50 36" className="w-full h-full">
                            <path
                              d="M 5 30 A 20 20 0 0 1 45 30"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="3.5"
                              strokeLinecap="round"
                            />
                            <path
                              d="M 5 30 A 20 20 0 0 1 38 18"
                              fill="none"
                              stroke="#16a34a"
                              strokeWidth="4"
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute bottom-0.5 sm:bottom-1 animate-footstep-walk">
                            <Footprints className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-emerald-800" />
                          </div>
                        </div>

                        <div className="text-right space-y-0.5">
                          <div className="text-[9px] sm:text-xs font-black text-neutral-900 whitespace-nowrap">
                            6,420 Steps
                          </div>
                          <div className="flex items-center justify-end gap-0.5 text-[8px] sm:text-[10px] font-bold text-amber-700 whitespace-nowrap">
                            <Flame className="w-2 h-2 sm:w-3 sm:h-3 text-amber-500 fill-amber-500 animate-bounce" />
                            <span>320 kcal</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {feature.widgetType === 'diary' && (
                      <div className="rounded-lg sm:rounded-xl md:rounded-2xl p-1.5 sm:p-2.5 md:p-3 bg-gradient-to-r from-emerald-50/90 to-teal-50/80 border border-emerald-200/90 flex items-center justify-between">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <div className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg bg-teal-100/90 flex items-center justify-center animate-water-drip shrink-0">
                            <Droplets className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-teal-700" />
                          </div>
                          <div>
                            <div className="hidden sm:block text-[8px] sm:text-[9px] uppercase font-bold text-neutral-500">Hydration</div>
                            <span className="text-[9px] sm:text-xs font-black text-emerald-950 whitespace-nowrap">+250 ml</span>
                          </div>
                        </div>

                        <div className="flex items-end gap-1 h-5 sm:h-6 md:h-7 px-1.5 py-0.5 bg-white/70 rounded-lg sm:rounded-xl border border-emerald-200/60 shadow-2xs">
                          <div className="w-1.5 sm:w-2 md:w-2.5 bg-gradient-to-t from-emerald-600 to-teal-400 rounded-xs animate-fluid-1" />
                          <div className="w-1.5 sm:w-2 md:w-2.5 bg-gradient-to-t from-emerald-600 to-teal-400 rounded-xs animate-fluid-2" />
                          <div className="w-1.5 sm:w-2 md:w-2.5 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-xs animate-fluid-3" />
                          <div className="w-1.5 sm:w-2 md:w-2.5 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-xs animate-fluid-4" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── CENTER COLUMN (Phone Mockup + Pedestal Base) ── */}
            <div className="flex flex-col items-center justify-center px-0.5 sm:px-2 md:px-4 min-w-0">
              {/* Phone Mockup */}
              <div
                ref={phoneRef}
                className="relative rounded-[22px] sm:rounded-[32px] md:rounded-[40px] p-1 sm:p-2 md:p-2.5 shadow-[0_12px_35px_rgba(16,185,129,0.22),0_6px_15px_rgba(0,0,0,0.15)] transition-all duration-500 w-full max-w-[130px] sm:max-w-[190px] md:max-w-[260px]"
                style={{
                  background: 'linear-gradient(145deg, #1f2937, #111827)',
                  border: '2px solid rgba(255, 255, 255, 0.25)',
                }}
              >
                {/* Subtle Phone Outer Glow */}
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

            {/* ── RIGHT COLUMN (3 Cards) ── */}
            <div className="flex flex-col gap-2.5 sm:gap-4 md:gap-6 min-w-0">
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
                    className={`relative rounded-xl sm:rounded-2xl md:rounded-[26px] p-2 sm:p-3.5 md:p-5.5 bg-white/95 backdrop-blur-md cursor-pointer transition-all duration-500 transform hover:-translate-y-0.5 md:hover:-translate-y-1 hover:shadow-xl border ${
                      isGlow
                        ? 'border-emerald-500 shadow-[0_0_20px_rgba(34,197,94,0.7),inset_0_0_10px_rgba(34,197,94,0.22)] scale-[1.018]'
                        : 'border-emerald-950/10 shadow-md sm:shadow-lg shadow-emerald-950/5 hover:border-emerald-500/40'
                    }`}
                  >
                    {/* Glowing border trace effect */}
                    <div
                      className={`absolute inset-0 rounded-xl sm:rounded-2xl md:rounded-[26px] pointer-events-none transition-opacity duration-500 ${
                        isGlow ? 'opacity-100 ring-2 ring-emerald-500' : 'opacity-0'
                      }`}
                      style={{
                        boxShadow: isGlow ? 'inset 0 0 12px rgba(34, 197, 94, 0.25)' : 'none',
                      }}
                    />

                    {/* Top Row: Icon + Title + Badge */}
                    <div className="flex items-start gap-1.5 sm:gap-3 mb-1 sm:mb-2">
                      <div
                        className={`w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl md:rounded-2xl ${feature.iconBg} ${feature.iconColor} flex items-center justify-center shrink-0 shadow-xs sm:shadow-md transition-transform duration-300 ${
                          isGlow ? 'scale-110' : ''
                        }`}
                      >
                        <IconComponent className="w-3.5 h-3.5 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[10px] sm:text-xs md:text-[15px] font-serif font-black text-neutral-900 leading-tight tracking-tight line-clamp-2 mb-0.5 sm:mb-1">
                          {feature.title}
                        </h3>
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[7px] sm:text-[8px] md:text-[9px] font-black tracking-wider uppercase bg-emerald-900 text-amber-300 border border-emerald-700/60 shadow-2xs">
                          <span>{feature.badgeIcon}</span>
                          <span className="truncate max-w-[70px] sm:max-w-none">{feature.badge}</span>
                        </span>
                      </div>
                    </div>

                    {/* Subtitle description (compact on mobile, full on tablet/desktop) */}
                    <p className="hidden md:block text-[11.5px] text-neutral-600 leading-relaxed mb-3.5">
                      {feature.desc}
                    </p>

                    {/* ══ DYNAMIC FEATURE MOTION WIDGETS (RIGHT) ══ */}
                    {feature.widgetType === 'scan' && (
                      <div className="rounded-lg sm:rounded-xl md:rounded-2xl p-1.5 sm:p-2.5 md:p-3 bg-gradient-to-r from-emerald-50/90 to-stone-50/80 border border-emerald-200/90 flex items-center justify-between">
                        <div className="relative w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-amber-100/80 border border-amber-300 flex items-center justify-center text-sm sm:text-xl md:text-2xl shadow-xs overflow-hidden shrink-0">
                          <span>🥗</span>
                          <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t border-l border-emerald-700" />
                          <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 border-t border-r border-emerald-700" />
                          <div className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 border-b border-l border-emerald-700" />
                          <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b border-r border-emerald-700" />
                          <div className="absolute left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-400 to-emerald-500/0 shadow-[0_0_6px_#22c55e] animate-laser-sweep" />
                        </div>

                        <div className="space-y-0.5 text-right text-[8px] sm:text-[9px] md:text-[10.5px]">
                          <div className="font-bold text-neutral-600 whitespace-nowrap">
                            <span className="hidden sm:inline">Calories: </span><span className="font-black text-neutral-900">420 kcal</span>
                          </div>
                          <div className="font-bold text-neutral-600 whitespace-nowrap">
                            <span className="hidden sm:inline">Carbs: </span><span className="font-black text-neutral-900">38 g</span>
                          </div>
                          <div className="font-bold text-neutral-600 whitespace-nowrap">
                            <span className="hidden sm:inline">GI: </span><span className="font-black text-emerald-800">Low</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {feature.widgetType === 'ble' && (
                      <div className="rounded-lg sm:rounded-xl md:rounded-2xl p-1.5 sm:p-2.5 md:p-3 bg-gradient-to-r from-rose-50/80 via-stone-50/80 to-emerald-50/80 border border-stone-200/90 flex items-center justify-between">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <div className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg sm:rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                            <Heart className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-rose-600 fill-rose-600 animate-heartbeat-lubdub" />
                          </div>
                          <div>
                            <div className="hidden sm:block text-[8px] sm:text-[9px] uppercase font-bold text-neutral-500">Pulse</div>
                            <span className="text-[9px] sm:text-xs font-black text-neutral-900 whitespace-nowrap">74 BPM</span>
                          </div>
                        </div>

                        <div className="w-10 sm:w-16 md:w-20 h-4 sm:h-5 flex items-center">
                          <svg viewBox="0 0 80 20" className="w-full h-full overflow-visible">
                            <path
                              d="M 0 10 L 22 10 L 26 2 L 31 18 L 36 6 L 41 14 L 46 10 L 80 10"
                              fill="none"
                              stroke="#f43f5e"
                              strokeWidth="2"
                              strokeLinecap="round"
                              className="animate-ecg-crawl"
                            />
                          </svg>
                        </div>

                        <div className="text-right">
                          <div className="hidden sm:block text-[8px] sm:text-[9px] uppercase font-bold text-neutral-400">SpO2</div>
                          <div className="text-[9px] sm:text-xs font-black text-emerald-800 flex items-center justify-end gap-0.5">
                            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            <span>98%</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {feature.widgetType === 'community' && (
                      <div className="rounded-lg sm:rounded-xl md:rounded-2xl p-1.5 sm:p-2.5 md:p-3 bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-amber-50/70 border border-emerald-200/90 flex items-center justify-between">
                        <div className="flex items-center gap-1 sm:gap-1.5">
                          <div className="relative flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 shrink-0">
                            <div className="absolute inset-0 rounded-full bg-emerald-400 animate-radar-sonar" />
                            <ShieldAlert className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-800 relative z-10" />
                          </div>
                          <div>
                            <div className="hidden sm:block text-[8px] sm:text-[9px] uppercase font-bold text-neutral-500">Network</div>
                            <span className="text-[9px] sm:text-[11px] font-black text-emerald-950 whitespace-nowrap">Peer SOS</span>
                          </div>
                        </div>

                        <div className="flex items-center -space-x-1.5 sm:-space-x-2">
                          <div className="relative">
                            <div className="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full bg-emerald-700 text-white text-[7px] sm:text-[9px] font-bold flex items-center justify-center border-1.5 border-white shadow-xs">
                              AK
                            </div>
                            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-400 absolute bottom-0 right-0 ring-1 ring-white" />
                          </div>
                          <div className="relative">
                            <div className="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full bg-amber-600 text-white text-[7px] sm:text-[9px] font-bold flex items-center justify-center border-1.5 border-white shadow-xs">
                              RS
                            </div>
                            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-400 absolute bottom-0 right-0 ring-1 ring-white" />
                          </div>
                          <div className="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full bg-emerald-900 text-amber-300 text-[8px] sm:text-[10px] font-black flex items-center justify-center border-1.5 border-white shadow-xs">
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
