import { createContext, useState, } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
    getProject,
    saveProject,
    saveProjectEquipments,
} from '../../lib/api';
import { offlineStorage, updateLastVisitedTimestamp } from '../../lib/offline-api';
import { Button, Dialog, DialogBody, DialogActions, DialogTitle, ProjectLoadingState, LoadingBar, Text, Stack } from '../../components';
import { projectKeys } from './projects';
import { useNetworkStatus } from '../../contexts/NetworkStatusContext';
import { useChecklists } from '../../hooks/useChecklists';
import { ProgressBar } from '../../components/common/ProgressBar';
import { useOfflineImageUpload } from '../../hooks/useOfflineImageUpload';

const ProjectContext = createContext();

const ProjectProvder = ({ children, projectId }) => {
    const queryClient = useQueryClient();
    const offlineImageUpload = useOfflineImageUpload(projectId)

    const { isOnline } = useNetworkStatus();
    const { data: checklistsData, isLoading: isLoadingChecklists } = useChecklists();

    const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });


    const { data: offlineProject, ...offlineProjectQuery } = useQuery({
        queryKey: ['offline-project', projectId],
        queryFn: () => offlineStorage.getProject(projectId)
    });

    const isLoadingOfflineProject = offlineProjectQuery.isPending;
    const hasLocalChanges = offlineProject?.has_local_changes || false;

    const canFetchOnlineProject = isOnline && !isLoadingOfflineProject && (!offlineProject || !hasLocalChanges);
    
    // Online project query (fallback and sync) - only when online and no local changes
    const projectQuery = useQuery({
        queryKey: projectKeys.detail(projectId),
        queryFn: () => getProject(projectId).then(async (project) => {
            await offlineStorage.saveProject(project, true);
            // Update last visited timestamp when project is successfully fetched from server
            await updateLastVisitedTimestamp(projectId);
            offlineProjectQuery.refetch();
            return project;
        }),
        enabled: canFetchOnlineProject,
        refetchOnWindowFocus: false,
        staleTime: 0,
        gcTime: 0, // Previously cacheTime in older versions
    });

    const projectEquipmentsMutation = useMutation({
        mutationFn: () => saveProjectEquipments(offlineProject.equipments),
        onSuccess: () => {
            setSubmitStatus({ type: 'success', message: 'Project equipments saved successfully!' });
            //delete the project from local storage
            offlineStorage.deleteProject(projectId);
            queryClient.invalidateQueries({ queryKey: ['offline-project', projectId] });
        },
    });


    // Update project mutation
    const projectMutation = useMutation({
        mutationFn: (data) => saveProject(offlineProject._id, data),
        onSuccess: () => {
            setSubmitStatus({ type: 'success', message: 'Project details updated successfully!' });

            setTimeout(() => setSubmitStatus({ type: '', message: '' }), 5000);
        },

    });

    const onCloseDialog = () => {
        offlineImageUpload.resetCount();
        projectEquipmentsMutation.reset();
    }


    if (projectQuery.isLoading || offlineProjectQuery.isLoading && !projectQuery.data) {
        return <ProjectLoadingState />;
    }

    if (!offlineProject && !projectQuery.data) return <div>Project not found</div>;

    if (!offlineProject && projectQuery.isError) return <div>Error loading project</div>;

    // Get checklists from the new service
    const checklists = checklistsData?.checklists || [];

    const isDialogOpen = projectEquipmentsMutation.isPending || projectEquipmentsMutation.isSuccess || offlineImageUpload.isUploading || offlineImageUpload.isUploadingCompleted;
    const isSyncComplete = (!hasLocalChanges || projectEquipmentsMutation.isSuccess) && (offlineImageUpload.totalOfflineImages == 0 || offlineImageUpload.isUploadingCompleted)
    
    return (
        <ProjectContext.Provider
            value={{
                checklists,
                isLoadingChecklists,
                offlineProjectQuery,
                projectQuery,
                offlineProject: hasLocalChanges ? offlineProject : (projectQuery.data || offlineProject),
                onlineProject: projectQuery.data,
                projectMutation,
                submitStatus,
                offlineImageUpload,
                setSubmitStatus,
                saveAllChanges: projectEquipmentsMutation.mutate,
            }}
        >
                <Dialog open={isDialogOpen} onClose={() => { }}>
                    <DialogTitle>
                        {projectEquipmentsMutation.isPending
                            ? 'Saving Offline Changes to server...'
                            : 'All changes saved to server.'
                        }
                    </DialogTitle>
                    <DialogBody>
                        <Stack className="gap-4">
                            {projectEquipmentsMutation.isPending ?? (
                                <p>Saving Project equipments updates</p>
                            )}

                            { projectEquipmentsMutation.isSuccess && (
                                <p>Equipment data synced successfully!</p>
                            )}

                            {
                                offlineImageUpload.totalOfflineImages > 0 && (
                                    <div>
                                        {offlineImageUpload.isUploading &&  <p>Uploading offline images...</p>}
                                        {offlineImageUpload.uploadedOfflineImages == offlineImageUpload.totalOfflineImages && <p>All pictures saved to server</p>}
                                        
                                        <ProgressBar completed={(offlineImageUpload.uploadedOfflineImages / offlineImageUpload.totalOfflineImages)}>
                                            <Text>Uploaded {offlineImageUpload.uploadedOfflineImages} of {offlineImageUpload.totalOfflineImages} pictures</Text>
                                        </ProgressBar>
                                    </div>
                                )
                            }
                            {
                                offlineImageUpload.failedUploads > 0 && (
                                    <Text className="bg-yellow-300">Failed to upload {offlineImageUpload.failedUploads} pictures.</Text>
                                )
                            } 
                        </Stack>
                    </DialogBody>
                    {(isSyncComplete) && (
                        <DialogActions>
                            <Button plain onClick={onCloseDialog}>
                                Close
                            </Button>
                            {offlineImageUpload.failedUploads > 0 && (
                                <Button onClick={offlineImageUpload.uploadAllImages}>
                                    Retry upload
                                </Button>
                            )}
                        </DialogActions>
                    )}
                </Dialog>
            {children}

        </ProjectContext.Provider>
    );
};

export { ProjectContext, ProjectProvder };