import { ESCALATOR_LOCATIONS, HOIST_DUMB_WAITER_LOCATIONS, LIFT_LOCATIONS } from "./locations";

const equipmentTypes = [
    {
        key: 'mrl',
        text: 'MRL',
        links: LIFT_LOCATIONS
    },
    {
        key: 'machineRoom',
        text: 'Machine Room Elevator',
        links: LIFT_LOCATIONS
    },
    {
        key: 'escaltor',
        text: 'Escalator and Moving Walk',
        links: ESCALATOR_LOCATIONS
    },
    {
        key: 'hoist-dumb-waiter',
        text: 'Hoist / Dumb Waiter',
        links: HOIST_DUMB_WAITER_LOCATIONS
    }
];

export default equipmentTypes