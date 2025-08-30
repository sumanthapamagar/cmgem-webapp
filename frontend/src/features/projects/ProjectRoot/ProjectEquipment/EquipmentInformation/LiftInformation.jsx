import { Stack, Field, Label } from '../../../../../components';
import { CustomTextField, CustomNumberField } from '../components/CustomInputs';

export default function LiftInformation({ equipment }) {
	const lift = equipment?.lift || {};
	
	return (
		<Stack className=''>
			<div className='text-2xl my-6'>Lift Information</div>

			<Stack className='gap-2'>
				<Field className='flex items-center gap-x-4'>
					<Label className="w-60 text-sm font-medium ">
						Lift Number
					</Label>
					<div className='flex-1'>
						<CustomTextField
							fieldPath="lift.lift_number"
							defaultValue={lift.lift_number || ''}
							placeholder="Enter lift number"
						/>
					</div>
				</Field>

				<Field className='flex items-center gap-x-4'>
					<Label className="w-60 text-sm font-medium ">
						Installation Date/ Modernised Date
					</Label>
					<div className='flex-1'>
						<CustomTextField
							fieldPath="lift.installation_date"
							defaultValue={lift.installation_date || ''}
							placeholder="Enter installation date"
						/>
					</div>
				</Field>

				<Field className='flex items-center gap-x-4'>
					<Label className="w-60 text-sm font-medium ">
						Original Equipment Manufacturer
					</Label>
					<div className='flex-1'>
						<CustomTextField
							fieldPath="lift.original_equipment_manufacturer"
							defaultValue={lift.original_equipment_manufacturer || ''}
							placeholder="Enter manufacturer"
						/>
					</div>
				</Field>

				<Field className='flex items-center gap-x-4'>
					<Label className="w-60 text-sm font-medium ">
						Lift Type (Hyd, Underslung, OHT)
					</Label>
					<div className='flex-1'>
						<CustomTextField
							fieldPath="lift.lift_type"
							defaultValue={lift.lift_type || ''}
							placeholder="Enter lift type"
						/>
					</div>
				</Field>

				<Field className='flex items-center gap-x-4'>
					<Label className="w-60 text-sm font-medium ">
						Control/ Drive System. Regen?
					</Label>
					<div className='flex-1'>
						<CustomTextField
							fieldPath="lift.drive_system"
							defaultValue={lift.drive_system || ''}
							placeholder="Enter drive system"
						/>
					</div>
				</Field>


				<Field className='flex items-center gap-x-4'>
					<Label className="w-60 text-sm font-medium ">
						Load (Kg)
					</Label>
					<div className='flex-1'>
						<CustomTextField
							fieldPath="lift.load"
							defaultValue={lift.load || ''}
							placeholder="Enter load capacity"
							min={0}
							step={1}
						/>
					</div>
				</Field>
				
				<Field className='flex items-center gap-x-4'>
					<Label className="w-60 text-sm font-medium ">
						Speed
					</Label>
					<div className='flex-1'>
						<CustomTextField
							fieldPath="lift.speed"
							defaultValue={lift.speed || ''}
							placeholder="Enter speed"
							min={0}
							step={0.1}
						/>
					</div>
				</Field>

				<Field className='flex items-center gap-x-4'>
					<Label className="w-60 text-sm font-medium ">
						Floors Served - Front
					</Label>
					<div className='flex-1'>
						<CustomTextField
							fieldPath="lift.floor_served_front"
							defaultValue={lift.floor_served_front || ''}
							placeholder="Enter front floors served"
							min={0}
							step={1}
						/>
					</div>
				</Field>

				<Field className='flex items-center gap-4'>
					<Label className="w-60 text-sm font-medium ">
						Floors Served - Rear
					</Label>
					<div className='flex-1'>
						<CustomTextField
							fieldPath="lift.floor_served_rear"
							defaultValue={lift.floor_served_rear || ''}
							placeholder="Enter rear floors served"
							min={0}
							step={1}
						/>
					</div>
				</Field>

				<Field className='flex items-center gap-x-4'>
					<Label className="w-60 text-sm font-medium ">
						Hoist rope size / arrangement (1:1, 2:2, 4:1. DW)
					</Label>
					<div className='flex-1'>
						<CustomTextField
							fieldPath="lift.hoist_rope_size"
							defaultValue={lift.hoist_rope_size || ''}
							placeholder="Enter hoist rope size"
						/>
					</div>
				</Field>

			</Stack>
		</Stack>
	);
}
