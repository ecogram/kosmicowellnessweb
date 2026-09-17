// Product type interface — matches API response shape from GET /api/products/user/list
export interface ProductItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  stock: number;
  rating: number;
  numReviews: number;
  category?: { _id: string; name: string; slug: string } | string;
  isFeatured?: boolean;
  isNewProduct?: boolean;
  variants?: { size: string; price: number; compareAtPrice?: number; stock: number }[];
}

// Category type interface — matches API response shape from GET /api/categories/user/list
export interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}
