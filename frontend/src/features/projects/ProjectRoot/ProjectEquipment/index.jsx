import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext, useEffect, useState } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'

import { deleteEquipment, patchEquipment } from '../../../../lib/api'
import { Stack, Button, Modal, ProjectSyncIndicator, Online } from '../../../../components'
import { ProjectContext } from '../../projectContext'
import { useEquipment } from '../../../../hooks'

const EquipmentRoot = () => {
	const navigate = useNavigate()
	const { projectId, equipmentId } = useParams()
	const { offlineProject: project, projectQuery } = useContext(ProjectContext)
	const [isDeleteDialogOpen, setIsDialogOpen] = useState(false)
	const showDeleteDialog = () => setIsDialogOpen(true)
	const hideDeleteDialog = () => setIsDialogOpen(false)

	const { equipment } = useEquipment(equipmentId)

	const deleteMutation = useMutation({
		mutationFn: () => deleteEquipment(equipmentId),
		onSuccess: () => {
		}
	})

	const addEquipmentAttachment = (attachment) => {
		setEquipment((equipment) => ({
			...equipment,
			attachments: [...equipment.attachments, attachment],
			floors: equipment?.floors || [],
		}))
	}

	const onCloseSuccessDeleteDialog = () => {
		projectQuery.refetch()
		hideDeleteDialog()
		navigate(`/projects/${projectId}`)
	}

	const onCloseDeleteDialog = () => {
		if (deleteMutation.isPending) return
		hideDeleteDialog()
	}

	if (!equipment) return null;

	return (
		<Stack className=''>
			{/* Show sync status for this project */}
			<Online>
				<Stack horizontal className='justify-between items-center bg-white py-6 px-8 '>
					<h2 className='text-2xl text-blue-700'>Equipment: {equipment.name}</h2>
					<Button variant='outline' onClick={showDeleteDialog} color='red' disabled={project.has_local_changes}>
						<i className='fa-solid fa-trash mr-2'></i>
						Delete Equipment
					</Button>
				</Stack>
			</Online>
			<div className='px-8 py-4'>
				<Outlet
					context={{
						equipment,
						addEquipmentAttachment,
					}}
				/>
			</div>
			{isDeleteDialogOpen && (
				<Modal
					title='Delete Equipment'
					open={isDeleteDialogOpen}
					hideDialog={onCloseDeleteDialog}
				>
					<Stack className='gap-2'>
						{!deleteMutation.isSuccess &&
							<span>
								Please confirm to delete the equipment: {equipment.name}
							</span>}
						{deleteMutation.isPending && (
							<span>
								<i classname='fa-solid fa-spin fa-spinner text-sky-500'></i>{' '}
								Deleting Equipment ...
							</span>
						)}
						{deleteMutation.isSuccess && (
							<Stack className='pt-8  gap-4'>
								<span>
									<i classname='fa-solid fa-check-circle text-emerald-500'></i>{' '}
									Equipment removed successfully
								</span>
								<Button onClick={onCloseSuccessDeleteDialog}>
									Close
								</Button>
							</Stack>


						)}
					</Stack>
					{!deleteMutation.isSuccess && <Stack horizontal className='pt-8 justify-end gap-4'>
						<Button onClick={onCloseDeleteDialog}>
							{deleteMutation.isSuccess ? 'Close' : 'Cancel'}
						</Button>
						<Button
							onClick={deleteMutation.mutate}
							disabled={deleteMutation.isSuccess || deleteMutation.isPending}
							variant='outline'
						>
							Delete
						</Button>
					</Stack>}
				</Modal>
			)}
		</Stack>
	)
}
export default EquipmentRoot
