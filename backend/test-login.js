const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function testLogin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const email = 'dr.traore@fasohealth.bf';
        const password = 'doctor123';
        
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found:', email);
            process.exit(1);
        }
        
        console.log('User found:', user.email);
        const isMatch = await user.matchPassword(password);
        console.log('Password match:', isMatch);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testLogin();
