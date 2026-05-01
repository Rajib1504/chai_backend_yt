import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema = new Schema(
  {
    username: {
      type: String,
      lowercase: true,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      required: true,
      trim: true,
      unique: true,
    },
    fullName: {
      type: String,
      lowercase: true,
      required: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
      trim: true,
    },
    avatar: {
      type: String, //cloudinary url
      required: [true, "avatar image required"],
    },
    avatarPublicId: {
      type: String, //cloudinary public id for avatar image
    },
    coverImage: {
      type: String, //cloudinary url
    },
    coverImagePublicId: {
      type: String, //cloudinary public id for cover image
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// middlewear to hash password before saving DB
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return; // agar passward modify nehi hua hain toh return kardo next karke
  this.password = await bcrypt.hash(this.password, 10);
});

// custom method to compare password for login
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRE }
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
    }
  );
};

export const User = mongoose.model("User", userSchema);
