import { ashyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../model/user.models.js";
import { UploadInCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    //  save refresh token in Db
    user.refreshToken = await refreshToken;
    await user.save({ validateBeforeSave: false });

    //return the access and refresh token in user object
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "something went worng while generating token");
  }
};
const registerUser = ashyncHandler(async (req, res) => {
  //take data from user
  //validate data
  //check is user already exist
  //check for cover image and avatar image
  //save the image to local path
  //upload the image to cloudinary and get the url
  //create user object and save to database
  //remove password and refresh token from the response
  //check for uer creation
  //send response to client

  const { username, email, fullName, password } = req.body;
  // console.log({ username, email, fullName, password });

  // validation
  if (
    [username, email, fullName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // check user existence
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with this email or username already exists");
  }

  // file check
  const avatarLocalPath = req?.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req?.files?.coverImage?.[0]?.path;

  // console.log(avatarLocalPath);
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required from reqest");
  }

  //upload to cloudinary
  const avatar = await UploadInCloudinary(avatarLocalPath);
  const coverImage = await UploadInCloudinary(coverImageLocalPath);
  // console.log("this is from avatar", avatar);
  // console.log("this is from coverImage", coverImage);
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required from local path");
  }

  //user object
  const user = await User.create({
    fullName,
    email,
    avatar: avatar.url,
    avatartPublicId: avatar.public_id,
    coverImage: coverImage?.url || "",
    coverImagePublicId: coverImage?.public_id || "",
    password,
    username: username.toLowerCase(),
  });

  //check user created or not and return response without password and refreshtoken
  const createdUser = await User.findById(user._id).select(
    " -password -refreshToken -avatarPublicId -coverImagePublicId"
  ); //select method to select something and -negative means remove this field form

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong during register");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "User registered successfully", createdUser));
});

const loginUser = ashyncHandler(async (req, res) => {
  //take data from user
  //validate data
  //find user by email or username
  //if user not found send error response
  //check password is correct or not
  //access token and refresh token generate
  //save refresh token in database
  //send response to client with access token and user data

  const { email, username, password } = req.body;

  if ([email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  // alternative;
  //   if (!username && !email) {
  //     throw new ApiError(400, "username or email is required")
  // }

  // Here is an alternative of above code based on logic discussed in video:
  // if (!(username || email)) {
  //     throw new ApiError(400, "username or email is required")

  // }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (!user) throw new ApiError(404, "User does not exist");

  const passwordCheck = user.isPasswordCorrect(password);
  if (!passwordCheck) throw new ApiError(401, "Invalid credential");

  //access and refresh token
  const { accessToken, refreshToken } = await generateAccessandRefreshToken(
    user._id
  );

  // now we will update the object for response by removing password and refresh token and adding access token in it also will sent the cookies to client and send the response to client without making another db call
  // 1 way

  //    const loginResponse = {
  //     _id:user._id,
  //     email:user.email,
  //     username:user.username,
  //     fullName:user.fullName,
  //     avatar:user.avatar,
  //     coverImage:user.coverImage,
  //     accessToken,
  //     refreshToken
  //    }
  //  //  cookie option
  //     const options ={
  //       httpOnly:true,
  //       secure:true,
  //     }
  //     return res.status(200)
  //     .cookie("accessToken", accessToken, options)
  //     .cookie("refreshToken", refreshToken, options)
  //     json(new ApiResponse(200, "User logged in successfully",{user:loginResponse,accessToken,refreshToken}));

  // we can also make a another db call if its not so costly here the desicion is to make one more db call or to update the user object by removing password and refresh token and adding access token in it and send it as response without making another db call
  // 2nd way
  const userResponse = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //  cookie option
  const options = {
    httpOnly: true,
    secure: true,
  };
  //after setting this you can only modify the cookie from backend and not from frontend and secure true means cookie will only be sent on https connection
  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(200, "User logged in successfully", {
        user: userResponse,
        accessToken,
        refreshToken,
      })
    );
});
const logOutUser = ashyncHandler(async (req, res) => {
  //take refresh token from cookie
  //validate refresh token
  //find user with this refresh token
  //if user not found send error response
  //remove refresh token from database
  //clear cookie from client
  //send response to client
  //this all work in our middlewear jwtVerify
  const user = await User.findByIdAndUpdate(
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

  //  cookie option
  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User logged out", {}));
});
const refreshAndAccesstoken = ashyncHandler(async (req, res) => {
  //take refersh token form req.cookie or from req.body.refreshToken
  // validate it and throw error if not validate
  // decode the token which we got from clint with jwt verify because we also have a refresh token in db
  // after decode token find user with the id which you found after decoding the refresh token
  // if user not found then send error refresh token invalid

  // now you have user based on the clint deocded refresh token's _id

  // we need to check is that refresh token from client side and also the refresh token which is inside our db both are same if not then sent error

  // generate new refresh and access token
  // set options for cookies and then sent response

  const incomingRefresToken = req.cookie.refreshToken || req.body.refreshToken;

  if (!incomingRefresToken) {
    throw new ApiError(401, "Unauthorized request ");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefresToken,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalide refresh token ");
    }

    if (user?.refreshToken !== incomingRefresToken) {
      throw new ApiError(401, "RefreshToken is invalid or expired");
    }

    const { accessToken, newRefreshToken } =
      await generateAccessandRefreshToken(user?._id);

    const options = {
      httpOnly: true,
      secure: true,
    };
    res
      .status(201)
      .cookie(accessToken, "accessToken", options)
      .cookie(refreshToken, "newRefreshToken", options)
      .json(
        new ApiResponse(200, "access token is refreshed", {
          accessToken,
          refreshToken: newRefreshToken,
        })
      );
  } catch (error) {
    throw new ApiError(410, error?.message || "Invalid refresh token ");
  }
});
const updatePassword = ashyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  if (!(newPassword === confirmPassword)) {
    throw new ApiError(400, "Password and confirm password does not match");
  }

  const user = await user.findById(req.user?._id);
  const passwordCheck = await user.isPasswordCorrect(oldPassword);

  if (!passwordCheck) {
    throw new ApiError(400, "Incorrect old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, "Password updated Successfully", {}));
});

const updateUserProfile = ashyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const upadate = await user
    .findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          fullName,
          email,
        },
      },
      { new: true } // this property new :true tells to return the new updated verson of data
    )
    .select("-password");
  return res.status(
    200,
    new ApiResponse(200, "Profile updated successfully", user)
  );
});
const getMe = ashyncHandler(async (req, res) => {
  return res.status(
    200,
    new ApiResponse(200, "Profile fetch successfully", req.user)
  );
});
const updateAvatar = ashyncHandler(async (req, res) => {
  //take file form local
  // upload in cloudinary
  // find user with id and update
  // send responponse with updated avatar url
  const avatarLocalPath = req.file?.path;
  console.log(avatarLocalPath);
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }
  const newAvatar = await UploadInCloudinary(avatarLocalPath);
  if (!newAvatar.url) {
    throw new ApiError(400, "Error during the uploading to cloudinary");
  }

  //take the old avatar public id from user and delete the old avatar from cloudinary
  const oldAvatarPublicId = req.user.avatarPublicId;
  if (!oldAvatarPublicId) {
    console.log("no old avatar public id found for this user");
  }
  await deleteFromCloudinary(oldAvatarPublicId);

  const user = await user
    .findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          avatartPublicId: newAvatar.public_id,
          avatar: newAvatar?.url,
        },
      },
      { new: true }
    )
    .select("-password -avatarPublicId -coverImagePublicId -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, "Avatar image updated", user));
});

const updateCoverImage = ashyncHandler(async (req, res) => {
  const localCoverImage = req.file?.path;
  if (!localCoverImage) {
    throw new ApiError(400, "Cover image is required");
  }
  const uploadCoverImage = await UploadInCloudinary(localCoverImage);
  if (!updateCoverImage.url) {
    throw new ApiError(400, "Error during coverImage upload in cloudinary");
  }

  //take the old cover image public id from user and delete the old cover image from cloudinary
  const oldCoverImagePublicId = req.user.coverImagePublicId;
  if (!oldCoverImagePublicId) {
    console.log("no old cover image public id found for this user");
  }
  await deleteFromCloudinary(oldCoverImagePublicId);

  const user = await user
    .findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          coverImagePublicId: uploadCoverImage.public_id,
          coverImage: uploadCoverImage.url,
        },
      },
      { new: true }
    )
    .select("-password -coverImagePublicId -avatarPublicId -refreshTokenF");

  return res
    .status(200)
    .json(new ApiResponse(200, "Cover image updated", user));
});

export {
  registerUser,
  loginUser,
  logOutUser,
  updatePassword,
  updateUserProfile,
  getMe,
  updateAvatar,
  updateCoverImage,
};
