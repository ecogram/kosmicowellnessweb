import { Container } from '../../components/ui/Container';
import { Button } from '../../components/ui/Button';

export function BrandStory() {
  return (
    <section className="py-16 md:py-24 bg-primary-dark text-white overflow-hidden">
      <Container>
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          <div className="w-full md:w-1/2 order-2 md:order-1 relative">
            <div className="aspect-[4/3] md:aspect-square lg:aspect-[4/3] rounded-3xl overflow-hidden relative z-10">
              <img
                src="/assets/products/lifestyle-couple.jpg"
                alt="Couple enjoying healthy lifestyle with Kosmico Wellness"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-full h-full border-2 border-accent rounded-3xl -z-0"></div>
          </div>

          <div className="w-full md:w-1/2 order-1 md:order-2">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-secondary mb-6 leading-tight">
              A sweeter life, <br /> shared with those you love.
            </h2>
            <p className="text-secondary/80 text-lg mb-6 leading-relaxed">
              We started Kosmico Wellness because we believed you shouldn't have to choose between
              enjoying your favorite sweet treats and living a healthy lifestyle.
            </p>
            <p className="text-secondary/80 text-lg mb-8 leading-relaxed">
              Derived from the ancient monk fruit, our sweetener brings natural, zero-calorie
              sweetness into your home. It's the perfect companion for family breakfasts, afternoon
              teas, and midnight baking sessions.
            </p>
            <Button
              variant="outline"
              className="border-accent text-accent hover:bg-accent hover:text-primary-dark"
            >
              Our Story
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
