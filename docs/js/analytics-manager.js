class AnalyticsManager {
    constructor() {
        this.bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        this.memberships = JSON.parse(localStorage.getItem('memberships')) || [];
        this.giftCards = JSON.parse(localStorage.getItem('giftCards')) || [];
        this.reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    }

    // Get revenue analytics
    getRevenueAnalytics(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Calculate revenue from different sources
        const revenue = {
            bookings: this.calculateBookingRevenue(start, end),
            memberships: this.calculateMembershipRevenue(start, end),
            giftCards: this.calculateGiftCardRevenue(start, end),
            total: 0
        };

        revenue.total = revenue.bookings + revenue.memberships + revenue.giftCards;

        // Calculate monthly trends
        const monthlyRevenue = this.calculateMonthlyRevenue(start, end);

        return {
            summary: revenue,
            monthlyTrends: monthlyRevenue,
            averageTransactionValue: revenue.total / this.countTransactions(start, end)
        };
    }

    // Calculate revenue from bookings
    calculateBookingRevenue(start, end) {
        return this.bookings
            .filter(booking => {
                const bookingDate = new Date(booking.date);
                return bookingDate >= start && bookingDate <= end;
            })
            .reduce((total, booking) => total + this.getServicePrice(booking.service), 0);
    }

    // Get service price (simulated)
    getServicePrice(service) {
        const prices = {
            'swedish': 80,
            'deep': 95,
            'hot': 120,
            'aromatherapy': 90
        };
        return prices[service] || 0;
    }

    // Get service popularity analytics
    getServiceAnalytics() {
        const serviceStats = {};

        this.bookings.forEach(booking => {
            if (!serviceStats[booking.service]) {
                serviceStats[booking.service] = {
                    count: 0,
                    revenue: 0,
                    ratings: []
                };
            }
            serviceStats[booking.service].count++;
            serviceStats[booking.service].revenue += this.getServicePrice(booking.service);

            // Add ratings if available
            const review = this.reviews.find(r => r.bookingId === booking.id);
            if (review) {
                serviceStats[booking.service].ratings.push(review.rating);
            }
        });

        // Calculate averages and percentages
        const totalBookings = this.bookings.length;
        return Object.entries(serviceStats).map(([service, stats]) => ({
            service,
            bookings: stats.count,
            percentageOfTotal: (stats.count / totalBookings) * 100,
            revenue: stats.revenue,
            averageRating: stats.ratings.length > 0 
                ? stats.ratings.reduce((a, b) => a + b, 0) / stats.ratings.length 
                : null
        }));
    }

    // Get customer retention analytics
    getRetentionAnalytics() {
        const customers = {};
        
        // Group bookings by customer
        this.bookings.forEach(booking => {
            if (!customers[booking.userId]) {
                customers[booking.userId] = {
                    bookings: [],
                    firstBooking: booking.date,
                    lastBooking: booking.date
                };
            }
            customers[booking.userId].bookings.push(booking);
            if (booking.date < customers[booking.userId].firstBooking) {
                customers[booking.userId].firstBooking = booking.date;
            }
            if (booking.date > customers[booking.userId].lastBooking) {
                customers[booking.userId].lastBooking = booking.date;
            }
        });

        // Calculate retention metrics
        const retention = {
            totalCustomers: Object.keys(customers).length,
            repeatCustomers: Object.values(customers)
                .filter(c => c.bookings.length > 1).length,
            averageBookingsPerCustomer: this.bookings.length / Object.keys(customers).length,
            customerLifetime: this.calculateAverageCustomerLifetime(customers)
        };

        return retention;
    }

    // Calculate average customer lifetime in days
    calculateAverageCustomerLifetime(customers) {
        const lifetimes = Object.values(customers).map(customer => {
            const first = new Date(customer.firstBooking);
            const last = new Date(customer.lastBooking);
            return (last - first) / (1000 * 60 * 60 * 24); // Convert to days
        });

        return lifetimes.reduce((a, b) => a + b, 0) / lifetimes.length;
    }

    // Get booking patterns
    getBookingPatterns() {
        const patterns = {
            dayOfWeek: new Array(7).fill(0),
            timeOfDay: {
                morning: 0,    // 9-12
                afternoon: 0,  // 12-5
                evening: 0     // 5-9
            },
            seasonal: {
                spring: 0,
                summer: 0,
                fall: 0,
                winter: 0
            }
        };

        this.bookings.forEach(booking => {
            const date = new Date(booking.date);
            const time = parseInt(booking.time.split(':')[0]);

            // Day of week
            patterns.dayOfWeek[date.getDay()]++;

            // Time of day
            if (time < 12) patterns.timeOfDay.morning++;
            else if (time < 17) patterns.timeOfDay.afternoon++;
            else patterns.timeOfDay.evening++;

            // Seasonal
            const month = date.getMonth();
            if (month >= 2 && month <= 4) patterns.seasonal.spring++;
            else if (month >= 5 && month <= 7) patterns.seasonal.summer++;
            else if (month >= 8 && month <= 10) patterns.seasonal.fall++;
            else patterns.seasonal.winter++;
        });

        return patterns;
    }

    // Generate comprehensive report
    generateReport(startDate, endDate) {
        return {
            revenue: this.getRevenueAnalytics(startDate, endDate),
            services: this.getServiceAnalytics(),
            retention: this.getRetentionAnalytics(),
            patterns: this.getBookingPatterns()
        };
    }
}

export const analyticsManager = new AnalyticsManager();