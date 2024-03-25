import { asyncHandler } from "../utils/asyncHandler.js";
import { apiErrors } from "../utils/apiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";

const genrateAccessTokenAndRefreshTokens = async (userId) => {
  try {
    const user = User.findById(userId);
    const AccessToken = user.genrateAccessToken();
    const RefreshAccessToken = user.genrateRefreshAccessToken();
    User.refreshToken(RefreshAccessToken);
    User.save({ vaildateBeforeSave: false });
    return { AccessToken, RefreshAccessToken };
  } catch (error) {
    throw new apiErrors(500, "Something went wrong !!!");
  }
};

export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullName, password } = req.body;

  console.log(req.body);
  if (
    [username, email, fullName, password].some((field) => field?.trim() === "")
  ) {
    throw new apiErrors(400, "All fields are Required !!!");
  }
  const existingField = await User.findOne({
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

  if (!userCreated) throw new apiErrors(500, " Kuch Tho galat Ho gya hai !!! ");

  return res
    .status(201)
    .JSON(new apiResponse(200, userCreated, " User is created Now !!!"));
});

export const logInUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body();

  if (!userName || !email)
    throw new apiErrors(400, "user Name and e-mail are required !!!");

  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (!user) throw new apiErrors(400, "User not Found !!!");

  const isPasswordVaild = await user.isPasswordCorrect(password);

  if (!isPasswordVaild) throw new apiErrors(400, "password is not currect !!!");

  const { AccessToken, RefreshAccessToken } =
    await genrateAccessTokenAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken ", AccessToken, cookieOptions)
    .cookie("refreshAccessToken ", RefreshAccessToken, cookieOptions)
    .JSON(
      new apiResponse(
        200,
        {
          user: { loggedInUser, AccessToken, RefreshAccessToken },
        },
        "user LogedIn !!!"
      )
    );
});

export const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  return (
    res.status(200).clearCookie("accessToken", "refreshAccessToken"),
    JSON(new apiResponse(200, {}, "User is Loged Out !!!"))
  );
});
