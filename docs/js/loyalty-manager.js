class LoyaltyManager {
    constructor() {
        this.members = JSON.parse(localStorage.getItem('loyaltyMembers')) || [];
        this.rewards = {
            welcome: {
                id: 'welcome',
                name: 'Welcome Bonus',
                points: 500,
                description: 'Welcome bonus for new members'
            },
            booking: {
                id: 'booking',
                points: 100,
                description: 'Points per booking'
            },
            referral: {
                id: 'referral',
                points: 250,
                description: 'Points for referring a new customer'
            },
            review: {
                id: 'review',
                points: 50,
                description: 'Points for leaving a review'
            }
        };
        
        this.tiers = {
            bronze: {
                name: 'Bronze',
                minPoints: 0,
                benefits: ['Earn 1 point per $1 spent'],
                multiplier: 1
            },
            silver: {
                name: 'Silver',
                minPoints: 1000,
                benefits: ['Earn 1.5 points per $1 spent', '10% off services'],
                multiplier: 1.5
            },
            gold: {
                name: 'Gold',
                minPoints: 5000,
                benefits: ['Earn 2 points per $1 spent', '15% off services', 'Priority booking'],
                multiplier: 2
            },
            platinum: {
                name: 'Platinum',
                minPoints: 10000,
                benefits: ['Earn 3 points per $1 spent', '20% off services', 'Priority booking', 'Free upgrades'],
                multiplier: 3
            }
        };
    }

    // Initialize new member
    initializeMember(userId) {
        const member = {
            userId,
            points: 0,
            tier: 'bronze',
            joinDate: new Date().toISOString(),
            history: [],
            referrals: [],
            rewards: [],
            pointsExpiry: this.calculatePointsExpiry()
        };

        // Add welcome bonus
        this.addPoints(member, this.rewards.welcome.points, 'welcome');
        
        this.members.push(member);
        this.saveMembers();
        return member;
    }

    // Calculate points expiry (1 year from now)
    calculatePointsExpiry() {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        return date.toISOString();
    }

    // Add points to member
    addPoints(member, points, type, reference = null) {
        member.points += points;
        member.history.push({
            type,
            points,
            date: new Date().toISOString(),
            reference
        });

        // Update tier if necessary
        this.updateTier(member);
        this.saveMembers();
        
        // Notify member of points earned
        this.notifyPointsEarned(member, points, type);
    }

    // Update member tier
    updateTier(member) {
        const tiers = Object.entries(this.tiers)
            .sort((a, b) => b[1].minPoints - a[1].minPoints);

        for (const [tier, details] of tiers) {
            if (member.points >= details.minPoints) {
                if (member.tier !== tier) {
                    member.tier = tier;
                    this.notifyTierUpgrade(member, tier);
                }
                break;
            }
        }
    }

    // Process booking points
    processBooking(userId, bookingAmount) {
        const member = this.getMember(userId);
        if (!member) return;

        const tierMultiplier = this.tiers[member.tier].multiplier;
        const points = Math.floor(bookingAmount * tierMultiplier);
        
        this.addPoints(member, points, 'booking');
    }

    // Process referral
    processReferral(referrerId, newUserId) {
        const referrer = this.getMember(referrerId);
        if (!referrer) return;

        referrer.referrals.push({
            referredUser: newUserId,
            date: new Date().toISOString(),
            status: 'completed'
        });

        this.addPoints(referrer, this.rewards.referral.points, 'referral');
    }

    // Get available rewards
    getAvailableRewards(userId) {
        const member = this.getMember(userId);
        if (!member) return [];

        const availableRewards = [];
        
        // Add tier-specific rewards
        const tierDetails = this.tiers[member.tier];
        tierDetails.benefits.forEach(benefit => {
            availableRewards.push({
                type: 'tier_benefit',
                description: benefit,
                tier: member.tier
            });
        });

        // Add points-based rewards
        if (member.points >= 1000) {
            availableRewards.push({
                type: 'discount',
                description: '$10 off next booking',
                pointsCost: 1000
            });
        }
        
        if (member.points >= 2000) {
            availableRewards.push({
                type: 'service',
                description: 'Free 15-minute upgrade',
                pointsCost: 2000
            });
        }

        return availableRewards;
    }

    // Redeem reward
    redeemReward(userId, rewardId) {
        const member = this.getMember(userId);
        if (!member) throw new Error('Member not found');

        const reward = this.getAvailableRewards(userId)
            .find(r => r.type === rewardId);
        
        if (!reward) throw new Error('Reward not available');
        if (member.points < reward.pointsCost) throw new Error('Insufficient points');

        member.points -= reward.pointsCost;
        member.rewards.push({
            reward: rewardId,
            redeemedAt: new Date().toISOString(),
            pointsCost: reward.pointsCost
        });

        this.saveMembers();
        return reward;
    }

    // Helper methods
    getMember(userId) {
        return this.members.find(m => m.userId === userId);
    }

    saveMembers() {
        localStorage.setItem('loyaltyMembers', JSON.stringify(this.members));
    }

    // Notification methods (simulated)
    notifyPointsEarned(member, points, type) {
        const message = `Congratulations! You've earned ${points} points from ${type}`;
        console.log('Points notification:', message);
    }

    notifyTierUpgrade(member, newTier) {
        const message = `Congratulations! You've been upgraded to ${newTier} tier`;
        console.log('Tier upgrade notification:', message);
    }

    // Get member statistics
    getMemberStats(userId) {
        const member = this.getMember(userId);
        if (!member) return null;

        return {
            currentPoints: member.points,
            tier: member.tier,
            tierProgress: this.calculateTierProgress(member),
            pointsHistory: member.history,
            referralCount: member.referrals.length,
            rewardsRedeemed: member.rewards.length
        };
    }

    // Calculate progress to next tier
    calculateTierProgress(member) {
        const currentTier = this.tiers[member.tier];
        const tiers = Object.entries(this.tiers)
            .sort((a, b) => a[1].minPoints - b[1].minPoints);
        
        const nextTierEntry = tiers.find(([_, details]) => 
            details.minPoints > member.points
        );

        if (!nextTierEntry) return 100; // Already at highest tier

        const [nextTierName, nextTier] = nextTierEntry;
        const pointsNeeded = nextTier.minPoints - currentTier.minPoints;
        const pointsEarned = member.points - currentTier.minPoints;

        return Math.floor((pointsEarned / pointsNeeded) * 100);
    }
}

export const loyaltyManager = new LoyaltyManager();