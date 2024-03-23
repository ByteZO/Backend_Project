import { asyncHandler } from "../utils/asyncHandler.js";

export const loing = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "YOYO all Good... ",
  });
  res.send("oogin")
});
