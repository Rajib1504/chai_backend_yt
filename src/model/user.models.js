import mongoose, { Schema } from "mongoose";
const userSchema = new Schema(
  {
    username: {
      type: String,
      lowercase: true,
      requierd: true,
      trim: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      requierd: true,
      trim: true,
      unique: true,
    },
    fullname: {
      type: String,
      lowercase: true,
      requierd: true,
      index: true,
    },
    password: {
      type: String,
      requierd: [true, "password is required"],
      trim: true,
    },
    avatar: {
      type: String, //cloudinary url
      requierd: [true, "avatar image required"],
    },
    coverimage: {
      type: String,//cloudinary url
    },
    watchhistory: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
export const User = mongoose.model("User", userSchema);
