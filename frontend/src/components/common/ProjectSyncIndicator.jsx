import { useContext, useEffect, useMemo, useState } from 'react';
import { ProjectContext } from '../../features/projects/projectContext';
import { Online } from './Online';
import { Offline } from './Offline';
import { Button } from '../ui/button';
import { Dialog, DialogActions, DialogBody, DialogTitle, Text } from '../ui';
import localforage from 'localforage';
import { useOfflineImageUpload } from '../../hooks/useOfflineImageUpload';
import { useOfflineImageKeys } from '../../hooks/useOfflineImageKeys';
export const getProjectImageKeys = async (projectId) => {
    try {
        const keys = await localforage.keys();
        return keys.filter(key => key.startsWith(`photo_${projectId}`));
    } catch (error) {
        console.error("Failed to load keys from localforage:", error);
        return []; // Return an empty array on error to prevent UI crashes
    }
};
export const ProjectSyncIndicator = () => {
    const { offlineProject: project, saveAllChanges, off } = useContext(ProjectContext);
    const offlineImageUpload = useOfflineImageUpload(project._id);
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
    
    const {offlineImageKeys} = useOfflineImageKeys(project._id);


    // Add null check to prevent TypeError
    if ((!project || !project.has_local_changes) && offlineImageKeys.length === 0) {
        return null;
    }


    const openDialog = () => {
        setIsConfirmationOpen(true);
    }

    const closeDialog = () => {
        setIsConfirmationOpen(false);
    }

    const handleConfrim = async() => {
        await saveAllChanges();
        await offlineImageUpload.uploadAllImages(offlineImageKeys);
        closeDialog();
    }

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return date.toLocaleDateString();
    };

    
    return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2 m-2">
            <div className="flex flex-col gap-2 items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-yellow-800">
                            This project has unsaved changes
                        </p>
                        <p className="text-xs text-yellow-600">
                            Last modified: {formatTime(project.last_local_change)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Offline>
                        <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                            Offline
                        </span>
                    </Offline>
                    <Online>
                        <Button color="yellow" onClick={openDialog}>
                            Save all changes to server
                        </Button>
                    </Online>
                </div>
            </div>

            {
                isConfirmationOpen && (
                    <Dialog open={isConfirmationOpen} onClose={closeDialog}>
                        <DialogTitle>Save all changes to server?</DialogTitle>
                        <DialogBody>
                            <Text>This will overwrite all previous equuipments in the server.</Text>
                            <Text className="text-sm text-gray-500 bg-amber-200 px-2">
                                {offlineImageKeys.length} offline image(s) will be uploaded to the server.
                            </Text>
                            <Text>Are you sure you want to proceed?</Text>
                        </DialogBody>
                        <DialogActions>
                            <Button plain onClick={closeDialog}> 
                                Cancel
                            </Button>
                            <Button  onClick={handleConfrim}>
                                Save all changes to server
                            </Button>
                        </DialogActions>
                    </Dialog>)
            }
        </div>
    );
};
