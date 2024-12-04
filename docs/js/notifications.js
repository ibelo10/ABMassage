class NotificationManager {
    constructor() {
        // Email templates
        this.emailTemplates = {
            booking: {
                subject: 'Booking Confirmation - AB Massage & Spa',
                template: this.bookingEmailTemplate
            },
            reminder: {
                subject: 'Appointment Reminder - AB Massage & Spa',
                template: this.reminderEmailTemplate
            },
            modification: {
                subject: 'Booking Modified - AB Massage & Spa',
                template: this.modificationEmailTemplate
            },
            cancellation: {
                subject: 'Booking Cancelled - AB Massage & Spa',
                template: this.cancellationEmailTemplate
            }
        };

        // SMS templates
        this.smsTemplates = {
            booking: this.bookingSMSTemplate,
            reminder: this.reminderSMSTemplate,
            modification: this.modificationSMSTemplate,
            cancellation: this.cancellationSMSTemplate
        };
    }

    // Email Templates
    bookingEmailTemplate(booking, user) {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Booking Confirmation</h2>
                <p>Dear ${user.fullName},</p>
                <p>Thank you for booking with AB Massage & Spa. Your appointment details are below:</p>
                
                <div style="background: #f8f9fa; padding: 15px; margin: 20px 0;">
                    <p><strong>Service:</strong> ${booking.service}</p>
                    <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> ${booking.time}</p>
                    <p><strong>Reference:</strong> ${booking.id}</p>
                </div>

                <p><strong>Preparation Tips:</strong></p>
                <ul>
                    <li>Please arrive 10 minutes before your appointment</li>
                    <li>Wear comfortable clothing</li>
                    <li>Avoid heavy meals before your massage</li>
                </ul>

                <p>Need to make changes? You can manage your booking at any time through our website.</p>
                
                <div style="margin-top: 20px;">
                    <p>Best regards,</p>
                    <p>AB Massage & Spa Team</p>
                </div>
            </div>
        `;
    }

    reminderEmailTemplate(booking, user) {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Appointment Reminder</h2>
                <p>Dear ${user.fullName},</p>
                <p>This is a friendly reminder of your upcoming appointment:</p>
                
                <div style="background: #f8f9fa; padding: 15px; margin: 20px 0;">
                    <p><strong>Service:</strong> ${booking.service}</p>
                    <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> ${booking.time}</p>
                </div>

                <p>Looking forward to seeing you!</p>

                <div style="margin-top: 20px;">
                    <p>Best regards,</p>
                    <p>AB Massage & Spa Team</p>
                </div>
            </div>
        `;
    }

    // SMS Templates
    bookingSMSTemplate(booking) {
        return `AB Massage & Spa: Booking confirmed for ${new Date(booking.date).toLocaleDateString()} at ${booking.time}. Ref: ${booking.id}. See you soon!`;
    }

    reminderSMSTemplate(booking) {
        return `AB Massage & Spa Reminder: Your appointment is tomorrow at ${booking.time}. Please arrive 10 minutes early. Questions? Call us.`;
    }

    // Calendar Integration
    generateCalendarEvent(booking, user) {
        const startTime = new Date(booking.date + 'T' + booking.time);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Add 1 hour

        return {
            'text/calendar': `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${startTime.toISOString().replace(/[-:.]/g, '')}
DTEND:${endTime.toISOString().replace(/[-:.]/g, '')}
SUMMARY:Massage Appointment - AB Massage & Spa
DESCRIPTION:Your massage appointment at AB Massage & Spa
LOCATION:AB Massage & Spa
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`
        };
    }

    // Notification Methods
    async sendBookingConfirmation(booking, user) {
        try {
            // Send email
            await this.simulateEmailSend(
                user.email,
                this.emailTemplates.booking.subject,
                this.emailTemplates.booking.template(booking, user)
            );

            // Send SMS
            await this.simulateSMSSend(
                user.phone,
                this.smsTemplates.booking(booking)
            );

            // Store notification in history
            this.storeNotification({
                type: 'booking',
                userId: user.id,
                bookingId: booking.id,
                sentAt: new Date().toISOString()
            });

            return true;
        } catch (error) {
            console.error('Notification error:', error);
            return false;
        }
    }

    // Simulate email sending (in real app, this would connect to an email service)
    async simulateEmailSend(to, subject, body) {
        console.log(`Sending email to ${to}`);
        console.log('Subject:', subject);
        console.log('Body:', body);
        return new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Simulate SMS sending (in real app, this would connect to an SMS service)
    async simulateSMSSend(to, message) {
        console.log(`Sending SMS to ${to}`);
        console.log('Message:', message);
        return new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Store notification history
    storeNotification(notification) {
        const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
        notifications.push(notification);
        localStorage.setItem('notifications', JSON.stringify(notifications));
    }
}

// Export the NotificationManager
export const notificationManager = new NotificationManager();