const nodemailer = require('nodemailer');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Create email transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Send email notification
const sendEmailNotification = async (userId, type, data) => {
    try {
        const user = await User.findById(userId);
        if (!user || !user.email) {
            console.log('User not found or no email address');
            return;
        }

        const transporter = createTransporter();
        
        let subject, htmlContent;

        switch (type) {
            case 'appointment_pending':
                subject = 'New Appointment Request - FasoHealth';
                htmlContent = generateAppointmentPendingEmail(user, data);
                break;
                
            case 'appointment_confirmed':
                subject = 'Appointment Confirmed - FasoHealth';
                htmlContent = generateAppointmentConfirmedEmail(user, data);
                break;
                
            case 'appointment_cancelled':
                subject = 'Appointment Cancelled - FasoHealth';
                htmlContent = generateAppointmentCancelledEmail(user, data);
                break;
                
            case 'appointment_reminder':
                subject = 'Appointment Reminder - FasoHealth';
                htmlContent = generateAppointmentReminderEmail(user, data);
                break;
                
            case 'appointment_completed':
                subject = 'Appointment Completed - FasoHealth';
                htmlContent = generateAppointmentCompletedEmail(user, data);
                break;
                
            case 'review_received':
                subject = 'New Review Received - FasoHealth';
                htmlContent = generateReviewReceivedEmail(user, data);
                break;
                
            case 'password_reset':
                subject = 'Password Reset - FasoHealth';
                htmlContent = generatePasswordResetEmail(user, data);
                break;
                
            default:
                subject = 'Notification - FasoHealth';
                htmlContent = generateGenericEmail(user, data);
        }

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@fasohealth.com',
            to: user.email,
            subject,
            html: htmlContent
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${user.email} for ${type}`);
        
        // Update notification status
        if (data.notificationId) {
            await Notification.findByIdAndUpdate(data.notificationId, {
                status: 'sent'
            });
        }
        
    } catch (error) {
        console.error('Error sending email:', error);
        
        // Update notification status to failed
        if (data.notificationId) {
            await Notification.findByIdAndUpdate(data.notificationId, {
                status: 'failed'
            });
        }
    }
};

// Email templates
const generateAppointmentPendingEmail = (user, data) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>New Appointment Request</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #10b981; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏥 FasoHealth</h1>
                    <h2>New Appointment Request</h2>
                </div>
                <div class="content">
                    <p>Hello ${user.name},</p>
                    <p>You have a new appointment request:</p>
                    <ul>
                        <li><strong>Patient:</strong> ${data.patientName}</li>
                        <li><strong>Date:</strong> ${data.date}</li>
                        <li><strong>Time:</strong> ${data.time}</li>
                        <li><strong>Reason:</strong> ${data.reason}</li>
                    </ul>
                    <p>Please log in to your dashboard to confirm or decline this request.</p>
                    <a href="${process.env.FRONTEND_URL}/doctor/appointments" class="button">View Appointments</a>
                </div>
                <div class="footer">
                    <p>This email was sent automatically by FasoHealth.</p>
                    <p>&copy; ${new Date().getFullYear()} FasoHealth. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

const generateAppointmentConfirmedEmail = (user, data) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Appointment Confirmed</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #10b981; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                .success { background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏥 FasoHealth</h1>
                    <h2>Appointment Confirmed</h2>
                </div>
                <div class="content">
                    <div class="success">
                        ✅ Your appointment has been confirmed!
                    </div>
                    <p>Hello ${user.name},</p>
                    <p>Your appointment has been confirmed with the following details:</p>
                    <ul>
                        <li><strong>Doctor:</strong> Dr. ${data.doctorName}</li>
                        <li><strong>Specialty:</strong> ${data.specialty}</li>
                        <li><strong>Date:</strong> ${data.date}</li>
                        <li><strong>Time:</strong> ${data.time}</li>
                        <li><strong>Type:</strong> ${data.consultationType}</li>
                    </ul>
                    <p>Please arrive 10 minutes before your appointment time.</p>
                    <a href="${process.env.FRONTEND_URL}/patient/appointments" class="button">View My Appointments</a>
                </div>
                <div class="footer">
                    <p>This email was sent automatically by FasoHealth.</p>
                    <p>&copy; ${new Date().getFullYear()} FasoHealth. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

const generateAppointmentCancelledEmail = (user, data) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Appointment Cancelled</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                .warning { background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏥 FasoHealth</h1>
                    <h2>Appointment Cancelled</h2>
                </div>
                <div class="content">
                    <div class="warning">
                        ⚠️ Your appointment has been cancelled
                    </div>
                    <p>Hello ${user.name},</p>
                    <p>The following appointment has been cancelled:</p>
                    <ul>
                        <li><strong>Doctor:</strong> Dr. ${data.doctorName}</li>
                        <li><strong>Date:</strong> ${data.date}</li>
                        <li><strong>Time:</strong> ${data.time}</li>
                        <li><strong>Reason:</strong> ${data.reason || 'Not specified'}</li>
                    </ul>
                    <p>You can book a new appointment at any time.</p>
                    <a href="${process.env.FRONTEND_URL}/search" class="button">Book a New Appointment</a>
                </div>
                <div class="footer">
                    <p>This email was sent automatically by FasoHealth.</p>
                    <p>&copy; ${new Date().getFullYear()} FasoHealth. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

const generateAppointmentReminderEmail = (user, data) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Appointment Reminder</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                .reminder { background: #fef3c7; color: #92400e; padding: 10px; border-radius: 5px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏥 FasoHealth</h1>
                    <h2>⏰ Appointment Reminder</h2>
                </div>
                <div class="content">
                    <div class="reminder">
                        📅 You have an appointment tomorrow!
                    </div>
                    <p>Hello ${user.name},</p>
                    <p>This is a reminder for your upcoming appointment:</p>
                    <ul>
                        <li><strong>Doctor:</strong> Dr. ${data.doctorName}</li>
                        <li><strong>Date:</strong> ${data.date}</li>
                        <li><strong>Time:</strong> ${data.time}</li>
                        <li><strong>Location:</strong> ${data.location || 'Not specified'}</li>
                    </ul>
                    <p>Please arrive 10 minutes before your appointment time.</p>
                    <a href="${process.env.FRONTEND_URL}/appointments/${data.appointmentId}" class="button">View Details</a>
                </div>
                <div class="footer">
                    <p>This email was sent automatically by FasoHealth.</p>
                    <p>&copy; ${new Date().getFullYear()} FasoHealth. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

const generateAppointmentCompletedEmail = (user, data) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Appointment Completed</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #10b981; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                .success { background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏥 FasoHealth</h1>
                    <h2>Appointment Completed</h2>
                </div>
                <div class="content">
                    <div class="success">
                        ✅ Your appointment is complete
                    </div>
                    <p>Hello ${user.name},</p>
                    <p>Your appointment with Dr. ${data.doctorName} went well.</p>
                    <p>We hope you are satisfied with the consultation.</p>
                    <p>Your review is important to us and helps other patients.</p>
                    <a href="${process.env.FRONTEND_URL}/review/${data.appointmentId}" class="button">Leave a Review</a>
                </div>
                <div class="footer">
                    <p>This email was sent automatically by FasoHealth.</p>
                    <p>&copy; ${new Date().getFullYear()} FasoHealth. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

const generateReviewReceivedEmail = (user, data) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>New Review Received</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #10b981; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                .review { background: #e0f2fe; color: #0277bd; padding: 10px; border-radius: 5px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏥 FasoHealth</h1>
                    <h2>⭐ New Review Received</h2>
                </div>
                <div class="content">
                    <div class="review">
                        📝 A patient has left a review on your consultation
                    </div>
                    <p>Hello Dr. ${user.name},</p>
                    <p>You have received a new review:</p>
                    <ul>
                        <li><strong>Rating:</strong> ${'⭐'.repeat(data.rating)} (${data.rating}/5)</li>
                        <li><strong>Patient:</strong> ${data.patientName}</li>
                        <li><strong>Date:</strong> ${data.date}</li>
                        <li><strong>Comment:</strong> "${data.comment}"</li>
                    </ul>
                    <p>Thank you for your excellent work!</p>
                    <a href="${process.env.FRONTEND_URL}/doctor/reviews" class="button">View All My Reviews</a>
                </div>
                <div class="footer">
                    <p>This email was sent automatically by FasoHealth.</p>
                    <p>&copy; ${new Date().getFullYear()} FasoHealth. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

const generatePasswordResetEmail = (user, data) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Password Reset</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #0d9488; color: white; padding: 20px; text-align: center; }
                .content { padding: 24px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; margin-top: 20px; }
                .otp-box { background: #f0fdfa; border: 2px dashed #0d9488; color: #0d9488; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; margin: 24px 0; letter-spacing: 8px; border-radius: 12px; }
                .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏥 FasoHealth</h1>
                    <h2>Password Reset</h2>
                </div>
                <div class="content">
                    <p>Hello ${user.name},</p>
                    <p>You have requested a password reset for your FasoHealth account.</p>
                    <p>Please use the following verification code:</p>
                    <div class="otp-box">
                        ${data.otp}
                    </div>
                    <p>This code is valid for 1 hour. If you did not request this, you can safely ignore this email.</p>
                </div>
                <div class="footer">
                    <p>This email was sent automatically by FasoHealth.</p>
                    <p>&copy; ${new Date().getFullYear()} FasoHealth. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

// Map generic email to allow user profile updates without full templates
const generateGenericEmail = (user, data) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>FasoHealth Notification</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #10b981; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏥 FasoHealth</h1>
                    <h2>Notification</h2>
                </div>
                <div class="content">
                    <p>Hello ${user.name},</p>
                    <p>${data.message || 'You have a new notification.'}</p>
                    <a href="${process.env.FRONTEND_URL}/dashboard" class="button">View My Dashboard</a>
                </div>
                <div class="footer">
                    <p>This email was sent automatically by FasoHealth.</p>
                    <p>&copy; ${new Date().getFullYear()} FasoHealth. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

// Schedule email notifications (to be run by cron job)
const scheduleEmailNotifications = async () => {
    try {
        const pendingNotifications = await Notification.find({
            status: 'pending',
            scheduledFor: { $lte: new Date() },
            'channels.email': true
        }).populate('recipient');

        for (const notification of pendingNotifications) {
            await sendEmailNotification(
                notification.recipient._id,
                notification.type,
                {
                    ...notification.data,
                    notificationId: notification._id
                }
            );
        }
    } catch (error) {
        console.error('Error scheduling email notifications:', error);
    }
};

module.exports = {
    sendEmailNotification,
    scheduleEmailNotifications
};
