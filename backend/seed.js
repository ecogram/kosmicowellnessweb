require('dotenv').config();

const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');
const connectDB = require('./config/database');

const categories = [
  {
    name: 'Liquid Drops',
    slug: 'liquid-drops',
    description: 'Concentrated liquid sweetness for instant dissolving.',
    sortOrder: 1,
  },
  {
    name: 'Classic Blends',
    slug: 'classic-blends',
    description: 'Our traditional 1:1 sugar replacements.',
    sortOrder: 2,
  },
  {
    name: 'Golden Blends',
    slug: 'golden-blends',
    description: 'Rich, brown-sugar-like replacements.',
    sortOrder: 3,
  },
  {
    name: "Baker's Special",
    slug: 'bakers-special',
    description: 'Specialty fine-milled monk fruit blends for baking.',
    sortOrder: 4,
  },
  {
    name: 'Value Packs',
    slug: 'value-packs',
    description: 'Family value packs for daily wellness savings.',
    sortOrder: 5,
  },
];

const seedData = async () => {
  try {
    await connectDB();
    console.log('Seeding Database...');

    // Upsert categories
    for (const cat of categories) {
      await Category.updateOne({ slug: cat.slug }, { $set: cat }, { upsert: true });
    }
    console.log('Categories seeded.');

    const liquidCat = await Category.findOne({ slug: 'liquid-drops' });
    const classicCat = await Category.findOne({ slug: 'classic-blends' });
    const goldenCat = await Category.findOne({ slug: 'golden-blends' });
    const bakersCat = await Category.findOne({ slug: 'bakers-special' });
    const valueCat = await Category.findOne({ slug: 'value-packs' });

    const products = [
      {
        name: 'Kosmiko Pure Liquid Drops (50ml)',
        slug: 'kosmico-pure-liquid-drops-50ml',
        description: 'Ultra-concentrated liquid monk fruit sweetener. 3-4 drops sweeten a whole cup of tea or coffee with zero calories, zero sugar alcohol, and no bitter aftertaste. Compact, travel-friendly bottle.',
        shortDescription: 'Instant dissolving drops for tea, coffee & smoothies.',
        price: 399,
        compareAtPrice: 499,
        category: liquidCat._id,
        stock: 250,
        images: ['/assets/products/product-front-back.jpg', '/assets/products/product-box.jpg', '/assets/products/lifestyle-tea.jpg'],
        isFeatured: true,
        rating: 4.9,
        reviewsCount: 142,
        variants: [
          { size: '50ml (Pocket Size)', price: 399, compareAtPrice: 499, stock: 150 },
          { size: '100ml (Twin Pack)', price: 699, compareAtPrice: 899, stock: 100 },
        ],
      },
      {
        name: 'Kosmiko Classic Monk Fruit Sweetener (250g)',
        slug: 'kosmico-classic-monk-fruit-sweetener-250g',
        description: 'Our flagship 1:1 direct white sugar replacement. Bakes, stirs, and sweetens just like real sugar without any blood sugar spikes. 100% natural, keto, diabetic, and vegan certified.',
        shortDescription: '1:1 direct sugar substitute. Zero calories, zero net carbs.',
        price: 549,
        compareAtPrice: 699,
        category: classicCat._id,
        stock: 500,
        images: ['/assets/products/product-box.jpg', '/assets/products/product-front-back.jpg'],
        isFeatured: true,
        rating: 4.9,
        reviewsCount: 289,
        variants: [
          { size: '250g Jar', price: 549, compareAtPrice: 699, stock: 300 },
          { size: '500g Value Pouch', price: 949, compareAtPrice: 1199, stock: 200 },
        ],
      },
      {
        name: 'Kosmiko Golden Brown Sweetener (250g)',
        slug: 'kosmico-golden-brown-sweetener-250g',
        description: 'A luscious, aromatic golden monk fruit sweetener that replicates brown sugar. Perfect for baking soft cookies, glazes, marinades, and caramel toppings with rich molasses notes.',
        shortDescription: 'Golden brown sugar replacement with rich molasses flavor.',
        price: 699,
        compareAtPrice: 849,
        category: goldenCat._id,
        stock: 180,
        images: ['/assets/products/product-box.jpg', '/assets/products/lifestyle-couple.jpg'],
        isFeatured: true,
        rating: 4.8,
        reviewsCount: 95,
        variants: [
          { size: '250g Jar', price: 699, compareAtPrice: 849, stock: 120 },
          { size: '500g Jar', price: 1199, compareAtPrice: 1499, stock: 60 },
        ],
      },
      {
        name: "Kosmico Baker's Blend Sweetener (500g)",
        slug: 'kosmico-bakers-blend-sweetener-500g',
        description: 'Fine-milled monk fruit sweetener engineered for professional and home bakers. Dissolves seamlessly into batters, creams, meringues, and high-heat oven baking without crystalizing.',
        shortDescription: 'Specialty fine-milled blend for baking & gourmet desserts.',
        price: 899,
        compareAtPrice: 1099,
        category: bakersCat._id,
        stock: 220,
        images: ['/assets/products/product-front-back.jpg', '/assets/products/product-box.jpg'],
        isFeatured: false,
        rating: 4.9,
        reviewsCount: 164,
        variants: [
          { size: '500g Baker Pouch', price: 899, compareAtPrice: 1099, stock: 150 },
          { size: '1kg Bulk Tub', price: 1599, compareAtPrice: 1999, stock: 70 },
        ],
      },
      {
        name: 'Kosmico Family Wellness Mega Pack (1kg)',
        slug: 'kosmico-family-wellness-mega-pack-1kg',
        description: 'The ultimate monthly value pack for health-conscious families. Includes 1kg of Kosmico Classic Sweetener to replace 1kg of table sugar across cooking, tea, coffee, and daily sweets.',
        shortDescription: 'Complete monthly wellness pack. Best value per gram.',
        price: 1299,
        compareAtPrice: 1599,
        category: valueCat._id,
        stock: 120,
        images: ['/assets/products/product-box.jpg', '/assets/products/product-front-back.jpg', '/assets/products/lifestyle-gym.jpg'],
        isFeatured: true,
        rating: 5.0,
        reviewsCount: 312,
        variants: [
          { size: '1kg Eco-Tub', price: 1299, compareAtPrice: 1599, stock: 80 },
          { size: '2kg Family Bulk Pack', price: 2399, compareAtPrice: 2999, stock: 40 },
        ],
      },
    ];

    // Clear and upsert products
    await Product.deleteMany({});
    for (const prod of products) {
      await Product.create(prod);
    }
    console.log('5 Products seeded successfully in INR!');

    console.log('Database Seeding Completed Successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Failed:', error);
    process.exit(1);
  }
};

seedData();
