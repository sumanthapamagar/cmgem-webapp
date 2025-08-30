import clsx from 'clsx';
import { Field, Label } from '../../../../../components';
import { CustomTextField, CustomTextArea, CustomCheckbox, CustomSelect } from '../components/CustomInputs';

const doorOpeningOptions = [
    { value: 'front', label: 'Front' },
    { value: 'rear', label: 'Rear' },
    { value: 'front&Rear', label: 'Front and Rear' }
];

export default function FloorFormCustom({ equipment }) {
    if (!equipment) return null;

    if (!equipment.floors || equipment.floors.length === 0) {
        return (
            <div className="text-center text-gray-500">
                <div className="text-xl mb-2">🏢</div>
                <span>No floors configured for this equipment</span>
            </div>
        );
    }

    return (
        <div className="overflow-x-scroll inline-block w-full">
            <table className="table-fixed w-full min-w-[1600px] divide-y divide-gray-300 bg-white">
                <thead>
                    <tr>
                        <th className="rounded-tl-lg sticky left-0 w-16 z-20 py-3.5 pl-4 pr-3 text-left font-semibold text-gray-900 bg-alice-blue">
                            Levels
                        </th>
                        <th className="sticky left-16 w-36 z-10 bg-alice-blue px-3 py-3.5 text-left font-semibold text-gray-900">
                            Designation
                        </th>
                        <th className="w-40 px-3 py-3.5 text-left font-semibold text-gray-900 bg-alice-blue">
                            Door Opening
                        </th>
                        <th className="w-40 px-3 py-3.5 text-left font-semibold text-gray-900 bg-alice-blue">
                            Floor Levelling
                        </th>
                        <th className="w-40 px-3 py-3.5 text-left font-semibold text-gray-900 bg-alice-blue">
                            Landing Call Button
                        </th>
                        <th className="w-40 px-3 py-3.5 text-left font-semibold text-gray-900 bg-alice-blue">
                            Landing Indication
                        </th>
                        <th className="w-40 px-3 py-3.5 text-left font-semibold text-gray-900 bg-alice-blue">
                            Landing Chime
                        </th>
                        <th className="px-3 py-3.5 text-left font-semibold text-gray-900 bg-alice-blue">
                            Comments - Floor Levelling
                        </th>
                        <th className="rounded-tr-lg px-3 py-3.5 text-left font-semibold text-gray-900 bg-alice-blue">
                            Comments - Signalisation
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {equipment.floors.map((floor, index) => (
                        <tr key={floor._id} className="group hover:bg-sky-100">
                            <td className="sticky left-0 w-16 z-20 bg-alice-blue py-4 pl-4 pr-3">
                                {index + 1}
                            </td>

                            {/* Designation - Text Field */}
                            <td className="sticky left-16 z-10 bg-alice-blue whitespace-nowrap px-3 text-gray-500">
                                <CustomTextField
                                    fieldPath={`floors.${floor._id}.designation`}
                                    defaultValue={floor.designation || ''}
                                    placeholder="Enter designation"
                                />
                            </td>

                            {/* Door Opening - Select */}
                            <td className="whitespace-nowrap px-3 text-gray-500">
                                <CustomSelect
                                    fieldPath={`floors.${floor._id}.door_opening`}
                                    defaultValue={floor.door_opening || ''}
                                    options={doorOpeningOptions}
                                />
                            </td>

                            {/* Floor Levelling - Checkboxes */}
                            <td className="whitespace-nowrap px-3 text-gray-500">
                                <div>
                                    <Field>
                                        <Label
                                            className={clsx("flex items-center gap-x-1", floor.floor_levelling === 'pass' ? 'text-green-700' : 'text-black/40')}
                                        >
                                            <CustomCheckbox
                                                fieldPath={`floors.${floor._id}.floor_levelling`}
                                                checked={floor.floor_levelling === 'pass'}
                                                label="Pass"
                                                value="pass"
                                            />
                                            Pass
                                        </Label>
                                    </Field>
                                    <Field>
                                        <Label
                                            className={clsx("flex items-center gap-x-1", floor.floor_levelling === 'needs-attention' ? 'text-red-500' : 'text-black/40')}
                                        >
                                            <CustomCheckbox
                                                fieldPath={`floors.${floor._id}.floor_levelling`}
                                                checked={floor.floor_levelling === 'needs-attention'}
                                                label="Needs Attention"
                                                value="needs-attention"
                                            />
                                            Needs Attention
                                        </Label>
                                    </Field>
                                </div>
                            </td>

                            {/* Landing Call Button - Checkboxes */}
                            <td className="whitespace-nowrap px-3 text-gray-500">
                                <div>
                                    <Field>
                                        <Label
                                            className={clsx("flex items-center gap-x-1", floor.landing_call_button === 'pass' ? 'text-green-700' : 'text-black/40')}
                                        >
                                        <CustomCheckbox
                                            fieldPath={`floors.${floor._id}.landing_call_button`}
                                            checked={floor.landing_call_button === 'pass'}
                                            label="Pass"
                                            value="pass"
                                        />
                                            Pass
                                        </Label>
                                    </Field>
                                    <Field>
                                        <Label
                                            className={clsx("flex items-center gap-x-1", floor.landing_call_button === 'needs-attention' ? 'text-red-500' : 'text-black/40')}
                                        >
                                        <CustomCheckbox
                                            fieldPath={`floors.${floor._id}.landing_call_button`}
                                            checked={floor.landing_call_button === 'needs-attention'}
                                            label="Needs Attention"
                                            value="needs-attention"
                                        />
                                            Needs Attention
                                        </Label>
                                    </Field>
                                </div>
                            </td>

                            {/* Landing Indication - Checkboxes */}
                            <td className="whitespace-nowrap px-3 text-gray-500">
                                <div>
                                    <Field>
                                        <Label
                                            className={clsx("flex items-center gap-x-1", floor.landing_indication === 'pass' ? 'text-green-700' : 'text-black/40')}
                                        >
                                        <CustomCheckbox
                                            fieldPath={`floors.${floor._id}.landing_indication`}
                                            checked={floor.landing_indication === 'pass'}
                                            label="Pass"
                                            value="pass"
                                        />
                                            Pass
                                        </Label>
                                    </Field>
                                    <Field>
                                        <Label
                                            className={clsx("flex items-center gap-x-1", floor.landing_indication === 'needs-attention' ? 'text-red-500' : 'text-black/40')}
                                        >
                                        <CustomCheckbox
                                            fieldPath={`floors.${floor._id}.landing_indication`}
                                            checked={floor.landing_indication === 'needs-attention'}
                                            label="Needs Attention"
                                            value="needs-attention"
                                        />
                                            Needs Attention
                                        </Label>
                                    </Field>
                                </div>
                            </td>

                            {/* Landing Chime - Checkboxes */}
                            <td className="whitespace-nowrap px-3 text-gray-500">
                                <div>
                                    <Field>
                                        <Label
                                            className={clsx("flex items-center gap-x-1", floor.landing_chime === 'pass' ? 'text-green-700' : 'text-black/40')}
                                        >
                                        <CustomCheckbox
                                            fieldPath={`floors.${floor._id}.landing_chime`}
                                            checked={floor.landing_chime === 'pass'}
                                            label="Pass"
                                            value="pass"
                                        />
                                            Pass
                                        </Label>
                                    </Field>
                                    <Field>
                                        <Label
                                            className={clsx("flex items-center gap-x-1", floor.landing_chime === 'needs-attention' ? 'text-red-500' : 'text-black/40')}
                                        >
                                        <CustomCheckbox
                                            fieldPath={`floors.${floor._id}.landing_chime`}
                                            checked={floor.landing_chime === 'needs-attention'}
                                            label="Needs Attention"
                                            value="needs-attention"
                                        />
                                            Needs Attention
                                        </Label>
                                    </Field>
                                </div>
                            </td>

                            {/* Floor Comment - Text Area */}
                            <td className="whitespace-nowrap px-3 text-gray-500">
                                <CustomTextArea
                                    fieldPath={`floors.${floor._id}.floor_comment`}
                                    defaultValue={floor.floor_comment || ''}
                                    placeholder="Enter floor comment"
                                    rows={2}
                                />
                            </td>

                            {/* Signalisation Comment - Text Area */}
                            <td className="whitespace-nowrap px-3 text-gray-500">
                                <CustomTextArea
                                    fieldPath={`floors.${floor._id}.signalisation_comment`}
                                    defaultValue={floor.signalisation_comment || ''}
                                    placeholder="Enter signalisation comment"
                                    rows={2}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
