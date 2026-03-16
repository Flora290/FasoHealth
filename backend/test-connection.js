// Script de test de connexion
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const testConnection = async () => {
  try {
    console.log('🔍 Test de connexion SmartCare...\n');
    
    // Connexion à la base de données
    await mongoose.connect('mongodb://localhost:27017/fasohealth');
    console.log('✅ Connexion MongoDB réussie');
    
    // Importer le modèle User
    const User = require('./models/User');
    
    // Chercher l'administrateur
    const admin = await User.findOne({ email: 'admin@smartcare.bf' });
    
    if (!admin) {
      console.log('❌ Administrateur non trouvé');
      return;
    }
    
    console.log('\n📋 Informations de l\'administrateur:');
    console.log('Email:', admin.email);
    console.log('Nom:', admin.name);
    console.log('Role:', admin.role);
    console.log('Active:', admin.isActive);
    console.log('Password hash existe:', admin.password ? 'OUI' : 'NON');
    
    // Tester la correspondance du mot de passe
    const passwordMatch = await bcrypt.compare('admin123', admin.password);
    console.log('Mot de passe correspond:', passwordMatch ? 'OUI' : 'NON');
    
    if (passwordMatch && admin.isActive) {
      console.log('\n🎉 CONNEXION RÉUSSIE !');
      console.log('L\'administrateur peut se connecter avec:');
      console.log('Email: admin@smartcare.bf');
      console.log('Mot de passe: admin123');
    } else {
      console.log('\n❌ CONNEXION ÉCHOUÉE');
      if (!passwordMatch) {
        console.log('Le mot de passe ne correspond pas');
      }
      if (!admin.isActive) {
        console.log('Le compte n\'est pas actif');
      }
    }
    
    // Tester aussi la méthode matchPassword du modèle
    console.log('\n🧪 Test de la méthode matchPassword:');
    const modelMatch = await admin.matchPassword('admin123');
    console.log('Méthode matchPassword résultat:', modelMatch ? 'OUI' : 'NON');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  } finally {
    try {
      await mongoose.connection.close();
      console.log('\n🔌 Connexion MongoDB fermée');
    } catch (closeError) {
      console.log('⚠️ Erreur lors de la fermeture:', closeError.message);
    }
  }
};

testConnection();
