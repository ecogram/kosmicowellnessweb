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

    const classicCat = await Category.findOne({ slug: 'classic-blends' });

    const products = [
      {
        name: 'Kosmico Classic Monk Fruit Sweetener (10ml)',
        slug: 'kosmico-classic-monk-fruit-sweetener-10ml',
        description: 'Our flagship 1:1 direct white sugar replacement. Bakes, stirs, and sweetens just like real sugar without any blood sugar spikes. 100% natural, keto, diabetic, and vegan certified.',
        shortDescription: '1:1 direct sugar substitute. Zero calories, zero net carbs.',
        price: 389,
        category: classicCat._id,
        stock: 500,
        images: ['/assets/products/product-box.jpg', '/assets/products/product-front-back.jpg'],
        isFeatured: true,
        rating: 4.9,
        reviewsCount: 289,
        variants: [
          { size: '10ml Bottle', price: 389, stock: 300 },
          { size: '20ml Twin Pack', price: 750, stock: 200 },
          { size: '30ml Family Pack', price: 999, stock: 100 },
        ],
      },
    ];

    // Clear and upsert products
    await Product.deleteMany({});
    for (const prod of products) {
      await Product.create(prod);
    }
    console.log('1 Product seeded successfully in INR!');

    console.log('Database Seeding Completed Successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Failed:', error);
    process.exit(1);
  }
};

seedData();
