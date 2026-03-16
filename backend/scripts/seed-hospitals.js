const mongoose = require('mongoose');
require('dotenv').config();
const Hospital = require('../models/Hospital');
const User = require('../models/User');

const seedHospitals = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Nettoyer uniquement les hôpitaux
    await Hospital.deleteMany({});
    console.log('🗑️ Anciens hôpitaux supprimés');

    const doctors = await User.find({ role: 'doctor' }).limit(5);

    const hospitals = [
      {
        name: 'CHU Yalgado Ouédraogo',
        address: 'Secteur 4, Rue 4.54',
        city: 'Ouagadougou',
        phoneNumber: '+226 25 31 16 55',
        email: 'contact@chuyo.bf',
        isActive: true,
        doctors: doctors.map(d => d._id)
      },
      {
        name: 'Hôpital de Tengandogo',
        address: 'Tengandogo',
        city: 'Ouagadougou',
        phoneNumber: '+226 25 37 41 80',
        email: 'tengandogo@sante.gov.bf',
        isActive: true,
        doctors: doctors.slice(0, 3).map(d => d._id)
      },
      {
        name: 'Clinique Philadelphie',
        address: 'Zad, Face SIAO',
        city: 'Ouagadougou',
        phoneNumber: '+226 25 37 62 62',
        email: 'info@philadelphie.bf',
        isActive: true,
        doctors: doctors.slice(2, 5).map(d => d._id)
      },
      {
        name: 'CHU Souro Sanou',
        address: 'Quartier Koko',
        city: 'Bobo-Dioulasso',
        phoneNumber: '+226 20 97 00 44',
        email: 'chuss@sante.bf',
        isActive: true,
        doctors: []
      }
    ];

    const created = await Hospital.insertMany(hospitals);
    console.log(`🏥 ${created.length} Hôpitaux créés avec succès.`);

    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
};

seedHospitals();
