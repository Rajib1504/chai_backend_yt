import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const UploadInCloudinary = async (localFilePath) => {
  // console.log(localFilePath);
  try {
    if (!localFilePath) return null;
    //upload local file to cloudinay
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // console.log("file hasbeen uploaded successfully", response.url);
    fs.unlinkSync(localFilePath); //remove locally temp file after successful upload
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //remove locally temp file as our upload got fail
    // console.log(error);
    return null;
  }
};
export { UploadInCloudinary };
