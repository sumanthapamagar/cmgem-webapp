import { useEffect, useState } from 'react'
import {
	Dialog,
	DialogBackdrop,
	DialogPanel,
} from '@headlessui/react'
import {  useLocation, useParams } from 'react-router-dom'
import clsx from 'clsx'
import { useMsalAccount } from '../../hooks/useMsalAccount'
import { useNetworkStatus } from '../../contexts/NetworkStatusContext'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sendPatchRequest } from '../../lib/api'
import { Stack, Button } from '../../components'
import { projectKeys } from '../../features/projects/projects'
import { LoadingState, Online, Offline, Link, OfflineModeToggle } from '../../components'

export function Header() {
    const queryClient = useQueryClient();
	const { isOnline } = useNetworkStatus()
	const location = useLocation()
	const user = useMsalAccount()

	const [isSyncing, setIsSyncing] = useState(false)

	const offlineDataMutations = useMutation({
		mutationFn: sendPatchRequest,
	})

	const currentActive = React.useMemo(() => {
		if (location) {
			const locations = location.pathname.split('/')
			return locations.length > 1 ? locations[1] : null
		}
		return null
	}, [location?.pathname])

	useEffect(() => {
		const syncOfflineData = async () => {
			const pendingUpdateData =
				JSON.parse(localStorage.getItem('cmgem_offline_updates')) ?? {}

			// Process each update sequentially
			for (const uri of Object.keys(pendingUpdateData)) {
				setIsSyncing(true)
				await offlineDataMutations.mutateAsync(
					{
						uri,
						data: pendingUpdateData[uri],
					},
					{
						onSuccess: () => {
							delete pendingUpdateData[uri]
							localStorage.setItem(
								'cmgem_offline_updates',
								JSON.stringify(pendingUpdateData)
							)
								queryClient.invalidateQueries({
									queryKey: projectKeys.details()
								});
						},
					}
				)
			}
		}
		if (isOnline) {
			syncOfflineData()
		}
	}, [isOnline])

	return (
		<div className='sticky top-0 z-50 bg-white text-gray-700 text-base'>
			<div className='h-12 flex sm:px-4 lg:px-8 px-2  items-center justify-between shadow-sm'>
				<div className='flex items-center px-2 lg:px-0'>
					<div className='shrink-0'>
						<Link href='/'>
							<img
								src='/Logo.jpg'
								className='relative border-4 rounded-sm border-white'
								width='60'
							/>
						</Link>
					</div>
					<div className='ml-6 block'>
						<div className='flex space-x-4 font-normal'>
							{/* Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" */}
							<Link
								href='/projects'
								className={clsx(
									' px-3 py-1',
									['', 'projects'].includes(currentActive)
										? 'text-blue-800 border-neutral-700 border-b-2 font-semibold'
										: ''
								)}
							>
								Audit Reports
							</Link>
							<Online>
								<Link
									href='/accounts'
									className={clsx(
										'px-3 py-1 ',
										'accounts' === currentActive
											? 'text-blue-800 border-neutral-700 border-b-2 font-semibold'
											: ''
									)}
								>
									Accounts
								</Link>
							</Online>
						</div>
					</div>
				</div>
				<div className='flex items-center gap-4'>
					
					<Online>
						<div className='ml-4 block'>
							<div className='flex items-center'>
								<Link
									href='/checklists'
									className={clsx(
										'ml-12 px-3 py-1',
										'checklists' === currentActive
											? 'text-blue-800 border-neutral-200 border-b-2 font-semibold'
											: ''
									)}
								>
									Checklists
								</Link>

								<span>{user.name}</span>
							</div>
						</div>
					</Online>
					<OfflineModeToggle />

				</div>
			</div>
			<Offline>
				<div className='bg-yellow-400 p-2'>
					App is running offline. All updates will be synced when online.
				</div>
			</Offline>
			{isSyncing && (
				<Dialog
					open={true}
					onClose={() => {
						if (!offlineDataMutations.isPending) setIsSyncing(false)
					}}
					as='div'
					className='relative z-10 focus:outline-hidden'
				>
					<DialogBackdrop className='fixed inset-0 bg-black/30' />
					<div className='fixed inset-0 z-10 w-screen overflow-y-auto'>
						<div className='flex min-h-full items-center justify-center p-4'>
							<DialogPanel className='h-20 bg-white text-sm p-8'>
								{offlineDataMutations.isPending && (
									<Stack>
										<LoadingState />
										<div>Syncing changes from offline use</div>
									</Stack>
								)}
								{!offlineDataMutations.isPending && (
									<Stack className="gap-4">
										{offlineDataMutations.isSuccess && (
											<div>
												<i className='fa-solid fa-check fa-fw text-emerald-600' />
												All changes saved successfully
											</div>
										)}
										<Button variant="outline" onClick={() => setIsSyncing(false)}>Close</Button>
									</Stack>
								)}
							</DialogPanel>
						</div>
					</div>
				</Dialog>
			)}
		</div>
	)
}
