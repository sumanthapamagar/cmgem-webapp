import { useQuery } from '@tanstack/react-query';
import { getStorageSasToken } from '../lib/api';

export const useSasToken = (equipmentId) => {
    return useQuery({
        queryKey: ['storage-sas-token', equipmentId],
        queryFn: async () => {
            const res = getStorageSasToken(equipmentId, 24);
            await new Promise(resolve => setTimeout(resolve, 3000));
            return res;
        },
        staleTime: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        gcTime: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchInterval: false,
        refetchIntervalInBackground: false,
    });
};