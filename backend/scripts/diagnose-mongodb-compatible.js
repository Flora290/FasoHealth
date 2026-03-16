// Script de diagnostic compatible pour MongoDB
const mongoose = require('mongoose');

const diagnoseMongoDB = async () => {
  try {
    console.log('🔍 Diagnostic de la connexion MongoDB...');
    
    // Configuration de base compatible
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/fasohealth';
    console.log('📍 Tentative de connexion à:', mongoURI);
    
    // Configuration simple sans options problématiques
    await mongoose.connect(mongoURI);
    
    console.log('✅ Connexion MongoDB réussie !');
    console.log('📊 Base de données:', mongoose.connection.name);
    
    // Test simple
    const db = mongoose.connection.db;
    const collections = await db.listCollections();
    console.log('📋 Collections disponibles:', collections.map(c => c.name));
    
    // Test d'opération
    await db.collection('test').insertOne({ 
      test: 'connection', 
      timestamp: new Date().toISOString() 
    });
    
    const result = await db.collection('test').findOne({ test: 'connection' });
    console.log('✅ Test lecture/écriture réussie:', result);
    
    // Nettoyer
    await db.collection('test').deleteMany({});
    
    await mongoose.connection.close();
    console.log('🔌 Connexion fermée avec succès');
    console.log('\n🎉 MongoDB est prêt !\n');
    console.log('📋 Prochaine étape: npm run seed-quick');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    
    console.log('\n🔧 DÉTAILS DE L\'ERREUR:');
    console.log('Message:', error.message);
    console.log('Nom:', error.name);
    console.log('Code:', error.code);
    
    console.log('\n🔍 SOLUTIONS POSSIBLES:');
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('1. MongoDB n\'est pas démarré');
      console.log('   - Démarrer MongoDB: mongod --dbpath "C:\\data\\db"');
      console.log('   - Vérifiez que le service MongoDB est en cours d\'exécution');
      console.log('   - Sur Windows: Services MongoDB');
      console.log('   - Sur Linux: sudo systemctl start mongod');
      console.log('   - Sur Mac: brew services start mongodb-community');
    }
    
    if (error.message.includes('timeout') || error.name === 'MongooseServerSelectionError') {
      console.log('2. Timeout de connexion');
      console.log('   - Augmenter le timeout dans le script');
      console.log('   - Vérifier la vitesse du disque dur');
      console.log   - Redémarrer MongoDB avec plus de mémoire');
    }
    
    if (error.message.includes('AuthenticationFailed')) {
      console.log('3. Erreur d\'authentification');
      console.log('   - Vérifiez si MongoDB nécessite une authentification');
      console.log('   - Ajouter auth=true à la chaîne de connexion');
    }
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('4. Base de données non trouvée');
      console.log('   - Créer la base de données: use fasohealth');
      console.log('   - Ou changez le nom dans .env');
    }
    
    console.log('\n📞 ÉTAPES DE DÉPANNAGE:');
    console.log('1. Démarrer MongoDB (voir ci-dessus)');
    console.log('   - Sur Windows: mongod --dbpath "C:\\data\\db"');
    console.log('   - Sur Linux: sudo systemctl start mongod');
    console.log('   - Sur Mac: brew services start mongodb-community');
    console.log('2. Créer la base de données si nécessaire');
    console.log('   - use fasohealth dans le shell mongo');
    console.log('   - db.fasohealth.insertOne({name: "test"})');
    console.log('3. Relancer le script de diagnostic');
    console.log('   node scripts/diagnose-mongodb-compatible');
    console.log('4. Exécuter npm run seed-quick');
    
    return false;
  }
};

// Exécuter le diagnostic
diagnoseMongoDB();
