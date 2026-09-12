import { Container } from '../../components/ui/Container';
import { ProductCard } from '../../components/ui/ProductCard';
import { useProducts } from '../../hooks/useProducts';

export function ProductShowcase() {
  const { data, isLoading } = useProducts({ page: 1, limit: 4, sort: '-rating' });

  return (
    <section className="py-16 md:py-24 bg-background">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-dark mb-4">
            Shop Our Bestsellers
          </h2>
          <p className="text-text-muted text-lg">
            Experience the natural sweetness of monk fruit. Perfect for baking, coffee, and all your
            favorite recipes.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-4">
                <div className="bg-neutral-200 h-64 rounded-xl w-full"></div>
                <div className="bg-neutral-200 h-4 rounded w-3/4"></div>
                <div className="bg-neutral-200 h-4 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {data?.products?.map((product: any) => (
              <ProductCard 
                key={product._id || product.id} 
                product={{
                  id: product._id || product.id,
                  name: product.name,
                  slug: product.slug || product._id || product.id,
                  price: product.price,
                  compareAtPrice: product.compareAtPrice,
                  image: product.image || (product.images?.length ? product.images[0] : '/assets/products/product-box.jpg'),
                  rating: product.rating || 5,
                  reviewsCount: product.numReviews || product.reviewsCount || 120,
                }} 
              />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
