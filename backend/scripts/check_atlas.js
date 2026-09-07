const mongoose = require('mongoose');

const uri = 'mongodb+srv://KosmicoWellness:KosmicoWellness@cluster0.67auck3.mongodb.net/kosmico_wellness?retryWrites=true&w=majority&appName=Cluster0';

async function checkAtlas() {
  try {
    await mongoose.connect(uri);
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('\n📊 Database Name: kosmico_wellness');
    console.log('====================================');
    for (let col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`📁 Collection: ${col.name} -> ${count} document(s)`);
    }
    
    // Fetch products
    const products = await db.collection('products').find({}).toArray();
    console.log('\n🛍️ Products in Atlas DB:');
    products.forEach(p => console.log(`- ${p.name} | Price: ₹${p.price} | Stock: ${p.stock}`));

    // Fetch users
    const users = await db.collection('users').find({}).toArray();
    console.log('\n👤 Users in Atlas DB:');
    users.forEach(u => console.log(`- ${u.name} (${u.email}) | Role: ${u.role}`));

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error checking Atlas DB:', err);
  }
}

checkAtlas();
