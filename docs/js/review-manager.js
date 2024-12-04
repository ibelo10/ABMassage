class ReviewManager {
    constructor() {
        this.reviews = JSON.parse(localStorage.getItem('reviews')) || [];
        this.feedbackRequests = JSON.parse(localStorage.getItem('feedbackRequests')) || [];
    }

    // Add a new review
    addReview(reviewData) {
        const review = {
            id: Date.now().toString(),
            userId: reviewData.userId,
            userName: reviewData.userName,
            bookingId: reviewData.bookingId,
            therapistId: reviewData.therapistId,
            rating: reviewData.rating, // 1-5 stars
            serviceRating: reviewData.serviceRating,
            facilityRating: reviewData.facilityRating,
            comment: reviewData.comment,
            createdAt: new Date().toISOString(),
            status: 'pending', // pending, approved, rejected
            isVerifiedCustomer: true,
            therapistResponse: null
        };

        this.reviews.push(review);
        localStorage.setItem('reviews', JSON.stringify(this.reviews));

        // Send notification to admin
        this.notifyAdmin(review);

        return review;
    }

    // Send feedback request after appointment
    sendFeedbackRequest(booking) {
        const feedbackRequest = {
            id: Date.now().toString(),
            bookingId: booking.id,
            userId: booking.userId,
            sentAt: new Date().toISOString(),
            status: 'sent',
            remindersSent: 0
        };

        this.feedbackRequests.push(feedbackRequest);
        localStorage.setItem('feedbackRequests', JSON.stringify(this.feedbackRequests));

        // Send email request
        this.sendFeedbackEmail(booking);

        return feedbackRequest;
    }

    // Get reviews for a specific service or therapist
    getReviews(filters = {}) {
        return this.reviews
            .filter(review => {
                if (filters.therapistId && review.therapistId !== filters.therapistId) return false;
                if (filters.minRating && review.rating < filters.minRating) return false;
                if (filters.status && review.status !== filters.status) return false;
                return true;
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Calculate average ratings
    calculateAverageRatings(therapistId = null) {
        const relevantReviews = this.reviews.filter(review => 
            review.status === 'approved' &&
            (!therapistId || review.therapistId === therapistId)
        );

        if (relevantReviews.length === 0) return null;

        return {
            overall: this.calculateAverage(relevantReviews.map(r => r.rating)),
            service: this.calculateAverage(relevantReviews.map(r => r.serviceRating)),
            facility: this.calculateAverage(relevantReviews.map(r => r.facilityRating)),
            totalReviews: relevantReviews.length
        };
    }

    // Helper function to calculate average
    calculateAverage(numbers) {
        return numbers.reduce((a, b) => a + b, 0) / numbers.length;
    }

    // Add therapist response to review
    addTherapistResponse(reviewId, response) {
        const review = this.reviews.find(r => r.id === reviewId);
        if (!review) throw new Error('Review not found');

        review.therapistResponse = {
            content: response,
            createdAt: new Date().toISOString()
        };

        localStorage.setItem('reviews', JSON.stringify(this.reviews));
        return review;
    }

    // Send reminder for feedback
    async sendFeedbackReminder(feedbackRequestId) {
        const request = this.feedbackRequests.find(r => r.id === feedbackRequestId);
        if (!request || request.status !== 'sent') return;

        request.remindersSent++;
        localStorage.setItem('feedbackRequests', JSON.stringify(this.feedbackRequests));

        // Send reminder email (simulated)
        console.log('Sending feedback reminder email');
    }

    // Simulate sending feedback request email
    async sendFeedbackEmail(booking) {
        const emailContent = `
            Dear ${booking.userName},

            Thank you for choosing AB Massage & Spa. We hope you enjoyed your recent massage session.
            Please take a moment to share your experience with us by clicking the link below:

            [Feedback Form Link]

            Your feedback helps us improve our services!

            Best regards,
            AB Massage & Spa Team
        `;

        console.log('Sending feedback request email:', emailContent);
    }

    // Notify admin of new review
    async notifyAdmin(review) {
        const adminNotification = {
            type: 'new_review',
            review: review,
            createdAt: new Date().toISOString()
        };

        // Store admin notification
        const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications')) || [];
        adminNotifications.push(adminNotification);
        localStorage.setItem('adminNotifications', JSON.stringify(adminNotifications));
    }

    // Generate review statistics
    generateReviewStats() {
        const approvedReviews = this.reviews.filter(r => r.status === 'approved');
        
        return {
            totalReviews: approvedReviews.length,
            averageRating: this.calculateAverage(approvedReviews.map(r => r.rating)),
            ratingDistribution: {
                5: approvedReviews.filter(r => r.rating === 5).length,
                4: approvedReviews.filter(r => r.rating === 4).length,
                3: approvedReviews.filter(r => r.rating === 3).length,
                2: approvedReviews.filter(r => r.rating === 2).length,
                1: approvedReviews.filter(r => r.rating === 1).length
            },
            recentReviews: approvedReviews
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
        };
    }
}

export const reviewManager = new ReviewManager();