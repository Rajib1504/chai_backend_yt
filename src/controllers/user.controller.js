import { ashyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../model/user.models.js";
import { UploadInCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required from local path");
  }

  //user object
  const user = await User.create({
    fullName,
    email,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    password,
    username: username.toLowerCase(),
  });

  //check user created or not and return response without password and refreshtoken
  const createdUser = await User.findById(user._id).select(
    " -password -refreshToken"
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

export { registerUser, loginUser, logOutUser };
