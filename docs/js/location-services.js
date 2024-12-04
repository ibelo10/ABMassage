class LocationServicesManager {
    constructor() {
        this.currentLocation = null;
        this.locationWatchId = null;
        this.geofences = new Map();
    }

    // Initialize location tracking
    async initializeLocationServices() {
        if (!navigator.geolocation) {
            throw new Error('Geolocation is not supported by this device');
        }

        try {
            const position = await this.getCurrentPosition();
            this.currentLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                timestamp: position.timestamp
            };

            // Start watching location
            this.startLocationWatch();

            return this.currentLocation;
        } catch (error) {
            console.error('Error initializing location services:', error);
            throw error;
        }
    }

    // Get current position
    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            });
        });
    }

    // Start watching location
    startLocationWatch() {
        if (this.locationWatchId) return;

        this.locationWatchId = navigator.geolocation.watchPosition(
            (position) => {
                this.handleLocationUpdate(position);
            },
            (error) => {
                console.error('Location watch error:', error);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    }

    // Stop watching location
    stopLocationWatch() {
        if (this.locationWatchId) {
            navigator.geolocation.clearWatch(this.locationWatchId);
            this.locationWatchId = null;
        }
    }

    // Handle location update
    handleLocationUpdate(position) {
        const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: position.timestamp
        };

        // Check if significant movement occurred
        if (this.isSignificantMovement(this.currentLocation, newLocation)) {
            this.currentLocation = newLocation;
            this.checkGeofences(newLocation);
        }
    }

    // Add geofence
    addGeofence(id, center, radius, callback) {
        this.geofences.set(id, {
            center,
            radius,
            callback
        });
    }

    // Remove geofence
    removeGeofence(id) {
        this.geofences.delete(id);
    }

    // Check geofences
    checkGeofences(location) {
        this.geofences.forEach((geofence, id) => {
            const distance = this.calculateDistance(
                location,
                geofence.center
            );

            if (distance <= geofence.radius) {
                geofence.callback({
                    geofenceId: id,
                    location,
                    distance
                });
            }
        });
    }

    // Calculate distance between two points
    calculateDistance(point1, point2) {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = this.toRadians(point1.latitude);
        const φ2 = this.toRadians(point2.latitude);
        const Δφ = this.toRadians(point2.latitude - point1.latitude);
        const Δλ = this.toRadians(point2.longitude - point1.longitude);

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c;
    }

    // Check if movement is significant (more than 10 meters)
    isSignificantMovement(loc1, loc2) {
        if (!loc1 || !loc2) return true;
        return this.calculateDistance(loc1, loc2) > 10;
    }

    // Convert degrees to radians
    toRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    // Get nearby services
    async getNearbyServices(radius = 5000) {
        if (!this.currentLocation) {
            await this.initializeLocationServices();
        }

        // Simulate fetching nearby services
        return {
            spas: [
                {
                    id: 'main-location',
                    name: 'AB Massage & Spa - Main',
                    distance: 1200,
                    address: '123 Main St',
                    services: ['Swedish', 'Deep Tissue', 'Hot Stone'],
                    availability: true
                }
            ],
            therapists: [
                {
                    id: 'mobile-1',
                    name: 'John (Mobile)',
                    distance: 800,
                    services: ['Swedish', 'Deep Tissue'],
                    availability: true
                }
            ]
        };
    }
}

export const locationServices = new LocationServicesManager();