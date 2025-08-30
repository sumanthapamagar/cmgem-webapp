import { useEffect, useState } from 'react';
import equipmentTypes from '../../../constants/elevatorTypes';
import locations from '../../../constants/locations';
import { Navigation, Button } from '../../../components';

export default function ChecklistNav() {
    const [navigations, setNavigations] = useState([]);
    useEffect(() => {
        setNavigations(
            equipmentTypes.map((equipment) => ({
                title: equipment.text,
                key: equipment.key,
                links: locations.map((location) => ({
                    title: location.text,
                    key: `${equipment.key}-${location.key}`,
                    href: `/checklists/${equipment.key}/${location.key}`
                }))
            }))
        );
    }, []);

    return (
        <div className="sticky top-[48px] h-[calc(100vh-48px)] overflow-x-clip overflow-y-auto bg-neutral-100 w-64 min-w-max p-6">
            <Navigation navigation={navigations} />
        </div>
    );
}
