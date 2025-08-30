import { useContext } from 'react';
import { Navigation, Offline, Online, ProjectSyncIndicator, Stack } from '../../../components';
import { ProjectContext } from '../projectContext';
import { useParams } from 'react-router-dom';
import { NewEquipment } from './ProjectEquipment/NewEquipment';

export function Equipmentsnavigation() {
    const { projectId } = useParams();
    const { offlineProject: project } = useContext(ProjectContext);

    const navigation = [
        {
            title: 'Building Details',
            href: `/projects/${projectId}`,
            iconClass: 'fa-solid fa-building  fa-fw mr-2',
            key: 'project-details'
        }
    ];

    project?.equipments?.map((equipment) =>
        navigation.push({
            title: equipment.name,
            iconClass: 'fa-solid fa-fw fa-elevator mr-2',
            key: `${equipment._id}`,
            href: `/projects/${project._id}/equipments/${equipment._id}/information`,
            links: [
                {
                    title: 'Lift Information',
                    href: `/projects/${project._id}/equipments/${equipment._id}/information`,
                    key: `${equipment._id}-lift`
                },
                {
                    title: 'Site Details',
                    href: `/projects/${project._id}/equipments/${equipment._id}/site`,
                    key: `${equipment._id}-site`
                },
                {
                    title: 'Lift Inspection',
                    href: `/projects/${project._id}/equipments/${equipment._id}/inspection`,
                    key: `${equipment._id}-inspection`
                },
                {
                    title: 'Floor Table',
                    href: `/projects/${project._id}/equipments/${equipment._id}/floor-table`,
                    key: `${equipment._id}-floors`
                }
            ]
        })
    );

    if (!project) return null;

    return (
        <div className="sticky flex flex-col top-[32px] h-[calc(100vh-56px)] bg-neutral-200 overflow-x-clip overflow-y-auto  w-64 min-w-64 border-r border-slate-300">
            <Stack className="sticky top-0 z-10 bg-neutral-200">
                <Offline>
                    <div className='text-sm font-semibold p-4 lg:p-6 border-b border-harper-blue'>
                        {project.name}
                    </div>
                </Offline>
                <Online>
                    <ProjectSyncIndicator className="place-self-end" />
                </Online>
            </Stack>
            <div
                id="sidebar"
                className="text-slate-900 grow p-4 lg:p-6 space-y-6"
            >
                <Navigation navigation={navigation} />
                <NewEquipment />
            </div>
        </div>
    );
};

