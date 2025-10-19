const sendEmail = require('../utils/email');

/**
 * Handle contact form submissions
 * Sends email to admin and confirmation to user
 */
const sendContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address' 
      });
    }

    // Prepare email HTML for admin
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">New Contact Form Submission</h2>
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>From:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h3 style="color: #374151;">Message:</h3>
          <p style="white-space: pre-wrap; color: #4b5563;">${message}</p>
        </div>
        <div style="margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
          <p style="font-size: 12px; color: #6b7280;">
            Reply to: ${email}
          </p>
        </div>
      </div>
    `;

    // Prepare confirmation email HTML for user
    const userHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Thank you for contacting us, ${name}!</h2>
        <p style="color: #4b5563; line-height: 1.6;">
          We've received your message and will get back to you as soon as possible.
          Our typical response time is within 24-48 hours.
        </p>
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151;">Your Message:</h3>
          <p style="white-space: pre-wrap; color: #6b7280;">${message}</p>
        </div>
        <p style="color: #4b5563; line-height: 1.6;">
          If you have any urgent concerns, please don't hesitate to reach out again.
        </p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #9ca3af;">
            This is an automated response. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    // Send both emails using your existing email service
    await Promise.all([
      // Email to admin (you)
      sendEmail({
        to: 'mahmoud.fawzy1992.2@gmail.com',
        subject: `New Contact Form Message from ${name}`,
        html: adminHtml
      }),
      // Confirmation email to user
      sendEmail({
        to: email,
        subject: 'We received your message - Memory Farm',
        html: userHtml
      })
    ]);

    // Log the contact submission
    console.log(`Contact form submitted by ${name} (${email}) at ${new Date().toISOString()}`);

    res.status(200).json({ 
      success: true, 
      message: 'Your message has been sent successfully!' 
    });

  } catch (error) {
    console.error('Error sending contact form email:', error);

    res.status(500).json({ 
      success: false, 
      message: 'Failed to send message. Please try again later.' 
    });
  }
};

module.exports = {
  sendContactMessage
};