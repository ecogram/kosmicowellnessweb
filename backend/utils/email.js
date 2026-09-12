const nodemailer = require('nodemailer');

const getTransporter = () => {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT, 10) || 587;
  const isGmail = host.includes('gmail') || process.env.EMAIL_SERVICE === 'gmail';

  if (isGmail) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

const getFromAddress = () => {
  if (process.env.EMAIL_FROM) return process.env.EMAIL_FROM;
  if (process.env.EMAIL_USER) return `"Kosmico Wellness" <${process.env.EMAIL_USER}>`;
  return '"Kosmico Wellness" <noreply@kosmicowellness.com>';
};

const sendOrderConfirmationEmail = async (order, user) => {
  const mailOptions = {
    from: getFromAddress(),
    to: user.email,
    subject: `Order Confirmation - ${order.orderNumber}`,
    html: `
      <h1>Thank you for your order, ${order.shippingAddress?.fullName || user?.name || 'Valued Customer'}!</h1>
      <p>Your order <strong>${order.orderNumber}</strong> has been received and is currently ${order.orderStatus}.</p>
      <h2>Order Summary</h2>
      <ul>
        ${(order.items || []).map(item => `<li>${item.name || 'Kosmico Product'} x ${item.quantity || 1} - ₹${((item.priceSnapshot || item.price || 0) * (item.quantity || 1)).toFixed(2)}</li>`).join('')}
      </ul>
      <p><strong>Total: ₹${(Number(order.total) || 0).toFixed(2)}</strong></p>
      <p>We'll notify you when your order ships!</p>
    `,
  };

  try {
    const hasCredentials = process.env.EMAIL_USER && (process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS);
    if (hasCredentials) {
      const transporter = getTransporter();
      await transporter.sendMail(mailOptions);
      console.log(`[ORDER] Order confirmation email sent for ${order.orderNumber}`);
    }
  } catch (error) {
    console.error('Error sending order email:', error);
  }
};

const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: getFromAddress(),
    to: email,
    subject: `${otp} is your Kosmico Wellness verification code`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #064e3b; margin: 0; font-size: 24px; font-family: serif;">🌿 Kosmico Wellness</h2>
          <p style="color: #666; font-size: 13px; margin-top: 4px;">Ancient Wisdom, Modern Living</p>
        </div>
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <p style="margin: 0 0 10px 0; color: #166534; font-size: 14px; font-weight: bold;">Your Verification Code</p>
          <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #064e3b; padding: 8px 0;">
            ${otp}
          </div>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #15803d;">Valid for 10 minutes</p>
        </div>
        <p style="color: #444; font-size: 13px; line-height: 1.5; margin-bottom: 16px;">
          Please enter this 6-digit code on the screen to securely access your Kosmico Wellness account. If you did not request this code, please ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #888; font-size: 11px; text-align: center; margin: 0;">
          &copy; ${new Date().getFullYear()} Kosmico Wellness Pvt. Ltd. All rights reserved.
        </p>
      </div>
    `,
  };

  try {
    const hasCredentials = process.env.EMAIL_USER && (process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS);
    if (hasCredentials) {
      const transporter = getTransporter();
      await transporter.sendMail(mailOptions);
      console.log(`[AUTH] Real OTP email successfully sent to ${email}`);
    } else {
      console.log(`[AUTH-DEV] Email credentials not configured in .env. Mock OTP for ${email}: [ ${otp} ]`);
    }
  } catch (error) {
    console.error(`[AUTH] Failed to send email to ${email}:`, error?.message || error);
    console.log(`[AUTH-FALLBACK] Your OTP for ${email} is: [ ${otp} ]`);
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendOtpEmail,
};
