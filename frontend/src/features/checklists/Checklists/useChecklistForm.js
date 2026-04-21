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
            priority1Default: '',
            priority2Default: '',
            passDefault: '',
            naDefault: '',
            noteDefault: '',
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
                priority1Default: checklistData.priority1Default || '',
                priority2Default: checklistData.priority2Default || '',
                passDefault: checklistData.passDefault || '',
                naDefault: checklistData.naDefault || '',
                noteDefault: checklistData.noteDefault || '',
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
            onSaveSuccess(res);
            reset();
        }
    });

    const onSubmit = (data) => {
        mutateCreateChecklist({
            equipment_type: data.equipment_type,
            location: data.location,
            title: data.title,
            description: data.description || '',
            category: data.category.join('; '),
            priority1Default: data.priority1Default || '',
            priority2Default: data.priority2Default || '',
            passDefault: data.passDefault || '',
            naDefault: data.naDefault || '',
            noteDefault: data.noteDefault || ''
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
