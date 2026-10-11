import { useState } from 'react';
import { Checkbox, CheckboxField, Field, Label, Select, Input, Textarea } from '../../../../../components';

const doorOpeningOptions = [
    { key: 'front', text: 'Front' },
    { key: 'rear', text: 'Rear' },
    { key: 'front&Rear', text: 'Front and Rear' }
];

const floorStatusOptions = [
    { key: 'pass', text: 'Pass' },
    { key: 'needs-attention', text: 'Needs Attention' }
];

const FloorStatusCheckbox = ({ floorId, fieldName, label, register, watch, handleCheckboxChange }) => {
    const fieldPath = `floors.${floorId}.${fieldName}`;
    const [isChecked, setIsChecked] = useState(watch(fieldPath) === 'pass' || watch(fieldPath) === 'needs-attention');

    const onChange = () => {
        const newValue = isChecked ? '' : 'pass';
        setIsChecked(!isChecked);
        handleCheckboxChange(floorId, fieldName, newValue);
    };

    return (
        <CheckboxField>
            <Checkbox
                checked={isChecked}
                onChange={onChange}
            />
            <Label>{label}</Label>
        </CheckboxField>
    );
}


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
                <table className="table-fixed w-full min-w-400 divide-y divide-gray-300 bg-white">
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
                                    <FloorStatusCheckbox
                                        floorId={floor._id}
                                        fieldName="floor_levelling"
                                        label="Pass"
                                        register={register}
                                        watch={watch}
                                        handleCheckboxChange={handleCheckboxChange}
                                    />
                                    <FloorStatusCheckbox
                                        floorId={floor._id}
                                        fieldName="floor_levelling"
                                        label="Needs Attention"
                                        register={register}
                                        watch={watch}
                                        handleCheckboxChange={handleCheckboxChange}
                                    />
                                </td>
                                <td className="whitespace-nowrap px-3 text-gray-500">
                                    <FloorStatusCheckbox
                                        floorId={floor._id}
                                        fieldName="landing_call_button"
                                        label="Pass"
                                        register={register}
                                        watch={watch}
                                        handleCheckboxChange={handleCheckboxChange}
                                    />
                                    <FloorStatusCheckbox
                                        floorId={floor._id}
                                        fieldName="landing_call_button"
                                        label="Needs Attention"
                                        register={register}
                                        watch={watch}
                                        handleCheckboxChange={handleCheckboxChange}
                                    />
                                      
                                </td>
                                <td className="whitespace-nowrap px-3 text-gray-500">
                                    <FloorStatusCheckbox
                                        floorId={floor._id}
                                        fieldName="landing_indication"
                                        label="Pass"
                                        register={register}
                                        watch={watch}
                                        handleCheckboxChange={handleCheckboxChange}
                                    />
                                    <FloorStatusCheckbox
                                        floorId={floor._id}
                                        fieldName="landing_indication"
                                        label="Needs Attention"
                                        register={register}
                                        watch={watch}
                                        handleCheckboxChange={handleCheckboxChange}
                                    />
                                </td>
                                <td className="whitespace-nowrap px-3 text-gray-500">
                                    <FloorStatusCheckbox
                                        floorId={floor._id}
                                        fieldName="landing_chime"
                                        label="Pass"
                                        register={register}
                                        watch={watch}
                                        handleCheckboxChange={handleCheckboxChange}
                                    />
                                    <FloorStatusCheckbox
                                        floorId={floor._id}
                                        fieldName="landing_chime"
                                        label="Needs Attention"
                                        register={register}
                                        watch={watch}
                                        handleCheckboxChange={handleCheckboxChange}
                                    />
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
