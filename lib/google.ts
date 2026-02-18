import { google } from 'googleapis'

const calendar = google.calendar('v3')

function getAuthClient() {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_CALENDAR_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_CALENDAR_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/calendar'],
    })

    return auth
}

export async function createCalendarEvent(
    candidateEmail: string,
    candidateName: string,
    jobTitle: string,
    scheduledAt: Date,
    internalMeetingLink?: string
): Promise<{ eventId: string; meetingLink: string }> {
    const auth = await getAuthClient()

    const description = `Interview for the position of ${jobTitle} with ${candidateName}` +
        (internalMeetingLink ? `\n\nJoin Meeting Here: ${internalMeetingLink}` : '')

    const event = {
        summary: `Interview: ${jobTitle} - ${candidateName}`,
        description,
        location: internalMeetingLink || undefined,
        start: {
            dateTime: scheduledAt.toISOString(),
            timeZone: 'UTC',
        },
        end: {
            dateTime: new Date(scheduledAt.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour
            timeZone: 'UTC',
        },
        attendees: [{ email: candidateEmail }],
        conferenceData: {
            createRequest: {
                requestId: `interview-${Date.now()}`,
                conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
        },
    }

    const response = await calendar.events.insert({
        auth: auth as any,
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        conferenceDataVersion: 1,
        requestBody: event,
    })

    if (!response.data.id) {
        throw new Error('Failed to create calendar event')
    }

    return {
        eventId: response.data.id,
        // Prefer internal link, fallback to Google Meet
        meetingLink: internalMeetingLink || response.data.hangoutLink || '',
    }
}
