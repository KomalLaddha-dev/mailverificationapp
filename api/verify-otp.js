const { Redis } = require('@upstash/redis'); // Upstash Redis client

// Upstash Redis URL and Token from Upstash Dashboard
const redis = new Redis({
  url: process.env.KV_REST_API_URL,  // Add your Upstash Redis URL here
  token: process.env.KV_REST_API_TOKEN,  // Add your Upstash Redis Token here
});

module.exports = async (req, res) => {
  try {
    // Ensure request body is present
    if (!req.body || !req.body.email || !req.body.otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const { email, otp } = req.body;

    // Validate email format (basic validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Retrieve the OTP for the provided email from Upstash Redis
    const storedOtpData = await redis.get(email);

    if (!storedOtpData) {
      console.error(`No OTP found for email: ${email}`);
      return res.status(400).json({ error: 'OTP not found for this email' });
    }

    // Parse stored OTP data
    const storedOtp = JSON.parse(storedOtpData);

    // Check if OTP has expired
    if (Date.now() > storedOtp.expiration) {
      console.error(`OTP expired for email: ${email}`);
      return res.status(400).json({ error: 'OTP Expired' });
    }

    // Verify OTP
    if (storedOtp.otp === otp) {
      // OTP is valid, delete it from Redis after verification for security purposes
      await redis.del(email);
      console.log(`OTP verified successfully for email: ${email}`);
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