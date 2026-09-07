import { Container } from '../../components/ui/Container';
import { Sparkles, Utensils, Zap, ThumbsUp, ArrowRight } from 'lucide-react';

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
  return (
    <section id="benefits" className="py-16 md:py-24 bg-gradient-to-b from-background to-surface-secondary/40 relative">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full inline-block mb-3">
            Why Choose Kosmiko Wellness
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-text-main">
            Pure Natural Sweetness, Zero Compromise
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;

            return (
              <div 
                key={index} 
                className="group relative bg-surface border border-border/80 rounded-3xl p-7 shadow-xs hover:shadow-xl hover:border-primary/40 transition-all duration-300 transform hover:-translate-y-2 flex flex-col justify-between overflow-hidden"
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

                <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs font-bold text-primary group-hover:text-accent transition-colors">
                  <span>Learn Benefits</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

