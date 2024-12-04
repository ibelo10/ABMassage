// mobile/services/biometric-auth.js
class BiometricAuthService {
    constructor() {
      this.biometricType = null;
    }
  
    async checkBiometricAvailability() {
      try {
        const available = await window.BiometricAuth.isAvailable();
        this.biometricType = available ? await window.BiometricAuth.getType() : null;
        return {
          isAvailable: !!available,
          type: this.biometricType // 'fingerprint', 'face', or null
        };
      } catch (error) {
        console.error('Biometric check failed:', error);
        return { isAvailable: false, type: null };
      }
    }
  
    async authenticate() {
      if (!this.biometricType) {
        throw new Error('Biometric authentication not available');
      }
  
      try {
        const result = await window.BiometricAuth.authenticate({
          title: 'Login to AB Massage Spa',
          subtitle: 'Confirm your identity',
          description: `Use your ${this.biometricType} to login`
        });
        return result;
      } catch (error) {
        console.error('Authentication failed:', error);
        throw error;
      }
    }
  }