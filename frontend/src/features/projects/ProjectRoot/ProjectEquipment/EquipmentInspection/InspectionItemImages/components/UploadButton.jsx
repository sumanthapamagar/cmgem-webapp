import { useRef } from 'react';
import { Button } from '../../../../../../../components';

export const UploadButton = ({ onSelectImages }) => {
    const ref = useRef();

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
                Add pictures
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
