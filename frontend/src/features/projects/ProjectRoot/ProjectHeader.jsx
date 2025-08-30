import { useContext, useState } from 'react'
import { getIdToken } from '../../../lib/authConfig'
import { Modal, Button, Stack, ButtonGroup } from '../../../components'
import { deleteProject, api } from '../../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { projectKeys } from '../projects'
import { useNavigate, useParams } from 'react-router-dom'
import { ProjectContext } from '../projectContext'

export function ProjectHeader() {
    const { projectId } = useParams();
    const { offlineProject: project } = useContext(ProjectContext)
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const deleteMutation = useMutation({
        mutationFn: () => deleteProject(project._id),
    })

    const hideDeleteDialog = () => setIsDialogOpen(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isDownloadingReport, setIsDownloadingReport] = useState(false)
    const [isDownloadingInspectionReport, setIsDownloadingInspectionReport] = useState(false)
    const showDeleteDialog = () => setIsDeleteDialogOpen(true)
    
    const handleClick = async (ev) => {
        ev.preventDefault()

        if (isDownloadingReport) return; // Prevent multiple clicks

        setIsDownloadingReport(true)
        try {
            
            // Get the blob from the response
            const blob = await api.projects.downloadInspectionReportWord(projectId)
            
            // Create a download link
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `project_report_${projectId}.docx`
            
            // Trigger download
            document.body.appendChild(link)
            link.click()
            
            // Cleanup
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Error downloading report:', error)
            // You could add a toast notification here for better UX
            alert('Failed to download report. Please try again.')
        } finally {
            setIsDownloadingReport(false)
        }
    }

    const createInspectionChecklist = async (ev) => {
        ev.preventDefault()

        if (isDownloadingInspectionReport) return; // Prevent multiple clicks

        setIsDownloadingInspectionReport(true)
        try {
            // Download the inspection report using the API
            const blob = await api.projects.downloadInspectionReport(projectId)
            
            // Create a download link
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `inspection_report_${projectId}.xlsx`
            
            // Trigger download
            document.body.appendChild(link)
            link.click()
            
            // Cleanup
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Error downloading inspection report:', error)
            // You could add a toast notification here for better UX
            alert('Failed to download inspection report. Please try again.')
        } finally {
            setIsDownloadingInspectionReport(false)
        }
    }
    const onCloseDeleteDialog = () => {
        if (deleteMutation.isPending) return
        hideDeleteDialog()
        //invalidate project queries
        queryClient.invalidateQueries({
            queryKey: projectKeys.all(),
        })
        navigate(`/projects`)
        //navigate to home
    }
    if (!project) return null;
    return (<Stack horizontal className='justify-between px-8 items-center py-4 bg-neutral-100'>
        <h1 className='font-light text-4xl'>Project: {project.name}</h1>
        <Stack horizontal className='gap-2 '>
            <ButtonGroup>
                <Button onClick={handleClick} color='sky' disabled={isDownloadingReport}>
                    <i className={`fa-solid fa-file-word fa-lg mr-2 `}></i>
                    {isDownloadingReport ? 'Downloading Report...' : 'Download Report'}
                </Button>
                <Button onClick={createInspectionChecklist} color='emerald' disabled={isDownloadingInspectionReport}>
                    <i className={`fa-solid fa-file-excel fa-lg mr-2 `}></i>
                    {isDownloadingInspectionReport ? 'Downloading Lift Inspection Checklist...' : 'Download Lift Inspection Checklist'}
                </Button>

                <Button onClick={showDeleteDialog} color='red'>
                    <i className='fa-solid fa-trash fa-lg mr-2'></i>
                    Delete Project
                </Button>
            </ButtonGroup>
            {isDeleteDialogOpen && (
                <Modal
                    title='Delete Equipement'
                    open={isDeleteDialogOpen}
                    hideDialog={onCloseDeleteDialog}
                >
                    <Stack className='gap-2'>
                        <span>Please confirm to delete the project: {project.name}</span>
                        {deleteMutation.isPending && (
                            <span className='text-sm'>
                                <i className='fa-solid fa-spin fa-spinner text-sky-500'></i>{' '}
                                Deleting Project ...
                            </span>
                        )}
                        {deleteMutation.isSuccess && (
                            <span className='text-sm'>
                                <i className='fa-solid fa-check-circle text-emerald-500'></i>{' '}
                                Project removed successfully
                            </span>
                        )}
                    </Stack>
                    <Stack horizontal className='pt-8 justify-end gap-4'>
                        <Button onClick={onCloseDeleteDialog}>
                            {deleteMutation.isSuccess ? 'Close' : 'Cancel'}
                        </Button>
                        <Button onClick={deleteMutation.mutate} variant='outline'>
                            Delete
                        </Button>
                    </Stack>
                </Modal>
            )}
        </Stack>
    </Stack>)

}