class MembershipManager {
    constructor() {
        this.packages = {
            basic: {
                name: 'Basic Package',
                sessions: 5,
                validityMonths: 6,
                price: 375, // 5 sessions at $75 each
                discount: 0.1 // 10% off regular price
            },
            premium: {
                name: 'Premium Package',
                sessions: 10,
                validityMonths: 12,
                price: 700, // 10 sessions at $70 each
                discount: 0.15 // 15% off regular price
            },
            unlimited: {
                name: 'Unlimited Monthly',
                sessions: 'unlimited',
                validityMonths: 1,
                price: 200,
                discount: 0.2 // 20% off other services
            }
        };
        
        this.memberships = JSON.parse(localStorage.getItem('memberships')) || [];
    }

    // Purchase new package
    purchasePackage(userId, packageType) {
        const packageDetails = this.packages[packageType];
        if (!packageDetails) {
            throw new Error('Invalid package type');
        }

        const membership = {
            id: Date.now().toString(),
            userId,
            packageType,
            remainingSessions: packageDetails.sessions,
            startDate: new Date().toISOString(),
            expiryDate: this.calculateExpiryDate(packageDetails.validityMonths),
            status: 'active',
            purchaseHistory: [{
                date: new Date().toISOString(),
                amount: packageDetails.price,
                type: 'purchase'
            }]
        };

        this.memberships.push(membership);
        localStorage.setItem('memberships', JSON.stringify(this.memberships));
        
        return membership;
    }

    // Calculate package expiry date
    calculateExpiryDate(validityMonths) {
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + validityMonths);
        return expiryDate.toISOString();
    }

    // Use session from package
    useSession(userId, bookingId) {
        const activeMembership = this.getActiveMembership(userId);
        
        if (!activeMembership) {
            throw new Error('No active membership found');
        }

        if (activeMembership.packageType !== 'unlimited' && 
            activeMembership.remainingSessions <= 0) {
            throw new Error('No sessions remaining in package');
        }

        if (activeMembership.packageType !== 'unlimited') {
            activeMembership.remainingSessions--;
        }

        activeMembership.purchaseHistory.push({
            date: new Date().toISOString(),
            bookingId,
            type: 'session_use'
        });

        localStorage.setItem('memberships', JSON.stringify(this.memberships));
        
        // Check if package is running low on sessions
        if (activeMembership.remainingSessions <= 2) {
            this.sendLowSessionsNotification(userId, activeMembership);
        }

        return activeMembership;
    }

    // Get active membership
    getActiveMembership(userId) {
        return this.memberships.find(membership => 
            membership.userId === userId && 
            membership.status === 'active' &&
            new Date(membership.expiryDate) > new Date()
        );
    }

    // Renew package
    renewPackage(membershipId) {
        const membership = this.memberships.find(m => m.id === membershipId);
        if (!membership) {
            throw new Error('Membership not found');
        }

        const packageDetails = this.packages[membership.packageType];
        
        // Create new membership
        const newMembership = {
            ...membership,
            id: Date.now().toString(),
            remainingSessions: packageDetails.sessions,
            startDate: new Date().toISOString(),
            expiryDate: this.calculateExpiryDate(packageDetails.validityMonths),
            purchaseHistory: [{
                date: new Date().toISOString(),
                amount: packageDetails.price,
                type: 'renewal'
            }]
        };

        this.memberships.push(newMembership);
        localStorage.setItem('memberships', JSON.stringify(this.memberships));
        
        return newMembership;
    }

    // Send low sessions notification
    async sendLowSessionsNotification(userId, membership) {
        const user = JSON.parse(localStorage.getItem('members'))
            .find(member => member.id === userId);

        const emailContent = `
            Dear ${user.fullName},
            
            Your ${this.packages[membership.packageType].name} is running low on sessions.
            Remaining sessions: ${membership.remainingSessions}
            
            Renew now to continue enjoying your benefits!
            
            Best regards,
            AB Massage & Spa Team
        `;

        console.log('Sending low sessions notification:', emailContent);
    }

    // Get package usage statistics
    getPackageStats(membershipId) {
        const membership = this.memberships.find(m => m.id === membershipId);
        if (!membership) {
            throw new Error('Membership not found');
        }

        const totalSessions = this.packages[membership.packageType].sessions;
        const usedSessions = membership.packageType !== 'unlimited' ? 
            totalSessions - membership.remainingSessions : 
            membership.purchaseHistory.filter(h => h.type === 'session_use').length;

        return {
            totalSessions,
            usedSessions,
            remainingSessions: membership.remainingSessions,
            expiryDate: membership.expiryDate,
            usageRate: totalSessions ? (usedSessions / totalSessions) * 100 : 0
        };
    }
}

export const membershipManager = new MembershipManager();