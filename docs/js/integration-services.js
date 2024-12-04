class IntegrationServices {
    constructor() {
        this.calendarProviders = {
            google: this.googleCalendarAdd,
            outlook: this.outlookCalendarAdd,
            ical: this.iCalendarDownload
        };
    }

    // Google Calendar Integration
    async googleCalendarAdd(booking, user) {
        const event = {
            'summary': `Massage Appointment - AB Massage & Spa`,
            'description': `Your massage appointment at AB Massage & Spa\nService: ${booking.service}`,
            'start': {
                'dateTime': `${booking.date}T${booking.time}:00`,
                'timeZone': 'America/New_York'
            },
            'end': {
                'dateTime': this.calculateEndTime(booking.date, booking.time),
                'timeZone': 'America/New_York'
            },
            'reminders': {
                'useDefault': false,
                'overrides': [
                    {'method': 'email', 'minutes': 24 * 60},
                    {'method': 'popup', 'minutes': 60}
                ]
            }
        };

        // In a real application, this would use Google Calendar API
        console.log('Adding to Google Calendar:', event);
        return true;
    }

    // Outlook Calendar Integration
    async outlookCalendarAdd(booking, user) {
        const event = {
            subject: 'Massage Appointment - AB Massage & Spa',
            start: {
                dateTime: `${booking.date}T${booking.time}:00`,
                timeZone: 'America/New_York'
            },
            end: {
                dateTime: this.calculateEndTime(booking.date, booking.time),
                timeZone: 'America/New_York'
            },
            body: {
                contentType: 'HTML',
                content: `Your massage appointment at AB Massage & Spa<br>Service: ${booking.service}`
            }
        };

        // In a real application, this would use Microsoft Graph API
        console.log('Adding to Outlook Calendar:', event);
        return true;
    }

    // Generate iCalendar file
    iCalendarDownload(booking) {
        const startTime = new Date(`${booking.date}T${booking.time}`);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

        const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${this.formatICalDateTime(startTime)}
DTEND:${this.formatICalDateTime(endTime)}
SUMMARY:Massage Appointment - AB Massage & Spa
DESCRIPTION:Service: ${booking.service}
LOCATION:AB Massage & Spa
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT24H
ACTION:DISPLAY
DESCRIPTION:Reminder
END:VALARM
END:VEVENT
END:VCALENDAR`;

        return icalContent;
    }

    // Helper function to calculate end time
    calculateEndTime(date, time) {
        const startTime = new Date(`${date}T${time}:00`);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Add 1 hour
        return endTime.toISOString().slice(0, 16);
    }

    // Helper function to format datetime for iCal
    formatICalDateTime(date) {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }

    // Download iCal file
    downloadICalFile(content, filename) {
        const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Export the IntegrationServices
export const integrationServices = new IntegrationServices();