import { Activity, Heart, ShieldAlert, Scale, Check } from 'lucide-react';
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
  return (
    <section className="py-16 bg-surface relative">
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-12">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {healthCards.map((card, idx) => {
            const CardIcon = card.icon;

            return (
              <div 
                key={idx}
                className="bg-surface-secondary/50 border border-border rounded-2xl p-6 flex flex-col justify-between hover:border-primary/40 hover:shadow-lg transition-all duration-300 group"
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
      </Container>
    </section>
  );
}
