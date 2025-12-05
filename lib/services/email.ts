// lib/services/email.ts
// Email service for sending notifications

interface EmailOptions {
  to: string
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    path?: string
    content?: Buffer
  }>
}

export async function sendEmail(options: EmailOptions) {
  // This is a placeholder for email integration
  // In production, you would integrate with:
  // - Resend (resend.com)
  // - SendGrid
  // - AWS SES
  // - Nodemailer with SMTP
  
  console.log('Email would be sent:', {
    to: options.to,
    subject: options.subject,
    hasAttachments: !!options.attachments?.length
  })

  // Simulate success
  return { success: true }
}

export async function sendPaymentReceipt(data: {
  to: string
  memberName: string
  amount: number
  invoiceNumber: string
  paymentDate: Date
  pdfPath?: string
}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; }
        .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
        .label { font-weight: 600; color: #6b7280; }
        .value { font-weight: 700; color: #111827; }
        .amount { font-size: 32px; color: #2563eb; font-weight: bold; text-align: center; margin: 20px 0; }
        .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">Pro Bodyline Fitness</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Payment Receipt</p>
        </div>
        
        <div class="content">
          <p style="font-size: 18px; margin-bottom: 20px;">Dear ${data.memberName},</p>
          
          <p>Thank you for your payment! We have successfully received your payment.</p>
          
          <div class="amount">₹${data.amount.toLocaleString()}</div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2563eb;">Payment Details</h3>
            
            <div class="detail-row">
              <span class="label">Invoice Number:</span>
              <span class="value">${data.invoiceNumber}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Payment Date:</span>
              <span class="value">${new Date(data.paymentDate).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            
            <div class="detail-row" style="border-bottom: none;">
              <span class="label">Amount Paid:</span>
              <span class="value" style="color: #10b981; font-size: 18px;">₹${data.amount.toLocaleString()}</span>
            </div>
          </div>
          
          <p>Your receipt has been attached to this email for your records.</p>
          
          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            If you have any questions about this payment, please don't hesitate to contact us.
          </p>
        </div>
        
        <div class="footer">
          <p style="margin: 0 0 10px 0;"><strong>Pro Bodyline Fitness</strong></p>
          <p style="margin: 0;">Your Journey to Fitness Starts Here</p>
          <p style="margin: 10px 0 0 0;">Email: info@probodyline.com | Phone: +91 9876543210</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: data.to,
    subject: `Payment Receipt - ${data.invoiceNumber}`,
    html
  })
}

export async function sendMembershipExpiryReminder(data: {
  to: string
  memberName: string
  planName: string
  expiryDate: Date
  daysRemaining: number
}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #fffbeb; padding: 30px; }
        .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">⚠️ Membership Expiring Soon</h1>
        </div>
        
        <div class="content">
          <p style="font-size: 18px; margin-bottom: 20px;">Dear ${data.memberName},</p>
          
          <div class="alert-box">
            <p style="margin: 0; font-weight: 600; color: #92400e;">
              Your membership "${data.planName}" is expiring in ${data.daysRemaining} ${data.daysRemaining === 1 ? 'day' : 'days'}!
            </p>
          </div>
          
          <p><strong>Expiry Date:</strong> ${new Date(data.expiryDate).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</p>
          
          <p>Don't let your fitness journey stop! Renew your membership today to continue enjoying all our facilities and services.</p>
          
          <center>
            <a href="#" class="button">Renew Now</a>
          </center>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Visit our gym or contact us to renew your membership and keep crushing your fitness goals!
          </p>
        </div>
        
        <div class="footer">
          <p style="margin: 0 0 10px 0;"><strong>Pro Bodyline Fitness</strong></p>
          <p style="margin: 0;">Building Stronger Bodies, One Member at a Time</p>
          <p style="margin: 10px 0 0 0;">Email: info@probodyline.com | Phone: +91 9876543210</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: data.to,
    subject: `⚠️ Your Membership Expires in ${data.daysRemaining} ${data.daysRemaining === 1 ? 'Day' : 'Days'}`,
    html
  })
}

export async function sendWelcomeEmail(data: {
  to: string
  memberName: string
  membershipNumber: string
  planName: string
  startDate: Date
  endDate: Date
}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f0fdf4; padding: 30px; }
        .welcome-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 32px;">🎉 Welcome to Pro Bodyline!</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px;">Your Fitness Journey Begins Now</p>
        </div>
        
        <div class="content">
          <p style="font-size: 18px; margin-bottom: 20px;">Dear ${data.memberName},</p>
          
          <p>We're thrilled to have you join the Pro Bodyline Fitness family! Your journey to a healthier, stronger you starts today.</p>
          
          <div class="welcome-box">
            <h3 style="margin-top: 0; color: #10b981;">Your Membership Details</h3>
            <p><strong>Membership Number:</strong> ${data.membershipNumber}</p>
            <p><strong>Plan:</strong> ${data.planName}</p>
            <p><strong>Valid From:</strong> ${new Date(data.startDate).toLocaleDateString('en-IN')}</p>
            <p><strong>Valid Until:</strong> ${new Date(data.endDate).toLocaleDateString('en-IN')}</p>
          </div>
          
          <h3 style="color: #059669;">What's Next?</h3>
          <ul style="color: #374151;">
            <li>Visit the gym with your membership number</li>
            <li>Meet your assigned trainer for a personalized workout plan</li>
            <li>Explore all our facilities and equipment</li>
            <li>Join our group classes and fitness programs</li>
            <li>Track your progress through our member portal</li>
          </ul>
          
          <p style="margin-top: 30px; padding: 15px; background: #d1fae5; border-radius: 6px; text-align: center; font-weight: 600; color: #065f46;">
            💪 Let's crush those fitness goals together!
          </p>
        </div>
        
        <div class="footer">
          <p style="margin: 0 0 10px 0;"><strong>Pro Bodyline Fitness</strong></p>
          <p style="margin: 0;">Building Stronger Bodies, One Member at a Time</p>
          <p style="margin: 10px 0 0 0;">Email: info@probodyline.com | Phone: +91 9876543210</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: data.to,
    subject: '🎉 Welcome to Pro Bodyline Fitness!',
    html
  })
}
