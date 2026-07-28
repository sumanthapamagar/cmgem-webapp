const locationCategories = [
    {
        key: 'general-maintenance-and-housekeeping',
        text: 'General Maintenance and Housekeeping'
    },
    {
        key: 'owner',
        text: 'Owner'
    },
    {
        key: 'safety-risks',
        text: 'Safety Risks'
    },
    {
        key: 'reliability-and-outage-risks',
        text: 'Reliability and Outage Risks'
    },
    {
        key: 'passenger-comfort',
        text: 'Passenger Comfort'
    },
    {
        key: 'compliance-and-regulations',
        text: 'Compliance and Regulations'
    },
    {
        key: 'safety-devices',
        text: 'Safety Devices'
    },
    {
        key: 'sustainability-and-technology',
        text: 'Sustainability and Technology'
    },
    {
        key: 'comment',
        text: 'Comment'
    },
    {
        key: 'note',
        text: 'Note'
    },
    {
        key: 'na',
        text: 'N/A'
    }
];

export default locationCategories

export const locationCategoryMap = locationCategories.reduce((map, category) => {
    map[category.key] = category.text;
    return map;
}, {});