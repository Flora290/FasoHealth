const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, specialty, phoneNumber } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'patient',
            specialty: role === 'doctor' ? specialty : undefined,
            phoneNumber
        });

        if (user) {
            // Patients verify email immediately
            if (user.role === 'patient') {
                const otp = "123456"; // Fixed for development
                user.otpCode = otp;
                user.otpExpires = Date.now() + 60 * 60 * 1000;
                await user.save();
                
                console.log(`[SECURITY-REG] OTP for ${user.email}: ${otp}`);
                
                return res.status(201).json({
                    otpRequired: true,
                    email: user.email,
                    role: user.role,
                    message: "Account created. Please verify your email with the OTP code."
                });
            }

            // Doctors wait for admin approval before OTP
            if (user.role === 'doctor') {
                return res.status(201).json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    message: "Your doctor account has been created and is awaiting approval by an administrator."
                });
            }

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: error.message, stack: error.stack });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('Login attempt:', { email, password: '***' });

        const user = await User.findOne({ email });
        
        console.log('User found:', user ? 'YES' : 'NO');
        if (user) {
            console.log('Email:', user.email);
            console.log('Role:', user.role);
            console.log('Active:', user.isActive);
            console.log('Password hash existe:', user.password ? 'OUI' : 'NON');
        }

        if (user && (await user.matchPassword(password))) {
            // Security check for Doctors
            if (user.role === 'doctor' && !user.isActive) {
                return res.status(403).json({ message: "Your account is awaiting approval by an administrator." });
            }

            // OTP for unverified Patients and Doctors
            if (!user.isVerified && user.role !== 'admin') {
                const otp = "123456"; // Fixed OTP for development
                user.otpCode = otp;
                user.otpExpires = Date.now() + 60 * 60 * 1000;
                await user.save();

                console.log(`[SECURITY-LOGIN] OTP for ${user.email}: ${otp}`);
                return res.json({ otpRequired: true, email: user.email, message: 'Verification code sent to your email' });
            }

            console.log('Login successful for:', user.email);
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            console.log('Login failed for:', email);
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify OTP code
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const otp = req.body.otp ? req.body.otp.toString().trim() : '';
        console.log(`[VERIFY] Attempt for ${email} with OTP [${otp}]`);

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.otpCode !== otp || user.otpExpires < Date.now()) {
            console.log(`[VERIFY-FAILED] Expected: ${user.otpCode}, Got: ${otp}, Expired: ${user.otpExpires < Date.now()}`);
            return res.status(401).json({ message: 'Invalid or expired verification code' });
        }

        user.isVerified = true;
        user.otpCode = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('OTP Verification Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                phoneNumber: updatedUser.phoneNumber,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otp = "123456"; // Unify for development
        user.otpCode = otp;
        user.otpExpires = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save();

        // Send email
        const { sendEmailNotification } = require('../services/emailService');
        await sendEmailNotification(user._id, 'password_reset', { otp });

        console.log(`[SECURITY-FORGOT] Reset OTP for ${user.email}: ${otp}`);
        res.json({ message: 'Reset code sent to your email' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const otp = req.body.otp ? req.body.otp.toString().trim() : '';
        console.log(`[RESET] Attempt for ${email} with OTP [${otp}]`);

        const user = await User.findOne({ email });

        if (!user || user.otpCode !== otp || user.otpExpires < Date.now()) {
            if (user) {
                console.log(`[RESET-FAILED] Expected: ${user.otpCode}, Got: ${otp}, Expired: ${user.otpExpires < Date.now()}`);
            }
            return res.status(401).json({ message: 'Invalid or expired reset code' });
        }

        user.password = newPassword;
        user.otpCode = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    verifyOTP,
    getUserProfile,
    updateUserProfile,
    forgotPassword,
    resetPassword,
};
