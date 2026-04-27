import { User } from "../model/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ashyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = ashyncHandler(async (req, _, next) => {
  try {
    //token find in cookie or header
    //decode the token

    // here we will get the cookie from request and vaildate the token we will get the cookie from req and res too because we use app.use(cookieParser()) in app.js. so that will parse the cookie and we can access it from req.cookies.
    const token =
      (await req.cookies?.accessToken) ||
      req.header("Authoriztion")?.replace("Bearer ", "");
    //for mobile its might be in header so we took Authorization key and value Bearear and space replace it with "empty stirng " because we need only token value and for web it might be in cookie so we will check both places for token.
    if (!token) {
      throw new ApiError(401, "Unauthorized, token is missing");
    }

    const decode = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = User.findById(decode?._id).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});
