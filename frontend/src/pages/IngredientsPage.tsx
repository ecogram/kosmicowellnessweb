import { Ingredients } from '../features/home/Ingredients';
import { Comparison } from '../features/home/Comparison';
import { FinalCta } from '../features/home/FinalCta';
import { SEO } from '../components/SEO';

export function IngredientsPage() {
  return (
    <div className="flex flex-col w-full pt-20">
      <SEO
        title="Pure Ingredients — 100% Natural Monk Fruit Extract | Kosmico Wellness"
        description="Discover the 100% natural ingredients of Sweet Monk: pure Luo Han Guo monk fruit extract, purified water, and Vitamin C. Free from erythritol, sucralose, and artificial additives."
        keywords="monk fruit ingredients, luo han guo extract, natural sweetener ingredients, no erythritol sweetener, clean label sweetener, Kosmico Sweet Monk"
        canonicalUrl="https://www.kosmicowellness.com/ingredients"
      />
      <Ingredients />
      <Comparison />
      <FinalCta />
    </div>
  );
}
