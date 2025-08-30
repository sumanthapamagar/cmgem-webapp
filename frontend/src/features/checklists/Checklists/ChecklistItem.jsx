import { useMemo } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import locationCategories from '../../../constants/locationCategories';
import ChecklistOptions from './ChecklistOptions';

export default function ChecklistItem({ item, isEditing, idx, setChecklists }) {
    const controls = useDragControls();
    
    const itemCategories = useMemo(() => {
        if (!item.category) return '';
        return item.category
            .split('; ')
            .map((category) => {
                const locationCat = locationCategories.find(
                    (cat) => cat.text === category
                );
                return locationCat?.text || category;
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
            whileDrag={{ scale: 1.02 }}
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
            <span className="grow">{item.title}</span>
            <span className="w-64">{item.description}</span>
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
}
