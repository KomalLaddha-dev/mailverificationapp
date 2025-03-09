const sendgrid = require('@sendgrid/mail');
const crypto = require('crypto');

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
const OTP_EXPIRATION_TIME = 5 * 60 * 1000; // OTP expiration time: 5 minutes
const otps = {}; // For demo purposes, use a database in production

module.exports = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const otp = crypto.randomBytes(3).toString('hex');
  const expiration = Date.now() + OTP_EXPIRATION_TIME;
  otps[email] = { otp, expiration };

  const message = {
    to: email,
    from: 'laddhakp@rknec.edu',
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`,
    html: `<strong>Your OTP code is: ${otp}</strong>`,
  };

  try {
    await sendgrid.send(message);
    return res.status(200).json({ message: 'OTP Sent' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
};
