import { Stack, Field, Label } from '../../../../../components';
import { CustomTextField } from '../components/CustomInputs';

export default function LiftShaft({ equipment }) {
	const liftShaft = equipment?.lift_shaft || {};
	
	return (
		<Stack className=''>
			<div className='text-2xl my-6'>Lift Shaft</div>
			
			<Stack className='gap-2'>
					<Field className='flex items-center gap-x-4'>
						<Label className="w-60 text-sm font-medium ">
							Liftwell construction
						</Label>
						<div className='flex-1'>
							<CustomTextField
								fieldPath="lift_shaft.liftwell_construiction"
								defaultValue={liftShaft.liftwell_construiction || ''}
								placeholder="Enter liftwell construction details"
							/>
						</div>
					</Field>

					<Field className='flex items-center gap-x-4'>
						<Label className="w-60 text-sm font-medium ">
							Vents in liftwell
						</Label>
						<div className='flex-1'>
							<CustomTextField
								fieldPath="lift_shaft.vents_in_liftwell"
								defaultValue={liftShaft.vents_in_liftwell || ''}
								placeholder="Enter vents in liftwell info"
							/>
						</div>
					</Field>

					<Field className='flex items-center gap-x-4'>
						<Label className="w-60 text-sm font-medium ">
							Sprinklers/smoke detectors at top of liftwell
						</Label>
						<div className='flex-1'>
							<CustomTextField
								fieldPath="lift_shaft.sprinklers_smoke_detectors"
								defaultValue={liftShaft.sprinklers_smoke_detectors || ''}
								placeholder="Enter sprinklers/smoke detectors info"
							/>
						</div>
					</Field>

					<Field className='flex items-center gap-x-4'>
						<Label className="w-60 text-sm font-medium ">
							Ledges in liftwell
						</Label>
						<div className='flex-1'>
							<CustomTextField
								fieldPath="lift_shaft.ledges_in_liftwell"
								defaultValue={liftShaft.ledges_in_liftwell || ''}
								placeholder="Enter ledges in liftwell info"
							/>
						</div>
					</Field>

					<Field className='flex items-center gap-x-4'>
						<Label className="w-60 text-sm font-medium ">
							False pit floors
						</Label>
						<div className='flex-1'>
							<CustomTextField
								fieldPath="lift_shaft.false_pit_floors"
								defaultValue={liftShaft.false_pit_floors || ''}
								placeholder="Enter false pit floors info"
							/>
						</div>
					</Field>

					<Field className='flex items-center gap-x-4'>
						<Label className="w-60 text-sm font-medium ">
							Building services in liftwell
						</Label>
						<div className='flex-1'>
							<CustomTextField
								fieldPath="lift_shaft.building_services_in_liftwell"
								defaultValue={liftShaft.building_services_in_liftwell || ''}
								placeholder="Enter building services in liftwell info"
							/>
						</div>
					</Field>

					<Field className='flex items-center gap-x-4'>
						<Label className="w-60 text-sm font-medium ">
							Sprinklers in pit
						</Label>
						<div className='flex-1'>
							<CustomTextField
								fieldPath="lift_shaft.sprinklers_in_pit"
								defaultValue={liftShaft.sprinklers_in_pit || ''}
								placeholder="Enter sprinklers in pit info"
							/>
						</div>
					</Field>
			</Stack>
		</Stack>
	);
}
