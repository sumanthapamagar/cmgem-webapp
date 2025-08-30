import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useEquipment } from '../../../../../hooks';
import { useOfflineEquipmentUpdate } from '../../../../../hooks';
import { Input, Textarea, Select, Checkbox, Radio, RadioGroup } from '../../../../../components/ui';

/**
 * Base component for all custom inputs with autosave functionality
 * Handles common logic: state management, debouncing, idle detection, and saving
 * 
 * Dual Autosave Behavior:
 * 1. Idle Autosave: After user stops typing for debounceDelay + idleDelay (default: 300ms + 500ms = 800ms)
 * 2. Blur Autosave: Immediate save when user leaves the field (for instant feedback)
 */
function BaseCustomInput({
    fieldPath,
    defaultValue,
    debounceDelay = 300,
    idleDelay = 500,
    children,
    ...props
}) {
    const [value, setValue] = useState(defaultValue);
    const [isDirty, setIsDirty] = useState(false);
    const debounceTimeoutRef = useRef(null);
    const idleTimeoutRef = useRef(null);
    const lastSavedValue = useRef(defaultValue);
    const inputRef = useRef(null);

    // Get the save function directly from the hook
    const { saveField } = useFieldAutosave();

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

    // Handle value change with debouncing and idle detection
    const handleValueChange = useCallback((newValue) => {
        setValue(newValue);
        setIsDirty(newValue !== lastSavedValue.current);

        if (newValue !== lastSavedValue.current) {
            clearTimeouts();

            // Set debounce timeout
            debounceTimeoutRef.current = setTimeout(() => {
                // After debounce, set idle timeout for auto-save while focused
                idleTimeoutRef.current = setTimeout(async () => {
                    if (newValue !== lastSavedValue.current) {
                        try {
                            console.log(`💾 Auto-saving ${fieldPath} (idle timeout):`, newValue);

                            const success = await saveField(fieldPath, newValue);

                            if (success) {
                                lastSavedValue.current = newValue;
                                setIsDirty(false);
                                console.log(`✅ Successfully saved ${fieldPath} (idle timeout)`);
                            } else {
                                console.error(`❌ Failed to save ${fieldPath} (idle timeout)`);
                            }
                        } catch (error) {
                            console.error(`❌ Error saving ${fieldPath} (idle timeout):`, error);
                        }
                    }
                }, idleDelay);
            }, debounceDelay);
        }
    }, [fieldPath, debounceDelay, idleDelay, saveField, clearTimeouts]);

    // Handle immediate save on blur (for immediate feedback)
    const handleBlur = useCallback(async (newValue) => {
        if (newValue !== lastSavedValue.current) {
            try {
                console.log(`💾 Auto-saving ${fieldPath} (blur):`, newValue);

                const success = await saveField(fieldPath, newValue);

                if (success) {
                    lastSavedValue.current = newValue;
                    setIsDirty(false);
                    console.log(`✅ Successfully saved ${fieldPath} (blur)`);
                } else {
                    console.error(`❌ Failed to save ${fieldPath} (blur)`);
                }
            } catch (error) {
                console.error(`❌ Error saving ${fieldPath} (blur):`, error);
            }
        }
    }, [fieldPath, saveField]);

    // Update value when defaultValue changes (for external updates)
    useEffect(() => {
        if (defaultValue !== lastSavedValue.current) {
            setValue(defaultValue);
            lastSavedValue.current = defaultValue;
            setIsDirty(false);
        }
    }, [defaultValue]);

    // Cleanup on unmount
    useEffect(() => {
        return () => clearTimeouts();
    }, [clearTimeouts]);

    // Pass props to children function
    return children({
        value,
        isDirty,
        handleValueChange,
        handleBlur,
        inputRef,
        ...props
    });
}

/**
 * Custom TextField with built-in autosave
 * Uses the Input component from @ui/
 */
export function CustomTextField({
    fieldPath,
    defaultValue = '',
    placeholder,
    className = '',
    debounceDelay = 300,
    idleDelay = 500,
    ...props
}) {
    return (
        <BaseCustomInput
            fieldPath={fieldPath}
            defaultValue={defaultValue}
            debounceDelay={debounceDelay}
            idleDelay={idleDelay}
        >
            {({ value, isDirty, handleValueChange, handleBlur, inputRef }) => (
                <Input
                    ref={inputRef}
                    type="text"
                    value={value}
                    placeholder={placeholder}
                    className={`${className} ${isDirty ? 'border-orange-400' : ''}`}
                    onChange={(e) => handleValueChange(e.target.value)}
                    onBlur={(e) => handleBlur(e.target.value)}
                    {...props}
                />
            )}
        </BaseCustomInput>
    );
}

/**
 * Custom NumberField with built-in autosave
 * Uses the Input component from @ui/ with type="number"
 */
export function CustomNumberField({
    fieldPath,
    defaultValue = '',
    placeholder,
    className = '',
    min,
    max,
    step,
    debounceDelay = 300,
    idleDelay = 500,
    ...props
}) {
    return (
        <BaseCustomInput
            fieldPath={fieldPath}
            defaultValue={defaultValue}
            debounceDelay={debounceDelay}
            idleDelay={idleDelay}
        >
            {({ value, isDirty, handleValueChange, handleBlur, inputRef }) => (
                <Input
                    ref={inputRef}
                    type="number"
                    value={value}
                    placeholder={placeholder}
                    min={min}
                    max={max}
                    step={step}
                    className={`${className} ${isDirty ? 'border-orange-400' : ''}`}
                    onChange={(e) => handleValueChange(e.target.value)}
                    onBlur={(e) => handleBlur(e.target.value)}
                    {...props}
                />
            )}
        </BaseCustomInput>
    );
}

/**
 * Custom TextArea with built-in autosave
 * Uses the Textarea component from @ui/
 * 
 * Dual Autosave System:
 * - onChange: Triggers idle autosave after debounce + idle delay (while focused)
 * - onBlur: Triggers immediate save when leaving the field
 * - onKeyDown: Ctrl+Enter triggers save and blur
 */
export function CustomTextArea({
    fieldPath,
    defaultValue = '',
    placeholder,
    rows = 3,
    className = '',
    debounceDelay = 500,
    idleDelay = 1000,
    ...props
}) {
    return (
        <BaseCustomInput
            fieldPath={fieldPath}
            defaultValue={defaultValue}
            debounceDelay={debounceDelay}
            idleDelay={idleDelay}
        >
            {({ value, isDirty, handleValueChange, handleBlur, inputRef }) => (
                <Textarea
                    ref={inputRef}
                    value={value}
                    placeholder={placeholder}
                    rows={rows}
                    className={`${className} ${isDirty ? 'border-orange-400' : ''}`}
                    onChange={(e) => handleValueChange(e.target.value)}
                    onBlur={(e) => handleBlur(e.target.value)}
                    {...props}
                />
            )}
        </BaseCustomInput>
    );
}

/**
 * Custom Checkbox with immediate save
 * Uses the Checkbox component from @ui/
 */
export function CustomCheckbox({
    fieldPath,
    label,
    className = '',
    checked,
    value,
    ...props
}) {
    // Get the save function directly from the hook
    const { saveField } = useFieldAutosave();

    const handleChange = useCallback(async (e) => {
        const newValue = checked ? "" : value;
        try {
            console.log(`💾 Auto-saving ${fieldPath}:`, newValue);

            const success = await saveField(fieldPath, newValue);

            if (success) {
                console.log(`✅ Successfully saved ${fieldPath}`);
            } else {
                console.error(`❌ Failed to save ${fieldPath}`);
            }
        } catch (error) {
            console.error(`❌ Error saving ${fieldPath}:`, error);
        }
    }, [fieldPath, saveField]);

    return (
        <Checkbox
            checked={checked}
            onChange={handleChange}
            className="mr-2"
            {...props}
        />
    );
}

/**
 * Custom Select with built-in autosave
 * Uses the Select component from @ui/
 * 
 * Note: Select has both onChange (for idle autosave) and onBlur (for immediate blur autosave)
 * This ensures data is saved whether the user changes selection or just leaves the field
 */
export function CustomSelect({
    fieldPath,
    defaultValue = '',
    options = [],
    className = '',
    debounceDelay = 200,
    idleDelay = 300,
    ...props
}) {
    return (
        <BaseCustomInput
            fieldPath={fieldPath}
            defaultValue={defaultValue}
            debounceDelay={debounceDelay}
            idleDelay={idleDelay}
        >
            {({ value, isDirty, handleValueChange, handleBlur }) => (
                <Select
                    value={value}
                    onChange={(e) => handleValueChange(e.target.value)}
                    onBlur={(e) => handleBlur(e.target.value)}
                    className={`${className} ${!value ? 'text-black/40' : ''} ${isDirty ? 'border-orange-400' : ''}`}
                    {...props}
                >
                    <option className='text-black/40' value="">Select an option</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </Select>
            )}
        </BaseCustomInput>
    );
}

/**
 * Custom Radio Group with immediate save
 * Uses the Radio and RadioGroup components from @ui/
 */
export function CustomRadioGroup({
    fieldPath,
    defaultValue = '',
    options = [],
    name,
    className = '',
    ...props
}) {
    const [selectedValue, setSelectedValue] = useState(defaultValue);
    const [isDirty, setIsDirty] = useState(false);
    const lastSavedValue = useRef(defaultValue);

    // Get the save function directly from the hook
    const { saveField } = useFieldAutosave();

    const handleChange = useCallback(async (newValue) => {
        setSelectedValue(newValue);
        setIsDirty(newValue !== lastSavedValue.current);

        if (newValue !== lastSavedValue.current) {
            try {
                console.log(`💾 Auto-saving ${fieldPath}:`, newValue);

                const success = await saveField(fieldPath, newValue);

                if (success) {
                    lastSavedValue.current = newValue;
                    setIsDirty(false);
                    console.log(`✅ Successfully saved ${fieldPath}`);
                } else {
                    console.error(`❌ Failed to save ${fieldPath}`);
                }
            } catch (error) {
                console.error(`❌ Error saving ${fieldPath}:`, error);
            }
        }
    }, [fieldPath, saveField]);

    useEffect(() => {
        setSelectedValue(defaultValue);
        lastSavedValue.current = defaultValue;
        setIsDirty(false);
    }, [defaultValue]);

    return (
        <RadioGroup
            value={selectedValue}
            onChange={handleChange}
            className={`space-y-2 ${className}`}
            {...props}
        >
            {options.map((option) => (
                <Radio
                    key={option.value}
                    value={option.value}
                    className={`${isDirty ? 'ring-2 ring-orange-400' : ''}`}
                >
                    <span className="text-sm">{option.label}</span>
                </Radio>
            ))}
        </RadioGroup>
    );
}

/**
 * Hook for managing field-level autosave
 * Provides a centralized save function for all custom inputs
 * Handles both regular fields and floor-specific updates
 */
export function useFieldAutosave() {
    const { projectId, equipmentId } = useParams();
    const { equipment } = useEquipment(equipmentId);
    const { updateEquipment } = useOfflineEquipmentUpdate();

    const saveField = useCallback(async (fieldPath, value) => {
        if (!equipmentId || !projectId || !equipment) {
            console.error('Missing required data for field save:', { equipmentId, projectId, equipment });
            return false;
        }

        try {
            console.log(`🚀 Saving field ${fieldPath}:`, value);

            // Special handling for floors array updates
            if (fieldPath.startsWith('floors.')) {
                // Parse floors path: "floors.floorId.fieldName"
                const pathParts = fieldPath.split('.');
                if (pathParts.length === 3) {
                    const [, floorId, fieldName] = pathParts;

                    console.log(`🏢 Updating floor ${floorId}, field ${fieldName}:`, value);

                    // Find the floor in the equipment's floors array
                    if (!equipment.floors || !Array.isArray(equipment.floors)) {
                        console.error('Equipment floors array not found');
                        return false;
                    }

                    const floorIndex = equipment.floors.findIndex(floor => floor._id === floorId);
                    if (floorIndex === -1) {
                        console.error(`Floor ${floorId} not found in equipment`);
                        return false;
                    }

                    // Create the updates object for the specific floor field
                    const updates = {
                        floors: equipment.floors.map((floor, index) =>
                            index === floorIndex
                                ? { ...floor, [fieldName]: value }
                                : floor
                        )
                    };

                    console.log(`🔧 Updating floor field ${fieldPath}:`, updates);

                    const success = await updateEquipment({
                        projectId,
                        equipmentId,
                        updates,
                        delay: 100 // Quick save for floor updates
                    });

                    if (success) {
                        console.log(`✅ Successfully saved floor field ${fieldPath}`);
                    } else {
                        console.error(`❌ Failed to save floor field ${fieldPath}`);
                    }

                    return success;
                }
            }

            // For non-floor fields, use the original path parsing logic
            const pathParts = fieldPath.split('.');
            const updates = {};
            let current = updates;

            console.log(`🔍 Building updates for path: ${fieldPath}`);
            console.log(`🔍 Path parts:`, pathParts);

            // Build the nested structure while preserving existing data
            for (let i = 0; i < pathParts.length - 1; i++) {
                const pathPart = pathParts[i];
                // Get the existing value from equipment to preserve other fields
                const existingValue = equipment[pathPart];

                console.log(`🔍 Processing path part ${i}: ${pathPart}`);
                console.log(`🔍 Existing value:`, existingValue);

                // Create a new object that preserves existing data
                current[pathPart] = existingValue && typeof existingValue === 'object'
                    ? { ...existingValue }
                    : {};
                current = current[pathPart];

                console.log(`🔍 Created/updated object for ${pathPart}:`, current[pathPart]);
            }
            current[pathParts[pathParts.length - 1]] = value;

            console.log(`🔍 Final updates object:`, updates);

            // Safety check: ensure we're not accidentally overwriting the entire equipment
            if (Object.keys(updates).length === 0) {
                console.error(`❌ No updates created for field ${fieldPath}`);
                return false;
            }

            // Validate that we're only updating the specific field path
            console.log(`🔍 Validating update structure...`);
            let validationPath = updates;
            for (let i = 0; i < pathParts.length - 1; i++) {
                if (!validationPath[pathParts[i]]) {
                    console.error(`❌ Missing intermediate path ${pathParts[i]} in updates`);
                    return false;
                }
                validationPath = validationPath[pathParts[i]];
            }
            if (!validationPath.hasOwnProperty(pathParts[pathParts.length - 1])) {
                console.error(`❌ Missing final field ${pathParts[pathParts.length - 1]} in updates`);
                return false;
            }

            console.log(`✅ Update structure validation passed`);



            const success = await updateEquipment({
                projectId,
                equipmentId,
                updates,
                delay: 100 // Quick save for regular field updates
            });

            if (success) {
                console.log(`✅ Successfully saved equipment field ${fieldPath}`);
            } else {
                console.error(`❌ Failed to save equipment field ${fieldPath}`);
            }

            return success;
        } catch (error) {
            console.error(`❌ Failed to save field ${fieldPath}:`, error);
            return false;
        }
    }, [equipmentId, projectId, equipment, updateEquipment]);

    return { saveField };
}
