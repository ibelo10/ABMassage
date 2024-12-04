// mobile/services/deep-linking.js
class DeepLinkManager {
    constructor() {
      this.routes = new Map();
      this.initializeDeepLinking();
    }
  
    initializeDeepLinking() {
      // Configure deep link routes
      this.routes.set('booking', this.handleBookingDeepLink);
      this.routes.set('gift-card', this.handleGiftCardDeepLink);
      this.routes.set('loyalty', this.handleLoyaltyDeepLink);
  
      // Listen for deep link events
      window.universalLinks.subscribe(null, (event) => {
        this.handleDeepLink(event.url);
      });
    }
  
    async handleDeepLink(url) {
      try {
        const parsedUrl = new URL(url);
        const path = parsedUrl.pathname.split('/')[1];
        const handler = this.routes.get(path);
        
        if (handler) {
          await handler(parsedUrl);
        }
      } catch (error) {
        console.error('Deep link handling failed:', error);
      }
    }
  
    handleBookingDeepLink(url) {
      const params = new URLSearchParams(url.search);
      const bookingId = params.get('id');
      // Navigate to booking details
      window.router.navigate(`/booking/${bookingId}`);
    }
  }