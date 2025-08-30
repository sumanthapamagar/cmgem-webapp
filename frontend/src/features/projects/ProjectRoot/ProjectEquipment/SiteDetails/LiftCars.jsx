import { Stack, Field, Label } from '../../../../../components';
import { CustomTextField } from '../components/CustomInputs';

export default function LiftCars({ equipment }) {
	const liftCar = equipment?.lift_car || {};
	
	return (
		<Stack className=''>
			<div className='text-2xl my-6'>Lift Cars</div>

			<Stack className='gap-2'>
				<Field className='flex items-center gap-x-4'>
					<Label className="w-60 text-sm font-medium ">
						Car interior Details
					</Label>
					<div className='flex-1'>
						<CustomTextField
							fieldPath="lift_car.car_interior"
							defaultValue={liftCar.car_interior || ''}
							placeholder="Enter car interior details"
						/>
					</div>
				</Field>

				<Field className='flex items-center gap-x-4'>
					<Label className="w-60 text-sm font-medium ">
						Car door finishes
					</Label>
					<div className='flex-1'>
						<CustomTextField
							fieldPath="lift_car.car_door_finish"
							defaultValue={liftCar.car_door_finish || ''}
							placeholder="Enter car door finishes"
						/>
					</div>
				</Field>

				<Field className='flex items-center gap-x-4'>
					<Label className="w-60 text-sm font-medium ">
						Car door type
					</Label>
					<div className='flex-1'>
						<CustomTextField
							fieldPath="lift_car.car_door_type"
							defaultValue={liftCar.car_door_type || ''}
							placeholder="Enter car door type"
						/>
					</div>
				</Field>

				<Field className='flex items-center gap-x-4'>
					<Label className="w-60 text-sm font-medium ">
						Car signalisation type (Buttons and Indication)
					</Label>
					<div className='flex-1'>
						<CustomTextField
							fieldPath="lift_car.car_signalisation"
							defaultValue={liftCar.car_signalisation || ''}
							placeholder="Enter car signalisation type"
						/>
					</div>
				</Field>
			</Stack>
		</Stack>
	);
}
