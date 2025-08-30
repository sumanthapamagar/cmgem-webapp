import { useState, useEffect } from 'react';

/**
 * Custom hook to manage autosave state and indicators
 * Provides consistent autosave behavior across components
 * 
 * @param {boolean} isDirty - Form dirty state from React Hook Form
 * @param {Object} debouncedValues - Debounced form values
 * @param {Function} handleFormChange - Function to handle form changes
 * @param {number} showDuration - How long to show the indicator (default: 1000ms)
 * @returns {Object} { isAutoSaving, triggerAutosave }
 */
export const useAutosaveState = (
    isDirty, 
    debouncedValues, 
    handleFormChange, 
    showDuration = 1000 // Reduced from 2000ms to 1000ms for better responsiveness
) => {
    const [isAutoSaving, setIsAutoSaving] = useState(false);

    // Trigger autosave when conditions are met
    const triggerAutosave = () => {
        if (isDirty && Object.keys(debouncedValues).length > 0) {
            // Show autosave indicator
            setIsAutoSaving(true);
            
            // Save the changes
            handleFormChange(debouncedValues);
            
            // Hide autosave indicator after delay
            setTimeout(() => setIsAutoSaving(false), showDuration);
        }
    };

    // Auto-trigger autosave when debounced values change
    useEffect(() => {
        triggerAutosave();
    }, [debouncedValues]); // Only depend on debouncedValues to prevent re-renders

    return { isAutoSaving, triggerAutosave };
};
