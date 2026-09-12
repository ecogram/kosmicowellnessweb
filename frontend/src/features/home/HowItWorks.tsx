import { Container } from '../../components/ui/Container';

export function HowItWorks() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <Container>
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          <div className="w-full md:w-1/2">
            <div className="aspect-[4/5] rounded-t-full rounded-b-3xl overflow-hidden relative shadow-lg">
              <img
                src="/assets/products/lifestyle-tea.jpg"
                alt="Kosmico Wellness used in morning tea"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="w-full md:w-1/2">
            <span className="text-accent font-bold tracking-widest uppercase text-sm mb-3 block">
              Everyday Usage
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-primary-dark mb-6 leading-tight">
              A 1:1 replacement for sugar.
            </h2>
            <p className="text-lg text-text-muted mb-10 leading-relaxed">
              No complicated math required. Use Kosmico Wellness exactly as you would use regular sugar in
              all your daily routines.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border">
                <div className="text-3xl mb-4">☕</div>
                <h4 className="font-bold text-primary-dark text-lg mb-2">Morning Coffee & Tea</h4>
                <p className="text-sm text-text-muted">
                  Dissolves perfectly in hot beverages without any bitter aftertaste.
                </p>
              </div>
              <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border">
                <div className="text-3xl mb-4">🧁</div>
                <h4 className="font-bold text-primary-dark text-lg mb-2">Baking & Cooking</h4>
                <p className="text-sm text-text-muted">
                  Bakes and browns just like sugar. Try it in your favorite cookies or cakes.
                </p>
              </div>
              <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border">
                <div className="text-3xl mb-4">🍹</div>
                <h4 className="font-bold text-primary-dark text-lg mb-2">Cold Drinks</h4>
                <p className="text-sm text-text-muted">
                  Our liquid drops are perfect for sweetening iced tea, lemonade, and smoothies.
                </p>
              </div>
              <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border">
                <div className="text-3xl mb-4">🥣</div>
                <h4 className="font-bold text-primary-dark text-lg mb-2">Breakfast Bowls</h4>
                <p className="text-sm text-text-muted">
                  Sprinkle over oatmeal, yogurt, or fresh fruit for an extra touch of sweetness.
                </p>
              </div>
            </div>

            {/* Lab Certified Trust Banner */}
            <div className="mt-8 p-4 bg-emerald-50/80 border border-emerald-800/20 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-lg">
                  ✓
                </span>
                <div>
                  <h5 className="font-bold text-neutral-900 text-sm">Lab Tested 0.0 Calories &amp; 0g Sugar</h5>
                  <p className="text-xs text-neutral-600">Qualiset Food Laboratories Report: QFL/160726/05</p>
                </div>
              </div>
              <a href="/how-it-works" className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline shrink-0">
                View Lab Report &rarr;
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
