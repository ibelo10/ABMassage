class WaitlistManager {
    constructor() {
        this.waitlist = JSON.parse(localStorage.getItem('waitlist')) || [];
    }

    // Add customer to waitlist
    addToWaitlist(request) {
        const waitlistEntry = {
            id: Date.now().toString(),
            userId: request.userId,
            userName: request.userName,
            userEmail: request.userEmail,
            userPhone: request.userPhone,
            service: request.service,
            preferredDates: request.preferredDates, // Array of preferred dates
            preferredTimes: request.preferredTimes, // Array of preferred time slots
            status: 'active',
            createdAt: new Date().toISOString(),
            notes: request.notes || '',
            notificationPreference: request.notificationPreference || ['email', 'sms']
        };

        this.waitlist.push(waitlistEntry);
        localStorage.setItem('waitlist', JSON.stringify(this.waitlist));
        
        // Trigger immediate check for available slots
        this.checkAvailability(waitlistEntry);
        
        return waitlistEntry;
    }

    // Check availability for waitlisted requests
    checkAvailability(waitlistEntry) {
        const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        const availableSlots = [];

        waitlistEntry.preferredDates.forEach(date => {
            waitlistEntry.preferredTimes.forEach(time => {
                const isSlotTaken = bookings.some(booking => 
                    booking.date === date && 
                    booking.time === time && 
                    booking.status !== 'cancelled'
                );

                if (!isSlotTaken) {
                    availableSlots.push({ date, time });
                }
            });
        });

        if (availableSlots.length > 0) {
            this.notifyCustomer(waitlistEntry, availableSlots);
        }

        return availableSlots;
    }

    // Notify customer of availability
    async notifyCustomer(waitlistEntry, availableSlots) {
        const notification = {
            userId: waitlistEntry.userId,
            slots: availableSlots,
            validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
            created: new Date().toISOString()
        };

        // Store notification
        const notifications = JSON.parse(localStorage.getItem('waitlistNotifications')) || [];
        notifications.push(notification);
        localStorage.setItem('waitlistNotifications', JSON.stringify(notifications));

        // Send email notification
        if (waitlistEntry.notificationPreference.includes('email')) {
            await this.sendEmailNotification(waitlistEntry, availableSlots);
        }

        // Send SMS notification
        if (waitlistEntry.notificationPreference.includes('sms')) {
            await this.sendSMSNotification(waitlistEntry, availableSlots);
        }
    }

    // Remove from waitlist
    removeFromWaitlist(entryId) {
        this.waitlist = this.waitlist.filter(entry => entry.id !== entryId);
        localStorage.setItem('waitlist', JSON.stringify(this.waitlist));
    }

    // Get user's waitlist entries
    getUserWaitlistEntries(userId) {
        return this.waitlist.filter(entry => 
            entry.userId === userId && 
            entry.status === 'active'
        );
    }

    // Send email notification (simulated)
    async sendEmailNotification(waitlistEntry, availableSlots) {
        const emailContent = `
            Dear ${waitlistEntry.userName},
            
            Good news! Slots are now available for your requested massage service:
            
            ${availableSlots.map(slot => 
                `- ${new Date(slot.date).toLocaleDateString()} at ${slot.time}`
            ).join('\n')}
            
            Please book your preferred slot within the next 24 hours to secure your appointment.
            
            Best regards,
            AB Massage & Spa Team
        `;

        console.log('Sending email notification:', emailContent);
        return new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Send SMS notification (simulated)
    async sendSMSNotification(waitlistEntry, availableSlots) {
        const smsContent = `AB Massage & Spa: Slots available for your waitlisted massage! Book within 24hrs. Check email for details.`;
        
        console.log('Sending SMS notification:', smsContent);
        return new Promise(resolve => setTimeout(resolve, 1000));
    }
}

export const waitlistManager = new WaitlistManager();