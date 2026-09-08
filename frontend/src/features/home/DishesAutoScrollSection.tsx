import { useState } from 'react';
import { Container } from '../../components/ui/Container';
import { Sparkles, Flame, ShieldCheck, Pause, Play, ShoppingBag } from 'lucide-react';

interface DishItem {
  id: string;
  name: string;
  hindiName: string;
  tagline: string;
  dishImage: string;
  productImage: string;
  healthBadge: string;
  glycemicIndex: string;
  keyFeature: string;
  description: string;
}

const DISHES: DishItem[] = [
  {
    id: 'kheer',
    name: 'Slow-Cooked Saffron Rice Kheer',
    hindiName: 'केसरिया चावल खीर',
    tagline: 'High-heat stable up to 250°C — Zero milk splitting!',
    dishImage: '/assets/dishes/kheer-lifestyle.jpg',
    productImage: '/assets/products/sweetmonk-lifestyle-drop.png',
    healthBadge: '100% Sugar-Free',
    glycemicIndex: 'GI 0 (Zero Spike)',
    keyFeature: '1:1 Cane Sugar Taste',
    description: 'Enjoy rich, creamy festive Kheer sweetened 100% naturally with Sweet Monk drops without increasing blood sugar.'
  },
  {
    id: 'gajar-halwa',
    name: 'Desi Ghee Gajar Ka Halwa',
    hindiName: 'गाजर का हलवा',
    tagline: 'Caramelizes and coats perfectly like natural sugar!',
    dishImage: '/assets/dishes/gajar-halwa-lifestyle.jpg',
    productImage: '/assets/products/sweetmonk-lifestyle-drop.png',
    healthBadge: 'Zero Sugar Added',
    glycemicIndex: 'GI 0 (Zero Spike)',
    keyFeature: 'Zero Chemical Aftertaste',
    description: 'Slow-cooked carrot halwa prepared for diabetic family members without compromising on authentic festival sweetness.'
  },
  {
    id: 'ladoo',
    name: 'Homemade Motichoor & Besan Ladoo',
    hindiName: 'बेसन और मोतीचूर के लड्डू',
    tagline: 'Stays fresh without crystalline texture or hard bite!',
    dishImage: '/assets/dishes/ladoo-lifestyle.jpg',
    productImage: '/assets/products/sweetmonk-lifestyle-drop.png',
    healthBadge: '100% Natural Monk Fruit',
    glycemicIndex: 'GI 0 (Zero Spike)',
    keyFeature: 'Zero Erythritol / Gut-Friendly',
    description: 'Traditional celebration Ladoos prepared with Sweet Monk liquid drops — 100% pure monk fruit extract.'
  },
  {
    id: 'gulab-jamun',
    name: 'Juicy Syrupy Gulab Jamun',
    hindiName: 'गुलाब जामुन',
    tagline: 'Absorbs sweet syrup deeply without bitter metallic taste!',
    dishImage: '/assets/dishes/gulab-jamun-lifestyle.jpg',
    productImage: '/assets/products/sweetmonk-lifestyle-drop.png',
    healthBadge: 'Diabetic & Keto Friendly',
    glycemicIndex: 'GI 0 (Zero Spike)',
    keyFeature: '100% Keto & Diabetic Safe',
    description: 'Mouth-watering Gulab Jamuns dipped in zero-calorie Sweet Monk syrup for guilt-free indulgence.'
  },
  {
    id: 'kadak-chai',
    name: 'Morning Masala & Kadak Chai',
    hindiName: 'कड़क मसाला चाय',
    tagline: 'Dissolves instantly in boiling hot tea — zero curdling!',
    dishImage: '/assets/products/sweetmonk-lifestyle-drop.png',
    productImage: '/assets/products/sweetmonk-lifestyle-drop.png',
    healthBadge: 'Zero Calories',
    glycemicIndex: 'GI 0 (Zero Spike)',
    keyFeature: '1 Drop = 1 Spoon Sugar',
    description: 'Start your mornings with hot Kadak Chai using Sweet Monk liquid drops without worrying about daily sugar intake.'
  }
];

export function DishesAutoScrollSection() {
  const [isPaused, setIsPaused] = useState(false);

  // Duplicate items for continuous smooth infinite scrolling
  const marqueeItems = [...DISHES, ...DISHES];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-emerald-50/70 via-stone-50/50 to-emerald-50/80 text-neutral-900 relative overflow-hidden border-y border-emerald-900/10">
      {/* Subtle Ambient Soft Glow Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-10 right-0 w-[500px] h-[500px] bg-amber-300/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

      <Container>
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-800/10 border border-emerald-800/20 text-emerald-900 font-bold text-xs uppercase tracking-wider mb-4 shadow-xs backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
            <span>Homestyle Indian Sweets &amp; Dishes</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-900 leading-tight mb-4 tracking-tight">
            Enjoy Your Favorite Dishes <br />
            <span className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-amber-600 bg-clip-text text-transparent italic">
              With Sweet Monk
            </span>
          </h2>

          <p className="text-neutral-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            From slow-cooked Kheer to morning Kadak Chai, substitute sugar 1:1 with Sweet Monk Fruit Liquid Sweetener Drops. Zero calories, zero aftertaste, and zero blood sugar spikes.
          </p>

          {/* Marquee Play/Pause Control Button */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-neutral-50 border border-emerald-900/15 text-xs font-bold text-emerald-950 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-800 fill-emerald-800" /> : <Pause className="w-3.5 h-3.5 text-emerald-800 fill-emerald-800" />}
              <span>{isPaused ? 'Resume Auto Scroll' : 'Pause Auto Scroll'}</span>
            </button>
          </div>
        </div>
      </Container>

      {/* Auto-Scrolling Marquee Container */}
      <div className="w-full overflow-hidden py-4 relative group">
        {/* Soft Edge Blurs */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-emerald-50/90 to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-emerald-50/90 to-transparent z-20 pointer-events-none" />

        <div
          className={`animate-marquee flex gap-6 px-4 ${isPaused ? 'paused' : ''}`}
          style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
        >
          {marqueeItems.map((dish, index) => (
            <div
              key={`${dish.id}-${index}`}
              className="w-[320px] sm:w-[380px] shrink-0 bg-white/95 border border-emerald-900/15 rounded-3xl overflow-hidden shadow-xl shadow-emerald-900/5 hover:border-emerald-700/40 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/10 flex flex-col group/card transform hover:-translate-y-1"
            >
              {/* Dish Visual Header */}
              <div className="relative h-48 sm:h-56 overflow-hidden">
                <img
                  src={dish.dishImage}
                  alt={dish.name}
                  className="w-full h-full object-cover group-hover/card:scale-108 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Top Badge: Health Badge (Zero Calories / Sugar-Free) */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-900/15 text-emerald-900 font-bold text-xs flex items-center gap-1.5 shadow-sm">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{dish.healthBadge}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex flex-col justify-between flex-1 bg-white">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">{dish.hindiName}</span>
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-800/20">
                      {dish.glycemicIndex}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-neutral-900 mb-2 group-hover/card:text-emerald-800 transition-colors">
                    {dish.name}
                  </h3>

                  <p className="text-neutral-600 text-xs leading-relaxed mb-4">
                    {dish.description}
                  </p>
                </div>

                <div>
                  {/* Tagline Box */}
                  <div className="bg-emerald-50/70 border border-emerald-800/15 rounded-xl p-2.5 mb-4 text-xs font-semibold text-emerald-900 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>{dish.tagline}</span>
                  </div>

                  {/* Footer Action */}
                  <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                    <span className="text-xs font-bold text-emerald-800">{dish.keyFeature}</span>
                    <a
                      href="/shop"
                      className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-emerald-900/15 flex items-center gap-1.5 active:scale-95"
                    >
                      <span>Try Sweet Monk</span>
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
