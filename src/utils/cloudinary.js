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
    console.error("Cloudinary Upload Error:", error);
    // fs.unlinkSync(localFilePath); //remove locally temp file as our upload got fail
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    // console.log(error);
    return null;
  }
};
const deleteFromCloudinary = async (public_id) => {
  if (!public_id) {
    console.log("dosen't find cloudinary public_id");
    return null;
  }

  try {
    const response = await cloudinary.uploader.destroy(public_id);
    if (response) {
      console.log("cloudinary old image deleted", response);
      return response;
    }
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error?.message);
    return null;
  }
};
export { UploadInCloudinary, deleteFromCloudinary };
