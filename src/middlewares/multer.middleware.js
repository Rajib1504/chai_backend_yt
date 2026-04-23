import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/public/temp");
  },
  filename: function (req, file, cb) {
    //     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    //     cb(null, file.fieldname + '-' + uniqueSuffix)
    // we will just keep our real file name
    cb(null, file.originalname); // cb is just name of callback
  },
});
// inside this storage we will get the local file url
export const upload = multer({
  storage,
});
