import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { loing } from "../controllers/user.login.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/login").post(loing);

export default router;
