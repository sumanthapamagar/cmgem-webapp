import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { createProject } from '../../../lib/api';
import { Button } from '../../../components';
import ProjectForm from '../ProjectForm';

const NewProjectForm = ({ hideDialog }) => {
    const navigate = useNavigate();

    const { mutate: onCreateProject, isPending } = useMutation({
        mutationFn: (project) => {
            return createProject(project);
        },
        onSuccess: (data, variables, context) => {
            if (data._id) {
                navigate(`/projects/${data._id}`);
            }
        }
    });

    const handleSubmit = (data) => {
        onCreateProject(data);
    };

    return (
        <div className="p-2 sm:p-4 lg:p-8">
            <ProjectForm
                onSubmit={handleSubmit}
                isPending={isPending}
                isOnline={true}
                hasLocalChanges={false}
                defaultValues={{}}
                submitButtonText="Create Project"
                submitButtonDisabled={false}
            >
                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" outline onClick={hideDialog}>
                        Cancel
                    </Button>
                    <Button type="submit" onClick={handleSubmit}>
                        Create Project
                    </Button>
                </div>
            </ProjectForm>
        </div>
    );
};

export default NewProjectForm;
