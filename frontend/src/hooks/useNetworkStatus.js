import { useState, useEffect } from 'react';

export const useNetworkStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

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


    // Basic network status
    const networkStatus = {
        isOnline,
        isOffline: !isOnline
    };



    return networkStatus;
};

export const useOnline = () => useNetworkStatus();

export const useOfflineMode = () => useNetworkStatus();
