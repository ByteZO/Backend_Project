import { asyncHandler } from "../utils/asyncHandler.js";
import { apiErrors } from "../utils/apiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullName, password } = req.body;

  console.log(req.body);
  if (
    [username, email, fullName, password].some((field) => field?.trim() === "")
  ) {
    throw new apiErrors(400, "All fields are Required !!!");
  }
  const existingField = User.findOn({
    $or: [{ username }, { email }],
  });
  if (existingField)
    throw new apiErrors(409, " this username and Password already exist !!! ");

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  console.log("file  data \n" + req.files);

  if (!avatarLocalPath)
    throw new apiErrors(400, " Please upload the image !!!");
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) throw new apiErrors(400, " Please upload the image !!!");

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage) throw new apiErrors(400, " Please upload the image !!!");

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const userCreated = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!userCreated) throw new apiErrors(500, " Kuch Tho galat Ho g");

  return res
    .status(201)
    .json(new apiResponse(200, userCreated, " User is created Now !!!"));
});
