import { Reorder } from 'framer-motion';
import ChecklistItem from './ChecklistItem';

export default function ChecklistTable({ checklists, isEditing, setChecklists }) {
    // Ensure checklists is always an array
    const safeChecklists = Array.isArray(checklists) ? checklists.filter(Boolean) : [];
    
    // Show empty state if no checklists
    if (safeChecklists.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-xs border-slate-300 border-solid">
                <div className="text-center">
                    <i className="fa-solid fa-clipboard-list text-4xl text-gray-400 mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No checklist items found</h3>
                    <p className="text-sm text-gray-500">
                        {isEditing 
                            ? "Add some checklist items to get started with your inspection."
                            : "No checklist items are available for the selected criteria."
                        }
                    </p>
                </div>
            </div>
        );
    }
    
    return (
        <Reorder.Group
            values={safeChecklists}
            onReorder={isEditing ? setChecklists : undefined}
            className="flex flex-col border rounded-xs border-slate-300 border-solid divide-y divide-y-slate-600 "
        >
            <div className="flex flex-row p-4 font-semibold text-lg">
                {isEditing && <div className="w-16" />}
                <div className="w-16 px-2">S.N</div>
                <div className="w-64">Category</div>
                <span className="grow">Inspection Item</span>
                <div className="w-64">Description</div>
                {!isEditing && <span className="w-10" />}
            </div>
            {safeChecklists.map((checklist, idx) => (
                <ChecklistItem
                    key={checklist._id || idx}
                    idx={idx}
                    item={checklist}
                    isEditing={isEditing}
                    setChecklists={setChecklists}
                />
            ))}
        </Reorder.Group>
    );
}
