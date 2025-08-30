import { useParams } from 'react-router-dom';
import { useEquipment } from '../../../../../hooks';
import FloorFormCustom from './FloorFormCustom';
import { Stack } from '../../../../../components';
import { EquipmentNotFound } from '../components';

export default function EquipmentFloors() {
    const { projectId, equipmentId } = useParams();
    const { equipment } = useEquipment(equipmentId);

    if (!equipment) {
        return <EquipmentNotFound />;
    }

    if (!equipment.floors || equipment.floors.length === 0) {
        return (
            <Stack className="h-[calc(100vh-198px)] items-center justify-center">
                <div className="text-center">
                    <div className="text-gray-500 text-xl mb-2">🏢</div>
                    <span>No floors configured for this equipment</span>
                </div>
            </Stack>
        );
    }

    return (
        <FloorFormCustom
            equipment={equipment}
        />
    );
}
