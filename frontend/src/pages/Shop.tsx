import { useSearchParams } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { ProductCard } from '../components/ui/ProductCard';
import { useProducts, useCategories } from '../hooks/useProducts';
import { Button } from '../components/ui/Button';

export const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  
  const { data, isLoading, isError } = useProducts({ page, limit: 12, search, category, sort });
  const { data: categoriesData } = useCategories();

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      prev.set('page', newPage.toString());
      return prev;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (key: string, value: string) => {
    setSearchParams((prev) => {
      if (value) prev.set(key, value);
      else prev.delete(key);
      prev.set('page', '1'); // Reset to page 1 on filter
      return prev;
    });
  };

  return (
    <div className="bg-surface py-12">
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="font-serif text-4xl font-bold text-primary">All Products</h1>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search products..."
              className="px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-48"
              value={search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            
            <select 
              className="px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white w-full sm:w-auto"
              value={category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {categoriesData?.map((cat: any) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>

            <select 
              className="px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white w-full sm:w-auto"
              value={sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              <option value="-createdAt">Newest</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="-rating">Top Rated</option>
            </select>
          </div>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-4">
                <div className="bg-neutral-200 h-64 rounded-xl w-full"></div>
                <div className="bg-neutral-200 h-4 rounded w-3/4"></div>
                <div className="bg-neutral-200 h-4 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="text-center py-20 text-red-500">
            Failed to load products. Please try again.
          </div>
        )}

        {!isLoading && !isError && data?.products?.length === 0 && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-serif text-primary mb-2">No products found</h2>
            <p className="text-text-muted">Try adjusting your search or filters.</p>
            {(search || category) && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setSearchParams(new URLSearchParams())}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {!isLoading && !isError && data?.products && data.products.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {data.products.map((product: any) => (
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
                    reviewsCount: product.numReviews || product.reviewsCount || 128,
                  }}
                />
              ))}
            </div>

            {/* Pagination */}
            {data.pagination?.pages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <Button 
                  variant="outline" 
                  disabled={data.pagination.page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                >
                  Previous
                </Button>
                
                <span className="text-sm font-medium">
                  Page {data.pagination.page} of {data.pagination.pages}
                </span>

                <Button 
                  variant="outline" 
                  disabled={data.pagination.page >= data.pagination.pages}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
};
