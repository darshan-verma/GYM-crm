// Notification utility for email and SMS
// This is a basic implementation. For production, integrate with services like:
// - Resend (https://resend.com) for emails
// - Twilio for SMS
// - WhatsApp Business API for WhatsApp

interface EmailNotification {
  to: string
  subject: string
  html: string
  text?: string
}

interface SMSNotification {
  to: string
  message: string
}

// Email notification function
export async function sendEmail(data: EmailNotification): Promise<boolean> {
  try {
    // TODO: Integrate with email service (Resend, SendGrid, etc.)
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY)
    // await resend.emails.send({
    //   from: 'Pro Bodyline <noreply@probodyline.com>',
    //   to: data.to,
    //   subject: data.subject,
    //   html: data.html
    // })
    
    console.log('Email would be sent to:', data.to)
    console.log('Subject:', data.subject)
    console.log('Content:', data.html)
    
    return true
  } catch (error) {
    console.error('Send email error:', error)
    return false
  }
}

// SMS notification function
export async function sendSMS(data: SMSNotification): Promise<boolean> {
  try {
    // TODO: Integrate with SMS service (Twilio, etc.)
    // Example with Twilio:
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    // await client.messages.create({
    //   body: data.message,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: data.to
    // })
    
    console.log('SMS would be sent to:', data.to)
    console.log('Message:', data.message)
    
    return true
  } catch (error) {
    console.error('Send SMS error:', error)
    return false
  }
}

// Email templates
export const emailTemplates = {
  membershipExpiry: (memberName: string, planName: string, expiryDate: string) => ({
    subject: 'Membership Expiring Soon - Pro Bodyline Fitness',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .highlight { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Pro Bodyline Fitness</h1>
            <p>Your Fitness Journey Partner</p>
          </div>
          <div class="content">
            <h2>Hi ${memberName},</h2>
            <p>We hope you're enjoying your fitness journey with us!</p>
            
            <div class="highlight">
              <strong>⏰ Membership Expiry Reminder</strong><br>
              Your <strong>${planName}</strong> membership is expiring on <strong>${expiryDate}</strong>.
            </div>
            
            <p>To continue enjoying uninterrupted access to our facilities and services, please renew your membership soon.</p>
            
            <p><strong>Why Renew?</strong></p>
            <ul>
              <li>Continue your fitness progress without interruption</li>
              <li>Maintain access to all equipment and facilities</li>
              <li>Keep working with your dedicated trainer</li>
              <li>Stay part of our fitness community</li>
            </ul>
            
            <center>
              <a href="https://probodyline.com/renew" class="button">Renew Now</a>
            </center>
            
            <p>If you have any questions or need assistance, feel free to contact us at <a href="mailto:info@probodyline.com">info@probodyline.com</a> or call us at +91 9876543210.</p>
            
            <p>Keep pushing your limits!</p>
            <p><strong>Team Pro Bodyline Fitness</strong></p>
          </div>
          <div class="footer">
            <p>Pro Bodyline Fitness | 123 Fitness Street, Gym City, GC 12345</p>
            <p>Email: info@probodyline.com | Phone: +91 9876543210</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hi ${memberName},\n\nYour ${planName} membership is expiring on ${expiryDate}. Please renew soon to continue your fitness journey with us.\n\nContact us: info@probodyline.com | +91 9876543210\n\nTeam Pro Bodyline Fitness`
  }),

  paymentReceipt: (memberName: string, amount: string, invoiceNumber: string, paymentDate: string) => ({
    subject: 'Payment Receipt - Pro Bodyline Fitness',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .receipt-box { background: white; border: 2px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .amount { font-size: 32px; color: #10b981; font-weight: bold; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Payment Successful</h1>
            <p>Thank you for your payment!</p>
          </div>
          <div class="content">
            <h2>Hi ${memberName},</h2>
            <p>We have successfully received your payment. Here are the details:</p>
            
            <div class="receipt-box">
              <table width="100%" cellpadding="8">
                <tr>
                  <td><strong>Invoice Number:</strong></td>
                  <td align="right">${invoiceNumber}</td>
                </tr>
                <tr>
                  <td><strong>Payment Date:</strong></td>
                  <td align="right">${paymentDate}</td>
                </tr>
                <tr>
                  <td colspan="2"><hr></td>
                </tr>
              </table>
              
              <div class="amount">₹${amount}</div>
              <p style="text-align: center; color: #10b981;">Payment Confirmed</p>
            </div>
            
            <p>A detailed invoice has been generated and is available in your member portal. You can download it anytime for your records.</p>
            
            <p>Thank you for being part of our fitness family! We're excited to support you on your fitness journey.</p>
            
            <p>If you have any questions about this payment, please don't hesitate to contact us.</p>
            
            <p><strong>Team Pro Bodyline Fitness</strong></p>
          </div>
          <div class="footer">
            <p>Pro Bodyline Fitness | 123 Fitness Street, Gym City, GC 12345</p>
            <p>Email: info@probodyline.com | Phone: +91 9876543210</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hi ${memberName},\n\nPayment Successful!\n\nInvoice: ${invoiceNumber}\nAmount: ₹${amount}\nDate: ${paymentDate}\n\nThank you for your payment!\n\nTeam Pro Bodyline Fitness`
  }),

  welcomeMember: (memberName: string, membershipNumber: string) => ({
    subject: 'Welcome to Pro Bodyline Fitness! 💪',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .member-id { background: white; border: 2px dashed #2563eb; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .tips { background: white; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Pro Bodyline Fitness!</h1>
            <p>Your Fitness Journey Starts Now</p>
          </div>
          <div class="content">
            <h2>Hi ${memberName},</h2>
            <p>Congratulations and welcome to the Pro Bodyline Fitness family! We're thrilled to have you join us on your fitness journey.</p>
            
            <div class="member-id">
              <p style="margin: 0; color: #666;">Your Membership Number</p>
              <h2 style="margin: 10px 0; color: #2563eb; font-size: 28px;">${membershipNumber}</h2>
              <p style="margin: 0; font-size: 12px; color: #666;">Keep this number handy for check-ins</p>
            </div>
            
            <h3>Getting Started:</h3>
            <div class="tips">
              <p><strong>1. Complete Your Profile</strong><br>
              Add your fitness goals, medical information, and preferences.</p>
              
              <p><strong>2. Meet Your Trainer</strong><br>
              Schedule an introductory session with your assigned trainer.</p>
              
              <p><strong>3. Explore Our Facilities</strong><br>
              Familiarize yourself with our equipment and amenities.</p>
              
              <p><strong>4. Join Group Classes</strong><br>
              Check our schedule for yoga, HIIT, spinning, and more!</p>
            </div>
            
            <h3>What's Included in Your Membership:</h3>
            <ul>
              <li>Access to all gym equipment and facilities</li>
              <li>Personal training sessions</li>
              <li>Customized workout and diet plans</li>
              <li>Progress tracking and analytics</li>
              <li>Locker facilities</li>
              <li>Group fitness classes</li>
            </ul>
            
            <h3>Gym Timings:</h3>
            <p>
              <strong>Monday - Saturday:</strong> 5:00 AM - 11:00 PM<br>
              <strong>Sunday:</strong> 6:00 AM - 9:00 PM
            </p>
            
            <h3>Need Help?</h3>
            <p>Our team is always here to support you:</p>
            <ul>
              <li>📧 Email: info@probodyline.com</li>
              <li>📞 Phone: +91 9876543210</li>
              <li>📍 Address: 123 Fitness Street, Gym City, GC 12345</li>
            </ul>
            
            <p>Remember, every expert was once a beginner. Stay consistent, stay motivated, and we'll help you achieve your goals!</p>
            
            <p><strong>Let's get stronger together! 💪</strong></p>
            
            <p><strong>Team Pro Bodyline Fitness</strong></p>
          </div>
          <div class="footer">
            <p>Pro Bodyline Fitness | 123 Fitness Street, Gym City, GC 12345</p>
            <p>Email: info@probodyline.com | Phone: +91 9876543210</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Welcome to Pro Bodyline Fitness!\n\nHi ${memberName},\n\nYour membership number: ${membershipNumber}\n\nWe're excited to have you join our fitness family! Check your email for your welcome guide with all the details to get started.\n\nContact us: info@probodyline.com | +91 9876543210\n\nLet's get stronger together!\n\nTeam Pro Bodyline Fitness`
  })
}

// SMS templates
export const smsTemplates = {
  membershipExpiry: (memberName: string, expiryDate: string) =>
    `Hi ${memberName}, your membership expires on ${expiryDate}. Renew now to continue your fitness journey! Call +91 9876543210 or visit Pro Bodyline Fitness.`,

  paymentReceipt: (memberName: string, amount: string, invoiceNumber: string) =>
    `Hi ${memberName}, payment of ₹${amount} received successfully. Invoice: ${invoiceNumber}. Thank you! - Pro Bodyline Fitness`,

  welcomeMember: (memberName: string, membershipNumber: string) =>
    `Welcome to Pro Bodyline Fitness, ${memberName}! Your membership no: ${membershipNumber}. We're excited to support your fitness journey! 💪`
}

// Helper function to send membership expiry notification
export async function sendMembershipExpiryNotification(
  memberEmail: string,
  memberPhone: string,
  memberName: string,
  planName: string,
  expiryDate: string
) {
  const emailTemplate = emailTemplates.membershipExpiry(memberName, planName, expiryDate)
  const smsTemplate = smsTemplates.membershipExpiry(memberName, expiryDate)

  const results = await Promise.allSettled([
    sendEmail({
      to: memberEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    }),
    sendSMS({
      to: memberPhone,
      message: smsTemplate
    })
  ])

  return results
}

// Helper function to send payment receipt notification
export async function sendPaymentReceiptNotification(
  memberEmail: string,
  memberPhone: string,
  memberName: string,
  amount: string,
  invoiceNumber: string,
  paymentDate: string
) {
  const emailTemplate = emailTemplates.paymentReceipt(memberName, amount, invoiceNumber, paymentDate)
  const smsTemplate = smsTemplates.paymentReceipt(memberName, amount, invoiceNumber)

  const results = await Promise.allSettled([
    sendEmail({
      to: memberEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    }),
    sendSMS({
      to: memberPhone,
      message: smsTemplate
    })
  ])

  return results
}

// Helper function to send welcome notification
export async function sendWelcomeNotification(
  memberEmail: string,
  memberPhone: string,
  memberName: string,
  membershipNumber: string
) {
  const emailTemplate = emailTemplates.welcomeMember(memberName, membershipNumber)
  const smsTemplate = smsTemplates.welcomeMember(memberName, membershipNumber)

  const results = await Promise.allSettled([
    sendEmail({
      to: memberEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    }),
    sendSMS({
      to: memberPhone,
      message: smsTemplate
    })
  ])

  return results
}
