const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Specialty = require('../models/Specialty');
const Availability = require('../models/Availability');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');
const Notification = require('../models/Notification');

const seedData = async () => {
  try {
    // Check if we should force reset
    const forceReset = process.argv.includes('--force') || process.argv.includes('-f');
    const userCount = await User.countDocuments();

    if (userCount > 0 && !forceReset) {
      console.log('⚠️ Database already contains data. Skipping destructive seed.');
      console.log('💡 Use --force to wipe and re-seed from scratch.');
      process.exit(0);
    }

    // Nettoyer la base de données
    await User.deleteMany({});
    await Specialty.deleteMany({});
    await Availability.deleteMany({});
    await Appointment.deleteMany({});
    await Review.deleteMany({});
    await Notification.deleteMany({});

    console.log('🗑️ Base de données nettoyée (Force Reset)');

    // 1. Créer les spécialités
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
    console.log('📚 Spécialités créées:', createdSpecialties.length);

    // 2. Créer l'administrateur
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
    console.log('👤 Administrateur créé: admin@smartcare.bf / admin123');

    // 3. Créer les médecins avec profils détaillés
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
          bio: 'Cardiologue avec 15 ans d\'expérience, spécialisé en cardiologie interventionnelle',
          education: 'Université de Ouagadougou - Faculté de Médecine',
          experience: '15 ans',
          languages: ['Français', 'Moore', 'Dioula'],
          consultationTypes: ['in-person', 'video'],
          hospitalAffiliation: 'Hôpital National Yalgado Ouédraogo',
          officeAddress: '03 BP 698, Ouagadougou 03, Burkina Faso',
          consultationPrice: 30000,
          rating: 4.8,
          totalAppointments: 1247,
          certifications: ['Cardiologie Interventionnelle', 'Échocardiographie', 'IRM Cardiaque'],
          awards: ['Meilleur Cardiologue 2022', 'Prix d\'Excellence Médicale 2021']
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
          bio: 'Pédiatre expérimentée, spécialisée dans les maladies infantiles et la néonatalogie',
          education: 'Université Cheikh Anta Diop - Faculté de Médecine',
          experience: '12 ans',
          languages: ['Français', 'Moore', 'Dioula'],
          consultationTypes: ['in-person', 'video'],
          hospitalAffiliation: 'Centre Hospitalier Universitaire Yalgado',
          officeAddress: 'Avenue Kwamé N\'Krumah, Ouagadougou, Burkina Faso',
          consultationPrice: 25000,
          rating: 4.9,
          totalAppointments: 892,
          certifications: ['Pédiatrie', 'Néonatalogie', 'Réanimation Néonatale'],
          awards: ['Meilleur Pédiatre 2023', 'Prix Humanitaire 2022']
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
          bio: 'Gynécologue-obstétricienne spécialisée en suivi de grossesse et chirurgie gynécologique',
          education: 'Université de Montréal - Faculté de Médecine',
          experience: '18 ans',
          languages: ['Français', 'Moore', 'Dioula', 'Anglais'],
          consultationTypes: ['in-person', 'video'],
          hospitalAffiliation: 'Clinique Bambino',
          officeAddress: 'Zone du Bois, Ouagadougou, Burkina Faso',
          consultationPrice: 35000,
          rating: 4.7,
          totalAppointments: 1567,
          certifications: ['Gynécologie', 'Obstétrique', 'Échographie Obstétricale'],
          awards: ['Excellence en Gynécologie 2023', 'Prix de la Meilleure Pratique 2022']
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
          bio: 'Neurologue spécialisé dans les maladies neurodégénératives et l\'épilepsie',
          education: 'Université Paris Descartes - Faculté de Médecine',
          experience: '10 ans',
          languages: ['Français', 'Moore', 'Dioula', 'Anglais'],
          consultationTypes: ['in-person', 'video'],
          hospitalAffiliation: 'Hôpital du District de Bogodogo',
          officeAddress: 'Bogodogo, Ouagadougou, Burkina Faso',
          consultationPrice: 40000,
          rating: 4.6,
          totalAppointments: 678,
          certifications: ['Neurologie', 'Électrophysiologie', 'Neuro-imagerie'],
          awards: ['Prix de Recherche Neurologique 2023']
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
          bio: 'Orthopédiste spécialisée dans les traumatismes sportifs et la chirurgie du genou',
          education: 'Université de Lyon - Faculté de Médecine',
          experience: '14 ans',
          languages: ['Français', 'Moore', 'Dioula'],
          consultationTypes: ['in-person'],
          hospitalAffiliation: 'Hôpital National Yalgado Ouédraogo',
          officeAddress: '03 BP 698, Ouagadougou 03, Burkina Faso',
          consultationPrice: 45000,
          rating: 4.8,
          totalAppointments: 1023,
          certifications: ['Orthopédie', 'Traumatologie Sportive', 'Arthroscopie'],
          awards: ['Meilleur Orthopédiste 2022', 'Prix d\'Innovation Chirurgicale 2023']
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
          bio: 'Dermatologue spécialisé en dermatologie esthétique et traitement du cancer de la peau',
          education: 'Université de Bordeaux - Faculté de Médecine',
          experience: '8 ans',
          languages: ['Français', 'Moore', 'Dioula', 'Anglais'],
          consultationTypes: ['in-person', 'video'],
          hospitalAffiliation: 'Polyclinique la Médicale',
          officeAddress: 'Avenue Kwamé N\'Krumah, Ouagadougou, Burkina Faso',
          consultationPrice: 28000,
          rating: 4.5,
          totalAppointments: 543,
          certifications: ['Dermatologie', 'Dermatochirurgie', 'Cosmétique Médicale'],
          awards: ['Meilleur Dermatologue 2023']
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
          bio: 'Ophtalmologue spécialisée en chirurgie réfractive et traitement du glaucome',
          education: 'Université de Strasbourg - Faculté de Médecine',
          experience: '11 ans',
          languages: ['Français', 'Moore', 'Dioula', 'Anglais'],
          consultationTypes: ['in-person'],
          hospitalAffiliation: 'Centre Hospitalier Universitaire Yalgado',
          officeAddress: 'Avenue Kwamé N\'Krumah, Ouagadougou, Burkina Faso',
          consultationPrice: 32000,
          rating: 4.7,
          totalAppointments: 789,
          certifications: ['Ophtalmologie', 'Chirurgie Réfractive', 'Glaucome'],
          awards: ['Prix d\'Excellence Ophtalmologique 2023']
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
          bio: 'Psychiatre spécialisé en thérapie cognitivo-comportement et troubles anxieux',
          education: 'Université de Dakar - Faculté de Médecine',
          experience: '9 ans',
          languages: ['Français', 'Moore', 'Dioula'],
          consultationTypes: ['in-person', 'video'],
          hospitalAffiliation: 'Centre de Santé Mentale de Ouagadougou',
          officeAddress: 'Patte d\'Oie, Ouagadougou, Burkina Faso',
          consultationPrice: 38000,
          rating: 4.4,
          totalAppointments: 412,
          certifications: ['Psychiatrie', 'Thérapie Cognitive', 'Hypnose Thérapeutique'],
          awards: ['Prix de Santé Mentale 2022']
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
          bio: 'Médecin généraliste avec expertise en médecine préventive et santé familiale',
          education: 'Université de Ouagadougou - Faculté de Médecine',
          experience: '20 ans',
          languages: ['Français', 'Moore', 'Dioula'],
          consultationTypes: ['in-person', 'video'],
          hospitalAffiliation: 'Centre de Santé Primaire de Koudougou',
          officeAddress: 'Koudougou, Ouagadougou, Burkina Faso',
          consultationPrice: 20000,
          rating: 4.6,
          totalAppointments: 2341,
          certifications: ['Médecine Générale', 'Santé Publique', 'Médecine Préventive'],
          awards: ['Meilleur Médecin Généraliste 2023', 'Prix de Service Public 2022']
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
          bio: 'Chirurgien général spécialisé en chirurgie abdominale et laparoscopie',
          education: 'Université Cheikh Anta Diop - Faculté de Médecine',
          experience: '16 ans',
          languages: ['Français', 'Moore', 'Dioula', 'Anglais'],
          consultationTypes: ['in-person'],
          hospitalAffiliation: 'Clinique Saint Camille',
          officeAddress: 'Zone du Bois, Ouagadougou, Burkina Faso',
          consultationPrice: 60000,
          rating: 4.9,
          totalAppointments: 892,
          certifications: ['Chirurgie Générale', 'Chirurgie Laparoscopique', 'Chirurgie Bariatrique'],
          awards: ['Meilleur Chirurgien 2023', 'Prix d\'Innovation Chirurgicale 2022']
        }
      }
    ];

    const createdDoctors = await User.insertMany(doctors);
    console.log('👨‍⚕️ Médecins créés:', createdDoctors.length);

    // 4. Créer les patients avec profils détaillés
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
          allergies: ['Pénicilline', 'Arachides'],
          chronicDiseases: ['Hypertension'],
          emergencyContact: {
            name: 'Marie Kaboré',
            relationship: 'Épouse',
            phone: '+226 70 15 25 35'
          },
          insurance: 'CNAM',
          occupation: 'Enseignant'
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
          allergies: ['Pollen', 'Acariens'],
          chronicDiseases: ['Asthme'],
          emergencyContact: {
            name: 'Jean Konaté',
            relationship: 'Mari',
            phone: '+226 70 10 20 30'
          },
          insurance: 'Mutuelle Santé',
          occupation: 'Comptable'
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
          allergies: ['Aucune connue'],
          chronicDiseases: ['Diabète Type 2'],
          emergencyContact: {
            name: 'Aminata Ouattara',
            relationship: 'Épouse',
            phone: '+226 70 25 35 45'
          },
          insurance: 'CNAM',
          occupation: 'Agriculteur'
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
          allergies: ['Lactose', 'Gluten'],
          chronicDiseases: ['Migraine'],
          emergencyContact: {
            name: 'Ali Bamba',
            relationship: 'Mari',
            phone: '+226 70 30 40 50'
          },
          insurance: 'Mutuelle Santé',
          occupation: 'Étudiante'
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
          allergies: ['Aucune connue'],
          chronicDiseases: ['Hypertension', 'Diabète'],
          emergencyContact: {
            name: 'Awa Diallo',
            relationship: 'Épouse',
            phone: '+226 70 35 45 55'
          },
          insurance: 'CNAM',
          occupation: 'Commercial'
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
          allergies: ['Médicaments anti-inflammatoires'],
          chronicDiseases: ['Anémie'],
          emergencyContact: {
            name: 'Brahima Traoré',
            relationship: 'Mari',
            phone: '+226 70 40 50 60'
          },
          insurance: 'Mutuelle Santé',
          occupation: 'Infirmière'
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
          allergies: ['Aucune connue'],
          chronicDiseases: ['Aucune'],
          emergencyContact: {
            name: 'Mariam Zongo',
            relationship: 'Mère',
            phone: '+226 70 45 55 65'
          },
          insurance: 'Sans assurance',
          occupation: 'Étudiant'
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
          allergies: ['Pollen', 'Médicaments pénicilline'],
          chronicDiseases: ['Hypertension'],
          emergencyContact: {
            name: 'Yacouba Sawadogo',
            relationship: 'Mari',
            phone: '+226 70 50 60 70'
          },
          insurance: 'CNAM',
          occupation: 'Enseignante'
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
          allergies: ['Aucune connue'],
          chronicDiseases: ['Arthrite'],
          emergencyContact: {
            name: 'Adama Compaoré',
            relationship: 'Épouse',
            phone: '+226 70 55 65 75'
          },
          insurance: 'Mutuelle Santé',
          occupation: 'Agriculteur'
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
          allergies: ['Arachides', 'Fruits de mer'],
          chronicDiseases: ['Aucune'],
          emergencyContact: {
            name: 'Henri Yaméogo',
            relationship: 'Père',
            phone: '+226 70 60 70 80'
          },
          insurance: 'Sans assurance',
          occupation: 'Coiffeuse'
        }
      }
    ];

    const createdPatients = await User.insertMany(patients);
    console.log('👥 Patients créés:', createdPatients.length);

    // 5. Créer des disponibilités pour les médecins
    const availabilities = [];
    const today = new Date();
    
    for (let i = 0; i < createdDoctors.length; i++) {
      const doctor = createdDoctors[i];
      
      // Créer des disponibilités pour les 30 prochains jours
      for (let day = 0; day < 30; day++) {
        const date = new Date(today);
        date.setDate(today.getDate() + day);
        
        // Skip weekends for some doctors
        if (day % 7 === 0 || day % 7 === 6) continue;
        
        // Morning slots
        availabilities.push({
          doctor: doctor._id,
          date: date.toISOString().split('T')[0],
          startTime: '08:00',
          endTime: '12:00',
          slotDuration: 30,
          maxAppointments: 4,
          isRecurring: false,
          consultationType: 'in-person',
          location: {
            address: doctor.profile?.officeAddress || 'Ouagadougou, Burkina Faso',
            city: 'Ouagadougou',
            postalCode: '01 BP 1234'
          }
        });
        
        // Afternoon slots
        availabilities.push({
          doctor: doctor._id,
          date: date.toISOString().split('T')[0],
          startTime: '14:00',
          endTime: '18:00',
          slotDuration: 30,
          maxAppointments: 4,
          isRecurring: false,
          consultationType: 'in-person',
          location: {
            address: doctor.profile?.officeAddress || 'Ouagadougou, Burkina Faso',
            city: 'Ouagadougou',
            postalCode: '01 BP 1234'
          }
        });
      }
    }

    await Availability.insertMany(availabilities);
    console.log('📅 Disponibilités créées:', availabilities.length);

    // 6. Créer des rendez-vous
    const appointments = [];
    const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    const consultationTypes = ['in-person', 'video'];
    
    for (let i = 0; i < 50; i++) {
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
        reason: [
          'Douleurs thoraciques',
          'Fièvre et toux',
          'Mal de tête',
          'Examen annuel',
          'Douleurs abdominales',
          'Fatigue persistante',
          'Allergies saisonnières',
          'Suivi post-opératoire'
        ][Math.floor(Math.random() * 8)],
        symptoms: [
          'Fièvre depuis 2 jours',
          'Toux sèche',
          'Maux de tête intenses',
          'Nausées matinales',
          'Fatigue chronique',
          'Éruptions cutanées',
          'Douleurs articulaires',
          'Vertiges fréquents'
        ][Math.floor(Math.random() * 8)],
        urgency: ['low', 'medium', 'high', 'emergency'][Math.floor(Math.random() * 4)],
        consultationType: consultationTypes[Math.floor(Math.random() * consultationTypes.length)],
        notes: `Rendez-vous ${i + 1} - Notes médicales détaillées`,
        paymentStatus: Math.random() > 0.5 ? 'paid' : 'pending',
        paymentAmount: Math.floor(Math.random() * 50000) + 10000
      });
    }

    await Appointment.insertMany(appointments);
    console.log('📋 Rendez-vous créés:', appointments.length);

    // 7. Créer des avis patients
    const reviews = [];
    const ratings = [5, 4, 3, 2, 1];
    
    for (let i = 0; i < 30; i++) {
      const randomDoctor = createdDoctors[Math.floor(Math.random() * createdDoctors.length)];
      const randomPatient = createdPatients[Math.floor(Math.random() * createdPatients.length)];
      
      reviews.push({
        patient: randomPatient._id,
        doctor: randomDoctor._id,
        rating: ratings[Math.floor(Math.random() * 3) + 2], // Biais vers les bonnes notes
        comment: [
          'Excellent médecin, très professionnel et à l\'écoute.',
          'Très satisfait de la consultation, le Dr. est très compétent.',
          'Bonne expérience globale, personnel accueillant.',
          'Le Dr. a pris le temps d\'expliquer tout en détail.',
          'Consultation rapide et efficace, je recommande vivement.',
          'Très bon diagnostic, traitement adapté et efficace.',
          'Professionnalisme exceptionnel, je reviendrai sans hésiter.',
          'Le Dr. est très gentil et patient avec les enfants.',
          'Excellente prise en charge, résultats rapides.',
          'Service de qualité supérieure, personnel très compétent.'
        ][Math.floor(Math.random() * 10)],
        aspects: {
          professionalism: Math.floor(Math.random() * 2) + 4,
          communication: Math.floor(Math.random() * 2) + 4,
          punctuality: Math.floor(Math.random() * 2) + 4,
          cleanliness: Math.floor(Math.random() * 2) + 4,
          effectiveness: Math.floor(Math.random() * 2) + 4
        },
        wouldRecommend: Math.random() > 0.2,
        treatmentOutcome: ['Excellent', 'Bon', 'Satisfaisant', 'En cours'][Math.floor(Math.random() * 4)],
        waitTime: ['< 15 min', '15-30 min', '30-45 min', '> 45 min'][Math.floor(Math.random() * 4)],
        isVerified: Math.random() > 0.7,
        helpful: {
          count: Math.floor(Math.random() * 10),
          users: []
        }
      });
    }

    await Review.insertMany(reviews);
    console.log('⭐ Avis créés:', reviews.length);

    // 8. Créer des notifications
    const notifications = [];
    const notificationTypes = ['appointment', 'reminder', 'urgent', 'result', 'payment'];
    
    for (let i = 0; i < 40; i++) {
      const randomPatient = createdPatients[Math.floor(Math.random() * createdPatients.length)];
      
      notifications.push({
        recipient: randomPatient._id,
        type: notificationTypes[Math.floor(Math.random() * notificationTypes.length)],
        title: [
          'Rappel de rendez-vous',
          'Confirmation de rendez-vous',
          'Résultats disponibles',
          'Paiement confirmé',
          'Message urgent du médecin',
          'Modification de rendez-vous',
          'Ordonnance disponible',
          'Rappel de vaccination'
        ][Math.floor(Math.random() * 8)],
        message: [
          'Votre rendez-vous avec le Dr. est demain à 14h00.',
          'Votre rendez-vous a été confirmé avec succès.',
          'Vos résultats de laboratoire sont disponibles.',
          'Votre paiement a été reçu avec succès.',
          'Veuillez contacter votre médecin dès que possible.',
          'Votre rendez-vous a été reporté à une nouvelle date.',
          'Votre ordonnance numérique est prête à télécharger.',
          'N\'oubliez pas votre vaccination annuelle.'
        ][Math.floor(Math.random() * 8)],
        data: {
          appointmentId: `appointment_${i + 1}`,
          doctorId: createdDoctors[Math.floor(Math.random() * createdDoctors.length)]._id,
          actionUrl: `/dashboard/patient`
        },
        channels: ['in-app', 'email', 'sms'],
        status: 'delivered',
        priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)],
        scheduledFor: new Date(Date.now() + Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
        read: Math.random() > 0.5
      });
    }

    await Notification.insertMany(notifications);
    console.log('📢 Notifications créées:', notifications.length);

    console.log('\n🎉 Données de test créées avec succès !\n');
    console.log('\n📋 IDENTIFIANTS DE CONNEXION:');
    console.log('=====================================');
    console.log('👤 ADMINISTRATEUR:');
    console.log('   Email: admin@smartcare.bf');
    console.log('   Mot de passe: admin123');
    console.log('\n👨‍⚕️ MÉDECINS:');
    console.log('   Email: dr.traore@smartcare.bf');
    console.log('   Mot de passe: doctor123');
    console.log('   Email: dr.ouattara@smartcare.bf');
    console.log('   Mot de passe: doctor123');
    console.log('   Email: dr.konate@smartcare.bf');
    console.log('   Mot de passe: doctor123');
    console.log('   (Tous les médecins utilisent: doctor123)');
    console.log('\n👥 PATIENTS:');
    console.log('   Email: jean.kabore@smartcare.bf');
    console.log('   Mot de passe: patient123');
    console.log('   Email: marie.konate@smartcare.bf');
    console.log('   Mot de passe: patient123');
    console.log('   Email: mohamed.ouattara@smartcare.bf');
    console.log('   Mot de passe: patient123');
    console.log('   (Tous les patients utilisent: patient123)');
    console.log('\n📊 STATISTIQUES CRÉÉES:');
    console.log(`   • ${createdSpecialties.length} spécialités médicales`);
    console.log(`   • ${createdDoctors.length} médecins qualifiés`);
    console.log(`   • ${createdPatients.length} patients actifs`);
    console.log(`   • ${appointments.length} rendez-vous`);
    console.log(`   • ${reviews.length} avis patients`);
    console.log(`   • ${notifications.length} notifications`);
    console.log(`   • ${availabilities.length} disponibilités`);
    console.log('\n🎯 PROFILS DÉTAILLÉS:');
    console.log('   • Photos de profil (à ajouter manuellement)');
    console.log('   • Expériences professionnelles');
    console.log('   • Certifications et diplômes');
    console.log('   • Prix de consultation');
    console.log('   • Langues parlées');
    console.log('   • Informations médicales patients');
    console.log('   • Contacts d\'urgence');
    console.log('   • Assurances');
    console.log('\n📱 UTILISATION:');
    console.log('   1. Connectez-vous avec admin@smartcare.bf / admin123');
    console.log('   2. Gérez les médecins et patients');
    console.log('   3. Testez toutes les fonctionnalités');
    console.log('   4. Explorez les dashboards');
    console.log('\n✨ L\'application est prête pour les tests !');

  } catch (error) {
    console.error('❌ Erreur lors de la création des données de test:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedData();
