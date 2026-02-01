import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

const PhotoFormCamera = ({ data, setData, setLastPhoto, setUseCamera }) => {
    const [cameraGranted, setCameraGranted] = useState();
    const cameraRef = useRef();

    useEffect(() => {
        var stream;
        const checkPermission = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                setCameraGranted(true);
            } catch (error) {
                console.error("Error loading stream:", error);
                setCameraGranted(false);
            }
        }

        checkPermission();

        return () => {
            if (stream) stream.getTracks()[0].stop();
        };
    }, []);

    // handles uploading new photo from user's camera
    const capture = useCallback(async () => {
        if (cameraGranted === false) return;
        // take photo
        var image = cameraRef.current.getScreenshot();
        // convert from base64 -> blob
        image = await fetch(image);
        image = await image.blob();
        // change data
        setLastPhoto(data.photo);
        setData({ ...data, ["photo"]: image });
        setUseCamera(false)
    }, [cameraRef, data, setData, setLastPhoto, setUseCamera, cameraGranted]);

    const cancel = () => {
        setUseCamera(false);
    };

    return (
        <div className="photo-form-camera-container">
            <div id="camera-view">
                {cameraGranted ?
                    <Webcam id="webcam" ref={cameraRef} mirrored screenshotFormat="image/jpeg" disablePictureInPicture={true} />
                    :
                    <p id="no-webcam">No camera access.</p>
                }
            </div>
            <div>
                <button onClick={capture}>Capture</button>
                <button onClick={cancel}>Cancel</button>
            </div>
        </div>
    );
};

export default PhotoFormCamera;
