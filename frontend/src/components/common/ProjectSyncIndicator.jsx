import { useContext, useState } from 'react';
import { ProjectContext } from '../../features/projects/projectContext';
import { useNetworkStatus } from '../../hooks';
import { Online } from './Online';
import { Offline } from './Offline';
import { Button } from '../ui/button';
import { Dialog, DialogActions, DialogBody, DialogTitle } from '../ui';

export const ProjectSyncIndicator = () => {
    const { offlineProject: project, saveAllChanges } = useContext(ProjectContext);

    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
    
    if (!project.has_local_changes) {
        return null;
    }

    const openDialog = () => {
        setIsConfirmationOpen(true);
    }

    const closeDialog = () => {
        setIsConfirmationOpen(false);
    }

    const handleConfrim = () => {
        saveAllChanges();
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
                            This will overwrite all previous equuipments in the server.
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
