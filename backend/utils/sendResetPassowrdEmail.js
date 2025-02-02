import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configure transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.mail.yahoo.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send a password reset code
const sendResetPasswordEmail = async (toEmail, code) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: toEmail,
    subject: 'Your Password Reset Code',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">

          <div style="background-color: #e6f7ff; padding: 20px; text-align: center;">
            <img src="https://www.uth.gr/sites/default/files/contents/logos/UTH-logo-english.png" alt="Logo" style="width: 100px; height: auto;" />
            <h1 style="margin: 10px 0; color: #333;">Password Reset Request</h1>
          </div>

          <div style="padding: 30px; text-align: center;">
            <p style="font-size: 18px; color: #555555;">Your password reset code is:</p>
            <h2 style="font-size: 32px; color: #e63946; margin: 15px 0;">${code}</h2>  
            <p style="font-size: 16px; color: #666666;">Please enter this code to reset your password.</p>
          </div>

          <div style="background-color: #f0f8ff; padding: 15px; text-align: center; color: #888888;">
            <p style="font-size: 12px; margin: 0;">If you did not request this, please ignore this email.</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send password reset email');
  }
};

export default sendResetPasswordEmail;
