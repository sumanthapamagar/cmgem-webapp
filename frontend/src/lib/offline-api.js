// Pure JavaScript offline storage implementation
class OfflineStorage {
    constructor() {
        this.dbName = 'cmgem_projects';
        this.dbVersion = 1;
        this.storeName = 'projects';
        this.db = null;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return this.db;
        
        try {
            // Try IndexedDB first
            if (window.indexedDB) {
                this.db = await this.initIndexedDB();
                this.isInitialized = true;
                console.log('IndexedDB initialized successfully for offline storage');
                return this.db;
            }
        } catch (error) {
            console.warn('IndexedDB failed, falling back to localStorage:', error);
        }

        // Fallback to localStorage
        this.db = 'localStorage';
        this.isInitialized = true;
        console.log('Using localStorage for offline storage');
        return this.db;
    }

    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: '_id' });
                    store.createIndex('offline_timestamp', 'offline_timestamp', { unique: false });
                    store.createIndex('last_synced', 'last_synced', { unique: false });
                    store.createIndex('has_local_changes', 'has_local_changes', { unique: false });
                    store.createIndex('last_local_change', 'last_local_change', { unique: false });
                    store.createIndex('last_visited_timestamp', 'last_visited_timestamp', { unique: false });
                }
            };
        });
    }

    async deleteFromLocalStorage(projectId) {
        localStorage.removeItem(`project_${projectId}`);
        const projectList = JSON.parse(localStorage.getItem('project_list') || '[]');
        localStorage.setItem('project_list', JSON.stringify(projectList.filter(id => id !== projectId)));
    }
    
    async deleteFromIndexedDB(db, projectId) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(projectId);
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteProject(projectId) {
        const db = await this.initialize();
        if (db === 'localStorage') {
            return this.deleteFromLocalStorage(projectId);
        } else {
            return this.deleteFromIndexedDB(db, projectId);
        }
    }

    async saveProject(projectData, isFromServer = false, skipLimitEnforcement = false) {
        const db = await this.initialize();
        
        let result;
        if (db === 'localStorage') {
            result = await this.saveToLocalStorage(projectData, isFromServer);
        } else {
            result = await this.saveToIndexedDB(db, projectData, isFromServer);
        }
        
        // Enforce project limit after saving (unless skipped)
        // Note: skipLimitEnforcement is used for equipment operations to improve performance
        if (!skipLimitEnforcement) {
            await this.enforceProjectLimit();
        }
        
        return result;
    }

    async saveToLocalStorage(projectData, isFromServer = false) {
        try {
            const projectId = projectData._id;
            const currentTime = new Date().toISOString();
            
            // If this is from server, mark as synced and clear local changes
            // If this is local update, preserve existing local changes or mark as having local changes
            const projectWithMetadata = {
                ...projectData,
                has_local_changes: isFromServer ? false : true,
                last_local_change: isFromServer ? null : currentTime,
                offline_timestamp: currentTime // Always update offline timestamp when saving
            };
            console.log('projectWithMetadata, localstorage', projectWithMetadata);
            
            const key = `project_${projectId}`;
            localStorage.setItem(key, JSON.stringify(projectWithMetadata));
            
            // Update project list
            const projectList = JSON.parse(localStorage.getItem('project_list') || '[]');
            if (!projectList.includes(projectId)) {
                projectList.push(projectId);
                localStorage.setItem('project_list', JSON.stringify(projectList));
            }
            
            console.log(`Project ${projectId} saved to localStorage for offline use (server: ${isFromServer})`);
            return true;
        } catch (error) {
            console.error('Error saving project to localStorage:', error);
            return false;
        }
    }

    async saveToIndexedDB(db, projectData, isFromServer = false) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const currentTime = new Date().toISOString();
            
            // If this is from server, mark as synced and clear local changes
            // If this is local update, preserve existing local changes or mark as having local changes
            const projectWithMetadata = {
                ...projectData,
                has_local_changes: isFromServer ? false : true,
                last_local_change: isFromServer ? null : currentTime,
                offline_timestamp: currentTime // Always update offline timestamp when saving
            };
            
            const request = store.put(projectWithMetadata);
            
            request.onsuccess = () => {
                console.log(`Project ${projectData._id} saved to IndexedDB for offline use (server: ${isFromServer})`);
                resolve(true);
            };
            
            request.onerror = () => reject(request.error);
        });
    }

    async getProject(projectId) {
        const db = await this.initialize();
        
        if (db === 'localStorage') {
            return this.getFromLocalStorage(projectId);
        } else {
            return this.getFromIndexedDB(db, projectId);
        }
    }

    async getFromLocalStorage(projectId) {
        try {
            const key = `project_${projectId}`;
            const projectData = localStorage.getItem(key);
            if (projectData) {
                console.log(`Project ${projectId} retrieved from localStorage`);
                const parsed = JSON.parse(projectData);
                // Ensure has_local_changes property exists
                if (parsed && typeof parsed.has_local_changes === 'undefined') {
                    parsed.has_local_changes = false;
                }
                return parsed;
            }
            return null;
        } catch (error) {
            console.error('Error getting project from localStorage:', error);
            return null;
        }
    }

    async getFromIndexedDB(db, projectId) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(projectId);
            
            request.onsuccess = () => {
                if (request.result) {
                    console.log(`Project ${projectId} retrieved from IndexedDB`);
                    const result = request.result;
                    // Ensure has_local_changes property exists
                    if (result && typeof result.has_local_changes === 'undefined') {
                        result.has_local_changes = false;
                    }
                    resolve(result);
                } else {
                    resolve(null);
                }
            };
            
            request.onerror = () => reject(request.error);
        });
    }

    async getAllProjects() {
        const db = await this.initialize();
        
        if (db === 'localStorage') {
            return this.getAllFromLocalStorage();
        } else {
            return this.getAllFromIndexedDB(db);
        }
    }

    async getAllFromLocalStorage() {
        try {
            const projectList = JSON.parse(localStorage.getItem('project_list') || '[]');
            const projects = [];
            
            for (const projectId of projectList) {
                const projectData = await this.getFromLocalStorage(projectId);
                if (projectData) {
                    projects.push(projectData);
                }
            }
            
            return projects.sort((a, b) => {
                const aTime = new Date(a.last_visited_timestamp || a.offline_timestamp || 0);
                const bTime = new Date(b.last_visited_timestamp || b.offline_timestamp || 0);
                return bTime - aTime; // Most recent first
            });
        } catch (error) {
            console.error('Error getting all projects from localStorage:', error);
            return [];
        }
    }

    async getAllFromIndexedDB(db) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();
            
            request.onsuccess = () => {
                const projects = request.result.sort((a, b) => {
                    const aTime = new Date(a.last_visited_timestamp || a.offline_timestamp || 0);
                    const bTime = new Date(b.last_visited_timestamp || b.offline_timestamp || 0);
                    return bTime - aTime; // Most recent first
                });
                resolve(projects);
            };
            
            request.onerror = () => reject(request.error);
        });
    }

    async updateSyncTimestamp(projectId) {
        const db = await this.initialize();
        
        if (db === 'localStorage') {
            return this.updateSyncTimestampLocalStorage(projectId);
        } else {
            return this.updateSyncTimestampIndexedDB(db, projectId);
        }
    }

    async updateSyncTimestampLocalStorage(projectId) {
        try {
            const projectData = await this.getFromLocalStorage(projectId);
            if (projectData) {
                projectData.last_synced = new Date().toISOString();
                await this.saveToLocalStorage(projectData);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating sync timestamp in localStorage:', error);
            return false;
        }
    }

    async updateSyncTimestampIndexedDB(db, projectId) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            const getRequest = store.get(projectId);
            getRequest.onsuccess = () => {
                if (getRequest.result) {
                    const projectData = getRequest.result;
                    projectData.last_synced = new Date().toISOString();
                    
                    const putRequest = store.put(projectData);
                    putRequest.onsuccess = () => resolve(true);
                    putRequest.onerror = () => reject(putRequest.error);
                } else {
                    resolve(false);
                }
            };
            
            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    async getStorageInfo() {
        const db = await this.initialize();
        
        if (db === 'localStorage') {
            const projectList = JSON.parse(localStorage.getItem('project_list') || '[]');
            return {
                totalProjects: projectList.length,
                storageType: 'localStorage'
            };
        } else {
            return new Promise((resolve) => {
                const transaction = db.transaction([this.storeName], 'readonly');
                const store = transaction.objectStore(this.storeName);
                const request = store.count();
                
                request.onsuccess = () => {
                    resolve({
                        totalProjects: request.result,
                        storageType: 'IndexedDB'
                    });
                };
            });
        }
    }

    async clearAllProjects() {
        const db = await this.initialize();
        
        if (db === 'localStorage') {
            const projectList = JSON.parse(localStorage.getItem('project_list') || '[]');
            for (const projectId of projectList) {
                localStorage.removeItem(`project_${projectId}`);
            }
            localStorage.removeItem('project_list');
            return true;
        } else {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const request = store.clear();
                
                request.onsuccess = () => resolve(true);
                request.onerror = () => reject(request.error);
            });
        }
    }

    async updateLastVisitedTimestamp(projectId) {
        const db = await this.initialize();
        
        if (db === 'localStorage') {
            return this.updateLastVisitedTimestampLocalStorage(projectId);
        } else {
            return this.updateLastVisitedTimestampIndexedDB(db, projectId);
        }
    }

    async updateLastVisitedTimestampLocalStorage(projectId) {
        try {
            const projectData = await this.getFromLocalStorage(projectId);
            if (projectData) {
                projectData.last_visited_timestamp = new Date().toISOString();
                await this.saveProject(projectData, true, true); // Save without triggering limit enforcement
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating last visited timestamp in localStorage:', error);
            return false;
        }
    }

    async updateLastVisitedTimestampIndexedDB(db, projectId) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            const getRequest = store.get(projectId);
            getRequest.onsuccess = () => {
                if (getRequest.result) {
                    const projectData = getRequest.result;
                    projectData.last_visited_timestamp = new Date().toISOString();
                    
                    const putRequest = store.put(projectData);
                    putRequest.onsuccess = () => resolve(true);
                    putRequest.onerror = () => reject(putRequest.error);
                } else {
                    resolve(false);
                }
            };
            
            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    async enforceProjectLimit() {
        const maxProjects = 20; // Project limit
        const projects = await this.getAllProjects();
        
        if (projects.length > maxProjects) {
            // Sort by last_visited_timestamp (most recent first) to keep the latest visited projects
            const sortedProjects = projects.sort((a, b) => {
                const aTime = new Date(a.last_visited_timestamp || a.offline_timestamp || 0);
                const bTime = new Date(b.last_visited_timestamp || b.offline_timestamp || 0);
                return bTime - aTime; // Most recent first
            });
            
            // Keep only the most recent projects
            const projectsToKeep = sortedProjects.slice(0, maxProjects);
            const projectsToRemove = sortedProjects.slice(maxProjects);
            
            console.log(`Project limit exceeded (${projects.length}/${maxProjects}). Removing ${projectsToRemove.length} oldest projects.`);
            
            // Remove excess projects
            for (const project of projectsToRemove) {
                await this.deleteProject(project._id);
                console.log(`Removed project: ${project.name} (${project._id})`);
            }
            
            console.log(`Project limit enforced. Kept ${projectsToKeep.length} most recent projects.`);
        }
    }

    async limitProjects(maxProjects) {
        const projects = await this.getAllProjects();
        
        if (projects.length > maxProjects) {
            // Sort by offline_timestamp (most recent first)
            const sortedProjects = projects.sort((a, b) => {
                const aTime = new Date(a.offline_timestamp || 0);
                const bTime = new Date(b.offline_timestamp || 0);
                return bTime - aTime; // Most recent first
            });
            
            const projectsToRemove = sortedProjects.slice(maxProjects);
            
            for (const project of projectsToRemove) {
                await this.deleteProject(project._id);
            }
            
            console.log(`Limited offline storage to ${maxProjects} projects`);
        }
    }

    async removeFromIndexedDB(projectId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(projectId);
            
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    async markProjectAsChanged(projectId) {
        const db = await this.initialize();
        
        if (db === 'localStorage') {
            return this.markProjectAsChangedLocalStorage(projectId);
        } else {
            return this.markProjectAsChangedIndexedDB(db, projectId);
        }
    }

    async markProjectAsChangedLocalStorage(projectId) {
        try {
            const projectData = await this.getFromLocalStorage(projectId);
            if (projectData) {
                projectData.has_local_changes = true;
                projectData.last_local_change = new Date().toISOString();
                await this.saveToLocalStorage(projectData, false);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error marking project as changed in localStorage:', error);
            return false;
        }
    }

    async markProjectAsChangedIndexedDB(db, projectId) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            const getRequest = store.get(projectId);
            getRequest.onsuccess = () => {
                if (getRequest.result) {
                    const projectData = getRequest.result;
                    projectData.has_local_changes = true;
                    projectData.last_local_change = new Date().toISOString();
                    
                    const putRequest = store.put(projectData);
                    putRequest.onsuccess = () => resolve(true);
                    putRequest.onerror = () => reject(putRequest.error);
                } else {
                    resolve(false);
                }
            };
            
            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    async getProjectsWithLocalChanges() {
        const db = await this.initialize();
        
        if (db === 'localStorage') {
            return this.getProjectsWithLocalChangesLocalStorage();
        } else {
            return this.getProjectsWithLocalChangesIndexedDB(db);
        }
    }

    async getProjectsWithLocalChangesLocalStorage() {
        try {
            const projectList = JSON.parse(localStorage.getItem('project_list') || '[]');
            const projectsWithChanges = [];
            
            for (const projectId of projectList) {
                const projectData = await this.getFromLocalStorage(projectId);
                if (projectData && projectData.has_local_changes) {
                    projectsWithChanges.push(projectData);
                }
            }
            
            return projectsWithChanges.sort((a, b) => 
                new Date(b.last_local_change) - new Date(a.last_local_change)
            );
        } catch (error) {
            console.error('Error getting projects with local changes from localStorage:', error);
            return [];
        }
    }

    async getProjectsWithLocalChangesIndexedDB(db) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const index = store.index('has_local_changes');
            const request = index.getAll(true); // true = has_local_changes = true
            
            request.onsuccess = () => {
                const projects = request.result.sort((a, b) => 
                    new Date(b.last_local_change) - new Date(a.last_local_change)
                );
                resolve(projects);
            };
            
            request.onerror = () => reject(request.error);
        });
    }
}

// Initialize offline storage instance
const offlineStorage = new OfflineStorage();

// Export the OfflineStorage class for testing or advanced usage
export { OfflineStorage };

// Export the initialized instance
export { offlineStorage };

// Helper function to save project to offline storage
export const saveProjectToOfflineStorage = async (projectData) => {
    return await offlineStorage.saveProject(projectData);
};

// Helper function to get project from offline storage
export const getProjectFromOfflineStorage = async (projectId) => {
    return await offlineStorage.getProject(projectId);
};

// Helper function to get all offline projects
export const getOfflineProjects = async () => {
    return await offlineStorage.getAllProjects();
};

// Helper function to clear all offline projects
export const clearOfflineProjects = async () => {
    return await offlineStorage.clearAllProjects();
};

// Helper function to get offline storage info
export const getOfflineStorageInfo = async () => {
    const info = await offlineStorage.getStorageInfo();
    return {
        ...info,
        storageLimit: 20,
        availableSpace: Math.max(0, 20 - info.totalProjects)
    };
};

// Helper function to mark project as having local changes
export const markProjectAsChanged = async (projectId) => {
    return await offlineStorage.markProjectAsChanged(projectId);
};

// Helper function to get projects with local changes
export const getProjectsWithLocalChanges = async () => {
    return await offlineStorage.getProjectsWithLocalChanges();
};

// Helper function to manually enforce project limit
export const enforceProjectLimit = async () => {
    return await offlineStorage.enforceProjectLimit();
};

// Helper function to update last visited timestamp
export const updateLastVisitedTimestamp = async (projectId) => {
    return await offlineStorage.updateLastVisitedTimestamp(projectId);
};

// Helper function to check if project has local changes
export const hasProjectLocalChanges = async (projectId) => {
    const project = await offlineStorage.getProject(projectId);
    return project ? project.has_local_changes : false;
};

// Function to test offline storage connection
export const testPouchDBConnection = async () => {
    try {
        await offlineStorage.initialize();
        const info = await offlineStorage.getStorageInfo();
        return {
            success: true,
            info: {
                db_name: 'offline_storage',
                doc_count: info.totalProjects,
                storage_type: info.storageType,
                adapter: info.storageType
            }
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Function to manually initialize offline storage
export const manualPouchDBInit = async () => {
    try {
        await offlineStorage.initialize();
        console.log('Offline storage manually initialized successfully');
        return true;
    } catch (error) {
        console.error('Manual offline storage initialization failed:', error);
        return false;
    }
};

// Function to manually sync a project (update last_synced timestamp)
export const syncProject = async (projectId) => {
    try {
        const success = await offlineStorage.updateSyncTimestamp(projectId);
        if (success) {
            console.log(`Project ${projectId} synced successfully`);
        }
        return success;
    } catch (error) {
        console.error('Error syncing project:', error);
        return false;
    }
};

// Function to get sync status for a specific project
export const getProjectSyncStatus = async (projectId) => {
    try {
        const project = await offlineStorage.getProject(projectId);
        if (project) {
            return {
                isOffline: true,
                lastSynced: project.last_synced,
                offlineTimestamp: project.offline_timestamp
            };
        }
        return {
            isOffline: false,
            lastSynced: null,
            offlineTimestamp: null
        };
    } catch (error) {
        console.error('Error getting project sync status:', error);
        return null;
    }
};
