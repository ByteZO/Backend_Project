import { asyncHandler } from "../utils/asyncHandler.js";
import { apiErrors } from "../utils/apiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

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
    console.log(username, email, fullName, password);
  }
  const existingField = await User.findOne({
    $or: [{ username }, { email }],
  });
  console.log(existingField);

  if (existingField)
    throw new apiErrors(409, " this username and Password already exist !!! ");

  const avatarLocalPath = await req.files?.avatar[0]?.path;
  const coverImageLocalPath = await req.files?.coverImage[0]?.path;
  console.log("file DATA " + req.files);

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

export const refreshAccessToken = asyncHandler(async (req, res, _) => {
  try {
    const incomingRefreshToken =
      req.cookie.refreshAccessToken || req.body.refreshAccessToken;

    if (!incomingRefreshToken)
      throw new apiErrors("401", "Unable to find the refresh token !!!");

    const decodedRefreshToken = await jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_ACCESS_TOKEN_SECRET
    );
    const user = await User.findById(decodedRefreshToken?._id);

    if (!user) throw new apiErrors(401, " invalid R-token");

    if (incomingRefreshToken !== user?.refreshToken)
      throw new apiErrors(401, "rTokoken is used !!!");

    const { accessToken, newRrefreshAccessToken } =
      await genrateAccessTokenAndRefreshTokens(user._id);

    const cookieOptions = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshAccessToken", newRrefreshAccessToken, cookieOptions)
      .JSON(
        new apiResponse(
          200,
          {
            accessToken: accessToken,
            newRrefreshAccessToken: newRrefreshAccessToken,
          },
          "YOU get a new restesh token !!!"
        )
      );
  } catch (error) {
    throw new apiErrors(401, error.massage || " Something went wrong !!!");
  }
});

export const changeCurrentPassword = asyncHandler(async (req, res, _) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);

  if (!user.isPasswordCorrect(oldPassword))
    throw new apiErrors(401, "the password is not currect !!!");

  user.password = newPassword;
  user.save({ vaildateBeforeSave: false });

  return req
    .status(200)
    .JSON(new apiResponse(200, {}, "The Password Is Changed !!! "));
});

export const updateUserDetails = asyncHandler(async (req, res, _) => {
  const { fullName } = req.user;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .JSON(new apiResponse(200, user, " Your user details are updated !!!"));
});

export const updateUserAvatar = asyncHandler(async (req, res, _) => {
  const AvatarImageLocalPath = req.files?.path;

  if (!AvatarImageLocalPath)
    throw new apiErrors(401, " Unable to find the Avatar !!!");

  const Avatar = await uploadOnCloudinary(AvatarImageLocalPath);

  if (!Avatar)
    throw new apiErrors(
      401,
      " Something went wrong while uoloading the avatar image !!!"
    );
  const user = User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: Avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  req.status(200).JSON(new apiResponse(200, user, "The Avatar is Updated !!!"));
});

export const updateUserCoverImage = asyncHandler(async (req, res, _) => {
  const coverImageLocalPath = req.files?.path;

  if (!coverImageLocalPath)
    throw new apiErrors(401, " Unable to find the Cover Image !!!");

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage)
    throw new apiErrors(
      401,
      " Something went wrong while uoloading the cover image !!!"
    );
  const user = User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  req
    .status(200)
    .JSON(new apiResponse(200, user, "The cover Image is Updated !!!"));
});

