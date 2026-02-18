import { Resend } from 'resend'

let resendInstance: Resend | null = null

function getResend() {
    if (!resendInstance) {
        const apiKey = process.env.RESEND_API_KEY
        if (!apiKey) {
            throw new Error('RESEND_API_KEY environment variable is not configured')
        }
        resendInstance = new Resend(apiKey)
    }
    return resendInstance
}

const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@helper.com'

export async function sendApplicationConfirmation(
    candidateEmail: string,
    candidateName: string,
    jobTitle: string
) {
    await getResend().emails.send({
        from: fromEmail,
        to: candidateEmail,
        subject: `Application Received: ${jobTitle}`,
        html: `
      <h1>Application Received</h1>
      <p>Dear ${candidateName},</p>
      <p>Thank you for applying for the position of <strong>${jobTitle}</strong>.</p>
      <p>We have received your application and will review it shortly.</p>
      <p>Best regards,<br/>HelpeR Team</p>
    `,
    })
}

export async function sendInterviewInvitation(
    candidateEmail: string,
    candidateName: string,
    jobTitle: string,
    scheduledAt: Date,
    meetingLink: string
) {
    await getResend().emails.send({
        from: fromEmail,
        to: candidateEmail,
        subject: `Interview Invitation: ${jobTitle}`,
        html: `
      <h1>Interview Invitation</h1>
      <p>Dear ${candidateName},</p>
      <p>Congratulations! You have been selected for an interview for the position of <strong>${jobTitle}</strong>.</p>
      <p><strong>Date & Time:</strong> ${scheduledAt.toLocaleString()}</p>
      <p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>
      <p>Please join the meeting at the scheduled time.</p>
      <p>Best regards,<br/>HelpeR Team</p>
    `,
    })
}

export async function sendInterviewReminder(
    candidateEmail: string,
    candidateName: string,
    jobTitle: string,
    scheduledAt: Date,
    meetingLink: string
) {
    await getResend().emails.send({
        from: fromEmail,
        to: candidateEmail,
        subject: `Interview Reminder: ${jobTitle}`,
        html: `
      <h1>Interview Reminder</h1>
      <p>Dear ${candidateName},</p>
      <p>This is a reminder for your upcoming interview for the position of <strong>${jobTitle}</strong>.</p>
      <p><strong>Date & Time:</strong> ${scheduledAt.toLocaleString()}</p>
      <p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>
      <p>We look forward to speaking with you!</p>
      <p>Best regards,<br/>HelpeR Team</p>
    `,
    })
}
