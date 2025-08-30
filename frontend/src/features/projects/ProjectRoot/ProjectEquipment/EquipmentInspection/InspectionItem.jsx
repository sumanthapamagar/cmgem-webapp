import { Field, Label, Online, Stack } from '../../../../../components';
import InspectionItemComment from './InspectionItemComment';
import InspectionItemCondition from './InspectionItemCondition';
import PropTypes from 'prop-types';
import {InspectionImages} from './InspectionItemImages';

export default function InspectionItem({ inspectionItem, equipment }) {
    const checklistData = equipment?.checklists?.[inspectionItem._id] || {};
    
    return (
        <Stack horizontal className="relative items-start animate gap-10 p-2">
            <Stack className="gap-3 pr-10">
                <span className="text-slate-600 ">{inspectionItem.title}</span>
                <Stack className="ml-4 gap-2">
                    <InspectionItemCondition
                        key={inspectionItem._id + "condition"}
                        inspectionItem={inspectionItem}
                        equipment={equipment}
                    />
                    <InspectionItemComment
                        key={inspectionItem._id + "comment"}
                        inspectionItem={inspectionItem}
                        equipment={equipment}
                    />
                </Stack>
            </Stack>
            <Online>
                <InspectionImages inspectionItem={inspectionItem} />
            </Online>
        </Stack>
    );
}

InspectionItem.propTypes = {
    inspectionItem: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        equipment_type: PropTypes.string,
        location: PropTypes.string,
        order: PropTypes.number,
    }).isRequired,
    equipment: PropTypes.object.isRequired,
};
