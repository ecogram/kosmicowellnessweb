import { Link } from 'react-router-dom';
import { Container } from '../../components/ui/Container';
import { Button } from '../../components/ui/Button';

export function FinalCta() {
  return (
    <section className="py-20 md:py-32 bg-primary text-white text-center">
      <Container>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            Ready to make the sweetner change?
          </h2>
          <p className="text-lg md:text-xl text-primary-light mb-10 text-white/80">
            Join thousands of others who have switched to a healthier, zero-calorie alternative
            without sacrificing the taste they love.
          </p>
          <Link to="/shop">
            <Button
              size="lg"
              className="bg-accent text-primary-dark hover:bg-accent-hover text-lg px-12 h-16 shadow-lg shadow-accent/20"
            >
              Shop Now
            </Button>
          </Link>
          <p className="mt-6 text-sm text-white/60">
            100% satisfaction guarantee.
          </p>
        </div>
      </Container>
    </section>
  );
}
