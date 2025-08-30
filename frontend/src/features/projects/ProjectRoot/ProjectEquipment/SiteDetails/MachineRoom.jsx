import { Stack, Field, Label } from '../../../../../components';
import { CustomTextField } from '../components/CustomInputs';

export default function MachineRoom({ equipment }) {
    const machineRoom = equipment?.machine_room || {};

    return (
        <Stack className="">
            <div className="text-2xl my-6">Lift Machine Room</div>

            <Stack className="gap-2">
                <Field className='flex items-center gap-x-4'>
                    <Label className="w-60 text-sm font-medium ">
                        { equipment.category === "mrl"?"MAP Location" : "Machine room location"}
                    </Label>
                    <div className='flex-1'>
                        <CustomTextField
                            fieldPath="machine_room.machine_room_location"
                            defaultValue={machineRoom.machine_room_location || ''}
                            placeholder="Enter machine room location"
                        />
                    </div>
                </Field>
                {equipment.category === "machineRoom" && <>
                    <Field className='flex items-center gap-x-4'>
                        <Label className="w-60 text-sm font-medium ">
                            Machine room ventilation
                        </Label>
                        <div className='flex-1'>
                            <CustomTextField
                                fieldPath="machine_room.machine_room_ventilation"
                                defaultValue={machineRoom.machine_room_ventilation || ''}
                                placeholder="Enter machine room ventilation info"
                            />
                        </div>
                    </Field>

                    <Field className='flex items-center gap-x-4'>
                        <Label className="w-60 text-sm font-medium ">
                            Lift submain type and number of
                        </Label>
                        <div className='flex-1'>
                            <CustomTextField
                                fieldPath="machine_room.lift_submain_type_and_number_of"
                                defaultValue={machineRoom.lift_submain_type_and_number_of || ''}
                                placeholder="Enter lift submain type and number"
                            />
                        </div>
                    </Field>

                    <Field className='flex items-center gap-x-4'>
                        <Label className="w-60 text-sm font-medium ">
                            Machinery access hatch
                        </Label>
                        <div className='flex-1'>
                            <CustomTextField
                                fieldPath="machine_room.machinery_access_hatch"
                                defaultValue={machineRoom.machinery_access_hatch || ''}
                                placeholder="Enter machinery access hatch info"
                            />
                        </div>
                    </Field>

                    <Field className='flex items-center gap-x-4'>
                        <Label className="w-60 text-sm font-medium ">
                            Building services in machine room
                        </Label>
                        <div className='flex-1'>
                            <CustomTextField
                                fieldPath="machine_room.building_services_in_machine_room"
                                defaultValue={machineRoom.building_services_in_machine_room || ''}
                                placeholder="Enter building services in machine room"
                            />
                        </div>
                    </Field>

                    <Field className='flex items-center gap-x-4'>
                        <Label className="w-60 font-medium ">
                            Lifting beams with rated load (SWL) visible
                        </Label>
                        <div className='flex-1'>
                            <CustomTextField
                                fieldPath="machine_room.lifting_beams_with_rated_load_visible"
                                defaultValue={machineRoom.lifting_beams_with_rated_load_visible || ''}
                                placeholder="Enter lifting beams info"
                            />
                        </div>
                    </Field>

                    <Field className='flex items-center gap-x-4'>
                        <Label className="w-60 font-medium ">
                            Fire Extinguisher
                        </Label>
                        <div className='flex-1'>
                            <CustomTextField
                                fieldPath="machine_room.fire_extinguisher"
                                defaultValue={machineRoom.fire_extinguisher || ''}
                                placeholder="Enter fire extinguisher info"
                            />
                        </div>
                    </Field>

                    <Field className='flex items-center gap-x-4'>
                        <Label className="w-60 text-sm font-medium ">
                            Sprinklers/smoke detectors
                        </Label>
                        <div className='flex-1'>
                            <CustomTextField
                                fieldPath="machine_room.sprinkllers_smoke_detectors"
                                defaultValue={machineRoom.sprinkllers_smoke_detectors || ''}
                                placeholder="Enter sprinklers/smoke detectors info"
                            />
                        </div>
                    </Field>
                </>
                }
            </Stack>
        </Stack>
    );
}
