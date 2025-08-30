import { useContext } from 'react';

import { Button, NotificationBanner } from '../../../components';
import { useNetworkStatus } from '../../../contexts/NetworkStatusContext';
import dayjs from 'dayjs';
import { ProjectContext } from '../projectContext';
import { useParams } from 'react-router-dom';
import ProjectForm from '../ProjectForm';

export function ProjectUpdate() {
    const { projectId } = useParams();
    const { offlineProject: project, projectMutation, submitStatus, setSubmitStatus } = useContext(ProjectContext);
    const { isOnline } = useNetworkStatus();

    const handleSubmit = (data) => {
        setSubmitStatus({ type: '', message: '' }); // Clear previous status
        projectMutation.mutate({
            id: projectId,
            ...data
        });
    };

    // Prepare default values for the form
    const defaultValues = project ? {
        name: project.name || '',
        category: project.category || '',
        address: {
            street_1: project.address?.street_1 || '',
            street_2: project.address?.street_2 || '',
            city: project.address?.city || '',
            post_code: project.address?.post_code || '',
            state: project.address?.state || '',
            country: project.address?.country || ''
        },
        inspection_date: project.inspection_date ? dayjs(project.inspection_date).format('YYYY-MM-DD') : '',
        account: project.account ? {
            _id: project.account._id,
            name: project.account.name
        } : null,
        is_test: project.is_test || false
    } : {};

    return (
        <>
            {/* Status Messages */}
            {submitStatus.message && (
                <NotificationBanner
                    type={submitStatus.type}
                    message={submitStatus.message}
                    onClose={() => setSubmitStatus({ type: '', message: '' })}
                    autoClose={submitStatus.type === 'success'}
                    autoCloseDelay={5000}
                    className="mb-4 mx-8"
                />
            )}

            {project?.has_local_changes && (
                <NotificationBanner
                    type="warning"
                    message="You have local changes that are not saved. Please save them before updating the project."
                    onClose={() => setSubmitStatus({ type: '', message: '' })}
                    autoClose={false}
                />
            )}

            <ProjectForm
                onSubmit={handleSubmit}
                isPending={projectMutation.isPending}
                isOnline={isOnline}
                hasLocalChanges={project?.has_local_changes}
                defaultValues={defaultValues}
                submitButtonText="Save"
                submitButtonDisabled={false}
            >

                <div className="flex py-8 border-t ">
                    <Button
                        type="submit"
                        color='blue'
                        className='w-32'
                        disabled={!isOnline || projectMutation.isPending || project?.has_local_changes}
                    >
                        {!isOnline ? 'Offline - Save Disabled' : (projectMutation.isPending ? (
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Saving...
                            </div>
                        ) : 'Save')}
                    </Button>
                </div>
            </ProjectForm>
        </>
    );
}
