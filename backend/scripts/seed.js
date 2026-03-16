const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Specialty = require('../models/Specialty');

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fasohealth');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Specialty.deleteMany({});
    console.log('Cleared existing data');

    // Create specialties
    const specialties = [
      {
        name: 'Cardiologie',
        description: 'Spécialiste des maladies du cœur et des vaisseaux sanguins',
        icon: '❤️',
        color: '#ef4444',
        averageConsultationDuration: 30,
        typicalPriceRange: { min: 15000, max: 50000 }
      },
      {
        name: 'Dermatologie',
        description: 'Spécialiste des maladies de la peau',
        icon: '🧴',
        color: '#10b981',
        averageConsultationDuration: 20,
        typicalPriceRange: { min: 10000, max: 30000 }
      },
      {
        name: 'Pédiatrie',
        description: 'Spécialiste des maladies infantiles',
        icon: '👶',
        color: '#f59e0b',
        averageConsultationDuration: 25,
        typicalPriceRange: { min: 12000, max: 40000 }
      },
      {
        name: 'Neurologie',
        description: 'Spécialiste des maladies du système nerveux',
        icon: '🧠',
        color: '#8b5cf6',
        averageConsultationDuration: 35,
        typicalPriceRange: { min: 20000, max: 60000 }
      },
      {
        name: 'Orthopédie',
        description: 'Spécialiste des maladies des os et des articulations',
        icon: '🦴',
        color: '#3b82f6',
        averageConsultationDuration: 30,
        typicalPriceRange: { min: 18000, max: 55000 }
      },
      {
        name: 'Médecine Générale',
        description: 'Médecin traitant pour consultations générales',
        icon: '⚕️',
        color: '#06b6d4',
        averageConsultationDuration: 20,
        typicalPriceRange: { min: 8000, max: 25000 }
      }
    ];

    const createdSpecialties = await Specialty.insertMany(specialties);
    console.log('Created specialties:', createdSpecialties.length);

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin SmartCare',
      email: 'admin@smartcare.com',
      password: adminPassword,
      role: 'admin',
      phoneNumber: '+226 12345678'
    });

    // Create doctors
    const doctorPassword = await bcrypt.hash('doctor123', 10);
    const doctors = [
      {
        name: 'Dr. Marie Konaté',
        email: 'marie.konate@smartcare.com',
        password: doctorPassword,
        role: 'doctor',
        specialty: createdSpecialties[0]._id, // Cardiologie
        phoneNumber: '+226 76543210',
        consultationType: 'both',
        location: {
          address: 'Avenue Kwamé N\'Krumah, Ouagadougou',
          city: 'Ouagadougou',
          postalCode: '01 BP 1234'
        }
      },
      {
        name: 'Dr. Jean-Baptiste Ouédraogo',
        email: 'jb.ouedraogo@smartcare.com',
        password: doctorPassword,
        role: 'doctor',
        specialty: createdSpecialties[1]._id, // Dermatologie
        phoneNumber: '+226 76543211',
        consultationType: 'in-person',
        location: {
          address: 'Rue de la Paix, Ouagadougou',
          city: 'Ouagadougou',
          postalCode: '01 BP 5678'
        }
      },
      {
        name: 'Dr. Aminata Traoré',
        email: 'aminata.traore@smartcare.com',
        password: doctorPassword,
        role: 'doctor',
        specialty: createdSpecialties[2]._id, // Pédiatrie
        phoneNumber: '+226 76543212',
        consultationType: 'both',
        location: {
          address: 'Avenue Thomas Sankara, Bobo-Dioulasso',
          city: 'Bobo-Dioulasso',
          postalCode: '01 BP 9012'
        }
      },
      {
        name: 'Dr. Paul Yaméogo',
        email: 'paul.yameogo@smartcare.com',
        password: doctorPassword,
        role: 'doctor',
        specialty: createdSpecialties[3]._id, // Neurologie
        phoneNumber: '+226 76543213',
        consultationType: 'video',
        location: {
          address: 'Boulevard de la Liberté, Koudougou',
          city: 'Koudougou',
          postalCode: '01 BP 3456'
        }
      }
    ];

    const createdDoctors = await User.insertMany(doctors);
    console.log('Created doctors:', createdDoctors.length);

    // Create sample patients
    const patientPassword = await bcrypt.hash('patient123', 10);
    const patients = [
      {
        name: 'Kadiatou Diallo',
        email: 'kadiatou.diallo@gmail.com',
        password: patientPassword,
        role: 'patient',
        phoneNumber: '+226 70123456'
      },
      {
        name: 'Mohamed Cissé',
        email: 'mohamed.cisse@gmail.com',
        password: patientPassword,
        role: 'patient',
        phoneNumber: '+226 70234567'
      },
      {
        name: 'Awa Bamba',
        email: 'awa.bamba@gmail.com',
        password: patientPassword,
        role: 'patient',
        phoneNumber: '+226 70345678'
      }
    ];

    const createdPatients = await User.insertMany(patients);
    console.log('Created patients:', createdPatients.length);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Login credentials:');
    console.log('👤 Admin: admin@smartcare.com / admin123');
    console.log('👨‍⚕️ Doctors:');
    createdDoctors.forEach((doctor, index) => {
      console.log(`   - ${doctor.email} / doctor123`);
    });
    console.log('👥 Patients:');
    createdPatients.forEach((patient, index) => {
      console.log(`   - ${patient.email} / patient123`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function
seedDatabase();
