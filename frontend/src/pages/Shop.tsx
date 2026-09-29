import { useSearchParams } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { ProductCard } from '../components/ui/ProductCard';
import { useProducts, useCategories } from '../hooks/useProducts';
import { Button } from '../components/ui/Button';
import { X } from 'lucide-react';

export const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: categoriesData } = useCategories();
  
  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const rawCategory = searchParams.get('category') || '';
  const cleanCategoryParam = (rawCategory === 'undefined' || rawCategory === 'null') ? '' : rawCategory;

  // Resolve matching category ID from categoriesData (matches _id, slug, or name)
  const matchedCategory = categoriesData?.find((c: any) =>
    c._id === cleanCategoryParam ||
    c.slug === cleanCategoryParam ||
    c.name?.toLowerCase() === cleanCategoryParam.toLowerCase()
  );
  const category = matchedCategory ? matchedCategory._id : cleanCategoryParam;

  const sort = searchParams.get('sort') || '-createdAt';

  const hasActiveFilters = Boolean(search || category || (sort && sort !== '-createdAt'));
  
  const { data, isLoading, isError } = useProducts({ page, limit: 12, search, category, sortBy: sort });

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

            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => setSearchParams(new URLSearchParams())}
                className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white rounded-md text-sm font-semibold transition-all whitespace-nowrap cursor-pointer w-full sm:w-auto flex items-center justify-center gap-1.5 shadow-xs"
                title="Clear all filters"
              >
                <X className="w-4 h-4" />
                <span>Clear Filters</span>
              </button>
            )}
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
            <p className="text-text-muted mb-6">Try adjusting your search or filters.</p>
            <Button 
              className="px-8 shadow-sm"
              onClick={() => setSearchParams(new URLSearchParams())}
            >
              Shop Now
            </Button>
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
