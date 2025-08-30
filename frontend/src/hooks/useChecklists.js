import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import checklistSyncService from '../lib/checklist-sync-service';
import { useNetworkStatus } from '../contexts/NetworkStatusContext';

/**
 * Custom hook for managing checklists with offline-first approach
 * @param {Object} options - Query options
 * @param {boolean} options.enabled - Whether the query should be enabled
 * @param {boolean} options.forceSync - Force sync from server
 * @param {number} options.staleTime - How long data is considered fresh (default: 5 minutes)
 * @param {boolean} options.autoSync - Whether to automatically check for updates (default: true)
 * @returns {Object} Query result with checklists data
 */
export const useChecklists = (options = {}) => {
    const { 
        enabled = true, 
        forceSync = false, 
        staleTime = 5 * 60 * 1000, // 5 minutes
        autoSync = true 
    } = options;
    const { isOnline } = useNetworkStatus();
    const queryClient = useQueryClient();
    const lastVersionRef = useRef(null);
    const syncIntervalRef = useRef(null);

    // Auto-sync logic: check for updates periodically when online
    useEffect(() => {
        if (!autoSync || !isOnline) {
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
                syncIntervalRef.current = null;
            }
            return;
        }

        // Check for updates every 2 minutes when online
        syncIntervalRef.current = setInterval(async () => {
            try {
                const currentData = queryClient.getQueryData(['checklists', 'normal']);
                if (currentData?.version && currentData.version !== lastVersionRef.current) {
                    // Version changed, invalidate to trigger refetch
                    await queryClient.invalidateQueries({ queryKey: ['checklists'] });
                }
            } catch (error) {
                console.warn('Auto-sync check failed:', error);
            }
        }, 2 * 60 * 1000); // 2 minutes

        return () => {
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
                syncIntervalRef.current = null;
            }
        };
    }, [isOnline, autoSync, queryClient]);

    const query = useQuery({
        queryKey: ['checklists', forceSync ? 'force-sync' : 'normal'],
        queryFn: async () => {
            const result = await checklistSyncService.getChecklists(forceSync);
            
            // Update version reference for auto-sync
            if (result?.version) {
                lastVersionRef.current = result.version;
            }
            
            return result;
        },
        enabled,
        staleTime,
        gcTime: 30 * 60 * 1000, // 30 minutes
        refetchOnWindowFocus: false,
        refetchOnReconnect: isOnline, // Only refetch on reconnect if online
        retry: (failureCount, error) => {
            // Don't retry if it's a network error and we're offline
            if (!isOnline && error?.message?.includes('network')) {
                return false;
            }
            // Don't retry if we have cached data and it's a server error
            if (error?.response?.status >= 500) {
                return failureCount < 1; // Only retry once for server errors
            }
            return failureCount < 2;
        },
        // Provide fallback data from offline storage
        placeholderData: (previousData) => {
            if (previousData) return previousData;
            
            // Try to get cached data synchronously
            return checklistSyncService.getLastSyncData().catch(() => ({
                checklists: [],
                version: null,
                isFromCache: true
            }));
        },
        // Network mode: prefer cached data when offline
        networkMode: 'offlineFirst'
    });

    // Manual sync function
    const syncNow = async () => {
        try {
            await queryClient.invalidateQueries({ queryKey: ['checklists'] });
            return true;
        } catch (error) {
            console.error('Manual sync failed:', error);
            return false;
        }
    };

    return {
        ...query,
        syncNow,
        isFromCache: query.data?.isFromCache ?? true,
        lastSyncTime: query.data?.lastSyncTime
    };
};

/**
 * Hook to initialize checklist sync service
 * Should be called once when the app starts
 */
export const useInitializeChecklists = () => {
    const { isOnline } = useNetworkStatus();

    return useQuery({
        queryKey: ['checklists', 'initialize'],
        queryFn: async () => {
            await checklistSyncService.initialize();
            return true;
        },
        enabled: isOnline, // Only initialize when online
        staleTime: Infinity, // Never refetch
        gcTime: Infinity, // Keep in cache forever
        retry: false
    });
};

/**
 * Hook to get checklist sync status
 */
export const useChecklistSyncStatus = () => {
    return useQuery({
        queryKey: ['checklists', 'sync-status'],
        queryFn: async () => {
            return await checklistSyncService.getSyncStatus();
        },
        staleTime: 30 * 1000, // 30 seconds
        refetchInterval: 60 * 1000, // Refetch every minute
        refetchOnWindowFocus: false
    });
};
