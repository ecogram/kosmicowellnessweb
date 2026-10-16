import { Faq } from '../features/home/Faq';
import { FinalCta } from '../features/home/FinalCta';
import { SEO } from '../components/SEO';

const faqSchema = {
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Monk Fruit?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Monk fruit, also known as Luo Han Guo, is a small green melon native to Southeast Asia. It gets its sweetness from natural compounds called mogrosides, which are up to 250 times sweeter than regular sugar but contain zero calories.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Kosmico Wellness Sweet Monk have an aftertaste?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Unlike artificial sweeteners or stevia, our liquid monk fruit drops are specifically crafted to mimic the clean taste of cane sugar without any bitter or chemical aftertaste or sugar alcohols.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I bake with Sweet Monk drops?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Sweet Monk drops can be used in your favorite beverages, recipes, desserts, and cooking to add clean sweetness.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Sweet Monk safe for diabetics?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Sweet Monk has zero calories and zero net carbs, meaning it does not spike blood glucose or insulin levels, making it ideal for managing diabetes or following a keto diet.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Sweet Monk contain sugar alcohols or Erythritol?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Sweet Monk drops contain zero sugar alcohols like erythritol. Our drops are made with pure monk fruit extract, purified water, and Vitamin C.',
      },
    },
  ],
};

export function FaqPage() {
  return (
    <div className="flex flex-col w-full pt-20">
      <SEO
        title="Frequently Asked Questions (FAQ) — Sweet Monk | Kosmico Wellness"
        description="Got questions about Sweet Monk, pure monk fruit extract, diabetes safety, keto diets, or usage? Read our comprehensive FAQ guide."
        keywords="monk fruit FAQ, is monk fruit safe for diabetes, monk fruit aftertaste, baking with monk fruit, Sweet Monk questions"
        canonicalUrl="https://www.kosmicowellness.com/faq"
        schema={faqSchema}
      />
      <Faq />
      <FinalCta />
    </div>
  );
}
