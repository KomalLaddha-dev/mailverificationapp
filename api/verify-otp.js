const { otps } = require('./send-otp.js');

module.exports = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  const storedOtp = otps[email];

  if (!storedOtp) {
    return res.status(400).json({ error: 'OTP not found for this email' });
  }

  if (Date.now() > storedOtp.expiration) {
    return res.status(400).json({ error: 'OTP Expired' });
  }

  if (storedOtp.otp === otp) {
    return res.status(200).json({ message: 'OTP Verified' });
  } else {
    return res.status(400).json({ error: 'Invalid OTP' });
  }
};