const axios = require('axios');
require('dotenv').config();

async function simulate() {
    try {
        const baseUrl = 'http://localhost:5000';
        
        // 1. Login to get token (Assume patient exists)
        console.log('--- Logging in ---');
        const loginRes = await axios.post(`${baseUrl}/api/auth/login`, {
            email: 'patient@fasohealth.bf', // Adjust if needed
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('Logged in successfully');

        // 2. Find a doctor
        console.log('--- Finding Doctor ---');
        const doctorsRes = await axios.get(`${baseUrl}/api/users?role=doctor`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const doctor = doctorsRes.data.find(d => d.name.includes('Adama')) || doctorsRes.data[0];
        console.log('Selected Doctor:', doctor.name, 'specialty:', doctor.specialty);

        // 3. Find availability
        console.log('--- Finding Availability ---');
        const availRes = await axios.get(`${baseUrl}/api/doctor/availability-overview?startDate=2026-03-01&endDate=2026-04-01`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const availability = availRes.data.availabilities[0];
        if (!availability) {
            console.log('No availabilities found');
            return;
        }
        console.log('Selected Availability:', availability._id);

        // 4. Submit Appointment (Like frontend)
        console.log('--- Submitting Appointment ---');
        try {
            const appointmentData = {
                doctor: doctor._id,
                availability: availability._id,
                date: availability.date,
                startTime: availability.startTime,
                endTime: availability.endTime,
                reason: 'Simulated booking test',
                symptoms: 'Test symptoms',
                notes: 'Test notes',
                consultationType: availability.consultationType === 'both' ? 'in-person' : availability.consultationType,
                payment: {
                    method: 'cash',
                    amount: 2000,
                    status: 'pending'
                }
            };

            const appRes = await axios.post(`${baseUrl}/api/appointments`, appointmentData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('SUCCESS: Appointment created!', appRes.data._id);
        } catch (appErr) {
            console.error('FAILED to create appointment:');
            if (appErr.response) {
                console.error('Status:', appErr.response.status);
                console.error('Data:', JSON.stringify(appErr.response.data, null, 2));
            } else {
                console.error(appErr.message);
            }
        }

    } catch (err) {
        console.error('Setup failed:');
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.error(err.message);
        }
    }
}

simulate();
