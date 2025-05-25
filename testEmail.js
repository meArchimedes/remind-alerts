require('dotenv').config(); // Load environment variables

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,  
    secure: false,
    auth: {
        user: process.env.EMAIL,   
        pass: process.env.EMAIL_PASSWORD, 
    },
});

const mailOptions = {
    from: `"Remind Alerts" <no-reply@remindalerts.com>`,  
    to: 'stassaf9@gmail.com', 
    subject: 'Test Email 2 from Nodemailer-testEmail service',
    text: 'This is a test email sent from my birthday reminder app.',
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log('Error:', error);
    }
});
