import "../styles/PhotoForm.css"
import { useRef, useState } from "react";
import PhotoFormCamera from "./PhotoCamera";
import DefaultAvatar from "../assets/images/DefaultAvatar.png";

const PhotoForm = ({ data, setData }) => {
    const [lastPhoto, setLastPhoto] = useState();
    const [useCamera, setUseCamera] = useState(false)
    const photoInputRef = useRef();
    const backendURL = process.env.REACT_APP_BACKEND_URL;

    // handles input component for photo
    const handleChange = async (e) => {
        e.preventDefault();
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("photo", file);

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/upload`, {
                method: "POST",
                credentials: "include",
                body: formData,
            });

            const result = await response.json();
            if (response.ok) {
                setLastPhoto(result.imageUrl);
                setData({ ...data, photo: result.imageUrl });
            } else {
                console.error(result.error);
            }
        } catch (error) {
            console.error("Upload error:", error);
        }

        //setLastPhoto(data.photo);
        //setData({ ...data, ["photo"]: e.target.files[0] });
    };

    // handles uploading new photo from user's camera
    const handleCamera = () => {
        setUseCamera(true)
    };

    // handles uploading new photo from user's computer
    const handlePhotoUpload = (e) => {
        if (photoInputRef.current) {
            photoInputRef.current.click(e);
        }
    };

    // handles setting lastPhoto as current photo
    const handleLastPhoto = (e) => {
        e.preventDefault();
        setData({ ...data, ["photo"]: lastPhoto });
    };

    return (
        <div className="photo-form-container">
            <h1>Upload Profile Photo</h1>
            <div className="photo">
                {data.photo ? (
                    <img src={typeof data.photo === "string" ? `${backendURL}${data.photo}` : URL.createObjectURL(data.photo)} alt="user" />
                ) : (
                    <img src={DefaultAvatar} alt="default" />
                )}
            </div>
            <input type="file" name="photo" ref={photoInputRef} onChange={handleChange} style={{ display: "none" }} accept="image/png, image/jpeg" />
            <button id="camera" onClick={handleCamera}>Camera</button> {/* TODO: implement camera functionality */}
            {useCamera && <PhotoFormCamera data={data} setData={setData} setLastPhoto={setLastPhoto} setUseCamera={setUseCamera} />}
            <button id="library" onClick={handlePhotoUpload}>Choose from library</button>
            <button id="last" onClick={handleLastPhoto}>Use last photo taken</button>
        </div>
    );
}

export default PhotoForm;
