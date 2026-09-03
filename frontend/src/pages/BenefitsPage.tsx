import { Container } from '../components/ui/Container';
import { Benefits } from '../features/home/Benefits';
import { Comparison } from '../features/home/Comparison';
import { Lifestyle } from '../features/home/Lifestyle';
import { FinalCta } from '../features/home/FinalCta';
import { ShieldCheck, Heart, Sparkles, Award } from 'lucide-react';

export function BenefitsPage() {
  return (
    <div className="flex flex-col w-full pt-16 md:pt-20">
      {/* Hero Header */}
      <section className="bg-primary/5 py-14 md:py-20 border-b border-border">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-accent font-bold tracking-wider uppercase text-xs md:text-sm mb-3 block">
              Pure Sweetness Without Compromise
            </span>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary-dark mb-6 leading-tight">
              Why Choose Kosmico Wellness?
            </h1>
            <p className="text-base md:text-lg text-text-muted leading-relaxed mb-8">
              Experience all the natural sweetness of traditional sugar with zero calories, zero sugar spikes, and zero guilt. Formulated for everyday health, wellness, and fitness.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-border/60">
              <div className="flex flex-col items-center p-3 rounded-xl bg-surface border border-border/50">
                <ShieldCheck className="w-6 h-6 text-primary mb-2" />
                <span className="text-xs md:text-sm font-semibold text-primary-dark">Zero Sugar Spikes</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-xl bg-surface border border-border/50">
                <Heart className="w-6 h-6 text-primary mb-2" />
                <span className="text-xs md:text-sm font-semibold text-primary-dark">Diabetic Friendly</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-xl bg-surface border border-border/50">
                <Sparkles className="w-6 h-6 text-primary mb-2" />
                <span className="text-xs md:text-sm font-semibold text-primary-dark">Keto & Vegan</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-xl bg-surface border border-border/50">
                <Award className="w-6 h-6 text-primary mb-2" />
                <span className="text-xs md:text-sm font-semibold text-primary-dark">100% Natural</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Core Benefits */}
      <Benefits />

      {/* Comparison against Sugar & Stevia */}
      <Comparison />

      {/* Active Lifestyle Support */}
      <Lifestyle />

      {/* Final Call to Action */}
      <FinalCta />
    </div>
  );
}
