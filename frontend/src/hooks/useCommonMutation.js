import { useMutation, useQueryClient } from '@tanstack/react-query';
import {  patchEquipment, patchFloor,  postImage } from '../lib/api';

export const useCommonMutation = ({
    mutationFn,
    mutationKey,
    onSuccess,
    onError,
    onSettled,
    invalidateQueries = [],
    showSuccessMessage = false,
    showErrorMessage = true
}) => {

    const queryClient = useQueryClient();

    const handleSuccess = (data, variables, context) => {
        // Invalidate specified queries
        invalidateQueries.forEach(queryKey => {
            queryClient.invalidateQueries({ queryKey });
        });

        // Call custom onSuccess if provided
        if (onSuccess) {
            onSuccess(data, variables, context);
        }

    };

    const handleError = (error, variables, context) => {
        // Call custom onError if provided
        if (onError) {
            onError(error, variables, context);
        }

        // Show error message if enabled
        if (showErrorMessage) {
            console.error('Operation failed:', error);
        }
    };

    const handleSettled = (data, error, variables, context) => {
        // Call custom onSettled if provided
        if (onSettled) {
            onSettled(data, error, variables, context);
        }
    };

    return useMutation({
        mutationFn,
        mutationKey,
        onSuccess: handleSuccess,
        onError: handleError,
        onSettled: handleSettled
    });
};

// Specific mutation hooks for common operations
export const useCreateMutation = (options) => {
    return useCommonMutation({
        ...options,
        showSuccessMessage: true
    });
};

export const useUpdateMutation = (options) => {
    return useCommonMutation({
        ...options,
        showSuccessMessage: true
    });
};

export const useDeleteMutation = (options) => {
    return useCommonMutation({
        ...options,
        showSuccessMessage: true,
        showErrorMessage: true
    });
};

// Domain-specific mutation hooks
export const useProjectMutation = ({ projectId, field }) => {
    return useCommonMutation({
        mutationFn: (data) => saveProject(projectId, { [field]: data }),
        mutationKey: ['project', projectId, field],
        invalidateQueries: [['project', projectId], ['projects']],
        showSuccessMessage: true
    });
};

export const useEquipmentMutation = ({ projectId, equipmentId }) => {
    return useCommonMutation({
        mutationFn: (equipment) => patchEquipment(projectId, equipmentId, equipment),
        mutationKey: ['equipment', projectId, equipmentId],
        invalidateQueries: [['project', projectId], ['equipments', projectId]],
        showSuccessMessage: true
    });
};

export const useFloorMutation = ({ projectId, equipmentId, floorId }) => {
    return useCommonMutation({
        mutationFn: (floor) => patchFloor(projectId, floorId, floor),
        mutationKey: ['floor', projectId, equipmentId, floorId],
        invalidateQueries: [['equipments', projectId]],
        showSuccessMessage: true
    });
};

export const useImageMutation = ({ projectId, equipmentId }) => {
    return useCommonMutation({
        mutationFn: ({file, data}) => {
            // Create FormData from the data object
            const formData = new FormData();
            formData.append('file', file);
            formData.append('group_id', data.group_id);
            formData.append('inspection_item', data.inspection_item);
            
            return postImage(projectId, equipmentId, formData);
        },
        invalidateQueries: [['equipments', projectId]],
        showSuccessMessage: true
    });
};