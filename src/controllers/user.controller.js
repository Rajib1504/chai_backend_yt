import { ashyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../model/user.models.js";
import { UploadInCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

export { registerUser };
