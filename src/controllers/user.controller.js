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

  const { username, email, fullname, password } = req.body;

  // validation
  if (
    [username, email, fullname, password].some((field) => field.trim() === "")
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
  const avatartLocalPath = req?.files?.avatar[0]?.path;
  const coverImageLocalPath = req?.files?.coverimage[0]?.path;

  if (avatartLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  //upload to cloudinary
  const avatar = await UploadInCloudinary(avatartLocalPath);
  const coverImage = await UploadInCloudinary(coverImageLocalPath);

  if (avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  //user object
  const user = User.create({
    fullname,
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
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

export { registerUser };
