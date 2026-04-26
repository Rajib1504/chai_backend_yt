import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { upload } from "./../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const userRouter = Router();

userRouter.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  userController.registerUser
);
userRouter.route("/login").post(userController.loginUser);

//secure routes
userRouter.route("/logout").post(verifyJWT, userController.logOutUser);

export default userRouter;
