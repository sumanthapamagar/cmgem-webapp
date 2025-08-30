import { useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import locations from '../../../../../constants/locations';

import { Stack } from '../../../../../components';
import { ProjectContext } from '../../../projectContext';

import InspectionItem from './InspectionItem';
import { useEquipment } from '../../../../../hooks';
import { EquipmentNotFound, EquipmentLoadingState } from '../components';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';

// Custom hook to manage equipment checklists
const useEquipmentChecklists = (equipment, projectChecklists) => {
    return useMemo(() => {
        if (!equipment?.category || !projectChecklists) return [];

        return locations.map(({ key, text }) => ({
            key,
            text,
            checklists: projectChecklists
                .filter(item => item.equipment_type === equipment.category && item.location === key)
                .sort((a, b) => a.order - b.order)
        })).filter(location => location.checklists.length > 0); // Only show locations with checklists
    }, [equipment?.category, projectChecklists]);
};

export function EquipmentInspection() {
    const { projectId, equipmentId } = useParams();
    const { offlineProject: project, checklists: projectChecklists } = useContext(ProjectContext);

    // Use reusable hooks
    const { equipment } = useEquipment(equipmentId);
    const equipmentChecklists = useEquipmentChecklists(equipment, projectChecklists);

    // Loading state
    if (!project || !projectChecklists) {
        return <EquipmentLoadingState message="Loading project data..." />;
    }

    // Equipment not found
    if (!equipment) {
        return <EquipmentNotFound />;
    }

    // No checklists available
    if (equipmentChecklists.length === 0) {
        return (
            <Stack className="h-[calc(100vh-150px)] items-center justify-center">
                <div className="text-center">
                    <div className="text-blue-500 text-xl mb-2">ℹ️</div>
                    <span className="text-gray-600">No inspection checklists available</span>
                    <p className="text-sm text-gray-500 mt-1">No checklists are configured for this equipment type and location.</p>
                </div>
            </Stack>
        );
    }

    return (
        <TabGroup>
            <TabList className="sticky top-0 z-10 flex bg-alice-blue p-2 gap-4 rounded-full ">
                {equipmentChecklists.map(({ key, text, checklists }) => (
                    <Tab
                        key={key}
                        className="px-6 data-selected:px-8 data-selected:bg-true-navy rounded-full data-selected:text-alice-blue px-2 py-2 data-selected:rounded-full data-selected:text-base  text-sm/6 font-semibold focus:not-data-focus:outline-none bg-harper-blue transition-all duration-200 cursor-pointer whitespace-nowrap flex-shrink-0"
                        aria-label={`${text} inspection items (${checklists.length} items)`}
                    >
                        {text}
                        <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                            {checklists.length}
                        </span>
                    </Tab>
                ))}
            </TabList>

            <TabPanels className="mt-6">
                {equipmentChecklists.map(({ key, checklists }) => (
                    <TabPanel
                        key={key}
                        className="rounded-xl bg-platinum border border-gray-300 flex flex-col divide-y divide-slate-300"
                        aria-label={`${key} inspection panel`}
                    >
                        {checklists.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                No inspection items available for this location.
                            </div>
                        ) : (
                            checklists.map((inspectionItem, idx) => (
                                <InspectionItem
                                    key={`${equipment._id}-${inspectionItem._id}`}
                                    inspectionItem={inspectionItem}
                                    equipment={equipment}
                                />
                            ))
                        )}

                        {/* Debug information in development */}
                        {process.env.NODE_ENV === 'development' && (
                            <div className="mt-4 p-4 bg-gray-100 rounded-sm">
                                <h3 className="font-semibold mb-2">Debug: Current Equipment Data</h3>
                                <pre className="text-xs overflow-auto max-h-40">
                                    {JSON.stringify({
                                        equipmentId,
                                        checklistsCount: equipmentChecklists.length,
                                        checklists: equipment.checklists
                                    }, null, 2)}
                                </pre>
                            </div>
                        )}
                    </TabPanel>
                ))}
            </TabPanels>
        </TabGroup>

    );
}

// Add PropTypes for better type safety
EquipmentInspection.propTypes = {
    // This component doesn't take props directly, but we can document the expected context
};

// Export the component
export default EquipmentInspection;
