import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { loing } from "../controllers/user.login.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loing);

export default router;
