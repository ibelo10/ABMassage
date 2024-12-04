class GiftCardManager {
    constructor() {
        this.giftCards = JSON.parse(localStorage.getItem('giftCards')) || [];
        this.templates = {
            birthday: {
                name: 'Birthday Special',
                design: 'birthday',
                message: 'Happy Birthday! Enjoy a relaxing spa day!'
            },
            holiday: {
                name: 'Holiday Gift',
                design: 'holiday',
                message: 'Wishing you relaxation and wellness!'
            },
            thank_you: {
                name: 'Thank You',
                design: 'thank_you',
                message: 'Thank you! Treat yourself to a spa day.'
            }
        };
    }

    // Generate unique gift card code
    generateGiftCardCode() {
        const prefix = 'ABSPA';
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `${prefix}-${random}`;
    }

    // Create new gift card
    createGiftCard(purchaseData) {
        const giftCard = {
            id: Date.now().toString(),
            code: this.generateGiftCardCode(),
            purchaserId: purchaseData.purchaserId,
            recipientEmail: purchaseData.recipientEmail,
            recipientName: purchaseData.recipientName,
            amount: purchaseData.amount,
            balance: purchaseData.amount,
            message: purchaseData.message,
            template: purchaseData.template || 'default',
            purchaseDate: new Date().toISOString(),
            expiryDate: this.calculateExpiryDate(),
            status: 'active',
            transactions: [{
                type: 'purchase',
                amount: purchaseData.amount,
                date: new Date().toISOString()
            }]
        };

        this.giftCards.push(giftCard);
        localStorage.setItem('giftCards', JSON.stringify(this.giftCards));

        // Send gift card to recipient
        this.sendGiftCard(giftCard);

        return giftCard;
    }

    // Calculate expiry date (1 year from purchase)
    calculateExpiryDate() {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        return date.toISOString();
    }

    // Check gift card balance
    checkBalance(code) {
        const giftCard = this.findGiftCard(code);
        if (!giftCard) throw new Error('Invalid gift card code');
        
        return {
            balance: giftCard.balance,
            status: giftCard.status,
            expiryDate: giftCard.expiryDate
        };
    }

    // Apply gift card to booking
    applyToBooking(code, amount, bookingId) {
        const giftCard = this.findGiftCard(code);
        
        if (!giftCard) throw new Error('Invalid gift card code');
        if (giftCard.status !== 'active') throw new Error('Gift card is not active');
        if (new Date(giftCard.expiryDate) < new Date()) throw new Error('Gift card has expired');
        if (giftCard.balance < amount) throw new Error('Insufficient balance');

        // Process transaction
        giftCard.balance -= amount;
        giftCard.transactions.push({
            type: 'redemption',
            amount: amount,
            bookingId: bookingId,
            date: new Date().toISOString()
        });

        if (giftCard.balance === 0) {
            giftCard.status = 'used';
        }

        localStorage.setItem('giftCards', JSON.stringify(this.giftCards));
        return giftCard;
    }

    // Find gift card by code
    findGiftCard(code) {
        return this.giftCards.find(card => card.code === code);
    }

    // Send digital gift card
    async sendGiftCard(giftCard) {
        const template = this.templates[giftCard.template] || this.templates.default;
        
        const emailContent = `
            Dear ${giftCard.recipientName},

            You've received a gift card for AB Massage & Spa!

            Amount: $${giftCard.amount}
            From: ${giftCard.purchaserName}
            Message: "${giftCard.message}"

            Your gift card code is: ${giftCard.code}

            To redeem your gift card, present this code during your next booking.
            Valid until: ${new Date(giftCard.expiryDate).toLocaleDateString()}

            Book your relaxing experience today!

            Best regards,
            AB Massage & Spa Team
        `;

        console.log('Sending gift card email:', emailContent);
    }

    // Send balance reminder
    async sendBalanceReminder(giftCard) {
        if (giftCard.balance > 0 && giftCard.status === 'active') {
            const daysUntilExpiry = Math.ceil(
                (new Date(giftCard.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
            );

            if (daysUntilExpiry <= 30) {
                const reminderEmail = `
                    Dear ${giftCard.recipientName},

                    Your AB Massage & Spa gift card (${giftCard.code}) has a remaining balance of $${giftCard.balance}.
                    This gift card will expire on ${new Date(giftCard.expiryDate).toLocaleDateString()}.

                    Don't miss out on your spa experience! Book your appointment today.

                    Best regards,
                    AB Massage & Spa Team
                `;

                console.log('Sending balance reminder:', reminderEmail);
            }
        }
    }

    // Check for expiring gift cards
    checkExpiringGiftCards() {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        return this.giftCards.filter(card => 
            card.status === 'active' &&
            card.balance > 0 &&
            new Date(card.expiryDate) <= thirtyDaysFromNow
        );
    }

    // Get transaction history
    getTransactionHistory(code) {
        const giftCard = this.findGiftCard(code);
        if (!giftCard) throw new Error('Invalid gift card code');
        
        return giftCard.transactions.sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
    }
}

export const giftCardManager = new GiftCardManager();