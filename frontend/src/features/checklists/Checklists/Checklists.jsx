import { useParams } from 'react-router-dom';
import { Stack, ChecklistLoadingState } from '../../../components';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getChecklists, patchChecklists } from '../../../lib/api';
import { useEffect, useState } from 'react';
import ChecklistHeader from './ChecklistHeader';
import ChecklistTable from './ChecklistTable';
import ChecklistActions from './ChecklistActions';
import ChecklistModal from './ChecklistModal';

export default function Checklists() {
    const { equipmentType, location } = useParams();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const hideDialog = () => setIsDialogOpen(false);
    const [checklists, setChecklists] = useState([]);
    const [isEditing, setIsEdting] = useState(false);

    useEffect(() => {
        setIsEdting(false);
    }, [equipmentType, location]);

    const { data: checklistData, isLoading, refetch } = useQuery({
        queryKey: ['checklists', equipmentType, location],
        queryFn: () =>
            getChecklists({ equipment_type: equipmentType, location }).then(
                (res) => {
                    setChecklists(Array.isArray(res) ? res : []);
                    return res;
                }
            )
    });

    const { mutate: mutatePatchChecklists, isPending: isSaving } = useMutation({
        mutationFn: (data) => {
            console.log('Saving checklist order:', data);
            return patchChecklists(data);
        },
        onSuccess: (res) => {
            console.log('Checklist order saved successfully:', res);
            setIsEdting(false);
            refetch();
        },
        onError: (error) => {
            console.error('Error saving checklist order:', error);
        }
    });

    const onUpdateChecklistOrder = () => {
        // Get the current state of checklists to ensure we have the latest reordered state
        setChecklists(currentChecklists => {
            const updateData = currentChecklists.map((checklist, idx) => ({
                id: checklist._id,
                order: idx + 1
            }));
            
            mutatePatchChecklists(updateData);
            return currentChecklists; // Return the same state since we're just using it for the update
        });
    };

    if (isLoading)
        return (
            <ChecklistLoadingState />
        );

    return (
        <Stack className="gap-10">
            <ChecklistHeader
                isEditing={isEditing}
                onEditMode={() => setIsEdting(true)}
                onAddNew={() => setIsDialogOpen(true)}
            />

            <ChecklistTable
                checklists={checklists}
                isEditing={isEditing}
                setChecklists={setChecklists}
            />

            <ChecklistActions
                isEditing={isEditing}
                onSave={onUpdateChecklistOrder}
                onReset={() => {
                    setIsEdting(false);
                    setChecklists([...checklistData]);
                    refetch();
                }}
                isSaving={isSaving}
            />

            <ChecklistModal
                isOpen={isDialogOpen}
                onClose={hideDialog}
                onSaveSuccess={(checklist) => {
                    setIsEdting(false);
                    hideDialog();
                    refetch()
                }}
            />
        </Stack>
    );
}


