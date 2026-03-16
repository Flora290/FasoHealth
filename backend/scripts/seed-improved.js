const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Configuration de la connexion compatible
const connectDB = async () => {
  try {
    // Connexion simple sans options problématiques
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fasohealth');
    console.log('✅ Connexion à MongoDB réussie');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion à MongoDB:', error.message);
    return false;
  }
};

const seedData = async () => {
  try {
    console.log('🚀 Création des données de test SmartCare...');
    
    // Connexion à la base de données
    const connected = await connectDB();
    if (!connected) {
      console.log('⚠️ Impossible de se connecter à la base de données. Vérifiez que MongoDB est bien démarré.');
      return;
    }

    // Importer les modèles après la connexion
    const User = require('../models/User');
    const Specialty = require('../models/Specialty');
    const Availability = require('../models/Availability');
    const Appointment = require('../models/Appointment');
    const Review = require('../models/Review');
    const Notification = require('../models/Notification');

    // Nettoyer la base de données avec timeout
    console.log('🗑️ Nettoyage de la base de données...');
    await Promise.race([
      User.deleteMany({}),
      Specialty.deleteMany({}),
      Availability.deleteMany({}),
      Appointment.deleteMany({}),
      Review.deleteMany({}),
      Notification.deleteMany({})
    ]);
    console.log('✅ Base de données nettoyée');

    // 1. Créer les spécialités
    console.log('📚 Création des spécialités médicales...');
    const specialties = [
      {
        name: 'Cardiologie',
        description: 'Spécialité médicale traitant les maladies du cœur et des vaisseaux sanguins',
        icon: '❤️',
        color: '#ef4444',
        isActive: true,
        averageConsultationDuration: 30,
        typicalPriceRange: '15,000 - 50,000 FCFA'
      },
      {
        name: 'Pédiatrie',
        description: 'Spécialité médicale dédiée aux enfants et adolescents',
        icon: '👶',
        color: '#10b981',
        isActive: true,
        averageConsultationDuration: 25,
        typicalPriceRange: '10,000 - 30,000 FCFA'
      },
      {
        name: 'Gynécologie-Obstétrique',
        description: 'Spécialité médicale pour la santé des femmes et suivi de grossesse',
        icon: '🤰',
        color: '#ec4899',
        isActive: true,
        averageConsultationDuration: 30,
        typicalPriceRange: '20,000 - 60,000 FCFA'
      },
      {
        name: 'Neurologie',
        description: 'Spécialité médicale traitant les maladies du système nerveux',
        icon: '🧠',
        color: '#8b5cf6',
        isActive: true,
        averageConsultationDuration: 35,
        typicalPriceRange: '25,000 - 70,000 FCFA'
      },
      {
        name: 'Orthopédie-Traumatologie',
        description: 'Spécialité médicale traitant les maladies des os et articulations',
        icon: '🦴',
        color: '#f59e0b',
        isActive: true,
        averageConsultationDuration: 30,
        typicalPriceRange: '20,000 - 80,000 FCFA'
      },
      {
        name: 'Dermatologie',
        description: 'Spécialité médicale traitant les maladies de la peau',
        icon: '🏥',
        color: '#06b6d4',
        isActive: true,
        averageConsultationDuration: 20,
        typicalPriceRange: '15,000 - 40,000 FCFA'
      },
      {
        name: 'Ophtalmologie',
        description: 'Spécialité médicale traitant les maladies des yeux',
        icon: '👁️',
        color: '#84cc16',
        isActive: true,
        averageConsultationDuration: 25,
        typicalPriceRange: '20,000 - 50,000 FCFA'
      },
      {
        name: 'Psychiatrie',
        description: 'Spécialité médicale traitant les maladies mentales',
        icon: '🧠',
        color: '#6366f1',
        isActive: true,
        averageConsultationDuration: 45,
        typicalPriceRange: '25,000 - 60,000 FCFA'
      },
      {
        name: 'Médecine Générale',
        description: 'Spécialité médicale traitant les problèmes de santé courants',
        icon: '👨‍⚕️',
        color: '#059669',
        isActive: true,
        averageConsultationDuration: 20,
        typicalPriceRange: '10,000 - 25,000 FCFA'
      },
      {
        name: 'Chirurgie Générale',
        description: 'Spécialité médicale traitant les interventions chirurgicales',
        icon: '🔪',
        color: '#dc2626',
        isActive: true,
        averageConsultationDuration: 40,
        typicalPriceRange: '50,000 - 200,000 FCFA'
      }
    ];

    const createdSpecialties = await Specialty.insertMany(specialties);
    console.log(`✅ ${createdSpecialties.length} spécialités créées`);

    // 2. Créer l'administrateur
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

    // 3. Créer les médecins (version simplifiée pour éviter les timeouts)
    console.log('👨‍⚕️ Création des médecins...');
    const doctors = [
      {
        name: 'Dr. Adama Traoré',
        email: 'dr.traore@smartcare.bf',
        password: await bcrypt.hash('doctor123', 10),
        role: 'doctor',
        phoneNumber: '+226 70 20 30 40',
        specialty: createdSpecialties[0]._id, // Cardiologie
        isActive: true,
        profile: {
          bio: 'Cardiologue avec 15 ans d\'expérience',
          education: 'Université de Ouagadougou',
          experience: '15 ans',
          consultationPrice: 30000,
          rating: 4.8,
          hospitalAffiliation: 'Hôpital National Yalgado Ouédraogo'
        }
      },
      {
        name: 'Dr. Aminata Ouattara',
        email: 'dr.ouattara@smartcare.bf',
        password: await bcrypt.hash('doctor123', 10),
        role: 'doctor',
        phoneNumber: '+226 70 25 35 45',
        specialty: createdSpecialties[1]._id, // Pédiatrie
        isActive: true,
        profile: {
          bio: 'Pédiatre expérimentée',
          education: 'Université Cheikh Anta Diop',
          experience: '12 ans',
          consultationPrice: 25000,
          rating: 4.9,
          hospitalAffiliation: 'Centre Hospitalier Universitaire Yalgado'
        }
      },
      {
        name: 'Dr. Bintou Konaté',
        email: 'dr.konate@smartcare.bf',
        password: await bcrypt.hash('doctor123', 10),
        role: 'doctor',
        phoneNumber: '+226 70 30 40 50',
        specialty: createdSpecialties[2]._id, // Gynécologie-Obstétrique
        isActive: true,
        profile: {
          bio: 'Gynécologue-obstétricienne spécialisée',
          education: 'Université de Montréal',
          experience: '18 ans',
          consultationPrice: 35000,
          rating: 4.7,
          hospitalAffiliation: 'Clinique Bambino'
        }
      },
      {
        name: 'Dr. Karim Diallo',
        email: 'dr.diallo@smartcare.bf',
        password: await bcrypt.hash('doctor123', 10),
        role: 'doctor',
        phoneNumber: '+226 70 35 45 55',
        specialty: createdSpecialties[3]._id, // Neurologie
        isActive: true,
        profile: {
          bio: 'Neurologue spécialisé',
          education: 'Université Paris Descartes',
          experience: '10 ans',
          consultationPrice: 40000,
          rating: 4.6,
          hospitalAffiliation: 'Hôpital du District de Bogodogo'
        }
      },
      {
        name: 'Dr. Mariam Sankara',
        email: 'dr.sankara@smartcare.bf',
        password: await bcrypt.hash('doctor123', 10),
        role: 'doctor',
        phoneNumber: '+226 70 40 50 60',
        specialty: createdSpecialties[4]._id, // Orthopédie-Traumatologie
        isActive: true,
        profile: {
          bio: 'Orthopédiste spécialisée',
          education: 'Université de Lyon',
          experience: '14 ans',
          consultationPrice: 45000,
          rating: 4.8,
          hospitalAffiliation: 'Hôpital National Yalgado Ouédraogo'
        }
      },
      {
        name: 'Dr. Jean-Baptiste Zongo',
        email: 'dr.zongo@smartcare.bf',
        password: await bcrypt.hash('doctor123', 10),
        role: 'doctor',
        phoneNumber: '+226 70 45 55 65',
        specialty: createdSpecialties[5]._id, // Dermatologie
        isActive: true,
        profile: {
          bio: 'Dermatologue spécialisé',
          education: 'Université de Bordeaux',
          experience: '8 ans',
          consultationPrice: 28000,
          rating: 4.5,
          hospitalAffiliation: 'Polyclinique la Médicale'
        }
      },
      {
        name: 'Dr. Fatima Bamba',
        email: 'dr.bamba@smartcare.bf',
        password: await bcrypt.hash('doctor123', 10),
        role: 'doctor',
        phoneNumber: '+226 70 50 60 70',
        specialty: createdSpecialties[6]._id, // Ophtalmologie
        isActive: true,
        profile: {
          bio: 'Ophtalmologue spécialisée',
          education: 'Université de Strasbourg',
          experience: '11 ans',
          consultationPrice: 32000,
          rating: 4.7,
          hospitalAffiliation: 'Centre Hospitalier Universitaire Yalgado'
        }
      },
      {
        name: 'Dr. Moussa Compaoré',
        email: 'dr.compaore@smartcare.bf',
        password: await bcrypt.hash('doctor123', 10),
        role: 'doctor',
        phoneNumber: '+226 70 55 65 75',
        specialty: createdSpecialties[7]._id, // Psychiatrie
        isActive: true,
        profile: {
          bio: 'Psychiatre spécialisé',
          education: 'Université de Dakar',
          experience: '9 ans',
          consultationPrice: 38000,
          rating: 4.4,
          hospitalAffiliation: 'Centre de Santé Mentale de Ouagadougou'
        }
      },
      {
        name: 'Dr. Henriette Yaméogo',
        email: 'dr.yameogo@smartcare.bf',
        password: await bcrypt.hash('doctor123', 10),
        role: 'doctor',
        phoneNumber: '+226 70 60 70 80',
        specialty: createdSpecialties[8]._id, // Médecine Générale
        isActive: true,
        profile: {
          bio: 'Médecin généraliste expérimenté',
          education: 'Université de Ouagadougou',
          experience: '20 ans',
          consultationPrice: 20000,
          rating: 4.6,
          hospitalAffiliation: 'Centre de Santé Primaire de Koudougou'
        }
      },
      {
        name: 'Dr. Abdoul Karim Sawadogo',
        email: 'dr.sawadogo@smartcare.bf',
        password: await bcrypt.hash('doctor123', 10),
        role: 'doctor',
        phoneNumber: '+226 70 65 75 85',
        specialty: createdSpecialties[9]._id, // Chirurgie Générale
        isActive: true,
        profile: {
          bio: 'Chirurgien général spécialisé',
          education: 'Université Cheikh Anta Diop',
          experience: '16 ans',
          consultationPrice: 60000,
          rating: 4.9,
          hospitalAffiliation: 'Clinique Saint Camille'
        }
      }
    ];

    const createdDoctors = await User.insertMany(doctors);
    console.log(`✅ ${createdDoctors.length} médecins créés`);

    // 4. Créer les patients (version simplifiée)
    console.log('👥 Création des patients...');
    const patients = [
      {
        name: 'Jean Kaboré',
        email: 'jean.kabore@smartcare.bf',
        password: await bcrypt.hash('patient123', 10),
        role: 'patient',
        phoneNumber: '+226 70 10 20 30',
        isActive: true,
        profile: {
          dateOfBirth: new Date('1985-05-15'),
          gender: 'Homme',
          address: 'Ouagadougou, Zone du Bois',
          bloodType: 'O+',
          allergies: ['Pénicilline'],
          emergencyContact: {
            name: 'Marie Kaboré',
            relationship: 'Épouse',
            phone: '+226 70 15 25 35'
          }
        }
      },
      {
        name: 'Marie Konaté',
        email: 'marie.konate@smartcare.bf',
        password: await bcrypt.hash('patient123', 10),
        role: 'patient',
        phoneNumber: '+226 70 15 25 35',
        isActive: true,
        profile: {
          dateOfBirth: new Date('1990-08-22'),
          gender: 'Femme',
          address: 'Ouagadougou, Koulouba',
          bloodType: 'A+',
          allergies: ['Pollen'],
          emergencyContact: {
            name: 'Jean Konaté',
            relationship: 'Mari',
            phone: '+226 70 10 20 30'
          }
        }
      },
      {
        name: 'Mohamed Ouattara',
        email: 'mohamed.ouattara@smartcare.bf',
        password: await bcrypt.hash('patient123', 10),
        role: 'patient',
        phoneNumber: '+226 70 20 30 40',
        isActive: true,
        profile: {
          dateOfBirth: new Date('1978-03-10'),
          gender: 'Homme',
          address: 'Bobo-Dioulasso',
          bloodType: 'B+',
          allergies: ['Aucune'],
          emergencyContact: {
            name: 'Aminata Ouattara',
            relationship: 'Épouse',
            phone: '+226 70 25 35 45'
          }
        }
      },
      {
        name: 'Fatimata Bamba',
        email: 'fatimata.bamba@smartcare.bf',
        password: await bcrypt.hash('patient123', 10),
        role: 'patient',
        phoneNumber: '+226 70 25 35 45',
        isActive: true,
        profile: {
          dateOfBirth: new Date('1995-12-03'),
          gender: 'Femme',
          address: 'Koudougou',
          bloodType: 'O-',
          allergies: ['Lactose'],
          emergencyContact: {
            name: 'Ali Bamba',
            relationship: 'Mari',
            phone: '+226 70 30 40 50'
          }
        }
      },
      {
        name: 'Issa Diallo',
        email: 'issa.diallo@smartcare.bf',
        password: await bcrypt.hash('patient123', 10),
        role: 'patient',
        phoneNumber: '+226 70 30 40 50',
        isActive: true,
        profile: {
          dateOfBirth: new Date('1982-07-18'),
          gender: 'Homme',
          address: 'Ouahigouya',
          bloodType: 'AB+',
          allergies: ['Aucune'],
          emergencyContact: {
            name: 'Awa Diallo',
            relationship: 'Épouse',
            phone: '+226 70 35 45 55'
          }
        }
      },
      {
        name: 'Awa Traoré',
        email: 'awa.traore@smartcare.bf',
        password: await bcrypt.hash('patient123', 10),
        role: 'patient',
        phoneNumber: '+226 70 35 45 55',
        isActive: true,
        profile: {
          dateOfBirth: new Date('1988-11-25'),
          gender: 'Femme',
          address: 'Banfora',
          bloodType: 'A-',
          allergies: ['Anti-inflammatoires'],
          emergencyContact: {
            name: 'Brahima Traoré',
            relationship: 'Mari',
            phone: '+226 70 40 50 60'
          }
        }
      },
      {
        name: 'Karim Zongo',
        email: 'karim.zongo@smartcare.bf',
        password: await bcrypt.hash('patient123', 10),
        role: 'patient',
        phoneNumber: '+226 70 40 50 60',
        isActive: true,
        profile: {
          dateOfBirth: new Date('1992-04-08'),
          gender: 'Homme',
          address: 'Kaya',
          bloodType: 'B-',
          allergies: ['Aucune'],
          emergencyContact: {
            name: 'Mariam Zongo',
            relationship: 'Mère',
            phone: '+226 70 45 55 65'
          }
        }
      },
      {
        name: 'Mariam Sawadogo',
        email: 'mariam.sawadogo@smartcare.bf',
        password: await bcrypt.hash('patient123', 10),
        role: 'patient',
        phoneNumber: '+226 70 45 55 65',
        isActive: true,
        profile: {
          dateOfBirth: new Date('1980-09-30'),
          gender: 'Femme',
          address: 'Dori',
          bloodType: 'O+',
          allergies: ['Pollen'],
          emergencyContact: {
            name: 'Yacouba Sawadogo',
            relationship: 'Mari',
            phone: '+226 70 50 60 70'
          }
        }
      },
      {
        name: 'Brahima Compaoré',
        email: 'brahima.compaore@smartcare.bf',
        password: await bcrypt.hash('patient123', 10),
        role: 'patient',
        phoneNumber: '+226 70 50 60 70',
        isActive: true,
        profile: {
          dateOfBirth: new Date('1976-06-12'),
          gender: 'Homme',
          address: 'Fada N\'Gourma',
          bloodType: 'A+',
          allergies: ['Aucune'],
          emergencyContact: {
            name: 'Adama Compaoré',
            relationship: 'Épouse',
            phone: '+226 70 55 65 75'
          }
        }
      },
      {
        name: 'Aminata Yaméogo',
        email: 'aminata.yameogo@smartcare.bf',
        password: await bcrypt.hash('patient123', 10),
        role: 'patient',
        phoneNumber: '+226 70 55 65 75',
        isActive: true,
        profile: {
          dateOfBirth: new Date('1993-02-14'),
          gender: 'Femme',
          address: 'Ouagadougou, Pissy',
          bloodType: 'AB-',
          allergies: ['Arachides'],
          emergencyContact: {
            name: 'Henri Yaméogo',
            relationship: 'Père',
            phone: '+226 70 60 70 80'
          }
        }
      }
    ];

    const createdPatients = await User.insertMany(patients);
    console.log(`✅ ${createdPatients.length} patients créés`);

    // 5. Créer quelques rendez-vous de test
    console.log('📋 Création des rendez-vous de test...');
    const appointments = [];
    const statuses = ['pending', 'confirmed', 'completed'];
    const today = new Date();
    
    for (let i = 0; i < 20; i++) {
      const randomDoctor = createdDoctors[Math.floor(Math.random() * createdDoctors.length)];
      const randomPatient = createdPatients[Math.floor(Math.random() * createdPatients.length)];
      const randomDate = new Date();
      randomDate.setDate(today.getDate() + Math.floor(Math.random() * 30));
      
      appointments.push({
        doctor: randomDoctor._id,
        patient: randomPatient._id,
        date: randomDate.toISOString().split('T')[0],
        startTime: `${8 + Math.floor(Math.random() * 10)}:00`,
        endTime: `${9 + Math.floor(Math.random() * 10)}:00`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        reason: 'Consultation de routine',
        urgency: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        consultationType: 'in-person'
      });
    }

    await Appointment.insertMany(appointments);
    console.log(`✅ ${appointments.length} rendez-vous créés`);

    console.log('\n🎉 Données de test créées avec succès !\n');
    console.log('\n📋 IDENTIFIANTS DE CONNEXION:');
    console.log('=====================================');
    console.log('👤 ADMINISTRATEUR:');
    console.log('   Email: admin@smartcare.bf');
    console.log('   Mot de passe: admin123');
    console.log('\n👨‍⚕️ MÉDECINS:');
    console.log('   Email: dr.traore@smartcare.bf');
    console.log('   Mot de passe: doctor123');
    console.log('   (Tous les médecins utilisent: doctor123)');
    console.log('\n👥 PATIENTS:');
    console.log('   Email: jean.kabore@smartcare.bf');
    console.log('   Mot de passe: patient123');
    console.log('   (Tous les patients utilisent: patient123)');
    console.log('\n📊 STATISTIQUES:');
    console.log(`   • ${createdSpecialties.length} spécialités médicales`);
    console.log(`   • ${createdDoctors.length} médecins qualifiés`);
    console.log(`   • ${createdPatients.length} patients actifs`);
    console.log(`   • ${appointments.length} rendez-vous`);
    console.log('\n🎯 UTILISATION:');
    console.log('   1. Connectez-vous avec admin@smartcare.bf / admin123');
    console.log('   2. Gérez les médecins et patients');
    console.log('   3. Testez toutes les fonctionnalités');
    console.log('   4. Explorez les dashboards');
    console.log('\n✨ SmartCare est prêt pour les tests !');

  } catch (error) {
    console.error('❌ Erreur lors de la création des données:', error.message);
    console.error(error);
  } finally {
    try {
      await mongoose.connection.close();
      console.log('🔌 Connexion MongoDB fermée');
    } catch (closeError) {
      console.log('⚠️ Erreur lors de la fermeture de la connexion:', closeError.message);
    }
  }
};

seedData();
