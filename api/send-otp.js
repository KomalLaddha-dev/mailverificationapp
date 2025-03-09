const sendgrid = require('@sendgrid/mail');
const crypto = require('crypto');
const { kv } = require('@vercel/kv'); // Import Vercel KV client

// Set SendGrid API Key
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

// OTP expiration time: 10 minutes (600000 ms)
const OTP_EXPIRATION_TIME = 10 * 60 * 1000;

module.exports = async (req, res) => {
  try {
    // Ensure request body is present
    if (!req.body || !req.body.email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const { email } = req.body;

    // Validate email format (basic validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Generate a 6-digit OTP
    const otp = crypto.randomBytes(3).toString('hex'); // Generates 6-character OTP (3 bytes => 6 hex chars)
    const expiration = Date.now() + OTP_EXPIRATION_TIME;

    // Store OTP in Vercel KV with email as the key and expiration time
    await kv.set(email, JSON.stringify({ otp, expiration }));

    // Prepare SendGrid email message
    const message = {
      to: email,
      from: 'laddhakp@rknec.edu', // Use your SendGrid verified sender email
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}`,
      html: `<strong>Your OTP code is: ${otp}</strong>`,
    };

    // Send the OTP email via SendGrid
    try {
      await sendgrid.send(message);
      console.log('OTP sent to:', email, 'OTP:', otp); // Log OTP and email (ensure this is not exposed in production)
      return res.status(200).json({ message: 'OTP Sent' });
    } catch (error) {
      console.error('Error sending OTP via SendGrid:', error);
      return res.status(500).json({ error: 'Failed to send OTP' });
    }

  } catch (error) {
    console.error('Error in send-otp:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};