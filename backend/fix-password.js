const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const fixPassword = async () => {
  try {
    console.log('🔧 Correction du mot de passe administrateur...\n');
    
    // Connexion à la base de données
    await mongoose.connect('mongodb://localhost:27017/fasohealth');
    console.log('✅ Connexion MongoDB réussie');
    
    // Importer le modèle User
    const User = require('./models/User');
    
    // Générer un nouveau hash pour admin123
    const newPassword = await bcrypt.hash('admin123', 10);
    console.log('Nouveau hash généré');
    
    // Mettre à jour l'administrateur
    const result = await User.updateOne(
      { email: 'admin@smartcare.bf' },
      { password: newPassword }
    );
    
    console.log('Mise à jour:', result.modifiedCount > 0 ? 'SUCCÈS' : 'ÉCHEC');
    
    // Tester la connexion
    const admin = await User.findOne({ email: 'admin@smartcare.bf' });
    const passwordMatch = await bcrypt.compare('admin123', admin.password);
    console.log('Test du nouveau mot de passe:', passwordMatch ? 'SUCCÈS' : 'ÉCHEC');
    
    if (passwordMatch) {
      console.log('\n🎉 MOT DE PASSE CORRIGÉ !');
      console.log('L\'administrateur peut maintenant se connecter avec:');
      console.log('Email: admin@smartcare.bf');
      console.log('Mot de passe: admin123');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error.message);
  } finally {
    try {
      await mongoose.connection.close();
      console.log('\n🔌 Connexion MongoDB fermée');
    } catch (closeError) {
      console.log('⚠️ Erreur lors de la fermeture:', closeError.message);
    }
  }
};

fixPassword();
