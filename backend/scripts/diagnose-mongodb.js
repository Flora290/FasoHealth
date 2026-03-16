// Script de diagnostic pour vérifier la connexion MongoDB
const mongoose = require('mongoose');

const diagnoseMongoDB = async () => {
  try {
    console.log('🔍 Diagnostic de la connexion MongoDB...\n');
    
    // Configuration de la connexion avec timeout
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 secondes pour le test
      socketTimeoutMS: 5000,
      bufferMaxEntries: 0,
      bufferCommands: false,
    };

    // Test de connexion
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fasohealth', options);
    
    console.log('✅ Connexion MongoDB réussie !');
    console.log('📊 Base de données:', mongoose.connection.name);
    
    // Test d'opération simple
    const collections = await mongoose.connection.db.listCollections();
    console.log('📋 Collections disponibles:', collections.map(c => c.name));
    
    // Test d'écriture/lecture
    const testCollection = mongoose.connection.db.collection('test');
    await testCollection.insertOne({ test: 'connection', timestamp: new Date() });
    const result = await testCollection.findOne({ test: 'connection' });
    console.log('✅ Test lecture/écriture réussie:', result);
    
    // Nettoyer le test
    await testCollection.deleteMany({});
    
    await mongoose.connection.close();
    console.log('🔌 Connexion fermée avec succès');
    console.log('\n🎉 MongoDB est prêt pour la création des données !');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    
    if (error.name === 'MongooseServerSelectionError') {
      console.log('\n🔧 SOLUTIONS POSSIBLES:');
      console.log('1. Vérifiez que MongoDB est bien démarré');
      console.log('   - Sur Windows: mongod --dbpath "C:\\data\\db"');
      console.log('   - Sur Mac/Linux: mongod --dbpath /data/db');
      console.log('   - Sur Linux: sudo systemctl start mongod');
      console.log('\n2. Vérifiez l\'URL de connexion dans .env:');
      console.log('   - MongoDB: mongodb://localhost:27017/fasohealth');
      console.log('   - Alternative: mongodb://127.0.0.1:27017/fasohealth');
      console.log('\n3. Vérifiez que le port 27017 est ouvert:');
      console.log('   - Sur Windows: netstat -an | findstr :27017');
      console.log('   - Sur Mac/Linux: lsof -i :27017');
      console.log('   - Sur Linux: sudo netstat -tlnp | grep 27017');
    }
    
    if (error.name === 'MongooseServerTimeoutError') {
      console.log('\n⏰️ TIMEOUT SOLUTION:');
      console.log('1. Augmentez le timeout dans le script');
      console.log('2. Vérifiez la vitesse du disque dur');
      console.log('3. Redémarrez MongoDB avec plus de mémoire');
    }
    
    return false;
  }
};

// Exécuter le diagnostic
diagnoseMongoDB();
