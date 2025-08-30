import { useCallback, useRef, useEffect } from 'react';
import { useOfflineEquipmentUpdate } from './index';

/**
 * Optimized hook to handle form submission with consolidated debouncing
 * Removed external dependency and consolidated all debouncing logic
 * 
 * @param {Function} watch - React Hook Form watch function
 * @param {string} projectId - Project ID
 * @param {string} equipmentId - Equipment ID
 * @param {number} debounceDelay - Delay in milliseconds (default: 200ms)
 * @param {Function} customChangeDetector - Optional custom function to detect meaningful changes
 * @returns {Object} { debouncedValues, handleFormChange, isUpdating }
 */
export const useFormSubmission = (
    watch, 
    projectId, 
    equipmentId, 
    debounceDelay = 200,
    customChangeDetector = null
) => {
    const debouncedValuesRef = useRef(null);
    const debounceTimeoutRef = useRef(null);
    const lastSavedValues = useRef({});
    const { updateEquipment, isUpdating } = useOfflineEquipmentUpdate();
    
    // Consolidated debouncing logic
    useEffect(() => {
        const formValues = watch();
        
        // Clear existing timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        
        // Set new timeout for debounced values
        debounceTimeoutRef.current = setTimeout(() => {
            debouncedValuesRef.current = formValues;
        }, debounceDelay);
        
        // Cleanup on unmount
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [watch(), debounceDelay]);
    
    const handleFormChange = useCallback((newValues) => {
        if (Object.keys(newValues).length > 0) {
            // Use custom change detector if provided, otherwise use default logic
            let hasChanges = true;
            
            if (customChangeDetector) {
                hasChanges = customChangeDetector(newValues);
            } else {
                // Default change detection logic - optimized for performance
                hasChanges = Object.values(newValues).some(
                    section => section && Object.keys(section).length > 0
                );
            }
            
            // Compare with last saved values to avoid duplicate saves
            // Use a simple key-based comparison for better performance
            const hasNewChanges = Object.keys(newValues).some(key => {
                const newVal = newValues[key];
                const oldVal = lastSavedValues.current[key];
                return JSON.stringify(newVal) !== JSON.stringify(oldVal);
            });
            

            
            if (hasChanges && hasNewChanges) {
                lastSavedValues.current = { ...newValues };

                updateEquipment({ projectId, equipmentId, updates: newValues });
            }
        }
    }, [projectId, equipmentId, updateEquipment, customChangeDetector]);
    
    return { 
        debouncedValues: debouncedValuesRef.current, 
        handleFormChange, 
        isUpdating 
    };
};

/**
 * Specialized hook for checklist forms
 */
export const useChecklistFormSubmission = (watch, projectId, equipmentId, debounceDelay = 200) => {
    const customChangeDetector = (newValues) => {
        return Object.values(newValues.checklists || {}).some(
            item => item.status || item.comment
        );
    };
    
    return useFormSubmission(watch, projectId, equipmentId, debounceDelay, customChangeDetector);
};

/**
 * Specialized hook for floor forms
 */
export const useFloorFormSubmission = (watch, projectId, equipmentId, debounceDelay = 100) => { // Reduced to 100ms for immediate value capture
    const customChangeDetector = (newValues) => {
        // Check if there are meaningful changes in the floors object
        return Object.values(newValues.floors || {}).some(
            floor => floor && Object.values(floor).some(value => value && value !== '')
        );
    };
    
    // Create a wrapper for the watch function that transforms the data
    const transformedWatch = useCallback(() => {
        const formValues = watch();
        if (formValues.floors) {
            // Transform floors object back to array format for backend
            return {
                ...formValues,
                floors: Object.entries(formValues.floors).map(([floorId, floorData]) => ({
                    _id: floorId,
                    ...floorData
                }))
            };
        }
        return formValues;
    }, [watch]);
    
    return useFormSubmission(transformedWatch, projectId, equipmentId, debounceDelay, customChangeDetector);
};
