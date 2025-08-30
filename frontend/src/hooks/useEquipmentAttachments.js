import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

/**
 * Custom hook to fetch equipment attachments
 * @param {string} equipmentId - The equipment ID
 * @param {Object} options - TanStack Query options
 * @returns {Object} Query result with equipment attachments data
 */
export const useEquipmentAttachments = (equipmentId, options = {}) => {
    return useQuery({
        queryKey: ['equipment-attachments', equipmentId],
        queryFn: () => api.attachments.getEquipmentAttachments(equipmentId),
        enabled: !!equipmentId, // Only run query if equipmentId is provided
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        ...options
    });
};
