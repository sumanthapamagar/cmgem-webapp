import { useParams } from 'react-router-dom';
import { Button, Modal, Stack, ChecklistLoadingState } from '../../../components';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getChecklists, patchChecklists, deleteChecklist } from '../../../lib/api';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { Popover, Transition } from '@headlessui/react';
import ChecklistItemForm from './ChecklistItemForm';
import locationCategories from '../../../constants/locationCategories';

export default function Checklists() {
    const { equipmentType, location } = useParams();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const hideDialog = () => setIsDialogOpen(false);
    const [checklists, setChecklists] = useState([]);
    const [isEditing, setIsEdting] = useState(false);

    useEffect(() => {
        setIsEdting(false);
    }, [equipmentType, location]);

    const { data: checklistData, isLoading } = useQuery({
        queryKey: ['checklists', equipmentType, location],
        queryFn: () =>
            getChecklists({ equipment_type: equipmentType, location }).then(
                (res) => {
                    setChecklists(
                        res);
                    return res;
                }
            )
    });

    const { mutate: mutatePatchChecklists } = useMutation({
        mutationFn: (data) => patchChecklists(data),
        onSuccess: (res) => {
            setIsEdting(false);
        }
    });

    const onUpdateChecklistOrder = () => {
        mutatePatchChecklists(
            checklists.map((checklist, idx) => ({
                id: checklist._id,
                order: idx
            }))
        );
    };

    if (isLoading)
        return (
            <ChecklistLoadingState />
        );

    return (
        <Stack className=" gap-10">
            <Stack horizontal className="gap-6 justify-between">
                <h1 className="text-2xl font-bold">Checklists</h1>
                <Stack horizontal className="gap-6">
                    {!isEditing && (
                        <Button
                            variant="outline"
                            onClick={() => setIsEdting(true)}
                        >
                            Edit checklists order
                        </Button>
                    )}
                    <Button onClick={() => setIsDialogOpen(true)}>
                        Add new
                    </Button>
                </Stack>
            </Stack>

            <Reorder.Group
                values={checklists}
                onReorder={isEditing ? setChecklists : null}
                className="flex flex-col border rounded-xs border-slate-300 border-solid divide-y divide-y-slate-600 overflow-hidden"
            >
                <div className="flex flex-row p-4  font-semibold  text-lg ">
                    {isEditing && <div className="w-16 " />}
                    <div className="w-16 px-2">S.N</div>
                    <div className="w-64">Category</div>
                    <span className="grow ">Inspection Item</span>
                    <div className="w-64">Description</div>
                    {!isEditing && <span className="w-10" />}
                </div>
                {checklists.map((checklist, idx) => (
                    <ChecklistItem
                        key={checklist._id}
                        idx={idx}
                        item={checklist}
                        isEditing={isEditing}
                        setChecklists={setChecklists}
                    />
                ))}
            </Reorder.Group>
            {isEditing && (
                <Stack horizontal className=" gap-6">
                    <Button onClick={onUpdateChecklistOrder}>Save</Button>
                    <Button
                        onClick={() => {
                            setIsEdting(false);
                            setChecklists([...checklistData]);
                        }}
                        variant="outline"
                    >
                        Cancel & Reset
                    </Button>
                </Stack>
            )}

            {!!isDialogOpen && (
                <Modal
                    open={isDialogOpen}
                    hideDialog={hideDialog}
                    title="Add New Checklist Item"
                >
                    <ChecklistItemForm
                        onSaveSuccess={(checklist) => {
                            setChecklists([...checklists, checklist]);
                            setIsEdting(false);
                            hideDialog();
                        }}
                        onCancel={hideDialog}
                    />
                </Modal>
            )}
        </Stack>
    );
}

const ChecklistItem = ({ item, isEditing, idx, setChecklists }) => {
    const controls = useDragControls();
    const itemCategories = useMemo(() => {
        if (!item.category) return '';
        return item.category
            .split('; ')
            .map((category) => {
                const locationCat = locationCategories.find(
                    (cat) => cat.key == category
                );
                return locationCat?.text;
            })
            .join(', ');
    }, [item.category]);
    return (
        <Reorder.Item
            className="flex flex-row px-4 py-2 hover:bg-sky-50"
            key={item._id}
            value={item}
            dragListener={false}
            dragControls={controls}
        >
            {isEditing && (
                <div
                    className="w-16 reorder-handle hover:cursor-move"
                    onPointerDown={(e) => controls.start(e)}
                    transition={{ duration: 0.4 }}
                >
                    <i className="fa-solid fa-lg fa-grip text-slate-400"></i>
                </div>
            )}
            <div className="w-16 px-2">{idx + 1}.</div>
            <div className="w-64">{itemCategories}</div>
            <span className="grow "> {item.title}</span>
            <span className="w-64"> {item.description}</span>
            {!isEditing && (
                <span className="w-10">
                    <ChecklistOptions
                        item={item}
                        setChecklists={setChecklists}
                    />
                </span>
            )}
        </Reorder.Item>
    );
};

const ChecklistOptions = ({ item, setChecklists }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { mutate: onDelete } = useMutation({
        mutationFn: () => deleteChecklist(item._id),
        onSuccess: (res) => {
            setChecklists(checklists => [...checklists.filter(checklist => checklist._id !== item._id)])
            setIsDeleting(false)
            isEditing(false)
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
                                className="py-2 w-full text-left  hover:text-sky-400"
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
                                    checklist._id == updatedChecklist._id
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
                        <Button onClick={onDelete}>Confrim and Delete</Button>
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
};
