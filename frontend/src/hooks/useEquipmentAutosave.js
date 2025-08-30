import { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectContext } from '../features/projects/projectContext';
import { offlineStorage } from '../lib/offline-api';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Consolidated hook that handles all equipment autosave functionality
 * Combines: form watching, debouncing, change detection, offline storage, and UI state
 * 
 * Features:
 * - Automatic data transformation (floors: object→array, checklists: structure validation)
 * - Custom change detection for specialized forms
 * - Optimized debouncing and idle detection
 * - Hash-based change detection for performance
 * 
 * @param {Object} options - Configuration options
 * @param {Function} options.watch - React Hook Form watch function
 * @param {boolean} options.isDirty - Form dirty state
 * @param {number} options.debounceDelay - Debounce delay in ms (default: 200ms)
 * @param {number} options.idleDelay - Idle delay in ms (default: 200ms)
 * @param {Function} options.customChangeDetector - Optional custom function to detect meaningful changes
 * @returns {Object} { isAutoSaving, lastSaved, equipment, project, projectId, equipmentId, triggerAutosave }
 */
export const useEquipmentAutosave = ({
    watch,
    isDirty,
    debounceDelay = 200,
    idleDelay = 200,
    customChangeDetector = null
}) => {
    const { projectId: routeProjectId, equipmentId: routeEquipmentId } = useParams();
    const { offlineProject: project } = useContext(ProjectContext);
    const queryClient = useQueryClient();
    
    // State
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    
    // Refs for performance
    const debounceTimeoutRef = useRef(null);
    const idleTimeoutRef = useRef(null);
    const lastSavedValues = useRef({});
    const lastValuesHashRef = useRef(null);
    
    // Final IDs
    const projectId = routeProjectId;
    const equipmentId = routeEquipmentId;
    
    // Equipment lookup
    const equipment = project?.equipments?.find((eq) => eq._id === equipmentId);
    
    // Simple hash function for fast change detection
    const simpleHash = useCallback((obj) => {
        if (!obj || typeof obj !== 'object') return '';
        let hash = 0;
        const str = JSON.stringify(obj);
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }, []);
    
    // Clear timeouts
    const clearTimeouts = useCallback(() => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
            debounceTimeoutRef.current = null;
        }
        if (idleTimeoutRef.current) {
            clearTimeout(idleTimeoutRef.current);
            idleTimeoutRef.current = null;
        }
    }, []);
    
    // Update equipment in offline storage
    const updateEquipment = useCallback(async (updates) => {
        if (!projectId || !equipmentId || !project) return false;
        
        try {
            // Transform floors data from object format back to array format for backend
            const transformedUpdates = { ...updates };
            if (transformedUpdates.floors) {
                transformedUpdates.floors = Object.entries(transformedUpdates.floors).map(([floorId, floorData]) => ({
                    _id: floorId,
                    ...floorData
                }));
            }
            
            // Transform checklists data if present (for inspection forms)
            if (transformedUpdates.checklists) {
                // Checklists are already in the correct format, but ensure they have proper structure
                Object.keys(transformedUpdates.checklists).forEach(checklistId => {
                    if (transformedUpdates.checklists[checklistId] && typeof transformedUpdates.checklists[checklistId] === 'object') {
                        transformedUpdates.checklists[checklistId] = {
                            _id: checklistId,
                            ...transformedUpdates.checklists[checklistId]
                        };
                    }
                });
            }
            
            const equipmentIndex = project.equipments.findIndex(eq => eq._id === equipmentId);
            if (equipmentIndex === -1) return false;
            
            const updatedEquipment = {
                ...project.equipments[equipmentIndex],
                ...transformedUpdates,
            };
            
            const updatedEquipments = [...project.equipments];
            updatedEquipments[equipmentIndex] = updatedEquipment;
            
            const updatedProject = {
                ...project,
                equipments: updatedEquipments,
                last_updated: new Date().toISOString(),
            };
            
            const success = await offlineStorage.saveProject(updatedProject, false, true); // Skip limit enforcement for equipment autosave
            
            if (success && queryClient) {
                queryClient.invalidateQueries({ queryKey: ['offline-project', projectId] });
            }
            
            return success;
        } catch (error) {
            console.error('Error updating equipment:', error);
            return false;
        }
    }, [projectId, equipmentId, project, queryClient]);
    
    // Trigger autosave
    const triggerAutosave = useCallback(async (values) => {
        if (!values || Object.keys(values).length === 0) return;
        

        setIsAutoSaving(true);
        
        try {
            await updateEquipment(values);
            setLastSaved(new Date().toISOString());
        } catch (error) {
            console.error('Autosave failed:', error);
        } finally {
            setTimeout(() => setIsAutoSaving(false), 200);
        }
    }, [updateEquipment]);
    
    // Main effect for watching form changes
    useEffect(() => {
        if (!isDirty) {

            return;
        }
        
        const formValues = watch();
        if (!formValues || Object.keys(formValues).length === 0) {

            return;
        }
        
        // Check if values actually changed using hash
        const currentHash = simpleHash(formValues);
        if (currentHash === lastValuesHashRef.current) {

            return;
        }
        
        // Use custom change detector if provided, otherwise use default logic
        let hasChanges = true;
        if (customChangeDetector) {
            hasChanges = customChangeDetector(formValues);

        } else {
            // Default change detection logic
            hasChanges = Object.values(formValues).some(
                section => section && Object.keys(section).length > 0
            );

        }
        
        if (!hasChanges) {

            return;
        }
        

        lastValuesHashRef.current = currentHash;
        
        // Clear existing timeouts
        clearTimeouts();
        
        // Set debounce timeout
        debounceTimeoutRef.current = setTimeout(() => {

            // After debounce, set idle timeout
            idleTimeoutRef.current = setTimeout(() => {

                triggerAutosave(formValues);
            }, idleDelay);
        }, debounceDelay);
        
        // Cleanup
        return () => clearTimeouts();
    }, [watch(), isDirty, debounceDelay, idleDelay, clearTimeouts, triggerAutosave, simpleHash, customChangeDetector]);
    
    // Cleanup on unmount
    useEffect(() => {
        return () => clearTimeouts();
    }, [clearTimeouts]);
    
    return {
        // Autosave state
        isAutoSaving,
        lastSaved,
        
        // Equipment data
        equipment,
        project,
        projectId,
        equipmentId,
        
        // Utility functions
        triggerAutosave: () => triggerAutosave(watch())
    };
};
