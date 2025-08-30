import { Stack, Field, Label } from '../../../../../components';
import { CustomTextField } from '../components/CustomInputs';

export default function Landings({ equipment }) {
	const landings = equipment?.landings || {};
	
	return (
		<Stack className=''>
			<div className='text-2xl my-6'>Landings</div>

			<Stack className='gap-2'>
				<Field className='flex items-center gap-x-4'>
					<Label className="w-60 font-medium ">
						In case of Fire signs
					</Label>
					<div className='flex-1'>
						<CustomTextField
							fieldPath="landings.fire_rated_landing_doors"
							defaultValue={landings.fire_rated_landing_doors || ''}
							placeholder="Enter fire rated landing doors info"
						/>
					</div>
				</Field>

				<Field className='flex items-center gap-x-4'>
					<Label className="w-60 font-medium ">
						Landing Signalisation type
					</Label>
					<div className='flex-1'>
						<CustomTextField
							fieldPath="landings.landing_signalisation_type"
							defaultValue={landings.landing_signalisation_type || ''}
							placeholder="Enter landing signalisation type"
						/>
					</div>
				</Field>

				<Field className='flex items-center gap-x-4'>
					<Label className="w-60 font-medium ">
						No of landing button risers
					</Label>
					<div className='flex-1'>
						<CustomTextField
							fieldPath="landings.no_of_landing_button_risers"
							defaultValue={landings.no_of_landing_button_risers || ''}
							placeholder="Enter number of landing button risers"
						/>
					</div>
				</Field>

				<Field className='flex items-center gap-x-4'>
					<Label className="w-60 font-medium ">
						Landing doors and frame finishes
					</Label>
					<div className='flex-1'>
						<CustomTextField
							fieldPath="landings.landing_doors_frame_finishes"
							defaultValue={landings.landing_doors_frame_finishes || ''}
							placeholder="Enter landing doors and frame finishes"
						/>
					</div>
				</Field>
			</Stack>
		</Stack>
	);
}
