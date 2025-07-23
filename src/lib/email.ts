import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    })
    return true
  } catch (error) {
    console.error('Email sending failed:', error)
    return false
  }
}

export async function sendEnrollmentConfirmation(userEmail: string, trainingTitle: string) {
  const html = `
    <h2>Training Enrollment Confirmed</h2>
    <p>You have been successfully enrolled in: <strong>${trainingTitle}</strong></p>
    <p>Please check your dashboard for more details.</p>
  `
  return sendEmail(userEmail, 'Training Enrollment Confirmed', html)
}

export async function sendWaitlistUpdate(userEmail: string, trainingTitle: string, enrolled: boolean) {
  const html = enrolled 
    ? `
      <h2>Great News! You're enrolled!</h2>
      <p>A seat has opened up for: <strong>${trainingTitle}</strong></p>
      <p>You have been automatically enrolled. Check your dashboard for details.</p>
    `
    : `
      <h2>Added to Waitlist</h2>
      <p>You have been added to the waitlist for: <strong>${trainingTitle}</strong></p>
      <p>We'll notify you if a seat becomes available.</p>
    `
  
  return sendEmail(userEmail, enrolled ? 'You\'re Enrolled!' : 'Added to Waitlist', html)
}

export async function sendFeedbackReminder(userEmail: string, trainingTitle: string, feedbackUrl: string) {
  const html = `
    <h2>Please Share Your Feedback</h2>
    <p>Thank you for attending: <strong>${trainingTitle}</strong></p>
    <p>Your feedback is valuable to us. Please take a moment to share your experience.</p>
    <a href="${feedbackUrl}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Submit Feedback</a>
  `
  return sendEmail(userEmail, 'Please Share Your Feedback', html)
}

export async function sendCertificateNotification(userEmail: string, trainingTitle: string, certificateUrl: string) {
  const html = `
    <h2>Your Certificate is Ready!</h2>
    <p>Congratulations! Your certificate for: <strong>${trainingTitle}</strong> is now available for download.</p>
    <a href="${certificateUrl}" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download Certificate</a>
  `
  return sendEmail(userEmail, 'Certificate Ready for Download', html)
}