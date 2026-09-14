import { createContext, useEffect, useState, } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
    getProject,
    saveProject,
    saveProjectEquipments,
} from '../../lib/api';
import { offlineStorage, updateLastVisitedTimestamp } from '../../lib/offline-api';
import { Button, Dialog, DialogBody, DialogActions, DialogTitle, ProjectLoadingState, LoadingBar, Text } from '../../components';
import { projectKeys } from './projects';
import { useNetworkStatus } from '../../contexts/NetworkStatusContext';
import { useChecklists } from '../../hooks/useChecklists';
import { ProgressBar } from '../../components/common/ProgressBar';

const ProjectContext = createContext();

const ProjectProvder = ({ children, projectId }) => {
    const queryClient = useQueryClient();
    const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

    const [totalOfflineImages, setTotalOfflineImages] = useState(0);
    const [uploadedOfflineImages, setUploadedOfflineImages] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [isUploadingCompleted, setIsUploadingCompleted] = useState(false);

    const { isOnline } = useNetworkStatus();

    // Get checklists using the new offline-first approach
    const { data: checklistsData, isLoading: isLoadingChecklists } = useChecklists();

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
        setIsUploading(false);
        setIsUploadingCompleted(false);
        projectEquipmentsMutation.reset();
        setUploadedOfflineImages(0);
    }


    if (projectQuery.isLoading || offlineProjectQuery.isLoading && !projectQuery.data) {
        return <ProjectLoadingState />;
    }

    if (!offlineProject && !projectQuery.data) return <div>Project not found</div>;

    if (!offlineProject && projectQuery.isError) return <div>Error loading project</div>;

    // Get checklists from the new service
    const checklists = checklistsData?.checklists || [];

    const isDialogOpen = projectEquipmentsMutation.isPending || projectEquipmentsMutation.isSuccess || isUploading || isUploadingCompleted;
    const isSyncComplete = (!hasLocalChanges || projectEquipmentsMutation.isSuccess) && (totalOfflineImages == uploadedOfflineImages)
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
                setIsUploading,
                setIsUploadingCompleted,
                setSubmitStatus,
                saveAllChanges: projectEquipmentsMutation.mutate,
                setTotalOfflineImages,
                setUploadedOfflineImages,
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
                        {projectEquipmentsMutation.isPending ?? (
                            <p>Saving Project equipments updates</p>
                        )}
                        {projectEquipmentsMutation.isSuccess ?? (
                            <p>Project Equipments updated successfully!</p>
                        )}

                        {
                             totalOfflineImages > 0 && (
                                <div>
                                    <p>{uploadedOfflineImages != totalOfflineImages ? "Uploading offline images..." : "All pictures saved to server"}</p>
                                    <ProgressBar completed={(uploadedOfflineImages / totalOfflineImages)}>
                                        <Text>Uploaded {uploadedOfflineImages} of {totalOfflineImages} pictures</Text>
                                    </ProgressBar>
                                </div>
                            )
                        }
                        
                        { projectEquipmentsMutation.isSuccess && (
                            <p>Project Equipments updated successfully!</p>
                        )}


                    </DialogBody>
                    {(isSyncComplete) && (
                        <DialogActions>
                            <Button onClick={onCloseDialog}>
                                Close
                            </Button>
                        </DialogActions>
                    )}
                </Dialog>
            {children}

        </ProjectContext.Provider>
    );
};

export { ProjectContext, ProjectProvder };