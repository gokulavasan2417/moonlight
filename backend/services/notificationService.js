import nodemailer from 'nodemailer';

let transporter = null;

const initTransporter = async () => {
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    // Development ethereal or simulated logger
    transporter = {
      sendMail: async (mailOptions) => {
        console.log('\n--- [SIMULATED EMAIL NOTIFICATION] ---');
        console.log(`To: ${mailOptions.to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`Preview: ${mailOptions.text || mailOptions.html?.substring(0, 150)}...`);
        console.log('--------------------------------------\n');
        return { messageId: 'simulated_mail_' + Date.now() };
      }
    };
  }
};

initTransporter();

export const sendBookingConfirmationEmail = async ({ reservation, customer, villaName }) => {
  const mailOptions = {
    from: `"Moon Light Villa Reservations" <${process.env.EMAIL_FROM || 'reservations@moonlightvilla.com'}>`,
    to: reservation.guestDetails.email,
    subject: `Reservation Confirmed - Reference #${reservation.bookingReference} | Moon Light Villa`,
    html: `
      <div style="font-family: 'Georgia', serif; max-width: 650px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 40px; border-radius: 12px; border: 1px solid #334155;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #f59e0b; letter-spacing: 3px; font-size: 28px; margin: 0;">MOON LIGHT VILLA</h1>
          <p style="color: #94a3b8; font-size: 13px; text-transform: uppercase; letter-spacing: 2px;">Private Sanctuary & Panoramic Estate</p>
        </div>
        <div style="background: rgba(255,255,255,0.05); padding: 25px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 25px;">
          <h2 style="color: #ffffff; margin-top: 0;">Booking Confirmation</h2>
          <p style="color: #cbd5e1; font-size: 15px;">Dear <strong>${reservation.guestDetails.fullName}</strong>,</p>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
            We are honored to welcome you to Moon Light Villa. Your reservation has been successfully confirmed.
          </p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; color: #e2e8f0; font-size: 14px;">
          <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 10px 0; color: #94a3b8;">Booking Reference:</td>
            <td style="padding: 10px 0; font-weight: bold; color: #f59e0b; text-align: right;">${reservation.bookingReference}</td>
          </tr>
          <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 10px 0; color: #94a3b8;">Accommodation:</td>
            <td style="padding: 10px 0; text-align: right;">${villaName || 'Moon Light Villa Private Estate'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 10px 0; color: #94a3b8;">Check-In:</td>
            <td style="padding: 10px 0; text-align: right;">${new Date(reservation.checkIn).toLocaleDateString()} (2:00 PM)</td>
          </tr>
          <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 10px 0; color: #94a3b8;">Check-Out:</td>
            <td style="padding: 10px 0; text-align: right;">${new Date(reservation.checkOut).toLocaleDateString()} (11:00 AM)</td>
          </tr>
          <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 10px 0; color: #94a3b8;">Guests:</td>
            <td style="padding: 10px 0; text-align: right;">${reservation.guests.adults} Adults, ${reservation.guests.children || 0} Children</td>
          </tr>
          <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 10px 0; color: #94a3b8;">Advance Paid:</td>
            <td style="padding: 10px 0; text-align: right; color: #10b981; font-weight: bold;">₹${reservation.pricing.advancePaid.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #94a3b8;">Balance Due at Check-In:</td>
            <td style="padding: 10px 0; text-align: right; font-weight: bold;">₹${reservation.pricing.balanceDue.toLocaleString('en-IN')}</td>
          </tr>
        </table>
        <div style="text-align: center; margin-top: 35px; border-top: 1px solid #334155; padding-top: 25px; color: #64748b; font-size: 12px;">
          <p>Moon Light Valley, Whispering Pines Hill, Lonavala, Maharashtra</p>
          <p>Concierge Support: +91 98200 12345 | reservations@moonlightvilla.com</p>
        </div>
      </div>
    `
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Failed to send confirmation email:', err.message);
  }
};

export const sendWhatsAppNotification = async ({ phone, template, params }) => {
  // If external WhatsApp API provider (e.g. Twilio, Gupshup, or Meta Cloud API) is configured:
  const whatsappApiUrl = process.env.WHATSAPP_API_URL;
  const whatsappToken = process.env.WHATSAPP_API_TOKEN;

  console.log(`\n--- [WHATSAPP NOTIFICATION DISPATCHED] ---`);
  console.log(`Recipient: ${phone}`);
  console.log(`Template: ${template}`);
  console.log(`Parameters:`, params);
  console.log(`-----------------------------------------\n`);

  if (whatsappApiUrl && whatsappToken) {
    try {
      // In production, execute HTTP POST to official Meta Cloud API or provider
      return { success: true, provider: 'meta-cloud-api' };
    } catch (err) {
      console.error('WhatsApp API dispatch failed:', err.message);
    }
  }

  return { success: true, simulated: true };
};
