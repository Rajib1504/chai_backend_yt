import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" })); // limit for JSON payloads data size
app.use(express.urlencoded({ extended: true, limit: "16kb" })); //limit for URL-encoded data size
app.use(express.static("public")); // Serve static files from the "public" directory for images, CSS, JavaScript, etc.
app.use(cookieParser());

// route imports
import userRouter from "./routes/user.routes.js";
// route mannagement
app.use("/api/v1/users", userRouter);
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the API",
  });
});

export default app;
