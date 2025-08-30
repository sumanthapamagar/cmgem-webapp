import { useParams } from 'react-router-dom';
import { Stack } from '../../../components/layout/Stack';
import ProjectDetails from './ProjectDetails';
import { Equipmentsnavigation } from './Equipmentsnavigation';
import { ProjectProvder } from '../projectContext';

export default function ProjectRoot() {
    const { projectId } = useParams();
    return (
        <ProjectProvder projectId={projectId}>
            <Stack horizontal className=" relative">
                <Equipmentsnavigation />
                <ProjectDetails />
            </Stack>
        </ProjectProvder>
    );
}
