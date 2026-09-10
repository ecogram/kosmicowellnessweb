import { Container } from '../../components/ui/Container';

export function Lifestyle() {
  return (
    <section className="py-16 md:py-24 bg-primary-dark overflow-hidden relative">
      <div className="absolute inset-0 z-0 opacity-20">
        <img
          src="/assets/products/lifestyle-gym.jpg"
          alt="Active lifestyle"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-primary-dark via-primary-dark/90 to-transparent z-0"></div>

      <Container className="relative z-10">
        <div className="w-full md:w-2/3 lg:w-1/2">
          <span className="text-accent font-bold tracking-widest uppercase text-sm mb-3 block">
            Fuel Your Active Life
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-6 leading-tight">
            Sweetness that keeps up with you.
          </h2>
          <p className="text-lg text-secondary/90 mb-8 leading-relaxed">
            Whether you're hitting the gym, following a strict keto regimen, or simply trying to cut
            back on empty calories, Kosmico Wellness fits seamlessly into your active lifestyle.
          </p>
          <p className="text-lg text-secondary/90 mb-10 leading-relaxed">
            It provides the satisfying taste you crave without derailing your nutrition goals. Zero
            calories, zero net carbs, 100% natural.
          </p>

          <div className="grid grid-cols-2 gap-6 border-t border-white/20 pt-8">
            <div>
              <div className="text-4xl font-serif font-bold text-accent mb-2">0g</div>
              <div className="text-sm font-medium text-white uppercase tracking-wider">
                Net Carbs
              </div>
            </div>
            <div>
              <div className="text-4xl font-serif font-bold text-accent mb-2">0</div>
              <div className="text-sm font-medium text-white uppercase tracking-wider">
                Calories
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
