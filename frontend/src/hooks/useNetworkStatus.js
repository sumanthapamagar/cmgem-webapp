import { useState, useEffect, useCallback } from 'react';

export const useNetworkStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isManualOffline, setIsManualOffline] = useState(() => {
        // Initialize from localStorage
        return localStorage.getItem('manual_offline_mode') === 'true';
    });

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Function to toggle manual offline mode
    const toggleManualOffline = useCallback(() => {
        setIsManualOffline(prev => {
            const newValue = !prev;
            localStorage.setItem('manual_offline_mode', newValue.toString());
            return newValue;
        });
    }, []);

    // Function to set manual offline mode
    const setManualOffline = useCallback((offline) => {
        setIsManualOffline(offline);
        localStorage.setItem('manual_offline_mode', offline.toString());
    }, []);

    // Network status with manual override
    const networkStatus = {
        isOnline: !isManualOffline && isOnline, // Manual offline overrides browser status
        isOffline: isManualOffline || !isOnline,
        browserOnline: isOnline, // Browser's reported status
        isManualOffline, // Manual offline mode state
        toggleManualOffline, // Function to toggle manual offline
        setManualOffline // Function to set manual offline state
    };

    return networkStatus;
};

export const useOnline = () => useNetworkStatus();

export const useOfflineMode = () => useNetworkStatus();
