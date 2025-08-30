import { offlineStorage } from './offline-api';
import { 
    saveProject, 
    patchEquipment, 
    createEquipment, 
    deleteEquipment,
    patchFloor,
    createFloor,
    deleteFloor
} from './api';

/**
 * Service to handle syncing local changes to the server
 */
class SyncService {
    /**
     * Sync a specific project to the server
     * @param {string} projectId - The project ID to sync
     * @returns {Promise<Object>} - Sync result
     */
    async syncProject(projectId) {
        try {
            const project = await offlineStorage.getProject(projectId);
            
            if (!project) {
                return { success: false, error: 'Project not found in offline storage' };
            }

            if (!project.has_local_changes) {
                return { success: true, message: 'No local changes to sync' };
            }

            console.log(`Starting sync for project ${projectId}`);

            // Sync project data first
            if (project.last_modified !== project.last_synced) {
                try {
                    await saveProject(projectId, {
                        name: project.name,
                        description: project.description,
                        // Add other project fields as needed
                    });
                    console.log(`Project ${projectId} data synced`);
                } catch (error) {
                    console.error(`Failed to sync project ${projectId} data:`, error);
                    return { success: false, error: `Failed to sync project data: ${error.message}` };
                }
            }

            // Sync equipment changes
            const equipmentSyncResult = await this.syncEquipmentChanges(projectId, project.equipments || []);
            if (!equipmentSyncResult.success) {
                return equipmentSyncResult;
            }

            // Mark project as synced
            const syncedProject = {
                ...project,
                has_local_changes: false,
                last_local_change: null,
                last_synced: new Date().toISOString()
            };

            await offlineStorage.saveProject(syncedProject, true);
            
            console.log(`Project ${projectId} synced successfully`);
            return { 
                success: true, 
                message: 'Project synced successfully',
                syncedAt: new Date().toISOString()
            };

        } catch (error) {
            console.error(`Error syncing project ${projectId}:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Sync equipment changes for a project
     * @param {string} projectId - The project ID
     * @param {Array} equipments - Array of equipment objects
     * @returns {Promise<Object>} - Sync result
     */
    async syncEquipmentChanges(projectId, equipments) {
        try {
            for (const equipment of equipments) {
                // Check if equipment has local changes
                if (equipment.updated_at && equipment.last_synced && 
                    new Date(equipment.updated_at) > new Date(equipment.last_synced)) {
                    
                    if (equipment._id.startsWith('temp_')) {
                        // New equipment - create on server
                        try {
                            const serverEquipment = await createEquipment(projectId, {
                                name: equipment.name,
                                type: equipment.type,
                                // Add other equipment fields as needed
                            });
                            
                            // Update local equipment with server ID
                            equipment._id = serverEquipment._id;
                            equipment.last_synced = new Date().toISOString();
                            
                            console.log(`Equipment ${equipment._id} created on server`);
                        } catch (error) {
                            console.error(`Failed to create equipment ${equipment._id}:`, error);
                            return { success: false, error: `Failed to create equipment: ${error.message}` };
                        }
                    } else {
                        // Existing equipment - update on server
                        try {
                            await patchEquipment(projectId, equipment._id, {
                                name: equipment.name,
                                type: equipment.type,
                                // Add other equipment fields as needed
                            });
                            
                            equipment.last_synced = new Date().toISOString();
                            console.log(`Equipment ${equipment._id} updated on server`);
                        } catch (error) {
                            console.error(`Failed to update equipment ${equipment._id}:`, error);
                            return { success: false, error: `Failed to update equipment: ${error.message}` };
                        }
                    }

                    // Sync floor changes for this equipment
                    const floorSyncResult = await this.syncFloorChanges(projectId, equipment._id, equipment.floors || []);
                    if (!floorSyncResult.success) {
                        return floorSyncResult;
                    }
                }
            }

            return { success: true };
        } catch (error) {
            console.error('Error syncing equipment changes:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Sync floor changes for equipment
     * @param {string} projectId - The project ID
     * @param {string} equipmentId - The equipment ID
     * @param {Array} floors - Array of floor objects
     * @returns {Promise<Object>} - Sync result
     */
    async syncFloorChanges(projectId, equipmentId, floors) {
        try {
            for (const floor of floors) {
                // Check if floor has local changes
                if (floor.updated_at && floor.last_synced && 
                    new Date(floor.updated_at) > new Date(floor.last_synced)) {
                    
                    if (floor._id.startsWith('temp_')) {
                        // New floor - create on server
                        try {
                            const serverFloor = await createFloor(projectId, equipmentId, {
                                name: floor.name,
                                level: floor.level,
                                // Add other floor fields as needed
                            });
                            
                            // Update local floor with server ID
                            floor._id = serverFloor._id;
                            floor.last_synced = new Date().toISOString();
                            
                            console.log(`Floor ${floor._id} created on server`);
                        } catch (error) {
                            console.error(`Failed to create floor ${floor._id}:`, error);
                            return { success: false, error: `Failed to create floor: ${error.message}` };
                        }
                    } else {
                        // Existing floor - update on server
                        try {
                            await patchFloor(floor._id, {
                                name: floor.name,
                                level: floor.level,
                                // Add other floor fields as needed
                            });
                            
                            floor.last_synced = new Date().toISOString();
                            console.log(`Floor ${floor._id} updated on server`);
                        } catch (error) {
                            console.error(`Failed to update floor ${floor._id}:`, error);
                            return { success: false, error: `Failed to update floor: ${error.message}` };
                        }
                    }
                }
            }

            return { success: true };
        } catch (error) {
            console.error('Error syncing floor changes:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Sync all projects with local changes
     * @returns {Promise<Object>} - Sync result
     */
    async syncAllProjects() {
        try {
            const projectsWithChanges = await offlineStorage.getProjectsWithLocalChanges();
            
            if (projectsWithChanges.length === 0) {
                return { success: true, message: 'No projects with local changes to sync' };
            }

            console.log(`Syncing ${projectsWithChanges.length} projects with local changes`);

            const results = [];
            let successCount = 0;
            let errorCount = 0;

            for (const project of projectsWithChanges) {
                const result = await this.syncProject(project._id);
                results.push({ projectId: project._id, result });
                
                if (result.success) {
                    successCount++;
                } else {
                    errorCount++;
                }
            }

            return {
                success: errorCount === 0,
                message: `Synced ${successCount} projects successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
                results,
                syncedAt: new Date().toISOString()
            };

        } catch (error) {
            console.error('Error syncing all projects:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get sync status for all projects
     * @returns {Promise<Object>} - Sync status
     */
    async getSyncStatus() {
        try {
            const allProjects = await offlineStorage.getAllProjects();
            const projectsWithChanges = allProjects.filter(p => p.has_local_changes);
            
            return {
                totalProjects: allProjects.length,
                projectsWithChanges: projectsWithChanges.length,
                projectsWithChangesList: projectsWithChanges.map(p => ({
                    id: p._id,
                    name: p.name || p.title || 'Unknown Project',
                    lastLocalChange: p.last_local_change,
                    lastSynced: p.last_synced
                })),
                hasAnyLocalChanges: projectsWithChanges.length > 0,
                lastSyncCheck: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error getting sync status:', error);
            return {
                totalProjects: 0,
                projectsWithChanges: 0,
                projectsWithChangesList: [],
                hasAnyLocalChanges: false,
                lastSyncCheck: new Date().toISOString(),
                error: error.message
            };
        }
    }
}

// Create and export singleton instance
const syncService = new SyncService();
export default syncService;

// Export individual methods for convenience
export const {
    syncProject,
    syncAllProjects,
    getSyncStatus
} = syncService;
