// mobile/services/notification-templates.js
class NotificationTemplateManager {
    constructor() {
      this.templates = {
        bookingReminder: {
          title: 'Upcoming Appointment',
          body: 'Your {service} appointment is tomorrow at {time}',
          data: {
            action: 'viewBooking',
            sound: 'default'
          }
        },
        specialOffer: {
          title: 'Special Offer',
          body: 'Exclusive offer: {discount}% off your next {service}',
          data: {
            action: 'viewOffer',
            sound: 'notification'
          }
        },
        loyaltyReward: {
          title: 'Reward Unlocked',
          body: 'You\'ve earned {points} points! Redeem now for a free {reward}',
          data: {
            action: 'viewRewards',
            sound: 'reward'
          }
        }
      };
    }
  
    async sendNotification(templateName, data) {
      const template = this.templates[templateName];
      if (!template) {
        throw new Error(`Template ${templateName} not found`);
      }
  
      const notification = {
        title: this.interpolate(template.title, data),
        body: this.interpolate(template.body, data),
        ...template.data
      };
  
      return await window.PushNotifications.send(notification);
    }
  
    interpolate(text, data) {
      return text.replace(/{(\w+)}/g, (match, key) => data[key] || match);
    }
  }