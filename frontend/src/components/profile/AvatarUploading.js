import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import Cropper from "react-easy-crop";

import { getCroppedImg } from "../../libs/imageUtils";
import axios from "axios";
import { useNotification } from "../../contexts/NotificationContext";
import { useUser } from "../../contexts/UserContext";
import { Button } from "@mui/material";

const MAX_AVATAR_SIZE = 400;
const API_UPLOAD_AVATAR = "/api/account/upload-avatar/";

export default function AvatarUploading() {
  const [avatarFile, setAvatarFile] = useState(null);
  // The return value of `createObjectURL` is always different even with the same input.
  // Thus will cause infinite re-renders: https://github.com/ValentinH/react-easy-crop/issues/231
  const avatarUrl = useMemo(() => {
    if (avatarFile) {
      return URL.createObjectURL(avatarFile);
    }
    return null;
  }, [avatarFile]);
  // the crop/zoom info used for react-easy-crop
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  // stores the x,y,w,h info of the cropped region.
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const { newNotification } = useNotification();

  const { setUser } = useUser();

  /**
   * Handler function that stores user uploaded image to state variable.
   */
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setAvatarFile(file);
  };

  /**
   * Save cropped region
   * @param {*} _
   * @param {*} croppedAreaPixels: The region info of cropped image.
   */
  const handleCropComplete = (_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  /**
   * Clip the cropped region and scale it down to 400x400, and post the data to backend.
   */
  const handleSubmit = async () => {
    try {
      const croppedImageBlob = await getCroppedImg(avatarUrl, croppedAreaPixels, MAX_AVATAR_SIZE);
      // formData is needed to encode and send binary through http
      const formData = new FormData();
      formData.append("avatar", croppedImageBlob, "avatar.jpg");

      let response = await axios.post(API_UPLOAD_AVATAR, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status == 201) {
        newNotification("Avatar successfully uploaded.", "success");
        setUser((prevState) => ({ ...prevState, avatar: response.data }));
      }
    } catch (error) {
      newNotification(`Error uploading avatar: ${error}`, "error");
    }
  };

  return (
    <div className="flex flex-col h-full p-3 gap-8">
      <div className="font-bold">Upload your new avatar</div>
      <motion.div
        className="grow rounded-lg border-sky-500 border-dashed border-2 relative flex justify-center items-center overflow-scroll"
        whileTap={!avatarFile && { scale: 0.97 }}
      >
        {avatarFile ? (
          <div className="w-full h-full relative">
            <Cropper
              image={avatarUrl}
              crop={crop}
              zoom={zoom}
              cropShape="round"
              showGrid={false}
              aspect={1}
              objectFit="horizontal-cover"
              onCropChange={setCrop}
              onCropComplete={handleCropComplete}
              onZoomChange={setZoom}
            />
          </div>
        ) : (
          <>
            <input type="file" accept="image/*" className="absolute w-full h-full opacity-0 z-1" onChange={handleFileUpload} />
            <div className="text-gray-500 uppercase flex justify-center items-center">
              <CloudUploadOutlinedIcon className="text-sky-500" /> Upload file
            </div>
          </>
        )}
      </motion.div>
      <div className="flex justify-center">
        <Button onClick={handleSubmit} variant="outlined" className="w-full">
          submit
        </Button>
      </div>
    </div>
  );
}
