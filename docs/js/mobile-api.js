class MobileAPIInterface {
    constructor() {
        this.apiEndpoint = '/api/mobile';
        this.version = 'v1';
        this.offlineData = JSON.parse(localStorage.getItem('offlineData')) || {};
    }

    // Offline data management
    async syncOfflineData() {
        const offlineActions = this.offlineData.actions || [];
        const successfulSync = [];

        for (const action of offlineActions) {
            try {
                switch (action.type) {
                    case 'booking':
                        await this.processOfflineBooking(action.data);
                        break;
                    case 'cancellation':
                        await this.processOfflineCancellation(action.data);
                        break;
                    case 'modification':
                        await this.processOfflineModification(action.data);
                        break;
                }
                successfulSync.push(action.id);
            } catch (error) {
                console.error(`Failed to sync action ${action.id}:`, error);
            }
        }

        // Remove synced actions
        this.offlineData.actions = offlineActions.filter(
            action => !successfulSync.includes(action.id)
        );
        this.saveOfflineData();

        return {
            syncedCount: successfulSync.length,
            remainingCount: this.offlineData.actions.length
        };
    }

    // Store action for offline processing
    storeOfflineAction(action) {
        if (!this.offlineData.actions) {
            this.offlineData.actions = [];
        }

        this.offlineData.actions.push({
            ...action,
            id: Date.now().toString(),
            timestamp: new Date().toISOString()
        });

        this.saveOfflineData();
    }

    // Location-based services
    async getNearbyTherapists(coordinates) {
        const { latitude, longitude } = coordinates;
        
        // Simulate API call to get nearby therapists
        return this.simulateAPICall('getNearbyTherapists', {
            therapists: [
                {
                    id: 'john',
                    name: 'John Smith',
                    distance: '0.5 miles',
                    specialties: ['Swedish', 'Deep Tissue'],
                    availability: ['2024-12-04 10:00', '2024-12-04 14:00']
                },
                {
                    id: 'sarah',
                    name: 'Sarah Johnson',
                    distance: '1.2 miles',
                    specialties: ['Hot Stone', 'Aromatherapy'],
                    availability: ['2024-12-05 11:00', '2024-12-05 15:00']
                }
            ]
        });
    }

    // Cache management
    async updateLocalCache(dataType) {
        const cacheData = await this.fetchCacheData(dataType);
        localStorage.setItem(`cache_${dataType}`, JSON.stringify({
            data: cacheData,
            timestamp: new Date().toISOString()
        }));
        return cacheData;
    }

    getCachedData(dataType) {
        const cache = localStorage.getItem(`cache_${dataType}`);
        if (!cache) return null;

        const { data, timestamp } = JSON.parse(cache);
        const cacheAge = Date.now() - new Date(timestamp).getTime();
        
        // Cache expires after 1 hour
        if (cacheAge > 3600000) {
            localStorage.removeItem(`cache_${dataType}`);
            return null;
        }

        return data;
    }

    // API endpoints
    async getMobileBookings(userId) {
        const cachedBookings = this.getCachedData('bookings');
        if (cachedBookings) return cachedBookings;

        const bookings = await this.simulateAPICall('getMobileBookings', {
            userId,
            limit: 10,
            includeDetails: true
        });

        await this.updateLocalCache('bookings');
        return bookings;
    }

    async updateDeviceToken(userId, deviceToken) {
        return this.simulateAPICall('updateDeviceToken', {
            userId,
            deviceToken,
            platform: this.getPlatform()
        });
    }

    // Helper methods
    getPlatform() {
        const userAgent = navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
        if (/android/.test(userAgent)) return 'android';
        return 'web';
    }

    async simulateAPICall(endpoint, data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`API call to ${endpoint}:`, data);
                resolve(data);
            }, 1000);
        });
    }

    saveOfflineData() {
        localStorage.setItem('offlineData', JSON.stringify(this.offlineData));
    }
}

export const mobileAPI = new MobileAPIInterface();