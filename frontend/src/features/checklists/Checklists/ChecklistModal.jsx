import { Modal } from '../../../components';
import ChecklistItemForm from './ChecklistItemForm';

export default function ChecklistModal({ 
    isOpen, 
    onClose, 
    onSaveSuccess, 
    title = "Add New Checklist Item" 
}) {
    if (!isOpen) return null;

    return (
        <Modal
            open={isOpen}
            hideDialog={onClose}
            title={title}
            size="xl"
        >
            <ChecklistItemForm
                onSaveSuccess={onSaveSuccess}
                onCancel={onClose}
            />
        </Modal>
    );
}
