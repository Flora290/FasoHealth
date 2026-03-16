const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config({path: './.env'});
const User = require('./models/User');

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const admin = await User.findOne({role: 'admin'});
    const token = jwt.sign({id: admin._id}, process.env.JWT_SECRET);
    
    const http = require('http');
    http.get('http://localhost:5000/api/admin/hospitals', {
        headers: { Authorization: 'Bearer ' + token }
    }, res => {
        let d = '';
        res.on('data', c => d+=c);
        res.on('end', () => {
            console.log(JSON.stringify(JSON.parse(d), null, 2));
            process.exit(0);
        });
    });
};
run();
