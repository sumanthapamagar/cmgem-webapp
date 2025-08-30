import { FormStatusBar } from './index';
import { Stack } from '../../../../../components';

/**
 * Higher-order component that provides common equipment form functionality
 * including autosave status, form wrapper, and consistent layout
 */
export function EquipmentFormContainer({
    children,
    isAutoSaving,
    isDirty,
    lastSaved,
    onManualSave,
    className = "gap-8",
    showStatusBar = true,
    statusBarProps = {}
}) {
    return (
        <form>
            <Stack className={className}>
                {showStatusBar && (
                    <FormStatusBar
                        isAutoSaving={isAutoSaving}
                        isDirty={isDirty}
                        lastSaved={lastSaved}
                        onManualSave={onManualSave}
                        {...statusBarProps}
                    />
                )}
                {children}
            </Stack>
        </form>
    );
}
