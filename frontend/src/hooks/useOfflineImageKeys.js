import { useQuery } from "@tanstack/react-query";
import localforage from "localforage";

export const useOfflineImageKeys = (projectId) => {

  const queryKey = ["offlineImageKeys", projectId]

  const fetchProjectImagesKeys = async () => {
    const keys = await localforage.keys();
    return keys.filter(key => key.includes(`photo_${projectId}_`))
  };

  const offlineImageKeysQuery = useQuery({
    queryKey,
    queryFn: fetchProjectImagesKeys,
    refetchOnWindowFocus: false,
  });

  return {
    offlineProjectImages: offlineImageKeysQuery.data ?? []
  };
};