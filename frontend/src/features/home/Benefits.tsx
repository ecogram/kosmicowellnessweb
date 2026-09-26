import { useState, useEffect, useRef } from 'react';
import { Container } from '../../components/ui/Container';
import { Sparkles, Utensils, Zap, ThumbsUp, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const benefits = [
  {
    icon: Sparkles,
    badge: '0 CALORIES',
    title: 'Zero Calories',
    description:
      'Enjoy the sweetness you love without any of the calories. Perfect for your daily tea, coffee, and desserts.',
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
  },
  {
    icon: Utensils,
    badge: '1:1 MEASURE',
    title: '1:1 Sugar Replacement',
    description:
      'Measures and bakes exactly like real white sugar. No complicated math or conversion needed for your recipes.',
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
    icon: Zap,
    badge: '0 NET CARBS',
    title: 'Zero Net Carbs',
    description:
      "Keto-friendly and guaranteed won't spike your blood sugar levels. A clean alternative for your daily diet.",
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
    icon: ThumbsUp,
    badge: '100% PURE TASTE',
    title: 'No Bitter Aftertaste',
    description:
      'Unlike stevia or artificial chemical sweeteners, Kosmico Wellness provides a clean, pure, sugar-like taste.',
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
];

export function Benefits() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeCycleIndex, setActiveCycleIndex] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

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
    const prev = (activeCycleIndex - 1 + benefits.length) % benefits.length;
    scrollToIndex(prev);
  };

  const handleNext = () => {
    const next = (activeCycleIndex + 1) % benefits.length;
    scrollToIndex(next);
  };

  // Sync active card with finger swipe/scroll on mobile
  const handleScroll = () => {
    if (!containerRef.current || window.innerWidth >= 768) return;
    const container = containerRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.children[0]?.clientWidth || 1;
    const newIdx = Math.round(scrollLeft / cardWidth);
    if (newIdx >= 0 && newIdx < benefits.length && newIdx !== activeCycleIndex) {
      isScrollingRef.current = true;
      setActiveCycleIndex(newIdx);
      setTimeout(() => { isScrollingRef.current = false; }, 400);
    }
  };

  // Gentle auto-cycle when user is not hovering or swiping
  useEffect(() => {
    if (hoveredIndex !== null) return;
    const interval = setInterval(() => {
      setActiveCycleIndex((prev) => {
        const next = (prev + 1) % benefits.length;
        if (window.innerWidth < 768 && containerRef.current && !isScrollingRef.current) {
          const card = containerRef.current.children[next] as HTMLElement;
          if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }
        }
        return next;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [hoveredIndex]);

  const activeIndex = hoveredIndex !== null ? hoveredIndex : activeCycleIndex;
  const currentActive = benefits[activeIndex];

  return (
    <section id="benefits" className="py-16 md:py-24 bg-gradient-to-b from-background to-surface-secondary/40 relative overflow-hidden">
      {/* Ambient background glow that subtly shifts color with the active card */}
      <div
        className={`absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br ${currentActive.theme.glowBg} blur-3xl opacity-50 transition-all duration-700 pointer-events-none`}
      />
      <div
        className={`absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br ${currentActive.theme.glowBg} blur-3xl opacity-40 transition-all duration-700 pointer-events-none`}
      />

      <Container>
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-14 relative z-10">
          <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full inline-block mb-3">
            Why Choose Kosmico Wellness
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-text-main">
            Pure Natural Sweetness, Zero Compromise
          </h2>
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
            className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 overflow-x-auto md:overflow-visible snap-x snap-mandatory scroll-smooth pb-4 md:pb-0 scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              const isActive = activeIndex === index;

              return (
                <div 
                  key={index} 
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => {
                    scrollToIndex(index);
                    setHoveredIndex(index);
                  }}
                  className={`w-[85vw] sm:w-[75vw] max-w-[320px] md:w-auto shrink-0 snap-center group relative rounded-3xl p-6 md:p-7 transition-all duration-500 transform cursor-pointer flex flex-col justify-between overflow-hidden select-none ${
                    isActive
                      ? `bg-gradient-to-br ${benefit.theme.gradient} ${benefit.theme.border} ${benefit.theme.shadow} -translate-y-2 scale-[1.02] border-2`
                      : 'bg-surface/90 hover:bg-surface border border-border/80 shadow-xs hover:-translate-y-1 hover:border-neutral-300'
                  }`}
                >
                  {/* Decorative Top Accent Line - Expands on Active */}
                  <div 
                    className={`h-1.5 rounded-full mb-5 transition-all duration-500 bg-gradient-to-r ${benefit.theme.accentBar} ${
                      isActive ? 'w-full opacity-100' : 'w-12 opacity-40 group-hover:w-20 group-hover:opacity-80'
                    }`} 
                  />

                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div 
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 shadow-xs ${
                          isActive 
                            ? `${benefit.theme.iconBg} ${benefit.theme.iconBorder} scale-110 rotate-3` 
                            : 'bg-primary/10 text-primary border-transparent group-hover:scale-105'
                        }`}
                      >
                        <IconComponent className="w-7 h-7" />
                      </div>
                      <span 
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border transition-all duration-300 ${
                          isActive
                            ? benefit.theme.badgeBg
                            : 'text-primary bg-primary/10 border-primary/20'
                        }`}
                      >
                        {benefit.badge}
                      </span>
                    </div>

                    <h3 
                      className={`text-xl font-bold font-serif mb-3 leading-snug transition-colors duration-300 ${
                        isActive ? benefit.theme.titleColor : 'text-text-main group-hover:text-primary'
                      }`}
                    >
                      {benefit.title}
                    </h3>
                    <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                      {benefit.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs font-bold">
                    <Link 
                      to="/benefits"
                      className={`flex items-center gap-1.5 transition-colors ${
                        isActive ? benefit.theme.titleColor : 'text-primary group-hover:text-accent'
                      }`}
                    >
                      <span>Learn Benefits</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                    {isActive && (
                      <span className={`w-2 h-2 rounded-full ${benefit.theme.dotColor} animate-ping`} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Dot Indicators (Hidden on Desktop) */}
          <div className="md:hidden flex justify-center items-center gap-2 mt-4">
            {benefits.map((benefit, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => scrollToIndex(dotIdx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  activeIndex === dotIdx
                    ? `w-6 h-2 ${benefit.theme.dotColor}`
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
