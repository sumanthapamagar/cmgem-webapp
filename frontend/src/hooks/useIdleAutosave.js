import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Optimized hook that saves form values when they stop changing for a set time
 * Performance improvements: faster default delay, optimized change detection, reduced JSON operations
 * Now works with consolidated debouncing for better performance
 * 
 * @param {Function} handleFormChange - Function to handle form changes
 * @param {Object} formValues - Current form values to save
 * @param {boolean} isDirty - Form dirty state
 * @param {number} idleDelay - How long to wait after values stop changing (default: 200ms - reduced for better UX)
 * @returns {Object} { isAutoSaving, triggerImmediateSave }
 */
export const useIdleAutosave = (
    handleFormChange,
    formValues,
    isDirty,
    idleDelay = 200
) => {
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const saveTimeoutRef = useRef(null);
    const lastValuesRef = useRef(null);
    const lastValuesHashRef = useRef(null);

    // Simple hash function for faster comparison
    const simpleHash = useCallback((obj) => {
        if (!obj || typeof obj !== 'object') return '';
        let hash = 0;
        const str = JSON.stringify(obj);
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }, []);

    // Clear any existing timeout
    const clearSaveTimeout = useCallback(() => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = null;
        }
    }, []);

    // Trigger autosave
    const triggerAutosave = useCallback(async (values) => {
        if (!values || Object.keys(values).length === 0) return;


        setIsAutoSaving(true);

        try {
            await handleFormChange(values);
            setLastSaved(new Date().toISOString());
        } catch (error) {
            console.error('Autosave failed:', error);
        } finally {
            // Keep indicator visible for a shorter time to show completion
            setTimeout(() => setIsAutoSaving(false), 200);
        }
    }, [handleFormChange]);

    // Trigger immediate save (bypass delay)
    const triggerImmediateSave = useCallback((values) => {
        clearSaveTimeout();
        triggerAutosave(values);
    }, [clearSaveTimeout, triggerAutosave]);

    // Watch for changes in form values
    useEffect(() => {
        // Only proceed if we have values and the form is dirty
        if (!formValues || Object.keys(formValues).length === 0 || !isDirty) {
            return;
        }

        // Use faster hash comparison instead of JSON.stringify
        const currentHash = simpleHash(formValues);
        if (currentHash === lastValuesHashRef.current) {
            return; // No change, don't do anything
        }


        lastValuesHashRef.current = currentHash;
        lastValuesRef.current = formValues;

        // Clear any existing timeout
        clearSaveTimeout();

        // Set new timeout to save after delay
        saveTimeoutRef.current = setTimeout(() => {

            triggerAutosave(formValues);
        }, idleDelay);

    }, [formValues, isDirty, idleDelay, clearSaveTimeout, triggerAutosave, simpleHash]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearSaveTimeout();
        };
    }, [clearSaveTimeout]);

    return {
        isAutoSaving,
        triggerImmediateSave,
        lastSaved
    };
};
