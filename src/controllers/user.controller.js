import { ashyncHandler } from "../utils/asyncHandler.js";


const registerUser = ashyncHandler(async (req, res) => {
  res.status(200).json({
    message: "ok",
  });
});

export { registerUser };
