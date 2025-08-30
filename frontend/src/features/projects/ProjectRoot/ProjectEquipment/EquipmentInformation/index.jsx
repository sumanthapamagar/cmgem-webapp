import { useParams } from 'react-router-dom';
import { useEquipment } from '../../../../../hooks';
import { EquipmentNotFound } from '../components';
import CarInterior from './CarInterior';
import LiftInformation from './LiftInformation';
import Maintenance from './Maintenance';

export function EquipmentInformation() {
    const { projectId, equipmentId } = useParams();
    const { equipment } = useEquipment(equipmentId);
    
    if (!equipment) {
        return <EquipmentNotFound />;
    }

    return (
        <div className="space-y-6">
            <Maintenance equipment={equipment} />
            <LiftInformation equipment={equipment} />
            <CarInterior equipment={equipment} />
        </div>
    );
}
