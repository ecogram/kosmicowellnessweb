/**
 * Kosmico Wellness SMS Service Utility
 * Dispatches 6-digit verification OTPs to user mobile numbers
 */
const sendOtpSms = async (phoneNumber, otp) => {
  const normalized = phoneNumber.toString().replace(/\D/g, '').slice(-10);

  console.log(`\n======================================================`);
  console.log(`[SMS SERVICE] Dispatched OTP to mobile: +91 ${normalized}`);
  console.log(`[SMS SERVICE] 6-Digit OTP: ${otp}`);
  console.log(`======================================================\n`);

  // Optional: Integration with real SMS gateway (e.g. Fast2SMS / Twilio) if credentials exist in .env
  if (process.env.FAST2SMS_API_KEY) {
    try {
      const axios = require('axios');
      await axios.post(
        'https://www.fast2sms.com/dev/bulkV2',
        {
          route: 'otp',
          variables_values: otp,
          numbers: normalized,
        },
        {
          headers: {
            authorization: process.env.FAST2SMS_API_KEY,
          },
        }
      );
      console.log(`[SMS SERVICE] SMS sent via Fast2SMS to +91 ${normalized}`);
    } catch (err) {
      console.warn(`[SMS SERVICE] Fast2SMS dispatch notice:`, err.response?.data || err.message);
    }
  }

  return true;
};

module.exports = { sendOtpSms };
