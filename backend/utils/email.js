const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendOrderConfirmationEmail = async (order, user) => {
  const mailOptions = {
    from: '"Kosmico Wellness" <noreply@kosmicowellness.com>',
    to: user.email,
    subject: `Order Confirmation - ${order.orderNumber}`,
    html: `
      <h1>Thank you for your order, ${order.shippingAddress.fullName}!</h1>
      <p>Your order <strong>${order.orderNumber}</strong> has been received and is currently ${order.orderStatus}.</p>
      <h2>Order Summary</h2>
      <ul>
        ${order.items.map(item => `<li>${item.name} x ${item.quantity} - $${(item.priceSnapshot * item.quantity).toFixed(2)}</li>`).join('')}
      </ul>
      <p><strong>Total: $${order.total.toFixed(2)}</strong></p>
      <p>We'll notify you when your order ships!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent for ${order.orderNumber}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = {
  sendOrderConfirmationEmail,
};
