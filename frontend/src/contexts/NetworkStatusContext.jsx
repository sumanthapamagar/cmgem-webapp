import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const NetworkStatusContext = createContext();

export const useNetworkStatus = () => {
    const context = useContext(NetworkStatusContext);
    if (!context) {
        throw new Error('useNetworkStatus must be used within a NetworkStatusProvider');
    }
    return context;
};

export const NetworkStatusProvider = ({ children }) => {
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

        const handleStorageChange = (e) => {
            if (e.key === 'manual_offline_mode') {
                setIsManualOffline(e.newValue === 'true');
            }
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('storage', handleStorageChange);
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

    return (
        <NetworkStatusContext.Provider value={networkStatus}>
            {children}
        </NetworkStatusContext.Provider>
    );
};

// Legacy exports for backward compatibility
export const useOnline = () => useNetworkStatus();
export const useOfflineMode = () => useNetworkStatus();
