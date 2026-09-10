require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

// WARNING: MANUAL BUSINESS DECISION REQUIRED
// Do not arbitrarily multiply by 80. Determine the exact market price in INR.
const PRICE_MAP = {
  // Example mapping. Fill these with actual business decisions before running.
  "Kosmico Classic": {
    basePrice: 1499,
    variants: {
      "16 oz": { price: 1499, compareAtPrice: 1999 },
      "32 oz": { price: 2499, compareAtPrice: 2999 }
    }
  },
  "Kosmico Golden": {
    basePrice: 1599,
    variants: {
      "16 oz": { price: 1599, compareAtPrice: 2099 },
      "32 oz": { price: 2699, compareAtPrice: 3299 }
    }
  },
  "Liquid Monk Drops": {
    basePrice: 1299,
    variants: {
      "Original": { price: 1299 }
    }
  }
};

async function migrate(dryRun = true) {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sweet-monk');
    console.log(`Starting Product INR Migration (Dry Run: ${dryRun})`);
    
    const products = await Product.find({});
    
    for (let p of products) {
      console.log(`\n--- Inspecting Product: ${p.name} ---`);
      console.log(`Current DB Price: ${p.price}`);
      
      const intended = PRICE_MAP[p.name];
      if (!intended) {
        console.warn(`⚠️ WARNING: No INR price mapping found for "${p.name}". Skipping.`);
        continue;
      }
      
      console.log(`Intended INR Base Price: ${intended.basePrice}`);
      
      if (!dryRun) {
        p.price = intended.basePrice;
        if (p.variants && p.variants.length > 0) {
          p.variants.forEach(v => {
            const vPrice = intended.variants[v.size];
            if (vPrice) {
              v.price = vPrice.price;
              if (vPrice.compareAtPrice) v.compareAtPrice = vPrice.compareAtPrice;
            }
          });
        }
        
        await p.save();
        console.log(`✅ Updated ${p.name}`);
      }
    }
    
    if (dryRun) {
      console.log('\nDry run complete. No database changes were made. Run with --execute to commit changes.');
    } else {
      console.log('\nMigration complete.');
    }
    
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

const isDryRun = !process.argv.includes('--execute');
migrate(isDryRun);
