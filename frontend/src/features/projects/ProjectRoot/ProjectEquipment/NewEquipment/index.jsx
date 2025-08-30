import { useContext, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';


import { Button, Input, Modal, Stack, Select, Field, Label } from '../../../../../components';
import equipmentTypes from '../../../../../constants/elevatorTypes';
import { ProjectContext } from '../../../projectContext';
import { useParams } from 'react-router-dom';
import { useOfflineEquipmentUpdate } from '../../../../../hooks';

export function NewEquipment() {
    const { projectId } = useParams();
    const { offlineProject: project } = useContext(ProjectContext);
    const { addNewEquipment } = useOfflineEquipmentUpdate();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const hideDialog = () => setIsDialogOpen(false);
    const onOpen = () => setIsDialogOpen(true);

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            category: '',
            start_floor: '',
            name: '',
            floors_served: '',
        }
    });

    const { mutate: onCreateEquipment, isPending } = useMutation({
        mutationFn: (data) => addNewEquipment(projectId, data),
        onSuccess: (data) => {
            // Reset form and close dialog on success
            reset();
            hideDialog();
            // Optionally refresh the project data or navigate
        },
        onError: (error) => {
            console.error('Failed to create equipment:', error);
        }
    });

    if (!project) return null;

    return (
        <>
            <Button onClick={onOpen} color="sky">
                <i className="fa-solid fa-plus mr-2"></i>
                New Equipment
            </Button>

            {isDialogOpen && (
                <Modal open={isDialogOpen} hideDialog={hideDialog} title="Add New Equipment" size="xl">
                    <form onSubmit={handleSubmit(onCreateEquipment)}>
                        <Stack className="gap-6 ">
                            <Field>
                                <div className="flex items-center gap-4">
                                    <Label className="w-32">Equipment Type</Label>
                                    <Select
                                        {...register('category', { required: 'Equipment type is required' })}
                                    >
                                        {equipmentTypes.map((type) => (
                                            <option key={type.key} value={type.key}>
                                                {type.text}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                                {errors.category && (
                                    <span className="text-red-500 text-sm">{errors.category.message}</span>
                                )}
                            </Field>
                            <Field>
                                <div className="flex items-center gap-4">
                                    <Label className="w-32">Equipment Name</Label>
                                    <Input
                                        {...register('name', { required: 'Equipment name is required' })}
                                        placeholder="Enter equipment name"
                                    />
                                </div>
                                {errors.name && (
                                    <span className="text-red-500 text-sm">{errors.name.message}</span>
                                )}
                            </Field>
                            <Field>
                                <div className="flex items-center gap-4">
                                    <Label className="w-32">Start Floor</Label>
                                    <Input
                                        {...register('start_floor', {
                                            required: 'Start floor is required',
                                            min: { value: 0, message: 'Start floor must be 0 or greater' }
                                        })}
                                        type="number"
                                        placeholder="Enter start floor"
                                    />
                                </div>
                                {errors.start_floor && (
                                    <span className="text-red-500 text-sm">{errors.start_floor.message}</span>
                                )}
                            </Field>
                            <Field>
                                <div className="flex items-center gap-4">
                                    <Label className="w-32">Floors Served</Label>
                                    <Input
                                        {...register('floors_served', {
                                            required: 'Number of floors served is required',
                                            min: { value: 2, message: 'Must serve at least 2 floors' }
                                        })}
                                        type="number"
                                        placeholder="Enter number of floors"
                                    />
                                </div>
                                {errors.floors_served && (
                                    <span className="text-red-500 text-sm">{errors.floors_served.message}</span>
                                )}
                            </Field>
                            <div className="flex justify-end gap-4 pt-4">
                                <Button type="button" outline onClick={hideDialog}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isPending}>
                                    {isPending ? 'Adding...' : 'Add Equipment'}
                                </Button>
                            </div>
                        </Stack>
                    </form>
                </Modal>
            )}
        </>
    );
}   