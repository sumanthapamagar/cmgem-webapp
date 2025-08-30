import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createChecklist, getChecklist, patchChecklist } from '../../../lib';

export const useChecklistForm = (id = null, onSaveSuccess) => {
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isValid }
    } = useForm({
        defaultValues: {
            title: '',
            description: '',
            category: []
        },
        mode: 'onChange'
    });

    const {
        data: checklistData,
        isLoading,
        error: queryError,
        refetch
    } = useQuery({
        queryKey: ['checklist', id],
        queryFn: () => getChecklist(id).then((data) => data),
        enabled: !!id
    });

    // Reset form when data is loaded
    useEffect(() => {
        if (checklistData) {
            console.log('Loading checklist data for editing:', checklistData);
            const formData = {
                title: checklistData.title || '',
                description: checklistData.description || '',
                category: (checklistData.category || '').split('; ').filter(Boolean)
            };
            console.log('Setting form data:', formData);
            reset(formData);
        }
    }, [checklistData, reset]);

    const { mutate: mutateCreateChecklist, error: mutationError } = useMutation({
        mutationFn: (data) =>
            id ? patchChecklist(id, data) : createChecklist(data),
        onSuccess: (res) => {
            onSaveSuccess(res.checklist);
            reset();
        }
    });

    const onSubmit = (data) => {
        mutateCreateChecklist({
            equipment_type: data.equipment_type,
            location: data.location,
            title: data.title,
            description: data.description || '',
            category: data.category.join('; ')
        });
    };

    return {
        control,
        handleSubmit,
        onSubmit,
        errors,
        isSubmitting,
        isValid,
        isLoading,
        queryError,
        mutationError
    };
};
