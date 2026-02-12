import { useState, useEffect } from 'react';

interface GeoLocationState {
    lat: number | null;
    lng: number | null;
    error: string | null;
    timestamp: number | null;
}

export const useGeoLocation = () => {
    const [location, setLocation] = useState<GeoLocationState>({
        lat: null,
        lng: null,
        error: null,
        timestamp: null
    });

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocation(prev => ({ ...prev, error: 'Geolocation not supported' }));
            return;
        }

        const handleSuccess = (position: GeolocationPosition) => {
            setLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                error: null,
                timestamp: position.timestamp
            });
        };

        const handleError = (error: GeolocationPositionError) => {
            setLocation(prev => ({ ...prev, error: error.message }));
        };

        const watcher = navigator.geolocation.watchPosition(handleSuccess, handleError, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        });

        return () => navigator.geolocation.clearWatch(watcher);
    }, []);

    return location;
};
