import { Button, Stack } from '../../../components';

export default function ChecklistActions({ 
    isEditing, 
    onSave, 
    onCancel, 
    onReset,
    isSaving = false
}) {
    if (!isEditing) return null;

    return (
        <Stack horizontal className="gap-6">
            <Button 
                onClick={onSave}
                disabled={isSaving}
                loading={isSaving ? true : undefined}
            >
                {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button
                onClick={onReset}
                variant="outline"
                disabled={isSaving}
            >
                Cancel & Reset
            </Button>
        </Stack>
    );
}
