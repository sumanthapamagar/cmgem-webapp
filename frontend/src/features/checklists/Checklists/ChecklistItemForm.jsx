import { useEffect, useState } from 'react';
import { Select, Textarea  , Field, Label, Stack, Button, Input, ChecklistLoadingState } from '../../../components';
import locationCategories from '../../../constants/locationCategories';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createChecklist, getChecklist, patchChecklist } from '../../../lib';
import { useParams } from 'react-router-dom';

function ChecklistItemForm({ id = null, onCancel, onSaveSuccess }) {
    const { equipmentType, location } = useParams();
    const [category, setCategory] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const {
        data: checklistData,
        isLoading
    } = useQuery({
        queryKey: ['checklist', id],
        queryFn: () =>
            getChecklist(id).then((data) => {
                return data;
            }),
        enabled: !!id
    });

    useEffect(() => {
        if (checklistData?.checklist) {
            setTitle(checklistData.checklist.title);
            setDescription(checklistData.checklist.description);
            setCategory((checklistData.checklist.category || '').split('; '));
        }
    }, [checklistData?.checklist]);

    const { mutate: mutateCreateChecklist } = useMutation({
        mutationFn: (data) =>
            id ? patchChecklist(id, data) : createChecklist(data),
        onSuccess: (res) => {
            setCategory([]);
            setTitle('');
            setDescription('');
            onSaveSuccess(res.checklist);
        }
    });

    const onSaveChecklist = () => {
        if (title) {
            mutateCreateChecklist({
                equipment_type: equipmentType,
                location,
                title,
                description,
                category: category.join('; ')
            });
        }
    };
    if (isLoading)
        return (
            <ChecklistLoadingState />
        );
    return (
        <Stack className='w-full m-4 md:w-[600px] gap-4'>
            <div className="flex items-start">
                <Field className='w-full flex gap-4'>
                    <Label className="w-32 pt-2 text-sm font-medium">Title</Label>
                    <Input
                        value={title}
                        onChange={(ev) => setTitle(ev.target.value)}
                        placeholder="Enter checklist item title"
                        className="w-full"
                    />
                </Field>
            </div>

            <div className="flex items-start">
                <Field className='w-full flex gap-4'>
                    <Label className="w-32 text-sm pt-2 font-medium">Description</Label>
                    <Textarea
                        rows={3}
                        value={description}
                        onChange={(ev) => setDescription(ev.target.value)}
                        placeholder="Enter checklist item description"
                        className="w-full"
                    />
                </Field>
            </div>

            <div className="flex items-start">
                <Field className='w-full flex gap-4'>
                    <Label className="w-32 text-sm font-medium pt-2">Item Category</Label>
                    <Select
                        placeholder="Category"
                        value={category}
                        onChange={(value) => setCategory(value)}
                        multiple
                    >
                        {
                            locationCategories.map((category) => (
                                <option key={category.key} value={category.text}>
                                    {category.text}
                                </option>
                            ))
                        }
                    </Select>
                </Field>
            </div>

            <Stack horizontal className="justify-end gap-4 mt-8">
                <Button onClick={onSaveChecklist}>
                    {!id ? 'Create' : 'Save'}
                </Button>
                <Button onClick={onCancel} variant="outline">
                    Cancel
                </Button>
            </Stack>
        </Stack>
    );
}

export default ChecklistItemForm;
