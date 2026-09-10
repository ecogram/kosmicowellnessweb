import { useState } from 'react';
import { Container } from '../../components/ui/Container';
import { Coffee, UtensilsCrossed, Flame, Sparkles, CheckCircle2, Eye, X, ShoppingBag, Heart } from 'lucide-react';

interface SubDish {
  id: string;
  name: string;
  image: string;
  sweetenerType: string;
}

interface TabContent {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  tagline: string;
  benefits: string[];
  defaultImage: string;
  ratio: string;
  dishes?: SubDish[];
}

const tabs: TabContent[] = [
  {
    id: 'chai-coffee',
    title: 'Daily Chai & Filter Coffee',
    subtitle: 'Zero milk splitting, authentic Indian tea flavor',
    icon: Coffee,
    tagline: 'Enjoy your morning & evening Kadak Chai with family without guilt or blood sugar spikes.',
    benefits: [
      'Dissolves instantly in boiling hot tea or coffee',
      'Guaranteed zero milk curdling or splitting',
      'No bitter, metallic, or chemical aftertaste',
      '1 Spoon Kosmico = 1 Spoon Table Sugar sweetness'
    ],
    defaultImage: '/assets/products/lifestyle-tea.jpg',
    ratio: '1:1 Direct Replacement',
    dishes: [
      { id: 'kadak-tea', name: 'Kadak Masala Chai', image: '/assets/products/lifestyle-tea.jpg', sweetenerType: '1 Drop / Cup' },
      { id: 'family-tea', name: 'Family Morning Chai', image: '/assets/products/lifestyle-couple.jpg', sweetenerType: 'Zero Sugar Guilt' },
    ]
  },
  {
    id: 'mithai',
    title: 'Traditional Indian Mithai',
    subtitle: 'High-heat stable for Kheer, Gajar Halwa & Ladoos',
    icon: UtensilsCrossed,
    tagline: 'Recreate festive sweets for diabetic parents & family members without compromising on taste.',
    benefits: [
      'High-heat stable up to 250°C — perfect for slow-cooked Kheer',
      'Caramelizes and coats like natural cane sugar in Gajar Halwa',
      'Zero glucose spikes — 100% safe for elders, kids and diabetics',
      'Keeps Mithai fresh without crystalline texture or hard bite'
    ],
    defaultImage: '/assets/dishes/gajar-halwa-lifestyle.jpg',
    ratio: '1:1 Equal Measure',
    dishes: [
      { id: 'gajar-halwa', name: 'Gajar Ka Halwa', image: '/assets/dishes/gajar-halwa-lifestyle.jpg', sweetenerType: 'Caramelizes Like Sugar' },
      { id: 'kheer', name: 'Kesariya Rice Kheer', image: '/assets/dishes/kheer-lifestyle.jpg', sweetenerType: 'High-Heat 250°C Stable' },
      { id: 'ladoo', name: 'Besan & Motichoor Ladoo', image: '/assets/dishes/ladoo-lifestyle.jpg', sweetenerType: 'Zero Crystalline Texture' },
      { id: 'gulab-jamun', name: 'Syrupy Gulab Jamun', image: '/assets/dishes/gulab-jamun-lifestyle.jpg', sweetenerType: 'Zero Calorie Syrup' }
    ]
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
      'Supports weight loss, keto diets, and fasting regimens'
    ],
    defaultImage: '/assets/products/lifestyle-gym.jpg',
    ratio: '0 Calories / 0 Net Carbs',
    dishes: [
      { id: 'gym-shakes', name: 'Protein Oats & Bowls', image: '/assets/products/lifestyle-gym.jpg', sweetenerType: '0 Net Carbs' },
      { id: 'healthy-bakes', name: 'Sugar-Free Home Bakes', image: '/assets/dishes/kheer.jpg', sweetenerType: 'Moist & Fluffy' }
    ]
  }
];

export function MithaiSection() {
  const [activeTab, setActiveTab] = useState<string>('mithai');
  const [selectedDishImage, setSelectedDishImage] = useState<string | null>(null);
  const [previewModalImage, setPreviewModalImage] = useState<{ image: string; title: string } | null>(null);

  const current = tabs.find((t) => t.id === activeTab) || tabs[1];
  const IconComponent = current.icon;
  const currentImage = selectedDishImage || current.defaultImage;

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const target = tabs.find((t) => t.id === tabId);
    setSelectedDishImage(target?.defaultImage || null);
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-stone-50 via-emerald-50/40 to-stone-50 border-y border-emerald-900/10 relative overflow-hidden">
      {/* Background Decorative Blur */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <Container>
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-800/10 text-emerald-900 font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider mb-3 border border-emerald-800/15 shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Tailored for Indian Kitchens &amp; Families</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-900 leading-tight">
            Sweetens Everything From{' '}
            <span className="text-emerald-800 underline decoration-amber-400 decoration-4">Kadak Chai</span> To{' '}
            <span className="text-amber-700 underline decoration-emerald-600 decoration-4">Gajar Ka Halwa</span>
          </h2>
          <p className="text-neutral-600 mt-3 text-base md:text-lg max-w-2xl mx-auto">
            Unlike artificial sweeteners that split milk or leave a bitter chemical aftertaste, Sweet Monk behaves 1:1 like natural sugar in all traditional Indian recipes.
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
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-lg shadow-emerald-900/20 scale-105 border border-emerald-700'
                    : 'bg-white text-neutral-800 hover:bg-neutral-50 border border-neutral-200'
                }`}
              >
                <TabIcon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-emerald-800'}`} />
                <span>{tab.title}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Info Side */}
          <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-800/10 text-emerald-800 flex items-center justify-center font-bold">
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl md:text-3xl font-bold text-neutral-900">{current.title}</h3>
                  <p className="text-xs text-emerald-800 font-extrabold uppercase tracking-wider">{current.subtitle}</p>
                </div>
              </div>

              {/* Tagline Card */}
              <div className="text-neutral-800 text-sm md:text-base font-medium mb-6 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-800/15 flex items-start gap-2.5">
                <Heart className="w-4 h-4 text-emerald-700 shrink-0 mt-1 fill-emerald-700" />
                <p>"{current.tagline}"</p>
              </div>

              {/* Dish Selector Switcher */}
              {current.dishes && current.dishes.length > 0 && (
                <div className="mb-6 space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                    Choose Dish / Recipe Preview:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {current.dishes.map((dish) => {
                      const isSelected = (selectedDishImage || current.defaultImage) === dish.image;
                      return (
                        <button
                          key={dish.id}
                          onClick={() => setSelectedDishImage(dish.image)}
                          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs scale-102'
                              : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-emerald-50 hover:border-emerald-800/30'
                          }`}
                        >
                          <span>{dish.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${isSelected ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-600'}`}>
                            {dish.sweetenerType}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Key Benefits List */}
              <div className="space-y-3.5 mb-8">
                {current.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-neutral-800">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-neutral-100">
              <div>
                <span className="text-xs text-neutral-500 font-semibold block">Substitution Ratio</span>
                <span className="font-serif font-bold text-lg text-emerald-800">{current.ratio}</span>
              </div>
              <a
                href="/shop"
                className="px-6 py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-emerald-900/15 flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>Try In Your Kitchen</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </a>
            </div>
          </div>

          {/* Visual Side with Sweet Monk Product and Dish Highlight */}
          <div className="lg:col-span-5 relative min-h-[340px] lg:min-h-full bg-neutral-900 overflow-hidden group">
            <img
              src={currentImage}
              alt={current.title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            
            {/* Click to Zoom Overlay Button */}
            <button
              onClick={() => setPreviewModalImage({ image: currentImage, title: current.title })}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all shadow-lg cursor-pointer"
              title="View full image"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Bottom Gradient Card Information */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 pointer-events-none">
              <div className="text-white space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-400/40 shadow-xs">
                    Sweet Monk 100% Monk Fruit
                  </span>
                  <span className="bg-amber-500 text-neutral-950 text-[11px] font-black px-2.5 py-1 rounded-full">
                    Family Safe
                  </span>
                </div>
                <h4 className="font-serif text-xl md:text-2xl font-bold">100% Sugar Taste. 0 Calories.</h4>
                <p className="text-neutral-300 text-xs leading-relaxed">
                  Slow-cooked Indian sweets and chai prepared with pure Monk Fruit drops for the entire family.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Image Preview Lightbox Modal */}
      {previewModalImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-neutral-700">
            <button
              onClick={() => setPreviewModalImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/70 text-white hover:bg-black transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="max-h-[75vh] overflow-hidden bg-black flex items-center justify-center">
              <img
                src={previewModalImage.image}
                alt={previewModalImage.title}
                className="max-h-[75vh] w-full object-contain"
              />
            </div>
            <div className="p-6 bg-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-neutral-900">{previewModalImage.title}</h3>
                <p className="text-xs text-neutral-600">Prepared naturally with Sweet Monk Fruit Sweetener Drops</p>
              </div>
              <a
                href="/shop"
                className="px-5 py-2.5 bg-emerald-800 text-white font-bold text-xs rounded-xl hover:bg-emerald-900 transition-colors shadow-xs flex items-center gap-1.5"
              >
                <span>Try Sweet Monk</span>
                <ShoppingBag className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
