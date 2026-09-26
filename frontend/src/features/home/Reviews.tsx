import { useState, useEffect } from 'react';
import { Container } from '../../components/ui/Container';
import { Star, Quote } from 'lucide-react';
import { useGlobalReviews } from '../../hooks/useGlobalReviews';

export function Reviews() {
  const { data, isLoading } = useGlobalReviews(3, 'highest');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeCycleIndex, setActiveCycleIndex] = useState<number>(0);

  const reviewsList: any[] = data?.reviews || [];

  // Auto-cycle through reviews every 3.5s when not hovering
  useEffect(() => {
    if (hoveredIndex !== null || reviewsList.length === 0) return;
    const interval = setInterval(() => {
      setActiveCycleIndex((prev) => (prev + 1) % reviewsList.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [hoveredIndex, reviewsList.length]);

  const activeIndex = hoveredIndex !== null ? hoveredIndex : activeCycleIndex;

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background via-surface-secondary/20 to-background relative overflow-hidden">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-dark mb-4 tracking-tight">
            Don't just take our word for it
          </h2>
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse-glow"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
            <span className="font-bold text-lg text-text-main">4.9/5</span>
          </div>
          <p className="text-text-muted text-sm sm:text-base">Based on verified customer reviews.</p>
        </div>

        {/* Responsive Grid without manual horizontal scrolling on mobile */}
        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-surface p-7 sm:p-8 rounded-3xl shadow-sm border border-border flex flex-col h-72 animate-pulse"
                >
                  <div className="bg-neutral-200 h-5 w-28 mb-4 rounded-full"></div>
                  <div className="bg-neutral-200 h-6 w-3/4 mb-4 rounded-lg"></div>
                  <div className="bg-neutral-200 h-20 w-full mb-6 rounded-lg"></div>
                  <div className="bg-neutral-200 h-4 w-1/3 mt-auto rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {reviewsList.map((review: any, index: number) => {
                const userName = review.user?.name || 'Verified Customer';
                const initial = userName.charAt(0).toUpperCase();
                const isActive = activeIndex === index;

                return (
                  <div
                    key={review._id || index}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => {
                      setActiveCycleIndex(index);
                      setHoveredIndex(index);
                    }}
                    className={`rounded-3xl p-7 sm:p-8 transition-all duration-500 transform cursor-pointer flex flex-col justify-between relative overflow-hidden group select-none ${
                      isActive
                        ? 'bg-gradient-to-br from-amber-500/10 via-orange-50/60 to-amber-50/40 border-2 border-amber-400/80 shadow-2xl shadow-amber-500/15 -translate-y-2 scale-[1.02]'
                        : 'bg-surface border border-border/80 shadow-xs hover:border-primary/40 hover:-translate-y-1'
                    }`}
                  >
                    {/* Decorative Top Accent Line */}
                    <div
                      className={`h-1.5 rounded-full mb-5 transition-all duration-500 bg-gradient-to-r from-amber-500 to-orange-400 ${
                        isActive ? 'w-full opacity-100' : 'w-12 opacity-40 group-hover:w-20 group-hover:opacity-80'
                      }`}
                    />

                    {/* Ambient Watermark Quote Icon */}
                    <Quote className="w-12 h-12 text-primary/5 absolute top-6 right-6 pointer-events-none group-hover:text-primary/10 group-hover:rotate-12 transition-all duration-500" />

                    <div>
                      {/* Star Rating with Interactive Micro-bounce */}
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 transition-transform duration-300 ${
                              isActive ? 'scale-110' : 'group-hover:scale-105'
                            } ${
                              i < (review.rating || 5)
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-neutral-200 fill-neutral-200'
                            }`}
                            style={{ transitionDelay: `${i * 40}ms` }}
                          />
                        ))}
                      </div>

                      <h4
                        className={`font-bold transition-colors duration-300 text-lg mb-3 leading-snug ${
                          isActive ? 'text-amber-950 font-black' : 'text-text-main group-hover:text-primary'
                        }`}
                      >
                        "{review.title}"
                      </h4>
                      <p className="text-neutral-600 text-sm leading-relaxed mb-6 italic">
                        "{review.content}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/70">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center transition-colors duration-300 shadow-2xs ${
                            isActive
                              ? 'bg-amber-500 text-white'
                              : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'
                          }`}
                        >
                          {initial}
                        </div>
                        <span className="font-semibold text-text-main text-sm">
                          {userName}
                        </span>
                      </div>

                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[8px] font-black">
                          ✓
                        </span>
                        Verified
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
