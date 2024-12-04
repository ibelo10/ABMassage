// Check if user is logged in
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    document.getElementById('userName').textContent = currentUser.fullName;
    return currentUser;
}

class BookingsManager {
    constructor() {
        this.bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        this.currentUser = checkAuth();
    }

    // Get user's bookings
    getUserBookings() {
        return this.bookings.filter(booking => 
            booking.userId === this.currentUser.id
        ).sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    // Cancel booking
    cancelBooking(bookingId) {
        const bookingIndex = this.bookings.findIndex(b => b.id === bookingId);
        if (bookingIndex !== -1) {
            this.bookings[bookingIndex].status = 'cancelled';
            localStorage.setItem('bookings', JSON.stringify(this.bookings));
            return true;
        }
        return false;
    }

    // Format date and time
    formatDateTime(date, time) {
        const dateObj = new Date(date + 'T' + time);
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        }).format(dateObj);
    }

    // Get status badge class
    getStatusBadgeClass(status) {
        const statusClasses = {
            pending: 'status-pending',
            confirmed: 'status-confirmed',
            cancelled: 'status-cancelled'
        };
        return statusClasses[status] || 'status-pending';
    }

    // Render bookings
    renderBookings() {
        const bookingsList = document.getElementById('bookingsList');
        const userBookings = this.getUserBookings();

        if (userBookings.length === 0) {
            bookingsList.innerHTML = `
                <div class="no-bookings">
                    <h3>No bookings found</h3>
                    <p>You haven't made any appointments yet.</p>
                    <a href="booking.html">Book your first appointment</a>
                </div>
            `;
            return;
        }

        bookingsList.innerHTML = userBookings.map(booking => `
            <div class="booking-card" id="booking-${booking.id}">
                <div class="booking-header">
                    <h3>${booking.service}</h3>
                    <span class="status-badge ${this.getStatusBadgeClass(booking.status)}">
                        ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                </div>
                <div class="booking-details">
                    <div class="detail-item">
                        <div class="detail-label">Date & Time:</div>
                        <div>${this.formatDateTime(booking.date, booking.time)}</div>
                    </div>
                    ${booking.notes ? `
                        <div class="detail-item">
                            <div class="detail-label">Notes:</div>
                            <div>${booking.notes}</div>
                        </div>
                    ` : ''}
                </div>
                ${booking.status !== 'cancelled' ? `
                    <div class="booking-actions">
                        <button class="reschedule-btn" onclick="rescheduleBooking('${booking.id}')">
                            Reschedule
                        </button>
                        <button class="cancel-btn" onclick="cancelBooking('${booking.id}')">
                            Cancel Appointment
                        </button>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }
}

// Initialize bookings manager
const bookingsManager = new BookingsManager();

// Render bookings on page load
bookingsManager.renderBookings();

// Handle booking cancellation
window.cancelBooking = function(bookingId) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
        if (bookingsManager.cancelBooking(bookingId)) {
            alert('Appointment cancelled successfully');
            bookingsManager.renderBookings();
        } else {
            alert('Error cancelling appointment');
        }
    }
};

// Handle booking rescheduling
window.rescheduleBooking = function(bookingId) {
    // Store booking ID in localStorage
    localStorage.setItem('rescheduleBookingId', bookingId);
    // Redirect to booking page
    window.location.href = 'booking.html?reschedule=true';
};

// Handle logout
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}