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

export const DEFAULT_CATEGORIES = [
  { _id: 'cat-liquid', name: 'Liquid Drops', slug: 'liquid-drops' },
  { _id: 'cat-classic', name: 'Classic Blends', slug: 'classic-blends' },
  { _id: 'cat-golden', name: 'Golden Blends', slug: 'golden-blends' },
  { _id: 'cat-bakers', name: "Baker's Special", slug: 'bakers-special' },
  { _id: 'cat-value', name: 'Value Packs', slug: 'value-packs' },
];

export const DEFAULT_PRODUCTS: ProductItem[] = [
  {
    _id: '6a9bbb3522b5ba9231e5ce3e',
    name: 'Kosmico Classic Monk Fruit Sweetener (250ml)',
    slug: 'kosmico-classic-monk-fruit-sweetener-250g',
    description: 'Our flagship 1:1 direct white sugar replacement. Bakes, stirs, and sweetens just like real sugar without any blood sugar spikes. 100% natural, keto, diabetic, and vegan certified.',
    shortDescription: '1:1 direct sugar substitute. Zero calories, zero net carbs.',
    price: 387,
    images: ['/assets/products/product-box.jpg', '/assets/products/product-front-back.jpg'],
    stock: 500,
    rating: 4.9,
    numReviews: 289,
    category: 'cat-classic',
    isFeatured: true,
    variants: [
      { size: '250ml Bottle', price: 387, stock: 300 },
      { size: '500ml Value Pack', price: 699, stock: 200 },
    ],
  },
];

