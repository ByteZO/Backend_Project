import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (filePath) => {
  try {
    // if the file path is not there  then return null value
    if (!filePath) return null;
    // if the file path is there then upload it
    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    // loging the success upload and returning the response after login
    console.log("File upload is successfull");
    return response;
  } catch (error) {
    // unlinking the file if the upload goes wrong !!!
    fs.unlink(filePath);
    console.log("this is the error ", error);
  }
};

cloudinary.uploader.upload(
  "https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
  { public_id: "olympic_flag" },
  function (error, result) {
    console.log(result);
  }
);
