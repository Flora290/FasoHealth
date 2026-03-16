// Script de seed simple et fonctionnel
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const simpleSeed = async () => {
  try {
    console.log('🚀 Initialisation simple des données FasoHealth...\n');
    
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fasohealth');
    console.log('✅ Connexion MongoDB réussie');
    
    // Importer les modèles
    const User = require('../models/User');
    const Specialty = require('../models/Specialty');
    
    // Nettoyer la base de données
    console.log('🗑️ Nettoyage de la base de données...');
    const forceReset = process.argv.includes('--force') || process.argv.includes('-f');
    const userCount = await User.countDocuments();

    if (userCount > 0 && !forceReset) {
      console.log('⚠️ La base contient déjà des données. Utilisation de --force pour réinitialiser.');
      await mongoose.connection.close();
      process.exit(0);
    }

    await User.deleteMany({});
    await Specialty.deleteMany({});
    console.log('✅ Base de données nettoyée');
    
    // Créer les spécialités
    console.log('📚 Création des spécialités...');
    const specialties = [
      { name: 'Cardiologie', description: 'Spécialité médicale traitant les maladies du cœur', icon: '❤️', color: '#ef4444', isActive: true },
      { name: 'Pédiatrie', description: 'Spécialité médicale pour les enfants', icon: '👶', color: '#10b981', isActive: true },
      { name: 'Gynécologie-Obstétrique', description: 'Spécialité médicale pour la santé des femmes', icon: '🤰', color: '#ec4899', isActive: true },
      { name: 'Neurologie', description: 'Spécialité médicale traitant les maladies du système nerveux', icon: '🧠', color: '#8b5cf6', isActive: true },
      { name: 'Orthopédie-Traumatologie', description: 'Spécialité médicale traitant les maladies des os', icon: '🦴', color: '#f59e0b', isActive: true },
      { name: 'Dermatologie', description: 'Spécialité médicale traitant les maladies de la peau', icon: '🏥', color: '#06b6d4', isActive: true },
      { name: 'Ophtalmologie', description: 'Spécialité médicale traitant les maladies des yeux', icon: '👁️', color: '#84cc16', isActive: true },
      { name: 'Psychiatrie', description: 'Spécialité médicale traitant les maladies mentales', icon: '🧠', color: '#6366f1', isActive: true },
      { name: 'Médecine Générale', description: 'Spécialité médicale pour les problèmes courants', icon: '👨‍⚕️', color: '#059669', isActive: true },
      { name: 'Chirurgie Générale', description: 'Spécialité médicale pour les interventions chirurgicales', icon: '🔪', color: '#dc2626', isActive: true }
    ];
    
    const createdSpecialties = await Specialty.insertMany(specialties);
    console.log(`✅ ${createdSpecialties.length} spécialités créées`);
    
    // Créer l'administrateur
    console.log('👤 Création de l\'administrateur...');
    const admin = new User({
      name: 'Administrateur FasoHealth',
      email: 'admin@fasohealth.bf',
      password: 'admin123', // Le modèle va hasher automatiquement
      role: 'admin',
      phoneNumber: '+226 70 00 00 00',
      isActive: true
    });
    await admin.save();
    console.log('✅ Administrateur créé: admin@fasohealth.bf');
    
    // Créer les médecins
    console.log('👨‍⚕️ Création des médecins...');
    const doctors = [
      {
        name: 'Dr. Adama Traoré',
        email: 'dr.traore@fasohealth.bf',
        password: 'doctor123', // Le modèle va hasher automatiquement
        role: 'doctor',
        phoneNumber: '+226 70 20 30 40',
        specialty: createdSpecialties[0]._id, // Cardiologie
        isActive: true
      },
      {
        name: 'Dr. Aminata Ouattara',
        email: 'dr.ouattara@fasohealth.bf',
        password: 'doctor123', // Le modèle va hasher automatiquement
        role: 'doctor',
        phoneNumber: '+226 70 25 35 45',
        specialty: createdSpecialties[1]._id, // Pédiatrie
        isActive: true
      },
      {
        name: 'Dr. Bintou Konaté',
        email: 'dr.konate@fasohealth.bf',
        password: 'doctor123', // Le modèle va hasher automatiquement
        role: 'doctor',
        phoneNumber: '+226 70 30 40 50',
        specialty: createdSpecialties[2]._id, // Gynécologie-Obstétrique
        isActive: true
      },
      {
        name: 'Dr. Karim Diallo',
        email: 'dr.diallo@fasohealth.bf',
        password: 'doctor123', // Le modèle va hasher automatiquement
        role: 'doctor',
        phoneNumber: '+226 70 35 45 55',
        specialty: createdSpecialties[3]._id, // Neurologie
        isActive: true
      },
      {
        name: 'Dr. Mariam Sankara',
        email: 'dr.sankara@fasohealth.bf',
        password: 'doctor123', // Le modèle va hasher automatiquement
        role: 'doctor',
        phoneNumber: '+226 70 40 50 60',
        specialty: createdSpecialties[4]._id, // Orthopédie-Traumatologie
        isActive: true
      }
    ];
    
    const createdDoctors = [];
    for (const doctorData of doctors) {
      const doctor = await User.create(doctorData);
      createdDoctors.push(doctor);
    }
    console.log(`✅ ${createdDoctors.length} médecins créées`);
    
    // Créer les patients
    console.log('👥 Création des patients...');
    const patients = [
      {
        name: 'Jean Kaboré',
        email: 'jean.kabore@fasohealth.bf',
        password: 'patient123', // Le modèle va hasher automatiquement
        role: 'patient',
        phoneNumber: '+226 70 10 20 30',
        isActive: true
      },
      {
        name: 'Marie Konaté',
        email: 'marie.konate@fasohealth.bf',
        password: 'patient123', // Le modèle va hasher automatiquement
        role: 'patient',
        phoneNumber: '+226 70 15 25 35',
        isActive: true
      },
      {
        name: 'Mohamed Ouattara',
        email: 'mohamed.ouattara@fasohealth.bf',
        password: 'patient123', // Le modèle va hasher automatiquement
        role: 'patient',
        phoneNumber: '+226 70 20 30 40',
        isActive: true
      },
      {
        name: 'Fatimata Bamba',
        email: 'fatimata.bamba@fasohealth.bf',
        password: 'patient123', // Le modèle va hasher automatiquement
        role: 'patient',
        phoneNumber: '+226 70 25 35 45',
        isActive: true
      },
      {
        name: 'Issa Diallo',
        email: 'issa.diallo@fasohealth.bf',
        password: 'patient123', // Le modèle va hasher automatiquement
        role: 'patient',
        phoneNumber: '+226 70 30 40 50',
        isActive: true
      }
    ];
    
    const createdPatients = [];
    for (const patientData of patients) {
      const patient = await User.create(patientData);
      createdPatients.push(patient);
    }
    console.log(`✅ ${createdPatients.length} patients créées`);
    
    console.log('\n🎉 Données de test créées avec succès !\n');
    console.log('\n📋 IDENTIFIANTS DE CONNEXION:');
    console.log('=====================================');
    console.log('👤 ADMINISTRATEUR:');
    console.log('   Email: admin@fasohealth.bf');
    console.log('   Mot de passe: admin123');
    console.log('\n👨‍⚕️ MÉDECINS:');
    console.log('   Email: dr.traore@fasohealth.bf');
    console.log('   Mot de passe: doctor123');
    console.log('   Email: dr.ouattara@fasohealth.bf');
    console.log('   Mot de passe: doctor123');
    console.log('   Email: dr.konate@fasohealth.bf');
    console.log('   Mot de passe: doctor123');
    console.log('   (Tous les médecins utilisent: doctor123)');
    console.log('\n👥 PATIENTS:');
    console.log('   Email: jean.kabore@fasohealth.bf');
    console.log('   Mot de passe: patient123');
    console.log('   Email: marie.konate@fasohealth.bf');
    console.log('   Mot de passe: patient123');
    console.log('   Email: mohamed.ouattara@fasohealth.bf');
    console.log('   Mot de passe: patient123');
    console.log('   (Tous les patients utilisent: patient123)');
    console.log('\n📊 STATISTIQUES:');
    console.log(`   • ${createdSpecialties.length} spécialités médicales`);
    console.log(`   • ${createdDoctors.length} médecins qualifiés`);
    console.log(`   • ${createdPatients.length} patients actifs`);
    console.log('\n🎯 UTILISATION:');
    console.log('   1. Connectez-vous avec admin@fasohealth.bf / admin123');
    console.log('   2. Gérez les médecins et patients');
    console.log('   3. Testez toutes les fonctionnalités');
    console.log('   4. Explorez les dashboards');
    console.log('\n✨ FasoHealth est prêt pour les tests !');
    
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

simpleSeed();
