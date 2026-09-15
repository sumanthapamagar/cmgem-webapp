import { Field, Label } from '../../../../../components';
import { CustomCheckbox, useFieldAutosave } from '../components/CustomInputs';

export default function InspectionItemCondition({ inspectionItem, equipment }) {
    const [currentStatus, setCurrentStatus] = useState(equipment?.checklists?.[inspectionItem._id]?.status || '');
    const { saveField } = useFieldAutosave();

    const handleStatusChange = (status) => {
        setCurrentStatus(status)
        const currentComment = equipment.checklists?.[inspectionItem._id]?.comment;
        if (status && !currentComment) {
                const fieldPath = `checklists.${inspectionItem._id}.comment`;

                const defaultComment = inspectionItem[`${status}Default`]
                if (defaultComment) {
                    const success = saveField(fieldPath, defaultComment);
                }

        }
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
                        onChange={handleStatusChange}

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
    { id: 'priority1', title: 'Recommend / Improve', color: 'text-red-500' },
    { id: 'priority2', title: 'Requires Attention', color: 'text-orange-500' },
    { id: 'pass', title: 'Pass', color: 'text-green-500' },
    { id: 'na', title: 'N/A', color: 'text-black/80' },
    { id: 'note', title: 'Note', color: 'text-black/80' }
];
