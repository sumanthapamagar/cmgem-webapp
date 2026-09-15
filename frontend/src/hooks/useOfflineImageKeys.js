import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import localforage from "localforage";

export const useOfflineImageKeys = (projectId, equipmentId=null, inspectionItemId=null) => {
  const queryClient = useQueryClient();
  const queryKey =["offlineImageKeys", projectId, equipmentId, inspectionItemId]

  const fetchKeys = async () => {
    const keys = await localforage.keys();
    if( equipmentId && inspectionItemId) {
      const match = `photo_${projectId}_${equipmentId}_${inspectionItemId}_`;
      const filteredKeys = keys.filter((key) => key.includes(match));
      return filteredKeys;
    }
    if( equipmentId ) {
        const match = `photo_${projectId}_${equipmentId}_`;
        const filteredKeys = keys.filter((key) => key.includes(match));
        return filteredKeys;
    }
    return keys.filter((key) => key.startsWith(`photo_${projectId}_`));
  };

  const offlineImageKeysQuery = useQuery({
    queryKey,
    queryFn: fetchKeys,
    enabled: Boolean(projectId),
    refetchOnWindowFocus: false,
  });

  const setOfflineImageKeys = keys => {
    queryClient.setQueryData(queryKey, 
      keys
    )
  }

  // Current reactive state for JSX
  const keys = offlineImageKeysQuery.data ?? [];

  // ==========================================
  // 1. Sync Getters (For JSX rendering only)
  // Reactively updates whenever the hook re-renders
  // ==========================================
  const getEquipmentKeys = useCallback(
    (equipmentId) => {
      const match = `photo_${projectId}_${equipmentId}_`;
      return keys.filter((key) => key.includes(match));
    },
    [keys, projectId]
  );

  const getInspectionItemKeys = useCallback(
    (equipmentId, inspectionItemId) => {
      const match = `photo_${projectId}_${equipmentId}_${inspectionItemId}_`;
      return keys.filter((key) => key.includes(match));
    },
    [keys, projectId]
  );

  // ==========================================
  // 2. Async Getters (Always bypasses stale cache)
  // fetchQuery forces an execution or joins an active refetch
  // ==========================================
  const fetchFreshKeys = useCallback(async () => {
    return await queryClient.fetchQuery({
      queryKey,
      queryFn: fetchKeys,
      staleTime: 0, // Guarantees a fresh read from localforage
    });
  }, [queryClient, queryKey]);

  const getEquipmentKeysAsync = useCallback(
    async (equipmentId) => {
      const freshKeys = await fetchFreshKeys();
      const match = `photo_${projectId}_${equipmentId}_`;
      return freshKeys.filter((key) => key.includes(match));
    },
    [fetchFreshKeys, projectId]
  );

  const getInspectionItemKeysAsync = useCallback(
    async (equipmentId, inspectionItemId) => {
      const freshKeys = await fetchFreshKeys();
      const match = `photo_${projectId}_${equipmentId}_${inspectionItemId}_`;
      return freshKeys.filter((key) => key.includes(match));
    },
    [fetchFreshKeys, projectId]
  );

  return {
    offlineImageKeys: keys,
    offlineImageKeysQuery,
    // Sync (Render/JSX)
    getEquipmentKeys,
    getInspectionItemKeys,
    setOfflineImageKeys,
    // Async (Handlers, side-effects, after refetch)
    getEquipmentKeysAsync,
    getInspectionItemKeysAsync,
    refetchOfflineImages: offlineImageKeysQuery.refetch
  };
};