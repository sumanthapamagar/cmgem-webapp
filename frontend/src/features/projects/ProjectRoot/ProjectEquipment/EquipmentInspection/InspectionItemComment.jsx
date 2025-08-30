import { Field } from '../../../../../components';
import { CustomTextArea } from '../components/CustomInputs';

export default function InspectionItemComment({ inspectionItem, equipment }) {
	const currentComment = equipment?.checklists?.[inspectionItem._id]?.comment || '';
	
	return (
		<div className='relative'>
			<div className="flex items-center gap-2">
				<Field className='flex items-center gap-4 w-96'>
					<CustomTextArea
						fieldPath={`checklists.${inspectionItem._id}.comment`}
						defaultValue={currentComment}
						rows={2}
						placeholder="Add inspection comment..."
					/>
				</Field>
			</div>
		</div>
	)
}
