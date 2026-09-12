import { useState } from 'react';
import { Container } from '../../components/ui/Container';
import { ShieldCheck, Pause, Play, ShoppingBag, X, Heart, CheckCircle2 } from 'lucide-react';

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
  caloriesSaving: string;
}

const DISHES: DishItem[] = [
  {
    id: 'kheer',
    name: 'Slow-Cooked Saffron Rice Kheer',
    hindiName: 'केसरिया चावल खीर',
    tagline: 'High-heat stable up to 250°C — Zero milk curdling or splitting!',
    dishImage: '/assets/dishes/kheer.jpg',
    productImage: '/assets/products/sweetmonk-lifestyle-drop.png',
    healthBadge: '100% Sugar-Free',
    glycemicIndex: 'GI 0 (Zero Spike)',
    keyFeature: '1:1 Cane Sugar Taste',
    description: 'Rich, creamy festive Kheer sweetened 100% naturally with Sweet Monk drops. Zero sugar, zero calories, and zero insulin spike.',
    caloriesSaving: 'Save 280 kcal per bowl'
  },
  {
    id: 'gajar-halwa',
    name: 'Desi Ghee Gajar Ka Halwa',
    hindiName: 'गाजर का हलवा',
    tagline: 'Caramelizes and coats perfectly with authentic halwa taste!',
    dishImage: '/assets/dishes/gajar-halwa.jpg',
    productImage: '/assets/products/sweetmonk-lifestyle-drop.png',
    healthBadge: 'Zero Sugar Added',
    glycemicIndex: 'GI 0 (Zero Spike)',
    keyFeature: 'Zero Chemical Aftertaste',
    description: 'Slow-cooked carrot halwa prepared in pure desi ghee for diabetic family members without compromising on authentic festive sweetness.',
    caloriesSaving: 'Save 320 kcal per serving'
  },
  {
    id: 'gulab-jamun',
    name: 'Juicy Syrupy Gulab Jamun',
    hindiName: 'गुलाब जामुन',
    tagline: 'Absorbs sweet syrup deeply without bitter metallic taste!',
    dishImage: '/assets/dishes/gulab-jamun.jpg',
    productImage: '/assets/products/sweetmonk-lifestyle-drop.png',
    healthBadge: 'Diabetic & Keto Friendly',
    glycemicIndex: 'GI 0 (Zero Spike)',
    keyFeature: '100% Keto & Diabetic Safe',
    description: 'Mouth-watering Gulab Jamuns dipped in zero-calorie Sweet Monk syrup for complete guilt-free indulgence.',
    caloriesSaving: 'Save 180 kcal per piece'
  },
  {
    id: 'ladoo',
    name: 'Homemade Motichoor & Besan Ladoo',
    hindiName: 'बेसन और मोतीचूर के लड्डू',
    tagline: 'Stays fresh without crystalline texture or hard bite!',
    dishImage: '/assets/dishes/ladoo.jpg',
    productImage: '/assets/products/sweetmonk-lifestyle-drop.png',
    healthBadge: '100% Natural Monk Fruit',
    glycemicIndex: 'GI 0 (Zero Spike)',
    keyFeature: 'Zero Erythritol / Gut-Friendly',
    description: 'Traditional celebration Ladoos prepared with Sweet Monk liquid drops — 100% pure monk fruit extract.',
    caloriesSaving: 'Save 150 kcal per ladoo'
  },
  {
    id: 'rasmalai',
    name: 'Royal Saffron Cardamom Rasmalai',
    hindiName: 'शाही केसर रसमलाई',
    tagline: 'Infuses chilled saffron milk with natural sweetness!',
    dishImage: '/assets/dishes/rasmalai.jpg',
    productImage: '/assets/products/sweetmonk-lifestyle-drop.png',
    healthBadge: 'Zero Calories',
    glycemicIndex: 'GI 0 (Zero Spike)',
    keyFeature: 'Zero Glycemic Index',
    description: 'Delicate soft cottage cheese patties in chilled saffron-pistachio rabri milk sweetened with pure Sweet Monk drops.',
    caloriesSaving: 'Save 220 kcal per serving'
  },
  {
    id: 'kadak-chai',
    name: 'Morning Masala & Kadak Chai',
    hindiName: 'कड़क मसाला चाय',
    tagline: 'Dissolves instantly in boiling hot tea — zero curdling!',
    dishImage: '/assets/products/lifestyle-tea.jpg',
    productImage: '/assets/products/sweetmonk-lifestyle-drop.png',
    healthBadge: 'Zero Sugar & Calories',
    glycemicIndex: 'GI 0 (Zero Spike)',
    keyFeature: '1 Drop = 1 Spoon Sugar',
    description: 'Start your mornings with steaming Kadak Chai using Sweet Monk liquid drops without worrying about daily sugar intake.',
    caloriesSaving: 'Save 40 kcal per cup'
  }
];

export function DishesAutoScrollSection() {
  const [isPaused, setIsPaused] = useState(false);
  const [selectedDishModal, setSelectedDishModal] = useState<DishItem | null>(null);

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
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-900 leading-tight mb-4 tracking-tight">
            Enjoy Your Favorite Dishes <br />
            <span className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-amber-600 bg-clip-text text-transparent italic">
              With Sweet Monk
            </span>
          </h2>

          <p className="text-neutral-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            From slow-cooked Kheer and Gajar Ka Halwa to Gulab Jamun, Rasmalai, and morning Chai — replace sugar 1:1 with pure Sweet Monk Fruit Drops. Zero calories, zero aftertaste, and zero blood sugar spikes.
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
          className={`animate-marquee flex gap-7 px-4 ${isPaused ? 'paused' : ''}`}
          style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
        >
          {marqueeItems.map((dish, index) => (
            <div
              key={`${dish.id}-${index}`}
              onClick={() => setSelectedDishModal(dish)}
              className="w-[340px] sm:w-[420px] md:w-[460px] shrink-0 bg-white border border-emerald-900/15 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col group/card transform hover:-translate-y-2 cursor-pointer"
            >
              {/* Pure Clean Full-Bleed Large Image Container - No Text/Badges */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-900">
                <img
                  src={dish.dishImage}
                  alt={dish.name}
                  className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center Image & Recipe Lightbox Modal */}
      {selectedDishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-neutral-200">
            {/* Close Button */}
            <button
              onClick={() => setSelectedDishModal(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/70 text-white hover:bg-black transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Image Header */}
            <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-neutral-900">
              <img
                src={selectedDishModal.dishImage}
                alt={selectedDishModal.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-neutral-950 font-black text-xs px-2.5 py-0.5 rounded-full uppercase">
                    {selectedDishModal.hindiName}
                  </span>
                  <span className="bg-emerald-600 text-white font-bold text-xs px-2.5 py-0.5 rounded-full">
                    {selectedDishModal.healthBadge}
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold">{selectedDishModal.name}</h3>
              </div>
            </div>

            {/* Modal Body Info */}
            <div className="p-6 space-y-5 bg-white">
              <p className="text-neutral-700 text-sm leading-relaxed">
                {selectedDishModal.description}
              </p>

              {/* Nutrition Highlights Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-800/15">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Health Advantage</span>
                  </div>
                  <div className="text-xs text-neutral-700 font-medium">
                    {selectedDishModal.glycemicIndex} • 100% Natural Sugar Taste
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-600/20">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs mb-1">
                    <Heart className="w-4 h-4 text-amber-600 fill-amber-600" />
                    <span>Family Benefit</span>
                  </div>
                  <div className="text-xs text-neutral-700 font-medium">
                    {selectedDishModal.caloriesSaving}
                  </div>
                </div>
              </div>

              {/* Tagline Reassurance */}
              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{selectedDishModal.tagline}</span>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                <span className="text-xs font-bold text-emerald-800">1:1 Direct Sugar Replacement</span>
                <a
                  href="/shop"
                  className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Try Sweet Monk in this Recipe</span>
                  <ShoppingBag className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
