import { Checkbox, CheckboxField, Field, Label, Select, Input, Textarea } from '../../../../../components';

const doorOpeningOptions = [
    { key: 'front', text: 'Front' },
    { key: 'rear', text: 'Rear' },
    { key: 'front&Rear', text: 'Front and Rear' }
];

export default function FloorForm({ 
    equipment, 
    register, 
    setValue, 
    watch, 
    handleCheckboxChange, 
    handleInputChange 
}) {
    return (
        <>
            <div className="overflow-x-scroll inline-block w-full">
                <table className="table-fixed w-full min-w-[1600px] divide-y divide-gray-300 bg-white">
                    <thead>
                        <tr>
                            <th
                                scope="col"
                                className="sticky left-0 w-16 z-20 py-3.5 pl-4 pr-3 text-left font-semibold text-gray-900 bg-harper-blue"
                            >
                                Levels
                            </th>
                            <th
                                scope="col"
                                className="sticky left-16 w-36 z-10 bg-harper-blue px-3 py-3.5 text-left font-semibold text-gray-900"
                            >
                                Designation
                            </th>
                            <th
                                scope="col"
                                className="w-40 px-3 py-3.5 text-left font-semibold text-gray-900 bg-alice-blue"
                            >
                                Door Opening
                            </th>
                            <th
                                scope="col"
                                className="w-40 px-3 py-3.5 text-left font-semibold text-gray-900 bg-alice-blue"
                            >
                                Floor Levelling
                            </th>
                            <th
                                scope="col"
                                className="w-40 px-3 py-3.5 text-left font-semibold text-gray-900 bg-alice-blue"
                            >
                                Landing Call Button
                            </th>
                            <th
                                scope="col"
                                className="w-40 px-3 py-3.5 text-left font-semibold text-gray-900 bg-alice-blue"
                            >
                                Landing Indication
                            </th>
                            <th
                                scope="col"
                                className="w-40 px-3 py-3.5 text-left font-semibold text-gray-900 bg-alice-blue"
                            >
                                Landing Chime
                            </th>
                            <th
                                scope="col"
                                className="px-3 py-3.5 text-left font-semibold text-gray-900 bg-alice-blue"
                            >
                                Comments - Floor Levelling
                            </th>
                            <th
                                scope="col"
                                className="px-3 py-3.5 text-left font-semibold text-gray-900 bg-alice-blue"
                            >
                                Comments - Signalisation
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {equipment.floors.map((floor, index) => (
                            <tr
                                key={floor._id}
                                className="group hover:bg-sky-100"
                            >
                                <td className="sticky left-0 w-16 z-20 bg-harper-blue  py-4 pl-4 pr-3 ">
                                    {index + 1}
                                </td>
                                <td className="sticky left-16 z-10 bg-harper-blue  whitespace-nowrap px-3 text-gray-500">
                                    <Field>
                                        <Input
                                            {...register(`floors.${floor._id}.designation`)}
                                            onChange={(e) => handleInputChange(floor._id, 'designation', e.target.value)}
                                        />
                                    </Field>
                                </td>
                                <td className="whitespace-nowrap px-3 text-gray-500">
                                    <Field>
                                        <Select
                                            {...register(`floors.${floor._id}.door_opening`)}
                                            onChange={(e) => handleInputChange(floor._id, 'door_opening', e.target.value)}
                                        >
                                            {doorOpeningOptions.map(
                                                (option) => (
                                                    <option key={option.key} value={option.key}>
                                                        {option.text}
                                                    </option>
                                                )
                                            )}
                                        </Select>
                                    </Field>
                                </td>
                                <td className="whitespace-nowrap px-3 text-gray-500">
                                    <CheckboxField>
                                        <Checkbox
                                            checked={watch(`floors.${floor._id}.floor_levelling`) === 'pass'}
                                            onChange={() => handleCheckboxChange(floor._id, 'floor_levelling', 'pass')}
                                        />
                                        <Label>Pass</Label>
                                    </CheckboxField>
                                    <CheckboxField>
                                        <Checkbox
                                            checked={watch(`floors.${floor._id}.floor_levelling`) === 'needs-attention'}
                                            onChange={() => handleCheckboxChange(floor._id, 'floor_levelling', 'needs-attention')}
                                        />
                                        <Label>Needs Attention</Label>
                                    </CheckboxField>
                                </td>
                                <td className="whitespace-nowrap px-3 text-gray-500">
                                    <CheckboxField>
                                        <Checkbox
                                            checked={watch(`floors.${floor._id}.landing_call_button`) === 'pass'}
                                            onChange={() => handleCheckboxChange(floor._id, 'landing_call_button', 'pass')}
                                        />
                                        <Label>Pass</Label>
                                    </CheckboxField>
                                    <CheckboxField>
                                        <Checkbox
                                            checked={watch(`floors.${floor._id}.landing_call_button`) === 'needs-attention'}
                                            onChange={() => handleCheckboxChange(floor._id, 'landing_call_button', 'needs-attention')}
                                        />
                                        <Label>Needs Attention</Label>
                                    </CheckboxField>
                                </td>
                                <td className="whitespace-nowrap px-3 text-gray-500">
                                    <CheckboxField>
                                        <Checkbox
                                            checked={watch(`floors.${floor._id}.landing_indication`) === 'pass'}
                                            onChange={() => handleCheckboxChange(floor._id, 'landing_indication', 'pass')}
                                        />
                                        <Label>Pass</Label>
                                    </CheckboxField>
                                    <CheckboxField>
                                        <Checkbox
                                            checked={watch(`floors.${floor._id}.landing_indication`) === 'needs-attention'}
                                            onChange={() => handleCheckboxChange(floor._id, 'landing_indication', 'needs-attention')}
                                        />
                                        <Label>Needs Attention</Label>
                                    </CheckboxField>
                                </td>
                                <td className="whitespace-nowrap px-3 text-gray-500">
                                    <CheckboxField>
                                        <Checkbox
                                            checked={watch(`floors.${floor._id}.landing_chime`) === 'pass'}
                                            onChange={() => handleCheckboxChange(floor._id, 'landing_chime', 'pass')}
                                        />
                                        <Label>Pass</Label>
                                    </CheckboxField>
                                    <CheckboxField>
                                        <Checkbox
                                            checked={watch(`floors.${floor._id}.landing_chime`) === 'needs-attention'}
                                            onChange={() => handleCheckboxChange(floor._id, 'landing_chime', 'needs-attention')}
                                        />
                                        <Label>Needs Attention</Label>
                                    </CheckboxField>
                                </td>
                                <td className="whitespace-nowrap px-3 text-gray-500">
                                    <Field>
                                        <Textarea
                                            {...register(`floors.${floor._id}.floor_comment`)}
                                            onChange={(e) => handleInputChange(floor._id, 'floor_comment', e.target.value)}
                                            rows="2"
                                            spellCheck
                                        />
                                    </Field>
                                </td>
                                <td className="whitespace-nowrap px-3 text-gray-500">
                                    <Field>
                                        <Textarea
                                            {...register(`floors.${floor._id}.signalisation_comment`)}
                                            onChange={(e) => handleInputChange(floor._id, 'signalisation_comment', e.target.value)}
                                            rows="2"
                                            spellCheck
                                        />
                                    </Field>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Debug section - remove in production */}
            {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-4 bg-gray-100 rounded-sm">
                    <h3 className="font-semibold mb-2">Debug: Current Form Values</h3>
                    <pre className="text-xs overflow-auto">
                        {JSON.stringify({
                            values: watch(),
                            isDirty: watch()?.isDirty,
                            approach: "Optimized consolidated hook - saves when values stop changing for 200ms"
                        }, null, 2)}
                    </pre>
                </div>
            )}
        </>
    );
}
