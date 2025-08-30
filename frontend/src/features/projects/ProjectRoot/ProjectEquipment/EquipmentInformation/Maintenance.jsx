import { Stack, Field, Label } from '../../../../../components';
import { CustomTextField, CustomNumberField } from '../components/CustomInputs';

export default function Maintenance({ equipment }) {
	const maintenance = equipment?.maintenance || {};
	
	return (
		<Stack className=''>
			<div className='text-2xl my-6'>Maintenance Information</div>

			<Stack className='gap-2'>
				<Field className='flex items-center gap-x-4'>
					<Label className="w-60 text-sm font-medium ">
						Current Maintenance Provider
					</Label>
					<div className='flex-1'>
						<CustomTextField
							fieldPath="maintenance.current_provider"
							defaultValue={maintenance.current_provider || ''}
							placeholder="Enter maintenance provider"
						/>
					</div>
				</Field>
			</Stack>
		</Stack>
	);
}
