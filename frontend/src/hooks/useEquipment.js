import { useMemo } from 'react';
import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectContext } from '../features/projects/projectContext';

/**
 * Custom hook to find equipment by ID
 * Provides consistent equipment lookup across components
 * 
 * @param {string} equipmentId - Equipment ID to find (optional, defaults to route param)
 * @returns {Object} { equipment, project, projectId, equipmentId }
 */
export const useEquipment = (equipmentId = null) => {
    const { projectId: routeProjectId, equipmentId: routeEquipmentId } = useParams();
    const { offlineProject: project } = useContext(ProjectContext);
    
    // Use provided equipmentId or fall back to route param
    const finalEquipmentId = equipmentId || routeEquipmentId;
    const finalProjectId = routeProjectId;
    
    const equipment = useMemo(() => 
        project?.equipments?.find((eq) => eq._id === finalEquipmentId),
        [project?.equipments, finalEquipmentId]
    );
    
    return {
        equipment,
        project,
        projectId: finalProjectId,
        equipmentId: finalEquipmentId
    };
};
