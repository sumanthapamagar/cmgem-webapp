import  { useEffect, useState, useRef, useCallback, useContext } from 'react';
import Webcam from "react-webcam";
import { Button, Dialog, DialogActions, DialogBody, Text } from '../../../../../../../components';
import localforage from 'localforage';
import { ProjectContext } from '../../../../../projectContext';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

const InAppCamera = ({inspectionItem}) => {
  const { offlineProject: project } = useContext(ProjectContext);
  const queryClient = useQueryClient();
  const webcamRef = useRef(null);
  const [isCameraAvailable, setIsCameraAvailable] = useState(false);
  const [img, setImg] = useState(null);
  const [savedOfflineImages, setSavedOfflineImages] = useState([]);

  useEffect(() => {
    return () => {
      // Cleanup function to revoke object URLs when the component unmounts
      if (img) {
        URL.revokeObjectURL(img);
      }

      setImg(null);
      setSavedOfflineImages([]);
    }
  }, []);

  const { equipmentId } = useParams();
 
  const videoConstraints = {
      facingMode: { exact: "environment" },
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImg(imageSrc);
  }, [webcamRef]);

  const saveOfflineImage = async () => {
    const img_key = `photo_${project._id}_${equipmentId}_${inspectionItem._id}_${Date.now()}`;
    if(!img) {
      console.error("No image to save.");
      return;
    }
    await localforage.setItem(img_key, {
      id: img_key,
      file: img, 
      equipmentId: equipmentId,
      data: {
        group_id: inspectionItem.location,
        equipmentId: equipmentId,
        inspection_item: inspectionItem._id
      }
    });
    setSavedOfflineImages(prev => [...prev, img]);
    setImg(null);
    queryClient.invalidateQueries({
      queryKey: ["offlineImageKeys", project._id],
    });
  }
  
  return (
    <div>
      { isCameraAvailable && (
        <Dialog size='4xl' show ={isCameraAvailable} onClose={() => setIsCameraAvailable(false)}>
          <DialogBody>
            { img ? (
              <img src={img} alt="Captured" />
            ) :
              (
                <Webcam
                  ref={webcamRef}
                  imageSmoothing={true}
                  disablePictureInPicture={true}
                  videoConstraints={videoConstraints}
                  minScreenshotHeight={1080}
                  minScreenshotWidth={1980}
                />
              )
            }
             {
              savedOfflineImages.length > 0 && (
                <div className="mt-4">
                  <Text size="sm" weight="medium">Saved Offline Images:</Text>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {savedOfflineImages.map((image, index) => (
                      <img key={index} src={image} alt={`Saved ${index}`} className="w-24 h-24 object-cover rounded" />
                    ))}
                  </div>
                </div>
              )
             }
          </DialogBody>
          <DialogActions>
            {
              img ? (
                <>
                  <Button onClick={() => setImg(null)} color="light">
                    <i className="fa-solid fa-rotate-left fa-fw mr-2"></i> Retake
                  </Button> 
                  <Button onClick={saveOfflineImage} color="blue">
                    <i className="fa-solid fa-save fa-fw mr-2"></i> Save
                  </Button> 
                </>
              ):(
                <Button onClick={capture}>
                  <i className="fa-solid fa-camera fa-fw mr-2"></i> Capture photo
                </Button>
              )
            }
            <Button onClick={() => setIsCameraAvailable(false)} plain>Close</Button>
          </DialogActions>
        </Dialog>
      )}
      <Button onClick={() => setIsCameraAvailable(true)} className="h-8 w-8">
        <i className="fa-solid fa-camera"></i> 
      </Button>
    </div>
  )
};

export default InAppCamera;