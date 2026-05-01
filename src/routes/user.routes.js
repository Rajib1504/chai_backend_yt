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
userRouter.route("/update_Password").post(verifyJWT, userController.updatePassword)
userRouter.route("/update_profile").patch(verifyJWT, userController.updateUserProfile)
userRouter.route("/update_avatar").patch(verifyJWT, upload.single("avatar"), userController.updateAvatar)
userRouter.route("/update_coverImage").patch(verifyJWT, update.single("coverImage"), userController.updateCoverImage)
userRouter.route("/get_me").get(verifyJWT, userController.getMe)
userRouter.route("/c/:/username").get(verifyJWT, userController.getUserChannelProfile)
userRouter.route("/watch_history").get(verifyJWT, userController.getWatchHistory)
export default userRouter;
