const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function testModels() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');

        const models = [
            'User',
            'Specialty',
            'Appointment',
            'Availability',
            'Review',
            'Notification',
            'Message',
            'Analytics'
        ];

        for (const modelName of models) {
            console.log(`Checking model: ${modelName}`);
            try {
                const model = require(`./models/${modelName}`);
                console.log(`Successfully loaded ${modelName}`);
                const count = await model.countDocuments();
                console.log(`Count for ${modelName}: ${count}`);
            } catch (err) {
                console.error(`Error loading/querying ${modelName}:`, err.message);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Initial error:', err.message);
        process.exit(1);
    }
}

testModels();
