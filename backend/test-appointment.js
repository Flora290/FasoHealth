const mongoose = require('mongoose');
require('dotenv').config();

const Appointment = require('./models/Appointment');
const User = require('./models/User');
const Availability = require('./models/Availability');
const Specialty = require('./models/Specialty'); // Explicitly required for population

async function test() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('--- CONNECTED TO DB ---');

        const doctors = await User.find({role: 'doctor'});
        const patients = await User.find({role: 'patient'});
        
        if (doctors.length === 0 || patients.length === 0) {
            console.error('ERROR: Need at least one doctor and one patient');
            process.exit(1);
        }

        const doctor = doctors.find(d => d.name.includes('Adama')) || doctors[0];
        const patient = patients[0];
        
        const availability = await Availability.findOne({doctor: doctor._id});
        if (!availability) {
            console.error('ERROR: Need an availability for doctor', doctor.name);
            process.exit(1);
        }

        console.log('DOC NAME:', doctor.name);
        console.log('DOC SPECIALTY ID:', doctor.specialty);

        const appointmentData = {
            patient: patient._id,
            doctor: doctor._id,
            specialty: doctor.specialty,
            availability: availability._id,
            date: availability.date,
            startTime: availability.startTime,
            endTime: availability.endTime,
            reason: 'Test population ' + new Date().toISOString(),
            symptoms: 'None',
            urgency: 'medium',
            consultationType: 'in-person',
            payment: { method: 'cash', status: 'pending', amount: 2000 }
        };

        console.log('--- ATTEMPTING Appointment.create ---');
        const appointment = await Appointment.create(appointmentData);
        console.log('SUCCESS: Appointment created with ID:', appointment._id);

        console.log('--- ATTEMPTING Population exactly like controller ---');
        try {
            const populatedAppointment = await Appointment.findById(appointment._id)
                .populate('patient', 'name email phoneNumber')
                .populate('doctor', 'name email specialty')
                .populate('specialty', 'name');
            
            console.log('SUCCESS: Population worked!');
            console.log('Populated Specialty:', populatedAppointment.specialty);
            console.log('Populated Doctor Specialty:', populatedAppointment.doctor.specialty);
        } catch (popErr) {
            console.error('CRITICAL ERROR during Population:');
            console.error(popErr);
        }

        process.exit(0);
    } catch (err) {
        console.error('SETUP FAILED:', err);
        process.exit(1);
    }
}

test();
