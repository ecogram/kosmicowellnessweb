import { SEO } from '../components/SEO';
import { Hero } from '../features/home/Hero';
import { TrustIndicators } from '../features/home/TrustIndicators';
import { DishesAutoScrollSection } from '../features/home/DishesAutoScrollSection';
import { SmartCareSuite } from '../features/home/SmartCareSuite';
import { AppDownloadSection } from '../features/home/AppDownloadSection';
import { HealthTargeting } from '../features/home/HealthTargeting';
import { ProductShowcase } from '../features/home/ProductShowcase';
import { MithaiSection } from '../features/home/MithaiSection';
import { Benefits } from '../features/home/Benefits';
import { BrandStory } from '../features/home/BrandStory';
import { Ingredients } from '../features/home/Ingredients';
import { HowItWorks } from '../features/home/HowItWorks';
import { Comparison } from '../features/home/Comparison';
import { Lifestyle } from '../features/home/Lifestyle';
import { Reviews } from '../features/home/Reviews';
import { Faq } from '../features/home/Faq';
import { FinalCta } from '../features/home/FinalCta';

const homeProductSchema = {
  '@type': 'Product',
  name: 'Sweet Monk — 100% Natural Zero-Calorie Sweetener Drops',
  image: 'https://www.kosmicowellness.com/kosmico-logo.png',
  description: 'Pure monk fruit extract liquid sweetener drops. 100% natural, zero glycemic index, zero calories, zero sugar spikes. Ideal for diabetes, weight loss, and keto lifestyles.',
  brand: {
    '@type': 'Brand',
    name: 'Kosmico Wellness',
  },
  offers: {
    '@type': 'Offer',
    priceCurrency: 'INR',
    price: '549',
    availability: 'https://schema.org/InStock',
    url: 'https://www.kosmicowellness.com/shop',
    seller: {
      '@type': 'Organization',
      name: 'Kosmico Wellness Private Limited',
    },
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '180',
  },
};

export function Home() {
  return (
    <div className="flex flex-col w-full">
      <SEO
        title="Sweet Monk — 100% Natural Monk Fruit Sweetener Drops | Kosmico Wellness"
        description="Experience 100% natural Sweet Monk fruit liquid sweetener drops by Kosmico Wellness. Zero calories, zero glycemic index, zero aftertaste. Perfect for diabetics & keto."
        keywords="Sweet Monk, sweet monk fruit, sweet monk sweetener, sweet monk drops, buy sweet monk online, sweet monk price in india, Kosmico Wellness, monk fruit sweetener drops, zero calorie sugar alternative, diabetes friendly sweetener, keto sugar substitute, natural monk fruit India"
        schema={homeProductSchema}
      />
      <Hero />
      <TrustIndicators />
      <DishesAutoScrollSection />
      <SmartCareSuite />

      <HealthTargeting />
      <ProductShowcase />
      <MithaiSection />
      <AppDownloadSection />
      <Benefits />
      <BrandStory />
      <Ingredients />
      <HowItWorks />
      <Comparison />
      <Lifestyle />
      <Reviews />
      <Faq />
      <FinalCta />
    </div>
  );
}
