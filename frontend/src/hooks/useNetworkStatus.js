import { useState, useEffect, useCallback } from 'react';

export const useNetworkStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isActuallyOnline, setIsActuallyOnline] = useState(navigator.onLine);

    // Function to test actual internet connectivity
    const testConnectivity = useCallback(async () => {
        try {
            // Try to fetch a small resource from a reliable endpoint
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
            
            const response = await fetch('/favicon.ico', {
                method: 'HEAD',
                cache: 'no-cache',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            return response.ok;
        } catch (error) {
            console.log('Connectivity test failed:', error.message);
            return false;
        }
    }, []);

    // Enhanced connectivity check
    const checkConnectivity = useCallback(async () => {
        if (!navigator.onLine) {
            setIsActuallyOnline(false);
            return;
        }

        const isConnected = await testConnectivity();
        setIsActuallyOnline(isConnected);
    }, [testConnectivity]);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            // Test actual connectivity when browser reports online
            checkConnectivity();
        };

        const handleOffline = () => {
            setIsOnline(false);
            setIsActuallyOnline(false);
        };

        // Initial connectivity check
        checkConnectivity();

        // Set up periodic connectivity checks when online
        const intervalId = setInterval(() => {
            if (navigator.onLine) {
                checkConnectivity();
            }
        }, 30000); // Check every 30 seconds

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(intervalId);
        };
    }, [checkConnectivity]);

    // Network status with enhanced detection
    const networkStatus = {
        isOnline: isOnline && isActuallyOnline, // Only true if both browser and actual connectivity are good
        isOffline: !isOnline || !isActuallyOnline,
        browserOnline: isOnline, // Browser's reported status
        actuallyOnline: isActuallyOnline // Actual connectivity status
    };

    return networkStatus;
};

export const useOnline = () => useNetworkStatus();

export const useOfflineMode = () => useNetworkStatus();
