import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../../components/ui/Container';
import { Sparkles } from 'lucide-react';

interface UsageItem {
  id: string;
  emoji: string;
  badge: string;
  title: string;
  description: string;
  theme: {
    gradient: string;
    border: string;
    shadow: string;
    accentBar: string;
    badgeBg: string;
    iconBg: string;
    iconBorder: string;
    titleColor: string;
    dotColor: string;
    glowBg: string;
  };
}

const USAGE_ITEMS: UsageItem[] = [
  {
    id: 'coffee-tea',
    emoji: '☕',
    badge: 'Hot Brews',
    title: 'Morning Coffee & Tea',
    description: 'Dissolves instantly in hot beverages without any bitter aftertaste or residue.',
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
    id: 'baking-cooking',
    emoji: '🧁',
    badge: 'Baking & Cooking',
    title: 'Baking & Cooking',
    description: 'Bakes and browns just like sugar. Try it in your favorite cookies, cakes, or custards.',
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
    id: 'cold-drinks',
    emoji: '🍹',
    badge: 'Cold Drinks',
    title: 'Cold Drinks',
    description: 'Our liquid drops are perfect for sweetening iced tea, lemonade, and smoothies with zero delay.',
    theme: {
      gradient: 'from-teal-500/15 via-emerald-50/70 to-cyan-100/50',
      border: 'border-teal-400/80',
      shadow: 'shadow-xl shadow-teal-500/15',
      accentBar: 'from-teal-500 via-emerald-400 to-teal-500',
      badgeBg: 'bg-teal-100/90 text-teal-900 border-teal-300/70',
      iconBg: 'bg-teal-100 text-teal-900',
      iconBorder: 'border-teal-300/80',
      titleColor: 'text-teal-950',
      dotColor: 'bg-teal-500',
      glowBg: 'from-teal-500/20 to-emerald-400/10'
    }
  },
  {
    id: 'breakfast-bowls',
    emoji: '🥣',
    badge: 'Breakfast Bowls',
    title: 'Breakfast Bowls',
    description: 'Sprinkle over oatmeal, yogurt, chia puddings, or fresh fruit for an extra touch of sweetness.',
    theme: {
      gradient: 'from-purple-500/15 via-indigo-50/70 to-purple-100/50',
      border: 'border-purple-400/80',
      shadow: 'shadow-xl shadow-purple-500/15',
      accentBar: 'from-purple-500 via-indigo-400 to-purple-500',
      badgeBg: 'bg-purple-100/90 text-purple-900 border-purple-300/70',
      iconBg: 'bg-purple-100 text-purple-900',
      iconBorder: 'border-purple-300/80',
      titleColor: 'text-purple-950',
      dotColor: 'bg-purple-500',
      glowBg: 'from-purple-500/20 to-indigo-400/10'
    }
  }
];

export function HowItWorks() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeCycleIndex, setActiveCycleIndex] = useState<number>(0);

  // Auto-cycle through cards on desktop (>= 768px) when user is not hovering
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;
    if (hoveredIndex !== null) return;
    const interval = setInterval(() => {
      setActiveCycleIndex((prev) => (prev + 1) % USAGE_ITEMS.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [hoveredIndex]);

  const activeIndex = hoveredIndex !== null ? hoveredIndex : activeCycleIndex;
  const currentActive = USAGE_ITEMS[activeIndex];

  return (
    <section className="py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Ambient background glow that subtly shifts color with the active card */}
      <div
        className={`absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br ${currentActive.theme.glowBg} blur-3xl opacity-60 transition-all duration-700 pointer-events-none`}
      />
      <div
        className={`absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br ${currentActive.theme.glowBg} blur-3xl opacity-50 transition-all duration-700 pointer-events-none`}
      />

      <Container>
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20 relative z-10">
          {/* Left Column: Image with dynamic color aura */}
          <div className="w-full md:w-1/2">
            <div className="relative group">
              {/* Backlight halo synced with active card */}
              <div
                className={`absolute -inset-4 rounded-t-full rounded-b-3xl bg-gradient-to-br ${currentActive.theme.glowBg} blur-2xl opacity-75 transition-all duration-700`}
              />

              <div className="aspect-[4/5] rounded-t-full rounded-b-3xl overflow-hidden relative shadow-2xl border border-white/50">
                <img
                  src="/assets/products/lifestyle-tea.jpg"
                  alt="Kosmico Wellness used in morning tea"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />

                {/* Floating badge reflecting active state */}
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white/80 shadow-lg flex items-center gap-3 transition-all duration-500">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-xs transition-all duration-500 ${currentActive.theme.iconBg}`}
                  >
                    {currentActive.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                        Active In
                      </span>
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${currentActive.theme.dotColor} animate-ping`}
                      />
                    </div>
                    <h5 className="font-bold text-sm text-neutral-900 truncate">
                      {currentActive.title}
                    </h5>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${currentActive.theme.badgeBg}`}
                  >
                    100% Guilt-Free
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Title and Animated Color-Changing Cards */}
          <div className="w-full md:w-1/2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-accent font-bold tracking-widest uppercase text-sm block">
                Everyday Usage
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                <Sparkles className="w-3 h-3" />
                Universal Sweetness
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-primary-dark mb-6 leading-tight">
              A 1:1 replacement for sugar.
            </h2>
            <p className="text-lg text-text-muted mb-8 leading-relaxed">
              No complicated math required. Use Kosmico Wellness exactly as you would use regular sugar in
              all your daily routines.
            </p>

            {/* 4 Usage Cards with Animated Color Transitions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {USAGE_ITEMS.map((item, index) => {
                const isActive = activeIndex === index;

                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => {
                      setActiveCycleIndex(index);
                      setHoveredIndex(index);
                    }}
                    className={`group relative p-6 rounded-2xl cursor-pointer transition-all duration-500 transform overflow-hidden ${
                      isActive
                        ? `bg-gradient-to-br ${item.theme.gradient} ${item.theme.border} ${item.theme.shadow} -translate-y-2 scale-[1.02] border-2`
                        : 'bg-surface/90 hover:bg-surface border border-border shadow-xs hover:-translate-y-1 hover:border-neutral-300'
                    }`}
                  >
                    {/* Top animated accent bar */}
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 mb-4 bg-gradient-to-r ${item.theme.accentBar} ${
                        isActive ? 'w-full opacity-100' : 'w-10 opacity-30 group-hover:w-20 group-hover:opacity-70'
                      }`}
                    />

                    {/* Emoji + Badge header */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border transition-all duration-500 shadow-xs ${
                          isActive
                            ? `${item.theme.iconBg} ${item.theme.iconBorder} scale-110 rotate-3`
                            : 'bg-neutral-100/90 text-neutral-800 border-neutral-200 group-hover:scale-105'
                        }`}
                      >
                        {item.emoji}
                      </div>

                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all duration-300 ${
                          isActive
                            ? item.theme.badgeBg
                            : 'bg-neutral-100 text-neutral-600 border-neutral-200 group-hover:bg-neutral-200/70'
                        }`}
                      >
                        {item.badge}
                      </span>
                    </div>

                    {/* Title with dynamic color change */}
                    <h4
                      className={`font-bold text-lg mb-2 transition-colors duration-300 ${
                        isActive ? item.theme.titleColor : 'text-primary-dark group-hover:text-primary'
                      }`}
                    >
                      {item.title}
                    </h4>

                    {/* Description */}
                    <p className="text-sm text-neutral-600 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Live active glow pulse on the active card */}
                    {isActive && (
                      <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-neutral-600">
                        <span className={`w-1.5 h-1.5 rounded-full ${item.theme.dotColor} animate-ping`} />
                        <span className="text-neutral-500">Perfect 1:1 measure</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Certified Trust Banner */}
            <div className="mt-8 p-4 bg-emerald-50/90 border border-emerald-700/20 rounded-2xl flex items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                  ✓
                </span>
                <div>
                  <h5 className="font-bold text-neutral-900 text-sm">Certified 0.00 Calories &amp; 0g Sugar</h5>
                  <p className="text-xs text-neutral-600">Standard Certified Nutrition Facts Declaration</p>
                </div>
              </div>
              <Link
                to="/how-it-works"
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline shrink-0 transition-colors"
              >
                View Nutrition Label &rarr;
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

