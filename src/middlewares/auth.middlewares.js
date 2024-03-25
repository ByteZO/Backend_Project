import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiErrors.js";
import { JsonWebTokenError } from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const varifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      (await req.cookies?.accessToken) ||
      (await req.header("Authorization")?.replace("Beare ", ""));

    if (!token) throw new apiError(401, "token is not valied !!!");

    const decodedToken = await JsonWebTokenError.varifyJWT(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) throw new apiError(401, "token is not valid !!!");

    req.user = user;
    next();
  } catch (error) {
    throw new apiError(500, "somethig went worng !!!");
  }
});
