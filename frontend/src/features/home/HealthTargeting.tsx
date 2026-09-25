import { useState, useRef } from 'react';
import { Activity, Heart, ShieldAlert, Scale, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Container } from '../../components/ui/Container';

const healthCards = [
  {
    icon: Activity,
    badge: 'Zero Glycemic Index',
    title: 'Diabetic & Pre-Diabetic Friendly',
    description: 'Causes 0 blood sugar spikes and 0 insulin surges. Fully safe for daily consumption by Type-1 and Type-2 diabetics.',
    highlights: ['0 Blood Glucose Impact', 'HbA1c Safe', 'Doctor Recommended']
  },
  {
    icon: Heart,
    badge: 'Hormonal Balance',
    title: 'PCOS & PCOD Care',
    description: 'Natural monk fruit mogrosides reduce sugar-induced systemic inflammation, helping manage insulin resistance and hormonal acne.',
    highlights: ['Zero Inflammatory Sugars', 'Helps Insulin Sensitivity', 'Hormone-Safe Sweetener']
  },
  {
    icon: ShieldAlert,
    badge: '100% Erythritol-Free',
    title: 'Gut-Friendly & Bloating Free',
    description: 'Unlike commercial sweeteners packed with Erythritol or Maltitol, Kosmico is 100% sugar alcohol-free to prevent stomach cramps or digestive issues.',
    highlights: ['Zero Sugar Alcohols', 'No Digestive Distress', '100% Natural Extract']
  },
  {
    icon: Scale,
    badge: '0 Net Carbs',
    title: 'Keto & Weight Management',
    description: '0 Calories and 0 Net Carbs allow you to stay in ketosis and maintain your deficit while satisfying sweet cravings effortlessly.',
    highlights: ['0 Net Carbs per Serving', 'Supports Intermittent Fasting', 'Zero Calorie Sweetness']
  }
];

export function HealthTargeting() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToIndex = (index: number) => {
    setActiveIndex(index);
    if (containerRef.current) {
      const card = containerRef.current.children[index] as HTMLElement;
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  };

  const handlePrev = () => {
    const prev = (activeIndex - 1 + healthCards.length) % healthCards.length;
    scrollToIndex(prev);
  };

  const handleNext = () => {
    const next = (activeIndex + 1) % healthCards.length;
    scrollToIndex(next);
  };

  // Sync active dot with manual finger swipe on mobile
  const handleScroll = () => {
    if (!containerRef.current || window.innerWidth >= 768) return;
    const container = containerRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.children[0]?.clientWidth || 1;
    const newIdx = Math.round(scrollLeft / cardWidth);
    if (newIdx >= 0 && newIdx < healthCards.length && newIdx !== activeIndex) {
      setActiveIndex(newIdx);
    }
  };

  return (
    <section className="py-16 bg-surface relative">
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
          <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3.5 py-1 rounded-full">
            Clinical Health & Wellness Targeting
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
          <div className="md:hidden flex justify-between items-center absolute -top-12 right-0 gap-2 z-10">
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

              return (
                <div
                  key={idx}
                  className="w-[85vw] sm:w-[75vw] max-w-[320px] md:w-auto shrink-0 snap-center bg-surface-secondary/50 border border-border rounded-2xl p-6 flex flex-col justify-between hover:border-primary/40 hover:shadow-lg transition-all duration-300 group shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <CardIcon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                        {card.badge}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-text-main mb-2">
                      {card.title}
                    </h3>
                    <p className="text-xs text-text-muted leading-relaxed mb-6">
                      {card.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-border/80">
                    {card.highlights.map((item, hIdx) => (
                      <div key={hIdx} className="flex items-center gap-2 text-xs font-semibold text-text-main">
                        <div className="w-4 h-4 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Dot Indicators (Hidden on Desktop) */}
          <div className="md:hidden flex justify-center items-center gap-2 mt-4">
            {healthCards.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => scrollToIndex(dotIdx)}
                className={`transition-all duration-300 rounded-full ${
                  activeIndex === dotIdx
                    ? 'w-6 h-2 bg-primary'
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
