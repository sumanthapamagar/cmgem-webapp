import { Stack, Field, Label } from '../../../../../components';
import { CustomTextField } from '../components/CustomInputs';

export default function EscalatorInformation({ equipment }) {
    const escalator_information = equipment?.escalator_information || {};
    
    return (
        <Stack className=''>
            <div className='text-2xl my-6'>Escalator Information</div>

            <Stack className='gap-2'>
                <Field className='flex items-center gap-x-4'>
                    <Label className="w-60 text-sm font-medium ">Current maintenance provider</Label>
                    <div className='flex-1'>
                        <CustomTextField
                            fieldPath="escalator_information.current_maintenance_provider"
                            defaultValue={escalator_information.current_maintenance_provider || ''}
                            placeholder="Enter current maintenance provider"
                        />
                    </div>
                </Field>

                <Field className='flex items-center gap-x-4'>
                    <Label className="w-60 text-sm font-medium ">Equipment Type</Label>
                    <div className='flex-1'>
                        <CustomTextField
                            fieldPath="escalator_information.equipment_type"
                            defaultValue={escalator_information.equipment_type || ''}
                            placeholder="Escalator / Moving Walk"
                        />
                    </div>
                </Field>

                <Field className='flex items-center gap-x-4'>
                    <Label className="w-60 text-sm font-medium ">Unit Type</Label>
                    <div className='flex-1'>
                        <CustomTextField
                            fieldPath="escalator_information.unit_type"
                            defaultValue={escalator_information.unit_type || ''}
                            placeholder="Indoor / Semi Outdoor / Outdoor"
                        />
                    </div>
                </Field>

                <Field className='flex items-center gap-x-4'>
                    <Label className="w-60 text-sm font-medium ">Arrangement</Label>
                    <div className='flex-1'>
                        <CustomTextField
                            fieldPath="escalator_information.arrangement"
                            defaultValue={escalator_information.arrangement || ''}
                            placeholder="Parallel / Criss Cross / Single"
                        />
                    </div>
                </Field>

                <Field className='flex items-center gap-x-4'>
                    <Label className="w-60 text-sm font-medium ">Unit Number & Location</Label>
                    <div className='flex-1'>
                        <CustomTextField
                            fieldPath="escalator_information.unit_number_location"
                            defaultValue={escalator_information.unit_number_location || ''}
                            placeholder="Enter unit number & location"
                        />
                    </div>
                </Field>

                <Field className='flex items-center gap-x-4'>
                    <Label className="w-60 text-sm font-medium ">Installation Date / Modernised Date</Label>
                    <div className='flex-1'>
                        <CustomTextField
                            fieldPath="escalator_information.installation_modernised_date"
                            defaultValue={escalator_information.installation_modernised_date || ''}
                            placeholder="YYYY-MM-DD / YYYY-MM-DD"
                        />
                    </div>
                </Field>

                <Field className='flex items-center gap-x-4'>
                    <Label className="w-60 text-sm font-medium ">Original Equipment Manufacturer</Label>
                    <div className='flex-1'>
                        <CustomTextField
                            fieldPath="escalator_information.original_equipment_manufacturer"
                            defaultValue={escalator_information.original_equipment_manufacturer || ''}
                            placeholder="Enter OEM"
                        />
                    </div>
                </Field>

                <Field className='flex items-center gap-x-4'>
                    <Label className="w-60 text-sm font-medium ">Equipment Model</Label>
                    <div className='flex-1'>
                        <CustomTextField
                            fieldPath="escalator_information.equipment_model"
                            defaultValue={escalator_information.equipment_model || ''}
                            placeholder="Enter equipment model"
                        />
                    </div>
                </Field>

                <Field className='flex items-center gap-x-4'>
                    <Label className="w-60 text-sm font-medium ">Control / Drive System</Label>
                    <div className='flex-1'>
                        <CustomTextField
                            fieldPath="escalator_information.control_drive_system"
                            defaultValue={escalator_information.control_drive_system || ''}
                            placeholder="Enter control / drive system"
                        />
                    </div>
                </Field>

                <Field className='flex items-center gap-x-4'>
                    <Label className="w-60 text-sm font-medium ">Speed</Label>
                    <div className='flex-1'>
                        <CustomTextField
                            fieldPath="escalator_information.speed"
                            defaultValue={escalator_information.speed || ''}
                            placeholder="Enter speed"
                        />
                    </div>
                </Field>

                <Field className='flex items-center gap-x-4'>
                    <Label className="w-60 text-sm font-medium ">Rise</Label>
                    <div className='flex-1'>
                        <CustomTextField
                            fieldPath="escalator_information.rise"
                            defaultValue={escalator_information.rise || ''}
                            placeholder="Enter rise"
                        />
                    </div>
                </Field>

                

                <Field className='flex items-center gap-x-4 mt-8'>
                    <Label className="w-60 text-sm font-medium ">Balustrade Type</Label>
                    <div className='flex-1'>
                        <CustomTextField
                            fieldPath="escalator_information.balustrade_type"
                            defaultValue={escalator_information.balustrade_type || ''}
                            placeholder="Glass / Stainless Steel"
                        />
                    </div>
                </Field>

                <Field className='flex items-center gap-x-4'>
                    <Label className="w-60 text-sm font-medium ">Balustrade Lighting</Label>
                    <div className='flex-1'>
                        <CustomTextField
                            fieldPath="escalator_information.balustrade_lighting"
                            defaultValue={escalator_information.balustrade_lighting || ''}
                            placeholder="Neon / Fluorescent / LED / Nil"
                        />
                    </div>
                </Field>

                <Field className='flex items-center gap-x-4'>
                    <Label className="w-60 text-sm font-medium ">Balustrade Height</Label>
                    <div className='flex-1'>
                        <CustomTextField
                            fieldPath="escalator_information.balustrade_height"
                            defaultValue={escalator_information.balustrade_height || ''}
                            placeholder="Enter balustrade height"
                        />
                    </div>
                </Field>

                <Field className='flex items-center gap-x-4'>
                    <Label className="w-60 text-sm font-medium ">Skirt Type</Label>
                    <div className='flex-1'>
                        <CustomTextField
                            fieldPath="escalator_information.skirt_type"
                            defaultValue={escalator_information.skirt_type || ''}
                            placeholder="Black Teflon / Stainless Steel"
                        />
                    </div>
                </Field>

                <Field className='flex items-center gap-x-4'>
                    <Label className="w-60 text-sm font-medium ">Skirt Lighting</Label>
                    <div className='flex-1'>
                        <CustomTextField
                            fieldPath="escalator_information.skirt_lighting"
                            defaultValue={escalator_information.skirt_lighting || ''}
                            placeholder="Neon / Fluorescent / LED / Nil"
                        />
                    </div>
                </Field>
            </Stack>
        </Stack>
    );
}
