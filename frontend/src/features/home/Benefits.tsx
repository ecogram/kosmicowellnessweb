import { useState, useRef } from 'react';
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
  },
  {
    icon: Utensils,
    badge: '1:1 MEASURE',
    title: '1:1 Sugar Replacement',
    description:
      'Measures and bakes exactly like real white sugar. No complicated math or conversion needed for your recipes.',
  },
  {
    icon: Zap,
    badge: '0 NET CARBS',
    title: 'Zero Net Carbs',
    description:
      "Keto-friendly and guaranteed won't spike your blood sugar levels. A clean alternative for your daily diet.",
  },
  {
    icon: ThumbsUp,
    badge: '100% PURE TASTE',
    title: 'No Bitter Aftertaste',
    description:
      'Unlike stevia or artificial chemical sweeteners, Kosmico Wellness provides a clean, pure, sugar-like taste.',
  },
];

export function Benefits() {
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
    const prev = (activeIndex - 1 + benefits.length) % benefits.length;
    scrollToIndex(prev);
  };

  const handleNext = () => {
    const next = (activeIndex + 1) % benefits.length;
    scrollToIndex(next);
  };

  // Sync active dot with manual finger swipe on mobile
  const handleScroll = () => {
    if (!containerRef.current || window.innerWidth >= 768) return;
    const container = containerRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.children[0]?.clientWidth || 1;
    const newIdx = Math.round(scrollLeft / cardWidth);
    if (newIdx >= 0 && newIdx < benefits.length && newIdx !== activeIndex) {
      setActiveIndex(newIdx);
    }
  };

  return (
    <section id="benefits" className="py-16 md:py-24 bg-gradient-to-b from-background to-surface-secondary/40 relative">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
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

              return (
                <div 
                  key={index} 
                  className="w-[85vw] sm:w-[75vw] max-w-[320px] md:w-auto shrink-0 snap-center group relative bg-surface border border-border/80 rounded-3xl p-7 shadow-xs hover:shadow-xl hover:border-primary/40 transition-all duration-300 transform hover:-translate-y-2 flex flex-col justify-between overflow-hidden"
                >
                  {/* Decorative Top Accent Line */}
                  <div className="h-1.5 w-12 bg-accent rounded-full mb-6 group-hover:w-full transition-all duration-500" />

                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-inner">
                        <IconComponent className="w-7 h-7" />
                      </div>
                      <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                        {benefit.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold font-serif text-text-main group-hover:text-primary transition-colors mb-3 leading-snug">
                      {benefit.title}
                    </h3>
                    <p className="text-text-muted text-sm leading-relaxed mb-6">
                      {benefit.description}
                    </p>
                  </div>

                  <Link 
                    to="/benefits"
                    className="pt-4 border-t border-border/60 flex items-center justify-between text-xs font-bold text-primary group-hover:text-accent transition-colors"
                  >
                    <span>Learn Benefits</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Mobile Dot Indicators (Hidden on Desktop) */}
          <div className="md:hidden flex justify-center items-center gap-2 mt-4">
            {benefits.map((_, dotIdx) => (
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
