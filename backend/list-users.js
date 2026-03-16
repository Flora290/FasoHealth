const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const User = require('./models/User');
        const users = await User.find({}, '-password');
        console.log(JSON.stringify(users, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUsers();
