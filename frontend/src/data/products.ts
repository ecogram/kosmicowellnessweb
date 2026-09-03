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
    _id: 'prod-001',
    name: 'Kosmico Pure Liquid Drops (50ml)',
    slug: 'kosmico-pure-liquid-drops-50ml',
    description: 'Ultra-concentrated liquid monk fruit sweetener. 3-4 drops sweeten a whole cup of tea or coffee with zero calories, zero sugar alcohol, and no bitter aftertaste. Compact, travel-friendly bottle.',
    shortDescription: 'Instant dissolving drops for tea, coffee & smoothies.',
    price: 399,
    compareAtPrice: 499,
    images: ['/assets/products/product-front-back.jpg', '/assets/products/product-box.jpg', '/assets/products/lifestyle-tea.jpg'],
    stock: 250,
    rating: 4.9,
    numReviews: 142,
    category: 'cat-liquid',
    isFeatured: true,
    isNewProduct: true,
    variants: [
      { size: '50ml (Pocket Size)', price: 399, compareAtPrice: 499, stock: 150 },
      { size: '100ml (Twin Pack)', price: 699, compareAtPrice: 899, stock: 100 },
    ],
  },
  {
    _id: 'prod-002',
    name: 'Kosmico Classic Monk Fruit Sweetener (250g)',
    slug: 'kosmico-classic-monk-fruit-sweetener-250g',
    description: 'Our flagship 1:1 direct white sugar replacement. Bakes, stirs, and sweetens just like real sugar without any blood sugar spikes. 100% natural, keto, diabetic, and vegan certified.',
    shortDescription: '1:1 direct sugar substitute. Zero calories, zero net carbs.',
    price: 549,
    compareAtPrice: 699,
    images: ['/assets/products/product-box.jpg', '/assets/products/product-front-back.jpg'],
    stock: 500,
    rating: 4.9,
    numReviews: 289,
    category: 'cat-classic',
    isFeatured: true,
    variants: [
      { size: '250g Jar', price: 549, compareAtPrice: 699, stock: 300 },
      { size: '500g Value Pouch', price: 949, compareAtPrice: 1199, stock: 200 },
    ],
  },
  {
    _id: 'prod-003',
    name: 'Kosmico Golden Brown Sweetener (250g)',
    slug: 'kosmico-golden-brown-sweetener-250g',
    description: 'A luscious, aromatic golden monk fruit sweetener that replicates brown sugar. Perfect for baking soft cookies, glazes, marinades, and caramel toppings with rich molasses notes.',
    shortDescription: 'Golden brown sugar replacement with rich molasses flavor.',
    price: 699,
    compareAtPrice: 849,
    images: ['/assets/products/product-box.jpg', '/assets/products/lifestyle-couple.jpg'],
    stock: 180,
    rating: 4.8,
    numReviews: 95,
    category: 'cat-golden',
    isFeatured: true,
    variants: [
      { size: '250g Jar', price: 699, compareAtPrice: 849, stock: 120 },
      { size: '500g Jar', price: 1199, compareAtPrice: 1499, stock: 60 },
    ],
  },
  {
    _id: 'prod-004',
    name: "Kosmico Baker's Blend Sweetener (500g)",
    slug: 'kosmico-bakers-blend-sweetener-500g',
    description: 'Fine-milled monk fruit sweetener engineered for professional and home bakers. Dissolves seamlessly into batters, creams, meringues, and high-heat oven baking without crystalizing.',
    shortDescription: 'Specialty fine-milled blend for baking & gourmet desserts.',
    price: 899,
    compareAtPrice: 1099,
    images: ['/assets/products/product-front-back.jpg', '/assets/products/product-box.jpg'],
    stock: 220,
    rating: 4.9,
    numReviews: 164,
    category: 'cat-bakers',
    isFeatured: false,
    variants: [
      { size: '500g Baker Pouch', price: 899, compareAtPrice: 1099, stock: 150 },
      { size: '1kg Bulk Tub', price: 1599, compareAtPrice: 1999, stock: 70 },
    ],
  },
  {
    _id: 'prod-005',
    name: 'Kosmico Family Wellness Mega Pack (1kg)',
    slug: 'kosmico-family-wellness-mega-pack-1kg',
    description: 'The ultimate monthly value pack for health-conscious families. Includes 1kg of Kosmico Classic Sweetener to replace 1kg of table sugar across cooking, tea, coffee, and daily sweets.',
    shortDescription: 'Complete monthly wellness pack. Best value per gram.',
    price: 1299,
    compareAtPrice: 1599,
    images: ['/assets/products/product-box.jpg', '/assets/products/product-front-back.jpg', '/assets/products/lifestyle-gym.jpg'],
    stock: 120,
    rating: 5.0,
    numReviews: 312,
    category: 'cat-value',
    isFeatured: true,
    variants: [
      { size: '1kg Eco-Tub', price: 1299, compareAtPrice: 1599, stock: 80 },
      { size: '2kg Family Bulk Pack', price: 2399, compareAtPrice: 2999, stock: 40 },
    ],
  },
];
