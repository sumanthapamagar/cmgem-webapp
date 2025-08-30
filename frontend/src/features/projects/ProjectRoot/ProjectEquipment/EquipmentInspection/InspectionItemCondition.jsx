import { Field, Label } from '../../../../../components';
import { CustomCheckbox } from '../components/CustomInputs';

export default function InspectionItemCondition({ inspectionItem, equipment }) {
    const currentStatus = equipment?.checklists?.[inspectionItem._id]?.status || '';

    const handleStatusChange = (newStatus) => {
        // The CustomRadioGroup will handle saving internally
        console.log(`Status changed to: ${newStatus}`);
    };

    return (
        <div className="space-y-4 sm:flex sm:items-center sm:space-x-6 sm:space-y-0">
            {options.map((option) => (
                <Field
                    key={option.id}
                    className="flex items-center cursor-pointer "
                >
                    <CustomCheckbox
                        value={option.id}
                        fieldPath={`checklists.${inspectionItem._id}.status`}
                        checked={currentStatus === option.id}

                    />
                    <Label
                        className={ "cursor-pointer " + (currentStatus === option.id ? option.color : 'text-black/40')}
                    >
                        {option.title}
                    </Label>
                </Field>
            ))}
        </div>
    );
}

const options = [
    { id: 'priority1', title: 'Priority 1', color: 'text-red-500' },
    { id: 'priority2', title: 'Priority 2', color: 'text-orange-500' },
    { id: 'pass', title: 'pass', color: 'text-green-500' },
    { id: 'na', title: 'N/A', color: 'text-black/80' },
    { id: 'note', title: 'Note', color: 'text-black/80' }
];
