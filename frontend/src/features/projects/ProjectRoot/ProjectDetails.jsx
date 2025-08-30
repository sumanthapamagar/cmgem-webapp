import {Online, Stack} from '../../../components'
import ProjectRoutes from './ProjectRoutes'
import {ProjectHeader} from './ProjectHeader'

const ProjectDetails = () => {

	return (
		<Stack className='grow h-[calc(100vh-56px)] overflow-y-auto bg-white'>
			<Online>
				<ProjectHeader />
			</Online>
			<ProjectRoutes />
		</Stack>
	)
}

export default ProjectDetails
