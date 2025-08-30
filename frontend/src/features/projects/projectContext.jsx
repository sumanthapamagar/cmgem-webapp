import { createContext, useState, } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
    getProject,
    saveProject,
    saveProjectEquipments,
} from '../../lib/api';
import { offlineStorage, updateLastVisitedTimestamp } from '../../lib/offline-api';
import { Button, Dialog, DialogBody, DialogActions, DialogTitle, ProjectLoadingState } from '../../components';
import { projectKeys } from './projects';
import { useNetworkStatus } from '../../hooks';

const ProjectContext = createContext();

const ProjectProvder = ({ children, projectId }) => {
    const queryClient = useQueryClient();
    const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

    const { isOnline } = useNetworkStatus();

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


    console.log('offlineProject', offlineProject);
    console.log('project online', projectQuery.data);

    if (projectQuery.isLoading || offlineProjectQuery.isLoading && !projectQuery.data) {
        return <ProjectLoadingState />;
    }
    if (!offlineProject && !projectQuery.data) return <div>Project not found</div>;

    if (!offlineProject && projectQuery.isError) return <div>Error loading project</div>;

    return (
        <ProjectContext.Provider
            value={{
                checklists: offlineProject?.checklists ?? [],
                offlineProjectQuery,
                projectQuery,
                offlineProject: hasLocalChanges ? offlineProject : (projectQuery.data || offlineProject),
                onlineProject: projectQuery.data,
                projectMutation,
                submitStatus,
                setSubmitStatus,
                saveAllChanges: projectEquipmentsMutation.mutate,
            }}
        >
            {(projectEquipmentsMutation.isPending || projectEquipmentsMutation.isSuccess) && (
                <Dialog open={true} onClose={() => { }}>
                    <DialogTitle>
                        {projectEquipmentsMutation.isPending
                            ? 'Saving Offline Changes to server...'
                            : 'All changes saved to server'
                        }
                    </DialogTitle>
                    <DialogBody>
                        {projectEquipmentsMutation.isPending ? (
                            <p>Please wait while we save your changes to the server.</p>
                        ) : (
                            <p>All changes have been saved to the server.</p>
                        )}
                    </DialogBody>
                    {projectEquipmentsMutation.isSuccess && (
                        <DialogActions>
                            <Button onClick={() => projectEquipmentsMutation.reset()}>
                                Close
                            </Button>
                        </DialogActions>
                    )}
                </Dialog>
            )}
            {children}

        </ProjectContext.Provider>
    );
};

export { ProjectContext, ProjectProvder };