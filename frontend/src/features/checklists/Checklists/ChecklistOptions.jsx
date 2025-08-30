import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { Button, Modal } from '../../../components';
import { deleteChecklist } from '../../../lib/api';
import ChecklistItemForm from './ChecklistItemForm';

export default function ChecklistOptions({ item, setChecklists }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const { mutate: onDelete } = useMutation({
        mutationFn: () => deleteChecklist(item._id),
        onSuccess: (res) => {
            setChecklists(checklists => 
                checklists.filter(checklist => checklist._id !== item._id)
            );
            setIsDeleting(false);
            setIsEditing(false);
        }
    });

    return (
        <>
            <Popover className="relative">
                <Popover.Button className="px-4 cursor-pointer">
                    <i className="fa-solid fa-ellipsis-vertical"></i>
                </Popover.Button>
                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                >
                    <Popover.Panel className="absolute right-0 z-10 top-full flex w-screen max-w-min px-4">
                        <div className="w-36 shrink rounded-xl bg-white p-4 text-sm font-semibold leading-6 text-gray-900 shadow-lg ring-1 ring-gray-900/5">
                            <button
                                className="py-2 w-full text-left hover:text-sky-400"
                                onClick={() => setIsEditing(true)}
                            >
                                <i className="fa-fw fa-solid fa-pencil mr-4"></i>
                                Edit
                            </button>
                            <button
                                className="py-2 w-full text-left hover:text-sky-400"
                                onClick={() => setIsDeleting(true)}
                            >
                                <i className="fa-fw fa-solid fa-trash mr-4"></i>
                                Delete
                            </button>
                        </div>
                    </Popover.Panel>
                </Transition>
            </Popover>

            {isEditing && (
                <Modal
                    open={isEditing}
                    hideDialog={() => setIsEditing(false)}
                    title="Edit Inspection Item"
                >
                    <ChecklistItemForm
                        id={item._id}
                        onSaveSuccess={(updatedChecklist) => {
                            setChecklists((checklists) =>
                                checklists.map((checklist) =>
                                    checklist._id === updatedChecklist._id
                                        ? updatedChecklist
                                        : checklist
                                )
                            );
                            setIsEditing(false);
                        }}
                        onCancel={() => setIsEditing(false)}
                    />
                </Modal>
            )}

            {isDeleting && (
                <Modal
                    open={isDeleting}
                    hideDialog={() => setIsDeleting(false)}
                    title="Confirm to Delete Inspection Item"
                >
                    <div className="flex gap-4">
                        <Button onClick={onDelete}>Confirm and Delete</Button>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleting(false)}
                        >
                            Cancel and Exit
                        </Button>
                    </div>
                </Modal>
            )}
        </>
    );
}
