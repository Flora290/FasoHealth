// Script de seed rapide compatible sans dépendances
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const quickSeed = async () => {
  try {
    console.log('🚀 Initialisation rapide des données SmartCare...\n');
    
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fasohealth');
    console.log('✅ Connexion MongoDB réussie');
    
    // Importer les modèles
    const User = require('../models/User');
    const Specialty = require('../models/Specialty');
    
    // Nettoyer avec timeout
    console.log('🗑️ Nettoyage de la base de données...');
    await User.deleteMany({});
    await Specialty.deleteMany({});
    console.log('✅ Base de données nettoyée');
    
    // Créer les données de test
    console.log('👤 Création de l\'administrateur...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      name: 'Administrateur SmartCare',
      email: 'admin@smartcare.bf',
      password: adminPassword,
      role: 'admin',
      phoneNumber: '+226 70 00 00 00',
      isActive: true
    });
    await admin.save();
    console.log('✅ Administrateur créé: admin@smartcare.bf');
    
    // Créer quelques spécialités de base d'abord
    const specialties = [
      { name: 'Cardiologie', description: 'Spécialité médicale traitant les maladies du cœur', icon: '❤️', color: '#ef4444', isActive: true },
      { name: 'Pédiatrie', description: 'Spécialité médicale pour les enfants', icon: '👶', color: '#10b981', isActive: true },
      { name: 'Gynécologie-Obstétrique', description: 'Spécialité médicale pour la santé des femmes', icon: '🤰', color: '#ec4899', isActive: true }
    ];
    
    const createdSpecialties = await Specialty.insertMany(specialties);
    console.log('✅ Spécialités de base créées');
    
    // Créer un médecin test avec la référence ObjectId
    console.log('�‍⚕️ Création d\'un médecin test...');
    const doctorPassword = await bcrypt.hash('doctor123', 10);
    const doctor = new User({
      name: 'Dr. Test Médecin',
      email: 'doctor@smartcare.bf',
      password: doctorPassword,
      role: 'doctor',
      phoneNumber: '+226 70 11 22 33',
      specialty: createdSpecialties[0]._id, // Utiliser l'ObjectId de Cardiologie
      isActive: true
    });
    await doctor.save();
    console.log('✅ Médecin test créé: doctor@smartcare.bf');
    
    // Créer un patient test
    console.log('👥 Création d\'un patient test...');
    const patientPassword = await bcrypt.hash('patient123', 10);
    const patient = new User({
      name: 'Patient Test',
      email: 'patient@smartcare.bf',
      password: patientPassword,
      role: 'patient',
      phoneNumber: '+226 70 33 44 55',
      isActive: true
    });
    await patient.save();
    console.log('✅ Patient test créé: patient@smartcare.bf');
    
    console.log('\n🎉 Données de test créées avec succès !\n');
    console.log('\n📋 IDENTIFIANTS DE CONNEXION:');
    console.log('=====================================');
    console.log('👤 ADMINISTRATEUR:');
    console.log('   Email: admin@smartcare.bf');
    console.log('   Mot de passe: admin123');
    console.log('\n👨‍⚕️ MÉDECIN TEST:');
    console.log('   Email: doctor@smartcare.bf');
    console.log('   Mot de passe: doctor123');
    console.log('\n👥 PATIENT TEST:');
    console.log('   Email: patient@smartcare.bf');
    console.log('   Mot de passe: patient123');
    console.log('\n📊 STATISTIQUES:');
    console.log('   • 1 administrateur');
    console.log('   • 1 médecin');
    console.log('   • 1 patient');
    console.log('   • 3 spécialités');
    console.log('\n🎯 UTILISATION:');
    console.log('   1. Connectez-vous avec admin@smartcare.bf / admin123');
    console.log('    - Gérez les médecins et patients');
    console.log('   2. Testez toutes les fonctionnalités');
    console.log('   3. Explorez les dashboards');
    console.log('\n✨ SmartCare est prêt pour les tests !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des données de test:', error.message);
  } finally {
    try {
      await mongoose.connection.close();
      console.log('🔌 Connexion MongoDB fermée');
    } catch (closeError) {
      console.log('⚠️ Erreur lors de la fermeture de la connexion MongoDB:', closeError.message);
    }
  }
};

quickSeed();
