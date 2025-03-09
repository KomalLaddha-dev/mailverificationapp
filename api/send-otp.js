const sendgrid = require('@sendgrid/mail');
const crypto = require('crypto');

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

const OTP_EXPIRATION_TIME = 5 * 60 * 1000; // OTP expiration time: 5 minutes
const otps = {}; // This is for demo purposes, use a DB in production

module.exports = async (req, res) => {
  // Log the incoming request body for debugging
  console.log("Raw body:", req.body);

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Generate a random 6-digit OTP
  const otp = crypto.randomBytes(3).toString('hex'); // 6-digit OTP
  const expiration = Date.now() + OTP_EXPIRATION_TIME;

  // Store OTP and expiration in memory (you should use a database for persistence)
  otps[email] = { otp, expiration };

  const message = {
    to: email,
    from: 'your-email@example.com', // Make sure to use a verified sender
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