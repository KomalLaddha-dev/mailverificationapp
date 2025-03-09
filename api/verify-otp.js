const { otps } = require('./send-otp.js'); // Import the in-memory store

module.exports = async (req, res) => {
  // Log the raw request body to check if it is coming in as expected
  console.log("Raw body:", req.body);

  // Manually parse the incoming JSON request body
  let body;
  try {
    body = JSON.parse(req.body); // Manually parse the body
  } catch (error) {
    console.error("Error parsing body:", error);
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }

  const { email, otp } = body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  const storedOtp = otps[email];

  if (!storedOtp) {
    return res.status(400).json({ error: 'OTP not found for this email' });
  }

  // Check if OTP is expired
  if (Date.now() > storedOtp.expiration) {
    return res.status(400).json({ error: 'OTP Expired' });
  }

  // Verify the OTP
  if (storedOtp.otp === otp) {
    return res.status(200).json({ message: 'OTP Verified' });
  } else {
    return res.status(400).json({ error: 'Invalid OTP' });
  }
};