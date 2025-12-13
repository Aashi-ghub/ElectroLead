import transporter from '../config/email.js';
import pool from '../config/database.js';

// Send email notification (synchronous - no queues)
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER || 'noreply@electrolead.com',
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

// Notify sellers about new enquiry in their city/state/national scope
export const notifySellersNewEnquiry = async (enquiry) => {
  try {
    // Get active sellers with subscriptions matching enquiry scope
    const sellersResult = await pool.query(
      `SELECT DISTINCT u.id, u.email, u.name, s.plan_type, u.city, u.state
       FROM users u
       JOIN subscriptions s ON u.id = s.user_id
       WHERE u.role = 'seller' 
         AND u.is_active = true
         AND s.status = 'active'
         AND s.end_date >= CURRENT_DATE
         AND (
           (s.plan_type = 'national') OR
           (s.plan_type = 'state' AND u.state = $1) OR
           (s.plan_type = 'local' AND u.city = $2)
         )`,
      [enquiry.state, enquiry.city]
    );

    // Send email to each matching seller (synchronous)
    for (const seller of sellersResult.rows) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Enquiry Available</h2>
          <p><strong>Title:</strong> ${enquiry.title}</p>
          <p><strong>Location:</strong> ${enquiry.city}, ${enquiry.state || 'N/A'}</p>
          ${enquiry.budget_min || enquiry.budget_max ? `<p><strong>Budget:</strong> ₹${enquiry.budget_min || 'N/A'} - ₹${enquiry.budget_max || 'N/A'}</p>` : ''}
          ${enquiry.quote_deadline ? `<p><strong>Quote Deadline:</strong> ${new Date(enquiry.quote_deadline).toLocaleDateString()}</p>` : ''}
          <p><a href="${process.env.FRONTEND_URL}/dashboard/seller/enquiries" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">View Enquiry</a></p>
        </div>
      `;

      await sendEmail(
        seller.email,
        `New Enquiry: ${enquiry.title}`,
        emailHtml
      );
    }
  } catch (error) {
    console.error('Notify sellers error:', error);
  }
};

// Notify buyer about new quotation received
export const notifyBuyerNewQuotation = async (buyerId, enquiryTitle, quotation) => {
  try {
    const buyerResult = await pool.query('SELECT email, name FROM users WHERE id = $1', [buyerId]);
    if (buyerResult.rows.length === 0) return;

    const buyer = buyerResult.rows[0];

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Quotation Received</h2>
        <p>You have received a new quotation for your enquiry: <strong>${enquiryTitle}</strong></p>
        <p><strong>Price:</strong> ₹${quotation.total_price}</p>
        ${quotation.delivery_days ? `<p><strong>Delivery:</strong> ${quotation.delivery_days} days</p>` : ''}
        ${quotation.warranty_period ? `<p><strong>Warranty:</strong> ${quotation.warranty_period}</p>` : ''}
        <p><a href="${process.env.FRONTEND_URL}/dashboard/buyer/enquiries" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">View Quotations</a></p>
      </div>
    `;

    await sendEmail(
      buyer.email,
      `New Quotation Received: ${enquiryTitle}`,
      emailHtml
    );
  } catch (error) {
    console.error('Notify buyer error:', error);
  }
};

// Notify user about KYC status change
export const notifyKycStatusChange = async (userId, status) => {
  try {
    const userResult = await pool.query('SELECT email, name FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) return;

    const user = userResult.rows[0];
    const statusText = status === 'approved' ? 'approved' : 'rejected';
    const statusColor = status === 'approved' ? '#10b981' : '#ef4444';

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>KYC Status Update</h2>
        <p>Your KYC verification has been <strong style="color: ${statusColor};">${statusText}</strong>.</p>
        ${status === 'rejected' ? '<p>Please upload the required documents again through your profile.</p>' : '<p>You can now access all features of the platform.</p>'}
        <p><a href="${process.env.FRONTEND_URL}/profile" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">View Profile</a></p>
      </div>
    `;

    await sendEmail(
      user.email,
      `KYC ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      emailHtml
    );
  } catch (error) {
    console.error('Notify KYC status error:', error);
  }
};
