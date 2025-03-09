const sendgrid = require('@sendgrid/mail');
const crypto = require('crypto');

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

const OTP_EXPIRATION_TIME = 5 * 60 * 1000; // OTP expiration time: 5 minutes
const otps = {}; // For demo, use a DB in production.

module.exports = async (req, res) => {
  // Parse JSON body manually from the incoming request
  let body;
  try {
    body = JSON.parse(req.body); // Manually parse the body
  } catch (error) {
    console.error("Error parsing body:", error);
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }

  const { email } = body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Generate OTP and set expiration time
  const otp = crypto.randomBytes(3).toString('hex'); // 6-digit OTP
  const expiration = Date.now() + OTP_EXPIRATION_TIME;

  // Store OTP and expiration in memory
  otps[email] = { otp, expiration };

  // Email message setup
  const message = {
    to: email,
    from: 'your-email@example.com', // Use a verified email address in SendGrid
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`,
    html: `<strong>Your OTP code is: ${otp}</strong>`,
  };

  try {
    // Send OTP email using SendGrid
    await sendgrid.send(message);
    return res.status(200).json({ message: 'OTP Sent' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
};