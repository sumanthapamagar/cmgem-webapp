import { Stack, Field, Label } from '../../../../../components';
import { CustomTextField } from '../components/CustomInputs';

export default function CarInterior({ equipment }) {
	const carInterior = equipment?.car_interior || {};
	
	return (
		<Stack className=''>
			<div className='text-2xl my-6'>Car Interior</div>

			<Stack className='gap-2'>
				<Field className='flex items-center gap-x-4'>
					<Label className="w-60 text-sm font-medium ">
						Walls
					</Label>
					<div className='flex-1'>
						<CustomTextField
							fieldPath="car_interior.wall_type"
							defaultValue={carInterior.wall_type || ''}
							placeholder="Enter wall type"
						/>
					</div>
				</Field>

				<Field className='flex items-center gap-x-4'>
					<Label className="w-60 text-sm font-medium ">
						Ceiling and Lights
					</Label>
					<div className='flex-1'>
						<CustomTextField
							fieldPath="car_interior.ceiling_and_lights_type"
							defaultValue={carInterior.ceiling_and_lights_type || ''}
							placeholder="Enter ceiling and lights type"
						/>
					</div>
				</Field>

				<Field className='flex items-center gap-x-4'>
					<Label className="w-60 text-sm font-medium ">
						Flooring
					</Label>
					<div className='flex-1'>
						<CustomTextField
							fieldPath="car_interior.flooring_type"
							defaultValue={carInterior.flooring_type || ''}
							placeholder="Enter flooring type"
						/>
					</div>
				</Field>

				<Field className='flex items-center gap-x-4'>
					<Label className="w-60 text-sm font-medium ">
						Mirror
					</Label>
					<div className='flex-1'>
						<CustomTextField
							fieldPath="car_interior.mirror_location"
							defaultValue={carInterior.mirror_location || ''}
							placeholder="Enter mirror location"
						/>
					</div>
				</Field>

				<Field className='flex items-center gap-x-4'>
					<Label className="w-60 text-sm font-medium ">
						Car Buttons
					</Label>
					<div className='flex-1'>
						<CustomTextField
							fieldPath="car_interior.buttons_type"
							defaultValue={carInterior.buttons_type || ''}
							placeholder="Enter button type"
						/>
					</div>
				</Field>

				<Field className='flex items-center gap-4'>
					<Label className="w-60 text-sm font-medium ">
						Car Indication
					</Label>
					<div className='flex-1'>
						<CustomTextField
							fieldPath="car_interior.indication_type"
							defaultValue={carInterior.indication_type || ''}
							placeholder="Enter indication type"
						/>
					</div>
				</Field>

				<Field className='flex items-center gap-x-4'>
					<Label className="w-60 text-sm font-medium ">
						Voice Announcement
					</Label>
					<div className='flex-1'>
						<CustomTextField
							fieldPath="car_interior.voice_announcement"
							defaultValue={carInterior.voice_announcement || ''}
							placeholder="Enter voice announcement type"
						/>
					</div>
				</Field>

				<Field className='flex items-center gap-x-4'>
					<Label className="w-60 text-sm font-medium ">
						Car Interior Handrails
					</Label>
					<div className='flex-1'>
						<CustomTextField
							fieldPath="car_interior.handrails"
							defaultValue={carInterior.handrails || ''}
							placeholder="Enter handrail type"
						/>
					</div>
				</Field>

				<Field className='flex items-center gap-4'>
					<Label className="w-60 text-sm font-medium ">
						Car Door Type
					</Label>
					<div className='flex-1'>
						<CustomTextField
							fieldPath="car_interior.car_door_type"
							defaultValue={carInterior.car_door_type || ''}
							placeholder="Enter door type"
						/>
					</div>
				</Field>

				<Field className='flex items-center gap-x-4'>
					<Label className="w-60 text-sm font-medium ">
						Car Door Finishes
					</Label>
					<div className='flex-1'>
						<CustomTextField
							fieldPath="car_interior.car_door_finishes"
							defaultValue={carInterior.car_door_finishes || ''}
							placeholder="Enter door finishes"
						/>
					</div>
				</Field>
			</Stack>
		</Stack>
	);
}
