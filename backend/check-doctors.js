const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Specialty = require('./models/Specialty');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const doctors = await User.find({role: 'doctor'});
        const specialties = await Specialty.find({});
        
        console.log('--- Doctors ---');
        console.log(JSON.stringify(doctors.map(d => ({
            id: d._id,
            name: d.name, 
            specialty: d.specialty
        })), null, 2));
        
        console.log('\n--- Available Specialties ---');
        console.log(JSON.stringify(specialties.map(s => ({
            id: s._id,
            name: s.name
        })), null, 2));
        
        process.exit(0);
    })
    .catch(e => {
        console.error(e);
        process.exit(1);
    });
