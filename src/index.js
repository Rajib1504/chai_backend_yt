import app from "./app.js";
import connectDb from "./db/index.js";
import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});
const port = process.env.PORT || 5000;
connectDb()
  .then(() => {
    app.on("error", (err) => console.log(`Server error: ${err}`));
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch((err) => console.log(`MongoDB connection error: ${err}`));
