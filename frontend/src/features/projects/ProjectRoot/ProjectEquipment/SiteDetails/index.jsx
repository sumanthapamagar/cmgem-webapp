import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useEquipment } from '../../../../../hooks';
import { EquipmentNotFound } from '../components';
import Landings from './Landings';
import LiftShaft from './LiftShaft';
import MachineRoom from './MachineRoom';
import LiftCars from './LiftCars';

export function SiteDetails() {
    const { projectId, equipmentId } = useParams();
    const { equipment } = useEquipment(equipmentId);

    if (!equipment) {
        return <EquipmentNotFound />;
    }

    return (
        <div className="space-y-6">
            <Landings equipment={equipment} />
            <LiftShaft equipment={equipment} />
            <MachineRoom equipment={equipment} />
            <LiftCars equipment={equipment} />
        </div>
    );
}

