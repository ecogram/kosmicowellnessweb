import { useState, useEffect, useRef } from 'react';
import { Activity, Heart, ShieldAlert, Scale, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Container } from '../../components/ui/Container';

const healthCards = [
  {
    icon: Activity,
    badge: 'Zero Glycemic Index',
    title: 'Diabetic & Pre-Diabetic Friendly',
    description: 'Causes 0 blood sugar spikes and 0 insulin surges. Fully safe for daily consumption by Type-1 and Type-2 diabetics.',
    highlights: ['0 Blood Glucose Impact', 'HbA1c Safe', 'Doctor Recommended'],
    theme: {
      gradient: 'from-emerald-500/15 via-teal-50/70 to-emerald-100/50',
      border: 'border-emerald-400/80',
      shadow: 'shadow-xl shadow-emerald-500/15',
      accentBar: 'from-emerald-500 via-teal-400 to-emerald-500',
      badgeBg: 'bg-emerald-100/90 text-emerald-900 border-emerald-300/70',
      iconBg: 'bg-emerald-100 text-emerald-900',
      iconBorder: 'border-emerald-300/80',
      titleColor: 'text-emerald-950',
      dotColor: 'bg-emerald-500',
      glowBg: 'from-emerald-500/20 to-teal-400/10'
    }
  },
  {
    icon: Heart,
    badge: 'Hormonal Balance',
    title: 'PCOS & PCOD Care',
    description: 'Natural monk fruit mogrosides reduce sugar-induced systemic inflammation, helping manage insulin resistance and hormonal acne.',
    highlights: ['Zero Inflammatory Sugars', 'Helps Insulin Sensitivity', 'Hormone-Safe Sweetener'],
    theme: {
      gradient: 'from-rose-500/15 via-pink-50/70 to-rose-100/50',
      border: 'border-rose-400/80',
      shadow: 'shadow-xl shadow-rose-500/15',
      accentBar: 'from-rose-500 via-pink-400 to-rose-500',
      badgeBg: 'bg-rose-100/90 text-rose-900 border-rose-300/70',
      iconBg: 'bg-rose-100 text-rose-900',
      iconBorder: 'border-rose-300/80',
      titleColor: 'text-rose-950',
      dotColor: 'bg-rose-500',
      glowBg: 'from-rose-500/20 to-pink-400/10'
    }
  },
  {
    icon: ShieldAlert,
    badge: '100% Erythritol-Free',
    title: 'Gut-Friendly & Bloating Free',
    description: 'Unlike commercial sweeteners packed with Erythritol or Maltitol, Kosmico is 100% sugar alcohol-free to prevent stomach cramps or digestive issues.',
    highlights: ['Zero Sugar Alcohols', 'No Digestive Distress', '100% Natural Extract'],
    theme: {
      gradient: 'from-cyan-500/15 via-sky-50/70 to-blue-100/50',
      border: 'border-cyan-400/80',
      shadow: 'shadow-xl shadow-cyan-500/15',
      accentBar: 'from-cyan-500 via-blue-400 to-cyan-500',
      badgeBg: 'bg-cyan-100/90 text-cyan-900 border-cyan-300/70',
      iconBg: 'bg-cyan-100 text-cyan-900',
      iconBorder: 'border-cyan-300/80',
      titleColor: 'text-cyan-950',
      dotColor: 'bg-cyan-500',
      glowBg: 'from-cyan-500/20 to-blue-400/10'
    }
  },
  {
    icon: Scale,
    badge: '0 Net Carbs',
    title: 'Keto & Weight Management',
    description: '0 Calories and 0 Net Carbs allow you to stay in ketosis and maintain your deficit while satisfying sweet cravings effortlessly.',
    highlights: ['0 Net Carbs per Serving', 'Supports Intermittent Fasting', 'Zero Calorie Sweetness'],
    theme: {
      gradient: 'from-amber-500/15 via-orange-50/70 to-amber-100/50',
      border: 'border-amber-400/80',
      shadow: 'shadow-xl shadow-amber-500/15',
      accentBar: 'from-amber-500 via-orange-400 to-amber-500',
      badgeBg: 'bg-amber-100/90 text-amber-900 border-amber-300/70',
      iconBg: 'bg-amber-100 text-amber-900',
      iconBorder: 'border-amber-300/80',
      titleColor: 'text-amber-950',
      dotColor: 'bg-amber-500',
      glowBg: 'from-amber-500/20 to-orange-400/10'
    }
  }
];

export function HealthTargeting() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeCycleIndex, setActiveCycleIndex] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToIndex = (index: number) => {
    setActiveCycleIndex(index);
    if (containerRef.current) {
      const card = containerRef.current.children[index] as HTMLElement;
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  };

  const handlePrev = () => {
    const prev = (activeCycleIndex - 1 + healthCards.length) % healthCards.length;
    scrollToIndex(prev);
  };

  const handleNext = () => {
    const next = (activeCycleIndex + 1) % healthCards.length;
    scrollToIndex(next);
  };

  // Sync active card with finger swipe on mobile
  const handleScroll = () => {
    if (!containerRef.current || window.innerWidth >= 768) return;
    const container = containerRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.children[0]?.clientWidth || 1;
    const newIdx = Math.round(scrollLeft / cardWidth);
    if (newIdx >= 0 && newIdx < healthCards.length && newIdx !== activeCycleIndex) {
      setActiveCycleIndex(newIdx);
    }
  };

  // Pure manual scrolling on mobile — auto-cycle highlight only on desktop (>= 768px) grid
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;
    if (hoveredIndex !== null) return;
    const interval = setInterval(() => {
      setActiveCycleIndex((prev) => (prev + 1) % healthCards.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [hoveredIndex]);

  const activeIndex = hoveredIndex !== null ? hoveredIndex : activeCycleIndex;
  const currentActive = healthCards[activeIndex];

  return (
    <section className="py-16 bg-surface relative overflow-hidden">
      {/* Ambient background glow that subtly shifts color with the active card */}
      <div
        className={`absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br ${currentActive.theme.glowBg} blur-3xl opacity-50 transition-all duration-700 pointer-events-none`}
      />
      <div
        className={`absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br ${currentActive.theme.glowBg} blur-3xl opacity-40 transition-all duration-700 pointer-events-none`}
      />

      <Container>
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12 relative z-10">
          <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3.5 py-1 rounded-full">
            Clinical Health &amp; Wellness Targeting
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-text-main mt-3">
            Formulated For Your Health Needs
          </h2>
          <p className="text-text-muted mt-2 text-base">
            Natural sweetness scientifically proven to safeguard your metabolism, hormonal health, and gut digestion.
          </p>
        </div>

        {/* Carousel / Grid Container */}
        <div className="relative">
          {/* Mobile Navigation Arrows (Visible only on mobile) */}
          <div className="md:hidden flex justify-end items-center mb-3 gap-2">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-full bg-white border border-border shadow-xs text-text-main hover:bg-neutral-100 active:scale-95 transition-all cursor-pointer"
              aria-label="Previous card"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-full bg-white border border-border shadow-xs text-text-main hover:bg-neutral-100 active:scale-95 transition-all cursor-pointer"
              aria-label="Next card"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Cards: Horizontal Snap Carousel on Mobile, 4-column Grid on Desktop */}
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory scroll-smooth pb-4 md:pb-0 scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {healthCards.map((card, idx) => {
              const CardIcon = card.icon;
              const isActive = activeIndex === idx;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => {
                    scrollToIndex(idx);
                    setHoveredIndex(idx);
                  }}
                  className={`w-[85vw] sm:w-[75vw] max-w-[320px] md:w-auto shrink-0 snap-center group relative rounded-2xl p-6 flex flex-col justify-between transition-all duration-500 transform cursor-pointer select-none overflow-hidden ${
                    isActive
                      ? `bg-gradient-to-br ${card.theme.gradient} ${card.theme.border} ${card.theme.shadow} -translate-y-2 scale-[1.02] border-2`
                      : 'bg-surface-secondary/50 hover:bg-surface border border-border shadow-xs hover:-translate-y-1 hover:border-neutral-300'
                  }`}
                >
                  {/* Decorative Top Accent Line */}
                  <div
                    className={`h-1.5 rounded-full mb-4 transition-all duration-500 bg-gradient-to-r ${card.theme.accentBar} ${
                      isActive ? 'w-full opacity-100' : 'w-10 opacity-30 group-hover:w-20 group-hover:opacity-70'
                    }`}
                  />

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-500 shadow-xs ${
                          isActive
                            ? `${card.theme.iconBg} ${card.theme.iconBorder} scale-110 rotate-3`
                            : 'bg-primary/10 text-primary border-transparent group-hover:scale-105'
                        }`}
                      >
                        <CardIcon className="w-6 h-6" />
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-md border transition-all duration-300 ${
                          isActive
                            ? card.theme.badgeBg
                            : 'text-primary bg-primary/10 border-primary/20'
                        }`}
                      >
                        {card.badge}
                      </span>
                    </div>

                    <h3
                      className={`font-serif text-lg font-bold mb-2 transition-colors duration-300 ${
                        isActive ? card.theme.titleColor : 'text-text-main group-hover:text-primary'
                      }`}
                    >
                      {card.title}
                    </h3>
                    <p className="text-xs text-neutral-600 leading-relaxed mb-6">
                      {card.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-border/80">
                    {card.highlights.map((item, hIdx) => (
                      <div key={hIdx} className="flex items-center gap-2 text-xs font-semibold text-text-main">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            isActive ? `${card.theme.dotColor} text-white` : 'bg-accent/20 text-accent'
                          }`}
                        >
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span>{item}</span>
                      </div>
                    ))}
                    {isActive && (
                      <div className="pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-neutral-500">
                        <span className={`w-1.5 h-1.5 rounded-full ${card.theme.dotColor} animate-ping`} />
                        <span>Clinically Proven Safe</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Dot Indicators (Hidden on Desktop) */}
          <div className="md:hidden flex justify-center items-center gap-2 mt-4">
            {healthCards.map((card, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => scrollToIndex(dotIdx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  activeIndex === dotIdx
                    ? `w-6 h-2 ${card.theme.dotColor}`
                    : 'w-2 h-2 bg-neutral-300 hover:bg-neutral-400'
                }`}
                aria-label={`Go to slide ${dotIdx + 1}`}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
