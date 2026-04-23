import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
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
      type: String, //cloudinary url
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

// middlewear to hash password before saving DB
userSchema.pre("savePassword", async function (next) {
  if (!this.isModified("password")) return next(); // agar passward modify nehi hua hain toh return kardo next karke
  this.password = bcrypt.hash(this.password, 10);
  next(); // agar modified hua hain toh hash kardo
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
