import { Button, Stack } from '../../../components';

export default function ChecklistHeader({ isEditing, onEditMode, onAddNew }) {
    return (
        <Stack horizontal className="gap-6 justify-between">
            <h1 className="text-2xl font-bold">Checklists</h1>
            <Stack horizontal className="gap-6">
                {!isEditing && (
                    <Button
                        variant="outline"
                        onClick={onEditMode}
                    >
                        Edit checklists order
                    </Button>
                )}
                <Button onClick={onAddNew}>
                    Add new
                </Button>
            </Stack>
        </Stack>
    );
}
