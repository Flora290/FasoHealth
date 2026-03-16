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
                subject = 'Nouvelle demande de rendez-vous - SmartCare';
                htmlContent = generateAppointmentPendingEmail(user, data);
                break;
                
            case 'appointment_confirmed':
                subject = 'Rendez-vous confirmé - SmartCare';
                htmlContent = generateAppointmentConfirmedEmail(user, data);
                break;
                
            case 'appointment_cancelled':
                subject = 'Rendez-vous annulé - SmartCare';
                htmlContent = generateAppointmentCancelledEmail(user, data);
                break;
                
            case 'appointment_reminder':
                subject = 'Rappel de rendez-vous - SmartCare';
                htmlContent = generateAppointmentReminderEmail(user, data);
                break;
                
            case 'appointment_completed':
                subject = 'Rendez-vous terminé - FasoHealth';
                htmlContent = generateAppointmentCompletedEmail(user, data);
                break;
                
            case 'review_received':
                subject = 'Nouvel avis reçu - FasoHealth';
                htmlContent = generateReviewReceivedEmail(user, data);
                break;
                
            case 'password_reset':
                subject = 'Réinitialisation de votre mot de passe - FasoHealth';
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
            <title>Nouvelle demande de rendez-vous</title>
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
                    <h1>🏥 SmartCare</h1>
                    <h2>Nouvelle demande de rendez-vous</h2>
                </div>
                <div class="content">
                    <p>Bonjour ${user.name},</p>
                    <p>Vous avez une nouvelle demande de rendez-vous:</p>
                    <ul>
                        <li><strong>Patient:</strong> ${data.patientName}</li>
                        <li><strong>Date:</strong> ${data.date}</li>
                        <li><strong>Heure:</strong> ${data.time}</li>
                        <li><strong>Motif:</strong> ${data.reason}</li>
                    </ul>
                    <p>Veuillez vous connecter à votre tableau de bord pour confirmer ou refuser cette demande.</p>
                    <a href="${process.env.FRONTEND_URL}/doctor/appointments" class="button">Voir les rendez-vous</a>
                </div>
                <div class="footer">
                    <p>Cet email a été envoyé automatiquement par SmartCare.</p>
                    <p>© ${new Date().getFullYear()} SmartCare. Tous droits réservés.</p>
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
            <title>Rendez-vous confirmé</title>
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
                    <h1>🏥 SmartCare</h1>
                    <h2>Rendez-vous confirmé</h2>
                </div>
                <div class="content">
                    <div class="success">
                        ✅ Votre rendez-vous a été confirmé!
                    </div>
                    <p>Bonjour ${user.name},</p>
                    <p>Votre rendez-vous a été confirmé avec les détails suivants:</p>
                    <ul>
                        <li><strong>Médecin:</strong> Dr ${data.doctorName}</li>
                        <li><strong>Spécialité:</strong> ${data.specialty}</li>
                        <li><strong>Date:</strong> ${data.date}</li>
                        <li><strong>Heure:</strong> ${data.time}</li>
                        <li><strong>Type:</strong> ${data.consultationType}</li>
                    </ul>
                    <p>Merci de vous présenter 10 minutes avant l'heure du rendez-vous.</p>
                    <a href="${process.env.FRONTEND_URL}/patient/appointments" class="button">Voir mes rendez-vous</a>
                </div>
                <div class="footer">
                    <p>Cet email a été envoyé automatiquement par SmartCare.</p>
                    <p>© ${new Date().getFullYear()} SmartCare. Tous droits réservés.</p>
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
            <title>Rendez-vous annulé</title>
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
                    <h1>🏥 SmartCare</h1>
                    <h2>Rendez-vous annulé</h2>
                </div>
                <div class="content">
                    <div class="warning">
                        ⚠️ Votre rendez-vous a été annulé
                    </div>
                    <p>Bonjour ${user.name},</p>
                    <p>Le rendez-vous suivant a été annulé:</p>
                    <ul>
                        <li><strong>Médecin:</strong> Dr ${data.doctorName}</li>
                        <li><strong>Date:</strong> ${data.date}</li>
                        <li><strong>Heure:</strong> ${data.time}</li>
                        <li><strong>Raison:</strong> ${data.reason || 'Non spécifiée'}</li>
                    </ul>
                    <p>Vous pouvez prendre un nouveau rendez-vous à tout moment.</p>
                    <a href="${process.env.FRONTEND_URL}/search" class="button">Prendre un nouveau rendez-vous</a>
                </div>
                <div class="footer">
                    <p>Cet email a été envoyé automatiquement par SmartCare.</p>
                    <p>© ${new Date().getFullYear()} SmartCare. Tous droits réservés.</p>
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
            <title>Rappel de rendez-vous</title>
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
                    <h1>🏥 SmartCare</h1>
                    <h2>⏰ Rappel de rendez-vous</h2>
                </div>
                <div class="content">
                    <div class="reminder">
                        📅 Vous avez un rendez-vous demain!
                    </div>
                    <p>Bonjour ${user.name},</p>
                    <p>Nous vous rappelons votre rendez-vous:</p>
                    <ul>
                        <li><strong>Médecin:</strong> Dr ${data.doctorName}</li>
                        <li><strong>Date:</strong> ${data.date}</li>
                        <li><strong>Heure:</strong> ${data.time}</li>
                        <li><strong>Lieu:</strong> ${data.location || 'Non spécifié'}</li>
                    </ul>
                    <p>Merci de vous présenter 10 minutes avant l'heure du rendez-vous.</p>
                    <a href="${process.env.FRONTEND_URL}/appointments/${data.appointmentId}" class="button">Voir les détails</a>
                </div>
                <div class="footer">
                    <p>Cet email a été envoyé automatiquement par SmartCare.</p>
                    <p>© ${new Date().getFullYear()} SmartCare. Tous droits réservés.</p>
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
            <title>Rendez-vous terminé</title>
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
                    <h1>🏥 SmartCare</h1>
                    <h2>Rendez-vous terminé</h2>
                </div>
                <div class="content">
                    <div class="success">
                        ✅ Votre rendez-vous est terminé
                    </div>
                    <p>Bonjour ${user.name},</p>
                    <p>Votre rendez-vous avec le Dr ${data.doctorName} s'est bien déroulé.</p>
                    <p>Nous espérons que vous êtes satisfait(e) de la consultation.</p>
                    <p>Votre avis est important pour nous et pour aider les autres patients.</p>
                    <a href="${process.env.FRONTEND_URL}/review/${data.appointmentId}" class="button">Laisser un avis</a>
                </div>
                <div class="footer">
                    <p>Cet email a été envoyé automatiquement par SmartCare.</p>
                    <p>© ${new Date().getFullYear()} SmartCare. Tous droits réservés.</p>
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
            <title>Nouvel avis reçu</title>
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
                    <h1>🏥 SmartCare</h1>
                    <h2>⭐ Nouvel avis reçu</h2>
                </div>
                <div class="content">
                    <div class="review">
                        📝 Un patient a laissé un avis sur votre consultation
                    </div>
                    <p>Bonjour Dr ${user.name},</p>
                    <p>Vous avez reçu un nouvel avis:</p>
                    <ul>
                        <li><strong>Note:</strong> ${'⭐'.repeat(data.rating)} (${data.rating}/5)</li>
                        <li><strong>Patient:</strong> ${data.patientName}</li>
                        <li><strong>Date:</strong> ${data.date}</li>
                        <li><strong>Commentaire:</strong> "${data.comment}"</li>
                    </ul>
                    <p>Merci pour votre excellent travail!</p>
                    <a href="${process.env.FRONTEND_URL}/doctor/reviews" class="Button">Voir tous mes avis</a>
                </div>
                <div class="footer">
                    <p>Cet email a été envoyé automatiquement par SmartCare.</p>
                    <p>© ${new Date().getFullYear()} SmartCare. Tous droits réservés.</p>
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
            <title>Réinitialisation de mot de passe</title>
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
                    <h2>Réinitialisation de mot de passe</h2>
                </div>
                <div class="content">
                    <p>Bonjour ${user.name},</p>
                    <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte FasoHealth.</p>
                    <p>Veuillez utiliser le code de vérification suivant :</p>
                    <div class="otp-box">
                        ${data.otp}
                    </div>
                    <p>Ce code est valable pendant 1 heure. Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.</p>
                </div>
                <div class="footer">
                    <p>Cet email a été envoyé automatiquement par FasoHealth.</p>
                    <p>© ${new Date().getFullYear()} FasoHealth. Tous droits réservés.</p>
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
            <title>Notification SmartCare</title>
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
                    <h1>🏥 SmartCare</h1>
                    <h2>Notification</h2>
                </div>
                <div class="content">
                    <p>Bonjour ${user.name},</p>
                    <p>${data.message || 'Vous avez une nouvelle notification.'}</p>
                    <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Voir mon tableau de bord</a>
                </div>
                <div class="footer">
                    <p>Cet email a été envoyé automatiquement par SmartCare.</p>
                    <p>© ${new Date().getFullYear()} SmartCare. Tous droits réservés.</p>
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
