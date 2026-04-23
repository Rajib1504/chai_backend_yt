import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const UploadInCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload local file to cloudinay
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("file hasbeen uploaded successfully", response.url);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //remove locally temp file as our upload got fail
    return null;
  }
};
export { UploadInCloudinary };
