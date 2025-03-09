// api/send-otp.js
const sendgrid = require('@sendgrid/mail');
const crypto = require('crypto');

// Use SendGrid API key from environment variables
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

// OTP expiration time (5 minutes)
const OTP_EXPIRATION_TIME = 5 * 60 * 1000;
const otps = {}; // Temporary in-memory OTP storage (Use a DB for production)

module.exports = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Generate a random 6-digit OTP
  const otp = crypto.randomBytes(3).toString('hex'); // 6-digit OTP
  const expiration = Date.now() + OTP_EXPIRATION_TIME;

  // Store OTP and expiration in memory (use a DB for production)
  otps[email] = { otp, expiration };

  const message = {
    to: email,
    from: 'laddhakp@rknec.edu', // Use your verified SendGrid sender email
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`,
    html: `<strong>Your OTP code is: ${otp}</strong>`,
  };

  try {
    await sendgrid.send(message);
    return res.status(200).json({ message: 'OTP Sent' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
};