const sendgrid = require('@sendgrid/mail');
const crypto = require('crypto');

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

const OTP_EXPIRATION_TIME = 10 * 60 * 1000; // OTP expiration time: 5 minutes
let otps = {};

module.exports = async (req, res) => {
  try {
    // Ensure that the request body is present
    if (!req.body) {
      return res.status(400).json({ error: 'Request body is missing' });
    }

    // Destructure email from the body
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Generate a random 6-digit OTP
    const otp = crypto.randomBytes(3).toString('hex'); // 6-digit OTP
    const expiration = Date.now() + OTP_EXPIRATION_TIME;

    // Store OTP and expiration time in memory (use a DB for persistence)
    otps[email] = {
        otp: otp,
        expiration: expiration,
      };

    const message = {
      to: email,
      from: 'laddhakp@rknec.edu', // Replace with your SendGrid verified sender email
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
  } catch (error) {
    console.error('Error in send-otp:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};