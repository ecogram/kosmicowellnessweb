import { Hero } from '../features/home/Hero';
import { TrustIndicators } from '../features/home/TrustIndicators';
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

export function Home() {
  return (
    <div className="flex flex-col w-full">
      <Hero />
      <TrustIndicators />
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
