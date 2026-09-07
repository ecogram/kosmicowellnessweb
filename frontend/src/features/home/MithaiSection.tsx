import { useState } from 'react';
import { Container } from '../../components/ui/Container';
import { Coffee, UtensilsCrossed, Flame, Sparkles, CheckCircle2 } from 'lucide-react';

interface TabContent {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  tagline: string;
  benefits: string[];
  image: string;
  ratio: string;
}

const tabs: TabContent[] = [
  {
    id: 'chai-coffee',
    title: 'Daily Chai & Filter Coffee',
    subtitle: 'Zero milk splitting, authentic Indian tea flavor',
    icon: Coffee,
    tagline: 'Enjoy your morning & evening Kadak Chai without guilt or blood sugar spikes.',
    benefits: [
      'Dissolves instantly in boiling hot tea or coffee',
      'Guaranteed zero milk curdling or splitting',
      'No bitter, metallic, or chemical aftertaste',
      '1 Spoon Kosmico = 1 Spoon Table Sugar sweetness'
    ],
    image: '/assets/products/lifestyle-tea.jpg',
    ratio: '1:1 Direct Replacement'
  },
  {
    id: 'mithai',
    title: 'Traditional Indian Mithai',
    subtitle: 'High-heat stable for Kheer, Gajar Halwa & Ladoos',
    icon: UtensilsCrossed,
    tagline: 'Recreate festive sweets for diabetic family members without compromising on taste.',
    benefits: [
      'High-heat stable up to 250°C — perfect for slow-cooked Kheer',
      'Caramelizes and coats like natural cane sugar in Halwa',
      'Zero glucose spikes — safe for elders and diabetics',
      'Keeps Mithai fresh without crystalline texture'
    ],
    image: '/assets/products/product-front-back.jpg',
    ratio: '1:1 Equal Measure'
  },
  {
    id: 'baking-shakes',
    title: 'Smoothies, Oats & Baking',
    subtitle: 'Fitness, Keto & Daily Healthy Desserts',
    icon: Flame,
    tagline: 'Ideal for fitness enthusiasts tracking macros, zero net carbs, and zero calories.',
    benefits: [
      'Blends effortlessly into cold protein shakes & oat bowls',
      'Bakes cakes, muffins & cookies with moist texture',
      'Zero erythritol — gut-friendly with no bloating',
      'Supports weight loss and keto fasting regimens'
    ],
    image: '/assets/products/lifestyle-gym.jpg',
    ratio: '0 Calories / 0 Net Carbs'
  }
];

export function MithaiSection() {
  const [activeTab, setActiveTab] = useState<string>('chai-coffee');

  const current = tabs.find((t) => t.id === activeTab) || tabs[0];
  const IconComponent = current.icon;

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-surface-secondary to-surface border-y border-border relative overflow-hidden">
      {/* Background Decorative Blur */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <Container>
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider mb-3">
            <Sparkles className="w-4 h-4" />
            <span>Tailored for Indian Kitchens</span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-text-main">
            Sweetens Everything From <span className="text-primary underline decoration-accent/40 decoration-4">Kadak Chai</span> To <span className="text-accent underline decoration-primary/40 decoration-4">Gajar Ka Halwa</span>
          </h2>
          <p className="text-text-muted mt-3 text-base md:text-lg">
            Unlike artificial sweeteners that split milk or leave a chemical aftertaste, Kosmiko Monk Fruit behaves 1:1 like sugar in all traditional Indian recipes.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-300 ${
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105'
                    : 'bg-surface text-text-main hover:bg-surface-secondary border border-border'
                }`}
              >
                <TabIcon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-primary'}`} />
                <span>{tab.title}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div className="bg-surface rounded-3xl border border-border shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Info Side */}
          <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-text-main">{current.title}</h3>
                  <p className="text-xs text-primary font-bold uppercase tracking-wider">{current.subtitle}</p>
                </div>
              </div>

              <p className="text-text-main text-base font-medium mb-6 bg-surface-secondary p-4 rounded-xl border border-border/60">
                "{current.tagline}"
              </p>

              <div className="space-y-3.5 mb-8">
                {current.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-text-main">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-border">
              <div>
                <span className="text-xs text-text-muted block">Substitution Ratio</span>
                <span className="font-serif font-bold text-lg text-primary">{current.ratio}</span>
              </div>
              <a
                href="/shop"
                className="px-6 py-3 bg-accent text-white font-bold text-xs rounded-xl hover:bg-accent/90 transition-colors shadow-md flex items-center gap-2"
              >
                <span>Try In Your Kitchen</span>
                <Sparkles className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Visual Side */}
          <div className="lg:col-span-5 relative min-h-[300px] lg:min-h-full bg-surface-secondary">
            <img
              src={current.image}
              alt={current.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
              <div className="text-white">
                <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30">
                  100% Monk Fruit Pure
                </span>
                <h4 className="font-serif text-xl font-bold mt-2">Zero Calories. Zero Aftertaste.</h4>
              </div>
            </div>
          </div>
        </div>

      </Container>
    </section>
  );
}
