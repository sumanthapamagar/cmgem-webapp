import { useForm } from 'react-hook-form';
import { useCallback } from 'react';
import { useEquipmentAutosave } from './useEquipmentAutosave';

/**
 * Simplified hook for equipment forms that provides consistent form setup
 * and autosave functionality using the consolidated useEquipmentAutosave hook
 * 
 * @param {Object} defaultValues - Initial form values
 * @param {number} debounceDelay - Debounce delay (default: 200ms)
 * @param {number} idleDelay - Idle delay before autosave (default: 200ms)
 * @param {string} formMode - Form validation mode (default: 'onBlur')
 * @param {Function} customChangeDetector - Optional custom function to detect meaningful changes
 * @returns {Object} Form utilities and state
 */
export const useEquipmentForm = (
    defaultValues = {}, 
    debounceDelay = 200,
    idleDelay = 200,
    formMode = 'onBlur',
    customChangeDetector = null
) => {
    const { 
        register, 
        watch, 
        formState: { isDirty, errors, isValid }, 
        reset, 
        setValue, 
        trigger,
        handleSubmit
    } = useForm({
        mode: formMode,
        defaultValues
    });

    // Use the consolidated autosave hook with custom change detection
    const { 
        isAutoSaving, 
        lastSaved, 
        equipment, 
        project, 
        projectId, 
        equipmentId,
        triggerAutosave 
    } = useEquipmentAutosave({
        watch,
        isDirty,
        debounceDelay,
        idleDelay,
        customChangeDetector
    });

    // Memoize the reset function to prevent infinite loops
    const resetForm = useCallback((newDefaults) => {
        reset(newDefaults, { 
            keepDirty: false, 
            keepTouched: false, 
            keepErrors: false 
        });
    }, [reset]);

    return {
        // Form utilities
        register,
        watch,
        setValue,
        trigger,
        reset: resetForm,
        handleSubmit,
        
        // Form state
        isDirty,
        errors,
        isValid,
        
        // Autosave functionality (consolidated)
        isAutoSaving,
        lastSaved,
        triggerAutosave,
        
        // Equipment data
        equipment,
        project,
        projectId,
        equipmentId
    };
};
