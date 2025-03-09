const { otps } = require('./send-otp.js'); // Import the in-memory store

module.exports = async (req, res) => {
  try {
    // Ensure that the request body is present
    if (!req.body) {
      return res.status(400).json({ error: 'Request body is missing' });
    }

    // Destructure email and otp from the body
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Check if otps object is properly initialized
    if (!otps || typeof otps !== 'object') {
      console.error('OTPs store is not properly initialized or is undefined');
      return res.status(500).json({ error: 'Internal Server Error: OTPs store is not initialized' });
    }

    // Check if the email exists in the store
    const storedOtp = otps[email];

    if (!storedOtp) {
      console.error(`No OTP found for email: ${email}`);
      return res.status(400).json({ error: 'OTP not found for this email' });
    }

    // Check if OTP is expired
    if (Date.now() > storedOtp.expiration) {
      console.error(`OTP expired for email: ${email}`);
      return res.status(400).json({ error: 'OTP Expired' });
    }

    // Verify the OTP
    if (storedOtp.otp === otp) {
      return res.status(200).json({ message: 'OTP Verified' });
    } else {
      console.error(`Invalid OTP provided for email: ${email}`);
      return res.status(400).json({ error: 'Invalid OTP' });
    }
  } catch (error) {
    console.error('Error in verify-otp:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};