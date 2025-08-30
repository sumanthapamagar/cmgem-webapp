import { getChecklistsWithVersion } from './api';
import { 
    getChecklistsFromOfflineStorage, 
    saveChecklistsToOfflineStorage 
} from './offline-api';
import { useNetworkStatus } from '../contexts/NetworkStatusContext';

class ChecklistSyncService {
    constructor() {
        this.isInitialized = false;
        this.lastSyncTime = null;
        this.syncInProgress = false;
    }

    /**
     * Initialize the checklist sync service
     * This should be called once when the app starts
     */
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            // Check if we have offline checklists
            const offlineData = await getChecklistsFromOfflineStorage();
            
            if (offlineData.checklists.length === 0) {
                // No offline data, try to fetch from server if online
                await this.syncChecklists();
            }
            
            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize checklist sync service:', error);
        }
    }

    /**
     * Get checklists with smart offline-first logic
     * @param {boolean} forceSync - Force sync from server even if offline data exists
     * @returns {Promise<{checklists: Array, version: string, isFromCache: boolean}>}
     */
    async getChecklists(forceSync = false) {
        try {
            // Get offline data first
            const offlineData = await getChecklistsFromOfflineStorage();
            
            // If we have offline data and not forcing sync, check if we need updates
            if (!forceSync && offlineData.checklists.length > 0) {
                // Check if we're online and if updates are available
                if (navigator.onLine) {
                    const needsUpdate = await this.needsUpdate(offlineData.version);
                    if (!needsUpdate) {
                        // No updates needed, return cached data
                        return {
                            checklists: offlineData.checklists,
                            version: offlineData.version,
                            isFromCache: true,
                            lastSyncTime: this.lastSyncTime
                        };
                    }
                    // Updates available, continue to sync
                } else {
                    // Offline, return cached data
                    return {
                        checklists: offlineData.checklists,
                        version: offlineData.version,
                        isFromCache: true,
                        lastSyncTime: this.lastSyncTime
                    };
                }
            }

            // Try to sync from server
            const serverData = await this.syncChecklists();
            if (serverData) {
                return {
                    checklists: serverData.checklists,
                    version: serverData.version,
                    isFromCache: false,
                    lastSyncTime: this.lastSyncTime
                };
            }

            // Fallback to offline data if server sync fails
            return {
                checklists: offlineData.checklists,
                version: offlineData.version,
                isFromCache: true,
                lastSyncTime: this.lastSyncTime
            };

        } catch (error) {
            console.error('Error getting checklists:', error);
            
            // Return offline data as fallback
            const offlineData = await getChecklistsFromOfflineStorage();
            return {
                checklists: offlineData.checklists,
                version: offlineData.version,
                isFromCache: true,
                lastSyncTime: this.lastSyncTime
            };
        }
    }

    /**
     * Sync checklists from server
     * @returns {Promise<{checklists: Array, version: string} | null>}
     */
    async syncChecklists() {
        if (this.syncInProgress) {
            // Wait for existing sync to complete
            return new Promise((resolve) => {
                const checkSync = () => {
                    if (!this.syncInProgress) {
                        resolve(this.getLastSyncData());
                    } else {
                        setTimeout(checkSync, 100);
                    }
                };
                checkSync();
            });
        }

        this.syncInProgress = true;

        try {
            // Check if we're online (you might want to inject this or use a different method)
            const isOnline = navigator.onLine;
            if (!isOnline) {
                throw new Error('No internet connection');
            }

            // Fetch from server
            const serverData = await getChecklistsWithVersion();
            
            if (serverData && serverData.checklists) {
                // Save to offline storage
                await saveChecklistsToOfflineStorage(serverData.checklists, serverData.version);
                
                this.lastSyncTime = new Date().toISOString();
                
                return {
                    checklists: serverData.checklists,
                    version: serverData.version
                };
            }

            return null;

        } catch (error) {
            console.error('Failed to sync checklists from server:', error);
            return null;
        } finally {
            this.syncInProgress = false;
        }
    }

    /**
     * Get the last successful sync data
     */
    async getLastSyncData() {
        const offlineData = await getChecklistsFromOfflineStorage();
        return {
            checklists: offlineData.checklists,
            version: offlineData.version
        };
    }

    /**
     * Check if checklists need updating based on version
     * @param {string} currentVersion - Current version from offline storage
     * @returns {Promise<boolean>}
     */
    async needsUpdate(currentVersion) {
        try {
            if (!navigator.onLine) return false;
            
            // If we don't have a current version, we need to update
            if (!currentVersion) return true;
            
            // Make a lightweight request to check version only
            const serverData = await getChecklistsWithVersion();
            return serverData && serverData.version !== currentVersion;
        } catch (error) {
            console.error('Error checking if checklists need update:', error);
            // If we can't check, assume we need to update to be safe
            return true;
        }
    }

    /**
     * Get sync status information
     */
    async getSyncStatus() {
        const offlineData = await getChecklistsFromOfflineStorage();
        return {
            hasOfflineData: offlineData.checklists.length > 0,
            lastUpdated: offlineData.last_updated,
            version: offlineData.version,
            lastSyncTime: this.lastSyncTime,
            isInitialized: this.isInitialized
        };
    }

    /**
     * Clear all checklist data (useful for testing or reset)
     */
    async clearData() {
        try {
            await clearChecklistsFromOfflineStorage();
            this.lastSyncTime = null;
            this.isInitialized = false;
        } catch (error) {
            console.error('Error clearing checklist data:', error);
        }
    }
}

// Create singleton instance
const checklistSyncService = new ChecklistSyncService();

export default checklistSyncService;
