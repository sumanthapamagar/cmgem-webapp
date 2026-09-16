import { useRef } from 'react';
import { Button } from '../../../../../../../components';
import { useParams } from 'react-router-dom';
import { useImageUpload } from '../../../../../../../hooks/useImageUpload';

export const UploadButton = ({  inspectionItem }) => {
    const {projectId, equipmentId} = useParams()
    const ref = useRef();
    const { onSelectImages } = useImageUpload(projectId, equipmentId, inspectionItem);


    return (
        <div className='flex'>
            <Button
                className="relative"
                color="light"
                onClick={(ev) => {
                    if (!ref.current) return;
                    ref.current.click();
                }}
            >
                <i className="fa-solid fa-cloud-arrow-up fa-fw mr-4"></i>
                Add Images
            </Button>
            <input
                hidden
                type="file"
                ref={ref}
                onChange={onSelectImages}
                multiple
            />
        </div>
    );
};
