class BookingModificationManager {
    constructor() {
        this.bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    }

    // Modify existing booking
    modifyBooking(bookingId, modifications) {
        const bookingIndex = this.bookings.findIndex(b => b.id === bookingId);
        
        if (bookingIndex === -1) {
            throw new Error('Booking not found');
        }

        // Check if new time slot is available
        if (modifications.date && modifications.time) {
            if (this.isTimeSlotTaken(modifications.date, modifications.time, bookingId)) {
                throw new Error('This time slot is already booked');
            }
        }

        // Update booking
        this.bookings[bookingIndex] = {
            ...this.bookings[bookingIndex],
            ...modifications,
            modifiedAt: new Date().toISOString(),
            modificationHistory: [
                ...(this.bookings[bookingIndex].modificationHistory || []),
                {
                    previousDetails: { ...this.bookings[bookingIndex] },
                    modifiedAt: new Date().toISOString()
                }
            ]
        };

        localStorage.setItem('bookings', JSON.stringify(this.bookings));
        return this.bookings[bookingIndex];
    }

    // Check if time slot is taken
    isTimeSlotTaken(date, time, excludeBookingId = null) {
        return this.bookings.some(booking => 
            booking.date === date && 
            booking.time === time && 
            booking.status !== 'cancelled' &&
            booking.id !== excludeBookingId
        );
    }

    // Create recurring booking
    createRecurringBooking(bookingDetails, recurrencePattern) {
        const recurringBookings = [];
        const startDate = new Date(bookingDetails.date);

        // Generate dates based on recurrence pattern
        const dates = this.generateRecurringDates(startDate, recurrencePattern);

        // Create bookings for each date
        for (const date of dates) {
            // Skip if time slot is taken
            if (this.isTimeSlotTaken(date.toISOString().split('T')[0], bookingDetails.time)) {
                continue;
            }

            const booking = {
                ...bookingDetails,
                date: date.toISOString().split('T')[0],
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                createdAt: new Date().toISOString(),
                isRecurring: true,
                recurrenceGroupId: Date.now().toString(),
                recurrencePattern
            };

            this.bookings.push(booking);
            recurringBookings.push(booking);
        }

        localStorage.setItem('bookings', JSON.stringify(this.bookings));
        return recurringBookings;
    }

    // Generate recurring dates
    generateRecurringDates(startDate, pattern) {
        const dates = [];
        let currentDate = new Date(startDate);

        for (let i = 0; i < pattern.occurrences; i++) {
            dates.push(new Date(currentDate));

            switch (pattern.frequency) {
                case 'weekly':
                    currentDate.setDate(currentDate.getDate() + 7);
                    break;
                case 'biweekly':
                    currentDate.setDate(currentDate.getDate() + 14);
                    break;
                case 'monthly':
                    currentDate.setMonth(currentDate.getMonth() + 1);
                    break;
            }

            // Skip weekends if specified
            while (pattern.skipWeekends && 
                   (currentDate.getDay() === 0 || currentDate.getDay() === 6)) {
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }

        return dates;
    }

    // Update recurring bookings
    updateRecurringBookings(recurrenceGroupId, modifications) {
        const affectedBookings = this.bookings.filter(
            booking => booking.recurrenceGroupId === recurrenceGroupId &&
                      booking.status !== 'cancelled'
        );

        for (const booking of affectedBookings) {
            this.modifyBooking(booking.id, modifications);
        }
    }
}

// Export the BookingModificationManager
export const bookingModificationManager = new BookingModificationManager();

// Example usage for recurring bookings:
/*
const recurringBookingDetails = {
    service: 'swedish',
    time: '10:00',
    notes: 'Weekly massage therapy'
};

const recurrencePattern = {
    frequency: 'weekly',    // 'weekly', 'biweekly', or 'monthly'
    occurrences: 8,         // Number of appointments to schedule
    skipWeekends: true      // Whether to skip weekend dates
};

const recurringBookings = bookingModificationManager.createRecurringBooking(
    recurringBookingDetails,
    recurrencePattern
);
*/