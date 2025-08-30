import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Link, useNavigate } from 'react-router-dom';

import { Stack, Button, Modal, Table, TableHead, TableBody, TableRow, TableHeader, TableCell, AccountLoadingState } from '../../../components';
import { getAccounts } from '../../../lib/api';

export default function Accounts() {
    const { data, isLoading } = useQuery({
        queryKey: ['accounts'],
        queryFn: () => getAccounts()
    });

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const hideDialog = () => setIsDialogOpen(false);
    const navigate = useNavigate();
    const onOpen = () => navigate('new');

    if (isLoading)
        return (
            <AccountLoadingState />
        );

    return (
        <Stack className="p-2 sm:p-4 lg:p-8 gap-6">
            <Stack horizontal className="gap-6 justify-between">
                <h1 className="text-5xl font-light">Customer Accounts</h1>
                <Button onClick={onOpen}>Create New Account</Button>
            </Stack>
            <Table grid className="border-4 border-alice-blue rounded-lg" dense striped>
                <TableHead>
                    <TableRow>
                        <TableHeader className="font-semibold bg-alice-blue text-lg h-12 " >Account Name</TableHeader>
                        <TableHeader className="font-semibold bg-alice-blue text-lg w-60 h-12">Created Date</TableHeader>
                        <TableHeader className="font-semibold bg-alice-blue text-lg w-44 h-12">Created By</TableHeader>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data?.map((account) => (
                        <TableRow
                            key={account.id}
                            href={`/accounts/${account._id}`}
                        >
                            <TableCell>
                                <p className="font-semibold text-gray-900">
                                    {account.name}
                                </p>
                            </TableCell>
                            <TableCell>
                                <p className="truncate">
                                    {dayjs(account.created_at).format(
                                        'DD MMM YYYY'
                                    )}
                                </p>
                            </TableCell>
                            <TableCell>
                                <p className="truncate">
                                    {account.created_by?.name || 'John Doe'}
                                </p>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {isDialogOpen && (
                <Modal
                    open={isDialogOpen}
                    hideDialog={hideDialog}
                    title="Add New Account"
                >
                    <Stack horizontal className="justify-end gap-6 mt-8">
                        <p>Account form here</p>
                        <Link to="/buildings/building1/building-details">
                            <Button onClick={hideDialog}>Create</Button>
                        </Link>
                        <Button onClick={hideDialog} variant="outline">
                            Cancel
                        </Button>
                    </Stack>
                </Modal>
            )}
        </Stack>
    );
}
